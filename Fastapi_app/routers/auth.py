#Fastapi_app/routers/auth.py
from fastapi import APIRouter, HTTPException, Form, Depends, status, Response, Request
from datetime import datetime, timedelta
from jose import jwt, JWTError
from django.contrib.auth.hashers import check_password, make_password
from django.db import close_old_connections, connection
from HMS_backend.models import User, Permission, Staff
from pydantic import BaseModel
from typing import Optional
from asgiref.sync import sync_to_async
import os
import json
from Fastapi_app.routers.user_profile import get_current_user

# JWT settings
SECRET_KEY = "super_secret_123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Get environment for cookie settings
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

# Frontend URL for CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ----------------- Models -----------------
class RefreshTokenRequest(BaseModel):
    refresh_token: str

# ----------------- Database Health Check -----------------
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

# ----------------- Async Database Operations -----------------
@sync_to_async
def get_user_by_username(username: str):
    ensure_db_connection()  # Ensure connection in this thread
    try:
        return User.objects.get(username=username)
    except User.DoesNotExist:
        return None

@sync_to_async
def get_user_by_id(user_id: int):
    ensure_db_connection()  # Ensure connection in this thread
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None

@sync_to_async
def get_user_permissions_async(role: str):
    ensure_db_connection()  # Ensure connection in this thread
    try:
        permissions = Permission.objects.filter(role=role)
        return [{"module": p.module, "enabled": p.enabled} for p in permissions]
    except Exception:
        return []

@sync_to_async
def get_staff_details_async(user):
    ensure_db_connection()  # Ensure connection in this thread
    try:
        if hasattr(user, 'staff') and user.staff:
            staff = user.staff
            return {
                "full_name": staff.full_name,
                "designation": staff.designation,
                "staff_id": staff.employee_id,
                "department": staff.department.name if staff.department else "N/A",
                "email": staff.email
            }
        return None
    except Exception:
        return None

# ----------------- Token Creation -----------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ----------------- Test Cookie Endpoint -----------------
@router.get("/test-cookies")
async def test_cookies(request: Request, response: Response):
    """Test endpoint to check if cookies work"""
    # Set a test cookie that JavaScript can read
    response.set_cookie(
        key="test_cookie",
        value="working_123",
        httponly=False,  # Make accessible to JavaScript
        secure=False,
        samesite="lax",
        max_age=60,
        path="/",
    )
    
    # Get cookies from request
    cookies = request.cookies
    
    # Add CORS headers
    response.headers["Access-Control-Allow-Origin"] = FRONTEND_URL
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Expose-Headers"] = "Set-Cookie"
    
    print(f"🧪 Test cookie endpoint called. Request cookies: {cookies}")
    
    return {
        "request_cookies": dict(cookies),
        "message": "Test cookie set",
        "timestamp": datetime.utcnow().isoformat()
    }

# ----------------- Login -----------------
@router.post("/login")
async def login(
    request: Request,
    response: Response,
    username: str = Form(...), 
    password: str = Form(...)
):
    ensure_db_connection()
    
    print(f"🔑 Login attempt for user: {username}")
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")

    # Use async function to get user
    user = await get_user_by_username(username)
    if not user:
        print(f"❌ User not found: {username}")
        raise HTTPException(status_code=404, detail="Username not found")

    if not check_password(password, user.password):
        print(f"❌ Invalid password for user: {username}")
        raise HTTPException(status_code=401, detail="Invalid password")

    # Use async functions
    permissions = await get_user_permissions_async(user.role)
    staff_details = await get_staff_details_async(user)

    # Create tokens
    access_token = create_access_token({
        "sub": user.username,
        "role": user.role,
        "user_id": user.id,
        "is_superuser": user.is_superuser,
    })
    
    refresh_token = create_refresh_token({
        "sub": user.username,
        "user_id": user.id,
    })

    print(f"✅ Tokens created for {username}")
    print(f"  Origin header: {request.headers.get('origin')}")
    print(f"  Referer header: {request.headers.get('referer')}")

    # ✅ FIXED: Cookie settings with explicit headers
    # Set access token cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # False for localhost
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    
    # Set refresh token cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # False for localhost
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )

    # ✅ CRITICAL: Add CORS headers
    origin = request.headers.get("origin", FRONTEND_URL)
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Expose-Headers"] = "Set-Cookie"
    response.headers["Vary"] = "Origin"  # Important for CORS with credentials

    print(f"✅ Set cookies for user: {username}")
    print(f"  Access token length: {len(access_token)}")
    print(f"  Refresh token length: {len(refresh_token)}")
    print(f"  Response headers: Access-Control-Allow-Origin={origin}")

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "is_superuser": user.is_superuser,
            "permissions": permissions,
            "staff_details": staff_details,
        },
        "message": "Login successful",
        "cookies_set": True,
        "timestamp": datetime.utcnow().isoformat()
    }

# ----------------- Token Refresh -----------------
@router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    try:
        print("🔄 Attempting token refresh...")
        
        # Get refresh token from cookie
        refresh_token_value = request.cookies.get("refresh_token")
        if not refresh_token_value:
            print("❌ No refresh token in cookies")
            raise HTTPException(status_code=401, detail="Refresh token required")
        
        # Decode refresh token
        payload = jwt.decode(refresh_token_value, SECRET_KEY, algorithms=[ALGORITHM])
        
        if payload.get("type") != "refresh":
            print("❌ Invalid token type for refresh")
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user_id = payload.get("user_id")
        username = payload.get("sub")
        
        if not user_id or not username:
            print("❌ Invalid token payload")
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Use async function to get user
        user = await get_user_by_id(user_id)
        if not user:
            print(f"❌ User not found for refresh: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create new access token
        access_token = create_access_token({
            "sub": user.username,
            "role": user.role,
            "user_id": user.id,
            "is_superuser": user.is_superuser,
        })
        
        print(f"✅ New access token created for: {username}")
        
        # Set new access token cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            path="/",
        )
        
        # Add CORS headers
        origin = request.headers.get("origin", FRONTEND_URL)
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Expose-Headers"] = "Set-Cookie"
        response.headers["Vary"] = "Origin"
        
        return {
            "message": "Token refreshed successfully",
            "user": username
        }
        
    except JWTError as e:
        print(f"❌ JWT error during refresh: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    except Exception as e:
        print(f"❌ Token refresh failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Token refresh failed: {str(e)}")

@router.post("/logout")
async def logout(request: Request, response: Response):
    print("🚪 Logout request received")
    
    # Clear both token cookies
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    
    # Add CORS headers
    origin = request.headers.get("origin", FRONTEND_URL)
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return {
        "message": "Logged out successfully",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/public/health")
async def public_health_check():
    """Public health check that doesn't require authentication"""
    try:
        ensure_db_connection()
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected" if check_db_connection() else "disconnected",
            "message": "Server is running"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

# ----------------- Health Check -----------------
@router.get("/health")
async def health_check(current_user: User = Depends(get_current_user)):
    response_data = {
        "status": "healthy",
        "user": current_user.username,
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected" if check_db_connection() else "disconnected"
    }
    
    # Create response with CORS headers
    response = Response(
        content=json.dumps(response_data),
        media_type="application/json"
    )
    
    response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

# ----------------- Check Cookies -----------------
@router.get("/check-cookies")
async def check_cookies(request: Request, response: Response):
    """Endpoint to check what cookies are being sent"""
    cookies = request.cookies
    
    # Add CORS headers
    origin = request.headers.get("origin", FRONTEND_URL)
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    
    print(f"🍪 Check cookies endpoint. Request cookies: {cookies}")
    
    return {
        "cookies_received": dict(cookies),
        "headers": {
            "origin": request.headers.get("origin"),
            "referer": request.headers.get("referer"),
            "user-agent": request.headers.get("user-agent"),
        },
        "timestamp": datetime.utcnow().isoformat()
    }

# ----------------- Manual Token Set (Fallback) -----------------
@router.post("/manual-token")
async def manual_token_set(
    request: Request,
    response: Response,
    access_token: str = Form(...),
    refresh_token: str = Form(...)
):
    """Manual endpoint to set tokens (fallback if cookies don't work)"""
    
    # Set cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )
    
    # Add CORS headers
    origin = request.headers.get("origin", FRONTEND_URL)
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Expose-Headers"] = "Set-Cookie"
    
    return {
        "message": "Tokens set manually",
        "timestamp": datetime.utcnow().isoformat()
    }

# from fastapi import APIRouter, HTTPException, Form, Depends, status, Response, Request
# from datetime import datetime, timedelta
# from jose import jwt, JWTError
# from django.contrib.auth.hashers import check_password, make_password
# from django.db import close_old_connections, connection
# from HMS_backend.models import User, Permission, Staff
# from pydantic import BaseModel
# from typing import Optional
# from asgiref.sync import sync_to_async
# import os
# import json
# from Fastapi_app.routers.user_profile import get_current_user

# # JWT settings
# SECRET_KEY = "super_secret_123"
# ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = 15
# REFRESH_TOKEN_EXPIRE_DAYS = 7

# # Get environment for cookie settings
# ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
# IS_PRODUCTION = ENVIRONMENT == "production"
# COOKIE_SECURE = IS_PRODUCTION
# COOKIE_SAMESITE = "none" if IS_PRODUCTION else "lax"

# # Frontend URL for CORS
# FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# router = APIRouter(prefix="/auth", tags=["Authentication"])

# # ----------------- Models -----------------
# class RefreshTokenRequest(BaseModel):
#     refresh_token: str

# # ----------------- Database Health Check -----------------
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

# # ----------------- Async Database Operations -----------------
# @sync_to_async
# def get_user_by_username(username: str):
#     try:
#         return User.objects.get(username=username)
#     except User.DoesNotExist:
#         return None

# @sync_to_async
# def get_user_by_id(user_id: int):
#     try:
#         return User.objects.get(id=user_id)
#     except User.DoesNotExist:
#         return None

# @sync_to_async
# def get_user_permissions_async(role: str):
#     try:
#         permissions = Permission.objects.filter(role=role)
#         return [{"module": p.module, "enabled": p.enabled} for p in permissions]
#     except Exception:
#         return []

# @sync_to_async
# def get_staff_details_async(user):
#     try:
#         if hasattr(user, 'staff') and user.staff:
#             staff = user.staff
#             return {
#                 "full_name": staff.full_name,
#                 "designation": staff.designation,
#                 "staff_id": staff.employee_id,
#                 "department": staff.department.name if staff.department else "N/A",
#                 "email": staff.email
#             }
#         return None
#     except Exception:
#         return None

# # ----------------- Token Creation -----------------
# def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
#     to_encode = data.copy()
#     if expires_delta:
#         expire = datetime.utcnow() + expires_delta
#     else:
#         expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
#     to_encode.update({
#         "exp": expire,
#         "iat": datetime.utcnow(),
#         "type": "access"
#     })
    
#     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# def create_refresh_token(data: dict):
#     to_encode = data.copy()
#     expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
#     to_encode.update({
#         "exp": expire,
#         "iat": datetime.utcnow(),
#         "type": "refresh"
#     })
    
#     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# # ----------------- Test Cookie Endpoint -----------------
# @router.get("/test-cookies")
# async def test_cookies(request: Request, response: Response):
#     """Test endpoint to check if cookies work"""
#     # Set a test cookie that JavaScript can read
#     response.set_cookie(
#         key="test_cookie",
#         value="working_123",
#         httponly=False,  # Make accessible to JavaScript
#         secure=COOKIE_SECURE,
#         samesite=COOKIE_SAMESITE,
#         max_age=60,
#         path="/",
#     )
    
#     # Get cookies from request
#     cookies = request.cookies
    
#     # Add CORS headers
#     response.headers["Access-Control-Allow-Origin"] = FRONTEND_URL
#     response.headers["Access-Control-Allow-Credentials"] = "true"
#     response.headers["Access-Control-Expose-Headers"] = "Set-Cookie"
    
#     print(f"🧪 Test cookie endpoint called. Request cookies: {cookies}")
    
#     return {
#         "request_cookies": dict(cookies),
#         "message": "Test cookie set",
#         "timestamp": datetime.utcnow().isoformat()
#     }

# # ----------------- Login -----------------
# @router.post("/login")
# async def login(
#     request: Request,
#     response: Response,
#     username: str = Form(...), 
#     password: str = Form(...)
# ):
#     ensure_db_connection()
    
#     print(f"🔑 Login attempt for user: {username}")
    
#     if not username or not password:
#         raise HTTPException(status_code=400, detail="Username and password required")

#     # Use async function to get user
#     user = await get_user_by_username(username)
#     if not user:
#         print(f"❌ User not found: {username}")
#         raise HTTPException(status_code=404, detail="Username not found")

#     if not check_password(password, user.password):
#         print(f"❌ Invalid password for user: {username}")
#         raise HTTPException(status_code=401, detail="Invalid password")

#     # Use async functions
#     permissions = await get_user_permissions_async(user.role)
#     staff_details = await get_staff_details_async(user)

#     # Create tokens
#     access_token = create_access_token({
#         "sub": user.username,
#         "role": user.role,
#         "user_id": user.id,
#         "is_superuser": user.is_superuser,
#     })
    
#     refresh_token = create_refresh_token({
#         "sub": user.username,
#         "user_id": user.id,
#     })

#     print(f"✅ Tokens created for {username}")
#     print(f"  Origin header: {request.headers.get('origin')}")
#     print(f"  Referer header: {request.headers.get('referer')}")

#     # ✅ FIXED: Cookie settings with explicit headers
#     # Set access token cookie
#     response.set_cookie(
#         key="access_token",
#         value=access_token,
#         httponly=True,
#         secure=COOKIE_SECURE,
#         samesite=COOKIE_SAMESITE,
#         max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
#         path="/",
#     )
    
#     # Set refresh token cookie
#     response.set_cookie(
#         key="refresh_token",
#         value=refresh_token,
#         httponly=True,
#         secure=COOKIE_SECURE,
#         samesite=COOKIE_SAMESITE,
#         max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
#         path="/",
#     )

#     # ✅ CRITICAL: Add CORS headers
#     origin = request.headers.get("origin", FRONTEND_URL)
#     response.headers["Access-Control-Allow-Origin"] = origin
#     response.headers["Access-Control-Allow-Credentials"] = "true"
#     response.headers["Access-Control-Expose-Headers"] = "Set-Cookie"
#     response.headers["Vary"] = "Origin"  # Important for CORS with credentials

#     print(f"✅ Set cookies for user: {username}")
#     print(f"  Access token length: {len(access_token)}")
#     print(f"  Refresh token length: {len(refresh_token)}")
#     print(f"  Response headers: Access-Control-Allow-Origin={origin}")

#     return {
#         "user": {
#             "id": user.id,
#             "username": user.username,
#             "role": user.role,
#             "is_superuser": user.is_superuser,
#             "permissions": permissions,
#             "staff_details": staff_details,
#         },
#         "message": "Login successful",
#         "cookies_set": True,
#         "timestamp": datetime.utcnow().isoformat()
#     }

# # ----------------- Token Refresh -----------------
# @router.post("/refresh")
# async def refresh_token(request: Request, response: Response):
#     try:
#         print("🔄 Attempting token refresh...")
        
#         # Get refresh token from cookie
#         refresh_token_value = request.cookies.get("refresh_token")
#         if not refresh_token_value:
#             print("❌ No refresh token in cookies")
#             raise HTTPException(status_code=401, detail="Refresh token required")
        
#         # Decode refresh token
#         payload = jwt.decode(refresh_token_value, SECRET_KEY, algorithms=[ALGORITHM])
        
#         if payload.get("type") != "refresh":
#             print("❌ Invalid token type for refresh")
#             raise HTTPException(status_code=401, detail="Invalid token type")
        
#         user_id = payload.get("user_id")
#         username = payload.get("sub")
        
#         if not user_id or not username:
#             print("❌ Invalid token payload")
#             raise HTTPException(status_code=401, detail="Invalid token payload")
        
#         # Use async function to get user
#         user = await get_user_by_id(user_id)
#         if not user:
#             print(f"❌ User not found for refresh: {user_id}")
#             raise HTTPException(status_code=404, detail="User not found")
        
#         # Create new access token
#         access_token = create_access_token({
#             "sub": user.username,
#             "role": user.role,
#             "user_id": user.id,
#             "is_superuser": user.is_superuser,
#         })
        
#         print(f"✅ New access token created for: {username}")
        
#         # Set new access token cookie
#         response.set_cookie(
#             key="access_token",
#             value=access_token,
#             httponly=True,
#             secure=COOKIE_SECURE,
#             samesite=COOKIE_SAMESITE,
#             max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
#             path="/",
#         )
        
#         # Add CORS headers
#         origin = request.headers.get("origin", FRONTEND_URL)
#         response.headers["Access-Control-Allow-Origin"] = origin
#         response.headers["Access-Control-Allow-Credentials"] = "true"
#         response.headers["Access-Control-Expose-Headers"] = "Set-Cookie"
#         response.headers["Vary"] = "Origin"
        
#         return {
#             "message": "Token refreshed successfully",
#             "user": username
#         }
        
#     except JWTError as e:
#         print(f"❌ JWT error during refresh: {e}")
#         raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
#     except Exception as e:
#         print(f"❌ Token refresh failed: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Token refresh failed: {str(e)}")

# @router.post("/logout")
# async def logout(request: Request, response: Response):
#     print("🚪 Logout request received")
    
#     # Clear both token cookies
#     response.delete_cookie(key="access_token", path="/")
#     response.delete_cookie(key="refresh_token", path="/")
    
#     # Add CORS headers
#     origin = request.headers.get("origin", FRONTEND_URL)
#     response.headers["Access-Control-Allow-Origin"] = origin
#     response.headers["Access-Control-Allow-Credentials"] = "true"
    
#     return {
#         "message": "Logged out successfully",
#         "timestamp": datetime.utcnow().isoformat()
#     }

# @router.get("/public/health")
# async def public_health_check():
#     """Public health check that doesn't require authentication"""
#     try:
#         ensure_db_connection()
#         return {
#             "status": "healthy",
#             "timestamp": datetime.utcnow().isoformat(),
#             "database": "connected" if check_db_connection() else "disconnected",
#             "message": "Server is running"
#         }
#     except Exception as e:
#         return {
#             "status": "error",
#             "error": str(e)
#         }

# # ----------------- Health Check -----------------
# @router.get("/health")
# async def health_check(current_user: User = Depends(get_current_user)):
#     response_data = {
#         "status": "healthy",
#         "user": current_user.username,
#         "timestamp": datetime.utcnow().isoformat(),
#         "database": "connected" if check_db_connection() else "disconnected"
#     }
    
#     # Create response with CORS headers
#     response = Response(
#         content=json.dumps(response_data),
#         media_type="application/json"
#     )
    
#     response.headers["Access-Control-Allow-Credentials"] = "true"
    
#     return response

# # ----------------- Check Cookies -----------------
# @router.get("/check-cookies")
# async def check_cookies(request: Request, response: Response):
#     """Endpoint to check what cookies are being sent"""
#     cookies = request.cookies
    
#     # Add CORS headers
#     origin = request.headers.get("origin", FRONTEND_URL)
#     response.headers["Access-Control-Allow-Origin"] = origin
#     response.headers["Access-Control-Allow-Credentials"] = "true"
    
#     print(f"🍪 Check cookies endpoint. Request cookies: {cookies}")
    
#     return {
#         "cookies_received": dict(cookies),
#         "headers": {
#             "origin": request.headers.get("origin"),
#             "referer": request.headers.get("referer"),
#             "user-agent": request.headers.get("user-agent"),
#         },
#         "timestamp": datetime.utcnow().isoformat()
#     }

# # ----------------- Manual Token Set (Fallback) -----------------
# @router.post("/manual-token")
# async def manual_token_set(
#     request: Request,
#     response: Response,
#     access_token: str = Form(...),
#     refresh_token: str = Form(...)
# ):
#     """Manual endpoint to set tokens (fallback if cookies don't work)"""
    
#     # Set cookies
#     response.set_cookie(
#         key="access_token",
#         value=access_token,
#         httponly=True,
#         secure=COOKIE_SECURE,
#         samesite=COOKIE_SAMESITE,
#         max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
#         path="/",
#     )
    
#     response.set_cookie(
#         key="refresh_token",
#         value=refresh_token,
#         httponly=True,
#         secure=COOKIE_SECURE,
#         samesite=COOKIE_SAMESITE,
#         max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
#         path="/",
#     )
    
#     # Add CORS headers
#     origin = request.headers.get("origin", FRONTEND_URL)
#     response.headers["Access-Control-Allow-Origin"] = origin
#     response.headers["Access-Control-Allow-Credentials"] = "true"
#     response.headers["Access-Control-Expose-Headers"] = "Set-Cookie"
    
#     return {
#         "message": "Tokens set manually",
#         "timestamp": datetime.utcnow().isoformat()
#     }