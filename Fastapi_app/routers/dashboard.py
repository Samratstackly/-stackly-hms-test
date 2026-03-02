# # fastapi_app/routers/dashboard.py
# from fastapi import APIRouter, HTTPException
# from django.db.models import Count, Q, Sum
# from django.db import models
# from datetime import datetime, timedelta
# from django.utils import timezone
# from datetime import datetime, timedelta, time

# import json
# from asgiref.sync import sync_to_async
# import asyncio

# from HMS_backend.models import (
#     Patient, Staff, Appointment, Department, 
#     LabReport, Bed, BedGroup, HospitalInvoiceHistory,
#     MedicineAllocation, Dispatch, Trip, Stock, BloodGroup, Surgery
# )

# from django.db import close_old_connections, connection

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

# router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# # Async wrappers for Django ORM calls
# @sync_to_async
# def get_patient_count():
#     ensure_db_connection()
#     return Patient.objects.count()

# @sync_to_async
# def get_active_patients():
#     ensure_db_connection()
#     return Patient.objects.filter(
#         admission_date__isnull=False,
#         discharge_date__isnull=True
#     ).count()

# @sync_to_async
# def get_weekly_admissions(week_ago):
#     ensure_db_connection()
#     return Patient.objects.filter(created_at__date__gte=week_ago).count()

# @sync_to_async
# def get_today_admissions(today):
#     ensure_db_connection()
#     return Patient.objects.filter(created_at__date=today).count()

# @sync_to_async
# def get_priority_care():
#     ensure_db_connection()
#     return Appointment.objects.filter(status='severe').count()

# @sync_to_async
# def get_appointment_count():
#     ensure_db_connection()
#     return Appointment.objects.count()

# @sync_to_async
# def get_today_appointments(today):
#     ensure_db_connection()
#     return Appointment.objects.filter(created_at__date=today).count()

# @sync_to_async
# def get_emergency_cases():
#     ensure_db_connection()
#     return Appointment.objects.filter(appointment_type='emergency').count()

# @sync_to_async
# def get_department_stats():
#     ensure_db_connection()
#     return list(Appointment.objects.values('department__name').annotate(count=Count('id')).order_by('-count'))

# @sync_to_async
# def get_total_revenue():
#     ensure_db_connection()
#     result = HospitalInvoiceHistory.objects.aggregate(total=Sum('amount'))
#     return float(result['total'] or 0)

# @sync_to_async
# def get_today_revenue(today):
#     ensure_db_connection()
#     result = HospitalInvoiceHistory.objects.filter(date=today).aggregate(total=Sum('amount'))
#     return float(result['total'] or 0)

# @sync_to_async
# def get_outstanding_payments():
#     ensure_db_connection()
#     result = HospitalInvoiceHistory.objects.filter(status__in=['Unpaid', 'Pending']).aggregate(total=Sum('amount'))
#     return float(result['total'] or 0)

# # Safe pharmacy revenue function (handles missing table)
# @sync_to_async
# def get_pharmacy_revenue_today(today):
#     ensure_db_connection()
#     try:
#         # Check if PharmacyInvoiceHistory model exists and table is created
#         from HMS_backend.models import PharmacyInvoiceHistory
#         result = PharmacyInvoiceHistory.objects.filter(bill_date=today).aggregate(total=Sum('net_amount'))
#         return float(result['total'] or 0)
#     except Exception:
#         return 0.0

# @sync_to_async
# def get_recent_patients():
#     ensure_db_connection()
#     return list(Patient.objects.order_by('-created_at')[:5].values('id', 'full_name', 'created_at'))

# @sync_to_async
# def get_recent_appointments():
#     ensure_db_connection()
#     return list(Appointment.objects.order_by('-created_at')[:5].values('id', 'patient_name', 'created_at'))

# @sync_to_async
# def get_emergency_appointments():
#     ensure_db_connection()
#     return Appointment.objects.filter(appointment_type='emergency').count()

# @sync_to_async
# def get_patients_with_admission():
#     ensure_db_connection()
#     return Patient.objects.filter(admission_date__isnull=False).count()

# @sync_to_async
# def get_total_invoices():
#     ensure_db_connection()
#     return HospitalInvoiceHistory.objects.count()

# def normalize_timestamp(ts):
#     """
#     Ensures timestamp is timezone-aware datetime
#     """
#     if isinstance(ts, str):
#         return datetime.fromisoformat(ts)

#     if isinstance(ts, datetime):
#         if ts.tzinfo is None:
#             return timezone.make_aware(ts)
#         return ts

#     return timezone.now()

# from django.utils import timezone
# from datetime import timedelta

# @sync_to_async
# def get_total_surgeries():
#     ensure_db_connection()
#     now = timezone.now()

#     # First day of current month
#     start_of_month = now.replace(
#         day=1, hour=0, minute=0, second=0, microsecond=0
#     )

#     # First day of next month
#     if now.month == 12:
#         start_of_next_month = start_of_month.replace(
#             year=now.year + 1, month=1
#         )
#     else:
#         start_of_next_month = start_of_month.replace(
#             month=now.month + 1
#         )

#     return Surgery.objects.filter(
#         scheduled_date__gte=start_of_month,
#         scheduled_date__lt=start_of_next_month
#     ).count()


# @sync_to_async
# def get_today_surgeries():
#     ensure_db_connection()
#     today = timezone.localdate()

#     start = datetime.combine(today, time.min)
#     end = datetime.combine(today, time.max)

#     start = timezone.make_aware(start)
#     end = timezone.make_aware(end)

#     return Surgery.objects.filter(
#         scheduled_date__range=(start, end)
#     ).count()

# # @sync_to_async
# # def get_pending_surgeries():
# #     return Surgery.objects.filter(status="pending").count()

# @sync_to_async
# def get_success_rate():
#     ensure_db_connection()
#     today = timezone.now()
#     start_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

#     success_count = Surgery.objects.filter(
#         created_at__gte=start_of_month,
#         status="success"
#     ).count()

#     failed_count = Surgery.objects.filter(
#         created_at__gte=start_of_month,
#         status="failed"
#     ).count()

#     total_completed = success_count + failed_count

#     if total_completed == 0:
#         return 0

#     return round((success_count / total_completed) * 100, 1)

    
# @sync_to_async
# def get_emergency_surgeries():
#     ensure_db_connection()
#     emergency_patient_ids = Appointment.objects.filter(
#         appointment_type="emergency"
#     ).values_list("patient_id", flat=True)

#     return Surgery.objects.filter(
#         patient_id__in=emergency_patient_ids
#     ).count()



# @router.get("/stats")
# async def get_dashboard_stats():
#     """Get all dashboard statistics"""
#     try:
#         today = datetime.now().date()
#         week_ago = today - timedelta(days=7)
        
#         # Get all data asynchronously
#         total_patients = await get_patient_count()
        
#         # If no patients exist, return zeros
#         if total_patients == 0:
#             return {
#                 "patient_stats": {
#                     "total_patients": 0,
#                     "active_patients": 0,
#                     "weekly_admissions": 0,
#                     "priority_care": 0,
#                     "today_admissions": 0
#                 },
#                 "appointment_stats": {
#                     "total_appointments": 0,
#                     "today_appointments": 0,
#                     "emergency_cases": 0,
#                     "consultation_today": 0
#                 },
#                 "financial_stats": {
#                     "total_revenue": 0.0,
#                     "today_revenue": 0.0,
#                     "pharmacy_revenue_today": 0.0,
#                     "outstanding_payments": 0.0
#                 },
#                 "department_distribution": [],
#                 "timestamp": datetime.now().isoformat(),
#                 "data_status": "NO_DATA"
#             }
        
#         # Get all statistics concurrently
#         active_patients, weekly_admissions, today_admissions, priority_care = await asyncio.gather(
#             get_active_patients(),
#             get_weekly_admissions(week_ago),
#             get_today_admissions(today),
#             get_priority_care()
#         )
        
#         total_appointments, today_appointments, emergency_cases, department_stats = await asyncio.gather(
#             get_appointment_count(),
#             get_today_appointments(today),
#             get_emergency_cases(),
#             get_department_stats()
#         )
        
#         total_revenue, today_revenue, pharmacy_revenue_today, outstanding_payments = await asyncio.gather(
#             get_total_revenue(),
#             get_today_revenue(today),
#             get_pharmacy_revenue_today(today),
#             get_outstanding_payments()
#         )
#         total_surgeries, today_surgeries, emergency_surgeries, success_rate = await asyncio.gather(
#     get_total_surgeries(),
#     get_today_surgeries(),
#     get_emergency_surgeries(),
#     get_success_rate()
# )



#         return {
#             "patient_stats": {
#                 "total_patients": total_patients,
#                 "active_patients": active_patients,
#                 "weekly_admissions": weekly_admissions,
#                 "priority_care": priority_care,
#                 "today_admissions": today_admissions
#             },
#             "appointment_stats": {
#                 "total_appointments": total_appointments,
#                 "today_appointments": today_appointments,
#                 "emergency_cases": emergency_cases,
#                 "consultation_today": today_appointments
#             },
#             "financial_stats": {
#                 "total_revenue": total_revenue,
#                 "today_revenue": today_revenue,
#                 "pharmacy_revenue_today": pharmacy_revenue_today,
#                 "outstanding_payments": outstanding_payments
#             },
#             "surgery_stats": {
#     "total_surgeries": total_surgeries,
#     "today_surgeries": today_surgeries,
#     "emergency_surgeries": emergency_surgeries,
#     "success_rate": success_rate
# },


#             "department_distribution": department_stats,
#             "timestamp": datetime.now().isoformat(),
#             "data_status": "REAL_DATA"
#         }
        
#     except Exception as e:
#         print(f"Dashboard stats error: {str(e)}")
#         return {
#             "patient_stats": {
#                 "total_patients": 0,
#                 "active_patients": 0,
#                 "weekly_admissions": 0,
#                 "priority_care": 0,
#                 "today_admissions": 0
#             },
#             "appointment_stats": {
#                 "total_appointments": 0,
#                 "today_appointments": 0,
#                 "emergency_cases": 0,
#                 "consultation_today": 0
#             },
#             "financial_stats": {
#                 "total_revenue": 0.0,
#                 "today_revenue": 0.0,
#                 "pharmacy_revenue_today": 0.0,
#                 "outstanding_payments": 0.0
#             },
#             "department_distribution": [],
#             "timestamp": datetime.now().isoformat(),
#             "data_status": "ERROR",
#             "error": str(e)
#         }


# @router.get("/recent-activities")
# async def get_recent_activities():
#     try:
#         recent_activities = []

#         # Recent patients
#         recent_patients = await get_recent_patients()
#         for patient in recent_patients[:3]:
#             recent_activities.append({
#                 "id": f"patient_{patient['id']}",
#                 "type": "info",
#                 "message": f"New patient registered: {patient['full_name']}",
#                 "timestamp": patient["created_at"],
#                 "read": False,
#                 "category": "patient"
#             })

#         # Recent appointments
#         recent_appointments = await get_recent_appointments()
#         for appointment in recent_appointments[:3]:
#             recent_activities.append({
#                 "id": f"appointment_{appointment['id']}",
#                 "type": "info",
#                 "message": f"New appointment: {appointment['patient_name']}",
#                 "timestamp": appointment["created_at"],
#                 "read": False,
#                 "category": "appointment"
#             })

#         # Emergency alert
#         emergency_count = await get_emergency_appointments()
#         if emergency_count > 0:
#             recent_activities.append({
#                 "id": "emergency_alert",
#                 "type": "error",
#                 "message": f"{emergency_count} emergency case(s) require attention",
#                 "timestamp": timezone.now(),
#                 "read": False,
#                 "category": "emergency"
#             })

#         # Normalize timestamps
#         for activity in recent_activities:
#             activity["timestamp"] = normalize_timestamp(activity["timestamp"])

#         # Sort latest first
#         recent_activities.sort(key=lambda x: x["timestamp"], reverse=True)

#         # Convert to ISO for frontend
#         for activity in recent_activities:
#             activity["timestamp"] = activity["timestamp"].isoformat()

#         return recent_activities[:10]

#     except Exception as e:
#         print(f"Recent activities error: {e}")
#         return []


# @router.get("/debug-data")
# async def debug_data():
#     """Debug endpoint to see actual data counts"""
#     try:
#         # Get all debug data asynchronously
#         total_patients, total_appointments, total_invoices = await asyncio.gather(
#             get_patient_count(),
#             get_appointment_count(),
#             get_total_invoices()
#         )
        
#         recent_patients, recent_appointments = await asyncio.gather(
#             get_recent_patients(),
#             get_recent_appointments()
#         )
        
#         patients_with_admission, emergency_appointments = await asyncio.gather(
#             get_patients_with_admission(),
#             get_emergency_appointments()
#         )
        
#         return {
#             "total_patients": total_patients,
#             "total_appointments": total_appointments,
#             "total_invoices": total_invoices,
#             "recent_patients": recent_patients,
#             "recent_appointments": recent_appointments,
#             "patient_with_admission": patients_with_admission,
#             "emergency_appointments": emergency_appointments
#         }
#     except Exception as e:
#         return {"error": str(e)}

# @router.get("/diagnostic")
# async def diagnostic_check():
#     """Comprehensive diagnostic of all data"""
#     try:
#         today = datetime.now().date()
#         week_ago = today - timedelta(days=7)
        
#         # Get all diagnostic data
#         total_patients = await get_patient_count()
#         patients_with_admission = await get_patients_with_admission()
#         active_patients = await get_active_patients()
#         weekly_admissions = await get_weekly_admissions(week_ago)
#         today_admissions = await get_today_admissions(today)
        
#         total_appointments = await get_appointment_count()
#         today_appointments = await get_today_appointments(today)
#         emergency_appointments = await get_emergency_appointments()
        
#         recent_patients = await get_recent_patients()
#         recent_appointments = await get_recent_appointments()
        
#         diagnostic_data = {
#             "database_status": "Connected",
#             "current_time": datetime.now().isoformat(),
            
#             # Patient diagnostics
#             "patients": {
#                 "total": total_patients,
#                 "with_admission_date": patients_with_admission,
#                 "without_discharge": active_patients,
#                 "recent_7_days": weekly_admissions,
#                 "today": today_admissions,
#                 "sample_data": recent_patients
#             },
            
#             # Appointment diagnostics
#             "appointments": {
#                 "total": total_appointments,
#                 "emergency": emergency_appointments,
#                 "today": today_appointments,
#                 "sample_data": recent_appointments
#             },
            
#             # Check if we have any data at all
#             "has_data": total_patients > 0 or total_appointments > 0
#         }
        
#         return diagnostic_data
        
#     except Exception as e:
#         return {"database_status": "Error", "error": str(e)}

# @router.get("/test-connection")
# async def test_connection():
#     """Test endpoint to verify dashboard is working"""
#     return {
#         "status": "success",
#         "message": "Dashboard API is working",
#         "timestamp": datetime.now().isoformat()
#     }

# @router.post("/create-sample-data")
# async def create_sample_data():
#     """Create sample data for testing"""
#     try:
#         from django.utils import timezone
#         from datetime import date
        
#         # Get or create department
#         department = await sync_to_async(lambda: (ensure_db_connection(), Department.objects.first())[1])()
#         if not department:
#             department = await sync_to_async(lambda: (ensure_db_connection(), Department.objects.create(
#                 name="General Medicine",
#                 status="active"
#             ))[1])()
        
#         # Get or create staff
#         staff = await sync_to_async(lambda: (ensure_db_connection(), Staff.objects.first())[1])()
#         if not staff:
#             staff = await sync_to_async(lambda: (ensure_db_connection(), Staff.objects.create(
#                 full_name="Dr. Test Doctor",
#                 phone="1234567890",
#                 email="doctor@test.com",
#                 designation="Doctor",
#                 department=department
#             ))[1])()
        
#         # Create sample patient with admission
#         patient = await sync_to_async(lambda: (ensure_db_connection(), Patient.objects.create(
#             full_name="Test Emergency Patient",
#             admission_date=date.today(),
#             phone_number="9876543210",
#             patient_unique_id="PAT_TEST001",
#             created_at=timezone.now()
#         ))[1])()
        
#         # Create emergency appointment
#         appointment = await sync_to_async(lambda: (ensure_db_connection(), Appointment.objects.create(
#             patient_name="Test Emergency Patient",
#             department=department,
#             staff=staff,
#             room_no="ER-101",
#             phone_no="9876543210",
#             appointment_type="emergency",
#             status="severe"
#         ))[1])()
        
#         # Create sample invoice
#         invoice = await sync_to_async(lambda: (ensure_db_connection(), HospitalInvoiceHistory.objects.create(
#             date=date.today(),
#             patient_name="Test Emergency Patient",
#             patient_id="PAT_TEST001",
#             department=department.name,
#             amount=2500.00,
#             payment_method="Cash",
#             status="Paid"
#         ))[1])()
        
#         return {
#             "status": "success",
#             "message": "Sample emergency data created",
#             "patient_id": patient.id,
#             "appointment_id": appointment.id,
#             "invoice_id": invoice.id
#         }
        
#     except Exception as e:
#         return {"status": "error", "message": str(e)}


# # fastapi_app/routers/dashboard.py
# from fastapi import APIRouter, HTTPException
# from django.db.models import Count, Q, Sum
# from django.db import models
# from datetime import datetime, timedelta
# from django.utils import timezone
# from datetime import datetime, timedelta, time

# import json
# from asgiref.sync import sync_to_async
# import asyncio

# from HMS_backend.models import (
#     Patient, Staff, Appointment, Department, 
#     LabReport, Bed, BedGroup, HospitalInvoiceHistory,
#     MedicineAllocation, Dispatch, Trip, Stock, BloodGroup, Surgery
# )

# from django.db import close_old_connections, connection

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

# router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# # =================== DASHBOARD COUNTING FUNCTIONS ===================

# @sync_to_async
# def get_patient_count():
#     ensure_db_connection()
#     return Patient.objects.count()

# @sync_to_async
# def get_active_patients():
#     ensure_db_connection()
#     # Active patients = admitted and not discharged
#     return Patient.objects.filter(
#         admission_date__isnull=False,
#         discharge_date__isnull=True
#     ).count()

# @sync_to_async
# def get_weekly_admissions():
#     ensure_db_connection()
#     today = timezone.now().date()
#     week_ago = today - timedelta(days=7)
#     return Patient.objects.filter(admission_date__date__gte=week_ago).count()

# @sync_to_async
# def get_today_admissions():
#     ensure_db_connection()
#     today = timezone.now().date()
#     return Patient.objects.filter(admission_date__date=today).count()

# @sync_to_async
# def get_today_patients():
#     """Today's patients - registered today OR have appointments today"""
#     ensure_db_connection()
#     today = timezone.now().date()
    
#     # Patients registered today
#     today_registered = Patient.objects.filter(created_at__date=today).count()
    
#     # Patients with appointments today
#     today_appointments = Appointment.objects.filter(appointment_date=today).count()
    
#     # Return the higher count (usually more meaningful)
#     return max(today_registered, today_appointments)

# @sync_to_async
# def get_priority_care():
#     ensure_db_connection()
#     # Priority care = patients with 'severe' status in appointments
#     return Appointment.objects.filter(status='severe').count()

# @sync_to_async
# def get_emergency_patients():
#     """Count patients with emergency casualty status OR emergency appointments"""
#     ensure_db_connection()
#     today = timezone.now().date()
    
#     # Method 1: Patients with emergency casualty status
#     emergency_casualty = Patient.objects.filter(
#         Q(casualty_status__icontains='emergency') |
#         Q(casualty_status__icontains='severe') |
#         Q(casualty_status__icontains='critical')
#     ).count()
    
#     # Method 2: Emergency appointments today
#     emergency_appointments = Appointment.objects.filter(
#         appointment_type='emergency',
#         appointment_date=today
#     ).count()
    
#     # Return the higher count to ensure we capture all emergencies
#     return max(emergency_casualty, emergency_appointments)

# @sync_to_async
# def get_appointment_count():
#     ensure_db_connection()
#     return Appointment.objects.count()

# @sync_to_async
# def get_today_appointments():
#     ensure_db_connection()
#     today = timezone.now().date()
#     return Appointment.objects.filter(appointment_date=today).count()

# @sync_to_async
# def get_emergency_cases():
#     ensure_db_connection()
#     today = timezone.now().date()
#     return Appointment.objects.filter(
#         appointment_type='emergency',
#         appointment_date=today
#     ).count()

# @sync_to_async
# def get_consultation_today():
#     ensure_db_connection()
#     today = timezone.now().date()
#     # Count appointments that are consultations (not surgeries)
#     return Appointment.objects.filter(
#         appointment_date=today
#     ).exclude(
#         appointment_type__icontains='surgery'
#     ).count()

# @sync_to_async
# def get_department_stats():
#     ensure_db_connection()
#     today = timezone.now().date()
#     return list(Appointment.objects.filter(
#         appointment_date=today
#     ).values('department__name').annotate(
#         count=Count('id')
#     ).order_by('-count'))

# @sync_to_async
# def get_total_revenue():
#     ensure_db_connection()
#     result = HospitalInvoiceHistory.objects.aggregate(total=Sum('amount'))
#     return float(result['total'] or 0)

# @sync_to_async
# def get_today_revenue():
#     ensure_db_connection()
#     today = timezone.now().date()
#     result = HospitalInvoiceHistory.objects.filter(date=today).aggregate(total=Sum('amount'))
#     return float(result['total'] or 0)

# @sync_to_async
# def get_outstanding_payments():
#     ensure_db_connection()
#     result = HospitalInvoiceHistory.objects.filter(status__in=['Unpaid', 'Pending']).aggregate(total=Sum('amount'))
#     return float(result['total'] or 0)

# @sync_to_async
# def get_pharmacy_revenue_today():
#     ensure_db_connection()
#     today = timezone.now().date()
#     try:
#         from HMS_backend.models import PharmacyInvoiceHistory
#         result = PharmacyInvoiceHistory.objects.filter(bill_date=today).aggregate(total=Sum('net_amount'))
#         return float(result['total'] or 0)
#     except Exception:
#         return 0.0

# # =================== SURGERY STATISTICS ===================

# @sync_to_async
# def get_total_surgeries():
#     ensure_db_connection()
#     now = timezone.now()
#     start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
#     if now.month == 12:
#         start_of_next_month = start_of_month.replace(year=now.year + 1, month=1)
#     else:
#         start_of_next_month = start_of_month.replace(month=now.month + 1)
    
#     return Surgery.objects.filter(
#         scheduled_date__gte=start_of_month,
#         scheduled_date__lt=start_of_next_month
#     ).count()

# @sync_to_async
# def get_today_surgeries():
#     ensure_db_connection()
#     today = timezone.localdate()
#     start = datetime.combine(today, time.min)
#     end = datetime.combine(today, time.max)
#     start = timezone.make_aware(start)
#     end = timezone.make_aware(end)
    
#     return Surgery.objects.filter(
#         scheduled_date__range=(start, end)
#     ).count()

# @sync_to_async
# def get_emergency_surgeries():
#     ensure_db_connection()
#     today = timezone.localdate()
#     start = datetime.combine(today, time.min)
#     end = datetime.combine(today, time.max)
#     start = timezone.make_aware(start)
#     end = timezone.make_aware(end)
    
#     # Emergency surgeries: either emergency status OR patient has emergency appointment
#     emergency_patient_ids = Appointment.objects.filter(
#         appointment_type='emergency',
#         appointment_date=today
#     ).values_list('patient_id', flat=True)
    
#     # Get surgery count
#     return Surgery.objects.filter(
#         Q(patient_id__in=emergency_patient_ids) |
#         Q(status='emergency') |
#         Q(surgery_type__icontains='emergency')
#     ).filter(
#         scheduled_date__range=(start, end)
#     ).count()

# @sync_to_async
# def get_success_rate():
#     ensure_db_connection()
#     today = timezone.now()
#     start_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
#     success_count = Surgery.objects.filter(
#         created_at__gte=start_of_month,
#         status="success"
#     ).count()
    
#     failed_count = Surgery.objects.filter(
#         created_at__gte=start_of_month,
#         status="failed"
#     ).count()
    
#     total_completed = success_count + failed_count
    
#     if total_completed == 0:
#         return 0
    
#     return round((success_count / total_completed) * 100, 1)

# # =================== RECENT ACTIVITIES ===================

# @sync_to_async
# def get_recent_patients():
#     ensure_db_connection()
#     return list(Patient.objects.order_by('-created_at')[:5].values('id', 'full_name', 'created_at', 'casualty_status'))

# @sync_to_async
# def get_recent_appointments():
#     ensure_db_connection()
#     return list(Appointment.objects.order_by('-created_at')[:5].values(
#         'id', 'patient_name', 'created_at', 'appointment_type', 'status'
#     ))

# @sync_to_async
# def get_recent_surgeries():
#     ensure_db_connection()
#     return list(Surgery.objects.order_by('-created_at')[:5].values(
#         'id', 'patient__full_name', 'surgery_type', 'status', 'created_at'
#     ))

# # =================== MAIN DASHBOARD ENDPOINT ===================

# @router.get("/stats")
# async def get_dashboard_stats():
#     """Get all dashboard statistics with real-time accurate counts"""
#     try:
#         print("📊 Fetching dashboard statistics...")
        
#         # Get all statistics concurrently for better performance
#         (
#             total_patients, active_patients, weekly_admissions, today_admissions,
#             today_patients, priority_care, emergency_patients, total_appointments,
#             today_appointments, emergency_cases, consultation_today, department_stats,
#             total_revenue, today_revenue, pharmacy_revenue_today, outstanding_payments,
#             total_surgeries, today_surgeries, emergency_surgeries, success_rate
#         ) = await asyncio.gather(
#             get_patient_count(),
#             get_active_patients(),
#             get_weekly_admissions(),
#             get_today_admissions(),
#             get_today_patients(),
#             get_priority_care(),
#             get_emergency_patients(),
#             get_appointment_count(),
#             get_today_appointments(),
#             get_emergency_cases(),
#             get_consultation_today(),
#             get_department_stats(),
#             get_total_revenue(),
#             get_today_revenue(),
#             get_pharmacy_revenue_today(),
#             get_outstanding_payments(),
#             get_total_surgeries(),
#             get_today_surgeries(),
#             get_emergency_surgeries(),
#             get_success_rate()
#         )
        
#         print(f"✅ Dashboard stats loaded: {total_patients} patients, {today_appointments} today appointments")
        
#         return {
#             "patient_stats": {
#                 "total_patients": total_patients,
#                 "active_patients": active_patients,
#                 "weekly_admissions": weekly_admissions,
#                 "priority_care": priority_care,
#                 "today_admissions": today_admissions,
#                 "today_patients": today_patients,
#                 "emergency_patients": emergency_patients
#             },
#             "appointment_stats": {
#                 "total_appointments": total_appointments,
#                 "today_appointments": today_appointments,
#                 "emergency_cases": emergency_cases,
#                 "consultation_today": consultation_today
#             },
#             "financial_stats": {
#                 "total_revenue": total_revenue,
#                 "today_revenue": today_revenue,
#                 "pharmacy_revenue_today": pharmacy_revenue_today,
#                 "outstanding_payments": outstanding_payments
#             },
#             "surgery_stats": {
#                 "total_surgeries": total_surgeries,
#                 "today_surgeries": today_surgeries,
#                 "emergency_surgeries": emergency_surgeries,
#                 "success_rate": success_rate
#             },
#             "department_distribution": department_stats,
#             "timestamp": timezone.now().isoformat(),
#             "data_status": "REAL_TIME"
#         }
        
#     except Exception as e:
#         print(f"❌ Dashboard stats error: {str(e)}")
#         import traceback
#         traceback.print_exc()
        
#         return {
#             "patient_stats": {
#                 "total_patients": 0,
#                 "active_patients": 0,
#                 "weekly_admissions": 0,
#                 "priority_care": 0,
#                 "today_admissions": 0,
#                 "today_patients": 0,
#                 "emergency_patients": 0
#             },
#             "appointment_stats": {
#                 "total_appointments": 0,
#                 "today_appointments": 0,
#                 "emergency_cases": 0,
#                 "consultation_today": 0
#             },
#             "financial_stats": {
#                 "total_revenue": 0.0,
#                 "today_revenue": 0.0,
#                 "pharmacy_revenue_today": 0.0,
#                 "outstanding_payments": 0.0
#             },
#             "surgery_stats": {
#                 "total_surgeries": 0,
#                 "today_surgeries": 0,
#                 "emergency_surgeries": 0,
#                 "success_rate": 0
#             },
#             "department_distribution": [],
#             "timestamp": timezone.now().isoformat(),
#             "data_status": "ERROR",
#             "error": str(e)
#         }

# @router.get("/recent-activities")
# async def get_recent_activities():
#     """Get recent activities for dashboard"""
#     try:
#         recent_activities = []
        
#         # Get recent data
#         recent_patients, recent_appointments, recent_surgeries = await asyncio.gather(
#             get_recent_patients(),
#             get_recent_appointments(),
#             get_recent_surgeries()
#         )
        
#         # Add patient activities
#         for patient in recent_patients[:3]:
#             activity_type = "error" if patient.get('casualty_status') and 'emergency' in str(patient['casualty_status']).lower() else "info"
#             recent_activities.append({
#                 "id": f"patient_{patient['id']}",
#                 "type": activity_type,
#                 "message": f"New patient registered: {patient['full_name']}",
#                 "timestamp": patient["created_at"],
#                 "read": False,
#                 "category": "patient"
#             })
        
#         # Add appointment activities
#         for appointment in recent_appointments[:3]:
#             activity_type = "error" if appointment.get('appointment_type') == 'emergency' else "info"
#             recent_activities.append({
#                 "id": f"appointment_{appointment['id']}",
#                 "type": activity_type,
#                 "message": f"New {appointment['appointment_type']} appointment: {appointment['patient_name']}",
#                 "timestamp": appointment["created_at"],
#                 "read": False,
#                 "category": "appointment"
#             })
        
#         # Add surgery activities
#         for surgery in recent_surgeries[:3]:
#             activity_type = "warning" if surgery['status'] == 'pending' else "success" if surgery['status'] == 'success' else "error"
#             recent_activities.append({
#                 "id": f"surgery_{surgery['id']}",
#                 "type": activity_type,
#                 "message": f"Surgery {surgery['surgery_type']} for {surgery['patient__full_name']}",
#                 "timestamp": surgery["created_at"],
#                 "read": False,
#                 "category": "surgery"
#             })
        
#         # Sort by timestamp
#         recent_activities.sort(key=lambda x: x["timestamp"], reverse=True)
        
#         # Format timestamps
#         for activity in recent_activities:
#             if isinstance(activity["timestamp"], str):
#                 try:
#                     activity["timestamp"] = datetime.fromisoformat(activity["timestamp"].replace('Z', '+00:00'))
#                 except:
#                     activity["timestamp"] = timezone.now()
#             activity["timestamp"] = activity["timestamp"].isoformat()
        
#         return recent_activities[:10]
        
#     except Exception as e:
#         print(f"Recent activities error: {e}")
#         return []

# @router.get("/test-connection")
# async def test_connection():
#     """Test endpoint to verify dashboard is working"""
#     return {
#         "status": "success",
#         "message": "Dashboard API is working",
#         "timestamp": timezone.now().isoformat()
#     }

# @router.get("/refresh")
# async def refresh_dashboard():
#     """Manual refresh endpoint for testing"""
#     try:
#         await get_dashboard_stats()
#         return {
#             "status": "success",
#             "message": "Dashboard refreshed successfully",
#             "timestamp": timezone.now().isoformat()
#         }
#     except Exception as e:
#         return {
#             "status": "error",
#             "message": f"Refresh failed: {str(e)}"
#         }

# @router.post("/trigger-update")
# async def trigger_dashboard_update():
#     """Trigger dashboard update (can be called from other services)"""
#     return {
#         "status": "success",
#         "message": "Dashboard update triggered",
#         "timestamp": timezone.now().isoformat()
#     }

# fastapi_app/routers/dashboard_improved.py
"""
Comprehensive Hospital Management Dashboard API
Provides real-time statistics for all hospital operations
"""

from fastapi import APIRouter, HTTPException
from django.db.models import Count, Q, Sum, Avg, F, Max, Min
from django.db import models
from datetime import datetime, timedelta, date, time
from django.utils import timezone
from asgiref.sync import sync_to_async
import asyncio

from HMS_backend.models import (
    Patient, Staff, Appointment, Department, 
    LabReport, Bed, BedGroup, HospitalInvoiceHistory,
    MedicineAllocation, Dispatch, Trip, Stock, 
    BloodGroup, Surgery, Donor, Payroll, PharmacyInvoiceHistory,
    TreatmentCharge
)

from django.db import close_old_connections, connection

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# =================== DATABASE CONNECTION MANAGEMENT ===================

def ensure_db_connection():
    """Ensure database connection is alive"""
    try:
        close_old_connections()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception:
        try:
            connection.close()
            connection.connect()
        except Exception as e:
            print(f"Database connection error: {e}")

# =================== PATIENT STATISTICS ===================

@sync_to_async
def get_patient_statistics():
    """Get comprehensive patient statistics"""
    ensure_db_connection()
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Total patients
    total_patients = Patient.objects.count()
    
    # Today's statistics
    today_registered = Patient.objects.filter(created_at__date=today).count()
    today_admitted = Patient.objects.filter(admission_date=today).count()
    today_discharged = Patient.objects.filter(discharge_date=today).count()
    
    # Active patients (admitted but not discharged)
    active_inpatients = Patient.objects.filter(
        admission_date__isnull=False,
        discharge_date__isnull=True
    ).count()
    
    # Weekly statistics
    weekly_registered = Patient.objects.filter(created_at__date__gte=week_ago).count()
    weekly_admitted = Patient.objects.filter(admission_date__gte=week_ago).count()
    weekly_discharged = Patient.objects.filter(discharge_date__gte=week_ago).count()
    
    # Monthly statistics
    monthly_registered = Patient.objects.filter(created_at__date__gte=month_ago).count()
    monthly_admitted = Patient.objects.filter(admission_date__gte=month_ago).count()
    monthly_discharged = Patient.objects.filter(discharge_date__gte=month_ago).count()
    
    # Emergency patients
    emergency_patients = Patient.objects.filter(
        Q(casualty_status__icontains='emergency') |
        Q(casualty_status__icontains='severe') |
        Q(casualty_status__icontains='critical')
    ).count()
    
    # Patient type distribution
    inpatients = Patient.objects.filter(patient_type='in-patient').count()
    outpatients = Patient.objects.filter(patient_type='out-patient').count()
    
    # Gender distribution
    gender_stats = Patient.objects.values('gender').annotate(count=Count('id'))
    
    # Age group distribution
    age_groups = {
        '0-18': Patient.objects.filter(age__lte=18).count(),
        '19-35': Patient.objects.filter(age__gt=18, age__lte=35).count(),
        '36-60': Patient.objects.filter(age__gt=35, age__lte=60).count(),
        '60+': Patient.objects.filter(age__gt=60).count(),
    }
    
    return {
        "total_patients": total_patients,
        "today": {
            "registered": today_registered,
            "admitted": today_admitted,
            "discharged": today_discharged,
            "net_change": today_admitted - today_discharged
        },
        "weekly": {
            "registered": weekly_registered,
            "admitted": weekly_admitted,
            "discharged": weekly_discharged
        },
        "monthly": {
            "registered": monthly_registered,
            "admitted": monthly_admitted,
            "discharged": monthly_discharged
        },
        "active_inpatients": active_inpatients,
        "emergency_patients": emergency_patients,
        "patient_types": {
            "inpatients": inpatients,
            "outpatients": outpatients
        },
        "gender_distribution": list(gender_stats),
        "age_groups": age_groups
    }

# =================== APPOINTMENT STATISTICS ===================

@sync_to_async
def get_appointment_statistics():
    """Get comprehensive appointment statistics"""
    ensure_db_connection()
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Total appointments
    total_appointments = Appointment.objects.count()
    
    # Today's appointments
    today_total = Appointment.objects.filter(appointment_date=today).count()
    today_completed = Appointment.objects.filter(
        appointment_date=today,
        status='completed'
    ).count()
    today_pending = Appointment.objects.filter(
        appointment_date=today,
        status__in=['new', 'normal', 'active']
    ).count()
    today_cancelled = Appointment.objects.filter(
        appointment_date=today,
        status='cancelled'
    ).count()
    
    # Weekly statistics
    weekly_total = Appointment.objects.filter(appointment_date__gte=week_ago).count()
    weekly_completed = Appointment.objects.filter(
        appointment_date__gte=week_ago,
        status='completed'
    ).count()
    
    # Monthly statistics
    monthly_total = Appointment.objects.filter(appointment_date__gte=month_ago).count()
    monthly_completed = Appointment.objects.filter(
        appointment_date__gte=month_ago,
        status='completed'
    ).count()
    
    # Emergency cases
    emergency_today = Appointment.objects.filter(
        appointment_date=today,
        appointment_type='emergency'
    ).count()
    emergency_total = Appointment.objects.filter(
        appointment_type='emergency'
    ).count()
    
    # Appointment type distribution
    type_distribution = Appointment.objects.values('appointment_type').annotate(
        count=Count('id')
    )
    
    # Status distribution for today
    status_distribution = Appointment.objects.filter(
        appointment_date=today
    ).values('status').annotate(count=Count('id'))
    
    # Department-wise appointments for today
    department_distribution = Appointment.objects.filter(
        appointment_date=today
    ).values('department__name').annotate(count=Count('id')).order_by('-count')
    
    return {
        "total_appointments": total_appointments,
        "today": {
            "total": today_total,
            "completed": today_completed,
            "pending": today_pending,
            "cancelled": today_cancelled,
            "emergency": emergency_today
        },
        "weekly": {
            "total": weekly_total,
            "completed": weekly_completed,
            "completion_rate": round((weekly_completed / weekly_total * 100) if weekly_total > 0 else 0, 1)
        },
        "monthly": {
            "total": monthly_total,
            "completed": monthly_completed,
            "completion_rate": round((monthly_completed / monthly_total * 100) if monthly_total > 0 else 0, 1)
        },
        "emergency_total": emergency_total,
        "type_distribution": list(type_distribution),
        "status_distribution": list(status_distribution),
        "department_distribution": list(department_distribution)
    }

# =================== SURGERY STATISTICS ===================

@sync_to_async
def get_surgery_statistics():
    """Get comprehensive surgery statistics"""
    ensure_db_connection()
    today = timezone.now().date()
    month_ago = today - timedelta(days=30)

    today_start = timezone.make_aware(datetime.combine(today, time.min))
    today_end = timezone.make_aware(datetime.combine(today, time.max))
    month_start = timezone.make_aware(datetime.combine(month_ago, time.min))

    # Total surgeries
    total_surgeries = Surgery.objects.count()

    # Today's surgeries
    today_total = Surgery.objects.filter(
        scheduled_date__range=(today_start, today_end)
    ).count()
    today_success = Surgery.objects.filter(
        scheduled_date__range=(today_start, today_end),
        status='success'
    ).count()
    today_completed = Surgery.objects.filter(
        scheduled_date__range=(today_start, today_end),
        status__in=['success', 'failed']
    ).count()
    today_pending = Surgery.objects.filter(
        scheduled_date__range=(today_start, today_end),
        status='pending'
    ).count()
    today_emergency = Surgery.objects.filter(
        status='emergency'
    ).count()

    # Monthly surgeries
    monthly_total = Surgery.objects.filter(scheduled_date__gte=month_start).count()
    monthly_success = Surgery.objects.filter(
        scheduled_date__gte=month_start,
        status='success'
    ).count()
    monthly_failed = Surgery.objects.filter(
        scheduled_date__gte=month_start,
        status='failed'
    ).count()
    monthly_emergency = Surgery.objects.filter(
        scheduled_date__gte=month_start,
        status='emergency'
    ).count()

    # Success rates
    monthly_completed = monthly_success + monthly_failed
    monthly_success_rate = round((monthly_success / monthly_completed * 100) if monthly_completed > 0 else 0, 1)

    # Overall success rate
    total_completed = Surgery.objects.filter(status__in=['success', 'failed']).count()
    total_success = Surgery.objects.filter(status='success').count()
    overall_success_rate = round((total_success / total_completed * 100) if total_completed > 0 else 0, 1)

    return {
        "total_surgeries": total_surgeries,
        "today": {
            "total": today_total,
            "success": today_success,
            "completed": today_completed,
            "pending": today_pending,
            "emergency": today_emergency,                    # ← Today's emergency surgeries
            "success_rate": round((today_success / today_completed * 100) if today_completed > 0 else 0, 1)
        },
        "monthly": {
            "total": monthly_total,
            "success": monthly_success,
            "failed": monthly_failed,
            "emergency": monthly_emergency,                  # ← Monthly emergency surgeries
            "success_rate": monthly_success_rate
        },
        "overall_success_rate": overall_success_rate,
        "emergency_surgeries": today_emergency,              # ← Default to today's count (recommended)
        "today_emergency_surgeries": today_emergency,
        "monthly_emergency_surgeries": monthly_emergency,
        "type_distribution": list(
            Surgery.objects.values('surgery_type')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
    }
# =================== FINANCIAL STATISTICS ===================

@sync_to_async
def get_financial_statistics():
    """Get comprehensive financial statistics"""
    ensure_db_connection()
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    year_ago = today - timedelta(days=365)
    
    # Hospital revenue
    total_revenue = HospitalInvoiceHistory.objects.aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    today_revenue = HospitalInvoiceHistory.objects.filter(
        date=today
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    weekly_revenue = HospitalInvoiceHistory.objects.filter(
        date__gte=week_ago
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    monthly_revenue = HospitalInvoiceHistory.objects.filter(
        date__gte=month_ago
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    yearly_revenue = HospitalInvoiceHistory.objects.filter(
        date__gte=year_ago
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Pharmacy revenue
    try:
        pharmacy_today = PharmacyInvoiceHistory.objects.filter(
            bill_date=today
        ).aggregate(total=Sum('net_amount'))['total'] or 0
        
        pharmacy_weekly = PharmacyInvoiceHistory.objects.filter(
            bill_date__gte=week_ago
        ).aggregate(total=Sum('net_amount'))['total'] or 0
        
        pharmacy_monthly = PharmacyInvoiceHistory.objects.filter(
            bill_date__gte=month_ago
        ).aggregate(total=Sum('net_amount'))['total'] or 0
    except:
        pharmacy_today = pharmacy_weekly = pharmacy_monthly = 0
    
    # Outstanding payments
    outstanding = HospitalInvoiceHistory.objects.filter(
        status__in=['Unpaid', 'Pending']
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Payment status distribution
    paid = HospitalInvoiceHistory.objects.filter(status='Paid').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    unpaid = HospitalInvoiceHistory.objects.filter(status='Unpaid').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    pending = HospitalInvoiceHistory.objects.filter(status='Pending').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # Treatment charges
    treatment_revenue = TreatmentCharge.objects.filter(
        status='BILLED'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    treatment_pending = TreatmentCharge.objects.filter(
        status='PENDING'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    return {
        "hospital_revenue": {
            "total": float(total_revenue),
            "today": float(today_revenue),
            "weekly": float(weekly_revenue),
            "monthly": float(monthly_revenue),
            "yearly": float(yearly_revenue)
        },
        "pharmacy_revenue": {
            "today": float(pharmacy_today),
            "weekly": float(pharmacy_weekly),
            "monthly": float(pharmacy_monthly)
        },
        "outstanding_payments": float(outstanding),
        "payment_status": {
            "paid": float(paid),
            "unpaid": float(unpaid),
            "pending": float(pending)
        },
        "treatment_charges": {
            "billed": float(treatment_revenue),
            "pending": float(treatment_pending)
        },
        "total_revenue": float(total_revenue + pharmacy_today)
    }

# =================== DEPARTMENT STATISTICS ===================

@sync_to_async
def get_department_statistics():
    """Get department-wise statistics"""
    ensure_db_connection()
    today = timezone.now().date()
    
    departments = Department.objects.all()
    department_stats = []
    
    for dept in departments:
        dept_data = {
            "id": dept.id,
            "name": dept.name,
            "status": dept.status,
            "patients": Patient.objects.filter(department=dept).count(),
            "today_appointments": Appointment.objects.filter(
                department=dept,
                appointment_date=today
            ).count(),
            "total_appointments": Appointment.objects.filter(department=dept).count(),
            "staff_count": Staff.objects.filter(department=dept).count(),
            "doctors": Staff.objects.filter(
                department=dept,
                designation__icontains='doctor'
            ).count(),
            "nurses": Staff.objects.filter(
                department=dept,
                designation__icontains='nurse'
            ).count()
        }
        department_stats.append(dept_data)
    
    return department_stats

# =================== STAFF STATISTICS ===================

@sync_to_async
def get_staff_statistics():
    """Get staff statistics"""
    ensure_db_connection()
    
    total_staff = Staff.objects.count()
    active_staff = Staff.objects.filter(status='Active').count()
    
    # Role distribution
    doctors = Staff.objects.filter(designation__icontains='doctor').count()
    nurses = Staff.objects.filter(designation__icontains='nurse').count()
    other_staff = total_staff - doctors - nurses
    
    # Top performing doctors by patient count
    top_doctors = list(Staff.objects.filter(
        designation__icontains='doctor'
    ).order_by('-total_patients_treated')[:5].values(
        'id', 'full_name', 'total_patients_treated', 'surgery_count', 'department__name'
    ))
    
    return {
        "total_staff": total_staff,
        "active_staff": active_staff,
        "role_distribution": {
            "doctors": doctors,
            "nurses": nurses,
            "other": other_staff
        },
        "top_doctors": top_doctors
    }

# =================== BED & ROOM STATISTICS ===================

@sync_to_async
def get_bed_statistics():
    """Get bed and room statistics"""
    ensure_db_connection()
    
    total_beds = Bed.objects.count()
    occupied_beds = Bed.objects.filter(is_occupied=True).count()
    available_beds = total_beds - occupied_beds
    occupancy_rate = round((occupied_beds / total_beds * 100) if total_beds > 0 else 0, 1)
    
    # Bed group statistics
    bed_groups = list(BedGroup.objects.all().values(
        'id', 'bedGroup', 'capacity', 'occupied', 'unoccupied', 'status'
    ))
    
    return {
        "total_beds": total_beds,
        "occupied": occupied_beds,
        "available": available_beds,
        "occupancy_rate": occupancy_rate,
        "bed_groups": bed_groups
    }

# =================== LAB & PHARMACY STATISTICS ===================

@sync_to_async
def get_lab_statistics():
    """Get laboratory statistics"""
    ensure_db_connection()
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    
    total_reports = LabReport.objects.count()
    today_reports = LabReport.objects.filter(created_at__date=today).count()
    weekly_reports = LabReport.objects.filter(created_at__date__gte=week_ago).count()
    
    # Status distribution
    pending = LabReport.objects.filter(status='pending').count()
    inprogress = LabReport.objects.filter(status='inprogress').count()
    completed = LabReport.objects.filter(status='completed').count()
    
    return {
        "total_reports": total_reports,
        "today": today_reports,
        "weekly": weekly_reports,
        "status": {
            "pending": pending,
            "inprogress": inprogress,
            "completed": completed
        }
    }

@sync_to_async
def get_pharmacy_statistics():
    """Get pharmacy statistics"""
    ensure_db_connection()
    
    total_medicines = Stock.objects.count()
    available = Stock.objects.filter(status='available').count()
    out_of_stock = Stock.objects.filter(status='outofstock').count()
    
    # Low stock items
    low_stock = Stock.objects.filter(quantity__lte=10, quantity__gt=0).count()
    
    # Total inventory value
    total_value = Stock.objects.aggregate(
        total=Sum(F('quantity') * F('unit_price'))
    )['total'] or 0
    
    return {
        "total_medicines": total_medicines,
        "available": available,
        "out_of_stock": out_of_stock,
        "low_stock": low_stock,
        "total_inventory_value": float(total_value)
    }

# =================== BLOOD BANK STATISTICS ===================

@sync_to_async
def get_blood_bank_statistics():
    """Get blood bank statistics"""
    ensure_db_connection()
    
    blood_groups = list(BloodGroup.objects.all().values(
        'blood_type', 'available_units', 'status'
    ))
    
    total_units = BloodGroup.objects.aggregate(
        total=Sum('available_units')
    )['total'] or 0
    
    low_stock_groups = BloodGroup.objects.filter(status='Low Stock').count()
    out_of_stock_groups = BloodGroup.objects.filter(status='Out of Stock').count()
    
    # Donor statistics
    total_donors = Donor.objects.count()
    eligible_donors = Donor.objects.filter(status='Eligible').count()
    
    return {
        "blood_groups": blood_groups,
        "total_units": total_units,
        "low_stock_groups": low_stock_groups,
        "out_of_stock_groups": out_of_stock_groups,
        "donors": {
            "total": total_donors,
            "eligible": eligible_donors
        }
    }

# =================== AMBULANCE STATISTICS ===================

@sync_to_async
def get_ambulance_statistics():
    """Get ambulance statistics"""
    ensure_db_connection()
    today = timezone.now().date()
    
    total_units = Trip.objects.values('unit').distinct().count()
    
    today_trips = Trip.objects.filter(created_at__date=today).count()
    total_trips = Trip.objects.count()
    
    # Status distribution
    completed = Trip.objects.filter(status='Completed').count()
    en_route = Trip.objects.filter(status='En Route').count()
    standby = Trip.objects.filter(status='Standby').count()
    
    return {
        "total_units": total_units,
        "today_trips": today_trips,
        "total_trips": total_trips,
        "status": {
            "completed": completed,
            "en_route": en_route,
            "standby": standby
        }
    }

# =================== MAIN DASHBOARD ENDPOINT ===================

@router.get("/comprehensive-stats")
async def get_comprehensive_dashboard_stats():
    """Get all comprehensive dashboard statistics"""
    try:
        print("📊 Fetching comprehensive dashboard statistics...")
        
        # Fetch all statistics concurrently
        (
            patient_stats,
            appointment_stats,
            surgery_stats,
            financial_stats,
            department_stats,
            staff_stats,
            bed_stats,
            lab_stats,
            pharmacy_stats,
            blood_bank_stats,
            ambulance_stats
        ) = await asyncio.gather(
            get_patient_statistics(),
            get_appointment_statistics(),
            get_surgery_statistics(),
            get_financial_statistics(),
            get_department_statistics(),
            get_staff_statistics(),
            get_bed_statistics(),
            get_lab_statistics(),
            get_pharmacy_statistics(),
            get_blood_bank_statistics(),
            get_ambulance_statistics()
        )
        
        print("✅ All dashboard statistics loaded successfully")
        
        return {
            "patients": patient_stats,
            "appointments": appointment_stats,
            "surgeries": surgery_stats,
            "financials": financial_stats,
            "departments": department_stats,
            "staff": staff_stats,
            "beds": bed_stats,
            "laboratory": lab_stats,
            "pharmacy": pharmacy_stats,
            "blood_bank": blood_bank_stats,
            "ambulance": ambulance_stats,
            "timestamp": timezone.now().isoformat(),
            "status": "success"
        }
        
    except Exception as e:
        print(f"❌ Error fetching dashboard statistics: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_dashboard_stats():
    """Simplified dashboard stats endpoint for compatibility"""
    try:
        comprehensive = await get_comprehensive_dashboard_stats()
        
        # Restructure for backward compatibility
        return {
            "patient_stats": {
                "total_patients": comprehensive["patients"]["total_patients"],
                "active_patients": comprehensive["patients"]["active_inpatients"],
                "weekly_admissions": comprehensive["patients"]["weekly"]["admitted"],
                "priority_care": comprehensive["patients"]["emergency_patients"],
                "today_admissions": comprehensive["patients"]["today"]["admitted"]
            },
            "appointment_stats": {
                "total_appointments": comprehensive["appointments"]["total_appointments"],
                "today_appointments": comprehensive["appointments"]["today"]["total"],
                "emergency_cases": comprehensive["appointments"]["today"]["emergency"],
                "consultation_today": comprehensive["appointments"]["today"]["total"]
            },
            "financial_stats": {
                "total_revenue": comprehensive["financials"]["hospital_revenue"]["total"],
                "today_revenue": comprehensive["financials"]["hospital_revenue"]["today"],
                "pharmacy_revenue_today": comprehensive["financials"]["pharmacy_revenue"]["today"],
                "outstanding_payments": comprehensive["financials"]["outstanding_payments"]
            },
            "surgery_stats": {
                "total_surgeries": comprehensive["surgeries"]["monthly"]["total"],
                "today_surgeries": comprehensive["surgeries"]["today"]["total"],
                "emergency_surgeries": comprehensive["surgeries"]["emergency_surgeries"],
                "success_rate": comprehensive["surgeries"]["overall_success_rate"]
            },
            "department_distribution": [
                {"department__name": dept["name"], "count": dept["today_appointments"]}
                for dept in comprehensive["departments"]
            ],
            "timestamp": comprehensive["timestamp"],
            "data_status": "REAL_TIME"
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test-connection")
async def test_connection():
    """Test endpoint"""
    return {
        "status": "success",
        "message": "Dashboard API is working",
        "timestamp": timezone.now().isoformat()
    }