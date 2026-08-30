import { describe, it, expect } from 'vitest';
import { signToken, verifyToken, canAccessPatient } from '../src/lib/security/auth';
import { db } from '../src/lib/db/database';

describe('Security & Patient Data Isolation Engine', () => {
  it('signs and verifies valid JWT session tokens', () => {
    const token = signToken({
      userId: 'pat-1',
      role: 'patient',
      name: 'John Doe',
      email: 'john.doe@patient.healthlink',
      doctorId: 'doc-1',
      doctorCode: 'DOC-7749',
    });

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe('pat-1');
    expect(decoded?.role).toBe('patient');
  });

  it('prevents Patient A from accessing Patient B record', () => {
    const patientASession = {
      userId: 'pat-1',
      name: 'John Doe',
      role: 'patient' as const,
      email: 'john@test.com',
      token: 'mock-token',
    };

    // Patient A trying to access Patient B
    const allowed = canAccessPatient(patientASession, 'pat-2', 'doc-1');
    expect(allowed).toBe(false);
  });

  it('allows authorized Doctor to access assigned patient record', () => {
    const doctorSession = {
      userId: 'doc-1',
      name: 'Dr. Sarah Miller, MD',
      role: 'doctor' as const,
      email: 'sarah@test.com',
      token: 'mock-token',
    };

    const allowed = canAccessPatient(doctorSession, 'pat-1', 'doc-1');
    expect(allowed).toBe(true);
  });

  it('verifies private doctor notes are marked isPrivateToDoctor: true', () => {
    const note = db.addDoctorNote({
      patientId: 'pat-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Miller, MD',
      title: 'Confidential Exam',
      content: 'Confidential clinical thought.',
      isPrivateToDoctor: true,
      category: 'observation',
    });

    expect(note.isPrivateToDoctor).toBe(true);
  });
});
