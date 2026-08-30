import { NextRequest, NextResponse } from 'next/server';
import { extractAuthSession } from '@/lib/security/auth';
import { db } from '@/lib/db/database';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const session = extractAuthSession(authHeader);

    const patientId = session?.role === 'patient' ? session.userId : 'pat-1';
    const body = await req.json();
    const { reason, confirmText } = body;

    const patient = db.getPatientById(patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    if (confirmText !== 'DELETE') {
      return NextResponse.json(
        { error: 'Please type "DELETE" exactly to confirm your request.' },
        { status: 400 }
      );
    }

    // Record formal HIPAA request audit log
    db.addAuditLog({
      userId: patient.id,
      userName: patient.name,
      userRole: 'patient',
      action: 'DATA_DELETION_REQUEST',
      resource: 'PATIENT_RECORD',
      details: `Patient requested data deletion/purge. Reason: ${reason || 'Not specified'}. Under medical record retention laws, legal clinical archives will be reviewed by the clinical administrator.`,
    });

    return NextResponse.json({
      success: true,
      requestId: `DEL-REQ-${Date.now()}`,
      message:
        'Your deletion request has been formally submitted to the HIPAA Privacy Officer. Note that certain clinical diagnostic data is subject to statutory retention periods.',
    });
  } catch (error) {
    console.error('Error submitting deletion request:', error);
    return NextResponse.json({ error: 'Failed to submit deletion request' }, { status: 500 });
  }
}
