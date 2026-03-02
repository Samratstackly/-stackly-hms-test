import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { successToast, errorToast } from "../../components/Toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../utils/axiosConfig"; // Import axios config

const EditDoctorNursePopup = ({ onClose, profile, onUpdate }) => {
  // Safety: Close if no profile
  useEffect(() => {
    if (!profile) {
      errorToast("Profile data is missing");
      onClose();
    }
  }, [profile, onClose]);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    specialization: "",
    date_of_joining: "",
    status: "Active"
  });

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [formatErrors, setFormatErrors] = useState({});

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

  // Real-time format validation functions
  const validateFieldFormat = (field, value) => {
    switch (field) {
      case "full_name":
  if (value.length < 2) return "Full name must be at least 2 characters";
  if (value.length > 100) return "Full name cannot exceed 100 characters";
  // Basic check for obviously invalid characters
  if (/[<>\[\]{}\|\\^~`]/.test(value)) return "Full name contains invalid characters";
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

  // Helper to determine which error to show
  const getFieldError = (field) => {
    // Show format errors in real-time
    if (formatErrors[field]) {
      return formatErrors[field];
    }
    
    // Show required errors only on form submission
    return errors[field] || "";
  };

  // Fetch departments + prefill
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // Use axios instead of fetch
        const response = await api.get("/departments/");
        if (response.status === 200) {
          setDepartments(response.data); // [{id, name}, ...]
        }
      } catch (err) {
        console.error("Failed to load departments", err);
        // You can show error toast if needed
        // errorToast("Failed to load departments");
      }
    };

    fetchDepartments();

    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        department: profile.department || "",
        designation: profile.designation || "",
        specialization: profile.specialization || "",
        date_of_joining: profile.date_of_joining || "",
        status: profile.status || "Active"
      });
    }
  }, [profile]);

  // Validate form on submission
  const validateForm = () => {
  const newErrors = {};

  // Name validation - Updated to accept international characters
  if (!formData.full_name.trim()) {
    newErrors.full_name = "Full name is required";
  } else if (formData.full_name.trim().length < 2) {
    newErrors.full_name = "Name must be at least 2 characters";
  } else if (formData.full_name.trim().length > 100) {
    newErrors.full_name = "Name cannot exceed 100 characters";
  } else if (/[<>\[\]{}\|\\^~`]/.test(formData.full_name)) {
    newErrors.full_name = "Full name contains invalid characters";
  }

  // Phone validation - EXACTLY 10 digits
  if (!formData.phone.trim()) {
    newErrors.phone = "Phone number is required";
  } else if (!/^\d{10}$/.test(formData.phone)) {
    newErrors.phone = "Phone must be exactly 10 digits";
  }

  // Email validation - REQUIRED
  if (!formData.email.trim()) {
    newErrors.email = "Email address is required";
  } else {
    const emailError = validateEmailFormat(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }
  }

  // Designation validation
  if (!formData.designation) {
    newErrors.designation = "Role is required";
  }

  // Department validation
  if (!formData.department) {
    newErrors.department = "Department is required";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleUpdate = async () => {
    if (!validateForm()) return;

    if (!profile?.id) {
      errorToast("Invalid profile");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("full_name", formData.full_name.trim());
      formDataToSend.append("email", formData.email.trim());
      formDataToSend.append("phone", formData.phone);

      const dept = departments.find(d => d.name === formData.department);
      if (dept) formDataToSend.append("department_id", dept.id);

      if (formData.designation) formDataToSend.append("designation", formData.designation);
      if (formData.specialization) formDataToSend.append("specialization", formData.specialization);
      if (formData.status) formDataToSend.append("status", formData.status);

      if (formData.date_of_joining) {
        let date = formData.date_of_joining;
        if (date.includes('-')) {
          const [y, m, d] = date.split('-');
          date = `${m}/${d}/${y}`;
        }
        formDataToSend.append("date_of_joining", date);
      }

      // Use axios for the API call
      const response = await api.put(`/staff/update/${profile.id}/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        const updatedStaff = response.data;
        successToast("Profile updated successfully");
        onUpdate(updatedStaff);
        onClose();
      } else {
        let msg = "Failed to update profile";
        try {
          msg = response.data?.detail || msg;
        } catch {}
        errorToast(msg);
      }
    } catch (error) {
      console.error("Update error:", error);
      
      // Handle axios error response
      if (error.response) {
        // Server responded with an error status
        const errorMessage = error.response.data?.detail || 
                            error.response.data?.message || 
                            "Failed to update profile";
        errorToast(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        errorToast("Network error. Please check your connection.");
      } else {
        // Something else happened
        errorToast("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Full Name Change - Auto-capitalize
  const handleFullNameChange = (e) => {
    let value = e.target.value;
    
    // Auto-capitalize first letter of each word
    if (value) {
      value = value.replace(/\b\w/g, char => char.toUpperCase());
    }
    
    setFormData({ ...formData, full_name: value });
    
    // Clear required error when user starts typing
    if (errors.full_name) {
      setErrors(prev => ({ ...prev, full_name: "" }));
    }
    
    // Real-time format validation
    const formatError = validateFieldFormat("full_name", value);
    if (formatError) {
      setFormatErrors(prev => ({ ...prev, full_name: formatError }));
    } else {
      setFormatErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.full_name;
        return newErrors;
      });
    }
  };

  // Handle Phone Change
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
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

  const roles = ["Doctor", "Nurse", "Staff"];
  const statuses = ["Available", "Unavailable", "On Leave"];

  const Dropdown = ({ label, value, onChange, options, error }) => (
    <div>
      <label className="text-sm text-black dark:text-white">{label}</label>
      <Listbox value={value || "Select"} onChange={onChange}>
        <div className="relative mt-1 w-[228px]">
          <Listbox.Button className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-[#08994A] dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]">
            {value || "Select"}
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]" />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 w-full max-h-60 rounded-[12px] bg-gray-100 dark:bg-black shadow-lg  border border-[#0EFF7B] dark:border-[#3A3A3A] overflow-auto z-50">
            {options.map((opt, i) => (
              <Listbox.Option
                key={i}
                value={opt}
                className={({ active, selected }) =>
                  `cursor-pointer py-2 px-2 text-sm ${active ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33]" : ""} ${selected ? "font-medium text-[#08994A] dark:text-[#0EFF7B]" : "text-black dark:text-white"}`
                }
              >
                {opt}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
      {error && <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes('/')) {
      const [m, d, y] = dateStr.split('/');
      return new Date(y, m - 1, d);
    }
    return new Date(dateStr);
  };

  if (!profile) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[9990] font-[Helvetica]">
      <div className="w-[504px] h-[520px] rounded-[20px] bg-gray-100 dark:bg-[#000000E5] p-6 relative overflow-hidden">
        <div style={{ position: "absolute", inset: 0, borderRadius: "20px", padding: "2px", background: "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", pointerEvents: "none" }}></div>

        <div className="flex justify-between items-center pb-3 mb-4 relative z-10">
          <h3 className="font-medium text-[16px]">Edit Doctor/Nurse</h3>
          <button onClick={onClose} disabled={loading} className="w-6 h-6 rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] flex items-center justify-center hover:bg-[#0EFF7B33]">
            <X size={16} className="text-[#08994A] dark:text-white" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 relative z-10">
          {/* Full Name */}
          <div>
            <label className="text-sm">Full Name <span className="text-red-500">*</span></label>
            <input
              value={formData.full_name}
              onChange={handleFullNameChange}
              onBlur={() => {
                // Trim whitespace on blur
                if (formData.full_name) {
                  setFormData(prev => ({ 
                    ...prev, 
                    full_name: prev.full_name.trim() 
                  }));
                }
                handleBlur("full_name");
              }}
              placeholder="Enter full name"
              disabled={loading}
              className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-[#08994A] dark:text-[#0EFF7B] outline-none disabled:opacity-50"
            />
            {getFieldError("full_name") && (
              <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                {getFieldError("full_name")}
              </p>
            )}
          </div>

          {/* Role */}
          <Dropdown 
            label={<span>Role <span className="text-red-500">*</span></span>}
            value={formData.designation} 
            onChange={v => {
              setFormData({ ...formData, designation: v });
              if (errors.designation) {
                setErrors(prev => ({ ...prev, designation: "" }));
              }
            }} 
            options={roles} 
            error={errors.designation}
          />

          {/* Department */}
          <Dropdown 
            label={<span>Department <span className="text-red-500">*</span></span>}
            value={formData.department} 
            onChange={v => {
              setFormData({ ...formData, department: v });
              if (errors.department) {
                setErrors(prev => ({ ...prev, department: "" }));
              }
            }} 
            options={departments.map(d => d.name)} 
            error={errors.department}
          />
          
          {/* Specialization */}
          <div>
            <label className="text-sm">Specialization</label>
            <input
              value={formData.specialization}
              onChange={e => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="Enter specialization"
              disabled={loading}
              className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-[#08994A] dark:text-[#0EFF7B] outline-none disabled:opacity-50"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm">Phone Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              onBlur={() => handleBlur("phone")}
              placeholder="Enter phone"
              maxLength="10"
              disabled={loading}
              className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-[#08994A] dark:text-[#0EFF7B] outline-none disabled:opacity-50"
            />
            {getFieldError("phone") && (
              <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                {getFieldError("phone")}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm">Email <span className="text-red-500">*</span></label>
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
              placeholder="Enter email"
              disabled={loading}
              className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-[#08994A] dark:text-[#0EFF7B] outline-none disabled:opacity-50"
            />
            {getFieldError("email") && (
              <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                {getFieldError("email")}
              </p>
            )}
          </div>

          {/* Joining Date */}
          <div>
            <label className="text-sm">Joining Date</label>
            <div className="relative">
              <DatePicker
                selected={formatDateForDisplay(formData.date_of_joining)}
                onChange={date => {
                  const formatted = date ? `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}` : "";
                  setFormData({ ...formData, date_of_joining: formatted });
                }}
                dateFormat="MM/dd/yyyy"
                placeholderText="MM/DD/YYYY"
                disabled={loading}
                className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-[#08994A] dark:text-[#0EFF7B] outline-none"
                wrapperClassName="w-full"
                popperClassName="z-[9999]"
              />
              <div className="absolute right-3 top-2.5 pointer-events-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#08994A] dark:text-[#0EFF7B]">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>
          </div>

          {/* Status */}
          <Dropdown 
            label="Status" 
            value={formData.status} 
            onChange={v => setFormData({ ...formData, status: v })} 
            options={statuses} 
          />
        </div>

        <div className="flex justify-center gap-4 mt-8 relative">
          <button onClick={onClose} disabled={loading} className="w-[104px] h-[33px] rounded-[8px] border border-[#0EFF7B] bg-gray-100 dark:bg-transparent text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            style={{ background: "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)" }}
            className="w-[104px] h-[33px] rounded-[8px] border-b-[2px] border-[#0EFF7B66] text-white hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDoctorNursePopup;