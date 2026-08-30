import jwt from 'jsonwebtoken';
import { AuthSession, UserRole } from '@/types/healthlink';

const JWT_SECRET = process.env.JWT_SECRET || 'healthlink-clinical-super-secret-key-2026';

export function signToken(payload: { userId: string; role: UserRole; name: string; email: string; doctorId?: string; doctorCode?: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email,
      doctorId: decoded.doctorId,
      doctorCode: decoded.doctorCode,
      token,
    };
  } catch (error) {
    return null;
  }
}

export function extractAuthSession(authHeader?: string | null): AuthSession | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

/**
 * Validates that the requesting user has permission to access the patient resource
 */
export function canAccessPatient(session: AuthSession, targetPatientId: string, assignedDoctorId?: string): boolean {
  if (session.role === 'admin') return true;
  if (session.role === 'patient') {
    return session.userId === targetPatientId;
  }
  if (session.role === 'doctor') {
    // If assignedDoctorId is passed, check doctor authorization
    if (assignedDoctorId) {
      return session.userId === assignedDoctorId;
    }
    return true;
  }
  return false;
}
