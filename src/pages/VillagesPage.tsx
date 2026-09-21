import React, { useState, useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Village } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { DISTRICTS_META } from '../data/districts';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MapPin
} from 'lucide-react';

export const VillagesPage: React.FC = () => {
  const { allVillages, isLoadingVillages, selectVillage, getVillageRisk } = useSimulation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  // Filtered & Sorted list
  const filteredVillages = useMemo(() => {
    let result = allVillages;

    if (selectedDistrict !== 'ALL') {
      result = result.filter(v => v.dtcode === selectedDistrict);
    }

    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(v =>
        v.village.toLowerCase().includes(q) ||
        v.district.toLowerCase().includes(q) ||
        v.block.toLowerCase().includes(q) ||
        String(v.vlcode).includes(q)
      );
    }

    if (selectedRisk !== 'ALL') {
      result = result.filter(v => {
        const risk = getVillageRisk(v);
        return risk.riskLevel === selectedRisk;
      });
    }

    return result;
  }, [allVillages, selectedDistrict, searchQuery, selectedRisk, getVillageRisk]);

  const totalPages = Math.ceil(filteredVillages.length / pageSize);
  const paginatedVillages = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVillages.slice(start, start + pageSize);
  }, [filteredVillages, currentPage]);

  const handleInspectVillage = (v: Village) => {
    selectVillage(v);
    navigate('/map');
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-command-800 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-display uppercase tracking-wide text-slate-100 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>Survey of India Catchment Registry</span>
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            16,920 administrative village units mapped to real-time precipitation and terrain susceptibility vectors.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-command-900 border border-command-800 px-2.5 py-1">
          Showing <span className="text-sky-400 font-bold tabular-nums">{filteredVillages.length.toLocaleString()}</span> of 16,920
        </div>
      </div>

      {/* High-Precision Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-command-900 border border-command-800 p-2 text-xs font-mono">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search village, block, census code..."
            className="w-full bg-command-950 border border-command-750 rounded-xs pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* District Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400 shrink-0 uppercase text-[10px]">District:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => { setSelectedDistrict(e.target.value); setCurrentPage(1); }}
            className="w-full bg-command-950 border border-command-750 rounded-xs px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="ALL">All 13 Districts</option>
            {DISTRICTS_META.map(d => (
              <option key={d.dtcode} value={d.dtcode}>{d.name} ({d.count})</option>
            ))}
          </select>
        </div>

        {/* Risk Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400 shrink-0 uppercase text-[10px]">Risk Tier:</span>
          <select
            value={selectedRisk}
            onChange={(e) => { setSelectedRisk(e.target.value); setCurrentPage(1); }}
            className="w-full bg-command-950 border border-command-750 rounded-xs px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="SEVERE">Severe Only (≥75)</option>
            <option value="HIGH">High Only (50-74)</option>
            <option value="MODERATE">Moderate Only (30-49)</option>
            <option value="LOW">Low Only (0-29)</option>
          </select>
        </div>
      </div>

      {/* Dense GIS Table */}
      <div className="bg-command-900 border border-command-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-command-950 border-b border-command-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Village / Code</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Block / Tehsil</th>
                <th className="py-2.5 px-3 text-right">Population</th>
                <th className="py-2.5 px-3">AWS Station</th>
                <th className="py-2.5 px-3 text-right">Distance</th>
                <th className="py-2.5 px-3 text-center">Hazard Tier</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-command-800/60">
              {isLoadingVillages ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                    Streaming Survey of India records...
                  </td>
                </tr>
              ) : paginatedVillages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                    Zero catchments match active filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedVillages.map((v) => {
                  const risk = getVillageRisk(v);
                  return (
                    <tr key={`${v.id}-${v.vlcode}`} className="hover:bg-command-850/70 transition-colors">
                      <td className="py-2 px-3">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-slate-200">{v.village}</span>
                          {v.isHotspot && (
                            <span className="px-1 text-[9px] rounded-xs bg-rose-950 border border-rose-600/50 text-rose-300 font-bold">
                              HOTSPOT
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">#{v.vlcode}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-300">{v.district}</td>
                      <td className="py-2 px-3 text-slate-400">
                        {v.block} <span className="text-slate-600">/ {v.subdistric}</span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-200 tabular-nums">
                        {v.population.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-slate-300">{risk.stationName.replace(' AWS', '')}</td>
                      <td className="py-2 px-3 text-right text-slate-400 tabular-nums">
                        {v.stationDistKm.toFixed(1)} km
                      </td>
                      <td className="py-2 px-3 text-center">
                        <RiskBadge level={risk.riskLevel} size="sm" score={risk.finalRisk} />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleInspectVillage(v)}
                          className="px-2 py-1 bg-command-950 hover:bg-sky-500/20 border border-command-750 hover:border-sky-500/50 text-sky-300 transition-colors text-[10px] uppercase font-semibold inline-flex items-center space-x-1"
                        >
                          <span>Radar</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-2.5 bg-command-950 border-t border-command-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            Page <strong className="text-slate-100 tabular-nums">{currentPage}</strong> of {Math.max(1, totalPages)}
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded-xs bg-command-900 border border-command-750 disabled:opacity-30 hover:bg-command-800 text-slate-200"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 rounded-xs bg-command-900 border border-command-750 disabled:opacity-30 hover:bg-command-800 text-slate-200"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
