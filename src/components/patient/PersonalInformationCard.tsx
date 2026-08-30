'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Patient } from '@/types/healthlink';
import { EditProfileModal } from '@/components/patient/EditProfileModal';
import {
  User,
  Calendar,
  Mail,
  Phone,
  Globe,
  Heart,
  ShieldCheck,
  AlertTriangle,
  Edit3,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface PersonalInformationCardProps {
  patient: Patient | null;
  onProfileUpdated?: (updated: Patient) => void;
}

export const PersonalInformationCard: React.FC<PersonalInformationCardProps> = ({
  patient,
  onProfileUpdated,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [localPatient, setLocalPatient] = useState<Patient | null>(patient);

  // Sync if prop updates
  React.useEffect(() => {
    if (patient) setLocalPatient(patient);
  }, [patient]);

  const p = localPatient || {
    id: 'pat-1',
    name: 'John Doe',
    email: 'john.doe@patient.healthlink',
    phoneNumber: '+1 (555) 019-2834',
    dateOfBirth: '1984-06-15',
    gender: 'Male',
    preferredLanguage: 'English (US)',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 234-5678',
    },
    isContactVerified: true,
  };

  const isVerified = p.isContactVerified ?? Boolean(p.email && p.phoneNumber);

  const handleUpdated = (updated: Patient) => {
    setLocalPatient(updated);
    if (onProfileUpdated) onProfileUpdated(updated);
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition-all p-6 sm:p-8 space-y-6">
        {/* Card Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#D32F2F] uppercase tracking-wider mb-1">
              <User size={14} className="text-[#D32F2F]" />
              <span>Personal Information</span>
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Personal Information
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Your personal details and primary contact information.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-[#D32F2F] border border-red-200 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Edit3 size={13} />
              <span>Edit Profile</span>
            </button>
            <Link
              href="/patient/profile"
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>View Full Profile</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Full Legal Name */}
          <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 space-y-1">
            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider block flex items-center gap-1">
              <User size={12} className="text-gray-400" />
              <span>Full Legal Name</span>
            </span>
            <span className="text-sm font-black text-gray-900 block truncate">
              {p.name || 'John Doe'}
            </span>
          </div>

          {/* Date of Birth */}
          <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 space-y-1">
            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider block flex items-center gap-1">
              <Calendar size={12} className="text-gray-400" />
              <span>Date of Birth</span>
            </span>
            <span className="text-sm font-bold text-gray-900 font-mono block">
              {p.dateOfBirth || '1984-06-15'}
            </span>
          </div>

          {/* Gender */}
          <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 space-y-1">
            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider block">
              Gender
            </span>
            <span className="text-sm font-bold text-gray-900 block">
              {p.gender || 'Male'}
            </span>
          </div>

          {/* Email Address */}
          <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 space-y-1">
            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider block flex items-center gap-1">
              <Mail size={12} className="text-gray-400" />
              <span>Email Address</span>
            </span>
            <span className="text-sm font-bold text-gray-900 truncate block">
              {p.email || 'john.doe@patient.healthlink'}
            </span>
          </div>

          {/* Phone Number */}
          <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 space-y-1">
            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider block flex items-center gap-1">
              <Phone size={12} className="text-gray-400" />
              <span>Phone Number</span>
            </span>
            <span className="text-sm font-bold text-gray-900 font-mono block">
              {p.phoneNumber || '+1 (555) 019-2834'}
            </span>
          </div>

          {/* Preferred Language */}
          <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 space-y-1">
            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider block flex items-center gap-1">
              <Globe size={12} className="text-gray-400" />
              <span>Preferred Language</span>
            </span>
            <span className="text-sm font-bold text-gray-900 block">
              {p.preferredLanguage || 'English (US)'}
            </span>
          </div>
        </div>

        {/* Emergency Contact & Verified Status Banner */}
        <div className="p-4 bg-[#FFEBEE]/50 rounded-2xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-[#B71C1C] uppercase tracking-wider block flex items-center gap-1">
              <Heart size={12} className="fill-[#D32F2F] text-[#D32F2F]" />
              <span>Emergency Contact</span>
            </span>
            <div className="text-xs font-extrabold text-gray-900">
              <span>{p.emergencyContact?.name || 'Jane Doe'}</span>
              <span className="text-gray-500 font-medium ml-1.5">
                ({p.emergencyContact?.relationship || 'Spouse'})
              </span>
              <span className="text-gray-700 font-mono font-bold ml-2">
                {p.emergencyContact?.phone || '+1 (555) 234-5678'}
              </span>
            </div>
            <p className="text-[10px] text-gray-500">
              Designated personal emergency contact (non-clinical contact).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>✓ Verified Contact</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                <AlertTriangle size={14} className="text-amber-700" />
                <span>⚠ Verification Required</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          patient={p as Patient}
          onProfileUpdated={handleUpdated}
        />
      )}
    </>
  );
};
