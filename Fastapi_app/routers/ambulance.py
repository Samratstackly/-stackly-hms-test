

# # fastapi_app/routers/ambulance_router.py
# from fastapi import APIRouter, HTTPException, status
# from pydantic import BaseModel, Field, ConfigDict, validator
# from typing import Optional, List
# from datetime import datetime
# from asgiref.sync import sync_to_async
# import random
# import asyncio

# # Django Models
# from HMS_backend.models import AmbulanceUnit, Dispatch, Trip, Patient

# from django.db import close_old_connections, connection
# from django.db.models import Q
# from datetime import timedelta

# # ------------------- Database Health Check -------------------
# def check_db_connection():
#     """Ensure database connection is alive"""
#     try:
#         close_old_connections()
#         with connection.cursor() as cursor:
#             cursor.execute("SELECT 1")
#         return True
#     except Exception:
#         return False

# def ensure_db_connection():
#     """Reconnect if database connection is lost"""
#     if not check_db_connection():
#         try:
#             connection.close()
#             connection.connect()
#         except Exception:
#             pass

# router = APIRouter(prefix="/ambulance", tags=["Ambulance Management"])

# notify_clients = None

# def set_notify_clients(notify_func):
#     """Set the notify_clients function from main.py"""
#     global notify_clients
#     notify_clients = notify_func

# # ==============================================
# # Pydantic Schemas
# # ==============================================

# class AmbulanceUnitBase(BaseModel):
#     unit_number: str = Field(..., example="AMB-09")
#     vehicle_make: Optional[str] = None
#     vehicle_model: Optional[str] = None
#     phone: Optional[str] = Field(None, example="+91-9876543210")
#     contact_number: Optional[str] = Field(None, example="+91-9876543210")
#     in_service: Optional[bool] = True
#     notes: Optional[str] = None

# class AmbulanceUnitCreate(AmbulanceUnitBase):
#     @validator('phone', 'contact_number')
#     def validate_phone(cls, v):
#         if v:
#             # Remove all non-digit characters for validation
#             digits = ''.join(filter(str.isdigit, v))
#             if len(digits) < 10:
#                 raise ValueError('Phone number must have at least 10 digits')
#             if len(digits) > 15:
#                 raise ValueError('Phone number too long')
#         return v

# class AmbulanceUnitResponse(AmbulanceUnitBase):
#     id: int
#     created_at: datetime
#     model_config = ConfigDict(from_attributes=True)


# class PatientRef(BaseModel):
#     id: int
#     patient_unique_id: str
#     full_name: str
#     phone: Optional[str] = None  # Frontend expects 'phone'
#     model_config = ConfigDict(from_attributes=True)
    
#     @classmethod
#     def from_orm(cls, obj):
#         # Map phone_number from DB to phone for frontend
#         phone_value = None
#         if hasattr(obj, 'phone_number'):
#             phone_value = obj.phone_number
#         elif hasattr(obj, 'phone'):
#             phone_value = obj.phone
        
#         data = {
#             "id": obj.id,
#             "patient_unique_id": obj.patient_unique_id,
#             "full_name": obj.full_name,
#             "phone": phone_value
#         }
#         return cls(**data)



# class DispatchBase(BaseModel):
#     timestamp: datetime
#     unit_id: Optional[int] = None
#     dispatcher: str = Field(..., example="R. Lewis")
#     call_type: Optional[str] = "Emergency"
#     location: str = Field(..., example="45 Elm St, Chennai")
#     phone_number: Optional[str] = Field(None, example="+91-9876543210")  # ADDED
#     contact_number: Optional[str] = Field(None, example="+91-9876543210")  # ADDED
#     status: Optional[str] = "Standby"

# class DispatchCreate(DispatchBase):
#     @validator('phone_number', 'contact_number')
#     def validate_phone(cls, v):
#         if v:
#             digits = ''.join(filter(str.isdigit, v))
#             if len(digits) < 10:
#                 raise ValueError('Phone number must have at least 10 digits')
#             if len(digits) > 15:
#                 raise ValueError('Phone number too long')
#         return v

# class DispatchUpdate(DispatchBase):
#     timestamp: Optional[datetime] = None
#     unit_id: Optional[int] = None
#     dispatcher: Optional[str] = None
#     call_type: Optional[str] = None
#     location: Optional[str] = None
#     phone_number: Optional[str] = None
#     contact_number: Optional[str] = None
#     status: Optional[str] = None

# class DispatchResponse(DispatchBase):
#     id: int
#     dispatch_id: str
#     unit: Optional[AmbulanceUnitResponse] = None
#     model_config = ConfigDict(from_attributes=True)


# class TripBase(BaseModel):
#     dispatch_id: Optional[int] = None
#     unit_id: Optional[int] = None
#     crew: Optional[str] = None
#     patient_id: Optional[int] = None
#     pickup_location: Optional[str] = None
#     destination: Optional[str] = None
#     phone_number: Optional[str] = Field(None, example="+91-9876543210")  # ADDED
#     start_time: Optional[datetime] = None
#     end_time: Optional[datetime] = None
#     mileage: Optional[str] = None
#     status: Optional[str] = "Standby"
#     notes: Optional[str] = None

# class TripCreate(TripBase):
#     @validator('phone_number')
#     def validate_phone(cls, v):
#         if v:
#             digits = ''.join(filter(str.isdigit, v))
#             if len(digits) < 10:
#                 raise ValueError('Phone number must have at least 10 digits')
#             if len(digits) > 15:
#                 raise ValueError('Phone number too long')
#         return v

# class TripUpdate(TripBase):
#     pass

# class TripResponse(TripBase):
#     id: int
#     trip_id: str
#     created_at: datetime
#     dispatch: Optional[DispatchResponse] = None
#     unit: Optional[AmbulanceUnitResponse] = None
#     patient: Optional[PatientRef] = None
#     model_config = ConfigDict(from_attributes=True)

# async def simulate_live_gps(trip_id: int, unit_number: str):
#     """Simulate live GPS tracking for a trip"""
#     if notify_clients is None:
#         print("⚠️ notify_clients not available for GPS simulation")
#         return
        
#     # Start with coordinates near Delhi
#     lat = 28.6139 + (random.random() - 0.5) * 0.1
#     lng = 77.2090 + (random.random() - 0.5) * 0.1

#     # Simulate movement for ~4 minutes
#     for i in range(50):
#         # Small random movement
#         lat += (random.random() - 0.5) * 0.002
#         lng += (random.random() - 0.5) * 0.002

#         # Send location update
#         await notify_clients(
#             "location_update",
#             trip_id=trip_id,
#             unit_number=unit_number,
#             lat=round(lat, 6),
#             lng=round(lng, 6),
#             status="En Route"
#         )
#         await asyncio.sleep(5)  # Update every 5 seconds

#     # Trip completed
#     await notify_clients(
#         "status_update",
#         title="Trip Completed",
#         message=f"Ambulance {unit_number} has arrived at destination",
#         trip_id=trip_id,
#         unit_number=unit_number
#     )

# # ==============================================
# # Safe Async Delete Helper
# # ==============================================
# async def safe_delete(model, obj_id: int, name: str):
#     deleted = await sync_to_async(lambda: (ensure_db_connection(), model.objects.filter(id=obj_id).delete())[1])()
#     if deleted[0] == 0:
#         raise HTTPException(status_code=404, detail=f"{name} not found")
#     return deleted

# # ==============================================
# # Helper function to check for duplicate trips
# # ==============================================
# async def check_duplicate_trip(dispatch_id: Optional[int], unit_id: Optional[int], 
#                                start_time: Optional[datetime], end_time: Optional[datetime],
#                                exclude_trip_id: Optional[int] = None):
#     """
#     Check if there's already a trip with the same dispatch and unit during overlapping time period
#     """
#     if not dispatch_id or not unit_id or not start_time:
#         return False
    
#     # If no end time provided, assume a default duration of 2 hours for overlap checking
#     effective_end = end_time
#     if not effective_end:
#         effective_end = start_time + timedelta(hours=2)
    
#     # Build query for overlapping trips
#     query = Q(dispatch_id=dispatch_id, unit_id=unit_id)
    
#     # Exclude the current trip if updating
#     if exclude_trip_id:
#         query &= ~Q(id=exclude_trip_id)
    
#     # Check for overlapping time periods
#     # Condition: New trip overlaps with existing trip if:
#     # new_start < existing_end AND new_end > existing_start
#     overlapping_trips = await sync_to_async(lambda: list(
#         Trip.objects.filter(query).filter(
#             Q(start_time__lt=effective_end) & 
#             (Q(end_time__isnull=True) | Q(end_time__gt=start_time))
#         )
#     ))()
    
#     return len(overlapping_trips) > 0

# # ==============================================
# # Notification Helper Functions
# # ==============================================
# async def notify_unit_created(unit_data: AmbulanceUnitResponse):
#     """Notify when a new ambulance unit is created"""
#     if notify_clients:
#         await notify_clients(
#             "unit_created",
#             title="New Ambulance Unit Added",
#             message=f"Ambulance {unit_data.unit_number} has been added to the fleet",
#             unit_id=unit_data.id,
#             unit_number=unit_data.unit_number,
#             vehicle_make=unit_data.vehicle_make,
#             vehicle_model=unit_data.vehicle_model,
#             phone=unit_data.phone,
#             in_service=unit_data.in_service
#         )

# async def notify_unit_updated(unit_data: AmbulanceUnitResponse):
#     """Notify when an ambulance unit is updated"""
#     if notify_clients:
#         await notify_clients(
#             "unit_updated",
#             title="Ambulance Unit Updated",
#             message=f"Ambulance {unit_data.unit_number} details have been updated",
#             unit_id=unit_data.id,
#             unit_number=unit_data.unit_number,
#             in_service=unit_data.in_service,
#             phone=unit_data.phone
#         )

# async def notify_unit_deleted(unit_id: int, unit_number: str):
#     """Notify when an ambulance unit is deleted"""
#     if notify_clients:
#         await notify_clients(
#             "unit_deleted",
#             title="Ambulance Unit Removed",
#             message=f"Ambulance {unit_number} has been removed from the fleet",
#             unit_id=unit_id,
#             unit_number=unit_number
#         )

# async def notify_dispatch_created(dispatch_data: DispatchResponse):
#     """Notify when a new dispatch is created"""
#     if notify_clients:
#         unit_info = f" - Unit {dispatch_data.unit.unit_number}" if dispatch_data.unit else ""
#         await notify_clients(
#             "new_dispatch",  # Changed to match frontend expectation
#             title="New Dispatch Created",
#             message=f"Dispatch {dispatch_data.dispatch_id} created for {dispatch_data.location}{unit_info}",
#             dispatch_id=dispatch_data.dispatch_id,
#             location=dispatch_data.location,
#             unit_number=dispatch_data.unit.unit_number if dispatch_data.unit else None,
#             status=dispatch_data.status,
#             phone_number=dispatch_data.phone_number
#         )

# async def notify_dispatch_updated(dispatch_data: DispatchResponse):
#     """Notify when a dispatch is updated"""
#     if notify_clients:
#         await notify_clients(
#             "dispatch_status_updated",  # Changed to match frontend expectation
#             title="Dispatch Updated",
#             message=f"Dispatch {dispatch_data.dispatch_id} has been updated",
#             dispatch_id=dispatch_data.dispatch_id,
#             status=dispatch_data.status,
#             location=dispatch_data.location,
#             phone_number=dispatch_data.phone_number
#         )

# async def notify_dispatch_deleted(dispatch_id: int, dispatch_id_str: str):
#     """Notify when a dispatch is deleted"""
#     if notify_clients:
#         await notify_clients(
#             "dispatch_deleted",
#             title="Dispatch Cancelled",
#             message=f"Dispatch {dispatch_id_str} has been cancelled",
#             dispatch_id=dispatch_id_str
#         )

# async def notify_trip_created(trip_data: TripResponse):
#     """Notify when a new trip is created"""
#     if notify_clients:
#         unit_number = trip_data.unit.unit_number if trip_data.unit else "Unknown Unit"
#         await notify_clients(
#             "new_trip",  # Changed to match frontend expectation
#             title="New Trip Started",
#             message=f"Trip {trip_data.trip_id} started for {unit_number}",
#             trip_id=trip_data.trip_id,
#             unit_number=unit_number,
#             status=trip_data.status,
#             destination=trip_data.destination,
#             phone_number=trip_data.phone_number
#         )
        
#         # Start GPS simulation for new trips
#         if trip_data.status == "En Route" and trip_data.unit:
#             asyncio.create_task(simulate_live_gps(trip_data.id, unit_number))

# async def notify_trip_updated(trip_data: TripResponse):
#     """Notify when a trip is updated"""
#     if notify_clients:
#         unit_number = trip_data.unit.unit_number if trip_data.unit else "Unknown Unit"
#         await notify_clients(
#             "trip_status_changed",
#             title="Trip Status Updated",
#             message=f"Trip {trip_data.trip_id} status changed to {trip_data.status}",
#             trip_id=trip_data.trip_id,
#             unit_number=unit_number,
#             status=trip_data.status,
#             phone_number=trip_data.phone_number
#         )
        
#         # Start GPS simulation if trip status changed to "En Route"
#         if trip_data.status == "En Route" and trip_data.unit:
#             asyncio.create_task(simulate_live_gps(trip_data.id, unit_number))

# async def notify_trip_deleted(trip_id: int, trip_id_str: str, unit_number: str = None):
#     """Notify when a trip is deleted"""
#     if notify_clients:
#         await notify_clients(
#             "trip_deleted",
#             title="Trip Cancelled",
#             message=f"Trip {trip_id_str} has been cancelled{' by ' + unit_number if unit_number else ''}",
#             trip_id=trip_id_str,
#             unit_number=unit_number
#         )

# # ==============================================
# # Ambulance Units
# # ==============================================
# @router.get("/units", response_model=List[AmbulanceUnitResponse])
# async def list_units(in_service: Optional[bool] = None):
#     qs = AmbulanceUnit.objects.all()
#     if in_service is not None:
#         qs = qs.filter(in_service=in_service)
#     return await sync_to_async(lambda: (ensure_db_connection(), list(qs.order_by("-id")))[1])()

# @router.post("/units", response_model=AmbulanceUnitResponse, status_code=201)
# async def create_unit(payload: AmbulanceUnitCreate):
#     unit = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.create(**payload.dict()))[1])()
#     unit_response = AmbulanceUnitResponse.from_orm(unit)
    
#     # Notify about unit creation
#     await notify_unit_created(unit_response)
    
#     return unit_response

# @router.put("/units/{unit_id}", response_model=AmbulanceUnitResponse)
# async def update_unit(unit_id: int, payload: AmbulanceUnitCreate):
#     try:
#         unit = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.get(id=unit_id))[1])()
#         for k, v in payload.dict().items():
#             setattr(unit, k, v)
#         await sync_to_async(lambda: (ensure_db_connection(), unit.save())[1])()
        
#         unit_response = AmbulanceUnitResponse.from_orm(unit)
        
#         # Notify about unit update
#         await notify_unit_updated(unit_response)
        
#         return unit_response
#     except AmbulanceUnit.DoesNotExist:
#         raise HTTPException(404, "Unit not found")

# @router.delete("/units/{unit_id}", status_code=204)
# async def delete_unit(unit_id: int):
#     # Get unit info before deletion for notification
#     try:
#         unit = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.get(id=unit_id))[1])()
#         unit_number = unit.unit_number
#         phone = unit.phone or unit.contact_number
#     except AmbulanceUnit.DoesNotExist:
#         raise HTTPException(404, "Unit not found")
    
#     await safe_delete(AmbulanceUnit, unit_id, "Unit")
    
#     # Notify about unit deletion
#     await notify_unit_deleted(unit_id, unit_number)

# # ==============================================
# # Dispatch Endpoints
# # ==============================================
# @router.get("/dispatch", response_model=List[DispatchResponse])
# async def list_dispatches():
#     dispatches = await sync_to_async(lambda: (ensure_db_connection(), list(
#         Dispatch.objects.select_related("unit").all().order_by("-timestamp")
#     ))[1])()
#     result = []
#     for d in dispatches:
#         unit_resp = AmbulanceUnitResponse.from_orm(d.unit) if d.unit else None
#         result.append(DispatchResponse(
#             id=d.id, dispatch_id=d.dispatch_id, timestamp=d.timestamp,
#             unit_id=d.unit.id if d.unit else None, unit=unit_resp,
#             dispatcher=d.dispatcher, call_type=d.call_type,
#             location=d.location, phone_number=d.phone_number,
#             contact_number=d.contact_number, status=d.status
#         ))
#     return result


# # ==============================================
# # Dispatch Endpoints - UPDATE create_dispatch function
# # ==============================================
# @router.post("/dispatch", response_model=DispatchResponse, status_code=201)
# async def create_dispatch(payload: DispatchCreate):
#     unit = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.get(id=payload.unit_id))[1])() if payload.unit_id else None
#     dispatch = await sync_to_async(lambda: (ensure_db_connection(), Dispatch.objects.create(
#         timestamp=payload.timestamp, unit=unit, dispatcher=payload.dispatcher,
#         call_type=payload.call_type or "Emergency", location=payload.location,
#         phone_number=payload.phone_number, contact_number=payload.contact_number,
#         status=payload.status or "Standby"
#     ))[1])()
#     unit_resp = AmbulanceUnitResponse.from_orm(unit) if unit else None
#     dispatch_response = DispatchResponse(
#         id=dispatch.id, dispatch_id=dispatch.dispatch_id, timestamp=dispatch.timestamp,
#         unit_id=unit.id if unit else None, unit=unit_resp,
#         dispatcher=dispatch.dispatcher, call_type=dispatch.call_type,
#         location=dispatch.location, phone_number=dispatch.phone_number,
#         contact_number=dispatch.contact_number, status=dispatch.status
#     )
    
#     # Notify about dispatch creation
#     await notify_dispatch_created(dispatch_response)
    
#     return dispatch_response

# @router.put("/dispatch/{dispatch_id}", response_model=DispatchResponse)
# async def update_dispatch(dispatch_id: int, payload: DispatchUpdate):
#     try:
#         d = await sync_to_async(lambda: (ensure_db_connection(), Dispatch.objects.get(id=dispatch_id))[1])()
#         if payload.timestamp is not None: d.timestamp = payload.timestamp
#         if payload.dispatcher is not None: d.dispatcher = payload.dispatcher
#         if payload.call_type is not None: d.call_type = payload.call_type
#         if payload.location is not None: d.location = payload.location
#         if payload.phone_number is not None: d.phone_number = payload.phone_number
#         if payload.contact_number is not None: d.contact_number = payload.contact_number
#         if payload.status is not None: d.status = payload.status
#         if payload.unit_id is not None:
#             d.unit = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.get(id=payload.unit_id))[1])() if payload.unit_id else None
#         await sync_to_async(lambda: (ensure_db_connection(), d.save())[1])()
#         unit_resp = AmbulanceUnitResponse.from_orm(d.unit) if d.unit else None
#         dispatch_response = DispatchResponse(
#             id=d.id, dispatch_id=d.dispatch_id, timestamp=d.timestamp,
#             unit_id=d.unit.id if d.unit else None, unit=unit_resp,
#             dispatcher=d.dispatcher, call_type=d.call_type,
#             location=d.location, phone_number=d.phone_number,
#             contact_number=d.contact_number, status=d.status
#         )
        
#         # Notify about dispatch update
#         await notify_dispatch_updated(dispatch_response)
        
#         return dispatch_response
#     except Dispatch.DoesNotExist:
#         raise HTTPException(404, "Dispatch not found")
#     except AmbulanceUnit.DoesNotExist:
#         raise HTTPException(404, "Unit not found")

# @router.delete("/dispatch/{dispatch_id}", status_code=204)
# async def delete_dispatch(dispatch_id: int):
#     # Get dispatch info before deletion for notification
#     try:
#         dispatch = await sync_to_async(lambda: (ensure_db_connection(), Dispatch.objects.get(id=dispatch_id))[1])()
#         dispatch_id_str = dispatch.dispatch_id
#         phone_number = dispatch.phone_number or dispatch.contact_number
#     except Dispatch.DoesNotExist:
#         raise HTTPException(404, "Dispatch not found")
    
#     # CASCADE delete → all related Trips will be automatically deleted
#     await safe_delete(Dispatch, dispatch_id, "Dispatch")
    
#     # Notify about dispatch deletion
#     await notify_dispatch_deleted(dispatch_id, dispatch_id_str)

# # ==============================================
# # Trip Endpoints – FIXED with duplicate validation
# # ==============================================
# @router.get("/trips", response_model=List[TripResponse])
# async def list_trips():
#     trips = await sync_to_async(lambda: (ensure_db_connection(), list(
#         Trip.objects.select_related("dispatch__unit", "unit", "patient").all().order_by("-created_at")
#     ))[1])()
#     result = []
#     for t in trips:
#         dispatch_resp = None
#         if t.dispatch:
#             unit_d = await sync_to_async(lambda: (ensure_db_connection(), t.dispatch.unit)[1])()
#             unit_d_resp = AmbulanceUnitResponse.from_orm(unit_d) if unit_d else None
#             dispatch_resp = DispatchResponse(
#                 id=t.dispatch.id, dispatch_id=t.dispatch.dispatch_id,
#                 timestamp=t.dispatch.timestamp, unit_id=unit_d.id if unit_d else None,
#                 unit=unit_d_resp, dispatcher=t.dispatch.dispatcher,
#                 call_type=t.dispatch.call_type, location=t.dispatch.location,
#                 phone_number=t.dispatch.phone_number,
#                 contact_number=t.dispatch.contact_number,
#                 status=t.dispatch.status
#             )
        
#         # Get patient phone from phone_number field
#         patient_phone = None
#         if t.patient:
#             patient_phone = t.patient.phone_number
        
#         result.append(TripResponse(
#             id=t.id, trip_id=t.trip_id, created_at=t.created_at,
#             dispatch=dispatch_resp, dispatch_id=t.dispatch.id if t.dispatch else None,
#             unit=AmbulanceUnitResponse.from_orm(t.unit) if t.unit else None,
#             unit_id=t.unit.id if t.unit else None,
#             patient=PatientRef.from_orm(t.patient) if t.patient else None,
#             patient_id=t.patient.id if t.patient else None,
#             crew=t.crew, pickup_location=t.pickup_location,
#             destination=t.destination, phone_number=t.phone_number,
#             start_time=t.start_time, end_time=t.end_time,
#             mileage=t.mileage, status=t.status, notes=t.notes
#         ))
#     return result


# @router.post("/trips", response_model=TripResponse, status_code=201)
# async def create_trip(payload: TripCreate):
#     try:
#         # Check for duplicate trip first
#         is_duplicate = await check_duplicate_trip(
#             dispatch_id=payload.dispatch_id,
#             unit_id=payload.unit_id,
#             start_time=payload.start_time,
#             end_time=payload.end_time
#         )
        
#         if is_duplicate:
#             raise HTTPException(
#                 status_code=status.HTTP_409_CONFLICT,
#                 detail="A trip with this dispatcher and unit already exists during this time period. Please choose a different time, dispatcher, or unit."
#             )
        
#         # Fetch related objects
#         dispatch = None
#         if payload.dispatch_id:
#             dispatch = await sync_to_async(lambda: (ensure_db_connection(), Dispatch.objects.select_related("unit").get(id=payload.dispatch_id))[1])()

#         unit = None
#         if payload.unit_id:
#             unit = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.get(id=payload.unit_id))[1])()

#         patient = None
#         if payload.patient_id:
#             patient = await sync_to_async(lambda: (ensure_db_connection(), Patient.objects.get(id=payload.patient_id))[1])()

#         # Create trip
#         trip = await sync_to_async(lambda: (ensure_db_connection(), Trip.objects.create(
#             dispatch=dispatch, unit=unit, patient=patient,
#             crew=payload.crew, pickup_location=payload.pickup_location,
#             destination=payload.destination, phone_number=payload.phone_number,
#             start_time=payload.start_time, end_time=payload.end_time,
#             mileage=payload.mileage, status=payload.status or "Standby", 
#             notes=payload.notes
#         ))[1])()

#         # Build nested dispatch response safely
#         dispatch_resp = None
#         if dispatch:
#             unit_d = await sync_to_async(lambda: (ensure_db_connection(), dispatch.unit)[1])()
#             unit_d_resp = AmbulanceUnitResponse.from_orm(unit_d) if unit_d else None
#             dispatch_resp = DispatchResponse(
#                 id=dispatch.id, dispatch_id=dispatch.dispatch_id,
#                 timestamp=dispatch.timestamp, unit_id=unit_d.id if unit_d else None,
#                 unit=unit_d_resp, dispatcher=dispatch.dispatcher,
#                 call_type=dispatch.call_type, location=dispatch.location,
#                 phone_number=dispatch.phone_number,
#                 contact_number=dispatch.contact_number,
#                 status=dispatch.status
#             )

#         trip_response = TripResponse(
#             id=trip.id, trip_id=trip.trip_id, created_at=trip.created_at,
#             dispatch=dispatch_resp, dispatch_id=dispatch.id if dispatch else None,
#             unit=AmbulanceUnitResponse.from_orm(unit) if unit else None,
#             unit_id=unit.id if unit else None,
#             patient=PatientRef.from_orm(patient) if patient else None,
#             patient_id=patient.id if patient else None,
#             crew=trip.crew, pickup_location=trip.pickup_location,
#             destination=trip.destination, phone_number=trip.phone_number,
#             start_time=trip.start_time, end_time=trip.end_time,
#             mileage=trip.mileage, status=trip.status, notes=trip.notes
#         )

#         # Notify about trip creation
#         await notify_trip_created(trip_response)

#         return trip_response

#     except (Dispatch.DoesNotExist, AmbulanceUnit.DoesNotExist, Patient.DoesNotExist):
#         raise HTTPException(404, "Related record not found")

# @router.put("/trips/{trip_id}", response_model=TripResponse)
# async def update_trip(trip_id: int, payload: TripUpdate):
#     try:
#         # Check for duplicate trip (excluding current trip)
#         is_duplicate = await check_duplicate_trip(
#             dispatch_id=payload.dispatch_id,
#             unit_id=payload.unit_id,
#             start_time=payload.start_time,
#             end_time=payload.end_time,
#             exclude_trip_id=trip_id
#         )
        
#         if is_duplicate:
#             raise HTTPException(
#                 status_code=status.HTTP_409_CONFLICT,
#                 detail="A trip with this dispatcher and unit already exists during this time period. Please choose a different time, dispatcher, or unit."
#             )
        
#         t = await sync_to_async(lambda: (ensure_db_connection(), Trip.objects.get(id=trip_id))[1])()
#         if payload.dispatch_id is not None:
#             t.dispatch = await sync_to_async(lambda: (ensure_db_connection(), Dispatch.objects.get(id=payload.dispatch_id))[1])() if payload.dispatch_id else None
#         if payload.unit_id is not None:
#             t.unit = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.get(id=payload.unit_id))[1])() if payload.unit_id else None
#         if payload.patient_id is not None:
#             t.patient = await sync_to_async(lambda: (ensure_db_connection(), Patient.objects.get(id=payload.patient_id))[1])() if payload.patient_id else None
#         if payload.crew is not None: t.crew = payload.crew
#         if payload.pickup_location is not None: t.pickup_location = payload.pickup_location
#         if payload.destination is not None: t.destination = payload.destination
#         if payload.phone_number is not None: t.phone_number = payload.phone_number
#         if payload.start_time is not None: t.start_time = payload.start_time
#         if payload.end_time is not None: t.end_time = payload.end_time
#         if payload.mileage is not None: t.mileage = payload.mileage
#         if payload.status is not None: t.status = payload.status
#         if payload.notes is not None: t.notes = payload.notes
#         await sync_to_async(lambda: (ensure_db_connection(), t.save())[1])()

#         # Build response
#         dispatch_resp = None
#         if t.dispatch:
#             unit_d = await sync_to_async(lambda: (ensure_db_connection(), t.dispatch.unit)[1])()
#             unit_d_resp = AmbulanceUnitResponse.from_orm(unit_d) if unit_d else None
#             dispatch_resp = DispatchResponse(
#                 id=t.dispatch.id, dispatch_id=t.dispatch.dispatch_id,
#                 timestamp=t.dispatch.timestamp, unit_id=unit_d.id if unit_d else None,
#                 unit=unit_d_resp, dispatcher=t.dispatch.dispatcher,
#                 call_type=t.dispatch.call_type, location=t.dispatch.location,
#                 phone_number=t.dispatch.phone_number,
#                 contact_number=t.dispatch.contact_number,
#                 status=t.dispatch.status
#             )

#         trip_response = TripResponse(
#             id=t.id, trip_id=t.trip_id, created_at=t.created_at,
#             dispatch=dispatch_resp, dispatch_id=t.dispatch.id if t.dispatch else None,
#             unit=AmbulanceUnitResponse.from_orm(t.unit) if t.unit else None,
#             unit_id=t.unit.id if t.unit else None,
#             patient=PatientRef.from_orm(t.patient) if t.patient else None,
#             patient_id=t.patient.id if t.patient else None,
#             crew=t.crew, pickup_location=t.pickup_location,
#             destination=t.destination, phone_number=t.phone_number,
#             start_time=t.start_time, end_time=t.end_time,
#             mileage=t.mileage, status=t.status, notes=t.notes
#         )

#         # Notify about trip update
#         await notify_trip_updated(trip_response)

#         return trip_response
#     except Trip.DoesNotExist:
#         raise HTTPException(404, "Trip not found")
#     except (Dispatch.DoesNotExist, AmbulanceUnit.DoesNotExist, Patient.DoesNotExist):
#         raise HTTPException(404, "Related record not found")


# @router.delete("/trips/{trip_id}", status_code=204)
# async def delete_trip(trip_id: int):
#     # Get trip info before deletion for notification
#     try:
#         trip = await sync_to_async(lambda: (ensure_db_connection(), Trip.objects.select_related("unit").get(id=trip_id))[1])()
#         trip_id_str = trip.trip_id
#         unit_number = trip.unit.unit_number if trip.unit else None
#         phone_number = trip.phone_number
#     except Trip.DoesNotExist:
#         raise HTTPException(404, "Trip not found")
    
#     await safe_delete(Trip, trip_id, "Trip")
    
#     # Notify about trip deletion
#     await notify_trip_deleted(trip_id, trip_id_str, unit_number)

# # ==============================================
# # Patients Dropdown (Include phone numbers)
# # ==============================================
# @router.get("/patients", response_model=List[dict])
# async def get_patients_for_dropdown():
#     patients = await sync_to_async(lambda: (ensure_db_connection(), list(
#         Patient.objects.values("id", "patient_unique_id", "full_name", "phone_number")
#         .order_by("patient_unique_id")[:500]
#     ))[1])()
#     return [
#         {
#             "id": p["id"], 
#             "patient_unique_id": p["patient_unique_id"], 
#             "full_name": p["full_name"],
#             "phone": p["phone_number"] or None  # Map phone_number to phone for frontend
#         }
#         for p in patients
#     ]


# # ==============================================
# # Trip Status Update Endpoint
# # ==============================================
# @router.patch("/trips/{trip_id}/status", response_model=TripResponse)
# async def update_trip_status(trip_id: int, status: str):
#     """Update trip status and notify clients"""
#     try:
#         trip = await sync_to_async(lambda: (ensure_db_connection(), Trip.objects.select_related("unit").get(id=trip_id))[1])()
#         old_status = trip.status
#         trip.status = status
#         await sync_to_async(lambda: (ensure_db_connection(), trip.save())[1])()

#         # Build response
#         dispatch_resp = None
#         if trip.dispatch:
#             unit_d = await sync_to_async(lambda: (ensure_db_connection(), trip.dispatch.unit)[1])()
#             unit_d_resp = AmbulanceUnitResponse.from_orm(unit_d) if unit_d else None
#             dispatch_resp = DispatchResponse(
#                 id=trip.dispatch.id, dispatch_id=trip.dispatch.dispatch_id,
#                 timestamp=trip.dispatch.timestamp, unit_id=unit_d.id if unit_d else None,
#                 unit=unit_d_resp, dispatcher=trip.dispatch.dispatcher,
#                 call_type=trip.dispatch.call_type, location=trip.dispatch.location,
#                 phone_number=trip.dispatch.phone_number,
#                 contact_number=trip.dispatch.contact_number,
#                 status=trip.dispatch.status
#             )

#         trip_response = TripResponse(
#             id=trip.id, trip_id=trip.trip_id, created_at=trip.created_at,
#             dispatch=dispatch_resp, dispatch_id=trip.dispatch.id if trip.dispatch else None,
#             unit=AmbulanceUnitResponse.from_orm(trip.unit) if trip.unit else None,
#             unit_id=trip.unit.id if trip.unit else None,
#             patient=PatientRef.from_orm(trip.patient) if trip.patient else None,
#             patient_id=trip.patient.id if trip.patient else None,
#             crew=trip.crew, pickup_location=trip.pickup_location,
#             destination=trip.destination, phone_number=trip.phone_number,
#             start_time=trip.start_time, end_time=trip.end_time,
#             mileage=trip.mileage, status=trip.status, notes=trip.notes
#         )

#         # Notify about status change
#         if notify_clients:
#             unit_number = trip.unit.unit_number if trip.unit else "Unknown Unit"
#             await notify_clients(
#                 "trip_status_changed",
#                 title="Trip Status Updated",
#                 message=f"Trip {trip.trip_id} changed from {old_status} to {status}",
#                 trip_id=trip.trip_id,
#                 unit_number=unit_number,
#                 old_status=old_status,
#                 new_status=status,
#                 phone_number=trip.phone_number
#             )

#             # Start GPS simulation if status changed to "En Route"
#             if status == "En Route" and trip.unit:
#                 asyncio.create_task(simulate_live_gps(trip.id, unit_number))

#         return trip_response
#     except Trip.DoesNotExist:
#         raise HTTPException(404, "Trip not found")

# # ==============================================
# # Health Check Endpoint
# # ==============================================
# @router.get("/health")
# async def health_check():
#     """Check if ambulance service is healthy"""
#     try:
#         units_count = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.count())[1])()
#         dispatches_count = await sync_to_async(lambda: (ensure_db_connection(), Dispatch.objects.count())[1])()
#         trips_count = await sync_to_async(lambda: (ensure_db_connection(), Trip.objects.count())[1])()
        
#         return {
#             "status": "healthy",
#             "database": "connected",
#             "counts": {
#                 "units": units_count,
#                 "dispatches": dispatches_count,
#                 "trips": trips_count
#             },
#             "notifications": "available" if notify_clients else "disabled"
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Service unhealthy: {str(e)}")

# fastapi_app/routers/ambulance_router.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, ConfigDict, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from asgiref.sync import sync_to_async
import random
import asyncio
# Django Models
from HMS_backend.models import AmbulanceUnit, Dispatch, Trip, Patient
from django.db import close_old_connections, connection
from django.db.models import Q
from datetime import timedelta
from django.db.utils import IntegrityError

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

router = APIRouter(prefix="/ambulance", tags=["Ambulance Management"])

notify_clients = None

def set_notify_clients(notify_func):
    """Set the notify_clients function from main.py"""
    global notify_clients
    notify_clients = notify_func

# ==============================================
# Pydantic Schemas
# ==============================================

class AmbulanceUnitBase(BaseModel):
    unit_number: str = Field(..., example="AMB-09")
    vehicle_make: Optional[str] = None
    vehicle_model: Optional[str] = None
    phone: Optional[str] = Field(None, example="+91-9876543210")
    contact_number: Optional[str] = Field(None, example="+91-9876543210")
    in_service: Optional[bool] = True
    notes: Optional[str] = None

class AmbulanceUnitCreate(AmbulanceUnitBase):
    @validator('phone', 'contact_number')
    def validate_phone(cls, v):
        if v:
            # Remove all non-digit characters for validation
            digits = ''.join(filter(str.isdigit, v))
            if len(digits) < 10:
                raise ValueError('Phone number must have at least 10 digits')
            if len(digits) > 15:
                raise ValueError('Phone number too long')
        return v

class AmbulanceUnitResponse(AmbulanceUnitBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PatientRef(BaseModel):
    id: int
    patient_unique_id: str
    full_name: str
    phone: Optional[str] = None  # Frontend expects 'phone'
    model_config = ConfigDict(from_attributes=True)
    
    @classmethod
    def from_orm(cls, obj):
        # Map phone_number from DB to phone for frontend
        phone_value = None
        if hasattr(obj, 'phone_number'):
            phone_value = obj.phone_number
        elif hasattr(obj, 'phone'):
            phone_value = obj.phone
        
        data = {
            "id": obj.id,
            "patient_unique_id": obj.patient_unique_id,
            "full_name": obj.full_name,
            "phone": phone_value
        }
        return cls(**data)

class DispatchBase(BaseModel):
    timestamp: datetime
    unit_id: Optional[int] = None
    dispatcher: str = Field(..., example="R. Lewis")
    call_type: Optional[str] = "Emergency"
    location: str = Field(..., example="45 Elm St, Chennai")
    phone_number: Optional[str] = Field(None, example="+91-9876543210")
    contact_number: Optional[str] = Field(None, example="+91-9876543210")
    status: Optional[str] = "Standby"

class DispatchCreate(DispatchBase):
    @validator('phone_number', 'contact_number')
    def validate_phone(cls, v):
        if v:
            digits = ''.join(filter(str.isdigit, v))
            if len(digits) < 10:
                raise ValueError('Phone number must have at least 10 digits')
            if len(digits) > 15:
                raise ValueError('Phone number too long')
        return v

class DispatchUpdate(DispatchBase):
    timestamp: Optional[datetime] = None
    unit_id: Optional[int] = None
    dispatcher: Optional[str] = None
    call_type: Optional[str] = None
    location: Optional[str] = None
    phone_number: Optional[str] = None
    contact_number: Optional[str] = None
    status: Optional[str] = None

class DispatchResponse(DispatchBase):
    id: int
    dispatch_id: str
    unit: Optional[AmbulanceUnitResponse] = None
    model_config = ConfigDict(from_attributes=True)

class TripBase(BaseModel):
    dispatch_id: Optional[int] = None
    unit_id: Optional[int] = None
    crew: Optional[str] = None
    patient_id: Optional[int] = None
    pickup_location: Optional[str] = None
    destination: Optional[str] = None
    phone_number: Optional[str] = Field(None, example="+91-9876543210")
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    mileage: Optional[str] = None
    status: Optional[str] = "Standby"
    notes: Optional[str] = None

class TripCreate(TripBase):
    @validator('phone_number')
    def validate_phone(cls, v):
        if v:
            digits = ''.join(filter(str.isdigit, v))
            if len(digits) < 10:
                raise ValueError('Phone number must have at least 10 digits')
            if len(digits) > 15:
                raise ValueError('Phone number too long')
        return v

class TripUpdate(TripBase):
    pass

class TripResponse(TripBase):
    id: int
    trip_id: str
    created_at: datetime
    dispatch: Optional[DispatchResponse] = None
    unit: Optional[AmbulanceUnitResponse] = None
    patient: Optional[PatientRef] = None
    model_config = ConfigDict(from_attributes=True)

async def simulate_live_gps(trip_id: int, unit_number: str):
    """Simulate live GPS tracking for a trip"""
    if notify_clients is None:
        print("⚠️ notify_clients not available for GPS simulation")
        return
        
    # Start with coordinates near Delhi
    lat = 28.6139 + (random.random() - 0.5) * 0.1
    lng = 77.2090 + (random.random() - 0.5) * 0.1

    # Simulate movement for ~4 minutes
    for i in range(50):
        # Small random movement
        lat += (random.random() - 0.5) * 0.002
        lng += (random.random() - 0.5) * 0.002

        # Send location update
        await notify_clients(
            "location_update",
            trip_id=trip_id,
            unit_number=unit_number,
            lat=round(lat, 6),
            lng=round(lng, 6),
            status="En Route"
        )
        await asyncio.sleep(5)  # Update every 5 seconds

    # Trip completed
    await notify_clients(
        "status_update",
        title="Trip Completed",
        message=f"Ambulance {unit_number} has arrived at destination",
        trip_id=trip_id,
        unit_number=unit_number
    )

# ==============================================
# Safe Async Delete Helper
# ==============================================
async def safe_delete(model, obj_id: int, name: str):
    deleted = await sync_to_async(lambda: (ensure_db_connection(), model.objects.filter(id=obj_id).delete())[1])()
    if deleted[0] == 0:
        raise HTTPException(status_code=404, detail=f"{name} not found")
    return deleted

# ==============================================
# Helper function to check for duplicate trips
# ==============================================
async def check_duplicate_trip(dispatch_id: Optional[int], unit_id: Optional[int],
                               start_time: Optional[datetime], end_time: Optional[datetime],
                               exclude_trip_id: Optional[int] = None):
    """
    Check if there's already a trip with the same dispatch and unit during overlapping time period
    """
    if not dispatch_id or not unit_id or not start_time:
        return False
    
    # If no end time provided, assume a default duration of 2 hours for overlap checking
    effective_end = end_time
    if not effective_end:
        effective_end = start_time + timedelta(hours=2)
    
    # Build query for overlapping trips
    query = Q(dispatch_id=dispatch_id, unit_id=unit_id)
    
    # Exclude the current trip if updating
    if exclude_trip_id:
        query &= ~Q(id=exclude_trip_id)
    
    # Check for overlapping time periods
    overlapping_trips = await sync_to_async(lambda: list(
        Trip.objects.filter(query).filter(
            Q(start_time__lt=effective_end) &
            (Q(end_time__isnull=True) | Q(end_time__gt=start_time))
        )
    ))()
    
    return len(overlapping_trips) > 0

# ==============================================
# NEW: Helper function to check for duplicate ambulance units
# ==============================================
async def check_duplicate_unit(unit_number: str, phone: Optional[str], contact_number: Optional[str], exclude_id: Optional[int] = None):
    """
    Check if a unit with the same unit_number, phone, or contact_number already exists
    Returns a dictionary with duplicate fields
    """
    duplicates = {}
    
    # Build query for unit_number
    unit_query = Q(unit_number__iexact=unit_number.strip())
    if exclude_id:
        unit_query &= ~Q(id=exclude_id)
    
    if await sync_to_async(lambda: AmbulanceUnit.objects.filter(unit_query).exists())():
        duplicates['unit_number'] = "Unit number already exists"
    
    # Check phone if provided
    if phone and phone.strip():
        phone_clean = phone.strip()
        # Check if this phone is used in either phone or contact_number fields
        phone_query = Q(phone=phone_clean) | Q(contact_number=phone_clean)
        if exclude_id:
            phone_query &= ~Q(id=exclude_id)
        
        if await sync_to_async(lambda: AmbulanceUnit.objects.filter(phone_query).exists())():
            duplicates['phone'] = "Phone number already exists"
    
    # Check contact_number if provided and different from phone
    if contact_number and contact_number.strip() and contact_number != phone:
        contact_clean = contact_number.strip()
        contact_query = Q(phone=contact_clean) | Q(contact_number=contact_clean)
        if exclude_id:
            contact_query &= ~Q(id=exclude_id)
        
        if await sync_to_async(lambda: AmbulanceUnit.objects.filter(contact_query).exists())():
            duplicates['contact_number'] = "Alternate phone number already exists"
    
    return duplicates

# ==============================================
# Notification Helper Functions
# ==============================================
async def notify_unit_created(unit_data: AmbulanceUnitResponse):
    """Notify when a new ambulance unit is created"""
    if notify_clients:
        await notify_clients(
            "unit_created",
            title="New Ambulance Unit Added",
            message=f"Ambulance {unit_data.unit_number} has been added to the fleet",
            unit_id=unit_data.id,
            unit_number=unit_data.unit_number,
            vehicle_make=unit_data.vehicle_make,
            vehicle_model=unit_data.vehicle_model,
            phone=unit_data.phone,
            in_service=unit_data.in_service
        )

async def notify_unit_updated(unit_data: AmbulanceUnitResponse):
    """Notify when an ambulance unit is updated"""
    if notify_clients:
        await notify_clients(
            "unit_updated",
            title="Ambulance Unit Updated",
            message=f"Ambulance {unit_data.unit_number} details have been updated",
            unit_id=unit_data.id,
            unit_number=unit_data.unit_number,
            in_service=unit_data.in_service,
            phone=unit_data.phone
        )

async def notify_unit_deleted(unit_id: int, unit_number: str):
    """Notify when an ambulance unit is deleted"""
    if notify_clients:
        await notify_clients(
            "unit_deleted",
            title="Ambulance Unit Removed",
            message=f"Ambulance {unit_number} has been removed from the fleet",
            unit_id=unit_id,
            unit_number=unit_number
        )

async def notify_dispatch_created(dispatch_data: DispatchResponse):
    """Notify when a new dispatch is created"""
    if notify_clients:
        unit_info = f" - Unit {dispatch_data.unit.unit_number}" if dispatch_data.unit else ""
        await notify_clients(
            "new_dispatch",
            title="New Dispatch Created",
            message=f"Dispatch {dispatch_data.dispatch_id} created for {dispatch_data.location}{unit_info}",
            dispatch_id=dispatch_data.dispatch_id,
            location=dispatch_data.location,
            unit_number=dispatch_data.unit.unit_number if dispatch_data.unit else None,
            status=dispatch_data.status,
            phone_number=dispatch_data.phone_number
        )

async def notify_dispatch_updated(dispatch_data: DispatchResponse):
    """Notify when a dispatch is updated"""
    if notify_clients:
        await notify_clients(
            "dispatch_status_updated",
            title="Dispatch Updated",
            message=f"Dispatch {dispatch_data.dispatch_id} has been updated",
            dispatch_id=dispatch_data.dispatch_id,
            status=dispatch_data.status,
            location=dispatch_data.location,
            phone_number=dispatch_data.phone_number
        )

async def notify_dispatch_deleted(dispatch_id: int, dispatch_id_str: str):
    """Notify when a dispatch is deleted"""
    if notify_clients:
        await notify_clients(
            "dispatch_deleted",
            title="Dispatch Cancelled",
            message=f"Dispatch {dispatch_id_str} has been cancelled",
            dispatch_id=dispatch_id_str
        )

async def notify_trip_created(trip_data: TripResponse):
    """Notify when a new trip is created"""
    if notify_clients:
        unit_number = trip_data.unit.unit_number if trip_data.unit else "Unknown Unit"
        await notify_clients(
            "new_trip",
            title="New Trip Started",
            message=f"Trip {trip_data.trip_id} started for {unit_number}",
            trip_id=trip_data.trip_id,
            unit_number=unit_number,
            status=trip_data.status,
            destination=trip_data.destination,
            phone_number=trip_data.phone_number
        )
        
        # Start GPS simulation for new trips
        if trip_data.status == "En Route" and trip_data.unit:
            asyncio.create_task(simulate_live_gps(trip_data.id, unit_number))

async def notify_trip_updated(trip_data: TripResponse):
    """Notify when a trip is updated"""
    if notify_clients:
        unit_number = trip_data.unit.unit_number if trip_data.unit else "Unknown Unit"
        await notify_clients(
            "trip_status_changed",
            title="Trip Status Updated",
            message=f"Trip {trip_data.trip_id} status changed to {trip_data.status}",
            trip_id=trip_data.trip_id,
            unit_number=unit_number,
            status=trip_data.status,
            phone_number=trip_data.phone_number
        )
        
        # Start GPS simulation if trip status changed to "En Route"
        if trip_data.status == "En Route" and trip_data.unit:
            asyncio.create_task(simulate_live_gps(trip_data.id, unit_number))

async def notify_trip_deleted(trip_id: int, trip_id_str: str, unit_number: str = None):
    """Notify when a trip is deleted"""
    if notify_clients:
        await notify_clients(
            "trip_deleted",
            title="Trip Cancelled",
            message=f"Trip {trip_id_str} has been cancelled{' by ' + unit_number if unit_number else ''}",
            trip_id=trip_id_str,
            unit_number=unit_number
        )

# ==============================================
# Ambulance Units - FIXED with proper structured error responses
# ==============================================
@router.get("/units", response_model=List[AmbulanceUnitResponse])
async def list_units(in_service: Optional[bool] = None):
    qs = AmbulanceUnit.objects.all()
    if in_service is not None:
        qs = qs.filter(in_service=in_service)
    return await sync_to_async(lambda: (ensure_db_connection(), list(qs.order_by("-id")))[1])()

@router.post("/units", response_model=AmbulanceUnitResponse, status_code=201)
async def create_unit(payload: AmbulanceUnitCreate):
    try:
        # First check for duplicates manually to provide structured error response
        duplicates = await check_duplicate_unit(
            unit_number=payload.unit_number,
            phone=payload.phone,
            contact_number=payload.contact_number
        )
        
        if duplicates:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "message": "Duplicate entry detected",
                    "errors": duplicates
                }
            )
        
        unit = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.create(**payload.dict()))[1])()
        unit_response = AmbulanceUnitResponse.from_orm(unit)
        
        # Notify about unit creation
        await notify_unit_created(unit_response)
        
        return unit_response
    except IntegrityError as e:
        # Fallback for any IntegrityError that might slip through
        error_str = str(e).lower()
        errors = {}
        if 'unit_number' in error_str:
            errors['unit_number'] = "Unit number already exists"
        if 'phone' in error_str:
            errors['phone'] = "Phone number already exists"
        if 'contact_number' in error_str:
            errors['contact_number'] = "Alternate phone number already exists"
        
        if errors:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "message": "Duplicate entry detected",
                    "errors": errors
                }
            )
        else:
            raise HTTPException(status_code=500, detail="Error creating unit")

@router.put("/units/{unit_id}", response_model=AmbulanceUnitResponse)
async def update_unit(unit_id: int, payload: AmbulanceUnitCreate):
    try:
        # Check for duplicates (excluding current unit)
        duplicates = await check_duplicate_unit(
            unit_number=payload.unit_number,
            phone=payload.phone,
            contact_number=payload.contact_number,
            exclude_id=unit_id
        )
        
        if duplicates:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "message": "Duplicate entry detected",
                    "errors": duplicates
                }
            )
        
        unit = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.get(id=unit_id))[1])()
        for k, v in payload.dict().items():
            setattr(unit, k, v)
        await sync_to_async(lambda: (ensure_db_connection(), unit.save())[1])()
        
        unit_response = AmbulanceUnitResponse.from_orm(unit)
        
        # Notify about unit update
        await notify_unit_updated(unit_response)
        
        return unit_response
    except AmbulanceUnit.DoesNotExist:
        raise HTTPException(404, "Unit not found")
    except IntegrityError as e:
        # Fallback for any IntegrityError that might slip through
        error_str = str(e).lower()
        errors = {}
        if 'unit_number' in error_str:
            errors['unit_number'] = "Unit number already exists"
        if 'phone' in error_str:
            errors['phone'] = "Phone number already exists"
        if 'contact_number' in error_str:
            errors['contact_number'] = "Alternate phone number already exists"
        
        if errors:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "message": "Duplicate entry detected",
                    "errors": errors
                }
            )
        else:
            raise HTTPException(status_code=500, detail="Error updating unit")

@router.delete("/units/{unit_id}", status_code=204)
async def delete_unit(unit_id: int):
    # Get unit info before deletion for notification
    try:
        unit = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.get(id=unit_id))[1])()
        unit_number = unit.unit_number
    except AmbulanceUnit.DoesNotExist:
        raise HTTPException(404, "Unit not found")
    
    await safe_delete(AmbulanceUnit, unit_id, "Unit")
    
    # Notify about unit deletion
    await notify_unit_deleted(unit_id, unit_number)

# ==============================================
# Dispatch Endpoints
# ==============================================
@router.get("/dispatch", response_model=List[DispatchResponse])
async def list_dispatches():
    dispatches = await sync_to_async(lambda: (ensure_db_connection(), list(
        Dispatch.objects.select_related("unit").all().order_by("-timestamp")
    ))[1])()
    result = []
    for d in dispatches:
        unit_resp = AmbulanceUnitResponse.from_orm(d.unit) if d.unit else None
        result.append(DispatchResponse(
            id=d.id, dispatch_id=d.dispatch_id, timestamp=d.timestamp,
            unit_id=d.unit.id if d.unit else None, unit=unit_resp,
            dispatcher=d.dispatcher, call_type=d.call_type,
            location=d.location, phone_number=d.phone_number,
            contact_number=d.contact_number, status=d.status
        ))
    return result

@router.post("/dispatch", response_model=DispatchResponse, status_code=201)
async def create_dispatch(payload: DispatchCreate):
    unit = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.get(id=payload.unit_id))[1])() if payload.unit_id else None
    dispatch = await sync_to_async(lambda: (ensure_db_connection(), Dispatch.objects.create(
        timestamp=payload.timestamp, unit=unit, dispatcher=payload.dispatcher,
        call_type=payload.call_type or "Emergency", location=payload.location,
        phone_number=payload.phone_number, contact_number=payload.contact_number,
        status=payload.status or "Standby"
    ))[1])()
    unit_resp = AmbulanceUnitResponse.from_orm(unit) if unit else None
    dispatch_response = DispatchResponse(
        id=dispatch.id, dispatch_id=dispatch.dispatch_id, timestamp=dispatch.timestamp,
        unit_id=unit.id if unit else None, unit=unit_resp,
        dispatcher=dispatch.dispatcher, call_type=dispatch.call_type,
        location=dispatch.location, phone_number=dispatch.phone_number,
        contact_number=dispatch.contact_number, status=dispatch.status
    )
    
    # Notify about dispatch creation
    await notify_dispatch_created(dispatch_response)
    
    return dispatch_response

@router.put("/dispatch/{dispatch_id}", response_model=DispatchResponse)
async def update_dispatch(dispatch_id: int, payload: DispatchUpdate):
    try:
        d = await sync_to_async(lambda: (ensure_db_connection(), Dispatch.objects.get(id=dispatch_id))[1])()
        if payload.timestamp is not None: d.timestamp = payload.timestamp
        if payload.dispatcher is not None: d.dispatcher = payload.dispatcher
        if payload.call_type is not None: d.call_type = payload.call_type
        if payload.location is not None: d.location = payload.location
        if payload.phone_number is not None: d.phone_number = payload.phone_number
        if payload.contact_number is not None: d.contact_number = payload.contact_number
        if payload.status is not None: d.status = payload.status
        if payload.unit_id is not None:
            d.unit = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.get(id=payload.unit_id))[1])() if payload.unit_id else None
        await sync_to_async(lambda: (ensure_db_connection(), d.save())[1])()
        unit_resp = AmbulanceUnitResponse.from_orm(d.unit) if d.unit else None
        dispatch_response = DispatchResponse(
            id=d.id, dispatch_id=d.dispatch_id, timestamp=d.timestamp,
            unit_id=d.unit.id if d.unit else None, unit=unit_resp,
            dispatcher=d.dispatcher, call_type=d.call_type,
            location=d.location, phone_number=d.phone_number,
            contact_number=d.contact_number, status=d.status
        )
        
        # Notify about dispatch update
        await notify_dispatch_updated(dispatch_response)
        
        return dispatch_response
    except Dispatch.DoesNotExist:
        raise HTTPException(404, "Dispatch not found")
    except AmbulanceUnit.DoesNotExist:
        raise HTTPException(404, "Unit not found")

@router.delete("/dispatch/{dispatch_id}", status_code=204)
async def delete_dispatch(dispatch_id: int):
    # Get dispatch info before deletion for notification
    try:
        dispatch = await sync_to_async(lambda: (ensure_db_connection(), Dispatch.objects.get(id=dispatch_id))[1])()
        dispatch_id_str = dispatch.dispatch_id
    except Dispatch.DoesNotExist:
        raise HTTPException(404, "Dispatch not found")
    
    # CASCADE delete → all related Trips will be automatically deleted
    await safe_delete(Dispatch, dispatch_id, "Dispatch")
    
    # Notify about dispatch deletion
    await notify_dispatch_deleted(dispatch_id, dispatch_id_str)

# ==============================================
# Trip Endpoints
# ==============================================
@router.get("/trips", response_model=List[TripResponse])
async def list_trips():
    trips = await sync_to_async(lambda: (ensure_db_connection(), list(
        Trip.objects.select_related("dispatch__unit", "unit", "patient").all().order_by("-created_at")
    ))[1])()
    result = []
    for t in trips:
        dispatch_resp = None
        if t.dispatch:
            unit_d = await sync_to_async(lambda: (ensure_db_connection(), t.dispatch.unit)[1])()
            unit_d_resp = AmbulanceUnitResponse.from_orm(unit_d) if unit_d else None
            dispatch_resp = DispatchResponse(
                id=t.dispatch.id, dispatch_id=t.dispatch.dispatch_id,
                timestamp=t.dispatch.timestamp, unit_id=unit_d.id if unit_d else None,
                unit=unit_d_resp, dispatcher=t.dispatch.dispatcher,
                call_type=t.dispatch.call_type, location=t.dispatch.location,
                phone_number=t.dispatch.phone_number,
                contact_number=t.dispatch.contact_number,
                status=t.dispatch.status
            )
        
        result.append(TripResponse(
            id=t.id, trip_id=t.trip_id, created_at=t.created_at,
            dispatch=dispatch_resp, dispatch_id=t.dispatch.id if t.dispatch else None,
            unit=AmbulanceUnitResponse.from_orm(t.unit) if t.unit else None,
            unit_id=t.unit.id if t.unit else None,
            patient=PatientRef.from_orm(t.patient) if t.patient else None,
            patient_id=t.patient.id if t.patient else None,
            crew=t.crew, pickup_location=t.pickup_location,
            destination=t.destination, phone_number=t.phone_number,
            start_time=t.start_time, end_time=t.end_time,
            mileage=t.mileage, status=t.status, notes=t.notes
        ))
    return result

@router.post("/trips", response_model=TripResponse, status_code=201)
async def create_trip(payload: TripCreate):
    try:
        # Check for duplicate trip first
        is_duplicate = await check_duplicate_trip(
            dispatch_id=payload.dispatch_id,
            unit_id=payload.unit_id,
            start_time=payload.start_time,
            end_time=payload.end_time
        )
        
        if is_duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A trip with this dispatcher and unit already exists during this time period. Please choose a different time, dispatcher, or unit."
            )
        
        # Fetch related objects
        dispatch = None
        if payload.dispatch_id:
            dispatch = await sync_to_async(lambda: (ensure_db_connection(), Dispatch.objects.select_related("unit").get(id=payload.dispatch_id))[1])()

        unit = None
        if payload.unit_id:
            unit = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.get(id=payload.unit_id))[1])()

        patient = None
        if payload.patient_id:
            patient = await sync_to_async(lambda: (ensure_db_connection(), Patient.objects.get(id=payload.patient_id))[1])()

        # Create trip
        trip = await sync_to_async(lambda: (ensure_db_connection(), Trip.objects.create(
            dispatch=dispatch, unit=unit, patient=patient,
            crew=payload.crew, pickup_location=payload.pickup_location,
            destination=payload.destination, phone_number=payload.phone_number,
            start_time=payload.start_time, end_time=payload.end_time,
            mileage=payload.mileage, status=payload.status or "Standby",
            notes=payload.notes
        ))[1])()

        # Build nested dispatch response safely
        dispatch_resp = None
        if dispatch:
            unit_d = await sync_to_async(lambda: (ensure_db_connection(), dispatch.unit)[1])()
            unit_d_resp = AmbulanceUnitResponse.from_orm(unit_d) if unit_d else None
            dispatch_resp = DispatchResponse(
                id=dispatch.id, dispatch_id=dispatch.dispatch_id,
                timestamp=dispatch.timestamp, unit_id=unit_d.id if unit_d else None,
                unit=unit_d_resp, dispatcher=dispatch.dispatcher,
                call_type=dispatch.call_type, location=dispatch.location,
                phone_number=dispatch.phone_number,
                contact_number=dispatch.contact_number,
                status=dispatch.status
            )

        trip_response = TripResponse(
            id=trip.id, trip_id=trip.trip_id, created_at=trip.created_at,
            dispatch=dispatch_resp, dispatch_id=dispatch.id if dispatch else None,
            unit=AmbulanceUnitResponse.from_orm(unit) if unit else None,
            unit_id=unit.id if unit else None,
            patient=PatientRef.from_orm(patient) if patient else None,
            patient_id=patient.id if patient else None,
            crew=trip.crew, pickup_location=trip.pickup_location,
            destination=trip.destination, phone_number=trip.phone_number,
            start_time=trip.start_time, end_time=trip.end_time,
            mileage=trip.mileage, status=trip.status, notes=trip.notes
        )

        # Notify about trip creation
        await notify_trip_created(trip_response)

        return trip_response

    except (Dispatch.DoesNotExist, AmbulanceUnit.DoesNotExist, Patient.DoesNotExist):
        raise HTTPException(404, "Related record not found")

@router.put("/trips/{trip_id}", response_model=TripResponse)
async def update_trip(trip_id: int, payload: TripUpdate):
    try:
        # Check for duplicate trip (excluding current trip)
        is_duplicate = await check_duplicate_trip(
            dispatch_id=payload.dispatch_id,
            unit_id=payload.unit_id,
            start_time=payload.start_time,
            end_time=payload.end_time,
            exclude_trip_id=trip_id
        )
        
        if is_duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A trip with this dispatcher and unit already exists during this time period. Please choose a different time, dispatcher, or unit."
            )
        
        t = await sync_to_async(lambda: (ensure_db_connection(), Trip.objects.get(id=trip_id))[1])()
        if payload.dispatch_id is not None:
            t.dispatch = await sync_to_async(lambda: (ensure_db_connection(), Dispatch.objects.get(id=payload.dispatch_id))[1])() if payload.dispatch_id else None
        if payload.unit_id is not None:
            t.unit = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.get(id=payload.unit_id))[1])() if payload.unit_id else None
        if payload.patient_id is not None:
            t.patient = await sync_to_async(lambda: (ensure_db_connection(), Patient.objects.get(id=payload.patient_id))[1])() if payload.patient_id else None
        if payload.crew is not None: t.crew = payload.crew
        if payload.pickup_location is not None: t.pickup_location = payload.pickup_location
        if payload.destination is not None: t.destination = payload.destination
        if payload.phone_number is not None: t.phone_number = payload.phone_number
        if payload.start_time is not None: t.start_time = payload.start_time
        if payload.end_time is not None: t.end_time = payload.end_time
        if payload.mileage is not None: t.mileage = payload.mileage
        if payload.status is not None: t.status = payload.status
        if payload.notes is not None: t.notes = payload.notes
        await sync_to_async(lambda: (ensure_db_connection(), t.save())[1])()

        # Build response
        dispatch_resp = None
        if t.dispatch:
            unit_d = await sync_to_async(lambda: (ensure_db_connection(), t.dispatch.unit)[1])()
            unit_d_resp = AmbulanceUnitResponse.from_orm(unit_d) if unit_d else None
            dispatch_resp = DispatchResponse(
                id=t.dispatch.id, dispatch_id=t.dispatch.dispatch_id,
                timestamp=t.dispatch.timestamp, unit_id=unit_d.id if unit_d else None,
                unit=unit_d_resp, dispatcher=t.dispatch.dispatcher,
                call_type=t.dispatch.call_type, location=t.dispatch.location,
                phone_number=t.dispatch.phone_number,
                contact_number=t.dispatch.contact_number,
                status=t.dispatch.status
            )

        trip_response = TripResponse(
            id=t.id, trip_id=t.trip_id, created_at=t.created_at,
            dispatch=dispatch_resp, dispatch_id=t.dispatch.id if t.dispatch else None,
            unit=AmbulanceUnitResponse.from_orm(t.unit) if t.unit else None,
            unit_id=t.unit.id if t.unit else None,
            patient=PatientRef.from_orm(t.patient) if t.patient else None,
            patient_id=t.patient.id if t.patient else None,
            crew=t.crew, pickup_location=t.pickup_location,
            destination=t.destination, phone_number=t.phone_number,
            start_time=t.start_time, end_time=t.end_time,
            mileage=t.mileage, status=t.status, notes=t.notes
        )

        # Notify about trip update
        await notify_trip_updated(trip_response)

        return trip_response
    except Trip.DoesNotExist:
        raise HTTPException(404, "Trip not found")
    except (Dispatch.DoesNotExist, AmbulanceUnit.DoesNotExist, Patient.DoesNotExist):
        raise HTTPException(404, "Related record not found")

@router.delete("/trips/{trip_id}", status_code=204)
async def delete_trip(trip_id: int):
    # Get trip info before deletion for notification
    try:
        trip = await sync_to_async(lambda: (ensure_db_connection(), Trip.objects.select_related("unit").get(id=trip_id))[1])()
        trip_id_str = trip.trip_id
        unit_number = trip.unit.unit_number if trip.unit else None
    except Trip.DoesNotExist:
        raise HTTPException(404, "Trip not found")
    
    await safe_delete(Trip, trip_id, "Trip")
    
    # Notify about trip deletion
    await notify_trip_deleted(trip_id, trip_id_str, unit_number)

# ==============================================
# Patients Dropdown (Include phone numbers)
# ==============================================
@router.get("/patients", response_model=List[dict])
async def get_patients_for_dropdown():
    patients = await sync_to_async(lambda: (ensure_db_connection(), list(
        Patient.objects.values("id", "patient_unique_id", "full_name", "phone_number")
        .order_by("patient_unique_id")[:500]
    ))[1])()
    return [
        {
            "id": p["id"],
            "patient_unique_id": p["patient_unique_id"],
            "full_name": p["full_name"],
            "phone": p["phone_number"] or None  # Map phone_number to phone for frontend
        }
        for p in patients
    ]

# ==============================================
# Trip Status Update Endpoint
# ==============================================
@router.patch("/trips/{trip_id}/status", response_model=TripResponse)
async def update_trip_status(trip_id: int, status: str):
    """Update trip status and notify clients"""
    try:
        trip = await sync_to_async(lambda: (ensure_db_connection(), Trip.objects.select_related("unit").get(id=trip_id))[1])()
        old_status = trip.status
        trip.status = status
        await sync_to_async(lambda: (ensure_db_connection(), trip.save())[1])()

        # Build response
        dispatch_resp = None
        if trip.dispatch:
            unit_d = await sync_to_async(lambda: (ensure_db_connection(), trip.dispatch.unit)[1])()
            unit_d_resp = AmbulanceUnitResponse.from_orm(unit_d) if unit_d else None
            dispatch_resp = DispatchResponse(
                id=trip.dispatch.id, dispatch_id=trip.dispatch.dispatch_id,
                timestamp=trip.dispatch.timestamp, unit_id=unit_d.id if unit_d else None,
                unit=unit_d_resp, dispatcher=trip.dispatch.dispatcher,
                call_type=trip.dispatch.call_type, location=trip.dispatch.location,
                phone_number=trip.dispatch.phone_number,
                contact_number=trip.dispatch.contact_number,
                status=trip.dispatch.status
            )

        trip_response = TripResponse(
            id=trip.id, trip_id=trip.trip_id, created_at=trip.created_at,
            dispatch=dispatch_resp, dispatch_id=trip.dispatch.id if trip.dispatch else None,
            unit=AmbulanceUnitResponse.from_orm(trip.unit) if trip.unit else None,
            unit_id=trip.unit.id if trip.unit else None,
            patient=PatientRef.from_orm(trip.patient) if trip.patient else None,
            patient_id=trip.patient.id if trip.patient else None,
            crew=trip.crew, pickup_location=trip.pickup_location,
            destination=trip.destination, phone_number=trip.phone_number,
            start_time=trip.start_time, end_time=trip.end_time,
            mileage=trip.mileage, status=trip.status, notes=trip.notes
        )

        # Notify about status change
        if notify_clients:
            unit_number = trip.unit.unit_number if trip.unit else "Unknown Unit"
            await notify_clients(
                "trip_status_changed",
                title="Trip Status Updated",
                message=f"Trip {trip.trip_id} changed from {old_status} to {status}",
                trip_id=trip.trip_id,
                unit_number=unit_number,
                old_status=old_status,
                new_status=status,
                phone_number=trip.phone_number
            )

            # Start GPS simulation if status changed to "En Route"
            if status == "En Route" and trip.unit:
                asyncio.create_task(simulate_live_gps(trip.id, unit_number))

        return trip_response
    except Trip.DoesNotExist:
        raise HTTPException(404, "Trip not found")

# ==============================================
# Health Check Endpoint
# ==============================================
@router.get("/health")
async def health_check():
    """Check if ambulance service is healthy"""
    try:
        units_count = await sync_to_async(lambda: (ensure_db_connection(), AmbulanceUnit.objects.count())[1])()
        dispatches_count = await sync_to_async(lambda: (ensure_db_connection(), Dispatch.objects.count())[1])()
        trips_count = await sync_to_async(lambda: (ensure_db_connection(), Trip.objects.count())[1])()
        
        return {
            "status": "healthy",
            "database": "connected",
            "counts": {
                "units": units_count,
                "dispatches": dispatches_count,
                "trips": trips_count
            },
            "notifications": "available" if notify_clients else "disabled"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Service unhealthy: {str(e)}")