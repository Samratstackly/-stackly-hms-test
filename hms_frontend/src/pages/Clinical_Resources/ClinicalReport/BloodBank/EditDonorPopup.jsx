import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { Listbox } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { successToast, errorToast } from "../../../../components/Toast.jsx";
import api from "../../../../utils/axiosConfig"; // Cookie-based axios instance

const EditDonorPopup = ({ onClose, donor, onUpdate }) => {
  const [formData, setFormData] = useState({
    donor_name: "",
    phone: "",
    email: "",
    gender: "",
    blood_type: "",
    last_donation_date: null,
  });

  const [errors, setErrors] = useState({});
  const [formatErrors, setFormatErrors] = useState({}); // Real-time format errors
  const [loading, setLoading] = useState(false);

  // Levenshtein distance for typo detection
  const levenshtein = (a, b) => {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
      Array.from({ length: a.length + 1 }, (_, j) =>
        i === 0 ? j : j === 0 ? i : 0
      )
    );

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] =
          b[i - 1] === a[j - 1]
            ? matrix[i - 1][j - 1]
            : Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              );
      }
    }
    return matrix[b.length][a.length];
  };

  // Safe date conversion function
  const safeDate = (dateValue) => {
    if (!dateValue) return null;
    try {
      // If it's already a Date object, return it
      if (dateValue instanceof Date && !isNaN(dateValue)) {
        return dateValue;
      }
      // Handle different date formats
      let date;
      // Handle YYYY-MM-DD format (from backend)
      if (typeof dateValue === 'string' && dateValue.includes("-")) {
        date = new Date(dateValue);
      }
      // Handle MM/DD/YYYY format (from frontend display)
      else if (typeof dateValue === 'string' && dateValue.includes("/")) {
        const [month, day, year] = dateValue.split("/");
        date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      }
      // Try direct parsing as last resort
      else {
        date = new Date(dateValue);
      }
      // Check if the date is valid
      return date instanceof Date && !isNaN(date) ? date : null;
    } catch (error) {
      console.error("Date conversion error:", error, "for date:", dateValue);
      return null;
    }
  };

  // Initialize formData when donor changes
  useEffect(() => {
    if (donor) {
      console.log("🟡 EditDonorPopup received donor:", donor);
      // Map display keys to API keys and convert date safely
      const donationDate = safeDate(donor.last_donation_date || donor.lastDonation);
      setFormData({
        donor_name: donor.donor_name || donor.name || "",
        phone: donor.phone || "",
        email: donor.email || "",
        gender: donor.gender || "",
        blood_type: donor.blood_type || donor.blood || "",
        last_donation_date: donationDate,
      });
    }
  }, [donor]);

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date)) return null;
    return date.toISOString().split("T")[0];
  };

  // Enhanced email validation
  const validateEmailFormat = (value) => {
    const email = value.trim();
    if (!email) return "";

    // 1️⃣ Basic structure check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address (e.g., user@domain.com)";
    }

    // 2️⃣ Suspicious formatting
    if (email.includes("..") || email.includes(".@") || email.includes("@.")) {
      return "Invalid email format";
    }

    const [localPart, domain] = email.toLowerCase().split("@");

    // 3️⃣ Local-part sanity
    if (localPart.length < 2) {
      return "Email username is too short";
    }

    if (/(.)\1{5,}/.test(localPart)) {
      return "Email appears to be invalid";
    }

    if (/(\.\.|__|--|\+\+)/.test(localPart)) {
      return "Email contains invalid characters";
    }

    // 4️⃣ Disposable / fake domains (hard block)
    const invalidDomains = [
      "email.com",
      "example.com",
      "test.com",
      "domain.com",
      "mailinator.com",
      "tempmail.com",
      "guerrillamail.com",
      "10minutemail.com",
      "yopmail.com",
      "fakeemail.com",
      "temp-mail.org",
      "throwawayemail.com",
      "dispostable.com",
      "maildrop.cc"
    ];

    if (invalidDomains.includes(domain)) {
      return "Disposable or invalid email domains are not allowed";
    }

    // 5️⃣ Dynamic typo detection for major providers
    const providers = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "icloud.com"
    ];

    for (const provider of providers) {
      const distance = levenshtein(domain, provider);

      // distance 1–2 = very likely a typo
      if (distance > 0 && distance <= 2) {
        return `Did you mean ${localPart}@${provider}?`;
      }
    }

    // 6️⃣ TLD sanity (not restrictive)
    const tld = domain.split(".").pop();
    if (tld.length < 2) {
      return "Please use a valid domain extension";
    }

    return "";
  };

  // Real-time format validation functions (for typing)
  const validateFieldFormat = (field, value) => {
    switch (field) {
      case "donor_name":
        if (!value) return "";
        if (!/^[A-Za-z\s]*$/.test(value)) {
          return "Name can only contain letters and spaces";
        }
        return "";
      
      case "phone":
        if (!value) return "";
        if (!/^\d*$/.test(value)) {
          return "Phone must contain only digits";
        }
        if (value.length > 10) {
          return "Phone cannot exceed 10 digits";
        }
        // Show error while typing if less than 10 digits
        if (value.length > 0 && value.length < 10) {
          return "Phone must be exactly 10 digits";
        }
        return "";
      
      case "email":
        return validateEmailFormat(value);
      
      default:
        return "";
    }
  };

  // Enhanced form validation
  const validateForm = () => {
    const newErrors = {};

    // Name validation - only letters and spaces
    if (!formData.donor_name.trim()) {
      newErrors.donor_name = "Donor name is required";
    } else if (formData.donor_name.trim().length < 2) {
      newErrors.donor_name = "Name must be at least 2 characters";
    } else if (!/^[A-Za-z\s]+$/.test(formData.donor_name)) {
      newErrors.donor_name = "Name can only contain letters and spaces";
    }

    // Phone validation - EXACTLY 10 digits
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    // Email validation - NOW REQUIRED
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else {
      const emailError = validateEmailFormat(formData.email);
      if (emailError) {
        newErrors.email = emailError;
      }
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // Blood type validation
    if (!formData.blood_type) {
      newErrors.blood_type = "Blood type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Prepare data for backend - match the updated DonorSchema
      const updateData = {
        donor_name: formData.donor_name.trim(),
        phone: formData.phone,
        email: formData.email.trim() || null,
        gender: formData.gender,
        blood_type: formData.blood_type,
        last_donation_date: formatDateForAPI(formData.last_donation_date),
      };
      console.log("🟡 Sending update data:", updateData);
      
      const response = await api.put(`/api/donors/${donor.id}`, updateData);
      
      successToast("Donor updated successfully!");
     
      if (onUpdate) {
        onUpdate(response.data);
      }
     
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      let errorMessage = "Failed to update donor";
      
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = "Session expired. Please login again.";
        } else if (error.response.status === 400) {
          const result = error.response.data;
          if (result.detail) {
            errorMessage = Array.isArray(result.detail)
              ? result.detail
                  .map((e) => `${e.loc?.join(" → ")}: ${e.msg}`)
                  .join("\n")
              : result.detail;
          } else {
            errorMessage = "Invalid donor data. Please check all fields.";
          }
        } else if (error.response.status === 404) {
          errorMessage = "Donor not found.";
        } else if (error.response.status === 409) {
          errorMessage = error.response.data?.detail || "Email already exists";
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
  };

  // Handle Donor Name Change - Auto-capitalize
  const handleDonorNameChange = (e) => {
    let value = e.target.value;
    
    // Auto-capitalize first letter of each word
    if (value) {
      value = value.replace(/\b\w/g, char => char.toUpperCase());
    }
    
    setFormData({ ...formData, donor_name: value });
    
    // Clear required error when user starts typing
    if (errors.donor_name) {
      setErrors(prev => ({ ...prev, donor_name: "" }));
    }
    
    // Real-time format validation
    const formatError = validateFieldFormat("donor_name", value);
    if (formatError) {
      setFormatErrors(prev => ({ ...prev, donor_name: formatError }));
    } else {
      setFormatErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.donor_name;
        return newErrors;
      });
    }
  };

  // Handle Phone Change
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, phone: value });
    
    // Clear required error when user starts typing
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: "" }));
    }
    
    // Real-time format validation
    const formatError = validateFieldFormat("phone", value);
    if (formatError) {
      setFormatErrors(prev => ({ ...prev, phone: formatError }));
    } else {
      setFormatErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  // Handle Email Change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    
    // Clear required error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: "" }));
    }
    
    // Real-time format validation
    const formatError = validateFieldFormat("email", value);
    if (formatError) {
      setFormatErrors(prev => ({ ...prev, email: formatError }));
    } else {
      setFormatErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  // Handle Blur - final validation
  const handleBlur = (field) => {
    // Perform final format validation on blur
    const value = formData[field];
    const formatError = validateFieldFormat(field, value);
    
    if (formatError) {
      setFormatErrors(prev => ({ ...prev, [field]: formatError }));
    }
  };

  // Helper to determine which error to show
  const getFieldError = (field) => {
    // Show format errors in real-time
    if (formatErrors[field]) {
      return formatErrors[field];
    }
    
    // Show required errors only on form submission
    return errors[field] || "";
  };

  const genders = ["Male", "Female", "Other"];
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const Dropdown = ({ label, value, onChange, options, error }) => (
    <div>
      <label className="text-sm text-black dark:text-white">{label}</label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1 w-[228px]">
          <Listbox.Button
            className="w-full h-[32px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
            bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]
            focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] disabled:opacity-50"
            disabled={loading}
          >
            <span className="block truncate">{value || "Select"}</span>
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-[#0EFF7B]" />
            </span>
          </Listbox.Button>
          <Listbox.Options
            className="absolute mt-1 w-full max-h-40 overflow-auto rounded-[8px] bg-gray-100 dark:bg-[#1a1a1a]
            shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A]"
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
                  `cursor-pointer select-none py-2 px-3 text-sm ${
                    active
                      ? "bg-gray-100 dark:bg-[#0EFF7B1A] text-black dark:text-[#0EFF7B]"
                      : "text-black dark:text-white"
                  } ${selected ? "font-medium" : ""}`
                }
                disabled={loading}
              >
                {({ selected }) => (
                  <span className={selected ? "text-[#0EFF7B] dark:text-[#0EFF7B]" : ""}>
                    {option}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
      {error && (
        <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">{error}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
      <div className="rounded-[20px] p-[1px] backdrop-blur-md bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70">
        <div className="w-[505px] h-auto rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative">
          {/* Header */}
          <div className="flex justify-between items-center pb-3 mb-4">
            <h2 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
              Edit Donor
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A]
              bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center
              hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>
          
          {/* Current Status Display (Read-only) */}
          {donor?.status && (
            <div className="mb-4 p-3 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Current Status:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  donor.status === "Eligible"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                }`}>
                  {donor.status}
                </span>
              </div>
              {donor.last_donation_date && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Last donation: {donor.last_donation_date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              )}
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">
                Status is automatically calculated based on donation dates
              </p>
            </div>
          )}
          
          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-6">
            {/* Donor Name */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Donor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.donor_name}
                onChange={handleDonorNameChange}
                onBlur={() => {
                  // Trim whitespace on blur
                  if (formData.donor_name) {
                    setFormData(prev => ({ 
                      ...prev, 
                      donor_name: prev.donor_name.trim() 
                    }));
                  }
                  handleBlur("donor_name");
                }}
                disabled={loading}
                className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
                bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none
                focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] disabled:opacity-50"
                placeholder="Enter donor name"
              />
              {getFieldError("donor_name") && (
                <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                  {getFieldError("donor_name")}
                </p>
              )}
            </div>
            
            {/* Phone */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                maxLength={10}
                onChange={handlePhoneChange}
                onBlur={() => handleBlur("phone")}
                disabled={loading}
                className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
                bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none
                focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] disabled:opacity-50"
                placeholder="Enter phone number"
              />
              {getFieldError("phone") && (
                <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                  {getFieldError("phone")}
                </p>
              )}
            </div>
            
            {/* Email */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                onBlur={() => {
                  // Trim whitespace on blur
                  if (formData.email) {
                    setFormData(prev => ({ 
                      ...prev, 
                      email: prev.email.trim() 
                    }));
                  }
                  handleBlur("email");
                }}
                disabled={loading}
                className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
                bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none
                focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] disabled:opacity-50"
                placeholder="Enter email address"
              />
              {getFieldError("email") && (
                <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                  {getFieldError("email")}
                </p>
              )}
            </div>
            
            {/* Gender */}
            <Dropdown
              label={<span>Gender <span className="text-red-500">*</span></span>}
              value={formData.gender}
              onChange={(val) => {
                setFormData({ ...formData, gender: val });
                if (errors.gender) {
                  setErrors(prev => ({ ...prev, gender: "" }));
                }
              }}
              options={genders}
              error={errors.gender}
            />
            
            {/* Blood Type */}
            <Dropdown
              label={<span>Blood Type <span className="text-red-500">*</span></span>}
              value={formData.blood_type}
              onChange={(val) => {
                setFormData({ ...formData, blood_type: val });
                if (errors.blood_type) {
                  setErrors(prev => ({ ...prev, blood_type: "" }));
                }
              }}
              options={bloodTypes}
              error={errors.blood_type}
            />
            
            {/* Last Donation Date */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Last Donation Date (Optional)
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.last_donation_date}
                  onChange={(date) => {
                    setFormData({ ...formData, last_donation_date: date });
                  }}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select date"
                  maxDate={new Date()}
                  disabled={loading}
                  className="w-[228px] h-[32px] mt-1 px-3 pr-10 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
                           bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none
                           focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] disabled:opacity-50"
                  wrapperClassName="w-full"
                  popperClassName="z-50"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={15}
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
            </div>
          </div>
          
          {/* Information Note */}
          <div className="mt-4 p-3 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Status is automatically calculated based on the last donation date.
              Donors become "Eligible" 6 months after their last donation.
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
              bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium
              hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-[144px] h-[32px] border-b-[2px] border-[#0EFF7B] rounded-[8px]
              bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium
              hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                "Update Donor"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDonorPopup;