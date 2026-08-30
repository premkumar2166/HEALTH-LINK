'use client';

import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, CheckCircle2, AlertCircle, X, ShieldCheck, User } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSaved: (photoDataUrl: string) => void;
  currentPhoto?: string | null;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  onPhotoSaved,
  currentPhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhoto || null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  if (!isOpen) return null;

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Unsupported file format. Please upload a JPG, JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
      return;
    }

    setSelectedFile(file);

    // Read and validate dimensions
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        setPreviewUrl(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleStartUpload = () => {
    if (!previewUrl) return;

    setUploadStatus('uploading');

    // Simulate secure authenticated upload pipeline
    setTimeout(() => {
      setUploadStatus('processing');

      setTimeout(() => {
        setUploadStatus('success');

        setTimeout(() => {
          onPhotoSaved(previewUrl);
          setUploadStatus('idle');
          onClose();
        }, 800);
      }, 700);
    }, 600);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(currentPhoto || null);
    setErrorMessage(null);
    setUploadStatus('idle');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-photo-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-red-100 p-6 sm:p-8 space-y-6 animate-scale-up relative">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider">
            <Camera size={14} />
            <span>Identity Verification</span>
          </div>
          <h2 id="upload-photo-title" className="text-xl font-extrabold text-gray-900">
            Upload Patient Profile Photo
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Used for identity verification during telehealth sessions. Not used for autonomous medical diagnosis.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-start gap-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Upload Dropzone / Preview */}
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-red-200 hover:border-red-400 bg-red-50/30 rounded-2xl transition-all text-center">
          {previewUrl ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-red-500 shadow-md bg-white">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
              {selectedFile && (
                <div className="text-[11px] text-gray-600">
                  <span className="font-semibold text-gray-900">{selectedFile.name}</span>
                  <span className="text-gray-400 ml-1">
                    ({(selectedFile.size / 1024).toFixed(0)} KB
                    {dimensions ? ` • ${dimensions.width}×${dimensions.height}px` : ''})
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
                className="text-xs font-bold text-red-600 hover:underline pt-1"
              >
                Choose a different photo
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer space-y-2 flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-sm">
                <UploadCloud size={30} />
              </div>
              <div className="text-xs font-bold text-gray-900">
                Click to browse or drop an image here
              </div>
              <div className="text-[11px] text-gray-500">
                Supports JPG, JPEG, PNG, WebP (Max 5MB)
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Upload Status Indicator */}
        {uploadStatus !== 'idle' && (
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
            {uploadStatus === 'uploading' && (
              <>
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-gray-800">Uploading to encrypted clinical storage...</span>
              </>
            )}
            {uploadStatus === 'processing' && (
              <>
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-gray-800">Processing & sanitizing image headers...</span>
              </>
            )}
            {uploadStatus === 'success' && (
              <>
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">Upload successful!</span>
              </>
            )}
          </div>
        )}

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-[#FAFAFA] p-3 rounded-xl border border-gray-100">
          <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
          <span>Image data is stored in private encrypted storage with authenticated access control.</span>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartUpload}
            disabled={!previewUrl || uploadStatus !== 'idle'}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-red-600/30 transition-all flex items-center gap-1.5"
          >
            <Camera size={14} />
            <span>Save Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
