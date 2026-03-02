from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, ValidationError, EmailStr
from typing import Optional, List
import os, django
from datetime import date, datetime, timedelta
from django.db import IntegrityError
import json
from dotenv import load_dotenv
from starlette.concurrency import run_in_threadpool
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
import asyncio
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import atexit

# Django setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "HMS_project.settings")
django.setup()
from HMS_backend.models import Donor, BloodGroup
from django.utils import timezone

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

router = APIRouter()
BASE_DIR = Path(__file__).resolve().parent.parent   # fastapi_app folder
load_dotenv(dotenv_path=BASE_DIR / ".env")

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 0))
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

print("✅ SMTP DEBUG:")
print("SMTP_SERVER =", SMTP_SERVER)
print("SMTP_PORT =", SMTP_PORT)
print("EMAIL_SENDER =", EMAIL_SENDER)
print("EMAIL_PASSWORD Loaded =", bool(EMAIL_PASSWORD))

if not all([SMTP_SERVER, SMTP_PORT, EMAIL_SENDER, EMAIL_PASSWORD]):
    raise RuntimeError("❌ SMTP environment variables are not set properly.")

# === Pydantic Schemas ===
class DonorSchema(BaseModel):
    donor_name: str
    gender: str
    blood_type: str
    phone: str
    email: Optional[str] = None
    last_donation_date: Optional[date] = None
    class Config:
        extra = "forbid"

class DonorResponse(BaseModel):
    id: int
    donor_name: str
    gender: str
    blood_type: str
    phone: str
    email: Optional[str]
    last_donation_date: Optional[date]
    status: str

# === Email Utility Functions ===
async def send_email(
    to_email: str,
    subject: str,
    body: str,
    html_body: Optional[str] = None
):
    """Generic email sending function"""
    try:
        msg = MIMEMultipart('alternative')
        msg["From"] = EMAIL_SENDER
        msg["To"] = to_email
        msg["Subject"] = subject

        # Add text version
        msg.attach(MIMEText(body, 'plain'))

        # Add HTML version if provided
        if html_body:
            msg.attach(MIMEText(html_body, 'html'))

        print(f"📨 SENDING EMAIL TO: {to_email}")
        print(f"SUBJECT: {subject}")

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_SENDER, to_email, msg.as_string())

        print(f"✅ EMAIL SENT SUCCESSFULLY TO: {to_email}")
        return True

    except Exception as e:
        print(f"❌ EMAIL FAILED for {to_email}: {str(e)}")
        return False

async def send_eligibility_email(donor_data):
    """Send email when donor becomes eligible"""
    if not donor_data.email:
        print(f"⚠️ No email for donor {donor_data.donor_name}")
        return False

    subject = "🎉 You're Now Eligible to Donate Blood!"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #e53935; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; background-color: #e53935; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }}
            .info-box {{ background-color: #fff; border-left: 4px solid #e53935; padding: 15px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Eligibility Update</h1>
                <h2>You Can Donate Blood Again!</h2>
            </div>
            
            <div class="content">
                <p>Dear <strong>{donor_data.donor_name}</strong>,</p>
                
                <p>Great news! You are now eligible to donate blood again.</p>
                
                <div class="info-box">
                    <h3>📋 Your Information:</h3>
                    <p><strong>Blood Type:</strong> {donor_data.blood_type}</p>
                    <p><strong>Eligibility Date:</strong> {datetime.now().strftime('%B %d, %Y')}</p>
                    <p><strong>Status:</strong> <span style="color: green;">✅ ELIGIBLE</span></p>
                </div>
                
                <p>Your blood type <strong>{donor_data.blood_type}</strong> is in constant demand and can save lives.</p>
                
                <h3>📍 Visit Us:</h3>
                <p>You can visit our blood bank during these hours:</p>
                <ul>
                    <li><strong>Monday - Friday:</strong> 8:00 AM - 8:00 PM</li>
                    <li><strong>Saturday - Sunday:</strong> 9:00 AM - 6:00 PM</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="mailto:{EMAIL_SENDER}" class="button">Schedule Your Donation</a>
                </div>
                
                <p><strong>Before donating, remember to:</strong></p>
                <ul>
                    <li>Get a good night's sleep</li>
                    <li>Eat a healthy meal before donation</li>
                    <li>Drink plenty of water</li>
                    <li>Bring a valid ID</li>
                </ul>
                
                <p>Thank you for being a lifesaver!</p>
                
                <p>Best regards,<br>
                <strong>Blood Bank Team</strong></p>
            </div>
            
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© {datetime.now().year} Blood Bank Management System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_body = f"""
    Dear {donor_data.donor_name},

    GREAT NEWS! You are now eligible to donate blood again.

    Your Information:
    - Blood Type: {donor_data.blood_type}
    - Eligibility Date: {datetime.now().strftime('%B %d, %Y')}
    - Status: ✅ ELIGIBLE

    Your blood type {donor_data.blood_type} is in constant demand and can save lives.

    Visit Us:
    - Monday - Friday: 8:00 AM - 8:00 PM
    - Saturday - Sunday: 9:00 AM - 6:00 PM

    Before donating, remember to:
    * Get a good night's sleep
    * Eat a healthy meal before donation
    * Drink plenty of water
    * Bring a valid ID

    Thank you for being a lifesaver!

    Best regards,
    Blood Bank Team

    ---
    This is an automated message. Please do not reply to this email.
    © {datetime.now().year} Blood Bank Management System.
    """

    return await send_email(donor_data.email, subject, text_body, html_body)

async def send_urgent_blood_request_email(
    donor_email: str,
    donor_name: str,
    blood_type: str,
    custom_message: Optional[str] = None
):
    """Send urgent blood request email"""
    subject = f"🚨 URGENT: Blood Donation Request - {blood_type}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #ff4444; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background-color: #fff5f5; padding: 30px; border-radius: 0 0 10px 10px; border-left: 4px solid #ff4444; border-right: 4px solid #ff4444; border-bottom: 4px solid #ff4444; }}
            .urgent {{ color: #ff4444; font-weight: bold; font-size: 18px; }}
            .button {{ display: inline-block; background-color: #ff4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }}
            .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 URGENT BLOOD REQUEST</h1>
                <h2>Your Blood Type {blood_type} is Needed!</h2>
            </div>
            
            <div class="content">
                <p class="urgent">⏰ IMMEDIATE ACTION REQUIRED</p>
                
                <p>Dear <strong>{donor_name}</strong>,</p>
                
                <p>We are facing a critical shortage of <strong>{blood_type}</strong> blood and urgently need your help.</p>
                
                <div style="background-color: #ffeaea; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>📅 Request Date:</strong> {datetime.now().strftime('%B %d, %Y %I:%M %p')}</p>
                    <p><strong>🩸 Blood Type Needed:</strong> {blood_type}</p>
                    <p><strong>📍 Location:</strong> Main Blood Bank Center</p>
                </div>
                
                {f'<p><strong>Additional Information:</strong><br>{custom_message}</p>' if custom_message else ''}
                
                <p>Your donation could save a life today. Every unit counts!</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="mailto:{EMAIL_SENDER}?subject=Urgent%20Blood%20Donation%20-%20{blood_type}" class="button">I Can Donate Today</a>
                </div>
                
                <p><strong>When visiting:</strong></p>
                <ul>
                    <li>Bring your ID card</li>
                    <li>Mention this urgent request</li>
                    <li>Ask for the emergency desk</li>
                </ul>
                
                <p>Thank you for your immediate response.</p>
                
                <p>Sincerely,<br>
                <strong>Emergency Blood Bank Team</strong></p>
            </div>
            
            <div class="footer">
                <p>This is an urgent automated request. For immediate assistance, call our emergency line.</p>
                <p>© {datetime.now().year} Blood Bank Emergency Services</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_body = f"""
    URGENT BLOOD REQUEST

    Dear {donor_name},

    We are facing a critical shortage of {blood_type} blood and urgently need your help.

    ⚠️ Request Date: {datetime.now().strftime('%B %d, %Y %I:%M %p')}
    🩸 Blood Type Needed: {blood_type}
    📍 Location: Main Blood Bank Center

    {custom_message if custom_message else ''}

    Your donation could save a life today. Every unit counts!

    When visiting:
    • Bring your ID card
    • Mention this urgent request
    • Ask for the emergency desk

    Thank you for your immediate response.

    Sincerely,
    Emergency Blood Bank Team

    ---
    This is an urgent automated request. For immediate assistance, call our emergency line.
    © {datetime.now().year} Blood Bank Emergency Services.
    """

    return await send_email(donor_email, subject, text_body, html_body)

# === Scheduled Task for Automatic Eligibility Checks ===
class DonorScheduler:
    """Handles scheduled tasks for donor eligibility notifications"""
    
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.setup_scheduler()
    
    def setup_scheduler(self):
        """Setup scheduled tasks"""
        # Check eligibility and send emails every day at 9 AM
        self.scheduler.add_job(
            self.check_and_notify_eligible_donors,
            CronTrigger(hour=9, minute=0),
            id='eligibility_check',
            name='Daily eligibility check and email notification',
            replace_existing=True
        )
        
        # Additional check at 3 PM
        self.scheduler.add_job(
            self.check_and_notify_eligible_donors,
            CronTrigger(hour=15, minute=0),
            id='afternoon_check',
            name='Afternoon eligibility check',
            replace_existing=True
        )
    
    def start(self):
        """Start the scheduler"""
        if not self.scheduler.running:
            self.scheduler.start()
            print("✅ Donor eligibility scheduler started")
            atexit.register(self.shutdown)
    
    def shutdown(self):
        """Shutdown the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            print("✅ Donor eligibility scheduler stopped")
    
    async def check_and_notify_eligible_donors(self):
        """Check all donors for eligibility and send notifications"""
        try:
            print("🔄 Running automatic eligibility check...")
            
            donors = await run_in_threadpool(lambda: (ensure_db_connection(), list(Donor.objects.all()))[1])
            
            notifications_sent = 0
            for donor in donors:
                old_status = donor.status
                donor.check_eligibility()
                
                # If status changed from "Not Eligible" to "Eligible"
                if old_status == "Not Eligible" and donor.status == "Eligible":
                    # Send email notification
                    if donor.email:
                        success = await send_eligibility_email(donor)
                        if success:
                            notifications_sent += 1
                            print(f"✅ Eligibility email sent to {donor.donor_name} ({donor.email})")
                        else:
                            print(f"❌ Failed to send email to {donor.donor_name}")
                    
                    # Also send notification via NotificationService if available
                    await safe_send_donor_notification(
                        "became_eligible",
                        donor,
                        old_status=old_status,
                        new_status=donor.status
                    )
            
            print(f"✅ Automatic check completed. Sent {notifications_sent} email(s).")
            
        except Exception as e:
            print(f"❌ Error in automatic eligibility check: {str(e)}")

# Initialize scheduler
donor_scheduler = DonorScheduler()

# Start scheduler when module loads
donor_scheduler.start()

# === Helper function for donor notifications ===
async def safe_send_donor_notification(notification_type: str, donor_data, old_status=None, new_status=None, units_donated=None, patient_name=None, units_needed=None):
    """Safely send donor notifications with error handling"""
    try:
        print(f"🔔 [DONOR] Starting {notification_type} notification for: {donor_data.donor_name if hasattr(donor_data, 'donor_name') else donor_data.get('donor_name', 'Unknown')}")
       
        from ..routers.notifications import NotificationService
       
        if notification_type == "registered":
            await NotificationService.send_donor_registered(donor_data)
        elif notification_type == "updated":
            await NotificationService.send_donor_updated(donor_data)
        elif notification_type == "deleted":
            await NotificationService.send_donor_deleted(donor_data)
        elif notification_type == "eligibility_changed" and old_status and new_status:
            await NotificationService.send_donor_eligibility_changed(donor_data, old_status, new_status)
        elif notification_type == "donation_received" and units_donated is not None:
            await NotificationService.send_donation_received(donor_data, units_donated)
        elif notification_type == "became_eligible":
            await NotificationService.send_donor_became_eligible(donor_data)
        elif notification_type == "urgent_request" and units_needed:
            await NotificationService.send_urgent_blood_request(donor_data, units_needed, patient_name)
           
        print(f"✅ [DONOR] {notification_type} notification sent successfully")
           
    except ImportError as e:
        print(f"❌ [DONOR] NotificationService not available: {e}")
    except Exception as e:
        print(f"❌ [DONOR] Failed to send {notification_type} notification: {e}")

# === ADD DONOR ===
@router.post("/api/donors/add", response_model=DonorResponse)
async def add_donor(request: Request):
    body = await request.json()
    try:
        data = DonorSchema(**body)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
    
    def create_donor():
        ensure_db_connection()
        try:
            from django.db import transaction
           
            with transaction.atomic():
                # Check for duplicate phone
                if Donor.objects.filter(phone=data.phone).exists():
                    return {"error": "PHONE_EXISTS"}
               
                # Check for duplicate email if provided
                if data.email and Donor.objects.filter(email=data.email).exists():
                    return {"error": "EMAIL_EXISTS"}
               
                donor = Donor.objects.create(
                    donor_name=data.donor_name,
                    gender=data.gender,
                    blood_type=data.blood_type,
                    phone=data.phone,
                    email=data.email if data.email else None,
                    last_donation_date=data.last_donation_date,
                )
               
                # Check eligibility (will set status based on dates)
                donor.check_eligibility()
                return donor
               
        except IntegrityError as e:
            if "phone" in str(e).lower():
                return {"error": "PHONE_EXISTS"}
            elif "email" in str(e).lower():
                return {"error": "EMAIL_EXISTS"}
            return {"error": "DATABASE_ERROR"}
        except Exception as e:
            if "is not a valid choice" in str(e):
                field = (
                    "blood_type" if "blood_type" in str(e) else
                    "gender" if "gender" in str(e) else
                    "status"
                )
                return {"error": f"INVALID_CHOICE:{field}"}
            return {"error": "SAVE_FAILED"}
    
    try:
        result = await run_in_threadpool(create_donor)
       
        if isinstance(result, dict) and "error" in result:
            error_msg = result["error"]
            if error_msg == "PHONE_EXISTS":
                raise HTTPException(
                    status_code=400,
                    detail="Phone number already exists. Please use a unique phone."
                )
            elif error_msg == "EMAIL_EXISTS":
                raise HTTPException(
                    status_code=400,
                    detail="Email already exists. Please use a unique email."
                )
            elif error_msg == "DATABASE_ERROR":
                raise HTTPException(status_code=400, detail="Database constraint violated.")
            elif error_msg.startswith("INVALID_CHOICE:"):
                field = error_msg.split(":")[1]
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid value for {field}. Please select from allowed options."
                )
            elif error_msg == "SAVE_FAILED":
                raise HTTPException(status_code=500, detail="Failed to save donor.")
            else:
                raise HTTPException(status_code=500, detail="Unknown error occurred.")
       
        # Success - send registration notification
        donor = result
        await safe_send_donor_notification("registered", donor)
       
        # If donor is already eligible, send email immediately
        if donor.status == "Eligible" and donor.email:
            await send_eligibility_email(donor)
       
        return DonorResponse(
            id=donor.id,
            donor_name=donor.donor_name,
            gender=donor.gender,
            blood_type=donor.blood_type,
            phone=donor.phone,
            email=donor.email,
            last_donation_date=donor.last_donation_date,
            status=donor.status,
        )
       
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in add_donor: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# === FETCH DONORS ===
@router.get("/api/donors/list", response_model=List[DonorResponse])
async def fetch_donors():
    def get_all():
        ensure_db_connection()
        donors = Donor.objects.all()
        # Check eligibility for all donors before returning
        for donor in donors:
            donor.check_eligibility()
       
        return [
            DonorResponse(
                id=d.id,
                donor_name=d.donor_name,
                gender=d.gender,
                blood_type=d.blood_type,
                phone=d.phone,
                email=d.email,
                last_donation_date=d.last_donation_date,
                status=d.status,
            )
            for d in donors
        ]
    return await run_in_threadpool(get_all)

# === GET SINGLE DONOR ===
@router.get("/api/donors/{donor_id}", response_model=DonorResponse)
async def get_donor(donor_id: int):
    def get_donor_by_id():
        ensure_db_connection()
        try:
            donor = Donor.objects.get(id=donor_id)
            donor.check_eligibility() # Update eligibility before returning
            return donor
        except Donor.DoesNotExist:
            raise HTTPException(status_code=404, detail="Donor not found")
    try:
        donor = await run_in_threadpool(get_donor_by_id)
        return DonorResponse(
            id=donor.id,
            donor_name=donor.donor_name,
            gender=donor.gender,
            blood_type=donor.blood_type,
            phone=donor.phone,
            email=donor.email,
            last_donation_date=donor.last_donation_date,
            status=donor.status,
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting donor: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# === EDIT DONOR ===
@router.put("/api/donors/{donor_id}", response_model=DonorResponse)
async def edit_donor(donor_id: int, request: Request):
    body = await request.json()
    print(f"🟡 Editing donor {donor_id} with data: {body}")
    try:
        data = DonorSchema(**body)
    except ValidationError as e:
        print(f"❌ Validation error: {e.errors()}")
        raise HTTPException(status_code=422, detail=e.errors())
    
    def update():
        ensure_db_connection()
        try:
            donor = Donor.objects.get(id=donor_id)
            print(f"🟡 Found donor: {donor.donor_name} (ID: {donor.id})")
           
            # Store old status for notification
            old_status = donor.status
           
            # Check for duplicate phone (excluding current donor)
            if Donor.objects.filter(phone=data.phone).exclude(id=donor_id).exists():
                return {"error": "PHONE_EXISTS"}
           
            # Check for duplicate email (excluding current donor)
            if data.email and Donor.objects.filter(email=data.email).exclude(id=donor_id).exists():
                return {"error": "EMAIL_EXISTS"}
           
            # Update fields
            donor.donor_name = data.donor_name
            donor.gender = data.gender
            donor.blood_type = data.blood_type
            donor.phone = data.phone
            donor.email = data.email if data.email else None
            donor.last_donation_date = data.last_donation_date
           
            donor.save()
           
            # Recalculate eligibility after updating dates
            donor.check_eligibility()
           
            print(f"✅ Donor {donor_id} updated successfully")
            return donor, old_status
           
        except Donor.DoesNotExist:
            print(f"❌ Donor {donor_id} not found")
            raise HTTPException(status_code=404, detail="Donor not found.")
        except IntegrityError as e:
            print(f"❌ Integrity error: {str(e)}")
            if "phone" in str(e).lower():
                return {"error": "PHONE_EXISTS"}
            elif "email" in str(e).lower():
                return {"error": "EMAIL_EXISTS"}
            raise HTTPException(status_code=400, detail="Database constraint error.")
        except Exception as e:
            print(f"❌ Error updating donor: {str(e)}")
            if "is not a valid choice" in str(e):
                raise HTTPException(status_code=400, detail="Invalid value for blood type or gender.")
            return {"error": "SAVE_FAILED"}
    
    try:
        result = await run_in_threadpool(update)
       
        if isinstance(result, tuple):
            donor, old_status = result
           
            # Determine what type of notification to send
            if old_status != donor.status:
                # Status changed - check if became eligible
                if donor.status == "Eligible" and donor.email:
                    # Send eligibility email
                    await send_eligibility_email(donor)
                
                # Send notification
                await safe_send_donor_notification("eligibility_changed", donor, old_status, donor.status)
            else:
                # Regular update, no status change
                await safe_send_donor_notification("updated", donor)
           
            return DonorResponse(
                id=donor.id,
                donor_name=donor.donor_name,
                gender=donor.gender,
                blood_type=donor.blood_type,
                phone=donor.phone,
                email=donor.email,
                last_donation_date=donor.last_donation_date,
                status=donor.status,
            )
        else:
            error_msg = result["error"]
            if error_msg == "PHONE_EXISTS":
                raise HTTPException(
                    status_code=400,
                    detail="Phone number already exists. Please use a unique phone."
                )
            elif error_msg == "EMAIL_EXISTS":
                raise HTTPException(
                    status_code=400,
                    detail="Email already exists. Please use a unique email."
                )
            elif error_msg == "SAVE_FAILED":
                raise HTTPException(status_code=500, detail="Failed to update donor.")
            else:
                raise HTTPException(status_code=500, detail="Unknown error occurred.")
               
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in edit_donor: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# === DELETE DONOR ===
@router.delete("/api/donors/{donor_id}")
async def delete_donor(donor_id: int):
    def delete():
        ensure_db_connection()
        try:
            donor = Donor.objects.get(id=donor_id)
            # Store donor data for notification before deletion
            donor_data = {
                'id': donor.id,
                'donor_name': donor.donor_name,
                'blood_type': donor.blood_type,
                'phone': donor.phone,
                'email': donor.email,
                'status': donor.status
            }
            donor.delete()
            return donor_data 
        except Donor.DoesNotExist:
            raise HTTPException(status_code=404, detail="Donor not found.")
    try:
        donor_data = await run_in_threadpool(delete)
        # Send deletion notification
        await safe_send_donor_notification("deleted", donor_data)
        return {"success": True, "message": "Donor deleted successfully"}
    except HTTPException:
        raise

# === RECORD DONATION ===
@router.post("/api/donors/{donor_id}/record-donation")
async def record_donation(donor_id: int, units_donated: int):
    def record():
        ensure_db_connection()
        try:
            donor = Donor.objects.get(id=donor_id)
           
            # Store old status
            old_status = donor.status
           
            # Update last donation date
            from datetime import date
            donor.last_donation_date = date.today()
           
            # Save and check eligibility (will set to Not Eligible since just donated)
            donor.save()
            donor.check_eligibility()
           
            return donor, old_status, units_donated
        except Donor.DoesNotExist:
            raise HTTPException(status_code=404, detail="Donor not found.")
    
    try:
        donor, old_status, units = await run_in_threadpool(record)
       
        # Send donation received notification
        await safe_send_donor_notification("donation_received", donor, units_donated=units)
       
        # Send eligibility change notification if status changed
        if old_status != donor.status:
            await safe_send_donor_notification("eligibility_changed", donor, old_status, donor.status)
       
        # Also update corresponding blood group
        try:
            blood_group = await run_in_threadpool(lambda: (ensure_db_connection(), BloodGroup.objects.get(blood_type=donor.blood_type))[1])
            old_units = blood_group.available_units
            blood_group.available_units += units
            await run_in_threadpool(lambda: (ensure_db_connection(), blood_group.save())[1])
           
            # Send blood stock update notification
            from Fastapi_app.routers.add_bloodgroup import safe_send_blood_notification
            blood_group_data = {
                'id': blood_group.id,
                'blood_type': blood_group.blood_type,
                'available_units': blood_group.available_units,
                'status': blood_group.status
            }
            await safe_send_blood_notification("stock_updated", blood_group_data, old_units, blood_group.available_units)
            await safe_send_blood_notification("donation_received", blood_group_data, units_received=units)
           
        except BloodGroup.DoesNotExist:
            print(f"⚠️ No blood group found for type: {donor.blood_type}")
       
        return {"success": True, "message": f"Donation of {units} units recorded successfully"}
    except HTTPException:
        raise

# === SEND URGENT BLOOD REQUEST ===
@router.post("/api/donors/send-urgent-request")
async def send_urgent_request_to_donor(request: Request):
    try:
        body = await request.json()

        donor_id = body.get("donor_id")
        donor_email = body.get("donor_email")
        donor_name = body.get("donor_name")
        blood_type = body.get("blood_type")
        custom_message = body.get("message")

        if not all([donor_id, donor_email, donor_name, blood_type]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        success = await send_urgent_blood_request_email(
            donor_email=donor_email,
            donor_name=donor_name,
            blood_type=blood_type,
            custom_message=custom_message
        )

        if not success:
            raise HTTPException(status_code=500, detail="Failed to send email")

        log_data = {
            "donor_id": donor_id,
            "email": donor_email,
            "sent_at": datetime.now().isoformat()
        }

        print("📧 LOG:", json.dumps(log_data))

        return {
            "success": True,
            "message": "Urgent blood request sent successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === CHECK ALL DONORS ELIGIBILITY ===
@router.post("/api/donors/check-eligibility")
async def check_all_donors_eligibility():
    """Endpoint to manually trigger eligibility check for all donors"""
    def check_eligibility():
        ensure_db_connection()
        donors = Donor.objects.all()
        status_changes = []
       
        for donor in donors:
            old_status = donor.status
            donor.check_eligibility()
           
            if old_status != donor.status:
                status_changes.append({
                    'donor_id': donor.id,
                    'donor_name': donor.donor_name,
                    'old_status': old_status,
                    'new_status': donor.status
                })
       
        return status_changes
   
    try:
        changes = await run_in_threadpool(check_eligibility)
       
        # Send notifications and emails for status changes
        for change in changes:
            donor = await run_in_threadpool(lambda: (ensure_db_connection(), Donor.objects.get(id=change['donor_id']))[1])
            
            # If donor became eligible, send email
            if change['new_status'] == "Eligible" and donor.email:
                await send_eligibility_email(donor)
            
            await safe_send_donor_notification(
                "eligibility_changed",
                donor,
                change['old_status'],
                change['new_status']
            )
           
        return {
            "success": True,
            "message": f"Eligibility checked for all donors. {len(changes)} status changes detected.",
            "changes": changes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check eligibility: {str(e)}")

# === TEST EMAIL ENDPOINT ===
@router.post("/api/donors/test-email")
async def test_donor_email():
    """Endpoint to test donor email functionality"""
    test_donor = {
        "donor_name": "Test Donor",
        "email": "sravannaala@gmail.com",  # Replace with actual test email
        "blood_type": "O+",
        "status": "Eligible"
    }
    
    success = await send_eligibility_email(type('Donor', (), test_donor)())
    
    if success:
        return {"success": True, "message": "Test email sent successfully"}
    else:
        return {"success": False, "message": "Failed to send test email"}