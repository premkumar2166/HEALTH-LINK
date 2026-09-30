import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className = '', label, error, id, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        id={inputId}
        ref={ref}
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-error focus:ring-error focus:border-error' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && <p id={`${inputId}-error`} className="text-sm text-error">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
