import { Router, Request, Response } from 'express';
import { dataStore } from '../dataStore';
import { db } from '../db';
import { calculateVillageRisk } from '../riskEngine';
import { ScenarioType, WeatherStation, AlertProposal, DashboardSummary } from '../types';

const router = Router();

const SCENARIO_OVERRIDES: Record<ScenarioType, Record<string, Partial<WeatherStation>>> = {
  NORMAL: {},
  HEAVY_RAIN: {
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
  },
  FLASH_FLOOD: {
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
};

/**
 * POST /api/scenario/run
 * Recomputes all stations and village risks for a given scenario, saves alerts into database
 */
router.post('/run', async (req: Request, res: Response) => {
  try {
    const scenario: ScenarioType = req.body.scenario || 'NORMAL';
    dataStore.setCurrentScenario(scenario);

    // 1. Determine stations
    let currentStations: WeatherStation[];
    if (scenario === 'NORMAL') {
      currentStations = dataStore.getLiveBaselineStations();
    } else {
      const overrides = SCENARIO_OVERRIDES[scenario] || {};
      currentStations = dataStore.getLiveBaselineStations().map(s => {
        const ov = overrides[s.id];
        if (ov) {
          return {
            ...s,
            ...ov,
            lastUpdated: 'Just now (Scenario Active)'
          };
        }
        return s;
      });
    }
    dataStore.setStations(currentStations);

    // Save timestamped reading in station_readings
    const timestamp = new Date().toISOString();
    for (const s of currentStations) {
      await db.execute({
        sql: `INSERT INTO station_readings (stationId, rainfall, forecastRainfall, warning, severity, recordedAt)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [s.id, s.rainfall, s.forecastRainfall, s.warning, s.severity, timestamp]
      });
    }

    // 2. Evaluate village risks
    const villages = dataStore.getVillages();
    let severeCount = 0;
    let highCount = 0;
    let moderateCount = 0;
    let lowCount = 0;
    let riskSum = 0;

    const generatedAlerts: AlertProposal[] = [];

    for (const v of villages) {
      const station = currentStations.find(s => s.id === v.stationId) || currentStations[0];
      const risk = calculateVillageRisk(v, station);
      riskSum += risk.finalRisk;

      if (risk.riskLevel === 'SEVERE') {
        severeCount++;
        if (generatedAlerts.length < 50) {
          generatedAlerts.push({
            id: `alert-${v.id}-${scenario.toLowerCase()}`,
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
        if (generatedAlerts.length < 50 && (v.isHotspot || generatedAlerts.length < 25)) {
          generatedAlerts.push({
            id: `alert-${v.id}-${scenario.toLowerCase()}`,
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

    // 3. Upsert generated alerts into DB
    for (const alert of generatedAlerts) {
      // Check if alert exists
      const existing = await db.execute({
        sql: 'SELECT status, approvedBy, approvedAt, acknowledgedAt FROM alerts WHERE id = ?',
        args: [alert.id]
      });

      if (existing.rows.length === 0) {
        await db.execute({
          sql: `INSERT INTO alerts (id, villageId, villageName, district, block, population, riskLevel, riskScore, rainfall, warning, reason, createdAt, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            alert.id,
            String(alert.villageId),
            alert.villageName,
            alert.district,
            alert.block,
            alert.population,
            alert.riskLevel,
            alert.riskScore,
            alert.rainfall,
            alert.warning,
            alert.reason,
            alert.createdAt,
            alert.status
          ]
        });
      }
    }

    // 3b. Auto-dispatch email proposals for top severe alerts if in active emergency scenario
    if (scenario !== 'NORMAL' && generatedAlerts.length > 0) {
      const topAlertsToEmail = generatedAlerts.slice(0, 3);
      for (const alert of topAlertsToEmail) {
        const existingEmail = await db.execute({
          sql: 'SELECT id FROM alert_emails WHERE alertId = ?',
          args: [alert.id]
        });
        if (existingEmail.rows.length === 0) {
          const emailId = `email-${alert.id}-${Date.now().toString(36)}`;
          const approvalToken = `tok_${Math.random().toString(36).substring(2, 10)}_${alert.id}`;
          const sentAt = new Date().toISOString();
          const recipient = 'seoc-duty-magistrate@uk.gov.in';
          const subject = `[URGENT SEOC DISPATCH] Flash Flood Risk Authorization Required: ${alert.villageName}, ${alert.district} (Risk ${alert.riskScore}/100)`;
          const sender = 'State Emergency Operation Centre (alerts@sdma.uk.gov.in)';

          await db.execute({
            sql: `INSERT INTO alert_emails (id, alertId, recipient, subject, sender, sentAt, status, villageName, district, riskLevel, riskScore, rainfall, warning, reason, approvalToken)
                  VALUES (?, ?, ?, ?, ?, ?, 'SENT', ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              emailId,
              alert.id,
              recipient,
              subject,
              sender,
              sentAt,
              String(alert.villageName),
              String(alert.district),
              String(alert.riskLevel),
              Number(alert.riskScore),
              Number(alert.rainfall),
              String(alert.warning),
              String(alert.reason),
              approvalToken
            ]
          });
        }
      }
    }

    // Fetch all alerts from DB to maintain persistent approved/acknowledged states
    const dbAlertsResult = await db.execute('SELECT * FROM alerts ORDER BY riskScore DESC');
    const allDbAlerts: AlertProposal[] = dbAlertsResult.rows.map(r => ({
      id: String(r.id),
      villageId: String(r.villageId),
      villageName: String(r.villageName),
      district: String(r.district),
      block: String(r.block),
      population: Number(r.population),
      riskLevel: r.riskLevel as 'HIGH' | 'SEVERE',
      riskScore: Number(r.riskScore),
      rainfall: Number(r.rainfall),
      warning: r.warning as any,
      reason: String(r.reason),
      createdAt: String(r.createdAt),
      status: r.status as any,
      approvedBy: r.approvedBy ? String(r.approvedBy) : undefined,
      approvedAt: r.approvedAt ? String(r.approvedAt) : undefined,
      acknowledgedAt: r.acknowledgedAt ? String(r.acknowledgedAt) : undefined
    }));

    const total = villages.length || 16920;
    const avgRisk = Math.round(riskSum / total);
    const maxRain = Math.max(...currentStations.map(s => s.rainfall));

    const summary: DashboardSummary = {
      totalVillages: total,
      severeCount,
      highCount,
      moderateCount,
      lowCount,
      averageRisk: avgRisk,
      activeAlertProposals: allDbAlerts.filter(a => a.status === 'PENDING').length,
      approvedAlerts: allDbAlerts.filter(a => a.status === 'APPROVED').length,
      maxRainfall: maxRain,
      activeScenario: scenario
    };

    return res.json({
      updatedStations: currentStations,
      alerts: allDbAlerts,
      summary
    });
  } catch (err: any) {
    console.error('[API] Error running scenario:', err);
    return res.status(500).json({ error: 'Failed to run scenario', details: err.message });
  }
});

export default router;
