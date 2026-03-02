# fastapi_app/routers/department.py
from fastapi import APIRouter, HTTPException, status
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from django.db import transaction, IntegrityError
from HMS_backend.models import Department, Staff, Patient, Appointment, MedicineAllocation
from datetime import datetime
from asgiref.sync import sync_to_async
import logging
from Fastapi_app.routers.notifications import NotificationService   

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

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/departments", tags=["Departments"])

# ---------- Schemas ----------
class DepartmentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    status: str = "active"
    description: Optional[str] = None

class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    status: Optional[str] = None
    description: Optional[str] = None

class DepartmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    status: str
    description: Optional[str]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------- Async Database Helper Functions ----------
@sync_to_async
def get_department_by_id(department_id: int):
    """Get department by ID"""
    ensure_db_connection()
    try:
        return Department.objects.get(id=department_id)
    except Department.DoesNotExist:
        return None

@sync_to_async
def get_department_by_name(name: str):
    """Get department by name (case insensitive)"""
    ensure_db_connection()
    try:
        return Department.objects.filter(name__iexact=name).first()
    except Exception:
        return None

@sync_to_async
def create_department_instance(department_data: dict):
    """Create new department"""
    ensure_db_connection()
    try:
        return Department.objects.create(**department_data)
    except Exception as e:
        raise e

@sync_to_async
def save_department(department):
    """Save department instance"""
    ensure_db_connection()
    department.save()
    return department

@sync_to_async
def delete_department_instance(department):
    """Delete department instance"""
    ensure_db_connection()
    try:
        department.delete()
        return True
    except Exception as e:
        logger.error(f"Error deleting department instance: {str(e)}")
        return False

@sync_to_async
def get_all_departments():
    """Get all departments"""
    ensure_db_connection()
    return list(Department.objects.all().order_by("id"))

@sync_to_async
def check_department_name_exists(name: str, exclude_id: int = None):
    """Check if department name exists (excluding given ID)"""
    ensure_db_connection()
    queryset = Department.objects.filter(name__iexact=name)
    if exclude_id:
        queryset = queryset.exclude(id=exclude_id)
    return queryset.exists()

@sync_to_async
def check_department_references(department_id: int):
    """Check if department is referenced by other models"""
    ensure_db_connection()
    references = {}
    
    try:
        # Check Staff references
        staff_count = Staff.objects.filter(department_id=department_id).count()
        if staff_count > 0:
            references['staff_members'] = staff_count
    except Exception as e:
        logger.warning(f"Error checking staff references: {e}")
    
    try:
        # Check Patient references
        patient_count = Patient.objects.filter(department_id=department_id).count()
        if patient_count > 0:
            references['patients'] = patient_count
    except Exception as e:
        logger.warning(f"Error checking patient references: {e}")
    
    try:
        # Check Appointment references
        appointment_count = Appointment.objects.filter(department_id=department_id).count()
        if appointment_count > 0:
            references['appointments'] = appointment_count
    except Exception as e:
        logger.warning(f"Error checking appointment references: {e}")
    
    try:
        # Check MedicineAllocation references
        medicine_count = MedicineAllocation.objects.filter(department_id=department_id).count()
        if medicine_count > 0:
            references['medicine_allocations'] = medicine_count
    except Exception as e:
        logger.warning(f"Error checking medicine allocation references: {e}")
    
    return references


# ---------- Helper function to safely send notifications ----------
async def safe_send_department_notification(notification_type: str, department_data, old_status=None, new_status=None):
    """Safely send department notifications with error handling"""
    try:
        from ..routers.notifications import NotificationService
        
        if notification_type == "created":
            await NotificationService.send_department_created(department_data)
        elif notification_type == "updated":
            await NotificationService.send_department_updated(department_data)
        elif notification_type == "deleted":
            await NotificationService.send_department_deleted(department_data)
        elif notification_type == "status_changed" and old_status and new_status:
            await NotificationService.send_department_status_changed(department_data, old_status, new_status)
    except ImportError as e:
        logger.warning(f"NotificationService not available: {e}")
    except Exception as e:
        logger.warning(f"Failed to send {notification_type} notification: {e}")


# ---------- Routes with Notifications ----------

@router.post("/create", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
async def create_department(payload: DepartmentCreate):
    """
    Create a Department.
    """
    try:
        # Check if department already exists
        existing_department = await get_department_by_name(payload.name.strip())
        if existing_department:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Department with this name already exists.",
            )

        # Create department
        department_data = {
            "name": payload.name.strip(),
            "status": payload.status.lower() if payload.status else "active",
            "description": payload.description,
        }
        
        department = await create_department_instance(department_data)
        
        # Send notification
        await safe_send_department_notification("created", department)
        
        logger.info(f"✅ Department created: {department.name} (ID: {department.id})")
        
        return DepartmentOut.model_validate(department)
        
    except HTTPException:
        raise
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Department with this name already exists.",
        )
    except Exception as e:
        logger.error(f"Error creating department: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating department: {str(e)}"
        )


@router.get("/", response_model=List[DepartmentOut])
async def list_departments():
    """
    Fetch all departments.
    """
    try:
        departments = await get_all_departments()
        return [DepartmentOut.model_validate(dep) for dep in departments]
    except Exception as e:
        logger.error(f"Error listing departments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving departments: {str(e)}"
        )


@router.put("/{department_id}", response_model=DepartmentOut)
async def update_department(department_id: int, payload: DepartmentUpdate):
    """
    Update department by ID.
    """
    try:
        department = await get_department_by_id(department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found.",
            )

        # Store old values for notification
        old_status = department.status

        # Check name uniqueness if name is being updated
        if payload.name and payload.name.strip() != department.name:
            name_exists = await check_department_name_exists(payload.name.strip(), department_id)
            if name_exists:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Department with this name already exists.",
                )

        # Apply updates
        if payload.name is not None:
            department.name = payload.name.strip()
        if payload.status is not None:
            department.status = payload.status.lower()
        if payload.description is not None:
            department.description = payload.description

        # Save department
        await save_department(department)
        
        # Send notifications
        await safe_send_department_notification("updated", department)
        
        # Send status change notification if status changed
        if payload.status is not None and old_status != payload.status.lower():
            await safe_send_department_notification("status_changed", department, old_status, payload.status.lower())
        
        logger.info(f"✅ Department updated: {department.name} (ID: {department.id})")
        
        return DepartmentOut.model_validate(department)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating department: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating department: {str(e)}"
        )


# Update your delete_department function with detailed logging
@router.delete("/{department_id}", status_code=status.HTTP_200_OK)
async def delete_department(department_id: int):
    """
    Delete a department by ID.
    """
    try:
        department = await get_department_by_id(department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found.",
            )

        # Check if department is referenced by other models
        references = await check_department_references(department_id)
        if references:
            reference_details = ", ".join([f"{count} {model.replace('_', ' ')}" for model, count in references.items()])
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot delete department. It is referenced by: {reference_details}. "
                       f"Please reassign or delete these references first."
            )

        # Store department data for notification before deletion
        department_data = {
            'id': department.id,
            'name': department.name,
            'status': department.status,
            'description': department.description
        }
        
        print(f"🔍 [DEBUG] About to delete department: {department_data}")
        
        # Delete department
        deletion_success = await delete_department_instance(department)
        if not deletion_success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete department due to database constraints."
            )
        
        print(f"✅ [DEBUG] Department deleted from database: {department_data['name']}")
        
        # Send deletion notification
        print(f"🔔 [DEBUG] Attempting to send notification for deleted department: {department_data['name']}")
        await safe_send_department_notification("deleted", department_data)
        print(f"📤 [DEBUG] Notification sent for department: {department_data['name']}")
        
        logger.info(f"✅ Department deleted: {department_data['name']} (ID: {department_data['id']})")
        
        return {
            "message": f"Department '{department_data['name']}' deleted successfully",
            "deleted_id": department_id
        }
        
    except HTTPException:
        raise
    except IntegrityError as e:
        logger.error(f"IntegrityError deleting department {department_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete department because it is referenced by other records. "
                   "Please reassign those records to another department first."
        )
    except Exception as e:
        logger.error(f"Error deleting department: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting department: {str(e)}"
        )


@router.patch("/{department_id}/status", response_model=DepartmentOut)
async def update_department_status(department_id: int, status: str = "active"):
    """
    Update only the status of a department.
    """
    try:
        department = await get_department_by_id(department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found.",
            )

        # Validate status
        status = status.lower().strip()
        if status not in ["active", "inactive"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status must be 'active' or 'inactive'"
            )

        # Store old status for notification
        old_status = department.status

        # Update status
        department.status = status
        await save_department(department)
        
        # Send status change notification
        if old_status != status:
            await safe_send_department_notification("status_changed", department, old_status, status)
        
        logger.info(f"✅ Department status updated: {department.name} ({old_status} → {status})")
        
        return DepartmentOut.model_validate(department)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating department status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating department status: {str(e)}"
        )


@router.get("/{department_id}", response_model=DepartmentOut)
async def get_department(department_id: int):
    """
    Get a single department by ID.
    """
    try:
        department = await get_department_by_id(department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found.",
            )
        return DepartmentOut.model_validate(department)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving department: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving department: {str(e)}"
        )


@router.get("/search/{query}", response_model=List[DepartmentOut])
async def search_departments(query: str):
    """
    Search departments by name.
    """
    try:
        @sync_to_async
        def search_departments_by_query(search_query: str):
            ensure_db_connection()
            return list(Department.objects.filter(
                name__icontains=search_query
            ).order_by("name"))
        
        departments = await search_departments_by_query(query)
        
        if not departments:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No departments found matching the search criteria."
            )
            
        return [DepartmentOut.model_validate(dep) for dep in departments]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching departments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching departments: {str(e)}"
        )


@router.get("/{department_id}/references")
async def get_department_references(department_id: int):
    """
    Get all references to this department from other models.
    Useful for showing what needs to be updated before deletion.
    """
    try:
        department = await get_department_by_id(department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found.",
            )

        references = await check_department_references(department_id)
        
        return {
            "department_id": department_id,
            "department_name": department.name,
            "references": references,
            "can_delete": len(references) == 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting department references: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting department references: {str(e)}"
        )