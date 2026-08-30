import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { signToken } from '@/lib/security/auth';
import { verifyPassword } from '@/lib/security/password';
import { rateLimiter } from '@/lib/security/rateLimit';
import { sanitizeString, sanitizeEmail } from '@/lib/security/sanitization';
import { normalizeDoctorCode } from '@/lib/security/doctorCode';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = sanitizeEmail(body.email || body.professionalEmail || '');
    const rawPassword = body.password || '';
    const rawDoctorCode = normalizeDoctorCode(body.doctorCode || '');
    const rememberDevice = Boolean(body.rememberDevice);

    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. Check Rate Limiting / Brute-Force Lockout
    const rateCheck = rateLimiter.checkLimit(email || rawDoctorCode || clientIp, clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many sign-in attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // 2. Validate Required Fields
    if (!email || !rawPassword || !rawDoctorCode) {
      return NextResponse.json(
        { error: 'Professional Email, Password, and Doctor Code are required.' },
        { status: 400 }
      );
    }

    // 3. Find Doctor by Email
    const doctor = db.getDoctorByEmail(email);
    if (!doctor) {
      rateLimiter.recordFailedAttempt(email, clientIp);
      return NextResponse.json(
        { error: 'Unable to sign in. Please verify your credentials and try again.' },
        { status: 401 }
      );
    }

    // 4. Verify Doctor Code
    if (normalizeDoctorCode(doctor.doctorCode) !== rawDoctorCode) {
      rateLimiter.recordFailedAttempt(email, clientIp);
      return NextResponse.json(
        { error: 'The Doctor Code could not be verified.' },
        { status: 401 }
      );
    }

    // 5. Verify Password
    const passwordMatch = doctor.passwordHash
      ? await verifyPassword(rawPassword, doctor.passwordHash)
      : false;

    if (!passwordMatch) {
      rateLimiter.recordFailedAttempt(email, clientIp);
      db.addAuditLog({
        userId: doctor.id,
        userName: doctor.name,
        userRole: 'doctor',
        action: 'FAILED_LOGIN_ATTEMPT',
        resource: 'DOCTOR_PORTAL',
        details: 'Incorrect password provided during authentication',
        ipAddress: clientIp,
      });

      return NextResponse.json(
        { error: 'Unable to sign in. Please verify your credentials and try again.' },
        { status: 401 }
      );
    }

    // 6. Check Verification Status
    if (doctor.verificationStatus === 'PENDING_VERIFICATION') {
      return NextResponse.json(
        {
          error: 'Please verify your professional account before continuing.',
          requiresVerification: true,
          email: doctor.email,
          doctorCode: doctor.doctorCode,
        },
        { status: 403 }
      );
    }

    // 7. Successful Authentication
    rateLimiter.recordSuccessfulAttempt(email, clientIp);

    const token = signToken({
      userId: doctor.id,
      role: 'doctor',
      name: doctor.name,
      email: doctor.email,
      doctorCode: doctor.doctorCode,
    });

    // Record Audit Log
    db.addAuditLog({
      userId: doctor.id,
      userName: doctor.name,
      userRole: 'doctor',
      action: 'LOGIN',
      resource: 'DOCTOR_PORTAL',
      details: 'Doctor authenticated to Clinical Command Center',
      ipAddress: clientIp,
    });

    return NextResponse.json({
      success: true,
      token,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        doctorCode: doctor.doctorCode,
        specialization: doctor.specialization || doctor.specialty,
        specialty: doctor.specialty || doctor.specialization,
        professionalId: doctor.professionalId || doctor.licenseNumber,
        clinicName: doctor.clinicName,
        phone: doctor.phone,
        verificationStatus: doctor.verificationStatus,
        isOnline: doctor.isOnline,
      },
    });
  } catch (error: any) {
    console.error('Doctor login error:', error);
    return NextResponse.json(
      { error: 'Unable to sign in. Please verify your credentials and try again.' },
      { status: 500 }
    );
  }
}
