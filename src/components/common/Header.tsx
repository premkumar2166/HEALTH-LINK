'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  User,
  LogOut,
  Stethoscope,
  ArrowLeftRight,
  ShieldCheck,
  Key,
  Copy,
  Check,
  Settings,
  ChevronDown,
  Eye,
  EyeOff,
  Building,
} from 'lucide-react';

interface HeaderProps {
  portalType: 'patient' | 'doctor' | 'gateway';
  userName?: string;
  assignedDoctorName?: string;
  isOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  portalType,
  userName: propUserName,
  assignedDoctorName,
  isOnline = true,
}) => {
  const router = useRouter();

  const [doctorDetails, setDoctorDetails] = useState<{
    name: string;
    specialization: string;
    clinic: string;
    doctorCode: string;
    verificationStatus: string;
  } | null>(null);

  const [showCode, setShowCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    if (portalType === 'doctor') {
      const sessStr =
        localStorage.getItem('healthlink_doctor_session') ||
        localStorage.getItem('healthlink_session');
      if (sessStr) {
        try {
          const parsed = JSON.parse(sessStr);
          if (parsed.role === 'doctor') {
            setDoctorDetails({
              name: parsed.name || propUserName || 'Dr. Sarah Miller, MD',
              specialization: parsed.specialization || 'Cardiology & Internal Medicine',
              clinic: parsed.clinicName || 'HealthLink Clinical Center',
              doctorCode: parsed.doctorCode || 'HL-DR-7749',
              verificationStatus: parsed.verificationStatus || 'VERIFIED',
            });
          }
        } catch (e) {}
      }
    }
  }, [portalType, propUserName]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLogout = async () => {
    try {
      const token =
        localStorage.getItem('healthlink_doctor_token') ||
        localStorage.getItem('healthlink_patient_token') ||
        localStorage.getItem('healthlink_token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem('healthlink_doctor_token');
      localStorage.removeItem('healthlink_doctor_session');
      localStorage.removeItem('healthlink_patient_token');
      localStorage.removeItem('healthlink_patient_session');
      localStorage.removeItem('healthlink_token');
      localStorage.removeItem('healthlink_session');

      if (portalType === 'patient') {
        router.push('/patient/login');
      } else if (portalType === 'doctor') {
        router.push('/doctor/login');
      } else {
        router.push('/');
      }
    }
  };

  const displayName = doctorDetails?.name || propUserName;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-[#D32F2F] text-white flex items-center justify-center shadow-md group-hover:bg-[#B71C1C] transition-all">
                <Heart size={22} className="fill-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-gray-900 flex items-center gap-1">
                  HEALTH<span className="text-[#D32F2F]">LINK</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-gray-400 block uppercase">
                  Clinical Platform
                </span>
              </div>
            </Link>

            {portalType !== 'gateway' && (
              <div className="hidden sm:flex items-center ml-4 pl-4 border-l border-gray-200">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    portalType === 'patient'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-[#FFEBEE] text-[#B71C1C] border border-red-200'
                  }`}
                >
                  {portalType === 'patient' ? (
                    <>
                      <User size={13} /> Patient Health Portal
                    </>
                  ) : (
                    <>
                      <Stethoscope size={13} className="text-[#D32F2F]" /> Doctor Clinical Portal
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Right actions: Online status, Quick switcher & Profile info */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Connection indicator */}
            <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full text-xs text-gray-600 font-medium">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-[11px] font-semibold">{isOnline ? 'Connected' : 'Offline'}</span>
            </div>

            {/* Portal Switcher */}
            <div className="hidden lg:flex items-center gap-1 text-xs">
              {portalType === 'patient' ? (
                <Link
                  href="/doctor/dashboard"
                  className="flex items-center gap-1 text-gray-600 hover:text-[#D32F2F] bg-gray-50 hover:bg-red-50 border border-gray-200 px-3 py-1.5 rounded-xl font-bold transition-all"
                >
                  <ArrowLeftRight size={13} />
                  <span>Switch to Doctor</span>
                </Link>
              ) : portalType === 'doctor' ? (
                <Link
                  href="/patient/dashboard"
                  className="flex items-center gap-1 text-gray-600 hover:text-red-700 bg-gray-50 hover:bg-red-50 border border-gray-200 px-3 py-1.5 rounded-xl font-bold transition-all"
                >
                  <ArrowLeftRight size={13} />
                  <span>Switch to Patient</span>
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/patient/login"
                    className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 font-bold rounded-xl hover:bg-red-100 transition-all"
                  >
                    Patient Portal
                  </Link>
                  <Link
                    href="/doctor/login"
                    className="px-3 py-1.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all"
                  >
                    Doctor Portal
                  </Link>
                </div>
              )}
            </div>

            {/* User Session Dropdown / Controls */}
            {displayName && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 pl-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#D32F2F] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {displayName.replace('Dr. ', '').charAt(0)}
                  </div>
                  <div className="text-left hidden md:block pr-1">
                    <div className="text-xs font-extrabold text-gray-900 leading-tight">
                      {displayName}
                    </div>
                    {portalType === 'doctor' ? (
                      <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <span>✓ Verified Clinician</span>
                      </div>
                    ) : (
                      assignedDoctorName && (
                        <div className="text-[10px] text-gray-500 font-medium truncate max-w-[120px]">
                          Doc: {assignedDoctorName}
                        </div>
                      )
                    )}
                  </div>
                  <ChevronDown size={14} className="text-gray-400 pr-1.5" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 py-3 px-4 z-50 animate-fadeIn">
                    <div className="border-b border-gray-100 pb-3 mb-2">
                      <div className="text-xs font-black text-gray-900">{displayName}</div>
                      {doctorDetails && (
                        <>
                          <div className="text-[11px] text-[#D32F2F] font-semibold mt-0.5">
                            {doctorDetails.specialization}
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Building size={11} />
                            <span className="truncate">{doctorDetails.clinic}</span>
                          </div>

                          {/* Doctor Code Widget */}
                          <div className="mt-2.5 p-2 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                                Doctor Code
                              </span>
                              <span className="font-mono font-bold text-gray-900">
                                {showCode ? doctorDetails.doctorCode : '••••••••'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setShowCode(!showCode)}
                                className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                title={showCode ? 'Hide Code' : 'Reveal Code'}
                              >
                                {showCode ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(doctorDetails.doctorCode)}
                                className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                title="Copy Doctor Code"
                              >
                                {copiedCode ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-1 text-xs font-semibold">
                      {portalType === 'doctor' ? (
                        <>
                          <Link
                            href="/doctor/profile"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2 p-2 hover:bg-red-50 text-gray-700 hover:text-[#D32F2F] rounded-xl transition-all"
                          >
                            <User size={14} />
                            <span>View Profile</span>
                          </Link>
                          <Link
                            href="/doctor/security"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2 p-2 hover:bg-red-50 text-gray-700 hover:text-[#D32F2F] rounded-xl transition-all"
                          >
                            <Settings size={14} />
                            <span>Security Settings</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/patient/profile"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2 p-2 hover:bg-red-50 text-gray-700 hover:text-[#D32F2F] rounded-xl transition-all"
                          >
                            <User size={14} className="text-[#D32F2F]" />
                            <span>Personal Information</span>
                          </Link>
                          <Link
                            href="/patient/profile"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2 p-2 hover:bg-red-50 text-gray-700 hover:text-[#D32F2F] rounded-xl transition-all"
                          >
                            <ShieldCheck size={14} className="text-emerald-600" />
                            <span>Security & Privacy</span>
                          </Link>
                          <Link
                            href="/patient/settings"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2 p-2 hover:bg-red-50 text-gray-700 hover:text-[#D32F2F] rounded-xl transition-all"
                          >
                            <Settings size={14} className="text-gray-500" />
                            <span>Account Settings</span>
                          </Link>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 p-2 hover:bg-red-50 text-red-600 rounded-xl transition-all text-left pt-2 border-t border-gray-100 mt-1"
                      >
                        <LogOut size={14} />
                        <span>Logout Session</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
