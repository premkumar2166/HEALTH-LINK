'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LineChart,
  MessageSquare,
  Bot,
  Clock,
  User,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { LogoutConfirmModal } from './LogoutConfirmModal';

interface PatientNavProps {
  userName?: string;
}

export const PatientNav: React.FC<PatientNavProps> = ({ userName = 'John Doe' }) => {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navItems = [
    { href: '/patient/dashboard', label: 'Dashboard', icon: Home },
    { href: '/patient/trends', label: 'Health Trends', icon: LineChart },
    { href: '/patient/chat', label: 'Doctor Chat', icon: MessageSquare },
    { href: '/patient/ai-assistant', label: 'AI Assistant', icon: Bot },
    { href: '/patient/timeline', label: 'History', icon: Clock },
    { href: '/patient/profile', label: 'Profile', icon: User },
    { href: '/patient/settings', label: 'Settings', icon: Settings },
  ];

  const mobileNavItems = [
    { href: '/patient/dashboard', label: 'Home', icon: Home },
    { href: '/patient/trends', label: 'Trends', icon: LineChart },
    { href: '/patient/chat', label: 'Chat', icon: MessageSquare },
    { href: '/patient/ai-assistant', label: 'AI', icon: Bot },
    { href: '/patient/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Desktop Horizontal Sub-Navigation */}
      <nav aria-label="Patient Portal Navigation" className="hidden md:block bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13">
            <div className="flex space-x-1 sm:space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#FFEBEE] text-[#B71C1C] border border-red-200 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon
                      size={15}
                      className={`mr-2 ${isActive ? 'text-[#D32F2F] stroke-[2.5]' : 'text-gray-400'}`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-[#D32F2F] hover:text-white bg-red-50 hover:bg-[#D32F2F] border border-red-200 hover:border-[#D32F2F] rounded-xl transition-all shadow-xs"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav aria-label="Mobile Bottom Navigation" className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40 shadow-lg pb-safe">
        <div className="grid grid-cols-5 h-16">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center text-[10px] font-extrabold transition-all ${
                  isActive ? 'text-[#D32F2F] bg-red-50/70 border-t-2 border-[#D32F2F]' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon size={19} className={isActive ? 'text-[#D32F2F] stroke-[2.5]' : 'stroke-[1.8] text-gray-400'} />
                <span className="mt-1 truncate max-w-[54px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        userName={userName}
      />
    </>
  );
};
