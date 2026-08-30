import React from 'react';
import { ClinicalStatus } from '@/types/healthlink';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface StatusBadgeProps {
  status: ClinicalStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  customLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'md',
  customLabel,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  if (status === 'URGENT') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-red-100 text-red-800 border border-red-300 font-medium ${sizeClasses[size]}`}
        title="Urgent Attention / Configured Alert Condition"
      >
        {showIcon && <AlertOctagon size={iconSizes[size]} className="text-red-600 animate-pulse" />}
        <span>{customLabel || 'Urgent Attention'}</span>
      </span>
    );
  }

  if (status === 'REVIEW') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-medium ${sizeClasses[size]}`}
        title="Review / Follow-up Indicated"
      >
        {showIcon && <AlertTriangle size={iconSizes[size]} className="text-amber-600" />}
        <span>{customLabel || 'Review Recommended'}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium ${sizeClasses[size]}`}
      title="No active alert currently detected"
    >
      {showIcon && <CheckCircle2 size={iconSizes[size]} className="text-emerald-600" />}
      <span>{customLabel || 'No Active Alert'}</span>
    </span>
  );
};
