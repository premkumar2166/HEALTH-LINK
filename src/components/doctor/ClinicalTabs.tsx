'use client';

import React, { useState } from 'react';
import {
  Patient,
  HealthMeasurement,
  ChatMessage,
  VoiceMessage,
  CallSession,
  DoctorNote,
  DoctorAssessment,
  DoctorAnnotation,
  Alert,
  HealthTimelineEvent,
} from '@/types/healthlink';
import { StatusBadge } from '@/components/common/StatusBadge';
import { HealthTrendChart } from '@/components/patient/HealthTrendChart';
import { VoiceRecorder } from '@/components/patient/VoiceRecorder';
import { RealTimeCallModal } from '@/components/common/RealTimeCallModal';
import {
  Activity,
  FileText,
  LineChart,
  MessageSquare,
  Mic,
  PhoneCall,
  Lock,
  Bell,
  Clock,
  Printer,
  Plus,
  Send,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Calendar,
} from 'lucide-react';

interface ClinicalTabsProps {
  patient: Patient;
  measurements: HealthMeasurement[];
  messages: ChatMessage[];
  voiceMessages: VoiceMessage[];
  calls: CallSession[];
  alerts: Alert[];
  doctorNotes: DoctorNote[];
  assessments: DoctorAssessment[];
  annotations: DoctorAnnotation[];
  timeline: HealthTimelineEvent[];
  doctorName: string;
  doctorId: string;
  onRefreshData?: () => void;
}

export const ClinicalTabs: React.FC<ClinicalTabsProps> = ({
  patient,
  measurements,
  messages: initialMessages,
  voiceMessages: initialVoiceMessages,
  calls,
  alerts,
  doctorNotes: initialNotes,
  assessments,
  annotations,
  timeline,
  doctorName,
  doctorId,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'health_data' | 'charts' | 'messages' | 'voice' | 'calls' | 'notes' | 'alerts' | 'history'
  >('overview');

  // Messaging State
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [replyText, setReplyText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Voice State
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>(initialVoiceMessages);

  // Private Note State
  const [notes, setNotes] = useState<DoctorNote[]>(initialNotes);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'observation' | 'general' | 'diagnosis' | 'treatment_plan'>('observation');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Assessment State
  const [assessSummary, setAssessSummary] = useState('');
  const [assessRec1, setAssessRec1] = useState('');
  const [assessRec2, setAssessRec2] = useState('');
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);

  // Chart Annotation State
  const [annotDate, setAnnotDate] = useState('Day 5');
  const [annotText, setAnnotText] = useState('');
  const [isSavingAnnotation, setIsSavingAnnotation] = useState(false);

  // Call Modal State
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callTypeToStart, setCallTypeToStart] = useState<'voice' | 'video'>('video');

  const latestMeas = measurements.length > 0 ? measurements[measurements.length - 1] : undefined;

  // Send Text Response to Patient
  const handleSendTextMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    const token = localStorage.getItem('healthlink_doctor_token') || localStorage.getItem('healthlink_token');

    try {
      const res = await fetch('/api/messaging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: patient.id,
          patientId: patient.id,
          text: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setReplyText('');
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Save Private Doctor Note
  const handleSavePrivateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || isSavingNote) return;

    setIsSavingNote(true);
    const token = localStorage.getItem('healthlink_doctor_token') || localStorage.getItem('healthlink_token');

    try {
      const res = await fetch('/api/doctor/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: patient.id,
          title: noteTitle.trim() || 'Clinical Observation',
          content: noteContent.trim(),
          category: noteCategory,
        }),
      });

      const data = await res.json();
      if (res.ok && data.note) {
        setNotes((prev) => [data.note, ...prev]);
        setNoteTitle('');
        setNoteContent('');
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Save Clinical Assessment
  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessSummary.trim() || isSavingAssessment) return;

    setIsSavingAssessment(true);
    const token = localStorage.getItem('healthlink_doctor_token') || localStorage.getItem('healthlink_token');

    const recs = [assessRec1.trim(), assessRec2.trim()].filter(Boolean);

    try {
      const res = await fetch('/api/doctor/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: patient.id,
          summary: assessSummary.trim(),
          recommendations: recs,
        }),
      });

      if (res.ok) {
        setAssessSummary('');
        setAssessRec1('');
        setAssessRec2('');
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingAssessment(false);
    }
  };

  // Save Chart Annotation
  const handleSaveAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annotText.trim() || isSavingAnnotation) return;

    setIsSavingAnnotation(true);
    const token = localStorage.getItem('healthlink_doctor_token') || localStorage.getItem('healthlink_token');

    try {
      const res = await fetch('/api/doctor/annotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: patient.id,
          dateStr: annotDate,
          text: annotText.trim(),
        }),
      });

      if (res.ok) {
        setAnnotText('');
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingAnnotation(false);
    }
  };

  // Acknowledge or Resolve Alert
  const handleUpdateAlert = async (alertId: string, status: 'ACKNOWLEDGED' | 'RESOLVED') => {
    const token = localStorage.getItem('healthlink_doctor_token') || localStorage.getItem('healthlink_token');
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, resolutionNotes: 'Reviewed in clinical workspace' }),
      });
      if (onRefreshData) onRefreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'health_data', label: 'Health Data', icon: FileText },
    { key: 'charts', label: 'Charts & Annotations', icon: LineChart },
    { key: 'messages', label: 'Messages', icon: MessageSquare, badge: messages.filter((m) => m.senderRole === 'patient' && m.status !== 'read').length },
    { key: 'voice', label: 'Voice Notes', icon: Mic, badge: voiceMessages.length },
    { key: 'calls', label: 'Telehealth Calls', icon: PhoneCall },
    { key: 'notes', label: 'Private Doctor Notes', icon: Lock },
    { key: 'alerts', label: 'Alerts', icon: Bell, badge: alerts.filter((a) => a.status === 'ACTIVE').length },
    { key: 'history', label: 'Audit & Reports', icon: Clock },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-health-md overflow-hidden">
      {/* 9 Tab Navigation Strip */}
      <div className="border-b border-gray-200 bg-[#FAFAFA] px-4 overflow-x-auto">
        <div className="flex space-x-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-red-400' : 'text-gray-500'} />
                <span>{tab.label}</span>
                {!!tab.badge && tab.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* BP Card */}
              <div className="p-4 bg-[#FAFAFA] rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-500 block">Latest Blood Pressure</span>
                <span className="text-xl font-extrabold text-gray-900 font-mono mt-1 block">
                  {latestMeas?.bloodPressure ? `${latestMeas.bloodPressure.systolic}/${latestMeas.bloodPressure.diastolic}` : '—'}
                  <span className="text-xs font-normal text-gray-500 ml-1">mmHg</span>
                </span>
                <div className="mt-2">
                  <StatusBadge status={latestMeas?.status || 'NORMAL'} size="sm" />
                </div>
              </div>

              {/* Weight Card */}
              <div className="p-4 bg-[#FAFAFA] rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-500 block">Latest Weight</span>
                <span className="text-xl font-extrabold text-gray-900 font-mono mt-1 block">
                  {latestMeas?.weight ? `${latestMeas.weight.value}` : '—'}
                  <span className="text-xs font-normal text-gray-500 ml-1">{latestMeas?.weight?.unit || 'kg'}</span>
                </span>
                <span className="text-[11px] text-gray-500 mt-2 block">
                  BMI: {latestMeas?.weight && patient.heightCm ? (latestMeas.weight.convertedKg / Math.pow(patient.heightCm / 100, 2)).toFixed(1) : '—'}
                </span>
              </div>

              {/* Temperature Card */}
              <div className="p-4 bg-[#FAFAFA] rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-500 block">Latest Temperature</span>
                <span className="text-xl font-extrabold text-gray-900 font-mono mt-1 block">
                  {latestMeas?.temperature ? `${latestMeas.temperature.value}` : '—'}
                  <span className="text-xs font-normal text-gray-500 ml-1">°{latestMeas?.temperature?.unit || 'C'}</span>
                </span>
                <span className="text-[11px] text-gray-500 mt-2 block">Resting Temp</span>
              </div>

              {/* Heart Rate Card */}
              <div className="p-4 bg-[#FAFAFA] rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-500 block">Resting Heart Rate</span>
                <span className="text-xl font-extrabold text-gray-900 font-mono mt-1 block">
                  {latestMeas?.heartRate || '—'}
                  <span className="text-xs font-normal text-gray-500 ml-1">bpm</span>
                </span>
                <span className="text-[11px] text-gray-500 mt-2 block">AHA Reference (60-100)</span>
              </div>
            </div>

            {/* Patient Clinical Profile & Allergies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#FAFAFA] p-5 rounded-xl border border-gray-200">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  Clinical History & Known Allergies
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-gray-500 block">Documented Allergies:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {patient.allergies && patient.allergies.length > 0 ? (
                        patient.allergies.map((a, i) => (
                          <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded-md">
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No known drug allergies recorded</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-500 block">Medical Conditions:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                        patient.medicalHistory.map((m, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-200 text-slate-800 font-medium rounded-md">
                            {m}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">None logged</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact & Tele-Actions */}
              <div className="bg-[#FAFAFA] p-5 rounded-xl border border-gray-200 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Emergency Contact & Care Coordination
                  </h4>
                  {patient.emergencyContact ? (
                    <div className="text-xs text-gray-700 space-y-1">
                      <p><span className="font-bold">Name:</span> {patient.emergencyContact.name} ({patient.emergencyContact.relationship})</p>
                      <p><span className="font-bold">Phone:</span> {patient.emergencyContact.phone}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No designated emergency contact.</p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => {
                      setCallTypeToStart('video');
                      setIsCallModalOpen(true);
                    }}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <PhoneCall size={14} />
                    <span>Start Telehealth Video</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="flex-1 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <MessageSquare size={14} />
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Clinical Assessment Form */}
            <div className="bg-red-50/50 border border-red-200 rounded-xl p-5">
              <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider mb-2">
                Record Clinical Assessment & Recommendation
              </h4>
              <form onSubmit={handleSaveAssessment} className="space-y-3">
                <textarea
                  rows={2}
                  placeholder="Enter clinical assessment summary (e.g., Blood pressure shows optimal response to treatment protocol)..."
                  value={assessSummary}
                  onChange={(e) => setAssessSummary(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Recommendation 1 (e.g., Continue daily sodium restriction <2g)..."
                    value={assessRec1}
                    onChange={(e) => setAssessRec1(e.target.value)}
                    className="p-2.5 bg-white border border-gray-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Recommendation 2 (e.g., Log morning BP before coffee)..."
                    value={assessRec2}
                    onChange={(e) => setAssessRec2(e.target.value)}
                    className="p-2.5 bg-white border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingAssessment || !assessSummary.trim()}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    {isSavingAssessment ? 'Recording Assessment...' : 'Record Clinical Assessment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: HEALTH DATA TABULAR */}
        {activeTab === 'health_data' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900">Historical Health Measurements Log</h4>
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAFA] border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Blood Pressure</th>
                    <th className="py-3 px-4">Weight</th>
                    <th className="py-3 px-4">Temp</th>
                    <th className="py-3 px-4">Heart Rate</th>
                    <th className="py-3 px-4">Clinical Status</th>
                    <th className="py-3 px-4">Patient Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {measurements.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/80">
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {new Date(m.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4 font-bold font-mono text-gray-900">
                        {m.bloodPressure ? `${m.bloodPressure.systolic}/${m.bloodPressure.diastolic} mmHg` : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-900">
                        {m.weight ? `${m.weight.value} ${m.weight.unit}` : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-900">
                        {m.temperature ? `${m.temperature.value}°${m.temperature.unit}` : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-900">
                        {m.heartRate ? `${m.heartRate} bpm` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={m.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-gray-600 italic max-w-xs truncate">
                        {m.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CHARTS & ANNOTATIONS */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            <HealthTrendChart measurements={measurements} annotations={annotations} isDoctorView={true} />

            {/* Doctor Annotation Creator */}
            <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-gray-200">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Add Doctor Annotation on Chart
              </h4>
              <form onSubmit={handleSaveAnnotation} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Date Marker (e.g. Day 5 or Aug 28)"
                  value={annotDate}
                  onChange={(e) => setAnnotDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs w-full sm:w-44"
                />
                <input
                  type="text"
                  placeholder="Annotation comment (e.g., 'Reviewed trend; BP optimal. Maintain 5mg dose')..."
                  value={annotText}
                  onChange={(e) => setAnnotText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900"
                />
                <button
                  type="submit"
                  disabled={isSavingAnnotation || !annotText.trim()}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  {isSavingAnnotation ? 'Adding...' : 'Attach Annotation'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: DIRECT MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="h-80 overflow-y-auto p-4 bg-[#FAFAFA] border border-gray-200 rounded-2xl space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.senderRole === 'doctor' ? 'items-end' : 'items-start'} max-w-xl ${
                    msg.senderRole === 'doctor' ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  <span className="text-[10px] text-gray-400 font-semibold mb-1 px-1">
                    {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.senderRole === 'doctor'
                        ? 'bg-slate-900 text-white rounded-br-none'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendTextMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Write clinical response to patient..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || isSendingMessage}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Send size={14} />
                <span>Send Response</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: VOICE NOTES */}
        {activeTab === 'voice' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Received Patient Voice Notes</h4>
              <div className="space-y-3">
                {voiceMessages.map((vm) => (
                  <div key={vm.id} className="p-4 bg-[#FAFAFA] border border-gray-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{vm.senderName}</span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(vm.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 mt-1 italic">"{vm.transcript}"</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-600 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                      {vm.durationSeconds}s
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Record Clinical Voice Memo to Patient
              </h4>
              <VoiceRecorder
                receiverId={patient.id}
                senderRole="doctor"
                onVoiceSent={(newVM) => {
                  setVoiceMessages((prev) => [...prev, newVM]);
                  if (onRefreshData) onRefreshData();
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 6: TELEHEALTH CALLS */}
        {activeTab === 'calls' && (
          <div className="space-y-6">
            <div className="p-6 bg-[#FAFAFA] border border-gray-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-gray-900">Direct Telehealth Consultation</h4>
                <p className="text-xs text-gray-500">
                  Launch an encrypted, WebRTC-enabled voice or video session with {patient.name}.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCallTypeToStart('voice');
                    setIsCallModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <PhoneCall size={14} />
                  <span>Voice Call</span>
                </button>
                <button
                  onClick={() => {
                    setCallTypeToStart('video');
                    setIsCallModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <PhoneCall size={14} />
                  <span>Video Consultation</span>
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Call History Log</h4>
              <div className="space-y-2">
                {calls.map((c) => (
                  <div key={c.id} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <PhoneCall size={14} className="text-red-600" />
                      <span className="font-bold text-gray-800">{c.callType.toUpperCase()} Consultation</span>
                      <span className="text-gray-500">• {new Date(c.startedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    <span className="font-mono text-gray-600">{c.durationSeconds ? `${Math.floor(c.durationSeconds / 60)}m ${c.durationSeconds % 60}s` : 'Ended'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PRIVATE DOCTOR NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock size={18} className="text-red-400" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Physician Private Clinical Notes</h4>
                  <p className="text-[11px] text-slate-300">
                    Strictly isolated from patient view. Only authorized clinicians can view these notes.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-red-600 px-2 py-0.5 rounded font-bold">CONFIDENTIAL</span>
            </div>

            {/* Note Creator */}
            <form onSubmit={handleSavePrivateNote} className="p-5 bg-[#FAFAFA] border border-gray-200 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Note Title (e.g. Cardiopulmonary Exam Findings)..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="flex-1 p-2.5 bg-white border border-gray-300 rounded-xl text-xs"
                />
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value as any)}
                  className="p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold"
                >
                  <option value="observation">Observation</option>
                  <option value="diagnosis">Diagnosis</option>
                  <option value="treatment_plan">Treatment Plan</option>
                  <option value="general">General Note</option>
                </select>
              </div>

              <textarea
                rows={3}
                placeholder="Write private clinician thoughts, differential diagnoses, or confidential treatment observations..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingNote || !noteContent.trim()}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Lock size={13} />
                  <span>{isSavingNote ? 'Saving Private Note...' : 'Save Private Note'}</span>
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-900">{n.title}</span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {new Date(n.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: ALERTS MANAGEMENT */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900">Clinical Safety Alerts Triage</h4>
            <div className="space-y-3">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    al.severity === 'URGENT' ? 'bg-red-50/70 border-red-300' : 'bg-amber-50/70 border-amber-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={al.severity} size="sm" />
                      <span className="text-xs font-bold text-gray-900">{al.triggerValue}</span>
                      <span className="text-[10px] font-mono text-gray-500">({al.ruleVersion})</span>
                    </div>
                    <p className="text-xs text-gray-800">{al.reason}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Triggered: {new Date(al.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {al.status === 'ACTIVE' ? (
                      <>
                        <button
                          onClick={() => handleUpdateAlert(al.id, 'ACKNOWLEDGED')}
                          className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-lg border border-gray-300 shadow-sm"
                        >
                          Acknowledge
                        </button>
                        <button
                          onClick={() => handleUpdateAlert(al.id, 'RESOLVED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                        >
                          Resolve Alert
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg uppercase">
                        {al.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: AUDIT & REPORTS */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Clinical Summary Report</h4>
                <p className="text-xs text-gray-500">Generate an official printable report for chart inclusion.</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Printer size={14} />
                <span>Print / Export PDF</span>
              </button>
            </div>

            {/* Printable Clinical Sheet */}
            <div className="p-8 bg-white border border-gray-300 rounded-2xl shadow-sm text-xs space-y-4 print:shadow-none print:border-none">
              <div className="flex justify-between border-b pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-red-700">HEALTHLINK CLINICAL SUMMARY</h3>
                  <p className="text-gray-500">Patient: {patient.name} | ID: {patient.id}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold">Attending: {doctorName}</span>
                  <p className="text-gray-400">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-gray-700 uppercase block mb-1">Latest Vitals:</span>
                <p>
                  BP: {latestMeas?.bloodPressure ? `${latestMeas.bloodPressure.systolic}/${latestMeas.bloodPressure.diastolic} mmHg` : 'N/A'} |
                  Weight: {latestMeas?.weight ? `${latestMeas.weight.value} ${latestMeas.weight.unit}` : 'N/A'} |
                  Temp: {latestMeas?.temperature ? `${latestMeas.temperature.value}°${latestMeas.temperature.unit}` : 'N/A'} |
                  HR: {latestMeas?.heartRate ? `${latestMeas.heartRate} bpm` : 'N/A'}
                </p>
              </div>

              <div>
                <span className="font-bold text-gray-700 uppercase block mb-1">Recent Assessment & Recommendations:</span>
                {assessments.length > 0 ? (
                  <div className="space-y-1">
                    <p className="font-semibold">{assessments[0].summary}</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {assessments[0].recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No formal assessment recorded.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real-time WebRTC Call Modal */}
      <RealTimeCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        callerName={doctorName}
        callerRole="doctor"
        callType={callTypeToStart}
        recipientName={patient.name}
      />
    </div>
  );
};
