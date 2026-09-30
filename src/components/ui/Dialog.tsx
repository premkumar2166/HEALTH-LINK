import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface DialogProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  const titleId = `dialog-title-${title.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabelledby={titleId}>
      <div className="mb-4">
        <h2 id={titleId} className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="text-sm text-gray-600">
        {children}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} variant="secondary">Close</Button>
      </div>
    </Modal>
  );
};
