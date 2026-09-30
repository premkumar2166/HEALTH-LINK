"use client";

import React from 'react';
import { AIAssistant } from '@/components/ai/AIAssistant';

export default function HospitalAIPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Operational AI Assistant</h1>
        <p className="text-gray-500">Query hospital analytics, track beds, and summarize inventory.</p>
      </div>
      <AIAssistant role="HOSPITAL" />
    </div>
  );
}
