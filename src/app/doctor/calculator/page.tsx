'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { DoctorNav } from '@/components/doctor/DoctorNav';
import { DoctorBottomNav } from '@/components/doctor/DoctorBottomNav';
import { ClinicalCalculator } from '@/components/doctor/ClinicalCalculator';
import { Calculator, ShieldAlert } from 'lucide-react';

export default function DoctorCalculatorPage() {
  const [doctorName, setDoctorName] = useState('Dr. Sarah Miller, MD');

  useEffect(() => {
    const sessStr =
      localStorage.getItem('healthlink_doctor_session') ||
      localStorage.getItem('healthlink_session');
    if (sessStr) {
      try {
        const parsed = JSON.parse(sessStr);
        setDoctorName(parsed.name || 'Dr. Sarah Miller, MD');
      } catch (e) {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-16 md:pb-12 text-[#1A1A1A]">
      <Header portalType="doctor" userName={doctorName} isOnline={true} />
      <DoctorNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Calculator size={26} className="text-[#D32F2F]" />
            <span>Clinical Calculation Panel</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Clinical decision support tools for BMI assessment, Mean Arterial Pressure (MAP), and Pulse Pressure evaluation.
          </p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5 shadow-sm">
          <ShieldAlert size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Clinical Safety Notice:</strong> Calculated parameters are decision-support aids and do not constitute autonomous clinical diagnoses. Always evaluate calculations within the context of the patient's full medical history.
          </p>
        </div>

        <ClinicalCalculator />
      </main>

      <DoctorBottomNav />
    </div>
  );
}
