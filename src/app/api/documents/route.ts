import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';
import { DocumentMetadata } from '@/types/document';
import { mockDocuments, mockAccessEvents } from '@/lib/documentDb';
import * as fs from 'fs';
import * as path from 'path';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let result = mockDocuments;

    // Filter based on role
    if (payload.role === Role.PATIENT) {
      result = mockDocuments.filter(d => d.patientId === payload.id);
    } else if (payload.role === Role.DOCTOR) {
      // BOLA Protection: Ensure the doctor is authorized for the patient in query.
      const patientId = request.nextUrl.searchParams.get('patientId');
      if (!patientId) {
         // Force patientId filter for doctors to avoid dumping all patients' data
         return NextResponse.json({ error: 'patientId is required for doctors' }, { status: 400 });
      }
      // For mock, assume doctor has access to this patient if they provided patientId
      // In real life, verify the doctor-patient relation here!
      result = mockDocuments.filter(d => d.patientId === patientId);
    } else {
      // Hospital Admin or Staff - maybe they can see all, or we also filter by patientId
      const patientId = request.nextUrl.searchParams.get('patientId');
      if (patientId) {
        result = mockDocuments.filter(d => d.patientId === patientId);
      }
    }

  return NextResponse.json({ documents: result });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const patientId = formData.get('patientId') as string;

    if (!file || !documentType || !patientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // IDOR Protection: Patient can only upload their own documents
    let targetPatientId = patientId;
    if (payload.role === Role.PATIENT) {
      targetPatientId = payload.id;
    }


    // Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Supported: PDF, JPG, PNG, WEBP' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 });
    }

    // Generate Private Storage Path
    const fileId = `doc_${Date.now()}`;
    const safeFilename = (file.name || 'uploaded_file').replace(/[^a-zA-Z0-9.\-_]/g, '');
    const storagePath = path.join(process.cwd(), 'src', 'private_storage', 'documents', `${fileId}_${safeFilename}`);

    // Write file to disk securely
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(storagePath, buffer);

    const newDoc: DocumentMetadata = {
      id: fileId,
      filename: safeFilename,
      mimeType: file.type,
      sizeBytes: file.size,
      uploadedBy: payload.id as string,
      uploadedByName: `${payload.profile.firstName || ''} ${payload.profile.lastName || ''}`.trim() || 'User',
      uploadedAt: new Date().toISOString(),
      patientId: targetPatientId,
      documentType: documentType as "Other" | "Lab Report" | "Prescription" | "Imaging" | "Clinical Note",
    };

    mockDocuments.push(newDoc);

    // Audit Log
    mockAccessEvents.push({
      id: `evt_${Date.now()}`,
      documentId: fileId,
      accessedBy: payload.id as string,
      accessedByName: newDoc.uploadedByName,
      role: payload.role as string,
      accessedAt: new Date().toISOString(),
      action: 'UPLOAD'
    });

    return NextResponse.json({ success: true, document: newDoc }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error during upload' }, { status: 500 });
  }
}
