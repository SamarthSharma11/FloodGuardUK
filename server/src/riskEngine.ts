import {
  Village,
  WeatherStation,
  VillageRiskData,
  RiskLevel,
  ConfidenceLevel,
  SusceptibilityBreakdown,
  HistoricalExposureBreakdown
} from './types';

function getVillageSeed(village: Village): number {
  const str = `${village.id}-${village.vlcode}-${village.district}-${village.village}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getVillageSusceptibilityBreakdown(village: Village): SusceptibilityBreakdown {
  const seed = getVillageSeed(village);
  const base = village.baseSusceptibility || 50;

  if (village.isHotspot) {
    const vName = village.village.toLowerCase();
    if (vName.includes('joshimath')) {
      return {
        slopeScore: 88,
        elevationScore: 74,
        drainageScore: 92,
        catchmentScore: 84,
        overallScore: Math.round(88 * 0.35 + 92 * 0.30 + 74 * 0.20 + 84 * 0.15) // 86
      };
    } else if (vName.includes('kedarnath')) {
      return {
        slopeScore: 94,
        elevationScore: 90,
        drainageScore: 96,
        catchmentScore: 92,
        overallScore: Math.round(94 * 0.35 + 96 * 0.30 + 90 * 0.20 + 92 * 0.15) // 93
      };
    } else if (vName.includes('dharali') || vName.includes('bhatwari')) {
      return {
        slopeScore: 85,
        elevationScore: 78,
        drainageScore: 90,
        catchmentScore: 81,
        overallScore: Math.round(85 * 0.35 + 90 * 0.30 + 78 * 0.20 + 81 * 0.15) // 84
      };
    } else if (vName.includes('badrinath')) {
      return {
        slopeScore: 87,
        elevationScore: 86,
        drainageScore: 91,
        catchmentScore: 83,
        overallScore: Math.round(87 * 0.35 + 91 * 0.30 + 86 * 0.20 + 83 * 0.15) // 87
      };
    }
  }

  const d1 = (seed % 17) - 8;
  const d2 = ((seed >> 3) % 15) - 7;
  const d3 = ((seed >> 6) % 19) - 9;
  const d4 = ((seed >> 9) % 13) - 6;

  const slopeScore = Math.min(98, Math.max(12, Math.round(base + d1 * 1.1)));
  const drainageScore = Math.min(98, Math.max(10, Math.round(base + d2 * 1.15)));
  const elevationScore = Math.min(96, Math.max(14, Math.round(base - d3 * 0.85)));
  const catchmentScore = Math.min(96, Math.max(14, Math.round(base + d4 * 0.95)));

  const overallScore = Math.min(
    100,
    Math.max(10, Math.round(slopeScore * 0.35 + drainageScore * 0.30 + elevationScore * 0.20 + catchmentScore * 0.15))
  );

  return {
    slopeScore,
    elevationScore,
    drainageScore,
    catchmentScore,
    overallScore
  };
}

export function getVillageHistoricalBreakdown(village: Village): HistoricalExposureBreakdown {
  const seed = getVillageSeed(village);
  const base = village.baseHistory || 35;

  let previousEventsCount = 0;
  if (village.isHotspot || base >= 75) {
    previousEventsCount = 3 + (seed % 2);
  } else if (base >= 52) {
    previousEventsCount = 2 + (seed % 2);
  } else if (base >= 30) {
    previousEventsCount = 1 + (seed % 2);
  } else {
    previousEventsCount = seed % 2;
  }

  let landslideExposure: 'Severe' | 'High' | 'Moderate' | 'Low' = 'Low';
  if (base >= 70) landslideExposure = 'Severe';
  else if (base >= 50) landslideExposure = 'High';
  else if (base >= 30) landslideExposure = 'Moderate';

  const historicalSeverity = Math.min(98, Math.max(15, Math.round(base + ((seed % 13) - 6))));
  const exposureIndex = Math.min(100, Math.max(10, Math.round(base)));

  return {
    previousEventsCount,
    landslideExposure,
    historicalSeverity,
    exposureIndex
  };
}

/**
 * 50% Current Weather / 25% Forecast + Warning / 15% Susceptibility / 10% Historical Exposure
 */
export function calculateVillageRisk(village: Village, station: WeatherStation): VillageRiskData {
  const rain = station.rainfall;
  let weatherScore = 0;
  if (rain <= 2) {
    weatherScore = rain * 5;
  } else if (rain <= 15) {
    weatherScore = 10 + ((rain - 2) / 13) * 35;
  } else if (rain <= 40) {
    weatherScore = 45 + ((rain - 15) / 25) * 40;
  } else {
    weatherScore = Math.min(100, 85 + ((rain - 40) / 20) * 15);
  }

  let warningBase = 10;
  if (station.warning === 'YELLOW') warningBase = 45;
  if (station.warning === 'ORANGE') warningBase = 75;
  if (station.warning === 'RED') warningBase = 95;

  const fcRainScore = Math.min(100, (station.forecastRainfall / 60) * 100);
  const forecastScore = Math.round(warningBase * 0.7 + fcRainScore * 0.3);

  const susceptibilityBreakdown = getVillageSusceptibilityBreakdown(village);
  const susceptibilityScore = susceptibilityBreakdown.overallScore;

  const historicalBreakdown = getVillageHistoricalBreakdown(village);
  const historyScore = historicalBreakdown.exposureIndex;

  const finalRaw =
    (weatherScore * 0.50) +
    (forecastScore * 0.25) +
    (susceptibilityScore * 0.15) +
    (historyScore * 0.10);
  const finalRisk = Math.min(100, Math.max(5, Math.round(finalRaw)));

  let riskLevel: RiskLevel = 'LOW';
  if (finalRisk >= 75) riskLevel = 'SEVERE';
  else if (finalRisk >= 50) riskLevel = 'HIGH';
  else if (finalRisk >= 30) riskLevel = 'MODERATE';

  let confidence: ConfidenceLevel = 'LOW';
  if (village.stationDistKm <= 10) confidence = 'HIGH';
  else if (village.stationDistKm <= 25) confidence = 'MEDIUM';

  let nowcast = 'CLEAR / NORMAL';
  if (rain > 45) nowcast = 'TORRENTIAL DOWNPOUR';
  else if (rain > 20) nowcast = 'HEAVY RAINFALL';
  else if (rain > 7) nowcast = 'MODERATE RAIN';
  else if (rain > 2) nowcast = 'LIGHT RAIN';

  let explanation = '';
  if (riskLevel === 'SEVERE') {
    explanation = `Severe risk for ${village.village} (${finalRisk}/100) driven by torrential precipitation (${rain.toFixed(1)} mm/hr) at ${station.name} (${village.stationDistKm.toFixed(1)} km) under an active ${station.warning} warning, reinforced by high slope steepness (${susceptibilityBreakdown.slopeScore}/100), close river drainage proximity (${susceptibilityBreakdown.drainageScore}/100), and ${historicalBreakdown.previousEventsCount} prior recorded catchment flood events.`;
  } else if (riskLevel === 'HIGH') {
    explanation = `High risk for ${village.village} (${finalRisk}/100) because heavy rainfall (${rain.toFixed(1)} mm/hr) is reported at ${station.name} with an active ${station.warning} warning, compounded by an elevated terrain susceptibility score (${susceptibilityScore}/100) and ${historicalBreakdown.landslideExposure.toLowerCase()} historical landslide exposure.`;
  } else if (riskLevel === 'MODERATE') {
    explanation = `Moderate risk (${finalRisk}/100) for ${village.village} reflects steady monsoonal rainfall (${rain.toFixed(1)} mm/hr) near ${station.name} under ${station.warning} monitoring, coupled with moderate terrain slope (${susceptibilityBreakdown.slopeScore}/100) and localized watershed drainage factors.`;
  } else {
    explanation = `Low risk (${finalRisk}/100) for ${village.village}: current observation at ${station.name} reports safe precipitation levels (${rain.toFixed(1)} mm/hr) with a Green advisory; baseline watershed runoff and drainage remain stable.`;
  }

  return {
    villageId: village.id,
    villageName: village.village,
    district: village.district,
    block: village.block,
    population: village.population,
    finalRisk,
    riskLevel,
    confidence,
    weatherScore: Math.round(weatherScore),
    forecastScore,
    susceptibilityScore,
    historyScore,
    susceptibilityBreakdown,
    historicalBreakdown,
    rainfall: rain,
    nowcast,
    warning: station.warning,
    stationId: station.id,
    stationName: station.name,
    stationDistKm: village.stationDistKm,
    explanation
  };
}
