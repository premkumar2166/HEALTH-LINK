"use client";

import React from 'react';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';

export default function DoctorSecurityPage() {
  return <SecurityDashboard isAdmin={false} />;
}
