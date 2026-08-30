'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { PatientNav } from '@/components/patient/PatientNav';
import { PatientAuthGuard } from '@/components/patient/PatientAuthGuard';
import { HealthTrendChart } from '@/components/patient/HealthTrendChart';
import { HealthMeasurement, DoctorAnnotation } from '@/types/healthlink';
import { LineChart, Info, ShieldCheck, Heart } from 'lucide-react';

export default function PatientTrendsPage() {
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
  const [annotations, setAnnotations] = useState<DoctorAnnotation[]>([]);
  const [patientName, setPatientName] = useState('John Doe');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Miller, MD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionStr = localStorage.getItem('healthlink_session');
    if (sessionStr) {
      try {
        const sess = JSON.parse(sessionStr);
        setPatientName(sess.name || 'John Doe');
        setDoctorName(sess.doctorName || 'Dr. Sarah Miller, MD');
      } catch (e) {}
    }

    async function loadTrends() {
      try {
        const token = localStorage.getItem('healthlink_token');
        const res = await fetch('/api/health/measurements', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMeasurements(data.measurements || []);
          setAnnotations(data.annotations || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadTrends();
  }, []);

  return (
    <PatientAuthGuard>
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-24 md:pb-12 text-[#171717]">
        <Header
          portalType="patient"
          userName={patientName}
          assignedDoctorName={doctorName}
          isOnline={true}
        />
        <PatientNav userName={patientName} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBEE] border border-red-200 text-[#D32F2F] text-xs font-black uppercase tracking-wider mb-2">
                <Heart size={13} className="fill-[#D32F2F] text-[#D32F2F]" />
                <span>Longitudinal Health Records</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <LineChart size={28} className="text-[#D32F2F]" />
                <span>Health Trend Analysis</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Day-to-day progression of your logged physiological vitals with clinician review annotations.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200 shadow-xs self-start sm:self-auto">
              <ShieldCheck size={16} />
              <span>Isolated Patient Telemetry</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-red-100 flex items-start gap-3 text-xs text-gray-600 shadow-xs leading-relaxed">
            <Info size={18} className="text-[#D32F2F] flex-shrink-0 mt-0.5" />
            <p>
              This chart visualizes real measurements stored securely in your health record. Use the metric (Blood Pressure, Weight, Temperature, Heart Rate) and timeframe buttons (7 Days, 30 Days, 90 Days, All) above the canvas to zoom in on specific clinical trends.
            </p>
          </div>

          <HealthTrendChart
            measurements={measurements}
            annotations={annotations}
            title="Health Trend"
          />
        </main>
      </div>
    </PatientAuthGuard>
  );
}
