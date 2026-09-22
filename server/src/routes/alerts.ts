import { Router, Request, Response } from 'express';
import { db } from '../db';
import { AlertProposal, AlertAuditLogEntry } from '../types';

const router = Router();

/**
 * GET /api/alerts
 * Lists all persisted alert proposals
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await db.execute('SELECT * FROM alerts ORDER BY riskScore DESC');
    const alerts: AlertProposal[] = result.rows.map(r => ({
      id: String(r.id),
      villageId: String(r.villageId),
      villageName: String(r.villageName),
      district: String(r.district),
      block: String(r.block),
      population: Number(r.population),
      riskLevel: r.riskLevel as any,
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
    return res.json(alerts);
  } catch (err: any) {
    console.error('[API] Error fetching alerts:', err);
    return res.status(500).json({ error: 'Failed to fetch alerts', details: err.message });
  }
});

/**
 * POST /api/alerts/:id/approve
 * Persists approval in alerts table and logs an entry in alert_audit_log
 */
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const actor = req.body.approvedBy || 'Disaster Authority (Demo Control)';
    const approvedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const timestamp = new Date().toISOString();

    // 1. Update alert status
    await db.execute({
      sql: `UPDATE alerts SET status = 'APPROVED', approvedBy = ?, approvedAt = ? WHERE id = ?`,
      args: [actor, approvedAt, id]
    });

    // 2. Insert into alert_audit_log
    await db.execute({
      sql: `INSERT INTO alert_audit_log (alertId, action, actor, timestamp, details)
            VALUES (?, ?, ?, ?, ?)`,
      args: [id, 'APPROVE_ALERT', actor, timestamp, `Authorized emergency broadcast for alert ${id}`]
    });

    // 3. Return updated alert
    const r = await db.execute({ sql: 'SELECT * FROM alerts WHERE id = ?', args: [id] });
    if (r.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const row = r.rows[0];
    const alert: AlertProposal = {
      id: String(row.id),
      villageId: String(row.villageId),
      villageName: String(row.villageName),
      district: String(row.district),
      block: String(row.block),
      population: Number(row.population),
      riskLevel: row.riskLevel as any,
      riskScore: Number(row.riskScore),
      rainfall: Number(row.rainfall),
      warning: row.warning as any,
      reason: String(row.reason),
      createdAt: String(row.createdAt),
      status: row.status as any,
      approvedBy: row.approvedBy ? String(row.approvedBy) : undefined,
      approvedAt: row.approvedAt ? String(row.approvedAt) : undefined,
      acknowledgedAt: row.acknowledgedAt ? String(row.acknowledgedAt) : undefined
    };

    return res.json({ success: true, alert });
  } catch (err: any) {
    console.error('[API] Error approving alert:', err);
    return res.status(500).json({ error: 'Failed to approve alert', details: err.message });
  }
});

/**
 * POST /api/alerts/:id/acknowledge
 * Persists acknowledgement in alerts table and logs an entry in alert_audit_log
 */
router.post('/:id/acknowledge', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const actor = req.body.actor || 'District Emergency Operation Center';
    const acknowledgedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const timestamp = new Date().toISOString();

    // 1. Update alert status
    await db.execute({
      sql: `UPDATE alerts SET status = 'ACKNOWLEDGED', acknowledgedAt = ? WHERE id = ?`,
      args: [acknowledgedAt, id]
    });

    // 2. Insert into alert_audit_log
    await db.execute({
      sql: `INSERT INTO alert_audit_log (alertId, action, actor, timestamp, details)
            VALUES (?, ?, ?, ?, ?)`,
      args: [id, 'ACKNOWLEDGE_ALERT', actor, timestamp, `Acknowledged protocol execution for alert ${id}`]
    });

    // 3. Return updated alert
    const r = await db.execute({ sql: 'SELECT * FROM alerts WHERE id = ?', args: [id] });
    if (r.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const row = r.rows[0];
    const alert: AlertProposal = {
      id: String(row.id),
      villageId: String(row.villageId),
      villageName: String(row.villageName),
      district: String(row.district),
      block: String(row.block),
      population: Number(row.population),
      riskLevel: row.riskLevel as any,
      riskScore: Number(row.riskScore),
      rainfall: Number(row.rainfall),
      warning: row.warning as any,
      reason: String(row.reason),
      createdAt: String(row.createdAt),
      status: row.status as any,
      approvedBy: row.approvedBy ? String(row.approvedBy) : undefined,
      approvedAt: row.approvedAt ? String(row.approvedAt) : undefined,
      acknowledgedAt: row.acknowledgedAt ? String(row.acknowledgedAt) : undefined
    };

    return res.json({ success: true, alert });
  } catch (err: any) {
    console.error('[API] Error acknowledging alert:', err);
    return res.status(500).json({ error: 'Failed to acknowledge alert', details: err.message });
  }
});

/**
 * GET /api/alerts/:id/audit
 * Returns audit trail for a specific alert
 */
router.get('/:id/audit', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: 'SELECT * FROM alert_audit_log WHERE alertId = ? ORDER BY id DESC',
      args: [id]
    });
    const logs: AlertAuditLogEntry[] = result.rows.map(r => ({
      id: Number(r.id),
      alertId: String(r.alertId),
      action: String(r.action),
      actor: String(r.actor),
      timestamp: String(r.timestamp),
      details: r.details ? String(r.details) : undefined
    }));
    return res.json(logs);
  } catch (err: any) {
    console.error('[API] Error fetching audit trail for alert:', err);
    return res.status(500).json({ error: 'Failed to fetch audit trail', details: err.message });
  }
});

/**
 * GET /api/alerts/audit/all
 * Returns full system audit log
 */
router.get('/audit/all', async (req: Request, res: Response) => {
  try {
    const result = await db.execute('SELECT * FROM alert_audit_log ORDER BY id DESC LIMIT 100');
    const logs: AlertAuditLogEntry[] = result.rows.map(r => ({
      id: Number(r.id),
      alertId: String(r.alertId),
      action: String(r.action),
      actor: String(r.actor),
      timestamp: String(r.timestamp),
      details: r.details ? String(r.details) : undefined
    }));
    return res.json(logs);
  } catch (err: any) {
    console.error('[API] Error fetching all audit logs:', err);
    return res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
  }
});

export default router;
