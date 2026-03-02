import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Listbox } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { successToast, errorToast } from "../../../../components/Toast.jsx";
import api from "../../../../utils/axiosConfig";

const AddDonorPopup = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    donor_name: "",
    phone: "",
    email: "",
    gender: "",
    blood_type: "",
    last_donation_date: null,
  });

  const [errors, setErrors] = useState({});           // Submit-time errors
  const [formatErrors, setFormatErrors] = useState({}); // Real-time format errors
  const [loading, setLoading] = useState(false);

  // Format date → YYYY-MM-DD for API
  const formatDateForAPI = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date)) return null;
    return date.toISOString().split("T")[0];
  };

  // List of blocked disposable/fake domains
  const blockedDomains = [
    "mailinator.com",
    "tempmail.com",
    "yopmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "throwawaymail.com",
    "fakeemail.com",
    "temp-mail.org",
    "dispostable.com",
    "maildrop.cc",
    "example.com",
    "test.com",
    "domain.com",
    "fake.com",
    "dummy.com",
    "123.com",
    "123.in"
  ];

  // Real-time email validation (blocks invalid domains)
  const validateEmailFormat = (value) => {
    const email = value.trim().toLowerCase();
    if (!email) return "";

    // 1. Basic RFC-like structure
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address (e.g., name@company.com)";
    }

    const [, domain] = email.split("@");
    const domainParts = domain.split(".");

    // 2. Block purely numeric domains
    if (/^\d+$/.test(domainParts[0])) {
      return "Invalid domain name - domain cannot be purely numeric";
    }

    // 3. TLD must be alphabetic and at least 2 chars
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
      return "Invalid domain name - please use a valid email domain";
    }

    // 4. Block known disposable/fake domains
    if (blockedDomains.some(d => domain === d || domain.endsWith("." + d))) {
      return "Invalid domain name - disposable or fake email not allowed";
    }

    // 5. Suspicious length or patterns
    if (domain.length < 5) {
      return "Domain name is too short";
    }

    if (domain.includes("..") || domain.includes(".@") || domain.includes("@.")) {
      return "Invalid email format";
    }

    return "";
  };

  // Real-time format validation for all fields
  const validateFieldFormat = (field, value) => {
    switch (field) {
      case "donor_name":
        if (!value) return "";
        if (/[0-9]/.test(value)) return "Name should not contain numbers";
        if (value.trim() && !/^[A-Za-z\s.'-]{2,}$/.test(value)) {
          return "Please enter a valid name";
        }
        return "";

      case "phone":
        if (!value) return "";
        if (!/^\d*$/.test(value)) return "Phone must contain only digits";
        if (value.length > 10) return "Phone cannot exceed 10 digits";
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

  // Full form validation on submit
  const validateForm = () => {
    const newErrors = {};

    // Donor Name
    if (!formData.donor_name.trim()) {
      newErrors.donor_name = "Donor name is required";
    } else if (formData.donor_name.trim().length < 2) {
      newErrors.donor_name = "Name must be at least 2 characters";
    } else if (!/^[A-Za-z\s]+$/.test(formData.donor_name.trim())) {
      newErrors.donor_name = "Name can only contain letters and spaces";
    }

    // Phone - exactly 10 digits
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    // Email - required + valid domain
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else {
      const emailError = validateEmailFormat(formData.email);
      if (emailError) {
        newErrors.email = emailError;
      }
    }

    // Gender & Blood Type
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.blood_type) newErrors.blood_type = "Blood type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      errorToast("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    const payload = {
      donor_name: formData.donor_name.trim(),
      gender: formData.gender,
      blood_type: formData.blood_type,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      last_donation_date: formatDateForAPI(formData.last_donation_date),
    };

    try {
      const response = await api.post("/api/donors/add", payload);

      if (response.status === 201 || response.status === 200) {
        successToast("Donor added successfully!");
        onClose();
        if (typeof onAdd === "function") onAdd();
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Add donor error:", error);

      let errorMessage = "Failed to add donor";

      if (error.response) {
        if (error.response.status === 400) {
          const result = error.response.data;
          if (result.detail) {
            if (typeof result.detail === "string") {
              errorMessage = result.detail;
            } else if (Array.isArray(result.detail)) {
              errorMessage = result.detail.map(e => e.msg || e).join("\n");
            }
          } else if (result.email) {
            errorMessage = result.email[0] || "Invalid email address";
          }
        } else if (error.response.status === 409) {
          errorMessage = "Donor with this phone or email already exists";
        }
      }

      errorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle changes with real-time validation
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear submit-time error when typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Real-time format validation
    const formatError = validateFieldFormat(field, value);
    setFormatErrors(prev => {
      const newErrors = { ...prev };
      if (formatError) {
        newErrors[field] = formatError;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  const genders = ["Male", "Female", "Other"];
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
      <div className="rounded-[20px] p-[1px] backdrop-blur-md bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70">
        <div className="w-[505px] bg-gray-100 dark:bg-[#000000] p-6 rounded-[19px] relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-black dark:text-white font-medium text-[16px]">
              Add New Donor
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6">
              {/* Donor Name */}
              <div>
                <label className="text-sm text-black dark:text-white">
                  Donor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.donor_name}
                  onChange={(e) => handleChange("donor_name", e.target.value)}
                  placeholder="Enter full name"
                  disabled={loading}
                  className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] disabled:opacity-50"
                />
                {formatErrors.donor_name && (
                  <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                    {formatErrors.donor_name}
                  </p>
                )}
                {errors.donor_name && !formatErrors.donor_name && (
                  <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                    {errors.donor_name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm text-black dark:text-white">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  disabled={loading}
                  className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] disabled:opacity-50"
                />
                {formatErrors.phone && (
                  <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                    {formatErrors.phone}
                  </p>
                )}
                {errors.phone && !formatErrors.phone && (
                  <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-black dark:text-white">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="example@company.com"
                  disabled={loading}
                  className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] disabled:opacity-50"
                />
                {formatErrors.email && (
                  <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                    {formatErrors.email}
                  </p>
                )}
                {errors.email && !formatErrors.email && (
                  <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Gender Dropdown - FIXED */}
              <div className="relative">
                <label className="text-sm text-black dark:text-white">
                  Gender <span className="text-red-500">*</span>
                </label>
                <Listbox
                  value={formData.gender}
                  onChange={(val) => handleChange("gender", val)}
                  disabled={loading}
                >
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-[228px] h-[32px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-sm focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] disabled:opacity-50">
                      <span className="block truncate">
                        {formData.gender || "Select Gender"}
                      </span>
                      <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-[#0EFF7B]" />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-50 mt-1 w-full max-h-40 overflow-auto rounded-[8px] bg-gray-100 dark:bg-[#1a1a1a] shadow-lg border border-gray-300 dark:border-[#3A3A3A]">
                      {genders.map((g) => (
                        <Listbox.Option
                          key={g}
                          value={g}
                          className={({ active }) =>
                            `cursor-pointer select-none py-2 px-3 text-sm ${
                              active ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]" : "text-black dark:text-white"
                            }`
                          }
                        >
                          {g}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
                {errors.gender && (
                  <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                    {errors.gender}
                  </p>
                )}
              </div>

              {/* Blood Type Dropdown - FIXED */}
              <div className="relative">
                <label className="text-sm text-black dark:text-white">
                  Blood Type <span className="text-red-500">*</span>
                </label>
                <Listbox
                  value={formData.blood_type}
                  onChange={(val) => handleChange("blood_type", val)}
                  disabled={loading}
                >
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-[228px] h-[32px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-sm focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] disabled:opacity-50">
                      <span className="block truncate">
                        {formData.blood_type || "Select Blood Type"}
                      </span>
                      <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-[#0EFF7B]" />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-50 mt-1 w-full max-h-40 overflow-auto rounded-[8px] bg-gray-100 dark:bg-[#1a1a1a] shadow-lg border border-gray-300 dark:border-[#3A3A3A]">
                      {bloodTypes.map((bt) => (
                        <Listbox.Option
                          key={bt}
                          value={bt}
                          className={({ active }) =>
                            `cursor-pointer select-none py-2 px-3 text-sm ${
                              active ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]" : "text-black dark:text-white"
                            }`
                          }
                        >
                          {bt}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
                {errors.blood_type && (
                  <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                    {errors.blood_type}
                  </p>
                )}
              </div>

              {/* Last Donation Date */}
              <div className="relative col-span-2">
                <label className="text-sm text-black dark:text-white">
                  Last Donation Date <span className="text-gray-500">(Optional)</span>
                </label>
                <DatePicker
                  selected={formData.last_donation_date}
                  onChange={(date) => setFormData({ ...formData, last_donation_date: date })}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select date"
                  maxDate={new Date()}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={15}
                  isClearable
                  disabled={loading}
                  className="w-full h-[32px] mt-1 px-3 pr-10 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] disabled:opacity-50"
                  wrapperClassName="w-full"
                  popperClassName="z-50"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-[144px] h-[32px] rounded-[8px] border-b-[2px] border-[#0EFF7B] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding...
                  </>
                ) : (
                  "Add Donor"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDonorPopup;