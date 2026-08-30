'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { PatientNav } from '@/components/patient/PatientNav';
import { PatientAuthGuard } from '@/components/patient/PatientAuthGuard';
import { PhotoUploadModal } from '@/components/patient/PhotoUploadModal';
import { EditProfileModal } from '@/components/patient/EditProfileModal';
import { ViewDoctorModal } from '@/components/patient/ViewDoctorModal';
import { ChangePasswordModal } from '@/components/patient/ChangePasswordModal';
import { DataPrivacyModal } from '@/components/patient/DataPrivacyModal';
import { DeleteRequestModal } from '@/components/patient/DeleteRequestModal';
import { LogoutConfirmModal } from '@/components/patient/LogoutConfirmModal';
import { Patient3DHealthBadge } from '@/components/3d/Patient3DHealthBadge';
import { Patient, Doctor, HealthMeasurement, AuditLog } from '@/types/healthlink';
import {
  User,
  Camera,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Key,
  Calendar,
  Activity,
  Scale,
  Heart,
  Thermometer,
  Lock,
  Download,
  FileText,
  Clock,
  LogOut,
  Edit3,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function PatientProfilePage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<any | null>(null);
  const [latestMeasurement, setLatestMeasurement] = useState<HealthMeasurement | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityData, setSecurityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isViewDoctorModalOpen, setIsViewDoctorModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // UI state
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showDoctorCode, setShowDoctorCode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('healthlink_token');
      const res = await fetch('/api/patient/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPatient(data.patient);
        setDoctor(data.doctor);
        setLatestMeasurement(data.latestMeasurement);
        setAuditLogs(data.auditLogs || []);
        setSecurityData(data.security);
      }
    } catch (e) {
      console.error('Error loading patient profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handlePhotoSaved = async (photoDataUrl: string) => {
    try {
      const token = localStorage.getItem('healthlink_token');
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profilePhoto: photoDataUrl }),
      });

      if (res.ok) {
        const data = await res.json();
        setPatient(data.patient);
        showToast('Profile photo updated successfully in secure storage.');
      }
    } catch (e) {
      showToast('Unable to update photo right now. Please try again.');
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const token = localStorage.getItem('healthlink_token');
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profilePhoto: '' }),
      });

      if (res.ok) {
        const data = await res.json();
        setPatient(data.patient);
        showToast('Profile photo removed.');
      }
    } catch (e) {
      showToast('Error removing photo.');
    }
  };

  const handleDownloadData = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('healthlink_token');
      const res = await fetch('/api/patient/export', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `healthlink_patient_${patient?.id || 'record'}_export.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('Personal health record exported successfully.');
      }
    } catch (e) {
      showToast('Failed to generate export file.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSignOutOtherDevices = async () => {
    try {
      const token = localStorage.getItem('healthlink_token');
      const res = await fetch('/api/patient/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'TERMINATE_OTHER_SESSIONS' }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Other remote sessions signed out.');
      }
    } catch (e) {
      showToast('Failed to sign out other devices.');
    }
  };

  const lastProfileUpdateFormatted = patient?.updatedAt
    ? new Date(patient.updatedAt).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Recent';

  const lastVitalsUpdateFormatted = latestMeasurement?.timestamp
    ? new Date(latestMeasurement.timestamp).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'No entries recorded';

  return (
    <PatientAuthGuard>
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-24 md:pb-12 text-[#1A1A1A]">
        {/* Header */}
        <Header
          portalType="patient"
          userName={patient?.name || 'John Doe'}
          assignedDoctorName={doctor?.name || 'Dr. Sarah Miller, MD'}
          isOnline={true}
        />

        {/* Navigation */}
        <PatientNav userName={patient?.name || 'John Doe'} />

        {/* Success Toast */}
        {successToast && (
          <div className="fixed top-20 right-4 z-50 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl shadow-xl text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-fade-in max-w-sm">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* 1. Page Title & Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-extrabold uppercase tracking-wider mb-2">
                <Heart size={14} className="fill-red-600 text-red-600" />
                <span>HEALTHLINK Healthcare Identity</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Patient Identity & Health Profile
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Manage your profile details and private clinical profile information securely.
              </p>
            </div>

            {/* Quick Log Out Action in Header */}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="self-start sm:self-center px-4 py-2.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 hover:border-red-600 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-2"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>

          {/* 2. Premium Profile Header Card */}
          <div className="bg-white rounded-3xl border border-red-100 shadow-health-md p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
              {/* Photo & Main Identity */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                {/* Profile Photo with placeholder support */}
                <div className="relative group">
                  <div className="w-28 h-28 rounded-3xl bg-red-50 border-2 border-red-200 flex items-center justify-center overflow-hidden shadow-md">
                    {patient?.profilePhoto ? (
                      <img
                        src={patient.profilePhoto}
                        alt="Patient Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-red-400 p-2">
                        <User size={42} className="stroke-[1.5]" />
                        <span className="text-[9px] font-bold text-red-500 mt-1 text-center leading-tight">
                          Upload Photo
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="absolute -bottom-2 -right-2 p-2 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-all"
                    title="Change Photo"
                    aria-label="Change photo"
                  >
                    <Camera size={14} />
                  </button>
                </div>

                {/* Identity Info */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                      {patient?.name || 'John Doe'}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 font-medium space-y-0.5">
                    <div>
                      Patient ID:{' '}
                      <span className="font-mono font-bold text-gray-800">
                        {patient?.id ? `HL-PATIENT-${patient.id.replace('pat-', '').padStart(4, '0')}` : 'HL-PATIENT-0001'}
                      </span>
                    </div>
                    <div>
                      Assigned Doctor:{' '}
                      <strong className="text-gray-900">{doctor?.name || 'Dr. Sarah Miller, MD'}</strong>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Last Profile Update: {lastProfileUpdateFormatted}
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Actions Button Group */}
              <div className="flex flex-wrap sm:flex-col gap-2 justify-center sm:justify-start sm:min-w-[160px]">
                <button
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow-red-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Camera size={14} />
                  <span>{patient?.profilePhoto ? 'Change Photo' : 'Upload Photo'}</span>
                </button>

                {patient?.profilePhoto && (
                  <button
                    onClick={handleRemovePhoto}
                    className="py-2.5 px-3 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 font-bold text-xs rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    <span>Remove Photo</span>
                  </button>
                )}

                <button
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="flex-1 py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-800 font-extrabold text-xs rounded-xl border border-gray-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit3 size={14} className="text-red-600" />
                  <span>Edit Details</span>
                </button>
              </div>
            </div>

            {/* Photo Security Notice */}
            <p className="text-[11px] text-gray-500 pt-4 leading-relaxed flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Privacy Standard:</strong> Profile photos are private healthcare-related identity data used for clinician verification during telehealth sessions. Not used for autonomous medical diagnosis.
              </span>
            </p>
          </div>

          {/* 3. Personal Details Section */}
          <div className="bg-white rounded-3xl border border-red-100 shadow-health-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <User size={18} className="text-red-600" />
                  <span>Personal Information</span>
                </h3>
                <p className="text-xs text-gray-500">Your personal details and primary contact information.</p>
              </div>
              <button
                onClick={() => setIsEditProfileModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-extrabold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all flex items-center gap-1"
              >
                <Edit3 size={13} />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200">
                <span className="text-gray-400 font-bold block mb-1">Full Legal Name</span>
                <span className="text-sm font-extrabold text-gray-900">{patient?.name || 'John Doe'}</span>
              </div>

              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200">
                <span className="text-gray-400 font-bold block mb-1">Date of Birth</span>
                <span className="text-sm font-extrabold text-gray-900 font-mono">
                  {patient?.dateOfBirth || '1984-06-15'}
                </span>
              </div>

              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200">
                <span className="text-gray-400 font-bold block mb-1">Gender</span>
                <span className="text-sm font-extrabold text-gray-900">{patient?.gender || 'Male'}</span>
              </div>

              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200">
                <span className="text-gray-400 font-bold block mb-1">Email Address</span>
                <span className="text-sm font-extrabold text-gray-900 truncate block font-mono">
                  {patient?.email || 'john.doe@patient.healthlink'}
                </span>
              </div>

              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200">
                <span className="text-gray-400 font-bold block mb-1">Phone Number</span>
                <span className="text-sm font-extrabold text-gray-900 font-mono">
                  {patient?.phoneNumber || '+1 (555) 019-2834'}
                </span>
              </div>

              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200">
                <span className="text-gray-400 font-bold block mb-1">Preferred Language</span>
                <span className="text-sm font-extrabold text-gray-900">
                  {patient?.preferredLanguage || 'English (US)'}
                </span>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-4 bg-[#FFEBEE]/50 rounded-2xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-red-700 font-bold block mb-0.5">Emergency Contact</span>
                <span className="font-extrabold text-gray-900">
                  {patient?.emergencyContact?.name || 'Jane Doe'} ({patient?.emergencyContact?.relationship || 'Spouse'})
                </span>
                <span className="text-gray-600 ml-2 font-mono font-bold">
                  {patient?.emergencyContact?.phone || '+1 (555) 234-5678'}
                </span>
              </div>
              {patient?.isContactVerified ?? (patient?.email && patient?.phoneNumber) ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  <span>✓ Verified Contact</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  <ShieldAlert size={14} className="text-amber-700" />
                  <span>⚠ Verification Required</span>
                </span>
              )}
            </div>
          </div>


          {/* 4. Connected Doctor Section */}
          <div className="bg-white rounded-3xl border border-red-100 shadow-health-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Stethoscope size={18} className="text-red-600" />
                  <span>Connected Doctor</span>
                </h3>
                <p className="text-xs text-gray-500">Your assigned clinical physician and telehealth provider.</p>
              </div>
              <button
                onClick={() => setIsViewDoctorModalOpen(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Stethoscope size={14} />
                <span>View Doctor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200">
                <span className="text-gray-400 font-bold block mb-1">Doctor Name</span>
                <span className="text-sm font-extrabold text-gray-900">{doctor?.name || 'Dr. Sarah Miller, MD'}</span>
              </div>

              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 font-bold">Doctor Code</span>
                  <button
                    onClick={() => setShowDoctorCode(!showDoctorCode)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title={showDoctorCode ? 'Hide Code' : 'Show Code'}
                  >
                    {showDoctorCode ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                <span className="text-sm font-mono font-extrabold text-red-600 tracking-wider">
                  {showDoctorCode ? 'DOC-7749' : '••••••••'}
                </span>
              </div>

              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200">
                <span className="text-gray-400 font-bold block mb-1">Connection Status</span>
                <span className="text-sm font-extrabold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  🟢 Connected
                </span>
              </div>

              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200">
                <span className="text-gray-400 font-bold block mb-1">Connection Date</span>
                <span className="text-sm font-extrabold text-gray-900">
                  {doctor?.connectionDate
                    ? new Date(doctor.connectionDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Jan 15, 2026'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#FAFAFA] rounded-2xl border border-gray-200 text-xs text-gray-500 flex items-center justify-between">
              <span>
                <strong>Authorization Lock:</strong> Patients are bound to their clinic provider network and cannot connect to arbitrary clinicians without medical authorization.
              </span>
              <Link
                href="/patient/chat"
                className="font-bold text-red-600 hover:underline flex items-center gap-1 ml-3 flex-shrink-0"
              >
                <span>Open Chat</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* 5. Health Profile Section (Latest Recorded Measurements) */}
          <div className="bg-white rounded-3xl border border-red-100 shadow-health-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Activity size={18} className="text-red-600" />
                  <span>Health Profile</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Latest recorded physiological measurements. Last Updated: <strong>{lastVitalsUpdateFormatted}</strong>
                </p>
              </div>

              <Link
                href="/patient/timeline"
                className="self-start sm:self-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5"
              >
                <Clock size={14} />
                <span>View Health History</span>
              </Link>
            </div>

            {/* 4 Health Indicators Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Weight */}
              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
                  <span>Body Weight</span>
                  <Scale size={16} className="text-sky-600" />
                </div>
                <div className="my-2">
                  <span className="text-2xl font-black text-gray-900 font-mono">
                    {latestMeasurement?.weight?.value || 74.4}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 ml-1">kg</span>
                </div>
                <span className="text-[11px] text-gray-400">Target: Stable Trend</span>
              </div>

              {/* Blood Pressure */}
              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
                  <span>Blood Pressure</span>
                  <Activity size={16} className="text-red-600" />
                </div>
                <div className="my-2">
                  <span className="text-2xl font-black text-gray-900 font-mono">
                    {latestMeasurement?.bloodPressure
                      ? `${latestMeasurement.bloodPressure.systolic}/${latestMeasurement.bloodPressure.diastolic}`
                      : '118/76'}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 ml-1">mmHg</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-bold">Standard Range</span>
              </div>

              {/* Temperature */}
              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
                  <span>Body Temperature</span>
                  <Thermometer size={16} className="text-amber-600" />
                </div>
                <div className="my-2">
                  <span className="text-2xl font-black text-gray-900 font-mono">
                    {latestMeasurement?.temperature?.value || 36.6}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 ml-1">°C</span>
                </div>
                <span className="text-[11px] text-gray-400">Normal Range: 36.1-37.2°C</span>
              </div>

              {/* Heart Rate */}
              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
                  <span>Heart Rate</span>
                  <Heart size={16} className="text-rose-600" />
                </div>
                <div className="my-2">
                  <span className="text-2xl font-black text-gray-900 font-mono">
                    {latestMeasurement?.heartRate || 72}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 ml-1">bpm</span>
                </div>
                <span className="text-[11px] text-gray-400">Resting Pulse</span>
              </div>
            </div>
          </div>

          {/* 6. Privacy & Data Governance */}
          <div className="bg-white rounded-3xl border border-red-100 shadow-health-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>Privacy & Data Governance</span>
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Your health information is private and can only be accessed by authorized users according to the application's access-control rules.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="p-4 bg-[#FAFAFA] hover:bg-red-50/50 rounded-2xl border border-gray-200 hover:border-red-200 transition-all text-left space-y-1 group"
              >
                <div className="font-extrabold text-gray-900 group-hover:text-red-600 flex items-center justify-between">
                  <span>Privacy Policy & Notice</span>
                  <FileText size={15} className="text-red-600" />
                </div>
                <p className="text-[11px] text-gray-500">Read HIPAA safeguards & transmission standards.</p>
              </button>

              <button
                onClick={handleDownloadData}
                disabled={isExporting}
                className="p-4 bg-[#FAFAFA] hover:bg-emerald-50/50 rounded-2xl border border-gray-200 hover:border-emerald-200 transition-all text-left space-y-1 group"
              >
                <div className="font-extrabold text-gray-900 group-hover:text-emerald-700 flex items-center justify-between">
                  <span>{isExporting ? 'Generating Bundle...' : 'Download My Data'}</span>
                  <Download size={15} className="text-emerald-600" />
                </div>
                <p className="text-[11px] text-gray-500">Export complete health record in JSON format.</p>
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-4 bg-[#FAFAFA] hover:bg-red-50 rounded-2xl border border-gray-200 hover:border-red-300 transition-all text-left space-y-1 group"
              >
                <div className="font-extrabold text-gray-900 group-hover:text-red-700 flex items-center justify-between">
                  <span>Request Data Deletion</span>
                  <Trash2 size={15} className="text-red-600" />
                </div>
                <p className="text-[11px] text-gray-500">Submit formal HIPAA record purge request.</p>
              </button>
            </div>

            {/* Audit History Snapshot */}
            <div className="pt-2 border-t border-gray-100">
              <h4 className="text-xs font-extrabold text-gray-900 mb-3 flex items-center gap-1.5">
                <Clock size={14} className="text-red-600" />
                <span>Recent Security & Activity History</span>
              </h4>
              <div className="space-y-2">
                {auditLogs.slice(0, 3).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-[#FAFAFA] rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-900">{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-[11px] text-gray-500 block">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7. Account Security & Session Management */}
          <div className="bg-white rounded-3xl border border-red-100 shadow-health-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Lock size={18} className="text-red-600" />
                  <span>Account Security</span>
                </h3>
                <p className="text-xs text-gray-500">Manage credentials, active tokens, and sign out devices.</p>
              </div>
              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
              >
                <Key size={13} />
                <span>Change Password</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200">
                <span className="text-gray-400 font-bold block mb-1">Authentication Status</span>
                <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>SHA-256 JWT Encrypted</span>
                </span>
              </div>

              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200">
                <span className="text-gray-400 font-bold block mb-1">Last Login</span>
                <span className="text-sm font-extrabold text-gray-900 font-mono">
                  {patient?.lastLogin
                    ? new Date(patient.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Active Session'}
                </span>
              </div>

              <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200">
                <span className="text-gray-400 font-bold block mb-1">Active Sessions</span>
                <span className="text-sm font-extrabold text-gray-900 flex items-center gap-1">
                  <Smartphone size={14} className="text-gray-400" />
                  <span>1 Current Device</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleSignOutOtherDevices}
                className="text-xs font-bold text-gray-700 hover:text-red-700 bg-gray-100 hover:bg-red-50 border border-gray-200 px-4 py-2.5 rounded-xl transition-all"
              >
                Sign Out Other Devices
              </button>

              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-red-600/30 transition-all flex items-center gap-2"
              >
                <LogOut size={14} />
                <span>Log Out of Patient Account</span>
              </button>
            </div>
          </div>

          {/* 8. Subtle 3D Telehealth Connection Visualizer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Live Clinical Connection Core
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck size={13} /> HIPAA Encrypted Bridge
              </span>
            </div>
            <Patient3DHealthBadge />
          </div>
        </main>

        {/* Modals */}
        <PhotoUploadModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          onPhotoSaved={handlePhotoSaved}
          currentPhoto={patient?.profilePhoto}
        />

        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          patient={patient || ({} as any)}
          onProfileUpdated={(updated) => {
            setPatient(updated);
            showToast('Profile updated successfully.');
          }}
        />

        <ViewDoctorModal
          isOpen={isViewDoctorModalOpen}
          onClose={() => setIsViewDoctorModalOpen(false)}
          doctor={doctor}
        />

        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />

        <DataPrivacyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
        />

        <DeleteRequestModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        />

        <LogoutConfirmModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          userName={patient?.name || 'John Doe'}
        />
      </div>
    </PatientAuthGuard>
  );
}
