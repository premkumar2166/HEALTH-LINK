/**
 * Clinical Data Validation Engine
 * 
 * IMPORTANT: Technical boundary limits (e.g. 635 kg, 370/360 mmHg, 46.5°C)
 * are data-entry bounds and MUST NOT be presented or construed as safe medical limits.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  convertedValue?: any;
}

export const TECHNICAL_LIMITS = {
  WEIGHT_MAX_KG: 635, // 1400 lbs technical input maximum
  WEIGHT_MAX_LB: 1400,
  WEIGHT_MIN_KG: 0.5,
  BP_SYSTOLIC_MAX: 370,
  BP_DIASTOLIC_MAX: 360,
  BP_MIN: 20,
  TEMP_MAX_C: 46.5, // 115.7 °F technical input maximum
  TEMP_MAX_F: 115.7,
  TEMP_MIN_C: 25.0,
  TEMP_MIN_F: 77.0,
  HR_MIN: 20,
  HR_MAX: 300,
};

/**
 * Validate weight input
 */
export function validateWeight(value: number, unit: 'kg' | 'lb' = 'kg'): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: 'Weight must be a valid number.' };
  }

  if (value <= 0) {
    return { isValid: false, error: 'Weight must be greater than zero.' };
  }

  if (unit === 'lb' && value > TECHNICAL_LIMITS.WEIGHT_MAX_LB) {
    return {
      isValid: false,
      error: `Weight exceeds maximum technical data-entry limit (${TECHNICAL_LIMITS.WEIGHT_MAX_LB} lb / ${TECHNICAL_LIMITS.WEIGHT_MAX_KG} kg). Please verify the measurement.`,
    };
  }

  const convertedKg = unit === 'lb' ? value * 0.45359237 : value;

  if (unit === 'kg' && convertedKg > TECHNICAL_LIMITS.WEIGHT_MAX_KG) {
    return {
      isValid: false,
      error: `Weight exceeds maximum technical data-entry limit (${TECHNICAL_LIMITS.WEIGHT_MAX_KG} kg / ${TECHNICAL_LIMITS.WEIGHT_MAX_LB} lb). Please verify the measurement.`,
    };
  }

  let warning: string | undefined;
  if (convertedKg > 200) {
    warning = 'Please verify this value. If this measurement is correct, discuss it with your healthcare professional.';
  } else if (convertedKg < 30) {
    warning = 'This is a low weight measurement for an adult. Please verify accuracy.';
  }

  return {
    isValid: true,
    warning,
    convertedValue: {
      value: Math.round(value * 10) / 10,
      unit,
      convertedKg: Math.round(convertedKg * 10) / 10,
    },
  };
}

/**
 * Validate blood pressure input
 */
export function validateBloodPressure(systolic: number, diastolic: number): ValidationResult {
  if (typeof systolic !== 'number' || isNaN(systolic) || typeof diastolic !== 'number' || isNaN(diastolic)) {
    return { isValid: false, error: 'Systolic and Diastolic values must be valid numbers.' };
  }

  if (systolic <= 0 || diastolic <= 0) {
    return { isValid: false, error: 'Blood pressure values must be positive numbers.' };
  }

  if (systolic > TECHNICAL_LIMITS.BP_SYSTOLIC_MAX || diastolic > TECHNICAL_LIMITS.BP_DIASTOLIC_MAX) {
    return {
      isValid: false,
      error: `Blood pressure exceeds maximum technical data-entry limit (${TECHNICAL_LIMITS.BP_SYSTOLIC_MAX}/${TECHNICAL_LIMITS.BP_DIASTOLIC_MAX} mmHg). Note: this technical ceiling is not a safe range.`,
    };
  }

  if (systolic <= diastolic) {
    return {
      isValid: false,
      error: 'Systolic blood pressure must be higher than diastolic blood pressure.',
    };
  }

  let warning: string | undefined;
  if (systolic >= 180 || diastolic >= 120) {
    warning = 'CRITICAL: This measurement is in the hypertensive crisis range. Seek immediate medical evaluation if accompanied by chest pain, headache, or shortness of breath.';
  } else if (systolic < 90 || diastolic < 60) {
    warning = 'This measurement indicates low blood pressure (hypotension). Consult your healthcare provider if experiencing dizziness or weakness.';
  }

  return {
    isValid: true,
    warning,
    convertedValue: {
      systolic: Math.round(systolic),
      diastolic: Math.round(diastolic),
    },
  };
}

/**
 * Validate body temperature input
 */
export function validateTemperature(value: number, unit: 'C' | 'F' = 'C'): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: 'Temperature must be a valid number.' };
  }

  if (unit === 'F' && value > TECHNICAL_LIMITS.TEMP_MAX_F) {
    return {
      isValid: false,
      error: `Temperature exceeds maximum technical limit (${TECHNICAL_LIMITS.TEMP_MAX_F}°F / ${TECHNICAL_LIMITS.TEMP_MAX_C}°C). Note: 46.5°C is a technical ceiling, not a medically safe upper bound.`,
    };
  }

  if (unit === 'F' && value < TECHNICAL_LIMITS.TEMP_MIN_F) {
    return {
      isValid: false,
      error: `Temperature is below minimum technical recording limit (${TECHNICAL_LIMITS.TEMP_MIN_F}°F).`,
    };
  }

  const convertedC = unit === 'F' ? (value - 32) * (5 / 9) : value;

  if (unit === 'C' && convertedC > TECHNICAL_LIMITS.TEMP_MAX_C) {
    return {
      isValid: false,
      error: `Temperature exceeds maximum technical limit (${TECHNICAL_LIMITS.TEMP_MAX_C}°C / ${TECHNICAL_LIMITS.TEMP_MAX_F}°F). Note: 46.5°C is a technical ceiling, not a medically safe upper bound.`,
    };
  }

  if (unit === 'C' && convertedC < TECHNICAL_LIMITS.TEMP_MIN_C) {
    return {
      isValid: false,
      error: `Temperature is below minimum technical recording limit (${TECHNICAL_LIMITS.TEMP_MIN_C}°C / ${TECHNICAL_LIMITS.TEMP_MIN_F}°F).`,
    };
  }

  let warning: string | undefined;
  if (convertedC >= 39.5) {
    warning = 'High fever detected. If accompanied by severe symptoms or confusion, seek prompt medical care.';
  } else if (convertedC < 35.0) {
    warning = 'Hypothermia range detected. Seek medical attention if experiencing uncontrollable shivering or confusion.';
  }

  return {
    isValid: true,
    warning,
    convertedValue: {
      value: Math.round(value * 10) / 10,
      unit,
      convertedC: Math.round(convertedC * 10) / 10,
    },
  };
}

/**
 * Validate heart rate input
 */
export function validateHeartRate(value: number): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: 'Heart rate must be a valid integer.' };
  }

  if (value < TECHNICAL_LIMITS.HR_MIN || value > TECHNICAL_LIMITS.HR_MAX) {
    return {
      isValid: false,
      error: `Heart rate must be between ${TECHNICAL_LIMITS.HR_MIN} and ${TECHNICAL_LIMITS.HR_MAX} bpm.`,
    };
  }

  let warning: string | undefined;
  if (value > 120) {
    warning = 'Elevated heart rate (tachycardia) detected. Monitor for symptoms like palpitations or dizziness.';
  } else if (value < 50) {
    warning = 'Low heart rate (bradycardia) detected. Normal for well-trained athletes, otherwise discuss with your doctor if fatigued.';
  }

  return {
    isValid: true,
    warning,
    convertedValue: Math.round(value),
  };
}
