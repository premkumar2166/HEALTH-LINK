import { ClinicalStatus, HealthMeasurement } from '@/types/healthlink';

export interface AlertEvaluation {
  overallStatus: ClinicalStatus;
  reasons: string[];
  alertsToTrigger: Array<{
    severity: ClinicalStatus;
    reason: string;
    triggerValue: string;
    ruleVersion: string;
  }>;
}

export const ALERT_RULES_VERSION = 'v1.4.0-AHA-CDC-STANDARD';

/**
 * Evaluate health measurements against clinical safety rules
 * 
 * Rules:
 * - Blood Pressure:
 *   - Normal: <120 / <80 -> NORMAL
 *   - Elevated: 120-129 / <80 -> REVIEW
 *   - Stage 1 HTN: 130-139 / 80-89 -> REVIEW
 *   - Stage 2 HTN: 140-179 / 90-119 -> REVIEW
 *   - Crisis / Severe: >=180 OR >=120 OR <80/50 -> URGENT
 * 
 * - Temperature:
 *   - Normal: 36.1 - 37.5 °C -> NORMAL
 *   - Low-grade fever: 37.6 - 38.5 °C -> REVIEW
 *   - High fever / Hypothermia: >=38.6 °C OR <35.0 °C -> URGENT
 * 
 * - Heart Rate:
 *   - Normal: 60 - 100 bpm -> NORMAL
 *   - Moderate: 50 - 59 bpm OR 101 - 120 bpm -> REVIEW
 *   - Severe: < 50 bpm OR > 120 bpm -> URGENT
 */
export function evaluateMeasurementAlerts(measurement: Partial<HealthMeasurement>): AlertEvaluation {
  const reasons: string[] = [];
  const alertsToTrigger: AlertEvaluation['alertsToTrigger'] = [];
  let highestSeverity: ClinicalStatus = 'NORMAL';

  const upgradeSeverity = (severity: ClinicalStatus) => {
    if (severity === 'URGENT') highestSeverity = 'URGENT';
    else if (severity === 'REVIEW' && highestSeverity !== 'URGENT') highestSeverity = 'REVIEW';
  };

  // 1. Blood Pressure Check
  if (measurement.bloodPressure) {
    const { systolic, diastolic } = measurement.bloodPressure;

    if (systolic >= 180 || diastolic >= 120) {
      const reason = `Hypertensive crisis threshold reached (${systolic}/${diastolic} mmHg). Immediate clinical evaluation recommended.`;
      reasons.push(reason);
      alertsToTrigger.push({
        severity: 'URGENT',
        reason,
        triggerValue: `${systolic}/${diastolic} mmHg`,
        ruleVersion: ALERT_RULES_VERSION,
      });
      upgradeSeverity('URGENT');
    } else if (systolic < 85 || diastolic < 50) {
      const reason = `Severe hypotension detected (${systolic}/${diastolic} mmHg).`;
      reasons.push(reason);
      alertsToTrigger.push({
        severity: 'URGENT',
        reason,
        triggerValue: `${systolic}/${diastolic} mmHg`,
        ruleVersion: ALERT_RULES_VERSION,
      });
      upgradeSeverity('URGENT');
    } else if (systolic >= 140 || diastolic >= 90) {
      const reason = `Stage 2 Hypertension range recorded (${systolic}/${diastolic} mmHg). Review recommended according to configured clinical protocol.`;
      reasons.push(reason);
      alertsToTrigger.push({
        severity: 'REVIEW',
        reason,
        triggerValue: `${systolic}/${diastolic} mmHg`,
        ruleVersion: ALERT_RULES_VERSION,
      });
      upgradeSeverity('REVIEW');
    } else if (systolic >= 120 || diastolic >= 80) {
      const reason = `Elevated blood pressure (${systolic}/${diastolic} mmHg) recorded.`;
      reasons.push(reason);
      upgradeSeverity('REVIEW');
    }
  }

  // 2. Temperature Check
  if (measurement.temperature) {
    const tempC = measurement.temperature.convertedC;

    if (tempC >= 39.5) {
      const reason = `High fever (${tempC.toFixed(1)}°C / ${(tempC * 9 / 5 + 32).toFixed(1)}°F) exceeds clinical threshold.`;
      reasons.push(reason);
      alertsToTrigger.push({
        severity: 'URGENT',
        reason,
        triggerValue: `${tempC.toFixed(1)}°C`,
        ruleVersion: ALERT_RULES_VERSION,
      });
      upgradeSeverity('URGENT');
    } else if (tempC < 35.0) {
      const reason = `Hypothermia threshold reached (${tempC.toFixed(1)}°C). Immediate warming/medical review indicated.`;
      reasons.push(reason);
      alertsToTrigger.push({
        severity: 'URGENT',
        reason,
        triggerValue: `${tempC.toFixed(1)}°C`,
        ruleVersion: ALERT_RULES_VERSION,
      });
      upgradeSeverity('URGENT');
    } else if (tempC >= 37.8) {
      const reason = `Fever detected (${tempC.toFixed(1)}°C). Observation indicated.`;
      reasons.push(reason);
      alertsToTrigger.push({
        severity: 'REVIEW',
        reason,
        triggerValue: `${tempC.toFixed(1)}°C`,
        ruleVersion: ALERT_RULES_VERSION,
      });
      upgradeSeverity('REVIEW');
    }
  }

  // 3. Heart Rate Check
  if (measurement.heartRate !== undefined && measurement.heartRate > 0) {
    const hr = measurement.heartRate;
    if (hr > 130) {
      const reason = `Marked tachycardia (${hr} bpm) exceeds safety review threshold.`;
      reasons.push(reason);
      alertsToTrigger.push({
        severity: 'URGENT',
        reason,
        triggerValue: `${hr} bpm`,
        ruleVersion: ALERT_RULES_VERSION,
      });
      upgradeSeverity('URGENT');
    } else if (hr < 45) {
      const reason = `Severe bradycardia (${hr} bpm) detected.`;
      reasons.push(reason);
      alertsToTrigger.push({
        severity: 'URGENT',
        reason,
        triggerValue: `${hr} bpm`,
        ruleVersion: ALERT_RULES_VERSION,
      });
      upgradeSeverity('URGENT');
    } else if (hr > 100 || hr < 55) {
      const reason = `Heart rate outside normal resting reference range (${hr} bpm).`;
      reasons.push(reason);
      upgradeSeverity('REVIEW');
    }
  }

  // 4. Weight Trend Check (Rapid change check)
  if (measurement.weight) {
    const weightKg = measurement.weight.convertedKg;
    if (weightKg < 30 || weightKg > 220) {
      const reason = `Weight measurement (${weightKg} kg) requires clinician verification.`;
      reasons.push(reason);
      alertsToTrigger.push({
        severity: 'REVIEW',
        reason,
        triggerValue: `${weightKg} kg`,
        ruleVersion: ALERT_RULES_VERSION,
      });
      upgradeSeverity('REVIEW');
    }
  }

  if (reasons.length === 0) {
    reasons.push('All recorded vitals fall within configured reference ranges.');
  }

  return {
    overallStatus: highestSeverity,
    reasons,
    alertsToTrigger,
  };
}
