"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

type MeasurementType = 'Weight' | 'BloodPressure' | 'Temperature';

interface Measurement {
  id: string;
  type: MeasurementType;
  value: string; // e.g. "75", "120/80", "36.6"
  date: string;
}

export default function MyHealthPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([
    { id: '1', type: 'Weight', value: '75', date: new Date().toISOString() },
    { id: '2', type: 'BloodPressure', value: '120/80', date: new Date().toISOString() },
    { id: '3', type: 'Temperature', value: '36.6', date: new Date().toISOString() },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState<MeasurementType>('Weight');
  const [newValue, setNewValue] = useState('');
  const [error, setError] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations based on constraints
    if (newType === 'Weight') {
      const weight = parseFloat(newValue);
      if (isNaN(weight) || weight <= 0 || weight > 635) {
        setError('Weight must be a valid number between 0 and 635 kg.');
        return;
      }
    } else if (newType === 'Temperature') {
      const temp = parseFloat(newValue);
      if (isNaN(temp) || temp <= 0 || temp > 46.5) {
        setError('Temperature must be a valid number up to 46.5°C.');
        return;
      }
    } else if (newType === 'BloodPressure') {
      const regex = /^(\d{2,3})\/(\d{2,3})$/;
      const match = newValue.match(regex);
      if (!match) {
        setError('Blood pressure must be in format SYS/DIA (e.g. 120/80).');
        return;
      }
      const sys = parseInt(match[1]);
      const dia = parseInt(match[2]);
      if (sys > 370 || dia > 360) {
        setError('Blood pressure exceeds maximum limits (370/360 mmHg).');
        return;
      }
    }

    const newMeasurement: Measurement = {
      id: Math.random().toString(36).substr(2, 9),
      type: newType,
      value: newValue,
      date: new Date().toISOString(),
    };

    setMeasurements([newMeasurement, ...measurements]);
    setNewValue('');
    setIsAdding(false);
  };

  const deleteMeasurement = (id: string) => {
    setMeasurements(measurements.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Health</h1>
          <p className="text-gray-500">Track and manage your daily health measurements.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : 'Add Measurement'}
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-brand-light/10 border-brand/20">
          <h3 className="text-lg font-semibold mb-4">Record New Measurement</h3>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1 w-full">
              <Select 
                label="Measurement Type" 
                value={newType} 
                onChange={(e) => setNewType(e.target.value as MeasurementType)}
              >
                <option value="Weight">Weight (kg)</option>
                <option value="BloodPressure">Blood Pressure (mmHg)</option>
                <option value="Temperature">Temperature (°C)</option>
              </Select>
            </div>
            <div className="flex-1 w-full">
              <Input
                label={`Value ${newType === 'BloodPressure' ? '(e.g. 120/80)' : ''}`}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={newType === 'BloodPressure' ? '120/80' : 'e.g. 75'}
                required
              />
            </div>
            <Button type="submit" className="w-full md:w-auto">Save</Button>
          </form>
          {error && <p className="text-error text-sm mt-4">{error}</p>}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-lg font-semibold mb-6">Measurement History</h3>
          {measurements.length === 0 ? (
            <div className="text-center p-8 text-gray-500 border border-dashed rounded-lg">
              No measurements recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {measurements.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {m.type === 'Weight' && '⚖️'}
                      {m.type === 'BloodPressure' && '🩸'}
                      {m.type === 'Temperature' && '🌡️'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{m.type}</p>
                      <p className="text-sm text-gray-500">{new Date(m.date).toLocaleDateString()} at {new Date(m.date).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">
                      {m.value}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        {m.type === 'Weight' && 'kg'}
                        {m.type === 'BloodPressure' && 'mmHg'}
                        {m.type === 'Temperature' && '°C'}
                      </span>
                    </span>
                    <button 
                      onClick={() => deleteMeasurement(m.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-6">Health Trends</h3>
          <div className="space-y-6">
             {/* Fake CSS Chart / Trends */}
             <div>
               <div className="flex justify-between text-sm mb-2">
                 <span className="font-medium">Weight Trend</span>
                 <span className="text-success font-medium">-2kg this month</span>
               </div>
               <div className="flex items-end gap-2 h-24 mt-4 border-b border-gray-200 pb-2">
                  <div className="w-1/6 bg-blue-100 rounded-t-sm h-full relative group hover:bg-blue-200"></div>
                  <div className="w-1/6 bg-blue-200 rounded-t-sm h-5/6 relative group hover:bg-blue-300"></div>
                  <div className="w-1/6 bg-blue-300 rounded-t-sm h-4/6 relative group hover:bg-blue-400"></div>
                  <div className="w-1/6 bg-blue-400 rounded-t-sm h-3/6 relative group hover:bg-blue-500"></div>
                  <div className="w-1/6 bg-brand rounded-t-sm h-2/6 relative shadow-md"></div>
               </div>
             </div>

             <div className="pt-6 border-t border-gray-100">
               <div className="flex justify-between text-sm mb-2">
                 <span className="font-medium">Blood Pressure Average</span>
                 <Badge variant="success">Optimal</Badge>
               </div>
               <p className="text-3xl font-bold mt-2 text-gray-900">118<span className="text-xl text-gray-400 font-normal">/78</span></p>
               <p className="text-xs text-gray-500 mt-1">Based on last 14 days of measurements.</p>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
