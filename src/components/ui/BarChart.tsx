import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  color?: string;
}

export function BarChart({ data, title, height = 200, color = 'bg-brand' }: BarChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-sm italic">No data available to display.</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero

  return (
    <div className="w-full" role="figure" aria-label={title ? `Bar chart: ${title}` : "Bar chart"}>
      {title && <h3 className="text-md font-medium text-gray-700 mb-4">{title}</h3>}
      <div className="flex items-end gap-2" style={{ height: `${height}px` }}>
        {data.map((point, index) => {
          const percentage = (point.value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div 
                className={`w-full rounded-t-sm transition-all duration-300 ${color} hover:opacity-80`}
                style={{ height: `${percentage}%`, minHeight: percentage > 0 ? '4px' : '0' }}
              >
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity">
                  {point.label}: {point.value}
                </div>
              </div>
              <div className="text-[10px] text-gray-500 mt-2 truncate w-full text-center">
                {point.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
