'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { DoctorNav } from '@/components/doctor/DoctorNav';
import { DoctorBottomNav } from '@/components/doctor/DoctorBottomNav';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Alert } from '@/types/healthlink';
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Filter,
  ShieldCheck,
  Check,
  Search,
} from 'lucide-react';

export default function DoctorAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [doctorName, setDoctorName] = useState('Dr. Sarah Miller, MD');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'URGENT' | 'REVIEW' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const token =
        localStorage.getItem('healthlink_doctor_token') ||
        localStorage.getItem('healthlink_token');

      const sessStr =
        localStorage.getItem('healthlink_doctor_session') ||
        localStorage.getItem('healthlink_session');

      if (sessStr) {
        try {
          const parsed = JSON.parse(sessStr);
          if (parsed.name) setDoctorName(parsed.name);
        } catch (e) {}
      }

      const res = await fetch('/api/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    try {
      const sse = new EventSource('/api/events');
      sse.addEventListener('NEW_ALERT', () => fetchAlerts());
      sse.addEventListener('ALERT_STATUS_CHANGED', () => fetchAlerts());
      sse.addEventListener('NEW_MEASUREMENT', () => fetchAlerts());
      return () => {
        sse.close();
      };
    } catch (e) {}
  }, []);

  const handleUpdateStatus = async (alertId: string, status: 'ACKNOWLEDGED' | 'RESOLVED') => {
    try {
      const token =
        localStorage.getItem('healthlink_doctor_token') ||
        localStorage.getItem('healthlink_token');

      await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          resolutionNotes: `Status updated to ${status} in Clinical Attention Center by ${doctorName}`,
        }),
      });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const urgentAlerts = alerts.filter((a) => a.severity === 'URGENT' && a.status !== 'RESOLVED');
  const reviewAlerts = alerts.filter((a) => a.severity === 'REVIEW' && a.status !== 'RESOLVED');
  const resolvedAlerts = alerts.filter((a) => a.status === 'RESOLVED');

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter === 'URGENT' && (a.severity !== 'URGENT' || a.status === 'RESOLVED')) return false;
    if (statusFilter === 'REVIEW' && (a.severity !== 'REVIEW' || a.status === 'RESOLVED')) return false;
    if (statusFilter === 'RESOLVED' && a.status !== 'RESOLVED') return false;
    if (searchQuery.trim() && !a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) && !a.reason.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-16 md:pb-12 text-[#1A1A1A]">
      <Header portalType="doctor" userName={doctorName} isOnline={true} />
      <DoctorNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Title */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBEE] border border-red-200 text-[#D32F2F] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={14} />
              <span>Real-Time Clinical Decision Support</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
              <Bell size={28} className="text-[#D32F2F]" />
              <span>Clinical Attention Center</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Escalation queue categorized by clinical urgency, rule references, and measured telemetry.
            </p>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('URGENT')}
              className="px-3.5 py-2 rounded-xl bg-[#FFEBEE] border border-red-200 text-left transition-all hover:bg-red-100"
            >
              <span className="text-[10px] font-bold text-[#B71C1C] uppercase block">Urgent</span>
              <span className="text-xl font-black text-[#D32F2F] font-mono">{urgentAlerts.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('REVIEW')}
              className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-left transition-all hover:bg-amber-100"
            >
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Review</span>
              <span className="text-xl font-black text-amber-700 font-mono">{reviewAlerts.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('RESOLVED')}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-left transition-all hover:bg-emerald-100"
            >
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Resolved</span>
              <span className="text-xl font-black text-emerald-700 font-mono">{resolvedAlerts.length}</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search alert by patient or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#D32F2F]"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <div className="inline-flex rounded-xl bg-white p-1 border border-gray-300 text-xs shadow-sm">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setStatusFilter('URGENT')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === 'URGENT'
                  ? 'bg-[#D32F2F] text-white'
                  : 'text-red-700 hover:text-red-900'
              }`}
            >
              🔴 Urgent Attention ({urgentAlerts.length})
            </button>
            <button
              onClick={() => setStatusFilter('REVIEW')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === 'REVIEW'
                  ? 'bg-amber-500 text-black'
                  : 'text-amber-800 hover:text-amber-900'
              }`}
            >
              🟡 Review Recommended ({reviewAlerts.length})
            </button>
            <button
              onClick={() => setStatusFilter('RESOLVED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === 'RESOLVED'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-800 hover:text-emerald-900'
              }`}
            >
              🟢 Resolved ({resolvedAlerts.length})
            </button>
          </div>
        </div>

        {/* Alerts List */}
        {isLoading ? (
          <div className="p-16 text-center text-gray-400 text-sm bg-white rounded-3xl border border-gray-200 animate-pulse">
            Loading Clinical Attention Center queue...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-500 space-y-2">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2" />
            <span className="font-bold text-gray-900 block text-base">All clear</span>
            <span className="text-xs text-gray-500">No clinical alerts matching your active criteria.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((al) => (
              <div
                key={al.id}
                className={`p-6 rounded-3xl border bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all ${
                  al.status === 'RESOLVED'
                    ? 'border-gray-200 opacity-80'
                    : al.severity === 'URGENT'
                    ? 'border-red-300 hover:border-[#D32F2F] hover:shadow-md'
                    : 'border-amber-200 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <StatusBadge status={al.severity} size="sm" />
                    <span className="text-base font-extrabold text-gray-900">{al.patientName}</span>
                    <span className="text-xs font-mono font-bold text-[#D32F2F] bg-[#FFEBEE] px-2.5 py-0.5 rounded-lg border border-red-200">
                      Measurement: {al.triggerValue}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Rule Ref: {al.ruleVersion}
                    </span>
                    {al.status === 'ACKNOWLEDGED' && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Acknowledged
                      </span>
                    )}
                    {al.status === 'RESOLVED' && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Resolved
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed">
                    {al.reason}
                  </p>

                  <div className="text-[11px] text-gray-400 pt-1 flex items-center gap-4 flex-wrap">
                    <span>Logged: {new Date(al.createdAt).toLocaleString()}</span>
                    {al.resolvedAt && (
                      <span className="text-emerald-700 font-semibold">
                        Resolved on {new Date(al.resolvedAt).toLocaleDateString()} at {new Date(al.resolvedAt).toLocaleTimeString()}
                      </span>
                    )}
                    {al.resolutionNotes && (
                      <span className="text-gray-500 italic">"{al.resolutionNotes}"</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <Link
                    href={`/doctor/patient/${al.patientId}`}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>View Patient Chart</span>
                    <ChevronRight size={14} />
                  </Link>

                  {al.status !== 'RESOLVED' && (
                    <>
                      {al.status === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(al.id, 'ACKNOWLEDGED')}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl border border-gray-300 transition-all"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(al.id, 'RESOLVED')}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1"
                      >
                        <Check size={13} />
                        <span>Resolve</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <DoctorBottomNav />
    </div>
  );
}
