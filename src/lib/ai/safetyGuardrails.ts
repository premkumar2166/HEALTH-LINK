/**
 * AI Health Assistant Safety Guardrails & Safety Filter
 * 
 * Complies with strict medical AI safety standards:
 * - Refuses autonomous diagnosis
 * - Refuses prescribing or altering drug dosages
 * - Detects urgent medical red flags and forces immediate emergency escalation
 * - Strictly includes educational disclaimers
 */

export interface AISafetyCheckResult {
  isEmergency: boolean;
  emergencyMessage?: string;
  isSafeForEducationalResponse: boolean;
  prohibitedTopicDetected?: string;
}

const EMERGENCY_PATTERNS = [
  /\b(chest pain|heart attack|crushing chest|radiating to arm|radiating to jaw)\b/i,
  /\b(can'?t breathe|cannot breathe|suffocating|severe shortness of breath|gasping)\b/i,
  /\b(stroke|facial drooping|face droop|slurred speech|sudden weakness|sudden numbness)\b/i,
  /\b(suicid|kill myself|end my life|harm myself)\b/i,
  /\b(severe bleeding|uncontrolled bleeding|coughing blood|vomiting blood)\b/i,
  /\b(poison|swallowed bleach|overdose|drank chemical)\b/i,
  /\b(anaphylaxis|throat closing|lip swelling|severe allergic reaction)\b/i,
  /\b(loss of consciousness|passed out|fainted and not waking)\b/i,
];

const PRESCRIBING_PATTERNS = [
  /\b(prescribe|prescription|write (?:me )?a prescription|give me a prescription|what dose should i take|change my dose|can i stop taking my medication|increase my mg|double my dose)\b/i,
  /\b(what medication should i take for|can you prescribe)\b/i,
];

const DIAGNOSTIC_PATTERNS = [
  /\b(diagnose me|do i have cancer|tell me what disease i have|confirm if i have)\b/i,
];

export function runSafetyFilter(query: string): AISafetyCheckResult {
  // 1. Check for emergency patterns
  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.test(query)) {
      return {
        isEmergency: true,
        isSafeForEducationalResponse: false,
        emergencyMessage: `⚠️ EMERGENCY ADVISORY: Your query mentions symptoms that may indicate an urgent medical emergency. Please contact emergency services (such as 911 or your local emergency number) or go to the nearest emergency room immediately. HealthLink AI is an educational tool and cannot provide emergency medical care.`,
      };
    }
  }

  // 2. Check for medication prescribing / dosage change
  for (const pattern of PRESCRIBING_PATTERNS) {
    if (pattern.test(query)) {
      return {
        isEmergency: false,
        isSafeForEducationalResponse: false,
        prohibitedTopicDetected: 'prescribing_dosage',
      };
    }
  }

  // 3. Check for direct diagnosis demand
  for (const pattern of DIAGNOSTIC_PATTERNS) {
    if (pattern.test(query)) {
      return {
        isEmergency: false,
        isSafeForEducationalResponse: false,
        prohibitedTopicDetected: 'autonomous_diagnosis',
      };
    }
  }

  return {
    isEmergency: false,
    isSafeForEducationalResponse: true,
  };
}

export const AI_SYSTEM_DISCLAIMER = 
  "I am HealthLink's AI Health Assistant. I provide general health education, explain medical terminology, and help you prepare questions for your doctor. I do not replace a qualified healthcare professional, nor do I provide medical diagnoses or prescriptions.";
