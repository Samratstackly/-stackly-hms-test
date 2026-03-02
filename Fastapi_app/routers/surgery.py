from fastapi import APIRouter, HTTPException, status, Query, Depends
from typing import List, Optional, Literal
from pydantic import BaseModel, validator, Field
from datetime import datetime, date, time, timedelta
from django.db import connection, transaction
from django.db.models import Q
from Fastapi_app.routers.user_profile import get_current_user
from HMS_backend.models import Surgery, Patient, Staff, User, TreatmentCharge
from asgiref.sync import sync_to_async
from starlette.concurrency import run_in_threadpool
from django.db import close_old_connections, connection
import logging

# Setup logger
logger = logging.getLogger(__name__)

def check_db_connection():
    """Ensure database connection is alive"""
    try:
        close_old_connections()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Database connection check failed: {e}")
        return False

def ensure_db_connection():
    """Reconnect if database connection is lost"""
    if not check_db_connection():
        try:
            connection.close()
            connection.connect()
            logger.info("Database connection reestablished")
        except Exception as e:
            logger.error(f"Failed to reconnect to database: {e}")
            raise

router = APIRouter(prefix="/surgeries", tags=["Surgeries"])

# ---------- Custom Exceptions ----------
class DuplicateEntryException(Exception):
    """Custom exception for duplicate entries"""
    def __init__(self, field: str, value: str, message: str = None):
        self.field = field
        self.value = value
        self.message = message or f"Duplicate entry found for {field}: {value}"
        super().__init__(self.message)

# ---------- Schemas ----------
class SurgeryCreate(BaseModel):
    patient_id: int
    doctor_id: int
    surgery_type: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: Literal["pending", "success", "cancelled", "failed", "emergency"] = "pending"
    scheduled_date: datetime = Field(..., description="Scheduled date and time")

    @validator("surgery_type")
    def validate_surgery_type(cls, v):
        if not v.strip():
            raise ValueError("Surgery type cannot be empty")
        if len(v.strip()) < 2:
            raise ValueError("Surgery type must be at least 2 characters")
        return v.strip()

    @validator("scheduled_date")
    def validate_future_date(cls, v):
        if v < datetime.now():
            raise ValueError("Surgery date cannot be in the past")
        return v

    @validator("patient_id")
    def validate_patient_id(cls, v):
        if v <= 0:
            raise ValueError("Invalid patient ID")
        return v

    @validator("doctor_id")
    def validate_doctor_id(cls, v):
        if v <= 0:
            raise ValueError("Invalid doctor ID")
        return v

class SurgeryUpdate(BaseModel):
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    surgery_type: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[Literal["pending", "success", "cancelled", "failed", "emergency"]] = None
    price: Optional[float] = Field(None, ge=0, description="Surgery price")
    scheduled_date: Optional[datetime] = None

    @validator("surgery_type")
    def validate_surgery_type_update(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError("Surgery type cannot be empty")
            if len(v.strip()) < 2:
                raise ValueError("Surgery type must be at least 2 characters")
        return v.strip() if v else v

    @validator("price")
    def validate_price(cls, v, values):
        if v is not None and v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @validator("patient_id")
    def validate_patient_id_update(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Invalid patient ID")
        return v

    @validator("doctor_id")
    def validate_doctor_id_update(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Invalid doctor ID")
        return v

class SurgeryOut(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    doctor_id: int
    doctor_name: str
    surgery_type: str
    description: Optional[str]
    status: str
    price: Optional[float] = None
    scheduled_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        arbitrary_types_allowed = True

class ErrorResponse(BaseModel):
    detail: str
    field: Optional[str] = None
    error_type: Optional[str] = None
    duplicate_value: Optional[str] = None

# ---------- Helper Functions ----------
def surgery_to_out(surgery: Surgery) -> SurgeryOut:
    return SurgeryOut(
        id=surgery.id,
        patient_id=surgery.patient.id,
        patient_name=surgery.patient.full_name,
        doctor_id=surgery.doctor.id if surgery.doctor else 0,
        doctor_name=surgery.doctor.full_name if surgery.doctor else "Not Assigned",
        surgery_type=surgery.surgery_type,
        description=surgery.description,
        status=surgery.status,
        price=float(surgery.price) if surgery.price else None,
        scheduled_date=surgery.scheduled_date,
        created_at=surgery.created_at,
        updated_at=surgery.updated_at,
    )

def check_duplicate_surgery(patient_id: int, doctor_id: int, surgery_type: str, scheduled_date: datetime, exclude_id: int = None) -> bool:
    """Check if a duplicate surgery already exists - TIME CONFLICT CHECK"""
    try:
        logger.info(f"Checking duplicate: Patient {patient_id}, Doctor {doctor_id}, Time: {scheduled_date}")
        
        # Scenario 1: Same patient cannot have surgery at the same time (regardless of doctor or surgery type)
        # This is the most important check - a patient can't be in two places at once
        patient_time_conflict = Surgery.objects.filter(
            patient_id=patient_id,
            scheduled_date=scheduled_date  # Exact same time
        )
        
        # Scenario 2: Doctor cannot perform two surgeries at the same time
        doctor_time_conflict = Surgery.objects.filter(
            doctor_id=doctor_id,
            scheduled_date=scheduled_date  # Exact same time
        )
        
        # Scenario 3: Same patient + same doctor + same surgery type + same time (exact duplicate)
        exact_duplicate = Surgery.objects.filter(
            patient_id=patient_id,
            doctor_id=doctor_id,
            scheduled_date=scheduled_date,
            surgery_type__iexact=surgery_type.strip().lower()
        )
        
        # Combine all conflict scenarios
        query = patient_time_conflict | doctor_time_conflict | exact_duplicate
        
        if exclude_id:
            query = query.exclude(id=exclude_id)
        
        exists = query.exists()
        
        if exists:
            # Get details of conflicting surgery for logging
            conflicts = list(query.values('id', 'patient_id', 'doctor_id', 'surgery_type', 'scheduled_date'))
            logger.warning(f"Found {len(conflicts)} conflict(s): {conflicts}")
        
        logger.info(f"Duplicate check result: {exists}")
        return exists
        
    except Exception as e:
        logger.error(f"Error checking duplicate surgery: {e}", exc_info=True)
        return False

# ---------- Routes ----------

@router.post("/create", 
             response_model=SurgeryOut, 
             status_code=status.HTTP_201_CREATED,
             responses={
                 400: {"model": ErrorResponse},
                 409: {"model": ErrorResponse},
                 422: {"model": ErrorResponse},
                 500: {"model": ErrorResponse}
             })
async def create_surgery(payload: SurgeryCreate):
    """Create a new surgery with duplicate prevention"""
    
    logger.info(f"Creating surgery - Patient: {payload.patient_id}, Doctor: {payload.doctor_id}, Type: {payload.surgery_type}, Date: {payload.scheduled_date}")
    
    # Check for duplicate surgery
    @sync_to_async
    def check_duplicate():
        ensure_db_connection()
        return check_duplicate_surgery(
            patient_id=payload.patient_id,
            doctor_id=payload.doctor_id,
            surgery_type=payload.surgery_type,
            scheduled_date=payload.scheduled_date
        )

    # Check if duplicate exists
    is_duplicate = await check_duplicate()
    if is_duplicate:
        # Get patient and doctor names for better error message
        @sync_to_async
        def get_names():
            ensure_db_connection()
            try:
                patient = Patient.objects.get(id=payload.patient_id)
                doctor = Staff.objects.get(id=payload.doctor_id)
                return patient.full_name, doctor.full_name
            except Exception as e:
                logger.error(f"Error getting names: {e}")
                return f"Patient ID {payload.patient_id}", f"Doctor ID {payload.doctor_id}"
        
        patient_name, doctor_name = await get_names()
        formatted_date = payload.scheduled_date.strftime("%Y-%m-%d %H:%M")
        
        error_msg = f"A surgery of type '{payload.surgery_type}' is already scheduled for {patient_name} with Dr. {doctor_name} on {formatted_date}"
        
        logger.warning(f"Duplicate surgery detected: {error_msg}")
        
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=ErrorResponse(
                detail=error_msg,
                field="surgery_type",
                error_type="duplicate",
                duplicate_value=payload.surgery_type
            ).dict()
        )

    @sync_to_async
    def get_patient(patient_id):
        ensure_db_connection()
        try:
            return Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            raise HTTPException(
                status_code=404,
                detail=ErrorResponse(
                    detail=f"Patient with ID {patient_id} not found",
                    field="patient_id",
                    error_type="not_found"
                ).dict()
            )

    @sync_to_async
    def get_doctor(doctor_id):
        ensure_db_connection()
        try:
            return Staff.objects.get(id=doctor_id)
        except Staff.DoesNotExist:
            raise HTTPException(
                status_code=404,
                detail=ErrorResponse(
                    detail=f"Doctor with ID {doctor_id} not found",
                    field="doctor_id",
                    error_type="not_found"
                ).dict()
            )

    try:
        patient = await get_patient(payload.patient_id)
        doctor = await get_doctor(payload.doctor_id)

        @sync_to_async
        def create_surgery_with_transaction():
            ensure_db_connection()
            with transaction.atomic():
                # Final duplicate check within transaction
                if check_duplicate_surgery(
                    patient_id=payload.patient_id,
                    doctor_id=payload.doctor_id,
                    surgery_type=payload.surgery_type,
                    scheduled_date=payload.scheduled_date
                ):
                    raise DuplicateEntryException(
                        field="surgery_type",
                        value=payload.surgery_type,
                        message=f"Surgery of '{payload.surgery_type}' is already scheduled for this patient and doctor at {payload.scheduled_date}"
                    )
                
                surgery = Surgery.objects.create(
                    patient=patient,
                    doctor=doctor,
                    surgery_type=payload.surgery_type,
                    description=payload.description,
                    status=payload.status,
                    scheduled_date=payload.scheduled_date,
                )
                return Surgery.objects.select_related('patient', 'doctor').get(id=surgery.id)

        surgery = await create_surgery_with_transaction()
        logger.info(f"Surgery created successfully: ID {surgery.id}")
        return surgery_to_out(surgery)
        
    except DuplicateEntryException as e:
        logger.warning(f"Duplicate surgery creation attempted: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=ErrorResponse(
                detail=e.message,
                field=e.field,
                error_type="duplicate",
                duplicate_value=e.value
            ).dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create surgery: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                detail=f"Failed to create surgery: {str(e)}",
                error_type="server_error"
            ).dict()
        )

@router.get("/list", response_model=List[SurgeryOut])
async def list_surgeries(
    patient_id: Optional[int] = Query(None, description="Filter by patient ID"),
    doctor_id: Optional[int] = Query(None, description="Filter by doctor ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by surgery type or patient name")
):
    @sync_to_async
    def get_surgeries():
        ensure_db_connection()
        queryset = Surgery.objects.select_related('patient', 'doctor').all()

        # Apply filters
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        if status:
            queryset = queryset.filter(status=status)
        if search:
            queryset = queryset.filter(
                Q(surgery_type__icontains=search) |
                Q(patient__full_name__icontains=search)
            )

        return list(queryset.order_by("id"))

    try:
        surgeries = await get_surgeries()
        return [surgery_to_out(surgery) for surgery in surgeries]
    except Exception as e:
        logger.error(f"Failed to list surgeries: {e}")
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                detail=f"Failed to retrieve surgeries: {str(e)}",
                error_type="server_error"
            ).dict()
        )

@router.put("/{surgery_id}", 
            response_model=SurgeryOut,
            responses={
                400: {"model": ErrorResponse},
                404: {"model": ErrorResponse},
                409: {"model": ErrorResponse},
                422: {"model": ErrorResponse},
                500: {"model": ErrorResponse}
            })
async def update_surgery(surgery_id: int, payload: SurgeryUpdate):
    """Update surgery with duplicate prevention and treatment charge management"""
    
    @sync_to_async
    def get_surgery():
        ensure_db_connection()
        try:
            return Surgery.objects.select_related('patient', 'doctor').get(id=surgery_id)
        except Surgery.DoesNotExist:
            raise HTTPException(
                status_code=404,
                detail=ErrorResponse(
                    detail=f"Surgery with ID {surgery_id} not found",
                    error_type="not_found"
                ).dict()
            )

    try:
        surgery = await get_surgery()

        # Check for duplicate if surgery_type or scheduled_date is being updated
        if payload.surgery_type is not None or payload.scheduled_date is not None:
            @sync_to_async
            def check_duplicate_update():
                ensure_db_connection()
                return check_duplicate_surgery(
                    patient_id=payload.patient_id or surgery.patient.id,
                    doctor_id=payload.doctor_id or surgery.doctor.id,
                    surgery_type=payload.surgery_type or surgery.surgery_type,
                    scheduled_date=payload.scheduled_date or surgery.scheduled_date,
                    exclude_id=surgery_id
                )
            
            is_duplicate = await check_duplicate_update()
            if is_duplicate:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=ErrorResponse(
                        detail="A similar surgery already exists for this patient and doctor",
                        field="surgery_type",
                        error_type="duplicate",
                        duplicate_value=payload.surgery_type or surgery.surgery_type
                    ).dict()
                )

        # Store old status before updating
        old_status = surgery.status
        old_price = surgery.price

        # Additional validation: price is required when status changes to success or failed
        if payload.status in ['success', 'failed'] and payload.price is None and surgery.price is None:
            raise HTTPException(
                status_code=400, 
                detail=ErrorResponse(
                    detail="Price is required when status is changed to success or failed",
                    field="price",
                    error_type="validation"
                ).dict()
            )

        # Update fields
        if payload.patient_id is not None:
            @sync_to_async
            def get_patient(patient_id):
                ensure_db_connection()
                try:
                    return Patient.objects.get(id=patient_id)
                except Patient.DoesNotExist:
                    raise HTTPException(
                        status_code=404,
                        detail=ErrorResponse(
                            detail=f"Patient with ID {patient_id} not found",
                            field="patient_id",
                            error_type="not_found"
                        ).dict()
                    )

            patient = await get_patient(payload.patient_id)
            surgery.patient = patient

        if payload.doctor_id is not None:
            @sync_to_async
            def get_doctor(doctor_id):
                ensure_db_connection()
                try:
                    return Staff.objects.get(id=doctor_id)
                except Staff.DoesNotExist:
                    raise HTTPException(
                        status_code=404,
                        detail=ErrorResponse(
                            detail=f"Doctor with ID {doctor_id} not found",
                            field="doctor_id",
                            error_type="not_found"
                        ).dict()
                    )

            doctor = await get_doctor(payload.doctor_id)
            surgery.doctor = doctor

        if payload.surgery_type is not None:
            surgery.surgery_type = payload.surgery_type
        if payload.description is not None:
            surgery.description = payload.description

        # Check if status is changing to success or failed
        status_changed_to_success_or_failed = (
            payload.status in ['success', 'failed'] and 
            old_status not in ['success', 'failed']
        )

        if payload.status is not None:
            surgery.status = payload.status

        new_price = payload.price if payload.price is not None else old_price
        if payload.price is not None:
            surgery.price = payload.price

        if payload.scheduled_date is not None:
            surgery.scheduled_date = payload.scheduled_date

        @sync_to_async
        def save_surgery_with_treatment_charge():
            ensure_db_connection()
            with transaction.atomic():
                # Final duplicate check within transaction
                if (payload.surgery_type is not None or payload.scheduled_date is not None or 
                    payload.patient_id is not None or payload.doctor_id is not None):
                    
                    if check_duplicate_surgery(
                        patient_id=surgery.patient.id,
                        doctor_id=surgery.doctor.id if surgery.doctor else 0,
                        surgery_type=surgery.surgery_type,
                        scheduled_date=surgery.scheduled_date,
                        exclude_id=surgery_id
                    ):
                        raise DuplicateEntryException(
                            field="surgery_type",
                            value=surgery.surgery_type,
                            message="A similar surgery already exists for this patient and doctor"
                        )

                # Save the surgery
                surgery.save()

                # Check if status changed to success or failed and create treatment charge
                if (status_changed_to_success_or_failed and 
                    new_price and 
                    new_price > 0):

                    # Check if a treatment charge already exists for this surgery
                    existing_charge = TreatmentCharge.objects.filter(
                        patient=surgery.patient,
                        description__icontains=surgery.surgery_type,
                        unit_price=new_price,
                        created_at__date=surgery.updated_at.date()
                    ).first()

                    if not existing_charge:
                        # Create TreatmentCharge entry
                        TreatmentCharge.objects.create(
                            patient=surgery.patient,
                            description=f"OT - {surgery.surgery_type} (Surgery ID: {surgery.id})",
                            quantity=1,
                            unit_price=new_price,
                            status=TreatmentCharge.PENDING
                        )
                        logger.info(f"Treatment charge created for surgery {surgery.id}: {surgery.surgery_type} - ₹{new_price}")

                # Update doctor's surgery count if status changed to success or failed
                if (status_changed_to_success_or_failed and surgery.doctor):
                    if surgery.doctor.surgery_count is None:
                        surgery.doctor.surgery_count = 0
                    surgery.doctor.surgery_count += 1
                    surgery.doctor.save(update_fields=['surgery_count'])
                    logger.info(f"Surgery count incremented for doctor {surgery.doctor.full_name}: {surgery.doctor.surgery_count}")

                return Surgery.objects.select_related('patient', 'doctor').get(id=surgery.id)

        updated_surgery = await save_surgery_with_treatment_charge()
        logger.info(f"Surgery {surgery_id} updated successfully")
        return surgery_to_out(updated_surgery)
        
    except DuplicateEntryException as e:
        logger.warning(f"Duplicate surgery update attempted for ID {surgery_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=ErrorResponse(
                detail=e.message,
                field=e.field,
                error_type="duplicate",
                duplicate_value=e.value
            ).dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update surgery {surgery_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                detail=f"Failed to update surgery: {str(e)}",
                error_type="server_error"
            ).dict()
        )

@router.delete("/{surgery_id}", 
               status_code=status.HTTP_204_NO_CONTENT,
               responses={
                   404: {"model": ErrorResponse},
                   500: {"model": ErrorResponse}
               })
async def delete_surgery(surgery_id: int):
    @sync_to_async
    def delete_surgery_func():
        ensure_db_connection()
        try:
            # Simply delete the surgery
            deleted_count, _ = Surgery.objects.filter(id=surgery_id).delete()
            
            if deleted_count == 0:
                raise HTTPException(
                    status_code=404,
                    detail=ErrorResponse(
                        detail=f"Surgery with ID {surgery_id} not found",
                        error_type="not_found"
                    ).dict()
                )
            
            logger.info(f"Surgery {surgery_id} deleted successfully")
            return True
                
        except Exception as e:
            logger.error(f"Failed to delete surgery {surgery_id}: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(
                    detail=f"Failed to delete surgery: {str(e)}",
                    error_type="server_error"
                ).dict()
            )

    await delete_surgery_func()

# Get all patients for dropdown
@router.get("/patients", response_model=List[dict])
async def get_patients():
    try:
        patients = await run_in_threadpool(
            lambda: (ensure_db_connection(), list(
                Patient.objects.all()
                .values("id", "full_name", "patient_unique_id")
                .order_by("full_name")
            ))[1]
        )
        return patients
    except Exception as e:
        logger.error(f"Failed to fetch patients: {e}")
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                detail="Failed to fetch patients",
                error_type="server_error"
            ).dict()
        )

# Get all doctors for dropdown
@router.get("/doctors", response_model=List[dict])
async def get_doctors():
    try:
        doctors = await run_in_threadpool(
            lambda: (ensure_db_connection(), list(
                Staff.objects.filter(designation__icontains="doctor")
                .values("id", "full_name", "employee_id")
                .order_by("full_name")
            ))[1]
        )
        return doctors
    except Exception as e:
        logger.error(f"Failed to fetch doctors: {e}")
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                detail="Failed to fetch doctors",
                error_type="server_error"
            ).dict()
        )

# Debug endpoint
@router.get("/debug/check-existing")
async def debug_check_existing(
    patient_id: Optional[int] = None,
    doctor_id: Optional[int] = None
):
    """Debug endpoint to check existing surgeries"""
    @sync_to_async
    def get_surgeries():
        ensure_db_connection()
        queryset = Surgery.objects.select_related('patient', 'doctor').all()
        
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
            
        return list(queryset.values(
            'id', 'patient_id', 'doctor_id', 'surgery_type', 
            'scheduled_date', 'status', 'created_at'
        ).order_by('-id')[:20])
    
    surgeries = await get_surgeries()
    return {"surgeries": surgeries}