'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { DoctorNav } from '@/components/doctor/DoctorNav';
import { DoctorBottomNav } from '@/components/doctor/DoctorBottomNav';
import {
  User,
  Mail,
  Phone,
  Building,
  BadgeCheck,
  Key,
  ShieldCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit3,
  Save,
  ArrowLeft,
  Calendar,
  Activity,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export default function DoctorProfilePage() {
  const router = useRouter();

  const [doctor, setDoctor] = useState<any>(null);
  const [stats, setStats] = useState({ totalPatients: 0, activeAlerts: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSpecialization, setEditSpecialization] = useState('');
  const [editClinic, setEditClinic] = useState('');
  const [editLicense, setEditLicense] = useState('');

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const token =
        localStorage.getItem('healthlink_doctor_token') ||
        localStorage.getItem('healthlink_token');

      if (!token) {
        router.push('/doctor/login');
        return;
      }

      const res = await fetch('/api/doctor/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/doctor/login');
          return;
        }
        setErrorMsg('Failed to load profile.');
      } else {
        const data = await res.json();
        setDoctor(data.doctor);
        if (data.stats) setStats(data.stats);

        setEditName(data.doctor.name || '');
        setEditPhone(data.doctor.phone || '');
        setEditSpecialization(data.doctor.specialization || data.doctor.specialty || '');
        setEditClinic(data.doctor.clinicName || '');
        setEditLicense(data.doctor.professionalId || data.doctor.licenseNumber || '');
      }
    } catch (e) {
      setErrorMsg('Network error loading doctor profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setFeedbackMsg(null);

    try {
      const token =
        localStorage.getItem('healthlink_doctor_token') ||
        localStorage.getItem('healthlink_token');

      const res = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          specialization: editSpecialization,
          clinicName: editClinic,
          professionalId: editLicense,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to update profile.');
      } else {
        setDoctor(data.doctor);
        setIsEditing(false);
        setFeedbackMsg('Profile updated successfully.');

        // Update local session
        const sessStr = localStorage.getItem('healthlink_doctor_session');
        if (sessStr) {
          try {
            const sess = JSON.parse(sessStr);
            sess.name = data.doctor.name;
            sess.specialization = data.doctor.specialization;
            sess.clinicName = data.doctor.clinicName;
            localStorage.setItem('healthlink_doctor_session', JSON.stringify(sess));
          } catch (e) {}
        }
      }
    } catch (e) {
      setErrorMsg('Network error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-16 md:pb-12 text-[#1A1A1A]">
      <Header portalType="doctor" userName={doctor?.name} isOnline={true} />
      <DoctorNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/doctor/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#D32F2F] bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm transition-all"
          >
            <ArrowLeft size={14} />
            <span>Back to Clinical Dashboard</span>
          </Link>

          <Link
            href="/doctor/security"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D32F2F] bg-[#FFEBEE] border border-red-200 px-3 py-1.5 rounded-xl transition-all"
          >
            <ShieldCheck size={14} />
            <span>Security Settings</span>
          </Link>
        </div>

        {feedbackMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check size={16} className="text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-[#FFEBEE] border border-red-200 rounded-2xl text-[#B71C1C] text-xs font-semibold flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#D32F2F]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="p-16 text-center text-gray-400 text-sm bg-white rounded-3xl border border-gray-200 animate-pulse">
            Loading Doctor Profile Credentials...
          </div>
        ) : doctor ? (
          <div className="space-y-6">
            {/* Top Identity Hero Card */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 rounded-3xl bg-[#D32F2F] text-white flex items-center justify-center text-3xl font-black shadow-lg">
                  {doctor.name?.replace('Dr. ', '').charAt(0) || 'D'}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                      {doctor.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <BadgeCheck size={13} className="text-emerald-600" />
                      <span>Verified Clinician</span>
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#D32F2F] mt-1">
                    {doctor.specialization || doctor.specialty || 'General Practitioner'}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <Building size={13} />
                    <span>{doctor.clinicName}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit3 size={14} />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
              </div>
            </div>

            {/* Doctor Code & Security Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Doctor Code Card */}
              <div className="bg-[#FFEBEE] border border-red-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#B71C1C] uppercase tracking-wider">
                      Your Doctor Code
                    </span>
                    <Key size={18} className="text-[#D32F2F]" />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Used by patients to connect with your clinical panel. Keep securely confidential.
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-red-200 flex items-center justify-between">
                  <span className="text-xl font-black font-mono tracking-widest text-[#B71C1C]">
                    {showCode ? doctor.doctorCode : '••••••••••••'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowCode(!showCode)}
                      className="p-1.5 bg-white hover:bg-red-100 border border-red-200 rounded-lg text-gray-700"
                      title={showCode ? 'Hide Code' : 'Reveal Code'}
                    >
                      {showCode ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(doctor.doctorCode)}
                      className="p-1.5 bg-white hover:bg-red-100 border border-red-200 rounded-lg text-gray-700"
                      title="Copy Doctor Code"
                    >
                      {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel Stats Card */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Authorized Patient Panel
                  </span>
                  <div className="text-3xl font-black text-gray-900 mt-2">
                    {stats.totalPatients} <span className="text-sm font-medium text-gray-500">Patients</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                  <span>Assigned Tele-Monitoring</span>
                  <Link href="/doctor/dashboard#patients" className="font-bold text-[#D32F2F] hover:underline">
                    View List →
                  </Link>
                </div>
              </div>

              {/* Attention Alerts Card */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Active Clinical Alerts
                  </span>
                  <div className="text-3xl font-black text-[#D32F2F] mt-2">
                    {stats.activeAlerts} <span className="text-sm font-medium text-gray-500">Alerts</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                  <span>Clinical Attention Center</span>
                  <Link href="/doctor/alerts" className="font-bold text-[#D32F2F] hover:underline">
                    Manage Alerts →
                  </Link>
                </div>
              </div>
            </div>

            {/* Profile Details / Edit Form */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  Professional Credentials & Details
                </h2>
                {isEditing && (
                  <span className="text-xs font-bold text-[#D32F2F]">Editing Mode Active</span>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Full Name & Title
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#D32F2F] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        required
                        value={editSpecialization}
                        onChange={(e) => setEditSpecialization(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#D32F2F] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Hospital / Clinic
                      </label>
                      <input
                        type="text"
                        required
                        value={editClinic}
                        onChange={(e) => setEditClinic(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#D32F2F] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Professional ID / Registration No.
                      </label>
                      <input
                        type="text"
                        required
                        value={editLicense}
                        onChange={(e) => setEditLicense(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#D32F2F] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#D32F2F] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                        Professional Email (Read-Only)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={doctor.email}
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-gray-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Save size={14} />
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Professional Email
                    </span>
                    <span className="font-semibold text-gray-900 flex items-center gap-2">
                      <Mail size={15} className="text-gray-400" />
                      {doctor.email}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Phone Number
                    </span>
                    <span className="font-semibold text-gray-900 flex items-center gap-2">
                      <Phone size={15} className="text-gray-400" />
                      {doctor.phone || 'Not specified'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Professional ID / License
                    </span>
                    <span className="font-mono font-bold text-gray-900 flex items-center gap-2">
                      <BadgeCheck size={15} className="text-[#D32F2F]" />
                      {doctor.professionalId || doctor.licenseNumber || 'MD-HEALTHLINK-NY'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Registration Date
                    </span>
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <Calendar size={15} className="text-gray-400" />
                      {new Date(doctor.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>

      <DoctorBottomNav />
    </div>
  );
}
