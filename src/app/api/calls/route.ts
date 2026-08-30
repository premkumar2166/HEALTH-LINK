import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession } from '@/lib/security/auth';
import { eventBus } from '@/lib/realtime/eventBus';

export async function GET(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const patientId = session.role === 'patient' ? session.userId : searchParams.get('patientId');
    if (!patientId) return NextResponse.json({ error: 'Patient ID required.' }, { status: 400 });

    const calls = db.getCalls(patientId);
    return NextResponse.json({ calls });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve call history.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json();
    const action = body.action; // 'initiate' | 'answer' | 'end' | 'signal'

    if (action === 'initiate') {
      const receiverId = body.receiverId;
      const receiverName = body.receiverName || 'Recipient';
      const callType = body.callType === 'video' ? 'video' : 'voice';

      const call = db.addCall({
        callerId: session.userId,
        callerName: session.name,
        callerRole: session.role === 'doctor' ? 'doctor' : 'patient',
        receiverId,
        receiverName,
        callType,
        status: 'initiating',
        startedAt: new Date().toISOString(),
      });

      db.addAuditLog({
        userId: session.userId,
        userName: session.name,
        userRole: session.role,
        action: 'INITIATE_CALL',
        resource: `CALL_${call.id}`,
        details: `${callType.toUpperCase()} call initiated to ${receiverName}`,
      });

      eventBus.broadcast({
        type: 'CALL_SIGNAL',
        patientId: session.role === 'patient' ? session.userId : receiverId,
        doctorId: session.role === 'doctor' ? session.userId : receiverId,
        data: { call, action: 'incoming_call' },
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, call });
    }

    if (action === 'end') {
      const callId = body.callId;
      const durationSeconds = body.durationSeconds || 0;

      const call = db.updateCall(callId, {
        status: 'ended',
        endedAt: new Date().toISOString(),
        durationSeconds,
      });

      if (call) {
        db.addAuditLog({
          userId: session.userId,
          userName: session.name,
          userRole: session.role,
          action: 'END_CALL',
          resource: `CALL_${callId}`,
          details: `Call ended. Duration: ${durationSeconds}s`,
        });

        eventBus.broadcast({
          type: 'CALL_SIGNAL',
          patientId: call.callerRole === 'patient' ? call.callerId : call.receiverId,
          doctorId: call.callerRole === 'doctor' ? call.callerId : call.receiverId,
          data: { call, action: 'call_ended' },
          timestamp: new Date().toISOString(),
        });
      }

      return NextResponse.json({ success: true, call });
    }

    return NextResponse.json({ error: 'Unsupported call action.' }, { status: 400 });
  } catch (error) {
    console.error('Call API error:', error);
    return NextResponse.json({ error: 'Failed to process call session.' }, { status: 500 });
  }
}
