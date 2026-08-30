import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession, canAccessPatient } from '@/lib/security/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Clinical authorization required.' }, { status: 403 });
    }

    const patientId = params.id;
    const patient = db.getPatientById(patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found.' }, { status: 404 });
    }

    if (!canAccessPatient(session, patientId, patient.doctorId)) {
      return NextResponse.json({ error: 'Unauthorized to view this patient.' }, { status: 403 });
    }

    const measurements = db.getMeasurements(patientId);
    const messages = db.getMessages(patientId, session.userId);
    const voiceMessages = db.getVoiceMessages(patientId, session.userId);
    const calls = db.getCalls(patientId);
    const alerts = db.getAlerts(session.userId).filter((a) => a.patientId === patientId);
    const doctorNotes = db.getDoctorNotes(patientId, session.userId);
    const assessments = db.getAssessments(patientId);
    const annotations = db.getAnnotations(patientId);
    const timeline = db.getPatientTimeline(patientId);

    // Audit log this clinical chart access
    db.addAuditLog({
      userId: session.userId,
      userName: session.name,
      userRole: 'doctor',
      action: 'VIEW_PATIENT_CHART',
      resource: `PATIENT_${patientId}`,
      details: `Full clinical chart inspection for ${patient.name}`,
    });

    return NextResponse.json({
      patient,
      measurements,
      messages,
      voiceMessages,
      calls,
      alerts,
      doctorNotes,
      assessments,
      annotations,
      timeline,
    });
  } catch (error) {
    console.error('Error fetching patient clinical chart:', error);
    return NextResponse.json({ error: 'Failed to retrieve patient clinical chart.' }, { status: 500 });
  }
}
