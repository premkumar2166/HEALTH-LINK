'use client';

import React, { useState } from 'react';
import { Activity, Scale, Heart, Thermometer, PlusCircle, AlertTriangle, CheckCircle2, ShieldCheck, Info } from 'lucide-react';

interface VitalsEntryCardProps {
  onVitalSaved?: () => void;
}

export const VitalsEntryCard: React.FC<VitalsEntryCardProps> = ({ onVitalSaved }) => {
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [temperature, setTemperature] = useState('');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [heartRate, setHeartRate] = useState('');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setWarningMsg(null);
    setSuccessMsg(null);

    const token = localStorage.getItem('healthlink_token');
    if (!token) {
      setErrorMsg('You must be logged in to record health measurements.');
      return;
    }

    // Require at least one vital metric
    if (!weight.trim() && !systolic.trim() && !diastolic.trim() && !temperature.trim() && !heartRate.trim()) {
      setErrorMsg('Please enter at least one health vital metric to record.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        weightUnit,
        tempUnit,
        notes: notes.trim() || undefined,
      };

      if (weight.trim()) payload.weight = weight.trim();
      if (systolic.trim()) payload.systolic = systolic.trim();
      if (diastolic.trim()) payload.diastolic = diastolic.trim();
      if (temperature.trim()) payload.temperature = temperature.trim();
      if (heartRate.trim()) payload.heartRate = heartRate.trim();

      const res = await fetch('/api/health/measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to record measurements.');
      } else {
        setSuccessMsg(data.message || 'Health vitals recorded and synchronized successfully with your doctor!');
        if (data.warnings && data.warnings.length > 0) {
          setWarningMsg(data.warnings.join(' '));
        }

        // Reset inputs
        setWeight('');
        setSystolic('');
        setDiastolic('');
        setTemperature('');
        setHeartRate('');
        setNotes('');

        if (onVitalSaved) {
          onVitalSaved();
        }
      }
    } catch (err: any) {
      setErrorMsg('Network error. Unable to synchronize vitals with the clinical backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#D32F2F] flex items-center justify-center font-bold">
            <PlusCircle size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Record Today's Health Vitals</h2>
            <p className="text-xs text-gray-500">
              Synchronized directly with your authorized doctor's clinical workspace.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
          <ShieldCheck size={14} />
          <span>Encrypted Sync Active</span>
        </span>
      </div>

      {/* Error / Warning / Success Alerts */}
      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-[#B71C1C] text-xs font-semibold flex items-start gap-2.5 animate-fade-in"
        >
          <AlertTriangle size={16} className="text-[#D32F2F] flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {warningMsg && (
        <div
          role="alert"
          className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 text-xs font-semibold flex items-start gap-2.5 animate-fade-in"
        >
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <span>{warningMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="alert"
          className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 text-xs font-semibold flex items-start gap-2.5 animate-fade-in"
        >
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Weight Card */}
          <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-gray-200 hover:border-red-200 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="vital-weight" className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                <Scale size={16} className="text-[#D32F2F]" />
                <span>Body Weight</span>
              </label>
              <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-white text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setWeightUnit('kg')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    weightUnit === 'kg' ? 'bg-[#D32F2F] text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit('lb')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    weightUnit === 'lb' ? 'bg-[#D32F2F] text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  lb
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                id="vital-weight"
                type="number"
                step="0.1"
                min="0.5"
                max={weightUnit === 'kg' ? '635' : '1400'}
                placeholder={weightUnit === 'kg' ? 'e.g. 74.5' : 'e.g. 164.2'}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-red-100 focus:border-[#D32F2F] outline-none text-sm transition-all"
              />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">{weightUnit}</span>
            </div>
            <p className="text-[10px] text-gray-400">Technical Entry Limit: 635 kg / 1,400 lb</p>
          </div>

          {/* Blood Pressure Card */}
          <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-gray-200 hover:border-red-200 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                <Activity size={16} className="text-[#D32F2F]" />
                <span>Blood Pressure</span>
              </label>
              <span className="text-[10px] font-bold text-gray-400">mmHg</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  id="vital-bp-systolic"
                  type="number"
                  min="20"
                  max="370"
                  placeholder="Systolic (120)"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-red-100 focus:border-[#D32F2F] outline-none text-sm transition-all"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5 font-medium">Top (Max 370)</span>
              </div>
              <div>
                <input
                  id="vital-bp-diastolic"
                  type="number"
                  min="20"
                  max="360"
                  placeholder="Diastolic (80)"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-red-100 focus:border-[#D32F2F] outline-none text-sm transition-all"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5 font-medium">Bottom (Max 360)</span>
              </div>
            </div>
          </div>

          {/* Temperature Card */}
          <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-gray-200 hover:border-red-200 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="vital-temperature" className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                <Thermometer size={16} className="text-[#D32F2F]" />
                <span>Temperature</span>
              </label>
              <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-white text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTempUnit('C')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    tempUnit === 'C' ? 'bg-[#D32F2F] text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  °C
                </button>
                <button
                  type="button"
                  onClick={() => setTempUnit('F')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    tempUnit === 'F' ? 'bg-[#D32F2F] text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  °F
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                id="vital-temperature"
                type="number"
                step="0.1"
                min={tempUnit === 'C' ? '25.0' : '77.0'}
                max={tempUnit === 'C' ? '46.5' : '115.7'}
                placeholder={tempUnit === 'C' ? 'e.g. 36.6' : 'e.g. 98.6'}
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-red-100 focus:border-[#D32F2F] outline-none text-sm transition-all"
              />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">°{tempUnit}</span>
            </div>
            <p className="text-[10px] text-gray-400">Technical Entry Limit: 46.5°C / 115.7°F</p>
          </div>

          {/* Heart Rate Card */}
          <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-gray-200 hover:border-red-200 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="vital-heart-rate" className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                <Heart size={16} className="text-[#D32F2F]" />
                <span>Heart Rate (Pulse)</span>
              </label>
              <span className="text-[10px] font-bold text-gray-400">bpm</span>
            </div>
            <div className="relative">
              <input
                id="vital-heart-rate"
                type="number"
                min="20"
                max="300"
                placeholder="e.g. 72"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-red-100 focus:border-[#D32F2F] outline-none text-sm transition-all"
              />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">bpm</span>
            </div>
            <p className="text-[10px] text-gray-400">Technical Entry Limit: 20 - 300 bpm</p>
          </div>
        </div>

        {/* Patient Note */}
        <div>
          <label htmlFor="vital-notes" className="block text-xs font-extrabold text-gray-800 mb-1.5">
            Optional Note / Clinical Context for Doctor
          </label>
          <input
            id="vital-notes"
            type="text"
            placeholder="e.g. Taken right after waking up, before morning coffee and medication..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-300 rounded-2xl text-gray-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-[#D32F2F] outline-none transition-all"
          />
        </div>

        {/* Technical Limits Notice Banner */}
        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 text-[11px] flex items-start gap-2">
          <Info size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Technical Data-Entry Boundaries:</strong> Maximum inputs (635 kg, 370/360 mmHg, 46.5°C) are strict software data-entry validation limits designed to reject corrupted or invalid values. They are not medically safe maximums. Clinical triage and threshold alerts are configured separately.
          </span>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#D32F2F] hover:bg-[#B71C1C] active:scale-[0.99] disabled:bg-gray-400 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer focus-ring-red"
          >
            <Activity size={18} />
            <span>{isLoading ? 'Synchronizing with Doctor...' : 'Save & Synchronize Vitals'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
