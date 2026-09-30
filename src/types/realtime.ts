export type RealtimeEventType = 
  | 'NEW_MESSAGE' 
  | 'MESSAGE_READ' 
  | 'APPOINTMENT_UPDATE' 
  | 'DOCTOR_RESPONSE' 
  | 'VOICE_MESSAGE' 
  | 'DOCUMENT_NOTIFICATION' 
  | 'SYSTEM_NOTIFICATION';

export interface RealtimeEvent {
  id: string;
  type: RealtimeEventType;
  payload: unknown;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: RealtimeEventType;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  relatedResourceId?: string;
}
