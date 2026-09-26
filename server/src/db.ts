import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL || 'file:floodguard.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken
});

export async function initDb() {
  console.log(`[Database] Connecting to LibSQL/Turso at: ${url.startsWith('file:') ? 'local SQLite file' : 'remote Turso instance'}`);

  // 1. Alerts table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      villageId TEXT NOT NULL,
      villageName TEXT NOT NULL,
      district TEXT NOT NULL,
      block TEXT NOT NULL,
      population INTEGER NOT NULL,
      riskLevel TEXT NOT NULL,
      riskScore INTEGER NOT NULL,
      rainfall REAL NOT NULL,
      warning TEXT NOT NULL,
      reason TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      approvedBy TEXT,
      approvedAt TEXT,
      acknowledgedAt TEXT
    )
  `);

  // 2. Alert Audit Log table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS alert_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alertId TEXT NOT NULL,
      action TEXT NOT NULL,
      actor TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      details TEXT
    )
  `);

  // 3. Station Readings table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS station_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stationId TEXT NOT NULL,
      rainfall REAL NOT NULL,
      forecastRainfall REAL NOT NULL,
      warning TEXT NOT NULL,
      severity TEXT NOT NULL,
      recordedAt TEXT NOT NULL
    )
  `);

  // 4. Alert Emails table for authority email dispatch and sign-off
  await db.execute(`
    CREATE TABLE IF NOT EXISTS alert_emails (
      id TEXT PRIMARY KEY,
      alertId TEXT NOT NULL,
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      sender TEXT NOT NULL,
      sentAt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'SENT',
      villageName TEXT NOT NULL,
      district TEXT NOT NULL,
      riskLevel TEXT NOT NULL,
      riskScore INTEGER NOT NULL,
      rainfall REAL NOT NULL,
      warning TEXT NOT NULL,
      reason TEXT NOT NULL,
      approvalToken TEXT NOT NULL,
      approvedAt TEXT,
      approvedBy TEXT
    )
  `);

  console.log('[Database] Schema verification & migrations complete.');
}
