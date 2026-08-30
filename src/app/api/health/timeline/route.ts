import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession, canAccessPatient } from '@/lib/security/auth';

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
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const timeline = db.getPatientTimeline(targetPatientId);

    return NextResponse.json({
      timeline,
      patientName: patient.name,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch timeline.' }, { status: 500 });
  }
}
