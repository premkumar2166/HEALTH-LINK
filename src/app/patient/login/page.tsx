'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  User,
  Stethoscope,
  Key,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  Lock,
  CheckCircle2,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { Patient3DHealthcareCore } from '@/components/3d/Patient3DHealthcareCore';
import { SecurityInfoModal } from '@/components/patient/SecurityInfoModal';
import { LegalTermsModal, LegalModalType } from '@/components/patient/LegalTermsModal';


export default function PatientLoginPage() {
  const router = useRouter();

  // Form State
  const [patientName, setPatientName] = useState('John Doe');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Miller');
  const [doctorCode, setDoctorCode] = useState('DOC-7749');
  const [showCode, setShowCode] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Validation & Loading State
  const [nameError, setNameError] = useState<string | null>(null);
  const [doctorError, setDoctorError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isShake, setIsShake] = useState(false);

  // Modals
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);

  // Login step: 'signin' | 'confirm'
  const [loginStep, setLoginStep] = useState<'signin' | 'confirm'>('signin');
  const [confirmedData, setConfirmedData] = useState<{
    token: string;
    patient: any;
    doctor: any;
  } | null>(null);

  const triggerShake = () => {
    setIsShake(true);
    setTimeout(() => setIsShake(false), 450);
  };

  const validateForm = () => {
    let isValid = true;
    setNameError(null);
    setDoctorError(null);
    setCodeError(null);
    setGeneralError(null);

    const trimmedName = patientName.trim();
    if (!trimmedName) {
      setNameError('Please enter your full name.');
      isValid = false;
    } else if (trimmedName.length < 2) {
      setNameError('Name must contain at least 2 characters.');
      isValid = false;
    } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
      setNameError('Please enter a valid patient name without numbers or special symbols.');
      isValid = false;
    }

    const trimmedDoctor = doctorName.trim();
    if (!trimmedDoctor) {
      setDoctorError('Please enter your assigned doctor or clinic name.');
      isValid = false;
    }

    const trimmedCode = doctorCode.trim();
    if (!trimmedCode) {
      setCodeError('Doctor authorization code is required.');
      isValid = false;
    } else if (trimmedCode.length < 4) {
      setCodeError('Authorization code format is invalid.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      triggerShake();
      return;
    }

    setIsLoading(true);
    setGeneralError(null);

    try {
      const res = await fetch('/api/auth/patient-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientName.trim(),
          doctorName: doctorName.trim(),
          doctorCode: doctorCode.trim().toUpperCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGeneralError('Unable to sign in. Please check your patient details and clinic authorization code.');
        triggerShake();
      } else {
        // Save confirmed data and show confirmation preview
        setConfirmedData(data);
        setLoginStep('confirm');
      }
    } catch (err) {
      setGeneralError('Network connection issue. Please check your connection and try again.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeLogin = () => {
    if (!confirmedData) return;
    // Secure Session Storage
    localStorage.setItem('healthlink_patient_token', confirmedData.token);
    localStorage.setItem('healthlink_token', confirmedData.token);
    localStorage.setItem(
      'healthlink_session',
      JSON.stringify({
        userId: confirmedData.patient.id,
        name: confirmedData.patient.name,
        role: 'patient',
        doctorId: confirmedData.doctor.id,
        doctorName: confirmedData.doctor.name,
      })
    );

    router.push('/patient/dashboard');
  };


  const fillDemoCredentials = () => {
    setPatientName('John Doe');
    setDoctorName('Dr. Sarah Miller');
    setDoctorCode('DOC-7749');
    setIsDemoMode(true);
    setNameError(null);
    setDoctorError(null);
    setCodeError(null);
    setGeneralError(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between text-[#171717]">
      {/* Top Subtle Announcement Bar */}
      <div className="bg-white border-b border-gray-200 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-gray-800">HEALTHLINK Patient Health Portal</span>
            <span className="hidden sm:inline text-gray-400">• Red & White Medical Tech Architecture</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>HIPAA Compliant Session</span>
            </span>
            <Link
              href="/doctor/login"
              className="text-[11px] font-bold text-[#D32F2F] hover:text-[#B71C1C] hover:underline"
            >
              Doctor Sign In →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Two-Column Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          {/* LEFT SIDE: Branding, Hero & 3D Healthcare Visualizer */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-2xl bg-[#D32F2F] text-white flex items-center justify-center shadow-lg group-hover:bg-[#B71C1C] transition-all">
                  <Heart size={26} className="fill-white" />
                </div>
                <div>
                  <span className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-1">
                    HEALTH<span className="text-[#D32F2F]">LINK</span>
                  </span>
                  <span className="text-xs font-extrabold text-gray-400 block tracking-wider uppercase">
                    Patient Health Portal
                  </span>
                </div>
              </Link>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFEBEE] border border-red-200 text-[#D32F2F] text-xs font-extrabold">
                <Sparkles size={13} />
                <span>Next-Gen Telehealth & Remote Vitals Monitoring</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                Your Health. <span className="text-[#D32F2F]">Connected.</span>
              </h1>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl">
                Securely share your health information with your authorized healthcare provider and stay connected with your care team. Track blood pressure, weight, temperature, receive clinical feedback, and chat seamlessly.
              </p>
            </div>

            {/* 3D Healthcare Animation Core */}
            <div className="pt-2">
              <Patient3DHealthcareCore height={340} />
            </div>

            {/* Security Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#D32F2F] flex items-center justify-center font-bold flex-shrink-0">
                  <Lock size={16} />
                </div>
                <div className="text-xs">
                  <div className="font-extrabold text-gray-900">Patient Isolation</div>
                  <div className="text-[11px] text-gray-500">Strict zero-leak boundaries</div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="text-xs">
                  <div className="font-extrabold text-gray-900">Encrypted Sync</div>
                  <div className="text-[11px] text-gray-500">TLS 1.3 & SHA-256 JWT</div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold flex-shrink-0">
                  <Stethoscope size={16} />
                </div>
                <div className="text-xs">
                  <div className="font-extrabold text-gray-900">Care Team Link</div>
                  <div className="text-[11px] text-gray-500">Authorized clinic codes</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Patient Sign-In Card */}
          <div className="lg:col-span-5 w-full">
            <div
              className={`bg-white rounded-3xl border border-red-100 shadow-xl p-6 sm:p-8 space-y-6 transition-all ${
                isShake ? 'animate-shake' : 'animate-fade-in'
              }`}
            >
              {loginStep === 'confirm' && confirmedData ? (
                <div className="space-y-6 animate-fade-in">
                  {/* Card Header */}
                  <div className="space-y-1 pb-3 border-b border-gray-100">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-1">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>Identity Verified</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">Confirm Your Profile</h2>
                    <p className="text-xs text-gray-500">
                      Please confirm your details before accessing your health portal.
                    </p>
                  </div>

                  {/* Profile Summary Card */}
                  <div className="p-4 bg-[#FAFAFA] border border-gray-200 rounded-2xl space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                      <span className="text-gray-500 font-bold">Patient Name:</span>
                      <span className="text-sm font-black text-gray-900">{confirmedData.patient.name}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                      <span className="text-gray-500 font-bold">Assigned Doctor:</span>
                      <span className="font-extrabold text-gray-900">{confirmedData.doctor.name}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                      <span className="text-gray-500 font-bold">Contact Email:</span>
                      <span className="font-medium text-gray-800 font-mono">{confirmedData.patient.email}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                      <span className="text-gray-500 font-bold">Phone Number:</span>
                      <span className="font-medium text-gray-800 font-mono">{confirmedData.patient.phoneNumber || '+1 (555) 019-2834'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-gray-500 font-bold">Session Security:</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700">
                        <ShieldCheck size={13} />
                        <span>Encrypted Patient Session</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={finalizeLogin}
                      className="w-full py-3.5 px-4 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <span>CONTINUE TO PATIENT PORTAL</span>
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setLoginStep('signin')}
                      className="w-full py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft size={13} />
                      <span>Back / Change Credentials</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Card Header */}
                  <div className="space-y-1 pb-2 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black text-gray-900">Patient Sign In</h2>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] animate-pulse" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter your details to securely access your health portal.
                    </p>
                  </div>

                  {/* General Error Banner */}
                  {generalError && (
                    <div
                      role="alert"
                      className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-[#B71C1C] text-xs font-semibold flex items-start gap-2.5 animate-fade-in"
                    >
                      <AlertTriangle size={16} className="text-[#D32F2F] flex-shrink-0 mt-0.5" />
                      <span>{generalError}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleLogin} className="space-y-4" noValidate>
                    {/* 1. Patient Name */}
                    <div>
                      <label
                        htmlFor="patient-name-input"
                        className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5"
                      >
                        Patient Name
                      </label>
                      <div className="relative">
                        <input
                          id="patient-name-input"
                          type="text"
                          required
                          placeholder="Enter your full name"
                          value={patientName}
                          onChange={(e) => {
                            setPatientName(e.target.value);
                            if (nameError) setNameError(null);
                          }}
                          className={`w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border rounded-xl text-sm font-medium text-gray-900 focus:bg-white outline-none transition-all ${
                            nameError
                              ? 'border-red-500 ring-2 ring-red-200'
                              : 'border-gray-300 focus:border-[#D32F2F] focus:ring-2 focus:ring-red-100'
                          }`}
                          aria-invalid={!!nameError}
                          aria-describedby={nameError ? 'name-error-msg' : undefined}
                        />
                        <User size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                      </div>
                      {nameError && (
                        <p id="name-error-msg" className="text-[11px] text-[#D32F2F] font-semibold mt-1 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          <span>{nameError}</span>
                        </p>
                      )}
                    </div>

                    {/* 2. Assigned Doctor */}
                    <div>
                      <label
                        htmlFor="doctor-name-input"
                        className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5"
                      >
                        Assigned Doctor
                      </label>
                      <div className="relative">
                        <input
                          id="doctor-name-input"
                          type="text"
                          required
                          placeholder="Enter assigned doctor's name"
                          value={doctorName}
                          onChange={(e) => {
                            setDoctorName(e.target.value);
                            if (doctorError) setDoctorError(null);
                          }}
                          className={`w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border rounded-xl text-sm font-medium text-gray-900 focus:bg-white outline-none transition-all ${
                            doctorError
                              ? 'border-red-500 ring-2 ring-red-200'
                              : 'border-gray-300 focus:border-[#D32F2F] focus:ring-2 focus:ring-red-100'
                          }`}
                          aria-invalid={!!doctorError}
                          aria-describedby={doctorError ? 'doctor-error-msg' : undefined}
                        />
                        <Stethoscope size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                      </div>
                      {doctorError && (
                        <p id="doctor-error-msg" className="text-[11px] text-[#D32F2F] font-semibold mt-1 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          <span>{doctorError}</span>
                        </p>
                      )}
                    </div>

                    {/* 3. Doctor Code */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label
                          htmlFor="doctor-code-input"
                          className="block text-xs font-bold text-gray-700 uppercase tracking-wide"
                        >
                          Doctor Code
                        </label>
                        <span className="text-[11px] text-[#D32F2F] font-bold">Required</span>
                      </div>
                      <div className="relative">
                        <input
                          id="doctor-code-input"
                          type={showCode ? 'text' : 'password'}
                          required
                          placeholder="Enter clinic authorization code"
                          value={doctorCode}
                          onChange={(e) => {
                            setDoctorCode(e.target.value.toUpperCase());
                            if (codeError) setCodeError(null);
                          }}
                          className={`w-full pl-10 pr-11 py-3 bg-[#FAFAFA] border rounded-xl text-sm font-mono font-bold text-gray-900 focus:bg-white outline-none uppercase tracking-wider transition-all ${
                            codeError
                              ? 'border-red-500 ring-2 ring-red-200'
                              : 'border-gray-300 focus:border-[#D32F2F] focus:ring-2 focus:ring-red-100'
                          }`}
                          aria-invalid={!!codeError}
                          aria-describedby={codeError ? 'code-error-msg' : undefined}
                        />
                        <Key size={18} className="absolute left-3.5 top-3.5 text-gray-400" />

                        <button
                          type="button"
                          onClick={() => setShowCode(!showCode)}
                          className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]"
                          title={showCode ? 'Hide Code' : 'Show Code'}
                          aria-label={showCode ? 'Hide Doctor Code' : 'Show Doctor Code'}
                        >
                          {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500">
                        <span>Provided by your physician's clinic.</span>
                        <span className="font-semibold text-gray-700">
                          Demo Code: <span className="font-mono font-bold text-[#D32F2F]">DOC-7749</span>
                        </span>
                      </div>

                      {codeError && (
                        <p id="code-error-msg" className="text-[11px] text-[#D32F2F] font-semibold mt-1 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          <span>{codeError}</span>
                        </p>
                      )}
                    </div>

                    {/* Primary CTA Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 bg-[#D32F2F] hover:bg-[#B71C1C] active:scale-[0.99] disabled:bg-gray-400 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed focus-ring-red"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verifying secure access...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue to Patient Portal</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Demo Credentials Helper */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <button
                      type="button"
                      onClick={fillDemoCredentials}
                      className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-[#B71C1C] border border-red-200 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 focus-ring-red"
                    >
                      <Sparkles size={14} className="text-[#D32F2F]" />
                      <span>Auto-fill Demo Patient Credentials (John Doe)</span>
                    </button>

                    {isDemoMode && (
                      <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center">
                        <span className="text-[10px] font-extrabold text-[#D32F2F] uppercase tracking-wider block">
                          ● DEMO MODE ACTIVE
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Demo data only — no real patient information is stored or exposed.
                        </span>
                      </div>
                    )}

                    {/* Expandable Security Indicator */}
                    <button
                      type="button"
                      onClick={() => setIsSecurityModalOpen(true)}
                      className="w-full p-2.5 bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between transition-all focus-ring-red"
                    >
                      <div className="flex items-center gap-2 text-left">
                        <Lock size={14} className="text-emerald-600 flex-shrink-0" />
                        <div>
                          <span className="font-extrabold block text-emerald-950">Secure Patient Session</span>
                          <span className="text-[11px] text-emerald-700">Access is limited to authorized patient data.</span>
                        </div>
                      </div>
                      <Info size={14} className="text-emerald-700 ml-2 flex-shrink-0" />
                    </button>
                  </div>

                  {/* Doctor Portal Switch */}
                  <div className="pt-2 text-center text-xs text-gray-500">
                    Are you a licensed physician?{' '}
                    <Link
                      href="/doctor/login"
                      className="font-bold text-gray-900 hover:text-[#D32F2F] underline"
                    >
                      Doctor Clinical Portal
                    </Link>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* Bottom Privacy & Legal Notice Strip */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p className="text-center sm:text-left leading-relaxed">
            Your health information is private and should only be accessed through authorized accounts.
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setLegalModalType('privacy')}
              className="text-gray-600 hover:text-[#D32F2F] transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => setLegalModalType('terms')}
              className="text-gray-600 hover:text-[#D32F2F] transition-colors"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={() => setLegalModalType('security')}
              className="text-gray-600 hover:text-[#D32F2F] transition-colors"
            >
              Security Standards
            </button>
          </div>
        </div>
      </footer>

      {/* Security Details Modal */}
      <SecurityInfoModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* Legal & Terms Dialog */}
      <LegalTermsModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}
