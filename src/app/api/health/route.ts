import { NextResponse } from 'next/server';

export async function GET() {
  // In a real production scenario, you would ping the database here
  // e.g. await prisma.$queryRaw`SELECT 1`

  return NextResponse.json(
    { 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'healthlink-api'
    }, 
    { status: 200 }
  );
}
