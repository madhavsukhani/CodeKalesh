import csv
import io
import sqlite3
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from database import (
    load_demo_into_db, get_centres, get_vehicles, 
    record_stop_completion, reset_completions, get_completed_stops, DB_FILE
)
from prediction import calculate_predictions
from optimizer import optimize_routes, get_fixed_routes
from metrics import get_comparison_metrics
from models import (
    OptimizationRequest, MetricsResponse, StopCompleteRequest
)

router = APIRouter(prefix="/api")

@router.get("/centres")
def api_get_centres():
    """Returns list of all 12 village collection centres."""
    return {"centres": get_centres()}

@router.get("/vehicles")
def api_get_vehicles():
    """Returns list of available milk collection vans."""
    return {"vehicles": get_vehicles()}

@router.post("/upload")
async def api_upload(file: Optional[UploadFile] = File(None)):
    """
    Accepts CSV upload or loads demo data if no file or 'demo' is sent.
    CSV format: centre_id, centre_name, latitude, longitude, collection_start, collection_end, service_time_minutes, date, litres_collected, active_farmers
    """
    if file is None:
        # Load demo data
        load_demo_into_db()
        centres = get_centres()
        return {
            "status": "success",
            "message": "Punjab 12-VLC Demo dataset loaded successfully",
            "centres_loaded": len(centres),
            "history_rows_loaded": len(centres) * 14
        }
        
    try:
        content = await file.read()
        decoded = content.decode("utf-8")
        reader = csv.DictReader(io.StringIO(decoded))
        
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        centres_seen = set()
        history_count = 0
        
        for row in reader:
            cid = row.get("centre_id")
            cname = row.get("centre_name", f"VLC_{cid}")
            lat = float(row.get("latitude", 30.48))
            lon = float(row.get("longitude", 76.59))
            cstart = row.get("collection_start", "05:00")
            cend = row.get("collection_end", "06:30")
            stime = int(row.get("service_time_minutes", 8))
            
            if cid not in centres_seen:
                cursor.execute("""
                    INSERT OR REPLACE INTO centres (id, name, latitude, longitude, collection_start, collection_end, service_time_minutes)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (cid, cname, lat, lon, cstart, cend, stime))
                centres_seen.add(cid)
                
            date_str = row.get("date", "2026-09-19")
            litres = float(row.get("litres_collected", 200.0))
            farmers = int(row.get("active_farmers", 40))
            
            cursor.execute("""
                INSERT INTO historical_collection (centre_id, date, litres_collected, active_farmers)
                VALUES (?, ?, ?, ?)
            """, (cid, date_str, litres, farmers))
            history_count += 1
            
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "message": f"Successfully processed {file.filename}",
            "centres_loaded": len(centres_seen),
            "history_rows_loaded": history_count
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

@router.post("/predict")
def api_predict(payload: Optional[Dict[str, Any]] = Body(None)):
    """
    Calculates today's predicted milk volume per centre.
    Supports 'weighted' (default) or 'rf' (Random Forest) models.
    """
    model_type = "weighted"
    if payload and "model_type" in payload:
        model_type = payload["model_type"]
        
    predictions = calculate_predictions(model_type=model_type)
    total_litres = sum(p["predicted_litres"] for p in predictions)
    at_risk = [p for p in predictions if p["risk"] == "high"]
    
    return {
        "status": "success",
        "model_used": "Random Forest Regressor" if model_type == "rf" else "Weighted Moving Average (50/30/20)",
        "total_predicted_litres": round(total_litres, 1),
        "at_risk_count": len(at_risk),
        "predictions": predictions
    }

@router.post("/optimize")
def api_optimize(req: Optional[OptimizationRequest] = None):
    """
    Generates optimized routes for available vans considering capacity and collection time windows.
    """
    routes = optimize_routes()
    return {
        "status": "success",
        "routes": routes
    }

@router.get("/routes")
def api_get_routes():
    """Returns the current optimized van routes and stop details."""
    routes = optimize_routes()
    return {
        "status": "success",
        "routes": routes
    }

@router.get("/routes/fixed")
def api_get_fixed_routes():
    """Returns the unoptimized legacy fixed routes for comparison."""
    routes = get_fixed_routes()
    return {
        "status": "success",
        "routes": routes
    }

@router.get("/metrics", response_model=MetricsResponse)
def api_metrics():
    """Returns before/after impact comparison and AI explanations."""
    return get_comparison_metrics()

@router.post("/stops/{stop_id}/complete")
def api_complete_stop(stop_id: str, req: Optional[StopCompleteRequest] = None):
    """
    Driver marks stop as collected with actual litres.
    Validates against vehicle capacity to prevent van overloading.
    """
    centre_id = stop_id.replace("STOP_", "")
    actual_litres = req.actual_litres if req and req.actual_litres is not None else 238.0
    notes = req.driver_notes if req else ""
    
    # 1. Fetch current routes to find which vehicle this stop belongs to
    routes = optimize_routes()
    target_route = None
    
    for r in routes:
        for s in r.get("stop_details", []):
            if s["stop_id"] == stop_id or s["centre_id"] == centre_id:
                target_route = r
                break
        if target_route:
            break
            
    if target_route:
        vehicle_capacity = float(target_route.get("capacity_litres", 2500.0))
        vehicle_name = target_route.get("vehicle_name", "Van")
        
        # Calculate current collected load on this vehicle from OTHER already completed stops
        completed_map = get_completed_stops()
        other_collected = 0.0
        for s in target_route.get("stop_details", []):
            if s["centre_id"] != centre_id:
                comp = completed_map.get(s["centre_id"])
                if comp and comp.get("actual_litres") is not None:
                    other_collected += float(comp["actual_litres"])
                    
        # Capacity check: Prevent overload
        if (other_collected + actual_litres) > vehicle_capacity:
            exceeded = round((other_collected + actual_litres) - vehicle_capacity, 1)
            remaining = max(0.0, round(vehicle_capacity - other_collected, 1))
            raise HTTPException(
                status_code=400,
                detail=f"🚨 VAN OVERLOAD PREVENTED: Cannot load {actual_litres} L onto {vehicle_name}! Current load is {round(other_collected)} L and tanker capacity is {round(vehicle_capacity)} L. Remaining capacity is only {remaining} L (intake exceeds tanker limit by {exceeded} L)."
            )
            
    record_stop_completion(centre_id, actual_litres, notes)
    
    return {
        "status": "completed",
        "stop_id": stop_id,
        "centre_id": centre_id,
        "actual_litres": actual_litres,
        "message": f"Stop {stop_id} successfully recorded with {actual_litres} litres"
    }

@router.post("/reset")
def api_reset_data():
    """Resets database and collection completions back to clean state."""
    reset_completions()
    load_demo_into_db()
    return {"status": "success", "message": "Demo data reset successfully"}
