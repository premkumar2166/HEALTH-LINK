import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  return NextResponse.json({"message":"Data added"}, { status: 201 });
}
