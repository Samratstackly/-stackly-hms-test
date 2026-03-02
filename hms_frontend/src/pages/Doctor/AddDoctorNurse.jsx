import { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { ChevronDown, Upload, ArrowLeft, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { successToast, errorToast } from "../../components/Toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../utils/axiosConfig"; // Import axios

const PhotoUploadBox = ({ photo, setPhoto, required = false }) => {
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        errorToast("File size exceeds 5MB limit. Please choose a smaller file.");
        e.target.value = ''; // Clear input to allow re-selection
        return;
      }
      
      // Check file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        errorToast("Invalid file type. Please upload JPG, JPEG, or PNG files only.");
        e.target.value = ''; // Clear input to allow re-selection
        return;
      }
      
      setPhoto({ file, preview: URL.createObjectURL(file) });
    }
  };

  return (
    <div className="flex flex-col items-center md:items-end">
      <input
        type="file"
        id="photoUpload"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={handlePhotoUpload}
      />
      <label
        htmlFor="photoUpload"
        className="border-2 border-dashed bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] border-[#0EFF7B] dark:border-[#0EFF7B] w-24 h-24 md:w-32 md:h-32 flex items-center justify-center text-gray-600 dark:text-gray-400 cursor-pointer rounded-lg overflow-hidden hover:border-[#0EFF7B] dark:hover:border-[#0EFF7B] hover:text-[#08994A] dark:hover:text-[#0EFF7B]"
      >
        {photo?.preview ? (
          <img
            src={photo.preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs md:text-sm flex items-center">
            + Add Photo 
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        )}
      </label>
      
      {/* Help text displayed below */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center md:text-right w-32 mr-2">
        Supported formats: JPG, JPEG, PNG<br />(Max 5MB)
      </p>
    </div>
  );
};

const CertificateUploadBox = ({ certificates, setCertificates, required = false }) => {
  const handleCertificateUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileObjects = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setCertificates((prev) => [...prev, ...fileObjects]);
  };

  const handleRemoveCertificate = (index) => {
    setCertificates((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1 w-full">
      <label className="text-sm text-black dark:text-white">
        Certificates
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="file"
        id="certificateUpload"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={handleCertificateUpload}
      />
      <label
        htmlFor="certificateUpload"
        className="border-[1px] border-[#0EFF7B] dark:border-[#3A3A3A] w-full h-10 md:h-[42px] flex items-center justify-center text-gray-600 dark:text-gray-400 cursor-pointer rounded-[8px] hover:border-[#0EFF7B] dark:hover:border-[#0EFF7B] hover:text-[#08994A] dark:hover:text-[#0EFF7B]"
      >
        <Upload size={16} className="mr-2 text-[#08994A] dark:text-[#0EFF7B]" />
        <span className="text-sm">Upload Certificates</span>
      </label>
      {certificates.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {certificates.map((cert, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <span>Certificate {index + 1}</span>
              <button
                onClick={() => handleRemoveCertificate(index)}
                className="text-red-500 hover:text-red-600 dark:hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dropdown = ({ label, value, onChange, options, required = false, error }) => (
  <div className="space-y-1 w-full">
    <label className="text-sm text-black dark:text-white">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="w-full h-10 md:h-[42px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-[#08994A] dark:text-[#0EFF7B] text-left text-sm md:text-[14px] leading-[16px]">
          {value || "Select"}
          <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]" />
          </span>
        </Listbox.Button>
        <Listbox.Options
          className="absolute mt-1 w-full rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] max-h-40 overflow-y-auto"
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
                `cursor-pointer select-none py-2 px-2 text-sm rounded-md ${
                  active
                    ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
                    : "text-black dark:text-white"
                } ${
                  selected
                    ? "font-medium text-[#08994A] dark:text-[#0EFF7B]"
                    : ""
                }`
              }
            >
              {option}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
    {error && <p className="mt-1 text-xs text-red-500 dark:text-red-500">{error}</p>}
  </div>
);

const DatePickerField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  maxDate = null
}) => {
  const selectedDate = (() => {
    if (!value) return null;
    const parts = value.split("/");
    if (parts.length !== 3) return null;
    const [month, day, year] = parts.map(Number);
    if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    )
      return null;
    return date;
  })();

  return (
    <div className="space-y-1 w-full">
      <label className="text-sm text-black dark:text-white">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            const formatted = date
              ? `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
                  date.getDate()
                ).padStart(2, "0")}/${date.getFullYear()}`
              : "";
            onChange({ target: { name, value: formatted } });
          }}
          dateFormat="MM/dd/yyyy"
          placeholderText={placeholder}
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={100}
          maxDate={maxDate}
          className="w-full h-10 md:h-[42px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-[#08994A] dark:text-[#0EFF7B] placeholder-gray-500 outline-none text-sm md:text-[14px] focus:ring-1 focus:ring-[#0EFF7B]"
          wrapperClassName="w-full"
          popperClassName="z-50"
        />
        <div className="absolute right-3 top-2.5 pointer-events-none">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#0EFF7B]"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-500">{error}</p>}
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  required = false,
  error,
  autoCapitalize = false
}) => {
  const handleChange = (e) => {
    let newValue = e.target.value;
    
    // Auto-capitalize first letter for name fields
    if (autoCapitalize && newValue && name.includes('name')) {
      // Capitalize first letter of each word (basic ASCII support; unicode may not capitalize fully)
      newValue = newValue.replace(/\b\w/g, char => char.toUpperCase());
    }
    
    onChange({ target: { name, value: newValue } });
  };

  return (
    <div className="space-y-1 w-full">
      <label className="text-sm text-black dark:text-white">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full h-10 md:h-[42px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-[#08994A] dark:text-[#0EFF7B] placeholder-gray-500 outline-none text-sm md:text-[14px]"
      />
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-500">{error}</p>}
    </div>
  );
};

const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 3,
  required = false,
  error
}) => (
  <div className="space-y-1 w-full">
    <label className="text-sm text-black dark:text-white">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-[#08994A] dark:text-[#0EFF7B] placeholder-gray-500 outline-none text-sm md:text-[14px] resize-none"
    />
    {error && <p className="mt-1 text-xs text-red-500 dark:text-red-500">{error}</p>}
  </div>
);

export default function NewRegistration({ isSidebarOpen }) {
  const [formData, setFormData] = useState({
    // Basic Information
    full_name: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    age: "",
    marital_status: "",
    address: "",
    phone: "",
    email: "",
    national_id: "",
    city: "",
    country: "",
    date_of_joining: "",
    designation: "",
    department: "",
    specialization: "",
    status: "",
    shift_timing: "",

    // New Dynamic Fields
    education: "",
    about_physician: "",
    experience: "",
    license_number: "",
    board_certifications: "",
    professional_memberships: "",
    languages_spoken: "",
    awards_recognitions: "",
  });

  const [photo, setPhoto] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Validation states
  const [formatErrors, setFormatErrors] = useState({});
  const [requiredErrors, setRequiredErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showAllErrors, setShowAllErrors] = useState(false);
  
  const navigate = useNavigate();

  const maritalStatus = ["Single", "Married", "Divorced", "Widowed"];
  const statusOptions = ["Available", "Unavailable", "On Leave"];
  const shiftTimingOptions = [
    "09:00 AM - 05:00 PM",
    "05:00 PM - 01:00 AM",
    "01:00 AM - 09:00 AM",
  ];
  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Fetch departments
  useEffect(() => {
    api.get("/departments/")
      .then((response) => {
        if (response.status !== 200) {
          throw new Error("Failed to load departments");
        }
        const data = response.data;
        setDepartments(data.map((d) => d.name));
        // Store department mapping for ID lookup
        setDepartmentId(
          data.reduce((acc, dept) => {
            acc[dept.name] = dept.id;
            return acc;
          }, {})
        );
      })
      .catch(() => errorToast("Failed to load departments"));
  }, []);

  
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
  // Real-time format validation functions (for typing)
  const validateNameFormat = (value) => {
    if (/[0-9]/.test(value)) return "Name should not contain numbers";
    if (value.trim() && !/^[A-Za-z\s.'-]{2,}$/.test(value)) return "Please enter a valid name";
    return "";
  };

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

  // ── Format validation functions (while typing) ───────────────────────
  const validateFieldFormat = (field, value) => {
    if (!value || value.trim() === "") return ""; // Empty values handled by required validation
    
    switch (field) {
      case "full_name":
  if (value.length < 2) return "Full name must be at least 2 characters";
  if (value.length > 100) return "Full name cannot exceed 100 characters";
  // Basic check for obviously invalid characters
  if (/[<>\[\]{}\|\\^~`]/.test(value)) return "Full name contains invalid characters";
  return "";
      
      case "email":
        return validateEmailFormat(value);
      
      case "phone":
        if (!/^\d+$/.test(value)) return "Phone number must contain only digits";
        if (value.length !== 10) return "Phone number must be exactly 10 digits";
        return "";
      
      case "national_id":
        if (value.length > 50) return "National ID cannot exceed 50 characters";
        if (!/^[A-Za-z0-9\s\-_]+$/.test(value)) return "National ID can only contain letters, numbers, spaces, hyphens, and underscores";
        return "";
      
      case "city":
      case "country":
        if (value.length > 50) return "Cannot exceed 50 characters";
        if (!/^[A-Za-zÀ-ÿ\s.,'-]+$/.test(value)) return "Can only contain letters (including accented), spaces, periods, commas, hyphens, and apostrophes";
        return "";
      
      case "address":
        if (value.length > 200) return "Address cannot exceed 200 characters";
        if (!/^[A-Za-zÀ-ÿ0-9\s\-.,#'&/]+$/.test(value)) return "Address can only contain letters (including accented), numbers, spaces, hyphens, dots, commas, #, ', &, and /";
        return "";
      
      case "designation":
      case "specialization":
        if (value.length > 100) return "Cannot exceed 100 characters";
        if (!/^[A-Za-zÀ-ÿ\s.,'-]+$/.test(value)) return "Can only contain letters (including accented), spaces, periods, commas, hyphens, and apostrophes";
        return "";
      
      case "age":
        if (!/^\d+$/.test(value)) return "Age must contain only numbers";
        const ageNum = parseInt(value);
        if (ageNum < 18) return "Age must be at least 18";
        if (ageNum > 100) return "Age cannot exceed 100";
        return "";
      
      case "license_number":
        if (value.length > 50) return "License number cannot exceed 50 characters";
        if (!/^[A-Za-z0-9\s\-_]+$/.test(value)) return "License number can only contain letters, numbers, spaces, hyphens, and underscores";
        return "";
      
      case "experience":
        if (value.length > 50) return "Experience cannot exceed 50 characters";
        if (!/^[A-Za-zÀ-ÿ0-9\s+]+$/.test(value)) return "Experience can only contain letters (including accented), numbers, spaces, and +";
        // Check for numeric prefix > 0 if it starts with a number
        const numMatch = value.match(/^\d+/);
        if (numMatch) {
          const num = parseInt(numMatch[0]);
          if (num <= 0) return "Experience value must be above 0";
        }
        return "";
      
      case "languages_spoken":
        if (value.length > 100) return "Languages cannot exceed 100 characters";
        if (!/^[A-Za-zÀ-ÿ\s,]+$/.test(value)) return "Languages can only contain letters (including accented), spaces, and commas";
        return "";
      
      case "education":
      case "about_physician":
      case "board_certifications":
      case "professional_memberships":
      case "awards_recognitions":
        if (value.length > 500) return "Cannot exceed 500 characters";
        return "";
      
      default:
        return "";
    }
  };

  // ── Required field validation (only for submission) ──────────────────
  const validateRequiredFields = () => {
    const errors = {};
    let isValid = true;

    // Basic Information - All required
    const requiredBasicFields = [
      "full_name", "date_of_birth", "gender", "blood_group", "age", 
      "marital_status", "address", "phone", "email",
      "national_id", "city", "country", "date_of_joining",
      "designation", "department", "specialization", "status",
      "shift_timing"
    ];

    requiredBasicFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        errors[field] = "This field is required";
        isValid = false;
      }
    });

    // Professional Information - Required except awards_recognitions
    const requiredProfessionalFields = [
      "education", "about_physician", "experience", 
      "license_number", "board_certifications", 
      "professional_memberships", "languages_spoken"
    ];

    requiredProfessionalFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        errors[field] = "This field is required";
        isValid = false;
      }
    });

    // Photo is required
    if (!photo) {
      errors.photo = "Photo is required";
      isValid = false;
    }

    // At least one certificate is required
    if (certificates.length === 0) {
      errors.certificates = "At least one certificate is required";
      isValid = false;
    }

    setRequiredErrors(errors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear required field error when user starts typing
    if (requiredErrors[name]) {
      setRequiredErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Perform real-time format validation (only for non-empty values)
    if (value && value.trim() !== "") {
      const formatError = validateFieldFormat(name, value);
      
      if (formatError) {
        setFormatErrors(prev => ({
          ...prev,
          [name]: formatError
        }));
      } else {
        // Clear format error if validation passes
        setFormatErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } else {
      // Clear format error for empty fields
      setFormatErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleDropdownChange = (field, value) => {
    handleInputChange({ target: { name: field, value } });
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  };

  const handlePhotoChange = (newPhoto) => {
    setPhoto(newPhoto);
    // Clear photo error when user uploads photo
    if (requiredErrors.photo) {
      setRequiredErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.photo;
        return newErrors;
      });
    }
  };

  const handleCertificatesChange = (newCertificates) => {
    setCertificates(newCertificates);
    // Clear certificates error when user uploads certificates
    if (requiredErrors.certificates) {
      setRequiredErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.certificates;
        return newErrors;
      });
    }
  };

  // ── Validate all fields before submission ────────────────────────────
  const validateForm = () => {
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    setShowAllErrors(true);
    
    // First check required fields
    const requiredValid = validateRequiredFields();
    
    // Then check format validation for all non-empty fields
    const formatErrorsCheck = {};
    Object.keys(formData).forEach(field => {
      const value = formData[field];
      if (value && value.toString().trim() !== "") {
        const error = validateFieldFormat(field, value);
        if (error) formatErrorsCheck[field] = error;
      }
    });
    
    // Update format errors for display
    setFormatErrors(formatErrorsCheck);
    
    const formatValid = Object.keys(formatErrorsCheck).length === 0;
    
    return requiredValid && formatValid;
  };

  // Helper to determine which error should be shown
  const getFieldError = (field) => {
    // Format errors take priority
    if (formatErrors[field]) {
      return formatErrors[field];
    }
    
    // Show required errors for empty fields when showing all errors
    if (showAllErrors && requiredErrors[field]) {
      return requiredErrors[field];
    }
    
    // Show required errors for touched fields
    if (touched[field] && requiredErrors[field]) {
      return requiredErrors[field];
    }
    
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started", formData);

    // Validate form before submission
    const isValid = validateForm();
    
    if (!isValid) {
      console.log("Form validation failed", { 
        requiredErrors, 
        formatErrors,
        formData 
      });
      errorToast("Please fix all validation errors before saving");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();

      // Append all form fields with correct field names
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          form.append(key, formData[key]);
        }
      });

      // Append department_id instead of department name
      if (formData.department && departmentId[formData.department]) {
        form.append("department_id", departmentId[formData.department]);
      } else {
        errorToast("Invalid department selected");
        setLoading(false);
        return;
      }

      // Append files
      if (photo) {
        form.append("profile_picture", photo.file);
      }

      if (certificates.length > 0) {
        certificates.forEach((cert) => {
          form.append("certificates", cert.file);
        });
      }

      // Log form data for debugging
      console.log("Submitting form data:");
      for (let [key, value] of form.entries()) {
        if (key !== "profile_picture" && key !== "certificates") {
          console.log(`${key}: ${value}`);
        } else {
          console.log(`${key}: [File]`);
        }
      }

      // Use axios for form submission with FormData
      const response = await api.post("/staff/add/", form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = response.data;

      if (response.status !== 200 && response.status !== 201) {
        console.error("Server response error:", responseData);
        throw new Error(
          responseData.detail || `HTTP error! status: ${response.status}`
        );
      }

      successToast(
        `"${responseData.full_name}" added! ID: ${responseData.employee_id}`
      );
      navigate(-1);
    } catch (err) {
      console.error("Submission error:", err);
      errorToast(err.response?.data?.detail || err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      full_name: "",
      date_of_birth: "",
      gender: "",
      blood_group: "",
      age: "",
      marital_status: "",
      address: "",
      phone: "",
      email: "",
      national_id: "",
      city: "",
      country: "",
      date_of_joining: "",
      designation: "",
      department: "",
      specialization: "",
      status: "",
      shift_timing: "",
      education: "",
      about_physician: "",
      experience: "",
      license_number: "",
      board_certifications: "",
      professional_memberships: "",
      languages_spoken: "",
      awards_recognitions: "",
    });
    setPhoto(null);
    setCertificates([]);
    setFormatErrors({});
    setRequiredErrors({});
    setTouched({});
    setShowAllErrors(false);
  };

  return (
    <div className="w-full max-w-screen-2xl mb-4 mx-auto font-[Helvetica]">
      <div className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-6 w-full max-w-[1400px] mx-auto flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative">
        {/* Dark Overlay */}
        <div
          className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
            zIndex: 0,
          }}
        ></div>

        {/* Gradient Border */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "10px",
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

        {/* Back Button */}
        <div className="mb-6">
          <button
            className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2 rounded-[8px] hover:bg-[#0EFF7B1A] border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66] dark:hover:bg-green-600 text-white dark:text-white text-sm md:text-base"
            onClick={() => navigate(-1)}
            disabled={loading}
            style={{
              background:
                "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
            }}
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white">
                Add Doctor / Nurse
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                *Required to fill all input
              </p>
            </div>
            <div>
              <PhotoUploadBox 
                photo={photo} 
                setPhoto={handlePhotoChange} 
                required={true} 
              />
              {getFieldError("photo") && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-500 text-center md:text-right mr-12">
                  {requiredErrors.photo}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 min-w-full w-full">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black dark:text-white border-b border-[#0EFF7B] pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <InputField
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("full_name")}
                  placeholder="Enter full name"
                  required={true}
                  error={getFieldError("full_name")}
                  autoCapitalize={true}
                />
                <DatePickerField
                  label="Date of Birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("date_of_birth")}
                  placeholder="MM/DD/YYYY"
                  required={true}
                  error={getFieldError("date_of_birth")}
                  maxDate={new Date()}
                />
                <Dropdown
                  label="Gender"
                  value={formData.gender}
                  onChange={(val) => handleDropdownChange("gender", val)}
                  options={["Male", "Female", "Other"]}
                  required={true}
                  error={getFieldError("gender")}
                />
                <Dropdown
                  label="Blood Group"
                  value={formData.blood_group}
                  onChange={(val) => handleDropdownChange("blood_group", val)}
                  options={bloodGroupOptions}
                  required={true}
                  error={getFieldError("blood_group")}
                />
                <InputField
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("age")}
                  placeholder="Enter age"
                  required={true}
                  error={getFieldError("age")}
                />
                <Dropdown
                  label="Marital Status"
                  value={formData.marital_status}
                  onChange={(val) => handleDropdownChange("marital_status", val)}
                  options={maritalStatus}
                  required={true}
                  error={getFieldError("marital_status")}
                />
                <InputField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("address")}
                  placeholder="Enter address"
                  required={true}
                  error={getFieldError("address")}
                />
                <InputField
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("phone")}
                  placeholder="e.g. 9876543210"
                  required={true}
                  error={getFieldError("phone")}
                />
                <InputField
                  label="Email ID"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("email")}
                  placeholder="example@gmail.com"
                  required={true}
                  error={getFieldError("email")}
                />
                <InputField
                  label="National ID"
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("national_id")}
                  placeholder="Enter National ID"
                  required={true}
                  error={getFieldError("national_id")}
                />
                <InputField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("city")}
                  placeholder="Enter city"
                  required={true}
                  error={getFieldError("city")}
                />
                <InputField
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("country")}
                  placeholder="Enter country"
                  required={true}
                  error={getFieldError("country")}
                />
                <DatePickerField
                  label="Date of Joining"
                  name="date_of_joining"
                  value={formData.date_of_joining}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("date_of_joining")}
                  placeholder="MM/DD/YYYY"
                  required={true}
                  error={getFieldError("date_of_joining")}
                  maxDate={new Date()}
                />
                <InputField
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("designation")}
                  placeholder="Enter designation (e.g., Doctor, Nurse)"
                  required={true}
                  error={getFieldError("designation")}
                  autoCapitalize={true}
                />
                <Dropdown
                  label="Department"
                  value={formData.department}
                  onChange={(val) => handleDropdownChange("department", val)}
                  options={departments}
                  required={true}
                  error={getFieldError("department")}
                />
                <InputField
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("specialization")}
                  placeholder="Enter specialization (e.g., Cardiologist)"
                  required={true}
                  error={getFieldError("specialization")}
                  autoCapitalize={true}
                />
                <Dropdown
                  label="Status"
                  value={formData.status}
                  onChange={(val) => handleDropdownChange("status", val)}
                  options={statusOptions}
                  required={true}
                  error={getFieldError("status")}
                />
                <Dropdown
                  label="Shift Timing"
                  value={formData.shift_timing}
                  onChange={(val) => handleDropdownChange("shift_timing", val)}
                  options={shiftTimingOptions}
                  required={true}
                  error={getFieldError("shift_timing")}
                />
                <div>
                  <CertificateUploadBox
                    certificates={certificates}
                    setCertificates={handleCertificatesChange}
                    required={true}
                  />
                  {getFieldError("certificates") && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-500">
                      {requiredErrors.certificates}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black dark:text-white border-b border-[#0EFF7B] pb-2">
                Professional Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <InputField
                  label="Experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("experience")}
                  placeholder="e.g., 10+ years"
                  required={true}
                  error={getFieldError("experience")}
                />
                <InputField
                  label="License Number"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("license_number")}
                  placeholder="Enter license number"
                  required={true}
                  error={getFieldError("license_number")}
                />
                <InputField
                  label="Languages Spoken"
                  name="languages_spoken"
                  value={formData.languages_spoken}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("languages_spoken")}
                  placeholder="e.g., English, Spanish"
                  required={true}
                  error={getFieldError("languages_spoken")}
                />
                <TextAreaField
                  label="Education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("education")}
                  placeholder="e.g., Cardiologist"
                  required={true}
                  error={getFieldError("education")}
                />
                <TextAreaField
                  label="About Physician"
                  name="about_physician"
                  value={formData.about_physician}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("about_physician")}
                  placeholder="Dedicated to providing compassionate, patient-centered care."
                  required={true}
                  error={getFieldError("about_physician")}
                />
                
                <TextAreaField
                  label="Board Certifications"
                  name="board_certifications"
                  value={formData.board_certifications}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("board_certifications")}
                  placeholder="e.g., American Board of Orthopedic Surgery"
                  required={true}
                  error={getFieldError("board_certifications")}
                />
                <TextAreaField
                  label="Professional Memberships"
                  name="professional_memberships"
                  value={formData.professional_memberships}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("professional_memberships")}
                  placeholder="e.g., American Medical Association (AMA)"
                  required={true}
                  error={getFieldError("professional_memberships")}
                />
                
                {/* Awards & Recognitions EXCLUDED from required */}
                <TextAreaField
                  label="Awards & Recognitions"
                  name="awards_recognitions"
                  value={formData.awards_recognitions}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("awards_recognitions")}
                  placeholder="e.g., Top Doctor awards, hospital honors"
                  error={getFieldError("awards_recognitions")}
                />
              </div>
            </div>

            <div className="flex flex-col pt-7 sm:flex-row justify-end gap-3 md:gap-4">
              <button
                type="reset"
                className="px-4 py-2 md:px-6 md:py-2 rounded-[8px] border border-[#0EFF7B] dark:border-gray-600 bg-gray-100 dark:bg-transparent text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm md:text-base"
                onClick={handleReset}
                disabled={loading}
              >
                ✕ Clear
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2 border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66] rounded-lg hover:bg-[#0EFF7B1A] dark:hover:bg-green-600 text-white dark:text-white text-sm md:text-base disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} className="text-white" />
                    Add Staff
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}