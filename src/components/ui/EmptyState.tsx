import React from 'react';

export interface EmptyStateProps { title: string; description?: string; action?: React.ReactNode; icon?: React.ReactNode; }

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, icon }) => {
  return (
    <div className="text-center p-12 border border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-2 text-sm text-gray-500 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
