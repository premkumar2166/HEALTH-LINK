import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white font-bold">H</div>
              <span className="text-xl font-bold tracking-tight text-brand-dark">HEALTHLINK</span>
            </div>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Connected Care. Better Communication. Smarter Healthcare.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="#patients" className="text-sm text-gray-600 hover:text-brand">For Patients</Link></li>
              <li><Link href="#doctors" className="text-sm text-gray-600 hover:text-brand">For Doctors</Link></li>
              <li><Link href="#hospitals" className="text-sm text-gray-600 hover:text-brand">For Hospitals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#about" className="text-sm text-gray-600 hover:text-brand">About Us</Link></li>
              <li><Link href="#security" className="text-sm text-gray-600 hover:text-brand">Security</Link></li>
              <li><Link href="#" className="text-sm text-gray-600 hover:text-brand">Contact (Unavailable)</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-gray-600 hover:text-brand">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-gray-600 hover:text-brand">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} HEALTHLINK. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Design showcase only. Not a medical device.
          </p>
        </div>
      </div>
    </footer>
  );
};
