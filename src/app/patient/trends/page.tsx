"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart } from '@/components/ui/BarChart';

export default function PatientTrendsPage() {
  const [data, setData] = useState<{ metrics: Record<string, number | string>; trends: Record<string, { date: string; [key: string]: number | string }[]> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics/patient');
        if (!res.ok) throw new Error('Failed to load trends');
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
        <h2 className="text-xl font-bold mb-2">Error Loading Trends</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Crunching your health data...</p>
      </div>
    );
  }

  const weightChartData = data.trends?.weightTrend?.map((t: { date: string; [key: string]: number | string }) => ({
    label: String(t.date?.split('-').slice(1).join('/') || ''),
    value: Number(t.value || 0)
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Trends & Analytics</h1>
        <p className="text-gray-500">Track your personal health metrics over time.</p>
      </div>

      <div className="bg-amber-50 text-amber-800 text-sm p-4 rounded-md border border-amber-200">
        <strong>Disclaimer:</strong> This dashboard displays historical health metrics recorded in your profile. It does not provide medical diagnoses or medical advice. Always consult your doctor for clinical interpretation.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Measurements</div>
            <div className="text-3xl font-bold text-gray-900">{data.metrics.totalMeasurements}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Upcoming Appointments</div>
            <div className="text-3xl font-bold text-blue-600">{data.metrics.upcomingAppointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Latest Weight</div>
            <div className="text-3xl font-bold text-emerald-600">{data.metrics.latestWeight ? `${data.metrics.latestWeight} kg` : '--'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weight Trend (kg)</CardTitle>
          </CardHeader>
          <CardContent>
             {weightChartData.length > 0 ? (
              <BarChart data={weightChartData} color="bg-blue-600" />
            ) : (
              <div className="text-gray-500 text-center py-8">No weight data available.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
