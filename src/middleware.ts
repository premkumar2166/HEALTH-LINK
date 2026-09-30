import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from './config/routes';
import { decrypt } from './lib/jwt';

const getRequiredRolesForRoute = (pathname: string) => {
  for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
};

const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const now = Date.now();
  
  // Basic Rate Limiting
  let rateData = rateLimitMap.get(ip);
  if (!rateData || now > rateData.resetTime) {
    rateData = { count: 1, resetTime: now + 60000 }; // 60s window
  } else {
    rateData.count++;
  }
  rateLimitMap.set(ip, rateData);

  if (rateData.count > 100) { // Limit: 100 req / min
    return new NextResponse('Too Many Requests', { status: 429, headers: { 'Retry-After': '60' } });
  }

  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('.')
  ) {
    const res = NextResponse.next();
    res.headers.set('X-RateLimit-Limit', '100');
    res.headers.set('X-RateLimit-Remaining', (100 - rateData.count).toString());
    return res;
  }

  const token = request.cookies.get('auth-token')?.value;
  let payload = null;
  if (token) {
    payload = await decrypt(token);
  }

  // --- API ROUTE PROTECTION ---
  if (pathname.startsWith('/api/')) {
    const publicApis = ['/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/health'];
    if (publicApis.includes(pathname)) {
      return NextResponse.next();
    }
    
    // Protect ALL other API routes. They require valid authentication.
    if (!payload || !payload.role) {
      return NextResponse.json({ error: 'Unauthorized: Valid token required' }, { status: 401 });
    }
    
    // RBAC could be applied here for broad namespaces like /api/hospital/* -> requires HOSPITAL_ADMIN
    if (pathname.startsWith('/api/hospital/') && !['HOSPITAL_ADMIN', 'HOSPITAL_STAFF'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden: Hospital role required' }, { status: 403 });
    }
    if (pathname.startsWith('/api/doctor/') && payload.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Forbidden: Doctor role required' }, { status: 403 });
    }
    
    const res = NextResponse.next();
    return res;
  }

  // --- PAGE ROUTE PROTECTION ---
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const requiredRoles = getRequiredRolesForRoute(pathname);

  if (requiredRoles) {
    if (!token || !payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      const res = NextResponse.redirect(loginUrl);
      if (token) res.cookies.delete('auth-token');
      return res;
    }

    if (!payload.role || !requiredRoles.includes(payload.role)) {
      return new NextResponse('Forbidden: You do not have permission to access this resource.', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
