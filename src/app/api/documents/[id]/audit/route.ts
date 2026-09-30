import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { mockDocuments, mockAccessEvents } from '@/lib/documentDb';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  const doc = mockDocuments.find(d => d.id === id);
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  // Authorization check
  if (payload.role === Role.PATIENT && doc.patientId !== payload.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const events = mockAccessEvents.filter(e => e.documentId === id);

  return NextResponse.json({ auditTrail: events });
}
