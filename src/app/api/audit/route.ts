import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession } from '@/lib/security/auth';

export async function GET(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Clinical / Admin authorization required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;

    const logs = db.getAuditLogs(userId);
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve audit logs.' }, { status: 500 });
  }
}
