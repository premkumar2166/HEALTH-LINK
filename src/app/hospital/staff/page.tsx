"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Role } from '@/types/auth';

const mockStaff = [
  { id: 'stf_1', name: 'Alice Nurse', role: 'Head Nurse', permissions: 'Ward A, Ward B', status: 'Active' },
  { id: 'stf_2', name: 'Bob Tech', role: 'Lab Technician', permissions: 'Pathology Lab', status: 'Active' },
];

export default function StaffManagementPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500">Manage nurses, technicians, and administrative staff.</p>
        </div>
        <Button>+ Add Staff</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Staff Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockStaff.map((staff) => (
                <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-light text-brand-dark rounded-full flex items-center justify-center font-bold">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <p>{staff.name}</p>
                      <p className="text-xs text-gray-400 font-normal">ID: {staff.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">{staff.role}</td>
                  <td className="px-4 py-4 text-xs font-mono bg-gray-100 p-1 rounded inline-block mt-3">{staff.permissions}</td>
                  <td className="px-4 py-4">
                    <Badge variant={staff.status === 'Active' ? 'success' : 'default'}>
                      {staff.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
