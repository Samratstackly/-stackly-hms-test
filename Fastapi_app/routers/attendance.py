from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from HMS_backend.models import Staff_Management, Staff
from django.db.models import Q
from collections import defaultdict
from asgiref.sync import sync_to_async
from datetime import date

from django.db import close_old_connections, connection

# ------------------- Database Health Check -------------------
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

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)

# =========================
# Pydantic Schemas
# =========================
class AttendanceBase(BaseModel):
    staff_id: int
    date: date
    shift: Optional[str]
    status: str
    check_in: Optional[str]
    check_out: Optional[str]

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(AttendanceBase):
    pass

class AttendanceResponse(AttendanceBase):
    id: int
    staff_name: str
    designation: str
    department: Optional[str]

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    async def from_orm_with_details(cls, obj: Staff_Management):
        # Async-safe access
        staff_name = await sync_to_async(lambda: (ensure_db_connection(), obj.staff.full_name if obj.staff else "Unknown")[1])()
        designation = await sync_to_async(lambda: (ensure_db_connection(), obj.staff.designation if obj.staff else "")[1])()
        department = await sync_to_async(lambda: (ensure_db_connection(), obj.staff.department.name if obj.staff and obj.staff.department else None)[1])()

        return cls(
            id=obj.id,
            staff_id=obj.staff.id if obj.staff else 0,
            staff_name=staff_name,
            designation=designation,
            department=department,
            date=obj.date,
            shift=obj.shift,
            status=obj.status,
            check_in=str(obj.check_in) if obj.check_in else "",
            check_out=str(obj.check_out) if obj.check_out else ""
        )

# =========================
# CRUD Endpoints
# =========================
@router.get("/", response_model=List[AttendanceResponse])
async def get_attendance(
    staff_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    skip: int = 0,
    limit: int = 20
):
    query = await sync_to_async(lambda: (ensure_db_connection(), Staff_Management.objects.all())[1])()
    
    if staff_id:
        query = await sync_to_async(lambda: (ensure_db_connection(), query.filter(staff__id=staff_id))[1])()
    if status:
        query = await sync_to_async(lambda: (ensure_db_connection(), query.filter(status=status))[1])()
    if start_date:
        query = await sync_to_async(lambda: (ensure_db_connection(), query.filter(date__gte=start_date))[1])()
    if end_date:
        query = await sync_to_async(lambda: (ensure_db_connection(), query.filter(date__lte=end_date))[1])()

    attendance_list = await sync_to_async(lambda: (ensure_db_connection(), list(query[skip:skip + limit]))[1])()
    return [await AttendanceResponse.from_orm_with_details(a) for a in attendance_list]

@router.get("/{attendance_id}", response_model=AttendanceResponse)
async def get_attendance_by_id(attendance_id: int):
    try:
        obj = await sync_to_async(lambda: (ensure_db_connection(), Staff_Management.objects.get(id=attendance_id))[1])()
        return await AttendanceResponse.from_orm_with_details(obj)
    except Staff_Management.DoesNotExist:
        raise HTTPException(status_code=404, detail="Attendance record not found")

@router.post("/", response_model=AttendanceResponse, status_code=201)
async def create_attendance(att: AttendanceCreate):
    try:
        staff_obj = await sync_to_async(lambda: (ensure_db_connection(), Staff.objects.get(id=att.staff_id))[1])()
    except Staff.DoesNotExist:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    new_att = await sync_to_async(lambda: (ensure_db_connection(), Staff_Management.objects.create(
        staff=staff_obj,
        date=att.date,
        shift=att.shift,
        status=att.status,
        check_in=att.check_in,
        check_out=att.check_out
    ))[1])()
    return await AttendanceResponse.from_orm_with_details(new_att)

@router.put("/{attendance_id}", response_model=AttendanceResponse)
async def update_attendance(attendance_id: int, att: AttendanceUpdate):
    try:
        db_att = await sync_to_async(lambda: (ensure_db_connection(), Staff_Management.objects.get(id=attendance_id))[1])()
        staff_obj = await sync_to_async(lambda: (ensure_db_connection(), Staff.objects.get(id=att.staff_id))[1])()
        
        db_att.staff = staff_obj
        db_att.date = att.date
        db_att.shift = att.shift
        db_att.status = att.status
        db_att.check_in = att.check_in
        db_att.check_out = att.check_out
        await sync_to_async(lambda: (ensure_db_connection(), db_att.save())[1])()
        return await AttendanceResponse.from_orm_with_details(db_att)
    except Staff_Management.DoesNotExist:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    except Staff.DoesNotExist:
        raise HTTPException(status_code=404, detail="Staff not found")

@router.delete("/{attendance_id}", status_code=204)
async def delete_attendance(attendance_id: int):
    try:
        db_att = await sync_to_async(lambda: (ensure_db_connection(), Staff_Management.objects.get(id=attendance_id))[1])()
        await sync_to_async(lambda: (ensure_db_connection(), db_att.delete())[1])()
        return None
    except Staff_Management.DoesNotExist:
        raise HTTPException(status_code=404, detail="Attendance record not found")

# =========================
# Chart Endpoints
# =========================
class AttendanceChartItem(BaseModel):
    date: str
    present: int
    absent: int
    leave: int

class StaffAttendanceItem(BaseModel):
    staff_id: int
    staff_name: str
    designation: str
    department: Optional[str]
    total_present: int
    total_absent: int
    total_leave: int

@router.get("/chart/daily", response_model=List[AttendanceChartItem])
async def daily_attendance_chart(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    # Fetch the queryset and apply filters synchronously
    queryset = await sync_to_async(lambda: (ensure_db_connection(), Staff_Management.objects.all())[1])()
    if start_date:
        queryset = await sync_to_async(lambda: (ensure_db_connection(), queryset.filter(date__gte=start_date))[1])()
    if end_date:
        queryset = await sync_to_async(lambda: (ensure_db_connection(), queryset.filter(date__lte=end_date))[1])()

    # Convert queryset to list to avoid lazy evaluation in async context
    attendance_list = await sync_to_async(lambda: (ensure_db_connection(), list(queryset))[1])()

    chart_dict = defaultdict(lambda: {"present": 0, "absent": 0, "leave": 0})
    for att in attendance_list:
        att_date = att.date.isoformat()
        # Access status directly since the queryset is already fetched
        status = att.status
        if status == "Present":
            chart_dict[att_date]["present"] += 1
        elif status == "Absent":
            chart_dict[att_date]["absent"] += 1
        elif status == "Leave":
            chart_dict[att_date]["leave"] += 1

    return [
        AttendanceChartItem(date=dt, present=vals["present"], absent=vals["absent"], leave=vals["leave"])
        for dt, vals in sorted(chart_dict.items())
    ]


@router.get("/chart/staff", response_model=List[StaffAttendanceItem])
async def staff_attendance_chart():
    # Fetch the queryset into a list to avoid lazy evaluation
    queryset = await sync_to_async(lambda: (ensure_db_connection(), list(Staff_Management.objects.select_related('staff__department')))[1])()

    staff_dict = defaultdict(lambda: {"present": 0, "absent": 0, "leave": 0, "designation": "", "department": ""})
    
    for att in queryset:
        staff_obj = att.staff
        if not staff_obj:
            continue
        key = staff_obj.id
        designation = staff_obj.designation
        department = staff_obj.department.name if staff_obj.department else None
        staff_dict[key]["designation"] = designation
        staff_dict[key]["department"] = department
        status = att.status
        staff_dict[key]["present"] += 1 if status == "Present" else 0
        staff_dict[key]["absent"] += 1 if status == "Absent" else 0
        staff_dict[key]["leave"] += 1 if status == "Leave" else 0

    result = []
    for sid, vals in staff_dict.items():
        # Fetch staff_name for the specific staff_id
        staff_name = await sync_to_async(lambda: (ensure_db_connection(), Staff.objects.get(id=sid).full_name)[1])()
        result.append(
            StaffAttendanceItem(
                staff_id=sid,
                staff_name=staff_name,
                designation=vals["designation"],
                department=vals["department"],
                total_present=vals["present"],
                total_absent=vals["absent"],
                total_leave=vals["leave"]
            )
        )
    return result