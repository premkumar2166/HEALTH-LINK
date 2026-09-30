"use client";

import React from 'react';
import { AIAssistant } from '@/components/ai/AIAssistant';

export default function PatientAIPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-gray-500">Get help navigating the portal or preparing for your next visit.</p>
      </div>
      <AIAssistant role="PATIENT" />
    </div>
  );
}
