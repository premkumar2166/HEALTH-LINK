"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Appointment, AppointmentStatus } from '@/types/appointment';

export default function HospitalAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
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
      if (mounted) fetchAppointments();
    }, 0);
    return () => { mounted = false; };
  }, []);

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAppointments();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update appointment');
      }
    } catch (e) {
      alert('An error occurred.');
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED: return 'success';
      case AppointmentStatus.REQUESTED: return 'warning';
      case AppointmentStatus.CANCELLED:
      case AppointmentStatus.NO_SHOW: return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading master schedule...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Master Schedule</h1>
          <p className="text-gray-500">Manage all facility appointments and triage.</p>
        </div>
        <Button>Force Book Slot</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Date & Time</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).map(apt => {
                const aptDate = new Date(apt.dateTime);
                const isPast = aptDate.getTime() < now;

                return (
                  <tr key={apt.id} className={`border-b border-gray-100 hover:bg-gray-50 ${isPast ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {aptDate.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-4">{apt.patientName}</td>
                    <td className="px-4 py-4">{apt.doctorName}</td>
                    <td className="px-4 py-4 max-w-[200px] truncate" title={apt.reason}>{apt.reason}</td>
                    <td className="px-4 py-4">
                      <Badge variant={getStatusColor(apt.status)}>{apt.status}</Badge>
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      <select 
                        className="text-xs border border-gray-300 rounded px-2 py-1 mr-2 bg-white cursor-pointer"
                        value={apt.status}
                        onChange={(e) => updateStatus(apt.id, e.target.value as AppointmentStatus)}
                        disabled={isPast && apt.status !== AppointmentStatus.NO_SHOW}
                      >
                        <option value={AppointmentStatus.REQUESTED}>Requested</option>
                        <option value={AppointmentStatus.CONFIRMED}>Confirmed</option>
                        <option value={AppointmentStatus.CANCELLED}>Cancelled</option>
                        <option value={AppointmentStatus.COMPLETED}>Completed</option>
                        <option value={AppointmentStatus.NO_SHOW}>No Show</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {appointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">No appointments recorded.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
