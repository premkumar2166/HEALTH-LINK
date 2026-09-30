import React, { forwardRef } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ children, className = '', label, error, id, ...props }, ref) => {
  const selectId = id || props.name;
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label htmlFor={selectId} className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        id={selectId}
        ref={ref}
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-error focus:ring-error focus:border-error' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        {children}
      </select>
      {error && <p id={`${selectId}-error`} className="text-sm text-error">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';
