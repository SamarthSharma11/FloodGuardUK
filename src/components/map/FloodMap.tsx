import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSimulation } from '../../context/SimulationContext';
import { Village, WeatherStation, RiskLevel } from '../../types';
import { dataProvider } from '../../services/dataProvider';
import { DISTRICTS_META } from '../../data/districts';
import { getRiskColor, getWarningColor } from '../../utils/geoUtils';
import { MapLegend } from './MapLegend';
import {
  Maximize2,
  Filter,
  Layers,
  Radio,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';

// Controller component to smoothly pan/zoom map programmatically
const MapController: React.FC<{
  targetBounds?: L.LatLngBoundsExpression | null;
  targetCenter?: [number, number] | null;
}> = ({ targetBounds, targetCenter }) => {
  const map = useMap();

  useEffect(() => {
    if (targetBounds) {
      map.fitBounds(targetBounds, { padding: [30, 30], maxZoom: 13, animate: true });
    } else if (targetCenter) {
      map.flyTo(targetCenter, 12, { animate: true, duration: 1 });
    }
  }, [map, targetBounds, targetCenter]);

  return null;
};

// Create tactical icon for weather stations (only pulse if SEVERE/RED warning)
const createStationIcon = (station: WeatherStation) => {
  const color = getWarningColor(station.warning);
  const isSevere = station.warning === 'RED';
  return L.divIcon({
    className: 'custom-station-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 22px; height: 22px;">
        ${isSevere ? `<span style="position: absolute; width: 22px; height: 22px; border-radius: 9999px; background-color: ${color}; opacity: 0.45; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>` : ''}
        <span style="position: relative; width: 10px; height: 10px; border-radius: 9999px; background-color: ${color}; border: 1.5px solid #070a0f; box-shadow: 0 0 6px ${color};"></span>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

// Selected village marker icon - tactical reticle
const createSelectedPin = () => {
  return L.divIcon({
    className: 'custom-selected-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
        <span style="position: absolute; width: 28px; height: 28px; border: 1.5px dashed #38bdf8; border-radius: 9999px; opacity: 0.85;"></span>
        <span style="position: relative; width: 8px; height: 8px; border-radius: 9999px; background-color: #38bdf8; box-shadow: 0 0 8px #38bdf8;"></span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface FloodMapProps {
  heightClass?: string;
  showControls?: boolean;
}

export const FloodMap: React.FC<FloodMapProps> = ({
  heightClass = 'h-[580px]',
  showControls = true
}) => {
  const {
    allVillages,
    stations,
    selectedVillage,
    selectVillage,
    getVillageRisk,
    currentScenario
  } = useSimulation();

  const [districtGeoJson, setDistrictGeoJson] = useState<any>(null);
  const [boundariesGeoJson, setBoundariesGeoJson] = useState<any>(null);
  const [activeDistrict, setActiveDistrict] = useState<string>('047'); // Chamoli default (Joshimath)
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [showStations, setShowStations] = useState<boolean>(true);
  const [targetBounds, setTargetBounds] = useState<L.LatLngBoundsExpression | null>(null);
  const [targetCenter, setTargetCenter] = useState<[number, number] | null>(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState<boolean>(false);

  // Load district boundaries once
  useEffect(() => {
    dataProvider.getDistrictBoundaries()
      .then(data => setBoundariesGeoJson(data))
      .catch(err => console.error('Failed to load district boundaries:', err));
  }, []);

  // Load active district village polygons
  useEffect(() => {
    let active = true;
    setIsLoadingGeo(true);
    dataProvider.getDistrictGeoJSON(activeDistrict)
      .then(data => {
        if (active) {
          setDistrictGeoJson(data);
          setIsLoadingGeo(false);
        }
      })
      .catch(err => {
        console.error('Failed to load district villages:', err);
        if (active) setIsLoadingGeo(false);
      });
    return () => { active = false; };
  }, [activeDistrict]);

  // When a village is selected externally (e.g. via search), ensure its district is loaded and map zooms
  useEffect(() => {
    if (selectedVillage) {
      if (selectedVillage.dtcode && selectedVillage.dtcode !== activeDistrict) {
        setActiveDistrict(selectedVillage.dtcode);
      }
      setTargetCenter([selectedVillage.centroid[0], selectedVillage.centroid[1]]);
    }
  }, [selectedVillage]);

  // Reset map view to entire state
  const handleResetView = () => {
    setTargetBounds([[28.7, 77.5], [31.5, 81.2]]);
    setTargetCenter(null);
  };

  // Switch district
  const handleDistrictChange = (dtcode: string) => {
    setActiveDistrict(dtcode);
    const distMeta = DISTRICTS_META.find(d => d.dtcode === dtcode);
    if (distMeta) {
      // Find representative village in that district to center map
      const sample = allVillages.find(v => v.dtcode === dtcode);
      if (sample) {
        setTargetCenter([sample.centroid[0], sample.centroid[1]]);
      }
    }
  };

  // Village polygon styling callback
  const villageStyle = useCallback((feature: any) => {
    const props = feature?.properties;
    const isSelected = selectedVillage && (String(selectedVillage.id) === String(props?.id) || selectedVillage.vlcode === props?.vlcode);

    // Find assigned station & calculate risk
    const station = stations.find(s => s.id === props?.stationId) || stations[0];
    const risk = props ? getVillageRisk(props) : null;
    const riskLevel: RiskLevel = risk ? risk.riskLevel : 'LOW';
    const color = getRiskColor(riskLevel);

    // Apply risk filter
    if (riskFilter !== 'ALL' && riskLevel !== riskFilter) {
      return {
        fillColor: '#64748b',
        fillOpacity: 0.05,
        color: '#334155',
        weight: 0.5,
        opacity: 0.3
      };
    }

    if (isSelected) {
      return {
        fillColor: '#38bdf8',
        fillOpacity: 0.75,
        color: '#ffffff',
        weight: 3.5,
        opacity: 1,
        dashArray: undefined
      };
    }

    return {
      fillColor: color,
      fillOpacity: riskLevel === 'SEVERE' ? 0.65 : riskLevel === 'HIGH' ? 0.55 : 0.4,
      color: color,
      weight: 1,
      opacity: 0.8
    };
  }, [selectedVillage, stations, getVillageRisk, riskFilter, currentScenario]);

  // Village polygon click and hover events
  const onEachVillageFeature = useCallback((feature: any, layer: L.Layer) => {
    const props = feature.properties;
    if (!props) return;

    layer.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        selectVillage(props);
      },
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 2.5,
          color: '#ffffff',
          fillOpacity: 0.75
        });
        target.bringToFront();
      },
      mouseout: (e) => {
        if (districtGeoJson) {
          // Reset style
          const isSelected = selectedVillage && (String(selectedVillage.id) === String(props.id));
          if (!isSelected) {
            e.target.setStyle(villageStyle(feature));
          }
        }
      }
    });

    // Simple tooltip on hover
    layer.bindTooltip(`
      <div style="font-family: monospace; font-size: 11px; padding: 2px;">
        <strong>${props.village}</strong><br/>
        District: ${props.district}<br/>
        Pop: ${props.population ? props.population.toLocaleString() : 'N/A'}
      </div>
    `, { sticky: true, className: 'leaflet-dark-tooltip' });
  }, [selectVillage, selectedVillage, districtGeoJson, villageStyle]);

  // District boundaries style
  const districtBoundaryStyle = useCallback((feature: any) => {
    const isActive = feature?.properties?.dtcode === activeDistrict;
    return {
      fillColor: 'transparent',
      fillOpacity: 0,
      color: isActive ? '#06b6d4' : '#475569',
      weight: isActive ? 2.5 : 1.2,
      dashArray: isActive ? undefined : '4, 4',
      opacity: 0.8
    };
  }, [activeDistrict]);

  const onEachDistrictFeature = useCallback((feature: any, layer: L.Layer) => {
    const props = feature.properties;
    layer.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        if (props?.dtcode) {
          handleDistrictChange(props.dtcode);
        }
      }
    });
  }, []);

  return (
    <div className={`relative w-full border border-command-800 bg-[#070a0f] ${heightClass}`}>
      {/* Top Filter Bar */}
      {showControls && (
        <div className="absolute top-2.5 left-2.5 z-[400] flex flex-wrap items-center gap-1.5 bg-command-900/95 backdrop-blur-md p-1.5 border border-command-750 shadow-2xl text-xs font-mono">
          {/* District Dropdown */}
          <div className="flex items-center space-x-1 pl-1">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={activeDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="bg-command-950 border border-command-700 text-slate-100 rounded-xs px-2 py-1 text-xs focus:outline-none focus:border-sky-500 font-mono"
            >
              {DISTRICTS_META.map(d => (
                <option key={d.dtcode} value={d.dtcode}>
                  {d.name} ({d.count} villages)
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center space-x-1 pl-1 border-l border-command-800">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-command-950 border border-command-700 text-slate-100 rounded-xs px-2 py-1 text-xs focus:outline-none focus:border-sky-500 font-mono"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="SEVERE">Severe Only</option>
              <option value="HIGH">High Only</option>
              <option value="MODERATE">Moderate Only</option>
              <option value="LOW">Low Only</option>
            </select>
          </div>

          {/* Station Toggle */}
          <button
            onClick={() => setShowStations(!showStations)}
            className={`px-2 py-1 rounded-xs border flex items-center space-x-1 transition-colors ${
              showStations
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-semibold'
                : 'bg-command-950 text-slate-400 border-command-700 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>Stations</span>
          </button>

          {/* Reset Map View */}
          <button
            onClick={handleResetView}
            title="Fit Uttarakhand Bounds"
            className="px-2 py-1 rounded-xs bg-command-950 hover:bg-command-800 text-slate-300 border border-command-700 flex items-center space-x-1 transition-colors"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Reset View</span>
          </button>
        </div>
      )}

      {/* Loading overlay for polygons */}
      {isLoadingGeo && (
        <div className="absolute top-2.5 right-2.5 z-[400] bg-command-900/95 backdrop-blur-md px-2.5 py-1 border border-command-750 flex items-center space-x-2 text-[11px] font-mono text-sky-400 shadow-xl">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Loading SOI Catchments...</span>
        </div>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={[30.3, 79.2]}
        zoom={8}
        minZoom={7}
        maxZoom={15}
        preferCanvas={true}
        style={{ width: '100%', height: '100%', background: '#070b14' }}
      >
        <MapController targetBounds={targetBounds} targetCenter={targetCenter} />

        {/* Dark Matter / CartoDB Base Map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* District Boundaries Layer */}
        {boundariesGeoJson && (
          <GeoJSON
            key={`boundaries-${activeDistrict}`}
            data={boundariesGeoJson}
            style={districtBoundaryStyle}
            onEachFeature={onEachDistrictFeature}
          />
        )}

        {/* Real Survey of India Village Polygons Layer */}
        {districtGeoJson && (
          <GeoJSON
            key={`district-villages-${activeDistrict}-${currentScenario}-${riskFilter}-${selectedVillage?.id || 'none'}`}
            data={districtGeoJson}
            style={villageStyle}
            onEachFeature={onEachVillageFeature}
          />
        )}

        {/* Selected Village Centroid Pulsing Marker */}
        {selectedVillage && (
          <Marker
            position={[selectedVillage.centroid[0], selectedVillage.centroid[1]]}
            icon={createSelectedPin()}
            zIndexOffset={1000}
          />
        )}

        {/* Weather Station Markers */}
        {showStations && stations.map(s => {
          const count = allVillages.filter(v => v.stationId === s.id).length;
          return (
            <Marker
              key={s.id}
              position={[s.lat, s.lon]}
              icon={createStationIcon(s)}
            >
              <Popup className="dark-leaflet-popup">
                <div className="font-sans p-1 text-slate-100 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5">
                    <h5 className="font-bold text-sm text-cyan-400 font-mono">{s.name}</h5>
                    <span
                      className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase"
                      style={{
                        backgroundColor: `${getWarningColor(s.warning)}25`,
                        color: getWarningColor(s.warning),
                        border: `1px solid ${getWarningColor(s.warning)}`
                      }}
                    >
                      {s.warning}
                    </span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <p className="flex justify-between text-slate-300">
                      <span>District:</span>
                      <strong className="text-slate-100">{s.district}</strong>
                    </p>
                    <p className="flex justify-between text-slate-300">
                      <span>Rainfall:</span>
                      <strong className="text-cyan-300">{s.rainfall.toFixed(1)} mm/hr</strong>
                    </p>
                    <p className="flex justify-between text-slate-300">
                      <span>Status:</span>
                      <strong className="text-slate-200">{s.severity}</strong>
                    </p>
                    <p className="flex justify-between text-slate-300">
                      <span>Affected Villages:</span>
                      <strong className="text-amber-400">{count.toLocaleString()}</strong>
                    </p>
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-700 text-[10px] text-slate-400">
                    Source: Prototype Dataset (Reference Observation)
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Legend */}
      <MapLegend className="absolute bottom-3 left-3 z-[400]" />

      {/* Geospatial Watermark / Coordinate HUD */}
      <div className="absolute bottom-3 right-3 z-[400] hidden sm:flex items-center space-x-2 bg-command-900/90 backdrop-blur-md px-2.5 py-1 border border-command-800 text-[10px] font-mono text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>30.3°N, 79.2°E</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400 font-semibold">WGS84 / EPSG:4326</span>
      </div>
    </div>
  );
};
