import { NextRequest, NextResponse } from 'next/server';
import { calculateBMI, calculateBPAnalysis } from '@/lib/clinical/calculations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body.type; // 'bmi' | 'bp'

    if (type === 'bmi') {
      const weightKg = parseFloat(body.weightKg);
      const heightCm = parseFloat(body.heightCm);
      const result = calculateBMI(weightKg, heightCm);
      return NextResponse.json({ success: true, result });
    }

    if (type === 'bp') {
      const systolic = parseFloat(body.systolic);
      const diastolic = parseFloat(body.diastolic);
      const result = calculateBPAnalysis(systolic, diastolic);
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: 'Unsupported calculation type. Use "bmi" or "bp".' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Calculation error.' }, { status: 400 });
  }
}
