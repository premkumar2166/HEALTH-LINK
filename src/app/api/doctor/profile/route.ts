import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession } from '@/lib/security/auth';
import { sanitizeString } from '@/lib/security/sanitization';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const session = extractAuthSession(authHeader);

    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized clinical access.' }, { status: 401 });
    }

    const doctor = db.getDoctorById(session.userId) || (session.doctorCode ? db.getDoctorByCode(session.doctorCode) : undefined);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor account not found.' }, { status: 404 });
    }

    const patients = db.getPatients(doctor.id);
    const alerts = db.getAlerts(doctor.id, 'ACTIVE');

    return NextResponse.json({
      success: true,
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
        mfaEnabled: doctor.mfaEnabled,
        isOnline: doctor.isOnline,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
      },
      stats: {
        totalPatients: patients.length,
        activeAlerts: alerts.length,
      },
    });
  } catch (error: any) {
    console.error('Doctor profile GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve doctor profile.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const session = extractAuthSession(authHeader);

    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized clinical access.' }, { status: 401 });
    }

    const doctor = db.getDoctorById(session.userId) || (session.doctorCode ? db.getDoctorByCode(session.doctorCode) : undefined);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor account not found.' }, { status: 404 });
    }

    const body = await req.json();
    const updates: any = {};

    if (body.name) updates.name = sanitizeString(body.name);
    if (body.phone) updates.phone = sanitizeString(body.phone);
    if (body.specialization || body.specialty) {
      updates.specialization = sanitizeString(body.specialization || body.specialty);
      updates.specialty = updates.specialization;
    }
    if (body.clinicName) updates.clinicName = sanitizeString(body.clinicName);
    if (body.professionalId || body.licenseNumber) {
      updates.professionalId = sanitizeString(body.professionalId || body.licenseNumber);
      updates.licenseNumber = updates.professionalId;
    }

    const updated = db.updateDoctor(doctor.id, updates);

    db.addAuditLog({
      userId: doctor.id,
      userName: doctor.name,
      userRole: 'doctor',
      action: 'PROFILE_UPDATED',
      resource: 'DOCTOR_PORTAL',
      details: 'Doctor updated profile information',
    });

    return NextResponse.json({
      success: true,
      doctor: updated,
      message: 'Profile updated successfully.',
    });
  } catch (error: any) {
    console.error('Doctor profile PUT error:', error);
    return NextResponse.json({ error: 'Failed to update doctor profile.' }, { status: 500 });
  }
}
