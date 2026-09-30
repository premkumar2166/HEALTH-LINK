import { randomUUID } from 'crypto';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000/api';
let cookie = '';

const authFetch = async (url, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...options.headers,
    ...(cookie ? { 'cookie': cookie } : {})
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    cookie = setCookie.split(';')[0];
  }
  
  let data = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  
  return { status: res.status, data };
};

const assert = (condition, flow, step, details) => {
  if (!condition) {
    console.error(`❌ [${flow}] ${step} FAILED: ${details}`);
    return false;
  }
  console.log(`✅ [${flow}] ${step} SUCCESS`);
  return true;
};

async function runTests() {
  const failures = [];
  
  const recordFailure = (flow, step, error) => {
    failures.push({ flow, step, error });
  };
  
  try {
    console.log('--- STARTING E2E USER JOURNEY TESTS ---');
    
    // 1. DOCTOR FLOW (First so we can use their ID)
    const doctorEmail = `doctor_${Date.now()}@test.com`;
    console.log(`\nTesting DOCTOR FLOW for ${doctorEmail}`);
    
    let res = await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: doctorEmail, password: 'password123', role: 'DOCTOR', profile: { firstName: 'Doc', lastName: 'Test', specialty: 'General' } })
    });
    const doctorId = res.data?.user?.id;
    
    res = await authFetch('/auth/logout', { method: 'POST' });
    cookie = '';

    // 2. PATIENT FLOW
    const patientEmail = `patient_${Date.now()}@test.com`;
    console.log(`\nTesting PATIENT FLOW for ${patientEmail}`);
    
    res = await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: patientEmail, password: 'password123', role: 'PATIENT', profile: { firstName: 'Test', lastName: 'Patient' } })
    });
    if (!assert(res.status === 201, 'PATIENT', 'Register', JSON.stringify(res.data))) recordFailure('PATIENT', 'Register', res.data);
    const patientId = res.data?.user?.id;
    
    res = await authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: patientEmail, password: 'password123' })
    });
    if (!assert(res.status === 200, 'PATIENT', 'Login', JSON.stringify(res.data))) recordFailure('PATIENT', 'Login', res.data);
    
    res = await authFetch('/analytics/patient');
    if (!assert(res.status === 200, 'PATIENT', 'Patient Dashboard', JSON.stringify(res.data))) recordFailure('PATIENT', 'Patient Dashboard', res.data);
    
    res = await authFetch('/doctor/connect', { method: 'POST', body: JSON.stringify({ doctorId }) });
    if (!assert(res.status === 200 || res.status === 201, 'PATIENT', 'Connect with Doctor', JSON.stringify(res.data))) recordFailure('PATIENT', 'Connect with Doctor', res.data);

    res = await authFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify({ doctorId, dateTime: new Date(Date.now() + 86400000).toISOString(), durationMinutes: 30, reason: 'Checkup' })
    });
    if (!assert(res.status === 201 || res.status === 200, 'PATIENT', 'Book Appointment', JSON.stringify(res.data))) recordFailure('PATIENT', 'Book Appointment', res.data);
    const appointmentId = res.data?.appointment?.id || 'mock-id';

    res = await authFetch('/health-data', { method: 'POST', body: JSON.stringify({ type: 'heartRate', value: 80 }) });
    if (!assert(res.status === 201 || res.status === 200, 'PATIENT', 'Add Health Data', JSON.stringify(res.data))) recordFailure('PATIENT', 'Add Health Data', res.data);

    const formData = new FormData();
    formData.append('file', new Blob(['test content'], { type: 'application/pdf' }), 'test.pdf');
    formData.append('documentType', 'Lab Report');
    formData.append('patientId', patientId);
    res = await authFetch('/documents', { method: 'POST', body: formData });
    if (!assert(res.status === 201 || res.status === 200, 'PATIENT', 'Upload Document', JSON.stringify(res.data))) recordFailure('PATIENT', 'Upload Document', res.data);

    res = await authFetch('/messages', { method: 'POST', body: JSON.stringify({ receiverId: doctorId, content: 'Hello doctor' }) });
    if (!assert(res.status === 201 || res.status === 200, 'PATIENT', 'Send Message', JSON.stringify(res.data))) recordFailure('PATIENT', 'Send Message', res.data);

    res = await authFetch('/voice-messages', { method: 'POST', body: JSON.stringify({ receiverId: doctorId, audioUrl: 'http://example.com/audio.mp3' }) });
    if (!assert(res.status === 201 || res.status === 200, 'PATIENT', 'Send Voice Message', JSON.stringify(res.data))) recordFailure('PATIENT', 'Send Voice Message', res.data);
    
    res = await authFetch('/messages'); 
    if (!assert(res.status === 200, 'PATIENT', 'Receive Doctor Response', JSON.stringify(res.data))) recordFailure('PATIENT', 'Receive Doctor Response', res.data);
    
    res = await authFetch('/appointments');
    if (!assert(res.status === 200, 'PATIENT', 'View Appointment', JSON.stringify(res.data))) recordFailure('PATIENT', 'View Appointment', res.data);
    
    res = await authFetch('/analytics/patient/trends');
    if (!assert(res.status === 200, 'PATIENT', 'View Health Trends', JSON.stringify(res.data))) recordFailure('PATIENT', 'View Health Trends', res.data);
    
    res = await authFetch('/auth/logout', { method: 'POST' });
    cookie = '';
    assert(res.status === 200, 'PATIENT', 'Logout', JSON.stringify(res.data));


    // DOCTOR FLOW (Login)
    console.log(`\nContinuing DOCTOR FLOW for ${doctorEmail}`);
    res = await authFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email: doctorEmail, password: 'password123' }) });
    
    res = await authFetch('/analytics/doctor');
    if (!assert(res.status === 200, 'DOCTOR', 'Doctor Dashboard', JSON.stringify(res.data))) recordFailure('DOCTOR', 'Doctor Dashboard', res.data);
    
    res = await authFetch(`/doctor/patients/${patientId}`);
    if (!assert(res.status === 200, 'DOCTOR', 'View Authorized Patient', JSON.stringify(res.data))) recordFailure('DOCTOR', 'View Authorized Patient', res.data);
    
    res = await authFetch(`/doctor/patients/${patientId}/timeline`);
    if (!assert(res.status === 200, 'DOCTOR', 'Review Patient Timeline', JSON.stringify(res.data))) recordFailure('DOCTOR', 'Review Patient Timeline', res.data);
    
    res = await authFetch(`/doctor/patients/${patientId}/health-data`);
    if (!assert(res.status === 200, 'DOCTOR', 'Review Health Data', JSON.stringify(res.data))) recordFailure('DOCTOR', 'Review Health Data', res.data);
    
    res = await authFetch(`/documents`);
    if (!assert(res.status === 200, 'DOCTOR', 'View Documents', JSON.stringify(res.data))) recordFailure('DOCTOR', 'View Documents', res.data);
    
    res = await authFetch('/messages', { method: 'POST', body: JSON.stringify({ receiverId: patientId, content: 'Hello patient' }) });
    if (!assert(res.status === 201 || res.status === 200, 'DOCTOR', 'Respond to Patient', JSON.stringify(res.data))) recordFailure('DOCTOR', 'Respond to Patient', res.data);
    
    res = await authFetch(`/appointments/${appointmentId}`, { method: 'PATCH', body: JSON.stringify({ status: 'CONFIRMED' }) });
    if (!assert(res.status === 200, 'DOCTOR', 'Manage Appointment', JSON.stringify(res.data))) recordFailure('DOCTOR', 'Manage Appointment', res.data);
    
    res = await authFetch('/appointments/notes', { method: 'POST', body: JSON.stringify({ appointmentId, notes: 'All good' }) });
    if (!assert(res.status === 200 || res.status === 201, 'DOCTOR', 'Add Notes/Report', JSON.stringify(res.data))) recordFailure('DOCTOR', 'Add Notes/Report', res.data);
    
    res = await authFetch('/auth/logout', { method: 'POST' });
    cookie = '';

    // 3. HOSPITAL FLOW
    const hospitalEmail = `hospital_${Date.now()}@test.com`;
    console.log(`\nTesting HOSPITAL FLOW for ${hospitalEmail}`);
    
    await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: hospitalEmail, password: 'password123', role: 'HOSPITAL_ADMIN', profile: { firstName: 'Admin', lastName: 'Test' } })
    });
    
    res = await authFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email: hospitalEmail, password: 'password123' }) });
    
    res = await authFetch('/analytics/hospital');
    if (!assert(res.status === 200, 'HOSPITAL', 'Hospital Dashboard', JSON.stringify(res.data))) recordFailure('HOSPITAL', 'Hospital Dashboard', res.data);
    
    res = await authFetch('/hospital/patients', { method: 'GET' });
    if (!assert(res.status === 200, 'HOSPITAL', 'Manage Patient', JSON.stringify(res.data))) recordFailure('HOSPITAL', 'Manage Patient', res.data);
    
    res = await authFetch('/hospital/doctors', { method: 'GET' });
    if (!assert(res.status === 200, 'HOSPITAL', 'Manage Doctor', JSON.stringify(res.data))) recordFailure('HOSPITAL', 'Manage Doctor', res.data);
    
    res = await authFetch('/hospital/departments', { method: 'GET' });
    if (!assert(res.status === 200, 'HOSPITAL', 'Manage Department', JSON.stringify(res.data))) recordFailure('HOSPITAL', 'Manage Department', res.data);
    
    res = await authFetch('/hospital/appointments', { method: 'GET' });
    if (!assert(res.status === 200, 'HOSPITAL', 'Manage Appointment', JSON.stringify(res.data))) recordFailure('HOSPITAL', 'Manage Appointment', res.data);
    
    res = await authFetch('/hospital/admissions', { method: 'POST', body: JSON.stringify({ patientId, reason: 'Test' }) });
    if (!assert(res.status === 201 || res.status === 200, 'HOSPITAL', 'Manage Admission', JSON.stringify(res.data))) recordFailure('HOSPITAL', 'Manage Admission', res.data);
    
    res = await authFetch('/hospital/beds/assign', { method: 'POST', body: JSON.stringify({ patientId, bedId: 'bed-1' }) });
    if (!assert(res.status === 200 || res.status === 201, 'HOSPITAL', 'Assign Bed', JSON.stringify(res.data))) recordFailure('HOSPITAL', 'Assign Bed', res.data);
    
    res = await authFetch('/hospital/admissions/discharge', { method: 'POST', body: JSON.stringify({ admissionId: 'adm-1' }) });
    if (!assert(res.status === 200 || res.status === 201, 'HOSPITAL', 'Manage Discharge', JSON.stringify(res.data))) recordFailure('HOSPITAL', 'Manage Discharge', res.data);
    
    res = await authFetch('/hospital/inventory');
    if (!assert(res.status === 200, 'HOSPITAL', 'Check Inventory', JSON.stringify(res.data))) recordFailure('HOSPITAL', 'Check Inventory', res.data);
    
    res = await authFetch('/hospital/reports');
    if (!assert(res.status === 200, 'HOSPITAL', 'View Reports', JSON.stringify(res.data))) recordFailure('HOSPITAL', 'View Reports', res.data);
    
    res = await authFetch('/hospital/audit');
    if (!assert(res.status === 200, 'HOSPITAL', 'Review Audit Logs', JSON.stringify(res.data))) recordFailure('HOSPITAL', 'Review Audit Logs', res.data);
    
    await authFetch('/auth/logout', { method: 'POST' });

    console.log('\n--- TEST SUMMARY ---');
    if (failures.length > 0) {
      console.log(`❌ ${failures.length} failures recorded.`);
      fs.writeFileSync('test_failures.json', JSON.stringify(failures, null, 2));
    } else {
      console.log('✅ ALL E2E TESTS COMPLETED SUCCESSFULLY');
      if (fs.existsSync('test_failures.json')) fs.unlinkSync('test_failures.json');
    }
  } catch (error) {
    console.error(error);
  }
}

runTests();
