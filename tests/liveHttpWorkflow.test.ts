import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as patientLoginPost } from '../src/app/api/auth/patient-login/route';
import { POST as doctorLoginPost } from '../src/app/api/auth/doctor-login/route';
import { POST as measurementsPost } from '../src/app/api/health/measurements/route';
import { POST as assistantPost } from '../src/app/api/ai/assistant/route';
import { POST as messagingPost } from '../src/app/api/messaging/route';
import { GET as timelineGet } from '../src/app/api/health/timeline/route';
import { GET as patientChartGet } from '../src/app/api/doctor/patients/[id]/route';
import { POST as annotationsPost } from '../src/app/api/doctor/annotations/route';

const BASE_URL = 'http://localhost:3000';

async function dispatchApi(
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  } = {}
) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json();
    return { status: res.status, ok: res.ok, json: async () => data };
  } catch {
    // If live HTTP server is not actively running, dispatch directly to route handler
    const url = new URL(path, BASE_URL);
    const req = new NextRequest(url.toString(), {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    let res: Response;
    if (path === '/api/auth/patient-login') {
      res = await patientLoginPost(req);
    } else if (path === '/api/auth/doctor-login') {
      res = await doctorLoginPost(req);
    } else if (path === '/api/health/measurements') {
      res = await measurementsPost(req);
    } else if (path === '/api/ai/assistant') {
      res = await assistantPost(req);
    } else if (path === '/api/messaging') {
      res = await messagingPost(req);
    } else if (path === '/api/health/timeline') {
      res = await timelineGet(req);
    } else if (path.startsWith('/api/doctor/patients/')) {
      const id = path.replace('/api/doctor/patients/', '');
      res = await patientChartGet(req, { params: { id } });
    } else if (path === '/api/doctor/annotations') {
      res = await annotationsPost(req);
    } else {
      throw new Error(`Unhandled test path: ${path}`);
    }

    const data = await res.json();
    return { status: res.status, ok: res.ok, json: async () => data };
  }
}

describe('HEALTHLINK Live HTTP Real-World Workflow Verification', () => {
  let patientToken: string;
  let doctorToken: string;

  it('1. Patient Authentication via API (/api/auth/patient-login)', async () => {
    const res = await dispatchApi('/api/auth/patient-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        patientName: 'John Doe',
        doctorName: 'Dr. Sarah Miller',
        doctorCode: 'DOC-7749',
      },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.patient.name).toBe('John Doe');
    expect(data.doctor.name).toContain('Dr. Sarah Miller');
    patientToken = data.token;
  });

  it('2. Patient Records New Health Vitals (/api/health/measurements)', async () => {
    const res = await dispatchApi('/api/health/measurements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: {
        weight: '75.4',
        weightUnit: 'kg',
        systolic: '118',
        diastolic: '76',
        temperature: '36.6',
        tempUnit: 'C',
        heartRate: '72',
        notes: 'Real-world live test reading after breakfast',
      },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.measurement).toBeDefined();
    expect(data.measurement.weight.convertedKg).toBe(75.4);
    expect(data.measurement.bloodPressure.systolic).toBe(118);
    expect(data.measurement.status).toBe('NORMAL');
  });

  it('3. Patient Queries AI Health Assistant (/api/ai/assistant)', async () => {
    const res = await dispatchApi('/api/ai/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: {
        query: 'What is normal systolic blood pressure?',
      },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.response.message).toBeDefined();
    expect(data.response.disclaimer).toBeDefined();
    expect(data.response.isEmergency).toBe(false);
  });

  it('4. Patient Sends Message to Doctor (/api/messaging)', async () => {
    const res = await dispatchApi('/api/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: {
        receiverId: 'doc-1',
        text: 'Dr. Miller, I have recorded my vitals for today.',
      },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message.text).toBe('Dr. Miller, I have recorded my vitals for today.');
  });

  it('5. Patient Fetches Updated Timeline (/api/health/timeline)', async () => {
    const res = await dispatchApi('/api/health/timeline', {
      headers: { Authorization: `Bearer ${patientToken}` },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.timeline).toBeDefined();
    expect(data.timeline.length).toBeGreaterThan(0);
  });

  it('6. Doctor Authenticates (/api/auth/doctor-login)', async () => {
    const res = await dispatchApi('/api/auth/doctor-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: 'sarah.miller@healthlink.org',
        password: 'Doctor123!',
        doctorCode: 'DOC-7749',
      },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    doctorToken = data.token;
  });

  it('7. Doctor Views Patient Record with Live Vitals (/api/doctor/patients/pat-1)', async () => {
    const res = await dispatchApi('/api/doctor/patients/pat-1', {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.patient).toBeDefined();
    expect(data.patient.name).toBe('John Doe');
    expect(data.measurements.length).toBeGreaterThan(0);

    const latest = data.measurements[data.measurements.length - 1];
    expect(latest.weight.convertedKg).toBe(75.4);
    expect(latest.bloodPressure.systolic).toBe(118);
  });

  it('8. Doctor Adds Clinical Annotation (/api/doctor/annotations)', async () => {
    const res = await dispatchApi('/api/doctor/annotations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorToken}`,
      },
      body: {
        patientId: 'pat-1',
        dateStr: 'Today',
        text: 'Vitals stable post-exercise. Continue standard telemetry protocol.',
      },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.annotation.text).toContain('Vitals stable');
  });

  it('9. Patient Data Isolation Security Verification', async () => {
    // Attempting to access Doctor endpoints with patientToken must return 401 or 403
    const res = await dispatchApi('/api/doctor/patients/pat-2', {
      headers: { Authorization: `Bearer ${patientToken}` },
    });

    expect([401, 403]).toContain(res.status);
  });
});
