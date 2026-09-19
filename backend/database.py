import csv
import os
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "doodhroute.db")
DEMO_CSV_FILE = os.path.join(os.path.dirname(__file__), "demo_data.csv")

# Depot Definition
DEPOT = {
    "id": "MCC_01",
    "name": "Rajpura Milk Chilling Centre (MCC)",
    "latitude": 30.4840,
    "longitude": 76.5940,
    "collection_start": "04:30",
    "collection_end": "08:30",
    "service_time_minutes": 0
}

# 12 Village Level Collection Centres (VLCs) in Punjab
DEFAULT_CENTRES = [
    {"id": "VLC_01", "name": "Rampura VLC", "latitude": 30.4880, "longitude": 76.5700, "collection_start": "05:00", "collection_end": "06:00", "service_time_minutes": 8, "base_litres": 225, "farmers": 46},
    {"id": "VLC_02", "name": "Kheri VLC", "latitude": 30.4500, "longitude": 76.5600, "collection_start": "05:15", "collection_end": "06:15", "service_time_minutes": 10, "base_litres": 455, "farmers": 82},
    {"id": "VLC_03", "name": "Banur VLC", "latitude": 30.5550, "longitude": 76.7150, "collection_start": "05:00", "collection_end": "06:00", "service_time_minutes": 7, "base_litres": 165, "farmers": 34},
    {"id": "VLC_04", "name": "Tepla VLC", "latitude": 30.4200, "longitude": 76.6500, "collection_start": "05:30", "collection_end": "06:30", "service_time_minutes": 8, "base_litres": 380, "farmers": 68},
    {"id": "VLC_05", "name": "Ghanaur VLC", "latitude": 30.3300, "longitude": 76.6100, "collection_start": "05:15", "collection_end": "06:45", "service_time_minutes": 9, "base_litres": 410, "farmers": 74},
    {"id": "VLC_06", "name": "Shambhu VLC", "latitude": 30.4400, "longitude": 76.7200, "collection_start": "05:00", "collection_end": "06:30", "service_time_minutes": 8, "base_litres": 390, "farmers": 71},
    {"id": "VLC_07", "name": "Alampur VLC", "latitude": 30.5100, "longitude": 76.5200, "collection_start": "05:30", "collection_end": "06:30", "service_time_minutes": 9, "base_litres": 420, "farmers": 76},
    {"id": "VLC_08", "name": "Jansla VLC", "latitude": 30.4600, "longitude": 76.6700, "collection_start": "05:45", "collection_end": "07:00", "service_time_minutes": 8, "base_litres": 360, "farmers": 65},
    {"id": "VLC_09", "name": "Dharamgarh VLC", "latitude": 30.5300, "longitude": 76.6200, "collection_start": "05:00", "collection_end": "06:15", "service_time_minutes": 8, "base_litres": 385, "farmers": 69},
    {"id": "VLC_10", "name": "Chamaru VLC", "latitude": 30.3800, "longitude": 76.5500, "collection_start": "05:30", "collection_end": "06:45", "service_time_minutes": 9, "base_litres": 400, "farmers": 72},
    {"id": "VLC_11", "name": "Neelpur VLC", "latitude": 30.4700, "longitude": 76.5900, "collection_start": "05:15", "collection_end": "06:15", "service_time_minutes": 8, "base_litres": 375, "farmers": 67},
    {"id": "VLC_12", "name": "Ugani VLC", "latitude": 30.5100, "longitude": 76.6800, "collection_start": "05:30", "collection_end": "06:30", "service_time_minutes": 8, "base_litres": 376, "farmers": 70},
]

DEFAULT_VEHICLES = [
    {"id": "VAN_01", "name": "Van 1 (Eicher Pro - Blue)", "capacity_litres": 2500, "available": True, "start_location": "MCC_01"},
    {"id": "VAN_02", "name": "Van 2 (Tata 407 - Emerald)", "capacity_litres": 2500, "available": True, "start_location": "MCC_01"}
]

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS centres (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        collection_start TEXT NOT NULL,
        collection_end TEXT NOT NULL,
        service_time_minutes INTEGER NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS historical_collection (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        centre_id TEXT NOT NULL,
        date TEXT NOT NULL,
        litres_collected REAL NOT NULL,
        active_farmers INTEGER NOT NULL,
        FOREIGN KEY (centre_id) REFERENCES centres (id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        capacity_litres REAL NOT NULL,
        available BOOLEAN NOT NULL,
        start_location TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS stop_completions (
        stop_id TEXT PRIMARY KEY,
        centre_id TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        actual_litres REAL NOT NULL,
        driver_notes TEXT
    )
    """)

    conn.commit()
    conn.close()

def generate_demo_csv():
    """Creates demo_data.csv containing historical collection logs for 14 days."""
    fieldnames = ["centre_id", "centre_name", "latitude", "longitude", "collection_start", "collection_end", "service_time_minutes", "date", "litres_collected", "active_farmers"]
    
    rows = []
    base_date = datetime(2026, 9, 19)
    
    for c in DEFAULT_CENTRES:
        # Generate 14 days of realistic history
        # For Kheri VLC: 7-day avg is ~390L, yesterday was ~470L, today will predict 455L
        # For Rampura VLC: 7-day avg is ~210L, yesterday 220L, today will predict 225L
        # For Banur VLC: 7-day avg is ~170L, yesterday 160L, today will predict 165L
        for day_offset in range(14, 0, -1):
            date_str = (base_date - timedelta(days=day_offset - 1)).strftime("%Y-%m-%d")
            
            if c["id"] == "VLC_02": # Kheri: recent surge
                if day_offset == 1: # yesterday
                    litres = 470.0
                elif day_offset <= 7:
                    litres = 385.0 + ((day_offset % 3) * 10)
                else:
                    litres = 350.0 + ((day_offset % 4) * 8)
            elif c["id"] == "VLC_01": # Rampura
                if day_offset == 1:
                    litres = 220.0
                elif day_offset <= 7:
                    litres = 210.0 + ((day_offset % 3) * 5)
                else:
                    litres = 205.0
            elif c["id"] == "VLC_03": # Banur
                if day_offset == 1:
                    litres = 160.0
                elif day_offset <= 7:
                    litres = 170.0 - ((day_offset % 2) * 5)
                else:
                    litres = 168.0
            else:
                variation = ((day_offset * 7) % 15) - 7
                litres = float(c["base_litres"] + variation)
                
            rows.append({
                "centre_id": c["id"],
                "centre_name": c["name"],
                "latitude": c["latitude"],
                "longitude": c["longitude"],
                "collection_start": c["collection_start"],
                "collection_end": c["collection_end"],
                "service_time_minutes": c["service_time_minutes"],
                "date": date_str,
                "litres_collected": round(litres, 1),
                "active_farmers": c["farmers"]
            })
            
    with open(DEMO_CSV_FILE, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

def load_demo_into_db():
    init_db()
    if not os.path.exists(DEMO_CSV_FILE):
        generate_demo_csv()
        
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Clear existing
    cursor.execute("DELETE FROM centres")
    cursor.execute("DELETE FROM historical_collection")
    cursor.execute("DELETE FROM vehicles")
    
    # Insert centres
    for c in DEFAULT_CENTRES:
        cursor.execute("""
            INSERT OR REPLACE INTO centres (id, name, latitude, longitude, collection_start, collection_end, service_time_minutes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (c["id"], c["name"], c["latitude"], c["longitude"], c["collection_start"], c["collection_end"], c["service_time_minutes"]))
        
    # Insert vehicles
    for v in DEFAULT_VEHICLES:
        cursor.execute("""
            INSERT OR REPLACE INTO vehicles (id, name, capacity_litres, available, start_location)
            VALUES (?, ?, ?, ?, ?)
        """, (v["id"], v["name"], v["capacity_litres"], v["available"], v["start_location"]))
        
    # Read demo CSV
    with open(DEMO_CSV_FILE, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cursor.execute("""
                INSERT INTO historical_collection (centre_id, date, litres_collected, active_farmers)
                VALUES (?, ?, ?, ?)
            """, (row["centre_id"], row["date"], float(row["litres_collected"]), int(row["active_farmers"])))
            
    conn.commit()
    conn.close()

def get_centres() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM centres ORDER BY id")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    if not rows:
        load_demo_into_db()
        return get_centres()
    return rows

def get_vehicles() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles WHERE available = 1")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    if not rows:
        load_demo_into_db()
        return get_vehicles()
    return rows

def get_historical_for_centre(centre_id: str) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM historical_collection 
        WHERE centre_id = ? 
        ORDER BY date DESC
    """, (centre_id,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def record_stop_completion(centre_id: str, actual_litres: float, driver_notes: Optional[str] = None):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO stop_completions (stop_id, centre_id, completed_at, actual_litres, driver_notes)
        VALUES (?, ?, ?, ?, ?)
    """, (f"STOP_{centre_id}", centre_id, datetime.now().isoformat(), actual_litres, driver_notes or ""))
    conn.commit()
    conn.close()

def get_completed_stops() -> Dict[str, Dict[str, Any]]:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stop_completions")
    rows = cursor.fetchall()
    conn.close()
    return {r["centre_id"]: dict(r) for r in rows}

def reset_completions():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM stop_completions")
    conn.commit()
    conn.close()
