from fastapi import APIRouter, HTTPException, status, Form, Body, Depends
from pydantic import BaseModel, ConfigDict, validator, Field
from typing import List, Optional, Dict, Any
from HMS_backend.models import BedGroup, Bed, Patient
import django.db.models as models
from datetime import datetime
from asgiref.sync import sync_to_async

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

router = APIRouter(prefix="/bedgroups", tags=["Bed Groups"])

# ---------------------------
# Pydantic Schemas
# ---------------------------
class BedGroupBase(BaseModel):
    bedGroup: str
    capacity: int

class BedGroupCreate(BedGroupBase):
    pass

class BedGroupCreateWithRange(BaseModel):
    bedGroup: str
    bedFrom: int  # Starting bed number
    bedTo: int    # Ending bed number
    
    @validator('bedTo')
    def validate_range(cls, v, values):
        if 'bedFrom' in values and v <= values['bedFrom']:
            raise ValueError('bedTo must be greater than bedFrom')
        return v
    
    @property
    def capacity(self):
        return self.bedTo - self.bedFrom + 1

class BedGroupUpdate(BaseModel):
    bedGroup: Optional[str] = None
    bedFrom: Optional[int] = None
    bedTo: Optional[int] = None
    
    @validator('bedTo')
    def validate_range(cls, v, values):
        if 'bedFrom' in values and v is not None and values.get('bedFrom') is not None and v <= values['bedFrom']:
            raise ValueError('bedTo must be greater than bedFrom')
        return v

class PatientInfo(BaseModel):
    id: str
    name: str
    admission_date: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

class BedBase(BaseModel):
    bed_number: int
    is_occupied: bool

class BedResponse(BedBase):
    id: int
    patient: Optional[PatientInfo] = None
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

class BedGroupResponse(BedGroupBase):
    id: int
    occupied: int
    unoccupied: int
    status: str
    bed_range: str
    beds: List[BedResponse] = []
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)
    
    @classmethod
    async def from_orm_with_beds(cls, group: BedGroup):
        beds = []
        # Use sync_to_async for related objects with proper prefetching
        group_beds = await sync_to_async(lambda: (ensure_db_connection(), list(
            group.beds.all().select_related('patient', 'bed_group')
        ))[1])()
       
        for bed in group_beds:
            patient_info = None
            if bed.patient_id:
                # Patient is already loaded due to select_related
                patient_obj = bed.patient
                patient_info = PatientInfo(
                    id=str(patient_obj.patient_unique_id),
                    name=str(patient_obj.full_name),
                    admission_date=patient_obj.admission_date,
                )
            beds.append(
                BedResponse(
                    id=bed.id,
                    bed_number=bed.bed_number,
                    is_occupied=bed.is_occupied,
                    patient=patient_info,
                )
            )
        
        # Calculate bed range
        bed_numbers = [b.bed_number for b in group_beds]
        if bed_numbers:
            bed_range = f"{min(bed_numbers)}-{max(bed_numbers)}"
        else:
            bed_range = "1-1"
        
        return cls(
            id=group.id,
            bedGroup=group.bedGroup,
            capacity=group.capacity,
            occupied=group.occupied,
            unoccupied=group.unoccupied,
            status=group.status,
            bed_range=bed_range,
            beds=beds,
        )

# ---------------------------
# Admit Patient Pydantic Model (NEW)
# ---------------------------
class AdmitPatientRequest(BaseModel):
    full_name: str = Field(..., description="Patient full name")
    patient_unique_id: str = Field(..., description="Patient unique ID")
    bed_group_name: str = Field(..., description="Bed group name")
    bed_number: int = Field(..., description="Bed number")
    admission_date: str = Field(..., description="Admission date in MM/DD/YYYY format")
    
    @validator('admission_date')
    def validate_admission_date(cls, v):
        try:
            datetime.strptime(v, "%m/%d/%Y").date()
            return v
        except ValueError:
            raise ValueError("Invalid date format. Use MM/DD/YYYY")

# ---------------------------
# Helper Functions
# ---------------------------
async def _next_available_range(capacity: int) -> int:
    """Return the starting number for the next available contiguous range of beds."""
    
    # Get all bed numbers in ascending order
    all_beds = await sync_to_async(
        lambda: (ensure_db_connection(), list(Bed.objects.all().order_by('bed_number').values_list('bed_number', flat=True)))[1]
    )()
    
    # If no beds exist yet, start from 1
    if not all_beds:
        return 1
    
    # Find the first gap large enough for our capacity
    expected = 1
    for bed_num in all_beds:
        if bed_num != expected:
            # Found a gap
            gap_size = bed_num - expected
            if gap_size >= capacity:
                return expected
            expected = bed_num + 1
        else:
            expected += 1
    
    # If no gap found, continue after the last bed
    return all_beds[-1] + 1

async def _find_next_available_range(capacity: int) -> Dict[str, Any]:
    """Find the next available contiguous range of given capacity."""
    
    # Get all bed numbers in ascending order
    all_beds = await sync_to_async(
        lambda: (ensure_db_connection(), list(Bed.objects.all().order_by('bed_number').values_list('bed_number', flat=True)))[1]
    )()
    
    if not all_beds:
        return {"start": 1, "end": capacity, "adjusted": True}
    
    # Check for gaps between existing beds
    for i in range(len(all_beds) - 1):
        current = all_beds[i]
        next_bed = all_beds[i + 1]
        
        gap_start = current + 1
        gap_end = next_bed - 1
        
        if gap_start <= gap_end:  # There's a gap
            gap_size = gap_end - gap_start + 1
            if gap_size >= capacity:
                end = gap_start + capacity - 1
                return {"start": gap_start, "end": end, "adjusted": True}
    
    # No suitable gap found, start after the last bed
    start = all_beds[-1] + 1
    end = start + capacity - 1
    return {"start": start, "end": end, "adjusted": True}

async def _check_range_availability(bed_from: int, bed_to: int, exclude_group_id: Optional[int] = None) -> Dict[str, Any]:
    """Check if a range of bed numbers is available."""
    
    @sync_to_async
    def check():
        ensure_db_connection()
        # Check if any beds in this range already exist
        query = Bed.objects.filter(
            bed_number__gte=bed_from,
            bed_number__lte=bed_to
        )
        
        if exclude_group_id:
            query = query.exclude(bed_group_id=exclude_group_id)
        
        existing_beds = list(query.select_related('bed_group').values('bed_number', 'bed_group__bedGroup'))
        
        if existing_beds:
            # Find duplicate bed numbers
            duplicates = [
                {"bed_number": bed['bed_number'], "bed_group": bed['bed_group__bedGroup']}
                for bed in existing_beds
            ]
            return {
                "available": False,
                "duplicates": duplicates,
                "message": f"Bed numbers {bed_from}-{bed_to} already exist"
            }
        
        return {"available": True, "duplicates": [], "message": "Range is available"}
    
    return await check()

# ---------------------------
# Helper function for bed notifications
# ---------------------------
async def safe_send_bed_notification(notification_type: str, bed_data, patient=None, patient_name=None, old_occupied=None, new_occupied=None, old_capacity=None, new_capacity=None):
    """Safely send bed management notifications with error handling"""
    try:
        print(f"🔔 [BED] Starting {notification_type} notification")
       
        from ..routers.notifications import NotificationService
       
        if notification_type == "bed_group_created":
            await NotificationService.send_bed_group_created(bed_data)
        elif notification_type == "bed_group_updated":
            await NotificationService.send_bed_group_updated(bed_data)
        elif notification_type == "bed_group_deleted":
            await NotificationService.send_bed_group_deleted(bed_data)
        elif notification_type == "bed_created":
            await NotificationService.send_bed_created(bed_data)
        elif notification_type == "bed_updated":
            await NotificationService.send_bed_updated(bed_data)
        elif notification_type == "bed_deleted":
            await NotificationService.send_bed_deleted(bed_data)
        elif notification_type == "bed_allocated" and patient:
            await NotificationService.send_bed_allocated(bed_data, patient)
        elif notification_type == "bed_vacated" and patient_name:
            await NotificationService.send_bed_vacated(bed_data, patient_name)
        elif notification_type == "room_occupancy_changed" and old_occupied is not None and new_occupied is not None:
            await NotificationService.send_room_occupancy_changed(bed_data, old_occupied, new_occupied)
        elif notification_type == "bed_capacity_changed" and old_capacity is not None and new_capacity is not None:
            await NotificationService.send_bed_capacity_changed(bed_data, old_capacity, new_capacity)
        else:
            print(f"⚠️ [BED] Unknown notification type or missing parameters: {notification_type}")
           
        print(f"✅ [BED] {notification_type} notification sent successfully")
           
    except ImportError as e:
        print(f"❌ [BED] NotificationService not available: {e}")
    except Exception as e:
        print(f"❌ [BED] Failed to send {notification_type} notification: {e}")

# ---------------------------
# Routes with Notifications
# ---------------------------
# CREATE BED GROUP with automatic range allocation
@router.post("/add", response_model=BedGroupResponse)
async def create_bed_group(group: BedGroupCreate):
    """Create a new bed group with automatic bed number allocation"""
    # Check if bed group exists
    exists = await sync_to_async(
        lambda: (ensure_db_connection(), BedGroup.objects.filter(bedGroup=group.bedGroup).exists())[1]
    )()
   
    if exists:
        raise HTTPException(status_code=400, detail="Bed group already exists")
    
    # Find the next available contiguous range
    start = await _next_available_range(group.capacity)
    
    # Create new bed group
    new_group = await sync_to_async(lambda: (ensure_db_connection(), BedGroup.objects.create(
        bedGroup=group.bedGroup,
        capacity=group.capacity,
        occupied=0,
        unoccupied=group.capacity,
        status="Available",
    ))[1])()
    
    # Create beds with contiguous numbers
    beds_created = []
    for offset in range(group.capacity):
        bed = await sync_to_async(lambda: (ensure_db_connection(), Bed.objects.create(
            bed_number=start + offset,
            bed_group=new_group,
            is_occupied=False,
        ))[1])()
        beds_created.append(bed)
    
    # Send notifications
    await safe_send_bed_notification("bed_group_created", new_group)
   
    for bed in beds_created:
        await safe_send_bed_notification("bed_created", bed)
    
    return await BedGroupResponse.from_orm_with_beds(new_group)

# CREATE BED GROUP with specific range (with duplicate checking)
@router.post("/add-with-range", response_model=BedGroupResponse)
async def create_bed_group_with_range(group: BedGroupCreateWithRange):
    """Create a new bed group with specific bed number range"""
    # Check if bed group exists
    exists = await sync_to_async(
        lambda: (ensure_db_connection(), BedGroup.objects.filter(bedGroup=group.bedGroup).exists())[1]
    )()
   
    if exists:
        raise HTTPException(status_code=400, detail="Bed group already exists")
    
    # Check for duplicate bed numbers in the requested range
    availability = await _check_range_availability(group.bedFrom, group.bedTo)
    
    if not availability["available"]:
        # Find alternative range
        alternative = await _find_next_available_range(group.capacity)
        
        raise HTTPException(
            status_code=409,  # Conflict
            detail={
                "message": "Bed numbers already exist in the requested range",
                "duplicates": availability["duplicates"],
                "requested_range": f"{group.bedFrom}-{group.bedTo}",
                "suggested_range": f"{alternative['start']}-{alternative['end']}",
                "adjusted": alternative['adjusted']
            }
        )
    
    # Create new bed group
    new_group = await sync_to_async(lambda: (ensure_db_connection(), BedGroup.objects.create(
        bedGroup=group.bedGroup,
        capacity=group.capacity,
        occupied=0,
        unoccupied=group.capacity,
        status="Available",
    ))[1])()
    
    # Create beds in the specified range
    beds_created = []
    for bed_num in range(group.bedFrom, group.bedTo + 1):
        bed = await sync_to_async(lambda: (ensure_db_connection(), Bed.objects.create(
            bed_number=bed_num,
            bed_group=new_group,
            is_occupied=False,
        ))[1])()
        beds_created.append(bed)
    
    # Send notifications
    await safe_send_bed_notification("bed_group_created", new_group)
   
    for bed in beds_created:
        await safe_send_bed_notification("bed_created", bed)
    
    return await BedGroupResponse.from_orm_with_beds(new_group)

# CHECK FOR DUPLICATE BED NUMBERS
@router.post("/check-range")
async def check_bed_range(payload: dict = Body(...)):
    """Check if a bed number range is available"""
    bed_from = payload.get("bedFrom")
    bed_to = payload.get("bedTo")
    exclude_group_id = payload.get("excludeGroupId")
    
    if not bed_from or not bed_to:
        raise HTTPException(status_code=400, detail="bedFrom and bedTo are required")
    
    try:
        bed_from = int(bed_from)
        bed_to = int(bed_to)
    except:
        raise HTTPException(status_code=400, detail="Invalid bed numbers")
    
    if bed_from > bed_to:
        raise HTTPException(status_code=400, detail="bedFrom must be less than or equal to bedTo")
    
    capacity = bed_to - bed_from + 1
    
    # Check current range availability
    availability = await _check_range_availability(bed_from, bed_to, exclude_group_id)
    
    if availability["available"]:
        return {
            "available": True,
            "message": "Range is available",
            "range": f"{bed_from}-{bed_to}"
        }
    else:
        # Find alternative range
        alternative = await _find_next_available_range(capacity)
        
        return {
            "available": False,
            "message": "Bed numbers already exist in the requested range",
            "duplicates": availability["duplicates"],
            "requested_range": f"{bed_from}-{bed_to}",
            "suggested_range": f"{alternative['start']}-{alternative['end']}",
            "suggested_start": alternative['start'],
            "suggested_end": alternative['end'],
            "adjusted": alternative['adjusted']
        }

# GET ALL BED GROUPS
@router.get("/all", response_model=List[BedGroupResponse])
async def get_bed_groups():
    """Get all bed groups with their beds"""
    # Prefetch all related data in one query
    groups = await sync_to_async(lambda: (ensure_db_connection(), list(
        BedGroup.objects.all().prefetch_related('beds__patient')
    ))[1])()
    results = []
    for group in groups:
        result = await BedGroupResponse.from_orm_with_beds(group)
        results.append(result)
    return results

# GET BEDS OF A GROUP
@router.get("/{group_id}/beds", response_model=BedGroupResponse)
async def get_beds(group_id: int):
    """Get all beds of a specific bed group"""
    try:
        group = await sync_to_async(
            lambda: (ensure_db_connection(), BedGroup.objects.prefetch_related('beds__patient').get(id=group_id))[1]
        )()
    except BedGroup.DoesNotExist:
        raise HTTPException(status_code=404, detail="Bed group not found")
    return await BedGroupResponse.from_orm_with_beds(group)

# UPDATE BED GROUP
@router.put("/{group_id}/", response_model=BedGroupResponse)
async def update_bed_group(group_id: int, group_update: BedGroupUpdate):
    """Update bed group information"""
    try:
        bed_group = await sync_to_async(lambda: (ensure_db_connection(), BedGroup.objects.get(id=group_id))[1])()
    except BedGroup.DoesNotExist:
        raise HTTPException(status_code=404, detail="Bed group not found")
    
    # Check if bed group name already exists (excluding current)
    if group_update.bedGroup:
        exists = await sync_to_async(
            lambda: (ensure_db_connection(), BedGroup.objects.filter(bedGroup=group_update.bedGroup).exclude(id=group_id).exists())[1]
        )()
        if exists:
            raise HTTPException(status_code=400, detail="Bed group name already exists")
        bed_group.bedGroup = group_update.bedGroup
    
    old_capacity = bed_group.capacity
    old_occupied = bed_group.occupied
    
    # Handle bed range update if provided
    if group_update.bedFrom is not None and group_update.bedTo is not None:
        new_capacity = group_update.bedTo - group_update.bedFrom + 1
        
        # Check for duplicate bed numbers in new range (excluding current group)
        availability = await _check_range_availability(
            group_update.bedFrom, 
            group_update.bedTo, 
            exclude_group_id=group_id
        )
        
        if not availability["available"]:
            # Find alternative range
            alternative = await _find_next_available_range(new_capacity)
            
            raise HTTPException(
                status_code=409,
                detail={
                    "message": "Bed numbers already exist in the requested range",
                    "duplicates": availability["duplicates"],
                    "requested_range": f"{group_update.bedFrom}-{group_update.bedTo}",
                    "suggested_range": f"{alternative['start']}-{alternative['end']}",
                    "adjusted": alternative['adjusted']
                }
            )
        
        # Delete old beds and create new ones
        await sync_to_async(lambda: (ensure_db_connection(), bed_group.beds.all().delete())[1])()
        
        # Create new beds in the specified range
        for bed_num in range(group_update.bedFrom, group_update.bedTo + 1):
            await sync_to_async(lambda: (ensure_db_connection(), Bed.objects.create(
                bed_number=bed_num,
                bed_group=bed_group,
                is_occupied=False,
            ))[1])()
        
        bed_group.capacity = new_capacity
    
    await sync_to_async(lambda: (ensure_db_connection(), bed_group.save())[1])()
    await sync_to_async(lambda: (ensure_db_connection(), bed_group.refresh_counts())[1])()
    
    # Send notifications
    await safe_send_bed_notification("bed_group_updated", bed_group)
   
    if old_capacity != bed_group.capacity:
        await safe_send_bed_notification("bed_capacity_changed", bed_group, old_capacity, bed_group.capacity)
    
    return await BedGroupResponse.from_orm_with_beds(bed_group)

# DELETE BED GROUP
@router.delete("/{group_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bed_group(group_id: int):
    """Delete a bed group"""
    try:
        bed_group = await sync_to_async(lambda: (ensure_db_connection(), BedGroup.objects.get(id=group_id))[1])()
        if bed_group.occupied > 0:
            raise HTTPException(status_code=400, detail="Cannot delete: group has occupied beds")
       
        # Store data for notification before deletion
        bed_group_data = {
            'id': bed_group.id,
            'bedGroup': bed_group.bedGroup,
            'capacity': bed_group.capacity
        }
       
        # Get beds data for notifications with prefetching
        beds_data = await sync_to_async(
            lambda: (ensure_db_connection(), [
                {
                    'id': bed.id,
                    'bed_number': bed.bed_number,
                    'bed_group': bed.bed_group.bedGroup
                }
                for bed in bed_group.beds.all().select_related('bed_group')
            ])[1]
        )()
       
        # Delete beds and group
        await sync_to_async(lambda: (ensure_db_connection(), bed_group.beds.all().delete())[1])()
        await sync_to_async(lambda: (ensure_db_connection(), bed_group.delete())[1])()
       
        # Send notifications
        await safe_send_bed_notification("bed_group_deleted", bed_group_data)
       
        for bed_data in beds_data:
            await safe_send_bed_notification("bed_deleted", bed_data)
           
    except BedGroup.DoesNotExist:
        raise HTTPException(status_code=404, detail="Bed group not found")
    return None

# GET NEXT AVAILABLE RANGE
@router.get("/next-available-range/{capacity}")
async def get_next_available_range(capacity: int):
    """Get the next available bed number range for given capacity"""
    if capacity < 1:
        raise HTTPException(status_code=400, detail="Capacity must be at least 1")
    
    alternative = await _find_next_available_range(capacity)
    
    return {
        "start": alternative['start'],
        "end": alternative['end'],
        "range": f"{alternative['start']}-{alternative['end']}",
        "adjusted": alternative['adjusted']
    }
    
# ADMIT PATIENT (UPDATED - Now accepts JSON instead of Form)
@router.post("/admit", response_model=Dict[str, Any])
async def admit_patient(admit_request: AdmitPatientRequest):
    """Admit a patient to a bed (now accepts JSON)"""
    # ---------------------------
    # Validate and parse date
    # ---------------------------
    try:
        admit_date = datetime.strptime(admit_request.admission_date, "%m/%d/%Y").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use MM/DD/YYYY")
    
    # ---------------------------
    # Fetch Patient
    # ---------------------------
    try:
        patient = await sync_to_async(lambda: (ensure_db_connection(), Patient.objects.get(patient_unique_id=admit_request.patient_unique_id))[1])()
        if patient.full_name != admit_request.full_name:
            raise HTTPException(
                status_code=400, 
                detail=f"Patient ID exists with different name: '{patient.full_name}'"
            )
    except Patient.DoesNotExist:
        raise HTTPException(status_code=404, detail="Patient not found. Register first.")
    
    # ---------------------------
    # Prevent Double Admission
    # ---------------------------
    patient_beds_exists = await sync_to_async(
        lambda: (ensure_db_connection(), patient.beds.filter(is_occupied=True).exists())[1]
    )()
    if patient_beds_exists:
        current_bed = await sync_to_async(
            lambda: (ensure_db_connection(), patient.beds.select_related('bed_group').filter(is_occupied=True).first())[1]
        )()
        raise HTTPException(
            status_code=400,
            detail=(
                f"Patient is already admitted in Bed {current_bed.bed_number} "
                f"({current_bed.bed_group.bedGroup}). Discharge first."
            ),
        )
    
    # ---------------------------
    # Fetch Bed Group & Bed
    # ---------------------------
    try:
        bed_group = await sync_to_async(lambda: (ensure_db_connection(), BedGroup.objects.get(bedGroup=admit_request.bed_group_name))[1])()
        bed = await sync_to_async(
            lambda: (ensure_db_connection(), Bed.objects.select_related('bed_group', 'patient').get(
                bed_group=bed_group, bed_number=admit_request.bed_number
            ))[1]
        )()
    except BedGroup.DoesNotExist:
        raise HTTPException(status_code=404, detail="Bed group not found")
    except Bed.DoesNotExist:
        raise HTTPException(status_code=404, detail="Bed not found")
    
    # ---------------------------
    # Check bed occupancy
    # ---------------------------
    if bed.is_occupied:
        raise HTTPException(status_code=400, detail="Bed is already occupied")
    
    old_occupied = bed_group.occupied  # for notification trigger
    
    # ---------------------------
    # Update Patient Admission Details
    # ---------------------------
    formatted_room = f"{bed_group.bedGroup} - {admit_request.bed_number}"
    patient.admission_date = admit_date
    patient.room_number = formatted_room
    
    # Save only these fields
    await sync_to_async(lambda: (ensure_db_connection(), patient.save(
        update_fields=["admission_date", "room_number"]
    ))[1])()
    
    # ---------------------------
    # Allocate Bed
    # ---------------------------
    bed.is_occupied = True
    bed.patient = patient
    await sync_to_async(lambda: (ensure_db_connection(), bed.save())[1])()
    
    # Refresh counts
    await sync_to_async(lambda: (ensure_db_connection(), bed_group.refresh_counts())[1])()
    
    # Reload bed with relations
    bed_with_relations = await sync_to_async(
        lambda: (ensure_db_connection(), Bed.objects.select_related('bed_group', 'patient').get(id=bed.id))[1]
    )()
    
    # ---------------------------
    # Send Notifications
    # ---------------------------
    await safe_send_bed_notification("bed_allocated", bed_with_relations, patient=patient)
    await safe_send_bed_notification("bed_updated", bed_with_relations)
    
    if old_occupied != bed_group.occupied:
        await safe_send_bed_notification(
            "room_occupancy_changed",
            bed_group,
            old_occupied,
            bed_group.occupied
        )
    
    # ---------------------------
    # Response
    # ---------------------------
    return {
        "success": True,
        "message": "Patient admitted and bed allocated",
        "patient": {
            "id": patient.patient_unique_id,
            "name": patient.full_name,
            "admission_date": admit_date.strftime("%m/%d/%Y"),
            "room_number": formatted_room,
        },
        "bed": {
            "number": bed.bed_number,
            "group": bed_group.bedGroup,
        },
    }
    
# VACATE BED (Discharge)
@router.post("/{group_id}/beds/{bed_number}/vacate", response_model=BedGroupResponse)
async def vacate_bed(group_id: int, bed_number: int):
    try:
        group = await sync_to_async(lambda: (ensure_db_connection(), BedGroup.objects.get(id=group_id))[1])()
        bed = await sync_to_async(
            lambda: (ensure_db_connection(), Bed.objects.select_related('bed_group', 'patient').get(
                bed_group=group, bed_number=bed_number
            ))[1]
        )()
    except (BedGroup.DoesNotExist, Bed.DoesNotExist):
        raise HTTPException(status_code=404, detail="Bed or Bed group not found")
    if not bed.is_occupied:
        raise HTTPException(status_code=400, detail="Bed is already vacant")
    # Store patient name for notification before clearing
    patient_name = bed.patient.full_name if bed.patient else "Unknown Patient"
    old_occupied = group.occupied
    # Update discharge date on patient
    if bed.patient:
        bed.patient.discharge_date = datetime.now().date()
        await sync_to_async(lambda: (ensure_db_connection(), bed.patient.save())[1])()
    bed.is_occupied = False
    bed.patient = None
    await sync_to_async(lambda: (ensure_db_connection(), bed.save())[1])()
    # Refresh group counts
    await sync_to_async(lambda: (ensure_db_connection(), group.refresh_counts())[1])()
    # Reload bed with relations for notification
    bed_with_relations = await sync_to_async(
        lambda: (ensure_db_connection(), Bed.objects.select_related('bed_group').get(id=bed.id))[1]
    )()
    # Send notifications
    await safe_send_bed_notification("bed_vacated", bed_with_relations, patient_name=patient_name)
    await safe_send_bed_notification("bed_updated", bed_with_relations)
   
    if old_occupied != group.occupied:
        await safe_send_bed_notification("room_occupancy_changed", group, old_occupied, group.occupied)
    return await BedGroupResponse.from_orm_with_beds(group)

# TRANSFER PATIENT BETWEEN BEDS (Optional - if you need this functionality)
@router.post("/transfer", response_model=Dict[str, Any])
async def transfer_patient(
    patient_unique_id: str = Form(...),
    from_bed_group: str = Form(...),
    from_bed_number: int = Form(...),
    to_bed_group: str = Form(...),
    to_bed_number: int = Form(...),
):
    try:
        # Find source bed with prefetching
        from_group = await sync_to_async(lambda: (ensure_db_connection(), BedGroup.objects.get(bedGroup=from_bed_group))[1])()
        from_bed = await sync_to_async(
            lambda: (ensure_db_connection(), Bed.objects.select_related('bed_group', 'patient').get(
                bed_group=from_group, bed_number=from_bed_number
            ))[1]
        )()
       
        # Find destination bed with prefetching
        to_group = await sync_to_async(lambda: (ensure_db_connection(), BedGroup.objects.get(bedGroup=to_bed_group))[1])()
        to_bed = await sync_to_async(
            lambda: (ensure_db_connection(), Bed.objects.select_related('bed_group', 'patient').get(
                bed_group=to_group, bed_number=to_bed_number
            ))[1]
        )()
       
        # Verify patient is in source bed
        if not from_bed.is_occupied or from_bed.patient.patient_unique_id != patient_unique_id:
            raise HTTPException(status_code=400, detail="Patient not found in source bed")
           
        if to_bed.is_occupied:
            raise HTTPException(status_code=400, detail="Destination bed is already occupied")
        patient = from_bed.patient
        old_from_occupied = from_group.occupied
        old_to_occupied = to_group.occupied
        # Transfer patient
        from_bed.is_occupied = False
        from_bed.patient = None
        await sync_to_async(lambda: (ensure_db_connection(), from_bed.save())[1])()
        to_bed.is_occupied = True
        to_bed.patient = patient
        await sync_to_async(lambda: (ensure_db_connection(), to_bed.save())[1])()
        # Update patient room number
        patient.room_number = str(to_bed_number)
        await sync_to_async(lambda: (ensure_db_connection(), patient.save())[1])()
        # Refresh group counts
        await sync_to_async(lambda: (ensure_db_connection(), from_group.refresh_counts())[1])()
        await sync_to_async(lambda: (ensure_db_connection(), to_group.refresh_counts())[1])()
        # Reload beds with relations for notifications
        from_bed_with_relations = await sync_to_async(
            lambda: (ensure_db_connection(), Bed.objects.select_related('bed_group').get(id=from_bed.id))[1]
        )()
        to_bed_with_relations = await sync_to_async(
            lambda: (ensure_db_connection(), Bed.objects.select_related('bed_group', 'patient').get(id=to_bed.id))[1]
        )()
        # Send notifications
        await safe_send_bed_notification("bed_vacated", from_bed_with_relations, patient_name=patient.full_name)
        await safe_send_bed_notification("bed_allocated", to_bed_with_relations, patient=patient)
        await safe_send_bed_notification("bed_updated", from_bed_with_relations)
        await safe_send_bed_notification("bed_updated", to_bed_with_relations)
       
        if old_from_occupied != from_group.occupied:
            await safe_send_bed_notification("room_occupancy_changed", from_group, old_from_occupied, from_group.occupied)
           
        if old_to_occupied != to_group.occupied:
            await safe_send_bed_notification("room_occupancy_changed", to_group, old_to_occupied, to_group.occupied)
        return {
            "success": True,
            "message": f"Patient transferred from Bed {from_bed_number} to Bed {to_bed_number}",
            "patient": {
                "id": patient.patient_unique_id,
                "name": patient.full_name,
            },
            "from_bed": {
                "number": from_bed_number,
                "group": from_bed_group,
            },
            "to_bed": {
                "number": to_bed_number,
                "group": to_bed_group,
            },
        }
    except (BedGroup.DoesNotExist, Bed.DoesNotExist):
        raise HTTPException(status_code=404, detail="Bed or bed group not found")