import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { sanitizeEmail, sanitizeString } from '@/lib/security/sanitization';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = sanitizeEmail(body.email || '');
    const token = sanitizeString(body.token || body.code || '');

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required for verification.' },
        { status: 400 }
      );
    }

    const verified = db.verifyDoctorEmail(email, token);
    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token.' },
        { status: 400 }
      );
    }

    const doctor = db.getDoctorByEmail(email);

    if (doctor) {
      db.addAuditLog({
        userId: doctor.id,
        userName: doctor.name,
        userRole: 'doctor',
        action: 'EMAIL_VERIFICATION',
        resource: 'DOCTOR_PORTAL',
        details: 'Doctor email verification completed successfully',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor account verified successfully. You may now sign in.',
    });
  } catch (error: any) {
    console.error('Doctor verification error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during email verification.' },
      { status: 500 }
    );
  }
}
