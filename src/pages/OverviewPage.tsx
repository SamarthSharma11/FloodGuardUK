import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { FloodMap } from '../components/map/FloodMap';
import { VillageRiskCard } from '../components/village/VillageRiskCard';
import { VillageSearchBar } from '../components/village/VillageSearchBar';
import {
  AlertTriangle,
  Radio,
  BarChart2,
  PieChart as PieIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const { summary, stations, currentScenario } = useSimulation();

  // Recharts Risk Distribution Data
  const riskDistData = [
    { name: 'Low', count: summary.lowCount, color: '#10b981' },
    { name: 'Moderate', count: summary.moderateCount, color: '#eab308' },
    { name: 'High', count: summary.highCount, color: '#f97316' },
    { name: 'Severe', count: summary.severeCount, color: '#f43f5e' },
  ];

  // Station Rainfall Ranking
  const stationRainData = stations
    .map(s => ({ name: s.name.replace(' AWS', ''), rain: s.rainfall }))
    .sort((a, b) => b.rain - a.rain)
    .slice(0, 6);

  // Warning Severity Proportions
  const warningProportions = [
    { name: 'Green', value: stations.filter(s => s.warning === 'GREEN').length, color: '#10b981' },
    { name: 'Yellow', value: stations.filter(s => s.warning === 'YELLOW').length, color: '#eab308' },
    { name: 'Orange', value: stations.filter(s => s.warning === 'ORANGE').length, color: '#f97316' },
    { name: 'Red', value: stations.filter(s => s.warning === 'RED').length, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const isCritical = summary.severeCount > 0;

  return (
    <div className="space-y-4">
      {/* 1. Asymmetric Command Hero: Threat Posture & Telemetry Rack */}
      <div className="border border-command-800 bg-command-900 grid grid-cols-1 lg:grid-cols-12 overflow-hidden shadow-2xl">
        {/* Left: Primary Threat Posture Station */}
        <div className="lg:col-span-5 p-4 sm:p-5 relative bg-[#090e17] bg-topo-pattern flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-command-800">
          <div className="space-y-1.5 relative z-10">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
              <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-slate-400">
                STATEWIDE THREAT POSTURE
              </span>
              <span className="text-slate-600 font-mono">|</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                SCENARIO: {currentScenario}
              </span>
            </div>

            <div className="pt-1">
              <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-100 flex items-baseline space-x-3">
                <span>
                  {summary.severeCount > 0 ? (
                    <span className="text-rose-400">FLASH FLOOD ALERT</span>
                  ) : summary.highCount > 0 ? (
                    <span className="text-amber-400">ELEVATED WATCH</span>
                  ) : (
                    <span className="text-emerald-400">NORMAL BASIN FLOW</span>
                  )}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-1 max-w-md leading-relaxed">
                {summary.severeCount > 0
                  ? `${summary.severeCount} high-susceptibility catchments exceed critical rainfall run-off thresholds. Immediate authority sign-off required.`
                  : summary.highCount > 0
                  ? `Localized heavy precipitation active across Garhwal/Kumaon catchments. Proactive evacuation advisories staged.`
                  : `All 16,920 administrative village catchments operating within nominal baseline parameters.`}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-command-800/80 flex items-center justify-between text-xs font-mono text-slate-400 relative z-10">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Active Proposals</span>
              <span className="text-slate-200 font-bold text-base tabular-nums">
                {summary.activeAlertProposals} <span className="text-xs font-normal text-slate-400">({summary.approvedAlerts} approved)</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[10px] uppercase block">Assessed Catchments</span>
              <span className="text-slate-200 font-bold text-base tabular-nums">
                16,920 <span className="text-xs font-normal text-slate-400">SOI</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Asymmetric Telemetry Columns */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-command-800 bg-command-900">
          {/* Telemetry 1: Severe Risk Count */}
          <div className="p-4 flex flex-col justify-between">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
              Severe Risk
            </div>
            <div className="my-2">
              <div className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${summary.severeCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {summary.severeCount}
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block mt-0.5">
                Immediate Danger
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              Score ≥ 75
            </div>
          </div>

          {/* Telemetry 2: High Risk Count */}
          <div className="p-4 flex flex-col justify-between">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
              High Risk
            </div>
            <div className="my-2">
              <div className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${summary.highCount > 0 ? 'text-orange-400' : 'text-slate-400'}`}>
                {summary.highCount}
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block mt-0.5">
                Advisory Stage
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              Score 50 – 74
            </div>
          </div>

          {/* Telemetry 3: Peak Precipitation */}
          <div className="p-4 flex flex-col justify-between">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
              Peak Rain
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-sky-400">
                {summary.maxRainfall.toFixed(1)}
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block mt-0.5">
                mm / hour
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              AWS Max Inflow
            </div>
          </div>

          {/* Telemetry 4: Mean Catchment Risk */}
          <div className="p-4 flex flex-col justify-between">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
              Mean Index
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-200">
                {summary.averageRisk}
                <span className="text-xs font-normal text-slate-500 ml-0.5">/100</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block mt-0.5">
                State Aggregate
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              Composite Model
            </div>
          </div>
        </div>
      </div>

      {/* 2. Geospatial Section: Map + Selected Catchment Inspector */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-command-800 pb-2">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Uttarakhand Catchment Intelligence Radar
            </h3>
            <span className="text-slate-600 font-mono text-xs">|</span>
            <span className="text-[10px] text-slate-500 font-mono">
              Survey of India EPSG:4326 Polygons
            </span>
          </div>
          <div className="w-full sm:w-80">
            <VillageSearchBar placeholder="Locate 16,920 villages..." />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* Dominant Tactical Map Canvas */}
          <div className="lg:col-span-8 shadow-xl">
            <FloodMap heightClass="h-[620px]" showControls={true} />
          </div>

          {/* Right-Side Catchment Risk Card */}
          <div className="lg:col-span-4">
            <VillageRiskCard />
          </div>
        </div>
      </div>

      {/* 3. Consolidated Multi-Metric Telemetry Rack */}
      <div className="border border-command-800 bg-command-900 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-command-800 shadow-xl font-mono text-xs">
        {/* Bay 1: Risk Distribution */}
        <div className="p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold flex items-center space-x-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Catchment Hazard Distribution</span>
            </span>
            <span className="text-[10px] text-slate-500">16.9K Total</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#4b5f7d" fontSize={10} tickLine={false} />
                <YAxis stroke="#4b5f7d" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d14', borderColor: '#243044', borderRadius: '4px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {riskDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bay 2: Station Telemetry Precipitation */}
        <div className="p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>AWS Precipitation Telemetry (mm/h)</span>
            </span>
            <span className="text-[10px] text-slate-500">Top Inflow</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stationRainData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke="#4b5f7d" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d14', borderColor: '#243044', borderRadius: '4px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="rain" fill="#0ea5e9" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bay 3: Warning Category Proportions */}
        <div className="p-3.5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold flex items-center space-x-1.5">
              <PieIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>IMD Warning Feed Proportions</span>
            </span>
            <span className="text-[10px] text-slate-500">13 Stations</span>
          </div>
          <div className="h-36 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={warningProportions}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={55}
                  innerRadius={35}
                  paddingAngle={3}
                >
                  {warningProportions.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d14', borderColor: '#243044', borderRadius: '4px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[9px] text-slate-400 flex justify-around border-t border-command-800 pt-2">
            <span className="text-emerald-400 font-semibold">● Green</span>
            <span className="text-yellow-400 font-semibold">● Yellow</span>
            <span className="text-orange-400 font-semibold">● Orange</span>
            <span className="text-rose-400 font-semibold">● Red</span>
          </div>
        </div>
      </div>
    </div>
  );
};
