import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { extractAuthSession } from '@/lib/security/auth';
import { sanitizeString } from '@/lib/security/sanitization';
import { eventBus } from '@/lib/realtime/eventBus';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    if (!session || session.role !== 'doctor') {
      return NextResponse.json({ error: 'Clinical authorization required.' }, { status: 403 });
    }

    const alertId = params.id;
    const body = await req.json();
    const status = body.status; // 'ACKNOWLEDGED' | 'RESOLVED'
    const resolutionNotes = sanitizeString(body.resolutionNotes || '');

    if (!status || !['ACKNOWLEDGED', 'RESOLVED'].includes(status)) {
      return NextResponse.json({ error: 'Valid status (ACKNOWLEDGED or RESOLVED) required.' }, { status: 400 });
    }

    const updated = db.updateAlertStatus(alertId, status, session.name, resolutionNotes);
    if (!updated) {
      return NextResponse.json({ error: 'Alert not found.' }, { status: 404 });
    }

    db.addAuditLog({
      userId: session.userId,
      userName: session.name,
      userRole: 'doctor',
      action: 'UPDATE_ALERT_STATUS',
      resource: `ALERT_${alertId}`,
      details: `Alert marked as ${status}. Notes: ${resolutionNotes || 'None'}`,
    });

    eventBus.broadcast({
      type: 'ALERT_STATUS_CHANGED',
      patientId: updated.patientId,
      doctorId: session.userId,
      data: updated,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, alert: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update alert.' }, { status: 500 });
  }
}
