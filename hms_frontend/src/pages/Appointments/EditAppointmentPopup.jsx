// src/components/EditAppointmentPopup.jsx
import React, { useState, useEffect } from "react";
import { X, Calendar, ChevronDown } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { successToast, errorToast } from "../../components/Toast.jsx";
import api from "../../utils/axiosConfig"; // Cookie-based axios instance

export default function EditAppointmentPopup({
  onClose,
  appointment,
  onUpdate,
}) {
  const parseTimeFromAppointment = (appt) => {    
    let appointmentDate = appt.appointment_date || "";
    let appointmentTime = appt.appointment_time || "";
    
    if (appt.appointment_time) {
      try {
        const timeStr = appt.appointment_time;
        const timeParts = timeStr.split(':');
        if (timeParts.length >= 2) {
          const hours = timeParts[0].padStart(2, '0');
          const minutes = timeParts[1].padStart(2, '0');
          appointmentTime = `${hours}:${minutes}`;
        }
      } catch (err) {
        appointmentTime = "";
      }
    }
    
    return { appointmentDate, appointmentTime };
  };

  const { appointmentDate, appointmentTime } = parseTimeFromAppointment(appointment);

  const initialData = {
    id: appointment.id,
    patient_name: appointment.patient_name || "",
    patient_id: appointment.patient_id || "",
    department_id: appointment.department_id || "",
    staff_id: appointment.staff_id || "",
    room_no: appointment.room_no || "",
    phone_no: appointment.phone_no || "",
    appointment_type: appointment.appointment_type || "checkup",
    status: appointment.status || "new",
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    department_name: appointment.department_name || "",
    staff_name: appointment.staff_name || "",
  };

  const [formData, setFormData] = useState(initialData);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [loadingDept, setLoadingDept] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Validation functions
  const validatePatientNameFormat = (value) => {
    if (!value.trim()) return "Patient name is required";
    if (value.trim() && !/^[A-Za-z\s'-]+$/.test(value)) 
      return "Name should only contain letters, spaces, hyphens, and apostrophes";
    if (value.trim() && value.trim().length < 2) 
      return "Name must be at least 2 characters";
    return "";
  };

  const validatePhoneFormat = (value) => {
    if (!value.trim()) return "Phone number is required";
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

  const validateAppointmentDate = (date) => {
    if (!date) return "Appointment date is required";
    return "";
  };

  const validateAppointmentTime = (time) => {
    if (!time) return "Appointment time is required";
    
    // Time format validation
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) return "Please enter a valid time format (HH:MM)";
    
    return "";
  };

  // No past check for edit
  const validateAppointmentDateTime = (date, time) => {
    if (!date || !time) return "";
    return "";
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    if (field === "patient_name") {
      processedValue = value
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    const newFormData = { ...formData, [field]: processedValue };
    setFormData(newFormData);
    
    // Clear specific field error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear combined date-time error when either date or time is changed
    if (field === "appointment_date" || field === "appointment_time") {
      if (validationErrors.appointment_date_time) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.appointment_date_time;
          return newErrors;
        });
      }
    }
    
    // Run validation for the changed field
    let formatError = "";
    
    switch (field) {
      case "patient_name":
        formatError = validatePatientNameFormat(processedValue);
        break;
      case "phone_no":
        formatError = validatePhoneFormat(processedValue);
        break;
      case "appointment_date":
        formatError = validateAppointmentDate(processedValue);
        // Also validate combined date-time if both fields have values
        if (!formatError && newFormData.appointment_time) {
          const dateTimeError = validateAppointmentDateTime(
            processedValue, 
            newFormData.appointment_time
          );
          if (dateTimeError) {
            setValidationErrors(prev => ({
              ...prev,
              appointment_date_time: dateTimeError
            }));
          }
        }
        break;
      case "appointment_time":
        formatError = validateAppointmentTime(processedValue);
        // Also validate combined date-time if both fields have values
        if (!formatError && newFormData.appointment_date) {
          const dateTimeError = validateAppointmentDateTime(
            newFormData.appointment_date,
            processedValue
          );
          if (dateTimeError) {
            setValidationErrors(prev => ({
              ...prev,
              appointment_date_time: dateTimeError
            }));
          }
        }
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
  };

  // Load departments
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
      })
      .finally(() => {
        if (mounted) setLoadingDept(false);
      });
    
    return () => (mounted = false);
  }, []);

  // Load available beds
  useEffect(() => {
    let mounted = true;
    setLoadingBeds(true);
    
    api.get("/bedgroups/all")
      .then((response) => {
        if (mounted) {
          const data = response.data;
          const beds = data.flatMap((group) =>
            group.beds
              .filter((bed) => !bed.is_occupied)
              .map((bed) => ({
                id: `${group.bedGroup}-${bed.bed_number}`,
                name: `${group.bedGroup}-${bed.bed_number}`,
              }))
          );
          setAvailableBeds(beds);
        }
      })
      .catch((error) => {
        console.error("Failed to load beds:", error);
      })
      .finally(() => {
        if (mounted) setLoadingBeds(false);
      });
    
    return () => (mounted = false);
  }, []);

  // Preload department_id from name after departments load
  useEffect(() => {
    if (departments.length > 0 && formData.department_name && !formData.department_id) {
      const matchingDept = departments.find((d) => d.name === formData.department_name);
      if (matchingDept) {
        setFormData((prev) => ({
          ...prev,
          department_id: matchingDept.id,
          department_name: "",
        }));
      }
    }
  }, [departments, formData.department_name, formData.department_id]);

  // Load doctors when department changes
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
          setDoctors(Array.isArray(data) ? data : []);
        }
      })
      .catch((error) => {
        console.error("Failed to load doctors:", error);
      })
      .finally(() => {
        if (mounted) setLoadingDoc(false);
      });
    
    return () => (mounted = false);
  }, [formData.department_id]);

  // Preload staff_id from name after doctors load
  useEffect(() => {
    if (doctors.length > 0 && formData.staff_name && !formData.staff_id) {
      const matchingStaff = doctors.find((s) => s.full_name === formData.staff_name);
      if (matchingStaff) {
        setFormData((prev) => ({
          ...prev,
          staff_id: matchingStaff.id,
          staff_name: "",
        }));
      }
    }
  }, [doctors, formData.staff_name, formData.staff_id]);

  useEffect(() => {
    if (
      ["completed", "cancelled"].includes(formData.status) &&
      !formData.appointment_date
    ) {
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, appointment_date: today }));
    }
  }, [formData.status]);

  // Reusable Dropdown with error display
  const Dropdown = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    loading,
    isObject = false,
    required = false,
    error,
  }) => (
    <div>
      <label
        className="text-sm text-black dark:text-white"
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        {label} {required && <span className="text-red-700">*</span>}
      </label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1 w-[228px]">
          <Listbox.Button
            className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
                        bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            {loading ? (
              <span className="text-gray-500">Loading…</span>
            ) : value ? (
              isObject ? (
                options.find((o) => String(o.id) === String(value))?.name ||
                options.find((o) => String(o.id) === String(value))
                  ?.full_name ||
                value
              ) : (
                value
              )
            ) : (
              placeholder
            )}
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
            </span>
          </Listbox.Button>
          {error && (
            <div className="text-red-500 text-xs mt-1">{error}</div>
          )}
          <Listbox.Options
            className="absolute mt-1 w-full max-h-40 overflow-y-auto rounded-[12px] bg-gray-100 dark:bg-black
                      shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px]"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {options.map((opt) => {
              let label;
              if (isObject) {
                // For doctors (has full_name field) - add " - Doctor"
                if (opt.full_name) {
                  label = `${opt.full_name} - Doctor`;
                } 
                // For departments and beds (has name field)
                else if (opt.name) {
                  label = opt.name;
                }
                // Fallback
                else {
                  label = String(opt.id);
                }
              } else {
                label = opt;
              }
              
              const val = isObject ? opt.id : opt;
              return (
                <Listbox.Option
                  key={val}
                  value={val}
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
    </div>
  );

  // Handle Update
  const handleUpdate = async () => {
    // Clear all previous errors
    setValidationErrors({});
    
    // Check required fields
    const requiredErrors = {};
    if (!formData.patient_name.trim()) requiredErrors.patient_name = "Patient name is required";
    if (!formData.department_id) requiredErrors.department_id = "Department is required";
    if (!formData.staff_id) requiredErrors.staff_id = "Doctor is required";
    if (!formData.room_no) requiredErrors.room_no = "Room/Bed is required";
    if (!formData.phone_no) requiredErrors.phone_no = "Phone number is required";
    if (!formData.appointment_type) requiredErrors.appointment_type = "Appointment type is required";
    if (!formData.status) requiredErrors.status = "Status is required";
    
    // Date and time validations - separate validations
    const dateError = validateAppointmentDate(formData.appointment_date);
    if (dateError) requiredErrors.appointment_date = dateError;
    
    const timeError = validateAppointmentTime(formData.appointment_time);
    if (timeError) requiredErrors.appointment_time = timeError;
    
    // Combined date-time validation (only if both are present and individually valid)
    if (!dateError && !timeError && formData.appointment_date && formData.appointment_time) {
      const dateTimeError = validateAppointmentDateTime(
        formData.appointment_date,
        formData.appointment_time
      );
      if (dateTimeError) {
        requiredErrors.appointment_date_time = dateTimeError;
      }
    }
    
    // Check format validation
    const formatErrors = {
      patient_name: validatePatientNameFormat(formData.patient_name),
      phone_no: validatePhoneFormat(formData.phone_no),
    };
    
    // Merge required errors and format errors
    const allErrors = { ...requiredErrors };
    if (formatErrors.patient_name) allErrors.patient_name = formatErrors.patient_name;
    if (formatErrors.phone_no) allErrors.phone_no = formatErrors.phone_no;
    
    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      errorToast("Please fix validation errors");
      return;
    }
    
    setSaving(true);
    try {
      const formatTime = (timeStr) => {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(":");
        return `${hours}:${minutes}:00`;
      };

      const payload = {
        patient_name: formData.patient_name,
        department_id: Number(formData.department_id),
        staff_id: Number(formData.staff_id),
        room_no: formData.room_no || "",
        phone_no: formData.phone_no || "",
        appointment_type: formData.appointment_type,
        status: formData.status,
        appointment_date: formData.appointment_date,
        appointment_time: formatTime(formData.appointment_time),
      };

      console.log("Updating appointment with payload:", payload);

      const response = await api.put(`/appointments/${formData.id}`, payload);
      
      const updated = response.data;
      successToast("Appointment updated successfully!");
      onUpdate?.(updated);
      onClose?.();
    } catch (error) {
      console.error("Update error:", error);
      
      if (error.response?.status === 422) {
        const errorData = error.response.data;
        console.error("Validation errors:", errorData);
        
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Handle Pydantic validation errors
            const errors = {};
            errorData.detail.forEach(err => {
              const field = err.loc?.[1] || 'general';
              errors[field] = err.msg;
            });
            setValidationErrors(errors);
            errorToast("Please fix the validation errors");
          } else {
            errorToast(errorData.detail);
          }
        } else {
          errorToast("Validation failed. Please check your inputs.");
        }
      } else {
        errorToast(error.response?.data?.detail || error.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const bedOptions = availableBeds.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
      <div
        className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
                    bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70
                    dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]"
      >
        <div
          className="w-[804px] h-auto rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
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
          <div className="flex justify-between items-center pb-3 mb-4">
            <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
              Edit Appointment
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A]
                          bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-black dark:text-white">
                Patient Name <span className="text-red-700">*</span>
              </label>
              <input
                value={formData.patient_name}
                onChange={(e) => handleInputChange("patient_name", e.target.value)}
                placeholder="Enter name"
                className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
                            bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B]
                            placeholder-gray-400 dark:placeholder-gray-500 outline-none"
              />
              {validationErrors.patient_name && (
                <div className="text-red-500 text-xs mt-1">{validationErrors.patient_name}</div>
              )}
            </div>
            
            <div>
              <label className="text-sm text-black dark:text-white">
                Patient ID
              </label>
              <input
                value={formData.patient_id}
                readOnly
                className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
                            bg-gray-100 dark:bg-transparent text-gray-500 dark:text-gray-400 outline-none"
              />
            </div>
            
            <Dropdown
              label="Department"
              value={formData.department_id}
              onChange={(v) => {
                setFormData({ ...formData, department_id: v, staff_id: "" });
                if (validationErrors.department_id) {
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.department_id;
                    return newErrors;
                  });
                }
              }}
              options={departments}
              placeholder={loadingDept ? "Loading…" : "Select Department"}
              loading={loadingDept}
              isObject={true}
              required={true}
              error={validationErrors.department_id}
            />
            
            <div>
              <label className="text-sm text-black dark:text-white">
                Appointment Date <span className="text-red-700">*</span>
              </label>
              <div className="relative cursor-pointer">
                <input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => handleInputChange("appointment_date", e.target.value)}
                  className="w-full h-[33px] mt-1 px-3 pr-10 rounded-[8px]
                            border border-[#0EFF7B] dark:border-[#3A3A3A]
                            bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B]
                            outline-none cursor-pointer
                            [&::-webkit-calendar-picker-indicator]:absolute
                            [&::-webkit-calendar-picker-indicator]:inset-0
                            [&::-webkit-calendar-picker-indicator]:w-full
                            [&::-webkit-calendar-picker-indicator]:h-full
                            [&::-webkit-calendar-picker-indicator]:cursor-pointer
                            [&::-webkit-calendar-picker-indicator]:opacity-0"
                />
                <Calendar
                  size={18}
                  className="absolute right-3 top-3 text-[#0EFF7B] pointer-events-none"
                />
              </div>
              {validationErrors.appointment_date && (
                <div className="text-red-500 text-xs mt-1">
                  {validationErrors.appointment_date}
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm text-black dark:text-white">
                Appointment Time <span className="text-red-700">*</span>
              </label>
              <input
                type="time"
                value={formData.appointment_time}
                onChange={(e) => handleInputChange("appointment_time", e.target.value)}
                className={`w-full h-[33px] mt-1 px-3 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                  outline-none text-black dark:text-[#0EFF7B]
                  appearance-none ${validationErrors.appointment_time ? 'border-red-500' : 'border-[#0EFF7B] dark:border-[#3A3A3A]'}`}
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
                <div className="text-red-500 text-xs mt-1">
                  {validationErrors.appointment_time}
                </div>
              )}
            </div>
            
            <Dropdown
              label="Room / Bed No"
              value={formData.room_no}
              onChange={(v) => {
                setFormData({ ...formData, room_no: v });
                if (validationErrors.room_no) {
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.room_no;
                    return newErrors;
                  });
                }
              }}
              options={bedOptions}
              placeholder={loadingBeds ? "Loading…" : "Select Available Bed"}
              loading={loadingBeds}
              isObject={true}
              required={true}
              error={validationErrors.room_no}
            />
            
            <Dropdown
              label="Doctor"
              value={formData.staff_id}
              onChange={(v) => {
                setFormData({ ...formData, staff_id: v });
                if (validationErrors.staff_id) {
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.staff_id;
                    return newErrors;
                  });
                }
              }}
              options={doctors}
              placeholder={loadingDoc ? "Loading…" : "Select Doctor"}
              loading={loadingDoc}
              isObject={true}
              required={true}
              error={validationErrors.staff_id}
            />
            
            <Dropdown
              label="Status"
              value={formData.status}
              onChange={(v) => {
                setFormData({ ...formData, status: v });
                if (validationErrors.status) {
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.status;
                    return newErrors;
                  });
                }
              }}
              options={["new", "normal", "severe", "completed", "cancelled", "active", "inactive", "emergency"]}
              placeholder="Select Status"
              required={true}
              error={validationErrors.status}
            />
            
            <div>
              <label className="text-sm text-black dark:text-white">
                Phone Number <span className="text-red-700">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone_no}
                onChange={(e) => handleInputChange("phone_no", e.target.value)}
                placeholder="Enter phone"
                maxLength="10"
                className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
                            bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B]
                            placeholder-gray-400 dark:placeholder-gray-500 outline-none"
              />
              {validationErrors.phone_no && (
                <div className="text-red-500 text-xs mt-1">{validationErrors.phone_no}</div>
              )}
            </div>
            
            <Dropdown
              label="Appointment Type"
              value={formData.appointment_type}
              onChange={(v) => {
                setFormData({ ...formData, appointment_type: v });
                if (validationErrors.appointment_type) {
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.appointment_type;
                    return newErrors;
                  });
                }
              }}
              options={["checkup", "followup", "emergency"]}
              placeholder="Select Type"
              required={true}
              error={validationErrors.appointment_type}
            />
          </div>
          
          {/* Combined date-time error message */}
          {validationErrors.appointment_date_time && (
            <div className="mt-4 p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="text-red-600 dark:text-red-400 text-sm">
                {validationErrors.appointment_date_time}
              </div>
            </div>
          )}
          
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={onClose}
              className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-gray-600
                          text-gray-600 dark:text-white font-medium text-[14px] leading-[16px]
                          shadow-[0_2px_12px_0px_#00000040] bg-gray-100 dark:bg-transparent"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B66]
                          bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
                          shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px]
                          hover:scale-105 transition"
            >
              {saving ? "Updating…" : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}