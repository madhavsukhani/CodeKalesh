# MilkRouter: Smart Dairy Logistics & Dynamic Route Optimization

> **A role-based dairy operations dashboard that forecasts milk volume, identifies collection risk, and optimizes multi-van routes.**

MilkRouter is a hackathon prototype for the Rajpura Milk Chilling Centre (MCC) and its village-level collection centres (VLCs). It combines historical collection data, a Random Forest prediction option, weighted-average forecasting, capacity-aware routing, and live driver collection updates.

## Current Status

The current project is a local demo application:

- The frontend starts on `http://127.0.0.1:5173`.
- The dashboard is hidden until a user selects a role and logs in.
- CSV uploads and driver collection entries are stored in SQLite.
- Random Forest is the only model exposed in the prediction screen and is the default API model.
- The weighted formula remains an internal fallback when a centre has insufficient history or model training fails.
- There is no background scheduler or persisted trained model yet.

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

1. **Select a role**: Choose MCC Supervisor, Driver 1, or Driver 2 on the login screen.
2. **Load data**: The backend starts with the demo dataset, or the supervisor uploads a CSV.
3. **Record actual collections**: Drivers submit actual litres for completed stops. These records are stored in SQLite.
4. **Predict today's Milk Volume**:
   $$\text{Predicted Litres} = 0.50 \times \text{avg}_{7\text{d}} + 0.30 \times \text{yesterday} + 0.20 \times \text{avg}_{30\text{d}}$$
   - Flags **Kheri VLC** as high risk ($455\text{ L}$, $+17\%$ surge).
5. **Generate multi-van routes**: Routes use predicted or actual load, vehicle capacity, and collection time windows.
6. **Display routes and impact**: The dashboard shows Leaflet maps, stop sequences, rerouting events, and comparison metrics.
7. **Respond to overflow**: If a van cannot carry the next collection, the backend caps the collection and creates a reassignment plan.

## 3. Prediction Models

### Weighted fallback

The default model is a transparent formula using recent history:

- 50%: average of the latest seven records
- 30%: latest collection record
- 20%: average of the latest 30 records

It is fast, explainable, and is used as the fallback when there is insufficient history or Random Forest cannot run.

### Random Forest (primary AI model)

When the API receives `model_type: "rf"` and a centre has at least 10 historical records, it creates a `RandomForestRegressor` with 30 trees. It trains using lagged litres and active-farmer features, then predicts the next volume. The model exists only for that request; it is not saved to disk and it does not learn continuously in the background.

The current demo also keeps fixed showcase values for the first three demo centres so the hackathon scenario remains repeatable. Random Forest is the primary visible AI model, but it should still be validated with a larger production dataset before being used for unattended dispatch.

### What happens after a CSV upload?

1. The CSV rows are inserted into the SQLite `historical_collection` table.
2. No model training starts during upload.
3. The next prediction request reads the updated history.
4. A Random Forest request trains a new temporary model from that history.
5. If Random Forest cannot train, the backend uses the weighted formula as a safety fallback.

## 4. Scheduled Retraining: Current Limitation and Production Design

Scheduled retraining is **not implemented in this repository yet**. The recommended production workflow is:

```text
Drivers record actual litres during the day
        |
        v
Records are saved in SQLite or a production database
        |
        v
A daily scheduler runs after the collection shift
        |
        v
Training data is rebuilt from confirmed historical records
        |
        v
Random Forest is validated and saved as a model artifact
        |
        v
The next morning's prediction loads that saved model
```

For a real deployment, this could be implemented with a cron job, Windows Task Scheduler, or a worker such as APScheduler/Celery. The job should train only from confirmed actual collections, validate the new model against a holdout period, save it only if it improves the baseline, and keep Weighted Average as a fallback. The MCC supervisor would not need to upload a CSV every day if driver entries are captured reliably; CSV upload would remain useful for bulk imports or recovery.

---

## 5. Quick Start (Running Locally)

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### Backend Setup (Windows PowerShell)
```bash
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
# Running on http://127.0.0.1:8000
```

On macOS/Linux, use `python3 -m venv venv` and `source venv/bin/activate` instead.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Running on http://127.0.0.1:5173
```

---

## 6. Demo Roles

The current login is a demo role selector. The backend accepts these usernames:

| Username | Role | Main view |
|---|---|---|
| `mcc` | MCC Supervisor | Dashboard, upload, predictions, routes, metrics |
| `driver1` | Van 1 Driver | Driver collection console for Van 1 |
| `driver2` | Van 2 Driver | Driver collection console for Van 2 |

Passwords are not securely enforced in this hackathon prototype. Production authentication should use hashed passwords, sessions or tokens, and server-side role permissions.

## 7. CSV Format

Custom uploads should include these columns:

```text
centre_id,centre_name,latitude,longitude,collection_start,collection_end,service_time_minutes,date,litres_collected,active_farmers
```

Each historical row should represent one collection record for one centre. Uploading rows appends historical records; it does not start model training by itself.

## 8. Benchmark Results (Before vs After)

| Performance Metric | Fixed Route (Legacy) | MilkRouter | Impact |
|---|---|---|---|
| **Total Distance** | 126 km | **92 km** | **-26.98% (-34 km/day)** |
| **Capacity Utilization** | 68% | **91%** | **+23% tanker density** |
| **Late Stop Violations** | 2 late stops | **0 late stops** | **100% on-time delivery** |
| **Milk Waiting Risk** | High Risk (Curdling) | **Low Risk** | **Preserved freshness** |
| **Monthly Fuel Expense** | ₹97,200 | **₹70,972** | **₹26,228 saved/month** |
| **Daily Carbon Footprint**| 96.5 kg CO₂ | **70.4 kg CO₂** | **-26.1 kg CO₂ saved/day** |

---

## 9. REST API Endpoints

- `POST /api/login`: Return a demo user profile for the selected role.
- `GET /api/users`: List the demo user profiles.
- `GET /api/centres`: Retrieve all 12 village collection points.
- `POST /api/upload`: Upload custom CSV, or load the demo dataset when no file is provided.
- `POST /api/predict`: Calculate Random Forest forecasts. The weighted formula is used internally only as a fallback.
- `POST /api/optimize`: Capacitated vehicle route optimization.
- `GET /api/routes`: Active routes and stop sequences.
- `GET /api/routes/fixed`: Legacy fixed routes for comparison.
- `GET /api/metrics`: Before vs after operational benchmarks and AI explanations.
- `POST /api/stops/{stop_id}/complete`: Record driver collection with actual volume.
- `GET /api/reassignments`: Read active overflow reassignment records.
- `POST /api/reset`: Reset database to fresh demo state.

---

## 10. Architecture Pitch Slide

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
> *"MilkRouter uses historical collection records to forecast expected volume at each village collection centre before dawn, then dynamically computes multi-van routes respecting tanker capacity, freshness, and village collection windows. Confirmed driver intake becomes new training history for later predictions. In production, a daily scheduled job would retrain and validate the AI model automatically."*
