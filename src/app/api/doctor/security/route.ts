import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession } from '@/lib/security/auth';
import { hashPassword, verifyPassword, validatePasswordStrength } from '@/lib/security/password';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const session = extractAuthSession(authHeader);

    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized clinical access.' }, { status: 401 });
    }

    const doctor = db.getDoctorById(session.userId) || (session.doctorCode ? db.getDoctorByCode(session.doctorCode) : undefined);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found.' }, { status: 404 });
    }

    const auditLogs = db.getAuditLogs(doctor.id);

    return NextResponse.json({
      success: true,
      security: {
        verificationStatus: doctor.verificationStatus,
        mfaEnabled: Boolean(doctor.mfaEnabled),
        doctorCode: doctor.doctorCode,
        email: doctor.email,
        recentActivity: auditLogs.slice(0, 10),
      },
    });
  } catch (error: any) {
    console.error('Doctor security GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve security settings.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const session = extractAuthSession(authHeader);

    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized clinical access.' }, { status: 401 });
    }

    const doctor = db.getDoctorById(session.userId) || (session.doctorCode ? db.getDoctorByCode(session.doctorCode) : undefined);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found.' }, { status: 404 });
    }

    const body = await req.json();
    const action = body.action;

    if (action === 'change_password') {
      const currentPassword = body.currentPassword || '';
      const newPassword = body.newPassword || '';
      const confirmPassword = body.confirmPassword || '';

      const isCurrentValid = doctor.passwordHash
        ? await verifyPassword(currentPassword, doctor.passwordHash)
        : false;

      if (!isCurrentValid) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: 'New passwords do not match.' }, { status: 400 });
      }

      const strength = validatePasswordStrength(newPassword);
      if (!strength.valid) {
        return NextResponse.json({ error: strength.message || 'Password does not meet standards.' }, { status: 400 });
      }

      const newHash = await hashPassword(newPassword);
      db.updateDoctor(doctor.id, { passwordHash: newHash });

      db.addAuditLog({
        userId: doctor.id,
        userName: doctor.name,
        userRole: 'doctor',
        action: 'PASSWORD_CHANGED',
        resource: 'SECURITY_SETTINGS',
        details: 'Doctor successfully changed account password',
      });

      return NextResponse.json({ success: true, message: 'Password updated successfully.' });
    }

    if (action === 'toggle_mfa') {
      const mfaEnabled = Boolean(body.mfaEnabled);
      db.updateDoctor(doctor.id, { mfaEnabled });

      db.addAuditLog({
        userId: doctor.id,
        userName: doctor.name,
        userRole: 'doctor',
        action: mfaEnabled ? 'MFA_ENABLED' : 'MFA_DISABLED',
        resource: 'SECURITY_SETTINGS',
        details: `Two-Factor Authentication was ${mfaEnabled ? 'enabled' : 'disabled'}`,
      });

      return NextResponse.json({ success: true, mfaEnabled, message: `MFA ${mfaEnabled ? 'enabled' : 'disabled'} successfully.` });
    }

    return NextResponse.json({ error: 'Unknown security action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Doctor security POST error:', error);
    return NextResponse.json({ error: 'Failed to update security settings.' }, { status: 500 });
  }
}
