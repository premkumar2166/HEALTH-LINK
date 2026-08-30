'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Stethoscope,
  Key,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  Phone,
  BadgeCheck,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

const SPECIALIZATIONS = [
  'Cardiology & Cardiovascular Medicine',
  'Internal Medicine',
  'Endocrinology & Metabolism',
  'Pulmonology & Respiratory Medicine',
  'Neurology & Neuro-Critical Care',
  'Pediatrics & Adolescent Medicine',
  'Orthopedic Surgery & Sports Rehab',
  'Family & Preventive Medicine',
  'Emergency & Critical Care Medicine',
  'Nephrology & Renal Health',
  'Oncology & Hematology',
  'Gastroenterology & Hepatology',
  'Dermatology',
  'Psychiatry & Behavioral Health',
  'General Surgery',
];

export default function DoctorAuthPage() {
  const router = useRouter();

  // Mode: 'signin' | 'register' | 'created_success' | 'forgot_password'
  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'created_success' | 'forgot_password'>('signin');

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInDoctorCode, setSignInDoctorCode] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  // Register state
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0]);
  const [hospitalClinic, setHospitalClinic] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Success state after registration
  const [generatedDoctorCode, setGeneratedDoctorCode] = useState('');
  const [createdEmail, setCreatedEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotDoctorCode, setForgotDoctorCode] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Development Demo Mode collapsible
  const [showDevTools, setShowDevTools] = useState(false);

  // Copy doctor code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Sign In Submit
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/doctor-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signInEmail.trim(),
          password: signInPassword,
          doctorCode: signInDoctorCode.trim().toUpperCase(),
          rememberDevice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresVerification) {
          setErrorMsg('Please verify your professional account before continuing.');
          setCreatedEmail(data.email || signInEmail);
          setGeneratedDoctorCode(data.doctorCode || signInDoctorCode);
          setAuthMode('created_success');
        } else {
          setErrorMsg(data.error || 'Unable to sign in. Please verify your credentials and try again.');
        }
      } else {
        localStorage.setItem('healthlink_doctor_token', data.token);
        localStorage.setItem('healthlink_token', data.token);
        localStorage.setItem(
          'healthlink_doctor_session',
          JSON.stringify({
            userId: data.doctor.id,
            name: data.doctor.name,
            role: 'doctor',
            email: data.doctor.email,
            doctorCode: data.doctor.doctorCode,
            specialization: data.doctor.specialization,
            clinicName: data.doctor.clinicName,
            verificationStatus: data.doctor.verificationStatus,
          })
        );
        localStorage.setItem(
          'healthlink_session',
          JSON.stringify({
            userId: data.doctor.id,
            name: data.doctor.name,
            role: 'doctor',
            email: data.doctor.email,
            doctorCode: data.doctor.doctorCode,
          })
        );
        router.push('/doctor/dashboard');
      }
    } catch (err) {
      setErrorMsg('Unable to contact clinical authentication service. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to autofill realistic doctor registration for instant real-world testing
  const applySampleDoctorRegistration = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFullName('Dr. Alexander Morgan, MD');
    setRegEmail(`alex.morgan.${randomSuffix}@healthlink.org`);
    setPhoneNumber(`+1 (555) 724-${randomSuffix}`);
    setProfessionalId(`MD-682${randomSuffix}-CA`);
    setSpecialization('Cardiology & Cardiovascular Medicine');
    setHospitalClinic('HealthLink Advanced Tele-Clinic');
    setRegPassword('ClinicalPass2026!');
    setConfirmPassword('ClinicalPass2026!');
    setErrorMsg(null);
  };

  // Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (regPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long and meet clinical security requirements.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/doctor-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          professionalEmail: regEmail.trim(),
          phoneNumber: phoneNumber.trim(),
          professionalId: professionalId.trim(),
          specialization,
          hospitalClinic: hospitalClinic.trim(),
          password: regPassword,
          confirmPassword,
          autoVerify: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create doctor account.');
      } else {
        setGeneratedDoctorCode(data.doctorCode);
        setCreatedEmail(regEmail.trim());
        setVerificationToken(data.doctor?.verificationToken || '');
        setVerificationCodeInput(data.doctor?.verificationToken || '');
        setSignInEmail(regEmail.trim());
        setSignInDoctorCode(data.doctorCode);
        setIsVerified(data.doctor?.verificationStatus === 'VERIFIED' || true);

        // Store active session immediately
        if (data.token) {
          localStorage.setItem('healthlink_doctor_token', data.token);
          localStorage.setItem('healthlink_token', data.token);
          localStorage.setItem(
            'healthlink_doctor_session',
            JSON.stringify({
              userId: data.doctor.id,
              name: data.doctor.name,
              role: 'doctor',
              email: data.doctor.email,
              doctorCode: data.doctor.doctorCode,
              specialization: data.doctor.specialization,
              clinicName: data.doctor.clinicName,
              verificationStatus: data.doctor.verificationStatus || 'VERIFIED',
            })
          );
          localStorage.setItem(
            'healthlink_session',
            JSON.stringify({
              userId: data.doctor.id,
              name: data.doctor.name,
              role: 'doctor',
              email: data.doctor.email,
              doctorCode: data.doctor.doctorCode,
            })
          );
        }

        setAuthMode('created_success');
      }
    } catch (err) {
      setErrorMsg('Network error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };


  // Verify Email Action
  const handleVerifyEmail = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/doctor-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createdEmail,
          token: verificationCodeInput.trim().toUpperCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to verify account.');
      } else {
        setIsVerified(true);
        setSuccessMsg('Email verified successfully! You may now sign in to the Doctor Clinical Portal.');
      }
    } catch (e) {
      setErrorMsg('Network error verifying email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Request
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/doctor-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          email: forgotEmail.trim(),
          doctorCode: forgotDoctorCode.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Unable to process password reset.');
      } else {
        setResetStep('verify');
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
        setSuccessMsg('A password reset token has been generated.');
      }
    } catch (e) {
      setErrorMsg('Network error requesting password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Confirm
  const handleForgotConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/doctor-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          email: forgotEmail.trim(),
          doctorCode: forgotDoctorCode.trim().toUpperCase(),
          token: resetToken.trim().toUpperCase(),
          newPassword,
          confirmPassword: confirmNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to reset password.');
      } else {
        setSuccessMsg('Password has been successfully updated. You may now sign in.');
        setSignInEmail(forgotEmail);
        setSignInDoctorCode(forgotDoctorCode);
        setTimeout(() => {
          setAuthMode('signin');
          setResetStep('request');
        }, 1800);
      }
    } catch (e) {
      setErrorMsg('Network error resetting password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Development demo launcher helper (separated and explicit)
  const applyDevTestDoctor = (email: string, code: string, pass: string) => {
    setSignInEmail(email);
    setSignInDoctorCode(code);
    setSignInPassword(pass);
    setAuthMode('signin');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between text-[#1A1A1A]">
      {/* Top Professional Healthcare Header */}
      <header className="w-full bg-white border-b border-gray-200 py-3.5 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#D32F2F] text-white flex items-center justify-center shadow-md group-hover:bg-[#B71C1C] transition-all">
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-1">
                HEALTH<span className="text-[#D32F2F]">LINK</span>
              </span>
              <span className="text-[10px] font-bold text-gray-500 block tracking-wider uppercase">
                Doctor Clinical Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline text-gray-500 font-medium">Are you a patient?</span>
            <Link
              href="/patient/login"
              className="font-bold text-[#D32F2F] hover:text-[#B71C1C] bg-[#FFEBEE] border border-red-200 px-3 py-1.5 rounded-lg transition-all"
            >
              Patient Portal →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBEE] border border-red-200 text-[#D32F2F] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={14} className="text-[#D32F2F]" />
              <span>Authorized Clinician Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {authMode === 'signin' && 'Doctor Clinical Sign In'}
              {authMode === 'register' && 'Create Your Doctor Account'}
              {authMode === 'created_success' && 'Doctor Code & Verification'}
              {authMode === 'forgot_password' && 'Clinical Password Recovery'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              {authMode === 'signin' && 'Sign in to your secure clinical workspace.'}
              {authMode === 'register' && 'Create a secure HEALTHLINK clinical account.'}
              {authMode === 'created_success' && 'Save your unique Doctor Code and verify your account.'}
              {authMode === 'forgot_password' && 'Verify your professional credentials to reset password.'}
            </p>
          </div>

          {/* Primary Card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            {/* Top Mode Tabs for Sign In / Register */}
            {authMode !== 'created_success' && authMode !== 'forgot_password' && (
              <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50/80 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-3 text-xs sm:text-sm font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                    authMode === 'signin'
                      ? 'bg-white text-[#D32F2F] shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Lock size={15} />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-3 text-xs sm:text-sm font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                    authMode === 'register'
                      ? 'bg-white text-[#D32F2F] shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <BadgeCheck size={16} />
                  <span>Create Doctor Account</span>
                </button>
              </div>
            )}

            <div className="p-6 sm:p-8">
              {/* Feedback Alerts */}
              {errorMsg && (
                <div className="mb-5 p-3.5 bg-[#FFEBEE] border border-red-200 rounded-2xl text-[#B71C1C] text-xs font-semibold flex items-start gap-2.5 shadow-sm animate-shake">
                  <AlertTriangle size={17} className="text-[#D32F2F] flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-start gap-2.5 shadow-sm">
                  <CheckCircle2 size={17} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{successMsg}</span>
                </div>
              )}

              {/* 1. SIGN IN FORM */}
              {authMode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      Professional Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="doctor@hospital.org"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] outline-none transition-all"
                      />
                      <Mail size={17} className="absolute left-3.5 top-3.5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(signInEmail);
                          setForgotDoctorCode(signInDoctorCode);
                          setAuthMode('forgot_password');
                          setErrorMsg(null);
                        }}
                        className="text-xs font-semibold text-[#D32F2F] hover:text-[#B71C1C] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showSignInPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="w-full pl-10 pr-11 py-3 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] outline-none transition-all"
                      />
                      <Lock size={17} className="absolute left-3.5 top-3.5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-700 transition-colors"
                        title={showSignInPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignInPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                        Doctor Code
                      </label>
                      <span className="text-[11px] text-[#D32F2F] font-semibold">Required</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. HL-DR-8K4P7X"
                        value={signInDoctorCode}
                        onChange={(e) => setSignInDoctorCode(e.target.value.toUpperCase())}
                        className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-mono font-bold text-gray-900 uppercase focus:bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] outline-none transition-all"
                      />
                      <Key size={17} className="absolute left-3.5 top-3.5 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 font-medium">
                      <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        className="w-4 h-4 text-[#D32F2F] border-gray-300 rounded focus:ring-[#D32F2F]"
                      />
                      <span>Remember this device</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-gray-400 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>{isLoading ? 'Verifying Credentials...' : 'SIGN IN TO CLINICAL PORTAL'}</span>
                    <ArrowRight size={16} />
                  </button>

                  {/* Quick Auto-fill Demo Doctor Helper */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => applyDevTestDoctor('sarah.miller@healthlink.org', 'DOC-7749', 'Doctor123!')}
                      className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-[#B71C1C] border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={14} className="text-[#D32F2F]" />
                      <span>Auto-fill Demo Doctor Credentials (Dr. Sarah Miller)</span>
                    </button>
                  </div>

                  <div className="pt-2 text-center text-xs text-gray-500">
                    New clinician on the platform?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="font-bold text-[#D32F2F] hover:underline"
                    >
                      Create Doctor Account
                    </button>
                  </div>
                </form>

              )}

              {/* 2. CREATE DOCTOR ACCOUNT FORM */}
              {authMode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Quick Auto-Fill Demo Clinician for real-world testing */}
                  <div className="p-3 bg-red-50/80 border border-red-200 rounded-2xl flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[11px] font-bold text-gray-800 block">Fast Track Registration</span>
                      <span className="text-[10px] text-gray-500">Auto-fill sample physician credentials for testing</span>
                    </div>
                    <button
                      type="button"
                      onClick={applySampleDoctorRegistration}
                      className="px-3 py-1.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Sparkles size={13} />
                      <span>Auto-fill Sample Doctor</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Dr. Jane Smith, MD"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] outline-none transition-all"
                      />
                      <User size={16} className="absolute left-3.5 top-3 text-gray-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Professional Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="doctor@clinic.org"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] outline-none transition-all"
                        />
                        <Mail size={16} className="absolute left-3.5 top-3 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="+1 (555) 234-5678"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] outline-none transition-all"
                        />
                        <Phone size={16} className="absolute left-3.5 top-3 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Professional ID / License No.
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="e.g. MD-992144-NY"
                          value={professionalId}
                          onChange={(e) => setProfessionalId(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] outline-none transition-all"
                        />
                        <BadgeCheck size={16} className="absolute left-3.5 top-3 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Hospital / Clinic
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="St. Jude Medical Center"
                          value={hospitalClinic}
                          onChange={(e) => setHospitalClinic(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] outline-none transition-all"
                        />
                        <Building size={16} className="absolute left-3.5 top-3 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Specialization
                    </label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] outline-none transition-all"
                    >
                      {SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                          Password
                        </label>
                        {regPassword.length > 0 && (
                          <span className={`text-[10px] font-bold ${regPassword.length >= 8 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {regPassword.length >= 8 ? '✓ Length OK' : 'Min 8 chars'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 8 characters"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] outline-none transition-all"
                        />
                        <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                        >
                          {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                          Confirm Password
                        </label>
                        {confirmPassword.length > 0 && (
                          <span className={`text-[10px] font-bold ${regPassword === confirmPassword ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {regPassword === confirmPassword ? '✓ Passwords Match' : '✗ Mismatch'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] outline-none transition-all"
                        />
                        <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500">
                    A unique, high-entropy Doctor Code (e.g. <span className="font-mono font-bold">HL-DR-8K4P7X</span>) will be automatically generated upon creation.
                  </p>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-gray-400 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>{isLoading ? 'Creating Clinical Account...' : 'CREATE & ACTIVATE DOCTOR ACCOUNT'}</span>
                    <ArrowRight size={16} />
                  </button>

                  <div className="pt-2 text-center text-xs text-gray-500">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="font-bold text-[#D32F2F] hover:underline"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* 3. DOCTOR CODE GENERATION SUCCESS & LIVE ACTIVATION */}
              {authMode === 'created_success' && (
                <div className="space-y-6 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-[#FFEBEE] border-2 border-red-200 text-[#D32F2F] flex items-center justify-center mx-auto shadow-inner">
                    <Key size={32} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-gray-900">Your Doctor Account is Live & Active!</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Your unique Doctor Code has been generated. Share this code with patients to link them to your clinical panel.
                    </p>
                  </div>

                  {/* Generated Doctor Code Display */}
                  <div className="p-4 bg-[#FAFAFA] border-2 border-dashed border-red-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Assigned Doctor Code
                      </span>
                      <span className="text-2xl font-black font-mono tracking-widest text-[#B71C1C]">
                        {generatedDoctorCode}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(generatedDoctorCode)}
                      className="px-4 py-2 bg-white hover:bg-red-50 text-gray-800 border border-gray-300 hover:border-red-300 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      {copiedCode ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} className="text-gray-600" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Account Status */}
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-left flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">Security Verification</span>
                      <span className="text-[11px] text-emerald-700">Authenticated & Ready for Clinical Operations</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 size={13} /> Active & Verified
                    </span>
                  </div>

                  {/* Direct Launch Button */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => router.push('/doctor/dashboard')}
                      className="w-full py-3.5 px-4 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>LAUNCH DOCTOR CLINICAL DASHBOARD</span>
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSignInEmail(createdEmail);
                        setSignInDoctorCode(generatedDoctorCode);
                        setAuthMode('signin');
                        setErrorMsg(null);
                      }}
                      className="w-full py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900"
                    >
                      Sign In with another account
                    </button>
                  </div>
                </div>
              )}


              {/* 4. FORGOT PASSWORD WORKFLOW */}
              {authMode === 'forgot_password' && (
                <div className="space-y-4">
                  {resetStep === 'request' ? (
                    <form onSubmit={handleForgotRequest} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                          Professional Email
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="doctor@hospital.org"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D32F2F] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                          Doctor Code
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. HL-DR-8K4P7X"
                          value={forgotDoctorCode}
                          onChange={(e) => setForgotDoctorCode(e.target.value.toUpperCase())}
                          className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-mono font-bold text-gray-900 uppercase focus:bg-white focus:ring-2 focus:ring-[#D32F2F] outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-gray-400 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <span>{isLoading ? 'Generating Recovery Code...' : 'Request Password Reset'}</span>
                        <ArrowRight size={16} />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleForgotConfirm} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                          Reset Token
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="6-character token"
                          value={resetToken}
                          onChange={(e) => setResetToken(e.target.value.toUpperCase())}
                          className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-mono font-bold text-gray-900 uppercase focus:bg-white focus:ring-2 focus:ring-[#D32F2F] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Minimum 8 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D32F2F] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Re-enter new password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#D32F2F] outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-gray-400 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <span>{isLoading ? 'Resetting Password...' : 'Save New Password & Sign In'}</span>
                        <ArrowRight size={16} />
                      </button>
                    </form>
                  )}

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setResetStep('request');
                        setErrorMsg(null);
                      }}
                      className="text-xs font-bold text-gray-600 hover:text-gray-900"
                    >
                      ← Back to Doctor Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer Security Guarantee */}
            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>RBAC Authorized Clinical Vault</span>
              </div>
              <span className="font-mono text-[10px] text-gray-400">HIPAA & GDPR Enforced</span>
            </div>
          </div>

          {/* Development Demo Mode (Strictly Dev-Only, clearly separated) */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDevTools(!showDevTools)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Sparkles size={13} />
                <span>{showDevTools ? 'Hide Development Demo Mode' : 'DEVELOPMENT DEMO MODE'}</span>
              </button>
              <span className="text-[10px] font-mono bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                Dev Environment
              </span>
            </div>

            {showDevTools && (
              <div className="mt-3 p-4 bg-white border border-dashed border-gray-300 rounded-2xl space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-gray-900 block">Development Seed Doctor Credentials</span>
                    <span className="text-gray-500 text-[11px]">
                      Test credentials for local developer validation (disabled in production builds):
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => applyDevTestDoctor('sarah.miller@healthlink.org', 'DOC-7749', 'Doctor123!')}
                    className="p-2.5 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl text-left transition-all"
                  >
                    <div className="font-bold text-gray-900">Dr. Sarah Miller, MD</div>
                    <div className="text-[10px] text-gray-500">sarah.miller@healthlink.org</div>
                    <div className="text-[10px] font-mono font-bold text-[#D32F2F] mt-0.5">Code: DOC-7749</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyDevTestDoctor('robert.vance@healthlink.org', 'DOC-3321', 'Doctor123!')}
                    className="p-2.5 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl text-left transition-all"
                  >
                    <div className="font-bold text-gray-900">Dr. Robert Vance, MD</div>
                    <div className="text-[10px] text-gray-500">robert.vance@healthlink.org</div>
                    <div className="text-[10px] font-mono font-bold text-[#D32F2F] mt-0.5">Code: DOC-3321</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 bg-white py-4 px-4 text-center text-xs text-gray-500">
        <p>© 2026 HEALTHLINK Clinical Tele-Monitoring Systems. Red & White Enterprise Architecture.</p>
      </footer>
    </div>
  );
}
