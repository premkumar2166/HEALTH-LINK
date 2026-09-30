"use client";

import React from 'react';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';

export default function HospitalSecurityPage() {
  return <SecurityDashboard isAdmin={true} />;
}
