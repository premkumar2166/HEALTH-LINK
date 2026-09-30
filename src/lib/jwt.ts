import { SignJWT, jwtVerify } from 'jose';

// Secret key should be at least 32 characters
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. This is a critical security risk in production.');
}
const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
const key = new TextEncoder().encode(secretKey);

import { Role } from '@/types/auth';

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: Role;
  profile: {
    firstName?: string;
    lastName?: string;
    specialty?: string;
    name?: string;
    [key: string]: string | undefined;
  };
  [key: string]: unknown;
}

export async function encrypt(payload: AuthTokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as AuthTokenPayload;
  } catch (error) {
    console.error('JWT decryption error:', error);
    return null;
  }
}
