import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { successToast, errorToast } from "../../components/Toast";
import api from "../../utils/axiosConfig"; // Cookie-based axios instance

const AddDepartmentPopup = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    departmentName: "",
    status: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({}); // Format validation
  const [fieldErrors, setFieldErrors] = useState({}); // Required validation (submit only)
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  /* ---------- Format Validation Functions (while typing) ---------- */
  const validateDepartmentNameFormat = (value) => {
    if (value.trim() && !/^[A-Za-z\s&.,'-]+$/.test(value)) return "Department name should contain only letters, spaces, &, ., ,, ' and -";
    if (value.trim().length < 2) return "Department name must be at least 2 characters";
    if (value.trim().length > 100) return "Department name cannot exceed 100 characters";
    return "";
  };

  const validateDescriptionFormat = (value) => {
    if (value.trim() && !/^[A-Za-z0-9\s.,!?'-]+$/.test(value)) return "Description can contain letters, numbers, spaces and basic punctuation";
    if (value.trim().length > 500) return "Description cannot exceed 500 characters";
    return "";
  };

  /* ---------- Required Field Validation (only for submission) ---------- */
  const validateRequiredFields = () => {
    const errors = {};
    let isValid = true;

    if (!formData.departmentName.trim()) {
      errors.departmentName = "Department name is required";
      isValid = false;
    }
    
    if (!formData.status) {
      errors.status = "Status is required";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  /* ---------- Capitalize Functions ---------- */
  const capitalizeWords = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  /* ---------- Handle Input Change ---------- */
  const handleInputChange = (field) => (e) => {
    let value = e.target.value;
    
    // Apply auto-capitalization for department name
    if (field === "departmentName") {
      value = capitalizeWords(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors for this field
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
    
    // Perform real-time format validation
    let formatError = "";
    switch (field) {
      case "departmentName":
        formatError = validateDepartmentNameFormat(value);
        break;
      case "description":
        formatError = validateDescriptionFormat(value);
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

  /* ---------- Validate Form Before Submission ---------- */
  const validateForm = () => {
    // First check required fields
    const requiredValid = validateRequiredFields();
    
    // Then check format validation
    const formatErrors = {
      departmentName: validateDepartmentNameFormat(formData.departmentName),
      description: validateDescriptionFormat(formData.description)
    };
    
    // Update validation errors for display
    setValidationErrors(formatErrors);
    
    const formatValid = !Object.values(formatErrors).some(error => error !== "");
    
    setIsSubmitted(true);
    return requiredValid && formatValid;
  };

  const handleSave = async () => {
    // Validate all fields
    if (!validateForm()) {
      errorToast("Please fix all validation errors before saving.");
      return;
    }

    setLoading(true);

    const payload = {
      name: formData.departmentName.trim(),
      status: formData.status.toLowerCase(), // Backend expects "active"/"inactive"
      description: formData.description.trim() || null,
    };

    try {
      const response = await api.post("/departments/create", payload);

      // SUCCESS TOAST
      successToast(`"${response.data.name}" created successfully!`);

      // Notify parent to refresh list
      if (onSave) onSave(response.data);

      // Close popup with a tiny delay for toast visibility
      setTimeout(() => {
        onClose();
      }, 600);

    } catch (err) {
      let errorMessage = "Failed to create department.";
      
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 409) {
          errorMessage = err.response.data?.detail || "Department with this name already exists.";
        } else if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = "Session expired. Please login again.";
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.detail || "Invalid data.";
        } else {
          errorMessage = err.response.data?.detail || errorMessage;
        }
      } else if (err.request) {
        // Request was made but no response
        errorMessage = "Network error. Please check your connection.";
      } else {
        // Something else happened
        errorMessage = err.message || errorMessage;
      }
      
      errorToast(errorMessage);
      console.error("Create Department Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ departmentName: "", status: "", description: "" });
    setValidationErrors({});
    setFieldErrors({});
    setIsSubmitted(false);
    setFocusedField(null);
  };

  const statuses = ["Active", "Inactive"];

  // Reusable Dropdown
  const Dropdown = ({ label, value, onChange, options }) => {
    const isFocused = focusedField === 'status';
    const hasFormatError = validationErrors.status;
    const hasRequiredError = fieldErrors.status;
    
    return (
      <div>
        <label className="text-sm text-gray-600 dark:text-white">{label}</label>
        <Listbox value={value} onChange={onChange}>
          <div className="relative mt-1 w-[228px]">
            <Listbox.Button
              className={`
                w-full h-[33px] px-3 pr-8 rounded-[8px] border text-left text-[14px] leading-[16px]
                ${value ? "text-[#08994A] dark:text-[#0EFF7B]" : "text-[#0EFF7B] dark:text-[#0EFF7B]"}
                ${isFocused ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]" : "border-[#0EFF7B] dark:border-[#3A3A3A]"}
                bg-gray-100 dark:bg-transparent
                flex items-center justify-between
              `}
              disabled={loading}
              onFocus={() => setFocusedField('status')}
              onBlur={() => setFocusedField(null)}
            >
              <span>{value || "Select"}</span>
              <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]" />
              </span>
            </Listbox.Button>

            <Listbox.Options
              className="absolute mt-1 w-full rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px] max-h-60 overflow-auto"
            >
              {options.map((option, idx) => (
                <Listbox.Option
                  key={idx}
                  value={option}
                  className={({ active, selected }) =>
                    `cursor-pointer select-none py-2 px-2 text-sm rounded-md ${
                      active
                        ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
                        : selected
                        ? "font-medium text-[#08994A] dark:text-[#0EFF7B]"
                        : "text-black dark:text-white"
                    }`
                  }
                >
                  {option}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
        {/* Format validation error - shows while typing */}
        {hasFormatError && (
          <p className="mt-1 text-xs text-red-500">{hasFormatError}</p>
        )}
        {/* Required field error - only shows after submit attempt */}
        {hasRequiredError && !hasFormatError && (
          <p className="mt-1 text-xs text-red-500">{hasRequiredError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
      <div className="w-[504px] h-auto rounded-[20px] bg-gray-100 dark:bg-[#000000E5] text-black dark:text-white p-6 backdrop-blur-md relative">
        {/* Gradient Border */}
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
        ></div>

        {/* Header */}
        <div className="flex justify-between items-center pb-3 mb-4">
          <h3 className="text-black dark:text-white font-inter font-medium text-[16px] leading-[19px]">
            Add Department
          </h3>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B1A] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] shadow flex items-center justify-center text-gray-600 dark:text-white hover:text-[#08994A] dark:hover:text-[#0EFF7B]"
            disabled={loading}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-2 gap-6">
          {/* Department Name */}
          <div>
            <label className="text-sm text-gray-600 dark:text-white">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              name="departmentName"
              value={formData.departmentName}
              onChange={handleInputChange("departmentName")}
              onFocus={() => setFocusedField('departmentName')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter department"
              className={`
                w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border 
                ${focusedField === 'departmentName' ? 'border-[#0EFF7B] ring-1 ring-[#0EFF7B]' : 'border-[#0EFF7B] dark:border-[#3A3A3A]'}
                bg-gray-100 dark:bg-transparent text-[#08994A] dark:text-[#0EFF7B] 
                placeholder-gray-500 dark:placeholder-gray-500 outline-none 
                disabled:opacity-50
              `}
              disabled={loading}
            />
            {/* Format validation error - shows while typing */}
            {validationErrors.departmentName && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.departmentName}</p>
            )}
            {/* Required field error - only shows after submit attempt */}
            {fieldErrors.departmentName && !validationErrors.departmentName && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.departmentName}</p>
            )}
          </div>

          {/* Status Dropdown */}
          <Dropdown
            label={
              <>
                Status <span className="text-red-500">*</span>
              </>
            }
            value={formData.status}
            onChange={(val) => setFormData({ ...formData, status: val })}
            options={statuses}
          />
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="text-sm text-gray-600 dark:text-white">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange("description")}
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
            placeholder="Enter description"
            rows={4}
            className={`
              w-full mt-1 px-3 py-2 rounded-[12px] border 
              ${focusedField === 'description' ? 'border-[#0EFF7B] ring-1 ring-[#0EFF7B]' : 'border-[#0EFF7B] dark:border-[#3A3A3A]'}
              bg-gray-100 dark:bg-transparent text-[#08994A] dark:text-[#0EFF7B] 
              placeholder-gray-500 dark:placeholder-gray-500 outline-none 
              disabled:opacity-50
            `}
            disabled={loading}
          />
          {/* Format validation error - shows while typing */}
          {validationErrors.description && (
            <p className="mt-1 text-xs text-red-500">{validationErrors.description}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-[18px] mt-8">
          <button
            onClick={handleClear}
            disabled={loading}
            className="w-[104px] h-[33px] rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] px-3 py-2 text-black dark:text-white font-medium text-[14px] leading-[16px] shadow opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-gray-900 disabled:opacity-50"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={loading || Object.values(validationErrors).some(error => error !== "")}
            className="w-[144px] h-[33px] rounded-[8px] border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66] px-3 py-2 text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              "Add"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDepartmentPopup;