"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Appointment, AppointmentStatus } from '@/types/appointment';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());
  const [showBooking, setShowBooking] = useState(false);
  
  // Booking Form State
  const [selectedDoctor, setSelectedDoctor] = useState('doc_123'); // Default mock doc
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [bookingError, setBookingError] = useState('');

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

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: AppointmentStatus.CANCELLED })
      });
      if (res.ok) {
        fetchAppointments();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to cancel appointment');
      }
    } catch (e) {
      alert('An error occurred while canceling.');
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (!selectedDate || !selectedTime || !reason) {
      setBookingError('Please fill in all fields.');
      return;
    }

    // Combine date and time assuming local timezone for simplicity of the UI
    const dateTimeStr = `${selectedDate}T${selectedTime}:00`;
    const requestedTime = new Date(dateTimeStr);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          doctorName: selectedDoctor === 'doc_123' ? 'Dr. Sarah Smith' : 'Dr. Michael Chang',
          dateTime: requestedTime.toISOString(),
          reason
        })
      });

      if (res.ok) {
        setShowBooking(false);
        fetchAppointments();
        setReason('');
        setSelectedDate('');
        setSelectedTime('');
      } else {
        const data = await res.json();
        setBookingError(data.error || 'Failed to book appointment.');
      }
    } catch (e) {
      setBookingError('An error occurred while booking.');
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
    return <div className="p-8 text-center text-gray-500">Loading appointments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500">Manage your clinical visits and consultations.</p>
        </div>
        <Button onClick={() => setShowBooking(true)}>Book Appointment</Button>
      </div>

      {showBooking && (
        <Card className="border-l-4 border-brand bg-brand-light/5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Request New Appointment</h2>
          <form onSubmit={handleBook} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select 
                  label="Select Doctor"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                  <option value="doc_123">Dr. Sarah Smith (Internal Medicine)</option>
                  <option value="doc_456">Dr. Michael Chang (Cardiology)</option>
                </Select>
              </div>
              <div>
                <Input 
                  label="Reason for Visit"
                  type="text" 
                  placeholder="e.g., Annual checkup, Blood pressure follow-up"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div>
                <Input 
                  label="Date"
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <Input 
                  label="Time (30 min slots)"
                  type="time" 
                  step="1800"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
            </div>

            {bookingError && <p className="text-sm text-error font-medium">{bookingError}</p>}

            <div className="flex gap-2 justify-end mt-4">
              <Button type="button" variant="outline" onClick={() => setShowBooking(false)}>Cancel</Button>
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {appointments.length === 0 ? (
          <Card className="text-center py-12 text-gray-500">
            You have no upcoming or past appointments.
          </Card>
        ) : (
          appointments.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()).map(apt => {
            const aptDate = new Date(apt.dateTime);
            const isPast = aptDate.getTime() < now;

            return (
              <Card key={apt.id} className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isPast ? 'opacity-60' : ''}`}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{apt.doctorName}</h3>
                    <Badge variant={getStatusColor(apt.status)}>{apt.status}</Badge>
                    {isPast && <Badge variant="default">Past</Badge>}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-medium text-gray-900">Date & Time:</span> {aptDate.toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium text-gray-900">Reason:</span> {apt.reason}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  {(apt.status === AppointmentStatus.REQUESTED || apt.status === AppointmentStatus.CONFIRMED || apt.status === AppointmentStatus.RESCHEDULED) && !isPast && (
                    <Button variant="outline" className="text-error border-error/30 hover:bg-error hover:text-white" onClick={() => handleCancel(apt.id)}>
                      Cancel Appointment
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
