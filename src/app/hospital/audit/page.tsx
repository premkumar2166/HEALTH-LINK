"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { AuditLog } from '@/types/hospital';

export default function ReportsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hospital/audit')
      .then(res => res.json())
      .then(data => {
        if (data.logs) {
          setLogs(data.logs);
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading audit reports...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Audit Logs</h1>
        <p className="text-gray-500">Immutable record of all hospital operations.</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity Type</th>
                <th className="px-4 py-3 rounded-tr-lg">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(log => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">{log.userName}</td>
                  <td className="px-4 py-3 font-medium text-brand">{log.action}</td>
                  <td className="px-4 py-3">{log.entityType}</td>
                  <td className="px-4 py-3">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="text-center py-8 text-gray-500">No audit records found. Generate some activity first.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
