from datetime import datetime
from backend.db import status_col, events_col
import os
from dotenv import load_dotenv
load_dotenv()

G_MIN_LAT = float(os.getenv("GEOFENCE_MIN_LAT", -23.57))
G_MAX_LAT = float(os.getenv("GEOFENCE_MAX_LAT", -23.53))
G_MIN_LON = float(os.getenv("GEOFENCE_MIN_LON", -46.65))
G_MAX_LON = float(os.getenv("GEOFENCE_MAX_LON", -46.61))

BATTERY_THRESHOLD = 20.0   # < 20% -> manutenção

def inside_geofence(lat, lon):
    return (G_MIN_LAT <= lat <= G_MAX_LAT) and (G_MIN_LON <= lon <= G_MAX_LON)

def update_status_from_telemetry(telemetry):
    """
    telemetry: dict with keys moto_id, type, payload
    Updates status_col with consolidated status.
    """
    moto_id = telemetry.get("moto_id")
    ttype = telemetry.get("type")
    payload = telemetry.get("payload", {})
    now = datetime.utcnow().isoformat()

    # load previous status
    prev = status_col.find_one({"moto_id": moto_id}) or {}

    status = prev.get("status", "unknown")
    reasons = prev.get("reasons", [])

    # update fields snapshot
    snapshot = {
        "moto_id": moto_id,
        "last_update": now,
        "last_telemetry": telemetry,
    }

    # Battery rule
    if ttype == "battery":
        battery = float(payload.get("battery", 0))
        snapshot["battery"] = battery
        if battery < BATTERY_THRESHOLD:
            status = "maintenance_needed"
            reasons.append(f"battery_low ({battery:.1f}%)")
            events_col.insert_one({
                "moto_id": moto_id,
                "type": "maintenance_alert",
                "reason": "battery_low",
                "battery": battery,
                "timestamp": now
            })
        else:
            if status != "maintenance_forced":
                status = "ok"

    # GPS rule
    if ttype == "gps":
        lat = float(payload.get("lat", 0))
        lon = float(payload.get("lon", 0))
        snapshot["lat"] = lat
        snapshot["lon"] = lon
        if not inside_geofence(lat, lon):
            status = "alert_out_of_area"
            reasons.append("out_of_geofence")
            events_col.insert_one({
                "moto_id": moto_id,
                "type": "geo_alert",
                "reason": "out_of_geofence",
                "lat": lat,
                "lon": lon,
                "timestamp": now
            })
        else:
            if status.startswith("alert_"):
                status = "ok"

    # Accel rule
    if ttype == "accel":
        accel = float(payload.get("accel", 0))
        snapshot["accel"] = accel
        if accel > 2.5:
            snapshot["moving"] = True
        else:
            snapshot["moving"] = False

    # Parking sensor rule
    if ttype == "parking":
        spot_type = payload.get("spot_type")
        snapshot["spot_type"] = spot_type
        if spot_type == "maintenance":
            status = "maintenance_needed"
            reasons.append("parked_in_maintenance_spot")

    # 🚨 Diagnostic rule (Passo 4)
    if ttype == "diagnostic":
        fault = payload.get("fault", False)
        snapshot["diagnostic"] = payload
        if fault:
            status = "critical_fault"
            reasons.append("diagnostic_fault_detected")
            events_col.insert_one({
                "moto_id": moto_id,
                "type": "critical_fault",
                "reason": payload.get("description", "unknown_fault"),
                "timestamp": now
            })

    # Clean reasons (unique)
    reasons = list(dict.fromkeys(reasons))
    snapshot["status"] = status
    snapshot["reasons"] = reasons

    status_col.update_one({"moto_id": moto_id}, {"$set": snapshot}, upsert=True)
    return snapshot
