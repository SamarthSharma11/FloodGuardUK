import { ScenarioType, WarningLevel } from '../types';

export interface StationScenarioConfig {
  rainfall: number;
  forecastRainfall: number;
  warning: WarningLevel;
  severity: string;
}

export interface ScenarioDefinition {
  type: ScenarioType;
  title: string;
  badge: string;
  description: string;
  bannerMessage: string;
  stationOverrides: Record<string, StationScenarioConfig>;
}

export const SCENARIOS: Record<ScenarioType, ScenarioDefinition> = {
  NORMAL: {
    type: 'NORMAL',
    title: 'Normal Monsoon Baseline',
    badge: 'NORMAL',
    description: 'Baseline rainfall and seasonal green warning conditions across Uttarakhand catchment valleys.',
    bannerMessage: 'System running baseline conditions: normal rainfall levels, low river swell, no active alerts.',
    stationOverrides: {
      joshimath: { rainfall: 4.2, forecastRainfall: 6.0, warning: 'GREEN', severity: 'LIGHT SHOWERS' },
      rudraprayag: { rainfall: 3.5, forecastRainfall: 5.0, warning: 'GREEN', severity: 'OVERCAST' },
      uttarkashi: { rainfall: 5.0, forecastRainfall: 8.0, warning: 'GREEN', severity: 'LIGHT RAIN' },
      dehradun: { rainfall: 1.2, forecastRainfall: 2.0, warning: 'GREEN', severity: 'PARTLY CLOUDY' },
      pauri: { rainfall: 2.1, forecastRainfall: 3.0, warning: 'GREEN', severity: 'CLEAR' },
      tehri: { rainfall: 3.8, forecastRainfall: 4.5, warning: 'GREEN', severity: 'LIGHT RAIN' },
      nainital: { rainfall: 4.0, forecastRainfall: 5.0, warning: 'GREEN', severity: 'MISTY / DRIZZLE' },
      pithoragarh: { rainfall: 6.2, forecastRainfall: 7.0, warning: 'GREEN', severity: 'MODERATE BREEZE' },
      bageshwar: { rainfall: 2.8, forecastRainfall: 4.0, warning: 'GREEN', severity: 'OVERCAST' },
      almora: { rainfall: 1.8, forecastRainfall: 2.5, warning: 'GREEN', severity: 'CLEAR INTERVALS' },
      haridwar: { rainfall: 0.5, forecastRainfall: 1.0, warning: 'GREEN', severity: 'FAIR' },
      champawat: { rainfall: 3.1, forecastRainfall: 4.0, warning: 'GREEN', severity: 'LIGHT SHOWER' },
      usnagar: { rainfall: 0.2, forecastRainfall: 0.5, warning: 'GREEN', severity: 'CALM' }
    }
  },

  HEAVY_RAIN: {
    type: 'HEAVY_RAIN',
    title: 'Heavy Rain Influx',
    badge: 'HEAVY RAIN',
    description: 'Simulates intense localized rain spells in Chamoli, Rudraprayag, and Uttarkashi upper basins.',
    bannerMessage: 'Heavy rain simulation active: 28-36 mm/hr precipitation reported in Alaknanda & Mandakini valleys with ORANGE alert status.',
    stationOverrides: {
      joshimath: { rainfall: 28.4, forecastRainfall: 42.0, warning: 'ORANGE', severity: 'HEAVY RAIN' },
      rudraprayag: { rainfall: 31.2, forecastRainfall: 46.0, warning: 'ORANGE', severity: 'HEAVY RAINFALL' },
      uttarkashi: { rainfall: 26.5, forecastRainfall: 38.0, warning: 'ORANGE', severity: 'HEAVY RAIN' },
      tehri: { rainfall: 18.0, forecastRainfall: 24.0, warning: 'YELLOW', severity: 'MODERATE RAIN' },
      pithoragarh: { rainfall: 21.0, forecastRainfall: 30.0, warning: 'YELLOW', severity: 'PERSISTENT RAIN' },
      bageshwar: { rainfall: 16.5, forecastRainfall: 22.0, warning: 'YELLOW', severity: 'MODERATE RAIN' },
      pauri: { rainfall: 12.0, forecastRainfall: 16.0, warning: 'YELLOW', severity: 'INTERMITTENT RAIN' },
      dehradun: { rainfall: 8.5, forecastRainfall: 12.0, warning: 'GREEN', severity: 'LIGHT-MODERATE RAIN' },
      nainital: { rainfall: 14.0, forecastRainfall: 18.0, warning: 'YELLOW', severity: 'MISTY RAIN' },
      almora: { rainfall: 9.0, forecastRainfall: 11.0, warning: 'GREEN', severity: 'OVERCAST' },
      haridwar: { rainfall: 3.5, forecastRainfall: 5.0, warning: 'GREEN', severity: 'LIGHT DRIZZLE' },
      champawat: { rainfall: 11.5, forecastRainfall: 15.0, warning: 'GREEN', severity: 'SHOWERS' },
      usnagar: { rainfall: 2.0, forecastRainfall: 3.0, warning: 'GREEN', severity: 'OVERCAST' }
    }
  },

  FLASH_FLOOD: {
    type: 'FLASH_FLOOD',
    title: 'Flash Flood Threat (Severe)',
    badge: 'FLASH FLOOD THREAT',
    description: 'Simulates cloudburst / torrential precipitation (>55 mm/hr) triggering severe debris-flow risks in upper valleys.',
    bannerMessage: 'CRITICAL ALERT: Cloudburst threat simulated! Extreme rainfall (>58 mm/hr) at Joshimath & Rudraprayag AWS with active RED warnings. Emergency authority proposals generated.',
    stationOverrides: {
      joshimath: { rainfall: 64.8, forecastRainfall: 85.0, warning: 'RED', severity: 'TORRENTIAL CLOUDBURST' },
      rudraprayag: { rainfall: 58.6, forecastRainfall: 78.0, warning: 'RED', severity: 'EXTREME CLOUDBURST' },
      uttarkashi: { rainfall: 52.4, forecastRainfall: 70.0, warning: 'RED', severity: 'VERY HEAVY RAIN' },
      pithoragarh: { rainfall: 42.0, forecastRainfall: 60.0, warning: 'ORANGE', severity: 'INTENSE DOWNPOUR' },
      tehri: { rainfall: 35.5, forecastRainfall: 48.0, warning: 'ORANGE', severity: 'HEAVY RAIN' },
      bageshwar: { rainfall: 33.0, forecastRainfall: 45.0, warning: 'ORANGE', severity: 'HEAVY RAINFALL' },
      pauri: { rainfall: 24.5, forecastRainfall: 32.0, warning: 'YELLOW', severity: 'MODERATE RAIN' },
      nainital: { rainfall: 28.0, forecastRainfall: 36.0, warning: 'ORANGE', severity: 'HEAVY DOWNPOUR' },
      dehradun: { rainfall: 16.5, forecastRainfall: 22.0, warning: 'YELLOW', severity: 'SHOWERS' },
      almora: { rainfall: 19.0, forecastRainfall: 25.0, warning: 'YELLOW', severity: 'STEADY RAIN' },
      champawat: { rainfall: 22.0, forecastRainfall: 29.0, warning: 'YELLOW', severity: 'RAIN SQUALLS' },
      haridwar: { rainfall: 8.0, forecastRainfall: 12.0, warning: 'GREEN', severity: 'LIGHT RAIN' },
      usnagar: { rainfall: 5.5, forecastRainfall: 8.0, warning: 'GREEN', severity: 'OVERCAST' }
    }
  }
};
