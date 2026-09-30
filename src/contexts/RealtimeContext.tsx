"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { RealtimeEvent, Notification } from '@/types/realtime';
import { logger } from '@/lib/logger';

// Change this to true ONLY when a real provider (like Pusher/Socket.io) is configured.
const IS_REALTIME_CONFIGURED = false;

interface RealtimeContextType {
  isConnected: boolean;
  isConfigured: boolean;
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  isConfigured: false,
  notifications: [],
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export const useRealtime = () => useContext(RealtimeContext);

export function RealtimeProvider({ children, userId }: { children: React.ReactNode, userId?: string }) {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!IS_REALTIME_CONFIGURED || !userId) {
      return;
    }

    // Example WebSocket Connection
    /*
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    
    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ type: 'AUTH', userId }));
    };

    ws.onmessage = (event) => {
      const parsed: RealtimeEvent = JSON.parse(event.data);
      handleIncomingEvent(parsed);
    };

    ws.onerror = (error) => {
      logger.error('REALTIME_FAILURE', error, userId);
    };

    ws.onclose = () => setIsConnected(false);

    return () => ws.close();
    */
  }, [userId]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  return (
    <RealtimeContext.Provider value={{
      isConnected,
      isConfigured: IS_REALTIME_CONFIGURED,
      notifications,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </RealtimeContext.Provider>
  );
}
