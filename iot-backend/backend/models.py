from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class Telemetry(BaseModel):
    moto_id: str
    type: str       # 'gps', 'accel', 'battery', 'parking'
    timestamp: Optional[str]
    payload: dict

class CVEvent(BaseModel):
    camera_id: str
    event_type: str
    moto_id: Optional[str] = None
    bbox: Optional[list] = None
    timestamp: Optional[str] = None
    extra: Optional[dict] = None

class CommandRequest(BaseModel):
    command: str
    params: Optional[dict] = {}

# --- NOVO MODEL PARA ALERTA WHATSAPP
class AlertRequest(BaseModel):
    message: str
