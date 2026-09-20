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
    from database import reset_completions
    reset_completions()
    res = api_complete_stop("STOP_VLC_02", StopCompleteRequest(actual_litres=460.0))
    print(f"Stop completion result: status={res.status}, actual_litres={res.actual_litres}")
    assert res.status == "completed"
    assert res.actual_litres == 460.0

    print("\n=== Testing Van Dynamic Overflow Reassignment (Case 1: Direct Overflow) ===")
    reset_completions()
    # Fill Van 1 close to capacity (e.g. 2100L at first stop)
    api_complete_stop("STOP_VLC_01", StopCompleteRequest(actual_litres=2100.0))
    # Try collecting 600L at next stop on Van 1 (Capacity 2500L -> remaining 400L)
    res_overflow = api_complete_stop("STOP_VLC_02", StopCompleteRequest(actual_litres=600.0))
    print(f"Case 1 status: {res_overflow.status}, collected: {res_overflow.actual_litres}L, overflow: {res_overflow.overflow_litres}L")
    assert res_overflow.status == "overflow_reassigned"
    assert res_overflow.actual_litres == 400.0
    assert res_overflow.overflow_litres == 200.0

    print("\n=== Testing Van Dynamic Overflow Reassignment (Case 2: Insufficient Capacity for Next Stop) ===")
    reset_completions()
    # Collect 450L at stop 1
    api_complete_stop("STOP_VLC_01", StopCompleteRequest(actual_litres=450.0))
    # Collect 1900L at stop 2 (Total = 2350L -> remaining = 150L). Next stop Alampur needs 421L (> 150L).
    res_next_limit = api_complete_stop("STOP_VLC_02", StopCompleteRequest(actual_litres=1900.0))
    print(f"Case 2 status: {res_next_limit.status}, collected: {res_next_limit.actual_litres}L, message: {res_next_limit.message}")
    print(f"Reassigned plan count: {len(res_next_limit.reassignment_plan or [])}")
    assert res_next_limit.status == "overflow_reassigned"
    assert res_next_limit.actual_litres == 1900.0
    assert res_next_limit.overflow_litres == 0.0
    assert res_next_limit.reassignment_plan is not None
    assert len(res_next_limit.reassignment_plan) > 0

    print("\n>>> ALL BACKEND TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_all()
