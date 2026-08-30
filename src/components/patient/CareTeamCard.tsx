'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Stethoscope, MessageSquare, Mic, PhoneCall, Video, Building, CheckCircle2 } from 'lucide-react';
import { RealTimeCallModal } from '@/components/common/RealTimeCallModal';

interface CareTeamCardProps {
  doctorName?: string;
  specialty?: string;
  clinicName?: string;
  isOnline?: boolean;
  patientName?: string;
}

export const CareTeamCard: React.FC<CareTeamCardProps> = ({
  doctorName = 'Dr. Sarah Miller, MD',
  specialty = 'Internal Medicine & Tele-Cardiology',
  clinicName = 'HealthLink Premier Tele-Clinical Center',
  isOnline = true,
  patientName = 'John Doe',
}) => {
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('video');

  const handleStartCall = (type: 'voice' | 'video') => {
    setCallType(type);
    setIsCallModalOpen(true);
  };

  return (
    <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 flex flex-col justify-between space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#D32F2F] flex items-center justify-center font-bold">
              <Stethoscope size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Primary Physician
              </span>
              <h2 className="text-base font-extrabold text-gray-900">Your Care Team</h2>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span>{isOnline ? 'Available' : 'Offline'}</span>
          </span>
        </div>

        {/* Doctor Details */}
        <div className="mt-4 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 text-[#D32F2F] flex items-center justify-center font-black text-xl shadow-xs flex-shrink-0">
            {doctorName.replace('Dr. ', '').charAt(0)}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-gray-900 leading-tight">{doctorName}</h3>
            <p className="text-xs font-semibold text-[#D32F2F]">{specialty}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Building size={12} className="text-gray-400" />
              <span>{clinicName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-gray-100">
        <Link
          href="/patient/chat"
          className="py-2.5 px-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-red-600/30 transition-all flex items-center justify-center gap-1.5"
        >
          <MessageSquare size={14} />
          <span>Message Doctor</span>
        </Link>

        <Link
          href="/patient/chat"
          className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-[#B71C1C] border border-red-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
        >
          <Mic size={14} />
          <span>Voice Message</span>
        </Link>

        <button
          type="button"
          onClick={() => handleStartCall('video')}
          className="py-2.5 px-3 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <PhoneCall size={14} />
          <span>Call Doctor</span>
        </button>
      </div>

      {/* Telehealth Modal */}
      <RealTimeCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        callerName={patientName}
        callerRole="patient"
        callType={callType}
        recipientName={doctorName}
      />
    </div>
  );
};
