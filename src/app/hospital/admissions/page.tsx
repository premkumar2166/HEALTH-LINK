"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Admission, AdmissionStatus } from '@/types/hospital';

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmissions = async () => {
    try {
      const res = await fetch('/api/hospital/admissions');
      if (res.ok) {
        const data = await res.json();
        setAdmissions(data.admissions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (mounted) fetchAdmissions();
    }, 0);
    return () => { mounted = false; };
  }, []);

  const handleDischarge = async (id: string) => {
    const summary = prompt("Enter discharge summary:");
    if (!summary) return;

    try {
      const res = await fetch(`/api/hospital/admissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: AdmissionStatus.DISCHARGED, summary })
      });
      if (res.ok) {
        fetchAdmissions();
      } else {
        alert('Failed to discharge patient');
      }
    } catch (e) {
      alert('Error discharging patient');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading admissions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admissions & Discharges</h1>
          <p className="text-gray-500">Manage patient inpatient stays.</p>
        </div>
        <Button>New Admission</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Patient</th>
                <th className="px-4 py-3">Admitted</th>
                <th className="px-4 py-3">Doctor / Dept</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admissions.map(adm => (
                <tr key={adm.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900">{adm.patientName}</td>
                  <td className="px-4 py-4">{new Date(adm.admissionDate).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    {adm.doctorName}
                    <div className="text-xs text-gray-400">{adm.department}</div>
                  </td>
                  <td className="px-4 py-4">
                    Room {adm.roomId.replace('r_', '')} <br/>
                    <span className="text-xs text-gray-400">Bed: {adm.bedId}</span>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={adm.status === AdmissionStatus.ADMITTED ? 'success' : 'default'}>
                      {adm.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {adm.status === AdmissionStatus.ADMITTED && (
                      <Button variant="outline" size="sm" onClick={() => handleDischarge(adm.id)}>
                        Discharge
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {admissions.length === 0 && (
            <div className="text-center py-8 text-gray-500">No admission records found.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
