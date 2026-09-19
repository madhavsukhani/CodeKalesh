import os
import sys

# Ensure backend folder is in sys.path
sys.path.insert(0, os.path.dirname(__file__))

from database import init_db, load_demo_into_db, get_centres, get_vehicles
from prediction import calculate_predictions
from optimizer import optimize_routes, get_fixed_routes
from metrics import get_comparison_metrics
from routes import api_complete_stop
from models import StopCompleteRequest

def test_all():
    print("=== Testing Database Init & Demo Data Loading ===")
    init_db()
    load_demo_into_db()
    centres = get_centres()
    print(f"Loaded {len(centres)} centres.")
    assert len(centres) == 12, f"Expected 12 centres, got {len(centres)}"
    
    vehicles = get_vehicles()
    print(f"Loaded {len(vehicles)} vehicles.")
    assert len(vehicles) == 2, f"Expected 2 vehicles, got {len(vehicles)}"

    print("\n=== Testing Milk Predictions (Weighted Moving Average) ===")
    predictions = calculate_predictions(model_type="weighted")
    total_litres = sum(p["predicted_litres"] for p in predictions)
    print(f"Total predicted litres: {total_litres} L")
    assert round(total_litres) == 4350, f"Expected 4350 L, got {total_litres}"

    # Verify Kheri VLC
    kheri = next((p for p in predictions if p["centre_id"] == "VLC_02"), None)
    assert kheri is not None
    print(f"Kheri VLC: {kheri['predicted_litres']} L (Risk: {kheri['risk']})")
    assert kheri["predicted_litres"] == 455
    assert kheri["risk"] == "high"

    # Verify Rampura VLC
    rampura = next((p for p in predictions if p["centre_id"] == "VLC_01"), None)
    print(f"Rampura VLC: {rampura['predicted_litres']} L (Risk: {rampura['risk']})")
    assert rampura["predicted_litres"] == 225

    # Verify Banur VLC
    banur = next((p for p in predictions if p["centre_id"] == "VLC_03"), None)
    print(f"Banur VLC: {banur['predicted_litres']} L (Risk: {banur['risk']})")
    assert banur["predicted_litres"] == 165

    print("\n=== Testing Route Optimization ===")
    routes = optimize_routes()
    assert len(routes) == 2, f"Expected 2 van routes, got {len(routes)}"
    total_opt_dist = sum(r["distance_km"] for r in routes)
    print(f"Optimized total distance: {total_opt_dist} km (Late stops: {sum(r['late_stops'] for r in routes)})")
    assert total_opt_dist == 92.0
    assert sum(r['late_stops'] for r in routes) == 0

    print("\n=== Testing Fixed Legacy Routes ===")
    fixed_routes = get_fixed_routes()
    total_fixed_dist = sum(r["distance_km"] for r in fixed_routes)
    total_fixed_late = sum(r["late_stops"] for r in fixed_routes)
    print(f"Fixed total distance: {total_fixed_dist} km (Late stops: {total_fixed_late})")
    assert total_fixed_dist == 126.0
    assert total_fixed_late == 2

    print("\n=== Testing Comparison Metrics & AI Explanations ===")
    metrics = get_comparison_metrics()
    print(f"Distance reduction: {metrics['distance_reduction_percent']}%")
    print(f"Fixed vs Optimized: {metrics['fixed_distance_km']} km -> {metrics['optimized_distance_km']} km")
    print(f"Number of generated AI explanations: {len(metrics['explanations'])}")
    assert len(metrics["explanations"]) >= 4

    print("\n=== Testing Driver Collection Stop Complete ===")
    res = api_complete_stop("STOP_VLC_02", StopCompleteRequest(actual_litres=460.0))
    print(f"Stop completion result: {res}")
    assert res["status"] == "completed"
    assert res["actual_litres"] == 460.0

    print("\n=== Testing Van Overload Rejection ===")
    from fastapi import HTTPException
    overload_caught = False
    try:
        # Attempt to load 3000L onto Van 1 (capacity 2500L)
        api_complete_stop("STOP_VLC_01", StopCompleteRequest(actual_litres=3000.0))
    except HTTPException as e:
        overload_caught = True
        print(f"Successfully caught overload error: {e.detail}")
    assert overload_caught, "Expected HTTPException for van overload!"

    print("\n>>> ALL BACKEND TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_all()
