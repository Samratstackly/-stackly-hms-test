import React, { useState, useEffect } from "react";
import { X, ChevronDown, Loader2 } from "lucide-react";
import { Listbox } from "@headlessui/react";
import api from "../../../utils/axiosConfig";
import { successToast, errorToast } from "../../../components/Toast.jsx";

const Dropdown = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  required = false,
  loading = false,
  error = ""
}) => {
  // Find selected option for display
  let displayValue = "";
  if (value && options && options.length > 0) {
    const selectedOption = options.find(option => option === value);
    displayValue = selectedOption ? selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1) : placeholder;
  } else {
    displayValue = placeholder;
  }

  return (
    <div>
      <label className="text-sm text-black dark:text-white mb-1 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Listbox value={value || ""} onChange={onChange} disabled={loading}>
        <div className="relative mt-1 w-full">
          <Listbox.Button 
            className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border ${loading
                ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50 dark:border-[#3A3A3A] dark:bg-gray-800"
                : "border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent"
              } text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]
              focus:outline-none`}
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </span>
            ) : (
              displayValue
            )}
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
            </span>
          </Listbox.Button>
          
          {!loading && (
            <Listbox.Options 
              className="absolute mt-1 w-full rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 
              border border-gray-300 dark:border-[#3A3A3A] max-h-60 overflow-auto"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <Listbox.Option
                value=""
                className={({ active }) =>
                  `cursor-pointer select-none py-2 px-3 text-sm rounded-md ${active
                    ? "bg-gray-100 dark:bg-[#0EFF7B1A] text-black dark:text-[#0EFF7B]"
                    : "text-black dark:text-white"
                  }`
                }
              >
                {placeholder}
              </Listbox.Option>
              
              {options && options.length > 0 ? (
                options.map((option, idx) => (
                  <Listbox.Option
                    key={idx}
                    value={option}
                    className={({ active, selected }) =>
                      `cursor-pointer select-none py-2 px-3 text-sm rounded-md ${active
                        ? "bg-gray-100 dark:bg-[#0EFF7B1A] text-black dark:text-[#0EFF7B]"
                        : "text-black dark:text-white"
                      } ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                    }
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Listbox.Option>
                ))
              ) : (
                <div className="py-2 px-3 text-sm text-gray-500 dark:text-gray-400">
                  No options available
                </div>
              )}
            </Listbox.Options>
          )}
        </div>
      </Listbox>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const EditTestPopup = ({ onClose, test, onSuccess, statusOptions }) => {
  const [formData, setFormData] = useState({
    test_type: "",
    description: "",
    price: "",
    duration_minutes: "",
    status: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (test) {
      setFormData({
        test_type: test.test_type || "",
        description: test.description || "",
        price: test.price || "",
        duration_minutes: test.duration_minutes || "",
        status: test.status || ""
      });
    }
  }, [test]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Validate negative values during typing
    const errors = { ...validationErrors };
    
    if (name === "price" && value !== "") {
      const numValue = parseFloat(value);
      if (numValue < 0) {
        errors.price = "Price cannot be negative";
      } else {
        delete errors.price;
      }
    }
    
    if (name === "duration_minutes" && value !== "") {
      const numValue = parseInt(value);
      if (numValue < 0) {
        errors.duration_minutes = "Duration cannot be negative";
      } else {
        delete errors.duration_minutes;
      }
    }
    
    setValidationErrors(errors);
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    
    // Required field validation (only triggers after submission)
    if (submitted && !formData.test_type.trim()) {
      errors.test_type = "Test type is required";
    }
    
    // Status required validation (only triggers after submission)
    if (submitted && !formData.status.trim()) {
      errors.status = "Status is required";
    }
    
    // Price validation (negative check - shows during typing too)
    if (formData.price !== "") {
      const priceNum = parseFloat(formData.price);
      if (priceNum < 0) {
        errors.price = "Price cannot be negative";
      }
    }
    
    // Duration validation (negative check - shows during typing too)
    if (formData.duration_minutes !== "") {
      const durationNum = parseInt(formData.duration_minutes);
      if (durationNum < 0) {
        errors.duration_minutes = "Duration cannot be negative";
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    const errors = validateForm();
    
    // Check for required fields
    if (!formData.test_type.trim()) {
      errors.test_type = "Test type is required";
    }
    
    // Check for status required
    if (!formData.status.trim()) {
      errors.status = "Status is required";
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        test_type: formData.test_type,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        status: formData.status
      };

      // Use axios instead of fetch
      const response = await api.put(`/laboratory/tests/${test.id}`, payload);
      
      // Check for successful response
      if (response.status === 200) {
        // Show success toast
        successToast("Test updated successfully!");
        
        // Wait a moment for the toast to show, then close and refresh
        setTimeout(async () => {
          await onSuccess();
          onClose();
        }, 500);
      } else {
        throw new Error("Failed to update test");
      }
    } catch (err) {
      // Handle axios errors
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Failed to update test. Please try again.";
      
      setError(errorMessage);
      
      // Show error toast with more specific message if available
      const toastMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          errorMessage;
      errorToast(toastMessage);
      
      console.error("Error updating test:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!test) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
        <div
          className="w-[600px] h-auto rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          {/* Gradient Inner Border */}
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
          <div className="flex justify-between items-center pb-3 mb-6 relative z-10">
            <h3 className="text-black dark:text-white font-medium text-[18px] leading-[21px]">
              Edit Test
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
              disabled={loading}
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 relative z-10">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Test Type */}
              <div>
                <label className="text-sm text-black dark:text-white mb-1 block">
                  Test Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="test_type"
                  value={formData.test_type}
                  onChange={handleFormChange}
                  disabled={loading}
                  className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter test type"
                />
                {validationErrors.test_type && (
                  <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                    {validationErrors.test_type}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="text-sm text-black dark:text-white mb-1 block">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  step="0.01"
                  disabled={loading}
                  className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="0.00"
                />
                {validationErrors.price && (
                  <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                    {validationErrors.price}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="text-sm text-black dark:text-white mb-1 block">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  disabled={loading}
                  className="w-full px-3 py-2 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter test description"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm text-black dark:text-white mb-1 block">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleFormChange}
                  disabled={loading}
                  className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter duration"
                />
                {validationErrors.duration_minutes && (
                  <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                    {validationErrors.duration_minutes}
                  </p>
                )}
              </div>

              {/* Status Dropdown */}
              <div>
                <Dropdown
                  label="Status"
                  value={formData.status}
                  onChange={(value) => setFormData({ ...formData, status: value })}
                  options={statusOptions}
                  placeholder="Select status"
                  required={true}
                  loading={loading}
                  error={validationErrors.status}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-gray-600 text-gray-600 dark:text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] bg-gray-100 dark:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B66] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? "Updating..." : "Update Test"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTestPopup;