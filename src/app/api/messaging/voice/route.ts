import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession } from '@/lib/security/auth';
import { eventBus } from '@/lib/realtime/eventBus';
import { sanitizeString } from '@/lib/security/sanitization';

export async function GET(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = session.role === 'patient' ? session.userId : searchParams.get('patientId');
    const doctorId = session.role === 'doctor' ? session.userId : (session.doctorId || searchParams.get('doctorId'));

    if (!patientId || !doctorId) {
      return NextResponse.json({ error: 'Patient ID and Doctor ID required.' }, { status: 400 });
    }

    const voiceMessages = db.getVoiceMessages(patientId, doctorId);
    return NextResponse.json({ voiceMessages });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve voice messages.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const audioDataUrl = body.audioDataUrl || '';
    const durationSeconds = Math.max(1, Math.round(body.durationSeconds || 5));
    const transcript = sanitizeString(body.transcript || '');

    let receiverId = body.receiverId;
    let patientId = '';
    let doctorId = '';

    if (session.role === 'patient') {
      const patient = db.getPatientById(session.userId);
      if (!patient) return NextResponse.json({ error: 'Patient not found.' }, { status: 404 });
      receiverId = patient.doctorId;
      patientId = patient.id;
      doctorId = patient.doctorId;
    } else {
      patientId = body.patientId || receiverId;
      doctorId = session.userId;
      receiverId = patientId;
    }

    const newVM = db.addVoiceMessage({
      senderId: session.userId,
      senderName: session.name,
      senderRole: session.role === 'doctor' ? 'doctor' : 'patient',
      receiverId,
      audioDataUrl,
      durationSeconds,
      transcript: transcript || 'Audio voice note',
    });

    db.addAuditLog({
      userId: session.userId,
      userName: session.name,
      userRole: session.role,
      action: 'SEND_VOICE_MESSAGE',
      resource: `VOICE_${newVM.id}`,
      details: `Voice note duration ${durationSeconds}s`,
    });

    eventBus.broadcast({
      type: 'NEW_VOICE_MESSAGE',
      patientId,
      doctorId,
      data: newVM,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, voiceMessage: newVM });
  } catch (error) {
    console.error('Error saving voice message:', error);
    return NextResponse.json({ error: 'Failed to upload voice message.' }, { status: 500 });
  }
}
