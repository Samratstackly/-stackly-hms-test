# settings.py - Update with complete endpoints
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from asgiref.sync import sync_to_async
from pathlib import Path
import json

from django.db import close_old_connections, connection

def check_db_connection():
    """Ensure database connection is alive"""
    try:
        close_old_connections()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return True
    except Exception:
        return False

def ensure_db_connection():
    """Reconnect if database connection is lost"""
    if not check_db_connection():
        try:
            connection.close()
            connection.connect()
        except Exception:
            pass

from HMS_backend.models import User, HospitalSettings, SecuritySettings
from .auth import get_current_user
from fastapi.responses import FileResponse

router = APIRouter()

# ==========================================================
# HELPERS
# ==========================================================
def check_admin_permission(current_user: User):
    if not (current_user.is_superuser or getattr(current_user, "role", None) == "admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

# ==========================================================
# GET ALL SETTINGS (SINGLE ENDPOINT)
# ==========================================================
class AllSettingsResponse(BaseModel):
    hospital: Dict[str, Any]

import traceback

@router.get("/all", response_model=AllSettingsResponse)
async def get_all_settings(current_user: User = Depends(get_current_user)):
    try:
        check_admin_permission(current_user)
        hospital_settings = await sync_to_async(lambda: (ensure_db_connection(), HospitalSettings.get_instance())[-1])()

        logo_url = None
        if hospital_settings.logo:
            logo_url = f"/media/{hospital_settings.logo}"

        hospital_data = {
            "id": hospital_settings.id,
            "hospital_name": hospital_settings.hospital_name or "Sravan Multispeciality Hospital",
            "logo": logo_url,
            "address": hospital_settings.address or "",
            "phone": hospital_settings.phone or "",
            "email": hospital_settings.email or "",
            "gstin": hospital_settings.gstin or "",
            "emergency_contact": hospital_settings.emergency_contact or "",
            "website": hospital_settings.website or "",
            "tagline": hospital_settings.tagline or "",
            "established_year": hospital_settings.established_year or None,
            "registration_number": hospital_settings.registration_number or "",
            "working_hours": hospital_settings.working_hours or {},
            "updated_at": hospital_settings.updated_at
        }

        return {"hospital": hospital_data}

    except Exception as e:
        print("=== /settings/all ERROR ===")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================================
# HOSPITAL SETTINGS
# ==========================================================
class HospitalInfoUpdate(BaseModel):
    hospital_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gstin: Optional[str] = None
    emergency_contact: Optional[str] = None
    website: Optional[str] = None
    tagline: Optional[str] = None
    established_year: Optional[int] = None
    registration_number: Optional[str] = None
    working_hours: Optional[Dict[str, Any]] = None

@router.put("/hospital")
async def update_hospital_info(
    data: HospitalInfoUpdate,
    current_user: User = Depends(get_current_user),
):
    check_admin_permission(current_user)
    settings = await sync_to_async(lambda: (ensure_db_connection(), HospitalSettings.get_instance())[-1])()
    
    update_data = data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    await sync_to_async(lambda: (ensure_db_connection(), settings.save())[-1])()
    
    return {"message": "Hospital information updated successfully"}

@router.post("/hospital/upload-logo")
async def upload_hospital_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    request: Request = None  # Add request to construct full URL
):
    check_admin_permission(current_user)

    settings = await sync_to_async(
        lambda: (ensure_db_connection(), HospitalSettings.get_instance())[-1]
    )()

    # Create uploads directory if it doesn't exist
    upload_dir = Path("media/hospital_logo")
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Validate file type
    allowed_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'}
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: PNG, JPG, JPEG, GIF, SVG, WEBP")

    # Validate file size (5MB max)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")

    # Generate unique filename
    unique_filename = f"hospital_logo_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_extension}"
    file_path = upload_dir / unique_filename

    # Save the file
    with open(file_path, "wb") as f:
        f.write(content)

    # Update hospital settings with relative path
    relative_path = f"hospital_logo/{unique_filename}"
    settings.logo = relative_path
    await sync_to_async(lambda: (ensure_db_connection(), settings.save())[-1])()

    # Construct full URL for frontend
    full_logo_url = f"{request.base_url}media/{relative_path}"

    return {
        "message": "Logo uploaded successfully",
        "logo_url": full_logo_url,  # <-- Full URL returned
        "filename": unique_filename
    }

@router.get("/hospital/logo")
async def get_hospital_logo():
    settings = await sync_to_async(lambda: (ensure_db_connection(), HospitalSettings.get_instance())[-1])()
    
    if not settings.logo:
        raise HTTPException(status_code=404, detail="Hospital logo not found")
    
    logo_path = Path("media") / settings.logo
    
    if not logo_path.exists():
        raise HTTPException(status_code=404, detail="Logo file not found")
    
    return FileResponse(logo_path)


# ==========================================================
# INITIALIZE DEFAULT SETTINGS
# ==========================================================
@router.post("/initialize")
async def initialize_defaults(current_user: User = Depends(get_current_user)):
    check_admin_permission(current_user)
    
    # Initialize hospital settings with defaults
    settings = await sync_to_async(lambda: (ensure_db_connection(), HospitalSettings.get_instance())[-1])()
    
    # Set default values if empty
    if not settings.hospital_name:
        settings.hospital_name = "Sravan Multispeciality Hospital"
    if not settings.address:
        settings.address = ""
    if not settings.phone:
        settings.phone = ""
    if not settings.email:
        settings.email = ""
    
    # Set default working hours if empty
    if not settings.working_hours:
        settings.working_hours = {
            "monday": {"start": "09:00", "end": "18:00", "open": True},
            "tuesday": {"start": "09:00", "end": "18:00", "open": True},
            "wednesday": {"start": "09:00", "end": "18:00", "open": True},
            "thursday": {"start": "09:00", "end": "18:00", "open": True},
            "friday": {"start": "09:00", "end": "18:00", "open": True},
            "saturday": {"start": "09:00", "end": "14:00", "open": True},
            "sunday": {"start": "09:00", "end": "14:00", "open": False},
        }
    
    # Set default system preferences

    
    await sync_to_async(lambda: (ensure_db_connection(), settings.save())[-1])()
    
    # Initialize security settings
    await sync_to_async(lambda: (ensure_db_connection(), SecuritySettings.objects.get_or_create(user=current_user))[-1])()
    
    return {"message": "Default settings initialized successfully"}