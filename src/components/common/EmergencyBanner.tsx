import React from 'react';
import { AlertOctagon, PhoneCall, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface EmergencyBannerProps {
  message?: string;
  onDismiss?: () => void;
  showEmergencyCall?: boolean;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  message = 'If you or someone you know is experiencing severe chest pain, inability to breathe, slurred speech, or uncontrollable bleeding, please call emergency services immediately.',
  showEmergencyCall = true,
}) => {
  return (
    <div className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-md border-2 border-red-700 mb-6 transition-all duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-red-700 rounded-lg text-white mt-0.5 md:mt-0 flex-shrink-0 animate-bounce">
            <AlertOctagon size={20} />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide uppercase text-red-100 flex items-center gap-2">
              <span>Medical Safety Notice</span>
              <span className="bg-white/20 text-xs px-2 py-0.2 rounded-full font-semibold">Immediate Care</span>
            </div>
            <p className="text-sm font-medium text-white/95 mt-0.5 leading-snug">
              {message}
            </p>
          </div>
        </div>
        {showEmergencyCall && (
          <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-auto">
            <a
              href="tel:911"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-red-700 hover:bg-red-50 text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <PhoneCall size={14} />
              <span>Call 911 / EMS</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
