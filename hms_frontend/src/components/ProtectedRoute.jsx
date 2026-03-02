import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { PermissionContext } from './PermissionContext';
import api from '../utils/axiosConfig';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const { currentUser, loading } = useContext(PermissionContext);

  useEffect(() => {
    const checkAuth = async () => {
      // If PermissionContext already has user data, we're authenticated
      if (currentUser && !loading) {
        console.log("🔍 ProtectedRoute - Using PermissionContext user data");
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      try {
        setIsChecking(true);
        
        // Fallback: Check via API
        console.log("🔍 ProtectedRoute - Checking authentication via API...");
        const response = await api.get("/profile/me");
        
        console.log("🔍 ProtectedRoute - API response:", response.status);
        setIsAuthenticated(true);
        
      } catch (error) {
        console.log("🔍 ProtectedRoute - Not authenticated");
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [currentUser, loading]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0EFF7B20] border-t-[#0EFF7B] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    console.log("🔍 ProtectedRoute - Not authenticated, redirecting to login");
    return <Navigate to="/" replace />;
  }

  // Render children if authenticated
  console.log("🔍 ProtectedRoute - Authenticated, rendering children");
  return children;
};

export default ProtectedRoute;