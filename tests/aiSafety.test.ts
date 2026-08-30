import { describe, it, expect } from 'vitest';
import { runSafetyFilter } from '../src/lib/ai/safetyGuardrails';
import { generateResponsibleAIResponse } from '../src/lib/ai/healthKnowledge';

describe('AI Health Assistant Safety & Ethical Boundaries', () => {
  describe('Emergency Red-Flag Detection', () => {
    it('detects acute chest pain as emergency', () => {
      const res = runSafetyFilter('I have crushing chest pain radiating to my left arm');
      expect(res.isEmergency).toBe(true);
      expect(res.isSafeForEducationalResponse).toBe(false);
      expect(res.emergencyMessage).toContain('EMERGENCY ADVISORY');
    });

    it('detects severe shortness of breath as emergency', () => {
      const res = runSafetyFilter("I can't breathe and feeling suffocating");
      expect(res.isEmergency).toBe(true);
    });

    it('detects stroke symptoms as emergency', () => {
      const res = runSafetyFilter('My face is drooping on one side and sudden numbness in arm');
      expect(res.isEmergency).toBe(true);
    });
  });

  describe('Refusal of Autonomous Diagnosis & Prescribing', () => {
    it('refuses medication prescription requests', () => {
      const res = runSafetyFilter('Can you prescribe me medication for my infection?');
      expect(res.isEmergency).toBe(false);
      expect(res.prohibitedTopicDetected).toBe('prescribing_dosage');
    });

    it('refuses dosage modification queries', () => {
      const res = runSafetyFilter('Should I double my dose of lisinopril?');
      expect(res.prohibitedTopicDetected).toBe('prescribing_dosage');
    });

    it('refuses direct diagnosis demands', () => {
      const res = runSafetyFilter('Diagnose me based on my symptoms');
      expect(res.prohibitedTopicDetected).toBe('autonomous_diagnosis');
    });
  });

  describe('Educational Guidance & Doctor Question Preparation', () => {
    it('provides responsible educational explanation for blood pressure', () => {
      const res = generateResponsibleAIResponse('What does systolic and diastolic blood pressure mean?');
      expect(res.isEmergency).toBe(false);
      expect(res.message).toContain('Systolic');
      expect(res.message).toContain('Diastolic');
      expect(res.suggestedDoctorQuestions).toBeDefined();
      expect(res.suggestedDoctorQuestions!.length).toBeGreaterThan(0);
      expect(res.disclaimer).toContain('not replace a qualified healthcare professional');
    });
  });
});
