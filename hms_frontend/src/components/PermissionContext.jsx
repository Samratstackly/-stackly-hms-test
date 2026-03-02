import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/axiosConfig";

const PermissionContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data and permissions from backend
  const fetchUserData = async () => {
    try {
      console.log("🔐 Fetching user data and permissions...");
      
      // Try to get user data from /profile/me
      const response = await api.get("/profile/me");
      
      if (!response.data) {
        throw new Error("No user data received");
      }
      
      const userData = response.data;
      console.log("✅ User data from /profile/me:", userData);
      
      // Store user data
      const user = {
        id: userData.id,
        username: userData.username,
        role: userData.role,
        is_superuser: userData.is_superuser || false, // Ensure boolean
        permissions: userData.permissions || [],
        staff_details: userData.staff_details || {}
      };
      
      setCurrentUser(user);
      
      // Convert permissions array → object { "patients_view": true }
      const permissionsObj = {};
      user.permissions?.forEach((perm) => {
        if (perm.module && perm.enabled !== undefined) {
          permissionsObj[perm.module] = !!perm.enabled; // Ensure boolean
        }
      });
      
      setPermissions(permissionsObj);
      
      console.log("✅ Permissions loaded:", permissionsObj);
      console.log("✅ User role:", user.role);
      console.log("✅ Is superuser:", user.is_superuser);
      
    } catch (error) {
      console.error("❌ Failed to fetch user data:", error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.log("⚠️ User not authenticated (401)");
        // Don't redirect here, let ProtectedRoute handle it
      } else {
        setError("Failed to load user permissions");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    // Only fetch if we're on a protected page (not login page)
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath === '/' || currentPath === '/login';
    
    if (!isAuthPage) {
      fetchUserData();
    } else {
      setLoading(false);
    }
    
    // Listen for login success
    const handleLoginSuccess = () => {
      console.log("🔑 Login success event received");
      setTimeout(() => {
        fetchUserData();
      }, 500);
    };
    
    window.addEventListener("loginSuccess", handleLoginSuccess);
    
    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
    };
  }, []);

  const hasPermission = (module) => {
    if (loading) {
      // While loading, we can't determine permissions
      return false;
    }
    
    // If no user data, return false
    if (!currentUser) {
      return false;
    }
    
    // DEBUG LOG - REMOVE LATER
    // console.log(`🔍 Checking permission for ${module}:`, {
    //   module,
    //   currentUser,
    //   isSuperuser: currentUser.is_superuser,
    //   role: currentUser.role,
    //   permissions: permissions
    // });
    
    // Superuser & Admin get FULL access
    const isSuperuser = currentUser.is_superuser === true;
    const isAdmin = currentUser.role?.toLowerCase() === "admin";
    
    if (isSuperuser || isAdmin) {
      // console.log(`✅ Admin/Superuser access granted to: ${module}`);
      return true;
    }
    
    // Regular user: check specific permission
    const hasPerm = permissions[module] === true;
    console.log(`📊 Regular user permission for ${module}: ${hasPerm}`);
    return hasPerm;
  };

  // Get user role (for UI display)
  const getUserRole = () => {
    if (currentUser?.staff_details?.designation) {
      return currentUser.staff_details.designation;
    }
    return currentUser?.role || "User";
  };

  // Get user name (for UI display)
  const getUserName = () => {
    if (currentUser?.staff_details?.full_name) {
      return currentUser.staff_details.full_name;
    }
    return currentUser?.username || "User";
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Refresh permissions
  const refreshPermissions = () => {
    fetchUserData();
  };

  return (
    <PermissionContext.Provider
      value={{
        currentUser,
        permissions,
        hasPermission,
        loading,
        error,
        refreshPermissions,
        getUserRole,
        getUserName,
        isAuthenticated,
        fetchUserData // Expose for manual refresh
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export { PermissionContext };