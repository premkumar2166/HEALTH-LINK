import { describe, it, expect } from 'vitest';
import { evaluateMeasurementAlerts } from '../src/lib/clinical/alertRules';

describe('Clinical Alert Engine', () => {
  it('evaluates normal vitals as NORMAL clinical status', () => {
    const res = evaluateMeasurementAlerts({
      bloodPressure: { systolic: 118, diastolic: 76 },
      temperature: { value: 36.6, unit: 'C', convertedC: 36.6 },
      heartRate: 72,
      weight: { value: 74.4, unit: 'kg', convertedKg: 74.4 },
    });

    expect(res.overallStatus).toBe('NORMAL');
    expect(res.alertsToTrigger.length).toBe(0);
  });

  it('triggers URGENT alert for Hypertensive Crisis (>=180/120)', () => {
    const res = evaluateMeasurementAlerts({
      bloodPressure: { systolic: 185, diastolic: 122 },
    });

    expect(res.overallStatus).toBe('URGENT');
    expect(res.alertsToTrigger.length).toBeGreaterThan(0);
    expect(res.alertsToTrigger[0].severity).toBe('URGENT');
    expect(res.alertsToTrigger[0].reason).toContain('Hypertensive crisis threshold reached');
  });

  it('triggers REVIEW alert for Stage 2 Hypertension (145/92)', () => {
    const res = evaluateMeasurementAlerts({
      bloodPressure: { systolic: 145, diastolic: 92 },
    });

    expect(res.overallStatus).toBe('REVIEW');
    expect(res.alertsToTrigger.some((a) => a.severity === 'REVIEW')).toBe(true);
  });

  it('triggers URGENT alert for high fever (>=39.5°C)', () => {
    const res = evaluateMeasurementAlerts({
      temperature: { value: 39.8, unit: 'C', convertedC: 39.8 },
    });

    expect(res.overallStatus).toBe('URGENT');
    expect(res.alertsToTrigger.some((a) => a.reason.includes('High fever'))).toBe(true);
  });

  it('triggers REVIEW alert for low-grade fever (38.2°C)', () => {
    const res = evaluateMeasurementAlerts({
      temperature: { value: 38.2, unit: 'C', convertedC: 38.2 },
    });

    expect(res.overallStatus).toBe('REVIEW');
  });

  it('triggers URGENT alert for marked tachycardia (>130 bpm)', () => {
    const res = evaluateMeasurementAlerts({
      heartRate: 142,
    });

    expect(res.overallStatus).toBe('URGENT');
  });
});
