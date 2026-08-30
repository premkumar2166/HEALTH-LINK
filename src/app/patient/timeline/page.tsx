'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { PatientNav } from '@/components/patient/PatientNav';
import { PatientAuthGuard } from '@/components/patient/PatientAuthGuard';
import { HealthTimelineView } from '@/components/patient/HealthTimelineView';
import { HealthTimelineEvent } from '@/types/healthlink';
import { Clock, Heart } from 'lucide-react';

export default function PatientTimelinePage() {
  const [events, setEvents] = useState<HealthTimelineEvent[]>([]);
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

    async function loadTimeline() {
      try {
        const token = localStorage.getItem('healthlink_token');
        const res = await fetch('/api/health/timeline', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEvents(data.timeline || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadTimeline();
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

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBEE] border border-red-200 text-[#D32F2F] text-xs font-black uppercase tracking-wider mb-2">
              <Heart size={13} className="fill-[#D32F2F] text-[#D32F2F]" />
              <span>Chronological Health Activity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Clock size={28} className="text-[#D32F2F]" />
              <span>Health Event Timeline</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Complete chronological audit of vital signs logged, clinical messages, voice memos, and alerts.
            </p>
          </div>

          <HealthTimelineView events={events} />
        </main>
      </div>
    </PatientAuthGuard>
  );
}
