"use client";

import React from 'react';
import { AIAssistant } from '@/components/ai/AIAssistant';

export default function DoctorAIPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clinical AI Assistant</h1>
        <p className="text-gray-500">Draft responses, summarize charts, and retrieve clinical data.</p>
      </div>
      <AIAssistant role="DOCTOR" />
    </div>
  );
}
