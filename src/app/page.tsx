"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import dynamic from 'next/dynamic';

const Network3D = dynamic(() => import('@/components/network/Network3D').then(m => m.Network3D), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});

export default function LandingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-1">
        {/* 1 & 2. Hero Section */}
        <section className="relative overflow-hidden bg-white pt-24 pb-32 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
              Connected Care.<br/>
              <span className="text-brand">Better Communication.</span><br/>
              Smarter Healthcare.
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              The unified healthcare platform bridging the gap between patients, healthcare professionals, and hospital administration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="primary" onClick={() => router.push('/login?role=patient')}>
                Patient Portal
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/login?role=doctor')}>
                Provider Portal
              </Button>
            </div>
          </div>
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand-light/50 to-transparent -z-10" />
        </section>

        {/* 3. Platform Ecosystem Overview */}
        <section className="py-20 bg-gray-50 border-y border-gray-200" id="overview">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">The Healthcare Ecosystem, Unified.</h2>
            <div className="w-full max-w-4xl mx-auto h-[500px]">
              <Network3D />
            </div>
          </div>
        </section>

        {/* 4, 5, 6. Roles Sections */}
        <section className="py-24 bg-white" id="roles">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* 4. Patient */}
              <Card id="patients" className="flex flex-col h-full border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Patients</h3>
                <p className="text-gray-600 mb-6 flex-1">
                  Access your medical history, book appointments instantly, and communicate securely with your healthcare providers from one intuitive dashboard.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-gray-600">
                  <li className="flex gap-2">✓ <span>Centralized health records</span></li>
                  <li className="flex gap-2">✓ <span>Direct messaging with doctors</span></li>
                  <li className="flex gap-2">✓ <span>Appointment scheduling</span></li>
                </ul>
                <Button variant="outline" className="w-full" onClick={() => router.push('/login?role=patient')}>Patient Portal</Button>
              </Card>

              {/* 5. Doctor */}
              <Card id="doctors" className="flex flex-col h-full border-t-4 border-t-emerald-500 hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Doctors</h3>
                <p className="text-gray-600 mb-6 flex-1">
                  Streamline your practice with AI-assisted diagnosis, instant access to patient histories, and integrated hospital resource management.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-gray-600">
                  <li className="flex gap-2">✓ <span>Comprehensive patient context</span></li>
                  <li className="flex gap-2">✓ <span>AI clinical assistance</span></li>
                  <li className="flex gap-2">✓ <span>Efficient daily scheduling</span></li>
                </ul>
                <Button variant="outline" className="w-full" onClick={() => router.push('/login?role=doctor')}>Doctor Portal</Button>
              </Card>

              {/* 6. Hospital */}
              <Card id="hospitals" className="flex flex-col h-full border-t-4 border-t-purple-500 hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Hospitals</h3>
                <p className="text-gray-600 mb-6 flex-1">
                  Optimize operations, manage staff availability, oversee facility utilization, and ensure compliance across all departments.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-gray-600">
                  <li className="flex gap-2">✓ <span>Resource allocation</span></li>
                  <li className="flex gap-2">✓ <span>Department analytics</span></li>
                  <li className="flex gap-2">✓ <span>Staff management</span></li>
                </ul>
                <Button variant="outline" className="w-full" onClick={() => router.push('/login?role=hospital')}>Hospital Admin</Button>
              </Card>
            </div>
          </div>
        </section>

        {/* 7, 8, 9, 10. Features & How it works */}
        <section className="py-24 bg-gray-50" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced Healthcare Capabilities</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover how HEALTHLINK transforms the medical experience for everyone involved.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="flex flex-col gap-4">
                <Badge variant="brand" className="w-fit">Communication</Badge>
                <h3 className="text-2xl font-bold text-gray-900">Seamless Secure Messaging</h3>
                <p className="text-gray-600 leading-relaxed">
                  Eliminate phone tag. Our platform enables HIPAA-compliant messaging between patients and providers, allowing for quick follow-ups, prescription clarifications, and non-emergency triage.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-48 text-gray-400">
                [Communication Interface Mockup]
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-48 text-gray-400 md:order-3">
                [EHR Interface Mockup]
              </div>
              <div className="flex flex-col gap-4 md:order-4">
                <Badge variant="brand" className="w-fit">Health Records</Badge>
                <h3 className="text-2xl font-bold text-gray-900">Unified Medical History</h3>
                <p className="text-gray-600 leading-relaxed">
                  No more scattered documents. HEALTHLINK maintains a pristine, chronological health record accessible instantly by authorized providers, reducing redundant testing and improving care quality.
                </p>
              </div>

              <div className="flex flex-col gap-4 md:order-5">
                <Badge variant="brand" className="w-fit">Artificial Intelligence</Badge>
                <h3 className="text-2xl font-bold text-gray-900">Clinical AI Assistance</h3>
                <p className="text-gray-600 leading-relaxed">
                  Empower doctors with smart charting, anomaly detection in test results, and evidence-based treatment suggestions. Our AI tools reduce administrative burden so doctors can focus on patients.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-48 text-gray-400 md:order-6">
                [AI Assistant Mockup]
              </div>
            </div>
          </div>
        </section>

        {/* 11. Security */}
        <section className="py-24 bg-white" id="security">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Enterprise-Grade Security</h2>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Your health data is sensitive, and protecting it is our highest priority. We employ end-to-end encryption, strict role-based access control, and comprehensive audit logs.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="font-bold text-gray-900 mb-2">Encrypted Data</div>
                <p className="text-sm text-gray-600">All data is encrypted in transit and at rest.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="font-bold text-gray-900 mb-2">Access Control</div>
                <p className="text-sm text-gray-600">Granular permissions ensure data is only seen by authorized personnel.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="font-bold text-gray-900 mb-2">Audit Trails</div>
                <p className="text-sm text-gray-600">Every interaction with a health record is logged and monitored.</p>
              </div>
            </div>
            <p className="mt-8 text-xs text-gray-400">
              Note: Regulatory compliance certifications (like HIPAA) are currently in the audit and verification phase.
            </p>
          </div>
        </section>

        {/* 12. Call to Action */}
        <section className="py-24 bg-brand-dark text-white text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-6">Ready to experience better healthcare?</h2>
            <p className="text-brand-light mb-10 text-lg">
              Join the HEALTHLINK ecosystem today and take control of your healthcare journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-brand hover:bg-gray-100" onClick={() => router.push('/login?role=patient')}>
                Get Started as a Patient
              </Button>
              <Button size="lg" className="bg-transparent border border-white hover:bg-white/10" onClick={() => router.push('/contact')}>
                Partner with Us
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 13. Footer */}
      <Footer />
    </div>
  );
}
