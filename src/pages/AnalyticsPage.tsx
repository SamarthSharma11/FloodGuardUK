import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { DISTRICTS_META } from '../data/districts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { BarChart3, TrendingUp, Radio, AlertOctagon } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { summary, stations, allVillages, getVillageRisk, currentScenario } = useSimulation();

  // District Average Risk calculation
  const districtRiskData = DISTRICTS_META.map(d => {
    const villages = allVillages.filter(v => v.dtcode === d.dtcode);
    let sum = 0;
    villages.forEach(v => {
      sum += getVillageRisk(v).finalRisk;
    });
    const avg = villages.length ? Math.round(sum / villages.length) : 0;
    return {
      name: d.name,
      avgRisk: avg,
      count: d.count,
      tier: d.hillyTier
    };
  }).sort((a, b) => b.avgRisk - a.avgRisk);

  // Rainfall trend simulation across 6-hour window
  const trendData = [
    { time: 'T-5h', rain: Number(Math.max(0.5, summary.maxRainfall * 0.25).toFixed(1)), risk: Math.max(10, Math.round(summary.averageRisk * 0.4)) },
    { time: 'T-4h', rain: Number(Math.max(1.0, summary.maxRainfall * 0.45).toFixed(1)), risk: Math.max(12, Math.round(summary.averageRisk * 0.6)) },
    { time: 'T-3h', rain: Number(Math.max(1.5, summary.maxRainfall * 0.65).toFixed(1)), risk: Math.max(14, Math.round(summary.averageRisk * 0.75)) },
    { time: 'T-2h', rain: Number(Math.max(2.0, summary.maxRainfall * 0.85).toFixed(1)), risk: Math.max(15, Math.round(summary.averageRisk * 0.9)) },
    { time: 'T-1h', rain: Number(Math.max(2.5, summary.maxRainfall * 0.95).toFixed(1)), risk: Math.max(16, Math.round(summary.averageRisk * 0.98)) },
    { time: 'Now', rain: Number(summary.maxRainfall.toFixed(1)), risk: summary.averageRisk },
  ];

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-command-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <h2 className="text-base sm:text-lg font-bold font-display uppercase tracking-wider text-slate-100">
              Catchment Risk & Hydrological Observatory
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Cross-district hazard indexing, localized precipitation spikes, and multi-factor vulnerability modeling.
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-command-900 border border-command-800 px-2.5 py-1">
          SCENARIO: <span className="text-sky-400 font-bold">{currentScenario}</span>
        </div>
      </div>

      {/* Row 1: District Risk & Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* District Risk Comparison */}
        <div className="bg-command-900 border border-command-800 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-command-800/80 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-orange-400" />
              <span>District Mean Hazard Index (13 Districts)</span>
            </span>
            <span className="text-[10px] text-slate-500">Score 0 – 100</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtRiskData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <XAxis type="number" stroke="#4b5f7d" fontSize={10} domain={[0, 100]} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d14', borderColor: '#243044', borderRadius: '4px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="avgRisk" radius={[0, 2, 2, 0]}>
                  {districtRiskData.map((entry, index) => (
                    <Cell
                      key={`dist-cell-${index}`}
                      fill={entry.avgRisk >= 75 ? '#f43f5e' : entry.avgRisk >= 50 ? '#f97316' : entry.avgRisk >= 30 ? '#eab308' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temporal Rainfall vs Risk Progression */}
        <div className="bg-command-900 border border-command-800 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-command-800/80 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Temporal Precipitation vs Hazard Progression</span>
            </span>
            <span className="text-[10px] text-slate-500">T-5h → Now</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1a2332" />
                <XAxis dataKey="time" stroke="#4b5f7d" fontSize={10} tickLine={false} />
                <YAxis stroke="#4b5f7d" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d14', borderColor: '#243044', borderRadius: '4px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Line type="monotone" dataKey="rain" name="Peak Rain (mm/hr)" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="risk" name="Mean Risk Score" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Station Telemetry Comparison */}
      <div className="bg-command-900 border border-command-800 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 border-b border-command-800/80 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>AWS Telemetry Comparison Across All 13 Uttarakhand Stations</span>
          </span>
          <span className="text-[10px] text-slate-500">Precipitation (mm/h)</span>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stations} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <XAxis dataKey="name" stroke="#4b5f7d" fontSize={10} tickFormatter={(val) => val.replace(' AWS', '')} tickLine={false} />
              <YAxis stroke="#4b5f7d" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d14', borderColor: '#243044', borderRadius: '4px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
              />
              <Bar dataKey="rainfall" name="Rainfall (mm/hr)" radius={[2, 2, 0, 0]}>
                {stations.map((s, idx) => (
                  <Cell
                    key={`station-${idx}`}
                    fill={s.warning === 'RED' ? '#f43f5e' : s.warning === 'ORANGE' ? '#f97316' : s.warning === 'YELLOW' ? '#eab308' : '#0ea5e9'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
