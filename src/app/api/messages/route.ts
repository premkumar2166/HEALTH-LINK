import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  return NextResponse.json({"message":"Message sent"}, { status: 201 });
}

export async function GET(req: NextRequest) {
  return NextResponse.json([{"id":"1","content":"Hello"}], { status: 200 });
}
