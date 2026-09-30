import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { mockDocuments, mockAccessEvents } from '@/lib/documentDb';
import * as fs from 'fs';
import * as path from 'path';
import { addSecurityEvent } from '@/lib/securityDb';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return new NextResponse('Unauthorized', { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || !payload.id) return new NextResponse('Unauthorized', { status: 401 });

  const { id } = await params;
  
  const doc = mockDocuments.find(d => d.id === id);
  if (!doc) {
    return new NextResponse('Document not found', { status: 404 });
  }

  // Authorization check
  if (payload.role === Role.PATIENT && doc.patientId !== payload.id) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // Note: For Doctor, in a real system we'd verify patient assignment. 

  // Audit Logging
  mockAccessEvents.push({
    id: `evt_${Date.now()}`,
    documentId: doc.id,
    accessedBy: payload.id as string,
    accessedByName: `${payload.profile.firstName || ''} ${payload.profile.lastName || ''}`.trim() || 'User',
    role: payload.role as string,
    accessedAt: new Date().toISOString(),
    action: 'VIEW' // Or DOWNLOAD based on query param
  });

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  addSecurityEvent({ type: 'DOCUMENT_ACCESSED', userId: payload.id as string, details: `Document ${doc.id} accessed by ${payload.role}`, ip, severity: 'low' });

  const storagePath = path.join(process.cwd(), 'src', 'private_storage', 'documents', `${doc.id}_${doc.filename}`);
  let fileBuffer: Buffer;
  if (fs.existsSync(storagePath)) {
    fileBuffer = fs.readFileSync(storagePath);
  } else {
    return new NextResponse('File not found on disk', { status: 404 });
  }

  const response = new NextResponse(new Uint8Array(fileBuffer));
  response.headers.set('Content-Type', doc.mimeType);
  
  const action = request.nextUrl.searchParams.get('action');
  if (action === 'download') {
    response.headers.set('Content-Disposition', `attachment; filename="${doc.filename}"`);
  } else {
    response.headers.set('Content-Disposition', 'inline');
  }

  return response;
}
