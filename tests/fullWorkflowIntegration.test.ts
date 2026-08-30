import { describe, it, expect } from 'vitest';
import { db } from '../src/lib/db/database';
import { signToken, verifyToken, canAccessPatient } from '../src/lib/security/auth';
import { validateWeight, validateBloodPressure, validateTemperature, validateHeartRate } from '../src/lib/clinical/validation';
import { evaluateMeasurementAlerts } from '../src/lib/clinical/alertRules';
import { calculateBMI, calculateBPAnalysis } from '../src/lib/clinical/calculations';
import { generateResponsibleAIResponse } from '../src/lib/ai/healthKnowledge';
import { runSafetyFilter } from '../src/lib/ai/safetyGuardrails';

describe('HEALTHLINK Full-Platform End-to-End Real-Time Workflow', () => {
  let patientToken: string;
  let doctorToken: string;
  const doctorCode = 'DOC-7749';

  it('Step 1: Doctor and Patient Authentication & Session Setup', () => {
    // 1. Verify Doctor Code in database
    const doctor = db.getDoctorByCode(doctorCode);
    expect(doctor).toBeDefined();
    expect(doctor?.name).toContain('Dr. Sarah Miller');

    // 2. Doctor JWT issuance
    doctorToken = signToken({
      userId: doctor!.id,
      role: 'doctor',
      name: doctor!.name,
      email: doctor!.email,
      doctorCode: doctor!.doctorCode,
    });
    const doctorSession = verifyToken(doctorToken);
    expect(doctorSession?.role).toBe('doctor');

    // 3. Patient Authentication & JWT issuance
    const patient = db.getPatientById('pat-1');
    expect(patient).toBeDefined();
    expect(patient?.doctorId).toBe(doctor!.id);

    patientToken = signToken({
      userId: patient!.id,
      role: 'patient',
      name: patient!.name,
      email: patient!.email,
      doctorId: doctor!.id,
      doctorCode: doctor!.doctorCode,
    });
    const patientSession = verifyToken(patientToken);
    expect(patientSession?.role).toBe('patient');
  });

  it('Step 2: Patient Validates and Logs Health Vitals (Weight, BP, Temp, HR)', () => {
    // Technical Validation Checks
    const weightVal = validateWeight(75.2, 'kg');
    expect(weightVal.isValid).toBe(true);

    const bpVal = validateBloodPressure(118, 76);
    expect(bpVal.isValid).toBe(true);

    const tempVal = validateTemperature(36.7, 'C');
    expect(tempVal.isValid).toBe(true);

    const hrVal = validateHeartRate(70);
    expect(hrVal.isValid).toBe(true);

    // Save measurement to database
    const newMeas = db.addMeasurement({
      patientId: 'pat-1',
      timestamp: new Date().toISOString(),
      recordedBy: 'patient',
      notes: 'Logged after 30 min morning exercise',
      weight: weightVal.convertedValue,
      bloodPressure: { ...bpVal.convertedValue, pulse: 70 },
      temperature: tempVal.convertedValue,
      heartRate: 70,
    });

    expect(newMeas.id).toBeDefined();
    expect(newMeas.status).toBe('NORMAL');

    // Verify measurement is present in patient time series
    const patientMeasurements = db.getMeasurements('pat-1');
    expect(patientMeasurements.some((m) => m.id === newMeas.id)).toBe(true);
  });

  it('Step 3: Clinical Alert Engine triggers URGENT alert on hypertensive crisis readings', () => {
    const crisisMeas = db.addMeasurement({
      patientId: 'pat-1',
      timestamp: new Date().toISOString(),
      recordedBy: 'patient',
      notes: 'Severe headache',
      bloodPressure: { systolic: 188, diastolic: 124, pulse: 96 },
      temperature: { value: 37.1, unit: 'C', convertedC: 37.1 },
      weight: { value: 75.0, unit: 'kg', convertedKg: 75.0 },
      heartRate: 96,
    });

    expect(crisisMeas.status).toBe('URGENT');

    // Check that alert was generated in database
    const alerts = db.getAlerts('doc-1', 'ACTIVE');
    const matchingAlert = alerts.find((a) => a.measurementId === crisisMeas.id);
    expect(matchingAlert).toBeDefined();
    expect(matchingAlert?.severity).toBe('URGENT');
    expect(matchingAlert?.reason).toContain('Hypertensive crisis');
  });

  it('Step 4: Patient and Doctor Bi-directional Messaging and Voice Notes', () => {
    // Patient sends text message
    const msg1 = db.addMessage({
      senderId: 'pat-1',
      senderName: 'John Doe',
      senderRole: 'patient',
      receiverId: 'doc-1',
      text: 'Good morning Dr. Miller, I logged my vitals. My headache subsided after resting.',
    });
    expect(msg1.status).toBe('delivered');

    // Doctor receives and responds
    const msg2 = db.addMessage({
      senderId: 'doc-1',
      senderName: 'Dr. Sarah Miller, MD',
      senderRole: 'doctor',
      receiverId: 'pat-1',
      text: 'Good to hear John. Continue to monitor your blood pressure closely and stay well hydrated.',
    });
    expect(msg2.status).toBe('delivered');

    // Verify conversation thread
    const thread = db.getMessages('pat-1', 'doc-1');
    expect(thread.some((m) => m.id === msg1.id)).toBe(true);
    expect(thread.some((m) => m.id === msg2.id)).toBe(true);

    // Patient sends voice note
    const vm = db.addVoiceMessage({
      senderId: 'pat-1',
      senderName: 'John Doe',
      senderRole: 'patient',
      receiverId: 'doc-1',
      audioDataUrl: 'data:audio/webm;base64,GkXfo59ChoEBQveBAULygQ8=',
      durationSeconds: 12,
      transcript: 'Thank you doctor, I will log my evening reading before bed.',
    });
    expect(vm.id).toBeDefined();
  });

  it('Step 5: AI Health Assistant Safety Filters & Responsible Guidance', () => {
    // Safe educational question
    const response1 = generateResponsibleAIResponse('What is the difference between systolic and diastolic blood pressure?');
    expect(response1.isEmergency).toBe(false);
    expect(response1.message).toContain('Systolic');
    expect(response1.disclaimer).toBeDefined();

    // Emergency red-flag query
    const safetyCheck = runSafetyFilter('I have severe crushing chest pain and difficulty breathing');
    expect(safetyCheck.isEmergency).toBe(true);
    expect(safetyCheck.emergencyMessage).toContain('EMERGENCY ADVISORY');

    // Refusal of prescription requests
    const rxCheck = runSafetyFilter('Can you write me a prescription for amlodipine?');
    expect(rxCheck.prohibitedTopicDetected).toBe('prescribing_dosage');
  });

  it('Step 6: Doctor Private Notes Security & Role Isolation', () => {
    // Doctor adds confidential clinical note
    const privateNote = db.addDoctorNote({
      patientId: 'pat-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Miller, MD',
      title: 'Differential Cardiovascular Evaluation',
      content: 'Transient spike in blood pressure likely related to acute stress. Secondary causes ruled out.',
      isPrivateToDoctor: true,
      category: 'observation',
    });

    expect(privateNote.isPrivateToDoctor).toBe(true);

    // Doctor can fetch their notes
    const doctorNotes = db.getDoctorNotes('pat-1', 'doc-1');
    expect(doctorNotes.some((n) => n.id === privateNote.id)).toBe(true);

    // Verify patient session CANNOT access other patients
    const patientSession = verifyToken(patientToken)!;
    const canAccessOther = canAccessPatient(patientSession, 'pat-2', 'doc-1');
    expect(canAccessOther).toBe(false);
  });

  it('Step 7: Clinical Calculations & Telehealth Calling Sessions', () => {
    // BMI calculation for 75 kg and 178 cm
    const bmi = calculateBMI(75, 178);
    expect(bmi.bmi).toBe(23.7);
    expect(bmi.category).toBe('Normal weight');

    // MAP calculation for 122/78 mmHg
    const bpAnalysis = calculateBPAnalysis(122, 78);
    expect(bpAnalysis.pulsePressure).toBe(44);
    expect(bpAnalysis.map).toBe(92.7);

    // Telehealth call session initiation
    const call = db.addCall({
      callerId: 'doc-1',
      callerName: 'Dr. Sarah Miller, MD',
      callerRole: 'doctor',
      receiverId: 'pat-1',
      receiverName: 'John Doe',
      callType: 'video',
      status: 'connected',
      startedAt: new Date().toISOString(),
    });
    expect(call.status).toBe('connected');

    // End call
    const endedCall = db.updateCall(call.id, {
      status: 'ended',
      endedAt: new Date().toISOString(),
      durationSeconds: 420,
    });
    expect(endedCall?.durationSeconds).toBe(420);
  });

  it('Step 8: Patient Health Timeline & Audit Trail Integrity', () => {
    const timeline = db.getPatientTimeline('pat-1');
    expect(timeline.length).toBeGreaterThan(0);

    // Verify all major event types are represented
    const eventTypes = timeline.map((t) => t.eventType);
    expect(eventTypes).toContain('vital_recorded');
    expect(eventTypes).toContain('message_sent');

    // Verify audit log entries
    const auditLogs = db.getAuditLogs();
    expect(auditLogs.length).toBeGreaterThan(0);
  });
});
