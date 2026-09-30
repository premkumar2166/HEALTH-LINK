"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function DoctorDashboard() {
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
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user ? `Dr. ${user.profile.lastName}` : 'Loading...'}
          </h1>
          <p className="text-gray-500 mt-1">Here is your clinical overview for today.</p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-brand">3 Appointments Today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Appointments</h3>
              <Button variant="outline" size="sm">View Calendar</Button>
            </div>
            <div className="space-y-3">
              {[
                { time: '09:00 AM', patient: 'John Doe', type: 'Follow-up', status: 'Checked In' },
                { time: '11:30 AM', patient: 'Sarah Connor', type: 'Annual Physical', status: 'Scheduled' },
                { time: '02:00 PM', patient: 'Michael Chang', type: 'Consultation', status: 'Scheduled' },
              ].map((apt, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 text-sm font-bold text-gray-700">{apt.time}</div>
                    <div className="w-10 h-10 bg-brand-light text-brand-dark rounded-full flex items-center justify-center font-bold">
                      {apt.patient.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{apt.patient}</p>
                      <p className="text-xs text-gray-500">{apt.type}</p>
                    </div>
                  </div>
                  <div>
                    <Badge variant={apt.status === 'Checked In' ? 'success' : 'default'}>{apt.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Alerts</h3>
            <div className="space-y-3">
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3 items-start">
                <span className="text-red-500 mt-0.5">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-red-900">High Blood Pressure Alert - Robert Smith</p>
                  <p className="text-xs text-red-700 mt-1">Patient recorded BP of 160/95 today, exceeding target threshold.</p>
                </div>
                <Button size="sm" variant="outline" className="ml-auto bg-white border-red-200 text-red-700 hover:bg-red-100">Review</Button>
              </div>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-md font-semibold text-gray-900 mb-4">Recent Documents</h3>
              <div className="text-center p-6 text-sm text-gray-500 border border-dashed rounded-lg">
                No new lab results or documents to review.
              </div>
            </Card>
            <Card>
              <h3 className="text-md font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
              <div className="text-center p-6 text-sm text-gray-500 border border-dashed rounded-lg">
                No major upcoming schedules for tomorrow.
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-amber-400">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Messages</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  JD
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-600 line-clamp-2">Doctor, I was wondering if I can take my medication with food instead of empty stomach?</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  AL
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Amanda Lee</p>
                  <p className="text-xs text-gray-600 line-clamp-2">I am feeling much better now. Thank you for the prescription!</p>
                  <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                </div>
              </li>
            </ul>
            <Button variant="outline" className="w-full mt-4">View All Messages</Button>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients</h3>
            <div className="space-y-3">
              {['Emma Watson', 'James Bond', 'Tony Stark'].map((name, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{name}</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2">Profile</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
