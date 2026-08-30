import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HEALTHLINK — Connected Patient & Doctor Healthcare Platform',
  description: 'Real-time patient-doctor tele-monitoring, clinical health trends, secure chat, voice notes, and AI health assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#1A1A1A] antialiased selection:bg-red-100 selection:text-red-900">
        {children}
      </body>
    </html>
  );
}
