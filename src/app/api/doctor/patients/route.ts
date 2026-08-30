import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Doctor clinical authorization required.' }, { status: 403 });
    }

    const doctorId = session.userId;
    const patients = db.getPatients(doctorId);

    // Build patient triage summaries
    const patientSummaries = patients.map((p) => {
      const latestMeas = db.getLatestMeasurement(p.id);
      const activeAlerts = db.getAlerts(doctorId, 'ACTIVE').filter((a) => a.patientId === p.id);
      const unreadMessages = db
        .getMessages(p.id, doctorId)
        .filter((m) => m.senderId === p.id && m.status !== 'read');

      let clinicalStatus = latestMeas ? latestMeas.status : 'NORMAL';
      if (activeAlerts.some((a) => a.severity === 'URGENT')) {
        clinicalStatus = 'URGENT';
      } else if (activeAlerts.some((a) => a.severity === 'REVIEW') && clinicalStatus !== 'URGENT') {
        clinicalStatus = 'REVIEW';
      }

      return {
        id: p.id,
        name: p.name,
        email: p.email,
        dateOfBirth: p.dateOfBirth,
        gender: p.gender,
        allergies: p.allergies,
        medicalHistory: p.medicalHistory,
        updatedAt: p.updatedAt,
        clinicalStatus,
        latestMeasurement: latestMeas,
        activeAlertsCount: activeAlerts.length,
        unreadMessagesCount: unreadMessages.length,
      };
    });

    const totalPatients = patients.length;
    const totalActiveAlerts = db.getAlerts(doctorId, 'ACTIVE').length;
    const totalUnreadMessages = db
      .getMessages('', doctorId)
      .filter((m) => m.senderRole === 'patient' && m.status !== 'read').length;
    const urgentPatientsCount = patientSummaries.filter((p) => p.clinicalStatus === 'URGENT').length;
    const reviewPatientsCount = patientSummaries.filter((p) => p.clinicalStatus === 'REVIEW').length;

    return NextResponse.json({
      patients: patientSummaries,
      stats: {
        totalPatients,
        totalActiveAlerts,
        totalUnreadMessages,
        urgentPatientsCount,
        reviewPatientsCount,
      },
    });
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    return NextResponse.json({ error: 'Failed to retrieve patient list.' }, { status: 500 });
  }
}
