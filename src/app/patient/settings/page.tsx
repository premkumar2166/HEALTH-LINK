'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { PatientNav } from '@/components/patient/PatientNav';
import { PatientAuthGuard } from '@/components/patient/PatientAuthGuard';
import { LogoutConfirmModal } from '@/components/patient/LogoutConfirmModal';
import { ChangePasswordModal } from '@/components/patient/ChangePasswordModal';
import { DataPrivacyModal } from '@/components/patient/DataPrivacyModal';
import {
  Settings,
  Bell,
  Eye,
  Lock,
  Globe,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  Sliders,
  Smartphone,
  ChevronRight,
  User,
} from 'lucide-react';

export default function PatientSettingsPage() {
  const [patientName, setPatientName] = useState('John Doe');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Miller, MD');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    const sessionStr = localStorage.getItem('healthlink_session');
    if (sessionStr) {
      try {
        const parsed = JSON.parse(sessionStr);
        setPatientName(parsed.name || 'John Doe');
        setDoctorName(parsed.doctorName || 'Dr. Sarah Miller, MD');
      } catch (e) {}
    }
  }, []);

  const handleSavePreferences = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <PatientAuthGuard>
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-24 md:pb-12 text-[#1A1A1A]">
        <Header
          portalType="patient"
          userName={patientName}
          assignedDoctorName={doctorName}
          isOnline={true}
        />
        <PatientNav userName={patientName} />

        {savedToast && (
          <div className="fixed top-20 right-4 z-50 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl shadow-xl text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-fade-in max-w-sm">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span>Preferences updated and saved locally.</span>
          </div>
        )}

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Settings size={28} className="text-red-600" />
              <span>Patient Account & Portal Settings</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Configure notifications, accessibility preferences, and account credentials.
            </p>
          </div>

          {/* Quick Profile Link */}
          <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <User size={22} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">{patientName}</h3>
                <p className="text-xs text-gray-500">Legal demographics, photo, emergency contacts</p>
              </div>
            </div>
            <Link
              href="/patient/profile"
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
            >
              <span>Manage Profile</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Notifications Settings */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-red-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Bell size={18} className="text-red-600" />
              <h2 className="text-base font-extrabold text-gray-900">Clinical Alerts & Notifications</h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 bg-[#FAFAFA] rounded-2xl border border-gray-200 cursor-pointer">
                <div>
                  <span className="font-bold text-gray-900 block">Critical Measurement Notifications</span>
                  <span className="text-gray-500 text-[11px]">
                    Receive instant alerts when readings trigger review or urgent status.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-[#FAFAFA] rounded-2xl border border-gray-200 cursor-pointer">
                <div>
                  <span className="font-bold text-gray-900 block">Doctor Chat Messages & Voice Notes</span>
                  <span className="text-gray-500 text-[11px]">
                    Alert whenever Dr. Miller replies or schedules a tele-consultation.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Accessibility & Display Settings */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-red-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Sliders size={18} className="text-red-600" />
              <h2 className="text-base font-extrabold text-gray-900">Accessibility & Visual Experience</h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 bg-[#FAFAFA] rounded-2xl border border-gray-200 cursor-pointer">
                <div>
                  <span className="font-bold text-gray-900 block">High Contrast Mode</span>
                  <span className="text-gray-500 text-[11px]">
                    Increases border and text contrast for enhanced visibility.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-[#FAFAFA] rounded-2xl border border-gray-200 cursor-pointer">
                <div>
                  <span className="font-bold text-gray-900 block">Reduced Motion Mode</span>
                  <span className="text-gray-500 text-[11px]">
                    Disables 3D visualizer rotations and micro-animations.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSavePreferences}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
              >
                Save Display Preferences
              </button>
            </div>
          </div>

          {/* Security & Log Out Actions */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-red-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Lock size={18} className="text-red-600" />
              <h2 className="text-base font-extrabold text-gray-900">Security & Session Termination</h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => setIsPasswordOpen(true)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all"
              >
                Change Password
              </button>

              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all"
              >
                HIPAA Privacy Policy
              </button>

              <button
                onClick={() => setIsLogoutOpen(true)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-red-600/30 transition-all flex items-center gap-1.5 ml-auto"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </main>

        <ChangePasswordModal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} />
        <DataPrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
        <LogoutConfirmModal
          isOpen={isLogoutOpen}
          onClose={() => setIsLogoutOpen(false)}
          userName={patientName}
        />
      </div>
    </PatientAuthGuard>
  );
}
