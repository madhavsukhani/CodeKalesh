from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, load_demo_into_db
from routes import router

app = FastAPI(
    title="DoodhRoute AI API",
    description="Smart Milk Logistics, Volume Prediction & Dynamic Route Optimization",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API endpoints
app.include_router(router)

@app.on_event("startup")
def on_startup():
    init_db()
    load_demo_into_db()

@app.get("/")
def root():
    return {
        "app": "DoodhRoute AI",
        "description": "Smart Dairy Logistics & Route Optimization Engine",
        "version": "1.0.0",
        "status": "online",
        "endpoints": [
            "/api/upload",
            "/api/predict",
            "/api/optimize",
            "/api/metrics",
            "/api/routes",
            "/api/stops/{stop_id}/complete"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
