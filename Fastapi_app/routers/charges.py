# charges.py (SIMPLIFIED VERSION)
from pydantic import BaseModel, validator, Field
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Query, Depends
from django.db import transaction
from django.db.models import Q
from asgiref.sync import sync_to_async
from Fastapi_app.routers.user_profile import get_current_user

# Import models
from HMS_backend.models import Charge, User

router = APIRouter(prefix="/charges", tags=["Charges"])

# ---------- Charge Schemas ----------
class ChargeCreate(BaseModel):
    charge: str = Field(..., max_length=255, description="Charge name")
    unit_price: float = Field(..., ge=0, description="Unit price")
    description: Optional[str] = Field(None, description="Description of the charge")

    @validator("charge")
    def validate_charge(cls, v):
        if not v or not v.strip():
            raise ValueError("Charge name cannot be empty")
        return v.strip()

    @validator("unit_price")
    def validate_unit_price(cls, v):
        if v < 0:
            raise ValueError("Unit price cannot be negative")
        return float(v)

class ChargeUpdate(BaseModel):
    charge: Optional[str] = Field(None, max_length=255, description="Charge name")
    unit_price: Optional[float] = Field(None, ge=0, description="Unit price")
    description: Optional[str] = Field(None, description="Description of the charge")

    @validator("charge")
    def validate_charge_update(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Charge name cannot be empty")
        return v.strip() if v else v

    @validator("unit_price")
    def validate_unit_price_update(cls, v):
        if v is not None and v < 0:
            raise ValueError("Unit price cannot be negative")
        return float(v) if v is not None else v

class ChargeOut(BaseModel):
    id: int
    charge: str
    unit_price: float
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ---------- Helper Functions ----------
async def get_or_404(model, **kwargs):
    """Helper to get object or raise 404"""
    @sync_to_async
    def _get():
        try:
            return model.objects.get(**kwargs)
        except model.DoesNotExist:
            return None

    obj = await _get()
    if obj is None:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return obj

def charge_to_out(charge: Charge) -> ChargeOut:
    """Convert Charge model to output schema"""
    return ChargeOut(
        id=charge.id,
        charge=charge.charge,
        unit_price=float(charge.unit_price),
        description=charge.description,
        created_at=charge.created_at,
    )

# ---------- Charge Routes ----------

@router.post("/", response_model=ChargeOut, status_code=status.HTTP_201_CREATED)
async def create_charge(
    payload: ChargeCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new charge"""
    try:
        @sync_to_async
        def create_charge_with_transaction():
            with transaction.atomic():
                # Check if charge with same name already exists
                if Charge.objects.filter(charge__iexact=payload.charge).exists():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Charge '{payload.charge}' already exists"
                    )
                
                charge_obj = Charge.objects.create(
                    charge=payload.charge,
                    unit_price=payload.unit_price,
                    description=payload.description
                )
                return charge_obj

        charge_obj = await create_charge_with_transaction()
        return charge_to_out(charge_obj)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create charge: {str(e)}"
        )

@router.get("/", response_model=List[ChargeOut])
async def list_charges(
    search: Optional[str] = Query(None, description="Search in charge name or description")
):
    """Get all charges with optional search"""
    @sync_to_async
    def get_charges():
        queryset = Charge.objects.all().order_by("-created_at")

        if search:
            queryset = queryset.filter(
                Q(charge__icontains=search) |
                Q(description__icontains=search)
            )

        return list(queryset)

    try:
        charges_list = await get_charges()
        return [charge_to_out(charge) for charge in charges_list]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch charges: {str(e)}"
        )

@router.get("/{charge_id}", response_model=ChargeOut)
async def get_charge(charge_id: int):
    """Get a specific charge by ID"""
    try:
        charge = await get_or_404(Charge, id=charge_id)
        return charge_to_out(charge)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch charge: {str(e)}"
        )

@router.put("/{charge_id}", response_model=ChargeOut)
async def update_charge(
    charge_id: int,
    payload: ChargeUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a charge"""
    try:
        charge = await get_or_404(Charge, id=charge_id)

        @sync_to_async
        def update_charge_with_transaction():
            with transaction.atomic():
                if payload.charge is not None and payload.charge != charge.charge:
                    if Charge.objects.filter(charge__iexact=payload.charge).exclude(id=charge_id).exists():
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Charge '{payload.charge}' already exists"
                        )
                    charge.charge = payload.charge

                if payload.unit_price is not None:
                    charge.unit_price = payload.unit_price

                if payload.description is not None:
                    charge.description = payload.description

                charge.save()
                return charge

        updated_charge = await update_charge_with_transaction()
        return charge_to_out(updated_charge)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update charge: {str(e)}"
        )

@router.delete("/{charge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_charge(
    charge_id: int,
    current_user: User = Depends(get_current_user)
):
    """Delete a charge"""
    try:
        charge = await get_or_404(Charge, id=charge_id)

        @sync_to_async
        def delete_charge_with_transaction():
            with transaction.atomic():
                charge.delete()
                return True

        await delete_charge_with_transaction()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete charge: {str(e)}"
        )