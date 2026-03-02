from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional, List
from HMS_backend.models import Payroll, Staff, Department
from asgiref.sync import sync_to_async

router = APIRouter(
    prefix="/payroll",
    tags=["Payroll"]
)

# -----------------------------
# Pydantic Models
# -----------------------------
class PayrollBase(BaseModel):
    staff_id: int
    pay_period: str
    net_pay: float
    payment_date: date
    status: str

class PayrollCreate(PayrollBase):
    pass

class PayrollUpdate(PayrollBase):
    pass

class PayrollResponse(BaseModel):
    id: int
    staff_id: int
    staff_name: str
    department: Optional[str]  # Will store the department name
    designation: Optional[str]
    pay_period: str
    net_pay: float
    payment_date: date
    status: str

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    async def from_orm_with_details(cls, payroll_obj):
        """
        Async-safe method to convert Payroll ORM object to PayrollResponse,
        fetching staff and department details safely in sync_to_async.
        """
        async def get_staff_details():
            staff = await sync_to_async(lambda: payroll_obj.staff)()
            department = await sync_to_async(lambda: staff.department)() if staff.department_id else None
            return {
                "id": staff.id,
                "full_name": getattr(staff, "full_name", "Unknown"),
                "department": getattr(department, "name", None) if department else None,
                "designation": getattr(staff, "designation", None),
            }

        staff_details = await get_staff_details()

        return cls(
            id=payroll_obj.id,
            staff_id=staff_details["id"],
            staff_name=staff_details["full_name"],
            department=staff_details["department"],
            designation=staff_details["designation"],
            pay_period=payroll_obj.pay_period,
            net_pay=float(payroll_obj.net_pay),
            payment_date=payroll_obj.payment_date,
            status=payroll_obj.status
        )

# -----------------------------
# CRUD Endpoints
# -----------------------------
@router.get("/", response_model=List[PayrollResponse])
async def get_payroll(
    staff_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    pay_period: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 10
):
    def fetch_query():
        q = Payroll.objects.select_related("staff__department").all()
        if staff_id:
            q = q.filter(staff__id=staff_id)
        if status:
            q = q.filter(status=status)
        if pay_period:
            q = q.filter(pay_period=pay_period)
        return list(q[skip:skip + limit])

    payroll_list = await sync_to_async(fetch_query)()
    return [await PayrollResponse.from_orm_with_details(p) for p in payroll_list]

@router.get("/{payroll_id}", response_model=PayrollResponse)
async def get_payroll_by_id(payroll_id: int):
    def fetch_payroll():
        return Payroll.objects.select_related("staff__department").get(id=payroll_id)
    
    try:
        obj = await sync_to_async(fetch_payroll)()
        return await PayrollResponse.from_orm_with_details(obj)
    except Payroll.DoesNotExist:
        raise HTTPException(status_code=404, detail="Payroll record not found")

@router.post("/", response_model=PayrollResponse, status_code=201)
async def create_payroll(payroll: PayrollCreate):
    def create_payroll_sync():
        staff_obj = Staff.objects.get(id=payroll.staff_id)
        new_payroll = Payroll.objects.create(
            staff=staff_obj,
            pay_period=payroll.pay_period,
            net_pay=payroll.net_pay,
            payment_date=payroll.payment_date,
            status=payroll.status
        )
        return new_payroll

    try:
        payroll_with_staff = await sync_to_async(create_payroll_sync)()
        return await PayrollResponse.from_orm_with_details(payroll_with_staff)
    except Staff.DoesNotExist:
        raise HTTPException(status_code=404, detail="Staff not found")

@router.put("/{payroll_id}", response_model=PayrollResponse)
async def update_payroll(payroll_id: int, payroll: PayrollUpdate):
    def update_sync():
        db_payroll = Payroll.objects.get(id=payroll_id)
        staff_obj = Staff.objects.get(id=payroll.staff_id)

        db_payroll.staff = staff_obj
        db_payroll.pay_period = payroll.pay_period
        db_payroll.net_pay = payroll.net_pay
        db_payroll.payment_date = payroll.payment_date
        db_payroll.status = payroll.status
        db_payroll.save()
        return db_payroll

    try:
        updated_payroll = await sync_to_async(update_sync)()
        return await PayrollResponse.from_orm_with_details(updated_payroll)
    except Payroll.DoesNotExist:
        raise HTTPException(status_code=404, detail="Payroll record not found")
    except Staff.DoesNotExist:
        raise HTTPException(status_code=404, detail="Staff not found")

@router.delete("/{payroll_id}", status_code=204)
async def delete_payroll(payroll_id: int):
    def delete_sync():
        db_payroll = Payroll.objects.get(id=payroll_id)
        db_payroll.delete()
    
    try:
        await sync_to_async(delete_sync)()
        return None
    except Payroll.DoesNotExist:
        raise HTTPException(status_code=404, detail="Payroll record not found")