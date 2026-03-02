from pydantic import BaseModel, validator, Field
from datetime import datetime, date
from typing import Optional, List
from decimal import Decimal
from fastapi import APIRouter, HTTPException, status, Query, Depends
from django.db import transaction
from django.db.models import Q, Sum, Count, Prefetch
from asgiref.sync import sync_to_async
import json
from Fastapi_app.routers.user_profile import get_current_user
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

# ---------- TreatmentCharge Schemas ----------
class TreatmentChargeCreate(BaseModel):
    patient_id: int = Field(..., description="Patient ID")
    description: str = Field(..., max_length=255, description="Description of the charge")
    quantity: int = Field(default=1, ge=1, description="Quantity")
    unit_price: float = Field(..., ge=0, description="Unit price")
    amount: Optional[float] = Field(None, ge=0, description="Amount (optional, will be auto-calculated)")

    @validator("description")
    def validate_description(cls, v):
        if not v or not v.strip():
            raise ValueError("Description cannot be empty")
        return v.strip()

    @validator("unit_price")
    def validate_unit_price(cls, v):
        if v < 0:
            raise ValueError("Unit price cannot be negative")
        return float(v)

class TreatmentChargeUpdate(BaseModel):
    description: Optional[str] = Field(None, max_length=255, description="Description of the charge")
    quantity: Optional[int] = Field(None, ge=1, description="Quantity")
    unit_price: Optional[float] = Field(None, ge=0, description="Unit price")
    amount: Optional[float] = Field(None, ge=0, description="Amount")

    @validator("description")
    def validate_description_update(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Description cannot be empty")
        return v.strip() if v else v

    @validator("unit_price")
    def validate_unit_price_update(cls, v):
        if v is not None and v < 0:
            raise ValueError("Unit price cannot be negative")
        return float(v) if v is not None else v

class TreatmentChargeOut(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    patient_identifier: str
    description: str
    quantity: int
    unit_price: float
    amount: Optional[float]
    status: str
    created_at: datetime  # Removed created_by_name

    class Config:
        from_attributes = True

class TreatmentChargeDetail(TreatmentChargeOut):
    pass  # Removed created_by_email

# ---------- Patient Dropdown Schema ----------
class PatientDropdown(BaseModel):
    id: int
    full_name: str
    patient_unique_id: str
    age: Optional[int]
    gender: Optional[str]
    department: Optional[str]
    doctor_name: Optional[str]

# ---------- Response Models ----------
class TreatmentChargeSummary(BaseModel):
    total_charges: float
    pending_count: int
    billed_count: int
    cancelled_count: int

class PatientWithCharges(BaseModel):
    patient_id: int
    patient_name: str
    patient_unique_id: str
    total_charges: float
    charges: List[TreatmentChargeOut]

class PatientDetailsResponse(BaseModel):
    id: int
    full_name: str
    patient_unique_id: str
    age: Optional[int]
    gender: Optional[str]
    date_of_birth: Optional[date]
    address: Optional[str]
    phone_number: Optional[str]
    email: Optional[str]
    admission_date: Optional[date]
    discharge_date: Optional[date]
    department: Optional[str]
    doctor: Optional[str]
    bed_info: Optional[dict]

# ---------- Status Update Schema ----------
class StatusUpdate(BaseModel):
    status: str

# Import models and schemas
from HMS_backend.models import TreatmentCharge, Patient, Staff, Department, User, Bed


router = APIRouter(prefix="/treatment-charges", tags=["Treatment Charges"])

# ---------- Helper Functions ----------
async def get_or_404(model, **kwargs):
    """Helper to get object or raise 404"""
    @sync_to_async
    def _get():
        ensure_db_connection()
        try:
            select_rel = kwargs.pop('select_related', [])
            prefetch_rel = kwargs.pop('prefetch_related', [])
            qs = model.objects.all()
            if select_rel:
                qs = qs.select_related(*select_rel)
            if prefetch_rel:
                qs = qs.prefetch_related(*prefetch_rel)
            return qs.get(**kwargs)
        except model.DoesNotExist:
            return None

    obj = await _get()
    if obj is None:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return obj

def calculate_amount(quantity: int, unit_price: float, provided_amount: Optional[float] = None) -> float:
    """Calculate amount if not provided"""
    if provided_amount is not None:
        return provided_amount
    return quantity * unit_price

def treatment_charge_to_out(charge: TreatmentCharge) -> TreatmentChargeOut:
    """Convert TreatmentCharge model to output schema"""
    # Get patient details
    patient_name = ""
    patient_identifier = ""
    if charge.patient:
        patient_name = charge.patient.full_name or ""
        patient_identifier = charge.patient.patient_unique_id or ""

    # Convert Decimal to float for JSON serialization
    unit_price = float(charge.unit_price) if charge.unit_price else 0.0
    amount = float(charge.amount) if charge.amount else None

    return TreatmentChargeOut(
        id=charge.id,
        patient_id=charge.patient.id if charge.patient else 0,
        patient_name=patient_name,
        patient_identifier=patient_identifier,
        description=charge.description,
        quantity=charge.quantity,
        unit_price=unit_price,
        amount=amount,
        status=charge.status,
        created_at=charge.created_at,
    )

# ---------- Routes ----------

@router.post("/", response_model=TreatmentChargeOut, status_code=status.HTTP_201_CREATED)
async def create_treatment_charge(
    payload: TreatmentChargeCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new treatment charge for a patient
    """
    try:
        print(f"Received payload: {payload.dict()}")

        # Get patient
        patient = await get_or_404(Patient, id=payload.patient_id)
        print(f"Found patient: {patient.id} - {patient.full_name}")

        # Calculate amount
        amount = calculate_amount(payload.quantity, payload.unit_price, payload.amount)
        print(f"Calculated amount: {amount}")

        @sync_to_async
        def create_charge_with_transaction():
            ensure_db_connection()
            with transaction.atomic():
                print(f"Creating charge for patient {patient.id}")

                # Create the treatment charge without created_by
                charge = TreatmentCharge.objects.create(
                    patient=patient,
                    description=payload.description,
                    quantity=payload.quantity,
                    unit_price=payload.unit_price,
                    amount=amount,
                    status="PENDING",
                )
                print(f"Charge created with ID: {charge.id}")

                # Return with related fields
                return TreatmentCharge.objects.select_related('patient').get(id=charge.id)

        # Create the charge
        charge = await create_charge_with_transaction()
        print(f"Charge successfully created: {charge.id}")

        return treatment_charge_to_out(charge)

    except HTTPException as he:
        print(f"HTTP Exception: {he.detail}")
        raise
    except Exception as e:
        print(f"Error creating treatment charge: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create treatment charge: {str(e)}"
        )

@router.get("/", response_model=List[TreatmentChargeOut])
async def list_treatment_charges(
    patient: Optional[int] = Query(None, description="Filter by patient ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    search: Optional[str] = Query(None, description="Search in description or patient name"),
):
    """
    Get all treatment charges with optional filters
    """
    @sync_to_async
    def get_charges():
        ensure_db_connection()
        queryset = TreatmentCharge.objects.select_related('patient').order_by("-created_at")

        # Apply filters
        if patient:
            queryset = queryset.filter(patient_id=patient)

        if status:
            queryset = queryset.filter(status=status)

        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)

        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        if search:
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(patient__full_name__icontains=search) |
                Q(patient__patient_unique_id__icontains=search)
            )

        return list(queryset)

    try:
        charges = await get_charges()
        return [treatment_charge_to_out(charge) for charge in charges]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch treatment charges: {str(e)}"
        )

@router.get("/patient/{patient_id}", response_model=List[TreatmentChargeOut])
async def get_patient_treatment_charges(
    patient_id: int,
):
    """
    Get all treatment charges for a specific patient
    """
    try:
        # Verify patient exists
        await get_or_404(Patient, id=patient_id)

        @sync_to_async
        def get_patient_charges():
            ensure_db_connection()
            return list(
                TreatmentCharge.objects.select_related('patient')
                .filter(patient_id=patient_id)
                .order_by("-created_at")
            )

        charges = await get_patient_charges()
        return [treatment_charge_to_out(charge) for charge in charges]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch patient treatment charges: {str(e)}"
        )

@router.get("/summary/{patient_id}", response_model=TreatmentChargeSummary)
async def get_treatment_charges_summary(
    patient_id: int,
):
    """
    Get summary of treatment charges for a patient
    """
    try:
        # Verify patient exists
        await get_or_404(Patient, id=patient_id)

        @sync_to_async
        def get_summary():
            ensure_db_connection()
            charges = TreatmentCharge.objects.filter(patient_id=patient_id)

            total_charges = charges.aggregate(
                total=Sum('amount')
            )['total'] or 0.0

            counts = charges.aggregate(
                pending=Count('id', filter=Q(status="PENDING")),
                billed=Count('id', filter=Q(status="BILLED")),
                cancelled=Count('id', filter=Q(status="CANCELLED"))
            )

            return {
                "total_charges": float(total_charges) if total_charges else 0.0,
                "pending_count": counts['pending'],
                "billed_count": counts['billed'],
                "cancelled_count": counts['cancelled']
            }

        summary = await get_summary()
        return TreatmentChargeSummary(**summary)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch summary: {str(e)}"
        )

@router.get("/{charge_id}", response_model=TreatmentChargeDetail)
async def get_treatment_charge(
    charge_id: int,
):
    """
    Get a specific treatment charge by ID
    """
    try:
        charge = await get_or_404(
            TreatmentCharge, 
            id=charge_id,
            select_related=['patient']
        )

        # Convert to detail schema
        return TreatmentChargeDetail(**treatment_charge_to_out(charge).dict())

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch treatment charge: {str(e)}"
        )

@router.put("/{charge_id}", response_model=TreatmentChargeOut)
async def update_treatment_charge(
    charge_id: int,
    payload: TreatmentChargeUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update a treatment charge (description, quantity, unit price, amount only)
    """
    try:
        charge = await get_or_404(
            TreatmentCharge, 
            id=charge_id,
            select_related=['patient']
        )

        @sync_to_async
        def update_charge_with_transaction():
            ensure_db_connection()
            with transaction.atomic():
                if payload.description is not None:
                    charge.description = payload.description

                if payload.quantity is not None:
                    charge.quantity = payload.quantity

                if payload.unit_price is not None:
                    charge.unit_price = payload.unit_price

                # Recalculate amount if quantity or unit_price changed
                if payload.quantity is not None or payload.unit_price is not None:
                    if payload.amount is not None:
                        charge.amount = payload.amount
                    else:
                        charge.amount = calculate_amount(
                            payload.quantity if payload.quantity is not None else charge.quantity,
                            payload.unit_price if payload.unit_price is not None else charge.unit_price,
                            payload.amount
                        )
                elif payload.amount is not None:
                    charge.amount = payload.amount

                charge.save()
                return TreatmentCharge.objects.select_related('patient').get(id=charge.id)

        updated_charge = await update_charge_with_transaction()

        return treatment_charge_to_out(updated_charge)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update treatment charge: {str(e)}"
        )

@router.delete("/{charge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_treatment_charge(
    charge_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a treatment charge
    """
    try:
        charge = await get_or_404(
            TreatmentCharge, 
            id=charge_id
        )

        @sync_to_async
        def delete_charge():
            ensure_db_connection()
            try:
                charge.delete()
                return True
            except Exception:
                return False

        deleted = await delete_charge()
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Treatment charge not found"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete treatment charge: {str(e)}"
        )

@router.patch("/{charge_id}/status", response_model=TreatmentChargeOut)
async def update_charge_status(
    charge_id: int,
    payload: StatusUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update only the status of a treatment charge
    """
    try:
        charge = await get_or_404(
            TreatmentCharge, 
            id=charge_id,
            select_related=['patient']
        )

        if charge.status == payload.status:
            return treatment_charge_to_out(charge)

        # Validate status
        valid_statuses = ["PENDING", "BILLED", "CANCELLED"]
        if payload.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {valid_statuses}"
            )

        @sync_to_async
        def update_status():
            ensure_db_connection()
            with transaction.atomic():
                charge.status = payload.status
                charge.save()
                return TreatmentCharge.objects.select_related('patient').get(id=charge.id)

        updated_charge = await update_status()

        return treatment_charge_to_out(updated_charge)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status: {str(e)}"
        )

# ---------- Patient Dropdown Endpoints ----------

@router.get("/patients/search", response_model=List[PatientDropdown])
async def search_patients(
    query: str = Query("", description="Search by name or ID"),
):
    """
    Search patients for dropdown selection
    """
    @sync_to_async
    def search_patients_in_db():
        ensure_db_connection()
        if not query:
            # Return recently active patients if no query
            return list(
                Patient.objects.select_related('department', 'staff')
                .filter(is_active=True)
                .order_by("-updated_at")[:50]
            )

        return list(
            Patient.objects.select_related('department', 'staff')
            .filter(
                Q(is_active=True) &
                (
                    Q(full_name__icontains=query) |
                    Q(patient_unique_id__icontains=query) |
                    Q(phone_number__icontains=query)
                )
            )
            .order_by("full_name")[:50]
        )

    try:
        patients = await search_patients_in_db()

        return [
            PatientDropdown(
                id=patient.id,
                full_name=patient.full_name or "",
                patient_unique_id=patient.patient_unique_id or "",
                age=patient.age,
                gender=patient.gender,
                department=patient.department.name if patient.department else None,
                doctor_name=patient.staff.full_name if patient.staff else None,
            )
            for patient in patients
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search patients: {str(e)}"
        )

@router.get("/patients/{patient_id}/details", response_model=PatientDetailsResponse)
async def get_patient_details(
    patient_id: int,
):
    """
    Get detailed patient information for billing
    """
    try:
        patient = await get_or_404(
            Patient, 
            id=patient_id,
            select_related=['department', 'staff'],
            prefetch_related=['bed']
        )

        # Get bed information if exists
        bed_info = {}
        if patient.bed:
            bed_info = {
                "bed_number": patient.bed.bed_number,
                "bed_group": patient.bed.bed_group,
                "room_type": patient.bed.room_type,
            }

        return PatientDetailsResponse(
            id=patient.id,
            full_name=patient.full_name or "",
            patient_unique_id=patient.patient_unique_id or "",
            age=patient.age,
            gender=patient.gender,
            date_of_birth=patient.date_of_birth,
            address=patient.address or "",
            phone_number=patient.phone_number or "",
            email=patient.email or "",
            admission_date=patient.admission_date,
            discharge_date=patient.discharge_date,
            department=patient.department.name if patient.department else "",
            doctor=patient.staff.full_name if patient.staff else "",
            bed_info=bed_info,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch patient details: {str(e)}"
        )