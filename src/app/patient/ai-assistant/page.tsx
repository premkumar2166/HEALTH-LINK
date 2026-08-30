'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { PatientNav } from '@/components/patient/PatientNav';
import { PatientAuthGuard } from '@/components/patient/PatientAuthGuard';
import { AIAssistantChat } from '@/components/patient/AIAssistantChat';
import { Bot, Sparkles, Heart } from 'lucide-react';

export default function PatientAIAssistantPage() {
  const [patientName, setPatientName] = useState('John Doe');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Miller, MD');

  useEffect(() => {
    const sessionStr = localStorage.getItem('healthlink_session');
    if (sessionStr) {
      try {
        const sess = JSON.parse(sessionStr);
        setPatientName(sess.name || 'John Doe');
        setDoctorName(sess.doctorName || 'Dr. Sarah Miller, MD');
      } catch (e) {}
    }
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
              <span>Responsible AI Health Education</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Bot size={28} className="text-[#D32F2F]" />
              <span>HEALTHLINK AI Health Assistant</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Medical terminology explanations, dashboard guidance, and doctor question preparation with clinical safety guardrails.
            </p>
          </div>

          <AIAssistantChat />
        </main>
      </div>
    </PatientAuthGuard>
  );
}
