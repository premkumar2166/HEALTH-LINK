'use client';

import React, { useState } from 'react';
import { Key, Lock, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword.length < 8) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match. Please re-check.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('healthlink_token');
      const res = await fetch('/api/patient/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'CHANGE_PASSWORD',
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to update password.' });
      } else {
        setStatusMessage({ type: 'success', text: data.message || 'Password changed successfully.' });
        setTimeout(() => {
          onClose();
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setStatusMessage(null);
        }, 1600);
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
      aria-labelledby="change-password-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-red-100 p-6 sm:p-8 space-y-6 animate-scale-up relative">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <Lock size={24} />
          </div>
          <div>
            <h2 id="change-password-title" className="text-lg font-extrabold text-gray-900">
              Change Account Password
            </h2>
            <p className="text-xs text-gray-500">Update your patient authentication credentials.</p>
          </div>
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
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              New Password (min 8 characters)
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-red-600/30 transition-all flex items-center gap-1.5"
            >
              <Key size={14} />
              <span>{isSubmitting ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
