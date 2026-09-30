import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/lib/jwt';
import { comparePasswords } from '@/lib/password';
import { getUserByEmail, getUsers, saveUsers } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityEvent } from '@/lib/securityDb';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip, 10, 60000)) { // 10 attempts per minute
    logger.security('RATE_LIMIT_EXCEEDED', { ip, path: '/api/auth/login' });
    addSecurityEvent({ type: 'RATE_LIMIT_EXCEEDED', userId: null, details: 'Login rate limit exceeded', ip, severity: 'high' });
    return NextResponse.json({ error: 'Too many login attempts' }, { status: 429 });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = getUserByEmail(email);
    
    // Generic error to prevent user enumeration
    if (!user) {
      logger.security('LOGIN_FAILED', { email, ip, reason: 'user_not_found' });
      addSecurityEvent({ type: 'LOGIN_FAILED', userId: null, details: `Failed login attempt for ${email}`, ip, severity: 'medium' });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await comparePasswords(password, user.passwordHash);
    
    if (!isValid) {
      logger.security('LOGIN_FAILED', { email, ip, reason: 'invalid_password' });
      addSecurityEvent({ type: 'LOGIN_FAILED', userId: user.id, details: `Failed login attempt for ${email}`, ip, severity: 'medium' });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.audit.status !== 'ACTIVE') {
       return NextResponse.json({ error: 'Account is not active' }, { status: 403 });
    }

    // Update last login
    user.audit.lastLogin = new Date().toISOString();
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    users[userIndex] = user;
    saveUsers(users);

    logger.info('LOGIN_SUCCESS', { email, ip, role: user.role }, user.id);
    addSecurityEvent({ type: 'LOGIN_SUCCESS', userId: user.id, details: `Successful login for ${email}`, ip, severity: 'low' });

    const { passwordHash, ...safeUser } = user;
    
    // Create JWT
    const token = await encrypt({ 
      id: user.id, 
      role: user.role as import("@/types/auth").Role, 
      email: user.email,
      profile: (user.profile || {}) as unknown as Record<string, string | undefined>
    });

    const response = NextResponse.json({ message: 'Login successful', user: safeUser }, { status: 200 });
    
    // Set HTTP-only cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('API_ERROR_LOGIN', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
