# FLOODGUARD UK — Flash Flood Intelligence & Early Risk Assessment System
### Smart India Hackathon (SIH) Prototype | Focus: Uttarakhand, India

> **STATUS:** Powered by an integrated **Node.js + Express + TypeScript** backend, **Turso (LibSQL) SQLite** persistent database, and live **Open-Meteo** catchment weather telemetry across 13 Uttarakhand Automatic Weather Stations (AWS).

---

## 1. Project Overview

**FLOODGUARD UK** is an early warning command center and flash flood intelligence system designed specifically for the rugged, high-gradient terrain of Uttarakhand, India.

### Key Highlights:
- **Node.js + Express + TypeScript Backend**: Decoupled, modular REST API running alongside the React 18 frontend.
- **Persistent Database (Turso / LibSQL SQLite)**:
  - `alerts` table: Persists emergency proposals across reloads with status (`PENDING`, `APPROVED`, `ACKNOWLEDGED`).
  - `alert_audit_log` table: True immutable audit trail recording every administrative sign-off action and timestamp.
  - `station_readings` table: Timestamped precipitation and forecast telemetry enabling real historical trend charts.
  - Configured for instant zero-config local development (`file:floodguard.db`) and cloud-ready for Turso serverless deployment (`TURSO_DATABASE_URL`).
- **Live Catchment Weather (Open-Meteo)**:
  - Automated 15-minute polling for all 13 AWS station coordinates (Joshimath, Rudraprayag, Uttarkashi, etc.) in a single batch request.
  - Server-side derivation of Green/Yellow/Orange/Red warning levels and severity descriptors from real precipitation thresholds.
  - Live data drives the baseline `NORMAL` operational posture; presentation scenario controls (`HEAVY_RAIN`, `FLASH_FLOOD`) temporarily override telemetry for live hackathon demos.
- **Survey of India Village Boundaries**: Integrates **16,920 authentic Uttarakhand village units** derived from official Survey of India / NWIC MultiPolygon datasets, reprojected to standard WGS84 (EPSG:4326).
- **50/25/15/10 Multi-Factor Risk Calculation Engine**:
  - **50%** Current Weather Severity
  - **25%** Forecast + Warning Level (Green / Yellow / Orange / Red)
  - **15%** Terrain Susceptibility (Slope steepness, river proximity, elevation, catchment debris)
  - **10%** Historical Hazard Exposure (Prior recorded flood occurrences & landslide tiers)
- **Authority Alert Workflow & Persistent Audit Console**:
  - Full protocol (`PENDING` -> `APPROVED` -> `ACKNOWLEDGED`) with real database persistence.

---

## 2. Architecture & Folder Structure

```
floodguard-uk/
├── server/                            # Node.js + Express + TypeScript Backend
│   └── src/
│       ├── index.ts                   # Express server entrypoint & cron scheduler (:3001)
│       ├── db.ts                      # Turso / LibSQL client & automatic table migrations
│       ├── types.ts                   # Backend domain models & database entities
│       ├── dataStore.ts               # In-memory index of 16,920 villages & station telemetry
│       ├── riskEngine.ts              # Server-side 50/25/15/10 deterministic risk engine
│       ├── weatherService.ts          # Open-Meteo batch polling & warning classification
│       └── routes/
│           ├── stations.ts            # GET /api/stations & GET /api/stations/history
│           ├── villages.ts            # GET /api/villages/:id/risk
│           ├── scenarios.ts           # POST /api/scenario/run
│           └── alerts.ts              # GET /api/alerts, /approve, /acknowledge, /audit
├── public/
│   ├── favicon.svg                    # Brand icon
│   └── data/
│       ├── villages_index.json        # Index of all 16,920 village centroids & census codes (~7.4 MB)
│       ├── district_boundaries.json   # Vector outlines of all 13 Uttarakhand districts (~2.2 MB)
│       └── districts/                 # 13 partitioned high-res village GeoJSONs
├── src/                               # React 18 + Vite Frontend
│   ├── components/                    # Tactical command center UI components
│   ├── context/                       # SimulationContext.tsx (wired to REST API)
│   ├── services/                      # dataProvider.ts (API client with database persistence)
│   ├── pages/                         # All 8 routes (Overview, RiskMap, Villages, Alerts, etc.)
│   └── utils/                         # Client GIS & risk utilities
├── vite.config.ts                     # Vite config with proxy: /api -> http://localhost:3001
└── package.json
```

---

## 3. REST API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status, uptime, and active scenario |
| `GET` | `/api/stations` | Current station telemetry (rainfall, forecast, warning level) |
| `GET` | `/api/stations/history` | Timestamped readings from `station_readings` database table |
| `GET` | `/api/villages/:id/risk` | Deterministic risk score and 4-factor breakdown for a village |
| `POST` | `/api/scenario/run` | Recomputes risks for demo scenarios (`NORMAL`, `HEAVY_RAIN`, `FLASH_FLOOD`) |
| `GET` | `/api/alerts` | List all persisted emergency broadcast proposals |
| `POST` | `/api/alerts/:id/approve` | Authorize alert; commits to `alerts` and `alert_audit_log` |
| `POST` | `/api/alerts/:id/acknowledge` | Acknowledge alert protocol; commits to database and audit trail |
| `GET` | `/api/alerts/:id/audit` | Retrieve complete audit trail for a specific alert |
| `GET` | `/api/alerts/audit/all` | Retrieve statewide administrative audit registry |

---

## 4. Installation & Running

### Prerequisites
- Node.js (v18 or higher recommended, tested on v24)
- npm (v9 or higher)

### Run Both Server & Frontend Concurrently:
```bash
# Start backend server (:3001) and Vite frontend (:5173) together
npm run dev:all
```

Alternatively, run in separate terminals:
```bash
# Terminal 1 - Backend Server
npm run server

# Terminal 2 - Frontend Development Server
npm run dev
```

The application runs at:
```
Frontend: http://localhost:5173/
Backend API: http://localhost:3001/api/
```

### Production Build:
```bash
npm run build
```

---

## 5. Environment Variables (Turso Cloud Persistence)

By default, the backend connects to local SQLite via `file:floodguard.db`. For serverless deployment or shared team database, set:

```env
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
PORT=3001
```

---

## 6. How to Run the SIH Live Presentation

1. **Baseline & Live Weather Telemetry**:
   - Open `http://localhost:5173/`.
   - Point out that stations load live Open-Meteo precipitation rates and background cron updates them every 15 minutes.
   - Show the **Catchment Risk & Hydrological Observatory** (`/analytics`) graphing real telemetry readings from the `station_readings` table.
2. **Execute Demo Cloudburst Scenario**:
   - Click **Flash Flood** in the top navbar.
   - The backend recalculates 16,920 village risks and saves 50 emergency alert proposals to the database.
   - Notice the high-altitude hotspots (Kedarnath, Joshimath, Gandhari) surge to **SEVERE** alert levels.
3. **Authority Approval & Persistent Audit Trail**:
   - Open **Alerts Console** (`/alerts`).
   - Click **[ Authorize Emergency Broadcast ]** on an alert.
   - Click **[ Acknowledge Protocol ]**.
   - **Refresh the page (`F5`)**: Notice that the authorized status, timestamp, and audit trail are **permanently saved in the database** and reload cleanly!

---

## 7. License & Attribution
- Village boundaries: Survey of India (SOI) / National Water Development Portal (NWIC).
- Live weather: Open-Meteo API.
- Map tiles: CARTO Dark Matter / OpenStreetMap contributors.
- Developed for Smart India Hackathon (SIH).
