import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { mockInventory, addAuditLog } from '@/lib/hospitalDb';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || (payload.role !== Role.HOSPITAL_ADMIN && payload.role !== Role.HOSPITAL_STAFF)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ inventory: mockInventory });
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
    const newItem = {
      id: `item_${Date.now()}`,
      name: body.name,
      category: body.category,
      quantity: body.quantity,
      lowStockThreshold: body.lowStockThreshold,
      supplierInformation: body.supplierInformation,
      lastRestocked: new Date().toISOString()
    };

    mockInventory?.push(newItem);

    addAuditLog(
      payload.id as string, 
      payload.profile.firstName + ' ' + payload.profile.lastName, 
      'CREATE_INVENTORY', 
      'Inventory', 
      newItem.id, 
      `Added new inventory item: ${newItem.name}`
    );

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
