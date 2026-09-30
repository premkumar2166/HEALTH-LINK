"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';

export default function PatientTimelinePage() {
  const events = [
    { date: 'Oct 10, 2026', type: 'Follow-up', description: 'Scheduled follow-up for diabetes management.', icon: '📅', color: 'bg-blue-100 text-blue-600' },
    { date: 'Oct 01, 2026', type: 'Reports', description: 'Comprehensive Metabolic Panel completed.', icon: '📋', color: 'bg-purple-100 text-purple-600' },
    { date: 'Sep 25, 2026', type: 'Messages', description: 'Patient asked about medication side effects. Responded same day.', icon: '💬', color: 'bg-brand-light text-brand' },
    { date: 'Sep 15, 2026', type: 'Consultations', description: 'In-person consultation. Adjusted Lisinopril dosage.', icon: '🩺', color: 'bg-brand-light/20 text-brand' },
    { date: 'Aug 20, 2026', type: 'Documents', description: 'Patient uploaded historic ECG results.', icon: '📄', color: 'bg-gray-100 text-gray-600' },
    { date: 'Aug 01, 2026', type: 'Registration', description: 'Patient registered and connected with Dr. Smith.', icon: '🎉', color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Timeline</h1>
        <p className="text-gray-500">Comprehensive chronological history for John Doe.</p>
      </div>

      <Card className="max-w-4xl">
        <div className="relative border-l-2 border-gray-200 ml-4 pl-8 py-4 space-y-10">
          {events.map((event, i) => (
            <div key={i} className="relative">
              <div className={`absolute -left-[41px] w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border-2 border-white ${event.color}`}>
                {event.icon}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{event.type}</h3>
                  <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                    {event.date}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
