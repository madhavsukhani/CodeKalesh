# DoodhRoute AI: Smart Dairy Logistics & Dynamic Route Optimization

> **Autonomous milk yield forecasting coupled with time-window capacitated multi-vehicle route optimization for rural dairy collection networks.**

---

## 1. Overall Three-Layer Architecture

```
Dairy Collection Operations Hub
               │
               ▼
┌────────────────────────────────────────────────────────┐
│     Frontend Dashboard (React + Vite + Leaflet)        │
│  - Operations KPI Dashboard   - Data Ingestion (CSV)   │
│  - Yield Predictions View     - Multi-Van Route Map    │
│  - Before/After Comparison    - Driver Handheld Mode   │
└────────────────────────────────────────────────────────┘
               │  REST API (JSON)
               ▼
┌────────────────────────────────────────────────────────┐
│               Python Backend (FastAPI)                 │
│  ├── Data Ingestion & Quality Pipeline                 │
│  ├── Milk Yield Predictor (Weighted Avg & RF)          │
│  ├── Dynamic Route Optimizer (Time Windows & Capacity) │
│  ├── Impact & Diesel Savings Calculator                │
│  └── Multi-Constraint AI Explanation Generator         │
└────────────────────────────────────────────────────────┘
               │  SQLite & CSV
               ▼
┌────────────────────────────────────────────────────────┐
│           Demo Database & Punjab Network               │
│  - MCC Rajpura Milk Chilling Centre                    │
│  - 12 Village Level Collection Centres (VLCs)          │
│  - 14 Days Historical Collection & Farmer Logs         │
└────────────────────────────────────────────────────────┘
```

---

## 2. End-to-End User Flow

1. **Upload Collection-Centre Data**: Upload CSV or load 1-click Punjab 12-VLC network.
2. **Validate & Clean Data**: Coordinates verified inside Rajpura operational radius, intake morning windows checked.
3. **Predict Today's Milk Volume**:
   $$\text{Predicted Litres} = 0.50 \times \text{avg}_{7\text{d}} + 0.30 \times \text{yesterday} + 0.20 \times \text{avg}_{30\text{d}}$$
   - Flags **Kheri VLC** as high risk ($455\text{ L}$, $+17\%$ surge).
4. **Generate Multi-Van Routes**: Solves routing for Van 1 (Eicher Pro) and Van 2 (Tata 407).
5. **Check Capacity & Time Windows**: Ensures zero late arrivals across morning $05:00 - 06:45\text{ AM}$ collection slots.
6. **Display Routes & Impact**: Interactive Leaflet maps with stop sequences and "Why this route?" AI reasoning.
7. **Driver Collection Flow**: Driver sees active stop, marks collection with actual litres, updates depot live.

---

## 3. Quick Start (Running Locally)

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
# Running on http://127.0.0.1:8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Running on http://127.0.0.1:5173
```

---

## 4. Benchmark Results (Before vs After)

| Performance Metric | Fixed Route (Legacy) | DoodhRoute AI | Impact |
|---|---|---|---|
| **Total Distance** | 126 km | **92 km** | **-26.98% (-34 km/day)** |
| **Capacity Utilization** | 68% | **91%** | **+23% tanker density** |
| **Late Stop Violations** | 2 late stops | **0 late stops** | **100% on-time delivery** |
| **Milk Waiting Risk** | High Risk (Curdling) | **Low Risk** | **Preserved freshness** |
| **Monthly Fuel Expense** | ₹97,200 | **₹70,972** | **₹26,228 saved/month** |
| **Daily Carbon Footprint**| 96.5 kg CO₂ | **70.4 kg CO₂** | **-26.1 kg CO₂ saved/day** |

---

## 5. REST API Endpoints

- `GET /api/centres`: Retrieve all 12 village collection points.
- `POST /api/upload`: Upload custom CSV or trigger Punjab demo dataset loading.
- `POST /api/predict`: Milk volume forecasts (Weighted average or Random Forest).
- `POST /api/optimize`: Capacitated vehicle route optimization.
- `GET /api/routes`: Active routes and stop sequences.
- `GET /api/metrics`: Before vs after operational benchmarks and AI explanations.
- `POST /api/stops/{stop_id}/complete`: Record driver collection with actual volume.
- `POST /api/reset`: Reset database to fresh demo state.

---

## 6. Architecture Pitch Slide

```
Historical milk data (last 7–14 days)
         │
         ▼
 AI Yield Predictor (Weighted Moving Avg / Random Forest)
         │
         ▼
 Predicted litres per collection centre
         │
         ├──────────────────────────────┐
         ▼                              ▼
  Route Optimizer                  Risk Engine
         │                              │
         └──────────────┬───────────────┘
                        ▼
Manager Dashboard + Leaflet Route Map + Driver View
                        │
                        ▼
Completed collection data feeds tomorrow’s prediction
```

> **Pitch Explanation**:
> *"DoodhRoute learns from historical collection trends to forecast expected volume at each village collection centre before dawn, then dynamically computes multi-van routes respecting tanker capacity, freshness, and village collection windows. Completed intake then continually refines tomorrow's predictions."*
# CodeKalesh
