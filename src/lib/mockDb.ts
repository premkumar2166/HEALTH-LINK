import { Appointment, AppointmentStatus } from '@/types/appointment';

declare global {
  var __mockAppointments: Appointment[] | undefined;
}

if (!global.__mockAppointments) {
  global.__mockAppointments = [];
}

export const mockAppointments = global.__mockAppointments;
