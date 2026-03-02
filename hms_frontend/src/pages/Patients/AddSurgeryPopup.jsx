import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, ChevronDown, AlertCircle, Clock } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { successToast, errorToast, warningToast } from "../../components/Toast.jsx";
import api from "../../utils/axiosConfig";

export default function AddSurgeryPopup({ onClose, onSuccess }) {
  // State
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    surgery_type: "",
    description: "",
    scheduled_date: "",
    scheduled_time: "",
    status: "pending", // Default status
  });
  
  const SURGERY_STATUSES = [
    { value: "pending", label: "Pending" },
    { value: "emergency", label: "Emergency" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [apiErrors, setApiErrors] = useState({});
  const [showDuplicateError, setShowDuplicateError] = useState(false);
  
  // Use ref to prevent multiple toast calls
  const toastShownRef = useRef(false);
  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);

  // Format validation functions
  const validateSurgeryType = (value) => {
    if (!value.trim()) return "";
    
    if (!/^[A-Za-z0-9\s\-.,()]+$/.test(value)) 
      return "Surgery type can only contain letters, numbers, spaces, hyphens, commas, periods, and parentheses";
    
    if (value.trim().length < 2) 
      return "Surgery type must be at least 2 characters";
    
    return "";
  };

  const validateDateTime = () => {
    if (!formData.scheduled_date) return "Surgery date is required";
    if (!formData.scheduled_time) return "Surgery time is required";
    
    const selectedDate = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
    const now = new Date();
    
    if (selectedDate < now) return "Surgery date and time cannot be in the past";
    
    return "";
  };

  // Required field validation
  const validateRequiredFields = () => {
    const errors = {};
    let isValid = true;

    if (!formData.patient_id) {
      errors.patient_id = "Patient is required";
      isValid = false;
    }
    
    if (!formData.doctor_id) {
      errors.doctor_id = "Doctor is required";
      isValid = false;
    }
    
    if (!formData.surgery_type.trim()) {
      errors.surgery_type = "Surgery type is required";
      isValid = false;
    }
    
    if (!formData.scheduled_date) {
      errors.scheduled_date = "Surgery date is required";
      isValid = false;
    }
    
    if (!formData.scheduled_time) {
      errors.scheduled_time = "Surgery time is required";
      isValid = false;
    }
    
    setFieldErrors(errors);
    return isValid;
  };

  // Handle input change - FIXED for date/time fields
  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    // Capitalize first letter of each word for surgery type
    if (field === "surgery_type") {
      processedValue = value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    // Update form data
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear errors when user starts typing
    if (field === "surgery_type") {
      setShowDuplicateError(false);
      setApiErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.surgery_type;
        return newErrors;
      });
    }
    
    // Clear field-specific errors
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear API errors for this field
    if (apiErrors[field]) {
      setApiErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Handle date/time fields specially
    if (field === "scheduled_date" || field === "scheduled_time") {
      // Clear any existing date/time validation errors
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.scheduled_date_time;
        return newErrors;
      });
      
      // Clear field-specific errors for date/time
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.scheduled_date;
        delete newErrors.scheduled_time;
        return newErrors;
      });
      
      // Get the updated form data with the new value
      const updatedForm = {
        ...formData,
        [field]: processedValue
      };
      
      // Check if both date and time are now present
      if (updatedForm.scheduled_date && updatedForm.scheduled_time) {
        // Validate the complete date-time
        const selectedDate = new Date(`${updatedForm.scheduled_date}T${updatedForm.scheduled_time}`);
        const now = new Date();
        
        if (selectedDate < now) {
          setValidationErrors(prev => ({
            ...prev,
            scheduled_date_time: "Surgery date and time cannot be in the past"
          }));
        }
      } else {
        // If one is missing, set the appropriate field error
        if (!updatedForm.scheduled_date) {
          setFieldErrors(prev => ({
            ...prev,
            scheduled_date: "Surgery date is required"
          }));
        }
        if (!updatedForm.scheduled_time) {
          setFieldErrors(prev => ({
            ...prev,
            scheduled_time: "Surgery time is required"
          }));
        }
      }
      
      return; // Early return for date/time fields
    }
    
    // Perform real-time format validation for other fields
    let formatError = "";
    
    switch (field) {
      case "surgery_type":
        formatError = validateSurgeryType(processedValue);
        break;
      default:
        break;
    }
    
    if (formatError) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: formatError
      }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Load patients and doctors
  useEffect(() => {
    const fetchData = async () => {
      setLoadingPatients(true);
      setLoadingDoctors(true);
      
      try {
        // Fetch patients
        const patientsResponse = await api.get("/surgeries/patients");
        setPatients(patientsResponse.data || []);
        
        // Fetch doctors
        const doctorsResponse = await api.get("/surgeries/doctors");
        setDoctors(doctorsResponse.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        errorToast("Failed to load data. Please refresh the page.");
      } finally {
        setLoadingPatients(false);
        setLoadingDoctors(false);
      }
    };
    
    fetchData();
  }, []);

  // Validate form before submission
  const validateForm = () => {
    const requiredValid = validateRequiredFields();
    
    const formatErrors = {
      surgery_type: validateSurgeryType(formData.surgery_type),
    };
    
    // Check date-time validation
    let dateTimeError = "";
    if (formData.scheduled_date && formData.scheduled_time) {
      const selectedDate = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
      const now = new Date();
      if (selectedDate < now) {
        dateTimeError = "Surgery date and time cannot be in the past";
      }
    }
    
    const newValidationErrors = {};
    if (formatErrors.surgery_type) newValidationErrors.surgery_type = formatErrors.surgery_type;
    if (dateTimeError) newValidationErrors.scheduled_date_time = dateTimeError;
    
    setValidationErrors(prev => ({ ...prev, ...newValidationErrors }));
    
    const formatValid = !Object.values(formatErrors).some(error => error !== "") && !dateTimeError;
    
    return requiredValid && formatValid;
  };

  // Extract error message from error data
  const extractErrorMessage = (errorData) => {
    if (!errorData) return "Unknown error occurred";
    
    console.log("Error data received:", errorData); // Debug log
    
    // Handle your specific error format from screenshot
    // Structure: { detail: { detail: "...", field: "...", ... } }
    if (errorData.detail && typeof errorData.detail === 'object') {
      // Check for nested detail property
      if (errorData.detail.detail && typeof errorData.detail.detail === 'string') {
        return errorData.detail.detail;
      }
      // Check if detail itself is a string
      if (typeof errorData.detail === 'string') {
        return errorData.detail;
      }
    }
    
    // Handle regular string error
    if (typeof errorData === 'string') return errorData;
    
    // Handle object error
    if (typeof errorData === 'object') {
      if (errorData.message && typeof errorData.message === 'string') {
        return errorData.message;
      }
      if (errorData.error && typeof errorData.error === 'string') {
        return errorData.error;
      }
      // Fallback - stringify only the message parts
      try {
        const simpleObj = {};
        for (const key in errorData) {
          if (typeof errorData[key] === 'string') {
            simpleObj[key] = errorData[key];
          }
        }
        return Object.values(simpleObj).join(', ') || "An error occurred";
      } catch {
        return "An error occurred. Please try again.";
      }
    }
    
    return "An error occurred. Please try again.";
  };

  // Handle API error response
  const handleApiError = (error) => {
    const errorData = error.response?.data;
    const status = error.response?.status;
    
    // Reset toast flag
    toastShownRef.current = false;
    
    // Clear previous API errors
    setApiErrors({});
    setShowDuplicateError(false);
    
    console.log("API Error Status:", status);
    console.log("API Error Data:", errorData);
    
    if (!errorData) {
      if (!toastShownRef.current) {
        errorToast("Network error. Please check your connection.");
        toastShownRef.current = true;
      }
      return;
    }
    
    // Extract the main error message
    const errorMessage = extractErrorMessage(errorData);
    
    // Handle duplicate entry error (409)
    if (status === 409) {
      console.log("Duplicate error detected:", errorData);
      
      // Extract field from nested structure
      const field = errorData.detail?.field || errorData.field || 'surgery_type';
      
      // Set field-specific error - STORE AS STRING ONLY
      setApiErrors({ 
        [field]: errorMessage // This is now a string, not an object
      });
      setShowDuplicateError(true);
      
      // Show warning toast only once with simplified message
      if (!toastShownRef.current) {
        const toastMessage = errorData.detail?.detail || 
                            "Duplicate surgery found.";
        warningToast(toastMessage);
        toastShownRef.current = true;
      }
      return;
    }
    
    // Handle validation errors (422)
    if (status === 422) {
      const errors = {};
      let showGeneralToast = true;
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        errorData.detail.forEach(error => {
          const field = error.loc?.[1] || 'general';
          errors[field] = error.msg || "Invalid value";
          if (field !== 'general') showGeneralToast = false;
        });
      } else if (errorData.detail && typeof errorData.detail === 'string') {
        errors.general = errorData.detail;
      } else if (errorData.detail && typeof errorData.detail === 'object') {
        // Handle nested detail structure
        if (errorData.detail.detail) {
          errors.general = errorData.detail.detail;
        } else {
          errors.general = "Validation failed";
        }
      } else {
        errors.general = "Validation failed";
      }
      
      // Convert all errors to strings
      const stringErrors = {};
      Object.keys(errors).forEach(key => {
        if (typeof errors[key] === 'string') {
          stringErrors[key] = errors[key];
        } else {
          stringErrors[key] = String(errors[key]);
        }
      });
      
      setApiErrors(stringErrors);
      
      if (!toastShownRef.current && showGeneralToast) {
        errorToast("Please check the form for errors");
        toastShownRef.current = true;
      }
      return;
    }
    
    // Handle other errors with single toast
    if (!toastShownRef.current) {
      errorToast(errorMessage || "Something went wrong. Please try again.");
      toastShownRef.current = true;
    }
  };

  // Get combined error for a field
  const getFieldError = (fieldName) => {
    const error = apiErrors[fieldName] || validationErrors[fieldName] || fieldErrors[fieldName];
    
    if (!error) return "";
    
    // Return simplified duplicate error message
    if (fieldName === "surgery_type" && showDuplicateError) {
      return "This surgery already exists for the selected patient, doctor, and date.";
    }
    
    // CRITICAL FIX: Always return a string, never an object
    if (typeof error === 'string') {
      return error;
    }
    
    // If it's an object, extract the string message
    if (typeof error === 'object') {
      console.warn("Object error detected in getFieldError:", error);
      
      // Handle nested detail structure
      if (error.detail && typeof error.detail === 'object' && error.detail.detail) {
        return String(error.detail.detail);
      }
      
      // Handle detail property
      if (error.detail && typeof error.detail === 'string') {
        return error.detail;
      }
      
      // Handle message property
      if (error.message && typeof error.message === 'string') {
        return error.message;
      }
      
      // Safely convert to string
      try {
        return JSON.stringify(error);
      } catch {
        return "An error occurred";
      }
    }
    
    // Fallback to string conversion
    return String(error);
  };

  // Check if form has any errors
  const hasErrors = () => {
    const hasValidationErrors = Object.values(validationErrors).some(error => error !== "");
    const hasFieldErrors = Object.values(fieldErrors).some(error => error !== "");
    const hasApiErrors = Object.values(apiErrors).some(error => {
      // Check if error is a non-empty string
      if (typeof error === 'string') return error.trim() !== "";
      // If it's an object, consider it an error
      return error !== null && error !== undefined;
    });
    
    return hasValidationErrors || hasFieldErrors || hasApiErrors;
  };

  // Handle save
  const handleSave = async () => {
    // Reset toast flag
    toastShownRef.current = false;
    
    if (!validateForm()) {
      if (!toastShownRef.current) {
        errorToast("Please fix all validation errors before saving");
        toastShownRef.current = true;
      }
      return;
    }

    setSaving(true);
    setApiErrors({});
    setShowDuplicateError(false);
    
    try {
      const payload = {
        patient_id: parseInt(formData.patient_id),
        doctor_id: parseInt(formData.doctor_id),
        surgery_type: formData.surgery_type.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        scheduled_date: `${formData.scheduled_date}T${formData.scheduled_time}:00`
      };

      console.log("Sending payload:", payload);

      const response = await api.post("/surgeries/create", payload);
      
      if (response.status === 201) {
        successToast("Surgery added successfully!");
        onSuccess?.();
        onClose?.();
      }
      
    } catch (error) {
      console.error("Save error:", error);
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      patient_id: "",
      doctor_id: "",
      surgery_type: "",
      description: "",
      scheduled_date: "",
      scheduled_time: "",
      status: "pending",
    });
    setValidationErrors({});
    setFieldErrors({});
    setApiErrors({});
    setShowDuplicateError(false);
    setFocusedField(null);
    toastShownRef.current = false;
  };

  // Handle close with reset
  const handleClose = () => {
    handleReset();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica] overflow-y-auto py-4">
      <div
        className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
                   bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70
                   dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]
                   overflow-visible my-4"
      >
        <div
          className="w-[805px] rounded-[19px] bg-gray-100 dark:bg-[#000000]
                     text-black dark:text-white p-6 relative overflow-visible"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          {/* Gradient inner border */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "20px",
              padding: "2px",
              background:
                "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          
          {/* Header */}
          <div className="flex justify-between items-center pb-3 mb-4">
            <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
              Add Surgery
            </h3>
            <button
              onClick={handleClose}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A]
                         bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center
                         hover:scale-105 transition-transform"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>
          
          {/* General API Error Display */}
          {apiErrors.general && (
            <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 text-sm">
                  {getFieldError("general")}
                </span>
              </div>
            </div>
          )}
          
          {/* Form Grid - 3x3 layout */}
          <div className="grid grid-cols-3 gap-4">
            {/* Patient Selection - Row 1, Column 1 */}
            <div className="col-span-1">
              <label className="text-sm text-black dark:text-white">
                Patient <span className="text-red-700">*</span>
              </label>
              <Listbox 
                value={formData.patient_id} 
                onChange={(v) => handleInputChange("patient_id", v)}
              >
                <div className="relative mt-1">
                  <Listbox.Button
                    onFocus={() => setFocusedField("patient")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                               text-left text-[14px] leading-[16px] flex items-center justify-between group
                               ${focusedField === "patient" ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : 
                                 getFieldError("patient_id") ? "border-red-500 ring-1 ring-red-500" : 
                                 "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
                  >
                    <span className={`block truncate ${formData.patient_id ? "text-black dark:text-[#0EFF7B]" : "text-[#0EFF7B] dark:text-[#0EFF7B]"}`}>
                      {loadingPatients ? (
                        <span className="text-gray-500">Loading…</span>
                      ) : formData.patient_id ? (
                        patients.find((p) => String(p.id) === String(formData.patient_id))?.full_name || 
                        `ID: ${formData.patient_id}`
                      ) : (
                        "Select Patient"
                      )}
                    </span>
                    <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-0.5 w-full max-h-40 overflow-y-auto rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px]">
                    {patients.map((patient) => (
                      <Listbox.Option
                        key={patient.id}
                        value={patient.id}
                        className={({ active, selected }) =>
                          `cursor-pointer select-none py-2 px-2 text-sm rounded-md
                           ${
                             active
                               ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                               : "text-black dark:text-white"
                           }
                           ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                        }
                      >
                        {patient.full_name} ({patient.patient_unique_id})
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
              {getFieldError("patient_id") && (
                <div className="mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-400 text-xs">
                    {getFieldError("patient_id")}
                  </span>
                </div>
              )}
            </div>
            
            {/* Doctor Selection - Row 1, Column 2 */}
            <div className="col-span-1">
              <label className="text-sm text-black dark:text-white">
                Doctor <span className="text-red-700">*</span>
              </label>
              <Listbox 
                value={formData.doctor_id} 
                onChange={(v) => handleInputChange("doctor_id", v)}
              >
                <div className="relative mt-1">
                  <Listbox.Button
                    onFocus={() => setFocusedField("doctor")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                               text-left text-[14px] leading-[16px] flex items-center justify-between group
                               ${focusedField === "doctor" ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : 
                                 getFieldError("doctor_id") ? "border-red-500 ring-1 ring-red-500" : 
                                 "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
                  >
                    <span className={`block truncate ${formData.doctor_id ? "text-black dark:text-[#0EFF7B]" : "text-[#0EFF7B] dark:text-[#0EFF7B]"}`}>
                      {loadingDoctors ? (
                        <span className="text-gray-500">Loading…</span>
                      ) : formData.doctor_id ? (
                        doctors.find((d) => String(d.id) === String(formData.doctor_id))?.full_name || 
                        `ID: ${formData.doctor_id}`
                      ) : (
                        "Select Doctor"
                      )}
                    </span>
                    <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-0.5 w-full max-h-40 overflow-y-auto rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px]">
                    {doctors.map((doctor) => (
                      <Listbox.Option
                        key={doctor.id}
                        value={doctor.id}
                        className={({ active, selected }) =>
                          `cursor-pointer select-none py-2 px-2 text-sm rounded-md
                           ${
                             active
                               ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                               : "text-black dark:text-white"
                           }
                           ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                        }
                      >
                        {doctor.full_name} ({doctor.employee_id})
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
              {getFieldError("doctor_id") && (
                <div className="mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-400 text-xs">
                    {getFieldError("doctor_id")}
                  </span>
                </div>
              )}
            </div>
            
            {/* Surgery Type - Row 1, Column 3 */}
            <div className="col-span-1">
              <label className="text-sm text-black dark:text-white">
                Surgery Type <span className="text-red-700">*</span>
              </label>
              <input
                value={formData.surgery_type}
                onChange={(e) => handleInputChange("surgery_type", e.target.value)}
                onFocus={() => setFocusedField("surgery_type")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter surgery type"
                className={`w-full h-[32px] mt-1 px-3 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                           placeholder-gray-400 dark:placeholder-gray-500 outline-none 
                           text-black dark:text-[#0EFF7B]
                           ${focusedField === "surgery_type" ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : 
                             getFieldError("surgery_type") ? "border-red-500 ring-1 ring-red-500" : 
                             "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
              />
              {getFieldError("surgery_type") && (
                <div className="mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-400 text-xs">
                    {getFieldError("surgery_type")}
                  </span>
                </div>
              )}
            </div>

            {/* Status - Row 2, Column 1 */}
            <div className="col-span-1">
              <label className="text-sm text-black dark:text-white">
                Status <span className="text-red-700">*</span>
              </label>
              <Listbox
                value={formData.status}
                onChange={(v) => handleInputChange("status", v)}
              >
                <div className="relative mt-1">
                  <Listbox.Button
                    className="w-full h-[33px] px-3 pr-8 rounded-[8px] border
                               bg-gray-100 dark:bg-transparent
                               text-left text-[14px] leading-[16px]
                               flex items-center justify-between
                               border-[#0EFF7B] dark:border-[#3A3A3A]"
                  >
                    <span className="block truncate text-black dark:text-[#0EFF7B]">
                      {SURGERY_STATUSES.find(s => s.value === formData.status)?.label}
                    </span>
                    <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options
                    className="absolute mt-0.5 w-full max-h-40 overflow-y-auto
                               rounded-[12px] bg-gray-100 dark:bg-black
                               shadow-lg z-50 border border-[#0EFF7B]"
                  >
                    {SURGERY_STATUSES.map((status) => (
                      <Listbox.Option
                        key={status.value}
                        value={status.value}
                        className={({ active }) =>
                          `cursor-pointer select-none py-2 px-3 text-sm rounded-md
                           ${active
                             ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                             : "text-black dark:text-white"}`
                        }
                      >
                        {status.label}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
            
            {/* Surgery Date - Row 2, Column 2 */}
            <div className="col-span-1">
              <label className="text-sm text-black dark:text-white">
                Surgery Date <span className="text-red-700">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => handleInputChange("scheduled_date", e.target.value)}
                  onFocus={() => setFocusedField("scheduled_date")}
                  onBlur={() => setFocusedField(null)}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full h-[33px] px-3 rounded-[8px] border
                            bg-gray-100 dark:bg-transparent outline-none
                            text-black dark:text-[#0EFF7B] cursor-pointer
                            [&::-webkit-calendar-picker-indicator]:opacity-0
                            [&::-webkit-calendar-picker-indicator]:absolute
                            [&::-webkit-calendar-picker-indicator]:right-2
                            [&::-webkit-calendar-picker-indicator]:w-4
                            [&::-webkit-calendar-picker-indicator]:h-4
                            [&::-webkit-calendar-picker-indicator]:cursor-pointer
                            ${focusedField === "scheduled_date"
                              ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]"
                              : getFieldError("scheduled_date") || getFieldError("scheduled_date_time")
                                ? "border-red-500 ring-1 ring-red-500"
                                : "border-[#0EFF7B] dark:border-[#3A3A3A]"
                            }`}
                  style={{
                    colorScheme: 'normal'
                  }}
                />
                <Calendar
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0EFF7B] cursor-pointer
                            hover:text-[#0EFF7B]"
                  onClick={() => {
                    dateInputRef.current?.showPicker();
                  }}
                />
              </div>
              {getFieldError("scheduled_date") && (
                <div className="mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-400 text-xs">
                    {getFieldError("scheduled_date")}
                  </span>
                </div>
              )}
            </div>
            
            {/* Surgery Time - Row 2, Column 3 */}
            <div className="col-span-1">
              <label className="text-sm text-black dark:text-white">
                Surgery Time <span className="text-red-700">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  ref={timeInputRef}
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => handleInputChange("scheduled_time", e.target.value)}
                  onFocus={() => setFocusedField("scheduled_time")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-[33px] px-3 rounded-[8px] border
                            bg-gray-100 dark:bg-transparent outline-none
                            text-black dark:text-[#0EFF7B] cursor-pointer
                            [&::-webkit-calendar-picker-indicator]:opacity-0
                            [&::-webkit-calendar-picker-indicator]:absolute
                            [&::-webkit-calendar-picker-indicator]:right-2
                            [&::-webkit-calendar-picker-indicator]:w-4
                            [&::-webkit-calendar-picker-indicator]:h-4
                            [&::-webkit-calendar-picker-indicator]:cursor-pointer
                            ${focusedField === "scheduled_time"
                              ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]"
                              : getFieldError("scheduled_time") || getFieldError("scheduled_date_time")
                                ? "border-red-500 ring-1 ring-red-500"
                                : "border-[#0EFF7B] dark:border-[#3A3A3A]"
                            }`}
                  style={{
                    colorScheme: 'normal'
                  }}
                />
                <Clock
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0EFF7B] cursor-pointer
                            hover:text-[#0EFF7B]"
                  onClick={() => {
                    timeInputRef.current?.showPicker();
                  }}
                />
              </div>
              {getFieldError("scheduled_time") && (
                <div className="mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-400 text-xs">
                    {getFieldError("scheduled_time")}
                  </span>
                </div>
              )}
            </div>
            
            {/* Description - Row 3, Column 1, 2 & 3 (spans all 3 columns) */}
            <div className="col-span-3">
              <label className="text-sm text-black dark:text-white">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                onFocus={() => setFocusedField("description")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter surgery description"
                rows="3"
                className={`w-full mt-1 px-3 py-2 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                           placeholder-gray-400 dark:placeholder-gray-500 outline-none 
                           text-black dark:text-[#0EFF7B] resize-none
                           ${focusedField === "description" ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : 
                             getFieldError("description") ? "border-red-500 ring-1 ring-red-500" : 
                             "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
              />
              {getFieldError("description") && (
                <div className="mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-400 text-xs">
                    {getFieldError("description")}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Combined date-time validation error */}
          {validationErrors.scheduled_date_time && !getFieldError("scheduled_date") && !getFieldError("scheduled_time") && (
            <div className="mt-2 flex items-center gap-1">
              <AlertCircle size={12} className="text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-500 text-xs">
                {validationErrors.scheduled_date_time}
              </span>
            </div>
          )}
          
          {/* Buttons */}
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={handleClose}
              className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-gray-600
                         text-gray-600 dark:text-white font-medium text-[14px] leading-[16px]
                         shadow-[0_2px_12px_0px_#00000040] bg-gray-100 dark:bg-transparent
                         hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || hasErrors()}
              className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B66]
                         bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
                         shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px]
                         hover:scale-105 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving…
                </span>
              ) : "Add Surgery"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}