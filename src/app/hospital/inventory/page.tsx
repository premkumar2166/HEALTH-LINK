"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { InventoryItem } from '@/types/hospital';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/hospital/inventory');
      if (res.ok) {
        const data = await res.json();
        setItems(data.inventory || []);
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
      if (mounted) fetchInventory();
    }, 0);
    return () => { mounted = false; };
  }, []);

  const adjustStock = async (id: string, currentQty: number) => {
    const newQtyStr = prompt(`Enter new quantity for item (Current: ${currentQty}):`, currentQty.toString());
    if (newQtyStr === null) return;
    const newQty = parseInt(newQtyStr, 10);
    if (isNaN(newQty) || newQty < 0) return alert('Invalid quantity');

    try {
      const res = await fetch(`/api/hospital/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
      });
      if (res.ok) {
        fetchInventory();
      } else {
        alert('Failed to update stock');
      }
    } catch (e) {
      alert('Error updating stock');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading inventory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500">Track medical supplies, medicines, and consumables.</p>
        </div>
        <Button>Add Item</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Item Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const isLow = item.quantity <= item.lowStockThreshold;
                return (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-4">{item.category}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {item.quantity}
                        {isLow && <Badge variant="error">Low Stock</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-4">{item.supplierInformation}</td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => adjustStock(item.id, item.quantity)}>
                        Adjust Stock
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="text-center py-8 text-gray-500">No inventory items found.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
