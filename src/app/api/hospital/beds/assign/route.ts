import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  return NextResponse.json({"message":"Bed assigned"}, { status: 201 });
}
