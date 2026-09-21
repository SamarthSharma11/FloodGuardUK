import React from 'react';

export const MapLegend: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-command-900/95 backdrop-blur-md border border-command-750 p-2.5 shadow-2xl font-mono text-[10px] w-64 ${className}`}>
      {/* Legend Header */}
      <div className="flex items-center justify-between text-slate-400 font-semibold tracking-wider uppercase border-b border-command-800/80 pb-1.5 mb-2">
        <span className="text-slate-200">Catchment Hazard Scale</span>
        <span className="text-slate-500 font-mono">SOI UK</span>
      </div>

      {/* Continuous / Stepped Gradient Scale Bar */}
      <div className="space-y-1">
        <div className="h-2 w-full rounded-xs overflow-hidden flex">
          <div className="flex-1 bg-emerald-500" title="Low: 0-29" />
          <div className="flex-1 bg-yellow-500" title="Moderate: 30-49" />
          <div className="flex-1 bg-orange-500" title="High: 50-74" />
          <div className="flex-1 bg-rose-600" title="Severe: 75-100" />
        </div>

        {/* Threshold Ticks */}
        <div className="flex justify-between text-[9px] text-slate-400 tabular-nums px-0.5">
          <span>0</span>
          <span>30</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>

        {/* Category Labels */}
        <div className="grid grid-cols-4 text-center text-[9px] font-semibold tracking-tight text-slate-300 pt-0.5">
          <span className="text-emerald-400">LOW</span>
          <span className="text-yellow-400">MOD</span>
          <span className="text-orange-400">HIGH</span>
          <span className="text-rose-400">SEVERE</span>
        </div>
      </div>

      {/* Symbology Key */}
      <div className="mt-2.5 pt-2 border-t border-command-800/80 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400 border border-sky-200 shrink-0" />
          <span className="truncate">AWS Station</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-0.5 bg-sky-400 shrink-0" />
          <span className="truncate">Active District</span>
        </div>
      </div>
    </div>
  );
};
