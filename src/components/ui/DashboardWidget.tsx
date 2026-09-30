import React from 'react';
import { Card } from './Card';

export interface DashboardWidgetProps { title: string; value: string | number; description?: string; icon?: React.ReactNode; trend?: 'up' | 'down' | 'neutral'; trendValue?: string; }

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ title, value, description, icon, trend, trendValue }) => {
  return (
    <Card className="flex flex-col p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
        {trend && trendValue && (
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-gray-500'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
          </span>
        )}
      </div>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </Card>
  );
};
