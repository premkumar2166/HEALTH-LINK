/**
 * Clinical Authentication Rate Limiting & Brute-Force Protection
 */

interface RateLimitRecord {
  attempts: number;
  lockedUntil?: number;
  firstAttemptAt: number;
  lastAttemptAt: number;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes window

class RateLimiter {
  private attemptsMap: Map<string, RateLimitRecord> = new Map();

  private getKey(identifier: string, ip?: string): string {
    const cleanId = identifier.trim().toLowerCase();
    const cleanIp = ip ? ip.trim() : 'global';
    return `${cleanId}::${cleanIp}`;
  }

  /**
   * Checks if an attempt is currently blocked
   */
  public checkLimit(identifier: string, ip?: string): { allowed: boolean; remainingSeconds?: number; message?: string } {
    const key = this.getKey(identifier, ip);
    const now = Date.now();
    const record = this.attemptsMap.get(key);

    if (!record) {
      return { allowed: true };
    }

    // Check if currently locked out
    if (record.lockedUntil && record.lockedUntil > now) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return {
        allowed: false,
        remainingSeconds,
        message: 'Too many sign-in attempts. Please try again later.',
      };
    }

    // Reset window if expired
    if (now - record.firstAttemptAt > WINDOW_DURATION_MS) {
      this.attemptsMap.delete(key);
      return { allowed: true };
    }

    return { allowed: true };
  }

  /**
   * Registers a failed authentication attempt
   */
  public recordFailedAttempt(identifier: string, ip?: string): { isLocked: boolean; attemptsLeft: number; remainingSeconds?: number } {
    const key = this.getKey(identifier, ip);
    const now = Date.now();
    let record = this.attemptsMap.get(key);

    if (!record || now - record.firstAttemptAt > WINDOW_DURATION_MS) {
      record = {
        attempts: 1,
        firstAttemptAt: now,
        lastAttemptAt: now,
      };
    } else {
      record.attempts += 1;
      record.lastAttemptAt = now;
    }

    if (record.attempts >= MAX_FAILED_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_DURATION_MS;
      this.attemptsMap.set(key, record);
      return {
        isLocked: true,
        attemptsLeft: 0,
        remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      };
    }

    this.attemptsMap.set(key, record);
    return {
      isLocked: false,
      attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - record.attempts),
    };
  }

  /**
   * Clears attempts on successful login
   */
  public recordSuccessfulAttempt(identifier: string, ip?: string) {
    const key = this.getKey(identifier, ip);
    this.attemptsMap.delete(key);
  }

  /**
   * Reset all (for test suites)
   */
  public resetAll() {
    this.attemptsMap.clear();
  }
}

declare global {
  var __healthlink_rate_limiter: RateLimiter | undefined;
}

export const rateLimiter = globalThis.__healthlink_rate_limiter || new RateLimiter();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__healthlink_rate_limiter = rateLimiter;
}
