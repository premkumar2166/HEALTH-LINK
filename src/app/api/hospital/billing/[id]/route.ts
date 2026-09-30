import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { mockInvoices, addAuditLog } from '@/lib/hospitalDb';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || (payload.role !== Role.HOSPITAL_ADMIN && payload.role !== Role.HOSPITAL_STAFF && payload.role !== Role.PATIENT)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  
  const inv = mockInvoices?.find(i => i.id === id);
  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const body = await request.json();

    // Patient can only simulate mock payment
    if (payload.role === Role.PATIENT) {
      if (inv.patientId !== payload.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      
      inv.status = body.status;
      inv.paymentReference = body.paymentReference;
      
      addAuditLog(
        payload.id as string, 
        payload.profile.firstName + ' ' + payload.profile.lastName, 
        'PAY_INVOICE', 
        'Billing', 
        inv.id, 
        `Mock payment completed for invoice ${inv.id}`
      );
    } else {
      // Admin/Staff can update anything
      inv.status = body.status;
      if (body.paymentReference) inv.paymentReference = body.paymentReference;

      addAuditLog(
        payload.id as string, 
        payload.profile.firstName + ' ' + payload.profile.lastName, 
        'UPDATE_INVOICE', 
        'Billing', 
        inv.id, 
        `Updated invoice status to ${inv.status}`
      );
    }

    return NextResponse.json({ invoice: inv });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
