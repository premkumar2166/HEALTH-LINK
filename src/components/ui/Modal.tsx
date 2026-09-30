import React, { useEffect, useRef } from 'react';

export interface ModalProps { isOpen: boolean; onClose: () => void; children: React.ReactNode; ariaLabelledby?: string; }

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, ariaLabelledby }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus();
    }
  }, [isOpen]);
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0" role="dialog" aria-modal="true" aria-labelledby={ariaLabelledby}>
      <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={onClose} aria-hidden="true" />
      <div ref={modalRef} className="relative bg-surface rounded-lg shadow-xl overflow-hidden transform transition-all sm:max-w-lg w-full max-h-[90vh] flex flex-col">
        <button 
          ref={closeBtnRef}
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-sm p-1"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
