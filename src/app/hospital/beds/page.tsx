"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Room, BedStatus } from '@/types/hospital';

export default function BedManagementPage() {
  const [rooms, setRooms] = useState<(Room & { beds: {id: string, bedNumber: string, status: BedStatus}[] })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/hospital/rooms');
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (mounted) fetchRooms();
    }, 0);
    return () => { mounted = false; };
  }, []);

  const getStatusColor = (status: BedStatus) => {
    switch(status) {
      case BedStatus.AVAILABLE: return 'success';
      case BedStatus.OCCUPIED: return 'error';
      case BedStatus.MAINTENANCE: return 'warning';
      case BedStatus.RESERVED: return 'default';
      default: return 'default';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading facility maps...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bed & Room Management</h1>
        <p className="text-gray-500">Facility status and availability.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map(room => (
          <Card key={room.id} className="space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Room {room.roomNumber}</h3>
                <p className="text-sm text-gray-500">{room.type} • {room.department}</p>
              </div>
              <Badge variant={room.status === 'ACTIVE' ? 'success' : 'default'}>{room.status}</Badge>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Beds ({room.beds.length}/{room.capacity})</h4>
              <div className="grid grid-cols-2 gap-3">
                {room.beds.map(bed => (
                  <div key={bed.id} className="p-3 border border-gray-100 rounded-md bg-gray-50 flex justify-between items-center">
                    <span className="font-medium text-gray-900">{bed.bedNumber}</span>
                    <Badge variant={getStatusColor(bed.status)}>{bed.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {rooms.length === 0 && (
        <Card className="text-center py-8 text-gray-500">No rooms configured.</Card>
      )}
    </div>
  );
}
