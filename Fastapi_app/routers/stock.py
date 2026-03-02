# fastapi_app/routers/stock.py

from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from django.db import transaction, IntegrityError
from django.db.models import Q
from HMS_backend.models import Stock
from django.core.exceptions import ObjectDoesNotExist
from asgiref.sync import sync_to_async
import logging
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

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stock", tags=["Stock Management"])

# -------------------------------------------------
# 🧩 Pydantic Schemas - UPDATED WITH DOSAGE
# -------------------------------------------------

class StockCreate(BaseModel):
    product_name: str
    dosage: Optional[str] = None
    category: str
    batch_number: str
    vendor: str
    quantity: int = Field(..., gt=0)
    vendor_id: str
    item_code: str
    rack_no: Optional[str] = None
    shelf_no: Optional[str] = None
    unit_price: float = Field(..., gt=0)
    status: Optional[str] = "available"


class StockUpdate(BaseModel):
    product_name: Optional[str] = None
    dosage: Optional[str] = None
    category: Optional[str] = None
    batch_number: Optional[str] = None
    vendor: Optional[str] = None
    add_quantity: Optional[int] = Field(0, ge=0)  # ✅ Change this to add_quantity
    vendor_id: Optional[str] = None
    item_code: Optional[str] = None
    rack_no: Optional[str] = None
    shelf_no: Optional[str] = None
    unit_price: Optional[float] = None
    status: Optional[str] = None

class StockOut(BaseModel):
    id: int
    product_name: str
    dosage: Optional[str]  # ✅ Added dosage
    category: str
    batch_number: str
    vendor: str
    quantity: int
    no_of_stocks: int  # This will use the property
    vendor_id: str
    item_code: str
    rack_no: Optional[str]
    shelf_no: Optional[str]
    unit_price: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Stock threshold constants
LOW_STOCK_THRESHOLD = 10
OUT_OF_STOCK_THRESHOLD = 0


# -------------------------------------------------
# 🔄 Async Database Helper Functions
# -------------------------------------------------

@sync_to_async
def get_stock_by_id(stock_id: int):
    """Get stock by ID"""
    ensure_db_connection()
    try:
        return Stock.objects.get(id=stock_id)
    except Stock.DoesNotExist:
        return None

@sync_to_async
def get_stock_by_details(product_name: str, batch_number: str, vendor_id: str):
    """Get stock by product details"""
    ensure_db_connection()
    try:
        return Stock.objects.filter(
            product_name=product_name,
            batch_number=batch_number,
            vendor_id=vendor_id
        ).first()
    except Exception:
        return None

@sync_to_async
def get_stock_by_item_code(item_code: str):
    """Get stock by item code"""
    ensure_db_connection()
    try:
        return Stock.objects.filter(item_code=item_code).first()
    except Exception:
        return None

@sync_to_async
def create_stock(stock_data: dict):
    """Create new stock item"""
    ensure_db_connection()
    try:
        return Stock.objects.create(**stock_data)
    except Exception as e:
        raise e

@sync_to_async
def update_stock_quantity(stock, new_quantity: int):
    """Update stock quantity using the model's add_stock method"""
    ensure_db_connection()
    # Use the model's method which handles status automatically
    stock.add_stock(new_quantity - stock.quantity)
    return stock

@sync_to_async
def save_stock(stock):
    """Save stock instance"""
    ensure_db_connection()
    stock.save()
    return stock

@sync_to_async
def delete_stock_instance(stock):
    """Delete stock instance"""
    ensure_db_connection()
    stock.delete()

@sync_to_async
def get_all_stocks():
    """Get all stocks"""
    ensure_db_connection()
    return list(Stock.objects.all().order_by("id"))

@sync_to_async
def search_stocks(query: str):
    """Search stocks"""
    ensure_db_connection()
    return list(Stock.objects.filter(
        Q(product_name__icontains=query) |
        Q(item_code__icontains=query) |
        Q(rack_no__icontains=query) |
        Q(shelf_no__icontains=query) |
        Q(batch_number__icontains=query) |
        Q(vendor__icontains=query) |
        Q(dosage__icontains=query)  # ✅ Added dosage to search
    ).order_by("id"))

@sync_to_async
def get_low_stocks():
    """Get low stocks"""
    ensure_db_connection()
    return list(Stock.objects.filter(
        quantity__lte=LOW_STOCK_THRESHOLD, 
        quantity__gt=OUT_OF_STOCK_THRESHOLD
    ))

@sync_to_async
def get_out_of_stocks():
    """Get out of stocks"""
    ensure_db_connection()
    return list(Stock.objects.filter(quantity__lte=OUT_OF_STOCK_THRESHOLD))

@sync_to_async
def add_stock_to_instance(stock, quantity_to_add: int):
    """Safely call the model's add_stock method in async context"""
    ensure_db_connection()
    stock.add_stock(quantity_to_add)
    return stock


# -------------------------------------------------
# 🧾 CRUD Routes - UPDATED WITH DOSAGE
# -------------------------------------------------

@router.post("/add", response_model=StockOut, status_code=status.HTTP_201_CREATED)
async def add_stock(payload: StockCreate):
    """
    Add new stock item. 
    If stock already exists for the same batch/vendor, quantity is increased.
    """
    try:
        logger.info(f"Adding stock: {payload.product_name}, quantity: {payload.quantity}")

        # Clean the input data
        product_name = payload.product_name.strip()
        batch_number = payload.batch_number.strip()
        vendor_id = payload.vendor_id.strip()
        item_code = payload.item_code.strip()
        dosage = payload.dosage.strip() if payload.dosage else None  # ✅ Clean dosage

        # Check if item_code already exists (since it's unique)
        existing_by_item_code = await get_stock_by_item_code(item_code)
        if existing_by_item_code:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Stock item with item code '{item_code}' already exists"
            )

        # Check if stock already exists using async function
        existing_stock = await get_stock_by_details(product_name, batch_number, vendor_id)

        if existing_stock:
            # Update existing stock
            logger.info(f"Stock exists, updating quantity: {existing_stock.quantity} -> {existing_stock.quantity + payload.quantity}")
            previous_quantity = existing_stock.quantity
            new_quantity = existing_stock.quantity + payload.quantity

            # Update dosage if provided
            if dosage and dosage != existing_stock.dosage:
                existing_stock.dosage = dosage

            # Update stock using the model's method
            updated_stock = await update_stock_quantity(existing_stock, new_quantity)

            # Import NotificationService here to avoid circular imports
            from ..routers.notifications import NotificationService

            # Send notification
            await NotificationService.send_stock_updated(updated_stock, previous_quantity)
            await check_stock_alerts(updated_stock, previous_quantity)

            return StockOut(
                id=updated_stock.id,
                product_name=updated_stock.product_name,
                dosage=updated_stock.dosage,  # ✅ Added dosage
                category=updated_stock.category,
                batch_number=updated_stock.batch_number,
                vendor=updated_stock.vendor,
                quantity=updated_stock.quantity,
                no_of_stocks=updated_stock.no_of_stocks,
                vendor_id=updated_stock.vendor_id,
                item_code=updated_stock.item_code,
                rack_no=updated_stock.rack_no,
                shelf_no=updated_stock.shelf_no,
                unit_price=float(updated_stock.unit_price),
                status=updated_stock.status,
                created_at=updated_stock.created_at,
                updated_at=updated_stock.updated_at
            )
        else:
            # Create new stock
            logger.info("Creating new stock item")
            stock_data = {
                "product_name": product_name,
                "dosage": dosage,  # ✅ Added dosage
                "category": payload.category.strip(),
                "batch_number": batch_number,
                "vendor": payload.vendor.strip(),
                "quantity": payload.quantity,
                "vendor_id": vendor_id,
                "item_code": item_code,
                "rack_no": payload.rack_no.strip() if payload.rack_no else None,
                "shelf_no": payload.shelf_no.strip() if payload.shelf_no else None,
                "unit_price": payload.unit_price,
                "status": "available" if payload.quantity > 0 else "outofstock"
            }

            new_stock = await create_stock(stock_data)

            # Import NotificationService here to avoid circular imports
            from ..routers.notifications import NotificationService

            # Send notification
            await NotificationService.send_stock_added(new_stock)
            await check_stock_alerts(new_stock)

            return StockOut(
                id=new_stock.id,
                product_name=new_stock.product_name,
                dosage=new_stock.dosage,  # ✅ Added dosage
                category=new_stock.category,
                batch_number=new_stock.batch_number,
                vendor=new_stock.vendor,
                quantity=new_stock.quantity,
                no_of_stocks=new_stock.no_of_stocks,
                vendor_id=new_stock.vendor_id,
                item_code=new_stock.item_code,
                rack_no=new_stock.rack_no,
                shelf_no=new_stock.shelf_no,
                unit_price=float(new_stock.unit_price),
                status=new_stock.status,
                created_at=new_stock.created_at,
                updated_at=new_stock.updated_at
            )

    except IntegrityError as e:
        logger.error(f"Integrity error adding stock: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Error adding stock: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error adding stock: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.put("/edit/{stock_id}", response_model=StockOut)
async def edit_stock(stock_id: int, payload: StockUpdate):
    """
    Update any field of a stock item and optionally add quantity.
    """
    try:
        stock = await get_stock_by_id(stock_id)
        if not stock:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock item not found")

        # Store previous quantity for notification
        previous_quantity = stock.quantity

        # Update fields if provided
        if payload.product_name:
            stock.product_name = payload.product_name.strip()
        if payload.dosage is not None:
            stock.dosage = payload.dosage.strip() if payload.dosage else None
        if payload.category:
            stock.category = payload.category.strip()
        if payload.batch_number:
            stock.batch_number = payload.batch_number.strip()
        if payload.vendor:
            stock.vendor = payload.vendor.strip()
        if payload.vendor_id:
            stock.vendor_id = payload.vendor_id.strip()
        if payload.item_code:
            # Check if new item_code is unique
            if payload.item_code != stock.item_code:
                existing = await get_stock_by_item_code(payload.item_code.strip())
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Item code '{payload.item_code}' already exists"
                    )
            stock.item_code = payload.item_code.strip()
        if payload.rack_no:
            stock.rack_no = payload.rack_no.strip()
        if payload.shelf_no:
            stock.shelf_no = payload.shelf_no.strip()
        if payload.unit_price is not None:
            stock.unit_price = payload.unit_price
        if payload.status:
            stock.status = payload.status.strip()

        # ✅ ADD quantity instead of replacing it
        if payload.add_quantity and payload.add_quantity > 0:
            stock = await add_stock_to_instance(stock, payload.add_quantity)
        # Save using async function
        await save_stock(stock)

        # Import NotificationService here to avoid circular imports
        from ..routers.notifications import NotificationService

        # Send update notification
        await NotificationService.send_stock_updated(stock, previous_quantity)

        # Check for low stock or out of stock conditions
        await check_stock_alerts(stock, previous_quantity)

        return StockOut(
            id=stock.id,
            product_name=stock.product_name,
            dosage=stock.dosage,
            category=stock.category,
            batch_number=stock.batch_number,
            vendor=stock.vendor,
            quantity=stock.quantity,
            no_of_stocks=stock.no_of_stocks,
            vendor_id=stock.vendor_id,
            item_code=stock.item_code,
            rack_no=stock.rack_no,
            shelf_no=stock.shelf_no,
            unit_price=float(stock.unit_price),
            status=stock.status,
            created_at=stock.created_at,
            updated_at=stock.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error editing stock: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating stock: {str(e)}"
        )

@router.get("/list", response_model=List[StockOut])
async def list_stock():
    """
    List all stock items.
    """
    try:
        stocks = await get_all_stocks()
        return [
            StockOut(
                id=stock.id,
                product_name=stock.product_name,
                dosage=stock.dosage,  # ✅ Added dosage
                category=stock.category,
                batch_number=stock.batch_number,
                vendor=stock.vendor,
                quantity=stock.quantity,
                no_of_stocks=stock.no_of_stocks,
                vendor_id=stock.vendor_id,
                item_code=stock.item_code,
                rack_no=stock.rack_no,
                shelf_no=stock.shelf_no,
                unit_price=float(stock.unit_price),
                status=stock.status,
                created_at=stock.created_at,
                updated_at=stock.updated_at
            )
            for stock in stocks
        ]
    except Exception as e:
        logger.error(f"Error listing stocks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving stocks: {str(e)}"
        )


@router.delete("/delete/{stock_id}", status_code=status.HTTP_200_OK)
async def delete_stock(stock_id: int):
    """
    Delete a stock item by ID.
    """
    try:
        stock = await get_stock_by_id(stock_id)
        if not stock:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stock item with ID {stock_id} not found"
            )

        # Store stock data for notification before deletion
        stock_data = {
            'product_name': stock.product_name,
            'dosage': stock.dosage,  # ✅ Added dosage
            'batch_number': stock.batch_number,
            'vendor': stock.vendor,
            'quantity': stock.quantity
        }

        await delete_stock_instance(stock)

        # Import NotificationService here to avoid circular imports
        from ..routers.notifications import NotificationService

        # Send deletion notification
        await NotificationService.send_stock_deleted(stock_data)

        return {
            "message": f"Stock item {stock_id} deleted successfully",
            "deleted_id": stock_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting stock: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting stock: {str(e)}"
        )


# -------------------------------------------------
# 🔍 Search Route - UPDATED WITH DOSAGE
# -------------------------------------------------

@router.get("/search", response_model=List[StockOut])
async def search_stock(
    query: Optional[str] = Query(None, description="Search by product name, item code, rack no, shelf no, or dosage")
):
    """
    Search stock items by name, item_code, rack_no, shelf_no, or dosage.
    Case-insensitive partial match.
    """
    if not query:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please provide a search query")

    try:
        stocks = await search_stocks(query)

        if not stocks:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No matching stock found")

        return [
            StockOut(
                id=stock.id,
                product_name=stock.product_name,
                dosage=stock.dosage,  # ✅ Added dosage
                category=stock.category,
                batch_number=stock.batch_number,
                vendor=stock.vendor,
                quantity=stock.quantity,
                no_of_stocks=stock.no_of_stocks,
                vendor_id=stock.vendor_id,
                item_code=stock.item_code,
                rack_no=stock.rack_no,
                shelf_no=stock.shelf_no,
                unit_price=float(stock.unit_price),
                status=stock.status,
                created_at=stock.created_at,
                updated_at=stock.updated_at
            )
            for stock in stocks
        ]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching stocks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching stocks: {str(e)}"
        )


# -------------------------------------------------
# 🔔 Helper Functions for Stock Alerts
# -------------------------------------------------

async def check_stock_alerts(stock, previous_quantity=None):
    """
    Check and send appropriate stock alerts based on quantity levels.
    """
    try:
        current_quantity = stock.quantity

        # Import NotificationService here to avoid circular imports
        from ..routers.notifications import NotificationService

        # Check for stock out
        if current_quantity <= OUT_OF_STOCK_THRESHOLD:
            await NotificationService.send_stock_out(stock)

        # Check for low stock (only if it wasn't already low before)
        elif current_quantity <= LOW_STOCK_THRESHOLD:
            if previous_quantity is None or previous_quantity > LOW_STOCK_THRESHOLD:
                await NotificationService.send_stock_low(stock)
    except Exception as e:
        logger.error(f"Error checking stock alerts: {str(e)}")


# -------------------------------------------------
# 🔔 Background Task for Periodic Stock Checks
# -------------------------------------------------

@router.post("/check-low-stock", status_code=status.HTTP_200_OK)
async def check_all_low_stock():
    """
    Manual endpoint to check all stocks for low/out of stock conditions.
    Can be called by a cron job or scheduled task.
    """
    try:
        low_stocks = await get_low_stocks()
        out_of_stocks = await get_out_of_stocks()

        notification_count = 0

        # Import NotificationService here to avoid circular imports
        from ..routers.notifications import NotificationService

        # Send low stock notifications
        for stock in low_stocks:
            await NotificationService.send_stock_low(stock)
            notification_count += 1

        # Send out of stock notifications
        for stock in out_of_stocks:
            await NotificationService.send_stock_out(stock)
            notification_count += 1

        return {
            "message": f"Stock check completed. Sent {notification_count} notifications.",
            "low_stock_count": len(low_stocks),
            "out_of_stock_count": len(out_of_stocks)
        }

    except Exception as e:
        logger.error(f"Error checking stock levels: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking stock levels: {str(e)}"
        )