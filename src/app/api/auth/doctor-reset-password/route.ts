import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { hashPassword, validatePasswordStrength } from '@/lib/security/password';
import { sanitizeEmail } from '@/lib/security/sanitization';
import { normalizeDoctorCode } from '@/lib/security/doctorCode';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'request';
    const email = sanitizeEmail(body.email || '');
    const doctorCode = normalizeDoctorCode(body.doctorCode || '');

    if (!email || !doctorCode) {
      return NextResponse.json(
        { error: 'Professional Email and Doctor Code are required.' },
        { status: 400 }
      );
    }

    const doctor = db.getDoctorByEmail(email);
    if (!doctor || normalizeDoctorCode(doctor.doctorCode) !== doctorCode) {
      // Safe generic message to avoid account enumeration
      return NextResponse.json(
        { error: 'If the credentials match an authorized account, a reset code will be generated.' },
        { status: 200 }
      );
    }

    if (action === 'request') {
      const resetToken = db.createPasswordResetToken(email, doctorCode);

      db.addAuditLog({
        userId: doctor.id,
        userName: doctor.name,
        userRole: 'doctor',
        action: 'PASSWORD_RESET_REQUEST',
        resource: 'DOCTOR_PORTAL',
        details: 'Password reset code requested for doctor account',
      });

      return NextResponse.json({
        success: true,
        message: 'Password reset token generated.',
        resetToken, // Provided for user confirmation workflow
      });
    }

    if (action === 'confirm') {
      const token = (body.token || '').trim();
      const newPassword = body.newPassword || '';
      const confirmPassword = body.confirmPassword || '';

      if (!token) {
        return NextResponse.json(
          { error: 'Reset token is required.' },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: 'Passwords do not match.' },
          { status: 400 }
        );
      }

      const strength = validatePasswordStrength(newPassword);
      if (!strength.valid) {
        return NextResponse.json(
          { error: strength.message || 'Password does not meet security requirements.' },
          { status: 400 }
        );
      }

      const newHash = await hashPassword(newPassword);
      const success = db.verifyAndResetDoctorPassword(email, doctorCode, token, newHash);

      if (!success) {
        return NextResponse.json(
          { error: 'Invalid or expired password reset token.' },
          { status: 400 }
        );
      }

      db.addAuditLog({
        userId: doctor.id,
        userName: doctor.name,
        userRole: 'doctor',
        action: 'PASSWORD_RESET_COMPLETED',
        resource: 'DOCTOR_PORTAL',
        details: 'Doctor password successfully reset',
      });

      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully. You may now sign in with your new password.',
      });
    }

    return NextResponse.json({ error: 'Invalid action parameter.' }, { status: 400 });
  } catch (error: any) {
    console.error('Doctor reset password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during password reset.' },
      { status: 500 }
    );
  }
}
