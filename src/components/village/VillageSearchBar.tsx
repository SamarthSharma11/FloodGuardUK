import React, { useState, useMemo } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Village } from '../../types';
import { Search, MapPin, X } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

interface VillageSearchBarProps {
  placeholder?: string;
  onSelect?: (village: Village) => void;
  className?: string;
}

export const VillageSearchBar: React.FC<VillageSearchBarProps> = ({
  placeholder = 'Locate village, block, or district...',
  onSelect,
  className = ''
}) => {
  const { allVillages, selectVillage, getVillageRisk } = useSimulation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Search through all 16,920 villages fast
  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase().trim();
    const matches: Village[] = [];

    for (let i = 0; i < allVillages.length; i++) {
      const v = allVillages[i];
      if (
        v.village.toLowerCase().includes(q) ||
        v.district.toLowerCase().includes(q) ||
        v.block.toLowerCase().includes(q)
      ) {
        matches.push(v);
        if (matches.length >= 10) break;
      }
    }
    return matches;
  }, [query, allVillages]);

  const handleSelect = (v: Village) => {
    selectVillage(v);
    if (onSelect) onSelect(v);
    setIsOpen(false);
    setQuery(`${v.village} (${v.district})`);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-command-950 border border-command-750 rounded-xs pl-8 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-colors font-mono"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-[1000] left-0 right-0 mt-1 bg-command-900 border border-command-750 shadow-2xl max-h-72 overflow-y-auto divide-y divide-command-800/80">
          <div className="px-2.5 py-1 text-[9px] font-mono text-slate-400 uppercase tracking-wider bg-command-950 flex justify-between">
            <span>Query Results</span>
            <span className="text-slate-500">{results.length} Matches</span>
          </div>
          {results.map((v) => {
            const risk = getVillageRisk(v);
            return (
              <button
                key={`${v.id}-${v.vlcode}`}
                onClick={() => handleSelect(v)}
                className="w-full px-2.5 py-2 text-left hover:bg-command-800/80 flex items-center justify-between transition-colors group"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-100 group-hover:text-sky-300 transition-colors font-mono">
                      {v.village}
                    </span>
                    {v.isHotspot && (
                      <span className="px-1 text-[9px] rounded-xs bg-rose-950 border border-rose-600/50 text-rose-300 font-mono font-bold">
                        HOTSPOT
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-2 mt-0.5">
                    <span>{v.district}</span>
                    <span className="text-slate-600">•</span>
                    <span>Block: {v.block}</span>
                    <span className="text-slate-600">•</span>
                    <span>Pop: {v.population.toLocaleString()}</span>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  <RiskBadge level={risk.riskLevel} size="sm" score={risk.finalRisk} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
