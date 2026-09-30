import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { mockAppointments } from '@/lib/mockDb';
import { getPatientMeasurements } from '@/lib/healthDb';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || payload.role !== Role.PATIENT) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const patientAppointments = mockAppointments?.filter(a => a.patientId === payload.id) || [];
    const upcoming = patientAppointments.filter(a => a.status === 'CONFIRMED' || a.status === 'REQUESTED').length;
    
    // Process Health Measurements to get real DB data for trends
    const measurements = getPatientMeasurements(payload.id as string);
    const weightTrend = measurements
      .filter(m => m.type === 'WEIGHT')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(m => ({ date: m.date.split('T')[0], value: m.value }));
      
    const bloodPressureTrend = measurements
      .filter(m => m.type === 'BLOOD_PRESSURE')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(m => {
        const [sys, dia] = m.value.toString().split('/').map(Number);
        return { date: m.date.split('T')[0], systolic: sys, diastolic: dia };
      });

    return NextResponse.json({
      metrics: {
        totalMeasurements: measurements.length,
        upcomingAppointments: upcoming,
        latestWeight: weightTrend.length > 0 ? weightTrend[weightTrend.length - 1].value : null,
      },
      trends: {
        weightTrend,
        bloodPressureTrend
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
