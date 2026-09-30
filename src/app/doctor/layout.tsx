"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RealtimeProvider } from '@/contexts/RealtimeContext';

const sidebarItems = [
  { label: 'Dashboard', href: '/doctor', icon: '📊' },
  { label: 'My Patients', href: '/doctor/patients', icon: '👥' },
  { label: 'Clinical Workspace', href: '/doctor/workspace', icon: '🩺' },
  { label: 'Patient Timeline', href: '/doctor/timeline', icon: '⏱️' },
  { label: 'Appointments', href: '/doctor/appointments', icon: '📅' },
  { label: 'Messages', href: '/doctor/messages', icon: '💬' },
  { label: 'Voice Messages', href: '/doctor/voice', icon: '🎤' },
  { label: 'Patient Documents', href: '/doctor/documents', icon: '📄' },
  { label: 'Reports', href: '/doctor/reports', icon: '📋' },
  { label: 'AI Assistant', href: '/doctor/ai', icon: '🤖' },
  { label: 'Notifications', href: '/doctor/notifications', icon: '🔔' },
  { label: 'Profile', href: '/doctor/profile', icon: '👤' },
  { label: 'Security', href: '/doctor/security', icon: '🔒' },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; role: string; profile: { firstName?: string; lastName?: string; name?: string; specialty?: string; hospital?: string; phone?: string; email?: string; status?: string } } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <RealtimeProvider userId={user?.id}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex ${isMobileMenuOpen ? '!flex absolute inset-y-0 left-0 z-50 shadow-xl' : ''}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white font-bold">H</div>
            <span className="text-xl font-bold tracking-tight text-brand-dark">HEALTHLINK</span>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">
            {user ? `Dr. ${user.profile.lastName}` : 'Loading...'}
          </p>
          <p className="text-xs text-gray-500">Provider Portal</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {sidebarItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href 
                    ? 'bg-brand-light/20 text-brand' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true" />}
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="font-bold text-brand">HEALTHLINK Provider</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand" aria-expanded={isMobileMenuOpen} aria-label="Toggle mobile menu"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button></header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
    </RealtimeProvider>
  );
}
