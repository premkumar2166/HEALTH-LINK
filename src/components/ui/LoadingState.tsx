import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col justify-center items-center p-12 gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-brand" role="status" aria-label="Loading">
        <span className="sr-only">Loading...</span>
      </div>
      {message && <p className="text-sm text-gray-500 font-medium">{message}</p>}
    </div>
  );
};
