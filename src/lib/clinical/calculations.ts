/**
 * Doctor Clinical Calculations Engine
 * 
 * Includes BMI calculation, Mean Arterial Pressure (MAP), Pulse Pressure,
 * and Standard Unit Conversions.
 * 
 * Note: Calculated results are clinical decision-support tools and
 * must not be treated as autonomous diagnoses.
 */

export interface BMICalculationResult {
  input: {
    weightKg: number;
    heightCm: number;
    heightM: number;
  };
  formula: string;
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obese Class I' | 'Obese Class II' | 'Obese Class III';
  clinicalInterpretation: string;
  timestamp: string;
}

export function calculateBMI(weightKg: number, heightCm: number): BMICalculationResult {
  if (!weightKg || weightKg <= 0) {
    throw new Error('Weight must be greater than zero to calculate BMI.');
  }
  if (!heightCm || heightCm <= 30 || heightCm > 280) {
    throw new Error('Height must be between 30 cm and 280 cm.');
  }

  const heightM = heightCm / 100;
  const bmiRaw = weightKg / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;

  let category: BMICalculationResult['category'] = 'Normal weight';
  let clinicalInterpretation = 'BMI is within the standard adult healthy weight range (18.5 - 24.9).';

  if (bmi < 18.5) {
    category = 'Underweight';
    clinicalInterpretation = 'BMI is below 18.5 (underweight). Clinical nutritional assessment may be indicated.';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    clinicalInterpretation = 'BMI is between 25.0 and 29.9 (overweight). Lifestyle and metabolic risk review advised.';
  } else if (bmi >= 30 && bmi < 35) {
    category = 'Obese Class I';
    clinicalInterpretation = 'BMI indicates Class I Obesity (30.0 - 34.9). Increased risk for cardiovascular complications.';
  } else if (bmi >= 35 && bmi < 40) {
    category = 'Obese Class II';
    clinicalInterpretation = 'BMI indicates Class II Obesity (35.0 - 39.9). Clinician-supervised management recommended.';
  } else if (bmi >= 40) {
    category = 'Obese Class III';
    clinicalInterpretation = 'BMI indicates Class III Severe Obesity (≥ 40.0). Comprehensive clinical intervention indicated.';
  }

  return {
    input: {
      weightKg: Math.round(weightKg * 10) / 10,
      heightCm: Math.round(heightCm * 10) / 10,
      heightM: Math.round(heightM * 100) / 100,
    },
    formula: 'BMI = weight(kg) / [height(m)]²',
    bmi,
    category,
    clinicalInterpretation,
    timestamp: new Date().toISOString(),
  };
}

export interface BloodPressureAnalysisResult {
  input: {
    systolic: number;
    diastolic: number;
  };
  map: number; // Mean Arterial Pressure
  mapFormula: string;
  pulsePressure: number;
  pulsePressureFormula: string;
  status: string;
  timestamp: string;
}

export function calculateBPAnalysis(systolic: number, diastolic: number): BloodPressureAnalysisResult {
  if (systolic <= diastolic) {
    throw new Error('Systolic BP must be greater than Diastolic BP.');
  }

  // MAP = DBP + 1/3(SBP - DBP)
  const pulsePressure = systolic - diastolic;
  const map = Math.round((diastolic + pulsePressure / 3) * 10) / 10;

  let status = 'Normal perfusion pressure range (MAP ~70-100 mmHg).';
  if (map < 65) {
    status = 'Low MAP (<65 mmHg) may indicate inadequate organ perfusion.';
  } else if (map > 110) {
    status = 'High MAP (>110 mmHg) indicates increased cardiovascular strain.';
  }

  return {
    input: { systolic, diastolic },
    map,
    mapFormula: 'MAP = DBP + 1/3 (SBP - DBP)',
    pulsePressure,
    pulsePressureFormula: 'Pulse Pressure = SBP - DBP',
    status,
    timestamp: new Date().toISOString(),
  };
}
