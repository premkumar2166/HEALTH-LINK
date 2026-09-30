import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || payload.role !== Role.HOSPITAL_ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const logs = global.__mockSystemLogs || [];
  
  // Aggregate some metrics
  const errorCount = logs.filter(l => l.level === 'ERROR').length;
  const securityCount = logs.filter(l => l.level === 'SECURITY').length;
  const authFails = logs.filter(l => l.event === 'LOGIN_FAILED').length;

  return NextResponse.json({
    metrics: {
      totalLogs: logs.length,
      errorCount,
      securityCount,
      authFails,
      uptime: process.uptime()
    },
    logs: logs.slice(0, 50) // Return 50 most recent logs
  });
}
