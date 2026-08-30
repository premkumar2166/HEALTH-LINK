import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { signToken } from '@/lib/security/auth';
import { hashPassword, validatePasswordStrength } from '@/lib/security/password';
import { sanitizeString, sanitizeEmail, isValidEmail } from '@/lib/security/sanitization';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = sanitizeString(body.fullName || body.name || '');
    const email = sanitizeEmail(body.professionalEmail || body.email || '');
    const phone = sanitizeString(body.phoneNumber || body.phone || '');
    const professionalId = sanitizeString(body.professionalId || body.licenseNumber || '');
    const specialization = sanitizeString(body.specialization || body.specialty || '');
    const clinicName = sanitizeString(body.hospitalClinic || body.clinicName || '');
    const password = body.password || '';
    const confirmPassword = body.confirmPassword || '';

    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. Basic validation
    if (!name || !email || !professionalId || !specialization || !clinicName || !password) {
      return NextResponse.json(
        { error: 'All fields are required to create a verified doctor account.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid professional email address.' },
        { status: 400 }
      );
    }

    // 2. Password validation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json(
        { error: strength.message || 'Password does not meet clinical security standards.' },
        { status: 400 }
      );
    }

    // 3. Check for existing doctor with same email
    const existing = db.getDoctorByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this professional email address already exists.' },
        { status: 409 }
      );
    }

    // 4. Hash password securely with bcrypt
    const passwordHash = await hashPassword(password);
    const autoVerify = body.autoVerify !== false; // Default to auto-verified for instant real-world accessibility

    // 5. Create Doctor in database (auto-generates unique Doctor Code like HL-DR-XXXXXX)
    const newDoctor = db.createDoctor({
      name,
      email,
      phone,
      professionalId,
      specialization,
      clinicName,
      passwordHash,
      autoVerify,
    });

    // 6. Issue JWT session token
    const token = signToken({
      userId: newDoctor.id,
      role: 'doctor',
      name: newDoctor.name,
      email: newDoctor.email,
      doctorCode: newDoctor.doctorCode,
    });

    // 7. Record Audit Log
    db.addAuditLog({
      userId: newDoctor.id,
      userName: newDoctor.name,
      userRole: 'doctor',
      action: 'DOCTOR_REGISTRATION',
      resource: 'DOCTOR_PORTAL',
      details: `Doctor account created with code ${newDoctor.doctorCode}`,
      ipAddress: clientIp,
    });

    return NextResponse.json({
      success: true,
      token,
      doctor: {
        id: newDoctor.id,
        name: newDoctor.name,
        email: newDoctor.email,
        doctorCode: newDoctor.doctorCode,
        specialization: newDoctor.specialization,
        clinicName: newDoctor.clinicName,
        verificationStatus: newDoctor.verificationStatus,
        verificationToken: newDoctor.verificationToken,
      },
      doctorCode: newDoctor.doctorCode,
      message: 'Doctor account created and verified successfully.',
    });

  } catch (error: any) {
    console.error('Doctor registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during account creation.' },
      { status: 500 }
    );
  }
}
