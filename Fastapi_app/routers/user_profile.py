# #Fastapi_app/routers/user_profile.py
# import uuid
# from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, status, Body, Request, Response
# from fastapi.security import OAuth2PasswordBearer
# from pydantic import BaseModel, EmailStr, validator
# from typing import Optional, List
# from datetime import date
# from django.db import IntegrityError
# from HMS_backend.models import Staff, Department, User, Permission
# from asgiref.sync import sync_to_async
# from django.contrib.auth.hashers import make_password
# from jose import JWTError, jwt
# import os
# import json
# from pathlib import Path as PathLib

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

# # ------------------- Router -------------------
# router = APIRouter(prefix="/profile", tags=["User_Profile"])

# # ------------------- JWT Settings -------------------
# SECRET_KEY = "super_secret_123"  # Make sure this matches your auth endpoint
# ALGORITHM = "HS256"

# # ------------------- Profile Pictures Directory -------------------
# # This should match your STAFF_PICTURES_DIR in main.py
# PROFILE_PICTURES_DIR = "Fastapi_app/staffs_pictures"
# # Use the full backend URL
# BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000") # Change this to your actual backend URL
# STATIC_URL_PREFIX = f"{BACKEND_BASE_URL}/static/staffs_pictures/"

# # Ensure directory exists
# os.makedirs(PROFILE_PICTURES_DIR, exist_ok=True)

# # ------------------- Helper Functions -------------------
# def get_profile_picture_url(file_path: Optional[str]) -> Optional[str]:
#     """Convert file path to URL accessible via static files mount"""
#     if not file_path:
#         return None
    
#     # If it's already a full URL, return as is
#     if file_path.startswith("http"):
#         return file_path
    
#     # Extract filename from path
#     filename = os.path.basename(file_path)
    
#     # Return full URL for static file serving
#     return f"{STATIC_URL_PREFIX}{filename}"

# def get_profile_picture_path(filename: str) -> str:
#     """Get full path for saving profile picture"""
#     return os.path.join(PROFILE_PICTURES_DIR, filename)

# # ------------------- Async Database Operations -------------------
# @sync_to_async
# def get_user_by_id(user_id):
#     ensure_db_connection()
#     try:
#         return User.objects.select_related("staff").get(id=user_id)
#     except User.DoesNotExist:
#         return None

# @sync_to_async
# def get_staff_with_department(staff_id):
#     ensure_db_connection()
#     try:
#         return Staff.objects.select_related("department").get(id=staff_id)
#     except Staff.DoesNotExist:
#         return None

# @sync_to_async
# def get_staff_with_user(staff_id):
#     ensure_db_connection()
#     try:
#         return Staff.objects.select_related("user").get(id=staff_id)
#     except Staff.DoesNotExist:
#         return None

# @sync_to_async
# def get_user_permissions_async(role: str):
#     ensure_db_connection()
#     try:
#         permissions = Permission.objects.filter(role=role)
#         return [{"module": p.module, "enabled": p.enabled} for p in permissions]
#     except Exception:
#         return []

# @sync_to_async
# def save_staff(staff):
#     ensure_db_connection()
#     staff.save()

# @sync_to_async
# def save_user(user):
#     ensure_db_connection()
#     user.save()

# @sync_to_async
# def update_staff_fields(staff, **fields):
#     ensure_db_connection()
#     for field, value in fields.items():
#         if value is not None:
#             setattr(staff, field, value)
#     staff.save()
#     return staff

# # ------------------- Cookie-based JWT Dependency (Merged from auth.py) -------------------
# async def get_current_user(request: Request):
#     """
#     Get current user from access token in cookie (merged logic from auth.py).
#     Returns User object.
#     """
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )

#     try:
#         # Get token from cookie
#         token = request.cookies.get("access_token")
#         print(f"🔍 Looking for access_token cookie. Found: {bool(token)}")
        
#         if not token:
#             # Fallback to Authorization header
#             auth_header = request.headers.get("Authorization")
#             if auth_header and auth_header.startswith("Bearer "):
#                 token = auth_header.split(" ")[1]
#                 print("🔍 Using Bearer token from Authorization header")
#             else:
#                 print("❌ No access token found in cookies or headers")
#                 raise credentials_exception
        
#         # Decode token
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
#         if payload.get("type") != "access":
#             print("❌ Token type is not 'access'")
#             raise credentials_exception
        
#         user_id: int = payload.get("user_id")
#         username: str = payload.get("sub")

#         if user_id is None or username is None:
#             print("❌ Invalid token payload")
#             raise credentials_exception

#         print(f"🔍 Decoded token for user: {username}, id: {user_id}")

#         # Use async function to get user
#         user = await get_user_by_id(user_id)
#         if not user or user.username != username:
#             print(f"❌ User mismatch or not found: {username}")
#             raise credentials_exception

#         print(f"✅ Authenticated user: {username}")
#         return user

#     except JWTError as e:
#         print(f"❌ JWT error: {e}")
#         raise credentials_exception
#     except Exception as e:
#         print(f"❌ Error in get_current_user: {str(e)}")
#         raise credentials_exception

# # ------------------- Pydantic Schemas (Updated with Merged Response) -------------------
# class ProfileMe(BaseModel):
#     full_name: Optional[str] = None
#     designation: Optional[str] = None
#     department: Optional[str] = None
#     email: Optional[str] = None
#     phone: Optional[str] = None
#     profile_picture: Optional[str] = None  # This will be the FULL URL
#     employee_id: Optional[str] = None
#     date_of_joining: Optional[date] = None
#     address: Optional[str] = ""
#     city: Optional[str] = ""
#     country: Optional[str] = ""
#     timezone: Optional[str] = None

#     class Config:
#         from_attributes = True

# class UserMeResponse(BaseModel):
#     id: int
#     username: str
#     role: str
#     is_superuser: bool
#     permissions: List[dict]  # [{"module": str, "enabled": bool}]
#     profile: ProfileMe

# class PasswordChange(BaseModel):
#     new_password: str
#     confirm_password: str

#     @validator('new_password')
#     def validate_password_length(cls, v):
#         if len(v) < 6:
#             raise ValueError('Password must be at least 6 characters long')
#         return v

# def delete_old_profile_picture(old_picture_path: str):
#     """Helper function to delete old profile picture if exists"""
#     if old_picture_path and os.path.exists(old_picture_path):
#         try:
#             os.remove(old_picture_path)
#             print(f"✅ Deleted old profile picture: {old_picture_path}")
#         except Exception as e:
#             print(f"⚠️ Could not delete old profile picture {old_picture_path}: {e}")

# def generate_profile_picture_filename(full_name: str, extension: str) -> str:
#     """Generate profile picture filename in format: First4CharsXXXXPIC.ext"""
#     name_to_use = full_name.strip().upper()
    
#     if len(name_to_use) >= 4:
#         first_four = name_to_use[:4]
#     else:
#         first_four = name_to_use.ljust(4, '_')
    
#     unique_id = str(uuid.uuid4().hex)[:4].upper()
    
#     # Ensure extension starts with dot
#     if not extension.startswith('.'):
#         extension = f".{extension}"
    
#     return f"{first_four}{unique_id}PIC{extension}"

# # ==================== CONSOLIDATED /me/ ENDPOINT ====================
# @router.get("/me/", response_model=UserMeResponse)
# async def get_my_profile(current_user: User = Depends(get_current_user)):
#     """
#     Consolidated /me endpoint: Returns full user info, permissions, and enriched profile data.
#     Merges logic from old /auth/me and /api/profile/me/.
#     """
#     try:
#         print(f"📋 Consolidated /me endpoint called for user: {current_user.username}")
        
#         # Fetch permissions
#         permissions = await get_user_permissions_async(current_user.role)
        
#         # Fetch staff details with department
#         staff_with_dept = None
#         if current_user.staff:
#             staff_with_dept = await get_staff_with_department(current_user.staff.id)
        
#         if not staff_with_dept:
#             # Fallback: Create empty profile if no staff
#             profile_data = ProfileMe()
#         else:
#             # Convert file path to FULL URL
#             profile_picture_url = None
#             if staff_with_dept.profile_picture:
#                 profile_picture_url = get_profile_picture_url(staff_with_dept.profile_picture)
#                 print(f"🖼️ Profile picture FULL URL: {profile_picture_url}")
            
#             profile_data = ProfileMe(
#                 full_name=staff_with_dept.full_name,
#                 designation=staff_with_dept.designation,
#                 department=staff_with_dept.department.name if staff_with_dept.department else None,
#                 email=staff_with_dept.email,
#                 phone=staff_with_dept.phone,
#                 profile_picture=profile_picture_url,
#                 employee_id=staff_with_dept.employee_id,
#                 date_of_joining=staff_with_dept.date_of_joining,
#                 address=staff_with_dept.address,
#                 city=staff_with_dept.city,
#                 country=staff_with_dept.country,
#                 timezone=getattr(staff_with_dept, 'timezone', None)
#             )
        
#         response_data = UserMeResponse(
#             id=current_user.id,
#             username=current_user.username,
#             role=current_user.role,
#             is_superuser=current_user.is_superuser,
#             permissions=permissions,
#             profile=profile_data
#         )
        
#         print(f"✅ Consolidated profile data prepared for: {current_user.username}")
#         return response_data
        
#     except Exception as e:
#         print(f"❌ Error in get_my_profile: {str(e)}")  # Debug log
#         raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

# # ==================== UPDATE PROFILE (Unchanged, but now uses get_current_user -> staff) ====================
# @router.put("/update/me/", response_model=ProfileMe)
# async def update_my_profile(
#     request: Request,
#     full_name: Optional[str] = Form(None),
#     email: Optional[str] = Form(None),
#     phone: Optional[str] = Form(None),
#     designation: Optional[str] = Form(None),
#     address: Optional[str] = Form(None),
#     city: Optional[str] = Form(None),
#     country: Optional[str] = Form(None),
#     timezone: Optional[str] = Form(None),
#     profile_picture: Optional[UploadFile] = File(None),
#     current_user: User = Depends(get_current_user)
# ):
#     try:
#         if not current_user.staff:
#             raise HTTPException(status_code=404, detail="Staff profile not found for this user")
        
#         staff = current_user.staff
#         print(f"🔄 Updating profile for staff ID: {staff.id}")  # Debug log
        
#         # Get fresh staff instance for update
#         current_staff = await get_staff_with_department(staff.id)
#         if not current_staff:
#             raise HTTPException(status_code=404, detail="Staff profile not found")

#         # Handle profile picture upload
#         if profile_picture and profile_picture.filename:
#             # Delete old profile picture if exists
#             if current_staff.profile_picture:
#                 # Extract filename to get full path for deletion
#                 old_filename = os.path.basename(current_staff.profile_picture)
#                 old_filepath = get_profile_picture_path(old_filename)
#                 delete_old_profile_picture(old_filepath)
            
#             # Generate new filename
#             name_to_use = full_name.strip() if full_name and full_name.strip() else current_staff.full_name
            
#             # Get file extension
#             original_filename = profile_picture.filename
#             file_extension = PathLib(original_filename).suffix.lower() if original_filename else ".jpg"
            
#             # Generate filename
#             filename = generate_profile_picture_filename(name_to_use, file_extension)
            
#             # Get full path for saving
#             pic_path = get_profile_picture_path(filename)
            
#             # Ensure directory exists
#             os.makedirs(PROFILE_PICTURES_DIR, exist_ok=True)
            
#             # Save the file
#             with open(pic_path, "wb") as f:
#                 content = await profile_picture.read()
#                 f.write(content)
            
#             # Store only the filename in database (not full path)
#             current_staff.profile_picture = filename
#             print(f"✅ Profile picture saved: {filename}")
#             print(f"📁 Full path: {pic_path}")
#             print(f"🌐 Will be accessible at: {STATIC_URL_PREFIX}{filename}")

#         # Update fields using async function
#         updated_staff = await update_staff_fields(
#             current_staff,
#             full_name=full_name,
#             email=email,
#             phone=phone,
#             designation=designation,
#             address=address,
#             city=city,
#             country=country,
#             timezone=timezone
#         )

#         # Get updated staff with department
#         final_staff = await get_staff_with_department(updated_staff.id)

#         # Convert filename to FULL URL for response
#         profile_picture_url = None
#         if final_staff.profile_picture:
#             profile_picture_url = f"{STATIC_URL_PREFIX}{final_staff.profile_picture}"

#         return ProfileMe(
#             full_name=final_staff.full_name,
#             designation=final_staff.designation,
#             department=final_staff.department.name if final_staff.department else None,
#             email=final_staff.email,
#             phone=final_staff.phone,
#             profile_picture=profile_picture_url,
#             employee_id=final_staff.employee_id,
#             date_of_joining=final_staff.date_of_joining,
#             address=final_staff.address,
#             city=final_staff.city,
#             country=final_staff.country,
#             timezone=getattr(final_staff, 'timezone', None)
#         )
#     except IntegrityError:
#         raise HTTPException(status_code=400, detail="Email or phone already exists")
#     except Exception as e:
#         print(f"❌ Error in update_my_profile: {str(e)}")  # Debug log
#         raise HTTPException(status_code=500, detail=str(e))

# # ==================== CHANGE PASSWORD (Unchanged, adapted to get_current_user) ====================
# @router.post("/change-password/me/")
# async def change_my_password(
#     request: Request,
#     password_data: PasswordChange,
#     current_user: User = Depends(get_current_user)
# ):
#     try:
#         print(f"🔑 Changing password for user ID: {current_user.id}")  # Debug log
        
#         if password_data.new_password != password_data.confirm_password:
#             raise HTTPException(status_code=400, detail="Passwords do not match")

#         if not current_user:
#             raise HTTPException(status_code=400, detail="No user account found")

#         # Update password using async function
#         current_user.password = make_password(password_data.new_password)
#         await save_user(current_user)

#         return {"message": "Password updated successfully"}
#     except Exception as e:
#         print(f"❌ Error in change_my_password: {str(e)}")  # Debug log
#         raise HTTPException(status_code=500, detail=str(e))

# # ==================== DEBUG ENDPOINT (Unchanged) ====================
# @router.get("/debug/token")
# async def debug_token(request: Request):
#     """Debug endpoint to check token validity"""
#     try:
#         # Try to get token from cookie first
#         access_token = request.cookies.get("access_token")
#         token_source = "cookie"
        
#         if not access_token:
#             # Fallback to Authorization header
#             auth_header = request.headers.get("Authorization")
#             if auth_header and auth_header.startswith("Bearer "):
#                 access_token = auth_header.split(" ")[1]
#                 token_source = "header"
#             else:
#                 return {
#                     "token_valid": False,
#                     "error": "No token found in cookies or Authorization header"
#                 }
        
#         payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
#         user_id = payload.get("user_id")
        
#         user = await get_user_by_id(user_id)
#         if not user:
#             return {
#                 "token_valid": False,
#                 "error": "User not found"
#             }
            
#         staff_info = None
#         if user.staff:
#             # Get profile picture FULL URL
#             profile_picture_url = None
#             if user.staff.profile_picture:
#                 profile_picture_url = f"{STATIC_URL_PREFIX}{user.staff.profile_picture}"
            
#             staff_info = {
#                 "id": user.staff.id,
#                 "full_name": user.staff.full_name,
#                 "email": user.staff.email,
#                 "profile_picture": profile_picture_url
#             }
            
#         return {
#             "token_valid": True,
#             "token_source": token_source,
#             "user_id": user_id,
#             "username": user.username,
#             "staff": staff_info
#         }
#     except Exception as e:
#         return {
#             "token_valid": False,
#             "error": str(e)
#         }

# # ==================== FALLBACK SYNC ENDPOINTS (Updated to use ProfileMe) ====================
# @router.get("/sync/me/", response_model=ProfileMe)
# async def get_my_profile_sync(current_user: User = Depends(get_current_user)):
#     """
#     Fallback endpoint using sync_to_async wrapper for the entire function
#     """
#     @sync_to_async
#     def get_profile_sync(user_id):
#         ensure_db_connection()
#         try:
#             user = User.objects.select_related("staff__department").get(id=user_id)
#             if not user.staff:
#                 return ProfileMe()
            
#             staff_with_dept = user.staff
            
#             # Convert filename to FULL URL for response
#             profile_picture_url = None
#             if staff_with_dept.profile_picture:
#                 profile_picture_url = f"{STATIC_URL_PREFIX}{staff_with_dept.profile_picture}"
            
#             return ProfileMe(
#                 full_name=staff_with_dept.full_name,
#                 designation=staff_with_dept.designation,
#                 department=staff_with_dept.department.name if staff_with_dept.department else None,
#                 email=staff_with_dept.email,
#                 phone=staff_with_dept.phone,
#                 profile_picture=profile_picture_url,
#                 employee_id=staff_with_dept.employee_id,
#                 date_of_joining=staff_with_dept.date_of_joining,
#                 address=staff_with_dept.address,
#                 city=staff_with_dept.city,
#                 country=staff_with_dept.country,
#                 timezone=getattr(staff_with_dept, 'timezone', None)
#             )
#         except User.DoesNotExist:
#             raise HTTPException(status_code=404, detail="User not found")
#         except Exception as e:
#             raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")
    
#     return await get_profile_sync(current_user.id)

# # ==================== HEALTH CHECK (Unchanged) ====================
# @router.get("/health/")
# async def health_check():
#     """Health check endpoint to verify the service is running"""
#     return {
#         "status": "healthy",
#         "service": "User Profile API",
#         "profile_pictures_directory": os.path.abspath(PROFILE_PICTURES_DIR),
#         "directory_exists": os.path.exists(PROFILE_PICTURES_DIR),
#         "backend_base_url": BACKEND_BASE_URL,
#         "static_url_prefix": STATIC_URL_PREFIX,
#         "note": f"Profile pictures will be served at: {STATIC_URL_PREFIX}[filename]"
#     }



# Fastapi_app/routers/user_profile.py
import uuid
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, status, Body, Request, Response
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import date
from django.db import IntegrityError
from HMS_backend.models import Staff, Department, User, Permission
from asgiref.sync import sync_to_async
from django.contrib.auth.hashers import make_password
from jose import JWTError, jwt
import os
import json
from pathlib import Path as PathLib

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

# ------------------- Router -------------------
router = APIRouter(prefix="/profile", tags=["User_Profile"])

# ------------------- JWT Settings -------------------
SECRET_KEY = "super_secret_123"  # Make sure this matches your auth endpoint
ALGORITHM = "HS256"

# ------------------- Profile Pictures Directory -------------------
# This should match your STAFF_PICTURES_DIR in main.py
PROFILE_PICTURES_DIR = "Fastapi_app/staffs_pictures"
# Use the full backend URL
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000") # Change this to your actual backend URL
STATIC_URL_PREFIX = f"{BACKEND_BASE_URL}/static/staffs_pictures/"

# Ensure directory exists
os.makedirs(PROFILE_PICTURES_DIR, exist_ok=True)

# ------------------- Helper Functions -------------------
def get_profile_picture_url(file_path: Optional[str]) -> Optional[str]:
    """Convert file path to URL accessible via static files mount"""
    if not file_path:
        return None
    
    # If it's already a full URL, return as is
    if file_path.startswith("http"):
        return file_path
    
    # Extract filename from path
    filename = os.path.basename(file_path)
    
    # Return full URL for static file serving
    return f"{STATIC_URL_PREFIX}{filename}"

def get_profile_picture_path(filename: str) -> str:
    """Get full path for saving profile picture"""
    return os.path.join(PROFILE_PICTURES_DIR, filename)

# ------------------- Async Database Operations -------------------
@sync_to_async
def get_user_by_id(user_id):
    ensure_db_connection()
    try:
        return User.objects.select_related("staff").get(id=user_id)
    except User.DoesNotExist:
        return None

@sync_to_async
def get_staff_with_department(staff_id):
    ensure_db_connection()
    try:
        return Staff.objects.select_related("department").get(id=staff_id)
    except Staff.DoesNotExist:
        return None

@sync_to_async
def get_staff_with_user(staff_id):
    ensure_db_connection()
    try:
        return Staff.objects.select_related("user").get(id=staff_id)
    except Staff.DoesNotExist:
        return None

@sync_to_async
def get_user_permissions_async(role: str):
    ensure_db_connection()
    try:
        permissions = Permission.objects.filter(role=role)
        return [{"module": p.module, "enabled": p.enabled} for p in permissions]
    except Exception:
        return []

@sync_to_async
def save_staff(staff):
    ensure_db_connection()
    staff.save()

@sync_to_async
def save_user(user):
    ensure_db_connection()
    user.save()

@sync_to_async
def update_staff_fields(staff, **fields):
    ensure_db_connection()
    for field, value in fields.items():
        if value is not None:
            setattr(staff, field, value)
    staff.save()
    return staff

# ------------------- Cookie-based JWT Dependency (Merged from auth.py) -------------------
async def get_current_user(request: Request):
    """
    Get current user from access token in cookie (merged logic from auth.py).
    Returns User object.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Get token from cookie
        token = request.cookies.get("access_token")
        print(f"🔍 Looking for access_token cookie. Found: {bool(token)}")
        
        if not token:
            # Fallback to Authorization header
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                print("🔍 Using Bearer token from Authorization header")
            else:
                print("❌ No access token found in cookies or headers")
                raise credentials_exception
        
        # Decode token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        if payload.get("type") != "access":
            print("❌ Token type is not 'access'")
            raise credentials_exception
        
        user_id: int = payload.get("user_id")
        username: str = payload.get("sub")

        if user_id is None or username is None:
            print("❌ Invalid token payload")
            raise credentials_exception

        print(f"🔍 Decoded token for user: {username}, id: {user_id}")

        # Use async function to get user
        user = await get_user_by_id(user_id)
        if not user or user.username != username:
            print(f"❌ User mismatch or not found: {username}")
            raise credentials_exception

        print(f"✅ Authenticated user: {username}")
        return user

    except JWTError as e:
        print(f"❌ JWT error: {e}")
        raise credentials_exception
    except Exception as e:
        print(f"❌ Error in get_current_user: {str(e)}")
        raise credentials_exception

# ------------------- Pydantic Schemas (Updated with Merged Response) -------------------
class ProfileMe(BaseModel):
    full_name: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    profile_picture: Optional[str] = None  # This will be the FULL URL
    employee_id: Optional[str] = None
    date_of_joining: Optional[date] = None
    address: Optional[str] = ""
    city: Optional[str] = ""
    country: Optional[str] = ""
    timezone: Optional[str] = None

    class Config:
        from_attributes = True

class UserMeResponse(BaseModel):
    id: int
    username: str
    role: str
    is_superuser: bool
    permissions: List[dict]  # [{"module": str, "enabled": bool}]
    profile: ProfileMe

class PasswordChange(BaseModel):
    new_password: str
    confirm_password: str

    @validator('new_password')
    def validate_password_length(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

def delete_old_profile_picture(old_picture_path: str):
    """Helper function to delete old profile picture if exists"""
    if old_picture_path and os.path.exists(old_picture_path):
        try:
            os.remove(old_picture_path)
            print(f"✅ Deleted old profile picture: {old_picture_path}")
        except Exception as e:
            print(f"⚠️ Could not delete old profile picture {old_picture_path}: {e}")

def generate_profile_picture_filename(full_name: str, extension: str) -> str:
    """Generate profile picture filename in format: First4CharsXXXXPIC.ext"""
    name_to_use = full_name.strip().upper()
    
    if len(name_to_use) >= 4:
        first_four = name_to_use[:4]
    else:
        first_four = name_to_use.ljust(4, '_')
    
    unique_id = str(uuid.uuid4().hex)[:4].upper()
    
    # Ensure extension starts with dot
    if not extension.startswith('.'):
        extension = f".{extension}"
    
    return f"{first_four}{unique_id}PIC{extension}"

# ==================== CONSOLIDATED /me/ ENDPOINT ====================
@router.get("/me/", response_model=UserMeResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Consolidated /me endpoint: Returns full user info, permissions, and enriched profile data.
    Merges logic from old /auth/me and /api/profile/me/.
    """
    try:
        print(f"📋 Consolidated /me endpoint called for user: {current_user.username}")
        
        # Fetch permissions
        permissions = await get_user_permissions_async(current_user.role)
        
        # Fetch staff details with department
        staff_with_dept = None
        if current_user.staff:
            staff_with_dept = await get_staff_with_department(current_user.staff.id)
        
        if not staff_with_dept:
            # Fallback: Create empty profile if no staff
            profile_data = ProfileMe()
        else:
            # Convert file path to FULL URL
            profile_picture_url = None
            if staff_with_dept.profile_picture:
                profile_picture_url = get_profile_picture_url(staff_with_dept.profile_picture)
                print(f"🖼️ Profile picture FULL URL: {profile_picture_url}")
            
            profile_data = ProfileMe(
                full_name=staff_with_dept.full_name,
                designation=staff_with_dept.designation,
                department=staff_with_dept.department.name if staff_with_dept.department else None,
                email=staff_with_dept.email,
                phone=staff_with_dept.phone,
                profile_picture=profile_picture_url,
                employee_id=staff_with_dept.employee_id,
                date_of_joining=staff_with_dept.date_of_joining,
                address=staff_with_dept.address,
                city=staff_with_dept.city,
                country=staff_with_dept.country,
                timezone=getattr(staff_with_dept, 'timezone', None)
            )
        
        response_data = UserMeResponse(
            id=current_user.id,
            username=current_user.username,
            role=current_user.role,
            is_superuser=current_user.is_superuser,
            permissions=permissions,
            profile=profile_data
        )
        
        print(f"✅ Consolidated profile data prepared for: {current_user.username}")
        return response_data
        
    except Exception as e:
        print(f"❌ Error in get_my_profile: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

# ==================== UPDATE PROFILE (UPDATED WITH REMOVE PICTURE SUPPORT) ====================
@router.put("/update/me/", response_model=ProfileMe)
async def update_my_profile(
    request: Request,
    full_name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    designation: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    timezone: Optional[str] = Form(None),
    remove_profile_picture: Optional[str] = Form(None),  # Add this parameter
    profile_picture: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user)
):
    try:
        if not current_user.staff:
            raise HTTPException(status_code=404, detail="Staff profile not found for this user")
        
        staff = current_user.staff
        print(f"🔄 Updating profile for staff ID: {staff.id}")  # Debug log
        
        # Get fresh staff instance for update
        current_staff = await get_staff_with_department(staff.id)
        if not current_staff:
            raise HTTPException(status_code=404, detail="Staff profile not found")

        # Handle profile picture removal
        if remove_profile_picture and remove_profile_picture.lower() == "true":
            print("🗑️ Removing profile picture as requested")
            if current_staff.profile_picture:
                # Extract filename to get full path for deletion
                old_filename = os.path.basename(current_staff.profile_picture)
                old_filepath = get_profile_picture_path(old_filename)
                delete_old_profile_picture(old_filepath)
                # Clear profile picture in database
                current_staff.profile_picture = None
                print("✅ Profile picture removed from database")
        
        # Handle profile picture upload (only if not removing)
        elif profile_picture and profile_picture.filename and remove_profile_picture != "true":
            print("🖼️ Uploading new profile picture")
            # Delete old profile picture if exists
            if current_staff.profile_picture:
                # Extract filename to get full path for deletion
                old_filename = os.path.basename(current_staff.profile_picture)
                old_filepath = get_profile_picture_path(old_filename)
                delete_old_profile_picture(old_filepath)
            
            # Generate new filename
            name_to_use = full_name.strip() if full_name and full_name.strip() else current_staff.full_name
            
            # Get file extension
            original_filename = profile_picture.filename
            file_extension = PathLib(original_filename).suffix.lower() if original_filename else ".jpg"
            
            # Generate filename
            filename = generate_profile_picture_filename(name_to_use, file_extension)
            
            # Get full path for saving
            pic_path = get_profile_picture_path(filename)
            
            # Ensure directory exists
            os.makedirs(PROFILE_PICTURES_DIR, exist_ok=True)
            
            # Save the file
            with open(pic_path, "wb") as f:
                content = await profile_picture.read()
                f.write(content)
            
            # Store only the filename in database (not full path)
            current_staff.profile_picture = filename
            print(f"✅ Profile picture saved: {filename}")
            print(f"📁 Full path: {pic_path}")
            print(f"🌐 Will be accessible at: {STATIC_URL_PREFIX}{filename}")

        # Update other fields using async function
        updated_staff = await update_staff_fields(
            current_staff,
            full_name=full_name,
            email=email,
            phone=phone,
            designation=designation,
            address=address,
            city=city,
            country=country,
            timezone=timezone
        )

        # Get updated staff with department
        final_staff = await get_staff_with_department(updated_staff.id)

        # Convert filename to FULL URL for response (or None if removed)
        profile_picture_url = None
        if final_staff.profile_picture:
            profile_picture_url = f"{STATIC_URL_PREFIX}{final_staff.profile_picture}"
        else:
            print("ℹ️ No profile picture in response (removed or never set)")

        return ProfileMe(
            full_name=final_staff.full_name,
            designation=final_staff.designation,
            department=final_staff.department.name if final_staff.department else None,
            email=final_staff.email,
            phone=final_staff.phone,
            profile_picture=profile_picture_url,
            employee_id=final_staff.employee_id,
            date_of_joining=final_staff.date_of_joining,
            address=final_staff.address,
            city=final_staff.city,
            country=final_staff.country,
            timezone=getattr(final_staff, 'timezone', None)
        )
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Email or phone already exists")
    except Exception as e:
        print(f"❌ Error in update_my_profile: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=str(e))

# ==================== CHANGE PASSWORD (Unchanged, adapted to get_current_user) ====================
@router.post("/change-password/me/")
async def change_my_password(
    request: Request,
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user)
):
    try:
        print(f"🔑 Changing password for user ID: {current_user.id}")  # Debug log
        
        if password_data.new_password != password_data.confirm_password:
            raise HTTPException(status_code=400, detail="Passwords do not match")

        if not current_user:
            raise HTTPException(status_code=400, detail="No user account found")

        # Update password using async function
        current_user.password = make_password(password_data.new_password)
        await save_user(current_user)

        return {"message": "Password updated successfully"}
    except Exception as e:
        print(f"❌ Error in change_my_password: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=str(e))

# ==================== DEBUG ENDPOINT (Unchanged) ====================
@router.get("/debug/token")
async def debug_token(request: Request):
    """Debug endpoint to check token validity"""
    try:
        # Try to get token from cookie first
        access_token = request.cookies.get("access_token")
        token_source = "cookie"
        
        if not access_token:
            # Fallback to Authorization header
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                access_token = auth_header.split(" ")[1]
                token_source = "header"
            else:
                return {
                    "token_valid": False,
                    "error": "No token found in cookies or Authorization header"
                }
        
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        
        user = await get_user_by_id(user_id)
        if not user:
            return {
                "token_valid": False,
                "error": "User not found"
            }
            
        staff_info = None
        if user.staff:
            # Get profile picture FULL URL
            profile_picture_url = None
            if user.staff.profile_picture:
                profile_picture_url = f"{STATIC_URL_PREFIX}{user.staff.profile_picture}"
            
            staff_info = {
                "id": user.staff.id,
                "full_name": user.staff.full_name,
                "email": user.staff.email,
                "profile_picture": profile_picture_url
            }
            
        return {
            "token_valid": True,
            "token_source": token_source,
            "user_id": user_id,
            "username": user.username,
            "staff": staff_info
        }
    except Exception as e:
        return {
            "token_valid": False,
            "error": str(e)
        }

# ==================== FALLBACK SYNC ENDPOINTS (Updated to use ProfileMe) ====================
@router.get("/sync/me/", response_model=ProfileMe)
async def get_my_profile_sync(current_user: User = Depends(get_current_user)):
    """
    Fallback endpoint using sync_to_async wrapper for the entire function
    """
    @sync_to_async
    def get_profile_sync(user_id):
        ensure_db_connection()
        try:
            user = User.objects.select_related("staff__department").get(id=user_id)
            if not user.staff:
                return ProfileMe()
            
            staff_with_dept = user.staff
            
            # Convert filename to FULL URL for response
            profile_picture_url = None
            if staff_with_dept.profile_picture:
                profile_picture_url = f"{STATIC_URL_PREFIX}{staff_with_dept.profile_picture}"
            
            return ProfileMe(
                full_name=staff_with_dept.full_name,
                designation=staff_with_dept.designation,
                department=staff_with_dept.department.name if staff_with_dept.department else None,
                email=staff_with_dept.email,
                phone=staff_with_dept.phone,
                profile_picture=profile_picture_url,
                employee_id=staff_with_dept.employee_id,
                date_of_joining=staff_with_dept.date_of_joining,
                address=staff_with_dept.address,
                city=staff_with_dept.city,
                country=staff_with_dept.country,
                timezone=getattr(staff_with_dept, 'timezone', None)
            )
        except User.DoesNotExist:
            raise HTTPException(status_code=404, detail="User not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")
    
    return await get_profile_sync(current_user.id)

# ==================== HEALTH CHECK (Unchanged) ====================
@router.get("/health/")
async def health_check():
    """Health check endpoint to verify the service is running"""
    return {
        "status": "healthy",
        "service": "User Profile API",
        "profile_pictures_directory": os.path.abspath(PROFILE_PICTURES_DIR),
        "directory_exists": os.path.exists(PROFILE_PICTURES_DIR),
        "backend_base_url": BACKEND_BASE_URL,
        "static_url_prefix": STATIC_URL_PREFIX,
        "note": f"Profile pictures will be served at: {STATIC_URL_PREFIX}[filename]"
    }