import React, { useState } from 'react';

export interface TabsProps { tabs: { id: string; label: string; content: React.ReactNode }[]; }

export const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  return (
    <div>
      <div className="flex border-b border-gray-200" role="tablist">
        {tabs.map((tab) => (
          <button 
            key={tab.id} 
            role="tab"
            aria-selected={activeId === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveId(tab.id)} 
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand ${activeId === tab.id ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-6">
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            id={`panel-${tab.id}`}
            role="tabpanel" 
            aria-labelledby={`tab-${tab.id}`} 
            hidden={activeId !== tab.id}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};
