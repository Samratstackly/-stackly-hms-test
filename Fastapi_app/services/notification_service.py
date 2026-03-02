# fastapi_app/services/notification_service.py

from datetime import datetime
from typing import Dict, Any, Optional  # ← THIS WAS MISSING!

# Your existing imports
from Fastapi_app.main import manager
from Fastapi_app.services.websocket_service import notify_clients


class NotificationService:
    # Generic helper – use this everywhere (recommended)
    @staticmethod
    async def send_notification(
        event_type: str,
        message: str,
        notification_type: str = "info",
        data: Dict[str, Any] = None
    ):
        payload = {
            "type": event_type,
            "message": message,
            "notification_type": notification_type,
            "timestamp": datetime.now().isoformat(),
            "data": data or {}
        }
        await manager.broadcast(payload)

    # Keep your specific methods – they can use the generic one or notify_clients directly
    @staticmethod
    async def send_appointment_created(appointment, staff, department):
        await NotificationService.send_notification(
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
                "redirect_to": "/appointments"
            }
        )

    @staticmethod
    async def send_invoice_created(invoice_data: Dict[str, Any]):
        await NotificationService.send_notification(
            event_type="invoice_created",
            message=f"New invoice: {invoice_data.get('patient_name')} - ₹{invoice_data.get('amount', 0)}",
            notification_type="success",
            data={**invoice_data, "redirect_to": "/billing"}
        )

    @staticmethod
    async def send_invoice_deleted(invoice_data: Dict[str, Any]):
        await NotificationService.send_notification(
            event_type="invoice_deleted",
            message=f"Invoice {invoice_data.get('invoice_id')} deleted",
            notification_type="warning",
            data={**invoice_data, "redirect_to": "/billing"}
        )

    @staticmethod
    async def send_payment_received(invoice_data: Dict[str, Any]):
        await NotificationService.send_notification(
            event_type="payment_received",
            message=f"Payment received: ₹{invoice_data.get('amount', 0)}",
            notification_type="success",
            data={**invoice_data}
        )

    @staticmethod
    async def send_invoice_status_changed(invoice_data: Dict[str, Any], old_status: str, new_status: str):
        await NotificationService.send_notification(
            event_type="invoice_status_changed",
            message=f"Status changed: {old_status} → {new_status}",
            notification_type="info",
            data={
                **invoice_data,
                "old_status": old_status,
                "new_status": new_status
            }
        )

    @staticmethod
    async def send_invoice_not_found(invoice_id: str):
        await NotificationService.send_notification(
            event_type="invoice_not_found",
            message=f"Invoice not found: {invoice_id}",
            notification_type="warning",
            data={"invoice_id": invoice_id}
        )

    @staticmethod
    async def send_pdf_downloaded(invoice_id: str = "", bulk: bool = False, count: int = 1):
        message = f"{count} PDF(s) downloaded" if bulk else f"PDF downloaded: {invoice_id}"
        event = "pdf_bulk_downloaded" if bulk else "pdf_downloaded"
        await NotificationService.send_notification(
            event_type=event,
            message=message,
            notification_type="info",
            data={
                "invoice_id": invoice_id or None,
                "count": count,
                "is_bulk": bulk,
                "redirect_to": "/billing"
            }
        )

    @staticmethod
    async def send_export_completed(export_type: str, count: int):
        await NotificationService.send_notification(
            event_type="export_completed",
            message=f"{export_type} export completed ({count} records)",
            notification_type="success",
            data={"export_type": export_type, "count": count}
        )

    @staticmethod
    async def send_billing_error(error_message: str, invoice_id: Optional[str] = None):
        await NotificationService.send_notification(
            event_type="billing_error",
            message=f"Billing Error: {error_message}",
            notification_type="error",
            data={
                "error_message": error_message,
                "invoice_id": invoice_id,
                "redirect_to": "/billing"
            }
        )

    @staticmethod
    async def send_statistics_updated(statistics: Dict[str, Any]):
        await NotificationService.send_notification(
            event_type="billing_statistics_updated",
            message="Billing statistics updated",
            notification_type="info",
            data=statistics
        )

    # Test endpoint helper
    @staticmethod
    async def send_test_notification():
        await NotificationService.send_notification(
            event_type="test_notification",
            message="Test notification from server!",
            notification_type="info",
            data={"test": True, "redirect_to": "/dashboard"}
        )

# fastapi_app/services/notification_service.py

# fastapi_app/services/notification_service.py

# from datetime import datetime
# from typing import Dict, Any, Optional

# from Fastapi_app.services.websocket_service import manager

# class NotificationService:
#     # Generic helper – use this everywhere (recommended)
#     @staticmethod
#     def send_notification(
#         event_type: str,
#         message: str,
#         notification_type: str = "info",
#         data: Dict[str, Any] = None
#     ):
#         payload = {
#             "type": event_type,
#             "message": message,
#             "notification_type": notification_type,
#             "timestamp": datetime.now().isoformat(),
#             "data": data or {}
#         }
#         # Use asyncio to broadcast in background
#         import asyncio
#         asyncio.create_task(manager.broadcast(payload))

#     # Keep your specific methods – they can use the generic one
#     @staticmethod
#     def send_appointment_created(appointment, staff, department):
#         NotificationService.send_notification(
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
#                 "redirect_to": "/appointments"
#             }
#         )

#     @staticmethod
#     def send_invoice_created(invoice_data: Dict[str, Any]):
#         NotificationService.send_notification(
#             event_type="invoice_created",
#             message=f"New invoice: {invoice_data.get('patient_name')} - ₹{invoice_data.get('amount', 0)}",
#             notification_type="success",
#             data={**invoice_data, "redirect_to": "/billing"}
#         )

#     @staticmethod
#     def send_invoice_deleted(invoice_data: Dict[str, Any]):
#         NotificationService.send_notification(
#             event_type="invoice_deleted",
#             message=f"Invoice {invoice_data.get('invoice_id')} deleted",
#             notification_type="warning",
#             data={**invoice_data, "redirect_to": "/billing"}
#         )

#     @staticmethod
#     def send_payment_received(invoice_data: Dict[str, Any]):
#         NotificationService.send_notification(
#             event_type="payment_received",
#             message=f"Payment received: ₹{invoice_data.get('amount', 0)}",
#             notification_type="success",
#             data={**invoice_data}
#         )

#     @staticmethod
#     def send_invoice_status_changed(invoice_data: Dict[str, Any], old_status: str, new_status: str):
#         NotificationService.send_notification(
#             event_type="invoice_status_changed",
#             message=f"Status changed: {old_status} → {new_status}",
#             notification_type="info",
#             data={
#                 **invoice_data,
#                 "old_status": old_status,
#                 "new_status": new_status
#             }
#         )

#     @staticmethod
#     def send_invoice_not_found(invoice_id: str):
#         NotificationService.send_notification(
#             event_type="invoice_not_found",
#             message=f"Invoice not found: {invoice_id}",
#             notification_type="warning",
#             data={"invoice_id": invoice_id}
#         )

#     @staticmethod
#     def send_pdf_downloaded(invoice_id: str = "", bulk: bool = False, count: int = 1):
#         message = f"{count} PDF(s) downloaded" if bulk else f"PDF downloaded: {invoice_id}"
#         event = "pdf_bulk_downloaded" if bulk else "pdf_downloaded"
#         NotificationService.send_notification(
#             event_type=event,
#             message=message,
#             notification_type="info",
#             data={
#                 "invoice_id": invoice_id or None,
#                 "count": count,
#                 "is_bulk": bulk,
#                 "redirect_to": "/billing"
#             }
#         )

#     @staticmethod
#     def send_export_completed(export_type: str, count: int):
#         NotificationService.send_notification(
#             event_type="export_completed",
#             message=f"{export_type} export completed ({count} records)",
#             notification_type="success",
#             data={"export_type": export_type, "count": count}
#         )

#     @staticmethod
#     def send_billing_error(error_message: str, invoice_id: Optional[str] = None):
#         NotificationService.send_notification(
#             event_type="billing_error",
#             message=f"Billing Error: {error_message}",
#             notification_type="error",
#             data={
#                 "error_message": error_message,
#                 "invoice_id": invoice_id,
#                 "redirect_to": "/billing"
#             }
#         )

#     @staticmethod
#     def send_statistics_updated(statistics: Dict[str, Any]):
#         NotificationService.send_notification(
#             event_type="billing_statistics_updated",
#             message="Billing statistics updated",
#             notification_type="info",
#             data=statistics
#         )

#     # Test endpoint helper
#     @staticmethod
#     def send_test_notification():
#         NotificationService.send_notification(
#             event_type="test_notification",
#             message="Test notification from server!",
#             notification_type="info",
#             data={"test": True, "redirect_to": "/dashboard"}
#         )