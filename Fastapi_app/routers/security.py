# from fastapi import APIRouter, Depends, HTTPException, Form
# from fastapi.security import OAuth2PasswordBearer
# from pydantic import BaseModel
# from typing import List, Optional
# import os
# import django
# import jwt
# from jwt import ExpiredSignatureError, InvalidTokenError
# from Fastapi_app.routers.user_profile import get_current_user

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "HMS_backend.settings")
# django.setup()

# from HMS_backend.models import User, Staff, Permission
# from django.contrib.auth.hashers import make_password

# # ✅ Must match auth.py
# SECRET_KEY = "super_secret_123"
# ALGORITHM = "HS256"

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# # ------------------ Schemas ------------------
# class StaffSchema(BaseModel):
#     full_name: str
#     designation: str
#     staff_id: str
#     department: str
#     email: str

# class PermissionSchema(BaseModel):
#     module: str
#     enabled: bool

# class UserProfileResponse(BaseModel):
#     username: str
#     full_name: str
#     designation: str
#     role: str
#     profile_picture: Optional[str] = None
#     enabled_modules: List[str] = []
#     permissions: List[PermissionSchema] = []
#     staff_id: Optional[str] = None
#     department: Optional[str] = None
#     email: Optional[str] = None

# # ------------------ Helpers ------------------
# def get_permissions_by_role(role: str):
#     perms = Permission.objects.filter(role=role)
#     return [{"module": p.module, "enabled": p.enabled} for p in perms]

# # def get_current_user(token: str = Depends(oauth2_scheme)):
# #     if not token:
# #         raise HTTPException(status_code=401, detail="Token missing")

# #     try:
# #         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
# #         username = payload.get("sub")
        
# #         if not username:
# #             raise HTTPException(status_code=401, detail="Invalid token: username missing")

# #         user = User.objects.get(username=username)
# #         role = payload.get("role", "staff").lower()

# #         # Get enabled permissions for this role
# #         enabled_permissions = Permission.objects.filter(role=role, enabled=True)
# #         enabled_modules = [perm.module for perm in enabled_permissions]

# #         staff_data = None
# #         if hasattr(user, "staff") and user.staff:
# #             s = user.staff
# #             staff_data = StaffSchema(
# #                 full_name=s.full_name,
# #                 designation=s.designation,
# #                 staff_id=s.employee_id,
# #                 department=s.department.name if s.department else "N/A",
# #                 email=s.email,
# #             )

# #         return {
# #             "username": username,
# #             "role": role,
# #             "permissions": get_permissions_by_role(role),
# #             "enabled_modules": enabled_modules,
# #             "staff_details": staff_data,
# #             "profile_picture": user.profile_picture if hasattr(user, 'profile_picture') else None,
# #         }

# #     except ExpiredSignatureError:
# #         raise HTTPException(status_code=401, detail="Token expired")
# #     except InvalidTokenError:
# #         raise HTTPException(status_code=401, detail="Token invalid")
# #     except User.DoesNotExist:
# #         raise HTTPException(status_code=401, detail="User not found")

# # ------------------ Router ------------------
# router = APIRouter(prefix="/security", tags=["Security"])

# # ---------- Get Current User Profile ----------
# @router.get("/profile", response_model=UserProfileResponse)
# def get_user_profile(current_user: dict = Depends(get_current_user)):
#     """Get current user's profile with permissions"""
#     try:
#         user = User.objects.get(username=current_user["username"])
        
#         # Build response
#         response_data = {
#             "username": user.username,
#             "role": current_user["role"],
#             "enabled_modules": current_user["enabled_modules"],
#             "permissions": current_user["permissions"],
#             "profile_picture": current_user.get("profile_picture"),
#         }
        
#         # Add staff details if available
#         if current_user.get("staff_details"):
#             staff = current_user["staff_details"]
#             response_data.update({
#                 "full_name": staff.full_name,
#                 "designation": staff.designation,
#                 "staff_id": staff.staff_id,
#                 "department": staff.department,
#                 "email": staff.email,
#             })
#         else:
#             response_data.update({
#                 "full_name": user.username,
#                 "designation": current_user["role"],
#             })
        
#         return response_data
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

# # ---------- Create User ----------
# @router.post("/create_user")
# def create_user(
#     username: str = Form(...),
#     password: str = Form(...),
#     staff_id: str = Form(...),
#     current_user: dict = Depends(get_current_user),
# ):
#     # ✅ Allow Django superuser or role=admin to bypass permission checks
#     db_user = User.objects.get(username=current_user["username"])
#     if not db_user.is_superuser and current_user["role"] != "admin":
#         if "create_user" not in [
#             p["module"] for p in current_user["permissions"] if p["enabled"]
#         ]:
#             raise HTTPException(
#                 status_code=403, detail="You do not have permission to create users"
#             )

#     if User.objects.filter(username=username).exists():
#         raise HTTPException(status_code=400, detail="Username already exists")

#     try:
#         staff = Staff.objects.get(employee_id=staff_id)
#     except Staff.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Staff ID not found")

#     user = User.objects.create(
#         username=username,
#         password=make_password(password),
#         role=staff.designation.lower(),
#         staff=staff,
#     )

#     Permission.initialize_default_permissions()

#     # Assign default permissions
#     for module, _ in getattr(Permission, "MODULE_CHOICES", []):
#         Permission.objects.get_or_create(role=staff.designation.lower(), module=module)

#     return {
#         "message": "User created successfully",
#         "username": user.username,
#         "role": user.role,
#         "staff_id": staff.employee_id,
#     }

# # ---------- Get Permissions ----------
# @router.get("/permissions/{role}", response_model=List[PermissionSchema])
# def read_permissions(role: str, current_user: dict = Depends(get_current_user)):
#     db_user = User.objects.get(username=current_user["username"])
#     # ✅ Allow superuser or admin role bypass
#     if not db_user.is_superuser and current_user["role"] != "admin":
#         if current_user["role"] != role:
#             raise HTTPException(status_code=403, detail="Not authorized")

#     return get_permissions_by_role(role)

# # ---------- Toggle Permission ----------
# @router.post("/permissions/toggle")
# def toggle_permission(
#     role: str = Form(...),
#     module: str = Form(...),
#     current_user: dict = Depends(get_current_user),
# ):
#     db_user = User.objects.get(username=current_user["username"])
#     # ✅ Allow superuser or admin role bypass
#     if not db_user.is_superuser and current_user["role"] != "admin":
#         raise HTTPException(status_code=403, detail="Only admin can toggle permissions")

#     # Validate module exists in MODULE_CHOICES
#     valid_modules = [choice[0] for choice in Permission.MODULE_CHOICES]
#     if module not in valid_modules:
#         raise HTTPException(
#             status_code=400, 
#             detail=f"Invalid module. Must be one of: {', '.join(valid_modules)}"
#         )

#     try:
#         # Use get_or_create to handle both existing and new permissions
#         perm, created = Permission.objects.get_or_create(
#             role=role,
#             module=module,
#             defaults={"enabled": False}
#         )
        
#         # Toggle the enabled status
#         perm.enabled = not perm.enabled
#         perm.save()
        
#         return {"module": perm.module, "enabled": perm.enabled}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error toggling permission: {str(e)}")


# security.py

from fastapi import APIRouter, Depends, HTTPException, Form
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
import os
import django
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
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

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "HMS_backend.settings")
django.setup()

from HMS_backend.models import User, Staff, Permission
from django.contrib.auth.hashers import make_password

# ✅ Must match auth.py
SECRET_KEY = "super_secret_123"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ------------------ Schemas ------------------
class StaffSchema(BaseModel):
    full_name: str
    designation: str
    staff_id: str
    department: str
    email: str

class PermissionSchema(BaseModel):
    module: str
    enabled: bool

class UserProfileResponse(BaseModel):
    username: str
    full_name: str
    designation: str
    role: str
    profile_picture: Optional[str] = None
    enabled_modules: List[str] = []
    permissions: List[PermissionSchema] = []
    staff_id: Optional[str] = None
    department: Optional[str] = None
    email: Optional[str] = None

# ------------------ Helpers ------------------
def get_permissions_by_role(role: str):
    ensure_db_connection()
    perms = Permission.objects.filter(role=role)
    return [{"module": p.module, "enabled": p.enabled} for p in perms]

def get_user_permissions_dict(user_obj):
    """Convert user object to dictionary with permissions"""
    try:
        role = user_obj.role.lower()

        # Get enabled permissions for this role
        ensure_db_connection()
        enabled_permissions = Permission.objects.filter(role=role, enabled=True)
        enabled_modules = [perm.module for perm in enabled_permissions]
        permissions_list = get_permissions_by_role(role)

        staff_data = None
        if hasattr(user_obj, "staff") and user_obj.staff:
            s = user_obj.staff
            staff_data = StaffSchema(
                full_name=s.full_name,
                designation=s.designation,
                staff_id=s.employee_id,
                department=s.department.name if s.department else "N/A",
                email=s.email,
            )

        return {
            "username": user_obj.username,
            "role": role,
            "permissions": permissions_list,
            "enabled_modules": enabled_modules,
            "staff_details": staff_data,
            "profile_picture": user_obj.profile_picture if hasattr(user_obj, 'profile_picture') else None,
            "is_superuser": user_obj.is_superuser,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing user data: {str(e)}")

# ------------------ Router ------------------
router = APIRouter(prefix="/security", tags=["Security"])

# ---------- Get Current User Profile ----------
@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile with permissions"""
    try:
        # Convert user object to dictionary
        user_dict = get_user_permissions_dict(current_user)

        # Build response
        response_data = {
            "username": current_user.username,
            "role": user_dict["role"],
            "enabled_modules": user_dict["enabled_modules"],
            "permissions": user_dict["permissions"],
            "profile_picture": user_dict.get("profile_picture"),
        }

        # Add staff details if available
        if user_dict.get("staff_details"):
            staff = user_dict["staff_details"]
            response_data.update({
                "full_name": staff.full_name,
                "designation": staff.designation,
                "staff_id": staff.staff_id,
                "department": staff.department,
                "email": staff.email,
            })
        else:
            response_data.update({
                "full_name": current_user.username,
                "designation": user_dict["role"],
            })

        return response_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

# ---------- Create User ----------
@router.post("/create_user")
def create_user(
    username: str = Form(...),
    password: str = Form(...),
    staff_id: str = Form(...),
    current_user: User = Depends(get_current_user),
):
    # ✅ Allow Django superuser or role=admin to bypass permission checks
    user_dict = get_user_permissions_dict(current_user)

    if not current_user.is_superuser and user_dict["role"] != "admin":
        if "create_user" not in [
            p["module"] for p in user_dict["permissions"] if p["enabled"]
        ]:
            raise HTTPException(
                status_code=403, detail="You do not have permission to create users"
            )

    ensure_db_connection()
    if User.objects.filter(username=username).exists():
        raise HTTPException(status_code=400, detail="Username already exists")

    try:
        ensure_db_connection()
        staff = Staff.objects.get(employee_id=staff_id)
    except Staff.DoesNotExist:
        raise HTTPException(status_code=404, detail="Staff ID not found")

    ensure_db_connection()
    user = User.objects.create(
        username=username,
        password=make_password(password),
        role=staff.designation.lower(),
        staff=staff,
    )

    ensure_db_connection()
    Permission.initialize_default_permissions()

    # Assign default permissions
    for module, _ in getattr(Permission, "MODULE_CHOICES", []):
        ensure_db_connection()
        Permission.objects.get_or_create(role=staff.designation.lower(), module=module)

    return {
        "message": "User created successfully",
        "username": user.username,
        "role": user.role,
        "staff_id": staff.employee_id,
    }

# ---------- Get Permissions ----------
@router.get("/permissions/{role}", response_model=List[PermissionSchema])
def read_permissions(role: str, current_user: User = Depends(get_current_user)):
    # ✅ Allow superuser or admin role bypass
    user_dict = get_user_permissions_dict(current_user)

    if not current_user.is_superuser and user_dict["role"] != "admin":
        if user_dict["role"] != role:
            raise HTTPException(status_code=403, detail="Not authorized")

    return get_permissions_by_role(role)

# ---------- Toggle Permission ----------
@router.post("/permissions/toggle")
def toggle_permission(
    role: str = Form(...),
    module: str = Form(...),
    current_user: User = Depends(get_current_user),
):
    # ✅ Allow superuser or admin role bypass
    user_dict = get_user_permissions_dict(current_user)

    if not current_user.is_superuser and user_dict["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can toggle permissions")

    # Validate module exists in MODULE_CHOICES
    valid_modules = [choice[0] for choice in Permission.MODULE_CHOICES]
    if module not in valid_modules:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid module. Must be one of: {', '.join(valid_modules)}"
        )

    try:
        # Use get_or_create to handle both existing and new permissions
        ensure_db_connection()
        perm, created = Permission.objects.get_or_create(
            role=role,
            module=module,
            defaults={"enabled": False}
        )

        # Toggle the enabled status
        perm.enabled = not perm.enabled
        perm.save()

        return {"module": perm.module, "enabled": perm.enabled}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error toggling permission: {str(e)}")