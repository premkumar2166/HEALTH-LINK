export type UserRole = 'patient' | 'doctor' | 'admin';

export type ClinicalStatus = 'NORMAL' | 'REVIEW' | 'URGENT';

export interface Patient {
  id: string;
  name: string;
  email: string;
  doctorId: string;
  doctorCode: string;
  dateOfBirth?: string;
  gender?: string;
  heightCm?: number;
  profilePhoto?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
  allergies?: string[];
  medicalHistory?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isContactVerified?: boolean;
}


export interface Doctor {
  id: string;
  name: string;
  email: string;
  doctorCode: string;
  specialty: string;
  specialization?: string;
  licenseNumber: string;
  professionalId?: string;
  clinicName: string;
  phone?: string;
  passwordHash?: string;
  verificationStatus: 'VERIFIED' | 'PENDING_VERIFICATION';
  verificationToken?: string;
  mfaEnabled?: boolean;
  isOnline: boolean;
  profilePhoto?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PasswordResetToken {
  id: string;
  email: string;
  doctorCode: string;
  token: string;
  expiresAt: string;
  used: boolean;
}


export interface WeightRecord {
  value: number;
  unit: 'kg' | 'lb';
  convertedKg: number;
}

export interface BloodPressureRecord {
  systolic: number;
  diastolic: number;
  pulse?: number;
}

export interface TemperatureRecord {
  value: number;
  unit: 'C' | 'F';
  convertedC: number;
}

export interface HealthMeasurement {
  id: string;
  patientId: string;
  timestamp: string;
  recordedBy: 'patient' | 'doctor' | 'device';
  notes?: string;
  weight?: WeightRecord;
  bloodPressure?: BloodPressureRecord;
  temperature?: TemperatureRecord;
  heartRate?: number;
  status: ClinicalStatus;
  statusReasons?: string[];
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  measurementId?: string;
  severity: ClinicalStatus;
  reason: string;
  triggerValue: string;
  ruleVersion: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'doctor';
  receiverId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'audio';
}

export interface VoiceMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'doctor';
  receiverId: string;
  audioDataUrl: string; // Base64 audio webm/wav
  durationSeconds: number;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  transcript?: string;
}

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerRole: 'patient' | 'doctor';
  receiverId: string;
  receiverName: string;
  callType: 'voice' | 'video';
  status: 'initiating' | 'ringing' | 'connected' | 'ended' | 'rejected' | 'missed';
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
}

export interface DoctorNote {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  title: string;
  content: string;
  isPrivateToDoctor: boolean; // Must NEVER be shown to patient
  category: 'general' | 'diagnosis' | 'treatment_plan' | 'observation';
  timestamp: string;
  updatedAt?: string;
}

export interface DoctorAssessment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  measurementId?: string;
  summary: string;
  recommendations: string[];
  followUpDate?: string;
  timestamp: string;
}

export interface DoctorAnnotation {
  id: string;
  patientId: string;
  doctorId: string;
  measurementId?: string;
  dateStr: string;
  text: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface AuthSession {
  userId: string;
  name: string;
  role: UserRole;
  email: string;
  doctorId?: string;
  doctorCode?: string;
  token: string;
}

export interface HealthTimelineEvent {
  id: string;
  timestamp: string;
  eventType: 'vital_recorded' | 'message_sent' | 'doctor_reply' | 'voice_message' | 'alert_triggered' | 'assessment_created';
  title: string;
  description: string;
  source: 'patient' | 'doctor' | 'system' | 'ai' | 'device';
  severity?: ClinicalStatus;
  meta?: Record<string, any>;
}
