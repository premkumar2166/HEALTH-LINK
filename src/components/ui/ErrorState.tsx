import React from 'react';
import { Button } from './Button';

export interface ErrorStateProps { message?: string; onRetry?: () => void; }

export const ErrorState: React.FC<ErrorStateProps> = ({ message = 'Something went wrong. Please try again.', onRetry }) => {
  return (
    <div className="p-8 bg-red-50/50 border border-red-100 rounded-lg flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-error mb-4">
        <span className="text-xl font-bold">!</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
      <p className="text-error mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="danger" size="sm">Try Again</Button>
      )}
    </div>
  );
};
