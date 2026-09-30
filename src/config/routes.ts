import { Role, UserRole } from '../types/auth';

export const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/patient': [Role.PATIENT],
  '/doctor': [Role.DOCTOR],
  '/hospital': [Role.HOSPITAL_ADMIN, Role.HOSPITAL_STAFF],
  '/appointments': [Role.PATIENT, Role.DOCTOR, Role.HOSPITAL_STAFF, Role.HOSPITAL_ADMIN],
};

export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/about',
  '/contact'
];
