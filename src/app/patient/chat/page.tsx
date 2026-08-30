'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/common/Header';
import { PatientNav } from '@/components/patient/PatientNav';
import { PatientAuthGuard } from '@/components/patient/PatientAuthGuard';
import { VoiceRecorder } from '@/components/patient/VoiceRecorder';
import { RealTimeCallModal } from '@/components/common/RealTimeCallModal';
import { ChatMessage, VoiceMessage } from '@/types/healthlink';
import {
  MessageSquare,
  Send,
  Stethoscope,
  PhoneCall,
  Video,
  Mic,
  Volume2,
  CheckCheck,
  Check,
  Play,
  Pause,
  Clock,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export default function PatientChatPage() {
  const [doctorName, setDoctorName] = useState('Dr. Sarah Miller, MD');
  const [doctorId, setDoctorId] = useState('doc-1');
  const [patientName, setPatientName] = useState('John Doe');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Call modal
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('video');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatData = async () => {
    try {
      const token = localStorage.getItem('healthlink_token');
      const sessStr = localStorage.getItem('healthlink_session');
      if (sessStr) {
        try {
          const sess = JSON.parse(sessStr);
          setDoctorName(sess.doctorName || 'Dr. Sarah Miller, MD');
          setDoctorId(sess.doctorId || 'doc-1');
          setPatientName(sess.name || 'John Doe');
        } catch (e) {}
      }

      // Fetch text messages
      const resMsg = await fetch('/api/messaging', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resMsg.ok) {
        const data = await resMsg.json();
        setMessages(data.messages || []);
      }

      // Fetch voice messages
      const resVoice = await fetch('/api/messaging/voice', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resVoice.ok) {
        const data = await resVoice.json();
        setVoiceMessages(data.voiceMessages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchChatData();

    // Listen to real-time events via SSE
    const sse = new EventSource('/api/events');
    sse.addEventListener('NEW_MESSAGE', () => {
      fetchChatData();
    });
    sse.addEventListener('NEW_VOICE_MESSAGE', () => {
      fetchChatData();
    });

    return () => {
      sse.close();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const token = localStorage.getItem('healthlink_token');

    try {
      const res = await fetch('/api/messaging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: doctorId,
          text: inputText.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInputText('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <PatientAuthGuard>
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-24 md:pb-12 text-[#171717]">
        <Header
          portalType="patient"
          userName={patientName}
          assignedDoctorName={doctorName}
          isOnline={true}
        />
        <PatientNav userName={patientName} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Doctor Header Banner */}
          <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#D32F2F] flex items-center justify-center font-bold text-xl border border-red-100 shadow-xs flex-shrink-0">
                <Stethoscope size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-gray-900">{doctorName}</h1>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Available
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Authorized Clinical Attending • HealthLink Premier Tele-Clinical Center
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCallType('voice');
                  setIsCallOpen(true);
                }}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                <PhoneCall size={14} />
                <span>Voice Call</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCallType('video');
                  setIsCallOpen(true);
                }}
                className="px-4 py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow-red-600/30 transition-all"
              >
                <Video size={14} />
                <span>Video Consultation</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chat Stream (2 Cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-red-100 shadow-sm flex flex-col h-[560px] overflow-hidden">
              <div className="px-6 py-3.5 border-b border-gray-100 bg-[#FAFAFA] flex items-center justify-between text-xs">
                <span className="font-extrabold text-gray-800 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-[#D32F2F]" />
                  <span>Encrypted Clinical Messages</span>
                </span>
                <span className="text-gray-500 text-[11px] font-semibold flex items-center gap-1">
                  <Lock size={12} className="text-emerald-600" />
                  <span>End-to-End Encrypted Session</span>
                </span>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAFAFA]/50">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs space-y-2">
                    <MessageSquare size={32} className="text-gray-300" />
                    <span>No messages yet. Send a message to start a conversation with {doctorName}.</span>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isPatient = m.senderRole === 'patient';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isPatient ? 'items-end ml-auto' : 'items-start mr-auto'} max-w-lg`}
                      >
                        <span className="text-[10px] text-gray-400 font-semibold mb-1 px-1">
                          {m.senderName} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <div
                          className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isPatient
                              ? 'bg-[#D32F2F] text-white rounded-br-none'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                          }`}
                        >
                          {m.text}
                        </div>

                        {isPatient && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5 px-1 font-semibold">
                            {m.status === 'read' ? (
                              <span className="flex items-center gap-0.5 text-emerald-600">
                                <CheckCheck size={12} /> Read
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5">
                                <Check size={12} /> Delivered
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message to doctor..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-[#D32F2F] outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="px-6 py-3 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-gray-300 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </form>
            </div>

            {/* Voice Notes Studio (1 Col) */}
            <div className="space-y-6">
              <VoiceRecorder
                receiverId={doctorId}
                senderRole="patient"
                onVoiceSent={(newVM) => setVoiceMessages((prev) => [...prev, newVM])}
              />

              {/* Voice Notes History */}
              <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-5 space-y-3">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic size={14} className="text-[#D32F2F]" />
                  <span>Voice Memos Exchanged ({voiceMessages.length})</span>
                </h3>

                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {voiceMessages.length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic">No voice notes recorded yet.</p>
                  ) : (
                    voiceMessages.map((vm) => (
                      <div key={vm.id} className="p-3 bg-[#FAFAFA] border border-gray-200 rounded-2xl text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-gray-900">{vm.senderName}</span>
                          <span className="text-[10px] font-mono text-gray-400">{vm.durationSeconds}s</span>
                        </div>
                        {vm.transcript && (
                          <p className="text-[11px] text-gray-600 italic">"{vm.transcript}"</p>
                        )}
                        {vm.audioDataUrl && (
                          <audio controls src={vm.audioDataUrl} className="w-full h-8 mt-1" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Telehealth Call Modal */}
        <RealTimeCallModal
          isOpen={isCallOpen}
          onClose={() => setIsCallOpen(false)}
          callerName={patientName}
          callerRole="patient"
          callType={callType}
          recipientName={doctorName}
        />
      </div>
    </PatientAuthGuard>
  );
}
