import React from 'react';

export interface BadgeProps { children: React.ReactNode; className?: string; variant?: 'default' | 'success' | 'warning' | 'error' | 'brand'; }

export const Badge: React.FC<BadgeProps> = ({ children, className = '', variant = 'default' }) => {
  const baseStyle = "px-2.5 py-0.5 inline-flex items-center text-xs font-semibold rounded-full";
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-success",
    warning: "bg-yellow-100 text-warning",
    error: "bg-red-100 text-error",
    brand: "bg-brand-light text-brand-dark",
  };
  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
