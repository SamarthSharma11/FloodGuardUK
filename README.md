# FLOODGUARD UK — Flash Flood Intelligence & Early Risk Assessment System
### Smart India Hackathon (SIH) Working Prototype | Focus: Uttarakhand, India

> **NOTICE:** This prototype runs in **DEMO / SIMULATION MODE** using simulated weather telemetry and Survey of India official village boundaries. It does not connect to live government or IMD APIs.

---

## 1. Project Overview

**FLOODGUARD UK** is a client-side emergency command center and flash flood decision-support system designed specifically for the rugged terrain of Uttarakhand, India.

### Key Highlights:
- **100% Frontend-Only**: Zero Python, FastAPI, PostgreSQL, PostGIS, or Docker backend required for demonstration.
- **Survey of India Village Boundaries**: Integrates **16,920 authentic Uttarakhand village units** derived from official Survey of India / NWIC MultiPolygon datasets, reprojected from EPSG:7755 into standard WGS84 (EPSG:4326).
- **50/25/15/10 Multi-Factor Risk Calculation Engine**:
  - **50%** Current Weather Severity
  - **25%** Forecast + IMD Warning Level (Green / Yellow / Orange / Red)
  - **15%** Terrain Susceptibility (Elevation gradient, river proximity, steep valley tiers)
  - **10%** Historical Hazard Exposure
- **Interactive Scenarios**: Switch between **Normal Monsoonal Baseline**, **Heavy Rain Influx**, and **Critical Flash Flood Threat** to observe real-time map polygon color transitions, KPI updates, and authority alert proposal generations.
- **Authority Alert Workflow**: Complete administrative console (`Pending Approval` -> `Approved by Authority` -> `Acknowledged`) with audit logs.

---

## 2. Folder Structure

```
floodguard-uk/
├── public/
│   ├── favicon.svg                    # System brand favicon
│   └── data/
│       ├── villages_index.json        # Index of all 16,920 village centroids, names, & codes (~7.4 MB)
│       ├── district_boundaries.json   # Vector outlines of all 13 Uttarakhand districts (~2.2 MB)
│       ├── districts_meta.json        # Administrative metadata for the 13 districts
│       └── districts/                 # 13 partitioned high-res village GeoJSONs
│           ├── 045_almora.json        # 2,294 villages
│           ├── 046_bageshwar.json     # 948 villages
│           ├── 047_chamoli.json       # 1,252 villages (Joshimath, Badrinath, Tapovan)
│           ├── 048_champawat.json     # 721 villages
│           ├── 049_dehradun.json      # 771 villages
│           ├── 050_haridwar.json      # 636 villages
│           ├── 051_nainital.json      # 1,160 villages
│           ├── 052_pauri_garhwal.json # 3,483 villages
│           ├── 053_pithoragarh.json   # 1,678 villages
│           ├── 054_rudraprayag.json   # 690 villages (Kedarnath, Mandakini valley)
│           ├── 055_tehri_garhwal.json # 1,869 villages
│           ├── 056_udham_singh_nagar.json # 708 villages
│           └── 057_uttarkashi.json    # 710 villages (Dharali, Bhagirathi valley)
├── src/
│   ├── types/                         # TypeScript interfaces (Village, Station, Alert, Scenario)
│   ├── data/                          # 13 AWS stations, scenario definitions, district metadata
│   ├── utils/
│   │   ├── riskEngine.ts              # Mathematical 50/25/15/10 risk calculation & dynamic explanation
│   │   └── geoUtils.ts                # Coordinate, distance, and risk styling helpers
│   ├── services/
│   │   └── dataProvider.ts            # Abstracted data layer for local & future API integration
│   ├── context/
│   │   └── SimulationContext.tsx      # Reactive state (scenarios, stations, alerts, village selection)
│   ├── components/
│   │   ├── layout/                    # Navbar, Sidebar, AppLayout
│   │   ├── common/                    # KpiCard, RiskBadge
│   │   ├── map/                       # FloodMap (Leaflet Canvas), MapLegend
│   │   └── village/                   # VillageRiskCard (slide-out inspector), VillageSearchBar
│   ├── pages/
│   │   ├── OverviewPage.tsx           # Large map + selected village card + KPIs + bottom charts
│   │   ├── RiskMapPage.tsx            # Dedicated full-width map with layer filters & controls
│   │   ├── VillagesPage.tsx           # Directory of all 16,920 villages with search & pagination
│   │   ├── WeatherStationsPage.tsx    # AWS telemetry cards & affected village counts
│   │   ├── AlertsPage.tsx             # Emergency Authority Alert Console (Approval workflow)
│   │   ├── AnalyticsPage.tsx          # Recharts visualizations (Risk, rainfall trends, districts)
│   │   ├── ScenariosPage.tsx          # Interactive scenario controls (Normal, Heavy Rain, Flash Flood)
│   │   └── SystemStatusPage.tsx       # System health & offline readiness status
│   ├── App.tsx                        # React Router routing
│   ├── main.tsx                       # React DOM root
│   └── index.css                      # Tailwind styling & Leaflet dark theme customizations
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 3. Installation & Run Commands

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Run locally:
```bash
# 1. Navigate to project root
cd floodguard-uk

# 2. Install dependencies (already executed)
npm install

# 3. Start development server
npm run dev
```

The application will be accessible at:
```
http://localhost:5173/
```

### Production Build:
```bash
npm run build
npm run preview
```

---

## 4. How the Local Data System Works

1. **Lightweight Metadata Index (`villages_index.json`)**:
   Contains pre-computed centroids `[lat, lon]`, census village codes, population, block, district, and nearest station assignment for all 16,920 villages (~7.4 MB). This allows instantaneous client-side searching and KPI aggregation without browser lag.
2. **Partitioned District Vector Layers (`/public/data/districts/*.json`)**:
   Rather than pushing 80 MB of raw geometry into Leaflet at once, village boundaries are partitioned into 13 district-level GeoJSON files (ranging from 700 KB to 3.4 MB). When you inspect a district (e.g., Chamoli with 1,252 villages), only that district's vectors are loaded and rendered via HTML5 Canvas (`preferCanvas: true`).
3. **Statewide Boundary Layer (`district_boundaries.json`)**:
   Dissolved boundary polygons for Uttarakhand districts render in <15ms for smooth state-wide context.

---

## 5. Future API Architecture (Swapping Local Data for Live IMD/Gov APIs)

All data access is intentionally abstracted inside `src/services/dataProvider.ts`:

- `getVillages()`: Currently reads `public/data/villages_index.json`. Can be swapped to `fetch('/api/v1/villages')`.
- `getStations()`: Currently returns simulated AWS stations. Can be swapped to `fetch('https://api.imd.gov.in/aws/telemetry/uttarakhand')`.
- `getDistrictGeoJSON(dtcode)`: Can fetch dynamic vector tiles or PostGIS endpoint (`/api/v1/districts/{id}/geojson`).
- `runScenario()`: Can connect to live hydrological models or webhook triggers.

Because all React components interact exclusively with `dataProvider.ts` through `SimulationContext`, **zero UI components need to be altered** when integrating live government backends.

---

## 6. How to Run the 3-5 Minute SIH Demo Script

### Act 1: The Context & Normal Baseline (0:00 - 1:00)
1. Open `http://localhost:5173/` on full screen.
2. Point out the top header: **FLOODGUARD UK** with the explicit status badges: `DEMO MODE` and `SIMULATED WEATHER`.
3. Highlight the KPI cards:
   - **Total Villages: 16,920** (Official Survey of India data).
   - **Average Risk: Low/Normal**.
4. Show the interactive Leaflet map:
   - Point out Chamoli district, Joshimath, and the pulsing weather station markers.
   - Click on the **Joshimath** village polygon.
   - Point to the right-side **Village Risk Card**:
     - Explain the **50/25/15/10 breakdown bars** (Weather, Forecast, Susceptibility, Historical Exposure).
     - Point out the natural-language explanation: *"Low risk under current conditions: rainfall remains within safe thresholds..."*.

### Act 2: Simulate Extreme Weather / Cloudburst (1:00 - 2:30)
1. Click the **Flash Flood** scenario button in the top navbar (or navigate to **Demo Scenarios** in the sidebar and click **Run Scenario** on `Simulate Flash Flood Threat`).
2. Point to the screen:
   - A notification banner alerts: *"CRITICAL ALERT: Cloudburst threat simulated! Extreme rainfall (>58 mm/hr) at Joshimath and Rudraprayag AWS with active RED warnings."*
   - The map polygons in Chamoli and Rudraprayag immediately turn **Red / Orange**.
   - The KPI counters dynamically update: **Severe Risk villages jump up**, **Active Alerts count surges**.
   - The bottom Recharts charts immediately adjust to reflect the new hazard distribution.
   - Look at the **Joshimath Risk Card**:
     - Risk Score jumps to **87+ / 100 (SEVERE RISK)**.
     - Rainfall rate reflects **64.8 mm/hr**.
     - Assigned warning turns **RED**.
     - Natural-language explanation adapts: *"Severe flash flood threat: torrential precipitation reported near Joshimath AWS..."*.

### Act 3: Authority Review & Emergency Protocol (2:30 - 3:30)
1. Click **Alerts Console** in the sidebar.
2. Show the pending alert proposals automatically generated for high-risk and severe-risk villages (Joshimath, Kedarnath, Dharali).
3. Click **[ Approve Alert Broadcast ]** on the Joshimath alert:
   - Status transitions from `PENDING APPROVAL` to `APPROVED`.
   - Displays timestamp and `Approved by: Disaster Authority (Demo Control)`.
4. Click **[ Acknowledge Protocol ]**:
   - Status updates to `ACKNOWLEDGED`.
   - Logged into emergency audit registry.

### Act 4: Search & Multi-District Scale (3:30 - 4:30)
1. Navigate to **Villages Directory** or use the top search bar.
2. Search for any village (e.g., *Kedarnath*, *Dharali*, *Badrinath*, *Auli*, *Rishikesh*).
3. Select the village to verify that the map automatically navigates to that exact village polygon with authentic Census population, block, and sub-district attributes.
4. Conclude by showing the **System Status** page to demonstrate clean system architecture and future API readiness.

---

## 7. License & Attribution
- Village boundaries: Survey of India (SOI) / National Water Development Portal (NWIC).
- Map tiles: CARTO Dark Matter / OpenStreetMap contributors.
- Developed for Smart India Hackathon (SIH).
