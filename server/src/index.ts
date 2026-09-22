import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db';
import { dataStore } from './dataStore';
import { pollWeatherNow, startWeatherPollingCron } from './weatherService';

import stationsRouter from './routes/stations';
import villagesRouter from './routes/villages';
import scenariosRouter from './routes/scenarios';
import alertsRouter from './routes/alerts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Strict origin validation for Vercel deployment & local development
const rawAllowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : [])
]
  .filter(Boolean)
  .map(url => url!.trim().replace(/\/$/, ''));

const localOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
const allowedOrigins = Array.from(new Set([...rawAllowedOrigins, ...localOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server, Render health checks)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');

    // Check exact matches or Vercel preview deployments (*.vercel.app)
    const isAllowed = allowedOrigins.includes(normalizedOrigin) ||
      (normalizedOrigin.endsWith('.vercel.app') && !process.env.STRICT_SINGLE_ORIGIN);

    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
      return callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'FloodGuard UK Intelligence API',
    uptime: process.uptime(),
    scenario: dataStore.getCurrentScenario(),
    timestamp: new Date().toISOString()
  });
});

// Mount modular REST routes
app.use('/api/stations', stationsRouter);
app.use('/api/villages', villagesRouter);
app.use('/api/scenario', scenariosRouter);
app.use('/api/alerts', alertsRouter);

async function startServer() {
  try {
    console.log('====================================================');
    console.log(' Starting FloodGuard UK Intelligence Engine Server ');
    console.log('====================================================');

    // 1. Initialize SQLite/Turso database tables
    await initDb();

    // 2. Load static village index into in-memory store
    await dataStore.init();

    // 3. Initial baseline weather poll from Open-Meteo
    await pollWeatherNow();

    // 4. Start 15-minute background weather cron
    startWeatherPollingCron();

    // 5. Start listening
    app.listen(PORT, () => {
      console.log(`[Server] FloodGuard UK API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
