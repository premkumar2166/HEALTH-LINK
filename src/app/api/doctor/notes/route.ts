import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession } from '@/lib/security/auth';
import { sanitizeString } from '@/lib/security/sanitization';

export async function GET(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Clinical authorization required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required.' }, { status: 400 });
    }

    const notes = db.getDoctorNotes(patientId, session.userId);
    return NextResponse.json({ notes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve notes.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Clinical authorization required.' }, { status: 403 });
    }

    const body = await req.json();
    const patientId = body.patientId;
    const title = sanitizeString(body.title || 'Clinical Observation Note');
    const content = sanitizeString(body.content || '');
    const category = body.category || 'observation';

    if (!patientId || !content) {
      return NextResponse.json({ error: 'Patient ID and note content are required.' }, { status: 400 });
    }

    const newNote = db.addDoctorNote({
      patientId,
      doctorId: session.userId,
      doctorName: session.name,
      title,
      content,
      isPrivateToDoctor: true,
      category,
    });

    db.addAuditLog({
      userId: session.userId,
      userName: session.name,
      userRole: 'doctor',
      action: 'CREATE_DOCTOR_NOTE',
      resource: `NOTE_${newNote.id}`,
      details: `Private clinical note added for patient ${patientId}`,
    });

    return NextResponse.json({ success: true, note: newNote });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save clinical note.' }, { status: 500 });
  }
}
