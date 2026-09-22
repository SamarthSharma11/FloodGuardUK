import { Router, Request, Response } from 'express';
import { dataStore } from '../dataStore';
import { calculateVillageRisk } from '../riskEngine';

const router = Router();

/**
 * GET /api/villages/:id/risk
 * Computes deterministic risk for a specific village based on current station telemetry
 */
router.get('/:id/risk', (req: Request, res: Response) => {
  const { id } = req.params;
  const village = dataStore.getVillageById(id);

  if (!village) {
    return res.status(404).json({ error: `Village with ID or code '${id}' not found` });
  }

  const stations = dataStore.getStations();
  const station = stations.find(s => s.id === village.stationId) || stations[0];
  const risk = calculateVillageRisk(village, station);

  return res.json(risk);
});

export default router;
