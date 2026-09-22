import cron from 'node-cron';
import { db } from './db';
import { dataStore } from './dataStore';
import { WeatherStation, WarningLevel } from './types';

const WMO_CODE_MAP: Record<number, string> = {
  0: 'CLEAR SKY',
  1: 'MAINLY CLEAR',
  2: 'PARTLY CLOUDY',
  3: 'OVERCAST',
  45: 'FOG',
  48: 'DEPOSITING RIME FOG',
  51: 'LIGHT DRIZZLE',
  53: 'MODERATE DRIZZLE',
  55: 'DENSE DRIZZLE',
  61: 'SLIGHT RAIN',
  62: 'MODERATE RAIN',
  63: 'MODERATE RAIN',
  65: 'HEAVY RAIN',
  80: 'SLIGHT RAIN SHOWERS',
  81: 'MODERATE SHOWERS',
  82: 'VIOLENT RAIN SHOWERS',
  95: 'THUNDERSTORM',
  96: 'THUNDERSTORM W/ HAIL',
  99: 'SEVERE THUNDERSTORM'
};

function deriveWarning(rain: number, forecastRain: number): WarningLevel {
  if (rain > 50 || forecastRain > 70) return 'RED';
  if (rain > 20 || forecastRain > 35) return 'ORANGE';
  if (rain > 7 || forecastRain > 15) return 'YELLOW';
  return 'GREEN';
}

function deriveSeverity(rain: number, code: number): string {
  if (rain > 55) return 'TORRENTIAL CLOUDBURST';
  if (rain > 40) return 'INTENSE DOWNPOUR';
  if (rain > 20) return 'HEAVY RAIN';
  if (rain > 7) return 'MODERATE RAIN';
  if (rain > 2) return 'LIGHT RAIN';
  return WMO_CODE_MAP[code] || 'OVERCAST';
}

export async function pollWeatherNow(): Promise<WeatherStation[]> {
  console.log('[WeatherService] Polling live Open-Meteo telemetry for all 13 Uttarakhand stations...');
  const baseStations = dataStore.getStations();
  const lats = baseStations.map(s => s.lat).join(',');
  const lons = baseStations.map(s => s.lon).join(',');

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=precipitation,rain,weather_code&hourly=precipitation&forecast_days=1`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo responded with status ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const results = Array.isArray(data) ? data : [data];
    const timestamp = new Date().toISOString();
    const displayTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Live Open-Meteo)';

    const updatedStations: WeatherStation[] = baseStations.map((station, idx) => {
      const item = results[idx] || {};
      const current = item.current || {};
      const rain = Number((current.precipitation ?? current.rain ?? 0).toFixed(1));
      const code = current.weather_code ?? 0;

      // Calculate next 3 hours forecast precipitation
      let forecastRain = 0;
      if (item.hourly?.precipitation && Array.isArray(item.hourly.precipitation)) {
        const hourlyList: number[] = item.hourly.precipitation;
        // Take next 3 hours from current hour
        const nowHour = new Date().getUTCHours();
        const slice = hourlyList.slice(nowHour, nowHour + 3);
        forecastRain = Number(slice.reduce((acc, v) => acc + (v || 0), 0).toFixed(1));
      }

      const warning = deriveWarning(rain, forecastRain);
      const severity = deriveSeverity(rain, code);

      return {
        ...station,
        rainfall: rain,
        forecastRainfall: forecastRain,
        warning,
        severity,
        lastUpdated: displayTime
      };
    });

    // Save batch readings into station_readings table
    for (const s of updatedStations) {
      await db.execute({
        sql: `INSERT INTO station_readings (stationId, rainfall, forecastRainfall, warning, severity, recordedAt)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [s.id, s.rainfall, s.forecastRainfall, s.warning, s.severity, timestamp]
      });
    }

    dataStore.updateLiveStations(updatedStations);
    console.log(`[WeatherService] Polled & saved ${updatedStations.length} station readings successfully.`);
    return updatedStations;
  } catch (err) {
    console.error('[WeatherService] Error polling Open-Meteo:', err);
    return baseStations;
  }
}

export function startWeatherPollingCron() {
  // Poll Open-Meteo every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    await pollWeatherNow();
  });
  console.log('[WeatherService] 15-minute Open-Meteo polling cron scheduled.');
}
