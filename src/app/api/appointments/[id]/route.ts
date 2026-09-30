import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { AppointmentStatus } from '@/types/appointment';
import { mockAppointments } from '@/lib/mockDb';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  const aptIndex = mockAppointments.findIndex(a => a.id === id);
  if (aptIndex === -1) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  const appointment = mockAppointments[aptIndex];

  // Authorization check
  if (payload.role === Role.PATIENT && appointment.patientId !== payload.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (payload.role === Role.DOCTOR && appointment.doctorId !== payload.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { status, newDateTime } = body;

    // State machine & Role rules
    if (status) {
      if (payload.role === Role.PATIENT && status !== AppointmentStatus.CANCELLED) {
        // Patient can only cancel, they must use a different flow to reschedule (or cancel and book new)
        return NextResponse.json({ error: 'Patients can only cancel appointments directly.' }, { status: 403 });
      }

      mockAppointments[aptIndex].status = status;
    }

    if (newDateTime && (payload.role === Role.DOCTOR || payload.role === Role.HOSPITAL_ADMIN || payload.role === Role.HOSPITAL_STAFF)) {
       const requestedTime = new Date(newDateTime);
       if (isNaN(requestedTime.getTime()) || requestedTime.getTime() < Date.now()) {
          return NextResponse.json({ error: 'Invalid or past date' }, { status: 400 });
       }
       mockAppointments[aptIndex].dateTime = requestedTime.toISOString();
       mockAppointments[aptIndex].status = AppointmentStatus.RESCHEDULED;
    }

    mockAppointments[aptIndex].updatedAt = new Date().toISOString();

    return NextResponse.json({ success: true, appointment: mockAppointments[aptIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
