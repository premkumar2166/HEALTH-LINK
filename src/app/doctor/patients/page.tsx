"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DocumentMetadata } from '@/types/document';

const mockPatients = [
  { id: 'p1', name: 'John Doe', age: 45, status: 'Active', lastVisit: '2026-09-15', nextAppt: '2026-10-12', alerts: [] },
  { id: 'p2', name: 'Sarah Connor', age: 38, status: 'Active', lastVisit: '2026-08-20', nextAppt: '2026-10-12', alerts: ['High BP'] },
  { id: 'p3', name: 'Michael Chang', age: 62, status: 'Active', lastVisit: '2026-09-22', nextAppt: '2026-10-15', alerts: [] },
];

export default function MyPatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientDocuments, setPatientDocuments] = useState<DocumentMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const filteredPatients = mockPatients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePatient = mockPatients.find(p => p.id === selectedPatient);

  const handleViewPatient = async (patientId: string) => {
    try {
      const res = await fetch(`/api/doctor/patients/${patientId}`);
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Access Denied');
        return;
      }
      setSelectedPatient(patientId);
      
      // Fetch documents for this patient
      const docRes = await fetch('/api/documents');
      if (docRes.ok) {
        const docData = await docRes.json();
        // The API returns all accessible, we filter by patient here just in case
        setPatientDocuments((docData.documents || []).filter((d: DocumentMetadata) => d.patientId === patientId));
      }
    } catch (err) {
      alert('Error verifying authorization.');
    }
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>, patientId: string) => {
    if (!e.target.files || !e.target.files[0]) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('documentType', 'Clinical Note');
    formData.append('patientId', patientId);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const newDocData = await res.json();
        setPatientDocuments(prev => [...prev, newDocData.document]);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to upload document.');
      }
    } catch (err) {
      alert('An error occurred during upload.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = (id: string, filename: string) => {
    fetch(`/api/documents/${id}?action=download`)
      .then(res => {
        if (res.ok) return res.blob();
        throw new Error('Unauthorized');
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      })
      .catch(e => alert(e.message));
  };

  if (activePatient) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedPatient(null)}>← Back to List</Button>
        
        <div className="flex justify-between items-start bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-brand-light text-brand-dark rounded-full flex items-center justify-center text-3xl font-bold">
              {activePatient.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{activePatient.name}</h1>
              <p className="text-gray-500">Age: {activePatient.age} | ID: {activePatient.id.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary">Message</Button>
            <Button variant="outline">Schedule</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Health History</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>Hypertension (Diagnosed 2024)</li>
              <li>Type 2 Diabetes (Diagnosed 2022)</li>
            </ul>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Measurements</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span>Blood Pressure</span> <span className="font-medium text-gray-900">130/85</span></div>
              <div className="flex justify-between"><span>Weight</span> <span className="font-medium text-gray-900">82 kg</span></div>
              <div className="flex justify-between"><span>Glucose</span> <span className="font-medium text-gray-900">95 mg/dL</span></div>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
              <div>
                <input 
                  type="file" 
                  id="doc-upload" 
                  className="hidden" 
                  onChange={(e) => uploadFile(e, activePatient.id)}
                  disabled={isUploading}
                  accept="application/pdf, image/jpeg, image/png, image/webp"
                />
                <label htmlFor="doc-upload" className="cursor-pointer">
                  <span className={`text-xs px-3 py-1 rounded border border-brand text-brand hover:bg-brand hover:text-white transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </span>
                </label>
              </div>
            </div>
            
            {patientDocuments.length === 0 ? (
              <p className="text-sm text-gray-500">No documents found for this patient.</p>
            ) : (
              <ul className="space-y-2 text-sm text-brand">
                {patientDocuments.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).map(doc => (
                  <li key={doc.id} className="cursor-pointer hover:underline flex justify-between items-center" onClick={() => handleDownload(doc.id, doc.filename)}>
                    <span className="truncate pr-2">📄 {doc.filename}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
        <p className="text-gray-500">Manage and view your authorized patients.</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input 
              placeholder="Search patients by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">Filter Options</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Patient Name</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Last Visit</th>
                <th className="px-4 py-3">Alerts</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-light text-brand-dark rounded-full flex items-center justify-center font-bold">
                      {patient.name.charAt(0)}
                    </div>
                    {patient.name}
                  </td>
                  <td className="px-4 py-4">{patient.age}</td>
                  <td className="px-4 py-4">{patient.lastVisit}</td>
                  <td className="px-4 py-4">
                    {patient.alerts.length > 0 ? (
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                         {patient.alerts[0]}
                       </span>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewPatient(patient.id)}>View File</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPatients.length === 0 && (
            <div className="text-center py-8 text-gray-500">No patients found matching your search.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
