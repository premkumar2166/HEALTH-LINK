import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/lib/db/database';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../src/lib/security/password';
import { generateDoctorCode, isValidDoctorCodeFormat, normalizeDoctorCode } from '../src/lib/security/doctorCode';
import { rateLimiter } from '../src/lib/security/rateLimit';
import { signToken, verifyToken, canAccessPatient } from '../src/lib/security/auth';

describe('Doctor Authentication & Security Suite', () => {
  beforeEach(() => {
    rateLimiter.resetAll();
  });

  it('generates unique, high-entropy Doctor Codes in HL-DR-XXXXXX format', () => {
    const code1 = generateDoctorCode();
    const code2 = generateDoctorCode();
    const code3 = generateDoctorCode();

    expect(code1).toMatch(/^HL-DR-[2-9A-Z]{6}$/);
    expect(code2).toMatch(/^HL-DR-[2-9A-Z]{6}$/);
    expect(code3).toMatch(/^HL-DR-[2-9A-Z]{6}$/);

    expect(code1).not.toBe(code2);
    expect(code2).not.toBe(code3);

    expect(isValidDoctorCodeFormat(code1)).toBe(true);
    expect(isValidDoctorCodeFormat('HL-DR-8K4P7X')).toBe(true);
    expect(isValidDoctorCodeFormat('DOC-7749')).toBe(true);
    expect(isValidDoctorCodeFormat('INVALID_CODE')).toBe(false);
  });

  it('securely hashes and verifies passwords using bcrypt', async () => {
    const rawPass = 'ClinicalPass2026!';
    const hash = await hashPassword(rawPass);

    expect(hash).not.toBe(rawPass);
    expect(hash.startsWith('$2')).toBe(true);

    const validMatch = await verifyPassword(rawPass, hash);
    const invalidMatch = await verifyPassword('WrongPassword123!', hash);

    expect(validMatch).toBe(true);
    expect(invalidMatch).toBe(false);
  });

  it('validates password strength rules', () => {
    expect(validatePasswordStrength('short').valid).toBe(false);
    expect(validatePasswordStrength('alllowercaseletters').valid).toBe(false);
    expect(validatePasswordStrength('ValidPass123!').valid).toBe(true);
  });

  it('registers a new doctor account with unique Doctor Code and pending verification', async () => {
    const testEmail = `doctor.test.${Date.now()}@healthlink.org`;
    const passwordHash = await hashPassword('SecretDoctor2026!');

    const doctor = db.createDoctor({
      name: 'Dr. Gregory House, MD',
      email: testEmail,
      phone: '+1 (555) 999-8888',
      professionalId: 'MD-778899-NJ',
      specialization: 'Diagnostic Medicine & Nephrology',
      clinicName: 'Princeton-Plainsboro Teaching Hospital',
      passwordHash,
      autoVerify: false,
    });

    expect(doctor.id).toBeDefined();
    expect(doctor.doctorCode).toMatch(/^HL-DR-[2-9A-Z]{6}$/);
    expect(doctor.verificationStatus).toBe('PENDING_VERIFICATION');
    expect(doctor.verificationToken).toBeDefined();

    // Verify lookup by email and by code
    const foundByEmail = db.getDoctorByEmail(testEmail);
    expect(foundByEmail?.id).toBe(doctor.id);

    const foundByCode = db.getDoctorByCode(doctor.doctorCode);
    expect(foundByCode?.id).toBe(doctor.id);
  });

  it('verifies doctor email token', () => {
    const testEmail = `doctor.verify.${Date.now()}@healthlink.org`;
    const doctor = db.createDoctor({
      name: 'Dr. Allison Cameron, MD',
      email: testEmail,
      specialization: 'Immunology',
      clinicName: 'Diagnostic Center',
      passwordHash: 'mock-hash',
      autoVerify: false,
    });

    expect(doctor.verificationStatus).toBe('PENDING_VERIFICATION');

    const verified = db.verifyDoctorEmail(testEmail, doctor.verificationToken);
    expect(verified).toBe(true);

    const refreshed = db.getDoctorByEmail(testEmail);
    expect(refreshed?.verificationStatus).toBe('VERIFIED');
  });

  it('implements brute-force protection and rate limiting on repeated failures', () => {
    const email = 'target.doctor@clinic.org';
    const ip = '192.168.1.100';

    // 4 failed attempts should not lock out
    for (let i = 0; i < 4; i++) {
      const res = rateLimiter.recordFailedAttempt(email, ip);
      expect(res.isLocked).toBe(false);
    }

    // 5th failed attempt triggers lockout
    const fifthAttempt = rateLimiter.recordFailedAttempt(email, ip);
    expect(fifthAttempt.isLocked).toBe(true);
    expect(fifthAttempt.attemptsLeft).toBe(0);

    // Subsequent checkLimit must block
    const limitCheck = rateLimiter.checkLimit(email, ip);
    expect(limitCheck.allowed).toBe(false);
    expect(limitCheck.message).toContain('Too many sign-in attempts');

    // Successful attempt resets lockout
    rateLimiter.recordSuccessfulAttempt(email, ip);
    expect(rateLimiter.checkLimit(email, ip).allowed).toBe(true);
  });

  it('manages password reset token creation and verification', async () => {
    const testEmail = `doctor.reset.${Date.now()}@healthlink.org`;
    const initialHash = await hashPassword('InitialPass123!');
    const doctor = db.createDoctor({
      name: 'Dr. James Wilson, MD',
      email: testEmail,
      specialization: 'Oncology',
      clinicName: 'Oncology Wing',
      passwordHash: initialHash,
      autoVerify: true,
    });

    const token = db.createPasswordResetToken(testEmail, doctor.doctorCode);
    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThanOrEqual(6);

    const newHash = await hashPassword('BrandNewPass2026!');
    const resetSuccess = db.verifyAndResetDoctorPassword(
      testEmail,
      doctor.doctorCode,
      token,
      newHash
    );

    expect(resetSuccess).toBe(true);

    const updatedDoctor = db.getDoctorByEmail(testEmail);
    expect(updatedDoctor?.passwordHash).toBe(newHash);

    // Second attempt with same token must fail (single-use token)
    const secondAttempt = db.verifyAndResetDoctorPassword(
      testEmail,
      doctor.doctorCode,
      token,
      newHash
    );
    expect(secondAttempt).toBe(false);
  });

  it('enforces RBAC isolation between Doctor and Patients', () => {
    const doctorSession = {
      userId: 'doc-1',
      name: 'Dr. Sarah Miller, MD',
      role: 'doctor' as const,
      email: 'sarah@healthlink.org',
      token: 'jwt-token',
    };

    const patientSession = {
      userId: 'pat-1',
      name: 'John Doe',
      role: 'patient' as const,
      email: 'john@patient.healthlink',
      token: 'jwt-token',
    };

    // Doctor can access assigned patient
    expect(canAccessPatient(doctorSession, 'pat-1', 'doc-1')).toBe(true);

    // Doctor cannot access patient assigned to another doctor if restricted
    expect(canAccessPatient(doctorSession, 'pat-99', 'doc-2')).toBe(false);

    // Patient cannot access other patients
    expect(canAccessPatient(patientSession, 'pat-2', 'doc-1')).toBe(false);
    expect(canAccessPatient(patientSession, 'pat-1', 'doc-1')).toBe(true);
  });
});
