"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChatMessage } from '@/types/ai';

interface AIAssistantProps {
  role: 'PATIENT' | 'DOCTOR' | 'HOSPITAL';
  contextData?: unknown;
}

export function AIAssistant({ role, contextData }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [providerConfigured, setProviderConfigured] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add initial greeting based on role
    const greetings = {
      PATIENT: "Hello! I am your HEALTHLINK Assistant. I can help explain medical terms, navigate the portal, or prepare questions for your doctor. How can I help you today?",
      DOCTOR: "Hello! I am your Clinical Assistant. I can summarize patient histories, draft responses, or help find records. What do you need?",
      HOSPITAL: "Hello! I am your Operational Assistant. I can generate analytics summaries, report on bed occupancy, and query inventory."
    };
    
    setTimeout(() => setMessages([{
      id: 'msg_0',
      role: 'assistant',
      content: greetings[role],
      timestamp: new Date().toISOString()
    }]), 0);
  }, [role]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, contextData })
      });
      
      if (!res.ok) throw new Error('Failed to communicate with AI');
      
      const data = await res.json();
      setProviderConfigured(data.providerConfigured);

      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString()
      }]);
    } catch (e) {
      setError("An error occurred connecting to the AI service. Please try again later.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] max-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🤖</span> HEALTHLINK AI
          </h2>
          <p className="text-xs text-gray-500">
            {providerConfigured === false ? "Running in Mock/Demo Mode" : "Secure Connection"}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-md mb-4 border border-blue-100 flex items-start gap-2">
        <span className="text-base mt-0.5">ℹ️</span>
        <div>
          <strong>AI Disclaimer:</strong> This AI is an assistant, not a doctor. It cannot diagnose, prescribe, or make clinical decisions. For medical concerns, always consult a qualified healthcare professional. Private data is only sent to authorized providers.
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar"
      >
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-brand text-white rounded-tr-none' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border border-gray-200 text-gray-500 p-3 rounded-lg rounded-tl-none text-sm">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center text-xs text-error mt-4">{error}</div>
        )}
      </div>

      {/* Input Area */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask the AI Assistant..."
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={isTyping || !input.trim()}>
          Send
        </Button>
      </div>
    </Card>
  );
}
