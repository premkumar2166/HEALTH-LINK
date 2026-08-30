'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { PatientNav } from '@/components/patient/PatientNav';
import { PatientAuthGuard } from '@/components/patient/PatientAuthGuard';
import { VitalsEntryCard } from '@/components/patient/VitalsEntryCard';
import { HealthTrendChart } from '@/components/patient/HealthTrendChart';
import { CareTeamCard } from '@/components/patient/CareTeamCard';
import { PersonalInformationCard } from '@/components/patient/PersonalInformationCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmergencyBanner } from '@/components/common/EmergencyBanner';
import { HealthMeasurement, DoctorAnnotation, Patient } from '@/types/healthlink';

import {
  Activity,
  Scale,
  Heart,
  Thermometer,
  MessageSquare,
  Bot,
  Clock,
  ArrowRight,
  Stethoscope,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export default function PatientDashboardPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctorName, setDoctorName] = useState('Dr. Sarah Miller, MD');
  const [doctorSpecialty, setDoctorSpecialty] = useState('Internal Medicine & Tele-Cardiology');
  const [clinicName, setClinicName] = useState('HealthLink Premier Tele-Clinical Center');
  const [doctorIsOnline, setDoctorIsOnline] = useState(true);
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
  const [annotations, setAnnotations] = useState<DoctorAnnotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem('healthlink_token');
      const sessionStr = localStorage.getItem('healthlink_session');

      // Auto fallback to demo user if not logged in
      if (!token && !sessionStr) {
        const resLogin = await fetch('/api/auth/patient-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: 'John Doe',
            doctorName: 'Dr. Sarah Miller',
            doctorCode: 'DOC-7749',
          }),
        });
        const loginData = await resLogin.json();
        if (loginData.token) {
          localStorage.setItem('healthlink_token', loginData.token);
          localStorage.setItem(
            'healthlink_session',
            JSON.stringify({
              userId: loginData.patient.id,
              name: loginData.patient.name,
              role: 'patient',
              doctorId: loginData.doctor.id,
              doctorName: loginData.doctor.name,
            })
          );
          setPatient(loginData.patient);
          setDoctorName(loginData.doctor.name);
          setDoctorSpecialty(loginData.doctor.specialty || 'Internal Medicine & Tele-Cardiology');
          setClinicName(loginData.doctor.clinicName || 'HealthLink Premier Tele-Clinical Center');
          setDoctorIsOnline(loginData.doctor.isOnline ?? true);
        }
      } else if (sessionStr) {
        try {
          const sess = JSON.parse(sessionStr);
          setDoctorName(sess.doctorName || 'Dr. Sarah Miller, MD');
        } catch (e) {}
      }

      const activeToken = localStorage.getItem('healthlink_token');
      const res = await fetch('/api/health/measurements', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setMeasurements(data.measurements || []);
        setAnnotations(data.annotations || []);
        if (data.patient) setPatient(data.patient);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();

    // Listen to real-time events via SSE
    const sse = new EventSource('/api/events');
    sse.addEventListener('NEW_MEASUREMENT', () => {
      fetchPatientData();
    });
    sse.addEventListener('NEW_MESSAGE', () => {
      fetchPatientData();
    });
    sse.addEventListener('ALERT_STATUS_CHANGED', () => {
      fetchPatientData();
    });

    return () => {
      sse.close();
    };
  }, []);

  const latest = measurements.length > 0 ? measurements[measurements.length - 1] : undefined;

  const lastUpdatedFormatted = latest
    ? new Date(latest.timestamp).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No entries yet';

  return (
    <PatientAuthGuard>
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-24 md:pb-12 text-[#171717]">
        {/* Header */}
        <Header
          portalType="patient"
          userName={patient?.name || 'John Doe'}
          assignedDoctorName={doctorName}
          isOnline={true}
        />

        {/* Navigation Bar */}
        <PatientNav userName={patient?.name || 'John Doe'} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Welcome Greeting Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-red-100 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {getGreeting()}, {patient?.name?.split(' ')[0] || 'John'}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Patient Health Overview
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 font-medium pt-1">
                <span className="flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-[#D32F2F]" />
                  <span>Assigned Doctor: <strong className="text-gray-900">{doctorName}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  ● Connected
                </span>
                <span>•</span>
                <span>Last Updated: <strong className="text-gray-800">{lastUpdatedFormatted}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/patient/chat"
                className="px-4 py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-red-600/30 transition-all flex items-center gap-1.5"
              >
                <MessageSquare size={14} />
                <span>Message Doctor</span>
              </Link>
              <Link
                href="/patient/ai-assistant"
                className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Bot size={14} className="text-[#D32F2F]" />
                <span>Ask AI Assistant</span>
              </Link>
            </div>
          </div>

          {/* Critical Alert Banner if Urgent */}
          {latest?.status === 'URGENT' && (
            <EmergencyBanner
              message={
                latest.statusReasons?.join(' ') ||
                'Critical reading detected in your latest vitals entry. Please contact your physician or local emergency care immediately.'
              }
            />
          )}

          {/* 4 Clean White Health Cards with Red Accents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: Weight */}
            <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  Body Weight
                </span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Scale size={18} />
                </div>
              </div>

              <div className="my-3">
                <span className="text-3xl font-black text-gray-900 font-mono tracking-tight">
                  {latest?.weight ? `${latest.weight.value}` : '—'}
                </span>
                <span className="text-sm font-bold text-gray-500 ml-1.5">
                  {latest?.weight?.unit || 'kg'}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Target: Stable Trend</span>
                <span className="font-semibold text-sky-600">Daily Logged</span>
              </div>
            </div>

            {/* Card 2: Blood Pressure */}
            <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  Blood Pressure
                </span>
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#D32F2F] flex items-center justify-center font-bold">
                  <Activity size={18} />
                </div>
              </div>

              <div className="my-3">
                <span className="text-3xl font-black text-gray-900 font-mono tracking-tight">
                  {latest?.bloodPressure ? `${latest.bloodPressure.systolic}/${latest.bloodPressure.diastolic}` : '—'}
                </span>
                <span className="text-sm font-bold text-gray-500 ml-1.5">mmHg</span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Clinical Status:</span>
                <StatusBadge status={latest?.status || 'NORMAL'} size="sm" />
              </div>
            </div>

            {/* Card 3: Temperature */}
            <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  Body Temperature
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Thermometer size={18} />
                </div>
              </div>

              <div className="my-3">
                <span className="text-3xl font-black text-gray-900 font-mono tracking-tight">
                  {latest?.temperature ? `${latest.temperature.value}` : '—'}
                </span>
                <span className="text-sm font-bold text-gray-500 ml-1.5">
                  °{latest?.temperature?.unit || 'C'}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Reference: 36.1 - 37.2°C</span>
                <span className="font-semibold text-amber-600">Standard</span>
              </div>
            </div>

            {/* Card 4: Heart Rate */}
            <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  Heart Rate
                </span>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Heart size={18} />
                </div>
              </div>

              <div className="my-3">
                <span className="text-3xl font-black text-gray-900 font-mono tracking-tight">
                  {latest?.heartRate || '—'}
                </span>
                <span className="text-sm font-bold text-gray-500 ml-1.5">bpm</span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Resting Pulse</span>
                <span className="font-semibold text-emerald-600 font-mono">AHA 60-100</span>
              </div>
            </div>
          </div>

          {/* Personal Information & Demographic Summary Card */}
          <PersonalInformationCard
            patient={patient}
            onProfileUpdated={(updated) => setPatient(updated)}
          />

          {/* Care Team & Quick Communication Card */}
          <CareTeamCard
            doctorName={doctorName}
            specialty={doctorSpecialty}
            clinicName={clinicName}
            isOnline={doctorIsOnline}
            patientName={patient?.name || 'John Doe'}
          />


          {/* Vitals Entry Section */}
          <VitalsEntryCard onVitalSaved={fetchPatientData} />

          {/* Interactive Health Trend Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  Health Trend
                </h2>
                <p className="text-xs text-gray-500">
                  Visual progression of your daily physiological vitals with clinical reference ranges.
                </p>
              </div>

              <Link
                href="/patient/trends"
                className="text-xs font-bold text-[#D32F2F] hover:text-[#B71C1C] flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition-all"
              >
                <span>Full Screen Trends</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <HealthTrendChart
              measurements={measurements}
              annotations={annotations}
              title="Health Trend"
            />
          </div>
        </main>
      </div>
    </PatientAuthGuard>
  );
}
