export enum Role {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
  HOSPITAL_STAFF = 'HOSPITAL_STAFF',
}

export type UserRole = keyof typeof Role;

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}
