"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DocumentMetadata } from '@/types/document';

export default function PatientDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserId(data.user.id);
          fetchDocuments();
        }
      });
  }, []);

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'Other');
    formData.append('patientId', userId);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        fetchDocuments();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to upload document.');
      }
    } catch (e) {
      alert('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (id: string, filename: string) => {
    // In a real system, we'd trigger a download via an invisible link
    // Because we need cookies to be sent, we can just use window.location or fetch + blob
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

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading documents...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Documents</h1>
        <p className="text-gray-500">Securely manage your medical records, test results, and administrative files.</p>
      </div>

      {/* Upload Zone */}
      <Card 
        className={`border-2 border-dashed transition-colors text-center py-12 ${
          dragActive ? 'border-brand bg-brand-light/10' : 'border-gray-300 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-4xl mb-4">📁</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload a Document</h3>
        <p className="text-sm text-gray-500 mb-6">Drag and drop your files here, or click to browse.</p>
        
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          onChange={handleChange}
          disabled={isUploading}
          accept="application/pdf, image/jpeg, image/png, image/webp"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 h-10 px-4 py-2" style={{ pointerEvents: isUploading ? 'none' : 'auto', opacity: isUploading ? 0.5 : 1 }}>
            {isUploading ? 'Uploading securely...' : 'Select File'}
          </div>
        </label>
        <p className="text-xs text-gray-400 mt-4">
          Files are stored in private storage and encrypted at rest. Maximum size 10MB.
          Supported formats: PDF, JPG, PNG, WEBP.
        </p>
      </Card>

      {/* Document List */}
      <Card>
        <h3 className="text-lg font-semibold mb-6">Your Files</h3>
        
        {documents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No documents found.
          </div>
        ) : (
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Documents table">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Document Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date Uploaded</th>
                  <th className="px-4 py-3">Uploaded By</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900 flex items-center gap-3">
                      <span className="text-xl">
                        {doc.mimeType.includes('pdf') ? '📄' : doc.mimeType.includes('image') ? '🖼️' : '📝'}
                      </span>
                      <div>
                        {doc.filename}
                        <div className="text-xs text-gray-400 font-normal">{formatSize(doc.sizeBytes)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{doc.documentType}</td>
                    <td className="px-4 py-4">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4">{doc.uploadedByName}</td>
                    <td className="px-4 py-4 text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(doc.id, doc.filename)}>
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
