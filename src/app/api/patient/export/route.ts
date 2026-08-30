import { NextRequest, NextResponse } from 'next/server';
import { extractAuthSession } from '@/lib/security/auth';
import { db } from '@/lib/db/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const session = extractAuthSession(authHeader);

    const patientId = session?.role === 'patient' ? session.userId : 'pat-1';

    const patient = db.getPatientById(patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const doctor = db.getDoctorById(patient.doctorId);
    const measurements = db.getMeasurements(patient.id);
    const timeline = db.getPatientTimeline(patient.id);
    const messages = db.getMessages(patient.id, patient.doctorId);
    const assessments = db.getAssessments(patient.id);

    // Record audit log
    db.addAuditLog({
      userId: patient.id,
      userName: patient.name,
      userRole: 'patient',
      action: 'DATA_EXPORT',
      resource: 'FULL_HEALTH_RECORD',
      details: 'Patient generated and downloaded full personal health record export',
    });

    const exportBundle = {
      exportMetadata: {
        application: 'HEALTHLINK Dual-Portal Healthcare Platform',
        exportDate: new Date().toISOString(),
        formatVersion: 'HIPAA-PHR-v1.0',
        confidentialityNotice: 'This document contains protected health information (PHI). Keep secure.',
      },
      patientDemographics: {
        id: patient.id,
        patientIdFormatted: `HL-PATIENT-${patient.id.replace('pat-', '').padStart(4, '0')}`,
        name: patient.name,
        email: patient.email,
        phoneNumber: patient.phoneNumber || 'Not provided',
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        preferredLanguage: patient.preferredLanguage || 'English (US)',
        allergies: patient.allergies || [],
        medicalHistory: patient.medicalHistory || [],
        emergencyContact: patient.emergencyContact,
        createdAt: patient.createdAt,
      },
      assignedPhysician: doctor
        ? {
            name: doctor.name,
            specialty: doctor.specialty,
            clinicName: doctor.clinicName,
            licenseNumber: doctor.licenseNumber,
          }
        : null,
      healthMeasurements: measurements,
      clinicalAssessments: assessments,
      communicationHistory: {
        chatMessagesCount: messages.length,
        messages: messages.map((m) => ({
          sender: m.senderName,
          role: m.senderRole,
          timestamp: m.timestamp,
          text: m.text,
        })),
      },
      timelineEvents: timeline,
    };

    return new NextResponse(JSON.stringify(exportBundle, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="healthlink_patient_${patient.id}_export.json"`,
      },
    });
  } catch (error) {
    console.error('Error generating patient data export:', error);
    return NextResponse.json({ error: 'Failed to generate export.' }, { status: 500 });
  }
}
