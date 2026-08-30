import { NextRequest, NextResponse } from 'next/server';
import { extractAuthSession } from '@/lib/security/auth';
import { generateResponsibleAIResponse } from '@/lib/ai/healthKnowledge';
import { sanitizeString } from '@/lib/security/sanitization';
import { db } from '@/lib/db/database';

export async function POST(req: NextRequest) {
  try {
    const session = extractAuthSession(req.headers.get('authorization'));
    const body = await req.json();
    const query = sanitizeString(body.query || '');
    const patientName = session?.name || body.patientName || 'Patient';

    if (!query) {
      return NextResponse.json({ error: 'Query text cannot be empty.' }, { status: 400 });
    }

    const aiResult = generateResponsibleAIResponse(query, patientName);

    if (session) {
      db.addAuditLog({
        userId: session.userId,
        userName: session.name,
        userRole: session.role,
        action: 'AI_ASSISTANT_QUERY',
        resource: 'AI_HEALTH_ASSISTANT',
        details: `Emergency: ${aiResult.isEmergency}`,
      });
    }

    return NextResponse.json({
      success: true,
      response: aiResult,
    });
  } catch (error) {
    console.error('Error generating AI response:', error);
    return NextResponse.json({ error: 'Failed to process AI health question.' }, { status: 500 });
  }
}
