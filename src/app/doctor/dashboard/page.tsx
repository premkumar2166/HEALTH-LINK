'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { DoctorNav } from '@/components/doctor/DoctorNav';
import { DoctorBottomNav } from '@/components/doctor/DoctorBottomNav';
import { PatientCard } from '@/components/doctor/PatientCard';
import { Doctor3DClinicalVisualizer } from '@/components/3d/Doctor3DClinicalVisualizer';
import {
  Stethoscope,
  Users,
  MessageSquare,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  Sparkles,
  ChevronRight,
  Bell,
} from 'lucide-react';

export default function DoctorDashboardPage() {
  const router = useRouter();

  const [doctorName, setDoctorName] = useState('Dr. Sarah Miller, MD');
  const [doctorId, setDoctorId] = useState('doc-1');
  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalActiveAlerts: 0,
    totalUnreadMessages: 0,
    urgentPatientsCount: 0,
    reviewPatientsCount: 0,
  });
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'URGENT' | 'REVIEW' | 'NORMAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDoctorData = async () => {
    try {
      const token =
        localStorage.getItem('healthlink_doctor_token') ||
        localStorage.getItem('healthlink_token');

      const sessStr =
        localStorage.getItem('healthlink_doctor_session') ||
        localStorage.getItem('healthlink_session');

      if (!token && !sessStr) {
        router.push('/doctor/login');
        return;
      }

      if (sessStr) {
        try {
          const parsed = JSON.parse(sessStr);
          if (parsed.role === 'doctor') {
            setDoctorName(parsed.name || 'Dr. Sarah Miller, MD');
            setDoctorId(parsed.userId || 'doc-1');
          }
        } catch (e) {}
      }

      const res = await fetch('/api/doctor/patients', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
        if (data.stats) setStats(data.stats);
      } else if (res.status === 401) {
        router.push('/doctor/login');
      }
    } catch (e) {
      console.error('Error fetching doctor data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();

    // Listen for real-time vitals, messages, and alerts
    try {
      const sse = new EventSource('/api/events');
      sse.addEventListener('NEW_MEASUREMENT', () => fetchDoctorData());
      sse.addEventListener('NEW_MESSAGE', () => fetchDoctorData());
      sse.addEventListener('ALERT_STATUS_CHANGED', () => fetchDoctorData());

      return () => {
        sse.close();
      };
    } catch (e) {}
  }, []);

  const filteredPatients = patients.filter((p) => {
    if (statusFilter !== 'ALL' && p.clinicalStatus !== statusFilter) return false;
    if (searchQuery.trim() && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-16 md:pb-12 text-[#1A1A1A]">
      <Header portalType="doctor" userName={doctorName} isOnline={true} />
      <DoctorNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Command Center Header */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBEE] border border-red-200 text-[#D32F2F] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#D32F2F] animate-pulse" />
              <span>Real-Time Clinical Tele-Monitoring</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Welcome back, {doctorName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              HEALTHLINK Clinical Command Center • Panel triage, health trends & remote telehealth.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/doctor/calculator"
              className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-xs rounded-xl border border-gray-300 shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Clinical Calculator</span>
            </Link>
            <Link
              href="/doctor/alerts"
              className="px-4 py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Bell size={14} />
              <span>Attention Center ({stats.urgentPatientsCount} Urgent)</span>
            </Link>
          </div>
        </div>

        {/* 5 Summary Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Patients */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center text-gray-500 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wide">Total Patients</span>
              <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-gray-900 font-mono">{stats.totalPatients}</span>
              <span className="text-[11px] text-gray-400 block mt-0.5">Assigned panel</span>
            </div>
          </div>

          {/* Card 2: New Messages */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center text-sky-700 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wide">New Messages</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <MessageSquare size={16} />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-gray-900 font-mono">{stats.totalUnreadMessages}</span>
              <span className="text-[11px] text-sky-600 font-bold block mt-0.5">Patient queries</span>
            </div>
          </div>

          {/* Card 3: Requires Review */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center text-amber-800 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wide">Requires Review</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-amber-700 font-mono">{stats.reviewPatientsCount}</span>
              <span className="text-[11px] text-amber-700 font-bold block mt-0.5">Observation needed</span>
            </div>
          </div>

          {/* Card 4: Urgent Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center text-[#D32F2F] mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wide">Urgent Alerts</span>
              <div className="w-8 h-8 rounded-xl bg-[#FFEBEE] text-[#D32F2F] flex items-center justify-center">
                <AlertOctagon size={16} className="animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-[#D32F2F] font-mono">{stats.urgentPatientsCount}</span>
              <span className="text-[11px] text-[#D32F2F] font-bold block mt-0.5">Immediate triage</span>
            </div>
          </div>

          {/* Card 5: Today's Updates */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex justify-between items-center text-emerald-700 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wide">Today's Updates</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Activity size={16} />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-emerald-700 font-mono">{patients.length}</span>
              <span className="text-[11px] text-gray-400 block mt-0.5">Active data streams</span>
            </div>
          </div>
        </div>

        {/* 3D Medical Connection Visualizer */}
        <Doctor3DClinicalVisualizer />

        {/* Patient List Section */}
        <div id="patients" className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Patient List</h2>
              <p className="text-xs text-gray-500">
                Patients authorized and assigned to your care panel with rule-based status indicators.
              </p>
            </div>

            {/* Search & Status Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Search patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#D32F2F]"
                />
                <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
              </div>

              <div className="inline-flex rounded-xl bg-white p-1 border border-gray-300 text-xs shadow-sm">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'ALL'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({patients.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('URGENT')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'URGENT'
                      ? 'bg-[#D32F2F] text-white'
                      : 'text-red-700 hover:text-red-900'
                  }`}
                >
                  🔴 Urgent ({stats.urgentPatientsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('REVIEW')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'REVIEW'
                      ? 'bg-amber-500 text-black'
                      : 'text-amber-800 hover:text-amber-900'
                  }`}
                >
                  🟡 Review ({stats.reviewPatientsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('NORMAL')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'NORMAL'
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-800 hover:text-emerald-900'
                  }`}
                >
                  🟢 Normal
                </button>
              </div>
            </div>
          </div>

          {/* Status Explanation Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 text-xs text-gray-600 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>🟢 No Active Alert: Vitals within target clinical ranges</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>🟡 Review Recommended: Borderline measurements logged</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span>🔴 Urgent Attention: Critical clinical threshold reached</span>
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">AHA / CDC Clinical Rules v1.4</span>
          </div>

          {/* Patient Cards Grid */}
          {isLoading ? (
            <div className="p-16 text-center text-gray-400 text-sm bg-white rounded-3xl border border-gray-200 animate-pulse">
              Loading Patient Panel & Real-Time Clinical Streams...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-400 text-sm">
              No patients match the specified criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          )}
        </div>
      </main>

      <DoctorBottomNav />
    </div>
  );
}
