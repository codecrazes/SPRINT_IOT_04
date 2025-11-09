import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["mottu_iot"]

telemetry_col = db["telemetry"]   
events_col = db["events"]         
status_col = db["status_motos"]   
