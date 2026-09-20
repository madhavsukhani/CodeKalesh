import csv
import io
import sqlite3
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from database import (
    load_demo_into_db, get_centres, get_vehicles, 
    record_stop_completion, reset_completions, get_completed_stops, DB_FILE,
    save_reassignments, get_reassigned_stops
)
from prediction import calculate_predictions
from optimizer import optimize_routes, get_fixed_routes, handle_van_overflow
from metrics import get_comparison_metrics
from models import (
    OptimizationRequest, MetricsResponse, StopCompleteRequest, StopCompleteResponse,
    UserLoginRequest, UserResponse
)

router = APIRouter(prefix="/api")

SAMPLE_USERS = [
    {
        "id": "mcc_supervisor",
        "username": "mcc",
        "name": "Rajesh Sharma",
        "role": "supervisor",
        "van_id": None,
        "role_label": "MCC Rajpura Supervisor",
        "avatar_color": "from-sky-500 to-indigo-600"
    },
    {
        "id": "driver1",
        "username": "driver1",
        "name": "Gurdeep Singh",
        "role": "driver",
        "van_id": "VAN_01",
        "role_label": "Van 1 Driver (Eicher Pro)",
        "avatar_color": "from-blue-500 to-cyan-600"
    },
    {
        "id": "driver2",
        "username": "driver2",
        "name": "Harpreet Singh",
        "role": "driver",
        "van_id": "VAN_02",
        "role_label": "Van 2 Driver (Tata 407)",
        "avatar_color": "from-emerald-500 to-teal-600"
    }
]

@router.post("/login")
def api_login(req: UserLoginRequest):
    user = next((u for u in SAMPLE_USERS if u["username"] == req.username or u["id"] == req.username), None)
    if not user:
        user = SAMPLE_USERS[0]
    return {"status": "success", "user": user}

@router.get("/users")
def api_get_users():
    return {"users": SAMPLE_USERS}

@router.get("/reassignments")
def api_get_reassignments():
    """Returns active stop reassignments stored in database for MCC Supervisor audit panel."""
    reassignments = get_reassigned_stops()
    return {
        "status": "success",
        "reassignments": list(reassignments.values()),
        "count": len(reassignments)
    }

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
    Uses the Random Forest model by default; the weighted formula remains an internal fallback.
    """
    model_type = "rf"
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

    Normal case: records the actual collection and returns status='completed'.

    Overflow case: when actual litres would exceed the van's remaining capacity,
    the stop is collected up to the tank limit (partial fill), and the API
    automatically generates a reassignment plan for all unvisited downstream
    stops on that route, returning status='overflow_reassigned'.
    """
    centre_id = stop_id.replace("STOP_", "")
    actual_litres = req.actual_litres if req and req.actual_litres is not None else 238.0
    notes = req.driver_notes if req else ""

    # 1. Fetch current routes to identify which vehicle owns this stop
    routes = optimize_routes()
    target_route = None

    for r in routes:
        for s in r.get("stop_details", []):
            if s["stop_id"] == stop_id or s["centre_id"] == centre_id:
                target_route = r
                break
        if target_route:
            break

    overflow_detected = False
    actual_collected = actual_litres   # may be capped below
    overflow_litres = 0.0
    reassignment_plan = []

    if target_route:
        vehicle_capacity = float(target_route.get("capacity_litres", 2500.0))
        vehicle_name = target_route.get("vehicle_name", "Van")
        vehicle_id = target_route.get("vehicle_id", "VAN_01")

        # Calculate current load on this vehicle from already completed stops
        completed_map = get_completed_stops()
        other_collected = 0.0
        for s in target_route.get("stop_details", []):
            if s["centre_id"] != centre_id:
                comp = completed_map.get(s["centre_id"])
                if comp and comp.get("actual_litres") is not None:
                    other_collected += float(comp["actual_litres"])

        remaining_capacity_before = vehicle_capacity - other_collected

        if actual_litres > remaining_capacity_before:
            # --- CASE 1: DIRECT OVERFLOW ON CURRENT STOP ---
            overflow_detected = True
            actual_collected = max(0.0, round(remaining_capacity_before, 1))
            overflow_litres = round(actual_litres - actual_collected, 1)

            # Record partial fill
            record_stop_completion(centre_id, actual_collected, notes)

            # Generate reassignment plan for all downstream unvisited stops
            reassignment_plan = handle_van_overflow(
                overflowed_van_id=vehicle_id,
                overflowed_stop_centre_id=centre_id,
                actual_litres_collected=actual_collected,
                all_routes=routes
            )

            # Persist reassignment state in database
            save_reassignments(reassignment_plan, vehicle_id)

            stranded_count = len(reassignment_plan)
            second_runs = sum(1 for p in reassignment_plan if p.get("is_second_run"))
            redirected = stranded_count - second_runs

            msg = (
                f"🚨 Van filled up at {centre_id}! Collected {actual_collected}L "
                f"(left {overflow_litres}L behind). "
                f"{stranded_count} downstream stop(s) reassigned: "
                f"{redirected} redirected to other van(s), "
                f"{second_runs} scheduled as second run."
            )

            return StopCompleteResponse(
                status="overflow_reassigned",
                stop_id=stop_id,
                centre_id=centre_id,
                actual_litres=actual_collected,
                overflow_litres=overflow_litres,
                message=msg,
                reassignment_plan=reassignment_plan,
                overflowed_van_id=vehicle_id,
                overflowed_van_name=vehicle_name
            )

        # --- CASE 2: CURRENT STOP FITS, BUT CHECK IF REMAINING CAPACITY IS INSUFFICIENT FOR NEXT UNVISITED STOP ---
        actual_collected = actual_litres
        record_stop_completion(centre_id, actual_collected, notes)

        # Updated total load on vehicle after this completion:
        total_collected_after = other_collected + actual_collected
        remaining_capacity_after = vehicle_capacity - total_collected_after

        # Find next unvisited stop on target_route
        next_unvisited_stop = None
        found_current = False
        for s in target_route.get("stop_details", []):
            if s["centre_id"] == centre_id:
                found_current = True
                continue
            if found_current and s["centre_id"] not in completed_map:
                next_unvisited_stop = s
                break

        # If there is a next unvisited stop, check if remaining capacity is insufficient for it
        if next_unvisited_stop is not None:
            next_stop_volume = float(next_unvisited_stop.get("predicted_litres", 200.0))
            if remaining_capacity_after < next_stop_volume:
                # Van capacity limit reached! Reassign remaining downstream stops immediately ("last entry karte hi")
                reassignment_plan = handle_van_overflow(
                    overflowed_van_id=vehicle_id,
                    overflowed_stop_centre_id=centre_id,
                    actual_litres_collected=actual_collected,
                    all_routes=routes
                )

                # Persist reassignment state in database
                save_reassignments(reassignment_plan, vehicle_id)

                stranded_count = len(reassignment_plan)
                second_runs = sum(1 for p in reassignment_plan if p.get("is_second_run"))
                redirected = stranded_count - second_runs

                msg = (
                    f"🚨 Tank capacity limit reached at {centre_id}! Recorded {actual_collected}L. "
                    f"Remaining tank space ({round(remaining_capacity_after)}L) is insufficient for next stop "
                    f"{next_unvisited_stop['name']} ({round(next_stop_volume)}L). "
                    f"{stranded_count} downstream stop(s) automatically reassigned: "
                    f"{redirected} redirected to other van(s), {second_runs} scheduled as second run."
                )

                return StopCompleteResponse(
                    status="overflow_reassigned",
                    stop_id=stop_id,
                    centre_id=centre_id,
                    actual_litres=actual_collected,
                    overflow_litres=0.0,
                    message=msg,
                    reassignment_plan=reassignment_plan,
                    overflowed_van_id=vehicle_id,
                    overflowed_van_name=vehicle_name
                )

    return StopCompleteResponse(
        status="completed",
        stop_id=stop_id,
        centre_id=centre_id,
        actual_litres=actual_collected,
        message=f"Stop {stop_id} successfully recorded with {actual_collected} litres"
    )

@router.post("/reset")
def api_reset_data():
    """Resets database and collection completions back to clean state."""
    reset_completions()
    load_demo_into_db()
    return {"status": "success", "message": "Demo data reset successfully"}

@router.post("/day/start")
def api_start_new_day():
    """Starts a new collection day without deleting centres or historical records."""
    reset_completions()
    return {"status": "success", "message": "New collection day started"}
