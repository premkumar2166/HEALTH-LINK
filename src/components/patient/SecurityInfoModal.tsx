'use client';

import React from 'react';
import { ShieldCheck, Lock, UserCheck, Key, FileText, CheckCircle2, X } from 'lucide-react';

interface SecurityInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityInfoModal: React.FC<SecurityInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl border border-red-100 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-50 to-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D32F2F] text-white flex items-center justify-center shadow-md">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 id="security-modal-title" className="text-base font-extrabold text-gray-900">
                Patient Data Isolation & Security Architecture
              </h2>
              <p className="text-xs text-gray-500">
                End-to-end cryptographic and role-based safeguards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            aria-label="Close security info modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-gray-600 max-h-[70vh] overflow-y-auto">
          {/* Item 1 */}
          <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
              <UserCheck size={16} className="text-[#D32F2F]" />
              <span>Strict Patient Isolation (Zero Cross-Account Access)</span>
            </div>
            <p className="leading-relaxed">
              Every request is verified on the server using cryptographically signed JSON Web Tokens (JWT). A patient can only read and write their own records; URL manipulation or identifier tampering is rejected automatically by server-side authorization middleware.
            </p>
          </div>

          {/* Item 2 */}
          <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
              <Lock size={16} className="text-[#D32F2F]" />
              <span>Authorized Clinic-Doctor Binding</span>
            </div>
            <p className="leading-relaxed">
              Patient accounts are linked to verified clinician networks using the unique Doctor Authorization Code. Clinical communications, notes, and alerts flow exclusively between the patient and their assigned care team.
            </p>
          </div>

          {/* Item 3 */}
          <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
              <Key size={16} className="text-[#D32F2F]" />
              <span>Encrypted Transport & Audit Logging</span>
            </div>
            <p className="leading-relaxed">
              All telemetry, measurements, voice notes, and clinical chat messages are transmitted over secure TLS and verified against tamper-evident audit logs recording logins, vitals updates, and profile access.
            </p>
          </div>

          {/* Item 4 */}
          <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
              <FileText size={16} className="text-[#D32F2F]" />
              <span>HIPAA & GDPR Standards Alignment</span>
            </div>
            <p className="leading-relaxed">
              Adheres to minimum necessary data standards. Patients maintain complete access to export their personal health record or request record purge under applicable privacy legislation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
