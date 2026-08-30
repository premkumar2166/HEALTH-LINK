'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, MessageSquare, Bell, User } from 'lucide-react';

export const DoctorBottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/doctor/dashboard#patients', label: 'Patients', icon: Users },
    { href: '/doctor/messages', label: 'Messages', icon: MessageSquare },
    { href: '/doctor/alerts', label: 'Alerts', icon: Bell },
    { href: '/doctor/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1 shadow-lg">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all ${
                isActive ? 'text-[#D32F2F] bg-red-50' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#D32F2F]' : 'text-gray-400'} />
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
