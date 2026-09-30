"use client";

import React from 'react';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';

export default function PatientSecurityPage() {
  return <SecurityDashboard isAdmin={false} />;
}
