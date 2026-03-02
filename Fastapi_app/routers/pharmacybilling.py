
#fastapi_app/routers/pharmacybilling.py
from fastapi import APIRouter, HTTPException 
from pydantic import BaseModel
from typing import List, Optional
from asgiref.sync import sync_to_async
from datetime import datetime

from HMS_backend.models import Patient, MedicineAllocation, Stock

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

router = APIRouter(prefix="/pharmacy-billing", tags=["Pharmacy Billing"])

# ---------- Pydantic Response Models ----------
class StockCheckItem(BaseModel):
    medicine_name: str
    item_code: str
    quantity_needed: int
    quantity_available: int
    sufficient_stock: bool

class StockCheckResponse(BaseModel):
    all_medicines_available: bool
    stock_check: List[StockCheckItem]

class PharmacyBillingItem(BaseModel):
    allocation_id: int 
    item_code: str
    name_of_drug: str
    rack_no: Optional[str] = None
    shelf_no: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    frequency: Optional[str] = None
    dosage: Optional[str] = None
    duration: Optional[str] = None
    allocation_date: Optional[str] = None
    doctor_name: Optional[str] = None

class PharmacyBillingResponse(BaseModel):
    patient_name: str
    patient_unique_id: str
    billing_date: str
    total_items: int
    total_amount: float
    items: List[PharmacyBillingItem]

# ---------- Fetch Pharmacy Billing Data ----------
@router.get("/{patient_id}/", response_model=PharmacyBillingResponse)
async def get_pharmacy_billing_details(
    patient_id: int, 
    date_from: Optional[str] = None, 
    date_to: Optional[str] = None
):
    try:
        # Fetch patient
        @sync_to_async
        def get_patient(pid):
            ensure_db_connection()
            return Patient.objects.get(id=pid)

        patient = await get_patient(patient_id)

        # ✅ Fetch ONLY pending allocations (not billed or paid)
        allocations_query = MedicineAllocation.objects.select_related("staff").filter(
            patient=patient,
            billing_status="pending"  # ✅ Only show pending allocations
        )

        # Apply date filtering if provided
        if date_from:
            allocations_query = allocations_query.filter(allocation_date__gte=date_from)

        if date_to:
            allocations_query = allocations_query.filter(allocation_date__lte=date_to)

        @sync_to_async
        def get_allocations(query):
            ensure_db_connection()
            return list(query)

        allocations = await get_allocations(allocations_query)

        billing_items = []
        total_amount = 0.0

        for allocation in allocations:
            if not allocation.medicine_name:
                continue

            # Fetch stock asynchronously
            @sync_to_async
            def get_stock(medicine_name):
                ensure_db_connection()
                return Stock.objects.filter(
                    product_name__iexact=medicine_name
                ).first()

            stock = await get_stock(allocation.medicine_name)

            unit_price = float(stock.unit_price) if stock else 0.0
            quantity = int(allocation.quantity or 0)

            item = PharmacyBillingItem(
                allocation_id=allocation.id,
                item_code=stock.item_code if stock else "N/A",
                name_of_drug=allocation.medicine_name,
                rack_no=stock.rack_no if stock else None,
                shelf_no=stock.shelf_no if stock else None,
                quantity=quantity,
                unit_price=unit_price,
                frequency=allocation.frequency,
                dosage=allocation.dosage,
                duration=allocation.duration,
                allocation_date=allocation.allocation_date.strftime("%Y-%m-%d") if allocation.allocation_date else None,
                doctor_name=allocation.staff.full_name if allocation.staff else "N/A"
            )

            billing_items.append(item)
            total_amount += unit_price * quantity

        return PharmacyBillingResponse(
            patient_name=patient.full_name,
            patient_unique_id=patient.patient_unique_id,
            billing_date=datetime.now().strftime("%d-%m-%Y %H:%M"),
            total_items=len(billing_items),
            total_amount=total_amount,
            items=billing_items
        )

    except Patient.DoesNotExist:
        # Return empty response instead of 404
        return PharmacyBillingResponse(
            patient_name="",
            patient_unique_id="",
            billing_date=datetime.now().strftime("%d-%m-%Y %H:%M"),
            total_items=0,
            total_amount=0.0,
            items=[]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/check-stock-availability/{patient_id}/", response_model=StockCheckResponse)
async def check_stock_availability(
    patient_id: int, 
    date_from: Optional[str] = None, 
    date_to: Optional[str] = None
):
    try:
        # ✅ Fetch ONLY pending allocations for stock check
        allocations_query = MedicineAllocation.objects.select_related("staff").filter(
            patient_id=patient_id,
            billing_status="pending"  # ✅ Only check stock for pending allocations
        )

        if date_from:
            allocations_query = allocations_query.filter(allocation_date__gte=date_from)
        if date_to:
            allocations_query = allocations_query.filter(allocation_date__lte=date_to)

        @sync_to_async
        def get_allocations(query):
            ensure_db_connection()
            return list(query)

        allocations = await get_allocations(allocations_query)

        stock_check_results = []
        all_available = True

        for allocation in allocations:
            if not allocation.medicine_name:
                continue

            # Fetch stock
            @sync_to_async
            def get_stock(medicine_name):
                ensure_db_connection()
                return Stock.objects.filter(
                    product_name__iexact=medicine_name
                ).first()

            stock = await get_stock(allocation.medicine_name)

            quantity_needed = int(allocation.quantity or 0)
            quantity_available = stock.quantity if stock else 0
            sufficient_stock = quantity_available >= quantity_needed

            if not sufficient_stock:
                all_available = False

            stock_check_results.append(StockCheckItem(
                medicine_name=allocation.medicine_name,
                item_code=stock.item_code if stock else "N/A",
                quantity_needed=quantity_needed,
                quantity_available=quantity_available,
                sufficient_stock=sufficient_stock
            ))

        return StockCheckResponse(
            all_medicines_available=all_available,
            stock_check=stock_check_results
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))