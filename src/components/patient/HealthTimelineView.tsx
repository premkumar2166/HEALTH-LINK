'use client';

import React from 'react';
import { HealthTimelineEvent } from '@/types/healthlink';
import { Activity, MessageSquare, Mic, AlertCircle, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';

interface HealthTimelineViewProps {
  events: HealthTimelineEvent[];
}

export const HealthTimelineView: React.FC<HealthTimelineViewProps> = ({ events }) => {
  const getEventIcon = (type: HealthTimelineEvent['eventType']) => {
    switch (type) {
      case 'vital_recorded':
        return <Activity size={16} className="text-red-600" />;
      case 'message_sent':
      case 'doctor_reply':
        return <MessageSquare size={16} className="text-sky-600" />;
      case 'voice_message':
        return <Mic size={16} className="text-amber-600" />;
      case 'alert_triggered':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'assessment_created':
        return <FileText size={16} className="text-emerald-600" />;
      default:
        return <CheckCircle2 size={16} className="text-gray-600" />;
    }
  };

  const getSourceBadge = (source: HealthTimelineEvent['source']) => {
    switch (source) {
      case 'doctor':
        return <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold">Doctor</span>;
      case 'patient':
        return <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">Patient</span>;
      case 'device':
        return <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">Device</span>;
      case 'system':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">Clinical Rule</span>;
      case 'ai':
        return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 text-[10px] font-bold">AI Assistant</span>;
    }
  };

  if (events.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-400 text-sm">
        No recorded health events found in this timeline yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-red-100 shadow-health-md p-6 sm:p-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">HEALTH TIMELINE</h3>
          <p className="text-xs text-gray-500">
            Chronological audit of recorded vitals, clinical communications, and care updates.
          </p>
        </div>
        <span className="text-xs font-mono text-gray-400 font-semibold">{events.length} Events</span>
      </div>

      <div className="relative border-l-2 border-red-100 ml-4 space-y-6">
        {events.map((evt) => {
          const d = new Date(evt.timestamp);
          const dateStr = d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={evt.id} className="relative pl-6 group">
              {/* Timeline Bullet */}
              <div className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-white border-2 border-red-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                {getEventIcon(evt.eventType)}
              </div>

              {/* Event Card */}
              <div className="bg-[#FAFAFA] hover:bg-white border border-gray-200 hover:border-red-200 rounded-xl p-4 transition-all shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{evt.title}</span>
                    {getSourceBadge(evt.source)}
                    {evt.severity && <StatusBadge status={evt.severity} size="sm" />}
                  </div>
                  <span className="text-[11px] font-mono text-gray-500 font-semibold">
                    {dateStr} • {timeStr}
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed mt-1">{evt.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
