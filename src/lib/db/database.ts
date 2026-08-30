import {
  Patient,
  Doctor,
  HealthMeasurement,
  Alert,
  ChatMessage,
  VoiceMessage,
  CallSession,
  DoctorNote,
  DoctorAssessment,
  DoctorAnnotation,
  AuditLog,
  HealthTimelineEvent,
  ClinicalStatus,
  PasswordResetToken,
} from '@/types/healthlink';
import { evaluateMeasurementAlerts } from '../clinical/alertRules';
import { generateDoctorCode } from '../security/doctorCode';
import { hashPasswordSync } from '../security/password';
import fs from 'fs';
import path from 'path';

interface HealthLinkDatabaseSchema {
  doctors: Doctor[];
  patients: Patient[];
  measurements: HealthMeasurement[];
  alerts: Alert[];
  messages: ChatMessage[];
  voiceMessages: VoiceMessage[];
  calls: CallSession[];
  doctorNotes: DoctorNote[];
  assessments: DoctorAssessment[];
  annotations: DoctorAnnotation[];
  auditLogs: AuditLog[];
  resetTokens?: PasswordResetToken[];
}

// In-memory + persisted JSON database
class HealthLinkDatabase {
  private data: HealthLinkDatabaseSchema;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), '.healthlink_db.json');
    this.data = this.loadDatabase();
  }

  private loadDatabase(): HealthLinkDatabaseSchema {
    try {
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf8');
        const parsed: HealthLinkDatabaseSchema = JSON.parse(fileContent);
        // Ensure doctors have password hashes and security fields
        if (parsed.doctors && Array.isArray(parsed.doctors)) {
          parsed.doctors = parsed.doctors.map((doc) => ({
            ...doc,
            passwordHash: doc.passwordHash || hashPasswordSync('Doctor123!'),
            specialization: doc.specialization || doc.specialty || 'General Medicine',
            professionalId: doc.professionalId || doc.licenseNumber || 'MD-HEALTHLINK',
            phone: doc.phone || '+1 (555) 012-3456',
            verificationStatus: doc.verificationStatus || 'VERIFIED',
            mfaEnabled: doc.mfaEnabled || false,
            updatedAt: doc.updatedAt || doc.createdAt,
          }));
        }
        if (parsed.patients && Array.isArray(parsed.patients)) {
          parsed.patients = parsed.patients.map((pat) => ({
            ...pat,
            isContactVerified: pat.isContactVerified ?? true,
          }));
        }
        if (!parsed.resetTokens) {
          parsed.resetTokens = [];
        }

        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing DB file, creating fresh seed data');
    }
    const seed = this.createSeedData();
    this.saveDatabase(seed);
    return seed;
  }

  private saveDatabase(dataToSave?: HealthLinkDatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to persist database to disk', e);
    }
  }

  private createSeedData(): HealthLinkDatabaseSchema {
    const defaultPasswordHash = hashPasswordSync('Doctor123!');

    const doctors: Doctor[] = [
      {
        id: 'doc-1',
        name: 'Dr. Sarah Miller, MD',
        email: 'sarah.miller@healthlink.org',
        doctorCode: 'DOC-7749',
        specialty: 'Cardiovascular & Internal Medicine',
        specialization: 'Cardiology & Internal Medicine',
        licenseNumber: 'MD-884291-NY',
        professionalId: 'MD-884291-NY',
        clinicName: 'HealthLink Premier Tele-Clinical Center',
        phone: '+1 (555) 884-2910',
        passwordHash: defaultPasswordHash,
        verificationStatus: 'VERIFIED',
        mfaEnabled: false,
        isOnline: true,
        profilePhoto: '',
        createdAt: '2026-01-10T08:00:00.000Z',
        updatedAt: '2026-08-29T08:00:00.000Z',
      },
      {
        id: 'doc-2',
        name: 'Dr. Robert Vance, MD',
        email: 'robert.vance@healthlink.org',
        doctorCode: 'DOC-3321',
        specialty: 'Endocrinology & Preventive Health',
        specialization: 'Endocrinology & Preventive Health',
        licenseNumber: 'MD-741992-CA',
        professionalId: 'MD-741992-CA',
        clinicName: 'Metabolic & Tele-Monitoring Clinic',
        phone: '+1 (555) 741-9920',
        passwordHash: defaultPasswordHash,
        verificationStatus: 'VERIFIED',
        mfaEnabled: false,
        isOnline: true,
        profilePhoto: '',
        createdAt: '2026-01-12T08:00:00.000Z',
        updatedAt: '2026-08-29T08:00:00.000Z',
      },
    ];

    const patients: Patient[] = [
      {
        id: 'pat-1',
        name: 'John Doe',
        email: 'john.doe@patient.healthlink',
        doctorId: 'doc-1',
        doctorCode: 'DOC-7749',
        dateOfBirth: '1984-06-15',
        gender: 'Male',
        heightCm: 178,
        profilePhoto: '',
        phoneNumber: '+1 (555) 019-2834',
        preferredLanguage: 'English (US)',
        allergies: ['Penicillin', 'Peanuts'],
        medicalHistory: ['Mild Hypertension', 'Hyperlipidemia'],
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+1 (555) 234-5678',
        },
        createdAt: '2026-01-15T09:00:00.000Z',
        updatedAt: '2026-08-29T08:00:00.000Z',
        lastLogin: '2026-08-29T09:15:00.000Z',
      },
      {
        id: 'pat-2',
        name: 'Eleanor Vance',
        email: 'eleanor.vance@patient.healthlink',
        doctorId: 'doc-1',
        doctorCode: 'DOC-7749',
        dateOfBirth: '1962-11-20',
        gender: 'Female',
        heightCm: 165,
        profilePhoto: '',
        allergies: ['Sulfa drugs'],
        medicalHistory: ['Hypertension Stage 2', 'Arrhythmia review'],
        emergencyContact: {
          name: 'David Vance',
          relationship: 'Son',
          phone: '+1 (555) 876-5432',
        },
        createdAt: '2026-02-01T10:00:00.000Z',
        updatedAt: '2026-08-29T07:30:00.000Z',
      },
      {
        id: 'pat-3',
        name: 'Marcus Chen',
        email: 'marcus.chen@patient.healthlink',
        doctorId: 'doc-1',
        doctorCode: 'DOC-7749',
        dateOfBirth: '1991-03-08',
        gender: 'Male',
        heightCm: 182,
        profilePhoto: '',
        allergies: ['None known'],
        medicalHistory: ['Post-operative monitoring', 'Orthopedic rehab'],
        emergencyContact: {
          name: 'Lily Chen',
          relationship: 'Sister',
          phone: '+1 (555) 345-6789',
        },
        createdAt: '2026-02-10T11:00:00.000Z',
        updatedAt: '2026-08-29T06:45:00.000Z',
      },
    ];

    // Seed realistic time-series measurements over the past 7 days for John Doe
    const now = new Date();
    const measurements: HealthMeasurement[] = [];
    const seedData = [
      { daysAgo: 7, sbp: 122, dbp: 80, hr: 72, temp: 36.6, weight: 75.4, notes: 'Morning check after breakfast' },
      { daysAgo: 6, sbp: 120, dbp: 78, hr: 70, temp: 36.7, weight: 75.2, notes: 'Felt well, normal walk' },
      { daysAgo: 5, sbp: 125, dbp: 82, hr: 74, temp: 36.6, weight: 75.0, notes: 'Slight work stress' },
      { daysAgo: 4, sbp: 124, dbp: 81, hr: 73, temp: 36.8, weight: 74.8, notes: 'Standard morning log' },
      { daysAgo: 3, sbp: 128, dbp: 84, hr: 76, temp: 36.7, weight: 74.9, notes: 'Post exercise reading' },
      { daysAgo: 2, sbp: 121, dbp: 79, hr: 71, temp: 36.6, weight: 74.7, notes: 'Rested well' },
      { daysAgo: 1, sbp: 119, dbp: 77, hr: 69, temp: 36.5, weight: 74.5, notes: 'Evening check' },
      { daysAgo: 0, sbp: 118, dbp: 76, hr: 72, temp: 36.6, weight: 74.4, notes: 'Today morning reading' },
    ];

    seedData.forEach((item, idx) => {
      const d = new Date(now.getTime() - item.daysAgo * 24 * 60 * 60 * 1000);
      const evalResult = evaluateMeasurementAlerts({
        bloodPressure: { systolic: item.sbp, diastolic: item.dbp },
        temperature: { value: item.temp, unit: 'C', convertedC: item.temp },
        heartRate: item.hr,
        weight: { value: item.weight, unit: 'kg', convertedKg: item.weight },
      });

      measurements.push({
        id: `meas-${idx + 1}`,
        patientId: 'pat-1',
        timestamp: d.toISOString(),
        recordedBy: 'patient',
        notes: item.notes,
        weight: { value: item.weight, unit: 'kg', convertedKg: item.weight },
        bloodPressure: { systolic: item.sbp, diastolic: item.dbp, pulse: item.hr },
        temperature: { value: item.temp, unit: 'C', convertedC: item.temp },
        heartRate: item.hr,
        status: evalResult.overallStatus,
        statusReasons: evalResult.reasons,
      });
    });

    // Add abnormal measurement for Eleanor Vance (pat-2) to demonstrate Urgent status
    measurements.push({
      id: 'meas-pat2-1',
      patientId: 'pat-2',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      recordedBy: 'patient',
      notes: 'Experiencing severe headache and dizziness',
      bloodPressure: { systolic: 182, diastolic: 122, pulse: 98 },
      temperature: { value: 37.4, unit: 'C', convertedC: 37.4 },
      heartRate: 98,
      weight: { value: 68.2, unit: 'kg', convertedKg: 68.2 },
      status: 'URGENT',
      statusReasons: ['Hypertensive crisis threshold reached (182/122 mmHg). Immediate clinical evaluation recommended.'],
    });

    // Add Review measurement for Marcus Chen (pat-3)
    measurements.push({
      id: 'meas-pat3-1',
      patientId: 'pat-3',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      recordedBy: 'patient',
      notes: 'Post-op knee swelling and feeling warm',
      bloodPressure: { systolic: 134, diastolic: 88, pulse: 84 },
      temperature: { value: 38.2, unit: 'C', convertedC: 38.2 },
      heartRate: 84,
      weight: { value: 82.0, unit: 'kg', convertedKg: 82.0 },
      status: 'REVIEW',
      statusReasons: ['Fever detected (38.2°C). Observation indicated.', 'Elevated blood pressure (134/88 mmHg) recorded.'],
    });

    const alerts: Alert[] = [
      {
        id: 'alert-1',
        patientId: 'pat-2',
        patientName: 'Eleanor Vance',
        measurementId: 'meas-pat2-1',
        severity: 'URGENT',
        reason: 'Hypertensive crisis threshold reached (182/122 mmHg). Immediate clinical evaluation recommended.',
        triggerValue: '182/122 mmHg',
        ruleVersion: 'v1.4.0-AHA-CDC-STANDARD',
        status: 'ACTIVE',
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'alert-2',
        patientId: 'pat-3',
        patientName: 'Marcus Chen',
        measurementId: 'meas-pat3-1',
        severity: 'REVIEW',
        reason: 'Fever detected (38.2°C). Observation indicated.',
        triggerValue: '38.2°C',
        ruleVersion: 'v1.4.0-AHA-CDC-STANDARD',
        status: 'ACTIVE',
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const messages: ChatMessage[] = [
      {
        id: 'msg-1',
        senderId: 'pat-1',
        senderName: 'John Doe',
        senderRole: 'patient',
        receiverId: 'doc-1',
        text: 'Hello Dr. Miller, I logged my morning blood pressure (118/76) and my weight is steady at 74.4 kg. Feeling great today!',
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'read',
      },
      {
        id: 'msg-2',
        senderId: 'doc-1',
        senderName: 'Dr. Sarah Miller, MD',
        senderRole: 'doctor',
        receiverId: 'pat-1',
        text: 'Excellent work John. Your 7-day trend shows steady, well-regulated blood pressure. Continue with your low-sodium meals and daily morning walks.',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'read',
      },
    ];

    const voiceMessages: VoiceMessage[] = [
      {
        id: 'vm-1',
        senderId: 'pat-1',
        senderName: 'John Doe',
        senderRole: 'patient',
        receiverId: 'doc-1',
        audioDataUrl: '', // Real voice audio data or simulated waveform
        durationSeconds: 14,
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'read',
        transcript: 'Hi Dr. Miller, I also wanted to mention my knee felt fine during yesterday evening walk. Thank you!',
      },
    ];

    const calls: CallSession[] = [
      {
        id: 'call-1',
        callerId: 'doc-1',
        callerName: 'Dr. Sarah Miller, MD',
        callerRole: 'doctor',
        receiverId: 'pat-1',
        receiverName: 'John Doe',
        callType: 'video',
        status: 'ended',
        startedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        endedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000).toISOString(),
        durationSeconds: 720,
      },
    ];

    const doctorNotes: DoctorNote[] = [
      {
        id: 'note-1',
        patientId: 'pat-1',
        doctorId: 'doc-1',
        doctorName: 'Dr. Sarah Miller, MD',
        title: 'Monthly Tele-Cardio Review',
        content: 'Patient adhering well to lifestyle modifications. Blood pressure consistently in the 118-124 / 76-82 mmHg range. No chest tightness, palpitations, or shortness of breath noted. Maintain current care protocol and review in 30 days.',
        isPrivateToDoctor: true,
        category: 'observation',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const assessments: DoctorAssessment[] = [
      {
        id: 'assess-1',
        patientId: 'pat-1',
        doctorId: 'doc-1',
        doctorName: 'Dr. Sarah Miller, MD',
        summary: 'Cardiovascular vitals stable and well-controlled. Trend indicates positive response to diet and exercise.',
        recommendations: [
          'Maintain daily morning blood pressure logging before 10:00 AM.',
          'Sustain 30 minutes of low-impact aerobic exercise 5 days a week.',
          'Continue sodium intake under 2,000 mg/day.',
        ],
        followUpDate: '2026-09-29',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const annotations: DoctorAnnotation[] = [
      {
        id: 'annot-1',
        patientId: 'pat-1',
        doctorId: 'doc-1',
        dateStr: 'Day 5',
        text: 'Measurement trend reviewed on Aug 27 by Dr. Miller. Optimal control.',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const auditLogs: AuditLog[] = [
      {
        id: 'audit-1',
        userId: 'pat-1',
        userName: 'John Doe',
        userRole: 'patient',
        action: 'LOGIN',
        resource: 'PATIENT_PORTAL',
        details: 'Successful patient authentication via Doctor Code DOC-7749',
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'audit-2',
        userId: 'pat-1',
        userName: 'John Doe',
        userRole: 'patient',
        action: 'MEASUREMENT_RECORDED',
        resource: 'VITALS',
        details: 'Logged BP 118/76 mmHg, Weight 74.4 kg, Temp 36.6°C',
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'audit-3',
        userId: 'doc-1',
        userName: 'Dr. Sarah Miller, MD',
        userRole: 'doctor',
        action: 'PATIENT_RECORD_VIEW',
        resource: 'pat-1',
        details: 'Reviewed 7-day health trend and clinical chart',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return {
      doctors,
      patients,
      measurements,
      alerts,
      messages,
      voiceMessages,
      calls,
      doctorNotes,
      assessments,
      annotations,
      auditLogs,
    };
  }

  // Doctors
  getDoctors(): Doctor[] {
    return this.data.doctors;
  }

  getDoctorById(id: string): Doctor | undefined {
    return this.data.doctors.find((d) => d.id === id);
  }

  getDoctorByEmail(email: string): Doctor | undefined {
    return this.data.doctors.find((d) => d.email.toLowerCase() === email.trim().toLowerCase());
  }

  getDoctorByCode(code: string): Doctor | undefined {
    if (!code) return undefined;
    return this.data.doctors.find((d) => d.doctorCode.toUpperCase() === code.trim().toUpperCase());
  }

  checkDoctorCodeAvailable(code: string): boolean {
    if (!code) return false;
    return !this.data.doctors.some((d) => d.doctorCode.toUpperCase() === code.trim().toUpperCase());
  }

  createDoctor(doctorInput: {
    name: string;
    email: string;
    phone?: string;
    professionalId?: string;
    specialization: string;
    clinicName: string;
    passwordHash: string;
    autoVerify?: boolean;
  }): Doctor {
    // Generate unique Doctor Code
    let doctorCode = generateDoctorCode();
    let attempts = 0;
    while (!this.checkDoctorCodeAvailable(doctorCode) && attempts < 10) {
      doctorCode = generateDoctorCode();
      attempts++;
    }

    const verificationToken = Math.random().toString(36).substring(2, 10).toUpperCase();

    const newDoctor: Doctor = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: doctorInput.name.trim(),
      email: doctorInput.email.trim().toLowerCase(),
      phone: doctorInput.phone?.trim() || '',
      professionalId: doctorInput.professionalId?.trim() || '',
      specialty: doctorInput.specialization.trim(),
      specialization: doctorInput.specialization.trim(),
      licenseNumber: doctorInput.professionalId?.trim() || '',
      clinicName: doctorInput.clinicName.trim(),
      doctorCode,
      passwordHash: doctorInput.passwordHash,
      verificationStatus: doctorInput.autoVerify ? 'VERIFIED' : 'PENDING_VERIFICATION',
      verificationToken,
      mfaEnabled: false,
      isOnline: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.doctors.push(newDoctor);
    this.saveDatabase();
    return newDoctor;
  }

  updateDoctor(id: string, updates: Partial<Doctor>): Doctor | undefined {
    const idx = this.data.doctors.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;
    this.data.doctors[idx] = {
      ...this.data.doctors[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase();
    return this.data.doctors[idx];
  }

  verifyDoctorEmail(email: string, token?: string): boolean {
    const doc = this.data.doctors.find((d) => d.email.toLowerCase() === email.trim().toLowerCase());
    if (!doc) return false;
    if (token && doc.verificationToken && doc.verificationToken !== token.trim().toUpperCase()) {
      return false;
    }
    doc.verificationStatus = 'VERIFIED';
    doc.updatedAt = new Date().toISOString();
    this.saveDatabase();
    return true;
  }

  createPasswordResetToken(email: string, doctorCode: string): string {
    if (!this.data.resetTokens) {
      this.data.resetTokens = [];
    }
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    const record: PasswordResetToken = {
      id: `rst-${Date.now()}`,
      email: email.trim().toLowerCase(),
      doctorCode: doctorCode.trim().toUpperCase(),
      token,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins
      used: false,
    };
    this.data.resetTokens.push(record);
    this.saveDatabase();
    return token;
  }

  verifyAndResetDoctorPassword(
    email: string,
    doctorCode: string,
    token: string,
    newPasswordHash: string
  ): boolean {
    if (!this.data.resetTokens) return false;
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = doctorCode.trim().toUpperCase();
    const cleanToken = token.trim().toUpperCase();

    const resetRecord = this.data.resetTokens.find(
      (r) =>
        r.email === cleanEmail &&
        r.doctorCode === cleanCode &&
        r.token === cleanToken &&
        !r.used &&
        new Date(r.expiresAt).getTime() > Date.now()
    );

    if (!resetRecord) return false;

    const doc = this.data.doctors.find(
      (d) => d.email.toLowerCase() === cleanEmail && d.doctorCode.toUpperCase() === cleanCode
    );
    if (!doc) return false;

    doc.passwordHash = newPasswordHash;
    doc.updatedAt = new Date().toISOString();
    resetRecord.used = true;
    this.saveDatabase();
    return true;
  }


  // Patients
  getPatients(doctorId?: string): Patient[] {
    if (doctorId) {
      return this.data.patients.filter((p) => p.doctorId === doctorId);
    }
    return this.data.patients;
  }

  getPatientById(id: string): Patient | undefined {
    return this.data.patients.find((p) => p.id === id);
  }

  createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient {
    const newPatient: Patient = {
      ...patient,
      id: `pat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.patients.push(newPatient);
    this.saveDatabase();
    return newPatient;
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient | undefined {
    const idx = this.data.patients.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.patients[idx] = {
      ...this.data.patients[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase();
    return this.data.patients[idx];
  }

  // Measurements
  getMeasurements(patientId: string): HealthMeasurement[] {
    return this.data.measurements
      .filter((m) => m.patientId === patientId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  getLatestMeasurement(patientId: string): HealthMeasurement | undefined {
    const list = this.getMeasurements(patientId);
    return list.length > 0 ? list[list.length - 1] : undefined;
  }

  addMeasurement(measurement: Omit<HealthMeasurement, 'id' | 'status' | 'statusReasons'>): HealthMeasurement {
    const evalResult = evaluateMeasurementAlerts(measurement);
    const newMeasurement: HealthMeasurement = {
      ...measurement,
      id: `meas-${Date.now()}`,
      status: evalResult.overallStatus,
      statusReasons: evalResult.reasons,
    };

    this.data.measurements.push(newMeasurement);

    // If alerts were triggered, create alert entities
    const patient = this.getPatientById(measurement.patientId);
    const patientName = patient ? patient.name : 'Unknown Patient';

    evalResult.alertsToTrigger.forEach((alertInfo) => {
      const alert: Alert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        patientId: measurement.patientId,
        patientName,
        measurementId: newMeasurement.id,
        severity: alertInfo.severity,
        reason: alertInfo.reason,
        triggerValue: alertInfo.triggerValue,
        ruleVersion: alertInfo.ruleVersion,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      this.data.alerts.unshift(alert);
    });

    this.saveDatabase();
    return newMeasurement;
  }

  // Alerts
  getAlerts(doctorId?: string, status?: Alert['status']): Alert[] {
    let alerts = this.data.alerts;
    if (doctorId) {
      const patientIds = this.getPatients(doctorId).map((p) => p.id);
      alerts = alerts.filter((a) => patientIds.includes(a.patientId));
    }
    if (status) {
      alerts = alerts.filter((a) => a.status === status);
    }
    return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateAlertStatus(alertId: string, status: Alert['status'], resolvedBy?: string, resolutionNotes?: string): Alert | undefined {
    const alert = this.data.alerts.find((a) => a.id === alertId);
    if (!alert) return undefined;
    alert.status = status;
    if (status === 'RESOLVED') {
      alert.resolvedAt = new Date().toISOString();
      alert.resolvedBy = resolvedBy;
      alert.resolutionNotes = resolutionNotes;
    }
    this.saveDatabase();
    return alert;
  }

  // Messages
  getMessages(patientId: string, doctorId: string): ChatMessage[] {
    return this.data.messages
      .filter(
        (m) =>
          (m.senderId === patientId && m.receiverId === doctorId) ||
          (m.senderId === doctorId && m.receiverId === patientId)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>): ChatMessage {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };
    this.data.messages.push(newMsg);
    this.saveDatabase();
    return newMsg;
  }

  markMessagesAsRead(patientId: string, readerId: string) {
    this.data.messages.forEach((m) => {
      if (m.receiverId === readerId && (m.senderId === patientId || m.receiverId === patientId)) {
        m.status = 'read';
      }
    });
    this.saveDatabase();
  }

  // Voice Messages
  getVoiceMessages(patientId: string, doctorId: string): VoiceMessage[] {
    return this.data.voiceMessages
      .filter(
        (vm) =>
          (vm.senderId === patientId && vm.receiverId === doctorId) ||
          (vm.senderId === doctorId && vm.receiverId === patientId)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  addVoiceMessage(vm: Omit<VoiceMessage, 'id' | 'timestamp' | 'status'>): VoiceMessage {
    const newVM: VoiceMessage = {
      ...vm,
      id: `vm-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };
    this.data.voiceMessages.push(newVM);
    this.saveDatabase();
    return newVM;
  }

  // Calls
  getCalls(patientId: string): CallSession[] {
    return this.data.calls
      .filter((c) => c.callerId === patientId || c.receiverId === patientId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  addCall(call: Omit<CallSession, 'id'>): CallSession {
    const newCall: CallSession = {
      ...call,
      id: `call-${Date.now()}`,
    };
    this.data.calls.unshift(newCall);
    this.saveDatabase();
    return newCall;
  }

  updateCall(id: string, updates: Partial<CallSession>): CallSession | undefined {
    const c = this.data.calls.find((x) => x.id === id);
    if (!c) return undefined;
    Object.assign(c, updates);
    this.saveDatabase();
    return c;
  }

  // Private Doctor Notes (Strictly for Doctor eyes only)
  getDoctorNotes(patientId: string, doctorId: string): DoctorNote[] {
    return this.data.doctorNotes
      .filter((n) => n.patientId === patientId && n.doctorId === doctorId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addDoctorNote(note: Omit<DoctorNote, 'id' | 'timestamp'>): DoctorNote {
    const newNote: DoctorNote = {
      ...note,
      id: `note-${Date.now()}`,
      isPrivateToDoctor: true,
      timestamp: new Date().toISOString(),
    };
    this.data.doctorNotes.unshift(newNote);
    this.saveDatabase();
    return newNote;
  }

  // Assessments
  getAssessments(patientId: string): DoctorAssessment[] {
    return this.data.assessments
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addAssessment(assess: Omit<DoctorAssessment, 'id' | 'timestamp'>): DoctorAssessment {
    const newAssess: DoctorAssessment = {
      ...assess,
      id: `assess-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.data.assessments.unshift(newAssess);
    this.saveDatabase();
    return newAssess;
  }

  // Doctor Annotations on Charts
  getAnnotations(patientId: string): DoctorAnnotation[] {
    return this.data.annotations.filter((a) => a.patientId === patientId);
  }

  addAnnotation(annot: Omit<DoctorAnnotation, 'id' | 'createdAt'>): DoctorAnnotation {
    const newAnnot: DoctorAnnotation = {
      ...annot,
      id: `annot-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.annotations.push(newAnnot);
    this.saveDatabase();
    return newAnnot;
  }

  // Audit Logs
  getAuditLogs(userId?: string): AuditLog[] {
    if (userId) {
      return this.data.auditLogs
        .filter((l) => l.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return this.data.auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    this.saveDatabase();
    return newLog;
  }

  // Health Timeline Builder
  getPatientTimeline(patientId: string): HealthTimelineEvent[] {
    const events: HealthTimelineEvent[] = [];

    // 1. Measurements
    this.getMeasurements(patientId).forEach((m) => {
      let desc = '';
      if (m.bloodPressure) desc += `BP: ${m.bloodPressure.systolic}/${m.bloodPressure.diastolic} mmHg. `;
      if (m.weight) desc += `Weight: ${m.weight.value} ${m.weight.unit}. `;
      if (m.temperature) desc += `Temp: ${m.temperature.value}°${m.temperature.unit}. `;
      if (m.heartRate) desc += `HR: ${m.heartRate} bpm. `;
      if (m.notes) desc += `Note: "${m.notes}"`;

      events.push({
        id: `tl-meas-${m.id}`,
        timestamp: m.timestamp,
        eventType: 'vital_recorded',
        title: 'Health Vitals Logged',
        description: desc.trim(),
        source: m.recordedBy,
        severity: m.status,
        meta: { measurementId: m.id },
      });
    });

    // 2. Messages
    this.data.messages
      .filter((msg) => msg.senderId === patientId || msg.receiverId === patientId)
      .forEach((msg) => {
        events.push({
          id: `tl-msg-${msg.id}`,
          timestamp: msg.timestamp,
          eventType: msg.senderId === patientId ? 'message_sent' : 'doctor_reply',
          title: msg.senderId === patientId ? 'Message Sent to Doctor' : 'Doctor Message Received',
          description: msg.text,
          source: msg.senderRole,
        });
      });

    // 3. Voice Messages
    this.data.voiceMessages
      .filter((vm) => vm.senderId === patientId || vm.receiverId === patientId)
      .forEach((vm) => {
        events.push({
          id: `tl-vm-${vm.id}`,
          timestamp: vm.timestamp,
          eventType: 'voice_message',
          title: vm.senderId === patientId ? 'Voice Note Sent to Doctor' : 'Voice Message Received from Doctor',
          description: `Voice recording (${vm.durationSeconds}s)${vm.transcript ? `: "${vm.transcript}"` : ''}`,
          source: vm.senderRole,
        });
      });

    // 4. Assessments
    this.getAssessments(patientId).forEach((a) => {
      events.push({
        id: `tl-ass-${a.id}`,
        timestamp: a.timestamp,
        eventType: 'assessment_created',
        title: 'Clinical Assessment & Plan Recorded',
        description: a.summary,
        source: 'doctor',
      });
    });

    // 5. Alerts
    this.data.alerts
      .filter((al) => al.patientId === patientId)
      .forEach((al) => {
        events.push({
          id: `tl-alt-${al.id}`,
          timestamp: al.createdAt,
          eventType: 'alert_triggered',
          title: `Alert Triggered (${al.severity})`,
          description: al.reason,
          source: 'system',
          severity: al.severity,
        });
      });

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

// Global Singleton for Next.js hot reload safety
declare global {
  var __healthlink_db: HealthLinkDatabase | undefined;
}

export const db = globalThis.__healthlink_db || new HealthLinkDatabase();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__healthlink_db = db;
}
