import { Village, WeatherStation, VillageRiskData, AlertProposal, DashboardSummary, ScenarioType } from '../types';
import { INITIAL_STATIONS } from '../data/stations';
import { SCENARIOS } from '../data/scenarios';
import { calculateVillageRisk } from '../utils/riskEngine';

/**
 * DataProvider provides clean abstraction for all local and simulated data.
 * In a future production environment, these functions can swap internal logic
 * for authenticated REST API calls without touching the UI layer.
 */
class DataProvider {
  private villagesCache: Village[] | null = null;
  private stations: WeatherStation[] = [...INITIAL_STATIONS];
  private currentScenario: ScenarioType = 'NORMAL';
  private alerts: AlertProposal[] = [];

  /**
   * Loads the full metadata index for all 16,920 Uttarakhand villages
   */
  async getVillages(): Promise<Village[]> {
    if (this.villagesCache) {
      return this.villagesCache;
    }
    const res = await fetch('/data/villages_index.json');
    if (!res.ok) {
      throw new Error(`Failed to load villages index: ${res.statusText}`);
    }
    this.villagesCache = await res.json();
    return this.villagesCache!;
  }

  /**
   * Fetches district GeoJSON containing high-resolution village polygons
   */
  async getDistrictGeoJSON(dtcode: string): Promise<any> {
    const filenameMap: Record<string, string> = {
      '045': '045_almora.json',
      '046': '046_bageshwar.json',
      '047': '047_chamoli.json',
      '048': '048_champawat.json',
      '049': '049_dehradun.json',
      '050': '050_haridwar.json',
      '051': '051_nainital.json',
      '052': '052_pauri_garhwal.json',
      '053': '053_pithoragarh.json',
      '054': '054_rudraprayag.json',
      '055': '055_tehri_garhwal.json',
      '056': '056_udham_singh_nagar.json',
      '057': '057_uttarkashi.json'
    };
    const fn = filenameMap[dtcode] || '047_chamoli.json';
    const res = await fetch(`/data/districts/${fn}`);
    if (!res.ok) {
      throw new Error(`Failed to load district GeoJSON: ${res.statusText}`);
    }
    return await res.json();
  }

  /**
   * Loads dissolved district boundary vectors for statewide overview
   */
  async getDistrictBoundaries(): Promise<any> {
    const res = await fetch('/data/district_boundaries.json');
    if (!res.ok) {
      throw new Error(`Failed to load district boundaries: ${res.statusText}`);
    }
    return await res.json();
  }

  /**
   * Returns current active weather stations with simulated telemetry
   */
  getStations(): WeatherStation[] {
    return this.stations;
  }

  /**
   * Computes or retrieves deterministic risk for a specific village
   */
  getVillageRisk(village: Village): VillageRiskData {
    const station = this.stations.find(s => s.id === village.stationId) || this.stations[0];
    return calculateVillageRisk(village, station);
  }

  /**
   * Runs a scenario, updates all stations, recalculates risks and alerts
   */
  runScenario(scenarioType: ScenarioType, villages: Village[]): {
    updatedStations: WeatherStation[];
    alerts: AlertProposal[];
    summary: DashboardSummary;
  } {
    this.currentScenario = scenarioType;
    const def = SCENARIOS[scenarioType];

    // Update stations
    this.stations = INITIAL_STATIONS.map(s => {
      const override = def.stationOverrides[s.id];
      if (override) {
        return {
          ...s,
          rainfall: override.rainfall,
          forecastRainfall: override.forecastRainfall,
          warning: override.warning,
          severity: override.severity,
          lastUpdated: 'Just now (Reference Obs)'
        };
      }
      return s;
    });

    // Compute summary & alert proposals
    let severeCount = 0;
    let highCount = 0;
    let moderateCount = 0;
    let lowCount = 0;
    let riskSum = 0;
    const newAlerts: AlertProposal[] = [];

    // Evaluate sample/full
    for (const v of villages) {
      const station = this.stations.find(s => s.id === v.stationId) || this.stations[0];
      const risk = calculateVillageRisk(v, station);
      riskSum += risk.finalRisk;

      if (risk.riskLevel === 'SEVERE') {
        severeCount++;
        // Propose alert if not already present
        if (newAlerts.length < 50) {
          newAlerts.push({
            id: `alert-${v.id}-${Date.now()}`,
            villageId: v.id,
            villageName: v.village,
            district: v.district,
            block: v.block,
            population: v.population,
            riskLevel: 'SEVERE',
            riskScore: risk.finalRisk,
            rainfall: risk.rainfall,
            warning: risk.warning,
            reason: risk.explanation,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'PENDING'
          });
        }
      } else if (risk.riskLevel === 'HIGH') {
        highCount++;
        if (newAlerts.length < 50 && (v.isHotspot || newAlerts.length < 25)) {
          newAlerts.push({
            id: `alert-${v.id}-${Date.now()}`,
            villageId: v.id,
            villageName: v.village,
            district: v.district,
            block: v.block,
            population: v.population,
            riskLevel: 'HIGH',
            riskScore: risk.finalRisk,
            rainfall: risk.rainfall,
            warning: risk.warning,
            reason: risk.explanation,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'PENDING'
          });
        }
      } else if (risk.riskLevel === 'MODERATE') {
        moderateCount++;
      } else {
        lowCount++;
      }
    }

    const total = villages.length || 16920;
    const avgRisk = Math.round(riskSum / total);
    const maxRain = Math.max(...this.stations.map(s => s.rainfall));

    this.alerts = newAlerts;

    const summary: DashboardSummary = {
      totalVillages: total,
      severeCount,
      highCount,
      moderateCount,
      lowCount,
      averageRisk: avgRisk,
      activeAlertProposals: newAlerts.filter(a => a.status === 'PENDING').length,
      approvedAlerts: newAlerts.filter(a => a.status === 'APPROVED').length,
      maxRainfall: maxRain,
      activeScenario: scenarioType
    };

    return {
      updatedStations: this.stations,
      alerts: this.alerts,
      summary
    };
  }

  getAlerts(): AlertProposal[] {
    return this.alerts;
  }
}

export const dataProvider = new DataProvider();
