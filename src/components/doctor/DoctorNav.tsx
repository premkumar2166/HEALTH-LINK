'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calculator,
  FileText,
  Bell,
  MessageSquare,
  User,
  ShieldCheck,
} from 'lucide-react';

export const DoctorNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/doctor/alerts', label: 'Alerts Center', icon: Bell },
    { href: '/doctor/messages', label: 'Messages', icon: MessageSquare },
    { href: '/doctor/calculator', label: 'Clinical Tools', icon: Calculator },
    { href: '/doctor/reports', label: 'Reports & Audit', icon: FileText },
    { href: '/doctor/profile', label: 'Profile', icon: User },
    { href: '/doctor/security', label: 'Security', icon: ShieldCheck },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-4 h-12 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === '/doctor/dashboard' && pathname.startsWith('/doctor/patient'));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center px-3 pt-1 border-b-2 text-xs font-extrabold whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-[#D32F2F] text-[#D32F2F] bg-red-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon
                  size={15}
                  className={`mr-1.5 ${isActive ? 'text-[#D32F2F]' : 'text-gray-400'}`}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
