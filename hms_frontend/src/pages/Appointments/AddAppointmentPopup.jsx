// src/components/AddAppointmentPopup.jsx
import React, { useState, useEffect } from "react";
import { X, Calendar, ChevronDown } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { successToast, errorToast } from "../../components/Toast.jsx";
import api from "../../utils/axiosConfig"; // Cookie-based axios instance

// ── Get today's date for default ────────────────────────────────
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ── Get default time (current time + 5 minutes) ─────────────────
const getDefaultTime = () => {
  const now = new Date();
  // Add 5 minutes to current time to ensure it's in the future
  now.setMinutes(now.getMinutes() + 5);
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
};

export default function AddAppointmentPopup({ onClose, onSuccess, isEditMode = false, appointmentData = null }) {
  // Add validation state
  const [validationErrors, setValidationErrors] = useState({}); // Format validation
  const [fieldErrors, setFieldErrors] = useState({}); // Required field validation (submit only)
  const [focusedField, setFocusedField] = useState(null);
  
  // ── Form state (backend keys) ─────────────────────────────────────
  const [formData, setFormData] = useState({
    patient_name: "",
    department_id: "",
    staff_id: "",
    room_no: "", // This should be the bed selection (e.g., "WardA-101")
    phone_no: "",
    appointment_type: "",
    status: "new", // Set default status
    appointment_date: getTodayDate(), // ✅ Changed to today's date
    appointment_time: getDefaultTime(), // Use current time + 5 minutes as default
  });

  // ── For edit mode, prefill the form ──────────────────────────────
  useEffect(() => {
    if (isEditMode && appointmentData) {
      console.log("Editing appointment data:", appointmentData);
      setFormData({
        patient_name: appointmentData.patient_name || "",
        department_id: appointmentData.department_id?.toString() || "",
        staff_id: appointmentData.staff_id?.toString() || "",
        room_no: appointmentData.room_no || "",
        phone_no: appointmentData.phone_no || "",
        appointment_type: appointmentData.appointment_type || "",
        status: appointmentData.status || "new",
        appointment_date: appointmentData.appointment_date || getTodayDate(),
        appointment_time: appointmentData.appointment_time || getDefaultTime(),
      });
      
      // Clear any existing errors when prefilling
      setValidationErrors({});
      setFieldErrors({});
    }
  }, [isEditMode, appointmentData]);

  // ── Dropdown data ───────────────────────────────────────────────────
  const [departments, setDepartments] = useState([]); // [{id, name}]
  const [doctors, setDoctors] = useState([]); // [{id, full_name}]
  const [availableBeds, setAvailableBeds] = useState([]);
  const [loadingDept, setLoadingDept] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Format validation functions (while typing) ───────────────────────
  const validatePatientNameFormat = (value) => {
    if (value.trim() && !/^[A-Za-z\s'-]+$/.test(value)) return "Name should only contain letters, spaces, hyphens, and apostrophes";
    if (value.trim() && value.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const validatePhoneFormat = (value) => {
    if (value.trim() && !/^\d{10}$/.test(value))
      return "Phone number must be exactly 10 digits";
 
    // Additional validation for invalid patterns
    const invalidPatterns = [
      /^0{10}$/, // All zeros
      /^1{10}$/, // All ones
      /^\d{5}0{5}$/, // Patterns like 1234500000
    ];
 
    if (invalidPatterns.some((pattern) => pattern.test(value))) {
      return "Please enter a valid mobile number";
    }
 
    // Validate for sequential numbers
    if (/^(\d)\1{9}$/.test(value)) {
      return "Please enter a valid mobile number";
    }
 
    return "";
  };

  const validateTimeFormat = (value) => {
    if (!value) return "Appointment time is required";
    
    // Validate time format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(value)) {
      return "Please enter a valid time in HH:MM format (24-hour)";
    }
    
    return "";
  };

  const validateAppointmentDateTime = (date, time, isEditMode = false) => {
    if (!date) return "Appointment date is required";
    if (!time) return "Appointment time is required";
    
    const selectedDateTime = new Date(`${date}T${time}:00`);
    const now = new Date();
    
    // Floor to minute level
    const apptMin = Math.floor(selectedDateTime.getTime() / 60000) * 60000;
    const nowMin = Math.floor(now.getTime() / 60000) * 60000;
    
    // In edit mode, allow past dates/times (existing appointments)
    if (!isEditMode && apptMin < nowMin) {
      return "Appointment date and time cannot be in the past";
    }
    
    return "";
  };

  // ── Required field validation (only for submission) ──────────────────
  const validateRequiredFields = () => {
    const errors = {};
    let isValid = true;

    if (!formData.patient_name.trim()) {
      errors.patient_name = "Patient name is required";
      isValid = false;
    }
    
    if (!formData.department_id) {
      errors.department_id = "Department is required";
      isValid = false;
    }
    
    if (!formData.staff_id) {
      errors.staff_id = "Doctor is required";
      isValid = false;
    }
    
    if (!formData.room_no) {
      errors.room_no = "Room/Bed is required";
      isValid = false;
    }
    
    if (!formData.phone_no) {
      errors.phone_no = "Phone number is required";
      isValid = false;
    }
    
    if (!formData.appointment_type) {
      errors.appointment_type = "Appointment type is required";
      isValid = false;
    }
    
    if (!formData.status) {
      errors.status = "Status is required";
      isValid = false;
    }
    
    if (!formData.appointment_date) {
      errors.appointment_date = "Appointment date is required";
      isValid = false;
    }
    
    if (!formData.appointment_time) {
      errors.appointment_time = "Appointment time is required";
      isValid = false;
    }
    
    setFieldErrors(errors);
    return isValid;
  };

  // ── Handle input change with format validation ────────────────────────
  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    // Capitalize first letter of each word for patient name
    if (field === "patient_name") {
      processedValue = value
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear format validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear required field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Perform real-time format validation
    let formatError = "";
    
    switch (field) {
      case "patient_name":
        formatError = validatePatientNameFormat(processedValue);
        break;
      case "phone_no":
        formatError = validatePhoneFormat(processedValue);
        break;
      case "appointment_time":
        formatError = validateTimeFormat(processedValue);
        break;
      default:
        break;
    }
    
    if (formatError) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: formatError
      }));
    }
    
    // Clear datetime validation when either date or time changes
    if (field === "appointment_date" || field === "appointment_time") {
      if (validationErrors.appointment_date_time) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.appointment_date_time;
          return newErrors;
        });
      }
    }
  };

  // ── Validate all fields before submission ────────────────────────────
  const validateForm = () => {
    // First check required fields
    const requiredValid = validateRequiredFields();
    
    // Then check format validation
    const formatErrors = {
      patient_name: validatePatientNameFormat(formData.patient_name),
      phone_no: validatePhoneFormat(formData.phone_no),
      appointment_time: validateTimeFormat(formData.appointment_time),
      appointment_date_time: validateAppointmentDateTime(
        formData.appointment_date, 
        formData.appointment_time,
        isEditMode
      )
    };
    
    // Filter out empty error messages
    const filteredErrors = Object.fromEntries(
      Object.entries(formatErrors).filter(([_, value]) => value !== "")
    );
    
    // Update validation errors for display
    setValidationErrors(filteredErrors);
    
    const formatValid = Object.keys(filteredErrors).length === 0;
    
    return requiredValid && formatValid;
  };

  // ── Load departments (once) ─────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    setLoadingDept(true);
    
    api.get("/appointments/departments")
      .then((response) => {
        if (mounted) {
          const data = response.data;
          setDepartments(Array.isArray(data) ? data : []);
        }
      })
      .catch((error) => {
        console.error("Failed to load departments:", error);
        errorToast("Failed to load departments");
      })
      .finally(() => {
        if (mounted) setLoadingDept(false);
      });
    
    return () => (mounted = false);
  }, []);

  // ── Load available beds ────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    setLoadingBeds(true);
    
    api.get("/bedgroups/all")
      .then((response) => {
        if (mounted) {
          const data = response.data;
          const beds = data.flatMap((group) =>
            group.beds
              .map((bed) => ({
                id: `${group.bedGroup}-${bed.bed_number}`,
                name: `${group.bedGroup}-${bed.bed_number}`,
                is_occupied: bed.is_occupied
              }))
          );
          // In edit mode, include all beds (even occupied ones)
          // In add mode, only show available beds
          const filteredBeds = isEditMode 
            ? beds 
            : beds.filter(bed => !bed.is_occupied);
          setAvailableBeds(filteredBeds);
        }
      })
      .catch((error) => {
        console.error("Failed to load beds:", error);
        errorToast("Failed to load beds");
      })
      .finally(() => {
        if (mounted) setLoadingBeds(false);
      });
    
    return () => (mounted = false);
  }, [isEditMode]);

  // ── Load doctors when department changes ───────────────────────────
  useEffect(() => {
    if (!formData.department_id) {
      setDoctors([]);
      return;
    }
    
    let mounted = true;
    setLoadingDoc(true);
    
    api.get(`/appointments/staff?department_id=${formData.department_id}`)
      .then((response) => {
        if (mounted) {
          const data = response.data;
          console.log("Doctors from backend:", data);
          setDoctors(Array.isArray(data) ? data : []);
        }
      })
      .catch((error) => {
        console.error("Failed to load doctors:", error);
        errorToast("Failed to load doctors");
      })
      .finally(() => {
        if (mounted) setLoadingDoc(false);
      });
    
    return () => (mounted = false);
  }, [formData.department_id]);

  // ── Save handler with validation ───────────────────────────────────
 const handleSave = async () => {
  if (!validateForm()) {
    errorToast("Please fix all validation errors before saving");
    return;
  }

  setSaving(true);
  try {
    // For add mode only: Strict duplicate check (TC_44)
    if (!isEditMode) {
      try {
        // Normalize data
        const normalizedPatientName = formData.patient_name.trim().toLowerCase();
        const normalizedPhone = formData.phone_no;
        
        console.log("=== DUPLICATE CHECK ===");
        console.log("Patient:", normalizedPatientName);
        console.log("Phone:", normalizedPhone);
        console.log("Date:", formData.appointment_date);
        console.log("Time:", formData.appointment_time);
        
        // Try to fetch appointments
        let allAppointments = [];
        try {
          const response = await api.get("/appointments/list_appointments");
          allAppointments = response.data || [];
          console.log("Total appointments fetched:", allAppointments.length);
        } catch (fetchError) {
          console.error("Failed to fetch appointments:", fetchError);
          // Continue without duplicate check
        }
        
        // Only check duplicates if we have appointments data
        if (allAppointments.length > 0) {
          // 1. Check for EXACT duplicate (same patient, phone, date, AND time)
          const exactDuplicate = allAppointments.some(appointment => {
            const appointmentPatientName = (appointment.patient_name || "").trim().toLowerCase();
            const appointmentPhone = appointment.phone_no || "";
            const appointmentDate = appointment.appointment_date || "";
            const appointmentTime = appointment.appointment_time || "";
            
            const isExactDuplicate = (
              appointmentPatientName === normalizedPatientName &&
              appointmentPhone === normalizedPhone &&
              appointmentDate === formData.appointment_date &&
              appointmentTime === formData.appointment_time
            );
            
            if (isExactDuplicate) {
              console.log("EXACT DUPLICATE FOUND!");
            }
            
            return isExactDuplicate;
          });
          
          if (exactDuplicate) {
            errorToast("❌ Cannot create appointment: An exact duplicate already exists for this patient with the same phone number at the same time");
            setSaving(false);
            return;
          }
          
          // 2. Check for same patient and phone on same day (NEW LOGIC)
          const sameDayAppointments = allAppointments.filter(appointment => {
            const appointmentPatientName = (appointment.patient_name || "").trim().toLowerCase();
            const appointmentPhone = appointment.phone_no || "";
            const appointmentDate = appointment.appointment_date || "";
            
            return (
              appointmentPatientName === normalizedPatientName &&
              appointmentPhone === normalizedPhone &&
              appointmentDate === formData.appointment_date
            );
          });
          
          console.log("Same patient/phone/day appointments found:", sameDayAppointments.length);
          
          if (sameDayAppointments.length > 0) {
            // ⚠️ CRITICAL: Prevent creation if same patient & phone on same day
            const existingTimes = sameDayAppointments
              .map(a => a.appointment_time || "Unknown time")
              .join(', ');
            
            errorToast(`❌ Cannot create appointment: Patient already has ${sameDayAppointments.length} appointment(s) today at ${existingTimes}`);
            setSaving(false);
            return;
          }
          
          // 3. Optional: Check for same patient and phone (any date) - just info
          const anyDateAppointments = allAppointments.filter(appointment => {
            const appointmentPatientName = (appointment.patient_name || "").trim().toLowerCase();
            const appointmentPhone = appointment.phone_no || "";
            
            return (
              appointmentPatientName === normalizedPatientName &&
              appointmentPhone === normalizedPhone
            );
          });
          
          if (anyDateAppointments.length > 0) {
            // Just show info, don't block
            errorToast(`ℹ️ Note: This patient has ${anyDateAppointments.length} previous appointment(s)`);
          }
        }
        
      } catch (duplicateError) {
        console.error("Duplicate check failed:", duplicateError);
        // Don't block on duplicate check errors
      }
    }

    // ✅ CORRECTED PAYLOAD
    const payload = {
      patient_name: formData.patient_name.trim(),
      department_id: Number(formData.department_id),
      staff_id: Number(formData.staff_id),
      room_no: formData.room_no,
      phone_no: formData.phone_no,
      appointment_type: formData.appointment_type,
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time,
      status: formData.status,
    };

    console.log("Sending payload to backend:", payload);

    let res;
    if (isEditMode && appointmentData?.id) {
      // Update existing appointment (TC_97)
      res = await api.put(`/appointments/${appointmentData.id}`, payload);
      successToast("✅ Appointment updated successfully!");
    } else {
      // Create new appointment
      res = await api.post("/appointments/create_appointment", payload);
      successToast("✅ Appointment added successfully!");
    }

    onSuccess?.();
    onClose?.();
    
  } catch (error) {
    console.error("Save error:", error);
    
    // Handle duplicate error from backend (status 409)
    if (error.response?.status === 409) {
      errorToast(error.response?.data?.detail || "❌ Duplicate appointment found by server");
      return;
    }
    
    // Handle validation errors
    if (error.response?.status === 422) {
      const errorData = error.response.data;
      console.error("Validation errors:", errorData);
      
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          const errors = {};
          errorData.detail.forEach(err => {
            const field = err.loc?.[1] || 'general';
            errors[field] = err.msg;
          });
          setValidationErrors(errors);
          errorToast("❌ Please fix the validation errors");
        } else {
          errorToast("❌ " + errorData.detail);
        }
      } else {
        errorToast("❌ Validation failed. Please check your inputs.");
      }
    } else if (error.response?.status === 404) {
      errorToast("❌ Doctor or Department not found");
    } else {
      errorToast("❌ " + (error.response?.data?.detail || error.message || "Failed to save appointment"));
    }
  } finally {
    setSaving(false);
  }
};

  // ── Render ───────────────────────────────────────────────────────────
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
              {isEditMode ? "Edit Appointment" : "Add Appointment"}
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A]
                         bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>
          {/* Form Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Patient Name */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Patient Name <span className="text-red-700">*</span>
              </label>
              <input
                value={formData.patient_name}
                onChange={(e) =>
                  handleInputChange("patient_name", e.target.value)
                }
                onFocus={() => setFocusedField("patient_name")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter name"
                className={`w-full h-[32px] mt-1 px-3 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                           placeholder-gray-400 dark:placeholder-gray-500 outline-none 
                           text-black dark:text-[#0EFF7B]
                           ${focusedField === "patient_name" ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
              />
              {/* Format validation error - shows while typing */}
              {validationErrors.patient_name && (
                <div className="mt-1">
                  <span className="text-red-700 dark:text-red-500 text-xs">{validationErrors.patient_name}</span>
                </div>
              )}
              {/* Required field error - only shows after submit attempt */}
              {fieldErrors.patient_name && !validationErrors.patient_name && (
                <div className="mt-1">
                  <span className="text-red-700 dark:text-red-500 text-xs">{fieldErrors.patient_name}</span>
                </div>
              )}
            </div>
            {/* Department */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Department <span className="text-red-700">*</span>
              </label>
              <Listbox value={formData.department_id} onChange={(v) => {
                handleInputChange("department_id", v);
                handleInputChange("staff_id", "");
              }}>
                <div className="relative mt-1">
                  <Listbox.Button
                    onFocus={() => setFocusedField("department")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                               text-left text-[14px] leading-[16px] flex items-center justify-between group
                               ${focusedField === "department" ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    <span className={`block truncate ${formData.department_id ? "text-black dark:text-[#0EFF7B]" : "text-[#0EFF7B] dark:text-[#0EFF7B]"}`}>
                      {loadingDept ? (
                        <span className="text-gray-500">Loading…</span>
                      ) : formData.department_id ? (
                        departments.find((o) => String(o.id) === String(formData.department_id))?.name ||
                        formData.department_id
                      ) : (
                        "Select"
                      )}
                    </span>
                    <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options
                    className="absolute mt-0.5 w-full max-h-40 overflow-y-auto rounded-[12px] bg-gray-100 dark:bg-black
                               shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px]"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {departments.map((opt) => {
                      const label = opt.name || String(opt.id);
                      return (
                        <Listbox.Option
                          key={opt.id}
                          value={opt.id}
                          className={({ active, selected }) =>
                            `cursor-pointer select-none py-2 px-2 text-sm rounded-md
                             ${
                               active
                                 ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                                 : "text-black dark:text-white"
                             }
                             ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                          }
                          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                        >
                          {label}
                        </Listbox.Option>
                      );
                    })}
                  </Listbox.Options>
                </div>
              </Listbox>
              {fieldErrors.department_id && (
                <div className="mt-1">
                  <span className="text-red-700 dark:text-red-500 text-xs">{fieldErrors.department_id}</span>
                </div>
              )}
            </div>
            {/* Doctor */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Doctor <span className="text-red-700">*</span>
              </label>
              <Listbox value={formData.staff_id} onChange={(v) => handleInputChange("staff_id", v)}>
                <div className="relative mt-1">
                  <Listbox.Button
                    onFocus={() => setFocusedField("doctor")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                               text-left text-[14px] leading-[16px] flex items-center justify-between group
                               ${focusedField === "doctor" ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    <span className={`block truncate ${formData.staff_id ? "text-black dark:text-[#0EFF7B]" : "text-[#0EFF7B] dark:text-[#0EFF7B]"}`}>
                      {loadingDoc ? (
                        <span className="text-gray-500">Loading…</span>
                      ) : formData.staff_id ? (
                        doctors.find((o) => String(o.id) === String(formData.staff_id))?.full_name ||
                        formData.staff_id
                      ) : (
                        "Select"
                      )}
                    </span>
                    <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options
                    className="absolute mt-0.5 w-full max-h-40 overflow-y-auto rounded-[12px] bg-gray-100 dark:bg-black
                               shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px]"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {doctors.map((opt) => {
                      const label = opt.full_name ? `${opt.full_name} - Doctor` : String(opt.id);
                      return (
                        <Listbox.Option
                          key={opt.id}
                          value={opt.id}
                          className={({ active, selected }) =>
                            `cursor-pointer select-none py-2 px-2 text-sm rounded-md
                             ${
                               active
                                 ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                                 : "text-black dark:text-white"
                             }
                             ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                          }
                          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                        >
                          {label}
                        </Listbox.Option>
                      );
                    })}
                  </Listbox.Options>
                </div>
              </Listbox>
              {fieldErrors.staff_id && (
                <div className="mt-1">
                  <span className="text-red-700 dark:text-red-500 text-xs">{fieldErrors.staff_id}</span>
                </div>
              )}
            </div>
            {/* Room / Bed No */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Room / Bed No <span className="text-red-700">*</span>
              </label>
              <Listbox value={formData.room_no} onChange={(v) => handleInputChange("room_no", v)}>
                <div className="relative mt-1">
                  <Listbox.Button
                    onFocus={() => setFocusedField("room")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                               text-left text-[14px] leading-[16px] flex items-center justify-between group
                               ${focusedField === "room" ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    <span className={`block truncate ${formData.room_no ? "text-black dark:text-[#0EFF7B]" : "text-[#0EFF7B] dark:text-[#0EFF7B]"}`}>
                      {loadingBeds ? (
                        <span className="text-gray-500">Loading…</span>
                      ) : formData.room_no ? (
                        availableBeds.find((o) => String(o.id) === String(formData.room_no))?.name ||
                        formData.room_no
                      ) : (
                        "Select"
                      )}
                    </span>
                    <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options
                    className="absolute mt-0.5 w-full max-h-40 overflow-y-auto rounded-[12px] bg-gray-100 dark:bg-black
                               shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px]"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {availableBeds.map((opt) => {
                      const label = opt.name || String(opt.id);
                      return (
                        <Listbox.Option
                          key={opt.id}
                          value={opt.id}
                          className={({ active, selected }) =>
                            `cursor-pointer select-none py-2 px-2 text-sm rounded-md
                             ${
                               active
                                 ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                                 : "text-black dark:text-white"
                             }
                             ${selected ? "bg-[#0EFF7B] !text-white dark:!text-black font-semibold" : ""}`
                          }
                          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                        >
                          {label}
                        </Listbox.Option>
                      );
                    })}
                  </Listbox.Options>
                </div>
              </Listbox>
              {fieldErrors.room_no && (
                <div className="mt-1">
                  <span className="text-red-700 dark:text-red-500 text-xs">{fieldErrors.room_no}</span>
                </div>
              )}
            </div>
            {/* Phone No */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Phone No <span className="text-red-700">*</span>
              </label>
              <input
                value={formData.phone_no}
                onChange={(e) => {
                  handleInputChange("phone_no", e.target.value);
                }}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter phone no (10 digits)"
                className={`w-full h-[33px] mt-1 px-3 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                           placeholder-gray-400 dark:placeholder-gray-500 outline-none 
                           text-black dark:text-[#0EFF7B]
                           ${focusedField === "phone" ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
              />
              {/* Format validation error - shows while typing */}
              {validationErrors.phone_no && (
                <div className="mt-1">
                  <span className="text-red-700 dark:text-red-500 text-xs">{validationErrors.phone_no}</span>
                </div>
              )}
              {/* Required field error - only shows after submit attempt */}
              {fieldErrors.phone_no && !validationErrors.phone_no && (
                <div className="mt-1">
                  <span className="text-red-700 dark:text-red-500 text-xs">{fieldErrors.phone_no}</span>
                </div>
              )}
            </div>
            {/* Appointment Type */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Appointment Type <span className="text-red-700">*</span>
              </label>
              <Listbox
                value={formData.appointment_type}
                onChange={(v) => handleInputChange("appointment_type", v)}
              >
                <div className="relative mt-1">
                  <Listbox.Button
                    onFocus={() => setFocusedField("appointment")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                               text-left text-[14px] flex items-center justify-between group
                               ${focusedField === "appointment" ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
                  >
                    <span className={`block truncate ${formData.appointment_type ? "text-black dark:text-[#0EFF7B]" : "text-[#0EFF7B] dark:text-[#0EFF7B]"}`}>
                      {formData.appointment_type === "checkup"
                        ? "Check-up"
                        : formData.appointment_type === "followup"
                        ? "Follow-up"
                        : formData.appointment_type === "emergency"
                        ? "Emergency"
                        : "Select"}
                    </span>
                    <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options 
                    className="absolute mt-0.5 w-full max-h-40 overflow-y-auto rounded-[12px] bg-gray-100 dark:bg-black 
                               shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px]"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {["checkup", "followup", "emergency"].map((v) => (
                      <Listbox.Option
                        key={v}
                        value={v}
                        className={({ active, selected }) =>
                          `cursor-pointer select-none py-2 px-2 text-sm rounded-md
                           ${
                             active
                               ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                               : "text-black dark:text-white"
                           }
                           ${selected ? "bg-[#0EFF7B] !text-white dark:!text-black font-semibold" : ""}`
                        }
                        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                      >
                        {v === "checkup" ? "Check-up" : v === "followup" ? "Follow-up" : "Emergency"}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
              {fieldErrors.appointment_type && (
                <div className="mt-1">
                  <span className="text-red-700 dark:text-red-500 text-xs">{fieldErrors.appointment_type}</span>
                </div>
              )}
            </div>
            {/* Status */}
            <div>
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
                               ${focusedField === "status" ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
                  >
                    <span className={`block truncate ${formData.status ? "text-black dark:text-[#0EFF7B]" : "text-[#0EFF7B] dark:text-[#0EFF7B]"}`}>
                      {formData.status === "new"
                        ? "New"
                        : formData.status === "normal"
                        ? "Normal"
                        : formData.status === "severe"
                        ? "Severe"
                        : "Select"}
                    </span>
                    <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options 
                    className="absolute mt-0.5 w-full max-h-40 overflow-y-auto rounded-[12px] bg-gray-100 dark:bg-black 
                               shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px]"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {["new", "normal", "severe"].map((v) => (
                      <Listbox.Option
                        key={v}
                        value={v}
                        className={({ active, selected }) =>
                          `cursor-pointer select-none py-2 px-2 text-sm rounded-md
                           ${
                             active
                               ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                               : "text-black dark:text-white"
                           }
                           ${selected ? "bg-[#0EFF7B] !text-white dark:!text-black font-semibold" : ""}`
                        }
                        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                      >
                        {v === "new" ? "New" : v === "normal" ? "Normal" : "Severe"}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
              {fieldErrors.status && (
                <div className="mt-1">
                  <span className="text-red-700 dark:text-red-500 text-xs">{fieldErrors.status}</span>
                </div>
              )}
            </div>
            {/* Appointment Date */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Appointment Date <span className="text-red-700">*</span>
              </label>

              <div className="relative mt-1">
                <input
                  type="date"
                  id="appointment_date"
                  value={formData.appointment_date}
                  onChange={(e) =>
                    handleInputChange("appointment_date", e.target.value)
                  }
                  onFocus={() => setFocusedField("appointment_date")}
                  onBlur={() => setFocusedField(null)}
                  min={isEditMode ? "" : new Date().toISOString().split("T")[0]} // ✅ Only restrict for new appointments
                  className={`w-full h-[33px] px-3 pr-10 rounded-[8px] border
                            bg-gray-100 dark:bg-transparent outline-none
                            text-black dark:text-[#0EFF7B] cursor-pointer
                            appearance-none
                            [&::-webkit-calendar-picker-indicator]:opacity-0
                            [&::-webkit-calendar-picker-indicator]:hidden
                            ${
                              focusedField === "appointment_date"
                                ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]"
                                : "border-[#0EFF7B] dark:border-[#3A3A3A]"
                            }`}
                />

                {/* Custom calendar icon */}
                <Calendar
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0EFF7B] cursor-pointer"
                  onClick={() =>
                    document.getElementById("appointment_date")?.showPicker()
                  }
                />
              </div>

              {fieldErrors.appointment_date && (
                <div className="mt-1">
                  <span className="text-red-700 dark:text-red-500 text-xs">
                    {fieldErrors.appointment_date}
                  </span>
                </div>
              )}
            </div>

            {/* Appointment Time */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Appointment Time <span className="text-red-700">*</span>
              </label>

              <input
                type="time"
                value={formData.appointment_time}
                onChange={(e) => handleInputChange("appointment_time", e.target.value)}
                onFocus={() => setFocusedField("appointment_time")}
                onBlur={() => setFocusedField(null)}
                className={`w-full h-[33px] mt-1 px-3 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                  outline-none text-black dark:text-[#0EFF7B]
                  appearance-none
                  ${focusedField === "appointment_time"
                    ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]"
                    : "border-[#0EFF7B] dark:border-[#3A3A3A]"}`}
              />

              <style>{`
                /* Chrome, Edge, Safari */
                input[type="time"]::-webkit-calendar-picker-indicator {
                  filter: invert(72%) sepia(95%) saturate(600%) hue-rotate(85deg) brightness(110%) contrast(105%);
                  cursor: pointer;
                }

                /* Firefox */
                input[type="time"]::-moz-calendar-picker-indicator {
                  filter: invert(72%) sepia(95%) saturate(600%) hue-rotate(85deg) brightness(110%) contrast(105%);
                  cursor: pointer;
                }

                /* Force same icon color in both themes */
                input[type="time"] {
                  color-scheme: light;
                }

                .dark input[type="time"] {
                  color-scheme: light;
                }
              `}</style>

              {validationErrors.appointment_time && (
                <div className="mt-1">
                  <span className="text-red-700 dark:text-red-500 text-xs">
                    {validationErrors.appointment_time}
                  </span>
                </div>
              )}

              {fieldErrors.appointment_time && !validationErrors.appointment_time && (
                <div className="mt-1">
                  <span className="text-red-700 dark:text-red-500 text-xs">
                    {fieldErrors.appointment_time}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Combined date-time validation error */}
          {validationErrors.appointment_date_time && (
            <div className="mt-2">
              <span className="text-red-700 dark:text-red-500 text-xs">{validationErrors.appointment_date_time}</span>
            </div>
          )}
          
          {/* Buttons */}
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={onClose}
              className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-[#3A3A3A] text-gray-800 dark:text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] opacity-100 bg-gray-100 dark:bg-transparent"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || Object.values(validationErrors).some(error => error !== "")}
              className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition"
            >
              {saving ? "Saving…" : (isEditMode ? "Update Appointment" : "Add Appointment")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}