"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { DashboardWidget } from '@/components/ui/DashboardWidget';

export default function PatientDashboard() {
  const [user, setUser] = useState<{ id: string; role: string; profile: { firstName?: string; lastName?: string; name?: string; specialty?: string; hospital?: string; phone?: string; email?: string; status?: string } } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user ? user.profile.firstName : 'Loading...'}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your health today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget 
          title="Heart Rate" 
          value="72 bpm" 
          trend="neutral" 
          trendValue="Normal" 
          icon="❤️"
        />
        <DashboardWidget 
          title="Blood Pressure" 
          value="120/80" 
          trend="down" 
          trendValue="Optimum" 
          icon="🩸"
        />
        <DashboardWidget 
          title="Weight" 
          value="75 kg" 
          trend="neutral" 
          trendValue="Stable" 
          icon="⚖️"
        />
        <DashboardWidget 
          title="Next Appointment" 
          value="Oct 12" 
          description="Dr. Smith - General Checkup" 
          icon="📅"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Health Measurements</h3>
            <div className="text-center p-8 text-gray-500 border border-dashed rounded-lg">
              No recent measurements to display.
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Documents</h3>
            <div className="text-center p-8 text-gray-500 border border-dashed rounded-lg">
              No documents uploaded recently.
            </div>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Doctor</h3>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl">
                S
              </div>
              <div>
                <p className="font-medium text-gray-900">Dr. Sarah Smith</p>
                <p className="text-sm text-gray-500">General Practice</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h3>
            <div className="text-center p-6 text-sm text-gray-500 bg-gray-50 rounded-lg">
              Your inbox is empty.
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-0.5">🔵</span>
                <p className="text-sm text-gray-700">Your lab results from Oct 1 are ready.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand mt-0.5">🔴</span>
                <p className="text-sm text-gray-700">Please confirm your upcoming appointment.</p>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
