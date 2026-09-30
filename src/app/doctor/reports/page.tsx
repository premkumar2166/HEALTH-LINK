"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart } from '@/components/ui/BarChart';

export default function DoctorAnalyticsPage() {
  const [data, setData] = useState<{ metrics: Record<string, number | string>; trends: Record<string, { date: string; [key: string]: number | string }[]> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics/doctor');
        if (!res.ok) throw new Error('Failed to load analytics');
        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (error) {
    return (
      <div className="p-8 text-center text-error">
        <h2 className="text-xl font-bold mb-2">Error Loading Analytics</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading clinical insights...</p>
      </div>
    );
  }

  const chartData = data.trends?.workloadTrend?.map((t: { date: string; [key: string]: number | string }) => ({
    label: String(t.day || t.date || ''),
    value: Number(t.patients || 0)
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clinical Reports & Workload</h1>
        <p className="text-gray-500">Your practice analytics based on system data.</p>
      </div>

      <div className="bg-amber-50 text-amber-800 text-sm p-4 rounded-md border border-amber-200">
        <strong>Disclaimer:</strong> This dashboard displays raw practice metrics. It does not provide medical diagnoses.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Appointments</div>
            <div className="text-3xl font-bold text-gray-900">{data.metrics.totalAppointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Upcoming</div>
            <div className="text-3xl font-bold text-blue-600">{data.metrics.upcomingAppointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Completed</div>
            <div className="text-3xl font-bold text-brand">{data.metrics.completedAppointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Cancelled</div>
            <div className="text-3xl font-bold text-gray-400">{data.metrics.cancelledAppointments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workload Trend</CardTitle>
          </CardHeader>
          <CardContent>
             {chartData.length > 0 ? (
              <BarChart data={chartData} color="bg-brand" />
            ) : (
              <div className="text-gray-500 text-center py-8">No workload data available.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
