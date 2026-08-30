import { NextRequest, NextResponse } from 'next/server';
import { extractAuthSession } from '@/lib/security/auth';
import { db } from '@/lib/db/database';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const session = extractAuthSession(authHeader);

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (session.role === 'patient') {
      const patient = db.getPatientById(session.userId);
      const doctor = patient ? db.getDoctorById(patient.doctorId) : undefined;
      return NextResponse.json({
        authenticated: true,
        session,
        patient,
        doctor: doctor
          ? {
              id: doctor.id,
              name: doctor.name,
              specialty: doctor.specialty,
              clinicName: doctor.clinicName,
              isOnline: doctor.isOnline,
            }
          : undefined,
      });
    }

    if (session.role === 'doctor') {
      const doctor = db.getDoctorById(session.userId);
      return NextResponse.json({
        authenticated: true,
        session,
        doctor,
      });
    }

    return NextResponse.json({ authenticated: true, session });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
