import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession } from '@/lib/security/auth';
import { sanitizeString } from '@/lib/security/sanitization';
import { eventBus } from '@/lib/realtime/eventBus';

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
      return NextResponse.json({ error: 'Patient ID and Doctor ID are required.' }, { status: 400 });
    }

    const messages = db.getMessages(patientId, doctorId);

    // Mark unread messages as read for receiver
    db.markMessagesAsRead(patientId, session.userId);

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve messages.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const text = sanitizeString(body.text || '');
    if (!text) {
      return NextResponse.json({ error: 'Message text cannot be empty.' }, { status: 400 });
    }

    let receiverId = body.receiverId;
    let patientId = '';
    let doctorId = '';

    if (session.role === 'patient') {
      const patient = db.getPatientById(session.userId);
      if (!patient) return NextResponse.json({ error: 'Patient profile not found.' }, { status: 404 });
      receiverId = patient.doctorId;
      patientId = patient.id;
      doctorId = patient.doctorId;
    } else {
      patientId = body.patientId || receiverId;
      doctorId = session.userId;
      receiverId = patientId;
    }

    const newMsg = db.addMessage({
      senderId: session.userId,
      senderName: session.name,
      senderRole: session.role === 'doctor' ? 'doctor' : 'patient',
      receiverId,
      text,
      mediaUrl: body.mediaUrl,
      mediaType: body.mediaType,
    });

    // Log audit
    db.addAuditLog({
      userId: session.userId,
      userName: session.name,
      userRole: session.role,
      action: 'SEND_MESSAGE',
      resource: `CHAT_${newMsg.id}`,
      details: `Message sent to ${receiverId}`,
    });

    // Real-time broadcast
    eventBus.broadcast({
      type: 'NEW_MESSAGE',
      patientId,
      doctorId,
      data: newMsg,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: newMsg });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
