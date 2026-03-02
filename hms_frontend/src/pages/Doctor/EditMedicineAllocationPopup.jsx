import React, { useState, useEffect, useMemo, useCallback } from "react";
import { X, ChevronDown } from "lucide-react";
import { Listbox } from "@headlessui/react";
import api from "../../utils/axiosConfig"; // Import axios config

const EditMedicineAllocationPopup = ({ onClose, medicineData, onUpdate }) => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Convert frequency string to array if needed
  const initialFrequency = useMemo(() => {
    if (!medicineData?.frequency) return [];
    if (Array.isArray(medicineData.frequency)) return medicineData.frequency;
    if (typeof medicineData.frequency === 'string') {
      // Handle both comma-separated and space-separated formats
      if (medicineData.frequency.includes(',')) {
        return medicineData.frequency.split(',').map(f => f.trim()).filter(Boolean);
      } else {
        return medicineData.frequency.split(' ').map(f => f.trim()).filter(Boolean);
      }
    }
    return [];
  }, [medicineData]);
  
  const [formData, setFormData] = useState({
    medicineName: medicineData?.medicine_name || "",
    dosage: medicineData?.dosage || "",
    quantity: medicineData?.quantity || "",
    frequency: initialFrequency,
    duration: medicineData?.duration || "",
    time: medicineData?.time || "",
  });
  
  const [errors, setErrors] = useState({});

  // Fetch stock data once
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await api.get("/stock/list");
        setStockData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load stock:", error);
        setLoading(false);
        // You could show an error toast here if needed
      }
    };

    fetchStockData();
  }, []);

  // Calculate quantity based on frequency and duration
  const calculateQuantity = useCallback((frequency, duration) => {
    if (!frequency || frequency.length === 0 || !duration) return "";
    
    // Parse duration (e.g., "5 days", "2 weeks", "1 month")
    const durationStr = duration.toString().toLowerCase();
    let days = 0;
    
    if (durationStr.includes("day")) {
      days = parseInt(durationStr) || 0;
    } else if (durationStr.includes("week")) {
      const weeks = parseInt(durationStr) || 0;
      days = weeks * 7;
    } else if (durationStr.includes("month")) {
      const months = parseInt(durationStr) || 0;
      days = months * 30; // Approximate
    } else {
      // Try to parse as number of days
      days = parseInt(durationStr) || 0;
    }
    
    if (days <= 0) return "";
    
    // Calculate total doses
    const dosesPerDay = frequency.length;
    const totalDoses = days * dosesPerDay;
    
    return totalDoses.toString();
  }, []);

  // Update quantity when frequency or duration changes
  useEffect(() => {
    if (formData.frequency.length > 0 && formData.duration) {
      const calculatedQty = calculateQuantity(formData.frequency, formData.duration);
      if (calculatedQty) {
        setFormData(prev => ({
          ...prev,
          quantity: calculatedQty
        }));
      }
    }
  }, [formData.frequency, formData.duration, calculateQuantity]);

  // Dynamic options
  const medicineNames = useMemo(() => {
    const names = [...new Set(stockData.map((s) => s.product_name))].sort();
    return names;
  }, [stockData]);

  const availableDosages = useMemo(() => {
    if (!formData.medicineName) return [];
    return stockData
      .filter((s) => s.product_name === formData.medicineName && s.quantity > 0)
      .map((s) => s.dosage)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
  }, [formData.medicineName, stockData]);

  const maxAvailableQuantity = useMemo(() => {
    if (!formData.medicineName || !formData.dosage) return null;
    const item = stockData.find(
      (s) => s.product_name === formData.medicineName && s.dosage === formData.dosage
    );
    return item ? item.quantity : 0;
  }, [formData.medicineName, formData.dosage, stockData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.medicineName) newErrors.medicineName = "Medicine name is required";
    if (!formData.dosage) newErrors.dosage = "Dosage is required";
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = "Valid quantity is required";
    if (
      maxAvailableQuantity !== null &&
      parseInt(formData.quantity) > maxAvailableQuantity
    ) newErrors.quantity = `Only ${maxAvailableQuantity} available in stock`;
    if (!formData.frequency || formData.frequency.length === 0) newErrors.frequency = "Frequency is required";
    if (!formData.duration) newErrors.duration = "Duration is required";
    if (!formData.time) newErrors.time = "Time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (validateForm()) {
      onUpdate(formData);
      onClose();
    }
  };

  const frequencies = [
    "Morning", "Afternoon", "Evening", "Night"
  ];

  // Single Select Dropdown
  const Dropdown = useCallback(({ label, value, onChange, options, error, placeholder = "Select" }) => {
    const handleChange = (selectedValue) => {
      onChange(selectedValue);
    };

    return (
      <div>
        <label className="text-sm text-black dark:text-white font-helvetica">
          {label}
        </label>
        <Listbox value={value} onChange={handleChange}>
          <div className="relative mt-1 w-[228px]">
            <Listbox.Button 
              className={`w-full h-[32px] px-3 pr-8 rounded-[8px] border ${
                error ? "border-red-500" : "border-gray-300 dark:border-[#3A3A3A]"
              } bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px] focus:outline-none`}
            >
              <span className={value ? "" : "text-gray-500"}>
                {value || placeholder}
              </span>
              <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-[#0EFF7B]" />
              </span>
            </Listbox.Button>
            <Listbox.Options 
              className="absolute mt-1 w-full max-h-40 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A] no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {options.length > 0 ? (
                options.map((option, idx) => (
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
                ))
              ) : (
                <div className="py-2 px-3 text-sm text-gray-500 text-center">
                  {loading ? "Loading..." : "No options available"}
                </div>
              )}
            </Listbox.Options>
          </div>
        </Listbox>
        {error && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-[Helvetica]">
            {error}
          </p>
        )}
      </div>
    );
  }, [loading]);

  // Multi-Select Dropdown for Frequency
  const MultiSelectDropdown = useCallback(({ label, value, onChange, options, error, placeholder = "Select" }) => {
    const handleChange = (selectedValues) => {
      onChange(selectedValues);
    };

    return (
      <div>
        <label className="text-sm text-black dark:text-white font-helvetica">
          {label}
        </label>
        <Listbox value={value} onChange={handleChange} multiple>
          <div className="relative mt-1 w-[228px]">
            <Listbox.Button 
              className={`w-full min-h-[32px] px-3 pr-8 rounded-[8px] border ${
                error ? "border-red-500" : "border-gray-300 dark:border-[#3A3A3A]"
              } bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px] focus:outline-none flex items-center`}
            >
              <span className={`${value.length > 0 ? "" : "text-gray-500"} truncate`}>
                {value.length > 0 ? value.join(", ") : placeholder}
              </span>
              <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-[#0EFF7B]" />
              </span>
            </Listbox.Button>
            <Listbox.Options 
              className="absolute mt-1 w-full max-h-40 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A] no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {options.length > 0 ? (
                options.map((option, idx) => (
                  <Listbox.Option
                    key={idx}
                    value={option}
                    className={({ active, selected }) =>
                      `cursor-pointer select-none py-2 px-3 text-sm rounded-md flex items-center ${
                        active
                          ? "bg-gray-100 dark:bg-[#0EFF7B1A] text-black dark:text-[#0EFF7B]"
                          : "text-black dark:text-white"
                      } ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className={`mr-2 ${selected ? "text-[#0EFF7B]" : "opacity-0"}`}>
                          {selected ? "✓" : ""}
                        </span>
                        {option}
                      </>
                    )}
                  </Listbox.Option>
                ))
              ) : (
                <div className="py-2 px-3 text-sm text-gray-500 text-center">
                  No options available
                </div>
              )}
            </Listbox.Options>
          </div>
        </Listbox>
        {error && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-[Helvetica]">
            {error}
          </p>
        )}
      </div>
    );
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
      <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
        <div className="w-[505px] h-auto rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative font-[Helvetica]">
          {/* Header */}
          <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-black dark:text-white font-medium text-[16px]">
              Edit Medicine Allocation
            </h2>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#0EFF7B33] transition"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading stock data...
            </div>
          ) : (
            <>
              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <Dropdown
                  label="Medicine Name"
                  value={formData.medicineName}
                  onChange={(val) => {
                    handleInputChange("medicineName", val);
                    handleInputChange("dosage", ""); // Reset dosage
                    handleInputChange("quantity", ""); // Reset quantity
                  }}
                  options={medicineNames}
                  error={errors.medicineName}
                  placeholder="Select medicine"
                />

                <Dropdown
                  label="Dosage"
                  value={formData.dosage}
                  onChange={(val) => handleInputChange("dosage", val)}
                  options={availableDosages}
                  error={errors.dosage}
                  placeholder={
                    formData.medicineName ? "Select dosage" : "First select medicine"
                  }
                />

                <div>
                  <label className="text-sm text-black dark:text-white font-[Helvetica]">
                    Quantity{" "}
                    {maxAvailableQuantity !== null && (
                      <span className="text-xs text-gray-500">(Max: {maxAvailableQuantity})</span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    readOnly
                    className={`w-full h-[32px] px-3 rounded-[8px] border ${
                      errors.quantity
                        ? "border-red-500"
                        : "border-gray-300 dark:border-[#3A3A3A]"
                    } bg-gray-200 dark:bg-gray-800 text-black dark:text-white text-[14px] focus:outline-none cursor-not-allowed`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-calculated based on frequency and duration
                  </p>
                  {errors.quantity && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      {errors.quantity}
                    </p>
                  )}
                </div>

                <MultiSelectDropdown
                  label="Frequency"
                  value={formData.frequency}
                  onChange={(val) => handleInputChange("frequency", val)}
                  options={frequencies}
                  error={errors.frequency}
                />

                {/* Duration as Input Field */}
                <div>
                  <label className="text-sm text-black dark:text-white font-[Helvetica]">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    placeholder="e.g. 5 days"
                    className={`w-full h-[32px] px-3 rounded-[8px] border ${
                      errors.duration
                        ? "border-red-500"
                        : "border-gray-300 dark:border-[#3A3A3A]"
                    } bg-gray-100 dark:bg-transparent text-black dark:text-white text-[14px] focus:outline-none`}
                  />
                  {errors.duration && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      {errors.duration}
                    </p>
                  )}
                </div>

                {/* Time as Input Field */}
                <div>
                  <label className="text-sm text-black dark:text-white font-[Helvetica]">
                    Time
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    placeholder="e.g. 8:00 AM"
                    className={`w-full h-[32px] px-3 rounded-[8px] border ${
                      errors.time
                        ? "border-red-500"
                        : "border-gray-300 dark:border-[#3A3A3A]"
                    } bg-gray-100 dark:bg-transparent text-black dark:text-white text-[14px] focus:outline-none`}
                  />
                  {errors.time && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      {errors.time}
                    </p>
                  )}
                </div>
              </div>

              {/* Stock Info */}
              {formData.medicineName && formData.dosage && maxAvailableQuantity !== null && (
                <div className="mt-4 p-3 bg-gray-200 dark:bg-gray-800 rounded-[8px] text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-black dark:text-white">
                      Available stock for {formData.medicineName} ({formData.dosage}):
                    </span>
                    <span className={`font-semibold ${maxAvailableQuantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {maxAvailableQuantity} units
                    </span>
                  </div>
                  {parseInt(formData.quantity) > maxAvailableQuantity && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      Warning: Requested quantity ({formData.quantity}) exceeds available stock!
                    </p>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={onClose}
                  className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[14px] hover:bg-gray-100 dark:hover:bg-[#0EFF7B1A] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium text-[14px] border-b-2 border-[#0EFF7B] hover:scale-105 transition shadow-md"
                >
                  Update
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditMedicineAllocationPopup;