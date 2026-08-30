'use client';

import React from 'react';
import Link from 'next/link';
import { Stethoscope, ShieldCheck, MessageSquare, Building2, Award, Calendar, Key, X, CheckCircle2 } from 'lucide-react';

interface ViewDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: {
    id: string;
    name: string;
    specialty: string;
    clinicName: string;
    licenseNumber: string;
    isOnline: boolean;
    maskedDoctorCode?: string;
    connectionDate?: string;
  } | null;
}

export const ViewDoctorModal: React.FC<ViewDoctorModalProps> = ({
  isOpen,
  onClose,
  doctor,
}) => {
  if (!isOpen || !doctor) return null;

  const formattedDate = doctor.connectionDate
    ? new Date(doctor.connectionDate).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active Provider';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-doctor-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-red-100 p-6 sm:p-8 space-y-6 animate-scale-up relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Stethoscope size={28} />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600 block">
              Authorized Clinician
            </span>
            <h2 id="view-doctor-title" className="text-xl font-extrabold text-gray-900 tracking-tight">
              {doctor.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{doctor.isOnline ? 'Online • Accepting Tele-Consultations' : 'Connected Provider'}</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3">
          <div className="p-3.5 bg-[#FAFAFA] rounded-2xl border border-gray-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                <Award size={14} className="text-red-600" />
                <span>Specialty</span>
              </span>
              <span className="font-extrabold text-gray-900">{doctor.specialty}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                <Building2 size={14} className="text-red-600" />
                <span>Clinic / Facility</span>
              </span>
              <span className="font-bold text-gray-900 text-right">{doctor.clinicName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Medical License</span>
              </span>
              <span className="font-mono font-bold text-gray-800">{doctor.licenseNumber}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                <Key size={14} className="text-red-600" />
                <span>Doctor Security Code</span>
              </span>
              <span className="font-mono font-extrabold text-red-600 tracking-widest">
                {doctor.maskedDoctorCode || '••••••••'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                <span>Connected Since</span>
              </span>
              <span className="font-medium text-gray-700">{formattedDate}</span>
            </div>
          </div>

          <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl text-[11px] text-red-800 leading-relaxed flex items-start gap-2">
            <ShieldCheck size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <span>
              Connection is cryptographically tied to your clinic authorization. Patients cannot connect to arbitrary doctors without clinical authorization.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all"
          >
            Close
          </button>
          <Link
            href="/patient/chat"
            onClick={onClose}
            className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-red-600/30 transition-all flex items-center gap-1.5"
          >
            <MessageSquare size={14} />
            <span>Message Doctor</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
