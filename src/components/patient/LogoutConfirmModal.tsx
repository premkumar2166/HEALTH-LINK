'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  userName = 'Patient',
}) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      const token = localStorage.getItem('healthlink_token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      // 1. Invalidate current auth session
      // 2. Clear client-side authentication state
      localStorage.removeItem('healthlink_token');
      localStorage.removeItem('healthlink_session');
      localStorage.removeItem('healthlink_patient_photo');
      sessionStorage.clear();

      // 3. Clear temporary state
      setIsLoggingOut(false);
      onClose();

      // 4. Redirect to Patient Login page
      router.push('/patient/login');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-red-100 p-6 sm:p-8 space-y-6 animate-scale-up relative">
        {/* Close icon */}
        <button
          onClick={onClose}
          disabled={isLoggingOut}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <LogOut size={28} className="translate-x-0.5" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600 block">
              Patient Session Security
            </span>
            <h2 id="logout-dialog-title" className="text-xl font-extrabold text-gray-900 tracking-tight">
              Sign out of HEALTHLINK?
            </h2>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3 bg-[#FAFAFA] p-4 rounded-2xl border border-gray-200 text-xs text-gray-600 leading-relaxed">
          <p>
            Are you sure you want to sign out of your patient account, <strong>{userName}</strong>?
          </p>
          <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
            <span>Your current patient session and temporary cached data will be securely destroyed.</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            <span>{isLoggingOut ? 'Ending Session...' : 'Log Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
