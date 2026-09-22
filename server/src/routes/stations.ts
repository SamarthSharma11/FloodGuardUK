import { Router, Request, Response } from 'express';
import { dataStore } from '../dataStore';
import { db } from '../db';

const router = Router();

/**
 * GET /api/stations
 * Returns current active weather stations with latest telemetry and warnings
 */
router.get('/', (req: Request, res: Response) => {
  const stations = dataStore.getStations();
  res.json(stations);
});

/**
 * GET /api/stations/history
 * Returns timestamped readings from the station_readings table for analytics
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const stationId = req.query.stationId ? String(req.query.stationId) : null;

    let query = 'SELECT * FROM station_readings';
    const args: any[] = [];

    if (stationId) {
      query += ' WHERE stationId = ?';
      args.push(stationId);
    }

    query += ' ORDER BY id DESC LIMIT ?';
    args.push(limit);

    const result = await db.execute({ sql: query, args });
    res.json(result.rows);
  } catch (err: any) {
    console.error('[API] Error fetching station history:', err);
    res.status(500).json({ error: 'Failed to fetch station history', details: err.message });
  }
});

export default router;
