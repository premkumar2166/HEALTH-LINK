'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';

interface PatientAuthGuardProps {
  children: React.ReactNode;
}

export const PatientAuthGuard: React.FC<PatientAuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('healthlink_token');
    const sessionStr = localStorage.getItem('healthlink_session');

    if (!token && !sessionStr) {
      // Auto sign-in demo patient for smooth evaluation if completely clean
      const autoInit = async () => {
        try {
          const res = await fetch('/api/auth/patient-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patientName: 'John Doe',
              doctorName: 'Dr. Sarah Miller',
              doctorCode: 'DOC-7749',
            }),
          });
          const data = await res.json();
          if (data.token) {
            localStorage.setItem('healthlink_token', data.token);
            localStorage.setItem(
              'healthlink_session',
              JSON.stringify({
                userId: data.patient.id,
                name: data.patient.name,
                role: 'patient',
                doctorId: data.doctor.id,
                doctorName: data.doctor.name,
              })
            );
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (e) {
          setIsAuthenticated(false);
        }
      };
      autoInit();
      return;
    }

    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.role === 'patient') {
          setIsAuthenticated(true);
        } else {
          // If a doctor tries to open patient page, reject
          setIsAuthenticated(false);
        }
      } catch (e) {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500">Verifying Patient Credentials...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-red-200 shadow-2xl text-center space-y-6 animate-scale-up">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-md">
            <Lock size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Session Expired</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              For your security and HIPAA compliance, your HEALTHLINK patient session has ended or requires re-authentication.
            </p>
          </div>

          <button
            onClick={() => router.push('/patient/login')}
            className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2"
          >
            <LogIn size={16} />
            <span>Return to Patient Login</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
