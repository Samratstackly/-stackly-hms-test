# Fastapi_app/routers/laboratory.py
from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from pydantic import BaseModel, validator
from datetime import datetime
from django.db import transaction
import os
import sys

# Django setup
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_project.settings")
import django
django.setup()

from HMS_backend.models import MedicalTest
from asgiref.sync import sync_to_async

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

router = APIRouter(prefix="/laboratory", tags=["Laboratory"])

# ---------- Schemas ----------
class MedicalTestCreate(BaseModel):
    test_type: str  # Changed from test_name to test_type
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    status: str = "available"

    @validator("test_type")
    def validate_test_type(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Test type is required")
        if len(v) > 100:
            raise ValueError("Test type cannot exceed 100 characters")
        return v.strip()

    @validator("price")
    def validate_price(cls, v):
        if v is not None and v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @validator("duration_minutes")
    def validate_duration(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Duration must be positive")
        return v

    @validator("status")
    def validate_status(cls, v):
        allowed_statuses = ["available", "unavailable", "maintenance"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v

class MedicalTestUpdate(BaseModel):
    test_type: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    status: Optional[str] = None

    @validator("test_type")
    def validate_test_type_update(cls, v):
        if v is not None:
            if len(v.strip()) == 0:
                raise ValueError("Test type cannot be empty")
            if len(v) > 100:
                raise ValueError("Test type cannot exceed 100 characters")
            return v.strip()
        return v

    @validator("price")
    def validate_price_update(cls, v):
        if v is not None and v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @validator("duration_minutes")
    def validate_duration_update(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Duration must be positive")
        return v

    @validator("status")
    def validate_status_update(cls, v):
        if v is not None:
            allowed_statuses = ["available", "unavailable", "maintenance"]
            if v not in allowed_statuses:
                raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v

class MedicalTestOut(BaseModel):
    id: int
    test_type: str  # Changed from test_name to test_type
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    status: str
    created_at: datetime

    class Config:
        arbitrary_types_allowed = True

# ---------- Helper ----------
def medical_test_to_out(test: MedicalTest) -> MedicalTestOut:
    return MedicalTestOut(
        id=test.id,
        test_type=test.test_type,
        description=test.description,
        price=float(test.price) if test.price else None,
        duration_minutes=test.duration_minutes,
        status=test.status,
        created_at=test.created_at,
    )

# ---------- Routes ----------
@router.post("/tests", response_model=MedicalTestOut, status_code=status.HTTP_201_CREATED)
async def create_medical_test(payload: MedicalTestCreate):
    """Create a new medical test"""
    try:
        # Normalize the test type for checking
        normalized_test_type = payload.test_type.strip().title()
        # Example: "mri" → "Mri", "blood test" → "Blood Test"
        
        @sync_to_async
        def check_existing_test():
            ensure_db_connection()
            # Check against normalized version
            return MedicalTest.objects.filter(
                test_type__iexact=normalized_test_type
            ).first()
        
        existing_test = await check_existing_test()
        
        if existing_test:
            raise HTTPException(
                status_code=409,
                detail=f"We already have this test type: {payload.test_type}"
            )
        
        # Optionally save normalized version for consistency
        payload.test_type = normalized_test_type
        
        @sync_to_async
        def create_test_with_transaction():
            ensure_db_connection()
            with transaction.atomic():
                test = MedicalTest.objects.create(
                    test_type=payload.test_type,
                    description=payload.description,
                    price=payload.price,
                    duration_minutes=payload.duration_minutes,
                    status=payload.status,
                )
                return MedicalTest.objects.get(id=test.id)

        test = await create_test_with_transaction()
        return medical_test_to_out(test)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create test: {str(e)}")

@router.get("/tests", response_model=List[MedicalTestOut])
async def list_medical_tests(
    status: Optional[str] = Query(None, description="Filter by status"),
    test_type: Optional[str] = Query(None, description="Filter by test type"),
    search: Optional[str] = Query(None, description="Search by test type"),
):
    """Get all medical tests with optional filtering"""
    @sync_to_async
    def get_tests():
        ensure_db_connection()
        queryset = MedicalTest.objects.all()
        
        # Apply filters
        if status:
            queryset = queryset.filter(status=status)
        if test_type:
            queryset = queryset.filter(test_type__icontains=test_type)
        if search:
            queryset = queryset.filter(test_type__icontains=search)
        
        return list(queryset.order_by("-created_at"))
    
    tests = await get_tests()
    return [medical_test_to_out(test) for test in tests]

@router.get("/tests/{test_id}", response_model=MedicalTestOut)
async def get_medical_test(test_id: int):
    """Get a specific medical test by ID"""
    @sync_to_async
    def get_test():
        ensure_db_connection()
        try:
            return MedicalTest.objects.get(id=test_id)
        except MedicalTest.DoesNotExist:
            return None
    
    test = await get_test()
    
    if test is None:
        raise HTTPException(status_code=404, detail="Medical test not found")
    
    return medical_test_to_out(test)

@router.put("/tests/{test_id}", response_model=MedicalTestOut)
async def update_medical_test(test_id: int, payload: MedicalTestUpdate):
    """Update a medical test"""
    @sync_to_async
    def get_test():
        ensure_db_connection()
        try:
            return MedicalTest.objects.get(id=test_id)
        except MedicalTest.DoesNotExist:
            return None
    
    test = await get_test()
    
    if test is None:
        raise HTTPException(status_code=404, detail="Medical test not found")

    # === FIXED: Check for duplicate test type when updating with case-insensitive comparison ===
    if payload.test_type is not None:
        # Normalize the input for comparison
        new_test_type = payload.test_type.strip()
        
        # Case-insensitive comparison with current test_type
        if new_test_type.lower() != test.test_type.lower():
            @sync_to_async
            def check_existing_test_for_update():
                ensure_db_connection()
                # Check if there's any OTHER test with the same test_type (case-insensitive)
                return MedicalTest.objects.filter(
                    test_type__iexact=new_test_type  # Case-insensitive lookup
                ).exclude(id=test_id).first()
            
            existing_test = await check_existing_test_for_update()
            
            if existing_test:
                raise HTTPException(
                    status_code=409,  # Conflict
                    detail=f"We already have this test type: {payload.test_type}"
                )
            
            # Only update if different (case-insensitive) and no duplicate
            test.test_type = new_test_type
        # else: test type is the same (case-insensitive), no need to update or check
    # === END FIXED CODE ===
    
    # Update other fields
    if payload.description is not None:
        test.description = payload.description
    if payload.price is not None:
        test.price = payload.price
    if payload.duration_minutes is not None:
        test.duration_minutes = payload.duration_minutes
    if payload.status is not None:
        test.status = payload.status

    @sync_to_async
    def save_test():
        ensure_db_connection()
        with transaction.atomic():
            test.save()
            return MedicalTest.objects.get(id=test.id)

    try:
        updated_test = await save_test()
        return medical_test_to_out(updated_test)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update test: {str(e)}")

@router.delete("/tests/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medical_test(test_id: int):
    """Delete a medical test"""
    @sync_to_async
    def delete_test():
        ensure_db_connection()
        try:
            test = MedicalTest.objects.get(id=test_id)
            test.delete()
            return True
        except MedicalTest.DoesNotExist:
            return False

    deleted = await delete_test()
    if not deleted:
        raise HTTPException(status_code=404, detail="Medical test not found")

@router.get("/test-types", response_model=List[str])
async def get_test_types():
    """Get distinct test types for dropdown"""
    @sync_to_async
    def get_distinct_types():
        ensure_db_connection()
        return list(MedicalTest.objects.values_list('test_type', flat=True).distinct())
    
    types = await get_distinct_types()
    return types

@router.get("/status-counts", response_model=dict)
async def get_status_counts():
    """Get count of tests by status"""
    @sync_to_async
    def get_counts():
        ensure_db_connection()
        counts = {}
        statuses = ["available", "unavailable", "maintenance"]
        for status in statuses:
            counts[status] = MedicalTest.objects.filter(status=status).count()
        counts["total"] = MedicalTest.objects.count()
        return counts
    
    return await get_counts()