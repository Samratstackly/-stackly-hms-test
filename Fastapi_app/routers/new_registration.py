# import os
# import logging
# from datetime import datetime
# from typing import Optional

# from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, Path
# from fastapi.responses import JSONResponse
# from starlette.concurrency import run_in_threadpool
# from typing import List
# from HMS_backend import models
# from HMS_backend.models import Patient, Department, Staff, LabReport, MedicineAllocation

# from django.db.models import Q, F  # ← ADDED F
# from fastapi_app.routers.notifications import NotificationService
# router = APIRouter(prefix="/patients", tags=["Patients"])

# PHOTO_DIR = "fastapi_app/Patient_photos"
# os.makedirs(PHOTO_DIR, exist_ok=True)

# # Base URL for static files
# BACKEND_BASE_URL = "http://localhost:8000"  # Change in production

# def parse_date(date_str: Optional[str]):
#     if not date_str:
#         return None
#     try:
#         return datetime.strptime(date_str, "%Y-%m-%d").date()
#     except Exception:
#         return None

# def parse_optional_int(v):
#     return int(v) if v and str(v).strip() else None

# def parse_optional_float(v):
#     return float(v) if v and str(v).strip() else None


# # ---------- 1. GET Departments ----------
# @router.get("/departments")
# async def get_departments():
#     depts = await run_in_threadpool(
#         lambda: list(
#             Department.objects.filter(status="active")
#             .values("id", "name")
#             .order_by("name")
#         )
#     )
#     return {"departments": depts}


# # ---------- 2. GET Staff ----------
# @router.get("/staff")
# async def get_staff(department_id: int = Query(...)):
#     if department_id <= 0:
#         raise HTTPException(400, "department_id required")
#     await run_in_threadpool(Department.objects.get, id=department_id, status="active")
#     staff = await run_in_threadpool(
#         lambda: list(
#             Staff.objects.filter(department_id=department_id, status="active")
#             .values("id", "full_name", "designation")
#             .order_by("full_name")
#         )
#     )
#     return {"staff": staff}


# # ---------- 3. POST Register Patient ----------
# @router.post("/register")
# async def register_patient(
#     full_name: str = Form(...),
#     date_of_birth: Optional[str] = Form(None),
#     gender: Optional[str] = Form(None),
#     age: Optional[str] = Form(None),
#     marital_status: Optional[str] = Form(None),
#     address: Optional[str] = Form(None),
#     phone_number: Optional[str] = Form(None),
#     email_address: Optional[str] = Form(None),
#     national_id: Optional[str] = Form(None),
#     city: Optional[str] = Form(None),
#     country: Optional[str] = Form(None),
#     date_of_registration: Optional[str] = Form(None),
#     occupation: Optional[str] = Form(None),
#     weight_in_kg: Optional[str] = Form(None),
#     height_in_cm: Optional[str] = Form(None),
#     blood_group: Optional[str] = Form(None),
#     blood_pressure: Optional[str] = Form(None),
#     body_temperature: Optional[str] = Form(None),
#     consultation_type: Optional[str] = Form(None),
#     department_id: str = Form(...),
#     staff_id: str = Form(...),
#     appointment_type: Optional[str] = Form(None),
#     admission_date: Optional[str] = Form(None),
#     room_number: Optional[str] = Form(None),
#     test_report_details: Optional[str] = Form(None),
#     casualty_status: Optional[str] = Form(None),
#     reason_for_visit: Optional[str] = Form(None),
#     photo: Optional[UploadFile] = File(None),
# ):
#     dept_id = parse_optional_int(department_id)
#     staff_db_id = parse_optional_int(staff_id)
#     if not dept_id or not staff_db_id:
#         raise HTTPException(400, "Invalid department_id or staff_id")

#     department = await run_in_threadpool(Department.objects.get, id=dept_id)
#     staff = await run_in_threadpool(Staff.objects.get, id=staff_db_id)

#     patient = await run_in_threadpool(
#         Patient.objects.create,
#         full_name=full_name,
#         date_of_birth=parse_date(date_of_birth),
#         gender=gender,
#         age=parse_optional_int(age),
#         marital_status=marital_status,
#         address=address,
#         phone_number=phone_number,
#         email_address=email_address,
#         national_id=national_id,
#         city=city,
#         country=country,
#         date_of_registration=parse_date(date_of_registration),
#         occupation=occupation,
#         weight_in_kg=parse_optional_float(weight_in_kg),
#         height_in_cm=parse_optional_float(height_in_cm),
#         blood_group=blood_group,
#         blood_pressure=blood_pressure,
#         body_temperature=parse_optional_float(body_temperature),
#         consultation_type=consultation_type,
#         department=department,
#         staff=staff,
#         appointment_type=appointment_type,
#         admission_date=parse_date(admission_date),
#         room_number=room_number,
#         test_report_details=test_report_details,
#         casualty_status=(casualty_status or "Active").strip().title(),
#         reason_for_visit=reason_for_visit,
#     )

#     if photo and photo.filename:
#         filename = f"{patient.patient_unique_id}_{photo.filename}"
#         path = os.path.join(PHOTO_DIR, filename)
#         with open(path, "wb") as f:
#             f.write(await photo.read())
#         patient.photo = path.replace("\\", "/")
#         await run_in_threadpool(patient.save)
#     await NotificationService.send_patient_registered(patient)

#     return JSONResponse({
#         "success": True,
#         "patient_id": patient.patient_unique_id,
#         "message": "Patient registered"
#     })
    
# # ---------- 4. GET List All Patients (IPD) ----------
# @router.get("/", response_model=dict)
# async def list_patients(
#     search: Optional[str] = Query(None),
#     page: int = Query(1, ge=1),
#     limit: int = Query(10, ge=1, le=200)
# ):
#     try:
#         query = Patient.objects.all().order_by("-created_at")
#         if search:
#             query = query.filter(
#                 Q(full_name__icontains=search) |
#                 Q(phone_number__icontains=search) |
#                 Q(patient_unique_id__icontains=search)
#             )

#         total = await run_in_threadpool(query.count)
#         patients = await run_in_threadpool(
#             lambda: list(
#                 query[(page - 1) * limit : page * limit].values(
#                     "id",
#                     "patient_unique_id",
#                     "full_name",
#                     "date_of_registration",
#                     "department__name",      # ← NOW INCLUDED
#                     "staff__full_name",      # ← NOW INCLUDED
#                     "room_number",
#                     "appointment_type",
#                     "casualty_status",
#                     "photo",
#                     "created_at",
#                 )
#             )
#         )

#         for p in patients:
#             cs = (p.get("casualty_status") or "").strip().lower()
#             p["discharge"] = "Done" if cs in ["completed", "discharged"] else "Pending"
#             photo = p.get("photo")
#             p["photo_url"] = (
#                 f"{BACKEND_BASE_URL}/static/patient_photos/{os.path.basename(photo)}"
#                 if photo else None
#             )

#         return {
#             "patients": patients,
#             "total": total,
#             "page": page,
#             "limit": limit,
#             "pages": (total + limit - 1) // limit
#         }
#     except Exception as e:
#         logging.exception("list_patients error")
#         raise HTTPException(500, detail=str(e))


# # ---------- 4.1 GET OPD ----------
# @router.get("/opd")
# async def list_opd(
#     search: Optional[str] = Query(None),
#     page: int = Query(1, ge=1),
#     limit: int = Query(10, ge=1, le=200)
# ):
#     try:
#         qs = Patient.objects.filter(
#             Q(casualty_status__iexact="Completed") |
#             Q(casualty_status__iexact="Discharged")
#         ).order_by("-created_at")

#         if search:
#             qs = qs.filter(
#                 Q(full_name__icontains=search) |
#                 Q(patient_unique_id__icontains=search)
#             )

#         total = await run_in_threadpool(qs.count)
#         start = (page - 1) * limit
#         patients = await run_in_threadpool(
#             lambda: list(
#                 qs[start:start + limit].values(
#                     "id",
#                     "patient_unique_id",
#                     "full_name",
#                     "date_of_registration",
#                     "department__name",      # ← NOW INCLUDED
#                     "staff__full_name",      # ← NOW INCLUDED
#                     "room_number",
#                     "appointment_type",
#                     "casualty_status",
#                     "photo"
#                 )
#             )
#         )

#         for p in patients:
#             p["discharge"] = "Done"
#             photo = p.get("photo")
#             p["photo_url"] = (
#                 f"{BACKEND_BASE_URL}/static/patient_photos/{os.path.basename(photo)}"
#                 if photo else None
#             )
        
#         return {
#             "patients": patients,
#             "total": total,
#             "page": page,
#             "limit": limit,
#             "pages": (total + limit - 1) // limit,
#         }

#     except Exception as e:
#         logging.exception("list_opd error: %s", e)
#         raise HTTPException(status_code=500, detail=f"Failed to fetch OPD patients: {str(e)}")


# # ---------- 5. GET One Patient (BY ID OR PATxxxx) ----------
# @router.get("/{patient_id}")
# async def get_patient(patient_id: str = Path(...)):
#     try:
#         # Accept both Django PK (int) and patient_unique_id (str)
#         if patient_id.isdigit():
#             p = await run_in_threadpool(
#                 lambda: Patient.objects.select_related("department", "staff")
#                     .filter(id=int(patient_id))
#                     .annotate(
#                         department__name=F("department__name"),
#                         staff__full_name=F("staff__full_name")
#                     )
#                     .values(
#                         "id",
#                         "patient_unique_id", "full_name", "date_of_birth", "gender", "age",
#                         "marital_status", "address", "phone_number", "email_address",
#                         "national_id", "city", "country", "date_of_registration",
#                         "occupation", "weight_in_kg", "height_in_cm", "blood_group",
#                         "blood_pressure", "body_temperature", "consultation_type",
#                         "department_id", "staff_id", "appointment_type", "admission_date",
#                         "room_number", "test_report_details", "casualty_status",
#                         "reason_for_visit", "photo", "created_at",
#                         "department__name", "staff__full_name" ,"discharge_date" , # ← NOW RETURNED
#                     ).first()
#             )
#         else:
#             p = await run_in_threadpool(
#                 lambda: Patient.objects.select_related("department", "staff")
#                     .filter(patient_unique_id=patient_id)
#                     .annotate(
#                         department__name=F("department__name"),
#                         staff__full_name=F("staff__full_name")
#                     )
#                     .values(
#                         "id",
#                         "patient_unique_id", "full_name", "date_of_birth", "gender", "age",
#                         "marital_status", "address", "phone_number", "email_address",
#                         "national_id", "city", "country", "date_of_registration",
#                         "occupation", "weight_in_kg", "height_in_cm", "blood_group",
#                         "blood_pressure", "body_temperature", "consultation_type",
#                         "department_id", "staff_id", "appointment_type", "admission_date",
#                         "room_number", "test_report_details", "casualty_status",
#                         "reason_for_visit", "photo", "created_at",
#                         "department__name", "staff__full_name" ,"discharge_date" # ← NOW RETURNED
#                     ).first()
#             )

#         if not p:
#             raise HTTPException(404, "Patient not found")

#         # Format dates
#         for f in ["date_of_birth", "date_of_registration", "admission_date"]:
#             if p.get(f):
#                 d = p[f]
#                 if isinstance(d, datetime):
#                     p[f] = d.strftime("%m/%d/%Y")
#                 else:
#                     p[f] = f"{d.month:02d}/{d.day:02d}/{d.year}"

#         photo = p.get("photo")
#         p["photo_url"] = (
#             f"{BACKEND_BASE_URL}/static/patient_photos/{os.path.basename(photo)}"
#             if photo else None
#         )
#         cs = (p.get("casualty_status") or "").strip().lower()
#         p["discharge"] = "Done" if cs in ["completed", "discharged"] else "Pending"
#         return p
#     except Exception as e:
#         logging.exception("get_patient error")
#         raise HTTPException(500, detail=str(e))


# # ---------- 6. PUT Edit Patient ----------
# @router.put("/{patient_id}")
# async def edit_patient(
#     patient_id: str = Path(...),
#     full_name: Optional[str] = Form(None),
#     phone_number: Optional[str] = Form(None),
#     appointment_type: Optional[str] = Form(None),
#     status: Optional[str] = Form(None),
#     date_of_registration: Optional[str] = Form(None),
#     department_id: Optional[str] = Form(None),
#     staff_id: Optional[str] = Form(None),
#     photo: Optional[UploadFile] = File(None),
# ):
#     try:
#         patient = await run_in_threadpool(Patient.objects.get, patient_unique_id=patient_id)

#         if full_name is not None and full_name.strip():
#             patient.full_name = full_name.strip()
#         if phone_number is not None and phone_number.strip():
#             patient.phone_number = phone_number.strip()
#         if appointment_type is not None and appointment_type.strip():
#             patient.appointment_type = appointment_type.strip()

#         if status is not None:
#             cleaned = status.strip()
#             if cleaned:
#                 normalized_status = cleaned.title()
#                 patient.casualty_status = normalized_status
#                 if normalized_status in ["Completed", "Discharged"]:
#                     patient.consultation_type = "Out-patient"

#         if date_of_registration:
#             parsed = parse_date(date_of_registration)
#             if parsed:
#                 patient.date_of_registration = parsed

#         dept_id = parse_optional_int(department_id)
#         staff_db_id = parse_optional_int(staff_id)
#         if dept_id:
#             department = await run_in_threadpool(Department.objects.get, id=dept_id)
#             patient.department = department
#         if staff_db_id:
#             staff = await run_in_threadpool(Staff.objects.get, id=staff_db_id)
#             patient.staff = staff

#         if photo and photo.filename:
#             filename = f"{patient.patient_unique_id}_{photo.filename}"
#             path = os.path.join(PHOTO_DIR, filename)
#             with open(path, "wb") as f:
#                 f.write(await photo.read())
#             patient.photo = path.replace("\\", "/")
        
#         await run_in_threadpool(patient.save)
#         await NotificationService.send_patient_updated(patient)
#         return JSONResponse({"success": True, "message": "Updated"})
#     except Patient.DoesNotExist:
#         raise HTTPException(404, "Patient not found")
#     except Exception as e:
#         logging.exception("edit_patient error")
#         raise HTTPException(400, detail=str(e))


# # ---------- 7. DELETE Patient ----------
# @router.delete("/{patient_id}")
# async def delete_patient(patient_id: str = Path(...)):
#     try:
#         # Fetch patient
#         patient = await run_in_threadpool(Patient.objects.get, patient_unique_id=patient_id)
        
#         # Store photo path
#         photo_path = getattr(patient, "photo", None)
        
#         # Delete patient
#         await run_in_threadpool(patient.delete)
#         await NotificationService.send_patient_deleted({
#     'patient_unique_id': patient.patient_unique_id,
#     'full_name': patient.full_name
# })  
#         # Delete photo if exists
#         if photo_path and isinstance(photo_path, str) and os.path.exists(photo_path):
#             try:
#                 os.remove(photo_path)
#             except Exception as file_err:
#                 logging.warning(f"Failed to delete photo {photo_path}: {file_err}")
        
#         return {"success": True, "message": "Deleted"}
        
    
#     except Patient.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Patient not found")
#     except Exception as e:
#         logging.exception("delete_patient error")
#         raise HTTPException(status_code=500, detail=str(e))


# @router.get("/{patient_id}/diagnoses/", response_model=List[dict])
# def get_patient_diagnoses(patient_id: int):
#     """
#     Returns every LabReport that belongs to the patient
#     (whether it was created together with a medicine allocation or not).
#     """
#     try:
#         reports = (
#             LabReport.objects
#             .select_related("patient")
#             .filter(patient__id=patient_id)
#             .values(
#                 "id",
#                 "test_type",          # reportType
#                 "created_at",         # date
#                 "status",
#                 "result",             # description (or notes)
#             )
#         )
#         # Format exactly like the mock data
#         return [
#             {
#                 "reportType": r["test_type"],
#                 "date": r["created_at"].strftime("%d %b %Y") if r["created_at"] else "-",
#                 "description": r["result"] or "No notes yet",
#                 "status": r["status"].capitalize(),
#             }
#             for r in reports
#         ]
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# # --------------------------------------------------------------
# # 2. PRESCRIPTIONS (medicine allocations)
# # --------------------------------------------------------------
# @router.get("/{patient_id}/prescriptions/", response_model=List[dict])
# def get_patient_prescriptions(patient_id: int):
#     """
#     Returns every MedicineAllocation for the patient.
#     """
#     try:
#         allocs = (
#             MedicineAllocation.objects
#             .select_related("patient", "staff")
#             .filter(patient__id=patient_id)
#             .values(
#                 "allocation_date",
#                 "medicine_name",
#                 "dosage",
#                 "quantity",
#                 "frequency",
#                 "time",
#                 "duration",
#             )
#         )
#         return [
#             {
#                 "date": a["allocation_date"].strftime("%d %b %Y") if a["allocation_date"] else "-",
#                 "prescription": a["medicine_name"],
#                 "dosage": f"{a['dosage']} {a['quantity'] or ''}".strip(),
#                 "timing": f"{a['frequency'] or ''} {a['time'] or ''}".strip(),
#                 "status": "Completed",          # you can add a real status field later
#             }
#             for a in allocs
#         ]
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# # --------------------------------------------------------------
# # 3. TEST REPORTS (lab reports – same as diagnoses but with extra fields)
# # --------------------------------------------------------------
# @router.get("/{patient_id}/test-reports/", response_model=List[dict])
# def get_patient_test_reports(patient_id: int):
#     try:
#         reports = (
#             LabReport.objects
#             .select_related("patient")
#             .filter(patient__id=patient_id)
#             .values(
#                 "created_at",
#                 "test_type",
#                 "department",
#                 "status",
#             )
#         )
#         # Helper to get month name
#         def month_name(dt):
#             return dt.strftime("%B") if dt else "—"

#         return [
#             {
#                 "dateTime": r["created_at"].strftime("%Y-%m-%d %I:%M %p") if r["created_at"] else "—",
#                 "month": month_name(r["created_at"]),
#                 "testType": r["test_type"],
#                 "department": r["department"] or "General",
#                 "status": r["status"].capitalize(),
#             }
#             for r in reports
#         ]
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

#Fastapi_app/routers/new_registration.py
import os
import logging
import sys
from datetime import datetime
from typing import Optional
import uuid
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, Path
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from typing import List
from HMS_backend import models
from HMS_backend.models import Patient, Department, Staff, LabReport, MedicineAllocation, PatientHistory
from django.db.models import Q, F # ← ADDED F
from Fastapi_app.routers.notifications import NotificationService
from pathlib import Path as PathLib
from asgiref.sync import sync_to_async
# Django setup
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_project.settings")
import django
django.setup()
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
router = APIRouter(prefix="/patients", tags=["Patients"])
PHOTO_DIR = "Fastapi_app/Patient_photos"
os.makedirs(PHOTO_DIR, exist_ok=True)
# Base URL for static files
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")
def parse_date(date_str: Optional[str]):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except Exception:
        return None
def parse_optional_int(v):
    return int(v) if v and str(v).strip() else None
def parse_optional_float(v):
    return float(v) if v and str(v).strip() else None
# ---------- 1. GET Departments ----------
@router.get("/departments")
async def get_departments():
    @sync_to_async
    def fetch_depts():
        ensure_db_connection()
        return list(
            Department.objects.filter(status="active")
            .values("id", "name")
            .order_by("name")
        )
   
    depts = await fetch_depts()
    return {"departments": depts}
# ---------- 2. GET Staff ----------
@router.get("/staff")
async def get_staff(department_id: int = Query(...)):
    if department_id <= 0:
        raise HTTPException(400, "department_id required")
   
    @sync_to_async
    def validate_dept():
        ensure_db_connection()
        return Department.objects.get(id=department_id, status="active")
   
    await validate_dept()
   
    @sync_to_async
    def fetch_staff():
        ensure_db_connection()
        return list(
            Staff.objects.filter(
                department_id=department_id,
                status="active",
                designation__iexact="Doctor" # ← ONLY DOCTORS
            )
            .values("id", "full_name", "designation")
            .order_by("full_name")
        )
   
    staff = await fetch_staff()
    return {"staff": staff}
# ---------- 3. POST Register Patient ----------
@router.post("/register")
async def register_patient(
    full_name: str = Form(...),
    date_of_birth: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    age: Optional[str] = Form(None),
    marital_status: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    email_address: Optional[str] = Form(None),
    national_id: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    date_of_registration: Optional[str] = Form(None),
    occupation: Optional[str] = Form(None),
    weight_in_kg: Optional[str] = Form(None),
    height_in_cm: Optional[str] = Form(None),
    blood_group: Optional[str] = Form(None),
    blood_pressure: Optional[str] = Form(None),
    body_temperature: Optional[str] = Form(None),
    consultation_type: Optional[str] = Form(None),
    department_id: str = Form(...),
    staff_id: str = Form(...),
    appointment_type: Optional[str] = Form(None),
    admission_date: Optional[str] = Form(None),
    room_number: Optional[str] = Form(None),
    test_report_details: Optional[str] = Form(None),
    casualty_status: Optional[str] = Form(None),
    reason_for_visit: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
):
    dept_id = parse_optional_int(department_id)
    staff_db_id = parse_optional_int(staff_id)
    if not dept_id or not staff_db_id:
        raise HTTPException(400, "Invalid department_id or staff_id")
    @sync_to_async
    def get_department():
        ensure_db_connection()
        return Department.objects.get(id=dept_id)
   
    department = await get_department()
   
    @sync_to_async
    def get_staff_member():
        ensure_db_connection()
        return Staff.objects.get(id=staff_db_id)
   
    staff = await get_staff_member()
    @sync_to_async
    def create_patient():
        ensure_db_connection()
        return Patient.objects.create(
            full_name=full_name,
            date_of_birth=parse_date(date_of_birth),
            gender=gender,
            age=parse_optional_int(age),
            marital_status=marital_status,
            address=address,
            phone_number=phone_number,
            email_address=email_address,
            national_id=national_id,
            city=city,
            country=country,
            date_of_registration=parse_date(date_of_registration),
            occupation=occupation,
            weight_in_kg=parse_optional_float(weight_in_kg),
            height_in_cm=parse_optional_float(height_in_cm),
            blood_group=blood_group,
            blood_pressure=blood_pressure,
            body_temperature=parse_optional_float(body_temperature),
            consultation_type=consultation_type,
            department=department,
            staff=staff,
            appointment_type=appointment_type,
            admission_date=parse_date(admission_date),
            room_number=room_number,
            test_report_details=test_report_details,
            casualty_status=(casualty_status or "Active").strip().title(),
            reason_for_visit=reason_for_visit,
        )
    patient = await create_patient()
    # History is automatically created in Patient.save() method when patient is registered
    if photo and photo.filename:
        # Generate new filename format: First4CharsXXXXPIC.ext
        # Get first 4 characters of name, uppercase, pad if shorter
        name_part = patient.full_name.upper()
        if len(name_part) >= 4:
            first_four = name_part[:4]
        else:
            # If name is shorter than 4 chars, pad with underscores
            first_four = name_part.ljust(4, '_')
       
        # Generate 4-character unique ID (uppercase)
        unique_id = str(uuid.uuid4().hex)[:4].upper() # Using hex for cleaner output
       
        # Get file extension
        original_filename = photo.filename
        file_extension = PathLib(original_filename).suffix.lower() if original_filename else ".jpg"
       
        # Format: First4CharsXXXXPIC.ext
        filename = f"{first_four}{unique_id}PIC{file_extension}"
       
        path = os.path.join(PHOTO_DIR, filename)
       
        # Create directory if it doesn't exist
        os.makedirs(PHOTO_DIR, exist_ok=True)
       
        with open(path, "wb") as f:
            content = await photo.read()
            f.write(content)
       
        patient.photo = path.replace("\\", "/")
        @sync_to_async
        def save_photo():
            ensure_db_connection()
            patient.save()
       
        await save_photo()
    await NotificationService.send_patient_registered(patient)
    return JSONResponse({
        "success": True,
        "patient_id": patient.patient_unique_id,
        "message": "Patient registered"
    })
   
# ---------- 4. GET List All Patients (IPD) ----------
@router.get("/", response_model=dict)
async def list_patients(
    search: Optional[str] = Query(None),
    type: Optional[str] = Query(None, description="Filter by patient type: In-patient or Out-patient"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=200)
):
    try:
        @sync_to_async
        def build_query():
            ensure_db_connection()
            query = Patient.objects.all().order_by("-created_at")
           
            # Add type filter if provided
            if type:
                # Try to match the patient_type field
                query = query.filter(patient_type__iexact=type)
           
            if search:
                query = query.filter(
                    Q(full_name__icontains=search) |
                    Q(phone_number__icontains=search) |
                    Q(patient_unique_id__icontains=search)
                )
           
            return query
       
        query = await build_query()
       
        total = await run_in_threadpool(lambda: (ensure_db_connection(), query.count())[1])
        patients = await run_in_threadpool(
            lambda: (ensure_db_connection(), list(
                query[(page - 1) * limit : page * limit].values(
                    "id",
                    "patient_unique_id",
                    "full_name",
                    "date_of_registration",
                    "department__name",
                    "staff__full_name",
                    "room_number",
                    "appointment_type",
                    "casualty_status",
                    "patient_type", # ← ADD THIS FIELD
                    "photo",
                    "created_at",
                )
            ))[1]
        )
        for p in patients:
            cs = (p.get("casualty_status") or "").strip().lower()
            p["discharge"] = "Done" if cs in ["completed", "discharged"] else "Pending"
            photo = p.get("photo")
            p["photo_url"] = (
                f"{BACKEND_BASE_URL}/static/patient_photos/{os.path.basename(photo)}"
                if photo else None
            )
            # If patient_type is None, set a default based on appointment_type
            if not p.get("patient_type"):
                if p.get("appointment_type") == "OPD":
                    p["patient_type"] = "Out-patient"
                else:
                    p["patient_type"] = "In-patient"
        return {
            "patients": patients,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        logging.exception("list_patients error")
        raise HTTPException(500, detail=str(e))
# ---------- 4.1 GET OPD ----------
@router.get("/opd")
async def list_opd(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=200)
):
    try:
        @sync_to_async
        def build_opd_query():
            ensure_db_connection()
            qs = Patient.objects.filter(
                Q(casualty_status__iexact="Completed") |
                Q(casualty_status__iexact="Discharged")
            ).order_by("-created_at")
            if search:
                qs = qs.filter(
                    Q(full_name__icontains=search) |
                    Q(patient_unique_id__icontains=search)
                )
            return qs
       
        qs = await build_opd_query()
        total = await run_in_threadpool(lambda: (ensure_db_connection(), qs.count())[1])
        start = (page - 1) * limit
        patients = await run_in_threadpool(
            lambda: (ensure_db_connection(), list(
                qs[start:start + limit].values(
                    "id",
                    "patient_unique_id",
                    "full_name",
                    "date_of_registration",
                    "department__name",
                    "staff__full_name",
                    "room_number",
                    "appointment_type",
                    "casualty_status",
                    "patient_type", # ← ADD THIS FIELD
                    "photo"
                )
            ))[1]
        )
        for p in patients:
            p["discharge"] = "Done"
            photo = p.get("photo")
            p["photo_url"] = (
                f"{BACKEND_BASE_URL}/static/patient_photos/{os.path.basename(photo)}"
                if photo else None
            )
            # If patient_type is None, set a default
            if not p.get("patient_type"):
                if p.get("appointment_type") == "OPD":
                    p["patient_type"] = "Out-patient"
                else:
                    p["patient_type"] = "In-patient"
       
        return {
            "patients": patients,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit,
        }
    except Exception as e:
        logging.exception("list_opd error: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to fetch OPD patients: {str(e)}")
# ---------- 5. GET One Patient (BY ID OR PATxxxx) ----------
@router.get("/{patient_id}")
async def get_patient(patient_id: str = Path(...)):
    try:
        if patient_id.isdigit():
            @sync_to_async
            def get_by_id():
                ensure_db_connection()
                return Patient.objects.select_related("department", "staff").get(id=int(patient_id))
           
            patient = await get_by_id()
        else:
            @sync_to_async
            def get_by_uid():
                ensure_db_connection()
                return Patient.objects.select_related("department", "staff").get(patient_unique_id=patient_id)
           
            patient = await get_by_uid()
        @sync_to_async
        def get_bed():
            ensure_db_connection()
            return patient.beds.first()
       
        bed = await get_bed()
        if bed:
            @sync_to_async
            def refresh_bed_group():
                ensure_db_connection()
                bed.bed_group.refresh_counts()
           
            await refresh_bed_group()
        p = {
            "id": patient.id,
            "patient_unique_id": patient.patient_unique_id,
            "full_name": patient.full_name,
            "date_of_birth": patient.date_of_birth,
            "gender": patient.gender,
            "age": patient.age,
            "marital_status": patient.marital_status,
            "address": patient.address,
            "phone_number": patient.phone_number,
            "email_address": patient.email_address,
            "national_id": patient.national_id,
            "city": patient.city,
            "country": patient.country,
            "date_of_registration": patient.date_of_registration,
            "occupation": patient.occupation,
            "weight_in_kg": patient.weight_in_kg,
            "height_in_cm": patient.height_in_cm,
            "blood_group": patient.blood_group,
            "blood_pressure": patient.blood_pressure,
            "body_temperature": patient.body_temperature,
            "consultation_type": patient.consultation_type,
            "department_id": patient.department_id,
            "staff_id": patient.staff_id,
            "appointment_type": patient.appointment_type,
            "admission_date": patient.admission_date,
            "discharge_date": patient.discharge_date,
            "room_number": patient.room_number,
            "test_report_details": patient.test_report_details,
            "casualty_status": patient.casualty_status,
            "reason_for_visit": patient.reason_for_visit,
            "photo": str(patient.photo) if patient.photo else None,
            "created_at": patient.created_at,
            "department__name": patient.department.name if patient.department else None,
            "staff__full_name": patient.staff.full_name if patient.staff else None,
            "bed_group": None,
            "bed_number": None,
        }
        p["staff__full_name"] = patient.staff.full_name if patient.staff else None
        if bed:
            p["bed_group"] = bed.bed_group.bedGroup
            p["bed_number"] = bed.bed_number
        # Format dates
        for f in ["date_of_birth", "date_of_registration", "admission_date", "discharge_date"]:
            if p.get(f):
                d = p[f]
                p[f] = d.strftime("%m/%d/%Y")
        if p["photo"]:
            p["photo_url"] = f"{BACKEND_BASE_URL}/static/patient_photos/{os.path.basename(p['photo'])}"
        else:
            p["photo_url"] = None
        cs = (p.get("casualty_status") or "").strip().lower()
        p["discharge"] = "Done" if cs in ["completed", "discharged"] else "Pending"
        return p
    except Patient.DoesNotExist:
        raise HTTPException(404, "Patient not found")
    except Exception as e:
        logging.exception("get_patient error")
        raise HTTPException(500, detail=str(e))
# ---------- 6. PUT Edit Patient ----------
@router.put("/{patient_id}")
async def edit_patient(
    patient_id: str = Path(...),
    full_name: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    appointment_type: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    date_of_registration: Optional[str] = Form(None),
    department_id: Optional[str] = Form(None),
    staff_id: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
):
    try:
        @sync_to_async
        def get_patient_edit():
            ensure_db_connection()
            return Patient.objects.get(patient_unique_id=patient_id)
       
        patient = await get_patient_edit()
        if full_name is not None and full_name.strip():
            patient.full_name = full_name.strip()
        if phone_number is not None and phone_number.strip():
            patient.phone_number = phone_number.strip()
        if appointment_type is not None and appointment_type.strip():
            patient.appointment_type = appointment_type.strip()
        if status is not None:
            cleaned = status.strip()
            if cleaned:
                normalized_status = cleaned.title()
                patient.casualty_status = normalized_status
                if normalized_status in ["Completed", "Discharged"]:
                    patient.patient_type = "Out-patient"
                else:
                    patient.patient_type = "in-patient"
       
        if date_of_registration:
            parsed = parse_date(date_of_registration)
            if parsed:
                patient.date_of_registration = parsed
        dept_id = parse_optional_int(department_id)
        staff_db_id = parse_optional_int(staff_id)
        if dept_id:
            @sync_to_async
            def get_dept_edit():
                ensure_db_connection()
                return Department.objects.get(id=dept_id)
           
            department = await get_dept_edit()
            patient.department = department
        if staff_db_id:
            @sync_to_async
            def get_staff_edit():
                ensure_db_connection()
                return Staff.objects.get(id=staff_db_id)
           
            staff = await get_staff_edit()
            patient.staff = staff
        if photo and photo.filename:
            # Delete old photo if exists
            if patient.photo:
                try:
                    # Get the actual file path from the ImageFieldFile object
                    old_photo_path = patient.photo.path # Use .path attribute for Django FileField/ImageField
                    if os.path.exists(old_photo_path):
                        os.remove(old_photo_path)
                except Exception as e:
                    logging.warning(f"Failed to delete old photo: {e}")
           
            # Generate new filename format: First4CharsXXXXPIC.ext
            # Use updated full_name if provided, otherwise existing name
            name_to_use = full_name.strip() if full_name and full_name.strip() else patient.full_name
           
            # Get first 4 characters of name, uppercase, pad if shorter
            name_part = name_to_use.upper()
            if len(name_part) >= 4:
                first_four = name_part[:4]
            else:
                # If name is shorter than 4 chars, pad with underscores
                first_four = name_part.ljust(4, '_')
           
            # Generate 4-character unique ID (uppercase)
            unique_id = str(uuid.uuid4().hex)[:4].upper() # Using hex for cleaner output
           
            # Get file extension
            original_filename = photo.filename
            file_extension = PathLib(original_filename).suffix.lower() if original_filename else ".jpg"
           
            # Format: First4CharsXXXXPIC.ext
            filename = f"{first_four}{unique_id}PIC{file_extension}"
           
            path = os.path.join(PHOTO_DIR, filename)
           
            # Create directory if it doesn't exist
            os.makedirs(PHOTO_DIR, exist_ok=True)
           
            with open(path, "wb") as f:
                content = await photo.read()
                f.write(content)
           
            # Save the new photo path to the patient object
            patient.photo = path.replace("\\", "/")
       
        @sync_to_async
        def save_patient_edit():
            ensure_db_connection()
            patient.save()
       
        await save_patient_edit()
        await NotificationService.send_patient_updated(patient)
        return JSONResponse({"success": True, "message": "Updated"})
    except Patient.DoesNotExist:
        raise HTTPException(404, "Patient not found")
    except Exception as e:
        logging.exception("edit_patient error")
        raise HTTPException(400, detail=str(e))
# ---------- 8. GET Patient History ----------
@router.get("/{patient_id}/history")
async def get_patient_history(
    patient_id: str = Path(...),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get history records for a specific patient
    History is automatically created at:
    1. Registration time
    2. When patient is moved back to in-patient from out-patient
    """
    try:
        # Find patient by ID or patient_unique_id
        if patient_id.isdigit():
            @sync_to_async
            def get_patient_history_id():
                ensure_db_connection()
                return Patient.objects.get(id=int(patient_id))
           
            patient = await get_patient_history_id()
        else:
            @sync_to_async
            def get_patient_history_uid():
                ensure_db_connection()
                return Patient.objects.get(patient_unique_id=patient_id)
           
            patient = await get_patient_history_uid()
       
        # Get history records for this patient
        @sync_to_async
        def get_history_qs():
            ensure_db_connection()
            return patient.history_records.all().order_by("-created_at")
       
        history_qs = await get_history_qs()
       
        # Get total count
        total = await run_in_threadpool(lambda: (ensure_db_connection(), history_qs.count())[1])
       
        # Get paginated results
        start = (page - 1) * limit
        end = start + limit
       
        @sync_to_async
        def fetch_history():
            ensure_db_connection()
            return list(
                history_qs[start:end].values(
                    "id",
                    "patient_name",
                    "doctor",
                    "department",
                    "status",
                    "created_at"
                )
            )
       
        history = await fetch_history()
       
        # Format dates
        for record in history:
            if record["created_at"]:
                record["created_at"] = record["created_at"].strftime("%Y-%m-%d %H:%M:%S")
       
        return {
            "patient_id": patient.patient_unique_id,
            "patient_name": patient.full_name,
            "current_status": patient.casualty_status,
            "current_patient_type": patient.patient_type,
            "history": history,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
       
    except Patient.DoesNotExist:
        raise HTTPException(404, "Patient not found")
    except Exception as e:
        logging.exception("get_patient_history error")
        raise HTTPException(500, detail=str(e))
@router.get("/{patient_id}/diagnoses/", response_model=List[dict])
def get_patient_diagnoses(patient_id: int):
    """
    Returns every LabReport that belongs to the patient
    (whether it was created together with a medicine allocation or not).
    """
    ensure_db_connection()
    try:
        reports = (
            LabReport.objects
            .select_related("patient")
            .filter(patient__id=patient_id)
            .values(
                "id",
                "test_type", # reportType
                "created_at", # date
                "status",
                "result", # description (or notes)
            )
        )
        # Format exactly like the mock data
        return [
            {
                "reportType": r["test_type"],
                "date": r["created_at"].strftime("%d %b %Y") if r["created_at"] else "-",
                "description": r["result"] or "No notes yet",
                "status": r["status"].capitalize(),
            }
            for r in reports
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# --------------------------------------------------------------
# 2. PRESCRIPTIONS (medicine allocations)
# --------------------------------------------------------------
@router.get("/{patient_id}/prescriptions/", response_model=List[dict])
def get_patient_prescriptions(patient_id: int):
    """
    Returns every MedicineAllocation for the patient.
    """
    ensure_db_connection()
    try:
        allocs = (
            MedicineAllocation.objects
            .select_related("patient", "staff")
            .filter(patient__id=patient_id)
            .values(
                "allocation_date",
                "medicine_name",
                "dosage",
                "quantity",
                "frequency",
                "time",
                "duration",
            )
        )
        return [
            {
                "date": a["allocation_date"].strftime("%d %b %Y") if a["allocation_date"] else "-",
                "prescription": a["medicine_name"],
                "dosage": f"{a['dosage']} {a['quantity'] or ''}".strip(),
                "timing": f"{a['frequency'] or ''} {a['time'] or ''}".strip(),
                "status": "Completed", # you can add a real status field later
            }
            for a in allocs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# --------------------------------------------------------------
# 3. TEST REPORTS (lab reports – same as diagnoses but with extra fields)
# --------------------------------------------------------------
@router.get("/{patient_id}/test-reports/", response_model=List[dict])
def get_patient_test_reports(patient_id: int):
    ensure_db_connection()
    try:
        reports = (
            LabReport.objects
            .select_related("patient")
            .filter(patient__id=patient_id)
            .values(
                "created_at",
                "test_type",
                "department",
                "status",
                "order_id", # Add order_id
                "file_path", # Add file_path
            )
        )
        print(reports.file_path)
        # Helper to get month name
        def month_name(dt):
            return dt.strftime("%B") if dt else "—"
        return [
            {
                "dateTime": r["created_at"].strftime("%Y-%m-%d %I:%M %p") if r["created_at"] else "—",
                "month": month_name(r["created_at"]),
                "testType": r["test_type"],
                "department": r["department"] or "General",
                "status": r["status"].capitalize(),
                "orderId": r["order_id"], # Include orderId
                "hasReport": bool(r["file_path"]), # Indicate if report exists
                "reportPath": r["file_path"] if r["file_path"] else None, # Include file path
            }
            for r in reports
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
   
@router.get("/{patient_id}/surgeries")
async def get_patient_surgeries(
    patient_id: str = Path(...),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    """
    Get surgery records for a specific patient
    """
    try:
        # Find patient by ID or patient_unique_id
        if patient_id.isdigit():
            @sync_to_async
            def get_patient_surgeries_id():
                ensure_db_connection()
                return Patient.objects.get(id=int(patient_id))
           
            patient = await get_patient_surgeries_id()
        else:
            @sync_to_async
            def get_patient_surgeries_uid():
                ensure_db_connection()
                return Patient.objects.get(patient_unique_id=patient_id)
           
            patient = await get_patient_surgeries_uid()
       
        # Get surgeries for this patient
        @sync_to_async
        def get_surgeries_qs():
            ensure_db_connection()
            return patient.surgeries.all().select_related('doctor').order_by("-scheduled_date")
       
        surgeries_qs = await get_surgeries_qs()
       
        # Get total count
        total = await run_in_threadpool(lambda: (ensure_db_connection(), surgeries_qs.count())[1])
       
        # Get paginated results
        start = (page - 1) * limit
        end = start + limit
       
        @sync_to_async
        def fetch_surgeries():
            ensure_db_connection()
            return list(
                surgeries_qs[start:end].values(
                    "id",
                    "surgery_type",
                    "description",
                    "status",
                    "price",
                    "scheduled_date",
                    "doctor__full_name"
                )
            )
       
        surgeries = await fetch_surgeries()
       
        # Format the data
        formatted_surgeries = []
        for surgery in surgeries:
            formatted_surgeries.append({
                "id": surgery["id"],
                "surgery_type": surgery["surgery_type"],
                "description": surgery["description"],
                "status": surgery["status"],
                "price": float(surgery["price"]) if surgery["price"] else None,
                "scheduled_date": surgery["scheduled_date"].strftime("%Y-%m-%d %H:%M:%S") if surgery["scheduled_date"] else None,
                "doctor": surgery["doctor__full_name"] if surgery["doctor__full_name"] else "—"
            })
       
        return formatted_surgeries # Return directly the array for frontend
       
    except Patient.DoesNotExist:
        raise HTTPException(404, "Patient not found")
    except Exception as e:
        logging.exception("get_patient_surgeries error")
        raise HTTPException(500, detail=str(e))
    
@router.delete("/{patient_id}")
async def delete_patient(patient_id: str = Path(...)):
    await sync_to_async(ensure_db_connection)()
    
    try:
        @sync_to_async
        def fetch_patient():
            return Patient.objects.get(patient_unique_id=patient_id)
        
        patient = await fetch_patient()
        
        # Store photo path
        photo_path = getattr(patient, "photo", None)
        
        # Delete patient
        @sync_to_async
        def delete_patient_obj():
            patient.delete()
        
        await delete_patient_obj()
        
        # Send notification (assuming this is async-safe)
        await NotificationService.send_patient_deleted({
            'patient_unique_id': patient.patient_unique_id,
            'full_name': patient.full_name
        })
        
        # Delete photo if exists - wrap file IO in threadpool
        if photo_path and isinstance(photo_path, str) and os.path.exists(photo_path):
            try:
                await run_in_threadpool(os.remove, photo_path)
            except Exception as file_err:
                logging.warning(f"Failed to delete photo {photo_path}: {file_err}")
        
        return {"success": True, "message": "Deleted"}
    
    except Patient.DoesNotExist:
        raise HTTPException(status_code=404, detail="Patient not found")
    except Exception as e:
        logging.exception("delete_patient error")
        raise HTTPException(status_code=500, detail=str(e))