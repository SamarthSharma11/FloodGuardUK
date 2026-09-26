export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
export type WarningLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ScenarioType = 'NORMAL' | 'HEAVY_RAIN' | 'FLASH_FLOOD';
export type AlertStatus = 'PENDING' | 'APPROVED' | 'ACKNOWLEDGED';

export interface Village {
  id: number | string;
  village: string;
  vlcode: string;
  district: string;
  dtcode: string;
  block: string;
  bkcode: string;
  subdistric: string;
  sdcode?: string;
  gram_panchayat_name: string;
  gram_panchayat_code?: string;
  population: number;
  households: number;
  centroid: [number, number]; // [lat, lon]
  bounds: [number, number, number, number]; // [minLat, minLon, maxLat, maxLon]
  stationId: string;
  stationDistKm: number;
  baseSusceptibility: number;
  baseHistory: number;
  isHotspot?: boolean;
}

export interface WeatherStation {
  id: string;
  name: string;
  district: string;
  lat: number;
  lon: number;
  rainfall: number; // mm/hr
  warning: WarningLevel;
  severity: string;
  forecastRainfall: number; // mm in next 3hr
  lastUpdated: string;
}

export interface SusceptibilityBreakdown {
  slopeScore: number;       // Slope / Terrain Steepness (0 - 100)
  elevationScore: number;   // Elevation Factor (0 - 100)
  drainageScore: number;    // River / Drainage Proximity (0 - 100)
  catchmentScore: number;   // Catchment / Terrain Characteristics (0 - 100)
  overallScore: number;     // Combined 15% Susceptibility factor (0 - 100)
}

export interface HistoricalExposureBreakdown {
  previousEventsCount: number;                        // Recorded local flash flood/cloudburst events
  landslideExposure: 'Severe' | 'High' | 'Moderate' | 'Low'; // Categorical terrain hazard exposure
  historicalSeverity: number;                         // Event magnitude/debris index (0 - 100)
  exposureIndex: number;                              // Combined 10% Historical Exposure factor (0 - 100)
}

export interface VillageRiskData {
  villageId: string | number;
  villageName: string;
  district: string;
  block: string;
  population: number;
  finalRisk: number; // 0 - 100
  riskLevel: RiskLevel;
  confidence: ConfidenceLevel;
  weatherScore: number;
  forecastScore: number;
  susceptibilityScore: number;
  historyScore: number;
  susceptibilityBreakdown: SusceptibilityBreakdown;
  historicalBreakdown: HistoricalExposureBreakdown;
  rainfall: number;
  nowcast: string;
  warning: WarningLevel;
  stationId: string;
  stationName: string;
  stationDistKm: number;
  explanation: string;
}

export interface AlertProposal {
  id: string;
  villageId: string | number;
  villageName: string;
  district: string;
  block: string;
  population: number;
  riskLevel: 'HIGH' | 'SEVERE';
  riskScore: number;
  rainfall: number;
  warning: WarningLevel;
  reason: string;
  createdAt: string;
  status: AlertStatus;
  approvedBy?: string;
  approvedAt?: string;
  acknowledgedAt?: string;
}

export interface AlertEmail {
  id: string;
  alertId: string;
  recipient: string;
  subject: string;
  sender: string;
  sentAt: string;
  status: 'SENT' | 'APPROVED' | 'ARCHIVED';
  villageName: string;
  district: string;
  riskLevel: 'HIGH' | 'SEVERE';
  riskScore: number;
  rainfall: number;
  warning: WarningLevel;
  reason: string;
  approvalToken: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface DashboardSummary {
  totalVillages: number;
  severeCount: number;
  highCount: number;
  moderateCount: number;
  lowCount: number;
  averageRisk: number;
  activeAlertProposals: number;
  approvedAlerts: number;
  maxRainfall: number;
  activeScenario: ScenarioType;
}

export interface DistrictMeta {
  dtcode: string;
  name: string;
  slug: string;
  filename: string;
  count: number;
  hillyTier: number;
}
