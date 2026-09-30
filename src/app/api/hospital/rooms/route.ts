import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { mockRooms, mockBeds } from '@/lib/hospitalDb';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || (payload.role !== Role.HOSPITAL_ADMIN && payload.role !== Role.HOSPITAL_STAFF && payload.role !== Role.DOCTOR)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Hydrate rooms with beds
  const roomsWithBeds = mockRooms?.map(room => ({
    ...room,
    beds: mockBeds?.filter(b => b.roomId === room.id) || []
  }));

  return NextResponse.json({ rooms: roomsWithBeds });
}
