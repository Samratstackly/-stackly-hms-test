# # main.py
# # --------------------------------------------------------------
# # 1. Django must be configured **first**, before any Django models are imported
# # --------------------------------------------------------------
# import fastapi_app.django_setup  # <-- sets DJANGO_SETTINGS_MODULE & calls django.setup()
# # -------------------------------------------------------------

# from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from contextlib import asynccontextmanager
# import os
# import json
# from typing import List, Dict, Any
# from datetime import datetime
# import asyncio

# # Import WebSocket service
# from fastapi_app.services.websocket_service import manager, notify_clients

# # ----------------------------------------------------------------
# # Import routers **after** Django is ready
# # ----------------------------------------------------------------
# from fastapi_app.routers import (
#     department, appointments, staff, new_registration, add_bloodgroup,
#     blood_donor, labreport, bed_group_list, staffmanagement, payroll,
#     attendance, stock, ambulance, billing, auth, security,
#     user_management, user_profile, medicine_allocation,
#     pharmacybilling, invoice_generator, notifications, invoice_pharmacy_billing
# )

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Startup
#     print("Starting Hospital Management System API...")
#     yield
#     # Shutdown
#     print("Shutting down Hospital Management System API...")

# # ----------------------------------------------------------------
# # FastAPI app
# # ----------------------------------------------------------------
# app = FastAPI(
#     title="Hospital Management System API",
#     description="Comprehensive HMS with real-time notifications",
#     version="1.0.0",
#     lifespan=lifespan
# )

# # ==================== CORS ====================
# # CORS Middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173",
#         "http://127.0.0.1:5173",
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# # ==================== STATIC FILES ====================

# # Profile pictures
# PROFILE_PIC_DIR = os.path.abspath("profile_pictures")
# os.makedirs(PROFILE_PIC_DIR, exist_ok=True)
# app.mount("/profile_pictures", StaticFiles(directory=PROFILE_PIC_DIR), name="profile_pictures")

# # Patient photos
# PATIENT_PHOTOS_DIR = os.path.join(BASE_DIR, "fastapi_app", "Patient_photos")
# os.makedirs(PATIENT_PHOTOS_DIR, exist_ok=True)
# app.mount("/static/patient_photos", StaticFiles(directory=PATIENT_PHOTOS_DIR), name="patient_photos")

# # Staff pictures
# STAFF_PICTURES_DIR = os.path.join(BASE_DIR, "fastapi_app", "staffs_pictures")
# os.makedirs(STAFF_PICTURES_DIR, exist_ok=True)
# app.mount("/static/staffs_pictures", StaticFiles(directory=STAFF_PICTURES_DIR), name="staffs_pictures")

# # Pharmacy invoices PDF directory
# PHARMACY_INVOICE_DIR = os.path.join(BASE_DIR, "fastapi_app", "pharmacy", "invoices", "pdf")
# os.makedirs(PHARMACY_INVOICE_DIR, exist_ok=True)
# app.mount("/pharmacy-invoices", StaticFiles(directory=PHARMACY_INVOICE_DIR), name="pharmacy_invoices")

# # Create pharmacy invoices subdirectory in media
# MEDIA_PHARMACY_DIR = os.path.join(BASE_DIR, "media", "pharmacy_invoices")
# os.makedirs(MEDIA_PHARMACY_DIR, exist_ok=True)
# app.mount("/media/pharmacy_invoices", StaticFiles(directory=MEDIA_PHARMACY_DIR), name="media_pharmacy_invoices")

# # Hospital invoices PDF directories
# GENERAL_INVOICE_DIR = os.path.join(BASE_DIR, "fastapi_app", "invoices_generator", "pdfs")
# os.makedirs(GENERAL_INVOICE_DIR, exist_ok=True)
# app.mount("/general-invoices", StaticFiles(directory=GENERAL_INVOICE_DIR), name="general_invoices")

# # Media directory for uploaded files
# MEDIA_DIR = os.path.join(BASE_DIR, "media")
# os.makedirs(MEDIA_DIR, exist_ok=True)

# # Generated invoices in media
# MEDIA_GENERATED_DIR = os.path.join(MEDIA_DIR, "generated_invoices")
# os.makedirs(MEDIA_GENERATED_DIR, exist_ok=True)
# app.mount("/media/generated_invoices", StaticFiles(directory=MEDIA_GENERATED_DIR), name="media_generated_invoices")

# # Mount main media directory
# app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

# # Optional: Legacy generated invoices directory
# GENERATED_INVOICES_DIR = os.path.join(BASE_DIR, "fastapi_app", "generated_invoices")
# os.makedirs(GENERATED_INVOICES_DIR, exist_ok=True)
# app.mount("/generated-invoices", StaticFiles(directory=GENERATED_INVOICES_DIR), name="generated_invoices")


# # ==================== HEALTH CHECK ====================
# @app.get("/")
# async def root():
#     return {
#         "message": "Hospital Management System API",
#         "status": "running",
#         "timestamp": datetime.now().isoformat(),
#         "version": "1.0.0"
#     }

# @app.get("/health")
# async def health_check():
#     return {
#         "status": "healthy",
#         "service": "HMS FastAPI",
#         "timestamp": datetime.now().isoformat(),
#         "websocket_connections": len(manager.active_connections)
#     }

# @app.get("/ws-status")
# async def websocket_status():
#     return {
#         "active_connections": len(manager.active_connections),
#         "connections": [
#             {
#                 "connected_at": data["connected_at"].isoformat(),
#                 "client_info": data["client_info"]
#             }
#             for data in manager.connection_data.values()
#         ]
#     }

# # ==================== WEBSOCKET ENDPOINT ====================
# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await manager.connect(websocket)
#     try:
#         # Send connection confirmation
#         await manager.send_personal_message(
#             json.dumps({
#                 "type": "connection_established",
#                 "message": "Connected to real-time notifications",
#                 "timestamp": datetime.now().isoformat(),
#                 "connection_id": id(websocket)
#             }),
#             websocket
#         )
        
#         # Keep connection alive
#         while True:
#             data = await websocket.receive_text()
#             # Optional: handle client messages
#             try:
#                 client_data = json.loads(data)
#                 if client_data.get("type") == "client_info":
#                     manager.connection_data[websocket]["client_info"] = client_data
#             except:
#                 pass  # Ignore invalid messages
                
#     except WebSocketDisconnect:
#         manager.disconnect(websocket)
#     except Exception as e:
#         print(f"WebSocket error: {e}")
#         manager.disconnect(websocket)

# # ==================== ROUTERS ====================
# app.include_router(department.router)
# app.include_router(appointments.router)
# app.include_router(staff.router)
# app.include_router(new_registration.router)
# app.include_router(add_bloodgroup.router)
# app.include_router(blood_donor.router)
# app.include_router(labreport.router)
# app.include_router(bed_group_list.router)
# app.include_router(staffmanagement.router)
# app.include_router(payroll.router)
# app.include_router(attendance.router)
# app.include_router(stock.router)

# # Set up ambulance notifications
# ambulance.set_notify_clients(notify_clients)
# app.include_router(ambulance.router)

# app.include_router(billing.router)
# app.include_router(auth.router)
# app.include_router(security.router)
# app.include_router(user_management.router)
# app.include_router(user_profile.router)
# app.include_router(medicine_allocation.router)
# app.include_router(pharmacybilling.router)
# app.include_router(invoice_generator.router)
# app.include_router(notifications.router)
# app.include_router(invoice_pharmacy_billing.router)

# # Make notify_clients available to routers
# app.state.notify_clients = notify_clients

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(
#         "main:app",
#         host="0.0.0.0",
#         port=8000,
#         reload=True,
#         log_level="info"
#     )

# main.py

from pathlib import Path
import Fastapi_app.django_setup  # <-- sets DJANGO_SETTINGS_MODULE & calls django.setup()
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import json
from typing import List, Dict, Any
from datetime import datetime
import asyncio
from django.db import close_old_connections
from fastapi import FastAPI, Request
from dotenv import load_dotenv
import os

load_dotenv()

# Import WebSocket service
from Fastapi_app.services.websocket_service import manager, notify_clients

# ----------------------------------------------------------------
# Import routers **after** Django is ready
# ----------------------------------------------------------------
from Fastapi_app.routers import (
    department, appointments, staff, new_registration, add_bloodgroup,
    blood_donor, labreport, bed_group_list, staffmanagement, payroll,
    attendance, stock, ambulance, billing, auth, security,
    user_management, user_profile, medicine_allocation,
    pharmacybilling, invoice_generator, notifications, invoice_pharmacy_billing, hospital_billing,
    dashboard, treatment_charges, laboratory, surgery, settings, charges
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Hospital Management System API...")
    yield
    # Shutdown
    print("Shutting down Hospital Management System API...")

# ----------------------------------------------------------------
# FastAPI app
# ----------------------------------------------------------------
app = FastAPI(
    title="Hospital Management System API",
    description="Comprehensive HMS with real-time notifications",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://13.59.204.169",               # production frontend (most important)
        "https://13.59.204.169",              # if you later add https
        "http://localhost:5173",              # dev - vite
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "X-Requested-With",
        "Set-Cookie",
        "Cookie",
    ],
    expose_headers=["Set-Cookie", "Authorization"],
    max_age=86400,  # 24 hours
)

# ==================== STATIC FILES ====================
PROFILE_PIC_DIR = os.path.abspath("profile_pictures")
os.makedirs(PROFILE_PIC_DIR, exist_ok=True)
app.mount(
    "/profile_pictures",
    StaticFiles(directory=PROFILE_PIC_DIR),
    name="profile_pictures",
)

PATIENT_PHOTOS_DIR = os.path.abspath("Fastapi_app/Patient_photos")
os.makedirs(PATIENT_PHOTOS_DIR, exist_ok=True)
app.mount(
    "/static/patient_photos", 
    StaticFiles(directory=PATIENT_PHOTOS_DIR), 
    name="patient_photos"
)

STAFF_PICTURES_DIR = os.path.abspath("Fastapi_app/staffs_pictures")
os.makedirs(STAFF_PICTURES_DIR, exist_ok=True)
app.mount(
    "/static/staffs_pictures",
    StaticFiles(directory=STAFF_PICTURES_DIR),
    name="staffs_pictures"
)
INVOICE_DIR = os.path.abspath("Fastapi_app/pharmacy/invoices")
os.makedirs(INVOICE_DIR, exist_ok=True)

app.mount("/invoices", StaticFiles(directory=INVOICE_DIR), name="invoices")

HOSPITALBILLING_DIR = os.path.abspath("Fastapi_app/invoices_generator")
os.makedirs(HOSPITALBILLING_DIR, exist_ok=True)

# Mount the static files directory so invoices can be served/downloaded
app.mount("/invoices_generator", StaticFiles(directory=HOSPITALBILLING_DIR), name="invoices_generator")
app.mount("/Fastapi_app/Staff_documents", StaticFiles(directory="Fastapi_app/Staff_documents"), name="staff_docs")

app.mount("/uploads", StaticFiles(directory="Fastapi_app/uploads"), name="uploads")

BASE_DIR = Path(__file__).resolve().parent.parent
media_dir = BASE_DIR / "media"
media_dir.mkdir(exist_ok=True)
(media_dir / "hospital_logo").mkdir(exist_ok=True)

# Mount static files
app.mount("/media", StaticFiles(directory=str(media_dir)), name="media")

# ==================== HEALTH CHECK ====================
@app.get("/")
async def root():
    return {
        "message": "Hospital Management System API",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "HMS FastAPI",
        "timestamp": datetime.now().isoformat(),
        "websocket_connections": len(manager.active_connections)
    }

@app.get("/ws-status")
async def websocket_status():
    return {
        "active_connections": len(manager.active_connections),
        "connections": [
            {
                "connected_at": data["connected_at"].isoformat(),
                "client_info": data["client_info"]
            }
            for data in manager.connection_data.values()
        ]
    }
@app.middleware("http")
async def django_db_lifecycle(request: Request, call_next):
    close_old_connections()
    response = await call_next(request)
    close_old_connections()
    return response
# ==================== WEBSOCKET ENDPOINT ====================
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send connection confirmation
        await manager.send_personal_message(
            json.dumps({
                "type": "connection_established",
                "message": "Connected to real-time notifications",
                "timestamp": datetime.now().isoformat(),
                "connection_id": id(websocket)
            }),
            websocket
        )
        
        # Keep connection alive
        while True:
            data = await websocket.receive_text()
            # Optional: handle client messages
            try:
                client_data = json.loads(data)
                if client_data.get("type") == "client_info":
                    manager.connection_data[websocket]["client_info"] = client_data
            except:
                pass  # Ignore invalid messages
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# ==================== ROUTERS ====================
app.include_router(department.router)
app.include_router(appointments.router)
app.include_router(staff.router)
app.include_router(new_registration.router)
app.include_router(add_bloodgroup.router)
app.include_router(blood_donor.router)
app.include_router(labreport.router)
app.include_router(bed_group_list.router)
app.include_router(staffmanagement.router)
app.include_router(payroll.router)
app.include_router(attendance.router)
app.include_router(stock.router)

# Set up ambulance notifications
ambulance.set_notify_clients(notify_clients)
app.include_router(ambulance.router)

app.include_router(billing.router)
app.include_router(auth.router)
app.include_router(security.router)
app.include_router(user_management.router)
app.include_router(user_profile.router)
app.include_router(medicine_allocation.router)
app.include_router(pharmacybilling.router)
app.include_router(invoice_generator.router)
app.include_router(notifications.router)
app.include_router(invoice_pharmacy_billing.router)
app.include_router(hospital_billing.router)
app.include_router(dashboard.router)
app.include_router(treatment_charges.router)
app.include_router(laboratory.router)
app.include_router(surgery.router)
app.include_router(settings.router)
app.include_router(charges.router)


# Make notify_clients available to routers
app.state.notify_clients = notify_clients

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
    