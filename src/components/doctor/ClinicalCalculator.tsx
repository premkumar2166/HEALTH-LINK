'use client';

import React, { useState } from 'react';
import { Calculator, Activity, Scale, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { calculateBMI, calculateBPAnalysis, BMICalculationResult, BloodPressureAnalysisResult } from '@/lib/clinical/calculations';

export const ClinicalCalculator: React.FC = () => {
  // BMI inputs
  const [weightKg, setWeightKg] = useState('74.5');
  const [heightCm, setHeightCm] = useState('178');
  const [bmiResult, setBmiResult] = useState<BMICalculationResult | null>(() => {
    try {
      return calculateBMI(74.5, 178);
    } catch {
      return null;
    }
  });

  // BP inputs
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [bpResult, setBpResult] = useState<BloodPressureAnalysisResult | null>(() => {
    try {
      return calculateBPAnalysis(120, 80);
    } catch {
      return null;
    }
  });

  const [bmiError, setBmiError] = useState<string | null>(null);
  const [bpError, setBpError] = useState<string | null>(null);

  const handleComputeBMI = (e: React.FormEvent) => {
    e.preventDefault();
    setBmiError(null);
    try {
      const w = parseFloat(weightKg);
      const h = parseFloat(heightCm);
      const res = calculateBMI(w, h);
      setBmiResult(res);
    } catch (err: any) {
      setBmiError(err.message || 'Invalid parameters for BMI calculation.');
    }
  };

  const handleComputeBP = (e: React.FormEvent) => {
    e.preventDefault();
    setBpError(null);
    try {
      const s = parseFloat(systolic);
      const d = parseFloat(diastolic);
      const res = calculateBPAnalysis(s, d);
      setBpResult(res);
    } catch (err: any) {
      setBpError(err.message || 'Invalid parameters for BP calculation.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Tool 1: BMI Calculator */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-health-md p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Scale size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Body Mass Index (BMI) Clinical Calculator</h3>
            <p className="text-xs text-gray-500">Calculate adult BMI and risk category classification.</p>
          </div>
        </div>

        {bmiError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle size={15} />
            <span>{bmiError}</span>
          </div>
        )}

        <form onSubmit={handleComputeBMI} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="635"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Height (cm)</label>
              <input
                type="number"
                step="0.5"
                min="30"
                max="280"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Compute BMI Score
          </button>
        </form>

        {bmiResult && (
          <div className="mt-6 p-4 bg-[#FAFAFA] border border-gray-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Formula:</span>
              <span className="font-mono font-bold text-gray-700">{bmiResult.formula}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Computed BMI:</span>
              <span className="text-xl font-mono font-extrabold text-red-600">{bmiResult.bmi} kg/m²</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Category:</span>
              <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                {bmiResult.category}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 pt-1 leading-relaxed">
              <span className="font-bold text-gray-800">Clinical Interpretation: </span>
              {bmiResult.clinicalInterpretation}
            </p>
          </div>
        )}
      </div>

      {/* Tool 2: MAP & Pulse Pressure Calculator */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-health-md p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Activity size={22} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Perfusion & Blood Pressure Analyzer</h3>
            <p className="text-xs text-gray-500">Calculate Mean Arterial Pressure (MAP) and Pulse Pressure (PP).</p>
          </div>
        </div>

        {bpError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle size={15} />
            <span>{bpError}</span>
          </div>
        )}

        <form onSubmit={handleComputeBP} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                min="20"
                max="370"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Diastolic BP (mmHg)</label>
              <input
                type="number"
                min="20"
                max="360"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Compute MAP & Perfusion Metrics
          </button>
        </form>

        {bpResult && (
          <div className="mt-6 p-4 bg-[#FAFAFA] border border-gray-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Mean Arterial Pressure (MAP):</span>
              <span className="text-lg font-mono font-bold text-slate-900">{bpResult.map} mmHg</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Pulse Pressure (PP):</span>
              <span className="text-lg font-mono font-bold text-slate-900">{bpResult.pulsePressure} mmHg</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Formulas:</span>
              <span className="font-mono text-[10px] text-gray-500">{bpResult.mapFormula}</span>
            </div>
            <p className="text-[11px] text-gray-600 pt-1 leading-relaxed">
              <span className="font-bold text-gray-800">Perfusion Status: </span>
              {bpResult.status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
