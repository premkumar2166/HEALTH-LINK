"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart } from '@/components/ui/BarChart';

export default function HospitalAnalyticsPage() {
  const [data, setData] = useState<{ metrics: Record<string, number | string>; trends: Record<string, { date: string; [key: string]: number | string }[]> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/hospital?range=${range}`);
        if (!res.ok) throw new Error('Failed to load analytics');
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [range]);

  if (error) {
    return (
      <div className="p-8 text-center text-error">
        <h2 className="text-xl font-bold mb-2">Error Loading Analytics</h2>
        <p>{error}</p>
        <button onClick={() => setRange('30d')} className="mt-4 text-brand underline">Retry</button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Crunching hospital data...</p>
      </div>
    );
  }

  const chartData = data.trends?.admissionsOverTime?.map((t: { date: string; [key: string]: number | string }) => ({
    label: String(t.date?.split('-').slice(1).join('/') || ''),
    value: Number(t.count || 0)
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Analytics & Intelligence</h1>
          <p className="text-gray-500">Operational trends and statistical data overview.</p>
        </div>
        <select 
          value={range} 
          onChange={(e) => setRange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      <div className="bg-amber-50 text-amber-800 text-sm p-4 rounded-md border border-amber-200">
        <strong>Disclaimer:</strong> This dashboard displays raw operational and statistical data. It does not provide medical diagnoses or clinical assertions.
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Patients</div>
            <div className="text-3xl font-bold text-gray-900">{data.metrics.totalPatients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Doctors</div>
            <div className="text-3xl font-bold text-gray-900">{data.metrics.totalDoctors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Bed Utilization</div>
            <div className="text-3xl font-bold text-gray-900">{data.metrics.bedUtilization}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Active Admissions</div>
            <div className="text-3xl font-bold text-gray-900">{data.metrics.activeAdmissions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Admissions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <BarChart data={chartData} color="bg-emerald-500" />
            ) : (
              <div className="text-gray-500 text-center py-8">No admission data for this period.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Total Appointments</span>
                <span className="font-bold">{data.metrics.totalAppointments}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Completed Appointments</span>
                <span className="font-bold text-emerald-600">{data.metrics.completedAppointments}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Discharges (Period)</span>
                <span className="font-bold">{data.metrics.discharged}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-600">Low Stock Inventory Items</span>
                <span className="font-bold text-error">{data.metrics.lowStockItems}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
