"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Role } from '@/types/auth';

const mockDepartments = [
  { id: 'dep_1', name: 'Cardiology', head: 'Dr. Michael Chang', doctors: 12, bedsTotal: 50, bedsOccupied: 45 },
  { id: 'dep_2', name: 'Pediatrics', head: 'Dr. Emily Chen', doctors: 8, bedsTotal: 30, bedsOccupied: 12 },
  { id: 'dep_3', name: 'Internal Medicine', head: 'Dr. Sarah Smith', doctors: 20, bedsTotal: 100, bedsOccupied: 85 },
];

export default function DepartmentsManagementPage() {
  const [user, setUser] = useState<{ id: string; role: string; profile: { firstName?: string; lastName?: string; name?: string; specialty?: string; hospital?: string; phone?: string; email?: string; status?: string } } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      });
  }, []);

  if (user && user.role !== Role.HOSPITAL_ADMIN) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 font-bold">
        Access Denied. Hospital Administrator privileges required.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500">Manage hospital departments and assignments.</p>
        </div>
        <Button>+ Create Department</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDepartments.map(dep => (
          <Card key={dep.id} className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{dep.name}</h3>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            
            <div className="space-y-3 mb-6 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Department Head</span>
                <span className="font-medium">{dep.head}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Assigned Doctors</span>
                <span className="font-medium">{dep.doctors}</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Bed Occupancy</span>
                  <span className="font-medium">{dep.bedsOccupied} / {dep.bedsTotal}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${dep.bedsOccupied / dep.bedsTotal > 0.8 ? 'bg-red-500' : 'bg-brand'}`} 
                    style={{ width: `${(dep.bedsOccupied / dep.bedsTotal) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">Manage Doctors</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
