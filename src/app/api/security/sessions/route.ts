import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { mockSessions } from '@/lib/securityDb';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // If Hospital Admin, return all sessions. Otherwise, return only the user's sessions.
  if (payload.role === Role.HOSPITAL_ADMIN) {
    return NextResponse.json({ sessions: mockSessions });
  } else {
    // Generate a mock session for the current user if they don't have one in the mock DB, to make the UI look realistic
    const userSessions = mockSessions.filter(s => s.userId === payload.id);
    if (userSessions.length === 0) {
      userSessions.push({
        id: `sess_${Date.now()}`,
        userId: payload.id as string,
        device: 'Current Browser',
        ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
        location: 'Local Network',
        lastActive: new Date().toISOString(),
        isCurrent: true
      });
    }
    return NextResponse.json({ sessions: userSessions });
  }
}

export async function DELETE(request: NextRequest) {
  // Mock endpoint to revoke a session
  return NextResponse.json({ success: true });
}
