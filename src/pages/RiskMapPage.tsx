import React, { useState } from 'react';
import { FloodMap } from '../components/map/FloodMap';
import { VillageRiskCard } from '../components/village/VillageRiskCard';
import { VillageSearchBar } from '../components/village/VillageSearchBar';
import { useSimulation } from '../context/SimulationContext';
import { PanelRightClose, PanelRightOpen, Layers } from 'lucide-react';

export const RiskMapPage: React.FC = () => {
  const { selectedVillage } = useSimulation();
  const [showPanel, setShowPanel] = useState(true);

  return (
    <div className="space-y-3">
      {/* Tactical Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-command-900 border border-command-800 p-2.5">
        <div className="flex items-center space-x-2.5 font-mono text-xs">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="font-bold uppercase tracking-wider text-slate-100">
            Geospatial Radar Workstation
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] text-slate-400">
            {selectedVillage ? (
              <span>Target: <strong className="text-sky-300 font-mono">{selectedVillage.village}</strong> ({selectedVillage.district})</span>
            ) : (
              <span>16,920 Catchment Units Online</span>
            )}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-64 sm:w-72">
            <VillageSearchBar placeholder="Locate catchment..." />
          </div>
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="px-2.5 py-1.5 bg-command-950 hover:bg-command-800 border border-command-750 text-xs font-mono text-slate-300 flex items-center space-x-1.5 transition-colors"
          >
            {showPanel ? <PanelRightClose className="w-3.5 h-3.5 text-slate-400" /> : <PanelRightOpen className="w-3.5 h-3.5 text-sky-400" />}
            <span>{showPanel ? 'Hide Inspector' : 'Show Inspector'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        <div className={showPanel ? 'lg:col-span-8 shadow-xl' : 'lg:col-span-12 shadow-xl'}>
          <FloodMap heightClass="h-[calc(100vh-10.5rem)]" showControls={true} />
        </div>

        {showPanel && (
          <div className="lg:col-span-4">
            <VillageRiskCard onClose={() => setShowPanel(false)} />
          </div>
        )}
      </div>
    </div>
  );
};
