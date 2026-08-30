import { EventEmitter } from 'events';

export type RealTimeEventType =
  | 'NEW_MEASUREMENT'
  | 'NEW_MESSAGE'
  | 'NEW_VOICE_MESSAGE'
  | 'NEW_ALERT'
  | 'ALERT_STATUS_CHANGED'
  | 'CALL_SIGNAL'
  | 'TYPING_INDICATOR';

export interface RealTimeEventPayload {
  type: RealTimeEventType;
  patientId: string;
  doctorId?: string;
  data: any;
  timestamp: string;
}

class HealthLinkEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }

  broadcast(event: RealTimeEventPayload) {
    this.emit('healthlink_event', event);
  }
}

declare global {
  var __healthlink_event_bus: HealthLinkEventBus | undefined;
}

export const eventBus = globalThis.__healthlink_event_bus || new HealthLinkEventBus();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__healthlink_event_bus = eventBus;
}
