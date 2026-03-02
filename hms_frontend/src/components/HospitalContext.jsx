// hms_frontend/src/components/HospitalContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import api from "../utils/axiosConfig";
import { useUser } from "../contexts/UserContext";

const HospitalContext = createContext();
export const useHospital = () => useContext(HospitalContext);

/**
 * Normalize logo URL
 * - If it's already absolute, return as-is
 * - If relative, prepend API base
 */
function normalizeLogo(logo) {
  if (!logo) return null;
  if (logo.startsWith("http://") || logo.startsWith("https://")) return logo;
  // Remove leading slash if any
  const cleanPath = logo.startsWith("/") ? logo.slice(1) : logo;
  return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/${cleanPath}`;
}

export const HospitalProvider = ({ children }) => {
  const { isAuthenticated } = useUser();

  const [hospitalInfo, setHospitalInfo] = useState({
    id: null,
    logo: null,
    hospital_name: "Sravan Multispeciality Hospital",
    address: "",
    phone: "",
    email: "",
    gstin: "",
    emergency_contact: "",
    website: "",
    tagline: "",
    established_year: null,
    registration_number: "",
    working_hours: {},
    updated_at: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch hospital info from backend
   */
  const fetchHospitalInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/settings/all");
      const hospitalData = response.data?.hospital;

      if (!hospitalData) throw new Error("Invalid hospital response");

      // Always store absolute logo URL
      setHospitalInfo({
        id: hospitalData.id ?? null,
        logo: normalizeLogo(hospitalData.logo),
        hospital_name: hospitalData.hospital_name || "Sravan Multispeciality Hospital",
        address: hospitalData.address || "",
        phone: hospitalData.phone || "",
        email: hospitalData.email || "",
        gstin: hospitalData.gstin || "",
        emergency_contact: hospitalData.emergency_contact || "",
        website: hospitalData.website || "",
        tagline: hospitalData.tagline || "",
        established_year: hospitalData.established_year ?? null,
        registration_number: hospitalData.registration_number || "",
        working_hours: hospitalData.working_hours || {},
        updated_at: hospitalData.updated_at ?? null,
      });

      // Persist logo in localStorage for fast reload
      if (hospitalData.logo) localStorage.setItem("hospitalLogo", normalizeLogo(hospitalData.logo));

    } catch (err) {
      console.error("Error fetching hospital info:", err);
      if (err.response?.status !== 401) setError("Failed to load hospital information");
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount or login, fetch hospital info
  useEffect(() => {
    if (isAuthenticated) {
      fetchHospitalInfo();
    } else {
      setHospitalInfo(prev => ({ ...prev, id: null, logo: null }));
    }
  }, [isAuthenticated, fetchHospitalInfo]);

  // Immediately load logo from localStorage to prevent flash of default
  useEffect(() => {
    const storedLogo = localStorage.getItem("hospitalLogo");
    if (storedLogo) {
      setHospitalInfo(prev => ({ ...prev, logo: storedLogo }));
    }
  }, []);

  /**
   * Update logo after successful upload
   * Accepts absolute URL from backend
   */
  const updateLogo = useCallback((logoUrl) => {
    const fullUrl = normalizeLogo(logoUrl);
    setHospitalInfo(prev => ({ ...prev, logo: fullUrl }));
    localStorage.setItem("hospitalLogo", fullUrl);
  }, []);

  /**
   * Update any hospital info
   */
  const updateHospitalInfo = useCallback((newInfo) => {
    setHospitalInfo(prev => ({
      ...prev,
      ...newInfo,
      logo: newInfo.logo ? normalizeLogo(newInfo.logo) : prev.logo
    }));

    if (newInfo.logo) localStorage.setItem("hospitalLogo", normalizeLogo(newInfo.logo));
  }, []);

  return (
    <HospitalContext.Provider
      value={{
        hospitalInfo,
        loading,
        error,
        refreshHospitalInfo: fetchHospitalInfo,
        updateLogo,
        updateHospitalInfo,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};