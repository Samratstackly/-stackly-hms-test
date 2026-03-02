import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, ChevronDown, AlertCircle, User, Stethoscope } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { successToast, errorToast, warningToast } from "../../components/Toast.jsx";
import api from "../../utils/axiosConfig";

export default function EditSurgeryPopup({ onClose, surgery, onUpdate }) {
  // Add useRef to prevent multiple toast calls
  const toastShownRef = useRef(false);
  
  const parseDateTime = (datetimeStr) => {
    if (!datetimeStr) return { date: "", time: "" };
    
    try {
      const dateObj = new Date(datetimeStr);
      const date = dateObj.toISOString().split('T')[0];
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const time = `${hours}:${minutes}`;
      return { date, time };
    } catch (err) {
      return { date: "", time: "" };
    }
  };

  const { date, time } = parseDateTime(surgery?.scheduled_date || "");

  const [formData, setFormData] = useState({
    id: surgery?.id || "",
    patient_id: surgery?.patient_id || "",
    patient_name: surgery?.patient_name || "",
    doctor_id: surgery?.doctor_id || "",
    doctor_name: surgery?.doctor_name || "",
    surgery_type: surgery?.surgery_type || "",
    description: surgery?.description || "",
    status: surgery?.status || "pending",
    price: surgery?.price || "",
    scheduled_date: date,
    scheduled_time: time,
  });

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

  // Format validation functions
  const validateSurgeryType = (value) => {
    if (value.trim() && !/^[A-Za-z0-9\s\-.,()]+$/.test(value)) 
      return "Surgery type can only contain letters, numbers, spaces, hyphens, commas, periods, and parentheses";
    if (value.trim() && value.trim().length < 2) 
      return "Surgery type must be at least 2 characters";
    return "";
  };

  // Validate date and time to prevent past dates
  const validateDateTime = () => {
    if (!formData.scheduled_date) return "Surgery date is required";
    if (!formData.scheduled_time) return "Surgery time is required";
    
    // Check if date is in the past
    const selectedDate = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
    const now = new Date();
    
    if (selectedDate < now) return "Surgery date and time cannot be in the past";
    
    return "";
  };

  const validatePrice = (value) => {
    if (value && !/^\d+(\.\d{1,2})?$/.test(value)) 
      return "Price must be a valid number with up to 2 decimal places";
    if (value && parseFloat(value) <= 0) 
      return "Price must be greater than 0";
    return "";
  };

  // Required field validation
  const validateRequiredFields = () => {
    const errors = {};
    let isValid = true;

    // Note: Patient and Doctor are now non-editable, so we don't validate them as required
    // They should already have values from the surgery data
    
    if (!formData.surgery_type.trim()) {
      errors.surgery_type = "Surgery type is required";
      isValid = false;
    }
    
    if (!formData.status) {
      errors.status = "Status is required";
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
    
    // Validate price if status is completed or failed
    if ((formData.status === "success" || formData.status === "failed") && !formData.price) {
      errors.price = "Price is required for success or failed surgeries";
      isValid = false;
    }
    
    setFieldErrors(errors);
    return isValid;
  };

  // Get minimum date for date input (today)
  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get current time for time validation
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Check if selected date is today
  const isToday = (dateString) => {
    const today = new Date();
    const selectedDate = new Date(dateString);
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    // Capitalize first letter of each word for surgery type
    if (field === "surgery_type") {
      processedValue = value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear all errors when user starts typing
    if (field === "surgery_type") {
      setShowDuplicateError(false);
      setApiErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.surgery_type;
        return newErrors;
      });
    }
    
    // Clear validation errors
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
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
    
    // Perform real-time format validation
    let formatError = "";
    
    switch (field) {
      case "surgery_type":
        formatError = validateSurgeryType(processedValue);
        break;
      case "price":
        formatError = validatePrice(processedValue);
        break;
      case "scheduled_date":
      case "scheduled_time":
        formatError = validateDateTime();
        if (formatError) {
          setValidationErrors(prev => ({
            ...prev,
            scheduled_date_time: formatError
          }));
        } else {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.scheduled_date_time;
            return newErrors;
          });
        }
        return; // Early return for date/time fields
      default:
        break;
    }
    
    if (formatError) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: formatError
      }));
    }
  };

  // Load patients and doctors (for reference only, not for editing)
  useEffect(() => {
    const fetchData = async () => {
      setLoadingPatients(true);
      setLoadingDoctors(true);
      
      try {
        // Fetch patients and doctors for reference (optional)
        const patientsResponse = await api.get("/surgeries/patients");
        setPatients(patientsResponse.data || []);
        
        const doctorsResponse = await api.get("/surgeries/doctors");
        setDoctors(doctorsResponse.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        // Don't show error toast since fields are non-editable anyway
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
      scheduled_date_time: validateDateTime(),
      price: validatePrice(formData.price)
    };
    
    const newValidationErrors = {};
    if (formatErrors.surgery_type) newValidationErrors.surgery_type = formatErrors.surgery_type;
    if (formatErrors.scheduled_date_time) newValidationErrors.scheduled_date_time = formatErrors.scheduled_date_time;
    if (formatErrors.price) newValidationErrors.price = formatErrors.price;
    
    setValidationErrors(prev => ({ ...prev, ...newValidationErrors }));
    
    const formatValid = !Object.values(formatErrors).some(error => error !== "");
    
    return requiredValid && formatValid;
  };

  // Extract error message from error data
  const extractErrorMessage = (errorData) => {
    if (!errorData) return "Unknown error occurred";
    
    console.log("Error data in EditSurgery:", errorData);
    
    // Handle your specific error format from screenshot
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
    
    if (typeof errorData === 'string') return errorData;
    
    if (typeof errorData === 'object') {
      if (errorData.message && typeof errorData.message === 'string') {
        return errorData.message;
      }
      return "An error occurred. Please try again.";
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
        [field]: errorMessage
      });
      setShowDuplicateError(true);
      
      // Show warning toast only once
      if (!toastShownRef.current) {
        const toastMessage = errorData.detail?.detail || 
                            "Duplicate surgery found. Please use a different type.";
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

  // Get combined error for a field - FIXED to always return string
  const getFieldError = (fieldName) => {
    const error = apiErrors[fieldName] || validationErrors[fieldName] || fieldErrors[fieldName];
    
    if (!error) return "";
    
    // Return simplified duplicate error message
    if (fieldName === "surgery_type" && showDuplicateError) {
      return "This surgery type already exists for the selected patient, doctor, and date.";
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

  // Handle update - FIXED VERSION
  const handleUpdate = async () => {
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

      // Add price only if status is completed or failed
      if (formData.status === "success" || formData.status === "failed") {
        payload.price = parseFloat(formData.price);
      }

      console.log("Updating surgery:", payload);
      const response = await api.put(`/surgeries/${formData.id}`, payload);

      successToast("Surgery updated successfully!");
      onUpdate?.();
      onClose?.();
      
    } catch (error) {
      console.error("Update error:", error);
      handleApiError(error);
    } finally {
      setSaving(false);
    }
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
              Edit Surgery
            </h3>
            <button
              onClick={onClose}
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
            {/* Patient Display - Row 1, Column 1 (NON-EDITABLE) */}
            <div className="col-span-1">
              <label className="text-sm text-black dark:text-white">
                Patient <span className="text-red-700">*</span>
              </label>
              <div className="relative mt-1">
                <div
                  className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                             text-left text-[14px] leading-[16px] flex items-center justify-between group
                             border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-50 dark:bg-[#1A1A1A] cursor-not-allowed`}
                >
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[#0EFF7B]" />
                    <span className="block truncate text-black dark:text-[#0EFF7B]">
                      {formData.patient_name || 
                       (patients.find((p) => String(p.id) === String(formData.patient_id))?.full_name) || 
                       `ID: ${formData.patient_id}`}
                    </span>
                  </div>
                  {/* <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Fixed
                  </div> */}
                </div>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                  <div className="text-xs text-gray-400 dark:text-gray-500">Locked</div>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                Patient cannot be changed for existing surgery
              </div>
            </div>
            
            {/* Doctor Display - Row 1, Column 2 (NON-EDITABLE) */}
            <div className="col-span-1">
              <label className="text-sm text-black dark:text-white">
                Doctor <span className="text-red-700">*</span>
              </label>
              <div className="relative mt-1">
                <div
                  className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                             text-left text-[14px] leading-[16px] flex items-center justify-between group
                             border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-50 dark:bg-[#1A1A1A] cursor-not-allowed`}
                >
                  <div className="flex items-center gap-2">
                    <Stethoscope size={14} className="text-[#0EFF7B]" />
                    <span className="block truncate text-black dark:text-[#0EFF7B]">
                      {formData.doctor_name || 
                       (doctors.find((d) => String(d.id) === String(formData.doctor_id))?.full_name) || 
                       `ID: ${formData.doctor_id}`}
                    </span>
                  </div>
                  {/* <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Fixed
                  </div> */}
                </div>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                  <div className="text-xs text-gray-400 dark:text-gray-500">Locked</div>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                Doctor cannot be changed for existing surgery
              </div>
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
                    onFocus={() => setFocusedField("status")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                               text-left text-[14px] flex items-center justify-between group
                               ${focusedField === "status" ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : 
                                 getFieldError("status") ? "border-red-500 ring-1 ring-red-500" : 
                                 "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
                  >
                    <span className={`block truncate ${formData.status ? "text-black dark:text-[#0EFF7B]" : "text-[#0EFF7B] dark:text-[#0EFF7B]"}`}>
                      {formData.status === "pending" ? "Pending" : 
                       formData.status === "success" ? "Success" : 
                       formData.status === "cancelled" ? "Cancelled" : 
                       formData.status === "failed" ? "Failed" : formData.status}
                    </span>
                    <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-0.5 w-full max-h-40 overflow-y-auto rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px]">
                    {["pending", "success", "cancelled", "failed"].map((v) => (
                      <Listbox.Option
                        key={v}
                        value={v}
                        className="cursor-pointer py-2 px-2 text-sm"
                      >
                        {v === "pending" ? "Pending" : 
                         v === "success" ? "Success" : 
                         v === "cancelled" ? "Cancelled" : 
                         "Failed"}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
              {getFieldError("status") && (
                <div className="mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-400 text-xs">
                    {getFieldError("status")}
                  </span>
                </div>
              )}
            </div>
            
            {/* Surgery Date - Row 2, Column 2 */}
            <div className="col-span-1">
              <label className="text-sm text-black dark:text-white">
                Surgery Date <span className="text-red-700">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => handleInputChange("scheduled_date", e.target.value)}
                  onFocus={() => setFocusedField("scheduled_date")}
                  onBlur={() => setFocusedField(null)}
                  min={getMinDate()} // Prevent past dates
                  className={`w-full h-[33px] px-3 pr-10 rounded-[8px] border
                            bg-gray-100 dark:bg-transparent outline-none
                            text-black dark:text-[#0EFF7B] cursor-pointer
                            appearance-none
                            [&::-webkit-calendar-picker-indicator]:opacity-0
                            [&::-webkit-calendar-picker-indicator]:hidden
                            ${focusedField === "scheduled_date"
                              ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]"
                              : getFieldError("scheduled_date") 
                                ? "border-red-500 ring-1 ring-red-500"
                                : "border-[#0EFF7B] dark:border-[#3A3A3A]"
                            }`}
                />
                <Calendar
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0EFF7B] cursor-pointer"
                  onClick={() => {
                    const input = document.querySelector('input[type="date"]');
                    if (input) input.showPicker();
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
              <input
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => handleInputChange("scheduled_time", e.target.value)}
                onFocus={() => setFocusedField("scheduled_time")}
                onBlur={() => setFocusedField(null)}
                // If date is today, set min time to current time
                min={isToday(formData.scheduled_date) ? getCurrentTime() : undefined}
                className={`w-full h-[33px] mt-1 px-3 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                           outline-none text-black dark:text-[#0EFF7B]
                           ${focusedField === "scheduled_time" ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : 
                             getFieldError("scheduled_time") ? "border-red-500 ring-1 ring-red-500" : 
                             "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
              />
              {getFieldError("scheduled_time") && (
                <div className="mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-400 text-xs">
                    {getFieldError("scheduled_time")}
                  </span>
                </div>
              )}
            </div>
            
            {/* Price Field - Row 3, Column 1 (only when status is success or failed) */}
            {(formData.status === "success" || formData.status === "failed") ? (
              <div className="col-span-1">
                <label className="text-sm text-black dark:text-white">
                  Price <span className="text-red-700">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-[#0EFF7B]">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    onFocus={() => setFocusedField("price")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter price"
                    className={`w-full h-[32px] mt-1 pl-8 pr-3 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                               placeholder-gray-400 dark:placeholder-gray-500 outline-none 
                               text-black dark:text-[#0EFF7B]
                               ${focusedField === "price" ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : 
                                 getFieldError("price") ? "border-red-500 ring-1 ring-red-500" : 
                                 "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
                  />
                </div>
                {getFieldError("price") && (
                  <div className="mt-1 flex items-center gap-1">
                    <AlertCircle size={12} className="text-red-600 dark:text-red-400" />
                    <span className="text-red-700 dark:text-red-400 text-xs">
                      {getFieldError("price")}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="col-span-1"></div> // Empty placeholder when price is not shown
            )}
            
            {/* Description - Row 3, Column 2 & 3 (spans 2 columns) */}
            <div className="col-span-2">
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
              onClick={onClose}
              className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-gray-600
                         text-gray-600 dark:text-white font-medium text-[14px] leading-[16px]
                         shadow-[0_2px_12px_0px_#00000040] bg-gray-100 dark:bg-transparent
                         hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving || hasErrors()}
              className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B66]
                         bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
                         shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px]
                         hover:scale-105 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? "Updating…" : "Update Surgery"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}