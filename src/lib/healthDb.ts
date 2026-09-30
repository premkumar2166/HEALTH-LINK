export interface PatientMeasurement {
  id: string;
  type: 'WEIGHT' | 'BLOOD_PRESSURE' | 'TEMPERATURE';
  value: string;
  date: string;
  patientId: string;
}

export const getPatientMeasurements = (patientId: string): PatientMeasurement[] => {
  return [
    { id: '1', type: 'WEIGHT', value: '75', date: new Date(Date.now() - 86400000 * 5).toISOString(), patientId },
    { id: '2', type: 'WEIGHT', value: '74.5', date: new Date(Date.now() - 86400000 * 2).toISOString(), patientId },
    { id: '3', type: 'BLOOD_PRESSURE', value: '120/80', date: new Date(Date.now() - 86400000 * 3).toISOString(), patientId },
  ];
};
