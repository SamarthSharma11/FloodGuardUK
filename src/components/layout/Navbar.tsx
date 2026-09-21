import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Activity, CloudRain, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { ScenarioType } from '../../types';

export const Navbar: React.FC = () => {
  const { currentScenario, changeScenario, notification, dismissNotification } = useSimulation();

  return (
    <header className="bg-command-900 border-b border-command-800 sticky top-0 z-40">
      {/* Top Notification Banner if active */}
      {notification && (
        <div className="bg-sky-950/90 border-b border-sky-800/80 px-4 py-1.5 text-xs text-sky-200 flex items-center justify-between font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="tracking-wide">{notification}</span>
          </div>
          <button
            onClick={dismissNotification}
            className="text-sky-400 hover:text-sky-100 font-mono px-2 py-0.5 text-xs"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Branding & Mission Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-8 h-8 rounded bg-command-950 border border-command-700 flex items-center justify-center text-sky-400">
            <span className="font-mono text-xs font-bold tracking-tighter">FG</span>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-sm sm:text-base font-bold tracking-wider text-slate-100 font-display">
                FLOODGUARD <span className="text-sky-400 font-mono">UK</span>
              </span>
              <span className="hidden sm:inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-sm bg-command-950 border border-command-750 text-[10px] font-mono text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>SOI 16,920 CATCHMENTS</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block font-mono tracking-tight -mt-0.5">
              Flash Flood Early Warning System • Uttarakhand State
            </p>
          </div>
        </div>

        {/* Precision Segmented Scenario Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider hidden sm:inline-block">
            Sim Profile:
          </span>
          <div className="bg-command-950 p-0.5 rounded border border-command-800 flex items-center font-mono text-xs">
            <button
              onClick={() => changeScenario('NORMAL')}
              className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors flex items-center space-x-1.5 ${
                currentScenario === 'NORMAL'
                  ? 'bg-command-800 text-emerald-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Normal</span>
            </button>
            <button
              onClick={() => changeScenario('HEAVY_RAIN')}
              className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors flex items-center space-x-1.5 ${
                currentScenario === 'HEAVY_RAIN'
                  ? 'bg-command-800 text-amber-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CloudRain className="w-3 h-3 text-amber-400" />
              <span>Heavy Rain</span>
            </button>
            <button
              onClick={() => changeScenario('FLASH_FLOOD')}
              className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors flex items-center space-x-1.5 ${
                currentScenario === 'FLASH_FLOOD'
                  ? 'bg-rose-950/80 border border-rose-600/60 text-rose-200 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Flash Flood</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
