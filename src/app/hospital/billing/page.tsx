"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Invoice, InvoiceStatus } from '@/types/hospital';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/hospital/billing');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
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
      if (mounted) fetchInvoices();
    }, 0);
    return () => { mounted = false; };
  }, []);

  const updateStatus = async (id: string, status: InvoiceStatus) => {
    try {
      const res = await fetch(`/api/hospital/billing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchInvoices();
      } else {
        alert('Failed to update invoice');
      }
    } catch (e) {
      alert('Error updating invoice');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading billing records...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
          <p className="text-gray-500">Manage patient accounts and payments.</p>
        </div>
        <Button>Create Invoice</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Invoice ID</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-4 font-mono text-xs">{inv.id}</td>
                  <td className="px-4 py-4 font-medium text-gray-900">{inv.patientName}</td>
                  <td className="px-4 py-4">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-4 py-4 font-medium">${inv.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <Badge variant={
                      inv.status === InvoiceStatus.PAID ? 'success' :
                      inv.status === InvoiceStatus.PENDING ? 'warning' : 'default'
                    }>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <select 
                      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white cursor-pointer"
                      value={inv.status}
                      onChange={(e) => updateStatus(inv.id, e.target.value as InvoiceStatus)}
                    >
                      <option value={InvoiceStatus.DRAFT}>Draft</option>
                      <option value={InvoiceStatus.PENDING}>Pending</option>
                      <option value={InvoiceStatus.PAID}>Paid</option>
                      <option value={InvoiceStatus.CANCELLED}>Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 && (
            <div className="text-center py-8 text-gray-500">No invoices found.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
