"use client";

import React, { useState, useEffect } from 'react';
import { ChatInterface, ChatMessage } from '@/components/communication/ChatInterface';
import { Card } from '@/components/ui/Card';

const initialMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'doc_current',
    senderName: 'Me',
    type: 'text',
    content: 'Please make sure to monitor your blood pressure daily.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
  {
    id: 'msg-2',
    senderId: 'pat_1',
    senderName: 'John Doe',
    type: 'text',
    content: 'Will do, doctor. I uploaded the results to my documents.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  }
];

export default function DoctorMessagesPage() {
  const [userId, setUserId] = useState<string>('doc_current');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUserId(data.user.id);
      });
  }, []);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500">Secure clinical communication with patients.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
        {/* Inbox Sidebar */}
        <Card className="lg:col-span-1 overflow-y-auto p-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Active Conversations</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 bg-brand-light/10 border-l-4 border-brand cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-gray-900">John Doe</span>
                <span className="text-[10px] text-gray-500">1h ago</span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-1 font-bold">Will do, doctor. I uploaded the...</p>
            </div>
            <div className="p-4 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-gray-900">Sarah Connor</span>
                <span className="text-[10px] text-gray-500">Yesterday</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1">Thank you for the update.</p>
            </div>
          </div>
        </Card>

        {/* Chat Area */}
        <div className="lg:col-span-3 h-full min-h-0">
          <ChatInterface 
            currentUserId={userId}
            participantId="pat_1"
            participantName="John Doe"
            initialMessages={initialMessages}
          />
        </div>
      </div>
    </div>
  );
}
