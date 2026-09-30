"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const hospitalPatients = [
  { id: 'p1', name: 'John Doe', assignedDoctor: 'Dr. Sarah Smith', admissionStatus: 'Outpatient', room: 'N/A', nextAppt: '2026-10-12' },
  { id: 'p2', name: 'Emily Chen', assignedDoctor: 'Dr. Michael Chang', admissionStatus: 'Admitted', room: '402 (Cardiology)', nextAppt: 'Inpatient' },
  { id: 'p3', name: 'Robert Johnson', assignedDoctor: 'Dr. Amanda Lee', admissionStatus: 'Discharged', room: 'N/A', nextAppt: '2026-11-01' },
];

export default function HospitalPatientManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = hospitalPatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-500">Hospital-wide patient registry and admission tracking.</p>
        </div>
        <Button>Register New Patient</Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input 
              placeholder="Search patients by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">Filter by Status</Button>
          <Button variant="outline">Filter by Department</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Patient</th>
                <th className="px-4 py-3">Assigned Doctor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Room/Bed</th>
                <th className="px-4 py-3">Next Appt</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-light text-brand-dark rounded-full flex items-center justify-center font-bold">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p>{patient.name}</p>
                      <p className="text-xs text-gray-400 font-normal">ID: {patient.id.toUpperCase()}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-700">{patient.assignedDoctor}</td>
                  <td className="px-4 py-4">
                    <Badge variant={
                      patient.admissionStatus === 'Admitted' ? 'error' : 
                      patient.admissionStatus === 'Outpatient' ? 'success' : 'default'
                    }>
                      {patient.admissionStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">{patient.room}</td>
                  <td className="px-4 py-4">{patient.nextAppt}</td>
                  <td className="px-4 py-4 text-right space-x-2">
                    <Button variant="outline" size="sm">Profile</Button>
                    <Button variant="outline" size="sm">Docs</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500">No patients found.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
