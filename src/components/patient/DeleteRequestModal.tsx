'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, X, ShieldAlert } from 'lucide-react';

interface DeleteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteRequestModal: React.FC<DeleteRequestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (confirmText.trim() !== 'DELETE') {
      setStatusMessage({ type: 'error', text: 'Please type DELETE exactly in capital letters to confirm.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('healthlink_token');
      const res = await fetch('/api/patient/delete-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: reason.trim(),
          confirmText: confirmText.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to submit request.' });
      } else {
        setStatusMessage({
          type: 'success',
          text: data.message || 'Request successfully recorded in the compliance audit queue.',
        });
        setTimeout(() => {
          onClose();
          setReason('');
          setConfirmText('');
          setStatusMessage(null);
        }, 2200);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Network failure. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-request-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-red-200 p-6 sm:p-8 space-y-6 animate-scale-up relative">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
            <Trash2 size={24} />
          </div>
          <div>
            <h2 id="delete-request-title" className="text-lg font-extrabold text-gray-900">
              Request Data Deletion
            </h2>
            <p className="text-xs text-gray-500">Formal HIPAA & Privacy Data Purge Request</p>
          </div>
        </div>

        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-700" />
            <span>Clinical Record Notice</span>
          </div>
          <p className="text-[11px]">
            Federal and state healthcare regulations require clinical providers to retain certain diagnostic records for statutory retention periods (typically 7 years).
          </p>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Reason for Deletion (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Account closure or provider transfer"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Type <span className="text-red-600 font-mono">DELETE</span> to confirm
            </label>
            <input
              type="text"
              required
              placeholder="DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || confirmText !== 'DELETE'}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-red-600/30 transition-all flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
