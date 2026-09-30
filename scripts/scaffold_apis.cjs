const fs = require('fs');
const path = require('path');

const apiDir = path.join(process.cwd(), 'src', 'app', 'api');

const routes = [
  { path: 'doctor/connect', method: 'POST', response: { message: 'Connected' } },
  { path: 'health-data', method: 'POST', response: { message: 'Data added' } },
  { path: 'messages', method: 'POST', response: { message: 'Message sent' } },
  { path: 'messages', method: 'GET', response: [{ id: '1', content: 'Hello' }] },
  { path: 'voice-messages', method: 'POST', response: { message: 'Voice message sent' } },
  { path: 'analytics/patient/trends', method: 'GET', response: { trends: [] } },
  { path: 'doctor/patients/[id]', method: 'GET', response: { patient: { id: 'mock', name: 'Mock' } } },
  { path: 'doctor/patients/[id]/timeline', method: 'GET', response: { timeline: [] } },
  { path: 'doctor/patients/[id]/health-data', method: 'GET', response: { data: [] } },
  { path: 'appointments/notes', method: 'POST', response: { message: 'Notes added' } },
  { path: 'hospital/patients', method: 'GET', response: [] },
  { path: 'hospital/doctors', method: 'GET', response: [] },
  { path: 'hospital/departments', method: 'GET', response: [] },
  { path: 'hospital/appointments', method: 'GET', response: [] },
  { path: 'hospital/admissions', method: 'POST', response: { message: 'Admitted' } },
  { path: 'hospital/admissions/discharge', method: 'POST', response: { message: 'Discharged' } },
  { path: 'hospital/beds/assign', method: 'POST', response: { message: 'Bed assigned' } },
  { path: 'hospital/reports', method: 'GET', response: { reports: [] } },
];

for (const route of routes) {
  const dirPath = path.join(apiDir, route.path);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, 'route.ts');
  let content = '';

  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf-8');
  } else {
    content = `import { NextRequest, NextResponse } from 'next/server';\n\n`;
  }

  // Check if method is already exported
  if (!content.includes(`export async function ${route.method}`)) {
    content += `
export async function ${route.method}(req: NextRequest) {
  return NextResponse.json(${JSON.stringify(route.response)}, { status: ${route.method === 'POST' ? 201 : 200} });
}
`;
    fs.writeFileSync(filePath, content);
    console.log(`Created ${route.method} for ${route.path}`);
  }
}
