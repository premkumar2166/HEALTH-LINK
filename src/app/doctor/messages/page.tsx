'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { DoctorNav } from '@/components/doctor/DoctorNav';
import { DoctorBottomNav } from '@/components/doctor/DoctorBottomNav';
import { ChatMessage, Patient } from '@/types/healthlink';
import {
  MessageSquare,
  Send,
  User,
  PhoneCall,
  Video,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function DoctorMessagesPage() {
  const router = useRouter();

  const [doctorName, setDoctorName] = useState('Dr. Sarah Miller, MD');
  const [doctorId, setDoctorId] = useState('doc-1');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDoctorPatients = async () => {
    try {
      const token =
        localStorage.getItem('healthlink_doctor_token') ||
        localStorage.getItem('healthlink_token');

      const sessStr =
        localStorage.getItem('healthlink_doctor_session') ||
        localStorage.getItem('healthlink_session');

      if (sessStr) {
        try {
          const parsed = JSON.parse(sessStr);
          if (parsed.name) setDoctorName(parsed.name);
          if (parsed.userId) setDoctorId(parsed.userId);
        } catch (e) {}
      }

      const res = await fetch('/api/doctor/patients', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const list = data.patients || [];
        setPatients(list);
        if (list.length > 0 && !selectedPatient) {
          setSelectedPatient(list[0]);
          fetchConversation(list[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversation = async (patientId: string) => {
    try {
      const token =
        localStorage.getItem('healthlink_doctor_token') ||
        localStorage.getItem('healthlink_token');

      const res = await fetch(`/api/messaging?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDoctorPatients();

    const sse = new EventSource('/api/events');
    sse.addEventListener('NEW_MESSAGE', () => {
      if (selectedPatient) {
        fetchConversation(selectedPatient.id);
      }
    });
    sse.addEventListener('NEW_VOICE_MESSAGE', () => {
      if (selectedPatient) {
        fetchConversation(selectedPatient.id);
      }
    });

    return () => {
      sse.close();
    };
  }, [selectedPatient?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedPatient || isSending) return;

    setIsSending(true);
    const token =
      localStorage.getItem('healthlink_doctor_token') ||
      localStorage.getItem('healthlink_token');

    try {
      const res = await fetch('/api/messaging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: selectedPatient.id,
          text: replyText.trim(),
        }),
      });

      if (res.ok) {
        setReplyText('');
        fetchConversation(selectedPatient.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-16 md:pb-12 text-[#1A1A1A]">
      <Header portalType="doctor" userName={doctorName} isOnline={true} />
      <DoctorNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <MessageSquare size={26} className="text-[#D32F2F]" />
            <span>Doctor-Patient Secure Clinical Messaging</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Direct, HIPAA-compliant patient communication channel. Messages are delivered to the patient portal in real-time.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[560px]">
          {/* Left Panel: Patients List */}
          <div className="border-r border-gray-200 flex flex-col bg-gray-50/50">
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter patient conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#D32F2F]"
                />
                <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {filteredPatients.map((patient) => {
                const isSelected = selectedPatient?.id === patient.id;
                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => {
                      setSelectedPatient(patient);
                      fetchConversation(patient.id);
                    }}
                    className={`w-full p-4 text-left transition-all flex items-center justify-between ${
                      isSelected ? 'bg-[#FFEBEE] border-l-4 border-[#D32F2F]' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D32F2F] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">{patient.name}</div>
                        <div className="text-[10px] text-gray-500">
                          {patient.gender || 'Patient'} • ID: {patient.id}
                        </div>
                      </div>
                    </div>

                    {patient.unreadMessagesCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#D32F2F] text-white text-[10px] font-bold">
                        {patient.unreadMessagesCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Conversation Stream */}
          <div className="col-span-2 flex flex-col justify-between bg-white">
            {selectedPatient ? (
              <>
                {/* Chat Top Banner */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                      {selectedPatient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-black text-gray-900">{selectedPatient.name}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Authorized Patient Connection</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/doctor/patient/${selectedPatient.id}`}
                    className="text-xs font-bold text-[#D32F2F] hover:underline flex items-center gap-1"
                  >
                    <span>Open Clinical Chart</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>

                {/* Messages List */}
                <div className="flex-1 p-5 overflow-y-auto space-y-3 max-h-[400px]">
                  {messages.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 text-xs">
                      No messages exchanged yet. Send a message below.
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isDoctor = m.senderRole === 'doctor';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isDoctor ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                              isDoctor
                                ? 'bg-[#D32F2F] text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-900 rounded-bl-none'
                            }`}
                          >
                            <div className="font-extrabold text-[10px] opacity-80 mb-1">
                              {isDoctor ? `Dr. ${doctorName}` : selectedPatient.name}
                            </div>
                            <p>{m.text}</p>
                          </div>
                          <span className="text-[9px] text-gray-400 mt-1 px-1 font-mono">
                            {new Date(m.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50 flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type your professional clinical response to patient..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#D32F2F] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className="px-5 py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-gray-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>{isSending ? 'Sending...' : 'SEND'}</span>
                    <Send size={13} />
                  </button>
                </form>
              </>
            ) : (
              <div className="p-16 text-center text-gray-400 text-sm">
                Select a patient to view messages.
              </div>
            )}
          </div>
        </div>
      </main>

      <DoctorBottomNav />
    </div>
  );
}
