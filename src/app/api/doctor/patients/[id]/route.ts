import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { Role } from '@/types/auth';

// Simulated database table relating doctors to patients
const doctorPatientRelations = {
  'doc_123': ['p1', 'p2', 'p3'], // Dr. Smith's patients
  'doc_999': ['p4', 'p5'], // Another doctor's patients
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: requestedPatientId } = await params;
    const cookieStore = cookies();
    const token = (await cookieStore).get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await decrypt(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (payload.role !== Role.DOCTOR) {
      return NextResponse.json({ error: 'Forbidden: Requires Doctor role' }, { status: 403 });
    }

    const doctorId = payload.sub as string;

    // Server-Side Authorization: Check if this doctor is authorized for this patient
    // For demonstration, let's assume the current doctor is 'doc_123' if not explicitly defined
    // In a real app, this would be a DB query like: SELECT 1 FROM authorizations WHERE doctor_id = ? AND patient_id = ?
    const authorizedPatients = doctorPatientRelations[doctorId as keyof typeof doctorPatientRelations] || ['p1', 'p2', 'p3'];

    if (!authorizedPatients.includes(requestedPatientId)) {
      return NextResponse.json({ 
        error: 'Forbidden: You are not authorized to view this patient\'s records.' 
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: 'Access granted.',
      patientId: requestedPatientId
    });

  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
