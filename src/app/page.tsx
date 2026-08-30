'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { HealthConnectionCanvas } from '@/components/3d/HealthConnectionCanvas';
import {
  Heart,
  Stethoscope,
  Activity,
  ShieldCheck,
  LineChart,
  Bot,
  MessageSquare,
  PhoneCall,
  ArrowRight,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#1A1A1A]">
      <Header portalType="gateway" isOnline={true} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFEBEE] border border-red-200 text-[#D32F2F] text-xs font-bold uppercase tracking-wider shadow-sm">
            <Heart size={14} className="fill-[#D32F2F] text-[#D32F2F] animate-pulse" />
            <span>Two Connected Healthcare Experiences • Unified Backend</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            CONNECT • MONITOR • <span className="text-[#D32F2F]">COMMUNICATE</span> • CARE
          </h1>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            HEALTHLINK bridges the gap between patient tele-monitoring and clinician decision-making with high-fidelity health trends, responsible AI education, encrypted voice notes, and real-time telehealth.
          </p>
        </div>

        {/* 3D Visualizer Core */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Live Medical Data Connection Architecture
            </h2>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck size={14} /> HIPAA & GDPR Compliant Security Core
            </span>
          </div>
          <HealthConnectionCanvas />
        </div>

        {/* Two Separate Website Entry Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Card 1: HEALTHLINK PATIENT */}
          <div className="bg-white rounded-3xl border-2 border-red-200 p-8 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#D32F2F] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Heart size={30} className="fill-white" />
                </div>
                <span className="px-3 py-1 bg-[#FFEBEE] text-[#B71C1C] border border-red-200 text-xs font-bold rounded-full">
                  WEBSITE 1 • PATIENT
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 group-hover:text-[#D32F2F] transition-colors">
                  HEALTHLINK Patient Health Portal
                </h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Simple, friendly, patient-focused portal. Log daily vitals, view day-to-day interactive health charts, chat directly with your assigned doctor, send voice notes, and consult the AI health assistant.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#D32F2F]" />
                  <span>Validated Vitals Entry (Weight, BP, Temp, Heart Rate)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#D32F2F]" />
                  <span>Financial-Style Interactive Health Trend Visualizer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#D32F2F]" />
                  <span>AI Health Education Assistant with Safety Guardrails</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#D32F2F]" />
                  <span>Direct Encrypted Doctor Chat & Voice Memos</span>
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/patient/login"
                className="flex-1 py-3.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm rounded-xl text-center shadow-md hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Patient Portal</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/patient/dashboard"
                className="py-3.5 px-4 bg-red-50 hover:bg-red-100 text-[#B71C1C] border border-red-200 font-bold text-sm rounded-xl text-center transition-all"
              >
                Demo Patient
              </Link>
            </div>
          </div>

          {/* Card 2: HEALTHLINK DOCTOR */}
          <div className="bg-white rounded-3xl border-2 border-red-200 p-8 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#D32F2F] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Stethoscope size={30} className="text-white" />
                </div>
                <span className="px-3 py-1 bg-[#FFEBEE] text-[#B71C1C] border border-red-200 text-xs font-bold rounded-full">
                  WEBSITE 2 • DOCTOR
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 group-hover:text-[#D32F2F] transition-colors">
                  HEALTHLINK Doctor Clinical Portal
                </h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Professional clinical command center. Monitor authorized patient panels, review triage alerts (Normal, Review, Urgent), perform clinical calculations, record private doctor notes, and consult patients.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#D32F2F]" />
                  <span>Doctor Command Center with Patient Triage Cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#D32F2F]" />
                  <span>9 Clinical Tabs with Multi-Metric Trend Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#D32F2F]" />
                  <span>Private Clinician Notes (Guaranteed Isolated from Patient)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#D32F2F]" />
                  <span>Clinical Attention Center & Secure Doctor Code Auth</span>
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/doctor/login"
                className="flex-1 py-3.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Doctor Sign In / Register</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/doctor/dashboard"
                className="py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 font-bold text-sm rounded-xl text-center transition-all"
              >
                Doctor Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-[#D32F2F] fill-[#D32F2F]" />
            <span className="font-bold text-gray-900">HEALTHLINK 3D Telehealth Enterprise</span>
          </div>
          <p>© 2026 HealthLink Platform. Red & White Medical UX Architecture. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
