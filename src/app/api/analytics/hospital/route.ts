import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { getUsers } from '@/lib/db';
import { mockAppointments } from '@/lib/mockDb';
import { mockAdmissions, mockRooms, mockInventory, mockBeds } from '@/lib/hospitalDb';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || payload.role !== Role.HOSPITAL_ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const range = searchParams.get('range') || '30d'; // e.g., 7d, 30d, 90d

  try {
    const users = getUsers();
    const patients = users.filter(u => u.role === Role.PATIENT);
    const doctors = users.filter(u => u.role === Role.DOCTOR);
    
    // Total numbers
    const totalPatients = patients.length;
    const totalDoctors = doctors.length;
    
    // Beds and Rooms
    const totalBeds = mockBeds?.length || 0;
    const occupiedBeds = mockBeds?.filter(b => b.status === 'OCCUPIED').length || 0;
    
    const bedUtilization = totalBeds === 0 ? 0 : Math.round((occupiedBeds / totalBeds) * 100);

    // Admissions vs Discharges (simplistic calculation for the demo)
    const activeAdmissions = mockAdmissions?.filter(a => a.status === 'ADMITTED').length || 0;
    const discharged = mockAdmissions?.filter(a => a.status === 'DISCHARGED').length || 0;

    // Appointments
    const totalAppointments = mockAppointments?.length || 0;
    const completedAppointments = mockAppointments?.filter(a => a.status === 'COMPLETED').length || 0;

    // Inventory
    const lowStockItems = mockInventory?.filter(i => i.quantity <= i.lowStockThreshold).length || 0;

    return NextResponse.json({
      metrics: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        completedAppointments,
        bedUtilization,
        activeAdmissions,
        discharged,
        lowStockItems
      },
      trends: {
        // Mock trend data that normally would group by date. 
        // We simulate a time series based on total volume for the UI to draw a chart.
        admissionsOverTime: [
          { date: '2023-10-01', count: 2 },
          { date: '2023-10-02', count: 4 },
          { date: '2023-10-03', count: 3 },
          { date: '2023-10-04', count: activeAdmissions }
        ]
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
