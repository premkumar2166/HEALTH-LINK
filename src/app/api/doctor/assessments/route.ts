import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession } from '@/lib/security/auth';
import { sanitizeString } from '@/lib/security/sanitization';
import { eventBus } from '@/lib/realtime/eventBus';

export async function POST(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Clinical authorization required.' }, { status: 403 });
    }

    const body = await req.json();
    const patientId = body.patientId;
    const summary = sanitizeString(body.summary || '');
    const recommendations = (body.recommendations || []).map((r: string) => sanitizeString(r));
    const followUpDate = body.followUpDate;

    if (!patientId || !summary) {
      return NextResponse.json({ error: 'Patient ID and assessment summary required.' }, { status: 400 });
    }

    const assessment = db.addAssessment({
      patientId,
      doctorId: session.userId,
      doctorName: session.name,
      measurementId: body.measurementId,
      summary,
      recommendations,
      followUpDate,
    });

    db.addAuditLog({
      userId: session.userId,
      userName: session.name,
      userRole: 'doctor',
      action: 'CREATE_ASSESSMENT',
      resource: `ASSESSMENT_${assessment.id}`,
      details: `Clinical assessment submitted for patient ${patientId}`,
    });

    eventBus.broadcast({
      type: 'NEW_MESSAGE',
      patientId,
      doctorId: session.userId,
      data: assessment,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, assessment });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record clinical assessment.' }, { status: 500 });
  }
}
