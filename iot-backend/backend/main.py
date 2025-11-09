from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bson import json_util
from backend.db import telemetry_col, events_col, status_col
from backend.models import CommandRequest
from backend.mqtt_client import start_mqtt_loop
from datetime import datetime
import json

# ============================================================
# 🚀 FASTAPI APP
# ============================================================

app = FastAPI(title="Mottu IoT Backend", version="2.0")

# CORS - permite acesso pelo app mobile Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # pode restringir depois se quiser
    allow_methods=["*"],
    allow_headers=["*"],
)

mqtt_client = None

# ============================================================
# 📦 MODELOS
# ============================================================

class AlertRequest(BaseModel):
    message: str


# ============================================================
# ⚙️ EVENTOS DE INICIALIZAÇÃO
# ============================================================

@app.on_event("startup")
def startup_event():
    global mqtt_client
    print("[APP] inicializando backend + MQTT...")
    mqtt_client = start_mqtt_loop()


@app.on_event("shutdown")
def shutdown_event():
    try:
        print("[APP] encerrando backend + MQTT...")
        mqtt_client.loop_stop()
        mqtt_client.disconnect()
    except Exception:
        pass


# ============================================================
# 🌐 ENDPOINTS DE API
# ============================================================

@app.get("/health")
def health():
    """Health check básico"""
    return {"status": "ok"}


@app.get("/api/sensors")
def list_sensors(limit: int = 100):
    """Lista a última telemetria de cada moto (status consolidado)."""
    docs = list(status_col.find().sort([("_received_at", -1)]).limit(limit))
    return json.loads(json_util.dumps(docs))


@app.get("/api/telemetry/latest")
def latest_telemetry(limit: int = 100):
    """Últimos registros de telemetria bruta."""
    docs = list(telemetry_col.find().sort([("_received_at", -1)]).limit(limit))
    return json.loads(json_util.dumps(docs))


@app.get("/api/events/latest")
def latest_events(limit: int = 100):
    """Últimos eventos registrados (regras + alertas manuais)."""
    docs = list(events_col.find().sort([("_created_at", -1)]).limit(limit))
    return json.loads(json_util.dumps(docs))


@app.get("/api/status/all")
def get_all_status():
    """Status de todas as motos."""
    docs = list(status_col.find({}))
    return json.loads(json_util.dumps(docs))


@app.get("/api/status/{moto_id}")
def status_moto(moto_id: str):
    """Status específico de uma moto."""
    doc = status_col.find_one({"moto_id": moto_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Moto não encontrada")
    return json.loads(json_util.dumps(doc))


@app.post("/api/motos/{moto_id}/command")
def send_command(moto_id: str, cmd: CommandRequest):
    """Envia comando MQTT para uma moto específica."""
    topic = f"commands/{moto_id}"
    payload = {
        "moto_id": moto_id,
        "command": cmd.command,
        "params": cmd.params,
    }
    try:
        mqtt_client.publish(topic, json.dumps(payload))
        print(f"[MQTT] comando enviado para {topic}: {payload}")
        return {"ok": True, "topic": topic, "payload": payload}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/motos/{moto_id}/alert")
def send_alert(moto_id: str, alert: AlertRequest):
    """
    Registra um alerta manual para a moto selecionada.
    Em vez de enviar WhatsApp, gravamos o alerta na coleção de eventos.
    """
    print(f"[ALERT] disparo de alerta para {moto_id}: {alert.message!r}")

    status_doc = status_col.find_one({"moto_id": moto_id})
    if not status_doc:
        raise HTTPException(status_code=404, detail="Moto não encontrada")

    now = datetime.utcnow().isoformat()

    event_doc = {
        "moto_id": moto_id,
        "type": "manual_alert",
        "reason": alert.message,
        "source": "mobile",
        "timestamp": now,
        "_created_at": now,
    }

    try:
        events_col.insert_one(event_doc)
        print("[ALERT] alerta manual registrado na base:", event_doc)
    except Exception as e:
        print("[ALERT] erro ao registrar alerta:", e)
        raise HTTPException(status_code=500, detail="Erro ao registrar alerta no banco")

    return {"ok": True, "event": event_doc}
