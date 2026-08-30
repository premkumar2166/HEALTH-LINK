import { describe, it, expect } from 'vitest';
import { calculateBMI, calculateBPAnalysis } from '../src/lib/clinical/calculations';

describe('Clinical Calculations Engine', () => {
  describe('BMI Calculation', () => {
    it('accurately computes normal BMI for 70 kg and 1.75 m', () => {
      const res = calculateBMI(70, 175);
      expect(res.bmi).toBe(22.9);
      expect(res.category).toBe('Normal weight');
      expect(res.formula).toBe('BMI = weight(kg) / [height(m)]²');
    });

    it('accurately computes overweight BMI for 85 kg and 1.75 m', () => {
      const res = calculateBMI(85, 175);
      expect(res.bmi).toBe(27.8);
      expect(res.category).toBe('Overweight');
    });

    it('accurately computes obesity class for 100 kg and 1.70 m', () => {
      const res = calculateBMI(100, 170);
      expect(res.bmi).toBe(34.6);
      expect(res.category).toBe('Obese Class I');
    });
  });

  describe('Mean Arterial Pressure (MAP) & Pulse Pressure', () => {
    it('calculates MAP and pulse pressure correctly for 120/80 mmHg', () => {
      const res = calculateBPAnalysis(120, 80);
      // PP = 120 - 80 = 40
      // MAP = 80 + 40/3 = 93.3
      expect(res.pulsePressure).toBe(40);
      expect(res.map).toBe(93.3);
      expect(res.status).toContain('Normal perfusion');
    });

    it('rejects systolic <= diastolic for BP analysis', () => {
      expect(() => calculateBPAnalysis(80, 120)).toThrow('Systolic BP must be greater than Diastolic BP');
    });
  });
});
