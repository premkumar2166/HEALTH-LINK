import { randomUUID } from 'crypto';

const BASE_URL = 'http://localhost:3000/api';

const authFetch = async (url, options = {}, asCookie) => {
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(asCookie ? { 'cookie': asCookie } : {})
  };
  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  let data = null;
  if (res.headers.get('content-type')?.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, data, setCookie: res.headers.get('set-cookie') };
};

async function createActor(role) {
  const email = `${role.toLowerCase()}_${Date.now()}@test.com`;
  const res = await authFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password: 'password123', role, profile: { firstName: 'Test', lastName: role } })
  }, null);
  
  if (res.status !== 201) throw new Error(`Failed to register ${role}`);
  const loginRes = await authFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: 'password123' })
  }, null);
  return { id: loginRes.data.user.id, cookie: loginRes.setCookie.split(';')[0] };
}

async function run() {
  const doctor = await createActor('DOCTOR');
  // Doctor tries to book for an arbitrary patient
  const targetPatientId = 'patient_i_do_not_own';
  const res = await authFetch('/appointments', {
    method: 'POST',
    body: JSON.stringify({ doctorId: doctor.id, patientId: targetPatientId, patientName: 'Stolen Patient', dateTime: new Date(Date.now() + 86400000).toISOString(), reason: 'BOLA test' })
  }, doctor.cookie);
  
  if (res.status === 201) {
    console.log('❌ VULNERABILITY CONFIRMED: Doctor booked appointment for unauthorized patient.', res.data.appointment.patientId);
  } else {
    console.log('✅ SECURE:', res.status, res.data);
  }
}

run().catch(console.error);
