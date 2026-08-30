import { NextRequest, NextResponse } from 'next/server';
import { extractAuthSession } from '@/lib/security/auth';
import { db } from '@/lib/db/database';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const session = extractAuthSession(authHeader);

    if (session) {
      db.addAuditLog({
        userId: session.userId,
        userName: session.name,
        userRole: session.role,
        action: 'LOGOUT',
        resource: session.role === 'doctor' ? 'DOCTOR_PORTAL' : 'PATIENT_PORTAL',
        details: 'User logged out and destroyed active session',
      });
    }

    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
