'use client';

import React, { useState } from 'react';
import { Bot, Send, ShieldAlert, Sparkles, HelpCircle, ArrowRight, User, AlertTriangle, ShieldCheck } from 'lucide-react';
import { EmergencyBanner } from '@/components/common/EmergencyBanner';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isEmergency?: boolean;
  suggestedDoctorQuestions?: string[];
  disclaimer?: string;
  timestamp: string;
}

export const AIAssistantChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: "Hello! I am **HEALTHLINK AI**, your educational health assistant.\n\nI can help you understand medical terminology, explain your dashboard metrics, and help you prepare questions for your doctor.\n\n*Important Notice: I provide general health education only. I do not diagnose medical conditions, prescribe medication, or replace the clinical judgment of your assigned physician.*",
      suggestedDoctorQuestions: [
        'What is the difference between Systolic and Diastolic blood pressure?',
        'How does daily weight fluctuation relate to fluid retention?',
        'What questions should I ask my doctor about my recent vital logs?',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState<string | null>(null);

  const handleSendMessage = async (queryToSend?: string) => {
    const query = (queryToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryToSend) setInputQuery('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('healthlink_token');
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      if (res.ok && data.response) {
        if (data.response.isEmergency) {
          setActiveEmergency(data.response.message);
        }

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.response.message,
          isEmergency: data.response.isEmergency,
          suggestedDoctorQuestions: data.response.suggestedDoctorQuestions,
          disclaimer: data.response.disclaimer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: 'ai',
            text: 'I could not process that request right now. Please try again or consult your doctor.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Network error connecting to AI Health Assistant.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-red-100 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-[#FAFAFA] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D32F2F] text-white flex items-center justify-center shadow-xs">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="font-black text-gray-900 text-base flex items-center gap-2">
              <span>HEALTHLINK AI</span>
              <span className="bg-[#FFEBEE] text-[#B71C1C] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-200 uppercase tracking-wider">
                Health Education
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              Guidance on medical terminology, vital trends, and doctor consultation preparation.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck size={14} />
          <span>Safety Guardrails Active</span>
        </div>
      </div>

      {/* Emergency Alert Banner if triggered */}
      {activeEmergency && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <EmergencyBanner message={activeEmergency} />
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAFAFA]/50">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end ml-auto' : 'items-start mr-auto'} max-w-2xl`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-gray-400 font-semibold">
                {isUser ? (
                  <>
                    <span>You</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </>
                ) : (
                  <>
                    <Bot size={12} className="text-[#D32F2F]" />
                    <span className="font-extrabold text-gray-700">HEALTHLINK AI</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </>
                )}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#D32F2F] text-white rounded-br-none'
                    : m.isEmergency
                    ? 'bg-red-50 text-red-950 border-2 border-[#D32F2F] rounded-bl-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {m.suggestedDoctorQuestions && m.suggestedDoctorQuestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs font-bold text-[#B71C1C] flex items-center gap-1 mb-2">
                      <HelpCircle size={14} /> Suggested Questions for Your Doctor:
                    </span>
                    <div className="space-y-1.5">
                      {m.suggestedDoctorQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(q)}
                          className="w-full text-left p-2.5 rounded-xl bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-xs text-gray-800 hover:text-red-950 transition-all flex items-center justify-between group"
                        >
                          <span>"{q}"</span>
                          <ArrowRight
                            size={13}
                            className="text-gray-400 group-hover:text-[#D32F2F] transition-transform group-hover:translate-x-1"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3.5 bg-white rounded-2xl border border-gray-200 w-fit text-xs text-gray-500 animate-pulse shadow-xs">
            <Bot size={16} className="text-[#D32F2F]" />
            <span>Analyzing health educational context safely...</span>
          </div>
        )}
      </div>

      {/* Input Box & Legal Disclaimer Footer */}
      <div className="p-4 bg-white border-t border-gray-200 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask a health terminology question (e.g. 'What is normal systolic BP?')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-[#D32F2F] outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-6 py-3 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-gray-300 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <Send size={15} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>

        <p className="text-[11px] text-gray-500 text-center leading-tight">
          <strong>Mandatory Notice:</strong> AI-generated information is for general educational purposes and does not replace professional medical advice. The AI does not diagnose, prescribe, change medication, or override your doctor.
        </p>
      </div>
    </div>
  );
};
