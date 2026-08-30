import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { signToken } from '@/lib/security/auth';
import { sanitizeString } from '@/lib/security/sanitization';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const patientName = sanitizeString(body.patientName || '');
    const doctorName = sanitizeString(body.doctorName || '');
    const doctorCode = sanitizeString(body.doctorCode || '').toUpperCase();

    if (!patientName || !doctorCode) {
      return NextResponse.json(
        { error: 'Patient Name and Doctor Code are required.' },
        { status: 400 }
      );
    }

    // 1. Verify Doctor Code against database
    const doctor = db.getDoctorByCode(doctorCode);
    if (!doctor) {
      return NextResponse.json(
        {
          error: 'Invalid Doctor Code. Please check the code provided by your clinic (e.g. DOC-7749).',
        },
        { status: 401 }
      );
    }

    // 2. Find or create patient
    let patient = db.getPatients().find(
      (p) =>
        p.name.toLowerCase() === patientName.toLowerCase() &&
        p.doctorId === doctor.id
    );

    if (!patient) {
      // Auto-register demo/new patient with authorized link to doctor
      patient = db.createPatient({
        name: patientName,
        email: `${patientName.toLowerCase().replace(/\s+/g, '.')}@patient.healthlink`,
        doctorId: doctor.id,
        doctorCode: doctor.doctorCode,
        allergies: [],
        medicalHistory: ['Self-registered via Patient Portal'],
      });
    }

    // 3. Issue secure JWT token
    const token = signToken({
      userId: patient.id,
      role: 'patient',
      name: patient.name,
      email: patient.email,
      doctorId: doctor.id,
      doctorCode: doctor.doctorCode,
    });

    // 4. Record Audit Log
    db.addAuditLog({
      userId: patient.id,
      userName: patient.name,
      userRole: 'patient',
      action: 'LOGIN',
      resource: 'PATIENT_PORTAL',
      details: `Patient logged in successfully with Doctor Code ${doctorCode}`,
    });

    return NextResponse.json({
      success: true,
      token,
      patient,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        clinicName: doctor.clinicName,
        isOnline: doctor.isOnline,
      },
    });
  } catch (error: any) {
    console.error('Patient login error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred during authentication.' },
      { status: 500 }
    );
  }
}
