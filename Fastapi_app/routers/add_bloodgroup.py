from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from asgiref.sync import sync_to_async
from django.db import transaction
from HMS_backend.models import BloodGroup
from starlette.concurrency import run_in_threadpool
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

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

# Create router WITHOUT prefix to manually define paths
router = APIRouter()

class BloodGroupCreate(BaseModel):
    blood_type: str
    available_units: int
    status: str = "Available"

class BloodGroupUpdate(BaseModel):
    blood_type: Optional[str] = None
    available_units: Optional[int] = None
    status: Optional[str] = None

# ---------- Helper function for blood notifications ----------
async def safe_send_blood_notification(notification_type: str, blood_data, old_units=None, new_units=None, patient_name=None, units_received=None, units_issued=None):
    """Safely send blood bank notifications with error handling"""
    try:
        print(f"🔔 [BLOOD] Starting {notification_type} notification for: {blood_data.get('blood_type', 'Unknown')}")
        
        from ..routers.notifications import NotificationService
        
        if notification_type == "created":
            await NotificationService.send_blood_group_created(blood_data)
        elif notification_type == "updated":
            await NotificationService.send_blood_group_updated(blood_data)
        elif notification_type == "deleted":
            await NotificationService.send_blood_group_deleted(blood_data)
        elif notification_type == "stock_updated" and old_units is not None and new_units is not None:
            await NotificationService.send_blood_stock_updated(blood_data, old_units, new_units)
        elif notification_type == "stock_low":
            await NotificationService.send_blood_stock_low(blood_data)
        elif notification_type == "stock_out":
            await NotificationService.send_blood_stock_out(blood_data)
        elif notification_type == "donation_received" and units_received is not None:
            await NotificationService.send_blood_donation_received(blood_data, units_received)
        elif notification_type == "issued" and patient_name and units_issued is not None:
            await NotificationService.send_blood_issued(blood_data, units_issued, patient_name)
            
        print(f"✅ [BLOOD] {notification_type} notification sent successfully")
            
    except ImportError as e:
        print(f"❌ [BLOOD] NotificationService not available: {e}")
    except Exception as e:
        print(f"❌ [BLOOD] Failed to send {notification_type} notification: {e}")

# ---------- Add Blood Group ----------
@router.post("/api/blood-groups/add")
async def add_blood_group(blood_data: BloodGroupCreate):
    try:
        print(f"🔵 Received blood group data: {blood_data.dict()}")
       
        # Check if blood group already exists
        exists = await run_in_threadpool(
            lambda: (ensure_db_connection(), BloodGroup.objects.filter(blood_type=blood_data.blood_type).exists())[1]
        )
       
        if exists:
            raise HTTPException(status_code=400, detail="Blood group already exists")
        
        # Create new blood group
        blood_group = BloodGroup(
            blood_type=blood_data.blood_type,
            available_units=blood_data.available_units,
            status=blood_data.status
        )
        await run_in_threadpool(lambda: (ensure_db_connection(), blood_group.save())[1])
       
        print(f"✅ Blood group created: {blood_group.id} - {blood_group.blood_type}")
        
        # Send notification
        blood_group_data = {
            'id': blood_group.id,
            'blood_type': blood_group.blood_type,
            'available_units': blood_group.available_units,
            'status': blood_group.status
        }
        await safe_send_blood_notification("created", blood_group_data)
        
        return JSONResponse(
            content={
                "success": True,
                "message": "Blood group added successfully",
                "id": blood_group.id,
                "blood_type": blood_group.blood_type,
                "available_units": blood_group.available_units,
                "status": blood_group.status,
            },
            status_code=201
        )
    except Exception as e:
        print(f"❌ Error adding blood group: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ---------- List Blood Groups ----------
@router.get("/api/blood-groups/")
async def list_blood_groups():
    try:
        blood_groups = await run_in_threadpool(
            lambda: (ensure_db_connection(), list(BloodGroup.objects.all().values(
                'id', 'blood_type', 'available_units', 'status', 'created_at', 'updated_at'
            )))[1]
        )
        print(f"✅ Fetched {len(blood_groups)} blood groups")
        return {"blood_groups": blood_groups}
    except Exception as e:
        print(f"❌ Error fetching blood groups: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
   
# === GET BLOOD TYPES (From Existing Blood Groups) ===
@router.get("/api/blood-types/")
async def get_blood_types():
    """
    Get blood types from existing blood groups in database
    """
    try:
        print("🟡 GET /api/blood-types/ endpoint called")
       
        # Get distinct blood types from existing blood groups
        blood_groups = await run_in_threadpool(
            lambda: (ensure_db_connection(), list(BloodGroup.objects.all().values_list('blood_type', flat=True).distinct()))[1]
        )
       
        print(f"🟡 Found blood types in DB: {blood_groups}")
       
        # If no blood groups exist, return default types
        if not blood_groups:
            blood_groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
            print("🟡 No blood groups in DB, using default types")
       
        response_data = {
            "success": True,
            "blood_types": blood_groups
        }
       
        print(f"✅ Returning blood types: {response_data}")
        return JSONResponse(content=response_data)
       
    except Exception as e:
        print(f"❌ Error fetching blood types: {str(e)}")
        # Return default types as fallback
        fallback_types = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
        return JSONResponse(
            content={
                "success": True,
                "blood_types": fallback_types
            }
        )

# ---------- Edit Blood Group ----------
@router.put("/api/blood-groups/{blood_id}/edit")
async def edit_blood_group(blood_id: int, blood_data: BloodGroupUpdate):
    try:
        print(f"🟡 Editing blood group {blood_id} with data: {blood_data.dict()}")
       
        # Get the blood group
        blood_group = await sync_to_async(lambda: (ensure_db_connection(), BloodGroup.objects.get(id=blood_id))[1])()
        print(f"🟡 Current blood group: {blood_group.blood_type} (ID: {blood_group.id})")
        
        # Store old values for notifications
        old_units = blood_group.available_units
        old_status = blood_group.status
        
        # Update blood type if provided
        if blood_data.blood_type:
            print(f"🟡 Requested blood type: {blood_data.blood_type}")
            print(f"🟡 Current blood type: {blood_group.blood_type}")
            print(f"🟡 Are they different? {blood_data.blood_type != blood_group.blood_type}")
           
            if blood_data.blood_type != blood_group.blood_type:
                # Check if any other blood group has this type
                print(f"🟡 Checking if blood type {blood_data.blood_type} exists (excluding ID {blood_id})")
               
                exists = await sync_to_async(
                    lambda: (ensure_db_connection(), BloodGroup.objects.filter(
                        blood_type=blood_data.blood_type
                    ).exclude(id=blood_id).exists())[1]
                )()
               
                print(f"🟡 Blood type exists check result: {exists}")
               
                if exists:
                    # Get the conflicting blood group for debugging
                    conflicting = await sync_to_async(
                        lambda: (ensure_db_connection(), list(BloodGroup.objects.filter(
                            blood_type=blood_data.blood_type
                        ).exclude(id=blood_id).values('id', 'blood_type')))[1]
                    )()
                    print(f"🟡 Conflicting blood groups: {conflicting}")
                    raise HTTPException(status_code=400, detail="Blood type already exists")
           
            blood_group.blood_type = blood_data.blood_type
       
        # Update available units if provided
        if blood_data.available_units is not None:
            blood_group.available_units = blood_data.available_units
            await sync_to_async(lambda: (ensure_db_connection(), blood_group.update_status())[1])()
       
        # Update status if provided
        if blood_data.status:
            blood_group.status = blood_data.status
            
        # Save the changes
        await sync_to_async(lambda: (ensure_db_connection(), blood_group.save())[1])()
        
        # Prepare data for notification
        blood_group_data = {
            'id': blood_group.id,
            'blood_type': blood_group.blood_type,
            'available_units': blood_group.available_units,
            'status': blood_group.status
        }
        
        # Send update notification
        await safe_send_blood_notification("updated", blood_group_data)
        
        # Send stock update notification if units changed
        if blood_data.available_units is not None and old_units != blood_data.available_units:
            await safe_send_blood_notification("stock_updated", blood_group_data, old_units, blood_data.available_units)
        
        # Send low stock alert if applicable
        if blood_group.available_units <= 50 and blood_group.available_units > 0:
            await safe_send_blood_notification("stock_low", blood_group_data)
        
        # Send out of stock alert if applicable
        if blood_group.available_units == 0:
            await safe_send_blood_notification("stock_out", blood_group_data)
       
        print(f"✅ Blood group {blood_id} updated successfully to {blood_group.blood_type}")
        return JSONResponse(
            content={
                "success": True,
                "message": "Blood group updated successfully",
                "id": blood_group.id,
                "blood_type": blood_group.blood_type,
                "available_units": blood_group.available_units,
                "status": blood_group.status,
            }
        )
    except BloodGroup.DoesNotExist:
        raise HTTPException(status_code=404, detail="Blood group not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating blood group {blood_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ---------- Delete Blood Group ----------
@router.delete("/api/blood-groups/{blood_id}/delete")
async def delete_blood_group(blood_id: int):
    try:
        blood_group = await run_in_threadpool(lambda: (ensure_db_connection(), BloodGroup.objects.get(id=blood_id))[1])
        
        # Store data for notification before deletion
        blood_group_data = {
            'id': blood_group.id,
            'blood_type': blood_group.blood_type,
            'available_units': blood_group.available_units,
            'status': blood_group.status
        }
        
        await run_in_threadpool(lambda: (ensure_db_connection(), blood_group.delete())[1])
        
        # Send deletion notification
        await safe_send_blood_notification("deleted", blood_group_data)
       
        return JSONResponse(
            content={
                "success": True,
                "message": "Blood group deleted successfully",
            }
        )
       
    except BloodGroup.DoesNotExist:
        raise HTTPException(status_code=404, detail="Blood group not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------- Add Blood Units ----------
@router.post("/api/blood-groups/{blood_id}/add-units")
async def add_blood_units(blood_id: int, units: int):
    """
    Add units to existing blood group (simulating donation)
    """
    try:
        blood_group = await sync_to_async(lambda: (ensure_db_connection(), BloodGroup.objects.get(id=blood_id))[1])()
        
        # Store old units for notification
        old_units = blood_group.available_units
        
        # Add units
        blood_group.available_units += units
        await sync_to_async(lambda: (ensure_db_connection(), blood_group.update_status())[1])()
        await sync_to_async(lambda: (ensure_db_connection(), blood_group.save())[1])()
        
        # Prepare data for notification
        blood_group_data = {
            'id': blood_group.id,
            'blood_type': blood_group.blood_type,
            'available_units': blood_group.available_units,
            'status': blood_group.status
        }
        
        # Send notifications
        await safe_send_blood_notification("stock_updated", blood_group_data, old_units, blood_group.available_units)
        await safe_send_blood_notification("donation_received", blood_group_data, units_received=units)
        
        return JSONResponse(
            content={
                "success": True,
                "message": f"Added {units} units to {blood_group.blood_type}",
                "new_total": blood_group.available_units
            }
        )
        
    except BloodGroup.DoesNotExist:
        raise HTTPException(status_code=404, detail="Blood group not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------- Issue Blood Units ----------
@router.post("/api/blood-groups/{blood_id}/issue")
async def issue_blood_units(blood_id: int, units: int, patient_name: str = "Unknown Patient"):
    """
    Issue blood units to a patient
    """
    try:
        blood_group = await sync_to_async(lambda: (ensure_db_connection(), BloodGroup.objects.get(id=blood_id))[1])()
        
        # Check if enough units available
        if blood_group.available_units < units:
            raise HTTPException(status_code=400, detail=f"Not enough units available. Only {blood_group.available_units} units left.")
        
        # Store old units for notification
        old_units = blood_group.available_units
        
        # Deduct units
        blood_group.available_units -= units
        await sync_to_async(lambda: (ensure_db_connection(), blood_group.update_status())[1])()
        await sync_to_async(lambda: (ensure_db_connection(), blood_group.save())[1])()
        
        # Prepare data for notification
        blood_group_data = {
            'id': blood_group.id,
            'blood_type': blood_group.blood_type,
            'available_units': blood_group.available_units,
            'status': blood_group.status
        }
        
        # Send notifications
        await safe_send_blood_notification("stock_updated", blood_group_data, old_units, blood_group.available_units)
        await safe_send_blood_notification("issued", blood_group_data, units_issued=units, patient_name=patient_name)
        
        # Send low stock alert if applicable
        if blood_group.available_units <= 50 and blood_group.available_units > 0:
            await safe_send_blood_notification("stock_low", blood_group_data)
        
        # Send out of stock alert if applicable
        if blood_group.available_units == 0:
            await safe_send_blood_notification("stock_out", blood_group_data)
        
        return JSONResponse(
            content={
                "success": True,
                "message": f"Issued {units} units of {blood_group.blood_type} to {patient_name}",
                "remaining_units": blood_group.available_units
            }
        )
        
    except BloodGroup.DoesNotExist:
        raise HTTPException(status_code=404, detail="Blood group not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------- Check Low Stock ----------
@router.get("/api/blood-groups/check-low-stock")
async def check_low_stock():
    """
    Check and send notifications for low stock blood groups
    """
    try:
        low_stock_groups = await sync_to_async(lambda: (ensure_db_connection(), list(
            BloodGroup.objects.filter(available_units__lte=50, available_units__gt=0)
        ))[1])()
        out_of_stock_groups = await sync_to_async(lambda: (ensure_db_connection(), list(
            BloodGroup.objects.filter(available_units=0)
        ))[1])()
        
        notification_count = 0
        
        for blood_group in low_stock_groups:
            blood_group_data = {
                'id': blood_group.id,
                'blood_type': blood_group.blood_type,
                'available_units': blood_group.available_units,
                'status': blood_group.status
            }
            await safe_send_blood_notification("stock_low", blood_group_data)
            notification_count += 1
        
        for blood_group in out_of_stock_groups:
            blood_group_data = {
                'id': blood_group.id,
                'blood_type': blood_group.blood_type,
                'available_units': blood_group.available_units,
                'status': blood_group.status
            }
            await safe_send_blood_notification("stock_out", blood_group_data)
            notification_count += 1
        
        return JSONResponse(
            content={
                "success": True,
                "message": f"Checked stock levels. Sent {notification_count} notifications.",
                "low_stock_count": len(low_stock_groups),
                "out_of_stock_count": len(out_of_stock_groups)
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))