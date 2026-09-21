import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { ScenarioType } from '../types';
import { Sliders, CloudRain, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ScenariosPage: React.FC = () => {
  const { currentScenario, changeScenario } = useSimulation();
  const navigate = useNavigate();

  const handleRun = (type: ScenarioType) => {
    changeScenario(type);
  };

  const handleRunAndInspect = (type: ScenarioType) => {
    changeScenario(type);
    navigate('/');
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-command-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h2 className="text-base sm:text-lg font-bold font-display uppercase tracking-wider text-slate-100">
              Operational Simulation Terminal
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Inject synthetic meteorological extremes to evaluate deterministic risk propagation across 16,920 village units and alert generation workflows.
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-command-900 border border-command-800 px-2.5 py-1">
          CURRENT STATE: <span className="text-sky-400 font-bold">{currentScenario}</span>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="space-y-3">
        {/* Scenario 1: Normal */}
        <div className={`p-4 border border-l-4 transition-colors ${
          currentScenario === 'NORMAL'
            ? 'bg-command-900 border-command-750 border-l-emerald-500 shadow-xl'
            : 'bg-command-900/60 border-command-800 border-l-slate-700 hover:bg-command-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-xs bg-command-950 border border-command-800 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    1. BASELINE MONSOONAL FLOW
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Normal Precipitation • Green Warnings State-wide
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                Rainfall remains between 0.5 – 6.2 mm/hr across all river basins. All 16,920 village polygons evaluate to LOW hazard tiers. Zero authority evacuation proposals.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleRun('NORMAL')}
                className={`px-3 py-1.5 rounded-xs text-xs font-semibold transition-colors ${
                  currentScenario === 'NORMAL'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-command-950 text-slate-300 hover:bg-command-800 border border-command-750'
                }`}
              >
                {currentScenario === 'NORMAL' ? '✓ Profile Engaged' : 'Engage Profile'}
              </button>
              <button
                onClick={() => handleRunAndInspect('NORMAL')}
                className="px-2.5 py-1.5 bg-command-950 hover:bg-command-800 border border-command-750 text-sky-400 text-xs flex items-center space-x-1 transition-colors"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Scenario 2: Heavy Rain */}
        <div className={`p-4 border border-l-4 transition-colors ${
          currentScenario === 'HEAVY_RAIN'
            ? 'bg-command-900 border-command-750 border-l-amber-500 shadow-xl'
            : 'bg-command-900/60 border-command-800 border-l-slate-700 hover:bg-command-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-xs bg-command-950 border border-command-800 text-amber-400">
                  <CloudRain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    2. UPPER GARHWAL CONVECTIVE DOWNPOUR
                  </h3>
                  <span className="text-[10px] text-amber-400 font-semibold">
                    Intense Downpour in Chamoli, Rudraprayag & Uttarkashi Catchments
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                Precipitation escalates to 28 – 36 mm/hr at Joshimath and Rudraprayag AWS with active ORANGE warning telemetry. Steep slope villages transition into MODERATE and HIGH risk categories.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleRun('HEAVY_RAIN')}
                className={`px-3 py-1.5 rounded-xs text-xs font-semibold transition-colors ${
                  currentScenario === 'HEAVY_RAIN'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-command-950 text-slate-300 hover:bg-command-800 border border-command-750'
                }`}
              >
                {currentScenario === 'HEAVY_RAIN' ? '✓ Profile Engaged' : 'Engage Profile'}
              </button>
              <button
                onClick={() => handleRunAndInspect('HEAVY_RAIN')}
                className="px-2.5 py-1.5 bg-command-950 hover:bg-command-800 border border-command-750 text-sky-400 text-xs flex items-center space-x-1 transition-colors"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Scenario 3: Flash Flood */}
        <div className={`p-4 border border-l-4 transition-colors ${
          currentScenario === 'FLASH_FLOOD'
            ? 'bg-command-900 border-command-750 border-l-rose-500 shadow-xl'
            : 'bg-command-900/60 border-command-800 border-l-slate-700 hover:bg-command-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-xs bg-command-950 border border-command-800 text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    3. BASIN CLOUDBURST EVENT (CRITICAL THREAT)
                  </h3>
                  <span className="text-[10px] text-rose-400 font-semibold">
                    Cloudburst Event (&gt;55 mm/hr) • Red IMD Warnings • Flash Flood Danger
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                Joshimath AWS records 64.8 mm/hr, Rudraprayag records 58.6 mm/hr with RED warnings. Vulnerable village polygons highlight crimson/orange, and urgent emergency proposals trigger for administrative sign-off.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleRun('FLASH_FLOOD')}
                className={`px-3 py-1.5 rounded-xs text-xs font-semibold transition-colors ${
                  currentScenario === 'FLASH_FLOOD'
                    ? 'bg-rose-700 text-white shadow-sm'
                    : 'bg-command-950 text-slate-300 hover:bg-command-800 border border-command-750'
                }`}
              >
                {currentScenario === 'FLASH_FLOOD' ? '✓ Profile Engaged' : 'Engage Profile'}
              </button>
              <button
                onClick={() => handleRunAndInspect('FLASH_FLOOD')}
                className="px-2.5 py-1.5 bg-command-950 hover:bg-command-800 border border-command-750 text-sky-400 text-xs flex items-center space-x-1 transition-colors"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
