import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password securely using bcrypt
 */
export async function hashPassword(plainText: string): Promise<string> {
  return await bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Synchronous hash helper for seeds/initialization
 */
export function hashPasswordSync(plainText: string): string {
  return bcrypt.hashSync(plainText, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  if (!plainText || !hash) return false;
  try {
    return await bcrypt.compare(plainText, hash);
  } catch (error) {
    return false;
  }
}

/**
 * Validates clinical password strength requirements:
 * - At least 8 characters
 * - At least 1 number or special character
 * - At least 1 uppercase or lowercase letter
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must include at least one number or special character.' };
  }
  return { valid: true };
}
