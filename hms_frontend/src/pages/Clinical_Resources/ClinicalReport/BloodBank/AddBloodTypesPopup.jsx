import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { successToast, errorToast } from "../../../../components/Toast.jsx";
import api from "../../../../utils/axiosConfig"; // Cookie-based axios instance

const AddBloodTypePopup = ({ onClose, bloodData, onUpdate, onAdd }) => {
  const [formData, setFormData] = useState({
    blood_type: bloodData?.blood_type || "",
    available_units: bloodData?.available_units || "",
    status: bloodData?.status || "Available",
  });

  // NEW: Validation states following patient registration pattern
  const [errors, setErrors] = useState({}); // Required errors (show only after submission)
  const [formatErrors, setFormatErrors] = useState({}); // Format errors (show while typing)
  const [loading, setLoading] = useState(false);

  const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const statuses = ["Available", "Low Stock", "Out of Stock"];

  // Format validation functions (show while typing)
  const validateUnitsFormat = (value) => {
    if (!value) return "";
    const units = parseInt(value, 10);
    if (isNaN(units)) {
      return "Units must be a valid number";
    }
    if (units < 0) {
      return "Units cannot be negative";
    }
    return "";
  };

  // Required field validation (only for submission)
  const validateRequiredFields = () => {
    const requiredErrors = {};
    
    if (!formData.blood_type) {
      requiredErrors.blood_type = "Blood type is required";
    }
    if (!formData.available_units) {
      requiredErrors.available_units = "Available units is required";
    }
    if (!formData.status) {
      requiredErrors.status = "Status is required";
    }
    
    return requiredErrors;
  };

  // Format validation for all fields (called on submit)
  const validateAllFormats = () => {
    const formatErrors = {
      available_units: validateUnitsFormat(formData.available_units),
    };
    return formatErrors;
  };

  const handleSubmit = async () => {
    // Check required fields
    const requiredErrors = validateRequiredFields();
    setErrors(requiredErrors);

    // Check format validation
    const formatErrors = validateAllFormats();
    setFormatErrors(formatErrors);

    // Only submit if no errors
    if (Object.keys(requiredErrors).length === 0 && 
        !Object.values(formatErrors).some(error => error !== '')) {

      setLoading(true);
      try {
        const payload = {
          blood_type: formData.blood_type,
          available_units: parseInt(formData.available_units, 10),
          status: formData.status,
        };

        const response = await api.post("/api/blood-groups/add", payload);
        
        onAdd?.(response.data);
        successToast("Blood group added successfully!");
        onClose();
      } catch (error) {
        console.error("Error in handleSubmit:", error);
        let errorMessage = "Failed to add blood group";
        
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = "Session expired. Please login again.";
          } else if (error.response.status === 400) {
            errorMessage = error.response.data?.detail || "Invalid blood group data";
          } else if (error.response.status === 409) {
            errorMessage = error.response.data?.detail || "Blood type already exists";
          } else {
            errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage;
          }
        } else if (error.request) {
          errorMessage = "Network error. Please check your connection.";
        }
        
        errorToast(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      errorToast("Please fix all validation errors before saving.");
    }
  };

  const handleUpdate = async () => {
    // Check required fields
    const requiredErrors = validateRequiredFields();
    setErrors(requiredErrors);

    // Check format validation
    const formatErrors = validateAllFormats();
    setFormatErrors(formatErrors);

    // Only submit if no errors
    if (Object.keys(requiredErrors).length === 0 && 
        !Object.values(formatErrors).some(error => error !== '')) {

      setLoading(true);
      try {
        const payload = {
          blood_type: formData.blood_type,
          available_units: parseInt(formData.available_units, 10),
          status: formData.status,
        };

        const response = await api.put(
          `/blood-groups/${bloodData.id}/edit`,
          payload
        );

        const result = response.data;
        if (onUpdate) {
          onUpdate(result);
        }
        successToast("Blood group updated successfully!");
        onClose();
      } catch (error) {
        let errorMessage = "Failed to update blood group";
        
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = "Session expired. Please login again.";
          } else if (error.response.status === 400) {
            errorMessage = error.response.data?.detail || "Invalid blood group data";
          } else if (error.response.status === 404) {
            errorMessage = "Blood group not found";
          } else {
            errorMessage = error.response.data?.detail || errorMessage;
          }
        } else if (error.request) {
          errorMessage = "Network error. Please check your connection.";
        }
        
        errorToast(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      errorToast("Please fix all validation errors before saving.");
    }
  };

  // Handle input change with format validation
  const handleUnitsChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, available_units: value });
    
    // Clear any existing required field error
    if (errors.available_units) {
      setErrors(prev => ({ ...prev, available_units: "" }));
    }
    
    // Perform real-time format validation
    const formatError = validateUnitsFormat(value);
    if (formatError) {
      setFormatErrors(prev => ({ ...prev, available_units: formatError }));
    } else if (formatErrors.available_units) {
      setFormatErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.available_units;
        return newErrors;
      });
    }
  };

  const Dropdown = ({
    label,
    value,
    onChange,
    options,
    error,
    required = false,
  }) => (
    <div>
      <label className="text-sm text-black dark:text-white">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1 w-[228px]">
          <Listbox.Button
            className="w-full h-[32px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
            bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]
            focus:outline-none disabled:opacity-50"
            disabled={loading}
          >
            {value || "Select"}
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-[#0EFF7B]" />
            </span>
          </Listbox.Button>
          <Listbox.Options
            className="absolute mt-1 w-full max-h-40 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black
            shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A]"
          >
            {options.map((option, idx) => (
              <Listbox.Option
                key={idx}
                value={option}
                className={({ active, selected }) =>
                  `cursor-pointer select-none py-2 px-3 text-sm rounded-md ${
                    active
                      ? "bg-gray-100 dark:bg-[#0EFF7B1A] text-black dark:text-[#0EFF7B]"
                      : "text-black dark:text-white"
                  } ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                }
              >
                {option}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
      {error && (
        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );

  // Helper to get error for dropdowns (only required errors)
  const getDropdownError = (field) => {
    return errors[field] || "";
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
      <div
        className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
        bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70
        dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]"
      >
        <div className="w-[505px] h-auto rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative">
          {/* Header */}
          <div className="flex justify-between items-center pb-3 mb-4">
            <h2 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
              {bloodData ? "Edit Blood Type" : "Add Blood Type"}
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center disabled:opacity-50"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-6">
            <Dropdown
              label="Blood Type"
              value={formData.blood_type}
              onChange={(val) => {
                setFormData({ ...formData, blood_type: val });
                if (errors.blood_type) {
                  setErrors(prev => ({ ...prev, blood_type: "" }));
                }
              }}
              options={bloodTypes}
              error={getDropdownError("blood_type")}
              required={true}
            />

            <div>
              <label className="text-sm text-black dark:text-white">
                Available Units <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.available_units}
                onChange={handleUnitsChange}
                placeholder="e.g. 1 or 2 or 3"
                disabled={loading}
                className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
                bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 
                outline-none disabled:opacity-50"
              />
              {/* Format validation error - shows while typing */}
              {formatErrors.available_units && (
                <p className="text-red-500 text-xs mt-1">
                  {formatErrors.available_units}
                </p>
              )}
              {/* Required field error - only shows after submit attempt */}
              {errors.available_units && !formatErrors.available_units && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.available_units}
                </p>
              )}
            </div>

            <Dropdown
              label="Status"
              value={formData.status}
              onChange={(val) => {
                setFormData({ ...formData, status: val });
                if (errors.status) {
                  setErrors(prev => ({ ...prev, status: "" }));
                }
              }}
              options={statuses}
              error={getDropdownError("status")}
              required={true}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
              bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[14px] leading-[16px]
              disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={bloodData ? handleUpdate : handleSubmit}
              disabled={loading}
              className="w-[144px] h-[32px] border-b-[2px] border-[#0EFF7B] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
              text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100 
              disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {bloodData ? "Updating..." : "Adding..."}
                </>
              ) : (
                bloodData ? "Update" : "Add"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBloodTypePopup;