"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SecuritySession, SecurityEvent } from '@/lib/securityDb';

interface SecurityDashboardProps {
  isAdmin?: boolean;
}

export function SecurityDashboard({ isAdmin = false }: SecurityDashboardProps) {
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessRes, evtsRes] = await Promise.all([
          fetch('/api/security/sessions'),
          isAdmin ? fetch('/api/security/events') : Promise.resolve({ ok: true, json: () => ({ events: [] }) })
        ]);

        if (sessRes.ok) {
          const sessData = await sessRes.json();
          setSessions(sessData.sessions || []);
        }

        if (evtsRes.ok && isAdmin) {
          const evtsData = await evtsRes.json();
          setEvents(evtsData.events || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const handleRevoke = async (id: string) => {
    try {
      await fetch(`/api/security/sessions?id=${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      alert("Failed to revoke session");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading security profile...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Center</h1>
        <p className="text-gray-500">Defense-in-depth monitoring and session management.</p>
      </div>

      <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-md border border-blue-100 flex items-start gap-3">
        <span className="text-xl">🛡️</span>
        <div>
          <strong>Security Notice:</strong> We do not claim this system is &quot;100% secure&quot;. We practice defense-in-depth, relying on strict role-based access control, JWT session management, input validation, CSP/HSTS headers, and regular audits. Secrets are never exposed in frontend code.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Active Sessions</h2>
          {sessions.map(session => (
            <Card key={session.id} className={`p-4 ${session.isCurrent ? 'border-brand' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{session.device}</span>
                    {session.isCurrent && <Badge variant="success">Current Session</Badge>}
                  </div>
                  <div className="text-sm text-gray-500">IP: {session.ip}</div>
                  <div className="text-sm text-gray-500">Location: {session.location}</div>
                  <div className="text-xs text-gray-400 mt-2">
                    Last Active: {new Date(session.lastActive).toLocaleString()}
                  </div>
                  {isAdmin && <div className="text-xs font-mono text-gray-400 mt-1">User ID: {session.userId}</div>}
                </div>
                {!session.isCurrent && (
                  <Button variant="outline" size="sm" onClick={() => handleRevoke(session.id)} className="text-error border-error-light hover:bg-error-light/10">
                    Revoke
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {sessions.length === 0 && <p className="text-gray-500 text-sm">No active sessions found.</p>}
        </div>

        {isAdmin && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Security Events</h2>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 uppercase">
                    <tr>
                      <th className="px-4 py-3">Event</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(evt => (
                      <tr key={evt.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{evt.type}</div>
                          <div className="text-xs text-gray-400">{new Date(evt.timestamp).toLocaleString()}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={
                            evt.severity === 'critical' || evt.severity === 'high' ? 'error' : 
                            evt.severity === 'medium' ? 'warning' : 'default'
                          }>
                            {evt.severity.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {evt.details}
                          <div className="text-xs font-mono text-gray-400 mt-1">IP: {evt.ip}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {events.length === 0 && <div className="p-4 text-center text-gray-500">No security events logged.</div>}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
