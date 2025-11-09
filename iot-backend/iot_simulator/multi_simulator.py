# iot_simulator/multi_simulator_with_diagnostic.py
import threading
import time
import json
import random
from datetime import datetime
import paho.mqtt.client as mqtt
import argparse

MQTT_HOST = "127.0.0.1"
MQTT_PORT = 1883

class MotoSimulator(threading.Thread):
    def __init__(self, moto_id, mqtt_host=MQTT_HOST, mqtt_port=MQTT_PORT, freq=2.0):
        super().__init__()
        self.moto_id = moto_id
        self.freq = freq
        self.client = mqtt.Client(client_id=f"sim_{moto_id}", protocol=mqtt.MQTTv311, transport="tcp")
        self.client.on_message = self.on_message
        self.client.connect(mqtt_host, mqtt_port, 60)
        self.client.loop_start()
        self.client.subscribe(f"commands/{self.moto_id}")

        # estado inicial
        self.lat = -23.550520 + random.uniform(-0.01, 0.01)
        self.lon = -46.633308 + random.uniform(-0.01, 0.01)
        self.battery = random.uniform(30, 100)
        self.running = True
        self.maintenance_mode = False

    def random_walk(self, step=0.0005):
        self.lat += (random.random() - 0.5) * step
        self.lon += (random.random() - 0.5) * step

    def on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode("utf-8"))
            cmd = payload.get("command")
            if cmd == "force_maintenance":
                self.maintenance_mode = True
                print(f"[{self.moto_id}] forced maintenance ON")
            elif cmd == "release_maintenance":
                self.maintenance_mode = False
                print(f"[{self.moto_id}] forced maintenance OFF")
        except Exception as e:
            print("simulator on_message error", e)

    def publish(self, topic, obj):
        self.client.publish(topic, json.dumps(obj))
        print(f"[{self.moto_id}] publicou em {topic}: {obj}")

    def maybe_emit_diagnostic(self):
        # 5% chance de gerar uma falha crítica, 10% chance falha leve
        r = random.random()
        if r < 0.05:
            return {"fault": True, "code": "engine_fail", "severity": "high", "description": "Falha crítica no motor"}
        elif r < 0.15:
            return {"fault": True, "code": "battery_degradation", "severity": "medium", "description": "Desgaste de bateria detectado"}
        else:
            return {"fault": False}

    def run(self):
        print(f"[{self.moto_id}] simulador iniciado...")
        try:
            while self.running:
                # GPS
                self.random_walk()
                gps = {
                    "moto_id": self.moto_id,
                    "type": "gps",
                    "timestamp": datetime.utcnow().isoformat(),
                    "payload": {"lat": self.lat, "lon": self.lon, "speed": round(random.uniform(0, 40), 2)}
                }
                self.publish(f"sensors/gps/{self.moto_id}", gps)

                # Acelerômetro
                accel_val = round(random.uniform(0, 3.5), 2)
                accel = {
                    "moto_id": self.moto_id,
                    "type": "accel",
                    "timestamp": datetime.utcnow().isoformat(),
                    "payload": {"accel": accel_val}
                }
                self.publish(f"sensors/accel/{self.moto_id}", accel)

                # Bateria
                if self.maintenance_mode:
                    self.battery = max(0.0, self.battery - random.uniform(0.5, 1.5))
                else:
                    self.battery = max(0.0, self.battery - random.uniform(0.01, 0.2))

                batt = {
                    "moto_id": self.moto_id,
                    "type": "battery",
                    "timestamp": datetime.utcnow().isoformat(),
                    "payload": {"battery": round(self.battery, 2)}
                }
                self.publish(f"sensors/battery/{self.moto_id}", batt)

                # Parking (ocasional)
                if random.random() < 0.1:
                    spot_type = "maintenance" if random.random() < 0.05 else "normal"
                    parking = {
                        "moto_id": self.moto_id,
                        "type": "parking",
                        "timestamp": datetime.utcnow().isoformat(),
                        "payload": {"spot_type": spot_type}
                    }
                    self.publish(f"parking/spot/{self.moto_id}", parking)

                # Diagnostic sensor (novo) — publica sempre, com campo fault True/False
                diag = self.maybe_emit_diagnostic()
                diagnostic = {
                    "moto_id": self.moto_id,
                    "type": "diagnostic",
                    "timestamp": datetime.utcnow().isoformat(),
                    "payload": diag
                }
                self.publish(f"sensors/diagnostic/{self.moto_id}", diagnostic)

                time.sleep(self.freq)
        except KeyboardInterrupt:
            self.running = False
        finally:
            self.client.loop_stop()
            self.client.disconnect()

    def stop(self):
        self.running = False

def run_many(ids, freq=2.0):
    sims = []
    for id_ in ids:
        s = MotoSimulator(id_, freq=freq)
        s.start()
        sims.append(s)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("stopping sims")
        for s in sims:
            s.stop()
        for s in sims:
            s.join()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--ids", help="comma separated ids", default="MOTO1,MOTO2,MOTO3")
    parser.add_argument("--freq", type=float, default=2.0)
    args = parser.parse_args()
    ids = [x.strip() for x in args.ids.split(",") if x.strip()]
    run_many(ids, freq=args.freq)
