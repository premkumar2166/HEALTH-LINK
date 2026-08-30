'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { DoctorNav } from '@/components/doctor/DoctorNav';
import { DoctorBottomNav } from '@/components/doctor/DoctorBottomNav';
import { ClinicalTabs } from '@/components/doctor/ClinicalTabs';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ArrowLeft, User, Stethoscope, AlertTriangle } from 'lucide-react';

export default function DoctorPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patientData, setPatientData] = useState<any>(null);
  const [doctorName, setDoctorName] = useState('Dr. Sarah Miller, MD');
  const [doctorId, setDoctorId] = useState('doc-1');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchChart = async () => {
    try {
      const token =
        localStorage.getItem('healthlink_doctor_token') ||
        localStorage.getItem('healthlink_token');

      const sessStr =
        localStorage.getItem('healthlink_doctor_session') ||
        localStorage.getItem('healthlink_session');

      if (sessStr) {
        try {
          const sess = JSON.parse(sessStr);
          setDoctorName(sess.name || 'Dr. Sarah Miller, MD');
          setDoctorId(sess.userId || 'doc-1');
        } catch (e) {}
      }

      const res = await fetch(`/api/doctor/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/doctor/login');
          return;
        }
        setErrorMsg('Failed to load patient clinical chart.');
      } else {
        const data = await res.json();
        setPatientData(data);
      }
    } catch (e) {
      setErrorMsg('Network error loading patient chart.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchChart();
    }
  }, [patientId]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-16 md:pb-12 text-[#1A1A1A]">
      <Header portalType="doctor" userName={doctorName} isOnline={true} />
      <DoctorNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/doctor/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#D32F2F] bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm transition-all w-fit"
          >
            <ArrowLeft size={14} />
            <span>Back to Patient Triage List</span>
          </Link>

          {patientData?.patient && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-mono">Patient ID: {patientData.patient.id}</span>
              <StatusBadge
                status={
                  patientData.measurements?.length > 0
                    ? patientData.measurements[patientData.measurements.length - 1].status
                    : 'NORMAL'
                }
                size="md"
              />
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-4 bg-[#FFEBEE] text-[#B71C1C] text-xs rounded-xl flex items-center gap-2 border border-red-200">
            <AlertTriangle size={16} className="text-[#D32F2F]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="p-16 text-center text-gray-400 text-sm animate-pulse bg-white rounded-3xl border border-gray-200">
            Loading Patient Clinical Overview & Historical Streams...
          </div>
        ) : patientData?.patient ? (
          <div className="space-y-6">
            {/* Patient Identity Banner */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#D32F2F] text-white font-black text-xl flex items-center justify-center shadow-md">
                  {patientData.patient.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    {patientData.patient.name}
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    DOB: {patientData.patient.dateOfBirth || '1984-06-15'} • Gender: {patientData.patient.gender || 'Male'} • Height: {patientData.patient.heightCm || 178} cm
                  </p>
                </div>
              </div>

              <div className="text-left md:text-right text-xs text-gray-600">
                <span className="font-bold text-gray-900 block">Attending: {doctorName}</span>
                <span className="text-[11px] text-gray-400 font-mono">
                  Last Synchronized: {new Date(patientData.patient.updatedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* 9 Clinical Tabs Workspace */}
            <ClinicalTabs
              patient={patientData.patient}
              measurements={patientData.measurements || []}
              messages={patientData.messages || []}
              voiceMessages={patientData.voiceMessages || []}
              calls={patientData.calls || []}
              alerts={patientData.alerts || []}
              doctorNotes={patientData.doctorNotes || []}
              assessments={patientData.assessments || []}
              annotations={patientData.annotations || []}
              timeline={patientData.timeline || []}
              doctorName={doctorName}
              doctorId={doctorId}
              onRefreshData={fetchChart}
            />
          </div>
        ) : null}
      </main>

      <DoctorBottomNav />
    </div>
  );
}
