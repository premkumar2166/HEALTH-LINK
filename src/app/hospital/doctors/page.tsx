"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Role } from '@/types/auth';

const mockDoctors = [
  { id: 'doc_123', name: 'Dr. Sarah Smith', department: 'Internal Medicine', status: 'Active', availability: 'Mon, Wed, Fri' },
  { id: 'doc_456', name: 'Dr. Michael Chang', department: 'Cardiology', status: 'Inactive', availability: 'On Leave' },
];

export default function DoctorManagementPage() {
  const [user, setUser] = useState<{ id: string; role: string; profile: { firstName?: string; lastName?: string; name?: string; specialty?: string; hospital?: string; phone?: string; email?: string; status?: string } } | null>(null);
  const [doctors, setDoctors] = useState(mockDoctors);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      });
  }, []);

  if (user && user.role !== Role.HOSPITAL_ADMIN) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 font-bold">
        Access Denied. Hospital Administrator privileges required.
      </div>
    );
  }

  const toggleStatus = (id: string) => {
    setDoctors(docs => docs.map(d => {
      if (d.id === id) {
        return { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return d;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Management</h1>
          <p className="text-gray-500">Manage hospital physicians and clinical staff.</p>
        </div>
        <Button>+ Add Doctor</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Doctor</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                      {doctor.name.charAt(4)}
                    </div>
                    <div>
                      <p>{doctor.name}</p>
                      <p className="text-xs text-gray-400 font-normal">ID: {doctor.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">{doctor.department}</td>
                  <td className="px-4 py-4">{doctor.availability}</td>
                  <td className="px-4 py-4">
                    <Badge variant={doctor.status === 'Active' ? 'success' : 'default'}>
                      {doctor.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={doctor.status === 'Active' ? 'text-error border-error/20 hover:bg-error hover:text-white' : ''}
                      onClick={() => toggleStatus(doctor.id)}
                    >
                      {doctor.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
