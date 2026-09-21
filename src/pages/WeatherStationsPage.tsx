import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { getWarningColor } from '../utils/geoUtils';
import { Radio, CloudRain, AlertTriangle, ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WeatherStationsPage: React.FC = () => {
  const { stations, allVillages } = useSimulation();
  const navigate = useNavigate();

  const handleFilterDistrict = (dist: string) => {
    navigate('/map');
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-command-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-sky-400" />
            <h2 className="text-base sm:text-lg font-bold font-display uppercase tracking-wider text-slate-100">
              Automatic Weather Stations (AWS) Telemetry Rack
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            13 catchment nodes providing localized precipitation nowcasts, flood warning levels, and basin runoff telemetry.
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-command-900 border border-command-800 px-2.5 py-1">
          NODES: <span className="text-emerald-400 font-bold">13/13 ONLINE</span>
        </div>
      </div>

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {stations.map(station => {
          const warningColor = getWarningColor(station.warning);
          const affectedCount = allVillages.filter(v => v.stationId === station.id).length;
          const isRed = station.warning === 'RED';

          return (
            <div
              key={station.id}
              className={`bg-command-900 border border-command-800 border-l-4 p-3.5 shadow-xl transition-colors hover:bg-command-850/70 flex flex-col justify-between`}
              style={{ borderLeftColor: warningColor }}
            >
              <div>
                {/* Station Title & Status */}
                <div className="flex items-start justify-between border-b border-command-800/80 pb-2 mb-2.5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-1.5">
                      <span>{station.name.replace(' AWS', '')}</span>
                      <span className="text-[10px] text-slate-500 font-normal">AWS</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-sky-400" />
                      <span>{station.district} River Basin</span>
                    </p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase"
                    style={{
                      backgroundColor: `${warningColor}15`,
                      color: warningColor,
                      border: `1px solid ${warningColor}50`
                    }}
                  >
                    {station.warning}
                  </span>
                </div>

                {/* Telemetry Meters */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-command-950 p-2 border border-command-800">
                    <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <CloudRain className="w-3 h-3 text-sky-400" />
                      <span>Current Precip</span>
                    </span>
                    <p className="text-sm font-bold text-sky-300 tabular-nums mt-0.5">
                      {station.rainfall.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">mm/h</span>
                    </p>
                  </div>
                  <div className="bg-command-950 p-2 border border-command-800">
                    <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>3-Hr Forecast</span>
                    </span>
                    <p className="text-sm font-bold text-amber-300 tabular-nums mt-0.5">
                      {station.forecastRainfall.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">mm</span>
                    </p>
                  </div>
                </div>

                {/* Station Technical Specs */}
                <div className="mt-2.5 space-y-1 text-[10px] text-slate-400 bg-command-950/60 p-2 border border-command-800/60">
                  <div className="flex justify-between">
                    <span>Threat Severity:</span>
                    <span className="text-slate-200 font-semibold">{station.severity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coordinates:</span>
                    <span>{station.lat.toFixed(3)}°N, {station.lon.toFixed(3)}°E</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mapped Catchments:</span>
                    <span className="text-sky-400 font-bold tabular-nums">{affectedCount.toLocaleString()} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Telemetry Feed:</span>
                    <span className="text-slate-300">{station.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-3 pt-2 border-t border-command-800 flex justify-between items-center text-[10px]">
                <span className="text-slate-500">Node ID #{station.id}</span>
                <button
                  onClick={() => handleFilterDistrict(station.district)}
                  className="text-sky-400 hover:text-sky-200 font-semibold flex items-center space-x-1 transition-colors"
                >
                  <span>Basin Radar</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
