# backend/mqtt_client.py
import os
import json
from datetime import datetime

import paho.mqtt.client as mqtt

from backend.db import telemetry_col, events_col, status_col

# -------------------------------------------------------------------
# Configuração do broker MQTT
# -------------------------------------------------------------------

MQTT_BROKER = os.getenv("MQTT_BROKER", "127.0.0.1")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))


# -------------------------------------------------------------------
# Callbacks MQTT
# -------------------------------------------------------------------

def on_connect(client, userdata, flags, rc, properties=None):
    print(f"[MQTT] conectado ao broker {MQTT_BROKER}:{MQTT_PORT} rc={rc}")
    # 🔥 para debug, assina TUDO
    client.subscribe("#")
    print("[MQTT] tópico assinado para debug: '#' (todos os tópicos)")


def on_message(client, userdata, msg):
    # 1) decodifica payload
    try:
        payload_str = msg.payload.decode("utf-8")
        data = json.loads(payload_str)
        print(f"[MQTT] recebido de {msg.topic}: {data}")
    except Exception as e:
        print("[MQTT] erro ao decodificar payload:", e)
        return

    # meta
    data["_received_at"] = datetime.utcnow()
    data["_topic"] = msg.topic

    # 2) salva telemetria bruta
    try:
        telemetry_col.insert_one(data)
        print(f"[DB] inserido em telemetry: {data}")
    except Exception as e:
        print("[DB] erro ao inserir em telemetry:", e)

    # 3) tipo
    ttype = data.get("type")
    if not ttype:
        parts = msg.topic.split("/")
        if parts[0] == "sensors" and len(parts) > 1:
            ttype = parts[1]
        elif parts[0] == "parking":
            ttype = "parking"
        elif parts[0] == "cv":
            ttype = "cv_event"
        else:
            ttype = "unknown"

    moto_id = (
        data.get("moto_id")
        or data.get("id")
        or data.get("vehicle_id")
        or "unknown"
    )
    payload = data.get("payload") or {}

    standard = {
        "moto_id": moto_id,
        "type": ttype,
        "payload": payload,
        "timestamp": data.get("timestamp") or datetime.utcnow().isoformat(),
    }

    # 4) eventos CV → events_col
    if msg.topic.startswith("cv/") or ttype == "cv_event":
        try:
            events_col.insert_one(standard)
            print(f"[DB] inserido em events: {standard}")
        except Exception as e:
            print("[DB] erro ao inserir em events:", e)
        return

    # 5) atualiza status agregado em status_col
    try:
        updates = {
            "_received_at": datetime.utcnow(),
        }

        if ttype == "gps":
            updates["lat"] = payload.get("lat")
            updates["lng"] = payload.get("lon")   # simulador manda 'lon'
            updates["speed"] = payload.get("speed")

        if ttype == "battery":
            updates["battery"] = payload.get("battery")

        if ttype == "accel":
            updates["accel"] = payload.get("accel")

        if ttype == "diagnostic":
            updates["fault"] = payload.get("fault")
            updates["diag_code"] = payload.get("code")
            updates["diag_severity"] = payload.get("severity")

        status_col.update_one(
            {"moto_id": moto_id},
            {"$set": updates, "$setOnInsert": {"moto_id": moto_id}},
            upsert=True,
        )
        print(f"[STATUS] atualizado para {moto_id}: {updates}")

    except Exception as e:
        print("[STATUS] erro ao atualizar status:", e)


# -------------------------------------------------------------------
# Função para iniciar o loop MQTT (usada na main)
# -------------------------------------------------------------------

def start_mqtt_loop() -> mqtt.Client:
    client = mqtt.Client(client_id="backend_sub", protocol=mqtt.MQTTv311)
    client.on_connect = on_connect
    client.on_message = on_message

    print(f"[MQTT] conectando em {MQTT_BROKER}:{MQTT_PORT}...")
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()
    print("[MQTT] loop iniciado")
    return client
