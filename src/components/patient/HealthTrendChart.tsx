'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { HealthMeasurement, DoctorAnnotation } from '@/types/healthlink';
import { LineChart as ChartIcon, Calendar, Activity, Scale, Thermometer, Heart, AlertTriangle, Stethoscope } from 'lucide-react';

interface HealthTrendChartProps {
  measurements: HealthMeasurement[];
  annotations?: DoctorAnnotation[];
  title?: string;
  isDoctorView?: boolean;
}

export const HealthTrendChart: React.FC<HealthTrendChartProps> = ({
  measurements,
  annotations = [],
  title = 'Health Trend',
  isDoctorView = false,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'bp' | 'weight' | 'temp' | 'hr'>('all');

  // Filter measurements by time range
  const now = new Date();
  const filtered = measurements.filter((m) => {
    if (timeRange === 'all') return true;
    const itemDate = new Date(m.timestamp);
    const daysDiff = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
    if (timeRange === '7d') return daysDiff <= 7;
    if (timeRange === '30d') return daysDiff <= 30;
    if (timeRange === '90d') return daysDiff <= 90;
    return true;
  });

  // Map to chart-friendly format
  const chartData = filtered.map((m, idx) => {
    const d = new Date(m.timestamp);
    const dayLabel = `Day ${idx + 1} (${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`;

    const matchingAnnotation = annotations.find(
      (a) => a.measurementId === m.id || a.dateStr === dayLabel || a.dateStr === `Day ${idx + 1}`
    );

    return {
      id: m.id,
      timestamp: m.timestamp,
      displayDate: dayLabel,
      systolic: m.bloodPressure ? m.bloodPressure.systolic : null,
      diastolic: m.bloodPressure ? m.bloodPressure.diastolic : null,
      weightKg: m.weight ? m.weight.convertedKg : null,
      tempC: m.temperature ? m.temperature.convertedC : null,
      heartRate: m.heartRate || null,
      status: m.status,
      annotation: matchingAnnotation ? matchingAnnotation.text : null,
      notes: m.notes,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white text-gray-900 p-4 rounded-2xl shadow-xl border border-red-100 text-xs max-w-xs space-y-2">
          <div className="font-extrabold border-b border-gray-100 pb-1.5 flex items-center justify-between">
            <span className="text-gray-900">{label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                dataPoint.status === 'URGENT'
                  ? 'bg-red-100 text-[#B71C1C]'
                  : dataPoint.status === 'REVIEW'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {dataPoint.status}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            {dataPoint.systolic !== null && (
              <div className="flex justify-between items-center text-[#D32F2F]">
                <span className="font-medium">Blood Pressure:</span>
                <span className="font-black font-mono">
                  {dataPoint.systolic} / {dataPoint.diastolic} mmHg
                </span>
              </div>
            )}
            {dataPoint.weightKg !== null && (
              <div className="flex justify-between items-center text-sky-700">
                <span className="font-medium">Weight:</span>
                <span className="font-black font-mono">{dataPoint.weightKg} kg</span>
              </div>
            )}
            {dataPoint.tempC !== null && (
              <div className="flex justify-between items-center text-amber-700">
                <span className="font-medium">Temperature:</span>
                <span className="font-black font-mono">{dataPoint.tempC}°C</span>
              </div>
            )}
            {dataPoint.heartRate !== null && (
              <div className="flex justify-between items-center text-rose-700">
                <span className="font-medium">Heart Rate:</span>
                <span className="font-black font-mono">{dataPoint.heartRate} bpm</span>
              </div>
            )}
          </div>

          {dataPoint.notes && (
            <div className="pt-1.5 border-t border-gray-100 text-gray-600 italic text-[11px]">
              Note: "{dataPoint.notes}"
            </div>
          )}

          {dataPoint.annotation && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-red-900 text-[11px] space-y-0.5">
              <span className="font-extrabold block text-[#D32F2F] flex items-center gap-1">
                <Stethoscope size={12} /> Doctor Annotation:
              </span>
              <p className="text-gray-800">{dataPoint.annotation}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Chart Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#D32F2F] flex items-center justify-center font-bold">
            <ChartIcon size={22} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">{title}</h3>
            <p className="text-xs text-gray-500">
              Interactive timeline progression of day-to-day physiological vitals.
            </p>
          </div>
        </div>

        {/* Metric and Range Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedMetric('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedMetric === 'all' ? 'bg-white text-[#D32F2F] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Metrics
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('bp')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedMetric === 'bp' ? 'bg-white text-[#D32F2F] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              BP
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('weight')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedMetric === 'weight' ? 'bg-white text-[#D32F2F] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weight
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('temp')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedMetric === 'temp' ? 'bg-white text-[#D32F2F] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Temp
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('hr')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedMetric === 'hr' ? 'bg-white text-[#D32F2F] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              HR
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200 text-xs font-bold">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                type="button"
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg uppercase transition-all ${
                  timeRange === range ? 'bg-[#D32F2F] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === 'all' ? 'All' : range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      {chartData.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center text-gray-400 text-sm">
          <Activity size={36} className="text-gray-300 mb-2 animate-pulse" />
          <span>No recorded health measurements found in this time range.</span>
        </div>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="displayDate" stroke="#9CA3AF" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />

              {/* Reference guide lines for BP */}
              {(selectedMetric === 'all' || selectedMetric === 'bp') && (
                <>
                  <ReferenceLine
                    y={120}
                    stroke="#EF4444"
                    strokeDasharray="4 4"
                    label={{ value: '120 SBP Target', fill: '#EF4444', fontSize: 10, position: 'top' }}
                  />
                  <ReferenceLine
                    y={80}
                    stroke="#F59E0B"
                    strokeDasharray="4 4"
                    label={{ value: '80 DBP Target', fill: '#F59E0B', fontSize: 10, position: 'bottom' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic BP (mmHg)"
                    stroke="#D32F2F"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#D32F2F', stroke: '#FFF', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#B71C1C' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic BP (mmHg)"
                    stroke="#F87171"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#F87171' }}
                  />
                </>
              )}

              {/* Weight Line */}
              {(selectedMetric === 'all' || selectedMetric === 'weight') && (
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  name="Weight (kg)"
                  stroke="#0284C7"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0284C7' }}
                />
              )}

              {/* Temperature Line */}
              {(selectedMetric === 'all' || selectedMetric === 'temp') && (
                <Line
                  type="monotone"
                  dataKey="tempC"
                  name="Temp (°C)"
                  stroke="#D97706"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#D97706' }}
                />
              )}

              {/* Heart Rate Line */}
              {(selectedMetric === 'all' || selectedMetric === 'hr') && (
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (bpm)"
                  stroke="#8B5CF6"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#8B5CF6' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Annotations List if any */}
      {annotations.length > 0 && (
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <Stethoscope size={14} className="text-[#D32F2F]" />
            <span>Doctor Clinical Annotations on this Trend</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {annotations.map((annot) => (
              <div
                key={annot.id}
                className="p-3.5 bg-red-50/70 border border-red-200 rounded-2xl text-xs text-gray-800 flex items-start gap-2.5 shadow-xs"
              >
                <div className="w-2 h-2 rounded-full bg-[#D32F2F] mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-extrabold text-[#B71C1C] block">{annot.dateStr}</span>
                  <p className="text-gray-700 mt-0.5 leading-relaxed">{annot.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
