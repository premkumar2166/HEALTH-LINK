"use client";

import React, { useState, useEffect } from 'react';
import { ChatInterface, ChatMessage } from '@/components/communication/ChatInterface';

const initialMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'doc_123',
    senderName: 'Dr. Sarah Smith',
    type: 'text',
    content: 'Hello! Your recent lab results look good. How are you feeling this week?',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
  {
    id: 'msg-2',
    senderId: 'pat_current',
    senderName: 'Me',
    type: 'text',
    content: 'I feel much better, thanks! The new medication is working well.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: true,
  }
];

export default function PatientMessagesPage() {
  const [userId, setUserId] = useState<string>('pat_current');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUserId(data.user.id);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500">Securely communicate with your healthcare providers.</p>
      </div>

      <div className="max-w-4xl">
        <ChatInterface 
          currentUserId={userId}
          participantId="doc_123"
          participantName="Dr. Sarah Smith"
          initialMessages={initialMessages}
        />
      </div>
    </div>
  );
}
