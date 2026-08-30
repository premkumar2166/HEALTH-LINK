import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession, canAccessPatient } from '@/lib/security/auth';
import {
  validateWeight,
  validateBloodPressure,
  validateTemperature,
  validateHeartRate,
} from '@/lib/clinical/validation';
import { eventBus } from '@/lib/realtime/eventBus';
import { sanitizeNotes } from '@/lib/security/sanitization';

export async function GET(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetPatientId = searchParams.get('patientId') || session.userId;

    const patient = db.getPatientById(targetPatientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found.' }, { status: 404 });
    }

    if (!canAccessPatient(session, targetPatientId, patient.doctorId)) {
      return NextResponse.json({ error: 'Forbidden. Access to this patient record is denied.' }, { status: 403 });
    }

    const measurements = db.getMeasurements(targetPatientId);
    const annotations = db.getAnnotations(targetPatientId);

    return NextResponse.json({
      measurements,
      annotations,
      patient: {
        id: patient.id,
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        heightCm: patient.heightCm,
      },
    });
  } catch (error) {
    console.error('Error fetching measurements:', error);
    return NextResponse.json({ error: 'Failed to retrieve measurements.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const patientId = body.patientId || session.userId;

    const patient = db.getPatientById(patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found.' }, { status: 404 });
    }

    if (!canAccessPatient(session, patientId, patient.doctorId)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    // 1. Validate inputs
    let validatedWeight: any = undefined;
    let validatedBP: any = undefined;
    let validatedTemp: any = undefined;
    let validatedHR: any = undefined;

    const warnings: string[] = [];

    // Weight validation
    if (body.weight !== undefined && body.weight !== null && body.weight !== '') {
      const numVal = parseFloat(body.weight);
      const unit = body.weightUnit === 'lb' ? 'lb' : 'kg';
      const res = validateWeight(numVal, unit);
      if (!res.isValid) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      if (res.warning) warnings.push(res.warning);
      validatedWeight = res.convertedValue;
    }

    // Blood Pressure validation
    if (
      body.systolic !== undefined &&
      body.systolic !== null &&
      body.systolic !== '' &&
      body.diastolic !== undefined &&
      body.diastolic !== null &&
      body.diastolic !== ''
    ) {
      const sys = parseFloat(body.systolic);
      const dia = parseFloat(body.diastolic);
      const res = validateBloodPressure(sys, dia);
      if (!res.isValid) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      if (res.warning) warnings.push(res.warning);
      validatedBP = {
        ...res.convertedValue,
        pulse: body.heartRate ? parseInt(body.heartRate, 10) : undefined,
      };
    }

    // Temperature validation
    if (body.temperature !== undefined && body.temperature !== null && body.temperature !== '') {
      const numVal = parseFloat(body.temperature);
      const unit = body.tempUnit === 'F' ? 'F' : 'C';
      const res = validateTemperature(numVal, unit);
      if (!res.isValid) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      if (res.warning) warnings.push(res.warning);
      validatedTemp = res.convertedValue;
    }

    // Heart Rate validation
    if (body.heartRate !== undefined && body.heartRate !== null && body.heartRate !== '') {
      const numVal = parseInt(body.heartRate, 10);
      const res = validateHeartRate(numVal);
      if (!res.isValid) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      if (res.warning) warnings.push(res.warning);
      validatedHR = res.convertedValue;
    }

    if (!validatedWeight && !validatedBP && !validatedTemp && !validatedHR) {
      return NextResponse.json(
        { error: 'Please enter at least one valid health measurement (Weight, Blood Pressure, Temperature, or Heart Rate).' },
        { status: 400 }
      );
    }

    // 2. Persist measurement and evaluate clinical status
    const newMeasurement = db.addMeasurement({
      patientId,
      timestamp: new Date().toISOString(),
      recordedBy: session.role === 'doctor' ? 'doctor' : 'patient',
      notes: sanitizeNotes(body.notes),
      weight: validatedWeight,
      bloodPressure: validatedBP,
      temperature: validatedTemp,
      heartRate: validatedHR,
    });

    // 3. Update patient's updatedAt
    db.updatePatient(patientId, { updatedAt: new Date().toISOString() });

    // 4. Log audit trail
    db.addAuditLog({
      userId: session.userId,
      userName: session.name,
      userRole: session.role,
      action: 'RECORD_MEASUREMENT',
      resource: `MEASUREMENT_${newMeasurement.id}`,
      details: `Recorded vitals with Clinical Status: ${newMeasurement.status}`,
    });

    // 5. Broadcast real-time event
    eventBus.broadcast({
      type: 'NEW_MEASUREMENT',
      patientId,
      doctorId: patient.doctorId,
      data: newMeasurement,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      measurement: newMeasurement,
      warnings,
      message: 'Health vitals recorded and synchronized successfully.',
    });
  } catch (error: any) {
    console.error('Error creating measurement:', error);
    return NextResponse.json({ error: 'Failed to record measurement.' }, { status: 500 });
  }
}
