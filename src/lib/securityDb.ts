export interface SecuritySession {
  id: string;
  userId: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecurityEvent {
  id: string;
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE' | 'DOCUMENT_ACCESSED' | 'RATE_LIMIT_EXCEEDED';
  userId: string | null;
  details: string;
  ip: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const mockSessions: SecuritySession[] = [];

export const mockSecurityEvents: SecurityEvent[] = [];

export const addSecurityEvent = (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
  const newEvent: SecurityEvent = {
    ...event,
    id: `evt_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  mockSecurityEvents.push(newEvent);
};
