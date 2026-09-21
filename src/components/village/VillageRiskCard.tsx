import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { RiskBadge } from '../common/RiskBadge';
import {
  CloudRain,
  Radio,
  X,
  AlertTriangle,
  ShieldCheck,
  Info,
  MapPin,
  Check
} from 'lucide-react';

interface VillageRiskCardProps {
  onClose?: () => void;
  className?: string;
}

export const VillageRiskCard: React.FC<VillageRiskCardProps> = ({ onClose, className = '' }) => {
  const { selectedVillage, selectedVillageRisk, approveAlert, alerts } = useSimulation();

  if (!selectedVillage || !selectedVillageRisk) {
    return (
      <div className={`bg-command-900 border border-command-800 p-6 text-center text-slate-400 ${className}`}>
        <div className="w-10 h-10 mx-auto rounded-full bg-command-950 border border-command-800 flex items-center justify-center text-slate-500 mb-3">
          <MapPin className="w-5 h-5" />
        </div>
        <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200">
          No Catchment Target Selected
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-sans leading-relaxed">
          Select any Survey of India polygon on the map or use the locator search to stream localized risk telemetry.
        </p>
      </div>
    );
  }

  const v = selectedVillage;
  const r = selectedVillageRisk;

  // Check if an alert already exists for this village
  const existingAlert = alerts.find(a => String(a.villageId) === String(v.id));

  return (
    <div className={`bg-command-900 border border-command-800 shadow-2xl flex flex-col ${className}`}>
      {/* Header Bar */}
      <div className="p-3 border-b border-command-800 bg-command-950/80 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold uppercase text-slate-100 font-mono tracking-wide">
              {v.village}
            </h3>
            {v.isHotspot && (
              <span className="px-1 py-0.2 text-[9px] font-mono font-bold bg-rose-950 border border-rose-600/60 text-rose-300">
                HOTSPOT
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            {v.district} • Block: {v.block} • Code: {v.vlcode}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-command-800 transition-colors"
            aria-label="Close inspector"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Content (Scrollable) */}
      <div className="p-3.5 space-y-3.5 overflow-y-auto max-h-[calc(100vh-14rem)] text-xs text-slate-300">
        {/* Risk Score Threat Banner */}
        <div className="bg-command-950 p-3 border border-command-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
              Evaluated Threat Tier
            </div>
            <RiskBadge level={r.riskLevel} size="md" score={r.finalRisk} />
            <div className="mt-1.5 text-[10px] font-mono text-slate-400">
              CONFIDENCE: <strong className="text-slate-200">{r.confidence}</strong>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono text-slate-100 tabular-nums leading-none">
              {r.finalRisk}
              <span className="text-xs font-normal text-slate-500 ml-1">/ 100</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono tracking-wider">COMPOSITE INDEX</span>
          </div>
        </div>

        {/* Current Weather Observations */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Catchment Telemetry</span>
            <span className="text-sky-400">AWS Proximity Feed</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 font-mono">
            <div className="bg-command-950 p-2 border border-command-800">
              <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                <CloudRain className="w-3 h-3 text-sky-400" />
                <span>Rainfall Rate</span>
              </span>
              <p className="text-sm font-bold text-sky-300 tabular-nums mt-0.5">
                {r.rainfall.toFixed(1)} mm/hr
              </p>
            </div>
            <div className="bg-command-950 p-2 border border-command-800">
              <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                <Radio className="w-3 h-3 text-amber-400" />
                <span>Nearest AWS</span>
              </span>
              <p className="text-xs font-bold text-slate-200 truncate mt-0.5" title={r.stationName}>
                {r.stationName.replace(' AWS', '')}
              </p>
              <span className="text-[10px] text-slate-400">{r.stationDistKm.toFixed(1)} km</span>
            </div>
          </div>
        </div>

        {/* Risk Drivers & Mathematical Calculation Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Formula Decomposition</span>
            <span className="text-slate-400">Weights: 50 / 25 / 15 / 10</span>
          </div>

          <div className="space-y-2 bg-command-950 p-2.5 border border-command-800 font-mono text-[10px]">
            {/* Weather */}
            <div>
              <div className="flex justify-between mb-0.5">
                <span className="text-slate-400">Weather Severity (50%)</span>
                <span className="text-slate-200 tabular-nums font-semibold">
                  {r.weatherScore}/100 <span className="text-sky-400 font-normal">(+{(r.weatherScore * 0.50).toFixed(1)})</span>
                </span>
              </div>
              <div className="w-full h-1 bg-command-850">
                <div className="h-full bg-sky-400" style={{ width: `${r.weatherScore}%` }} />
              </div>
            </div>

            {/* Forecast */}
            <div>
              <div className="flex justify-between mb-0.5">
                <span className="text-slate-400">Forecast / Warning (25%)</span>
                <span className="text-slate-200 tabular-nums font-semibold">
                  {r.forecastScore}/100 <span className="text-amber-400 font-normal">(+{(r.forecastScore * 0.25).toFixed(1)})</span>
                </span>
              </div>
              <div className="w-full h-1 bg-command-850">
                <div className="h-full bg-amber-400" style={{ width: `${r.forecastScore}%` }} />
              </div>
            </div>

            {/* Susceptibility */}
            <div>
              <div className="flex justify-between mb-0.5">
                <span className="text-slate-400">Terrain Factor (15%)</span>
                <span className="text-slate-200 tabular-nums font-semibold">
                  {r.susceptibilityScore}/100 <span className="text-rose-400 font-normal">(+{(r.susceptibilityScore * 0.15).toFixed(1)})</span>
                </span>
              </div>
              <div className="w-full h-1 bg-command-850">
                <div className="h-full bg-rose-400" style={{ width: `${r.susceptibilityScore}%` }} />
              </div>
            </div>

            {/* History */}
            <div>
              <div className="flex justify-between mb-0.5">
                <span className="text-slate-400">Historical Exposure (10%)</span>
                <span className="text-slate-200 tabular-nums font-semibold">
                  {r.historyScore}/100 <span className="text-purple-400 font-normal">(+{(r.historyScore * 0.10).toFixed(1)})</span>
                </span>
              </div>
              <div className="w-full h-1 bg-command-850">
                <div className="h-full bg-purple-400" style={{ width: `${r.historyScore}%` }} />
              </div>
            </div>

            <div className="pt-1.5 border-t border-command-800 text-[10px] text-slate-400 flex justify-between items-center">
              <span>Deterministic Sum:</span>
              <strong className="text-slate-100 text-xs font-mono tabular-nums">{r.finalRisk} / 100</strong>
            </div>
          </div>
        </div>

        {/* Terrain & Historical Matrix */}
        <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
          <div className="bg-command-950 p-2 border border-command-800 space-y-1">
            <span className="text-slate-400 uppercase tracking-wider block font-semibold">Topography</span>
            <div className="flex justify-between"><span>Slope:</span> <strong className="text-slate-200 tabular-nums">{r.susceptibilityBreakdown.slopeScore}</strong></div>
            <div className="flex justify-between"><span>Elevation:</span> <strong className="text-slate-200 tabular-nums">{r.susceptibilityBreakdown.elevationScore}</strong></div>
            <div className="flex justify-between"><span>Drainage:</span> <strong className="text-slate-200 tabular-nums">{r.susceptibilityBreakdown.drainageScore}</strong></div>
          </div>

          <div className="bg-command-950 p-2 border border-command-800 space-y-1">
            <span className="text-slate-400 uppercase tracking-wider block font-semibold">History / Exposure</span>
            <div className="flex justify-between"><span>Prior Floods:</span> <strong className="text-slate-200 tabular-nums">{r.historicalBreakdown.previousEventsCount}</strong></div>
            <div className="flex justify-between"><span>Landslide:</span> <strong className="text-slate-200">{r.historicalBreakdown.landslideExposure}</strong></div>
            <div className="flex justify-between"><span>Exposure:</span> <strong className="text-slate-200 tabular-nums">{r.historicalBreakdown.exposureIndex}</strong></div>
          </div>
        </div>

        {/* AI Operational Assessment Briefing */}
        <div className="bg-command-950 p-2.5 border border-command-800 space-y-1 font-mono">
          <div className="flex items-center space-x-1.5 text-[10px] text-sky-400 font-semibold uppercase tracking-wider">
            <Info className="w-3 h-3" />
            <span>Operational Assessment Brief</span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed italic">
            "{r.explanation}"
          </p>
        </div>

        {/* Demographics / Census Info */}
        <div className="bg-command-950/60 p-2.5 border border-command-800/80 font-mono text-[10px] space-y-1 text-slate-400">
          <div className="flex justify-between"><span>Census Population:</span> <strong className="text-slate-100 tabular-nums">{v.population.toLocaleString()}</strong></div>
          <div className="flex justify-between"><span>Households:</span> <strong className="text-slate-200 tabular-nums">{v.households.toLocaleString()}</strong></div>
          <div className="flex justify-between"><span>Gram Panchayat:</span> <span className="text-slate-300 truncate max-w-[150px]">{v.gram_panchayat_name}</span></div>
          <div className="flex justify-between"><span>Tehsil:</span> <span className="text-slate-300">{v.subdistric}</span></div>
        </div>

        {/* Authority Alert Action */}
        {(r.riskLevel === 'SEVERE' || r.riskLevel === 'HIGH') && (
          <div className="pt-1">
            {existingAlert ? (
              <div className="p-2 bg-command-950 border border-command-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-200 font-semibold">STATUS: {existingAlert.status}</span>
                </div>
                {existingAlert.status === 'PENDING' && (
                  <button
                    onClick={() => approveAlert(existingAlert.id)}
                    className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center space-x-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Authorize</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 border border-amber-500/40 font-mono">
                ⚠ Threat level warrants authority review. Check Alerts Console for broadcast proposal.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
