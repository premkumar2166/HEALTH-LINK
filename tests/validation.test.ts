import { describe, it, expect } from 'vitest';
import {
  validateWeight,
  validateBloodPressure,
  validateTemperature,
  validateHeartRate,
  TECHNICAL_LIMITS,
} from '../src/lib/clinical/validation';

describe('Clinical Data-Entry Validation Engine', () => {
  describe('Weight Input Boundary (Technical Limit: 635 kg / 1,400 lb)', () => {
    it('accepts valid standard weight within bounds', () => {
      const res = validateWeight(74.5, 'kg');
      expect(res.isValid).toBe(true);
      expect(res.convertedValue.convertedKg).toBe(74.5);
    });

    it('accepts maximum technical limit of 635 kg', () => {
      const res = validateWeight(635, 'kg');
      expect(res.isValid).toBe(true);
      expect(res.convertedValue.convertedKg).toBe(635);
    });

    it('rejects weight above technical limit of 635 kg', () => {
      const res = validateWeight(635.5, 'kg');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('exceeds maximum technical data-entry limit');
    });

    it('accepts weight in pounds up to 1,400 lbs', () => {
      const res = validateWeight(1400, 'lb');
      expect(res.isValid).toBe(true);
    });

    it('rejects weight in pounds above 1,400 lbs', () => {
      const res = validateWeight(1401, 'lb');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('exceeds maximum technical data-entry limit');
    });

    it('shows verification warning for clinically unusual values (>200 kg)', () => {
      const res = validateWeight(210, 'kg');
      expect(res.isValid).toBe(true);
      expect(res.warning).toBeDefined();
      expect(res.warning).toContain('Please verify this value');
    });

    it('rejects negative or zero weight', () => {
      expect(validateWeight(0, 'kg').isValid).toBe(false);
      expect(validateWeight(-10, 'kg').isValid).toBe(false);
    });
  });

  describe('Blood Pressure Boundary (Technical Limit: 370/360 mmHg)', () => {
    it('accepts valid normal blood pressure', () => {
      const res = validateBloodPressure(120, 80);
      expect(res.isValid).toBe(true);
    });

    it('accepts maximum technical upper boundary of 370/360 mmHg', () => {
      const res = validateBloodPressure(370, 360);
      expect(res.isValid).toBe(true);
    });

    it('rejects systolic above 370 mmHg', () => {
      const res = validateBloodPressure(371, 80);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('exceeds maximum technical data-entry limit');
    });

    it('rejects diastolic above 360 mmHg', () => {
      const res = validateBloodPressure(370, 361);
      expect(res.isValid).toBe(false);
    });

    it('rejects systolic <= diastolic', () => {
      const res = validateBloodPressure(120, 120);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Systolic blood pressure must be higher than diastolic');
    });

    it('shows hypertensive crisis warning for values >= 180/120', () => {
      const res = validateBloodPressure(185, 125);
      expect(res.isValid).toBe(true);
      expect(res.warning).toContain('hypertensive crisis');
    });
  });

  describe('Body Temperature Boundary (Technical Limit: 46.5°C / 115.7°F)', () => {
    it('accepts valid resting body temperature', () => {
      const res = validateTemperature(36.6, 'C');
      expect(res.isValid).toBe(true);
    });

    it('accepts maximum technical limit of 46.5°C', () => {
      const res = validateTemperature(46.5, 'C');
      expect(res.isValid).toBe(true);
    });

    it('rejects temperature exceeding 46.5°C', () => {
      const res = validateTemperature(46.6, 'C');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('exceeds maximum technical limit');
    });

    it('accepts temperature in Fahrenheit up to 115.7°F', () => {
      const res = validateTemperature(115.7, 'F');
      expect(res.isValid).toBe(true);
    });

    it('rejects temperature in Fahrenheit exceeding 115.7°F', () => {
      const res = validateTemperature(116.0, 'F');
      expect(res.isValid).toBe(false);
    });
  });

  describe('Heart Rate Boundary (20 - 300 bpm)', () => {
    it('accepts normal resting heart rate', () => {
      const res = validateHeartRate(72);
      expect(res.isValid).toBe(true);
    });

    it('rejects heart rate below 20 or above 300 bpm', () => {
      expect(validateHeartRate(15).isValid).toBe(false);
      expect(validateHeartRate(305).isValid).toBe(false);
    });
  });
});
