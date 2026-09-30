import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { mockAdmissions, mockBeds, addAuditLog } from '@/lib/hospitalDb';
import { AdmissionStatus, BedStatus } from '@/types/hospital';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || (payload.role !== Role.HOSPITAL_ADMIN && payload.role !== Role.HOSPITAL_STAFF && payload.role !== Role.DOCTOR)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  
  const adm = mockAdmissions?.find(a => a.id === id);
  if (!adm) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const body = await request.json();
    
    if (body.status === AdmissionStatus.DISCHARGED) {
      adm.status = AdmissionStatus.DISCHARGED;
      adm.dischargeDate = new Date().toISOString();
      adm.dischargeSummary = body.summary;
      
      // Free the bed
      const bed = mockBeds?.find(b => b.id === adm.bedId);
      if (bed) bed.status = BedStatus.AVAILABLE;

      addAuditLog(
        payload.id as string, 
        payload.profile.firstName + ' ' + payload.profile.lastName, 
        'DISCHARGE_PATIENT', 
        'Admission', 
        adm.id, 
        `Discharged patient ${adm.patientName}`
      );
    } else {
      adm.status = body.status;
    }

    return NextResponse.json({ admission: adm });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
