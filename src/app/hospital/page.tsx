"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { DashboardWidget } from '@/components/ui/DashboardWidget';
import { Role } from '@/types/auth';

export default function HospitalDashboard() {
  const [user, setUser] = useState<{ id: string; role: string; profile: { firstName?: string; lastName?: string; name?: string; specialty?: string; hospital?: string; phone?: string; email?: string; status?: string } } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      });
  }, []);

  const isAdmin = user?.role === Role.HOSPITAL_ADMIN;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hospital Overview
          </h1>
          <p className="text-gray-500 mt-1">Live operational metrics and alerts.</p>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget title="Total Patients" value="1,204" trend="up" trendValue="+12" icon="👥" />
        <DashboardWidget title="Today's Appointments" value="142" trend="up" trendValue="+5" icon="📅" />
        <DashboardWidget title="Admissions Today" value="28" trend="neutral" trendValue="Normal" icon="📥" />
        <DashboardWidget title="Discharges Today" value="15" trend="neutral" trendValue="Normal" icon="📤" />
      </div>

      {/* Secondary Metrics & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bed Capacity</h3>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-3xl font-bold text-gray-900">342</p>
                  <p className="text-sm text-gray-500">Occupied Beds</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-success">58</p>
                  <p className="text-sm text-gray-500">Available Beds</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div className="bg-brand h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-right">85% Capacity</p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff & Resources</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">On-Call Doctors</span>
                  <span className="font-bold text-gray-900">45</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Active Nurses</span>
                  <span className="font-bold text-gray-900">120</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Active Departments</span>
                  <span className="font-bold text-gray-900">14</span>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity Logs</h3>
            <div className="space-y-4">
              {[
                { time: '10:45 AM', action: 'Patient Admitted', details: 'John Doe admitted to Cardiology (Room 402)', by: 'Nurse Sarah' },
                { time: '10:30 AM', action: 'Doctor Assigned', details: 'Dr. Smith assigned to ER Trauma Bay 1', by: 'Admin System' },
                { time: '09:15 AM', action: 'Patient Discharged', details: 'Emma Watson discharged from Pediatrics', by: 'Dr. Chang' },
              ].map((log, i) => (
                <div key={i} className="flex justify-between items-start border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{log.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-400">{log.time}</p>
                    <p className="text-xs text-gray-400">{log.by}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-t-4 border-t-red-500 bg-red-50/50">
            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
              <span>🚨</span> Operational Alerts
            </h3>
            <ul className="space-y-3">
              <li className="p-3 bg-white border border-red-100 rounded-lg shadow-sm">
                <p className="text-sm font-bold text-red-700">ICU Capacity Warning</p>
                <p className="text-xs text-red-600 mt-1">Intensive Care Unit is at 95% capacity. Only 2 beds remaining.</p>
              </li>
              <li className="p-3 bg-white border border-orange-100 rounded-lg shadow-sm">
                <p className="text-sm font-bold text-orange-700">Low Blood Inventory</p>
                <p className="text-xs text-orange-600 mt-1">O-Negative blood reserves drop below minimum threshold.</p>
              </li>
              {isAdmin && (
                <li className="p-3 bg-white border border-yellow-100 rounded-lg shadow-sm">
                  <p className="text-sm font-bold text-yellow-700">System Update Pending</p>
                  <p className="text-xs text-yellow-600 mt-1">A critical security patch for the billing module is pending your approval.</p>
                </li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
