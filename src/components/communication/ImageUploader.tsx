"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { logger } from '@/lib/logger';

interface ImageUploaderProps {
  onSend: (file: File, caption: string) => void;
  onCancel: () => void;
}

export function ImageUploader({ onSend, onCancel }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate MIME type
    if (!selectedFile.type.startsWith('image/')) {
      logger.warn('FILE_UPLOAD_REJECTED', { reason: 'invalid_mime', type: selectedFile.type });
      setError('Invalid file type. Only images are allowed.');
      return;
    }

    // Validate size (e.g., max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      logger.warn('FILE_UPLOAD_REJECTED', { reason: 'size_exceeded', size: selectedFile.size });
      setError('File size exceeds the 5MB limit.');
      return;
    }

    // Read and validate dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(selectedFile);
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        setError('Image dimensions are too small (minimum 100x100).');
        URL.revokeObjectURL(objectUrl);
        return;
      }
      setPreview(objectUrl);
      setFile(selectedFile);
    };
    img.onerror = () => {
      logger.error('FILE_UPLOAD_FAILED', { reason: 'invalid_image_content' });
      setError('Invalid image content.');
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  const handleSend = () => {
    if (file) {
      onSend(file, caption);
    }
  };

  if (preview) {
    return (
      <div className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-200 w-full space-y-4">
        <div className="relative w-full h-48 bg-gray-200 rounded-md overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="object-cover w-full h-full" />
        </div>
        <input 
          type="text" 
          placeholder="Add a caption..." 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50" onClick={onCancel}>Cancel</Button>
          <Button className="flex-1" onClick={handleSend}>Send Image</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 w-full text-center">
      <div className="text-4xl mb-2">📸</div>
      <p className="text-sm text-gray-500 mb-4">Select an image from your device</p>
      
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      
      <div className="flex gap-2 w-full">
        <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" className="flex-1" onClick={() => fileInputRef.current?.click()}>
          Choose Image
        </Button>
      </div>

      {error && <p className="text-error text-xs mt-3 font-medium">{error}</p>}
    </div>
  );
}
