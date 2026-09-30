"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';

export const Header = () => {
  const router = useRouter();
  
  const loginItems = [
    { label: 'Patient Login', onClick: () => router.push('/login?role=patient') },
    { label: 'Doctor Login', onClick: () => router.push('/login?role=doctor') },
    { label: 'Hospital Login', onClick: () => router.push('/login?role=hospital') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white font-bold">
              H
            </div>
            <span className="text-xl font-bold tracking-tight text-brand-dark">HEALTHLINK</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-900 hover:text-brand">Home</Link>
            <Link href="#patients" className="text-sm font-medium text-gray-600 hover:text-brand">For Patients</Link>
            <Link href="#doctors" className="text-sm font-medium text-gray-600 hover:text-brand">For Doctors</Link>
            <Link href="#hospitals" className="text-sm font-medium text-gray-600 hover:text-brand">For Hospitals</Link>
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-brand">Features</Link>
            <Link href="#security" className="text-sm font-medium text-gray-600 hover:text-brand">Security</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <Dropdown 
              trigger={<Button variant="outline">Sign In</Button>} 
              items={loginItems} 
            />
          </div>
          {/* Mobile menu button could go here */}
        </div>
      </div>
    </header>
  );
};
