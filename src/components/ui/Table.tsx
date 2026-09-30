import React from 'react';

export interface TableProps { headers: string[]; data: React.ReactNode[][]; className?: string; }

export const Table: React.FC<TableProps> = ({ headers, data, className = '' }) => {
  return (
    <div tabIndex={0} role="region" aria-label="Data table" className={`overflow-x-auto focus:outline-none focus:ring-2 focus:ring-brand rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h, i) => (
              <th key={i} scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-gray-200">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              {row.map((cell: React.ReactNode, j: number) => (
                <td key={j} className="px-6 py-4 whitespace-nowrap text-gray-900">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
