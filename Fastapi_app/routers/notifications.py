#Fastapi_app/routers/notifications.py
from email import message

from fastapi import APIRouter
from Fastapi_app.services.websocket_service import manager, notify_clients
from datetime import datetime
from typing import Dict, Any, Optional

class NotificationService:
    # ========== APPOINTMENT NOTIFICATIONS ==========
    @staticmethod
    async def send_appointment_created(appointment, staff, department):
        print(f"📤 Sending appointment notification for: {appointment.id}")
        await notify_clients(
            event_type="appointment_created",
            message=f"New appointment: {appointment.patient_name} with Dr. {staff.full_name}",
            notification_type="info",
            data={
                "appointment_id": appointment.id,
                "patient_name": appointment.patient_name,
                "staff_name": staff.full_name,
                "department": department.name,
                "appointment_type": appointment.appointment_type,
                "room_no": appointment.room_no,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/appointments"
            }
        )

    @staticmethod
    async def send_appointment_updated(appointment, staff, department):
        await notify_clients(
            event_type="appointment_updated",
            message=f"Appointment updated: {appointment.patient_name}",
            notification_type="warning",
            data={
                "appointment_id": appointment.id,
                "patient_name": appointment.patient_name,
                "staff_name": staff.full_name,
                "department": department.name,
                "status": appointment.status,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/appointments"
            }
        )

    @staticmethod
    async def send_appointment_deleted(appointment_data):
        """Send notification when appointment is deleted"""
        print(f"🎯 Sending appointment deleted notification: {appointment_data}")
        
        try:
            await notify_clients(
                event_type="appointment_deleted",
                message=f"🗑️ Appointment deleted: {appointment_data['patient_name']}",
                notification_type="error",
                data={
                    "appointment_id": appointment_data['id'],
                    "patient_name": appointment_data['patient_name'],
                    "staff_name": appointment_data.get('staff_name', 'Unknown'),
                    "department_name": appointment_data.get('department_name', 'Unknown'),
                    "timestamp": datetime.now().isoformat(),
                    "redirect_to": "/appointments"
                }
            )
            print("✅ Notification broadcasted successfully")
        except Exception as e:
            print(f"❌ Failed to broadcast notification: {e}")
            raise

    @staticmethod
    async def send_appointment_status_changed(appointment, old_status, new_status):
        await notify_clients(
            event_type="appointment_status_changed",
            message=f"Appointment status changed: {appointment.patient_name} ({old_status} → {new_status})",
            notification_type="warning",
            data={
                "appointment_id": appointment.id,
                "patient_name": appointment.patient_name,
                "old_status": old_status,
                "new_status": new_status,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/appointments"
            }
        )

    # ========== PATIENT NOTIFICATIONS ==========
    @staticmethod
    async def send_patient_registered(patient):
        await notify_clients(
            event_type="patient_registered",
            message=f"New patient registered: {patient.full_name}",
            notification_type="info",
            data={
                "patient_id": patient.patient_unique_id,
                "patient_name": patient.full_name,
                "phone_number": patient.phone_number,
                "department": patient.department.name if patient.department else "N/A",
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/patients/profile"
            }
        )

    @staticmethod
    async def send_patient_updated(patient):
        await notify_clients(
            event_type="patient_updated",
            message=f"Patient updated: {patient.full_name}",
            notification_type="warning",
            data={
                "patient_id": patient.patient_unique_id,
                "patient_name": patient.full_name,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/patients/profile"
            }
        )

    @staticmethod
    async def send_patient_deleted(patient_data):
        await notify_clients(
            event_type="patient_deleted",
            message=f"Patient deleted: {patient_data['full_name']}",
            notification_type="error",
            data={
                "patient_id": patient_data['patient_unique_id'],
                "patient_name": patient_data['full_name'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/patients/profile"
            }
        )

    @staticmethod
    async def send_patient_admitted(patient, room_no):
        await notify_clients(
            event_type="patient_admitted",
            message=f"Patient admitted: {patient.full_name} to Room {room_no}",
            notification_type="info",
            data={
                "patient_id": patient.patient_unique_id,
                "patient_name": patient.full_name,
                "room_no": room_no,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/patients/profile"
            }
        )

    @staticmethod
    async def send_patient_discharged(patient):
        await notify_clients(
            event_type="patient_discharged",
            message=f"Patient discharged: {patient.full_name}",
            notification_type="success",
            data={
                "patient_id": patient.patient_unique_id,
                "patient_name": patient.full_name,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/patients/profile"
            }
        )

    # ========== LAB REPORT NOTIFICATIONS ==========
    @staticmethod
    async def send_lab_report_created(lab_report):
        await notify_clients(
            event_type="lab_report_created",
            message=f"New lab report: {lab_report.order_id} for {lab_report.patient.full_name}",
            notification_type="info",
            data={
                "order_id": lab_report.order_id,
                "patient_name": lab_report.patient.full_name,
                "test_type": lab_report.test_type,
                "department": lab_report.department,
                "status": lab_report.status,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/Laboratory/LaboratoryReports"
            }
        )

    @staticmethod
    async def send_lab_report_updated(lab_report):
        await notify_clients(
            event_type="lab_report_updated",
            message=f"Lab report {lab_report.order_id} status: {lab_report.status}",
            notification_type="success",
            data={
                "order_id": lab_report.order_id,
                "patient_name": lab_report.patient.full_name,
                "test_type": lab_report.test_type,
                "status": lab_report.status,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/Laboratory/LaboratoryReports"
            }
        )

    @staticmethod
    async def send_lab_report_deleted(lab_report_data):
        await notify_clients(
            event_type="lab_report_deleted",
            message=f"Lab report deleted: {lab_report_data['order_id']}",
            notification_type="error",
            data={
                "order_id": lab_report_data['order_id'],
                "patient_name": lab_report_data['patient_name'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/Laboratory/LaboratoryReports"
            }
        )

    @staticmethod
    async def send_lab_report_completed(lab_report):
        await notify_clients(
            event_type="lab_report_completed",
            message=f"Lab report completed: {lab_report.order_id}",
            notification_type="success",
            data={
                "order_id": lab_report.order_id,
                "patient_name": lab_report.patient.full_name,
                "test_type": lab_report.test_type,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/Laboratory/LaboratoryReports"
            }
        )

    # ========== STAFF NOTIFICATIONS ==========
    @staticmethod
    async def send_staff_registered(staff):
        await notify_clients(
            event_type="staff_registered",
            message=f"👨‍⚕️ New staff registered: {staff.full_name} - {staff.designation}",
            notification_type="info",
            data={
                "staff_id": staff.employee_id,
                "staff_name": staff.full_name,
                "designation": staff.designation,
                "department": staff.department.name,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/StaffManagement"
            }
        )

    @staticmethod
    async def send_staff_updated(staff):
        await notify_clients(
            event_type="staff_updated",
            message=f"Staff updated: {staff.full_name}",
            notification_type="warning",
            data={
                "staff_id": staff.employee_id,
                "staff_name": staff.full_name,
                "designation": staff.designation,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/StaffManagement"
            }
        )

    @staticmethod
    async def send_staff_deleted(staff_data):
        await notify_clients(
            event_type="staff_deleted",
            message=f"Staff deleted: {staff_data['full_name']}",
            notification_type="error",
            data={
                "staff_id": staff_data['employee_id'],
                "staff_name": staff_data['full_name'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/StaffManagement"
            }
        )

    # ========== AMBULANCE NOTIFICATIONS ==========
    @staticmethod
    async def send_ambulance_unit_created(unit):
        await notify_clients(
            event_type="ambulance_unit_created",
            message=f"🚑 New ambulance unit added: {unit.unit_number}",
            notification_type="info",
            data={
                "unit_id": unit.id,
                "unit_number": unit.unit_number,
                "vehicle_make": unit.vehicle_make,
                "vehicle_model": unit.vehicle_model,
                "in_service": unit.in_service,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ambulance"
            }
        )

    @staticmethod
    async def send_ambulance_unit_updated(unit):
        await notify_clients(
            event_type="ambulance_unit_updated",
            message=f"🚑 Ambulance unit updated: {unit.unit_number}",
            notification_type="warning",
            data={
                "unit_id": unit.id,
                "unit_number": unit.unit_number,
                "in_service": unit.in_service,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ambulance"
            }
        )

    @staticmethod
    async def send_ambulance_unit_deleted(unit_data):
        await notify_clients(
            event_type="ambulance_unit_deleted",
            message=f"🚑 Ambulance unit removed: {unit_data['unit_number']}",
            notification_type="error",
            data={
                "unit_id": unit_data['unit_id'],
                "unit_number": unit_data['unit_number'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ambulance"
            }
        )

    @staticmethod
    async def send_ambulance_dispatch_updated(dispatch):
        unit_number = dispatch.unit.unit_number if dispatch.unit else "Unknown"
        await notify_clients(
            event_type="ambulance_dispatch_updated",
            message=f"🚑 Dispatch updated: {dispatch.dispatch_id}",
            notification_type="warning",
            data={
                "dispatch_id": dispatch.dispatch_id,
                "unit_number": unit_number,
                "location": dispatch.location,
                "status": dispatch.status,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ambulance"
            }
        )

    @staticmethod
    async def send_ambulance_dispatch_deleted(dispatch_data):
        await notify_clients(
            event_type="ambulance_dispatch_deleted",
            message=f"🚑 Dispatch cancelled: {dispatch_data['dispatch_id']}",
            notification_type="error",
            data={
                "dispatch_id": dispatch_data['dispatch_id'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ambulance"
            }
        )

    @staticmethod
    async def send_ambulance_trip_deleted(trip_data):
        await notify_clients(
            event_type="ambulance_trip_deleted",
            message=f"🚑 Trip cancelled: {trip_data['trip_id']}",
            notification_type="error",
            data={
                "trip_id": trip_data['trip_id'],
                "unit_number": trip_data.get('unit_number', 'Unknown'),
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ambulance"
            }
        )

    # ========== MEDICINE/PHARMACY NOTIFICATIONS ==========
    @staticmethod
    async def send_medicine_allocated(allocation):
        await notify_clients(
            event_type="medicine_allocated",
            message=f"💊 Medicine allocated: {allocation.medicine_name} for {allocation.patient.full_name}",
            notification_type="info",
            data={
                "allocation_id": allocation.id,
                "patient_name": allocation.patient.full_name,
                "medicine_name": allocation.medicine_name,
                "dosage": allocation.dosage,
                "staff_name": allocation.staff.full_name if allocation.staff else "N/A",
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Doctors-Nurse/MedicineAllocation"
            }
        )

    @staticmethod
    async def send_medicine_updated(allocation):
        await notify_clients(
            event_type="medicine_updated",
            message=f"💊 Medicine allocation updated: {allocation.medicine_name}",
            notification_type="warning",
            data={
                "allocation_id": allocation.id,
                "patient_name": allocation.patient.full_name,
                "medicine_name": allocation.medicine_name,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Doctors-Nurse/MedicineAllocation"
            }
        )

    @staticmethod
    async def send_medicine_deleted(allocation_data):
        await notify_clients(
            event_type="medicine_deleted",
            message=f"💊 Medicine allocation deleted: {allocation_data['medicine_name']}",
            notification_type="error",
            data={
                "allocation_id": allocation_data['id'],
                "patient_name": allocation_data['patient_name'],
                "medicine_name": allocation_data['medicine_name'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Doctors-Nurse/MedicineAllocation"
            }
        )

    @staticmethod
    async def send_stock_added(stock):
        await notify_clients(
            event_type="stock_added",
            message=f"📦 Stock added: {stock.product_name} ({stock.quantity} units)",
            notification_type="success",
            data={
                "stock_id": stock.id,
                "product_name": stock.product_name,
                "quantity": stock.quantity,
                "batch_number": stock.batch_number,
                "vendor": stock.vendor,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Pharmacy/Stock-Inventory"
            }
        )

    @staticmethod
    async def send_stock_updated(stock, previous_quantity=None):
        message = f"📦 Stock updated: {stock.product_name}"
        if previous_quantity is not None:
            message += f" (Quantity changed: {previous_quantity} → {stock.quantity})"
        
        await notify_clients(
            event_type="stock_updated",
            message=message,
            notification_type="info",
            data={
                "stock_id": stock.id,
                "product_name": stock.product_name,
                "current_quantity": stock.quantity,
                "previous_quantity": previous_quantity,
                "batch_number": stock.batch_number,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Pharmacy/Stock-Inventory"
            }
        )

    @staticmethod
    async def send_stock_deleted(stock_data):
        await notify_clients(
            event_type="stock_deleted",
            message=f"🗑️ Stock deleted: {stock_data['product_name']}",
            notification_type="warning",
            data={
                "product_name": stock_data['product_name'],
                "batch_number": stock_data.get('batch_number', ''),
                "vendor": stock_data.get('vendor', ''),
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Pharmacy/Stock-Inventory"
            }
        )

    @staticmethod
    async def send_stock_low(stock):
        await notify_clients(
            event_type="stock_low",
            message=f"📦 Low stock alert: {stock.product_name} (Only {stock.quantity} left)",
            notification_type="warning",
            data={
                "stock_id": stock.id,
                "product_name": stock.product_name,
                "current_stock": stock.quantity,
                "batch_number": stock.batch_number,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Pharmacy/Stock-Inventory"
            }
        )

    @staticmethod
    async def send_stock_out(stock):
        await notify_clients(
            event_type="stock_out",
            message=f"📦 Stock out: {stock.product_name}",
            notification_type="error",
            data={
                "stock_id": stock.id,
                "product_name": stock.product_name,
                "batch_number": stock.batch_number,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Pharmacy/Stock-Inventory"
            }
        )

    # ========== BILLING & PAYMENT NOTIFICATIONS ==========
    @staticmethod
    async def send_invoice_generated(invoice):
        await notify_clients(
            event_type="invoice_generated",
            message=f"🧾 Invoice generated: {invoice.invoice_id} for {invoice.patient_name}",
            notification_type="success",
            data={
                "invoice_id": invoice.invoice_id,
                "patient_name": invoice.patient_name,
                "amount": str(invoice.amount),
                "status": invoice.status,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Billing"
            }
        )

    @staticmethod
    async def send_payment_received(invoice):
        await notify_clients(
            event_type="payment_received",
            message=f"💰 Payment received: {invoice.invoice_id} - ${invoice.amount}",
            notification_type="success",
            data={
                "invoice_id": invoice.invoice_id,
                "patient_name": invoice.patient_name,
                "amount": str(invoice.amount),
                "payment_method": invoice.payment_method,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Billing"
            }
        )

    @staticmethod
    async def send_payment_failed(invoice, reason):
        await notify_clients(
            event_type="payment_failed",
            message=f"❌ Payment failed: {invoice.invoice_id} - {reason}",
            notification_type="error",
            data={
                "invoice_id": invoice.invoice_id,
                "patient_name": invoice.patient_name,
                "amount": str(invoice.amount),
                "reason": reason,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Billing"
            }
        )

    @staticmethod
    async def send_invoice_updated(invoice):
        await notify_clients(
            event_type="invoice_updated",
            message=f"🧾 Invoice updated: {invoice.invoice_id}",
            notification_type="warning",
            data={
                "invoice_id": invoice.invoice_id,
                "patient_name": invoice.patient_name,
                "amount": str(invoice.amount),
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Billing"
            }
        )

    # ========== DEPARTMENT NOTIFICATIONS ==========
    @staticmethod
    async def send_department_created(department):
        await notify_clients(
            event_type="department_created",
            message=f"New department created: {department.name}",
            notification_type="success",
            data={
                "department_id": department.id,
                "department_name": department.name,
                "status": department.status,
                "description": department.description or "",
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/Departments"
            }
        )

    @staticmethod
    async def send_department_updated(department):
        await notify_clients(
            event_type="department_updated",
            message=f"Department updated: {department.name}",
            notification_type="warning",
            data={
                "department_id": department.id,
                "department_name": department.name,
                "status": department.status,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/Departments"
            }
        )

    @staticmethod
    async def send_department_deleted(department_data):
        await notify_clients(
            event_type="department_deleted",
            message=f"Department deleted: {department_data['name']}",
            notification_type="error",
            data={
                "department_id": department_data.get('id'),
                "department_name": department_data.get('name'),
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/Departments"
            }
        )

    @staticmethod
    async def send_department_status_changed(department, old_status, new_status):
        await notify_clients(
            event_type="department_status_changed",
            message=f"Department status changed: {department.name} ({old_status} → {new_status})",
            notification_type="info",
            data={
                "department_id": department.id,
                "department_name": department.name,
                "old_status": old_status,
                "new_status": new_status,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/Departments"
            }
        )

    # ========== ROOM/BED MANAGEMENT NOTIFICATIONS ==========
    @staticmethod
    async def send_bed_group_created(bed_group):
        await notify_clients(
            event_type="bed_group_created",
            message=f"🛏️ New bed group created: {bed_group.bedGroup}",
            notification_type="success",
            data={
                "bed_group_id": bed_group.id,
                "bed_group_name": bed_group.bedGroup,
                "capacity": bed_group.capacity,
                "status": bed_group.status,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/BedList"
            }
        )

    @staticmethod
    async def send_bed_group_updated(bed_group):
        await notify_clients(
            event_type="bed_group_updated",
            message=f"🛏️ Bed group updated: {bed_group.bedGroup}",
            notification_type="warning",
            data={
                "bed_group_id": bed_group.id,
                "bed_group_name": bed_group.bedGroup,
                "capacity": bed_group.capacity,
                "occupied": bed_group.occupied,
                "unoccupied": bed_group.unoccupied,
                "status": bed_group.status,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/BedList"
            }
        )

    @staticmethod
    async def send_bed_group_deleted(bed_group_data):
        await notify_clients(
            event_type="bed_group_deleted",
            message=f"🛏️ Bed group deleted: {bed_group_data['bedGroup']}",
            notification_type="error",
            data={
                "bed_group_id": bed_group_data['id'],
                "bed_group_name": bed_group_data['bedGroup'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/BedList"
            }
        )

    @staticmethod
    async def send_bed_created(bed):
        await notify_clients(
            event_type="bed_created",
            message=f"🛏️ New bed added: {bed.bed_number} in {bed.bed_group.bedGroup}",
            notification_type="info",
            data={
                "bed_id": bed.id,
                "bed_number": bed.bed_number,
                "bed_group": bed.bed_group.bedGroup,
                "is_occupied": bed.is_occupied,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/BedList"
            }
        )

    @staticmethod
    async def send_bed_updated(bed):
        await notify_clients(
            event_type="bed_updated",
            message=f"🛏️ Bed updated: {bed.bed_number} in {bed.bed_group.bedGroup}",
            notification_type="warning",
            data={
                "bed_id": bed.id,
                "bed_number": bed.bed_number,
                "bed_group": bed.bed_group.bedGroup,
                "is_occupied": bed.is_occupied,
                "patient_name": bed.patient.full_name if bed.patient else "None",
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/BedList"
            }
        )

    @staticmethod
    async def send_bed_deleted(bed_data):
        await notify_clients(
            event_type="bed_deleted",
            message=f"🛏️ Bed deleted: {bed_data['bed_number']} from {bed_data['bed_group']}",
            notification_type="error",
            data={
                "bed_id": bed_data['id'],
                "bed_number": bed_data['bed_number'],
                "bed_group": bed_data['bed_group'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/BedList"
            }
        )

    @staticmethod
    async def send_bed_allocated(bed, patient):
        await notify_clients(
            event_type="bed_allocated",
            message=f"🛏️ Bed allocated: {bed.bed_number} to {patient.full_name}",
            notification_type="success",
            data={
                "bed_id": bed.id,
                "bed_number": bed.bed_number,
                "bed_group": bed.bed_group.bedGroup,
                "patient_id": patient.patient_unique_id,
                "patient_name": patient.full_name,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/roommanagement"
            }
        )

    @staticmethod
    async def send_bed_vacated(bed, patient_name):
        await notify_clients(
            event_type="bed_vacated",
            message=f"🛏️ Bed vacated: {bed.bed_number} by {patient_name}",
            notification_type="info",
            data={
                "bed_id": bed.id,
                "bed_number": bed.bed_number,
                "bed_group": bed.bed_group.bedGroup,
                "patient_name": patient_name,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/roommanagement"
            }
        )

    @staticmethod
    async def send_room_occupancy_changed(bed_group, old_occupied, new_occupied):
        await notify_clients(
            event_type="room_occupancy_changed",
            message=f"🏨 Room occupancy changed: {bed_group.bedGroup} ({old_occupied} → {new_occupied} occupied)",
            notification_type="info",
            data={
                "bed_group_id": bed_group.id,
                "bed_group_name": bed_group.bedGroup,
                "old_occupied": old_occupied,
                "new_occupied": new_occupied,
                "total_capacity": bed_group.capacity,
                "available_beds": bed_group.unoccupied,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/BedList"
            }
        )

    @staticmethod
    async def send_bed_capacity_changed(bed_group, old_capacity, new_capacity):
        await notify_clients(
            event_type="bed_capacity_changed",
            message=f"🏨 Bed capacity changed: {bed_group.bedGroup} ({old_capacity} → {new_capacity} beds)",
            notification_type="warning",
            data={
                "bed_group_id": bed_group.id,
                "bed_group_name": bed_group.bedGroup,
                "old_capacity": old_capacity,
                "new_capacity": new_capacity,
                "difference": new_capacity - old_capacity,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/BedList"
            }
        )

    # ========== BLOOD BANK NOTIFICATIONS ==========
    @staticmethod
    async def send_blood_group_created(blood_group):
        await notify_clients(
            event_type="blood_group_created",
            message=f"🩸 New blood group added: {blood_group['blood_type']}",
            notification_type="success",
            data={
                "blood_group_id": blood_group['id'],
                "blood_type": blood_group['blood_type'],
                "available_units": blood_group['available_units'],
                "status": blood_group['status'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    @staticmethod
    async def send_blood_group_updated(blood_group):
        await notify_clients(
            event_type="blood_group_updated",
            message=f"🩸 Blood group updated: {blood_group['blood_type']}",
            notification_type="warning",
            data={
                "blood_group_id": blood_group['id'],
                "blood_type": blood_group['blood_type'],
                "available_units": blood_group['available_units'],
                "status": blood_group['status'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    @staticmethod
    async def send_blood_group_deleted(blood_group_data):
        await notify_clients(
            event_type="blood_group_deleted",
            message=f"🩸 Blood group deleted: {blood_group_data['blood_type']}",
            notification_type="error",
            data={
                "blood_group_id": blood_group_data['id'],
                "blood_type": blood_group_data['blood_type'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    @staticmethod
    async def send_blood_stock_updated(blood_group, old_units, new_units):
        await notify_clients(
            event_type="blood_stock_updated",
            message=f"🩸 Blood stock updated: {blood_group['blood_type']} ({old_units} → {new_units} units)",
            notification_type="info",
            data={
                "blood_group_id": blood_group['id'],
                "blood_type": blood_group['blood_type'],
                "old_units": old_units,
                "new_units": new_units,
                "status": blood_group['status'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    @staticmethod
    async def send_blood_stock_low(blood_group):
        await notify_clients(
            event_type="blood_stock_low",
            message=f"🩸 Low blood stock alert: {blood_group['blood_type']} (Only {blood_group['available_units']} units left)",
            notification_type="warning",
            data={
                "blood_group_id": blood_group['id'],
                "blood_type": blood_group['blood_type'],
                "available_units": blood_group['available_units'],
                "status": blood_group['status'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    @staticmethod
    async def send_blood_stock_out(blood_group):
        await notify_clients(
            event_type="blood_stock_out",
            message=f"🩸 Blood stock out: {blood_group['blood_type']}",
            notification_type="error",
            data={
                "blood_group_id": blood_group['id'],
                "blood_type": blood_group['blood_type'],
                "status": blood_group['status'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    @staticmethod
    async def send_blood_donation_received(blood_group, units_received):
        await notify_clients(
            event_type="blood_donation_received",
            message=f"🩸 Blood donation received: {units_received} units of {blood_group['blood_type']}",
            notification_type="success",
            data={
                "blood_group_id": blood_group['id'],
                "blood_type": blood_group['blood_type'],
                "units_received": units_received,
                "new_total_units": blood_group['available_units'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    @staticmethod
    async def send_blood_issued(blood_group, units_issued, patient_name):
        await notify_clients(
            event_type="blood_issued",
            message=f"🩸 Blood issued: {units_issued} units of {blood_group['blood_type']} to {patient_name}",
            notification_type="info",
            data={
                "blood_group_id": blood_group['id'],
                "blood_type": blood_group['blood_type'],
                "units_issued": units_issued,
                "patient_name": patient_name,
                "remaining_units": blood_group['available_units'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    # ========== DONOR NOTIFICATIONS ==========
    @staticmethod
    async def send_donor_registered(donor):
        await notify_clients(
            event_type="donor_registered",
            message=f"👤 New donor registered: {donor.donor_name} ({donor.blood_type})",
            notification_type="success",
            data={
                "donor_id": donor.id,
                "donor_name": donor.donor_name,
                "blood_type": donor.blood_type,
                "phone": donor.phone,
                "status": donor.status,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    @staticmethod
    async def send_donor_updated(donor):
        await notify_clients(
            event_type="donor_updated",
            message=f"👤 Donor updated: {donor.donor_name}",
            notification_type="warning",
            data={
                "donor_id": donor.id,
                "donor_name": donor.donor_name,
                "blood_type": donor.blood_type,
                "status": donor.status,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    @staticmethod
    async def send_donor_deleted(donor_data):
        await notify_clients(
            event_type="donor_deleted",
            message=f"👤 Donor deleted: {donor_data['donor_name']}",
            notification_type="error",
            data={
                "donor_id": donor_data['id'],
                "donor_name": donor_data['donor_name'],
                "blood_type": donor_data['blood_type'],
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    @staticmethod
    async def send_donor_eligibility_changed(donor, old_status, new_status):
        await notify_clients(
            event_type="donor_eligibility_changed",
            message=f"👤 Donor eligibility changed: {donor.donor_name} ({old_status} → {new_status})",
            notification_type="info",
            data={
                "donor_id": donor.id,
                "donor_name": donor.donor_name,
                "blood_type": donor.blood_type,
                "old_status": old_status,
                "new_status": new_status,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    @staticmethod
    async def send_donation_received(donor, units_donated):
        await notify_clients(
            event_type="donation_received",
            message=f"🩸 Donation received: {units_donated} units from {donor.donor_name}",
            notification_type="success",
            data={
                "donor_id": donor.id,
                "donor_name": donor.donor_name,
                "blood_type": donor.blood_type,
                "units_donated": units_donated,
                "last_donation_date": donor.last_donation_date.isoformat() if donor.last_donation_date else None,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    @staticmethod
    async def send_donor_became_eligible(donor):
        await notify_clients(
            event_type="donor_became_eligible",
            message=f"✅ Donor now eligible: {donor.donor_name} can donate blood",
            notification_type="success",
            data={
                "donor_id": donor.id,
                "donor_name": donor.donor_name,
                "blood_type": donor.blood_type,
                "phone": donor.phone,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    @staticmethod
    async def send_urgent_blood_request(blood_type, units_needed, patient_name=None):
        message = f"🚨 URGENT: {units_needed} units of {blood_type} needed"
        if patient_name:
            message += f" for {patient_name}"
        
        await notify_clients(
            event_type="urgent_blood_request",
            message=message,
            notification_type="error",
            data={
                "blood_type": blood_type,
                "units_needed": units_needed,
                "patient_name": patient_name,
                "urgent": True,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
            }
        )

    # ========== BED GROUP SPECIFIC NOTIFICATIONS ==========
    @staticmethod
    async def send_bed_group_capacity_changed(bed_group, old_capacity, new_capacity):
        await notify_clients(
            event_type="bed_group_capacity_changed",
            message=f"🏨 Bed group capacity changed: {bed_group.bedGroup} ({old_capacity} → {new_capacity} beds)",
            notification_type="info",
            data={
                "bed_group_id": bed_group.id,
                "bed_group_name": bed_group.bedGroup,
                "old_capacity": old_capacity,
                "new_capacity": new_capacity,
                "occupied": bed_group.occupied,
                "unoccupied": bed_group.unoccupied,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/roommanagement"
            }
        )

    @staticmethod
    async def send_bed_group_full(bed_group):
        await notify_clients(
            event_type="bed_group_full",
            message=f"🏨 Bed group full: {bed_group.bedGroup} (No available beds)",
            notification_type="warning",
            data={
                "bed_group_id": bed_group.id,
                "bed_group_name": bed_group.bedGroup,
                "capacity": bed_group.capacity,
                "occupied": bed_group.occupied,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/roommanagement"
            }
        )

    @staticmethod
    async def send_bed_group_available(bed_group):
        await notify_clients(
            event_type="bed_group_available",
            message=f"🏨 Bed group available: {bed_group.bedGroup} has free beds",
            notification_type="success",
            data={
                "bed_group_id": bed_group.id,
                "bed_group_name": bed_group.bedGroup,
                "available_beds": bed_group.unoccupied,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Administration/roommanagement"
            }
        )

    # ========== SYSTEM & SECURITY NOTIFICATIONS ==========
    @staticmethod
    async def send_emergency_alert(message, data=None):
        await notify_clients(
            event_type="emergency_alert",
            message=f"🚨 EMERGENCY: {message}",
            notification_type="error",
            data={
                "alert": True,
                "message": message,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/emergency",
                **(data or {})
            }
        )

    @staticmethod
    async def send_system_alert(message, alert_type="warning"):
        await notify_clients(
            event_type="system_alert",
            message=f"⚠️ System: {message}",
            notification_type=alert_type,
            data={
                "system_alert": True,
                "message": message,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/dashboard"
            }
        )

    @staticmethod
    async def send_user_login(user, ip_address):
        await notify_clients(
            event_type="user_login",
            message=f"🔐 User logged in: {user.username} from {ip_address}",
            notification_type="info",
            data={
                "user_id": user.id,
                "username": user.username,
                "role": user.role,
                "ip_address": ip_address,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/dashboard"
            }
        )

    @staticmethod
    async def send_user_logout(user):
        await notify_clients(
            event_type="user_logout",
            message=f"🔐 User logged out: {user.username}",
            notification_type="info",
            data={
                "user_id": user.id,
                "username": user.username,
                "role": user.role,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/login"
            }
        )

    @staticmethod
    async def send_unauthorized_access_attempt(user_data, ip_address):
        await notify_clients(
            event_type="unauthorized_access",
            message=f"🚫 Unauthorized access attempt from {ip_address}",
            notification_type="error",
            data={
                "ip_address": ip_address,
                "username": user_data.get('username', 'Unknown'),
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/security"
            }
        )

    # ========== TEST NOTIFICATION ==========
    @staticmethod
    async def send_test_notification():
        await notify_clients(
            event_type="test_notification",
            message="This is a test notification from the server!",
            notification_type="info",
            data={
                "test": True,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/dashboard"
            }
        )

    @staticmethod
    async def send_invoice_created(invoice_data: Dict[str, Any]):
        await notify_clients(
            event_type="invoice_created",
            message=f"New invoice: {invoice_data.get('patient_name')} - ₹{invoice_data.get('amount', 0)}",
            notification_type="success",
            data={**invoice_data, "timestamp": datetime.now().isoformat(), "redirect_to": "/Billing"}
        )

    @staticmethod
    async def send_invoice_deleted(invoice_data: Dict[str, Any]):
        await notify_clients(
            event_type="invoice_deleted",
            message=f"Invoice deleted: {invoice_data.get('invoice_id')}",
            notification_type="warning",
            data={**invoice_data, "timestamp": datetime.now().isoformat(), "redirect_to": "/Billing"}
        )

    @staticmethod
    async def send_payment_received(invoice_data: Dict[str, Any]):
        await notify_clients(
            event_type="payment_received",
            message=f"Payment received: ₹{invoice_data.get('amount', 0)}",
            notification_type="success",
            data={**invoice_data, "timestamp": datetime.now().isoformat()}
        )

    @staticmethod
    async def send_invoice_status_changed(invoice_data: Dict[str, Any], old_status: str, new_status: str):
        await notify_clients(
            event_type="invoice_status_changed",
            message=f"Status: {old_status} → {new_status}",
            notification_type="info",
            data={
                **invoice_data,
                "old_status": old_status,
                "new_status": new_status,
                "timestamp": datetime.now().isoformat()
            }
        )

    @staticmethod
    async def send_invoice_not_found(invoice_id: str):
        await notify_clients(
            event_type="invoice_not_found",
            message=f"Invoice not found: {invoice_id}",
            notification_type="warning",
            data={"invoice_id": invoice_id, "timestamp": datetime.now().isoformat()}
        )

    @staticmethod
    async def send_pdf_downloaded(invoice_id: str = "", bulk: bool = False, count: int = 1):
        message = f"{count} PDF(s) downloaded" if bulk else f"PDF downloaded: {invoice_id}"
        event = "pdf_bulk_downloaded" if bulk else "pdf_downloaded"
        await notify_clients(
            event_type=event,
            message=message,
            notification_type="info",
            data={
                "invoice_id": invoice_id or None,
                "count": count,
                "is_bulk": bulk,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Billing"
            }
        )

    @staticmethod
    async def send_export_completed(export_type: str, count: int):
        await notify_clients(
            event_type="export_completed",
            message=f"{export_type} export completed: {count} records",
            notification_type="success",
            data={"export_type": export_type, "count": count, "timestamp": datetime.now().isoformat()}
        )

    @staticmethod
    async def send_billing_error(error_message: str, invoice_id: Optional[str] = None):
        await notify_clients(
            event_type="billing_error",
            message=f"Billing Error: {error_message}",
            notification_type="error",
            data={
                "error_message": error_message,
                "invoice_id": invoice_id,
                "timestamp": datetime.now().isoformat(),
                "redirect_to": "/Billing"
            }
        )

    @staticmethod
    async def send_statistics_updated(statistics: Dict[str, Any]):
        await notify_clients(
            event_type="billing_statistics_updated",
            message="Billing statistics updated",
            notification_type="info",
            data={**statistics, "timestamp": datetime.now().isoformat()}
        )

    # ========== PHARMACY & HOSPITAL BILLING NOTIFICATIONS ==========
    @staticmethod
    async def send_pharmacy_bill_generated(invoice_data: Dict[str, Any]):
        """Send notification when pharmacy bill is generated"""
        print(f"📤 Sending pharmacy bill generated notification: {invoice_data.get('bill_no')}")
        
        try:
            await notify_clients(
                event_type="pharmacy_bill_generated",
                message=f"💊 Pharmacy bill generated: {invoice_data.get('bill_no')} for {invoice_data.get('patient_name')}",
                notification_type="success",
                data={
                    "bill_no": invoice_data.get("bill_no"),
                    "patient_name": invoice_data.get("patient_name"),
                    "patient_id": invoice_data.get("patient_id"),
                    "net_amount": str(invoice_data.get("net_amount", 0)),
                    "payment_status": invoice_data.get("payment_status", "Unpaid"),
                    "billing_staff": invoice_data.get("billing_staff", "Unknown"),
                    "patient_type": invoice_data.get("patient_type", "Outpatient"),
                    "timestamp": datetime.now().isoformat(),
                    "redirect_to": "/billing"
                }
            )
            print("✅ Pharmacy bill generated notification broadcasted successfully")
        except Exception as e:
            print(f"❌ Failed to broadcast pharmacy bill notification: {e}")
            raise

    @staticmethod
    async def send_pharmacy_payment_received(invoice_data: Dict[str, Any]):
        """Send notification when pharmacy payment is received"""
        print(f"📤 Sending pharmacy payment received notification: {invoice_data.get('bill_no')}")
        
        try:
            await notify_clients(
                event_type="pharmacy_payment_received",
                message=f"💰 Pharmacy payment received: {invoice_data.get('bill_no')} - ₹{invoice_data.get('net_amount', 0)}",
                notification_type="success",
                data={
                    "bill_no": invoice_data.get("bill_no"),
                    "patient_name": invoice_data.get("patient_name"),
                    "net_amount": str(invoice_data.get("net_amount", 0)),
                    "payment_mode": invoice_data.get("payment_mode", "Unknown"),
                    "payment_type": invoice_data.get("payment_type", "Unknown"),
                    "timestamp": datetime.now().isoformat(),
                    "redirect_to": "/billing"
                }
            )
            print("✅ Pharmacy payment notification broadcasted successfully")
        except Exception as e:
            print(f"❌ Failed to broadcast pharmacy payment notification: {e}")
            raise

    @staticmethod
    async def send_hospital_bill_generated(invoice_data: Dict[str, Any]):
        """Send notification when hospital bill is generated"""
        print(f"📤 Sending hospital bill generated notification: {invoice_data.get('invoice_id')}")
        
        try:
            await notify_clients(
                event_type="hospital_bill_generated",
                message=f"🏥 Hospital bill generated: {invoice_data.get('invoice_id')} for {invoice_data.get('patient_name')}",
                notification_type="success",
                data={
                    "invoice_id": invoice_data.get("invoice_id"),
                    "patient_name": invoice_data.get("patient_name"),
                    "patient_id": invoice_data.get("patient_id"),
                    "amount": str(invoice_data.get("amount", 0)),
                    "department": invoice_data.get("department", "Unknown"),
                    "payment_method": invoice_data.get("payment_method", "Unknown"),
                    "status": invoice_data.get("status", "Pending"),
                    "timestamp": datetime.now().isoformat(),
                    "redirect_to": "/billing"
                }
            )
            print("✅ Hospital bill generated notification broadcasted successfully")
        except Exception as e:
            print(f"❌ Failed to broadcast hospital bill notification: {e}")
            raise

    @staticmethod
    async def send_hospital_payment_received(invoice_data: Dict[str, Any]):
        """Send notification when hospital payment is received"""
        print(f"📤 Sending hospital payment received notification: {invoice_data.get('invoice_id')}")
        
        try:
            await notify_clients(
                event_type="hospital_payment_received",
                message=f"💰 Hospital payment received: {invoice_data.get('invoice_id')} - ₹{invoice_data.get('amount', 0)}",
                notification_type="success",
                data={
                    "invoice_id": invoice_data.get("invoice_id"),
                    "patient_name": invoice_data.get("patient_name"),
                    "amount": str(invoice_data.get("amount", 0)),
                    "payment_method": invoice_data.get("payment_method", "Unknown"),
                    "status": "Paid",
                    "timestamp": datetime.now().isoformat(),
                    "redirect_to": "/billing"
                }
            )
            print("✅ Hospital payment notification broadcasted successfully")
        except Exception as e:
            print(f"❌ Failed to broadcast hospital payment notification: {e}")
            raise

    @staticmethod
    async def send_stock_low_alert(stock_data: Dict[str, Any]):
        """Send notification when stock is low"""
        print(f"📤 Sending stock low alert: {stock_data.get('product_name')}")
        
        try:
            await notify_clients(
                event_type="stock_low_alert",
                message=f"⚠️ Low stock alert: {stock_data.get('product_name')} (Only {stock_data.get('quantity', 0)} left)",
                notification_type="warning",
                data={
                    "product_name": stock_data.get("product_name"),
                    "item_code": stock_data.get("item_code"),
                    "quantity": stock_data.get("quantity", 0),
                    "batch_number": stock_data.get("batch_number", ""),
                    "vendor": stock_data.get("vendor", ""),
                    "timestamp": datetime.now().isoformat(),
                    "redirect_to": "/Pharmacy/Stock-Inventory"
                }
            )
            print("✅ Stock low alert notification broadcasted successfully")
        except Exception as e:
            print(f"❌ Failed to broadcast stock alert notification: {e}")
            raise

    @staticmethod
    async def send_stock_out_alert(stock_data: Dict[str, Any]):
        """Send notification when stock is out"""
        print(f"📤 Sending stock out alert: {stock_data.get('product_name')}")
        
        try:
            await notify_clients(
                event_type="stock_out_alert",
                message=f"🛑 Out of stock: {stock_data.get('product_name')}",
                notification_type="error",
                data={
                    "product_name": stock_data.get("product_name"),
                    "item_code": stock_data.get("item_code"),
                    "batch_number": stock_data.get("batch_number", ""),
                    "vendor": stock_data.get("vendor", ""),
                    "timestamp": datetime.now().isoformat(),
                    "redirect_to": "/Pharmacy/Stock-Inventory"
                }
            )
            print("✅ Stock out alert notification broadcasted successfully")
        except Exception as e:
            print(f"❌ Failed to broadcast stock out notification: {e}")
            raise

    @staticmethod
    async def send_invoice_not_found(invoice_id: str):
        """Send notification when invoice is not found"""
        print(f"📤 Sending invoice not found notification: {invoice_id}")
        
        try:
            await notify_clients(
                event_type="invoice_not_found",
                message=f"❓ Invoice not found: {invoice_id}",
                notification_type="warning",
                data={
                    "invoice_id": invoice_id,
                    "timestamp": datetime.now().isoformat(),
                    "redirect_to": "/billing"
                }
            )
            print("✅ Invoice not found notification broadcasted successfully")
        except Exception as e:
            print(f"❌ Failed to broadcast invoice not found notification: {e}")
            raise

    @staticmethod
    async def send_invoice_deleted(invoice_data: Dict[str, Any]):
        """Send notification when invoice is deleted"""
        print(f"📤 Sending invoice deleted notification: {invoice_data.get('invoice_id')}")
        
        try:
            await notify_clients(
                event_type="invoice_deleted",
                message=f"🗑️ Invoice deleted: {invoice_data.get('invoice_id')}",
                notification_type="warning",
                data={
                    "invoice_id": invoice_data.get("invoice_id"),
                    "patient_name": invoice_data.get("patient_name"),
                    "patient_id": invoice_data.get("patient_id"),
                    "amount": str(invoice_data.get("amount", 0)),
                    "status": invoice_data.get("status", "Deleted"),
                    "department": invoice_data.get("department", "Pharmacy"),
                    "payment_method": invoice_data.get("payment_method", "Unknown"),
                    "timestamp": datetime.now().isoformat(),
                    "redirect_to": "/billing"
                }
            )
            print("✅ Invoice deleted notification broadcasted successfully")
        except Exception as e:
            print(f"❌ Failed to broadcast invoice deleted notification: {e}")
            raise

    @staticmethod
    async def send_invoice_status_changed(invoice_data: Dict[str, Any], old_status: str, new_status: str):
        """Send notification when invoice status changes"""
        print(f"📤 Sending invoice status changed notification: {invoice_data.get('invoice_id')}")
        
        try:
            await notify_clients(
                event_type="invoice_status_changed",
                message=f"🔄 Invoice status changed: {invoice_data.get('invoice_id')} ({old_status} → {new_status})",
                notification_type="info",
                data={
                    "invoice_id": invoice_data.get("invoice_id"),
                    "patient_name": invoice_data.get("patient_name"),
                    "patient_id": invoice_data.get("patient_id"),
                    "amount": str(invoice_data.get("amount", 0)),
                    "old_status": old_status,
                    "new_status": new_status,
                    "department": invoice_data.get("department", "Pharmacy"),
                    "payment_method": invoice_data.get("payment_method", "Unknown"),
                    "timestamp": datetime.now().isoformat(),
                    "redirect_to": "/billing"
                }
            )
            print("✅ Invoice status changed notification broadcasted successfully")
        except Exception as e:
            print(f"❌ Failed to broadcast invoice status changed notification: {e}")
            raise

    @staticmethod
    async def send_pharmacy_bulk_export(export_data: Dict[str, Any]):
        """Send notification for bulk export operations"""
        print(f"📤 Sending pharmacy bulk export notification: {export_data.get('export_type')}")
        
        try:
            await notify_clients(
                event_type="pharmacy_bulk_export",
                message=f"📊 Pharmacy {export_data.get('export_type')} export completed ({export_data.get('invoice_count', 0)} invoices)",
                notification_type="success",
                data={
                    "export_type": export_data.get("export_type"),
                    "invoice_count": export_data.get("invoice_count", 0),
                    "timestamp": datetime.now().isoformat(),
                    "redirect_to": "/billing"
                }
            )
            print("✅ Pharmacy bulk export notification broadcasted successfully")
        except Exception as e:
            print(f"❌ Failed to broadcast pharmacy bulk export notification: {e}")
            raise

    @staticmethod
    async def send_statistics_updated(stats_data: Dict[str, Any]):
        """Send notification when statistics are updated"""
        print(f"📤 Sending statistics updated notification")
        
        try:
            await notify_clients(
                event_type="statistics_updated",
                message=f"📈 Statistics updated: {stats_data.get('today_invoices', 0)} invoices today",
                notification_type="info",
                data={
                    "total_invoices": stats_data.get("total_invoices", 0),
                    "total_amount": stats_data.get("total_amount", 0),
                    "today_invoices": stats_data.get("today_invoices", 0),
                    "today_amount": stats_data.get("today_amount", 0),
                    "timestamp": datetime.now().isoformat(),
                    "redirect_to": "/dashboard"
                }
            )
            print("✅ Statistics updated notification broadcasted successfully")
        except Exception as e:
            print(f"❌ Failed to broadcast statistics updated notification: {e}")
            raise

    # ========== TREATMENT CHARGE NOTIFICATIONS ==========
    @staticmethod
    async def send_treatment_charge_created(charge, created_by_user):
        """Send notification when a treatment charge is created"""
        try:
            patient_name = charge.patient.full_name if charge.patient else "Unknown Patient"
            message = f"New treatment charge created for {patient_name}: {charge.description}"
            
            # Send to billing department
            await NotificationService.create_notification(
                title="New Treatment Charge",
                message=message,
                notification_type="BILLING",
                staff_id=None,  # Send to billing department
                extra_data={
                    "charge_id": charge.id,
                    "patient_id": charge.patient.id if charge.patient else None,
                    "amount": str(charge.amount) if charge.amount else "0.00",
                    "created_by": created_by_user.full_name or created_by_user.username,
                }
            )
        except Exception as e:
            print(f"Failed to send treatment charge created notification: {e}")

    @staticmethod
    async def send_treatment_charge_updated(charge, updated_by_user, changes):
        """Send notification when a treatment charge is updated"""
        try:
            patient_name = charge.patient.full_name if charge.patient else "Unknown Patient"
            changes_text = ", ".join(changes)
            message = f"Treatment charge updated for {patient_name}. Changes: {changes_text}"
            
            await NotificationService.create_notification(
                title="Treatment Charge Updated",
                message=message,
                notification_type="BILLING",
                staff_id=None,
                extra_data={
                    "charge_id": charge.id,
                    "patient_id": charge.patient.id if charge.patient else None,
                    "updated_by": updated_by_user.full_name or updated_by_user.username,
                    "changes": changes,
                }
            )
        except Exception as e:
            print(f"Failed to send treatment charge updated notification: {e}")

    @staticmethod
    async def send_treatment_charge_deleted(charge_data, deleted_by_user):
        """Send notification when a treatment charge is deleted"""
        try:
            message = f"Treatment charge deleted: {charge_data['description']} for {charge_data['patient_name']}"
            
            await NotificationService.create_notification(
                title="Treatment Charge Deleted",
                message=message,
                notification_type="BILLING",
                staff_id=None,
                extra_data={
                    "charge_id": charge_data['id'],
                    "patient_name": charge_data['patient_name'],
                    "deleted_by": deleted_by_user.full_name or deleted_by_user.username,
                    "amount": charge_data['amount'],
                }
            )
        except Exception as e:
            print(f"Failed to send treatment charge deleted notification: {e}")

    @staticmethod
    async def send_treatment_charge_status_updated(charge, updated_by_user, old_status, new_status):
        """Send notification when treatment charge status is updated"""
        try:
            patient_name = charge.patient.full_name if charge.patient else "Unknown Patient"
            message = f"Treatment charge status updated for {patient_name}: {old_status} → {new_status}"
            
            await NotificationService.create_notification(
                title="Charge Status Updated",
                message=message,
                notification_type="BILLING",
                staff_id=None,
                extra_data={
                    "charge_id": charge.id,
                    "patient_id": charge.patient.id if charge.patient else None,
                    "old_status": old_status,
                    "new_status": new_status,
                    "updated_by": updated_by_user.full_name or updated_by_user.username,
                }
            )
        except Exception as e:
            print(f"Failed to send treatment charge status notification: {e}")

    @staticmethod
    async def send_billing_error(error_message: str, bill_type: str = "", reference_id: str = ""):
        """
        Send billing error notification
        """
        try:
            from Fastapi_app.services.websocket_service import notify_clients
            
            await notify_clients({
                "type": "billing_error",
                "message": f"Billing Error: {error_message}",
                "bill_type": bill_type,
                "reference_id": reference_id,
                "timestamp": datetime.now().isoformat(),
                "alert": True,
                "color": "error"
            })
        except Exception as e:
            print(f"Failed to send billing error notification: {e}")



router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/test")
async def test_notification():
    await NotificationService.send_test_notification()
    return {"message": "Test notification sent"}

#Fastapi_app/routers/notifications.py
# from email import message

# from fastapi import APIRouter
# from Fastapi_app.services.websocket_service import manager, notify_clients
# from datetime import datetime
# from typing import Dict, Any, Optional

# class NotificationService:
#     # ========== APPOINTMENT NOTIFICATIONS ==========
#     @staticmethod
#     def send_appointment_created(appointment, staff, department):
#         print(f"📤 Sending appointment notification for: {appointment.id}")
#         notify_clients(
#             event_type="appointment_created",
#             message=f"New appointment: {appointment.patient_name} with Dr. {staff.full_name}",
#             notification_type="info",
#             data={
#                 "appointment_id": appointment.id,
#                 "patient_name": appointment.patient_name,
#                 "staff_name": staff.full_name,
#                 "department": department.name,
#                 "appointment_type": appointment.appointment_type,
#                 "room_no": appointment.room_no,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/appointments"
#             }
#         )

#     @staticmethod
#     def send_appointment_updated(appointment, staff, department):
#         notify_clients(
#             event_type="appointment_updated",
#             message=f"Appointment updated: {appointment.patient_name}",
#             notification_type="warning",
#             data={
#                 "appointment_id": appointment.id,
#                 "patient_name": appointment.patient_name,
#                 "staff_name": staff.full_name,
#                 "department": department.name,
#                 "status": appointment.status,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/appointments"
#             }
#         )

#     @staticmethod
#     def send_appointment_deleted(appointment_data):
#         """Send notification when appointment is deleted"""
#         print(f"🎯 Sending appointment deleted notification: {appointment_data}")
        
#         try:
#             notify_clients(
#                 event_type="appointment_deleted",
#                 message=f"🗑️ Appointment deleted: {appointment_data['patient_name']}",
#                 notification_type="error",
#                 data={
#                     "appointment_id": appointment_data['id'],
#                     "patient_name": appointment_data['patient_name'],
#                     "staff_name": appointment_data.get('staff_name', 'Unknown'),
#                     "department_name": appointment_data.get('department_name', 'Unknown'),
#                     "timestamp": datetime.now().isoformat(),
#                     "redirect_to": "/appointments"
#                 }
#             )
#             print("✅ Notification broadcasted successfully")
#         except Exception as e:
#             print(f"❌ Failed to broadcast notification: {e}")
#             raise

#     @staticmethod
#     def send_appointment_status_changed(appointment, old_status, new_status):
#         notify_clients(
#             event_type="appointment_status_changed",
#             message=f"Appointment status changed: {appointment.patient_name} ({old_status} → {new_status})",
#             notification_type="warning",
#             data={
#                 "appointment_id": appointment.id,
#                 "patient_name": appointment.patient_name,
#                 "old_status": old_status,
#                 "new_status": new_status,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/appointments"
#             }
#         )

#     # ========== PATIENT NOTIFICATIONS ==========
#     @staticmethod
#     def send_patient_registered(patient):
#         notify_clients(
#             event_type="patient_registered",
#             message=f"New patient registered: {patient.full_name}",
#             notification_type="info",
#             data={
#                 "patient_id": patient.patient_unique_id,
#                 "patient_name": patient.full_name,
#                 "phone_number": patient.phone_number,
#                 "department": patient.department.name if patient.department else "N/A",
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/patients/profile"
#             }
#         )

#     @staticmethod
#     def send_patient_updated(patient):
#         notify_clients(
#             event_type="patient_updated",
#             message=f"Patient updated: {patient.full_name}",
#             notification_type="warning",
#             data={
#                 "patient_id": patient.patient_unique_id,
#                 "patient_name": patient.full_name,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/patients/profile"
#             }
#         )

#     @staticmethod
#     def send_patient_deleted(patient_data):
#         notify_clients(
#             event_type="patient_deleted",
#             message=f"Patient deleted: {patient_data['full_name']}",
#             notification_type="error",
#             data={
#                 "patient_id": patient_data['patient_unique_id'],
#                 "patient_name": patient_data['full_name'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/patients/profile"
#             }
#         )

#     @staticmethod
#     def send_patient_admitted(patient, room_no):
#         notify_clients(
#             event_type="patient_admitted",
#             message=f"Patient admitted: {patient.full_name} to Room {room_no}",
#             notification_type="info",
#             data={
#                 "patient_id": patient.patient_unique_id,
#                 "patient_name": patient.full_name,
#                 "room_no": room_no,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/patients/profile"
#             }
#         )

#     @staticmethod
#     def send_patient_discharged(patient):
#         notify_clients(
#             event_type="patient_discharged",
#             message=f"Patient discharged: {patient.full_name}",
#             notification_type="success",
#             data={
#                 "patient_id": patient.patient_unique_id,
#                 "patient_name": patient.full_name,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/patients/profile"
#             }
#         )

#     # ========== LAB REPORT NOTIFICATIONS ==========
#     @staticmethod
#     def send_lab_report_created(lab_report):
#         notify_clients(
#             event_type="lab_report_created",
#             message=f"New lab report: {lab_report.order_id} for {lab_report.patient.full_name}",
#             notification_type="info",
#             data={
#                 "order_id": lab_report.order_id,
#                 "patient_name": lab_report.patient.full_name,
#                 "test_type": lab_report.test_type,
#                 "department": lab_report.department,
#                 "status": lab_report.status,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/Laboratory/LaboratoryReports"
#             }
#         )

#     @staticmethod
#     def send_lab_report_updated(lab_report):
#         notify_clients(
#             event_type="lab_report_updated",
#             message=f"Lab report {lab_report.order_id} status: {lab_report.status}",
#             notification_type="success",
#             data={
#                 "order_id": lab_report.order_id,
#                 "patient_name": lab_report.patient.full_name,
#                 "test_type": lab_report.test_type,
#                 "status": lab_report.status,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/Laboratory/LaboratoryReports"
#             }
#         )

#     @staticmethod
#     def send_lab_report_deleted(lab_report_data):
#         notify_clients(
#             event_type="lab_report_deleted",
#             message=f"Lab report deleted: {lab_report_data['order_id']}",
#             notification_type="error",
#             data={
#                 "order_id": lab_report_data['order_id'],
#                 "patient_name": lab_report_data['patient_name'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/Laboratory/LaboratoryReports"
#             }
#         )

#     @staticmethod
#     def send_lab_report_completed(lab_report):
#         notify_clients(
#             event_type="lab_report_completed",
#             message=f"Lab report completed: {lab_report.order_id}",
#             notification_type="success",
#             data={
#                 "order_id": lab_report.order_id,
#                 "patient_name": lab_report.patient.full_name,
#                 "test_type": lab_report.test_type,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/Laboratory/LaboratoryReports"
#             }
#         )

#     # ========== STAFF NOTIFICATIONS ==========
#     @staticmethod
#     def send_staff_registered(staff):
#         notify_clients(
#             event_type="staff_registered",
#             message=f"👨‍⚕️ New staff registered: {staff.full_name} - {staff.designation}",
#             notification_type="info",
#             data={
#                 "staff_id": staff.employee_id,
#                 "staff_name": staff.full_name,
#                 "designation": staff.designation,
#                 "department": staff.department.name,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/StaffManagement"
#             }
#         )

#     @staticmethod
#     def send_staff_updated(staff):
#         notify_clients(
#             event_type="staff_updated",
#             message=f"Staff updated: {staff.full_name}",
#             notification_type="warning",
#             data={
#                 "staff_id": staff.employee_id,
#                 "staff_name": staff.full_name,
#                 "designation": staff.designation,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/StaffManagement"
#             }
#         )

#     @staticmethod
#     def send_staff_deleted(staff_data):
#         notify_clients(
#             event_type="staff_deleted",
#             message=f"Staff deleted: {staff_data['full_name']}",
#             notification_type="error",
#             data={
#                 "staff_id": staff_data['employee_id'],
#                 "staff_name": staff_data['full_name'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/StaffManagement"
#             }
#         )

#     # ========== AMBULANCE NOTIFICATIONS ==========
#     @staticmethod
#     def send_ambulance_unit_created(unit):
#         notify_clients(
#             event_type="ambulance_unit_created",
#             message=f"🚑 New ambulance unit added: {unit.unit_number}",
#             notification_type="info",
#             data={
#                 "unit_id": unit.id,
#                 "unit_number": unit.unit_number,
#                 "vehicle_make": unit.vehicle_make,
#                 "vehicle_model": unit.vehicle_model,
#                 "in_service": unit.in_service,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ambulance"
#             }
#         )

#     @staticmethod
#     def send_ambulance_unit_updated(unit):
#         notify_clients(
#             event_type="ambulance_unit_updated",
#             message=f"🚑 Ambulance unit updated: {unit.unit_number}",
#             notification_type="warning",
#             data={
#                 "unit_id": unit.id,
#                 "unit_number": unit.unit_number,
#                 "in_service": unit.in_service,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ambulance"
#             }
#         )

#     @staticmethod
#     def send_ambulance_unit_deleted(unit_data):
#         notify_clients(
#             event_type="ambulance_unit_deleted",
#             message=f"🚑 Ambulance unit removed: {unit_data['unit_number']}",
#             notification_type="error",
#             data={
#                 "unit_id": unit_data['unit_id'],
#                 "unit_number": unit_data['unit_number'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ambulance"
#             }
#         )

#     @staticmethod
#     def send_ambulance_dispatch_updated(dispatch):
#         unit_number = dispatch.unit.unit_number if dispatch.unit else "Unknown"
#         notify_clients(
#             event_type="ambulance_dispatch_updated",
#             message=f"🚑 Dispatch updated: {dispatch.dispatch_id}",
#             notification_type="warning",
#             data={
#                 "dispatch_id": dispatch.dispatch_id,
#                 "unit_number": unit_number,
#                 "location": dispatch.location,
#                 "status": dispatch.status,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ambulance"
#             }
#         )

#     @staticmethod
#     def send_ambulance_dispatch_deleted(dispatch_data):
#         notify_clients(
#             event_type="ambulance_dispatch_deleted",
#             message=f"🚑 Dispatch cancelled: {dispatch_data['dispatch_id']}",
#             notification_type="error",
#             data={
#                 "dispatch_id": dispatch_data['dispatch_id'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ambulance"
#             }
#         )

#     @staticmethod
#     def send_ambulance_trip_deleted(trip_data):
#         notify_clients(
#             event_type="ambulance_trip_deleted",
#             message=f"🚑 Trip cancelled: {trip_data['trip_id']}",
#             notification_type="error",
#             data={
#                 "trip_id": trip_data['trip_id'],
#                 "unit_number": trip_data.get('unit_number', 'Unknown'),
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ambulance"
#             }
#         )

#     # ========== MEDICINE/PHARMACY NOTIFICATIONS ==========
#     @staticmethod
#     def send_medicine_allocated(allocation):
#         notify_clients(
#             event_type="medicine_allocated",
#             message=f"💊 Medicine allocated: {allocation.medicine_name} for {allocation.patient.full_name}",
#             notification_type="info",
#             data={
#                 "allocation_id": allocation.id,
#                 "patient_name": allocation.patient.full_name,
#                 "medicine_name": allocation.medicine_name,
#                 "dosage": allocation.dosage,
#                 "staff_name": allocation.staff.full_name if allocation.staff else "N/A",
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Doctors-Nurse/MedicineAllocation"
#             }
#         )

#     @staticmethod
#     def send_medicine_updated(allocation):
#         notify_clients(
#             event_type="medicine_updated",
#             message=f"💊 Medicine allocation updated: {allocation.medicine_name}",
#             notification_type="warning",
#             data={
#                 "allocation_id": allocation.id,
#                 "patient_name": allocation.patient.full_name,
#                 "medicine_name": allocation.medicine_name,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Doctors-Nurse/MedicineAllocation"
#             }
#         )

#     @staticmethod
#     def send_medicine_deleted(allocation_data):
#         notify_clients(
#             event_type="medicine_deleted",
#             message=f"💊 Medicine allocation deleted: {allocation_data['medicine_name']}",
#             notification_type="error",
#             data={
#                 "allocation_id": allocation_data['id'],
#                 "patient_name": allocation_data['patient_name'],
#                 "medicine_name": allocation_data['medicine_name'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Doctors-Nurse/MedicineAllocation"
#             }
#         )

#     @staticmethod
#     def send_stock_added(stock):
#         notify_clients(
#             event_type="stock_added",
#             message=f"📦 Stock added: {stock.product_name} ({stock.quantity} units)",
#             notification_type="success",
#             data={
#                 "stock_id": stock.id,
#                 "product_name": stock.product_name,
#                 "quantity": stock.quantity,
#                 "batch_number": stock.batch_number,
#                 "vendor": stock.vendor,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Pharmacy/Stock-Inventory"
#             }
#         )

#     @staticmethod
#     def send_stock_updated(stock, previous_quantity=None):
#         message = f"📦 Stock updated: {stock.product_name}"
#         if previous_quantity is not None:
#             message += f" (Quantity changed: {previous_quantity} → {stock.quantity})"
        
#         notify_clients(
#             event_type="stock_updated",
#             message=message,
#             notification_type="info",
#             data={
#                 "stock_id": stock.id,
#                 "product_name": stock.product_name,
#                 "current_quantity": stock.quantity,
#                 "previous_quantity": previous_quantity,
#                 "batch_number": stock.batch_number,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Pharmacy/Stock-Inventory"
#             }
#         )

#     @staticmethod
#     def send_stock_deleted(stock_data):
#         notify_clients(
#             event_type="stock_deleted",
#             message=f"🗑️ Stock deleted: {stock_data['product_name']}",
#             notification_type="warning",
#             data={
#                 "product_name": stock_data['product_name'],
#                 "batch_number": stock_data.get('batch_number', ''),
#                 "vendor": stock_data.get('vendor', ''),
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Pharmacy/Stock-Inventory"
#             }
#         )

#     @staticmethod
#     def send_stock_low(stock):
#         notify_clients(
#             event_type="stock_low",
#             message=f"📦 Low stock alert: {stock.product_name} (Only {stock.quantity} left)",
#             notification_type="warning",
#             data={
#                 "stock_id": stock.id,
#                 "product_name": stock.product_name,
#                 "current_stock": stock.quantity,
#                 "batch_number": stock.batch_number,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Pharmacy/Stock-Inventory"
#             }
#         )

#     @staticmethod
#     def send_stock_out(stock):
#         notify_clients(
#             event_type="stock_out",
#             message=f"📦 Stock out: {stock.product_name}",
#             notification_type="error",
#             data={
#                 "stock_id": stock.id,
#                 "product_name": stock.product_name,
#                 "batch_number": stock.batch_number,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Pharmacy/Stock-Inventory"
#             }
#         )

#     # ========== BILLING & PAYMENT NOTIFICATIONS ==========
#     @staticmethod
#     def send_invoice_generated(invoice):
#         notify_clients(
#             event_type="invoice_generated",
#             message=f"🧾 Invoice generated: {invoice.invoice_id} for {invoice.patient_name}",
#             notification_type="success",
#             data={
#                 "invoice_id": invoice.invoice_id,
#                 "patient_name": invoice.patient_name,
#                 "amount": str(invoice.amount),
#                 "status": invoice.status,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Billing"
#             }
#         )

#     @staticmethod
#     def send_payment_received(invoice):
#         notify_clients(
#             event_type="payment_received",
#             message=f"💰 Payment received: {invoice.invoice_id} - ${invoice.amount}",
#             notification_type="success",
#             data={
#                 "invoice_id": invoice.invoice_id,
#                 "patient_name": invoice.patient_name,
#                 "amount": str(invoice.amount),
#                 "payment_method": invoice.payment_method,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Billing"
#             }
#         )

#     @staticmethod
#     def send_payment_failed(invoice, reason):
#         notify_clients(
#             event_type="payment_failed",
#             message=f"❌ Payment failed: {invoice.invoice_id} - {reason}",
#             notification_type="error",
#             data={
#                 "invoice_id": invoice.invoice_id,
#                 "patient_name": invoice.patient_name,
#                 "amount": str(invoice.amount),
#                 "reason": reason,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Billing"
#             }
#         )

#     @staticmethod
#     def send_invoice_updated(invoice):
#         notify_clients(
#             event_type="invoice_updated",
#             message=f"🧾 Invoice updated: {invoice.invoice_id}",
#             notification_type="warning",
#             data={
#                 "invoice_id": invoice.invoice_id,
#                 "patient_name": invoice.patient_name,
#                 "amount": str(invoice.amount),
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Billing"
#             }
#         )

#     # ========== DEPARTMENT NOTIFICATIONS ==========
#     @staticmethod
#     def send_department_created(department):
#         notify_clients(
#             event_type="department_created",
#             message=f"New department created: {department.name}",
#             notification_type="success",
#             data={
#                 "department_id": department.id,
#                 "department_name": department.name,
#                 "status": department.status,
#                 "description": department.description or "",
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/Departments"
#             }
#         )

#     @staticmethod
#     def send_department_updated(department):
#         notify_clients(
#             event_type="department_updated",
#             message=f"Department updated: {department.name}",
#             notification_type="warning",
#             data={
#                 "department_id": department.id,
#                 "department_name": department.name,
#                 "status": department.status,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/Departments"
#             }
#         )

#     @staticmethod
#     def send_department_deleted(department_data):
#         notify_clients(
#             event_type="department_deleted",
#             message=f"Department deleted: {department_data['name']}",
#             notification_type="error",
#             data={
#                 "department_id": department_data.get('id'),
#                 "department_name": department_data.get('name'),
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/Departments"
#             }
#         )

#     @staticmethod
#     def send_department_status_changed(department, old_status, new_status):
#         notify_clients(
#             event_type="department_status_changed",
#             message=f"Department status changed: {department.name} ({old_status} → {new_status})",
#             notification_type="info",
#             data={
#                 "department_id": department.id,
#                 "department_name": department.name,
#                 "old_status": old_status,
#                 "new_status": new_status,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/Departments"
#             }
#         )

#     # ========== ROOM/BED MANAGEMENT NOTIFICATIONS ==========
#     @staticmethod
#     def send_bed_group_created(bed_group):
#         notify_clients(
#             event_type="bed_group_created",
#             message=f"🛏️ New bed group created: {bed_group.bedGroup}",
#             notification_type="success",
#             data={
#                 "bed_group_id": bed_group.id,
#                 "bed_group_name": bed_group.bedGroup,
#                 "capacity": bed_group.capacity,
#                 "status": bed_group.status,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/BedList"
#             }
#         )

#     @staticmethod
#     def send_bed_group_updated(bed_group):
#         notify_clients(
#             event_type="bed_group_updated",
#             message=f"🛏️ Bed group updated: {bed_group.bedGroup}",
#             notification_type="warning",
#             data={
#                 "bed_group_id": bed_group.id,
#                 "bed_group_name": bed_group.bedGroup,
#                 "capacity": bed_group.capacity,
#                 "occupied": bed_group.occupied,
#                 "unoccupied": bed_group.unoccupied,
#                 "status": bed_group.status,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/BedList"
#             }
#         )

#     @staticmethod
#     def send_bed_group_deleted(bed_group_data):
#         notify_clients(
#             event_type="bed_group_deleted",
#             message=f"🛏️ Bed group deleted: {bed_group_data['bedGroup']}",
#             notification_type="error",
#             data={
#                 "bed_group_id": bed_group_data['id'],
#                 "bed_group_name": bed_group_data['bedGroup'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/BedList"
#             }
#         )

#     @staticmethod
#     def send_bed_created(bed):
#         notify_clients(
#             event_type="bed_created",
#             message=f"🛏️ New bed added: {bed.bed_number} in {bed.bed_group.bedGroup}",
#             notification_type="info",
#             data={
#                 "bed_id": bed.id,
#                 "bed_number": bed.bed_number,
#                 "bed_group": bed.bed_group.bedGroup,
#                 "is_occupied": bed.is_occupied,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/BedList"
#             }
#         )

#     @staticmethod
#     def send_bed_updated(bed):
#         notify_clients(
#             event_type="bed_updated",
#             message=f"🛏️ Bed updated: {bed.bed_number} in {bed.bed_group.bedGroup}",
#             notification_type="warning",
#             data={
#                 "bed_id": bed.id,
#                 "bed_number": bed.bed_number,
#                 "bed_group": bed.bed_group.bedGroup,
#                 "is_occupied": bed.is_occupied,
#                 "patient_name": bed.patient.full_name if bed.patient else "None",
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/BedList"
#             }
#         )

#     @staticmethod
#     def send_bed_deleted(bed_data):
#         notify_clients(
#             event_type="bed_deleted",
#             message=f"🛏️ Bed deleted: {bed_data['bed_number']} from {bed_data['bed_group']}",
#             notification_type="error",
#             data={
#                 "bed_id": bed_data['id'],
#                 "bed_number": bed_data['bed_number'],
#                 "bed_group": bed_data['bed_group'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/BedList"
#             }
#         )

#     @staticmethod
#     def send_bed_allocated(bed, patient):
#         notify_clients(
#             event_type="bed_allocated",
#             message=f"🛏️ Bed allocated: {bed.bed_number} to {patient.full_name}",
#             notification_type="success",
#             data={
#                 "bed_id": bed.id,
#                 "bed_number": bed.bed_number,
#                 "bed_group": bed.bed_group.bedGroup,
#                 "patient_id": patient.patient_unique_id,
#                 "patient_name": patient.full_name,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/roommanagement"
#             }
#         )

#     @staticmethod
#     def send_bed_vacated(bed, patient_name):
#         notify_clients(
#             event_type="bed_vacated",
#             message=f"🛏️ Bed vacated: {bed.bed_number} by {patient_name}",
#             notification_type="info",
#             data={
#                 "bed_id": bed.id,
#                 "bed_number": bed.bed_number,
#                 "bed_group": bed.bed_group.bedGroup,
#                 "patient_name": patient_name,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/roommanagement"
#             }
#         )

#     @staticmethod
#     def send_room_occupancy_changed(bed_group, old_occupied, new_occupied):
#         notify_clients(
#             event_type="room_occupancy_changed",
#             message=f"🏨 Room occupancy changed: {bed_group.bedGroup} ({old_occupied} → {new_occupied} occupied)",
#             notification_type="info",
#             data={
#                 "bed_group_id": bed_group.id,
#                 "bed_group_name": bed_group.bedGroup,
#                 "old_occupied": old_occupied,
#                 "new_occupied": new_occupied,
#                 "total_capacity": bed_group.capacity,
#                 "available_beds": bed_group.unoccupied,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/BedList"
#             }
#         )

#     @staticmethod
#     def send_bed_capacity_changed(bed_group, old_capacity, new_capacity):
#         notify_clients(
#             event_type="bed_capacity_changed",
#             message=f"🏨 Bed capacity changed: {bed_group.bedGroup} ({old_capacity} → {new_capacity} beds)",
#             notification_type="warning",
#             data={
#                 "bed_group_id": bed_group.id,
#                 "bed_group_name": bed_group.bedGroup,
#                 "old_capacity": old_capacity,
#                 "new_capacity": new_capacity,
#                 "difference": new_capacity - old_capacity,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/BedList"
#             }
#         )

#     # ========== BLOOD BANK NOTIFICATIONS ==========
#     @staticmethod
#     def send_blood_group_created(blood_group):
#         notify_clients(
#             event_type="blood_group_created",
#             message=f"🩸 New blood group added: {blood_group['blood_type']}",
#             notification_type="success",
#             data={
#                 "blood_group_id": blood_group['id'],
#                 "blood_type": blood_group['blood_type'],
#                 "available_units": blood_group['available_units'],
#                 "status": blood_group['status'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     @staticmethod
#     def send_blood_group_updated(blood_group):
#         notify_clients(
#             event_type="blood_group_updated",
#             message=f"🩸 Blood group updated: {blood_group['blood_type']}",
#             notification_type="warning",
#             data={
#                 "blood_group_id": blood_group['id'],
#                 "blood_type": blood_group['blood_type'],
#                 "available_units": blood_group['available_units'],
#                 "status": blood_group['status'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     @staticmethod
#     def send_blood_group_deleted(blood_group_data):
#         notify_clients(
#             event_type="blood_group_deleted",
#             message=f"🩸 Blood group deleted: {blood_group_data['blood_type']}",
#             notification_type="error",
#             data={
#                 "blood_group_id": blood_group_data['id'],
#                 "blood_type": blood_group_data['blood_type'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     @staticmethod
#     def send_blood_stock_updated(blood_group, old_units, new_units):
#         notify_clients(
#             event_type="blood_stock_updated",
#             message=f"🩸 Blood stock updated: {blood_group['blood_type']} ({old_units} → {new_units} units)",
#             notification_type="info",
#             data={
#                 "blood_group_id": blood_group['id'],
#                 "blood_type": blood_group['blood_type'],
#                 "old_units": old_units,
#                 "new_units": new_units,
#                 "status": blood_group['status'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     @staticmethod
#     def send_blood_stock_low(blood_group):
#         notify_clients(
#             event_type="blood_stock_low",
#             message=f"🩸 Low blood stock alert: {blood_group['blood_type']} (Only {blood_group['available_units']} units left)",
#             notification_type="warning",
#             data={
#                 "blood_group_id": blood_group['id'],
#                 "blood_type": blood_group['blood_type'],
#                 "available_units": blood_group['available_units'],
#                 "status": blood_group['status'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     @staticmethod
#     def send_blood_stock_out(blood_group):
#         notify_clients(
#             event_type="blood_stock_out",
#             message=f"🩸 Blood stock out: {blood_group['blood_type']}",
#             notification_type="error",
#             data={
#                 "blood_group_id": blood_group['id'],
#                 "blood_type": blood_group['blood_type'],
#                 "status": blood_group['status'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     @staticmethod
#     def send_blood_donation_received(blood_group, units_received):
#         notify_clients(
#             event_type="blood_donation_received",
#             message=f"🩸 Blood donation received: {units_received} units of {blood_group['blood_type']}",
#             notification_type="success",
#             data={
#                 "blood_group_id": blood_group['id'],
#                 "blood_type": blood_group['blood_type'],
#                 "units_received": units_received,
#                 "new_total_units": blood_group['available_units'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     @staticmethod
#     def send_blood_issued(blood_group, units_issued, patient_name):
#         notify_clients(
#             event_type="blood_issued",
#             message=f"🩸 Blood issued: {units_issued} units of {blood_group['blood_type']} to {patient_name}",
#             notification_type="info",
#             data={
#                 "blood_group_id": blood_group['id'],
#                 "blood_type": blood_group['blood_type'],
#                 "units_issued": units_issued,
#                 "patient_name": patient_name,
#                 "remaining_units": blood_group['available_units'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     # ========== DONOR NOTIFICATIONS ==========
#     @staticmethod
#     def send_donor_registered(donor):
#         notify_clients(
#             event_type="donor_registered",
#             message=f"👤 New donor registered: {donor.donor_name} ({donor.blood_type})",
#             notification_type="success",
#             data={
#                 "donor_id": donor.id,
#                 "donor_name": donor.donor_name,
#                 "blood_type": donor.blood_type,
#                 "phone": donor.phone,
#                 "status": donor.status,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     @staticmethod
#     def send_donor_updated(donor):
#         notify_clients(
#             event_type="donor_updated",
#             message=f"👤 Donor updated: {donor.donor_name}",
#             notification_type="warning",
#             data={
#                 "donor_id": donor.id,
#                 "donor_name": donor.donor_name,
#                 "blood_type": donor.blood_type,
#                 "status": donor.status,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     @staticmethod
#     def send_donor_deleted(donor_data):
#         notify_clients(
#             event_type="donor_deleted",
#             message=f"👤 Donor deleted: {donor_data['donor_name']}",
#             notification_type="error",
#             data={
#                 "donor_id": donor_data['id'],
#                 "donor_name": donor_data['donor_name'],
#                 "blood_type": donor_data['blood_type'],
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     @staticmethod
#     def send_donor_eligibility_changed(donor, old_status, new_status):
#         notify_clients(
#             event_type="donor_eligibility_changed",
#             message=f"👤 Donor eligibility changed: {donor.donor_name} ({old_status} → {new_status})",
#             notification_type="info",
#             data={
#                 "donor_id": donor.id,
#                 "donor_name": donor.donor_name,
#                 "blood_type": donor.blood_type,
#                 "old_status": old_status,
#                 "new_status": new_status,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     @staticmethod
#     def send_donation_received(donor, units_donated):
#         notify_clients(
#             event_type="donation_received",
#             message=f"🩸 Donation received: {units_donated} units from {donor.donor_name}",
#             notification_type="success",
#             data={
#                 "donor_id": donor.id,
#                 "donor_name": donor.donor_name,
#                 "blood_type": donor.blood_type,
#                 "units_donated": units_donated,
#                 "last_donation_date": donor.last_donation_date.isoformat() if donor.last_donation_date else None,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     @staticmethod
#     def send_donor_became_eligible(donor):
#         notify_clients(
#             event_type="donor_became_eligible",
#             message=f"✅ Donor now eligible: {donor.donor_name} can donate blood",
#             notification_type="success",
#             data={
#                 "donor_id": donor.id,
#                 "donor_name": donor.donor_name,
#                 "blood_type": donor.blood_type,
#                 "phone": donor.phone,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     @staticmethod
#     def send_urgent_blood_request(blood_type, units_needed, patient_name=None):
#         message = f"🚨 URGENT: {units_needed} units of {blood_type} needed"
#         if patient_name:
#             message += f" for {patient_name}"
        
#         notify_clients(
#             event_type="urgent_blood_request",
#             message=message,
#             notification_type="error",
#             data={
#                 "blood_type": blood_type,
#                 "units_needed": units_needed,
#                 "patient_name": patient_name,
#                 "urgent": True,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/ClinicalResources/ClinicalReports/BloodBank"
#             }
#         )

#     # ========== BED GROUP SPECIFIC NOTIFICATIONS ==========
#     @staticmethod
#     def send_bed_group_capacity_changed(bed_group, old_capacity, new_capacity):
#         notify_clients(
#             event_type="bed_group_capacity_changed",
#             message=f"🏨 Bed group capacity changed: {bed_group.bedGroup} ({old_capacity} → {new_capacity} beds)",
#             notification_type="info",
#             data={
#                 "bed_group_id": bed_group.id,
#                 "bed_group_name": bed_group.bedGroup,
#                 "old_capacity": old_capacity,
#                 "new_capacity": new_capacity,
#                 "occupied": bed_group.occupied,
#                 "unoccupied": bed_group.unoccupied,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/roommanagement"
#             }
#         )

#     @staticmethod
#     def send_bed_group_full(bed_group):
#         notify_clients(
#             event_type="bed_group_full",
#             message=f"🏨 Bed group full: {bed_group.bedGroup} (No available beds)",
#             notification_type="warning",
#             data={
#                 "bed_group_id": bed_group.id,
#                 "bed_group_name": bed_group.bedGroup,
#                 "capacity": bed_group.capacity,
#                 "occupied": bed_group.occupied,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/roommanagement"
#             }
#         )

#     @staticmethod
#     def send_bed_group_available(bed_group):
#         notify_clients(
#             event_type="bed_group_available",
#             message=f"🏨 Bed group available: {bed_group.bedGroup} has free beds",
#             notification_type="success",
#             data={
#                 "bed_group_id": bed_group.id,
#                 "bed_group_name": bed_group.bedGroup,
#                 "available_beds": bed_group.unoccupied,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Administration/roommanagement"
#             }
#         )

#     # ========== SYSTEM & SECURITY NOTIFICATIONS ==========
#     @staticmethod
#     def send_emergency_alert(message, data=None):
#         notify_clients(
#             event_type="emergency_alert",
#             message=f"🚨 EMERGENCY: {message}",
#             notification_type="error",
#             data={
#                 "alert": True,
#                 "message": message,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/emergency",
#                 **(data or {})
#             }
#         )

#     @staticmethod
#     def send_system_alert(message, alert_type="warning"):
#         notify_clients(
#             event_type="system_alert",
#             message=f"⚠️ System: {message}",
#             notification_type=alert_type,
#             data={
#                 "system_alert": True,
#                 "message": message,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/dashboard"
#             }
#         )

#     @staticmethod
#     def send_user_login(user, ip_address):
#         notify_clients(
#             event_type="user_login",
#             message=f"🔐 User logged in: {user.username} from {ip_address}",
#             notification_type="info",
#             data={
#                 "user_id": user.id,
#                 "username": user.username,
#                 "role": user.role,
#                 "ip_address": ip_address,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/dashboard"
#             }
#         )

#     @staticmethod
#     def send_user_logout(user):
#         notify_clients(
#             event_type="user_logout",
#             message=f"🔐 User logged out: {user.username}",
#             notification_type="info",
#             data={
#                 "user_id": user.id,
#                 "username": user.username,
#                 "role": user.role,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/login"
#             }
#         )

#     @staticmethod
#     def send_unauthorized_access_attempt(user_data, ip_address):
#         notify_clients(
#             event_type="unauthorized_access",
#             message=f"🚫 Unauthorized access attempt from {ip_address}",
#             notification_type="error",
#             data={
#                 "ip_address": ip_address,
#                 "username": user_data.get('username', 'Unknown'),
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/security"
#             }
#         )

#     # ========== TEST NOTIFICATION ==========
#     @staticmethod
#     def send_test_notification():
#         notify_clients(
#             event_type="test_notification",
#             message="This is a test notification from the server!",
#             notification_type="info",
#             data={
#                 "test": True,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/dashboard"
#             }
#         )

#     @staticmethod
#     def send_invoice_created(invoice_data: Dict[str, Any]):
#         notify_clients(
#             event_type="invoice_created",
#             message=f"New invoice: {invoice_data.get('patient_name')} - ₹{invoice_data.get('amount', 0)}",
#             notification_type="success",
#             data={**invoice_data, "timestamp": datetime.now().isoformat(), "redirect_to": "/Billing"}
#         )

#     @staticmethod
#     def send_invoice_deleted(invoice_data: Dict[str, Any]):
#         notify_clients(
#             event_type="invoice_deleted",
#             message=f"Invoice deleted: {invoice_data.get('invoice_id')}",
#             notification_type="warning",
#             data={**invoice_data, "timestamp": datetime.now().isoformat(), "redirect_to": "/Billing"}
#         )

#     @staticmethod
#     def send_payment_received(invoice_data: Dict[str, Any]):
#         notify_clients(
#             event_type="payment_received",
#             message=f"Payment received: ₹{invoice_data.get('amount', 0)}",
#             notification_type="success",
#             data={**invoice_data, "timestamp": datetime.now().isoformat()}
#         )

#     @staticmethod
#     def send_invoice_status_changed(invoice_data: Dict[str, Any], old_status: str, new_status: str):
#         notify_clients(
#             event_type="invoice_status_changed",
#             message=f"Status: {old_status} → {new_status}",
#             notification_type="info",
#             data={
#                 **invoice_data,
#                 "old_status": old_status,
#                 "new_status": new_status,
#                 "timestamp": datetime.now().isoformat()
#             }
#         )

#     @staticmethod
#     def send_invoice_not_found(invoice_id: str):
#         notify_clients(
#             event_type="invoice_not_found",
#             message=f"Invoice not found: {invoice_id}",
#             notification_type="warning",
#             data={"invoice_id": invoice_id, "timestamp": datetime.now().isoformat()}
#         )

#     @staticmethod
#     def send_pdf_downloaded(invoice_id: str = "", bulk: bool = False, count: int = 1):
#         message = f"{count} PDF(s) downloaded" if bulk else f"PDF downloaded: {invoice_id}"
#         event = "pdf_bulk_downloaded" if bulk else "pdf_downloaded"
#         notify_clients(
#             event_type=event,
#             message=message,
#             notification_type="info",
#             data={
#                 "invoice_id": invoice_id or None,
#                 "count": count,
#                 "is_bulk": bulk,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Billing"
#             }
#         )

#     @staticmethod
#     def send_export_completed(export_type: str, count: int):
#         notify_clients(
#             event_type="export_completed",
#             message=f"{export_type} export completed: {count} records",
#             notification_type="success",
#             data={"export_type": export_type, "count": count, "timestamp": datetime.now().isoformat()}
#         )

#     @staticmethod
#     def send_billing_error(error_message: str, invoice_id: Optional[str] = None):
#         notify_clients(
#             event_type="billing_error",
#             message=f"Billing Error: {error_message}",
#             notification_type="error",
#             data={
#                 "error_message": error_message,
#                 "invoice_id": invoice_id,
#                 "timestamp": datetime.now().isoformat(),
#                 "redirect_to": "/Billing"
#             }
#         )

#     @staticmethod
#     def send_statistics_updated(statistics: Dict[str, Any]):
#         notify_clients(
#             event_type="billing_statistics_updated",
#             message="Billing statistics updated",
#             notification_type="info",
#             data={**statistics, "timestamp": datetime.now().isoformat()}
#         )

#     # ========== PHARMACY & HOSPITAL BILLING NOTIFICATIONS ==========
#     @staticmethod
#     def send_pharmacy_bill_generated(invoice_data: Dict[str, Any]):
#         """Send notification when pharmacy bill is generated"""
#         print(f"📤 Sending pharmacy bill generated notification: {invoice_data.get('bill_no')}")
        
#         try:
#             notify_clients(
#                 event_type="pharmacy_bill_generated",
#                 message=f"💊 Pharmacy bill generated: {invoice_data.get('bill_no')} for {invoice_data.get('patient_name')}",
#                 notification_type="success",
#                 data={
#                     "bill_no": invoice_data.get("bill_no"),
#                     "patient_name": invoice_data.get("patient_name"),
#                     "patient_id": invoice_data.get("patient_id"),
#                     "net_amount": str(invoice_data.get("net_amount", 0)),
#                     "payment_status": invoice_data.get("payment_status", "Unpaid"),
#                     "billing_staff": invoice_data.get("billing_staff", "Unknown"),
#                     "patient_type": invoice_data.get("patient_type", "Outpatient"),
#                     "timestamp": datetime.now().isoformat(),
#                     "redirect_to": f"/pharmacy/invoice/{invoice_data.get('bill_no')}"
#                 }
#             )
#             print("✅ Pharmacy bill generated notification broadcasted successfully")
#         except Exception as e:
#             print(f"❌ Failed to broadcast pharmacy bill notification: {e}")
#             raise

#     @staticmethod
#     def send_pharmacy_payment_received(invoice_data: Dict[str, Any]):
#         """Send notification when pharmacy payment is received"""
#         print(f"📤 Sending pharmacy payment received notification: {invoice_data.get('bill_no')}")
        
#         try:
#             notify_clients(
#                 event_type="pharmacy_payment_received",
#                 message=f"💰 Pharmacy payment received: {invoice_data.get('bill_no')} - ₹{invoice_data.get('net_amount', 0)}",
#                 notification_type="success",
#                 data={
#                     "bill_no": invoice_data.get("bill_no"),
#                     "patient_name": invoice_data.get("patient_name"),
#                     "net_amount": str(invoice_data.get("net_amount", 0)),
#                     "payment_mode": invoice_data.get("payment_mode", "Unknown"),
#                     "payment_type": invoice_data.get("payment_type", "Unknown"),
#                     "timestamp": datetime.now().isoformat(),
#                     "redirect_to": f"/pharmacy/invoice/{invoice_data.get('bill_no')}"
#                 }
#             )
#             print("✅ Pharmacy payment notification broadcasted successfully")
#         except Exception as e:
#             print(f"❌ Failed to broadcast pharmacy payment notification: {e}")
#             raise

#     @staticmethod
#     def send_hospital_bill_generated(invoice_data: Dict[str, Any]):
#         """Send notification when hospital bill is generated"""
#         print(f"📤 Sending hospital bill generated notification: {invoice_data.get('invoice_id')}")
        
#         try:
#             notify_clients(
#                 event_type="hospital_bill_generated",
#                 message=f"🏥 Hospital bill generated: {invoice_data.get('invoice_id')} for {invoice_data.get('patient_name')}",
#                 notification_type="success",
#                 data={
#                     "invoice_id": invoice_data.get("invoice_id"),
#                     "patient_name": invoice_data.get("patient_name"),
#                     "patient_id": invoice_data.get("patient_id"),
#                     "amount": str(invoice_data.get("amount", 0)),
#                     "department": invoice_data.get("department", "Unknown"),
#                     "payment_method": invoice_data.get("payment_method", "Unknown"),
#                     "status": invoice_data.get("status", "Pending"),
#                     "timestamp": datetime.now().isoformat(),
#                     "redirect_to": f"/hospital/billing/{invoice_data.get('invoice_id')}"
#                 }
#             )
#             print("✅ Hospital bill generated notification broadcasted successfully")
#         except Exception as e:
#             print(f"❌ Failed to broadcast hospital bill notification: {e}")
#             raise

#     @staticmethod
#     def send_hospital_payment_received(invoice_data: Dict[str, Any]):
#         """Send notification when hospital payment is received"""
#         print(f"📤 Sending hospital payment received notification: {invoice_data.get('invoice_id')}")
        
#         try:
#             notify_clients(
#                 event_type="hospital_payment_received",
#                 message=f"💰 Hospital payment received: {invoice_data.get('invoice_id')} - ₹{invoice_data.get('amount', 0)}",
#                 notification_type="success",
#                 data={
#                     "invoice_id": invoice_data.get("invoice_id"),
#                     "patient_name": invoice_data.get("patient_name"),
#                     "amount": str(invoice_data.get("amount", 0)),
#                     "payment_method": invoice_data.get("payment_method", "Unknown"),
#                     "status": "Paid",
#                     "timestamp": datetime.now().isoformat(),
#                     "redirect_to": f"/hospital/billing/{invoice_data.get('invoice_id')}"
#                 }
#             )
#             print("✅ Hospital payment notification broadcasted successfully")
#         except Exception as e:
#             print(f"❌ Failed to broadcast hospital payment notification: {e}")
#             raise

#     @staticmethod
#     def send_stock_low_alert(stock_data: Dict[str, Any]):
#         """Send notification when stock is low"""
#         print(f"📤 Sending stock low alert: {stock_data.get('product_name')}")
        
#         try:
#             notify_clients(
#                 event_type="stock_low_alert",
#                 message=f"⚠️ Low stock alert: {stock_data.get('product_name')} (Only {stock_data.get('quantity', 0)} left)",
#                 notification_type="warning",
#                 data={
#                     "product_name": stock_data.get("product_name"),
#                     "item_code": stock_data.get("item_code"),
#                     "quantity": stock_data.get("quantity", 0),
#                     "batch_number": stock_data.get("batch_number", ""),
#                     "vendor": stock_data.get("vendor", ""),
#                     "timestamp": datetime.now().isoformat(),
#                     "redirect_to": "/Pharmacy/Stock-Inventory"
#                 }
#             )
#             print("✅ Stock low alert notification broadcasted successfully")
#         except Exception as e:
#             print(f"❌ Failed to broadcast stock alert notification: {e}")
#             raise

#     @staticmethod
#     def send_stock_out_alert(stock_data: Dict[str, Any]):
#         """Send notification when stock is out"""
#         print(f"📤 Sending stock out alert: {stock_data.get('product_name')}")
        
#         try:
#             notify_clients(
#                 event_type="stock_out_alert",
#                 message=f"🛑 Out of stock: {stock_data.get('product_name')}",
#                 notification_type="error",
#                 data={
#                     "product_name": stock_data.get("product_name"),
#                     "item_code": stock_data.get("item_code"),
#                     "batch_number": stock_data.get("batch_number", ""),
#                     "vendor": stock_data.get("vendor", ""),
#                     "timestamp": datetime.now().isoformat(),
#                     "redirect_to": "/Pharmacy/Stock-Inventory"
#                 }
#             )
#             print("✅ Stock out alert notification broadcasted successfully")
#         except Exception as e:
#             print(f"❌ Failed to broadcast stock out notification: {e}")
#             raise

#     @staticmethod
#     def send_invoice_not_found(invoice_id: str):
#         """Send notification when invoice is not found"""
#         print(f"📤 Sending invoice not found notification: {invoice_id}")
        
#         try:
#             notify_clients(
#                 event_type="invoice_not_found",
#                 message=f"❓ Invoice not found: {invoice_id}",
#                 notification_type="warning",
#                 data={
#                     "invoice_id": invoice_id,
#                     "timestamp": datetime.now().isoformat(),
#                     "redirect_to": "/pharmacy/invoices"
#                 }
#             )
#             print("✅ Invoice not found notification broadcasted successfully")
#         except Exception as e:
#             print(f"❌ Failed to broadcast invoice not found notification: {e}")
#             raise

#     @staticmethod
#     def send_invoice_deleted(invoice_data: Dict[str, Any]):
#         """Send notification when invoice is deleted"""
#         print(f"📤 Sending invoice deleted notification: {invoice_data.get('invoice_id')}")
        
#         try:
#             notify_clients(
#                 event_type="invoice_deleted",
#                 message=f"🗑️ Invoice deleted: {invoice_data.get('invoice_id')}",
#                 notification_type="warning",
#                 data={
#                     "invoice_id": invoice_data.get("invoice_id"),
#                     "patient_name": invoice_data.get("patient_name"),
#                     "patient_id": invoice_data.get("patient_id"),
#                     "amount": str(invoice_data.get("amount", 0)),
#                     "status": invoice_data.get("status", "Deleted"),
#                     "department": invoice_data.get("department", "Pharmacy"),
#                     "payment_method": invoice_data.get("payment_method", "Unknown"),
#                     "timestamp": datetime.now().isoformat(),
#                     "redirect_to": "/pharmacy/invoices"
#                 }
#             )
#             print("✅ Invoice deleted notification broadcasted successfully")
#         except Exception as e:
#             print(f"❌ Failed to broadcast invoice deleted notification: {e}")
#             raise

#     @staticmethod
#     def send_invoice_status_changed(invoice_data: Dict[str, Any], old_status: str, new_status: str):
#         """Send notification when invoice status changes"""
#         print(f"📤 Sending invoice status changed notification: {invoice_data.get('invoice_id')}")
        
#         try:
#             notify_clients(
#                 event_type="invoice_status_changed",
#                 message=f"🔄 Invoice status changed: {invoice_data.get('invoice_id')} ({old_status} → {new_status})",
#                 notification_type="info",
#                 data={
#                     "invoice_id": invoice_data.get("invoice_id"),
#                     "patient_name": invoice_data.get("patient_name"),
#                     "patient_id": invoice_data.get("patient_id"),
#                     "amount": str(invoice_data.get("amount", 0)),
#                     "old_status": old_status,
#                     "new_status": new_status,
#                     "department": invoice_data.get("department", "Pharmacy"),
#                     "payment_method": invoice_data.get("payment_method", "Unknown"),
#                     "timestamp": datetime.now().isoformat(),
#                     "redirect_to": f"/pharmacy/invoice/{invoice_data.get('invoice_id')}"
#                 }
#             )
#             print("✅ Invoice status changed notification broadcasted successfully")
#         except Exception as e:
#             print(f"❌ Failed to broadcast invoice status changed notification: {e}")
#             raise

#     @staticmethod
#     def send_pharmacy_bulk_export(export_data: Dict[str, Any]):
#         """Send notification for bulk export operations"""
#         print(f"📤 Sending pharmacy bulk export notification: {export_data.get('export_type')}")
        
#         try:
#             notify_clients(
#                 event_type="pharmacy_bulk_export",
#                 message=f"📊 Pharmacy {export_data.get('export_type')} export completed ({export_data.get('invoice_count', 0)} invoices)",
#                 notification_type="success",
#                 data={
#                     "export_type": export_data.get("export_type"),
#                     "invoice_count": export_data.get("invoice_count", 0),
#                     "timestamp": datetime.now().isoformat(),
#                     "redirect_to": "/pharmacy/invoices"
#                 }
#             )
#             print("✅ Pharmacy bulk export notification broadcasted successfully")
#         except Exception as e:
#             print(f"❌ Failed to broadcast pharmacy bulk export notification: {e}")
#             raise

#     @staticmethod
#     def send_statistics_updated(stats_data: Dict[str, Any]):
#         """Send notification when statistics are updated"""
#         print(f"📤 Sending statistics updated notification")
        
#         try:
#             notify_clients(
#                 event_type="statistics_updated",
#                 message=f"📈 Statistics updated: {stats_data.get('today_invoices', 0)} invoices today",
#                 notification_type="info",
#                 data={
#                     "total_invoices": stats_data.get("total_invoices", 0),
#                     "total_amount": stats_data.get("total_amount", 0),
#                     "today_invoices": stats_data.get("today_invoices", 0),
#                     "today_amount": stats_data.get("today_amount", 0),
#                     "timestamp": datetime.now().isoformat(),
#                     "redirect_to": "/pharmacy/dashboard"
#                 }
#             )
#             print("✅ Statistics updated notification broadcasted successfully")
#         except Exception as e:
#             print(f"❌ Failed to broadcast statistics updated notification: {e}")
#             raise

#     # ========== TREATMENT CHARGE NOTIFICATIONS ==========
#     @staticmethod
#     def send_treatment_charge_created(charge, created_by_user):
#         """Send notification when a treatment charge is created"""
#         try:
#             patient_name = charge.patient.full_name if charge.patient else "Unknown Patient"
#             message = f"New treatment charge created for {patient_name}: {charge.description}"
            
#             # Send to billing department
#             NotificationService.create_notification(
#                 title="New Treatment Charge",
#                 message=message,
#                 notification_type="BILLING",
#                 staff_id=None,  # Send to billing department
#                 extra_data={
#                     "charge_id": charge.id,
#                     "patient_id": charge.patient.id if charge.patient else None,
#                     "amount": str(charge.amount) if charge.amount else "0.00",
#                     "created_by": created_by_user.full_name or created_by_user.username,
#                 }
#             )
#         except Exception as e:
#             print(f"Failed to send treatment charge created notification: {e}")

#     @staticmethod
#     def send_treatment_charge_updated(charge, updated_by_user, changes):
#         """Send notification when a treatment charge is updated"""
#         try:
#             patient_name = charge.patient.full_name if charge.patient else "Unknown Patient"
#             changes_text = ", ".join(changes)
#             message = f"Treatment charge updated for {patient_name}. Changes: {changes_text}"
            
#             NotificationService.create_notification(
#                 title="Treatment Charge Updated",
#                 message=message,
#                 notification_type="BILLING",
#                 staff_id=None,
#                 extra_data={
#                     "charge_id": charge.id,
#                     "patient_id": charge.patient.id if charge.patient else None,
#                     "updated_by": updated_by_user.full_name or updated_by_user.username,
#                     "changes": changes,
#                 }
#             )
#         except Exception as e:
#             print(f"Failed to send treatment charge updated notification: {e}")

#     @staticmethod
#     def send_treatment_charge_deleted(charge_data, deleted_by_user):
#         """Send notification when a treatment charge is deleted"""
#         try:
#             message = f"Treatment charge deleted: {charge_data['description']} for {charge_data['patient_name']}"
            
#             NotificationService.create_notification(
#                 title="Treatment Charge Deleted",
#                 message=message,
#                 notification_type="BILLING",
#                 staff_id=None,
#                 extra_data={
#                     "charge_id": charge_data['id'],
#                     "patient_name": charge_data['patient_name'],
#                     "deleted_by": deleted_by_user.full_name or deleted_by_user.username,
#                     "amount": charge_data['amount'],
#                 }
#             )
#         except Exception as e:
#             print(f"Failed to send treatment charge deleted notification: {e}")

#     @staticmethod
#     def send_treatment_charge_status_updated(charge, updated_by_user, old_status, new_status):
#         """Send notification when treatment charge status is updated"""
#         try:
#             patient_name = charge.patient.full_name if charge.patient else "Unknown Patient"
#             message = f"Treatment charge status updated for {patient_name}: {old_status} → {new_status}"
            
#             NotificationService.create_notification(
#                 title="Charge Status Updated",
#                 message=message,
#                 notification_type="BILLING",
#                 staff_id=None,
#                 extra_data={
#                     "charge_id": charge.id,
#                     "patient_id": charge.patient.id if charge.patient else None,
#                     "old_status": old_status,
#                     "new_status": new_status,
#                     "updated_by": updated_by_user.full_name or updated_by_user.username,
#                 }
#             )
#         except Exception as e:
#             print(f"Failed to send treatment charge status notification: {e}")

#     @staticmethod
#     def send_billing_error(error_message: str, bill_type: str = "", reference_id: str = ""):
#         """
#         Send billing error notification
#         """
#         try:
#             from Fastapi_app.services.websocket_service import notify_clients
            
#             notify_clients({
#                 "type": "billing_error",
#                 "message": f"Billing Error: {error_message}",
#                 "bill_type": bill_type,
#                 "reference_id": reference_id,
#                 "timestamp": datetime.now().isoformat(),
#                 "alert": True,
#                 "color": "error"
#             })
#         except Exception as e:
#             print(f"Failed to send billing error notification: {e}")

# router = APIRouter(prefix="/notifications", tags=["Notifications"])

# @router.post("/test")
# def test_notification():
#     NotificationService.send_test_notification()
#     return {"message": "Test notification sent"}