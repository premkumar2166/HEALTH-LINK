"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRealtime } from '@/contexts/RealtimeContext';

export function NotificationCenter() {
  const { isConfigured, isConnected, notifications, markAsRead, markAllAsRead } = useRealtime();

  if (!isConfigured) {
    return (
      <Card className="p-12 text-center max-w-2xl mx-auto mt-8 border-dashed border-2">
        <div className="text-4xl mb-4">🔌</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Realtime Infrastructure Not Configured</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          The HEALTHLINK realtime system (WebSocket/Pusher) is currently running in fallback mode. Event streaming and push notifications are disabled.
        </p>
        <Badge variant="warning">STATUS: DISCONNECTED</Badge>
      </Card>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Notifications
            {!isConnected && <Badge variant="error">Reconnecting...</Badge>}
            {isConnected && <Badge variant="success">Live</Badge>}
          </h1>
          <p className="text-gray-500">You have {unreadCount} unread messages.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>Mark All as Read</Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No notifications yet.
          </Card>
        ) : (
          notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(notif => (
            <Card 
              key={notif.id} 
              className={`p-4 transition-colors ${notif.isRead ? 'bg-white' : 'bg-blue-50/50 border-blue-200'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="default" className="text-[10px] uppercase">{notif.type.replace('_', ' ')}</Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(notif.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <h3 className={`text-sm ${notif.isRead ? 'text-gray-900' : 'font-bold text-gray-900'}`}>
                      {notif.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  </div>
                </div>
                {!notif.isRead && (
                  <Button variant="outline" size="sm" onClick={() => markAsRead(notif.id)}>
                    Mark Read
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
