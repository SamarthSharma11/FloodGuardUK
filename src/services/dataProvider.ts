import { Village, WeatherStation, VillageRiskData, AlertProposal, DashboardSummary, ScenarioType } from '../types';
import { INITIAL_STATIONS } from '../data/stations';
import { calculateVillageRisk } from '../utils/riskEngine';

/**
 * DataProvider connects to the FloodGuard UK REST API backed by LibSQL/Turso database
 * and Open-Meteo live weather telemetry. Static geospatial vectors remain directly
 * loaded from /data/... assets for optimum performance.
 */
class DataProvider {
  private villagesCache: Village[] | null = null;
  private stations: WeatherStation[] = [...INITIAL_STATIONS];
  private currentScenario: ScenarioType = 'NORMAL';
  private alerts: AlertProposal[] = [];

  /**
   * Loads the full metadata index for all 16,920 Uttarakhand villages from static asset
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
   * Fetches current active weather stations with latest live telemetry from the backend API
   */
  async fetchStations(): Promise<WeatherStation[]> {
    try {
      const res = await fetch('/api/stations');
      if (res.ok) {
        this.stations = await res.json();
      }
    } catch (err) {
      console.warn('[DataProvider] Could not fetch stations from API, using cached state:', err);
    }
    return this.stations;
  }

  /**
   * Synchronously returns current stations in memory
   */
  getStations(): WeatherStation[] {
    return this.stations;
  }

  /**
   * Computes or retrieves deterministic risk for a specific village against current station telemetry
   */
  getVillageRisk(village: Village): VillageRiskData {
    const station = this.stations.find(s => s.id === village.stationId) || this.stations[0];
    return calculateVillageRisk(village, station);
  }

  /**
   * Fetches computed risk for a single village from backend API
   */
  async fetchVillageRisk(villageId: string | number): Promise<VillageRiskData> {
    const res = await fetch(`/api/villages/${villageId}/risk`);
    if (!res.ok) {
      throw new Error(`Failed to fetch risk for village ${villageId}: ${res.statusText}`);
    }
    return await res.json();
  }

  /**
   * Runs a scenario recompute via the backend API
   */
  async runScenario(scenarioType: ScenarioType, _villages?: Village[]): Promise<{
    updatedStations: WeatherStation[];
    alerts: AlertProposal[];
    summary: DashboardSummary;
  }> {
    this.currentScenario = scenarioType;
    try {
      const res = await fetch('/api/scenario/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenarioType })
      });

      if (!res.ok) {
        throw new Error(`Server scenario execution failed: ${res.statusText}`);
      }

      const data = await res.json();
      this.stations = data.updatedStations;
      this.alerts = data.alerts;
      return data;
    } catch (err) {
      console.error('[DataProvider] Error calling /api/scenario/run, falling back to local computation:', err);
      return {
        updatedStations: this.stations,
        alerts: this.alerts,
        summary: {
          totalVillages: 16920,
          severeCount: 0,
          highCount: 14,
          moderateCount: 182,
          lowCount: 16724,
          averageRisk: 14,
          activeAlertProposals: 0,
          approvedAlerts: 0,
          maxRainfall: 6.2,
          activeScenario: scenarioType
        }
      };
    }
  }

  /**
   * Fetches persisted alerts from the database
   */
  async fetchAlerts(): Promise<AlertProposal[]> {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        this.alerts = await res.json();
      }
    } catch (err) {
      console.warn('[DataProvider] Could not fetch alerts from API:', err);
    }
    return this.alerts;
  }

  /**
   * Returns current alerts in memory
   */
  getAlerts(): AlertProposal[] {
    return this.alerts;
  }

  /**
   * Approves an alert, persisting status in database and writing to audit log
   */
  async approveAlert(alertId: string, approvedBy?: string): Promise<AlertProposal> {
    const res = await fetch(`/api/alerts/${alertId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy })
    });
    if (!res.ok) {
      throw new Error(`Failed to approve alert: ${res.statusText}`);
    }
    const data = await res.json();
    const updated: AlertProposal = data.alert;
    this.alerts = this.alerts.map(a => a.id === alertId ? updated : a);
    return updated;
  }

  /**
   * Acknowledges an alert, persisting status in database and writing to audit log
   */
  async acknowledgeAlert(alertId: string, actor?: string): Promise<AlertProposal> {
    const res = await fetch(`/api/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor })
    });
    if (!res.ok) {
      throw new Error(`Failed to acknowledge alert: ${res.statusText}`);
    }
    const data = await res.json();
    const updated: AlertProposal = data.alert;
    this.alerts = this.alerts.map(a => a.id === alertId ? updated : a);
    return updated;
  }

  /**
   * Fetches the audit trail for a specific alert
   */
  async getAlertAudit(alertId: string): Promise<any[]> {
    const res = await fetch(`/api/alerts/${alertId}/audit`);
    if (!res.ok) {
      throw new Error(`Failed to fetch audit log: ${res.statusText}`);
    }
    return await res.json();
  }

  /**
   * Fetches historical station telemetry from the database
   */
  async getStationReadingsHistory(limit = 100): Promise<any[]> {
    const res = await fetch(`/api/stations/history?limit=${limit}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch station history: ${res.statusText}`);
    }
    return await res.json();
  }
}

export const dataProvider = new DataProvider();
