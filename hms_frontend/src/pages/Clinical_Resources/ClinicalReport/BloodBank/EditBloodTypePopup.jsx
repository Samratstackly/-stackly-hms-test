import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { Listbox } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { successToast, errorToast } from "../../../../components/Toast.jsx";
import api from "../../../../utils/axiosConfig"; // Cookie-based axios instance

const EditBloodTypePopup = ({ onClose, bloodData, onUpdate }) => {
  const [formData, setFormData] = useState({
    id: "",
    type: "",
    units: "",
    status: "",
    lastUpdated: "",
  });

  const [errors, setErrors] = useState({});
  const [formatErrors, setFormatErrors] = useState({});
  const [bloodTypes, setBloodTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
  };

  useEffect(() => {
    console.log("🟡 EditBloodTypePopup received bloodData:", bloodData);
    if (bloodData) {
      setFormData({
        id: bloodData.id || "",
        type: bloodData.blood_type || bloodData.type || "",
        units: bloodData.available_units || bloodData.units || "",
        status: bloodData.status || "",
        lastUpdated: formatDate(bloodData.updated_at) || "",
      });
    }
  }, [bloodData]);

  useEffect(() => {
    const fetchBloodTypes = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/blood-types/");
        setBloodTypes(response.data.blood_types || []);
      } catch (error) {
        console.warn("Could not fetch blood types from API, using default list");
        setBloodTypes(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
      } finally {
        setLoading(false);
      }
    };
    fetchBloodTypes();
  }, []);

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

  const validateRequiredFields = () => {
    const requiredErrors = {};
    
    if (!formData.type) requiredErrors.type = "Blood type is required";
    if (!formData.units) requiredErrors.units = "Available units is required";
    if (!formData.status) requiredErrors.status = "Status is required";
    if (!formData.lastUpdated) requiredErrors.lastUpdated = "Last updated date is required";
    
    return requiredErrors;
  };

  const validateAllFormats = () => {
    const formatErrors = {
      units: validateUnitsFormat(formData.units),
    };
    return formatErrors;
  };

  const handleUpdate = async () => {
    const requiredErrors = validateRequiredFields();
    setErrors(requiredErrors);

    const formatErrors = validateAllFormats();
    setFormatErrors(formatErrors);

    if (Object.keys(requiredErrors).length === 0 && 
        !Object.values(formatErrors).some(error => error !== '')) {
      
      setUpdating(true);
      try {
        // Convert date to ISO format for API
        let lastUpdatedISO = null;
        if (formData.lastUpdated) {
          const [month, day, year] = formData.lastUpdated.split("/");
          if (month && day && year) {
            lastUpdatedISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        }

        const payload = {
          blood_type: formData.type,
          available_units: parseInt(formData.units, 10),
          status: formData.status,
          last_updated: lastUpdatedISO,
        };

        console.log("🟡 Sending update data:", payload);
        
        // Update via API
        const response = await api.put(`/api/blood-groups/${formData.id}/edit`, payload);
        
        console.log("🟢 Update successful:", response.data);
        
        // Call the parent update handler with the API response
        if (onUpdate) onUpdate(response.data);
        successToast("Blood group updated successfully!");
        onClose();
      } catch (error) {
        console.error("🔴 Update error:", error);
        let errorMessage = "Failed to update blood group";
        
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = "Session expired. Please login again.";
          } else if (error.response.status === 400) {
            errorMessage = error.response.data?.detail || "Invalid data. Please check all fields.";
          } else if (error.response.status === 404) {
            errorMessage = "Blood group not found.";
          } else {
            errorMessage = error.response.data?.detail || errorMessage;
          }
        } else if (error.request) {
          errorMessage = "Network error. Please check your connection.";
        }
        
        errorToast(errorMessage);
      } finally {
        setUpdating(false);
      }
    } else {
      errorToast("Please fix all validation errors before saving.");
    }
  };

  const handleUnitsChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, units: value });
    
    if (errors.units) {
      setErrors(prev => ({ ...prev, units: "" }));
    }
    
    const formatError = validateUnitsFormat(value);
    if (formatError) {
      setFormatErrors(prev => ({ ...prev, units: formatError }));
    } else if (formatErrors.units) {
      setFormatErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.units;
        return newErrors;
      });
    }
  };

  const statuses = ["Available", "Low Stock", "Out of Stock"];

  const Dropdown = ({
    label,
    value,
    onChange,
    options,
    error,
    disabled = false,
  }) => (
    <div>
      <label
        className="text-sm text-black dark:text-white"
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        {label}<span className="text-red-500 ml-1">*</span>
      </label>
      <Listbox value={value} onChange={onChange} disabled={disabled || updating}>
        <div className="relative mt-1 w-[228px]">
          <Listbox.Button
            className={`w-full h-[32px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
            bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]
            focus:outline-none ${
              disabled || updating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {value || (disabled ? "Loading..." : "Select")}
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-[#0EFF7B]" />
            </span>
          </Listbox.Button>
          {!disabled && !updating && (
            <Listbox.Options
              className="absolute mt-1 w-full max-h-40 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black
              shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A] no-scrollbar"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
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
          )}
        </div>
      </Listbox>
      {error && (
        <p
          className="text-red-500 dark:text-red-400 text-xs mt-1"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          {error}
        </p>
      )}
    </div>
  );

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
        <div
          className="w-[505px] h-auto rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-3 mb-4">
            <h2
              className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Edit Blood Type
            </h2>
            <button
              onClick={onClose}
              disabled={updating}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center disabled:opacity-50"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>
          
          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-6">
            {/* Blood Type - Now Dynamic */}
            <Dropdown
              label="Blood Type"
              value={formData.type}
              onChange={(val) => {
                setFormData({ ...formData, type: val });
                if (errors.type) {
                  setErrors(prev => ({ ...prev, type: "" }));
                }
              }}
              options={bloodTypes}
              error={getDropdownError("type")}
              disabled={loading}
            />
            
            {/* Available Units */}
            <div>
              <label
                className="text-sm text-black dark:text-white"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Available Units<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="units"
                value={formData.units}
                onChange={handleUnitsChange}
                placeholder="Enter units"
                disabled={updating}
                className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
                bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none disabled:opacity-50"
              />
              {formatErrors.units && (
                <p className="text-red-500 text-xs mt-1">{formatErrors.units}</p>
              )}
              {errors.units && !formatErrors.units && (
                <p className="text-red-500 text-xs mt-1">{errors.units}</p>
              )}
            </div>
            
            {/* Status */}
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
            />
            
            {/* Last Updated */}
            <div>
              <label
                className="text-sm text-black dark:text-white"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Last Updated<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <DatePicker
                  selected={
                    formData.lastUpdated ? new Date(formData.lastUpdated) : null
                  }
                  onChange={(date) => {
                    const formatted = date
                      ? `${String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        )}/${String(date.getDate()).padStart(
                          2,
                          "0"
                        )}/${date.getFullYear()}`
                      : "";
                    setFormData({ ...formData, lastUpdated: formatted });
                    if (errors.lastUpdated) {
                      setErrors(prev => ({ ...prev, lastUpdated: "" }));
                    }
                  }}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="MM/DD/YYYY"
                  disabled={updating}
                  className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
                             bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none
                             focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] disabled:opacity-50"
                  wrapperClassName="w-full"
                  popperClassName="z-50"
                />
                {/* Calendar Icon */}
                <div className="absolute right-3 top-2.5 pointer-events-none">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-500 dark:text-[#0EFF7B]"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
              </div>
              {errors.lastUpdated && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lastUpdated}
                </p>
              )}
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={onClose}
              disabled={updating}
              className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
              bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[14px] leading-[16px]
              disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="w-[144px] h-[32px] border-b-[2px] border-[#0EFF7B] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
              text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBloodTypePopup;