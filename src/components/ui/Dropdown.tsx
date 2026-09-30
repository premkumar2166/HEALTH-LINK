"use client";
import React, { useState, useRef, useEffect } from 'react';

export interface DropdownProps { trigger: React.ReactNode; items: { label: string; onClick: () => void }[]; }

export const Dropdown: React.FC<DropdownProps> = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer" aria-haspopup="true" aria-expanded={isOpen}>
        {trigger}
      </div>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-surface ring-1 ring-black/5 z-10 focus:outline-none" role="menu" aria-orientation="vertical">
          <div className="py-1" role="none">
            {items.map((item, i) => (
              <button 
                key={i} 
                role="menuitem"
                onClick={() => { item.onClick(); setIsOpen(false); }} 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:bg-gray-100"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
