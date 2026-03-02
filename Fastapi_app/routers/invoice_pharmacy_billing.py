# #fastapi_app/routers/invoice_pharmacy_billing.py
# from fastapi import APIRouter, HTTPException
# from fastapi.responses import FileResponse
# from pydantic import BaseModel
# from typing import List
# from jinja2 import Environment, FileSystemLoader
# from weasyprint import HTML
# import os
# from decimal import Decimal
# from datetime import date
# from HMS_backend.models import Stock


# # --------------
# # Django Setup
# # --------------
# import sys
# import django

# BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
# sys.path.append(BASE_DIR)

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_project.settings")
# django.setup()

# from django.db import transaction    #  <-- ADDED
# from HMS_backend.models import PharmacyInvoiceHistory, PharmacyInvoiceItem

# router = APIRouter()

# # ------------------------------
# # Path Setup
# # ------------------------------
# APP_DIR = os.path.dirname(os.path.dirname(__file__))   # fastapi_app/
# TEMPLATE_DIR = os.path.join(APP_DIR, "frontend")       # fastapi_app/frontend/
# INVOICE_OUTPUT_DIR = os.path.join(APP_DIR, "pharmacy", "invoices")

# os.makedirs(INVOICE_OUTPUT_DIR, exist_ok=True)

# env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))


# # ------------------------------
# # Number to Words
# # ------------------------------
# def number_to_words(amount):
#     try:
#         from num2words import num2words
#         return num2words(int(amount), to="cardinal").title() + " Only"
#     except:
#         return str(amount)


# # ------------------------------
# # Auto Generate Invoice Number
# # ------------------------------
# def generate_invoice_number():
#     last_invoice = PharmacyInvoiceHistory.objects.order_by("-id").first()

#     if not last_invoice:
#         return "PH_INV_0001"

#     try:
#         last_number = int(last_invoice.bill_no.split("_")[-1])
#     except:
#         last_number = 0

#     new_number = last_number + 1
#     return f"PH_INV_{new_number:04d}"



# # ------------------------------
# # Pydantic Models
# # ------------------------------
# class InvoiceItemSchema(BaseModel):
#     sl_no: int
#     item_code: str
#     drug_name: str
#     rack_no: str
#     shelf_no: str
#     quantity: int
#     unit_price: float
#     discount_pct: float
#     tax_pct: float


# class InvoiceSchema(BaseModel):
#     patient_name: str
#     patient_id: str
#     age: int
#     doctor_name: str
#     billing_staff: str
#     staff_id: str
#     patient_type: str
#     address_text: str
#     payment_type: str
#     payment_status: str
#     payment_mode: str
#     bill_date: date
#     discount_amount: float
#     cgst_percent: float
#     sgst_percent: float
#     items: List[InvoiceItemSchema]


# def reduce_stock_quantities(items):
#     """
#     Reduce stock quantities for all items in the invoice
#     """
#     stock_updates = []
    
#     for item in items:
#         try:
#             stock_item = Stock.objects.get(
#                 item_code=item.item_code,
#                 product_name=item.drug_name
#             )
            
#             if stock_item.quantity < item.quantity:
#                 raise ValueError(
#                     f"Insufficient stock for {item.drug_name}. "
#                     f"Required: {item.quantity}, Available: {stock_item.quantity}"
#                 )
            
#             stock_item.quantity -= item.quantity
            
#             if stock_item.quantity == 0:
#                 stock_item.status = 'outofstock'
            
#             stock_updates.append(stock_item)
            
#         except Stock.DoesNotExist:
#             raise ValueError(f"Stock item not found: {item.drug_name} (Code: {item.item_code})")
    
#     for stock_item in stock_updates:
#         stock_item.save()
    
#     return True


# # ---------------------------------------------------------
# #  POST API — Insert + Generate PDF (ATOMIC TRANSACTION)
# # ---------------------------------------------------------
# @router.post("/create-pharmacy-invoice", tags=["Pharmacy Invoice"])
# def create_pharmacy_invoice(data: InvoiceSchema):
#     try:
#         with transaction.atomic():   #  <-- FULL ATOMIC BLOCK ADDED
#             # -------------------
#             # Auto-generate number
#             # -------------------
#             auto_bill_no = generate_invoice_number()

#             # --------------------------------------------
#             # CALCULATE TOTALS
#             # --------------------------------------------
#             items_with_totals = []
#             subtotal = Decimal("0.00")

#             for item in data.items:
#                 line_total = Decimal(item.quantity) * Decimal(item.unit_price)
#                 subtotal += line_total

#                 items_with_totals.append({
#                     "sl_no": item.sl_no,
#                     "item_code": item.item_code,
#                     "drug_name": item.drug_name,
#                     "rack_no": item.rack_no,
#                     "shelf_no": item.shelf_no,
#                     "quantity": item.quantity,
#                     "unit_price": float(item.unit_price),
#                     "discount_pct": float(item.discount_pct),
#                     "tax_pct": float(item.tax_pct),
#                     "line_total": float(line_total)
#                 })

#             cgst_amount = (subtotal * Decimal(data.cgst_percent) / 100)
#             sgst_amount = (subtotal * Decimal(data.sgst_percent) / 100)
#             tax_total = cgst_amount + sgst_amount

#             grand_total = subtotal + tax_total - Decimal(data.discount_amount)

#             # --------------------------------------------
#             # REDUCE STOCK QUANTITIES
#             # --------------------------------------------
#             reduce_stock_quantities(data.items)

#             # --------------------------------------------
#             # SAVE Invoice Header
#             # --------------------------------------------
#             invoice = PharmacyInvoiceHistory.objects.create(
#                 bill_no=auto_bill_no,
#                 patient_name=data.patient_name,
#                 patient_id=data.patient_id,
#                 age=data.age,
#                 doctor_name=data.doctor_name,
#                 billing_staff=data.billing_staff,
#                 staff_id=data.staff_id,
#                 patient_type=data.patient_type,
#                 address_text=data.address_text,
#                 payment_type=data.payment_type,
#                 payment_status=data.payment_status,
#                 payment_mode=data.payment_mode,
#                 bill_date=data.bill_date,
#                 subtotal=float(subtotal),
#                 cgst_percent=data.cgst_percent,
#                 sgst_percent=data.sgst_percent,
#                 cgst_amount=float(cgst_amount),
#                 sgst_amount=float(sgst_amount),
#                 discount_amount=data.discount_amount,
#                 net_amount=float(grand_total),
#             )

#             # --------------------------------------------
#             # SAVE Line Items
#             # --------------------------------------------
#             for item in items_with_totals:
#                 PharmacyInvoiceItem.objects.create(
#                     invoice=invoice,
#                     sl_no=item["sl_no"],
#                     item_code=item["item_code"],
#                     drug_name=item["drug_name"],
#                     rack_no=item["rack_no"],
#                     shelf_no=item["shelf_no"],
#                     quantity=item["quantity"],
#                     unit_price=item["unit_price"],
#                     discount_pct=item["discount_pct"],
#                     tax_pct=item["tax_pct"],
#                     line_total=item["line_total"],
#                 )

#             # --------------------------------------------
#             # Prepare Data for Template (NO CHANGE)
#             # --------------------------------------------
#             db_invoice = PharmacyInvoiceHistory.objects.get(id=invoice.id)
#             db_items = PharmacyInvoiceItem.objects.filter(invoice=db_invoice).order_by("sl_no")

#             amount_words = number_to_words(grand_total)

#             template = env.get_template("invoice_pharmacy_template.html")

#             html_content = template.render(
#                 invoice=db_invoice,
#                 items=db_items,
#                 amount_in_words=amount_words,
#                 tax_total=float(tax_total),
#                 tax_percent=float(data.cgst_percent + data.sgst_percent),
#             )

#             # --------------------------------------------
#             # Generate PDF (NO CHANGE)
#             # --------------------------------------------
#             pdf_filename = f"{db_invoice.bill_no}.pdf"
#             pdf_path = os.path.join(INVOICE_OUTPUT_DIR, pdf_filename)

#             try:
#                 HTML(string=html_content, base_url=TEMPLATE_DIR).write_pdf(pdf_path)
#                 print(f"PDF generated successfully at: {pdf_path}")
#             except Exception as pdf_error:
#                 print(f"PDF generation error: {pdf_error}")
#                 raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(pdf_error)}")

#             db_invoice.path = os.path.abspath(pdf_path)
#             db_invoice.save()

#             if not os.path.exists(pdf_path):
#                 raise HTTPException(status_code=500, detail="PDF file was not created")

#         # Return file AFTER successful transaction
#         return FileResponse(
#             path=pdf_path,
#             media_type="application/pdf",
#             filename=pdf_filename,
#         )

#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     except Exception as e:
#         print(f"General error in create_pharmacy_invoice: {e}")
#         raise HTTPException(status_code=500, detail=f"Error creating invoice: {str(e)}")


# # ---------------------------------------------------------
# #  GET API — Get PDF by Invoice Number
# # ---------------------------------------------------------
# @router.get("/get-pharmacy-invoice/{bill_no}", tags=["Pharmacy Invoice"])
# def get_pharmacy_invoice(bill_no: str):
#     try:
#         invoice = PharmacyInvoiceHistory.objects.get(bill_no=bill_no)
#         if not invoice.path or not os.path.exists(invoice.path):
#             raise HTTPException(status_code=404, detail="PDF not found")
        
#         return FileResponse(
#             path=invoice.path,
#             media_type="application/pdf",
#             filename=f"{bill_no}.pdf",
#         )
#     except PharmacyInvoiceHistory.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Invoice not found")

# fastapi_app/routers/invoice_pharmacy_billing.py

# fastapi_app/routers/pharmacy_invoices.py
import os
import sys
from decimal import Decimal
from datetime import date, datetime
from typing import List, Dict, Any
import csv
import io

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
import tempfile
import zipfile
import time
import asyncio

# Async / sync bridging
from asgiref.sync import sync_to_async

# --------------------------
# Django setup
# --------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_project.settings")

import django
django.setup()

from django.db import close_old_connections, connection
 
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

# Import Django models
from django.db import transaction
from HMS_backend.models import (
    Stock,
    PharmacyInvoiceHistory,
    PharmacyInvoiceItem,
    Patient,
    MedicineAllocation  # ✅ ADD THIS IMPORT
)

# Import notification service
from Fastapi_app.routers.notifications import NotificationService

router = APIRouter(prefix="/pharmacy", tags=["Pharmacy Billing Management"])

# ------------------------------
# Paths and templates
# ------------------------------
APP_DIR = os.path.dirname(os.path.dirname(__file__))  # fastapi_app/
TEMPLATE_DIR = os.path.join(APP_DIR, "frontend")      # fastapi_app/frontend/
INVOICE_OUTPUT_DIR = os.path.join(APP_DIR, "pharmacy", "invoices")
os.makedirs(INVOICE_OUTPUT_DIR, exist_ok=True)

env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

# ------------------------------
# Pydantic schemas
# ------------------------------
class InvoiceItemSchema(BaseModel):
    sl_no: int
    item_code: str
    drug_name: str
    rack_no: str = ""
    shelf_no: str = ""
    quantity: int
    unit_price: float
    discount_pct: float = 0.0
    tax_pct: float = 0.0


class InvoiceSchema(BaseModel):
    patient_name: str
    patient_id: str
    age: int
    doctor_name: str = ""
    billing_staff: str
    staff_id: str
    patient_type: str
    address_text: str = ""
    payment_type: str = ""
    payment_status: str
    payment_mode: str = ""
    bill_date: date
    discount_amount: float = 0.0
    cgst_percent: float = 0.0
    sgst_percent: float = 0.0
    items: List[InvoiceItemSchema]

class InvoiceIds(BaseModel):
    ids: List[str]

# ------------------------------
# Helper: Delayed file removal
# ------------------------------
def delayed_remove(file_path: str, delay: int = 3):
    time.sleep(delay)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Failed to delete temp file {file_path}: {e}")

# ------------------------------
# Helper utilities
# ------------------------------
# fastapi_app/routers/pharmacy_invoices.py

def number_to_words(amount):
    """
    Convert amount to words with proper handling of decimals for Indian currency
    Example: 71.50 -> "Seventy-One and Fifty Paise Only"
    """
    try:
        from num2words import num2words
        
        # Split into rupees and paise
        rupees = int(amount)
        paise = int(round((amount - rupees) * 100))
        
        # Convert rupees to words
        rupees_words = num2words(rupees, to="cardinal", lang='en_IN').title()
        
        if paise > 0:
            # Convert paise to words
            paise_words = num2words(paise, to="cardinal", lang='en_IN').title()
            return f"{rupees_words} and {paise_words} Paise Only"
        else:
            return f"{rupees_words} Only"
            
    except Exception as e:
        print(f"Error in number_to_words: {e}")
        return str(amount)


@sync_to_async
def _get_last_invoice():
    ensure_db_connection()
    return PharmacyInvoiceHistory.objects.order_by("-id").first()

class StockCheckItem(BaseModel):
    item_code: str
    drug_name: str
    quantity_needed: int

class StockCheckRequest(BaseModel):
    items: List[StockCheckItem]

async def generate_invoice_number() -> str:
    last_invoice = await _get_last_invoice()
    if not last_invoice:
        return "PH_INV_0001"
    try:
        last_number = int(last_invoice.bill_no.split("_")[-1])
    except Exception:
        last_number = 0
    new_number = last_number + 1
    return f"PH_INV_{new_number:04d}"


# ------------------------------
# Reduce stock quantities (async-safe)
# ------------------------------
async def reduce_stock_quantities(items: List[InvoiceItemSchema]):
    await sync_to_async(ensure_db_connection)()
    low_stock_items = []
    out_of_stock_items = []

    for item in items:
        try:
            stock_item = await sync_to_async(Stock.objects.get)(
                item_code=item.item_code,
                product_name=item.drug_name
            )
        except Stock.DoesNotExist:
            raise ValueError(f"Stock item not found: {item.drug_name} (Code: {item.item_code})")

        if stock_item.quantity < item.quantity:
            raise ValueError(
                f"Insufficient stock for {item.drug_name}. "
                f"Required: {item.quantity}, Available: {stock_item.quantity}"
            )

        if stock_item.quantity <= 10 and stock_item.quantity > 0:
            low_stock_items.append(stock_item)

        stock_item.quantity -= item.quantity

        if stock_item.quantity <= 0:
            stock_item.quantity = 0
            stock_item.status = "outofstock"
            out_of_stock_items.append(stock_item)
        elif stock_item.quantity <= 5:
            low_stock_items.append(stock_item)

        await sync_to_async(stock_item.save)()

    return low_stock_items, out_of_stock_items

# ------------------------------
# ✅ Mark medicine allocations as billed
# ------------------------------
# fastapi_app/routers/pharmacy_invoices.py

async def mark_medicine_allocations_as_billed(patient_id: str, invoice, invoice_items: List[InvoiceItemSchema]):
    """
    Mark only the specific medicine allocations that are included in the invoice as 'billed'
    """
    await sync_to_async(ensure_db_connection)()
    try:
        # Get the patient
        patient = await sync_to_async(
            Patient.objects.filter(patient_unique_id=patient_id).first
        )()
        
        if not patient:
            print(f"⚠️ Patient not found: {patient_id}")
            return
        
        # Extract medicine names from invoice items
        medicine_names = [item.drug_name for item in invoice_items]
        
        print(f"🔍 Looking for allocations with medicines: {medicine_names}")
        
        # Get only the pending allocations that match the medicines in the invoice
        allocations = await sync_to_async(list)(
            MedicineAllocation.objects.filter(
                patient=patient,
                medicine_name__in=medicine_names,  # Only filter by medicine names
                billing_status="pending"  # Only pending allocations
            )
        )
        
        count = 0
        for allocation in allocations:
            # Double-check that this medicine is actually in the invoice
            if allocation.medicine_name in medicine_names:
                allocation.billing_status = "billed"  # ✅ Set to billed
                allocation.pharmacy_invoice = invoice  # ✅ Link to invoice
                await sync_to_async(allocation.save)()
                count += 1
                print(f"✅ Marked allocation {allocation.id} ({allocation.medicine_name}) as billed")
            else:
                print(f"⏸️ Allocation {allocation.id} ({allocation.medicine_name}) remains pending")
        
        print(f"✅ Marked {count} medicine allocations as billed for patient {patient_id}")
        
    except Exception as e:
        print(f"❌ Error marking allocations as billed: {str(e)}")
        # Don't raise error, just log it
        # Don't raise error, just log it

# ------------------------------
# ✅ Mark allocations as paid when invoice is paid
# ------------------------------
async def mark_allocations_as_paid(invoice_id: str):
    """
    Mark medicine allocations as 'paid' when invoice payment status changes to 'paid'
    """
    await sync_to_async(ensure_db_connection)()
    try:
        invoice = await sync_to_async(
            PharmacyInvoiceHistory.objects.filter(bill_no=invoice_id).first
        )()
        
        if not invoice:
            print(f"⚠️ Invoice not found: {invoice_id}")
            return
        
        # Get all billed allocations linked to this invoice
        allocations = await sync_to_async(list)(
            MedicineAllocation.objects.filter(
                pharmacy_invoice=invoice,
                billing_status="billed"  # Only billed allocations
            )
        )
        
        count = 0
        for allocation in allocations:
            allocation.billing_status = "paid"  # ✅ Set to paid
            await sync_to_async(allocation.save)()
            count += 1
        
        print(f"✅ Marked {count} medicine allocations as paid for invoice {invoice_id}")
        
    except Exception as e:
        print(f"❌ Error marking allocations as paid: {str(e)}")
        # Don't raise error, just log it

# ------------------------------
# Utility wrappers
# ------------------------------
@sync_to_async
def _get_invoice_by_id(inv_id):
    ensure_db_connection()
    return PharmacyInvoiceHistory.objects.get(id=inv_id)

@sync_to_async
def _get_invoice_by_billno(bill_no):
    ensure_db_connection()
    return PharmacyInvoiceHistory.objects.get(bill_no=bill_no)

@sync_to_async
def _get_invoice_items_for_invoice(invoice):
    ensure_db_connection()
    return list(PharmacyInvoiceItem.objects.filter(invoice=invoice).order_by("sl_no"))

@sync_to_async
def _create_invoice_atomic(auto_bill_no: str, data: InvoiceSchema):
    ensure_db_connection()
    with transaction.atomic():
        subtotal = Decimal("0.00")
        items_with_totals = []

        for item in data.items:
            line_total = Decimal(item.quantity) * Decimal(item.unit_price)
            subtotal += line_total
            items_with_totals.append({
                "sl_no": item.sl_no,
                "item_code": item.item_code,
                "drug_name": item.drug_name,
                "rack_no": item.rack_no,
                "shelf_no": item.shelf_no,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "discount_pct": float(item.discount_pct),
                "tax_pct": float(item.tax_pct),
                "line_total": float(line_total)
            })

        cgst_amount = (subtotal * Decimal(data.cgst_percent) / 100)
        sgst_amount = (subtotal * Decimal(data.sgst_percent) / 100)
        tax_total = cgst_amount + sgst_amount
        grand_total = subtotal + tax_total - Decimal(data.discount_amount)

        invoice = PharmacyInvoiceHistory.objects.create(
            bill_no=auto_bill_no,
            patient_name=data.patient_name,
            patient_id=data.patient_id,
            age=data.age,
            doctor_name=data.doctor_name,
            billing_staff=data.billing_staff,
            staff_id=data.staff_id,
            patient_type=data.patient_type,
            address_text=data.address_text,
            payment_type=data.payment_type,
            payment_status=data.payment_status,
            payment_mode=data.payment_mode,
            bill_date=data.bill_date,
            subtotal=float(subtotal),
            cgst_percent=data.cgst_percent,
            cgst_amount=float(cgst_amount),
            sgst_percent=data.sgst_percent,
            sgst_amount=float(sgst_amount),
            discount_amount=data.discount_amount,
            net_amount=float(grand_total),
        )

        for item in items_with_totals:
            PharmacyInvoiceItem.objects.create(
                invoice=invoice,
                sl_no=item["sl_no"],
                item_code=item["item_code"],
                drug_name=item["drug_name"],
                rack_no=item["rack_no"],
                shelf_no=item["shelf_no"],
                quantity=item["quantity"],
                unit_price=item["unit_price"],
                discount_pct=item["discount_pct"],
                tax_pct=item["tax_pct"],
                line_total=item["line_total"],
            )

        return invoice.id, float(grand_total), float(tax_total), invoice

# ------------------------------
# API: CREATE PHARMACY INVOICE
# ------------------------------
@router.post("/create-invoice", tags=["Pharmacy Invoice"])
async def create_pharmacy_invoice(data: InvoiceSchema):
    auto_bill_no = None
    try:
        auto_bill_no = await generate_invoice_number()
        invoice_id, grand_total, tax_total, invoice_obj = await _create_invoice_atomic(auto_bill_no, data)
        
        low_stock_items, out_of_stock_items = await reduce_stock_quantities(data.items)
        
        # ✅ MARK ALLOCATIONS AS BILLED
        await mark_medicine_allocations_as_billed(data.patient_id, invoice_obj, data.items)

        db_invoice = await _get_invoice_by_id(invoice_id)
        db_items = await _get_invoice_items_for_invoice(db_invoice)

        amount_words = number_to_words(grand_total)
        template = env.get_template("invoice_pharmacy_template.html")
        html_content = template.render(
            invoice=db_invoice,
            items=db_items,
            amount_in_words=amount_words,
            tax_total=tax_total,
            tax_percent=float(data.cgst_percent + data.sgst_percent),
            cgst_percent=float(data.cgst_percent),  # ✅ Add this
            sgst_percent=float(data.sgst_percent),  # ✅ Add this
            cgst_amount=float(db_invoice.cgst_amount),  # ✅ Add this
            sgst_amount=float(db_invoice.sgst_amount),  # ✅ Add this
        )

        pdf_filename = f"{db_invoice.bill_no}.pdf"
        pdf_path = os.path.join(INVOICE_OUTPUT_DIR, pdf_filename)
        await sync_to_async(HTML(string=html_content, base_url=TEMPLATE_DIR).write_pdf)(pdf_path)

        db_invoice.path = os.path.abspath(pdf_path)
        await sync_to_async(db_invoice.save)()

        invoice_data = {
            "bill_no": auto_bill_no,
            "patient_name": data.patient_name,
            "patient_id": data.patient_id,
            "net_amount": grand_total,
            "payment_status": data.payment_status,
            "billing_staff": data.billing_staff,
            "patient_type": data.patient_type,
            "payment_mode": data.payment_mode,
            "doctor_name": data.doctor_name
        }

        # Send notifications
        await NotificationService.send_pharmacy_bill_generated(invoice_data)
        
        if data.payment_status.lower() == "paid":
            await NotificationService.send_pharmacy_payment_received(invoice_data)
            # ✅ MARK ALLOCATIONS AS PAID
            await mark_allocations_as_paid(auto_bill_no)

        # Stock notifications
        for stock in low_stock_items:
            if getattr(stock, "quantity", 0) > 0:
                await NotificationService.send_stock_low_alert({
                    "product_name": stock.product_name,
                    "item_code": stock.item_code,
                    "quantity": stock.quantity,
                    "batch_number": getattr(stock, "batch_number", ""),
                    "vendor": getattr(stock, "vendor", ""),
                    "rack_no": getattr(stock, "rack_no", ""),
                    "shelf_no": getattr(stock, "shelf_no", "")
                })

        for stock in out_of_stock_items:
            await NotificationService.send_stock_out_alert({
                "product_name": stock.product_name,
                "item_code": stock.item_code,
                "batch_number": getattr(stock, "batch_number", ""),
                "vendor": getattr(stock, "vendor", ""),
                "rack_no": getattr(stock, "rack_no", ""),
                "shelf_no": getattr(stock, "shelf_no", "")
            })

        await NotificationService.send_pdf_downloaded(invoice_id=auto_bill_no, bulk=False, count=1)

        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="PDF generation failed")

        return FileResponse(path=pdf_path, media_type="application/pdf", filename=pdf_filename)

    except ValueError as ve:
        await NotificationService.send_billing_error(
            error_message=str(ve),
            bill_type="Pharmacy",
            reference_id=auto_bill_no
        )
        raise HTTPException(status_code=400, detail=str(ve))

    except Exception as e:
        await NotificationService.send_billing_error(
            error_message=f"Error creating pharmacy invoice: {str(e)}",
            bill_type="Pharmacy",
            reference_id=auto_bill_no
        )
        raise HTTPException(status_code=500, detail=f"Error creating invoice: {str(e)}")

# ------------------------------
# API: GET PDF by bill_no
# ------------------------------
@router.get("/invoice/{bill_no}")
async def get_pharmacy_invoice(bill_no: str):
    try:
        invoice = await sync_to_async(PharmacyInvoiceHistory.objects.get)(bill_no=bill_no)
        if not invoice.path or not os.path.exists(invoice.path):
            await NotificationService.send_invoice_not_found(bill_no)
            raise HTTPException(status_code=404, detail="PDF not found")

        await NotificationService.send_pdf_downloaded(invoice_id=bill_no, bulk=False, count=1)
        
        # Add notification for bill access
        await NotificationService.send_pharmacy_bill_generated({
            "bill_no": bill_no,
            "patient_name": invoice.patient_name,
            "patient_id": invoice.patient_id,
            "net_amount": float(getattr(invoice, "net_amount", 0)),
            "payment_status": invoice.payment_status,
            "billing_staff": invoice.billing_staff,
            "patient_type": invoice.patient_type,
            "payment_mode": invoice.payment_mode,
            "doctor_name": invoice.doctor_name
        })

        return FileResponse(path=invoice.path, media_type="application/pdf", filename=f"{bill_no}.pdf")

    except PharmacyInvoiceHistory.DoesNotExist:
        await NotificationService.send_invoice_not_found(bill_no)
        raise HTTPException(status_code=404, detail="Invoice not found")
    except Exception as e:
        await NotificationService.send_billing_error(
            error_message=f"Error retrieving pharmacy invoice: {str(e)}",
            bill_type="Pharmacy",
            reference_id=bill_no
        )
        raise HTTPException(status_code=500, detail=f"Error retrieving invoice: {str(e)}")

# ------------------------------
# API: LIST INVOICES
# ------------------------------
@router.get("/invoices", response_model=List[Dict[str, Any]])
async def list_pharmacy_invoices():
    try:
        await sync_to_async(ensure_db_connection)()
        invoices_qs = await sync_to_async(list)(PharmacyInvoiceHistory.objects.all().order_by('-created_at'))
        invoice_list = []
        for invoice in invoices_qs:
            invoice_list.append({
                "bill_no": invoice.bill_no,
                "patient_name": invoice.patient_name,
                "patient_id": invoice.patient_id,
                "net_amount": float(getattr(invoice, "net_amount", 0.0)),
                "payment_status": invoice.payment_status,
                "bill_date": invoice.bill_date.isoformat() if invoice.bill_date else None,
                "created_at": invoice.created_at.isoformat() if getattr(invoice, "created_at", None) else None,
                "path": invoice.path
            })
        return invoice_list
    except Exception as e:
        await NotificationService.send_billing_error(
            error_message=f"Error listing pharmacy invoices: {str(e)}",
            bill_type="Pharmacy",
            reference_id=None
        )
        raise HTTPException(status_code=500, detail=f"Error listing invoices: {str(e)}")

# ------------------------------
# API: DELETE INVOICE
# ------------------------------
@router.delete("/invoice/{bill_no}")
async def delete_pharmacy_invoice(bill_no: str):
    try:
        await sync_to_async(ensure_db_connection)()
        invoice = await sync_to_async(PharmacyInvoiceHistory.objects.get)(bill_no=bill_no)
        invoice_data = {
            "invoice_id": invoice.bill_no,
            "patient_name": invoice.patient_name,
            "patient_id": invoice.patient_id,
            "amount": float(getattr(invoice, "net_amount", 0.0)),
            "status": invoice.payment_status,
            "department": "Pharmacy",
            "payment_method": invoice.payment_mode
        }

        await sync_to_async(PharmacyInvoiceItem.objects.filter(invoice=invoice).delete)()
        await sync_to_async(invoice.delete)()

        await NotificationService.send_invoice_deleted(invoice_data)
        
        return {"detail": f"Pharmacy Invoice {bill_no} deleted successfully"}

    except PharmacyInvoiceHistory.DoesNotExist:
        await NotificationService.send_invoice_not_found(bill_no)
        raise HTTPException(status_code=404, detail="Invoice not found")
    except Exception as e:
        await NotificationService.send_billing_error(
            error_message=f"Error deleting pharmacy invoice: {str(e)}",
            bill_type="Pharmacy",
            reference_id=bill_no
        )
        raise HTTPException(status_code=500, detail=f"Error deleting invoice: {str(e)}")

# ------------------------------
# API: UPDATE PAYMENT STATUS
# ------------------------------
@router.patch("/invoice/{bill_no}/status")
async def update_pharmacy_payment_status(bill_no: str, status: str):
    try:
        await sync_to_async(ensure_db_connection)()
        invoice = await sync_to_async(PharmacyInvoiceHistory.objects.get)(bill_no=bill_no)
        old_status = invoice.payment_status
        invoice.payment_status = status
        await sync_to_async(invoice.save)()

        invoice_data = {
            "invoice_id": invoice.bill_no,
            "patient_name": invoice.patient_name,
            "patient_id": invoice.patient_id,
            "amount": float(getattr(invoice, "net_amount", 0.0)),
            "status": status,
            "department": "Pharmacy",
            "payment_method": invoice.payment_mode
        }

        await NotificationService.send_invoice_status_changed(invoice_data, old_status, status)

        if status.lower() == "paid":
            await NotificationService.send_pharmacy_payment_received({
                "bill_no": invoice.bill_no,
                "patient_name": invoice.patient_name,
                "patient_id": invoice.patient_id,
                "net_amount": float(getattr(invoice, "net_amount", 0.0)),
                "payment_mode": invoice.payment_mode,
                "payment_type": invoice.payment_type,
            })
            
            # ✅ MARK ALLOCATIONS AS PAID
            await mark_allocations_as_paid(bill_no)

        return invoice_data

    except PharmacyInvoiceHistory.DoesNotExist:
        await NotificationService.send_invoice_not_found(bill_no)
        raise HTTPException(status_code=404, detail="Invoice not found")
    except Exception as e:
        await NotificationService.send_billing_error(
            error_message=f"Error updating payment status: {str(e)}",
            bill_type="Pharmacy",
            reference_id=bill_no
        )
        raise HTTPException(status_code=500, detail=f"Error updating status: {str(e)}")

# ------------------------------
# API: Download Multiple PDFs
# ------------------------------
@router.post("/download-selected")
async def download_selected_pharmacy_invoices(invoice_ids: InvoiceIds, background_tasks: BackgroundTasks):
    try:
        with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp_file:
            zip_path = tmp_file.name

        with zipfile.ZipFile(zip_path, "w") as zipf:
            added = False
            for bill_no in invoice_ids.ids:
                try:
                    await sync_to_async(ensure_db_connection)()
                    invoice = await sync_to_async(PharmacyInvoiceHistory.objects.get)(bill_no=bill_no)
                    if invoice.path and os.path.exists(invoice.path):
                        zipf.write(invoice.path, f"{bill_no}.pdf")
                        added = True
                except PharmacyInvoiceHistory.DoesNotExist:
                    continue

            if not added:
                os.remove(zip_path)
                raise HTTPException(status_code=404, detail="No PDFs found for selected invoices")

        background_tasks.add_task(delayed_remove, zip_path)

        await NotificationService.send_pdf_downloaded(
            invoice_id="Multiple", 
            bulk=True, 
            count=len(invoice_ids.ids)
        )

        return FileResponse(
            zip_path,
            media_type="application/zip",
            filename="selected_pharmacy_invoices.zip",
            headers={"Access-Control-Expose-Headers": "Content-Disposition"}
        )

    except Exception as e:
        if 'zip_path' in locals() and os.path.exists(zip_path):
            try:
                os.remove(zip_path)
            except:
                pass
        await NotificationService.send_billing_error(
            error_message=f"Error downloading selected pharmacy PDFs: {str(e)}",
            bill_type="Pharmacy PDF Download"
        )
        raise HTTPException(status_code=500, detail=f"Failed to download PDFs: {str(e)}")

# ------------------------------
# API: Export CSV
# ------------------------------
@router.get("/export/csv")
async def export_pharmacy_invoices_csv():
    try:
        await sync_to_async(ensure_db_connection)()
        invoices = await sync_to_async(list)(PharmacyInvoiceHistory.objects.all())
        if not invoices:
            raise HTTPException(status_code=404, detail="No invoices found")

        output = io.StringIO()
        fieldnames = ["bill_no", "patient_name", "patient_id", "net_amount", "payment_status", "bill_date", "payment_mode"]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for inv in invoices:
            writer.writerow({
                "bill_no": inv.bill_no,
                "patient_name": inv.patient_name,
                "patient_id": inv.patient_id,
                "net_amount": float(getattr(inv, "net_amount", 0)),
                "payment_status": inv.payment_status,
                "bill_date": inv.bill_date.isoformat() if inv.bill_date else "",
                "payment_mode": inv.payment_mode
            })

        output.seek(0)

        await NotificationService.send_pharmacy_bulk_export({
            "export_type": "CSV",
            "invoice_count": len(invoices)
        })

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=pharmacy_invoices.csv"}
        )
    except Exception as e:
        await NotificationService.send_billing_error(
            error_message=f"Error exporting pharmacy invoices CSV: {str(e)}",
            bill_type="Pharmacy",
            reference_id=None
        )
        raise HTTPException(status_code=500, detail=f"Error exporting CSV: {str(e)}")

# ------------------------------
# API: STATS
# ------------------------------
@router.get("/stats")
async def get_pharmacy_invoice_stats():
    try:
        from django.db.models import Sum, Count, Avg

        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        await sync_to_async(ensure_db_connection)()
        today_stats = await sync_to_async(lambda: PharmacyInvoiceHistory.objects.filter(
            created_at__gte=today_start).aggregate(
                total_invoices=Count('id'),
                total_amount=Sum('net_amount'),
                avg_amount=Avg('net_amount')
        ))()

        await sync_to_async(ensure_db_connection)()
        month_stats = await sync_to_async(lambda: PharmacyInvoiceHistory.objects.filter(
            created_at__gte=month_start).aggregate(
                total_invoices=Count('id'),
                total_amount=Sum('net_amount'),
                avg_amount=Avg('net_amount')
        ))()

        await sync_to_async(ensure_db_connection)()
        status_breakdown = await sync_to_async(lambda: list(
            PharmacyInvoiceHistory.objects.values('payment_status').annotate(
                count=Count('id'),
                total=Sum('net_amount')
            )
        ))()

        await sync_to_async(ensure_db_connection)()
        recent_invoices_qs = await sync_to_async(list)(PharmacyInvoiceHistory.objects.order_by('-created_at')[:5])

        stats = {
            "today": {
                "total_invoices": int(today_stats.get('total_invoices') or 0),
                "total_amount": float(today_stats.get('total_amount') or 0),
                "avg_amount": float(today_stats.get('avg_amount') or 0)
            },
            "this_month": {
                "total_invoices": int(month_stats.get('total_invoices') or 0),
                "total_amount": float(month_stats.get('total_amount') or 0),
                "avg_amount": float(month_stats.get('avg_amount') or 0)
            },
            "payment_status_breakdown": [
                {
                    "status": item['payment_status'],
                    "count": int(item['count']),
                    "total": float(item['total'] or 0)
                } for item in status_breakdown
            ],
            "recent_invoices": [
                {
                    "bill_no": inv.bill_no,
                    "patient_name": inv.patient_name,
                    "net_amount": float(getattr(inv, "net_amount", 0.0)),
                    "payment_status": inv.payment_status,
                    "created_at": inv.created_at.isoformat() if getattr(inv, "created_at", None) else None
                }
                for inv in recent_invoices_qs
            ]
        }

        await NotificationService.send_statistics_updated({
            "total_invoices": stats["this_month"]["total_invoices"],
            "total_amount": stats["this_month"]["total_amount"],
            "today_invoices": stats["today"]["total_invoices"],
            "today_amount": stats["today"]["total_amount"]
        })

        return stats

    except Exception as e:
        await NotificationService.send_billing_error(
            error_message=f"Error getting statistics: {str(e)}",
            bill_type="Pharmacy",
            reference_id=None
        )
        raise HTTPException(status_code=500, detail=f"Error getting statistics: {str(e)}")