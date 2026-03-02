# fastapi_app/routers/hospital_billing.py
import asyncio
import json
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, EmailStr
from django.db.models import F, Count

from HMS_backend.models import (
    HospitalInvoiceHistory, 
    HospitalInvoiceItem, 
    Patient,
    PatientHistory,
    TreatmentCharge,
    PartialPaymentHistory  # NEW: Import PartialPaymentHistory
)
from datetime import date, datetime
from typing import List, Optional, Dict, Any
from decimal import Decimal
import csv
import io
import openpyxl
import os
import tempfile
from zipfile import ZipFile
import time
from asgiref.sync import sync_to_async, async_to_sync
from django.db import transaction
from django.utils import timezone
from django.db.models import Sum
# Import NotificationService
from Fastapi_app.routers.notifications import NotificationService

# Jinja2 + WeasyPrint for PDF generation
from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML

# Paths for PDF generation
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APP_DIR = os.path.join(BASE_DIR, "Fastapi_app")
TEMPLATE_DIR = os.path.join(APP_DIR, "frontend")
PDF_OUTPUT_DIR = os.path.join(APP_DIR, "invoices_generator")
os.makedirs(PDF_OUTPUT_DIR, exist_ok=True)

# Jinja2 environment
env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(["html", "xml"])
)

try:
    from num2words import num2words
except ImportError:
    num2words = None

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

router = APIRouter(prefix="/hospital-billing", tags=["Hospital Billing Management"])

# -------------------------------
# Pydantic Schemas
# -------------------------------
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import date
from decimal import Decimal


# -----------------------------
# Invoice Items
# -----------------------------
class InvoiceItemIn(BaseModel):
    description: str
    quantity: int
    unit_price: Decimal


class InvoiceItemSchema(BaseModel):
    s_no: int
    description: str
    quantity: int
    unit_price: float
    amount: float

    class Config:
        from_attributes = True


# -----------------------------
# Partial Payment
# -----------------------------
class PartialPaymentData(BaseModel):
    """Schema for partial payment information"""
    paid_amount: Decimal
    due_date: Optional[date] = None
    remarks: Optional[str] = None


class PartialPaymentSchema(BaseModel):
    """Schema for partial payment history response"""
    payment_number: int
    payment_date: str
    amount_paid: float
    payment_method: str
    transaction_id: Optional[str]
    remarks: Optional[str]
    created_at: str


class AddPartialPaymentRequest(BaseModel):
    """Request to add a new partial payment to existing invoice"""
    amount_paid: Decimal
    payment_method: str
    transaction_id: Optional[str] = None
    remarks: Optional[str] = None


# -----------------------------
# Consolidate Invoice
# -----------------------------
class ConsolidateInvoiceItem(BaseModel):
    invoice_id: str
    date: str
    amount: float

    # NEW: extra breakup for consolidate
    subtotal: float
    discount_amount: float = 0.0
    tax_net_amount: float = 0.0

    cgst_amount: float = 0.0
    sgst_amount: float = 0.0
    total_tax: float = 0.0

    items: List[Dict[str, Any]]


class ConsolidateInvoiceCreateIn(BaseModel):
    patient_id: str
    patient_name: str
    invoice_ids: List[str]
    generated_date: Optional[str] = None
    billing_staff: Optional[str] = None
    billing_staff_id: Optional[str] = None


class InvoiceIds(BaseModel):
    ids: List[str]


# -----------------------------
# MAIN Invoice Create Schema
# -----------------------------
class InvoiceCreateIn(BaseModel):
    date: date
    patient_name: str
    patient_id: str
    department: str

    payment_method: str = "Cash"
    status: str = "Paid"
    payment_type: str = "Full Payment"

    admission_date: date
    discharge_date: Optional[date] = None
    doctor: str = "N/A"

    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None

    invoice_items: List[InvoiceItemIn]

    # -----------------------------
    # Discount Fields
    # -----------------------------
    discount_percent: Decimal = Decimal("0.00")

    # -----------------------------
    # GST Fields
    # -----------------------------
    cgst_percent: Decimal = Decimal("0.00")
    sgst_percent: Decimal = Decimal("0.00")

    # Backward compatibility
    tax_percent: Optional[Decimal] = None

    transaction_id: Optional[str] = None
    payment_date: Optional[date] = None
    treatment_charge_ids: Optional[List[int]] = None

    partial_payment: Optional[PartialPaymentData] = None

    settle_invoice_ids: Optional[List[str]] = None

# -----------------------------
# Invoice Detail Schema
# -----------------------------
class InvoiceDetailSchema(BaseModel):
    invoice_id: str
    date: str
    patient_name: str
    patient_id: str
    department: str

    amount: float
    payment_method: str
    status: str
    payment_type: str

    admission_date: Optional[str] = None
    discharge_date: Optional[str] = None
    doctor: str
    phone: str
    email: str
    address: str

    # -----------------------------
    # NEW: Amount Breakup
    # -----------------------------
    subtotal: float

    discount_percent: float = 0.0
    discount_amount: float = 0.0

    tax_net_amount: float = 0.0

    cgst_percent: float = 0.0
    cgst_amount: float = 0.0

    sgst_percent: float = 0.0
    sgst_amount: float = 0.0

    total_tax: float = 0.0
    grand_total: float

    # -----------------------------
    # Partial Payment Fields
    # -----------------------------
    paid_amount: float = 0.0
    pending_amount: float = 0.0
    due_date: Optional[str] = None
    payment_remarks: Optional[str] = None
    payment_progress: float = 0.0

    items: List[InvoiceItemSchema] = []
    partial_payments: List[PartialPaymentSchema] = []

    class Config:
        from_attributes = True


# -----------------------------
# Invoice List Schema
# -----------------------------
class InvoiceListSchema(BaseModel):
    invoice_id: str
    date: str
    patient_name: str
    patient_id: str
    department: str

    amount: float
    payment_method: str
    status: str
    payment_type: str

    paid_amount: float = 0.0
    pending_amount: float = 0.0

    class Config:
        from_attributes = True


# -----------------------------
# Treatment Charge Schemas
# -----------------------------
class TreatmentChargeSchema(BaseModel):
    id: Optional[int] = None
    description: str
    quantity: int
    unit_price: float
    discount_percent: float   # new
    tax_percent: float         # new
    amount: float
    status: str
    created_at: Optional[str] = None

    # NEW: partial billing breakup
    billed_amount: float = 0.0
    remaining_amount: float = 0.0

    class Config:
        from_attributes = True


class PatientTreatmentChargesResponse(BaseModel):
    patient_id: str
    patient_name: str
    charges: List[TreatmentChargeSchema]

    total_pending: float
    total_billed: float

    previous_balances: Optional[Dict[str, Any]] = None
    overall_total: Optional[float] = None

    class Config:
        from_attributes = True


# -----------------------------
# Simple Update Schemas
# -----------------------------
class StatusUpdate(BaseModel):
    status: str


class TreatmentChargeUpdateIn(BaseModel):
    description: Optional[str] = None
    quantity: Optional[int] = None
    discount_percent: Optional[Decimal] = None
    tax_percent: Optional[Decimal] = None

class MarkPaidIn(BaseModel):
    payment_method: Optional[str] = None
    remarks: Optional[str] = None


class SettleInvoicesIn(BaseModel):
    patient_id: str
    invoice_ids: List[str]
    payment_method: Optional[str] = "Cash"
    transaction_id: Optional[str] = None
    remarks: Optional[str] = None

class TreatmentChargeCreate(BaseModel):
    patient_id: int
    description: str
    quantity: int = 1
    unit_price: float
    amount: Optional[float] = None

    # ✅ NEW FIELDS
    discount_percent: float = 0
    tax_percent: float = 0

    status: str = "PENDING"


# -------------------------------
# Helper Functions
# -------------------------------
def delayed_remove(file_path: str, delay: int = 5):
    time.sleep(delay)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Failed to delete temp file {file_path}: {e}")


async def get_department_name(patient_id: str) -> str:
    @sync_to_async
    def fetch_dept():
        ensure_db_connection()
        try:
            patient = Patient.objects.select_related("department").get(
                patient_unique_id=patient_id
            )
            return patient.department.name if patient.department else "General"
        except:
            return "Unknown"

    return await fetch_dept()


def format_date(date_obj) -> str:
    if not date_obj:
        return "-"
    try:
        return date_obj.isoformat() if hasattr(date_obj, "isoformat") else str(date_obj)
    except:
        return str(date_obj)


async def get_invoice_data(invoice):
    dept = invoice.department or "Unknown"
    @sync_to_async
    def fetch_patient():
        ensure_db_connection()
        try:
            patient = Patient.objects.get(patient_unique_id=invoice.patient_id)
            return patient
        except Patient.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error getting patient for {invoice.patient_id}: {e}")
            return None

    patient = await fetch_patient()
    if patient and patient.department:
        dept = patient.department.name

    try:
        date_str = invoice.date.isoformat()
    except:
        date_str = str(invoice.date)

    return {
        "invoice_id": invoice.invoice_id,
        "date": date_str,
        "patient_name": invoice.patient_name,
        "patient_id": invoice.patient_id,
        "department": dept,
        "amount": float(invoice.amount),
        "payment_method": invoice.payment_method or "-",
        "status": invoice.status,
        "payment_type": invoice.payment_type,  # NEW: Added payment_type
        "paid_amount": float(invoice.paid_amount),  # NEW: Added paid_amount
        "pending_amount": float(invoice.pending_amount),  # NEW: Added pending_amount
    }


def amount_to_words(amount: Decimal) -> str:
    if num2words:
        try:
            return f"{num2words(float(amount), lang='en_IN').title()} Rupees Only"
        except:
            pass
    return f"{amount:.2f} Rupees Only"


# NEW: Get patient pending balance function
async def get_patient_pending_balance(patient_id: str) -> Dict[str, Any]:
    """Get total pending balance for a patient from all partial payment invoices"""
    @sync_to_async
    def calculate_balance():
        ensure_db_connection()
        
        # Get all partial payment invoices for this patient
        partial_invoices = HospitalInvoiceHistory.objects.filter(
            patient_id=patient_id,
            payment_type="Partial Payment",
            status__in=["Partially Paid", "Pending"]
        )
        
        total_pending = Decimal("0")
        invoice_details = []
        
        for inv in partial_invoices:
            if inv.pending_amount > 0:
                total_pending += inv.pending_amount
                invoice_details.append({
                    "invoice_id": inv.invoice_id,
                    "date": inv.date,
                    "pending_amount": float(inv.pending_amount),
                    "due_date": inv.due_date,
                    "status": inv.status
                })
        
        return {
            "total_pending": float(total_pending),
            "pending_invoices": invoice_details,
            "has_pending": total_pending > 0
        }
    
    return await calculate_balance()


import traceback 

# -------------------------------
# MAIN INVOICE GENERATION ENDPOINT (UPDATED)
# -------------------------------

@router.post("/generate-invoice", response_class=FileResponse)
async def generate_invoice_pdf(payload: InvoiceCreateIn):
    """
    Generate hospital invoice PDF with:
    - Discount
    - CGST/SGST
    - Partial Payment
    - Settlement of selected previous pending invoices in same PDF
    - Safe transaction rollback if PDF fails
    """
    print(f"📋 Invoice request received - Patient: {payload.patient_id} | Type: {payload.payment_type}")

    if not payload.invoice_items:
        raise HTTPException(status_code=400, detail="At least one invoice item is required.")

    # Validate partial payment
    if payload.payment_type == "Partial Payment":
        if not payload.partial_payment:
            raise HTTPException(status_code=400, detail="Partial payment data is required.")
        if payload.partial_payment.paid_amount <= 0:
            raise HTTPException(status_code=400, detail="Paid amount must be > 0.")

    try:
        @sync_to_async
        def create_invoice_with_pdf():
            ensure_db_connection()

            with transaction.atomic():

                # -----------------------------
                # 1. Validate patient
                # -----------------------------
                try:
                    patient = Patient.objects.get(patient_unique_id=payload.patient_id)
                except Patient.DoesNotExist:
                    raise HTTPException(status_code=404, detail="Patient not found")

                # -----------------------------
                # 2. Calculate subtotal
                # -----------------------------
                subtotal = sum(
                    Decimal(item.quantity) * Decimal(item.unit_price)
                    for item in payload.invoice_items
                ).quantize(Decimal("0.01"))

                # -----------------------------
                # 3. Discount
                # -----------------------------
                discount_percent = Decimal(str(payload.discount_percent or 0)).quantize(Decimal("0.01"))
                discount_amount = Decimal("0.00")

                if discount_percent > 0:
                    discount_amount = (subtotal * discount_percent / Decimal("100")).quantize(Decimal("0.01"))

                tax_net_amount = (subtotal - discount_amount).quantize(Decimal("0.01"))
                if tax_net_amount < 0:
                    tax_net_amount = Decimal("0.00")

                # -----------------------------
                # 4. CGST + SGST
                # -----------------------------
                cgst_percent = Decimal(str(payload.cgst_percent or 0)).quantize(Decimal("0.01"))
                sgst_percent = Decimal(str(payload.sgst_percent or 0)).quantize(Decimal("0.01"))

                cgst_amount = (tax_net_amount * cgst_percent / Decimal("100")).quantize(Decimal("0.01"))
                sgst_amount = (tax_net_amount * sgst_percent / Decimal("100")).quantize(Decimal("0.01"))

                total_tax_amount = (cgst_amount + sgst_amount).quantize(Decimal("0.01"))
                grand_total = (tax_net_amount + total_tax_amount).quantize(Decimal("0.01"))

                # -----------------------------
                # 5. New invoice payment handling
                # -----------------------------
                paid_amount = Decimal("0.00")
                pending_amount = grand_total
                due_date = None
                remarks = None
                status = payload.status

                if payload.payment_type == "Partial Payment":
                    paid_amount = Decimal(str(payload.partial_payment.paid_amount)).quantize(Decimal("0.01"))
                    pending_amount = (grand_total - paid_amount).quantize(Decimal("0.01"))
                    due_date = payload.partial_payment.due_date
                    remarks = payload.partial_payment.remarks

                    if paid_amount >= grand_total:
                        status = "Paid"
                        pending_amount = Decimal("0.00")
                    elif paid_amount > 0:
                        status = "Partially Paid"
                    else:
                        status = "Pending"

                elif status == "Paid":
                    paid_amount = grand_total
                    pending_amount = Decimal("0.00")

                # -----------------------------
                # 6. Create new invoice
                # -----------------------------
                invoice = HospitalInvoiceHistory.objects.create(
                    date=payload.date,
                    patient_name=payload.patient_name,
                    patient_id=payload.patient_id,
                    department=payload.department or "General",

                    subtotal=subtotal,
                    total_tax=total_tax_amount,
                    amount=grand_total,

                    payment_method=payload.payment_method,
                    status=status,
                    payment_type=payload.payment_type,

                    admission_date=payload.admission_date,
                    discharge_date=payload.discharge_date,
                    doctor=payload.doctor,

                    phone=payload.phone or patient.phone_number or "N/A",
                    email=payload.email or patient.email_address or "N/A",
                    address=payload.address or patient.address or "N/A",

                    discount_percent=discount_percent,
                    discount_amount=discount_amount,
                    tax_net_amount=tax_net_amount,

                    cgst_percent=cgst_percent,
                    cgst_amount=cgst_amount,
                    sgst_percent=sgst_percent,
                    sgst_amount=sgst_amount,

                    transaction_id=payload.transaction_id,
                    payment_date=payload.payment_date or payload.date,

                    paid_amount=paid_amount,
                    pending_amount=pending_amount,
                    due_date=due_date,
                    payment_remarks=remarks,
                )

                # Generate transaction_id if missing
                if not invoice.transaction_id:
                    invoice.transaction_id = f"TXN_{invoice.invoice_id}"
                    invoice.save(update_fields=["transaction_id"])

                # -----------------------------
                # 7. Create invoice line items
                # -----------------------------
                items_for_pdf = []
                for idx, item in enumerate(payload.invoice_items, 1):
                    line_total = (Decimal(item.quantity) * Decimal(item.unit_price)).quantize(Decimal("0.01"))

                    HospitalInvoiceItem.objects.create(
                        invoice=invoice,
                        s_no=idx,
                        description=item.description,
                        quantity=item.quantity,
                        unit_price=item.unit_price,
                        amount=line_total,
                    )

                    items_for_pdf.append({
                        "s_no": idx,
                        "description": item.description,
                        "quantity": item.quantity,
                        "unit_price": float(item.unit_price),
                        "total": float(line_total),
                    })

                # -----------------------------
                # 8. Partial payment record for NEW invoice
                # -----------------------------
                if payload.payment_type == "Partial Payment" and paid_amount > 0:
                    PartialPaymentHistory.objects.create(
                        invoice=invoice,
                        payment_number=1,
                        payment_date=payload.date,
                        amount_paid=paid_amount,
                        payment_method=payload.payment_method,
                        transaction_id=payload.transaction_id or f"TXN_{invoice.invoice_id}_01",
                        remarks=remarks or "Initial partial payment",
                    )

                # -----------------------------
                # 9. Link treatment charges (existing logic)
                # -----------------------------
                if payload.treatment_charge_ids:
                    charges = TreatmentCharge.objects.filter(id__in=payload.treatment_charge_ids)

                    total_charges_amount = sum((c.amount or Decimal("0.00")) for c in charges)
                    total_charges_amount = Decimal(str(total_charges_amount)).quantize(Decimal("0.01"))

                    is_invoice_paid = (status == "Paid")
                    is_partial = (payload.payment_type == "Partial Payment")

                    for charge in charges:
                        charge_amount = Decimal(str(charge.amount or 0)).quantize(Decimal("0.01"))

                        if is_partial and total_charges_amount > 0:
                            charge_percentage = (charge_amount / total_charges_amount)
                            allocated_amount = (paid_amount * charge_percentage).quantize(Decimal("0.01"))

                            charge.billed_amount = (
                                Decimal(str(charge.billed_amount or 0)) + allocated_amount
                            ).quantize(Decimal("0.01"))

                            if charge.billed_amount > charge_amount:
                                charge.billed_amount = charge_amount

                            charge.remaining_amount = (charge_amount - charge.billed_amount).quantize(Decimal("0.01"))

                            if charge.billed_amount >= charge_amount:
                                charge.status = "BILLED"
                                charge.remaining_amount = Decimal("0.00")
                            elif charge.billed_amount > 0:
                                charge.status = "PARTIALLY_BILLED"
                            else:
                                charge.status = "PENDING"

                        elif is_invoice_paid:
                            charge.billed_amount = charge_amount
                            charge.remaining_amount = Decimal("0.00")
                            charge.status = "BILLED"

                        else:
                            billed_so_far = Decimal(str(charge.billed_amount or 0)).quantize(Decimal("0.01"))

                            if billed_so_far > 0 and billed_so_far < charge_amount:
                                charge.status = "PARTIALLY_BILLED"
                                charge.remaining_amount = (charge_amount - billed_so_far).quantize(Decimal("0.01"))
                            elif billed_so_far >= charge_amount:
                                charge.status = "BILLED"
                                charge.remaining_amount = Decimal("0.00")
                            else:
                                charge.status = "PENDING"
                                charge.remaining_amount = charge_amount
                                charge.billed_amount = Decimal("0.00")

                        charge.hospital_invoice = invoice
                        charge.save()

                # -----------------------------
                # 10. ✅ Settle previous pending invoices
                # -----------------------------
                settled_rows = []
                previous_pending_paid_today = Decimal("0.00")

                if payload.settle_invoice_ids:
                    old_invoices = list(HospitalInvoiceHistory.objects.filter(
                        invoice_id__in=payload.settle_invoice_ids,
                        patient_id=payload.patient_id
                    ))

                    # Preserve frontend selection order
                    old_invoices.sort(key=lambda x: payload.settle_invoice_ids.index(x.invoice_id))

                    for old_inv in old_invoices:
                        old_pending = Decimal(str(old_inv.pending_amount or 0)).quantize(Decimal("0.01"))

                        if old_pending <= 0:
                            continue

                        paid_now = old_pending
                        remaining = Decimal("0.00")

                        old_inv.paid_amount = (
                            Decimal(str(old_inv.paid_amount or 0)) + paid_now
                        ).quantize(Decimal("0.01"))

                        old_inv.pending_amount = remaining
                        old_inv.status = "Paid",
                        old_inv.payment_date = payload.date

                        old_inv.save(update_fields=[
                            "paid_amount", "pending_amount",
                            "status", "payment_date"
                        ])

                        # ✅ Update old invoice treatment charges as fully billed
                        old_charges = TreatmentCharge.objects.filter(hospital_invoice=old_inv)
                        for charge in old_charges:
                            charge_amount = Decimal(str(charge.amount or 0)).quantize(Decimal("0.01"))
                            charge.billed_amount = charge_amount
                            charge.remaining_amount = Decimal("0.00")
                            charge.status = "BILLED"
                            charge.save()

                        # Add payment record for old invoice
                        payment_count = PartialPaymentHistory.objects.filter(invoice=old_inv).count()

                        PartialPaymentHistory.objects.create(
                            invoice=old_inv,
                            payment_number=payment_count + 1,
                            payment_date=payload.date,
                            amount_paid=paid_now,
                            payment_method=payload.payment_method,
                            transaction_id=f"{invoice.transaction_id}_SETTLE_{old_inv.invoice_id}",
                            remarks=f"Settled in invoice {invoice.invoice_id}"
                        )

                        previous_pending_paid_today += paid_now

                        settled_rows.append({
                            "invoice_id": old_inv.invoice_id,
                            "old_pending": float(old_pending),
                            "paid_now": float(paid_now),
                            "remaining": float(remaining),
                        })

                # -----------------------------
                # 11. Render template
                # -----------------------------
                template = env.get_template("invoice_template.html")

                total_collected_today = (grand_total + previous_pending_paid_today).quantize(Decimal("0.01"))

                html_string = template.render(
                    invoice=invoice,
                    items=items_for_pdf,

                    subtotal=float(subtotal),

                    discount_percent=float(discount_percent),
                    discount_amount=float(discount_amount),

                    tax_net_amount=float(tax_net_amount),

                    cgst_percent=float(cgst_percent),
                    cgst_amount=float(cgst_amount),

                    sgst_percent=float(sgst_percent),
                    sgst_amount=float(sgst_amount),

                    total_tax=float(total_tax_amount),
                    grand_total=float(grand_total),

                    amount_in_words=amount_to_words(grand_total),
                    today=date.today().strftime("%B %d, %Y"),

                    is_partial_payment=(payload.payment_type == "Partial Payment"),
                    paid_amount=float(paid_amount),
                    pending_amount=float(pending_amount),
                    due_date=format_date(due_date),
                    payment_remarks=remarks,
                    payment_progress=round(float(paid_amount) / float(grand_total) * 100, 2) if grand_total > 0 else 0,

                    # ✅ Settlement info
                    settled_rows=settled_rows,
                    previous_pending_paid_today=float(previous_pending_paid_today),
                    total_collected_today=float(total_collected_today),
                )

                # -----------------------------
                # 12. Generate PDF
                # -----------------------------
                pdf_filename = f"{invoice.invoice_id}.pdf"
                pdf_path = os.path.join(PDF_OUTPUT_DIR, pdf_filename)

                try:
                    HTML(string=html_string, base_url=APP_DIR).write_pdf(pdf_path)
                except Exception as pdf_exc:
                    print(f"❌ WeasyPrint failed: {pdf_exc}")
                    raise HTTPException(500, f"PDF generation failed: {str(pdf_exc)}")

                # -----------------------------
                # 13. Save PDF path
                # -----------------------------
                invoice.pdf_file = f"invoices_generator/{pdf_filename}"
                invoice.save(update_fields=["pdf_file"])

                return invoice, pdf_path

        invoice, pdf_path = await create_invoice_with_pdf()

# ✅ Send notification in background – does NOT block response
        asyncio.create_task(
            NotificationService.send_hospital_bill_generated({
                "invoice_id": invoice.invoice_id,
                "patient_name": invoice.patient_name,
                "amount": float(invoice.amount),
                "status": invoice.status,
                "payment_type": invoice.payment_type,
                "paid_amount": float(invoice.paid_amount),
                "pending_amount": float(invoice.pending_amount),
            })
        )
        
        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=f"{invoice.invoice_id}.pdf",
            headers={
                "Content-Disposition": f"inline; filename={invoice.invoice_id}.pdf",
                "X-Invoice-ID": invoice.invoice_id,
                "X-Payment-Type": invoice.payment_type,
                "X-Status": invoice.status,
                "X-Paid-Amount": str(invoice.paid_amount),
                "X-Pending-Amount": str(invoice.pending_amount),
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Critical error: {str(e)}")
        print(traceback.format_exc())
        await NotificationService.send_billing_error(str(e), "Invoice Generation")
        raise HTTPException(status_code=500, detail=f"Failed to generate invoice: {str(e)}")

@router.post("/invoice/{invoice_id}/add-payment")
async def add_partial_payment(invoice_id: str, payment_data: AddPartialPaymentRequest):
    """
    Add a new partial payment to an existing invoice.
    Updates paid/pending amounts and status.
    """
    try:
        @sync_to_async
        def process_payment():
            ensure_db_connection()

            with transaction.atomic():
                # Get invoice
                try:
                    invoice = HospitalInvoiceHistory.objects.get(invoice_id=invoice_id)
                except HospitalInvoiceHistory.DoesNotExist:
                    raise HTTPException(status_code=404, detail="Invoice not found")

                # Validate it's a partial payment invoice
                if invoice.payment_type != "Partial Payment":
                    raise HTTPException(
                        status_code=400,
                        detail="Can only add payments to partial payment invoices"
                    )

                # Validate amount
                if payment_data.amount_paid <= 0:
                    raise HTTPException(status_code=400, detail="Payment amount must be positive")

                if payment_data.amount_paid > invoice.pending_amount:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Payment amount (${payment_data.amount_paid}) exceeds pending amount (${invoice.pending_amount})"
                    )

                # Get next payment number
                last_payment = PartialPaymentHistory.objects.filter(
                    invoice=invoice
                ).order_by('-payment_number').first()

                next_payment_number = (last_payment.payment_number + 1) if last_payment else 1

                # Create payment record
                PartialPaymentHistory.objects.create(
                    invoice=invoice,
                    payment_number=next_payment_number,
                    payment_date=date.today(),
                    amount_paid=payment_data.amount_paid,
                    payment_method=payment_data.payment_method,
                    transaction_id=payment_data.transaction_id or f"TXN_{invoice_id}_{next_payment_number:02d}",
                    remarks=payment_data.remarks,
                )

                # Update invoice amounts
                invoice.paid_amount = (Decimal(str(invoice.paid_amount or 0)) + Decimal(str(payment_data.amount_paid))).quantize(Decimal("0.01"))
                invoice.pending_amount = (Decimal(str(invoice.pending_amount or 0)) - Decimal(str(payment_data.amount_paid))).quantize(Decimal("0.01"))

                # Update status
                if invoice.pending_amount <= 0:
                    invoice.status = "Paid"
                    invoice.pending_amount = Decimal("0.00")

                    # ✅ Properly mark charges as billed when fully paid
                    TreatmentCharge.objects.filter(hospital_invoice=invoice).update(
                        billed_amount=F("amount"),
                        remaining_amount=Decimal("0.00"),
                        status="BILLED"
                    )
                else:
                    invoice.status = "Partially Paid"

                invoice.save(update_fields=["paid_amount", "pending_amount", "status"])

                return invoice, next_payment_number

        invoice, payment_number = await process_payment()

        # Send notification
        await NotificationService.send_hospital_bill_generated({
            "invoice_id": invoice.invoice_id,
            "patient_name": invoice.patient_name,
            "action": "partial_payment_added",
            "payment_number": payment_number,
            "amount_paid": float(payment_data.amount_paid),
            "total_paid": float(invoice.paid_amount),
            "pending_amount": float(invoice.pending_amount),
            "status": invoice.status
        })

        return {
            "detail": f"Payment #{payment_number} added successfully",
            "invoice_id": invoice.invoice_id,
            "payment_number": payment_number,
            "amount_paid": float(payment_data.amount_paid),
            "total_paid_now": float(invoice.paid_amount),
            "pending_amount": float(invoice.pending_amount),
            "status": invoice.status,
            "is_fully_paid": invoice.status == "Paid"
        }

    except HTTPException:
        raise
    except Exception as e:
        await NotificationService.send_billing_error(
            str(e),
            bill_type="Add Partial Payment",
            reference_id=invoice_id
        )
        raise HTTPException(status_code=500, detail=f"Failed to add payment: {str(e)}")

# -------------------------------
# NEW: GET PARTIAL PAYMENT HISTORY
# -------------------------------
@router.get("/invoice/{invoice_id}/payment-history", response_model=List[PartialPaymentSchema])
async def get_payment_history(invoice_id: str):
    """Get all partial payment history for an invoice"""
    try:
        @sync_to_async
        def fetch_payments():
            ensure_db_connection()
            try:
                invoice = HospitalInvoiceHistory.objects.get(invoice_id=invoice_id)
            except HospitalInvoiceHistory.DoesNotExist:
                raise HTTPException(status_code=404, detail="Invoice not found")
            
            payments = PartialPaymentHistory.objects.filter(
                invoice=invoice
            ).order_by('payment_number')
            
            return list(payments)
        
        payments = await fetch_payments()
        
        return [
            PartialPaymentSchema(
                payment_number=p.payment_number,
                payment_date=format_date(p.payment_date),
                amount_paid=float(p.amount_paid),
                payment_method=p.payment_method,
                transaction_id=p.transaction_id,
                remarks=p.remarks,
                created_at=format_date(p.created_at)
            )
            for p in payments
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch payment history: {str(e)}")


# -------------------------------
# Patient Treatment Charges Endpoint (UPDATED)
# -------------------------------
@router.get("/patient/{patient_id}/treatment-charges", response_model=PatientTreatmentChargesResponse)
async def get_patient_treatment_charges(patient_id: str):
    """
    Get all pending treatment charges for a patient using patient unique ID
    """
    try:
        print(f"🔍 Fetching treatment charges for patient: {patient_id}")
        
        # Fetch patient
        @sync_to_async
        def fetch_patient():
            ensure_db_connection()
            try:
                return Patient.objects.get(patient_unique_id=patient_id)
            except Patient.DoesNotExist:
                return None

        patient = await fetch_patient()
        if not patient:
            print(f"❌ Patient not found: {patient_id}")
            raise HTTPException(status_code=404, detail="Patient not found")

        print(f"✅ Patient found: {patient.full_name}")

        # Fetch ALL treatment charges for this patient
        @sync_to_async
        def fetch_all_charges():
            ensure_db_connection()
            return list(TreatmentCharge.objects.filter(
                patient=patient
            ).order_by("-created_at"))

        all_charges = await fetch_all_charges()
        print(f"📊 Total charges in DB: {len(all_charges)}")
        
        # Separate into pending and billed
        pending_charges = []
        billed_charges = []
        
        for charge in all_charges:
            print(f"  - ID: {charge.id}, Desc: {charge.description}, Amount: {charge.amount}, Status: {charge.status}")
            if charge.status == "PENDING":
                pending_charges.append(charge)
            elif charge.status == "BILLED":
                billed_charges.append(charge)
        
        print(f"✅ Pending charges: {len(pending_charges)}")
        print(f"✅ Billed charges: {len(billed_charges)}")

        # Calculate totals
        total_pending = sum(float(charge.amount or 0) for charge in pending_charges)
        total_billed = sum(float(charge.amount or 0) for charge in billed_charges)

        # Get previous pending balances from invoices
        previous_balance_data = await get_patient_pending_balance(patient_id)
        
        print(f"📊 Pending balance from invoices: {previous_balance_data['total_pending']}")

        # Format pending charges for response, including discount and tax percentages
        charges_data = []
        for idx, charge in enumerate(pending_charges, 1):
            charges_data.append({
                "id": charge.id,
                "description": charge.description,
                "quantity": charge.quantity,
                "unit_price": float(charge.unit_price),
                "discount_percent": float(charge.discount_percent or 0),  # <-- Added
                "tax_percent": float(charge.tax_percent or 0),            # <-- Added
                "amount": float(charge.amount or 0),
                "status": charge.status,
                "created_at": format_date(charge.created_at)
            })

        print(f"✅ Formatted {len(charges_data)} pending charges for response")

        # Return response
        response_data = {
            "patient_id": patient_id,
            "patient_name": patient.full_name,
            "charges": charges_data,  # Only pending charges with discount & tax
            "total_pending": previous_balance_data["total_pending"],  # Previous invoice balances
            "total_billed": total_billed,
            "previous_balances": previous_balance_data,
            "new_charges_total": float(total_pending),  # Total from pending charges
            "total_payable": float(total_pending + previous_balance_data.get("total_pending", 0))
        }
        
        print(f"✅ Response data: {response_data}")
        return response_data

    except Exception as e:
        print(f"❌ Error in get_patient_treatment_charges: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch treatment charges: {str(e)}")


# -------------------------------
# CRUD Endpoints (UPDATED)
# -------------------------------
@router.get("/", response_model=List[InvoiceListSchema])
async def list_invoices():
    try:
        @sync_to_async
        def fetch_invoices():
            ensure_db_connection()
            from django.db import connection
            connection.queries_log.clear()
            
            invoices = HospitalInvoiceHistory.objects.all().order_by("-id")
            
            print(f"Total invoices in database: {invoices.count()}")
            if invoices.count() > 0:
                recent = list(invoices[:5])
                print(f"Recent invoices (ID, invoice_id, date):")
                for inv in recent:
                    print(f"  - {inv.id}: {inv.invoice_id} - {inv.date} - {inv.patient_name}")
            
            return list(invoices)
        
        invoices = await fetch_invoices()
        
        result = []
        for inv in invoices:
            dept = await get_department_name(inv.patient_id)
            result.append({
                "invoice_id": inv.invoice_id,
                "date": format_date(inv.date),
                "patient_name": inv.patient_name,
                "patient_id": inv.patient_id,
                "department": dept,
                "amount": float(inv.amount),
                "payment_method": inv.payment_method or "-",
                "status": inv.status,
                "payment_type": inv.payment_type,  # NEW: Added payment_type
                "paid_amount": float(inv.paid_amount),  # NEW: Added paid_amount
                "pending_amount": float(inv.pending_amount),  # NEW: Added pending_amount
            })
        
        return result
        
    except Exception as e:
        print(f"Error in list_invoices: {e}")
        await NotificationService.send_billing_error(str(e), bill_type="Hospital Invoice List")
        raise HTTPException(status_code=500, detail="Failed to fetch invoices")


@router.get("/{invoice_id}", response_model=InvoiceDetailSchema)
async def get_invoice_detail(invoice_id: str):
    try:
        @sync_to_async
        def fetch_invoice():
            ensure_db_connection()
            return HospitalInvoiceHistory.objects.prefetch_related(
                "items", "partial_payments"
            ).get(invoice_id=invoice_id)

        invoice = await fetch_invoice()

        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        # Fetch items
        @sync_to_async
        def fetch_items():
            ensure_db_connection()
            return list(invoice.items.all().order_by("s_no"))

        items = await fetch_items()

        item_list = [
            InvoiceItemSchema(
                s_no=item.s_no,
                description=item.description,
                quantity=item.quantity,
                unit_price=float(item.unit_price),
                amount=float(item.amount),
            )
            for item in items
        ]

        # Fetch partial payments
        @sync_to_async
        def fetch_partial_payments():
            ensure_db_connection()
            return list(invoice.partial_payments.all().order_by("payment_number"))

        partial_payments_list = await fetch_partial_payments()

        partial_payments = [
            PartialPaymentSchema(
                payment_number=pp.payment_number,
                payment_date=format_date(pp.payment_date),
                amount_paid=float(pp.amount_paid),
                payment_method=pp.payment_method,
                transaction_id=pp.transaction_id,
                remarks=pp.remarks,
                created_at=format_date(pp.created_at),
            )
            for pp in partial_payments_list
        ]

        # ✅ Use invoice stored breakup fields (NOT tax_percent)
        subtotal = float(invoice.subtotal or 0)
        discount_percent = float(invoice.discount_percent or 0)
        discount_amount = float(invoice.discount_amount or 0)
        tax_net_amount = float(invoice.tax_net_amount or 0)

        cgst_percent = float(invoice.cgst_percent or 0)
        cgst_amount = float(invoice.cgst_amount or 0)

        sgst_percent = float(invoice.sgst_percent or 0)
        sgst_amount = float(invoice.sgst_amount or 0)

        total_tax = float(invoice.total_tax or (cgst_amount + sgst_amount))
        grand_total = float(invoice.amount or 0)

        # Payment progress
        payment_progress = (
            round((float(invoice.paid_amount) / float(invoice.amount)) * 100, 2)
            if invoice.amount and invoice.amount > 0
            else 0
        )

        dept = await get_department_name(invoice.patient_id)

        data = InvoiceDetailSchema(
            invoice_id=invoice.invoice_id,
            date=format_date(invoice.date),
            patient_name=invoice.patient_name,
            patient_id=invoice.patient_id,
            department=dept,

            amount=grand_total,
            payment_method=invoice.payment_method or "Cash",
            status=invoice.status,
            payment_type=invoice.payment_type,

            admission_date=format_date(invoice.admission_date),
            discharge_date=format_date(invoice.discharge_date),
            doctor=invoice.doctor,
            phone=invoice.phone,
            email=invoice.email,
            address=invoice.address or "N/A",

            # ✅ New breakup
            subtotal=subtotal,
            discount_percent=discount_percent,
            discount_amount=discount_amount,
            tax_net_amount=tax_net_amount,

            cgst_percent=cgst_percent,
            cgst_amount=cgst_amount,

            sgst_percent=sgst_percent,
            sgst_amount=sgst_amount,

            total_tax=total_tax,
            grand_total=grand_total,

            # Partial payment
            paid_amount=float(invoice.paid_amount or 0),
            pending_amount=float(invoice.pending_amount or 0),
            due_date=format_date(invoice.due_date),
            payment_remarks=invoice.payment_remarks,
            payment_progress=payment_progress,

            items=item_list,
            partial_payments=partial_payments,
        )

        await NotificationService.send_hospital_bill_generated({
            "invoice_id": invoice.invoice_id,
            "patient_name": invoice.patient_name,
            "amount": float(invoice.amount),
        })

        return data

    except HospitalInvoiceHistory.DoesNotExist:
        raise HTTPException(status_code=404, detail="Invoice not found")

    except Exception as e:
        print(f"Error in get_invoice_detail for {invoice_id}: {e}")
        await NotificationService.send_billing_error(
            str(e), bill_type="Invoice Detail", reference_id=invoice_id
        )
        raise HTTPException(status_code=500, detail="Failed to fetch invoice details")



@router.post("/invoice/{invoice_id}/mark-paid")
async def mark_invoice_as_paid(invoice_id: str, payload: MarkPaidIn = MarkPaidIn()):

    try:
        @sync_to_async
        def process_mark_paid():
            ensure_db_connection()

            with transaction.atomic():

                # 1) Get invoice
                try:
                    invoice = HospitalInvoiceHistory.objects.get(invoice_id=invoice_id)
                except HospitalInvoiceHistory.DoesNotExist:
                    raise HTTPException(status_code=404, detail="Invoice not found")

                # 2) If already paid
                pending_now = Decimal(str(invoice.pending_amount or 0)).quantize(Decimal("0.01"))

                if invoice.status == "Paid" and pending_now <= 0:
                    raise HTTPException(status_code=400, detail="Invoice is already fully paid")

                # 3) Create payment history record (only if pending exists)
                payment_number = None

                if pending_now > 0:
                    last_payment = PartialPaymentHistory.objects.filter(
                        invoice=invoice
                    ).order_by("-payment_number").first()

                    payment_number = (last_payment.payment_number + 1) if last_payment else 1

                    PartialPaymentHistory.objects.create(
                        invoice=invoice,
                        payment_number=payment_number,
                        payment_date=timezone.now().date(),
                        amount_paid=pending_now,
                        payment_method=payload.payment_method or invoice.payment_method or "Cash",
                        transaction_id=f"TXN_{invoice.invoice_id}_{payment_number:02d}",
                        remarks=payload.remarks or "Final payment (Mark Paid)",
                    )

                # 4) Update invoice
                invoice.paid_amount = (Decimal(str(invoice.paid_amount or 0)) + pending_now).quantize(Decimal("0.01"))
                invoice.pending_amount = Decimal("0.00")
                invoice.status = "Paid"
                invoice.payment_type = "Partial Payment Completed"
                invoice.payment_date = timezone.now().date()

                invoice.save(update_fields=[
                    "paid_amount",
                    "pending_amount",
                    "status",
                    "payment_type",
                    "payment_date"
                ])

                # 5) Update treatment charges
                charges = TreatmentCharge.objects.filter(hospital_invoice=invoice)

                for charge in charges:
                    charge_amount = Decimal(str(charge.amount or 0)).quantize(Decimal("0.01"))
                    charge.billed_amount = charge_amount
                    charge.remaining_amount = Decimal("0.00")
                    charge.status = "BILLED"
                    charge.save()

                return {
                    "invoice_id": invoice.invoice_id,
                    "status": invoice.status,
                    "paid_amount": float(invoice.paid_amount or 0),
                    "pending_amount": float(invoice.pending_amount or 0),
                    "payment_number": payment_number,
                    "treatment_charges_updated": charges.count()
                }

        result = await process_mark_paid()

        await NotificationService.send_hospital_bill_generated({
            "invoice_id": result["invoice_id"],
            "amount": result["paid_amount"],
            "status": "Paid",
            "action": "status_update",
            "treatment_charges_updated": result["treatment_charges_updated"]
        })

        return {
            "message": "Invoice marked as paid successfully",
            **result
        }

    except HTTPException:
        raise
    except Exception as e:
        await NotificationService.send_billing_error(
            str(e),
            bill_type="Mark Invoice Paid",
            reference_id=invoice_id
        )
        raise HTTPException(status_code=500, detail=f"Failed to update invoice: {str(e)}")
    
@router.delete("/{invoice_id}")
async def delete_invoice(invoice_id: str):
    try:
        @sync_to_async
        def delete_invoice_sync():
            ensure_db_connection()
            
            # Get the invoice
            invoice = HospitalInvoiceHistory.objects.get(invoice_id=invoice_id)
            
            # Count linked charges before deletion (for response)
            charge_count = TreatmentCharge.objects.filter(hospital_invoice=invoice).count()

            # ✅ Delete PDF files
            pdf_deleted = False
            if invoice.pdf_file:
                try:
                    pdf_path = invoice.pdf_file.path
                    if os.path.exists(pdf_path):
                        os.remove(pdf_path)
                        pdf_deleted = True
                except Exception as e:
                    print(f"Error deleting PDF file: {e}")
            
            # Check fallback location
            try:
                pdf_filename = f"{invoice_id}.pdf"
                fallback_path = os.path.join(PDF_OUTPUT_DIR, pdf_filename)
                if os.path.exists(fallback_path):
                    os.remove(fallback_path)
                    pdf_deleted = True
            except Exception as e:
                print(f"Error deleting fallback PDF: {e}")

            # ✅ Delete invoice - this will CASCADE delete treatment charges
            invoice.delete()
            
            return {
                "pdf_deleted": pdf_deleted,
                "treatment_charges_deleted": charge_count
            }
        
        result = await delete_invoice_sync()
        
        return {
            "detail": f"Invoice {invoice_id} deleted successfully",
            "pdf_deleted": result["pdf_deleted"],
            "treatment_charges_deleted": result["treatment_charges_deleted"]
        }
        
    except HospitalInvoiceHistory.DoesNotExist:
        raise HTTPException(status_code=404, detail="Invoice not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")
    

# -------------------------------
# PDF Download Endpoints
# -------------------------------
@router.get("/pdf/{invoice_id}")
async def download_pdf(invoice_id: str):
    try:
        @sync_to_async
        def fetch_invoice():
            ensure_db_connection()
            return HospitalInvoiceHistory.objects.get(invoice_id=invoice_id)
        
        invoice = await fetch_invoice()

        # Validate PDF is linked in DB
        if not invoice.pdf_file:
            raise HTTPException(
                status_code=404,
                detail="PDF not generated for this invoice"
            )

        # Validate file exists on disk
        pdf_path = invoice.pdf_file.path
        if not os.path.exists(pdf_path):
            raise HTTPException(
                status_code=404,
                detail="PDF file missing on server"
            )
        
        invoice_data = await get_invoice_data(invoice)
        await NotificationService.send_hospital_bill_generated(invoice_data)

        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"{invoice_id}.pdf",
            headers={
        "Content-Disposition": f"inline; filename={invoice_id}.pdf",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
    }
        )
    except HospitalInvoiceHistory.DoesNotExist:
        raise HTTPException(status_code=404, detail="Invoice not found")
    except Exception as e:
        await NotificationService.send_billing_error(str(e), bill_type="PDF Download")
        raise HTTPException(status_code=500, detail="PDF not available")


@router.post("/download-selected")
async def download_selected_pdfs(invoice_ids: InvoiceIds, background_tasks: BackgroundTasks):
    if not invoice_ids.ids:
        raise HTTPException(status_code=400, detail="No invoice IDs provided")

    with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
        zip_path = tmp.name

    try:
        with ZipFile(zip_path, "w") as zipf:
            found = 0
            for inv_id in invoice_ids.ids:
                try:
                    @sync_to_async
                    def fetch_invoice():
                        ensure_db_connection()
                        return HospitalInvoiceHistory.objects.get(invoice_id=inv_id)
                    
                    invoice = await fetch_invoice()
                    pdf_path = None

                    if invoice.pdf_file and os.path.exists(invoice.pdf_file.path):
                        pdf_path = invoice.pdf_file.path
                    else:
                        fallback = os.path.join(PDF_OUTPUT_DIR, f"{inv_id}.pdf")
                        if os.path.exists(fallback):
                            pdf_path = fallback

                    if pdf_path:
                        zipf.write(pdf_path, arcname=f"{inv_id}.pdf")
                        found += 1
                except HospitalInvoiceHistory.DoesNotExist:
                    continue

            if found == 0:
                os.remove(zip_path)
                raise HTTPException(status_code=404, detail="No PDFs found for selected invoices")

        background_tasks.add_task(delayed_remove, zip_path, delay=10)

        await NotificationService.send_hospital_bill_generated({
            "message": f"{found} hospital invoice(s) downloaded as ZIP",
            "count": found
        })

        return FileResponse(
            zip_path,
            media_type="application/zip",
            filename="hospital_invoices_selected.zip"
        )

    except Exception as e:
        if os.path.exists(zip_path):
            os.remove(zip_path)
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------
# Export: CSV & Excel (UPDATED)
# -------------------------------
@router.get("/export/csv")
async def export_csv(include_items: bool = False):
    @sync_to_async
    def fetch_invoices():
        ensure_db_connection()
        return list(HospitalInvoiceHistory.objects.prefetch_related("items").all())

    invoices = await fetch_invoices()

    output = io.StringIO()
    writer = csv.writer(output)

    if include_items:
        # Flat format with repeated per item
        writer.writerow([
            "Invoice ID", "Date", "Patient Name", "Patient ID", "Department",
            "Payment Type",
            "S.No", "Description", "Qty", "Unit Price", "Item Amount",

            # New breakup
            "Subtotal", "Discount %", "Discount Amount",
            "Taxable Amount (After Discount)",
            "CGST %", "CGST Amount",
            "SGST %", "SGST Amount",
            "Total Tax", "Grand Total",

            # Payment tracking
            "Paid Amount", "Pending Amount", "Status", "Payment Method"
        ])

        for inv in invoices:
            items = await sync_to_async(list)(inv.items.all().order_by("s_no"))

            dept = await get_department_name(inv.patient_id)

            subtotal = float(inv.subtotal or 0)
            discount_percent = float(inv.discount_percent or 0)
            discount_amount = float(inv.discount_amount or 0)
            tax_net_amount = float(inv.tax_net_amount or 0)

            cgst_percent = float(inv.cgst_percent or 0)
            cgst_amount = float(inv.cgst_amount or 0)

            sgst_percent = float(inv.sgst_percent or 0)
            sgst_amount = float(inv.sgst_amount or 0)

            total_tax = float(inv.total_tax or (cgst_amount + sgst_amount))
            grand_total = float(inv.amount or 0)

            first = True

            if items:
                for item in items:
                    writer.writerow([
                        inv.invoice_id if first else "",
                        format_date(inv.date) if first else "",
                        inv.patient_name if first else "",
                        inv.patient_id if first else "",
                        dept if first else "",
                        inv.payment_type if first else "",

                        item.s_no,
                        item.description,
                        item.quantity,
                        float(item.unit_price),
                        float(item.amount),

                        subtotal if first else "",
                        discount_percent if first else "",
                        discount_amount if first else "",
                        tax_net_amount if first else "",

                        cgst_percent if first else "",
                        cgst_amount if first else "",
                        sgst_percent if first else "",
                        sgst_amount if first else "",

                        total_tax if first else "",
                        grand_total if first else "",

                        float(inv.paid_amount or 0) if first else "",
                        float(inv.pending_amount or 0) if first else "",
                        inv.status if first else "",
                        inv.payment_method if first else "",
                    ])
                    first = False
            else:
                # No items case
                writer.writerow([
                    inv.invoice_id,
                    format_date(inv.date),
                    inv.patient_name,
                    inv.patient_id,
                    dept,
                    inv.payment_type,

                    "", "No items", "", "", "",

                    subtotal,
                    discount_percent,
                    discount_amount,
                    tax_net_amount,

                    cgst_percent,
                    cgst_amount,
                    sgst_percent,
                    sgst_amount,

                    total_tax,
                    grand_total,

                    float(inv.paid_amount or 0),
                    float(inv.pending_amount or 0),
                    inv.status,
                    inv.payment_method or "Cash"
                ])

    else:
        # Summary only
        writer.writerow([
            "Invoice ID", "Date", "Patient Name", "Patient ID", "Department",
            "Payment Type",

            # Breakup
            "Subtotal", "Discount %", "Discount Amount",
            "Taxable Amount (After Discount)",
            "CGST %", "CGST Amount",
            "SGST %", "SGST Amount",
            "Total Tax", "Grand Total",

            # Payment
            "Paid Amount", "Pending Amount",
            "Status", "Payment Method"
        ])

        for inv in invoices:
            dept = await get_department_name(inv.patient_id)

            subtotal = float(inv.subtotal or 0)
            discount_percent = float(inv.discount_percent or 0)
            discount_amount = float(inv.discount_amount or 0)
            tax_net_amount = float(inv.tax_net_amount or 0)

            cgst_percent = float(inv.cgst_percent or 0)
            cgst_amount = float(inv.cgst_amount or 0)

            sgst_percent = float(inv.sgst_percent or 0)
            sgst_amount = float(inv.sgst_amount or 0)

            total_tax = float(inv.total_tax or (cgst_amount + sgst_amount))
            grand_total = float(inv.amount or 0)

            writer.writerow([
                inv.invoice_id,
                format_date(inv.date),
                inv.patient_name,
                inv.patient_id,
                dept,
                inv.payment_type,

                subtotal,
                discount_percent,
                discount_amount,
                tax_net_amount,

                cgst_percent,
                cgst_amount,
                sgst_percent,
                sgst_amount,

                total_tax,
                grand_total,

                float(inv.paid_amount or 0),
                float(inv.pending_amount or 0),
                inv.status,
                inv.payment_method or "Cash"
            ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=hospital_invoices.csv"}
    )



@router.get("/export/excel")
async def export_excel(include_items: bool = False):
    @sync_to_async
    def fetch_invoices():
        ensure_db_connection()
        return list(HospitalInvoiceHistory.objects.prefetch_related("items").all())

    invoices = await fetch_invoices()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Hospital Invoices"

    if include_items:
        header = [
            "Invoice ID", "Date", "Patient", "Patient ID", "Dept", "Payment Type",
            "S.No", "Description", "Qty", "Unit Price", "Item Amount",

            "Subtotal", "Discount %", "Discount Amount",
            "Taxable Amount (After Discount)",
            "CGST %", "CGST Amount",
            "SGST %", "SGST Amount",
            "Total Tax", "Grand Total",

            "Paid Amount", "Pending Amount", "Status", "Payment Method"
        ]
        ws.append(header)

        for inv in invoices:
            items = await sync_to_async(list)(inv.items.all().order_by("s_no"))
            dept = await get_department_name(inv.patient_id)

            subtotal = float(inv.subtotal or 0)
            discount_percent = float(inv.discount_percent or 0)
            discount_amount = float(inv.discount_amount or 0)
            tax_net_amount = float(inv.tax_net_amount or 0)

            cgst_percent = float(inv.cgst_percent or 0)
            cgst_amount = float(inv.cgst_amount or 0)

            sgst_percent = float(inv.sgst_percent or 0)
            sgst_amount = float(inv.sgst_amount or 0)

            total_tax = float(inv.total_tax or (cgst_amount + sgst_amount))
            grand_total = float(inv.amount or 0)

            if items:
                for idx, item in enumerate(items, 1):
                    ws.append([
                        inv.invoice_id if idx == 1 else "",
                        format_date(inv.date) if idx == 1 else "",
                        inv.patient_name if idx == 1 else "",
                        inv.patient_id if idx == 1 else "",
                        dept if idx == 1 else "",
                        inv.payment_type if idx == 1 else "",

                        item.s_no,
                        item.description,
                        item.quantity,
                        float(item.unit_price),
                        float(item.amount),

                        subtotal if idx == 1 else "",
                        discount_percent if idx == 1 else "",
                        discount_amount if idx == 1 else "",
                        tax_net_amount if idx == 1 else "",

                        cgst_percent if idx == 1 else "",
                        cgst_amount if idx == 1 else "",
                        sgst_percent if idx == 1 else "",
                        sgst_amount if idx == 1 else "",

                        total_tax if idx == 1 else "",
                        grand_total if idx == 1 else "",

                        float(inv.paid_amount or 0) if idx == 1 else "",
                        float(inv.pending_amount or 0) if idx == 1 else "",
                        inv.status if idx == 1 else "",
                        inv.payment_method if idx == 1 else "",
                    ])
            else:
                ws.append([
                    inv.invoice_id,
                    format_date(inv.date),
                    inv.patient_name,
                    inv.patient_id,
                    dept,
                    inv.payment_type,

                    "", "No items", "", "", "",

                    subtotal,
                    discount_percent,
                    discount_amount,
                    tax_net_amount,

                    cgst_percent,
                    cgst_amount,
                    sgst_percent,
                    sgst_amount,

                    total_tax,
                    grand_total,

                    float(inv.paid_amount or 0),
                    float(inv.pending_amount or 0),
                    inv.status,
                    inv.payment_method or "Cash"
                ])

    else:
        header = [
            "Invoice ID", "Date", "Patient", "Patient ID", "Dept", "Payment Type",

            "Subtotal", "Discount %", "Discount Amount",
            "Taxable Amount (After Discount)",
            "CGST %", "CGST Amount",
            "SGST %", "SGST Amount",
            "Total Tax", "Grand Total",

            "Paid Amount", "Pending Amount",
            "Status", "Payment Method"
        ]
        ws.append(header)

        for inv in invoices:
            dept = await get_department_name(inv.patient_id)

            subtotal = float(inv.subtotal or 0)
            discount_percent = float(inv.discount_percent or 0)
            discount_amount = float(inv.discount_amount or 0)
            tax_net_amount = float(inv.tax_net_amount or 0)

            cgst_percent = float(inv.cgst_percent or 0)
            cgst_amount = float(inv.cgst_amount or 0)

            sgst_percent = float(inv.sgst_percent or 0)
            sgst_amount = float(inv.sgst_amount or 0)

            total_tax = float(inv.total_tax or (cgst_amount + sgst_amount))
            grand_total = float(inv.amount or 0)

            ws.append([
                inv.invoice_id,
                format_date(inv.date),
                inv.patient_name,
                inv.patient_id,
                dept,
                inv.payment_type,

                subtotal,
                discount_percent,
                discount_amount,
                tax_net_amount,

                cgst_percent,
                cgst_amount,
                sgst_percent,
                sgst_amount,

                total_tax,
                grand_total,

                float(inv.paid_amount or 0),
                float(inv.pending_amount or 0),

                inv.status,
                inv.payment_method or "Cash"
            ])

    # Save Excel file to memory
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    filename = "hospital_invoices.xlsx" if not include_items else "hospital_invoices_with_items.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/treatment-charges/")
async def create_treatment_charge(payload: TreatmentChargeCreate):
    try:
        @sync_to_async
        def create_charge():
            ensure_db_connection()

            # Get patient
            try:
                patient = Patient.objects.get(id=payload.patient_id)
            except Patient.DoesNotExist:
                raise HTTPException(status_code=404, detail="Patient not found")

            quantity = Decimal(str(payload.quantity))
            unit_price = Decimal(str(payload.unit_price))

            discount_percent = Decimal(str(payload.discount_percent or 0))
            tax_percent = Decimal(str(payload.tax_percent or 0))

            # Calculate amounts
            subtotal = quantity * unit_price
            discount_amount = subtotal * (discount_percent / Decimal("100"))
            after_discount = subtotal - discount_amount
            tax_amount = after_discount * (tax_percent / Decimal("100"))
            final_amount = (after_discount + tax_amount).quantize(Decimal("0.01"))

            # Create TreatmentCharge
            charge = TreatmentCharge.objects.create(
                patient=patient,
                description=payload.description,
                quantity=quantity,
                unit_price=unit_price,
                discount_percent=discount_percent,
                tax_percent=tax_percent,
                amount=final_amount,
                billed_amount=Decimal("0.00"),
                remaining_amount=final_amount,
                status=payload.status or "PENDING",
            )

            return charge

        created = await create_charge()

        # Return the created charge object directly (not nested in data)
        return {
            "id": created.id,
            "description": created.description,
            "quantity": float(created.quantity),
            "unit_price": float(created.unit_price),
            "discount_percent": float(created.discount_percent or 0),
            "tax_percent": float(created.tax_percent or 0),
            "amount": float(created.amount),
            "status": created.status,
            "patient_id": created.patient.id,
            "created_at": created.created_at.isoformat() if hasattr(created, 'created_at') else None,
            "updated_at": created.updated_at.isoformat() if hasattr(created, 'updated_at') else None,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating treatment charge: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/treatment-charges/{charge_id}")
async def update_treatment_charge(charge_id: int, payload: TreatmentChargeUpdateIn):
    try:
        @sync_to_async
        def update_charge():
            ensure_db_connection()

            try:
                charge = TreatmentCharge.objects.get(id=charge_id)
            except TreatmentCharge.DoesNotExist:
                raise HTTPException(status_code=404, detail="Treatment charge not found")

            if charge.status != "PENDING":
                raise HTTPException(
                    status_code=400,
                    detail="Cannot edit this charge because it is already billed"
                )

            # Update allowed fields
            if payload.description is not None:
                charge.description = payload.description
            if payload.quantity is not None:
                charge.quantity = payload.quantity
            if payload.discount_percent is not None:
                charge.discount_percent = payload.discount_percent
            if payload.tax_percent is not None:
                charge.tax_percent = payload.tax_percent

            # Recalculate amount using the same formula as frontend
            unit_price = charge.unit_price
            quantity = charge.quantity
            discount_percent = charge.discount_percent or Decimal('0.0')
            tax_percent = charge.tax_percent or Decimal('0.0')

            subtotal = Decimal(quantity) * unit_price
            discount_amount = subtotal * (discount_percent / Decimal('100'))
            after_discount = subtotal - discount_amount
            tax_amount = after_discount * (tax_percent / Decimal('100'))
            charge.amount = after_discount + tax_amount

            charge.save()
            return charge

        updated = await update_charge()

        return {
            "success": True,
            "message": "Treatment charge updated",
            "data": {
                "id": updated.id,
                "description": updated.description,
                "quantity": updated.quantity,
                "unit_price": float(updated.unit_price),
                "discount_percent": float(updated.discount_percent or 0),
                "tax_percent": float(updated.tax_percent or 0),
                "amount": float(updated.amount),
                "status": updated.status,
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.delete("/treatment-charges/{charge_id}")
async def delete_treatment_charge(charge_id: int):
    try:
        @sync_to_async
        def delete_charge():
            ensure_db_connection()

            try:
                charge = TreatmentCharge.objects.get(id=charge_id)
            except TreatmentCharge.DoesNotExist:
                raise HTTPException(status_code=404, detail="Treatment charge not found")

            if charge.status != "PENDING":
                raise HTTPException(
                    status_code=400,
                    detail="Cannot delete billed treatment charge"
                )

            charge.delete()
            return True

        await delete_charge()
        return {"success": True, "message": "Treatment charge deleted"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/generate-consolidate-invoice", response_class=FileResponse)
async def generate_consolidate_invoice(payload: ConsolidateInvoiceCreateIn):
    """
    Generate a consolidate invoice PDF for multiple PAID invoices
    and mark the source invoices as consolidated.

    UPDATED:
    - Each item is a row in the table
    - NO tax_percent field (model doesn't have it)
    - Totals are calculated from DB (invoice-level stored fields)
    """
    try:
        @sync_to_async
        def generate_and_save_consolidate_invoice():
            ensure_db_connection()

            with transaction.atomic():

                # -----------------------------
                # 1) Fetch patient
                # -----------------------------
                try:
                    patient = Patient.objects.get(patient_unique_id=payload.patient_id)
                except Patient.DoesNotExist:
                    patient = None

                # -----------------------------
                # 2) Generate consolidate invoice ID
                # -----------------------------
                last = HospitalInvoiceHistory.objects.filter(
                    payment_type="Consolidate"
                ).order_by("-id").first()

                num = 1
                if last and last.invoice_id and last.invoice_id.startswith("CONS_"):
                    try:
                        num = int(last.invoice_id.split("_")[-1]) + 1
                    except:
                        num = 1

                consolidate_id = f"CONS_{num:04d}"

                # -----------------------------
                # 3) Fetch invoices in SAME order as payload.invoice_ids
                # -----------------------------
                invoice_map = {
                    inv.invoice_id: inv
                    for inv in HospitalInvoiceHistory.objects.select_for_update().filter(
                        invoice_id__in=payload.invoice_ids,
                        patient_id=payload.patient_id,
                    )
                }

                missing = [iid for iid in payload.invoice_ids if iid not in invoice_map]
                if missing:
                    raise HTTPException(
                        status_code=404,
                        detail=f"These invoice IDs were not found for this patient: {', '.join(missing)}"
                    )

                source_invoices = [invoice_map[iid] for iid in payload.invoice_ids]

                # -----------------------------
                # 4) Validate invoices
                # -----------------------------
                already_consolidated = [
                    inv.invoice_id for inv in source_invoices if inv.is_consolidated
                ]
                if already_consolidated:
                    raise HTTPException(
                        status_code=400,
                        detail=f"The following invoices are already consolidated: {', '.join(already_consolidated)}"
                    )

                not_paid = [inv.invoice_id for inv in source_invoices if inv.status != "Paid"]
                if not_paid:
                    raise HTTPException(
                        status_code=400,
                        detail=f"These invoices are not fully paid: {', '.join(not_paid)}"
                    )

                # Do not allow consolidating consolidate invoices
                consolidate_inside = [
                    inv.invoice_id for inv in source_invoices if inv.payment_type == "Consolidate"
                ]
                if consolidate_inside:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Consolidate invoices cannot be consolidated again: {', '.join(consolidate_inside)}"
                    )

                # -----------------------------
                # 5) Compute totals FROM DB
                # -----------------------------
                subtotal = sum([Decimal(str(inv.subtotal or 0)) for inv in source_invoices]).quantize(Decimal("0.01"))
                discount_amount = sum([Decimal(str(inv.discount_amount or 0)) for inv in source_invoices]).quantize(Decimal("0.01"))
                tax_net_amount = sum([Decimal(str(inv.tax_net_amount or 0)) for inv in source_invoices]).quantize(Decimal("0.01"))
                total_tax = sum([Decimal(str(inv.total_tax or 0)) for inv in source_invoices]).quantize(Decimal("0.01"))

                cgst_amount = sum([Decimal(str(inv.cgst_amount or 0)) for inv in source_invoices]).quantize(Decimal("0.01"))
                sgst_amount = sum([Decimal(str(inv.sgst_amount or 0)) for inv in source_invoices]).quantize(Decimal("0.01"))

                grand_total = sum([Decimal(str(inv.amount or 0)) for inv in source_invoices]).quantize(Decimal("0.01"))

                # Effective % calculations (weighted)
                if subtotal > 0:
                    effective_discount_percent = (discount_amount / subtotal * Decimal("100.00")).quantize(Decimal("0.01"))
                else:
                    effective_discount_percent = Decimal("0.00")

                if tax_net_amount > 0:
                    effective_cgst_percent = (cgst_amount / tax_net_amount * Decimal("100.00")).quantize(Decimal("0.01"))
                    effective_sgst_percent = (sgst_amount / tax_net_amount * Decimal("100.00")).quantize(Decimal("0.01"))
                    effective_total_tax_percent = (total_tax / tax_net_amount * Decimal("100.00")).quantize(Decimal("0.01"))
                else:
                    effective_cgst_percent = Decimal("0.00")
                    effective_sgst_percent = Decimal("0.00")
                    effective_total_tax_percent = Decimal("0.00")

                # -----------------------------
                # 6) Mark source invoices as consolidated
                # -----------------------------
                for inv in source_invoices:
                    inv.is_consolidated = True
                    inv.consolidated_invoice_id = consolidate_id
                    inv.consolidated_date = date.today()
                    inv.save(update_fields=[
                        "is_consolidated",
                        "consolidated_invoice_id",
                        "consolidated_date",
                        "updated_at"
                    ])

                # -----------------------------
                # 7) Create consolidate invoice record
                # -----------------------------
                consolidate_invoice = HospitalInvoiceHistory.objects.create(
                    invoice_id=consolidate_id,
                    date=date.today(),
                    patient_name=payload.patient_name,
                    patient_id=payload.patient_id,
                    department="Billing Department",

                    subtotal=subtotal,
                    discount_percent=effective_discount_percent,
                    discount_amount=discount_amount,
                    tax_net_amount=tax_net_amount,
                    total_tax=total_tax,

                    cgst_percent=effective_cgst_percent,
                    cgst_amount=cgst_amount,
                    sgst_percent=effective_sgst_percent,
                    sgst_amount=sgst_amount,

                    amount=grand_total,

                    payment_method="Consolidated",
                    status="Paid",
                    payment_type="Consolidate",

                    paid_amount=grand_total,
                    pending_amount=Decimal("0.00"),

                    payment_date=date.today().isoformat(),
                    doctor="N/A",

                    phone=patient.phone_number if patient else "N/A",
                    email=patient.email_address if patient else "N/A",
                    address=patient.address if patient else "N/A",

                    transaction_id=consolidate_id,
                    consolidate_source_ids=json.dumps(payload.invoice_ids),

                    is_consolidated=False,
                )

                if patient:
                    patient.patient_type = "out-patient"
                    patient.save(update_fields=["patient_type"])

                # -----------------------------
                # 8) Build table rows (each item is a row)
                # -----------------------------
                all_rows = []
                row_no = 1

                for inv in source_invoices:
                    items = HospitalInvoiceItem.objects.filter(invoice=inv).order_by("s_no")

                    for item in items:
                        all_rows.append({
                            "s_no": row_no,
                            "invoice_id": inv.invoice_id,
                            "date": inv.date.strftime("%Y-%m-%d") if inv.date else "N/A",
                            "description": item.description,
                            "quantity": item.quantity,
                            "unit_price": float(item.unit_price or 0),
                            "amount": float(item.amount or 0),
                        })
                        row_no += 1

                # -----------------------------
                # 9) Template Data
                # -----------------------------
                consolidate_data = {
                    "invoice_ids": payload.invoice_ids,
                    "consolidate_id": consolidate_id,

                    "patient_id": payload.patient_id,
                    "patient_name": payload.patient_name,
                    "patient_address": patient.address if patient else "N/A",
                    "patient_phone": patient.phone_number if patient else "N/A",
                    "patient_email": patient.email_address if patient else "N/A",

                    "billing_staff": payload.billing_staff or "N/A",
                    "billing_staff_id": payload.billing_staff_id or "N/A",

                    "generated_date": payload.generated_date or date.today().strftime("%B %d, %Y"),
                    "today": datetime.now().strftime("%B %d, %Y"),

                    # NEW ROW LIST
                    "rows": all_rows,

                    # Totals
                    "subtotal": float(subtotal),
                    "discount_percent": float(effective_discount_percent),
                    "discount_amount": float(discount_amount),
                    "tax_net_amount": float(tax_net_amount),

                    "cgst_percent": float(effective_cgst_percent),
                    "cgst_amount": float(cgst_amount),

                    "sgst_percent": float(effective_sgst_percent),
                    "sgst_amount": float(sgst_amount),

                    "total_tax_percent": float(effective_total_tax_percent),
                    "total_tax": float(total_tax),

                    "grand_total": float(grand_total),

                    "amount_in_words": amount_to_words(grand_total),
                    "invoice_count": len(source_invoices),
                    "row_count": len(all_rows),
                }

                # -----------------------------
                # 10) Render & generate PDF
                # -----------------------------
                template = env.get_template("invoice_consolidate_template.html")
                html_string = template.render(**consolidate_data)

                pdf_filename = f"{consolidate_id}.pdf"
                pdf_path = os.path.join(PDF_OUTPUT_DIR, pdf_filename)

                try:
                    HTML(string=html_string, base_url=APP_DIR).write_pdf(pdf_path)
                except Exception as pdf_exc:
                    print(f"❌ WeasyPrint failed for consolidate invoice: {pdf_exc}")
                    raise HTTPException(500, f"PDF generation failed: {str(pdf_exc)}")

                consolidate_invoice.pdf_file = f"invoices_generator/{pdf_filename}"
                consolidate_invoice.save(update_fields=["pdf_file"])

                return pdf_path, consolidate_id, len(source_invoices), float(grand_total)

        pdf_path, consolidate_id, invoice_count, total_amount = await generate_and_save_consolidate_invoice()

        await NotificationService.send_hospital_bill_generated({
            "invoice_id": consolidate_id,
            "patient_name": payload.patient_name,
            "amount": total_amount,
            "invoice_count": invoice_count,
            "type": "consolidate_invoice"
        })

        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=f"{consolidate_id}.pdf",
            headers={
                "Content-Disposition": f"inline; filename={consolidate_id}.pdf",
                "X-Consolidate-ID": consolidate_id,
                "X-Invoice-Count": str(invoice_count),
                "X-Total-Amount": str(total_amount),
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating consolidate invoice: {str(e)}")
        import traceback
        traceback.print_exc()
        await NotificationService.send_billing_error(str(e), "Consolidate Invoice Generation")
        raise HTTPException(status_code=500, detail=f"Failed to generate consolidate invoice: {str(e)}")

        
@router.get("/patient/{patient_id}/available-paid-invoices")
async def get_available_paid_invoices(patient_id: str):
    """
    Get all PAID invoices for a patient that haven't been consolidated yet.
    Excludes invoices with payment_type="Consolidate".
    """

    try:
        @sync_to_async
        def fetch_available_invoices():
            ensure_db_connection()

            invoices = (
                HospitalInvoiceHistory.objects.filter(
                    patient_id=patient_id,
                    status="Paid",
                    is_consolidated=False,
                )
                .exclude(payment_type="Consolidate")
                .order_by("-date")
            )

            result = []
            for inv in invoices:
                cgst_percent = float(inv.cgst_percent or 0)
                sgst_percent = float(inv.sgst_percent or 0)

                cgst_amount = float(inv.cgst_amount or 0)
                sgst_amount = float(inv.sgst_amount or 0)

                # ✅ Tax percent is not stored directly in model
                tax_percent = cgst_percent + sgst_percent

                # ✅ total_tax exists in model, but if empty fallback to cgst+sgst
                total_tax = float(inv.total_tax or 0)
                if total_tax == 0:
                    total_tax = cgst_amount + sgst_amount

                result.append({
                    "invoice_id": inv.invoice_id,
                    "date": inv.date.isoformat() if hasattr(inv.date, "isoformat") else str(inv.date),

                    "patient_id": inv.patient_id,
                    "patient_name": inv.patient_name,
                    "department": inv.department,

                    "subtotal": float(inv.subtotal or 0),

                    "discount_percent": float(inv.discount_percent or 0),
                    "discount_amount": float(inv.discount_amount or 0),

                    "tax_net_amount": float(inv.tax_net_amount or 0),

                    # ✅ backward compatible fields
                    "tax_percent": tax_percent,
                    "total_tax": total_tax,

                    # ✅ GST split
                    "cgst_percent": cgst_percent,
                    "cgst_amount": cgst_amount,

                    "sgst_percent": sgst_percent,
                    "sgst_amount": sgst_amount,

                    "amount": float(inv.amount or 0),

                    "payment_method": inv.payment_method,
                    "status": inv.status,
                    "payment_type": inv.payment_type,

                    "paid_amount": float(inv.paid_amount or 0),
                    "pending_amount": float(inv.pending_amount or 0),

                    "is_consolidated": inv.is_consolidated,
                    "consolidated_invoice_id": inv.consolidated_invoice_id,
                    "consolidated_date": (
                        inv.consolidated_date.isoformat()
                        if inv.consolidated_date
                        else None
                    ),

                    # optional
                    "transaction_id": inv.transaction_id,
                    "payment_date": inv.payment_date,
                })

            return result

        invoices = await fetch_available_invoices()

        return {
            "patient_id": patient_id,
            "available_invoices": invoices,
            "count": len(invoices),
        }

    except Exception as e:
        print(f"Error fetching available paid invoices: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch available invoices")

@router.post("/settle-invoices", response_class=FileResponse)
async def settle_invoices(payload: SettleInvoicesIn):
    """
    Settle multiple pending invoices at once and generate a single settlement invoice
    using the dedicated settlement template. Creates a settlement invoice record.
    """
    print(f"📋 Settlement request - Patient: {payload.patient_id} | Invoices: {len(payload.invoice_ids)}")

    if not payload.invoice_ids:
        raise HTTPException(status_code=400, detail="At least one invoice ID is required")

    try:
        @sync_to_async
        def process_settlement():
            ensure_db_connection()

            with transaction.atomic():
                # -----------------------------
                # 1. Validate patient
                # -----------------------------
                try:
                    patient = Patient.objects.get(patient_unique_id=payload.patient_id)
                except Patient.DoesNotExist:
                    raise HTTPException(status_code=404, detail="Patient not found")

                # -----------------------------
                # 2. Get all invoices to settle
                # -----------------------------
                invoices = list(HospitalInvoiceHistory.objects.filter(
                    invoice_id__in=payload.invoice_ids,
                    patient_id=payload.patient_id
                ))

                if not invoices:
                    raise HTTPException(status_code=404, detail="No valid invoices found")

                # Preserve frontend selection order
                invoices.sort(key=lambda x: payload.invoice_ids.index(x.invoice_id))

                total_paid_today = Decimal("0.00")
                settlement_rows = []
                settlement_payments = []
                invoices_to_update = []
                all_charges_to_update = []

                # -----------------------------
                # 3. Process each invoice to settle
                # -----------------------------
                for inv in invoices:
                    total_amount = Decimal(str(inv.amount or 0)).quantize(Decimal("0.01"))
                    paid_so_far = Decimal(str(inv.paid_amount or 0)).quantize(Decimal("0.01"))
                    pending_now = Decimal(str(inv.pending_amount or 0)).quantize(Decimal("0.01"))

                    if pending_now <= 0:
                        continue

                    # Calculate payment number
                    payment_count = PartialPaymentHistory.objects.filter(invoice=inv).count()

                    # Add payment record
                    settlement_payments.append(PartialPaymentHistory(
                        invoice=inv,
                        payment_number=payment_count + 1,
                        payment_date=timezone.now().date(),
                        amount_paid=pending_now,
                        payment_method=payload.payment_method or "Cash",
                        transaction_id=f"SET_{timezone.now().strftime('%Y%m%d%H%M%S')}_{inv.invoice_id}",
                        remarks=payload.remarks or f"Settlement of {len(payload.invoice_ids)} invoices"
                    ))

                    # Update invoice
                    inv.paid_amount = (paid_so_far + pending_now).quantize(Decimal("0.01"))
                    inv.pending_amount = Decimal("0.00")
                    inv.status = "Paid"
                    inv.payment_type = "Settlement"
                    inv.payment_date = timezone.now().date()
                    invoices_to_update.append(inv)

                    # Update treatment charges
                    charges = TreatmentCharge.objects.filter(hospital_invoice=inv)
                    for charge in charges:
                        charge_amount = Decimal(str(charge.amount or 0)).quantize(Decimal("0.01"))
                        charge.billed_amount = charge_amount
                        charge.remaining_amount = Decimal("0.00")
                        charge.status = "BILLED"
                        all_charges_to_update.append(charge)

                    # Add row for settlement table
                    settlement_rows.append({
                        "invoice_id": inv.invoice_id,
                        "previously_paid": float(paid_so_far),
                        "pending_amount": float(pending_now),
                        "paid_now": float(pending_now),
                        "remaining": 0.00,
                        "department": inv.department or "General"
                    })

                    total_paid_today += pending_now

                if not settlement_rows:
                    raise HTTPException(status_code=400, detail="No invoices with pending amounts found")

                # -----------------------------
                # 4. Bulk update invoices
                # -----------------------------
                if invoices_to_update:
                    HospitalInvoiceHistory.objects.bulk_update(
                        invoices_to_update,
                        ["paid_amount", "pending_amount", "status", "payment_type", "payment_date"]
                    )

                # -----------------------------
                # 5. Bulk create payment records
                # -----------------------------
                if settlement_payments:
                    PartialPaymentHistory.objects.bulk_create(settlement_payments)

                # -----------------------------
                # 6. Bulk update treatment charges
                # -----------------------------
                if all_charges_to_update:
                    TreatmentCharge.objects.bulk_update(
                        all_charges_to_update,
                        ["billed_amount", "remaining_amount", "status"]
                    )

                # -----------------------------
                # 7. Create settlement invoice record
                # -----------------------------
                today = timezone.now().date()
                
                settlement_invoice = HospitalInvoiceHistory.objects.create(
                    date=today,
                    patient_name=patient.full_name,
                    patient_id=patient.patient_unique_id,
                    department="Billing",
                    
                    # All amounts are zero for settlement invoice (just a record)
                    subtotal=Decimal("0.00"),
                    total_tax=Decimal("0.00"),
                    amount=total_paid_today,  # Total amount is the settled amount
                    
                    payment_method=payload.payment_method or "Cash",
                    status="Paid",
                    payment_type="Settlement Invoice",
                    
                    admission_date=patient.admission_date,
                    discharge_date=patient.discharge_date,
                    doctor=patient.staff__full_name if hasattr(patient, 'staff__full_name') else "N/A",
                    
                    phone=patient.phone_number or "N/A",
                    email=patient.email_address or "N/A",
                    address=patient.address or "N/A",
                    
                    discount_percent=Decimal("0.00"),
                    discount_amount=Decimal("0.00"),
                    tax_net_amount=Decimal("0.00"),
                    
                    cgst_percent=Decimal("0.00"),
                    cgst_amount=Decimal("0.00"),
                    sgst_percent=Decimal("0.00"),
                    sgst_amount=Decimal("0.00"),
                    
                    transaction_id=f"SET_{timezone.now().strftime('%Y%m%d%H%M%S')}",
                    payment_date=today,
                    
                    paid_amount=total_paid_today,
                    pending_amount=Decimal("0.00"),
                    due_date=None,
                    payment_remarks=payload.remarks or f"Settlement of {len(settlement_rows)} invoices",
                )

                # -----------------------------
                # 8. Link settled invoices to this settlement invoice
                # (Optional: Create a many-to-many relationship if needed)
                # -----------------------------
                # You could add a field to track which invoices were settled in this settlement
                # For now, we'll just store it in remarks or create a separate model
                
                # -----------------------------
                # 9. Create a single line item for the settlement invoice
                # -----------------------------
                HospitalInvoiceItem.objects.create(
                    invoice=settlement_invoice,
                    s_no=1,
                    description=f"Settlement of {len(settlement_rows)} pending invoices",
                    quantity=len(settlement_rows),
                    unit_price=float(total_paid_today) / len(settlement_rows) if settlement_rows else 0,
                    amount=total_paid_today,
                )

                return {
                    "patient": patient,
                    "settlement_invoice": settlement_invoice,
                    "settlement_rows": settlement_rows,
                    "total_settled": float(total_paid_today),
                    "invoices_count": len(settlement_rows),
                    "payment_method": payload.payment_method or "Cash",
                    "transaction_id": settlement_invoice.transaction_id,
                    "remarks": settlement_invoice.payment_remarks,
                    "settlement_number": settlement_invoice.invoice_id,
                    "settlement_date": today.strftime("%Y-%m-%d")
                }

        # Execute DB transaction
        data = await process_settlement()
        patient = data["patient"]
        settlement_invoice = data["settlement_invoice"]

         # -----------------------------
        # 9. Generate amount in words using existing function
        # -----------------------------
        amount_in_words = amount_to_words(Decimal(str(data["total_settled"])))

        # -----------------------------
        # 10. Render settlement template
        # -----------------------------
        template = env.get_template("settlement_template.html")

        # Get department from first settled invoice or default
        department = data["settlement_rows"][0]["department"] if data["settlement_rows"] else "General"

        html_string = template.render(
            # Header info
            settlement_number=data["settlement_number"],
            settlement_date=data["settlement_date"],
            
            # Patient info
            patient_id=patient.patient_unique_id,
            patient_name=patient.full_name,
            address=patient.address or "N/A",
            phone=patient.phone_number or "N/A",
            email=patient.email_address or "N/A",
            admission_date=patient.admission_date.strftime("%Y-%m-%d") if patient.admission_date else "N/A",
            discharge_date=patient.discharge_date.strftime("%Y-%m-%d") if patient.discharge_date else "N/A",
            doctor=patient.staff__full_name if hasattr(patient, 'staff__full_name') else "N/A",
            department=department,
            
            # Payment info
            payment_method=data["payment_method"],
            transaction_id=data["transaction_id"],
            remarks=data["remarks"],
            
            # Settlement data
            settlement_rows=data["settlement_rows"],
            total_settled=data["total_settled"],
            invoices_count=data["invoices_count"],

            amount_in_words=amount_in_words,
            
            # Today's date
            today=timezone.now().date().strftime("%B %d, %Y")
        )

        # -----------------------------
        # 11. Generate PDF
        # -----------------------------
        pdf_filename = f"{settlement_invoice.invoice_id}.pdf"
        pdf_path = os.path.join(PDF_OUTPUT_DIR, pdf_filename)

        try:
            HTML(string=html_string, base_url=APP_DIR).write_pdf(pdf_path)
        except Exception as pdf_exc:
            print(f"❌ WeasyPrint failed: {pdf_exc}")
            raise HTTPException(500, f"PDF generation failed: {str(pdf_exc)}")

        # -----------------------------
        # 12. Save PDF path to invoice
        # -----------------------------
        settlement_invoice.pdf_file = f"invoices_generator/{pdf_filename}"
        await sync_to_async(settlement_invoice.save)(
    update_fields=["pdf_file"]
)

        # -----------------------------
        # 13. Send notification
        # -----------------------------
        asyncio.create_task(
            NotificationService.send_hospital_bill_generated({
                "invoice_id": settlement_invoice.invoice_id,
                "patient_id": patient.patient_unique_id,
                "patient_name": patient.full_name,
                "total_paid": float(data["total_settled"]),
                "invoices_count": data["invoices_count"],
                "action": "settlement"
            })
        )

        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=pdf_filename,
            headers={
                "Content-Disposition": f"inline; filename={pdf_filename}",
                "X-Invoice-ID": settlement_invoice.invoice_id,
                "X-Patient-ID": patient.patient_unique_id,
                "X-Total-Paid": str(data["total_settled"]),
                "X-Invoices-Count": str(data["invoices_count"]),
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Critical error in settle_invoices: {str(e)}")
        print(traceback.format_exc())
        await NotificationService.send_billing_error(
            str(e),
            bill_type="Settlement",
            reference_id=payload.patient_id
        )
        raise HTTPException(status_code=500, detail=f"Failed to settle invoices: {str(e)}")