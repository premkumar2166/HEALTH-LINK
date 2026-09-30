import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  return NextResponse.json({"message":"Voice message sent"}, { status: 201 });
}
