import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { mockAdmissions, mockBeds, addAuditLog } from '@/lib/hospitalDb';
import { AdmissionStatus, BedStatus } from '@/types/hospital';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || (payload.role !== Role.HOSPITAL_ADMIN && payload.role !== Role.HOSPITAL_STAFF && payload.role !== Role.DOCTOR)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ admissions: mockAdmissions });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || (payload.role !== Role.HOSPITAL_ADMIN && payload.role !== Role.HOSPITAL_STAFF)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { patientId, patientName, doctorId, doctorName, department, roomId, bedId } = body;

    const newAdmission = {
      id: `adm_${Date.now()}`,
      patientId,
      patientName,
      doctorId,
      doctorName,
      department,
      roomId,
      bedId,
      admissionDate: new Date().toISOString(),
      status: AdmissionStatus.ADMITTED
    };

    // Update bed status
    const bed = mockBeds?.find(b => b.id === bedId);
    if (bed) bed.status = BedStatus.OCCUPIED;

    mockAdmissions?.push(newAdmission);

    addAuditLog(
      payload.id as string, 
      payload.profile.firstName + ' ' + payload.profile.lastName, 
      'CREATE_ADMISSION', 
      'Admission', 
      newAdmission.id, 
      `Admitted patient ${patientName} to bed ${bedId}`
    );

    return NextResponse.json({ admission: newAdmission }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
