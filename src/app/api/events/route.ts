import { NextRequest } from 'next/server';
import { eventBus, RealTimeEventPayload } from '@/lib/realtime/eventBus';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');
  const doctorId = searchParams.get('doctorId');

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: new Date().toISOString() })}\n\n`)
      );

      const listener = (event: RealTimeEventPayload) => {
        // Filter relevant events for the subscriber
        const isMatch =
          (!patientId || event.patientId === patientId) &&
          (!doctorId || !event.doctorId || event.doctorId === doctorId);

        if (isMatch) {
          try {
            controller.enqueue(encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`));
          } catch (e) {
            // Stream closed
          }
        }
      };

      eventBus.on('healthlink_event', listener);

      // Heartbeat interval every 25 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch (e) {
          clearInterval(heartbeat);
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        eventBus.off('healthlink_event', listener);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
