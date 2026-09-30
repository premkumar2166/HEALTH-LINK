import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { mockAuditLogs } from '@/lib/hospitalDb';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || (payload.role !== Role.HOSPITAL_ADMIN && payload.role !== Role.HOSPITAL_STAFF)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Pagination
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  const paginatedLogs = mockAuditLogs.slice(offset, offset + limit);

  return NextResponse.json({ 
    logs: paginatedLogs,
    pagination: {
      total: mockAuditLogs.length,
      limit,
      offset
    }
  });
}
