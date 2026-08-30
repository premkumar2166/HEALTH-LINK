'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { DoctorNav } from '@/components/doctor/DoctorNav';
import { DoctorBottomNav } from '@/components/doctor/DoctorBottomNav';
import { AuditLog } from '@/types/healthlink';
import { FileText, Printer, ShieldCheck, Clock, User, Download, Search } from 'lucide-react';

export default function DoctorReportsPage() {
  const [doctorName, setDoctorName] = useState('Dr. Sarah Miller, MD');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAudit() {
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
            setDoctorName(parsed.name || 'Dr. Sarah Miller, MD');
          } catch (e) {}
        }

        const res = await fetch('/api/audit', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAuditLogs(data.logs || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadAudit();
  }, []);

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.resource && l.resource.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-16 md:pb-12 text-[#1A1A1A]">
      <Header portalType="doctor" userName={doctorName} isOnline={true} />
      <DoctorNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <FileText size={26} className="text-[#D32F2F]" />
              <span>Clinical Reports & Compliance Audit Trail</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Export official clinical reports and review cryptographic access & action logs.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Printer size={15} />
            <span>Print / Export PDF</span>
          </button>
        </div>

        {/* Audit Log Table Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              <h3 className="text-sm font-extrabold text-gray-900">
                Security & Clinical Action Audit Trail
              </h3>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Search audit trail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#D32F2F]"
                />
                <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>
              <span className="text-xs font-mono text-gray-400 font-bold whitespace-nowrap">
                {filteredLogs.length} Events
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource Target</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 animate-pulse">
                      Loading audit compliance log entries...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No audit log records found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/70">
                      <td className="py-3 px-4 font-mono text-gray-500 text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">{log.userName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-[10px] font-bold uppercase">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#D32F2F] font-bold">{log.action}</td>
                      <td className="py-3 px-4 font-mono text-gray-600 text-[11px]">{log.resource}</td>
                      <td className="py-3 px-4 text-gray-700 max-w-sm truncate">{log.details || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <DoctorBottomNav />
    </div>
  );
}
