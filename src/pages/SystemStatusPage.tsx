import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Cpu, Info } from 'lucide-react';

export const SystemStatusPage: React.FC = () => {
  const { summary } = useSimulation();

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-command-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <h2 className="text-base sm:text-lg font-bold font-display uppercase tracking-wider text-slate-100">
              System Architecture & Subsystem Readiness
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Verification matrix documenting spatial dataset integrity, deterministic risk engines, and IMD API interface boundaries.
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-command-900 border border-command-800 px-2.5 py-1">
          STATUS: <span className="text-emerald-400 font-bold">ALL SUBSYSTEMS NOMINAL</span>
        </div>
      </div>

      {/* Operational Disclaimer Banner */}
      <div className="bg-command-900 border border-command-800 p-3 flex items-start space-x-2.5 text-xs font-sans text-slate-300">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-sky-300 font-mono">Prototype Mode:</strong> Current weather telemetry executes against a calibrated 13-station Uttarakhand benchmark dataset. The data provider layer (<code className="text-sky-300 font-mono">src/services/dataProvider.ts</code>) provides an isolated interface for drop-in authenticated IMD REST/JSON ingestion.
        </p>
      </div>

      {/* Subsystem Readiness Matrix */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
          Subsystem Operational Verification
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* 1. Geospatial Data */}
          <div className="bg-command-900 border border-command-800 p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Catchment Dataset</span>
              <p className="text-xs font-bold text-slate-100 mt-0.5">Survey of India (16,920 Units)</p>
              <span className="text-[10px] text-slate-400">EPSG:4326 Reprojected Polygons</span>
            </div>
            <span className="px-2 py-0.5 rounded-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
              VERIFIED
            </span>
          </div>

          {/* 2. Weather Telemetry */}
          <div className="bg-command-900 border border-command-800 p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Weather Provider</span>
              <p className="text-xs font-bold text-slate-100 mt-0.5">Local Benchmark Telemetry</p>
              <span className="text-[10px] text-slate-400">13 Uttarakhand AWS Catchment Feeds</span>
            </div>
            <span className="px-2 py-0.5 rounded-xs bg-sky-950/80 text-sky-300 border border-sky-500/40 text-[10px] font-bold">
              OPERATIONAL
            </span>
          </div>

          {/* 3. IMD Integration */}
          <div className="bg-command-900 border border-command-800 p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">IMD API Interface</span>
              <p className="text-xs font-bold text-slate-100 mt-0.5">Auth API Adapter Ready</p>
              <span className="text-[10px] text-slate-400">Standard REST & JSON Contract</span>
            </div>
            <span className="px-2 py-0.5 rounded-xs bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
              ADAPTER READY
            </span>
          </div>

          {/* 4. Risk Engine */}
          <div className="bg-command-900 border border-command-800 p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Risk Engine Core</span>
              <p className="text-xs font-bold text-slate-100 mt-0.5">50/25/15/10 Multi-Factor</p>
              <span className="text-[10px] text-slate-400">Deterministic Catchment Scoring</span>
            </div>
            <span className="px-2 py-0.5 rounded-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
              OPERATIONAL
            </span>
          </div>

          {/* 5. Village Mapping */}
          <div className="bg-command-900 border border-command-800 p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Spatial Mapping</span>
              <p className="text-xs font-bold text-slate-100 mt-0.5">Centroid & Proximity Search</p>
              <span className="text-[10px] text-slate-400">Nearest AWS Station Matrix</span>
            </div>
            <span className="px-2 py-0.5 rounded-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
              OPERATIONAL
            </span>
          </div>

          {/* 6. Alert Workflow */}
          <div className="bg-command-900 border border-command-800 p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Authority Workflow</span>
              <p className="text-xs font-bold text-slate-100 mt-0.5">Incident Sign-off Protocol</p>
              <span className="text-[10px] text-slate-400">Pending → Authorized → Archived</span>
            </div>
            <span className="px-2 py-0.5 rounded-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
              OPERATIONAL
            </span>
          </div>
        </div>
      </div>

      {/* Production Migration Pipeline */}
      <div className="bg-command-900 border border-command-800 p-4 space-y-3 font-mono">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
          Zero-Code UI Transition Architecture
        </h4>
        <div className="bg-command-950 p-3 border border-command-800 space-y-2 text-[11px]">
          <div className="text-slate-500 uppercase text-[9px] font-bold">Prototype Pipeline:</div>
          <div className="text-sky-300">
            Local Benchmark Observations → 50/25/15/10 Risk Engine → 16.9K Catchment Map → Proposal Dispatch → Authority Review
          </div>
          <div className="text-slate-500 uppercase text-[9px] font-bold pt-1 border-t border-command-800/80">Production Pipeline:</div>
          <div className="text-emerald-300">
            Authenticated IMD API → 50/25/15/10 Risk Engine → 16.9K Catchment Map → Proposal Dispatch → Authority Review
          </div>
        </div>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Switching from benchmark prototype data to official IMD streaming feeds requires updating only the fetch adapter in <code className="text-sky-300 font-mono">src/services/dataProvider.ts</code>. All 16,920 village polygons, susceptibility matrices, geospatial styles, and authority approval consoles operate without modification.
        </p>
      </div>
    </div>
  );
};
