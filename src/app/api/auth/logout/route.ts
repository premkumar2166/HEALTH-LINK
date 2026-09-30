import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  
  // Clear the cookie
  response.cookies.delete('auth-token');
  
  return response;
}
