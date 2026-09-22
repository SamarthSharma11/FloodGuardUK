import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Village, WeatherStation, ScenarioType } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const INITIAL_STATIONS: WeatherStation[] = [
  {
    id: 'joshimath',
    name: 'Joshimath AWS',
    district: 'Chamoli',
    lat: 30.556,
    lon: 79.566,
    rainfall: 4.2,
    warning: 'GREEN',
    severity: 'LIGHT SHOWERS',
    forecastRainfall: 6.0,
    lastUpdated: '10 mins ago (Prototype Obs)'
  },
  {
    id: 'rudraprayag',
    name: 'Rudraprayag AWS',
    district: 'Rudraprayag',
    lat: 30.285,
    lon: 78.980,
    rainfall: 3.5,
    warning: 'GREEN',
    severity: 'OVERCAST',
    forecastRainfall: 5.0,
    lastUpdated: '12 mins ago (Prototype Obs)'
  },
  {
    id: 'uttarkashi',
    name: 'Uttarkashi AWS',
    district: 'Uttarkashi',
    lat: 30.727,
    lon: 78.443,
    rainfall: 5.0,
    warning: 'GREEN',
    severity: 'LIGHT RAIN',
    forecastRainfall: 8.0,
    lastUpdated: '5 mins ago (Prototype Obs)'
  },
  {
    id: 'dehradun',
    name: 'Dehradun AWS',
    district: 'Dehradun',
    lat: 30.316,
    lon: 78.032,
    rainfall: 1.2,
    warning: 'GREEN',
    severity: 'PARTLY CLOUDY',
    forecastRainfall: 2.0,
    lastUpdated: '8 mins ago (Prototype Obs)'
  },
  {
    id: 'pauri',
    name: 'Pauri AWS',
    district: 'Pauri Garhwal',
    lat: 30.149,
    lon: 78.780,
    rainfall: 2.1,
    warning: 'GREEN',
    severity: 'CLEAR',
    forecastRainfall: 3.0,
    lastUpdated: '15 mins ago (Prototype Obs)'
  },
  {
    id: 'tehri',
    name: 'New Tehri AWS',
    district: 'Tehri Garhwal',
    lat: 30.392,
    lon: 78.480,
    rainfall: 3.8,
    warning: 'GREEN',
    severity: 'LIGHT RAIN',
    forecastRainfall: 4.5,
    lastUpdated: '9 mins ago (Prototype Obs)'
  },
  {
    id: 'nainital',
    name: 'Nainital AWS',
    district: 'Nainital',
    lat: 29.392,
    lon: 79.454,
    rainfall: 4.0,
    warning: 'GREEN',
    severity: 'MISTY / DRIZZLE',
    forecastRainfall: 5.0,
    lastUpdated: '14 mins ago (Prototype Obs)'
  },
  {
    id: 'pithoragarh',
    name: 'Pithoragarh AWS',
    district: 'Pithoragarh',
    lat: 29.583,
    lon: 80.218,
    rainfall: 6.2,
    warning: 'GREEN',
    severity: 'MODERATE BREEZE',
    forecastRainfall: 7.0,
    lastUpdated: '7 mins ago (Prototype Obs)'
  },
  {
    id: 'bageshwar',
    name: 'Bageshwar AWS',
    district: 'Bageshwar',
    lat: 29.839,
    lon: 79.771,
    rainfall: 2.8,
    warning: 'GREEN',
    severity: 'OVERCAST',
    forecastRainfall: 4.0,
    lastUpdated: '11 mins ago (Prototype Obs)'
  },
  {
    id: 'almora',
    name: 'Almora AWS',
    district: 'Almora',
    lat: 29.598,
    lon: 79.659,
    rainfall: 1.8,
    warning: 'GREEN',
    severity: 'CLEAR INTERVALS',
    forecastRainfall: 2.5,
    lastUpdated: '16 mins ago (Prototype Obs)'
  },
  {
    id: 'haridwar',
    name: 'Haridwar AWS',
    district: 'Haridwar',
    lat: 29.945,
    lon: 78.164,
    rainfall: 0.5,
    warning: 'GREEN',
    severity: 'FAIR',
    forecastRainfall: 1.0,
    lastUpdated: '20 mins ago (Prototype Obs)'
  },
  {
    id: 'champawat',
    name: 'Champawat AWS',
    district: 'Champawat',
    lat: 29.336,
    lon: 80.093,
    rainfall: 3.1,
    warning: 'GREEN',
    severity: 'LIGHT SHOWER',
    forecastRainfall: 4.0,
    lastUpdated: '13 mins ago (Prototype Obs)'
  },
  {
    id: 'usnagar',
    name: 'Rudrapur AWS',
    district: 'Udham Singh Nagar',
    lat: 28.980,
    lon: 79.400,
    rainfall: 0.2,
    warning: 'GREEN',
    severity: 'CALM',
    forecastRainfall: 0.5,
    lastUpdated: '18 mins ago (Prototype Obs)'
  }
];

class DataStore {
  private villages: Village[] = [];
  private villageMap: Map<string, Village> = new Map();
  private stations: WeatherStation[] = JSON.parse(JSON.stringify(INITIAL_STATIONS));
  private liveBaselineStations: WeatherStation[] = JSON.parse(JSON.stringify(INITIAL_STATIONS));
  private currentScenario: ScenarioType = 'NORMAL';

  async init() {
    try {
      const publicPath = path.resolve(__dirname, '../../public/data/villages_index.json');
      if (fs.existsSync(publicPath)) {
        const raw = fs.readFileSync(publicPath, 'utf-8');
        this.villages = JSON.parse(raw);
        for (const v of this.villages) {
          this.villageMap.set(String(v.id), v);
          if (v.vlcode) this.villageMap.set(String(v.vlcode), v);
        }
        console.log(`[DataStore] Loaded ${this.villages.length} villages into index.`);
      } else {
        console.warn(`[DataStore] villages_index.json not found at: ${publicPath}`);
      }
    } catch (err) {
      console.error('[DataStore] Error loading villages:', err);
    }
  }

  getVillages(): Village[] {
    return this.villages;
  }

  getVillageById(id: string | number): Village | undefined {
    return this.villageMap.get(String(id));
  }

  getStations(): WeatherStation[] {
    return this.stations;
  }

  setStations(newStations: WeatherStation[]) {
    this.stations = newStations;
  }

  getLiveBaselineStations(): WeatherStation[] {
    return this.liveBaselineStations;
  }

  updateLiveStations(updated: WeatherStation[]) {
    this.liveBaselineStations = updated;
    if (this.currentScenario === 'NORMAL') {
      this.stations = updated;
    }
  }

  getCurrentScenario(): ScenarioType {
    return this.currentScenario;
  }

  setCurrentScenario(scenario: ScenarioType) {
    this.currentScenario = scenario;
  }
}

export const dataStore = new DataStore();
