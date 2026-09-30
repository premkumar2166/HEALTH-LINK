"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

interface SystemMetrics {
  totalLogs: number;
  errorCount: number;
  securityCount: number;
  authFails: number;
  uptime: number;
}

interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';
  event: string;
  details?: any;
  timestamp: string;
  userId?: string;
}

export default function OperationalHealthDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hospital/system')
      .then(res => res.json())
      .then(data => {
        if (data.metrics) setMetrics(data.metrics);
        if (data.logs) setLogs(data.logs);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading system metrics...</div>;

  const uptimeStr = metrics 
    ? `${Math.floor(metrics.uptime / 3600)}h ${Math.floor((metrics.uptime % 3600) / 60)}m` 
    : 'Unknown';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operational Health</h1>
          <p className="text-gray-500 mt-1">Real-time system telemetry and production logs</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          System Online (Uptime: {uptimeStr})
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-brand">
          <h3 className="text-sm font-medium text-gray-500">Total Logs (Session)</h3>
          <p className="text-2xl font-bold mt-1">{metrics?.totalLogs || 0}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <h3 className="text-sm font-medium text-gray-500">Application Errors</h3>
          <p className="text-2xl font-bold mt-1 text-red-600">{metrics?.errorCount || 0}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-orange-500">
          <h3 className="text-sm font-medium text-gray-500">Security Events</h3>
          <p className="text-2xl font-bold mt-1 text-orange-600">{metrics?.securityCount || 0}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-yellow-500">
          <h3 className="text-sm font-medium text-gray-500">Auth Failures</h3>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{metrics?.authFails || 0}</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
          Recent System Logs (Redacted)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No logs generated yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 font-mono text-xs">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        log.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                        log.level === 'SECURITY' ? 'bg-orange-100 text-orange-700' :
                        log.level === 'WARN' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{log.event}</td>
                    <td className="px-4 py-3 text-gray-500">{log.userId || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={JSON.stringify(log.details)}>
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
