"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ClinicalWorkspacePage() {
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clinical Workspace</h1>
        <p className="text-gray-500">Active Patient: John Doe (ID: p1)</p>
      </div>

      <div className="flex border-b border-gray-200">
        <button 
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'summary' ? 'border-b-2 border-brand text-brand' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('summary')}
        >
          Patient Summary
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'notes' ? 'border-b-2 border-brand text-brand' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('notes')}
        >
          Clinical Notes
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'queue' ? 'border-b-2 border-brand text-brand' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('queue')}
        >
          Review Queue
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'summary' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Summary</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                45-year-old male with a history of essential hypertension and newly diagnosed Type 2 Diabetes. 
                Currently managing on Metformin and Lisinopril. Overall compliant with medication.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">Active Problems</p>
                <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                  <li>Hypertension</li>
                  <li>Type 2 Diabetes Mellitus</li>
                </ul>
              </div>
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Communication</h3>
              <textarea 
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent h-32 resize-none mb-4"
                placeholder="Type a secure message to the patient..."
              ></textarea>
              <Button className="w-full">Send Secure Message</Button>
            </Card>
          </div>
        )}

        {activeTab === 'notes' && (
          <Card className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Clinical Notes</h3>
              <Button size="sm">New Note</Button>
            </div>
            <textarea 
              className="flex-1 w-full border border-gray-300 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
              placeholder="Write subjective, objective, assessment, and plan (SOAP) notes here..."
            ></textarea>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline">Save Draft</Button>
              <Button>Sign & Submit</Button>
            </div>
          </Card>
        )}

        {activeTab === 'queue' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Pending Review</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Comprehensive Metabolic Panel</p>
                  <p className="text-sm text-gray-500">Collected: 2 days ago</p>
                </div>
                <Button size="sm" variant="outline">Review Report</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Blood Pressure Log (Patient Upload)</p>
                  <p className="text-sm text-gray-500">Submitted: Yesterday</p>
                </div>
                <Button size="sm" variant="outline">Review Log</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
