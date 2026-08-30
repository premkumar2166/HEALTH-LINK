import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession } from '@/lib/security/auth';
import { sanitizeString } from '@/lib/security/sanitization';

export async function POST(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Clinical authorization required.' }, { status: 403 });
    }

    const body = await req.json();
    const patientId = body.patientId;
    const dateStr = sanitizeString(body.dateStr || 'Trend Point');
    const text = sanitizeString(body.text || '');

    if (!patientId || !text) {
      return NextResponse.json({ error: 'Patient ID and annotation text required.' }, { status: 400 });
    }

    const annotation = db.addAnnotation({
      patientId,
      doctorId: session.userId,
      measurementId: body.measurementId,
      dateStr,
      text,
    });

    db.addAuditLog({
      userId: session.userId,
      userName: session.name,
      userRole: 'doctor',
      action: 'ADD_CHART_ANNOTATION',
      resource: `ANNOTATION_${annotation.id}`,
      details: `Chart annotation added for ${patientId}`,
    });

    return NextResponse.json({ success: true, annotation });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add chart annotation.' }, { status: 500 });
  }
}
