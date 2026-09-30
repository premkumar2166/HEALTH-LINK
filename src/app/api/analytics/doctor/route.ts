import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { mockAppointments } from '@/lib/mockDb';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || payload.role !== Role.DOCTOR) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const doctorAppointments = mockAppointments?.filter(a => a.doctorId === payload.id) || [];
    
    const upcoming = doctorAppointments.filter(a => a.status === 'CONFIRMED' || a.status === 'REQUESTED').length;
    const completed = doctorAppointments.filter(a => a.status === 'COMPLETED').length;
    const cancelled = doctorAppointments.filter(a => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length;

    // Simulate workload trend
    const workloadTrend = [
      { day: 'Mon', patients: 12 },
      { day: 'Tue', patients: 15 },
      { day: 'Wed', patients: 10 },
      { day: 'Thu', patients: upcoming > 0 ? upcoming : 14 },
      { day: 'Fri', patients: 0 }
    ];

    return NextResponse.json({
      metrics: {
        totalAppointments: doctorAppointments.length,
        upcomingAppointments: upcoming,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
      },
      trends: {
        workloadTrend
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
