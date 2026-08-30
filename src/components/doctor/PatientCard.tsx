'use client';

import React from 'react';
import Link from 'next/link';
import { Patient, HealthMeasurement, ClinicalStatus } from '@/types/healthlink';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Activity, Scale, Heart, Thermometer, MessageSquare, AlertCircle, ChevronRight, User } from 'lucide-react';

interface PatientSummaryProps {
  patient: {
    id: string;
    name: string;
    email: string;
    dateOfBirth?: string;
    gender?: string;
    updatedAt: string;
    clinicalStatus: ClinicalStatus;
    latestMeasurement?: HealthMeasurement;
    activeAlertsCount: number;
    unreadMessagesCount: number;
  };
}

export const PatientCard: React.FC<PatientSummaryProps> = ({ patient }) => {
  const latest = patient.latestMeasurement;
  const lastUpdated = new Date(patient.updatedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link
      href={`/doctor/patient/${patient.id}`}
      className="block bg-white rounded-2xl border border-gray-200 hover:border-red-400 hover:shadow-health-lg transition-all p-5 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold text-base border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-all">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-red-700 transition-colors flex items-center gap-2">
              <span>{patient.name}</span>
            </h3>
            <span className="text-xs text-gray-500">
              {patient.gender || 'Patient'} • Updated: {lastUpdated}
            </span>
          </div>
        </div>

        <StatusBadge status={patient.clinicalStatus} />
      </div>

      {/* Latest Vitals Snapshot */}
      <div className="grid grid-cols-3 gap-2 bg-[#FAFAFA] p-3 rounded-xl border border-gray-100 mb-3 text-xs">
        <div>
          <span className="text-[10px] text-gray-400 font-semibold block">Blood Pressure</span>
          <span className="font-bold text-gray-900 font-mono">
            {latest?.bloodPressure ? `${latest.bloodPressure.systolic}/${latest.bloodPressure.diastolic}` : '—'}
          </span>
          <span className="text-[9px] text-gray-400 ml-0.5">mmHg</span>
        </div>

        <div>
          <span className="text-[10px] text-gray-400 font-semibold block">Weight</span>
          <span className="font-bold text-gray-900 font-mono">
            {latest?.weight ? `${latest.weight.value}` : '—'}
          </span>
          <span className="text-[9px] text-gray-400 ml-0.5">{latest?.weight?.unit || 'kg'}</span>
        </div>

        <div>
          <span className="text-[10px] text-gray-400 font-semibold block">Temperature</span>
          <span className="font-bold text-gray-900 font-mono">
            {latest?.temperature ? `${latest.temperature.value}` : '—'}
          </span>
          <span className="text-[9px] text-gray-400 ml-0.5">°{latest?.temperature?.unit || 'C'}</span>
        </div>
      </div>

      {/* Footer notifications */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 text-gray-500">
        <div className="flex items-center gap-3">
          {patient.activeAlertsCount > 0 && (
            <span className="flex items-center gap-1 text-red-600 font-bold text-[11px]">
              <AlertCircle size={13} /> {patient.activeAlertsCount} Active Alert{patient.activeAlertsCount > 1 ? 's' : ''}
            </span>
          )}
          {patient.unreadMessagesCount > 0 && (
            <span className="flex items-center gap-1 text-sky-600 font-bold text-[11px]">
              <MessageSquare size={13} /> {patient.unreadMessagesCount} Unread Msg{patient.unreadMessagesCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <span className="text-red-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          <span>Open Chart</span>
          <ChevronRight size={14} />
        </span>
      </div>
    </Link>
  );
};
