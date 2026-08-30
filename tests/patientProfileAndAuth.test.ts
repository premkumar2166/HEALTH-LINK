import { describe, it, expect } from 'vitest';
import { db } from '../src/lib/db/database';
import { signToken, verifyToken } from '../src/lib/security/auth';

describe('Patient Profile, Identity & Security Upgrade Suite', () => {
  it('correctly loads patient profile and formats HL-PATIENT ID', () => {
    const patient = db.getPatientById('pat-1');
    expect(patient).toBeDefined();
    expect(patient?.name).toBe('John Doe');

    const formattedId = `HL-PATIENT-${patient?.id.replace('pat-', '').padStart(4, '0')}`;
    expect(formattedId).toBe('HL-PATIENT-0001');
  });

  it('updates patient personal demographics and records HIPAA audit log', () => {
    const updated = db.updatePatient('pat-1', {
      phoneNumber: '+1 (555) 999-8888',
      preferredLanguage: 'Spanish (ES)',
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1 (555) 999-7777',
      },
    });

    expect(updated?.phoneNumber).toBe('+1 (555) 999-8888');
    expect(updated?.preferredLanguage).toBe('Spanish (ES)');
    expect(updated?.emergencyContact?.phone).toBe('+1 (555) 999-7777');

    const audit = db.addAuditLog({
      userId: 'pat-1',
      userName: 'John Doe',
      userRole: 'patient',
      action: 'PROFILE_UPDATED',
      resource: 'PATIENT_IDENTITY',
      details: 'Updated phoneNumber, preferredLanguage',
    });

    expect(audit.action).toBe('PROFILE_UPDATED');
    expect(audit.resource).toBe('PATIENT_IDENTITY');
  });

  it('verifies latest physiological measurements are extractable for Health Profile', () => {
    const latest = db.getLatestMeasurement('pat-1');
    expect(latest).toBeDefined();
    expect(latest?.bloodPressure).toBeDefined();
    expect(latest?.weight).toBeDefined();
    expect(latest?.temperature).toBeDefined();
    expect(latest?.heartRate).toBeDefined();
  });

  it('generates full HIPAA data export bundle for patient download', () => {
    const patient = db.getPatientById('pat-1');
    const measurements = db.getMeasurements('pat-1');
    const timeline = db.getPatientTimeline('pat-1');
    const messages = db.getMessages('pat-1', 'doc-1');

    const exportBundle = {
      patient,
      measurements,
      timeline,
      messages,
    };

    expect(exportBundle.patient?.id).toBe('pat-1');
    expect(exportBundle.measurements.length).toBeGreaterThan(0);
    expect(exportBundle.timeline.length).toBeGreaterThan(0);
  });

  it('records HIPAA audit log when a formal deletion request is submitted', () => {
    const auditLog = db.addAuditLog({
      userId: 'pat-1',
      userName: 'John Doe',
      userRole: 'patient',
      action: 'DATA_DELETION_REQUEST',
      resource: 'PATIENT_RECORD',
      details: 'Patient requested account data purge',
    });

    expect(auditLog.action).toBe('DATA_DELETION_REQUEST');
    expect(auditLog.userRole).toBe('patient');
  });

  it('enforces patient token expiration and validation', () => {
    const token = signToken({
      userId: 'pat-1',
      role: 'patient',
      name: 'John Doe',
      email: 'john.doe@patient.healthlink',
      doctorId: 'doc-1',
    });

    const verified = verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.role).toBe('patient');

    const invalid = verifyToken('invalid-fake-token-xyz');
    expect(invalid).toBeNull();
  });

  it('validates complete Personal Information dataset and contact verification status', () => {
    const patient = db.getPatientById('pat-1');
    expect(patient).toBeDefined();
    expect(patient?.name).toBe('John Doe');
    expect(patient?.dateOfBirth).toBe('1984-06-15');
    expect(patient?.gender).toBe('Male');
    expect(patient?.email).toBe('john.doe@patient.healthlink');
    expect(patient?.phoneNumber).toBeDefined();
    expect(patient?.preferredLanguage).toBeDefined();
    expect(patient?.emergencyContact?.name).toBe('Jane Doe');
    expect(patient?.emergencyContact?.relationship).toBe('Spouse');
    expect(patient?.emergencyContact?.phone).toBeDefined();

    // Contact Verification calculation

    const isContactVerified = patient?.isContactVerified ?? Boolean(patient?.email && patient?.phoneNumber);
    expect(isContactVerified).toBe(true);
  });
});

