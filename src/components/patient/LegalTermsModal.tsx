'use client';

import React from 'react';
import { ShieldCheck, FileText, Lock, X } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | 'security' | null;

interface LegalTermsModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const titles: Record<string, { title: string; subtitle: string; icon: any }> = {
    privacy: {
      title: 'HEALTHLINK Patient Privacy Notice',
      subtitle: 'Health Information Privacy & HIPAA Protection Standards',
      icon: FileText,
    },
    terms: {
      title: 'HEALTHLINK Terms of Service',
      subtitle: 'Patient Portal Access, Tele-monitoring & Communication Guidelines',
      icon: ShieldCheck,
    },
    security: {
      title: 'HEALTHLINK Platform Security Architecture',
      subtitle: 'Data Encryption, Isolation & Access Control Safeguards',
      icon: Lock,
    },
  };

  const current = titles[type] || titles.privacy;
  const Icon = current.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white w-full max-w-xl rounded-3xl border border-red-100 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-50 to-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D32F2F] text-white flex items-center justify-center shadow-md">
              <Icon size={22} />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-base font-extrabold text-gray-900">
                {current.title}
              </h2>
              <p className="text-xs text-gray-500">{current.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-gray-600 max-h-[65vh] overflow-y-auto leading-relaxed">
          {type === 'privacy' && (
            <>
              <div className="p-3.5 bg-[#FFEBEE] rounded-xl border border-red-200 text-red-900 font-semibold">
                Your medical data is private and confidential. HealthLink does not sell or share patient identifiable health information with advertisers or unauthorized third parties.
              </div>
              <h4 className="font-bold text-gray-900 text-sm">1. Protected Health Information (PHI)</h4>
              <p>
                We collect vitals (weight, blood pressure, temperature, heart rate), clinical messages, and consultation notes strictly for clinical care and tele-monitoring authorized by your healthcare provider.
              </p>
              <h4 className="font-bold text-gray-900 text-sm">2. Data Access & Portability</h4>
              <p>
                Under HIPAA and GDPR standards, you retain full rights to export your health records in structured JSON format and request record deletion via your profile security dashboard.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <div className="p-3.5 bg-[#FAFAFA] rounded-xl border border-gray-200 text-gray-800 font-semibold">
                Important: HEALTHLINK is a tele-monitoring platform and is NOT a replacement for emergency medical services.
              </div>
              <h4 className="font-bold text-gray-900 text-sm">1. Emergency Medical Care</h4>
              <p>
                If you are experiencing a life-threatening medical emergency (such as acute chest pain, severe shortness of breath, or loss of consciousness), call 911 or your local emergency response immediately.
              </p>
              <h4 className="font-bold text-gray-900 text-sm">2. Clinician Relationship</h4>
              <p>
                Patient accounts must be associated with a valid physician clinic authorization code. AI Assistant responses are educational and do not constitute independent medical diagnoses.
              </p>
            </>
          )}

          {type === 'security' && (
            <>
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-semibold">
                Industry-standard TLS 1.3 in-transit encryption, AES-256 at-rest protection, and cryptographically verified JWT patient sessions.
              </div>
              <h4 className="font-bold text-gray-900 text-sm">1. Multi-Layer Patient Isolation</h4>
              <p>
                Database queries and server endpoints enforce patient-specific tenant boundaries. No patient may access another patient's records or private physician clinical notes.
              </p>
              <h4 className="font-bold text-gray-900 text-sm">2. Audit Logging & Verification</h4>
              <p>
                Every authentication event, vitals submission, and profile update is timestamped in immutable server audit logs for compliance review.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
