"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Appointment, AppointmentStatus } from '@/types/appointment';

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/appointments');
        if (res.ok && mounted) {
          const data = await res.json();
          setAppointments(data.appointments || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    // Defer to avoid set-state-in-effect warning if it triggers synchronously
    setTimeout(() => {
      if (mounted) load();
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
        // Just reload page or re-fetch (we'll mutate state for simplicity since fetch is wrapped in useEffect)
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update appointment');
      }
    } catch (e) {
      console.error(e);
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
    return <div className="p-8 text-center text-gray-500">Loading schedule...</div>;
  }

  const requestedAppointments = appointments.filter(a => a.status === AppointmentStatus.REQUESTED);
  const confirmedAppointments = appointments.filter(a => a.status === AppointmentStatus.CONFIRMED || a.status === AppointmentStatus.RESCHEDULED);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-500">Manage patient appointments and availability.</p>
        </div>
        <Button variant="outline">Manage Availability</Button>
      </div>

      {requestedAppointments.length > 0 && (
        <Card className="border-l-4 border-warning bg-warning/5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>⚠️</span> Pending Requests ({requestedAppointments.length})
          </h2>
          <div className="space-y-4">
            {requestedAppointments.map(apt => {
              const aptDate = new Date(apt.dateTime);
              return (
                <div key={apt.id} className="p-4 bg-white rounded-md shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{apt.patientName}</h3>
                    <p className="text-sm text-gray-500">{aptDate.toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                    <p className="text-sm text-gray-700 mt-1"><span className="font-medium">Reason:</span> {apt.reason}</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none text-error border-error/30 hover:bg-error hover:text-white" onClick={() => updateStatus(apt.id, AppointmentStatus.CANCELLED)}>Reject</Button>
                    <Button className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 border-none" onClick={() => updateStatus(apt.id, AppointmentStatus.CONFIRMED)}>Accept</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Confirmed Schedule</h2>
        <div className="space-y-4">
          {confirmedAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No confirmed appointments coming up.</p>
          ) : (
            confirmedAppointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).map(apt => {
              const aptDate = new Date(apt.dateTime);
              const isPast = aptDate.getTime() < now;

              return (
                <div key={apt.id} className={`p-4 bg-gray-50 rounded-md border border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4 ${isPast ? 'opacity-60' : ''}`}>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900">{apt.patientName}</h3>
                      <Badge variant={getStatusColor(apt.status)}>{apt.status}</Badge>
                      {isPast && <Badge variant="default">Past</Badge>}
                    </div>
                    <p className="text-sm text-gray-500">{aptDate.toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                    <p className="text-sm text-gray-700 mt-1"><span className="font-medium">Reason:</span> {apt.reason}</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    {!isPast && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => updateStatus(apt.id, AppointmentStatus.CANCELLED)}>Cancel</Button>
                        <Button variant="outline" size="sm" onClick={() => updateStatus(apt.id, AppointmentStatus.COMPLETED)}>Mark Completed</Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
