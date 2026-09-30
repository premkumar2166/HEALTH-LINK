import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { mockInventory, addAuditLog } from '@/lib/hospitalDb';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || (payload.role !== Role.HOSPITAL_ADMIN && payload.role !== Role.HOSPITAL_STAFF)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  
  const item = mockInventory?.find(i => i.id === id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const body = await request.json();

    const previousQuantity = item.quantity;
    item.quantity = body.quantity !== undefined ? body.quantity : item.quantity;
    
    if (body.quantity > previousQuantity) {
      item.lastRestocked = new Date().toISOString();
    }

    addAuditLog(
      payload.id as string, 
      payload.profile.firstName + ' ' + payload.profile.lastName, 
      'UPDATE_INVENTORY', 
      'Inventory', 
      item.id, 
      `Stock adjusted: ${previousQuantity} -> ${item.quantity}`
    );

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
