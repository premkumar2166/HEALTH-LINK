import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { mockInvoices, addAuditLog } from '@/lib/hospitalDb';
import { InvoiceStatus } from '@/types/hospital';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || (payload.role !== Role.HOSPITAL_ADMIN && payload.role !== Role.HOSPITAL_STAFF && payload.role !== Role.PATIENT)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let result = mockInvoices;
  
  if (payload.role === Role.PATIENT) {
    result = mockInvoices?.filter(i => i.patientId === payload.id);
  }

  return NextResponse.json({ invoices: result });
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
    const newInvoice = {
      id: `inv_${Date.now()}`,
      patientId: body.patientId,
      patientName: body.patientName,
      admissionId: body.admissionId,
      date: new Date().toISOString(),
      items: body.items || [],
      totalAmount: body.items.reduce((sum: number, item: { total: number }) => sum + item.total, 0),
      status: InvoiceStatus.PENDING
    };

    mockInvoices?.push(newInvoice);

    addAuditLog(
      payload.id as string, 
      payload.profile.firstName + ' ' + payload.profile.lastName, 
      'CREATE_INVOICE', 
      'Billing', 
      newInvoice.id, 
      `Created invoice for ${body.patientName}`
    );

    return NextResponse.json({ invoice: newInvoice }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
