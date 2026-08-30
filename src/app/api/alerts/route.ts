import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession } from '@/lib/security/auth';

export async function GET(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Clinical authorization required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;

    const alerts = db.getAlerts(session.userId, status);
    return NextResponse.json({ alerts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve alerts.' }, { status: 500 });
  }
}
