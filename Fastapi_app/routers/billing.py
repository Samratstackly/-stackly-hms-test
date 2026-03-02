# #fastapi_app/routers/billing.py

# from fastapi import APIRouter, HTTPException, BackgroundTasks
# from pydantic import BaseModel
# from HMS_backend.models import PharmacyInvoiceHistory, Patient
# from datetime import date
# from typing import List
# import csv
# import io
# from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
# import openpyxl
# import os
# from zipfile import ZipFile
# import tempfile

# router = APIRouter(prefix="/billing", tags=["Billing Management"])

# # -------------------------------
# # Pydantic Schema
# # -------------------------------
# class InvoiceSchema(BaseModel):
#     invoice_id: str
#     date: str  # Changed to str for JSON serialization
#     patient_name: str
#     patient_id: str
#     department: str
#     amount: float
#     payment_method: str
#     status: str

# class InvoiceIds(BaseModel):
#     ids: List[str]

# # -------------------------------
# # Helper to get invoice data
# # -------------------------------
# def get_invoice_data(invoice):
#     dept = "Unknown"
#     try:
#         patient = Patient.objects.get(patient_unique_id=invoice.patient_id)
#         if patient.department:
#             dept = patient.department.name
#     except Patient.DoesNotExist:
#         pass
#     except Exception as e:
#         print(f"Error getting patient for {invoice.patient_id}: {e}")
    
#     try:
#         date_str = invoice.bill_date.isoformat() if hasattr(invoice.bill_date, 'isoformat') else str(invoice.bill_date)
#     except:
#         date_str = str(invoice.bill_date)
    
#     return {
#         "invoice_id": invoice.bill_no,
#         "date": date_str,
#         "patient_name": invoice.patient_name,
#         "patient_id": invoice.patient_id,
#         "department": dept,
#         "amount": float(invoice.net_amount),
#         "payment_method": invoice.payment_mode or "-",
#         "status": invoice.payment_status,
#     }

# # -------------------------------
# # CRUD Endpoints
# # -------------------------------
# @router.post("/", response_model=InvoiceSchema)
# def create_invoice(data: InvoiceSchema):
#     try:
#         # Note: This is simplified; in production, handle Patient creation/update for department, etc.
#         # For now, create without department (as it's not in model)
#         invoice = PharmacyInvoiceHistory.objects.create(
#             bill_no=data.invoice_id,
#             patient_name=data.patient_name,
#             patient_id=data.patient_id,
#             # Add other required fields with defaults or from data
#             age=0,  # Placeholder
#             doctor_name="Unknown",  # Placeholder
#             billing_staff="Unknown",  # Placeholder
#             staff_id="Unknown",  # Placeholder
#             patient_type="Outpatient",  # Default
#             address_text="",  # Placeholder
#             payment_type=data.payment_method,  # Map
#             payment_status=data.status,  # Map
#             payment_mode=data.payment_method,  # Map
#             bill_date=date.fromisoformat(data.date),
#             subtotal=data.amount,  # Simplified
#             cgst_percent=0, cgst_amount=0,
#             sgst_percent=0, sgst_amount=0,
#             discount_amount=0,
#             net_amount=data.amount,
#         )
#         return get_invoice_data(invoice)
#     except Exception as e:
#         print(f"Error creating invoice: {e}")
#         raise HTTPException(status_code=500, detail=f"Failed to create invoice: {str(e)}")

# @router.get("/", response_model=List[InvoiceSchema])
# def list_invoices():
#     try:
#         invoices = PharmacyInvoiceHistory.objects.all()
#         data = [get_invoice_data(inv) for inv in invoices]
#         return data
#     except Exception as e:
#         print(f"Error in list_invoices: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Failed to fetch invoices: {str(e)}")

# @router.get("/{invoice_id}", response_model=InvoiceSchema)
# def get_invoice(invoice_id: str):
#     try:
#         invoice = PharmacyInvoiceHistory.objects.get(bill_no=invoice_id)
#         return get_invoice_data(invoice)
#     except PharmacyInvoiceHistory.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Invoice not found")
#     except Exception as e:
#         print(f"Error getting invoice {invoice_id}: {e}")
#         raise HTTPException(status_code=500, detail=f"Failed to get invoice: {str(e)}")

# @router.delete("/{invoice_id}")
# def delete_invoice(invoice_id: str):
#     try:
#         invoice = PharmacyInvoiceHistory.objects.get(bill_no=invoice_id)
#         invoice.delete()
#         return {"detail": f"Invoice {invoice_id} deleted successfully"}
#     except PharmacyInvoiceHistory.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Invoice not found")
#     except Exception as e:
#         print(f"Error deleting invoice {invoice_id}: {e}")
#         raise HTTPException(status_code=500, detail=f"Failed to delete invoice: {str(e)}")

# # -------------------------------
# # PDF Endpoints
# # -------------------------------
# @router.get("/pdf/{invoice_id}")
# def get_pdf(invoice_id: str):
#     BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
#     INVOICE_DIR = os.path.join(BASE_DIR, "fastapi_app", "pharmacy", "invoices")
#     pdf_path = os.path.join(INVOICE_DIR, f"{invoice_id}.pdf")
#     if not os.path.exists(pdf_path):
#         raise HTTPException(status_code=404, detail="PDF not found")
#     return FileResponse(pdf_path, media_type="application/pdf", filename=f"{invoice_id}.pdf")

# @router.post("/download-selected")
# def download_selected(invoice_ids: InvoiceIds, background_tasks: BackgroundTasks):
#     try:
#         # Correct BASE_DIR to project root
#         BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
#         INVOICE_DIR = os.path.join(BASE_DIR, "fastapi_app", "pharmacy", "invoices")  # Add "fastapi_app"
        
#         # Use NamedTemporaryFile for safety
#         with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp_file:
#             zip_path = tmp_file.name
        
#         with ZipFile(zip_path, "w") as zipf:
#             added = False
#             for invoice_id in invoice_ids.ids:
#                 pdf_path = os.path.join(INVOICE_DIR, f"{invoice_id}.pdf")
#                 if os.path.exists(pdf_path):
#                     zipf.write(pdf_path, f"{invoice_id}.pdf")
#                     added = True
#                 else:
#                     print(f"PDF not found for {invoice_id} at {pdf_path}")
#             if not added:
#                 os.remove(zip_path)
#                 raise HTTPException(status_code=404, detail="No PDFs found for selected invoices")
        
#         # Delete after response is sent
#         background_tasks.add_task(os.remove, zip_path)
#         return FileResponse(zip_path, media_type="application/zip", filename="selected_invoices.zip")
#     except Exception as e:
#         # Cleanup on error
#         if 'zip_path' in locals() and os.path.exists(zip_path):
#             os.remove(zip_path)
#         print(f"Error downloading selected PDFs: {e}")
#         raise HTTPException(status_code=500, detail=f"Failed to download PDFs: {str(e)}")

# # -------------------------------
# # Export Endpoints (CSV/Excel)
# # -------------------------------
# @router.get("/export/csv")
# def export_invoices_csv():
#     try:
#         invoices = PharmacyInvoiceHistory.objects.all()
#         invoice_list = [get_invoice_data(inv) for inv in invoices]
#         if not invoice_list:
#             raise HTTPException(status_code=404, detail="No invoices found")
        
#         output = io.StringIO()
#         fieldnames = list(invoice_list[0].keys())
#         writer = csv.DictWriter(output, fieldnames=fieldnames)
#         writer.writeheader()
#         writer.writerows(invoice_list)
#         output.seek(0)
#         return StreamingResponse(
#             iter([output.getvalue()]),
#             media_type="text/csv",
#             headers={"Content-Disposition": "attachment; filename=invoices.csv"}
#         )
#     except Exception as e:
#         print(f"Error exporting CSV: {e}")
#         raise HTTPException(status_code=500, detail=f"Failed to export CSV: {str(e)}")

# @router.get("/export/excel")
# def export_invoices_excel():
#     try:
#         invoices = PharmacyInvoiceHistory.objects.all()
#         invoice_list = [get_invoice_data(inv) for inv in invoices]
#         if not invoice_list:
#             raise HTTPException(status_code=404, detail="No invoices found")
        
#         wb = openpyxl.Workbook()
#         ws = wb.active
#         ws.title = "Invoices"
#         fieldnames = list(invoice_list[0].keys())
#         ws.append(fieldnames)
#         for row in invoice_list:
#             ws.append(list(row.values()))
#         output = io.BytesIO()
#         wb.save(output)
#         output.seek(0)
#         return StreamingResponse(
#             output,
#             media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
#             headers={"Content-Disposition": "attachment; filename=invoices.xlsx"}
#         )
#     except Exception as e:
#         print(f"Error exporting Excel: {e}")
#         raise HTTPException(status_code=500, detail=f"Failed to export Excel: {str(e)}")

# fastapi_app/routers/billing.py

# fastapi_app/routers/billing.py

# fastapi_app/routers/billing.py

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from HMS_backend.models import PharmacyInvoiceHistory, Patient
from datetime import date, datetime
from typing import List, Dict, Any
import csv
import io
from fastapi.responses import StreamingResponse, FileResponse
import openpyxl
import os
from zipfile import ZipFile
import tempfile
from asgiref.sync import sync_to_async
from django.db import transaction

# Import NotificationService
from Fastapi_app.services.notification_service import NotificationService

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

router = APIRouter(prefix="/billing", tags=["Billing Management"])


# -------------------------------
# Pydantic Schemas
# -------------------------------
class InvoiceSchema(BaseModel):
    invoice_id: str
    date: str
    patient_name: str
    patient_id: str
    department: str
    amount: float
    payment_method: str
    status: str


class InvoiceIds(BaseModel):
    ids: List[str]


class StatusUpdate(BaseModel):
    status: str


# -------------------------------
# Helper: Get formatted invoice data
# -------------------------------
async def get_invoice_data(invoice) -> Dict[str, Any]:

    # Wrap every Django ORM call inside sync_to_async
    @sync_to_async
    def fetch_patient_and_department(invoice_patient_id):
        ensure_db_connection()
        dept = "Unknown"
        try:
            patient = Patient.objects.select_related("department").get(
                patient_unique_id=invoice_patient_id
            )
            if patient.department:
                dept = patient.department.name
        except Patient.DoesNotExist:
            pass
        return dept

    # Fetch department safely
    dept = await fetch_patient_and_department(invoice.patient_id)

    # Bill date formatting (safe)
    try:
        date_str = invoice.bill_date.isoformat() if hasattr(invoice.bill_date, "isoformat") else str(invoice.bill_date)
    except Exception:
        date_str = str(invoice.bill_date)

    return {
        "invoice_id": invoice.bill_no,
        "date": date_str,
        "patient_name": invoice.patient_name,
        "patient_id": invoice.patient_id,
        "department": dept,
        "amount": float(invoice.net_amount),
        "payment_method": invoice.payment_mode or "-",
        "status": invoice.payment_status,
    }



# -------------------------------
# CREATE Invoice
# -------------------------------
@router.post("/", response_model=InvoiceSchema)
async def create_invoice(data: InvoiceSchema):
    try:
        @sync_to_async
        def create_invoice_sync():
            ensure_db_connection()
            with transaction.atomic():
                invoice = PharmacyInvoiceHistory.objects.create(
                    bill_no=data.invoice_id,
                    patient_name=data.patient_name,
                    patient_id=data.patient_id,
                    age=0,
                    doctor_name="Unknown",
                    billing_staff="Unknown",
                    staff_id="Unknown",
                    patient_type="Outpatient",
                    address_text="",
                    payment_type=data.payment_method,
                    payment_status=data.status,
                    payment_mode=data.payment_method,
                    bill_date=date.fromisoformat(data.date),
                    subtotal=data.amount,
                    cgst_percent=0, cgst_amount=0,
                    sgst_percent=0, sgst_amount=0,
                    discount_amount=0,
                    net_amount=data.amount,
                )
                return invoice

        invoice = await create_invoice_sync()
        invoice_data = await get_invoice_data(invoice)

        await NotificationService.send_invoice_created(invoice_data)

        return invoice_data

    except Exception as e:
        print(f"Error creating invoice: {e}")
        await NotificationService.send_billing_error(
            error_message=f"Failed to create invoice: {str(e)}",
            invoice_id=data.invoice_id
        )
        raise HTTPException(status_code=500, detail=f"Failed to create invoice: {str(e)}")


# -------------------------------
# LIST Invoices
# -------------------------------
@router.get("/", response_model=List[InvoiceSchema])
async def list_invoices():
    try:
        @sync_to_async
        def get_all():
            ensure_db_connection()
            return list(PharmacyInvoiceHistory.objects.all().order_by("-bill_date"))

        invoices = await get_all()
        result = []
        for inv in invoices:
            result.append(await get_invoice_data(inv))
        return result
    except Exception as e:
        print(f"Error listing invoices: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch invoices")


# -------------------------------
# GET Single Invoice
# -------------------------------
@router.get("/{invoice_id}", response_model=InvoiceSchema)
async def get_invoice(invoice_id: str):
    try:
        @sync_to_async
        def fetch_invoice():
            ensure_db_connection()
            try:
                return PharmacyInvoiceHistory.objects.get(bill_no=invoice_id)
            except PharmacyInvoiceHistory.DoesNotExist:
                return None

        invoice = await fetch_invoice()
        if not invoice:
            await NotificationService.send_invoice_not_found(invoice_id)
            raise HTTPException(status_code=404, detail="Invoice not found")

        invoice_data = await get_invoice_data(invoice)
        return invoice_data

    except HTTPException:
        raise
    except Exception as e:
        await NotificationService.send_billing_error(
            error_message=f"Error retrieving invoice {invoice_id}: {e}",
            invoice_id=invoice_id
        )
        raise HTTPException(status_code=500, detail="Internal server error")


# -------------------------------
# DELETE Invoice
# -------------------------------
@router.delete("/{invoice_id}")
async def delete_invoice(invoice_id: str):
    try:
        @sync_to_async
        def delete_invoice_sync():
            ensure_db_connection()
            try:
                invoice = PharmacyInvoiceHistory.objects.get(bill_no=invoice_id)
                invoice_data = {
                    "invoice_id": invoice.bill_no,
                    "patient_name": invoice.patient_name,
                    "amount": float(invoice.net_amount),
                    "status": invoice.payment_status,
                }
                invoice.delete()
                return invoice_data
            except PharmacyInvoiceHistory.DoesNotExist:
                return None

        invoice_data = await delete_invoice_sync()
        if not invoice_data:
            await NotificationService.send_invoice_not_found(invoice_id)
            raise HTTPException(status_code=404, detail="Invoice not found")

        await NotificationService.send_invoice_deleted(invoice_data)
        return {"detail": f"Invoice {invoice_id} deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await NotificationService.send_billing_error(
            error_message=f"Failed to delete invoice {invoice_id}: {e}",
            invoice_id=invoice_id
        )
        raise HTTPException(status_code=500, detail="Failed to delete invoice")


# -------------------------------
# UPDATE Status
# -------------------------------
@router.patch("/{invoice_id}/status")
async def update_invoice_status(invoice_id: str, payload: StatusUpdate):
    valid_statuses = ["Paid", "Unpaid", "Pending", "Cancelled"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {valid_statuses}")

    try:
        @sync_to_async
        def update_sync():
            ensure_db_connection()
            try:
                invoice = PharmacyInvoiceHistory.objects.get(bill_no=invoice_id)
                old_status = invoice.payment_status
                invoice.payment_status = payload.status
                invoice.save()
                return invoice, old_status
            except PharmacyInvoiceHistory.DoesNotExist:
                return None, None

        result = await update_sync()
        if not result[0]:
            await NotificationService.send_invoice_not_found(invoice_id)
            raise HTTPException(status_code=404, detail="Invoice not found")

        invoice, old_status = result
        invoice_data = await get_invoice_data(invoice)

        await NotificationService.send_invoice_status_changed(
            invoice_data=invoice_data,
            old_status=old_status,
            new_status=payload.status
        )

        if payload.status == "Paid":
            await NotificationService.send_payment_received(invoice_data)

        return {"detail": f"Status updated to {payload.status}", "invoice": invoice_data}

    except HTTPException:
        raise
    except Exception as e:
        await NotificationService.send_billing_error(
            error_message=f"Failed to update status: {e}",
            invoice_id=invoice_id
        )
        raise HTTPException(status_code=500, detail="Failed to update status")


# -------------------------------
# Download PDF
# -------------------------------
@router.get("/pdf/{invoice_id}")
async def get_pdf(invoice_id: str):
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    INVOICE_DIR = os.path.join(BASE_DIR, "Fastapi_app", "pharmacy", "invoices")
    pdf_path = os.path.join(INVOICE_DIR, f"{invoice_id}.pdf")

    if not os.path.exists(pdf_path):
        await NotificationService.send_billing_error(
            error_message=f"PDF not found: {invoice_id}",
            invoice_id=invoice_id
        )
        raise HTTPException(status_code=404, detail="PDF not found")

    await NotificationService.send_pdf_downloaded(invoice_id=invoice_id)
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"{invoice_id}.pdf")


# -------------------------------
# Bulk Download PDFs
# -------------------------------
@router.post("/download-selected")
async def download_selected(invoice_ids: InvoiceIds, background_tasks: BackgroundTasks):
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    INVOICE_DIR = os.path.join(BASE_DIR, "Fastapi_app", "pharmacy", "invoices")

    temp_zip_path = tempfile.mktemp(suffix=".zip")
    try:
        with ZipFile(temp_zip_path, "w") as zipf:
            added = 0
            for inv_id in invoice_ids.ids:
                pdf_path = os.path.join(INVOICE_DIR, f"{inv_id}.pdf")
                if os.path.exists(pdf_path):
                    zipf.write(pdf_path, f"{inv_id}.pdf")
                    added += 1

            if added == 0:
                os.remove(temp_zip_path)
                await NotificationService.send_billing_error(error_message="No PDFs found for selected invoices")
                raise HTTPException(status_code=404, detail="No PDFs found")

        background_tasks.add_task(os.remove, temp_zip_path)
        await NotificationService.send_pdf_downloaded(invoice_id="", bulk=True, count=added)

        return FileResponse(
            temp_zip_path,
            media_type="application/zip",
            filename="selected_invoices.zip"
        )
    except Exception as e:
        if os.path.exists(temp_zip_path):
            os.remove(temp_zip_path)
        await NotificationService.send_billing_error(error_message=f"Bulk download failed: {e}")
        raise HTTPException(status_code=500, detail="Download failed")


# -------------------------------
# Export CSV / Excel
# -------------------------------
@router.get("/export/csv")
async def export_invoices_csv():
    try:
        @sync_to_async
        def fetch_all():
            ensure_db_connection()
            return list(PharmacyInvoiceHistory.objects.all())

        invoices = await fetch_all()
        data = [await get_invoice_data(inv) for inv in invoices]

        if not data:
            raise HTTPException(status_code=404, detail="No invoices to export")

        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

        await NotificationService.send_export_completed("CSV", len(data))

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=invoices.csv"}
        )
    except Exception as e:
        await NotificationService.send_billing_error(error_message=f"CSV export failed: {e}")
        raise HTTPException(status_code=500, detail="Export failed")


@router.get("/export/excel")
async def export_invoices_excel():
    try:
        @sync_to_async
        def fetch_all():
            ensure_db_connection()
            return list(PharmacyInvoiceHistory.objects.all())

        invoices = await fetch_all()
        data = [await get_invoice_data(inv) for inv in invoices]

        if not data:
            raise HTTPException(status_code=404, detail="No invoices to export")

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Invoices"
        ws.append(list(data[0].keys()))
        for row in data:
            ws.append(list(row.values()))

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)

        await NotificationService.send_export_completed("Excel", len(data))

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=invoices.xlsx"}
        )
    except Exception as e:
        await NotificationService.send_billing_error(error_message=f"Excel export failed: {e}")
        raise HTTPException(status_code=500, detail="Export failed")


# -------------------------------
# Statistics
# -------------------------------
@router.get("/statistics/summary")
async def get_billing_statistics():
    try:
        @sync_to_async
        def compute_stats():
            ensure_db_connection()
            qs = PharmacyInvoiceHistory.objects.all()
            total_invoices = qs.count()
            total_amount = sum(float(i.net_amount or 0) for i in qs)

            today = date.today()
            today_qs = qs.filter(bill_date=today)
            today_count = today_qs.count()
            today_amount = sum(float(i.net_amount or 0) for i in today_qs)

            status_dist = {}
            method_dist = {}
            for i in qs:
                status_dist[i.payment_status] = status_dist.get(i.payment_status, 0) + 1
                method_dist[i.payment_mode or "Unknown"] = method_dist.get(i.payment_mode or "Unknown", 0) + 1

            return {
                "total_invoices": total_invoices,
                "total_amount": float(total_amount),
                "today_invoices": today_count,
                "today_amount": float(today_amount),
                "status_distribution": status_dist,
                "payment_method_distribution": method_dist,
                "timestamp": datetime.now().isoformat()
            }

        stats = await compute_stats()
        await NotificationService.send_statistics_updated(stats)
        return stats

    except Exception as e:
        print(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail="Failed to load statistics")