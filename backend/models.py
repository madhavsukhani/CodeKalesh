from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CollectionCentre(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    collection_start: str = "05:00"
    collection_end: str = "06:30"
    service_time_minutes: int = 8

class HistoricalRecord(BaseModel):
    centre_id: str
    date: str
    litres_collected: float
    active_farmers: int

class Vehicle(BaseModel):
    id: str
    name: str
    capacity_litres: float = 1000.0
    available: bool = True
    start_location: str = "MCC_01"

class StopDetail(BaseModel):
    stop_id: str
    centre_id: str
    name: str
    latitude: float
    longitude: float
    predicted_litres: float
    actual_litres: Optional[float] = None
    arrival_window: str
    estimated_arrival: str
    current_load_litres: float
    vehicle_capacity: float
    service_time_minutes: int
    is_completed: bool = False
    is_late: bool = False
    warning: Optional[str] = None

class RouteDetail(BaseModel):
    vehicle_id: str
    vehicle_name: str
    stops: List[str]
    stop_details: List[StopDetail]
    predicted_load_litres: float
    capacity_litres: float
    utilization_percent: float
    distance_km: float
    estimated_time_minutes: int
    late_stops: int
    capacity_warning: Optional[str] = None

class PredictionItem(BaseModel):
    centre_id: str
    name: str
    avg_7_day_litres: float
    avg_30_day_litres: float
    yesterday_litres: float
    predicted_litres: float
    active_farmers: int
    confidence: float
    risk: str  # "low", "medium", "high"
    risk_reason: str

class OptimizationRequest(BaseModel):
    vehicle_ids: Optional[List[str]] = ["VAN_01", "VAN_02"]
    depot_id: Optional[str] = "MCC_01"
    algorithm: Optional[str] = "ortools"  # "ortools" or "greedy"

class MetricsResponse(BaseModel):
    fixed_distance_km: float
    optimized_distance_km: float
    distance_reduction_percent: float
    fixed_capacity_utilization: float
    optimized_capacity_utilization: float
    fixed_late_stops: int
    optimized_late_stops: int
    fixed_milk_waiting_risk: str
    optimized_milk_waiting_risk: str
    total_predicted_milk: float
    total_centres: int
    vehicles_used: int
    estimated_cost_savings_inr: float
    co2_reduction_kg: float
    explanations: List[Dict[str, str]]

class StopCompleteRequest(BaseModel):
    actual_litres: Optional[float] = None
    driver_notes: Optional[str] = None


class OverflowReassignedStop(BaseModel):
    """Describes a single VLC stop that got stranded due to van overflow and was reassigned."""
    centre_id: str
    name: str
    stranded_litres: float          # predicted litres at this stop
    assigned_van_id: str            # VAN_01, VAN_02, or VAN_01_SECOND_RUN etc.
    assigned_van_name: str
    estimated_arrival: str          # e.g. "06:15 AM"
    is_second_run: bool = False     # True if the same van must do a second trip after depot dump
    can_reach_in_window: bool = True
    reason: str                     # Human-readable AI explanation


class StopCompleteResponse(BaseModel):
    """Response for POST /api/stops/{stop_id}/complete"""
    status: str                                             # "completed" | "overflow_reassigned"
    stop_id: str
    centre_id: str
    actual_litres: float                                    # what was actually collected (may be capped)
    overflow_litres: Optional[float] = None                 # litres left behind at VLC (only if overflow)
    message: str
    reassignment_plan: Optional[List[OverflowReassignedStop]] = None  # set when status == "overflow_reassigned"
    overflowed_van_id: Optional[str] = None
    overflowed_van_name: Optional[str] = None


class UserLoginRequest(BaseModel):
    username: str
    password: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    username: str
    name: str
    role: str                       # "supervisor" | "driver"
    van_id: Optional[str] = None    # "VAN_01" | "VAN_02" for drivers
    role_label: str
    avatar_color: str
