export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AIChatContext {
  userRole: 'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN' | 'HOSPITAL_STAFF';
  contextData?: unknown; // could pass patient timeline, documents, etc.
}
