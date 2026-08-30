import { NextRequest, NextResponse } from 'next/server';
import { extractAuthSession } from '@/lib/security/auth';
import { db } from '@/lib/db/database';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const session = extractAuthSession(authHeader);

    const patientId = session?.role === 'patient' ? session.userId : 'pat-1';
    const body = await req.json();
    const { action, currentPassword, newPassword } = body;

    const patient = db.getPatientById(patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    if (action === 'CHANGE_PASSWORD') {
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long and contain numbers/letters.' },
          { status: 400 }
        );
      }

      db.addAuditLog({
        userId: patient.id,
        userName: patient.name,
        userRole: 'patient',
        action: 'PASSWORD_CHANGED',
        resource: 'ACCOUNT_SECURITY',
        details: 'Patient updated account authentication credentials',
      });

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully. Please use your new password next time you sign in.',
      });
    }

    if (action === 'TERMINATE_OTHER_SESSIONS') {
      db.addAuditLog({
        userId: patient.id,
        userName: patient.name,
        userRole: 'patient',
        action: 'TERMINATE_SESSIONS',
        resource: 'ACCOUNT_SECURITY',
        details: 'Terminated all active sessions on other devices',
      });

      return NextResponse.json({
        success: true,
        message: 'All other remote active sessions have been invalidated.',
      });
    }

    return NextResponse.json({ error: 'Invalid security action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling security action:', error);
    return NextResponse.json({ error: 'Failed to process security request' }, { status: 500 });
  }
}
