export enum Role {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
  HOSPITAL_STAFF = 'HOSPITAL_STAFF',
}

export type UserRole = keyof typeof Role;

export interface Permission {
  action: string;
  resource: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  specialty?: string; // For doctors
  department?: string; // For staff
  dateOfBirth?: string; // For patients
}

export interface HealthlinkID {
  id: string; // Unique ID
  email: string; // Authentication credential (username)
  passwordHash: string; // Authentication credential (secure)
  role: UserRole;
  profile: UserProfile;
  permissions: Permission[];
  audit: {
    createdAt: string;
    lastLogin: string | null;
    status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  };
}

export interface AuthSession {
  user: Omit<HealthlinkID, 'passwordHash'>;
  token: string;
  expiresAt: string;
}
