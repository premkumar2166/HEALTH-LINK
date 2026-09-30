import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { getUserById } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await decrypt(token);

  if (!payload || !payload.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = getUserById(payload.id);

  if (!user || user.audit.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { passwordHash, ...safeUser } = user;

  return NextResponse.json({ user: safeUser }, { status: 200 });
}
