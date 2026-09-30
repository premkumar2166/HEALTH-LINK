"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function MyDoctorPage() {
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<{ id: string; name: string; specialty: string; hospital: string; phone: string; email: string; status: string } | null>(null);

  useEffect(() => {
    // Simulate loading doctor info
    const timer = setTimeout(() => {
      setDoctor({
        id: 'doc-123',
        name: 'Dr. Sarah Smith',
        specialty: 'Internal Medicine',
        hospital: 'Central City Hospital',
        phone: '+1 (555) 123-4567',
        email: 'dr.smith@centralcity.health',
        status: 'Available',
      });
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <Card className="text-center p-12">
        <div className="text-4xl mb-4">👨‍⚕️</div>
        <h3 className="text-xl font-bold mb-2">No Assigned Doctor</h3>
        <p className="text-gray-500 mb-6">You currently do not have a primary care physician assigned to your profile.</p>
        <Button>Find a Doctor</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Doctor</h1>
        <p className="text-gray-500">Manage your primary care provider connection.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 flex flex-col items-center text-center">
          <div className="h-32 w-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl font-bold mb-6">
            {doctor.name.charAt(4)}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{doctor.name}</h2>
          <p className="text-brand font-medium mb-1">{doctor.specialty}</p>
          <p className="text-sm text-gray-500 mb-6">{doctor.hospital}</p>
          
          <div className="w-full space-y-3 mt-auto">
            <Button className="w-full" variant="primary">Send Message</Button>
            <Button className="w-full" variant="outline">Book Appointment</Button>
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 pb-2">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Office Phone</span>
                <span className="font-medium">{doctor.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{doctor.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Current Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  {doctor.status}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 pb-2">Upcoming Appointments</h3>
            <div className="flex items-center justify-between p-4 bg-brand-light/10 rounded-lg border border-brand/20">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded shadow-sm text-center min-w-[3rem]">
                  <p className="text-xs font-bold text-brand uppercase">Oct</p>
                  <p className="text-xl font-bold">12</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">General Checkup</p>
                  <p className="text-sm text-gray-600">10:00 AM - 10:30 AM</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
