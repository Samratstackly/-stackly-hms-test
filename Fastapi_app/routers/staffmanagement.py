from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, ConfigDict, validator
from typing import List, Optional
from HMS_backend.models import Staff_Management, Staff  # Django ORM models
from django.db.models import Q
from asgiref.sync import sync_to_async

router = APIRouter(
    prefix="/staff-management",
    tags=["Staff Management"]
)

# =========================
# Pydantic Schemas
# =========================
class StaffManagementBase(BaseModel):
    staff_id: int
    date: str
    shift: Optional[str]
    status: str
    check_in: Optional[str]
    check_out: Optional[str]

class StaffManagementCreate(StaffManagementBase):
    pass

class StaffManagementUpdate(StaffManagementBase):
    pass

class StaffManagementResponse(StaffManagementBase):
    id: int
    staff_name: str
    designation: str

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_with_details(cls, obj: Staff_Management):
        return cls(
            id=obj.id,
            staff_id=obj.staff.id if obj.staff else 0,
            staff_name=obj.staff.full_name if obj.staff else "Unknown",
            designation=obj.staff.designation if obj.staff else "",
            date=str(obj.date),
            shift=obj.shift,
            status=obj.status,
            check_in=str(obj.check_in) if obj.check_in else "",
            check_out=str(obj.check_out) if obj.check_out else ""
        )

# =========================
# CRUD Endpoints
# =========================
@router.get("/", response_model=List[StaffManagementResponse])
async def read_attendance(
    staff_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 20
):
    query = await sync_to_async(lambda: Staff_Management.objects.all())()
    if staff_id:
        query = await sync_to_async(lambda: query.filter(staff__id=staff_id))()
    if status:
        query = await sync_to_async(lambda: query.filter(status=status))()
    
    attendance_list = await sync_to_async(lambda: list(query[skip:skip + limit]))()
    return [StaffManagementResponse.from_orm_with_details(a) for a in attendance_list]

@router.get("/{attendance_id}", response_model=StaffManagementResponse)
async def read_attendance_by_id(attendance_id: int):
    try:
        obj = await sync_to_async(lambda: Staff_Management.objects.get(id=attendance_id))()
        return StaffManagementResponse.from_orm_with_details(obj)
    except Staff_Management.DoesNotExist:
        raise HTTPException(status_code=404, detail="Attendance record not found")

@router.post("/", response_model=StaffManagementResponse, status_code=201)
async def create_attendance(att: StaffManagementCreate):
    try:
        staff_obj = await sync_to_async(lambda: Staff.objects.get(id=att.staff_id))()
    except Staff.DoesNotExist:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    new_att = await sync_to_async(lambda: Staff_Management.objects.create(
        staff=staff_obj,
        date=att.date,
        shift=att.shift,
        status=att.status,
        check_in=att.check_in,
        check_out=att.check_out
    ))()
    return StaffManagementResponse.from_orm_with_details(new_att)

@router.put("/{attendance_id}", response_model=StaffManagementResponse)
async def update_attendance(attendance_id: int, att: StaffManagementUpdate):
    try:
        db_att = await sync_to_async(lambda: Staff_Management.objects.get(id=attendance_id))()
        staff_obj = await sync_to_async(lambda: Staff.objects.get(id=att.staff_id))()
        db_att.staff = staff_obj
        db_att.date = att.date
        db_att.shift = att.shift
        db_att.status = att.status
        db_att.check_in = att.check_in
        db_att.check_out = att.check_out
        await sync_to_async(db_att.save)()
        return StaffManagementResponse.from_orm_with_details(db_att)
    except Staff_Management.DoesNotExist:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    except Staff.DoesNotExist:
        raise HTTPException(status_code=404, detail="Staff not found")

@router.delete("/{attendance_id}", status_code=204)
async def delete_attendance(attendance_id: int):
    try:
        db_att = await sync_to_async(lambda: Staff_Management.objects.get(id=attendance_id))()
        await sync_to_async(db_att.delete)()
        return None
    except Staff_Management.DoesNotExist:
        raise HTTPException(status_code=404, detail="Attendance record not found")
