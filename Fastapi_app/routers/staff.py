import uuid
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from django.db import IntegrityError, DatabaseError
from HMS_backend.models import Staff, Department, Surgery
from asgiref.sync import sync_to_async
import os
import traceback
from Fastapi_app.routers.notifications import NotificationService
from pathlib import Path as PathLib
from django.db import close_old_connections, connection
from fastapi.responses import FileResponse

import os

router = APIRouter()
 
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

router = APIRouter(prefix="/staff", tags=["Staffs"])

def safe_getattr(obj, attr, default=None):
    """Safely get attribute with fallback"""
    try:
        return getattr(obj, attr, default)
    except (AttributeError, DatabaseError):
        return default
BASE_DIR = os.path.abspath("Fastapi_app/Staff_documents")
class DownloadCertificateRequest(BaseModel):
    path: str
# ---------- Pydantic Schemas ----------
class StaffResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    phone: str
    gender: Optional[str] = None
    age: Optional[int] = None
    blood_group: Optional[str] = None
    department: str
    designation: str
    specialization: Optional[str] = None
    date_of_joining: Optional[str] = None
    certificates: Optional[str] = None
    profile_picture: Optional[str] = None 
    shift_timing: Optional[str] = None 
    status: Optional[str] = "Active"

    total_surgeries: Optional[int] = 0
    success_rate: Optional[float] = 0.0
    
    # New dynamic fields
    education: Optional[str] = None
    about_physician: Optional[str] = None
    experience: Optional[str] = None
    license_number: Optional[str] = None
    board_certifications: Optional[str] = None
    professional_memberships: Optional[str] = None
    languages_spoken: Optional[str] = None
    awards_recognitions: Optional[str] = None
    total_patients_treated: Optional[int] = 0


# ---------- Helper for Employee ID ----------
@sync_to_async
def generate_employee_id_sync(designation: str) -> str:
    ensure_db_connection()
    prefix_map = {
        "doctor": "DOC",
        "nurse": "NUR",
        "staff": "STA"
    }

    prefix = prefix_map.get(designation.lower(), "STA")

    # Get last staff with same prefix
    last_staff = Staff.objects.filter(employee_id__startswith=prefix).order_by("-employee_id").first()

    if last_staff and last_staff.employee_id:
        try:
            last_num = int(last_staff.employee_id.replace(prefix, ""))
            new_num = last_num + 1
        except ValueError:
            new_num = 1
    else:
        new_num = 1

    return f"{prefix}{str(new_num).zfill(4)}"

async def generate_employee_id(designation: str) -> str:
    return await generate_employee_id_sync(designation)

def get_profile_picture_url(file_path: Optional[str]) -> Optional[str]:
    if not file_path:
        return None
    # Extract just the filename
    filename = file_path.split('/')[-1] if '/' in file_path else file_path
    return f"/static/staffs_pictures/{filename}"

# -----------------------------
# Add Staff
# -----------------------------
@router.post("/add/", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
async def add_staff(
    full_name: str = Form(...),
    date_of_birth: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
    blood_group: Optional[str] = Form(None),
    marital_status: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    phone: str = Form(...),
    email: EmailStr = Form(...),
    national_id: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    date_of_joining: Optional[str] = Form(None),
    designation: str = Form(...),
    department_id: int = Form(...),
    specialization: Optional[str] = Form(None),
    status: Optional[str] = Form("Active"),
    shift_timing: Optional[str] = Form(None),
    
    # New dynamic fields
    education: Optional[str] = Form(None),
    about_physician: Optional[str] = Form(None),
    experience: Optional[str] = Form(None),
    license_number: Optional[str] = Form(None),
    board_certifications: Optional[str] = Form(None),
    professional_memberships: Optional[str] = Form(None),
    languages_spoken: Optional[str] = Form(None),
    awards_recognitions: Optional[str] = Form(None),
    
    certificates: List[UploadFile] = File([]),
    profile_picture: Optional[UploadFile] = File(None)
):
    try:
        print(f"Received request to add staff: {email}, {phone}")
        
        # Check for existing staff using sync_to_async
        @sync_to_async
        def check_existing_staff():
            ensure_db_connection()
            existing_email = Staff.objects.filter(email=email).exists()
            existing_phone = Staff.objects.filter(phone=phone).exists()
            return existing_email, existing_phone
        
        existing_email, existing_phone = await check_existing_staff()
        
        print(f"Existing check - Email: {existing_email}, Phone: {existing_phone}")
        
        if existing_email:
            raise HTTPException(
                status_code=400, 
                detail=f"Staff with email '{email}' already exists"
            )
        if existing_phone:
            raise HTTPException(
                status_code=400, 
                detail=f"Staff with phone '{phone}' already exists"
            )

        # Parse dates if provided
        dob = None
        doj = None
        
        if date_of_birth:
            try:
                dob = datetime.strptime(date_of_birth, "%m/%d/%Y").date()
            except ValueError as e:
                raise HTTPException(
                    status_code=422, 
                    detail=f"Invalid date_of_birth format. Use MM/DD/YYYY. Error: {str(e)}"
                )

        if date_of_joining:
            try:
                doj = datetime.strptime(date_of_joining, "%m/%d/%Y").date()
            except ValueError as e:
                raise HTTPException(
                    status_code=422, 
                    detail=f"Invalid date_of_joining format. Use MM/DD/YYYY. Error: {str(e)}"
                )

        # Get department using sync_to_async
        @sync_to_async
        def get_department_sync(department_id):
            ensure_db_connection()
            try:
                return Department.objects.get(id=department_id)
            except Department.DoesNotExist:
                return None

        department = await get_department_sync(department_id)
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")

        # Generate unique employee ID
        employee_id = await generate_employee_id(designation)
        print(f"Generated employee ID: {employee_id}")

        # Prepare staff data with proper defaults
        staff_data = {
            'employee_id': employee_id,
            'full_name': full_name,
            'phone': phone,
            'email': email,
            'designation': designation,
            'department': department,
        }

        # Optional fields
        optional_fields = {
            'date_of_birth': dob,
            'gender': gender,
            'age': age,
            'blood_group': blood_group,
            'marital_status': marital_status,
            'address': address,
            'national_id': national_id,
            'city': city,
            'country': country,
            'date_of_joining': doj,
            'specialization': specialization,
            'status': status,
            'shift_timing': shift_timing,
            'education': education,
            'about_physician': about_physician,
            'experience': experience,
            'license_number': license_number,
            'board_certifications': board_certifications,
            'professional_memberships': professional_memberships,
            'languages_spoken': languages_spoken,
            'awards_recognitions': awards_recognitions,
        }

        # Add optional fields only if they have values
        for field, value in optional_fields.items():
            if value is not None:
                staff_data[field] = value

        print(f"Creating staff with data keys: {list(staff_data.keys())}")

        # Create staff using sync_to_async
        @sync_to_async
        def create_staff_sync(staff_data):
            ensure_db_connection()
            try:
                staff = Staff(**staff_data)
                staff.save()
                return staff, None
            except IntegrityError as e:
                return None, str(e)
            except Exception as e:
                return None, str(e)

        staff, error = await create_staff_sync(staff_data)
        
        if error:
            print(f"Error creating staff: {error}")
            if 'email' in error.lower():
                raise HTTPException(status_code=400, detail=f"Staff with email '{email}' already exists")
            elif 'phone' in error.lower():
                raise HTTPException(status_code=400, detail=f"Staff with phone '{phone}' already exists")
            elif 'national_id' in error.lower() and national_id:
                raise HTTPException(status_code=400, detail=f"Staff with national ID '{national_id}' already exists")
            else:
                raise HTTPException(status_code=400, detail=f"Database integrity error: {error}")
        
        if not staff:
            raise HTTPException(status_code=500, detail="Failed to create staff")
            
        print(f"Staff created successfully with ID: {staff.id}")

        # Handle file uploads with new filename format
        cert_paths = []
        if certificates:
            os.makedirs("Fastapi_app/Staff_documents", exist_ok=True)
            for cert in certificates:
                if cert.filename:  # Only process if filename exists
                    # Generate unique filename for certificate
                    unique_id = str(uuid.uuid4().hex)[:4].upper()
                    file_extension = PathLib(cert.filename).suffix.lower() if cert.filename else ".pdf"
                    
                    # Format: First4CharsXXXXDOC.ext
                    name_part = full_name.upper()
                    if len(name_part) >= 4:
                        first_four = name_part[:4]
                    else:
                        first_four = name_part.ljust(4, '_')
                    
                    filename = f"{first_four}{unique_id}DOC{file_extension}"
                    cert_path = f"Fastapi_app/Staff_documents/{filename}"
                    
                    with open(cert_path, "wb") as f:
                        content = await cert.read()
                        f.write(content)
                    cert_paths.append(cert_path)

        pic_path = None
        if profile_picture and profile_picture.filename:
            os.makedirs("Fastapi_app/staffs_pictures", exist_ok=True)
            
            # Generate filename with new format: First4CharsXXXXPIC.ext
            name_part = full_name.upper()
            if len(name_part) >= 4:
                first_four = name_part[:4]
            else:
                first_four = name_part.ljust(4, '_')
            
            unique_id = str(uuid.uuid4().hex)[:4].upper()
            file_extension = PathLib(profile_picture.filename).suffix.lower() if profile_picture.filename else ".jpg"
            
            filename = f"{first_four}{unique_id}PIC{file_extension}"
            pic_path = f"Fastapi_app/staffs_pictures/{filename}"
            
            with open(pic_path, "wb") as f:
                content = await profile_picture.read()
                f.write(content)

        # Update staff with file paths if any files were uploaded
        if cert_paths or pic_path:
            @sync_to_async
            def update_staff_files(staff_id, cert_paths, pic_path):
                ensure_db_connection()
                staff = Staff.objects.get(id=staff_id)
                if cert_paths:
                    staff.certificates = ",".join(cert_paths)
                if pic_path:
                    staff.profile_picture = pic_path
                staff.save(update_fields=['certificates', 'profile_picture'])
                return staff
            
            staff = await update_staff_files(staff.id, cert_paths, pic_path)

        # Get the final staff object with related department
        @sync_to_async
        def get_final_staff(staff_id):
            ensure_db_connection()
            return Staff.objects.select_related('department').get(id=staff_id)
        
        final_staff = await get_final_staff(staff.id)
        await NotificationService.send_staff_registered(final_staff)

        return StaffResponse(
            id=final_staff.id,
            employee_id=final_staff.employee_id,
            full_name=final_staff.full_name,
            email=final_staff.email,
            phone=final_staff.phone,
            gender=final_staff.gender,
            age=final_staff.age,
            blood_group=final_staff.blood_group,
            department=final_staff.department.name if final_staff.department else "N/A",
            designation=final_staff.designation,
            specialization=final_staff.specialization,
            date_of_joining=final_staff.date_of_joining.isoformat() if final_staff.date_of_joining else None,
            certificates=final_staff.certificates,
            profile_picture=get_profile_picture_url(final_staff.profile_picture),
            shift_timing=final_staff.shift_timing,
            status=final_staff.status,
            education=final_staff.education,
            about_physician=final_staff.about_physician,
            experience=final_staff.experience,
            license_number=final_staff.license_number,
            board_certifications=final_staff.board_certifications,
            professional_memberships=final_staff.professional_memberships,
            languages_spoken=final_staff.languages_spoken,
            awards_recognitions=final_staff.awards_recognitions,
            total_patients_treated=getattr(final_staff, 'total_patients_treated', 0)
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Unexpected error in add_staff: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# -----------------------------
# Fetch All Staff
# -----------------------------
@router.get("/all/", response_model=List[StaffResponse])
async def get_all_staff():
    try:
        @sync_to_async
        def get_staff_list():
            ensure_db_connection()
            staffs = list(Staff.objects.select_related("department").all().order_by("id"))
            result = []
            for s in staffs:
                result.append(
                    {
                        'id': s.id,
                        'employee_id': safe_getattr(s, 'employee_id', ''),
                        'full_name': safe_getattr(s, 'full_name', ''),
                        'email': safe_getattr(s, 'email', ''),
                        'phone': safe_getattr(s, 'phone', ''),
                        'gender': safe_getattr(s, 'gender'),
                        'age': safe_getattr(s, 'age'),
                        'blood_group': safe_getattr(s, 'blood_group'),
                        'department': s.department.name if s.department else "N/A",
                        'designation': safe_getattr(s, 'designation', ''),
                        'specialization': safe_getattr(s, 'specialization'),
                        'date_of_joining': s.date_of_joining.isoformat() if s.date_of_joining else None,
                        'certificates': safe_getattr(s, 'certificates'),
                        'profile_picture': get_profile_picture_url(safe_getattr(s, 'profile_picture')),
                        'shift_timing': safe_getattr(s, 'shift_timing'),
                        'status': safe_getattr(s, 'status', 'Active'),
                        'education': safe_getattr(s, 'education'),
                        'about_physician': safe_getattr(s, 'about_physician'),
                        'experience': safe_getattr(s, 'experience'),
                        'license_number': safe_getattr(s, 'license_number'),
                        'board_certifications': safe_getattr(s, 'board_certifications'),
                        'professional_memberships': safe_getattr(s, 'professional_memberships'),
                        'languages_spoken': safe_getattr(s, 'languages_spoken'),
                        'awards_recognitions': safe_getattr(s, 'awards_recognitions'),
                        'total_patients_treated': safe_getattr(s, 'total_patients_treated', 0)
                    }
                )
            return result

        staff_list = await get_staff_list()
        return staff_list
        
    except Exception as e:
        print(f"Error in get_all_staff: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching staff: {str(e)}")


# -----------------------------
# Update Staff
# -----------------------------
@router.put("/update/{staff_id}/", response_model=StaffResponse)
async def update_staff(
    staff_id: int,
    full_name: Optional[str] = Form(None),
    date_of_birth: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
    blood_group: Optional[str] = Form(None),
    marital_status: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    email: Optional[EmailStr] = Form(None),
    national_id: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    date_of_joining: Optional[str] = Form(None),
    designation: Optional[str] = Form(None),
    department_id: Optional[int] = Form(None),
    specialization: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    shift_timing: Optional[str] = Form(None),
    
    # New dynamic fields
    education: Optional[str] = Form(None),
    about_physician: Optional[str] = Form(None),
    experience: Optional[str] = Form(None),
    license_number: Optional[str] = Form(None),
    board_certifications: Optional[str] = Form(None),
    professional_memberships: Optional[str] = Form(None),
    languages_spoken: Optional[str] = Form(None),
    awards_recognitions: Optional[str] = Form(None),
    
    certificates: List[UploadFile] = File([]),
    profile_picture: Optional[UploadFile] = File(None),
):
    try:
        @sync_to_async
        def update_staff_sync():
            ensure_db_connection()
            try:
                staff = Staff.objects.select_related("department").get(id=staff_id)
                
                # Update fields if provided
                if full_name: staff.full_name = full_name
                if date_of_birth:
                    if '/' in date_of_birth:
                        staff.date_of_birth = datetime.strptime(date_of_birth, "%m/%d/%Y").date()
                    else:
                        staff.date_of_birth = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
                if gender: staff.gender = gender
                if age: staff.age = age
                if blood_group: staff.blood_group = blood_group
                if marital_status: staff.marital_status = marital_status
                if address: staff.address = address
                if phone: staff.phone = phone
                if email: staff.email = email
                if national_id: staff.national_id = national_id
                if city: staff.city = city
                if country: staff.country = country
                if date_of_joining:
                    if '/' in date_of_joining:
                        staff.date_of_joining = datetime.strptime(date_of_joining, "%m/%d/%Y").date()
                    else:
                        staff.date_of_joining = datetime.strptime(date_of_joining, "%Y-%m-%d").date()
                if designation: staff.designation = designation
                if department_id:
                    department = Department.objects.get(id=department_id)
                    staff.department = department
                if specialization: staff.specialization = specialization
                if status: staff.status = status
                if shift_timing: staff.shift_timing = shift_timing
                
                # Update new dynamic fields
                if education is not None: staff.education = education
                if about_physician is not None: staff.about_physician = about_physician
                if experience is not None: staff.experience = experience
                if license_number is not None: staff.license_number = license_number
                if board_certifications is not None: staff.board_certifications = board_certifications
                if professional_memberships is not None: staff.professional_memberships = professional_memberships
                if languages_spoken is not None: staff.languages_spoken = languages_spoken
                if awards_recognitions is not None: staff.awards_recognitions = awards_recognitions

                staff.save()
                return staff, None
                
            except Staff.DoesNotExist:
                return None, "Staff not found"
            except Department.DoesNotExist:
                return None, "Department not found"
            except Exception as e:
                return None, str(e)

        staff, error = await update_staff_sync()
        
        if error:
            if "Staff not found" in error:
                raise HTTPException(status_code=404, detail="Staff not found")
            elif "Department not found" in error:
                raise HTTPException(status_code=404, detail="Department not found")
            else:
                raise HTTPException(status_code=400, detail=error)

        # Handle file uploads
        cert_paths = []
        if certificates:
            os.makedirs("Fastapi_app/Staff_documents", exist_ok=True)
            for cert in certificates:
                if cert.filename:
                    cert_path = f"fastapi_app/Staff_documents/{staff.id}_{cert.filename}"
                    with open(cert_path, "wb") as f:
                        f.write(await cert.read())
                    cert_paths.append(cert_path)

        pic_path = None
        if profile_picture and profile_picture.filename:
            os.makedirs("Fastapi_app/staffs_pictures", exist_ok=True)
            
            # Delete old profile picture if exists
            if staff.profile_picture:
                try:
                    # staff.profile_picture is a string path, not an ImageFieldFile
                    old_photo_path = staff.profile_picture
                    if os.path.exists(old_photo_path):
                        os.remove(old_photo_path)
                except Exception:
                    pass  # Don't fail if deletion fails
            
            # Generate new filename format: First4CharsXXXXPIC.ext
            name_to_use = full_name.strip() if full_name and full_name.strip() else staff.full_name
            
            # Get first 4 characters of name, uppercase, pad if shorter
            name_part = name_to_use.upper()
            if len(name_part) >= 4:
                first_four = name_part[:4]
            else:
                first_four = name_part.ljust(4, '_')
            
            # Generate 4-character unique ID (uppercase)
            unique_id = str(uuid.uuid4().hex)[:4].upper()
            
            # Get file extension
            file_extension = PathLib(profile_picture.filename).suffix.lower() if profile_picture.filename else ".jpg"
            
            # Format: First4CharsXXXXPIC.ext
            filename = f"{first_four}{unique_id}PIC{file_extension}"
            pic_path = f"Fastapi_app/staffs_pictures/{filename}"
            
            with open(pic_path, "wb") as f:
                f.write(await profile_picture.read())

        # Update file paths if any files were uploaded
        if cert_paths or pic_path:
            @sync_to_async
            def update_files_sync():
                ensure_db_connection()
                staff_obj = Staff.objects.get(id=staff.id)
                if cert_paths:
                    staff_obj.certificates = ",".join(cert_paths)
                if pic_path:
                    staff_obj.profile_picture = pic_path
                staff_obj.save(update_fields=['certificates', 'profile_picture'])
                return Staff.objects.select_related("department").get(id=staff.id)
            
            staff = await update_files_sync()
            await NotificationService.send_staff_updated(staff)

        return StaffResponse(
            id=staff.id,
            employee_id=staff.employee_id,
            full_name=staff.full_name,
            email=staff.email,
            phone=staff.phone,
            gender=staff.gender,
            age=staff.age,
            blood_group=staff.blood_group,
            department=staff.department.name if staff.department else "",
            designation=staff.designation,
            specialization=staff.specialization,
            date_of_joining=staff.date_of_joining.isoformat() if staff.date_of_joining else None,
            certificates=staff.certificates,
            profile_picture=get_profile_picture_url(staff.profile_picture),
            shift_timing=staff.shift_timing,
            status=staff.status,
            education=staff.education,
            about_physician=staff.about_physician,
            experience=staff.experience,
            license_number=staff.license_number,
            board_certifications=staff.board_certifications,
            professional_memberships=staff.professional_memberships,
            languages_spoken=staff.languages_spoken,
            awards_recognitions=staff.awards_recognitions,
            total_patients_treated=getattr(staff, 'total_patients_treated', 0)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
# -----------------------------
# Get Staff by ID
# -----------------------------
@router.get("/{staff_id}/", response_model=StaffResponse)
async def get_staff_by_id(staff_id: int):
    try:
        @sync_to_async
        def get_staff_and_surgery_stats():
            ensure_db_connection()
            try:
                staff = Staff.objects.select_related("department").get(id=staff_id)

                # ✅ Surgery stats (ENDPOINT ONLY)
                surgeries = Surgery.objects.filter(
                    doctor=staff,
                    status__in=[
                        Surgery.STATUS_SUCCESS,
                        Surgery.STATUS_FAILED
                    ]
                )

                total_surgeries = surgeries.count()
                success_count = surgeries.filter(
                    status=Surgery.STATUS_SUCCESS
                ).count()

                success_rate = (
                    round((success_count / total_surgeries) * 100, 2)
                    if total_surgeries > 0 else 0
                )

                return staff, total_surgeries, success_rate

            except Staff.DoesNotExist:
                return None, 0, 0

        staff, total_surgeries, success_rate = await get_staff_and_surgery_stats()

        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")

        return StaffResponse(
            id=staff.id,
            employee_id=staff.employee_id,
            full_name=staff.full_name,
            email=staff.email,
            phone=staff.phone,
            gender=staff.gender,
            age=staff.age,
            blood_group=staff.blood_group,
            shift_timing=staff.shift_timing,
            department=staff.department.name if staff.department else "",
            designation=staff.designation,
            specialization=staff.specialization,
            date_of_joining=staff.date_of_joining.isoformat() if staff.date_of_joining else None,
            certificates=staff.certificates,
            profile_picture=get_profile_picture_url(staff.profile_picture),
            status=staff.status,
            education=staff.education,
            about_physician=staff.about_physician,
            experience=staff.experience,
            license_number=staff.license_number,
            board_certifications=staff.board_certifications,
            professional_memberships=staff.professional_memberships,
            languages_spoken=staff.languages_spoken,
            awards_recognitions=staff.awards_recognitions,
            total_patients_treated=staff.total_patients_treated,

            # ✅ NEW DYNAMIC FIELDS
            total_surgeries=total_surgeries,
            success_rate=success_rate
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{staff_id}/update-statistics/")
async def update_staff_statistics(staff_id: int):
    try:
        @sync_to_async
        def update_stats_sync():
            ensure_db_connection()
            try:
                staff = Staff.objects.get(id=staff_id)
                old_count = staff.total_patients_treated
                staff.update_statistics(save=True)
                staff.refresh_from_db()
                return {
                    "success": True,
                    "staff_id": staff.id,
                    "staff_name": staff.full_name,
                    "old_count": old_count,
                    "new_count": staff.total_patients_treated,
                    "message": f"Statistics updated from {old_count} to {staff.total_patients_treated}"
                }
            except Staff.DoesNotExist:
                return {"success": False, "error": "Staff not found"}
            except Exception as e:
                return {"success": False, "error": str(e)}

        result = await update_stats_sync()
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Update All Staff Statistics
# -----------------------------
@router.post("/update-all-statistics/")
async def update_all_staff_statistics():
    try:
        @sync_to_async
        def update_all_stats_sync():
            ensure_db_connection()
            try:
                staff_count = Staff.objects.count()
                updated_count = 0
                results = []
                
                for staff in Staff.objects.all():
                    old_count = staff.total_patients_treated
                    staff.update_statistics(save=True)
                    staff.refresh_from_db()
                    if old_count != staff.total_patients_treated:
                        updated_count += 1
                    results.append({
                        "staff_id": staff.id,
                        "staff_name": staff.full_name,
                        "patient_count": staff.total_patients_treated
                    })
                
                return {
                    "success": True,
                    "total_staff": staff_count,
                    "updated_count": updated_count,
                    "results": results
                }
            except Exception as e:
                return {"success": False, "error": str(e)}

        result = await update_all_stats_sync()
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/download-certificate")
async def download_certificate(data: DownloadCertificateRequest):
    # ✅ Take only first file if multiple paths exist
    raw_path = data.path.split(",")[0]

    # ✅ Clean unwanted characters
    cleaned_path = (
        raw_path
        .replace("“", "")
        .replace("”", "")
        .replace('"', "")
        .strip()
    )

    abs_file_path = os.path.abspath(cleaned_path)

    # ✅ Security check
    if not abs_file_path.startswith(BASE_DIR):
        raise HTTPException(status_code=403, detail="Invalid file path")

    if not os.path.exists(abs_file_path):
        raise HTTPException(status_code=404, detail="File not found")

    filename = os.path.basename(abs_file_path)

    return FileResponse(
        path=abs_file_path,
        filename=filename,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

# -----------------------------
# Get Unique Specializations by Department
# -----------------------------
@router.get("/specializations/")
async def get_specializations_by_department(department_id: Optional[int] = None):
    """
    Get unique specializations for a department
    If department_id is provided, return specializations for that department
    Otherwise return all unique specializations
    """
    try:
        @sync_to_async
        def get_specializations_sync():
            ensure_db_connection()
            try:
                # Base queryset - exclude null/empty specializations
                queryset = Staff.objects.exclude(
                    specialization__isnull=True
                ).exclude(
                    specialization__exact=''
                )
                
                # Filter by department if provided
                if department_id:
                    queryset = queryset.filter(department_id=department_id)
                
                # Get unique specializations, order alphabetically
                specializations = queryset.values_list(
                    'specialization', flat=True
                ).distinct().order_by('specialization')
                
                # Format as list of objects
                result = []
                for spec in specializations:
                    if spec and spec.strip():
                        result.append({
                            'id': spec,
                            'name': spec,
                            'specialization': spec
                        })
                
                return result
                
            except Exception as e:
                print(f"Error in get_specializations_sync: {str(e)}")
                return []

        specializations = await get_specializations_sync()
        return specializations
        
    except Exception as e:
        print(f"Error in get_specializations_by_department: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching specializations: {str(e)}")
