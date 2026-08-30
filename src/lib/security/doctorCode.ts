import crypto from 'crypto';

// Characters with unambiguous glyphs (excluding 0, O, 1, I)
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CODE_LENGTH = 6;

/**
 * Generates a unique, high-entropy Doctor Code in format HL-DR-XXXXXX
 * Example: HL-DR-8K4P7X
 */
export function generateDoctorCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let result = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const index = bytes[i] % CODE_ALPHABET.length;
    result += CODE_ALPHABET[index];
  }
  return `HL-DR-${result}`;
}

/**
 * Validates whether a Doctor Code matches the official HEALTHLINK standard format:
 * Format: HL-DR-XXXXXX (or legacy DOC-XXXX)
 */
export function isValidDoctorCodeFormat(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const clean = code.trim().toUpperCase();
  // Support modern HL-DR-XXXXXX and legacy DOC-XXXX format for backwards compatibility
  const modernPattern = /^HL-DR-[2-9A-Z]{6,8}$/;
  const legacyPattern = /^DOC-[0-9A-Z]{4,6}$/;
  return modernPattern.test(clean) || legacyPattern.test(clean);
}

/**
 * Normalizes doctor code (trims, uppercase)
 */
export function normalizeDoctorCode(code: string): string {
  if (!code) return '';
  return code.trim().toUpperCase();
}
