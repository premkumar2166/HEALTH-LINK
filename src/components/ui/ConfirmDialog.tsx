import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmText?: string; cancelText?: string; }

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  const titleId = `confirm-title-${title.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabelledby={titleId}>
      <div className="mb-4">
        <h2 id={titleId} className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <p className="text-sm text-gray-600">{message}</p>
      <div className="mt-8 flex justify-end gap-3">
        <Button onClick={onClose} variant="outline">{cancelText}</Button>
        <Button onClick={() => { onConfirm(); onClose(); }} variant="primary">{confirmText}</Button>
      </div>
    </Modal>
  );
};
