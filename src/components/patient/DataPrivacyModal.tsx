'use client';

import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, Database, X, CheckCircle2 } from 'lucide-react';

interface DataPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataPrivacyModal: React.FC<DataPrivacyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-privacy-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-red-100 p-6 sm:p-8 space-y-6 my-8 animate-scale-up relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 block">
              HIPAA & Security Compliance
            </span>
            <h2 id="data-privacy-title" className="text-xl font-extrabold text-gray-900">
              Privacy, Data Governance & Permissions
            </h2>
          </div>
        </div>

        <div className="space-y-4 text-xs text-gray-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100">
            <h3 className="font-extrabold text-gray-900 mb-1 flex items-center gap-1.5">
              <Lock size={14} className="text-red-600" />
              <span>Patient Data Isolation & Access Controls</span>
            </h3>
            <p>
              Your health measurements, voice notes, and communications are encrypted in transit (TLS 1.3) and at rest (AES-256). Only your assigned physician is authorized to review your clinical chart.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-[#FAFAFA] rounded-xl border border-gray-200">
              <Eye size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 block">Role-Based Access Control (RBAC)</span>
                <span>Doctor clinical portals operate under strict credential authentication. Other physicians cannot view your panel without transfer authorization.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#FAFAFA] rounded-xl border border-gray-200">
              <Database size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 block">AI Safety & Educational Guardrails</span>
                <span>The AI Health Assistant provides patient education only. It does not perform autonomous diagnosis or prescribe pharmaceutical regimens.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#FAFAFA] rounded-xl border border-gray-200">
              <FileText size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 block">Audit Logging & Accountability</span>
                <span>Every access event, vital measurement log, and message exchange is immutably timestamped in the clinical audit registry for compliance.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white font-extrabold text-xs rounded-xl transition-all"
          >
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
