import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> { children: React.ReactNode; className?: string; id?: string; }

export const Card: React.FC<CardProps> = ({ children, className = '', id, ...props }) => {
  return (
    <div id={id} className={`bg-surface shadow-sm border border-gray-100 rounded-lg ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`} {...props}>{children}</div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-bold text-gray-900 ${className}`} {...props}>{children}</h3>
);

export const CardContent: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>{children}</div>
);
