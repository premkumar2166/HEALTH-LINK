import { AI_SYSTEM_DISCLAIMER, runSafetyFilter } from './safetyGuardrails';

export interface AIResponse {
  message: string;
  isEmergency: boolean;
  suggestedDoctorQuestions?: string[];
  disclaimer: string;
}

export function generateResponsibleAIResponse(query: string, patientName?: string): AIResponse {
  const safety = runSafetyFilter(query);

  if (safety.isEmergency) {
    return {
      message: safety.emergencyMessage || 'Immediate medical attention required.',
      isEmergency: true,
      suggestedDoctorQuestions: [
        'What immediate emergency department should I visit?',
        'Who can contact my assigned doctor on my behalf?',
      ],
      disclaimer: AI_SYSTEM_DISCLAIMER,
    };
  }

  if (safety.prohibitedTopicDetected === 'prescribing_dosage') {
    return {
      message: `I cannot prescribe medications, recommend specific drug brands, or suggest changing medication dosages. \n\nMedication decisions require an authorized physician who reviews your full clinical history, allergies, and contraindications. Please send a direct message to your doctor in the **Chat With Doctor** tab or discuss this in your next clinical consultation.`,
      isEmergency: false,
      suggestedDoctorQuestions: [
        'Is my current medication dosage effective for my health goals?',
        'Are there any side effects I should watch out for with my current prescription?',
        'Can you review my current medication schedule?',
      ],
      disclaimer: AI_SYSTEM_DISCLAIMER,
    };
  }

  if (safety.prohibitedTopicDetected === 'autonomous_diagnosis') {
    return {
      message: `I cannot provide a medical diagnosis. Only a qualified medical professional can diagnose medical conditions through clinical examinations, diagnostic tests, and health evaluations. \n\nI can help you understand the terminology and prepare structured questions for your doctor.`,
      isEmergency: false,
      suggestedDoctorQuestions: [
        'Based on my recent vitals log, are there specific diagnostic tests we should consider?',
        'What symptoms should I monitor and log in HealthLink between visits?',
      ],
      disclaimer: AI_SYSTEM_DISCLAIMER,
    };
  }

  // Educational topic matching
  const lower = query.toLowerCase();

  if (lower.includes('blood pressure') || lower.includes('systolic') || lower.includes('diastolic')) {
    return {
      message: `**Understanding Blood Pressure (BP):**\n\n• **Systolic (Top number):** Measures the pressure in your arteries when your heart beats and pumps blood.\n• **Diastolic (Bottom number):** Measures the pressure in your arteries when your heart rests between beats.\n\n**Standard Reference Ranges (AHA Guidelines):**\n- **Normal:** Systolic < 120 mmHg AND Diastolic < 80 mmHg\n- **Elevated:** Systolic 120–129 mmHg AND Diastolic < 80 mmHg\n- **Stage 1 Hypertension:** Systolic 130–139 mmHg OR Diastolic 80–89 mmHg\n- **Stage 2 Hypertension:** Systolic ≥ 140 mmHg OR Diastolic ≥ 90 mmHg\n\n*Tip for accurate measurement:* Rest quietly for 5 minutes before measuring, keep feet flat on the floor, and position the arm at heart level.`,
      isEmergency: false,
      suggestedDoctorQuestions: [
        'What is my personal target blood pressure range?',
        'How frequently should I log my blood pressure readings in the portal?',
        'Should I take my readings before or after taking morning medication?',
      ],
      disclaimer: AI_SYSTEM_DISCLAIMER,
    };
  }

  if (lower.includes('temperature') || lower.includes('fever') || lower.includes('thermometer')) {
    return {
      message: `**Understanding Body Temperature:**\n\n• **Normal Range:** Generally 36.1°C to 37.2°C (97.0°F to 99.0°F).\n• **Low-grade Fever:** Typically 37.6°C to 38.3°C (99.7°F to 101.0°F).\n• **High Fever:** Typically 38.9°C (102.0°F) or above in adults.\n\n*Best Practices:* Avoid measuring immediately after drinking hot/cold liquids or after rigorous exercise. Wait 15–20 minutes for an accurate oral reading.`,
      isEmergency: false,
      suggestedDoctorQuestions: [
        'At what temperature threshold should I notify you immediately?',
        'What fever-reducing strategies do you recommend for my situation?',
      ],
      disclaimer: AI_SYSTEM_DISCLAIMER,
    };
  }

  if (lower.includes('weight') || lower.includes('scale') || lower.includes('bmi')) {
    return {
      message: `**Recording Accurate Weight Trends:**\n\n• For the most reliable trend data, weigh yourself at the same time each day (ideally in the morning after using the restroom and before breakfast).\n• Use the same scale on a flat, hard surface.\n• Daily fluctuations of 0.5–1.5 kg are common due to water retention and sodium intake; consistent multi-day trends provide the most clinical value.`,
      isEmergency: false,
      suggestedDoctorQuestions: [
        'What is my optimal weight management target?',
        'How does my weight trend correlate with my blood pressure or overall care plan?',
      ],
      disclaimer: AI_SYSTEM_DISCLAIMER,
    };
  }

  if (lower.includes('heart rate') || lower.includes('pulse') || lower.includes('bpm')) {
    return {
      message: `**Understanding Heart Rate (Pulse):**\n\n• **Resting Heart Rate:** For most healthy adults, a resting heart rate ranges from 60 to 100 beats per minute (bpm).\n• **Bradycardia (< 60 bpm):** Often normal in well-trained athletes, but can sometimes cause fatigue or dizziness if too low.\n• **Tachycardia (> 100 bpm):** Can occur during stress, caffeine intake, dehydration, fever, or physical activity.\n\nAlways note what you were doing right before taking your heart rate.`,
      isEmergency: false,
      suggestedDoctorQuestions: [
        'Is my resting heart rate trend appropriate for my activity level?',
        'Are there specific symptoms with a fast or slow heart rate I should report?',
      ],
      disclaimer: AI_SYSTEM_DISCLAIMER,
    };
  }

  // Default helpful response
  return {
    message: `Hello ${patientName || 'there'}! I am here to help you navigate HealthLink, explain medical terminology, and understand how to log and track your health vitals.\n\nYou can ask me about:\n• How to interpret your blood pressure, temperature, weight, or heart rate\n• Tips for taking accurate measurements\n• Understanding your interactive health trend charts\n• Preparing questions for your next consultation with your doctor\n\nWhat specific topic would you like to explore today?`,
    isEmergency: false,
    suggestedDoctorQuestions: [
      'Can you review my recent vital logs and health trend?',
      'Are there any adjustments we should make to my health routine?',
    ],
    disclaimer: AI_SYSTEM_DISCLAIMER,
  };
}
