import React from 'react';

export interface ToastProps { message: string; type?: 'info' | 'success' | 'error' | 'warning'; onClose?: () => void; }

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const styles = {
    info: 'bg-white border-l-4 border-brand text-gray-800',
    success: 'bg-white border-l-4 border-success text-gray-800',
    error: 'bg-white border-l-4 border-error text-gray-800',
    warning: 'bg-white border-l-4 border-warning text-gray-800',
  };
  return (
    <div 
      className={`fixed bottom-4 right-4 px-4 py-3 rounded shadow-lg flex items-center justify-between gap-4 min-w-[300px] ${styles[type]}`}
      role="alert"
    >
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-sm p-1" aria-label="Close">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
};
