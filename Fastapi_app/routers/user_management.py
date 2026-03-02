from fastapi import APIRouter, Query, HTTPException, Form, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from HMS_backend.models import Staff, Department, User, Permission
from django.contrib.auth.hashers import make_password
from Fastapi_app.routers.user_profile import get_current_user   
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
 
router = APIRouter(prefix="/users", tags=["User Management"])
 
 
# --- Response schema ---
class UserOut(BaseModel):
    name: str
    id: str
    username: str
    email: str
    role: str
    department: str
    joinedOn: str
 
    class Config:
        from_attributes = True
 
 
# --- Endpoint to fetch users based on dropdown filters and search ---
@router.get("/", response_model=List[UserOut])
def get_users(
    name: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    ensure_db_connection()
    # Get all users with their related staff information
    users = User.objects.select_related('staff').all()
 
    result = []
    for user in users:
        staff = user.staff
        if not staff:
            continue
        # Apply filters
        if name and staff.full_name != name:
            continue
        if role and user.role != role:
            continue
        if department and (not staff.department or staff.department.name != department):
            continue
        # Apply search
        if search:
            search_lower = search.lower()
            # Convert date to string for search
            date_str = staff.date_of_joining.strftime("%m/%d/%Y") if staff.date_of_joining else ""
            # Check all searchable fields
            search_fields = [
                staff.full_name.lower(),
                user.username.lower(),
                user.role.lower(),
                staff.department.name.lower() if staff.department else "",
                staff.employee_id.lower(),
                staff.email.lower() if staff.email else "",
                date_str.lower()
            ]
            # Check if search term is in any field
            if not any(search_lower in field for field in search_fields if field):
                continue
 
        result.append(
            UserOut(
                name=staff.full_name,
                id=staff.employee_id,
                username=user.username,
                email=staff.email or "",
                role=user.role or "",
                department=staff.department.name if staff.department else "",
                joinedOn=staff.date_of_joining.strftime("%m/%d/%Y") if staff.date_of_joining else ""
            )
        )
    return result
 
# --- Create User API ---
@router.post("/create_user")
def create_user(
    username: str = Form(...),
    password: str = Form(...),
    staff_id: str = Form(...),
    role: str = Form(...),
    current_user: User = Depends(get_current_user),
):
    ensure_db_connection()
    """Create a new User linked to Staff and assign role manually"""
 
    # ✅ Only allow superuser or admin to create new users
    if not current_user.is_superuser and getattr(current_user, 'role', '').lower() != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to create users")
 
    # ✅ Check if username already exists
    if User.objects.filter(username=username).exists():
        raise HTTPException(status_code=400, detail="Username already exists")
 
    # ✅ Validate staff ID and check if staff already has a user
    try:
        staff = Staff.objects.get(employee_id=staff_id)
        if hasattr(staff, 'user'):
            raise HTTPException(status_code=400, detail="Staff member already has a user account")
    except Staff.DoesNotExist:
        raise HTTPException(status_code=404, detail="Staff ID not found")
 
    # ✅ Create user with provided role
    user = User.objects.create(
        username=username,
        password=make_password(password),
        role=role,
        staff=staff,
        is_active=True
    )
 
    return {
        "message": "User created successfully",
        "username": user.username,
        "role": user.role,
        "staff_id": staff.employee_id,
    }
 
 
# --- DELETE User API ---
@router.delete("/{staff_id}")
def delete_user(
    staff_id: str,
    current_user: User = Depends(get_current_user),
):
    ensure_db_connection()
    """Delete a user linked to a staff ID"""
    # Only allow superuser or admin to delete users
    if not current_user.is_superuser and getattr(current_user, 'role', '').lower() != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to delete users")
    try:
        # Find and delete the User linked to the staff
        user = User.objects.get(staff__employee_id=staff_id)
        user.delete()
        return {"message": "User deleted successfully"}
    except User.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found for this staff ID")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
# Updated backend endpoint in users.py
 
# --- Update User API ---
@router.put("/{staff_id}")
def update_user(
    staff_id: str,
    username: Optional[str] = Form(None),
    role: Optional[str] = Form(None),
    new_password: Optional[str] = Form(None),
    confirm_password: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
):
    ensure_db_connection()
    """Update user information including password"""
    if not current_user.is_superuser and getattr(current_user, 'role', '').lower() != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to update users")
    try:
        user = User.objects.get(staff__employee_id=staff_id)
        # Update username if provided and changed
        if username and username != user.username:
            if User.objects.filter(username=username).exclude(pk=user.pk).exists():
                raise HTTPException(status_code=400, detail="Username already exists")
            user.username = username
        # Update role if provided
        if role:
            user.role = role
        # Update password if provided
        if new_password:
            if not confirm_password:
                raise HTTPException(status_code=400, detail="Confirm password is required when changing password")
            if new_password != confirm_password:
                raise HTTPException(status_code=400, detail="Passwords do not match")
            if len(new_password) < 6:
                raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
            user.password = make_password(new_password)
        user.save()
        return {
            "message": "User updated successfully",
            "username": user.username,
            "role": user.role,
            "staff_id": staff_id,
        }
    except User.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found for this staff ID")