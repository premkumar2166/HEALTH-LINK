'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { DoctorNav } from '@/components/doctor/DoctorNav';
import { DoctorBottomNav } from '@/components/doctor/DoctorBottomNav';
import {
  ShieldCheck,
  Lock,
  Key,
  Smartphone,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Eye,
  EyeOff,
  Clock,
  Laptop,
} from 'lucide-react';

export default function DoctorSecurityPage() {
  const router = useRouter();

  const [securityData, setSecurityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Feedback State
  const [passFeedback, setPassFeedback] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [mfaFeedback, setMfaFeedback] = useState<string | null>(null);

  const fetchSecurity = async () => {
    try {
      const token =
        localStorage.getItem('healthlink_doctor_token') ||
        localStorage.getItem('healthlink_token');

      if (!token) {
        router.push('/doctor/login');
        return;
      }

      const res = await fetch('/api/doctor/security', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) router.push('/doctor/login');
      } else {
        const data = await res.json();
        setSecurityData(data.security);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurity();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassFeedback(null);

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPassError('New password must be at least 8 characters long.');
      return;
    }

    setIsChangingPass(true);

    try {
      const token =
        localStorage.getItem('healthlink_doctor_token') ||
        localStorage.getItem('healthlink_token');

      const res = await fetch('/api/doctor/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPassError(data.error || 'Failed to update password.');
      } else {
        setPassFeedback('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        fetchSecurity();
      }
    } catch (e) {
      setPassError('Network error while changing password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleToggleMfa = async () => {
    try {
      const token =
        localStorage.getItem('healthlink_doctor_token') ||
        localStorage.getItem('healthlink_token');

      const nextState = !securityData?.mfaEnabled;

      const res = await fetch('/api/doctor/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'toggle_mfa',
          mfaEnabled: nextState,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSecurityData({ ...securityData, mfaEnabled: data.mfaEnabled });
        setMfaFeedback(data.message);
        setTimeout(() => setMfaFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-16 md:pb-12 text-[#1A1A1A]">
      <Header portalType="doctor" isOnline={true} />
      <DoctorNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/doctor/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#D32F2F] bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm transition-all"
          >
            <ArrowLeft size={14} />
            <span>Back to Doctor Profile</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <ShieldCheck size={14} />
            <span>Clinical Security Center</span>
          </span>
        </div>

        <div className="space-y-6">
          {/* Header Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Security & Access Controls
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage clinical account credentials, two-factor authentication, and audit history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Change Password */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-gray-900 font-extrabold text-base border-b border-gray-100 pb-3">
                <Lock size={18} className="text-[#D32F2F]" />
                <span>Change Account Password</span>
              </div>

              {passFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>{passFeedback}</span>
                </div>
              )}

              {passError && (
                <div className="p-3 bg-[#FFEBEE] border border-red-200 rounded-xl text-[#B71C1C] text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={15} className="text-[#D32F2F]" />
                  <span>{passError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#D32F2F] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                    >
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full px-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#D32F2F] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#D32F2F] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-gray-400 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {isChangingPass ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* 2. Multi-Factor Authentication & Device Session */}
            <div className="space-y-6">
              {/* MFA Card */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 text-gray-900 font-extrabold text-base">
                    <Smartphone size={18} className="text-[#D32F2F]" />
                    <span>Two-Factor Authentication</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      securityData?.mfaEnabled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {securityData?.mfaEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  Require secondary verification on untrusted devices to protect sensitive clinical health records.
                </p>

                {mfaFeedback && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl">
                    {mfaFeedback}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleToggleMfa}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                    securityData?.mfaEnabled
                      ? 'bg-gray-50 border-gray-300 text-gray-800 hover:bg-gray-100'
                      : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {securityData?.mfaEnabled ? 'Disable MFA' : 'Enable Two-Factor Authentication'}
                </button>
              </div>

              {/* Current Device Session */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-gray-900 font-extrabold text-base border-b border-gray-100 pb-3">
                  <Laptop size={18} className="text-gray-700" />
                  <span>Active Device Session</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900 block">Current Web Browser Session</span>
                    <span className="text-gray-500 text-[11px]">JWT Clinical Session • 256-Bit Encrypted</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Now
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Recent Doctor Audit Logs */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-gray-900 font-extrabold text-base">
                <History size={18} className="text-[#D32F2F]" />
                <span>Recent Clinical Access & Audit Trail</span>
              </div>
              <Link href="/doctor/reports" className="text-xs font-bold text-[#D32F2F] hover:underline">
                Full Audit Trail →
              </Link>
            </div>

            {securityData?.recentActivity && securityData.recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {securityData.recentActivity.map((log: any) => (
                  <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900">{log.action}</span>
                      <span className="text-gray-500 ml-2">{log.details || log.resource}</span>
                    </div>
                    <span className="text-gray-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-4">No recent security events logged.</p>
            )}
          </div>
        </div>
      </main>

      <DoctorBottomNav />
    </div>
  );
}
