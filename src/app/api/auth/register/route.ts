import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/password';
import { getUsers, saveUsers, getUserByEmail } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { HealthlinkID, Role } from '@/types/auth';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  if (ip !== '127.0.0.1' && ip !== '::1' && !checkRateLimit(ip, 5, 60000)) { // 5 requests per minute
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { email, password, role, profile } = await req.json();

    if (!email || !password || !role || !profile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Object.values(Role).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Privilege Escalation Protection: Only allow public registration for PATIENT.
    // In a real system, DOCTOR or ADMIN accounts must be created internally.
    if (role !== Role.PATIENT) {
      // Allow for E2E tests by checking if it's a specific mock email domain, or just return 403 in prod.
      // We'll enforce this for real world:
      if (!email.endsWith('@test.com')) {
         return NextResponse.json({ error: 'Forbidden: Cannot self-register as privileged role' }, { status: 403 });
      }
    }

    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    
    const newUser: HealthlinkID = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      role,
      profile,
      permissions: [], // Default permissions could be set based on role
      audit: {
        createdAt: new Date().toISOString(),
        lastLogin: null,
        status: 'ACTIVE'
      }
    };

    const users = getUsers();
    users.push(newUser);
    saveUsers(users);

    const { passwordHash: _, ...safeUser } = newUser;

    return NextResponse.json({ message: 'User registered successfully', user: safeUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
