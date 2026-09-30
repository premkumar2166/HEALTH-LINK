import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { mockAppointments } from '@/lib/mockDb';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let result = mockAppointments;

  // Filter based on role
  if (payload.role === Role.PATIENT) {
    result = mockAppointments.filter(a => a.patientId === payload.id);
  } else if (payload.role === Role.DOCTOR) {
    result = mockAppointments.filter(a => a.doctorId === payload.id);
  } else if (payload.role !== Role.HOSPITAL_ADMIN && payload.role !== Role.HOSPITAL_STAFF) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ appointments: result });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { doctorId, doctorName, dateTime, reason } = body;

    if (!doctorId || !dateTime || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Authorization Check: If Doctor is booking, ensure patient belongs to them
    if (payload.role === Role.DOCTOR) {
      const authorizedPatients = ['p1', 'p2', 'p3']; // local mock
      if (!authorizedPatients.includes(body.patientId)) {
        return NextResponse.json({ error: 'Forbidden: Patient not authorized' }, { status: 403 });
      }
    }

    // Timezone-aware date parsing
    const requestedTime = new Date(dateTime);
    if (isNaN(requestedTime.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Check if date is in the past
    if (requestedTime.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Cannot book appointments in the past' }, { status: 400 });
    }

    // Check for double booking (30 minute slots)
    const requestedEnd = new Date(requestedTime.getTime() + 30 * 60000);
    
    const isDoubleBooked = mockAppointments.some(apt => {
      if (apt.doctorId !== doctorId && apt.patientId !== payload.id) return false;
      if (apt.status === AppointmentStatus.CANCELLED) return false;

      const existingStart = new Date(apt.dateTime);
      const existingEnd = new Date(existingStart.getTime() + apt.durationMinutes * 60000);

      // Overlap condition
      return requestedTime < existingEnd && requestedEnd > existingStart;
    });

    if (isDoubleBooked) {
      return NextResponse.json({ error: 'Time slot is already booked or conflicts with existing appointment.' }, { status: 409 });
    }

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      patientId: payload.role === Role.PATIENT ? payload.id as string : body.patientId, // Allow hospital/staff to book for patient
      patientName: payload.role === Role.PATIENT ? `${payload.profile.firstName} ${payload.profile.lastName}` : body.patientName,
      doctorId,
      doctorName,
      dateTime: requestedTime.toISOString(),
      durationMinutes: 30,
      status: AppointmentStatus.REQUESTED,
      reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockAppointments.push(newAppointment);

    return NextResponse.json({ success: true, appointment: newAppointment }, { status: 201 });
  } catch (error) {
    logger.error('DB_FAILURE_APPOINTMENTS', error, payload.id);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
