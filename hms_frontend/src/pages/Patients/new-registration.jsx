// src/components/patients/NewRegistration.jsx
import React, { useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { ChevronDown, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
// DIRECT TOAST FUNCTIONS
import { successToast, errorToast } from "../../components/Toast.jsx";
import api from "../../utils/axiosConfig";

const formatToYMD = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  const [m, d, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};
const safeStr = (v) => (v === undefined || v === null ? "" : String(v).trim());

/* ---------- Photo Upload ---------- */
const PhotoUploadBox = ({
  photoPreview,
  setPhotoPreview,
  onFileSelect,
  error = null,
}) => {
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        errorToast("File size exceeds 5MB limit. Please choose a smaller file.");
        e.target.value = ''; // Clear the input to allow re-selection
        return;
      }
      
      // Check file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        errorToast("Invalid file type. Please upload JPG, JPEG, or PNG files only.");
        e.target.value = ''; // Clear the input to allow re-selection
        return;
      }
      
      setPhotoPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };
  
  return (
    <div className="flex flex-col items-center md:items-end md:mr-12">
      <input
        type="file"
        id="photoUpload"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={handlePhotoUpload}
      />
      <label
        htmlFor="photoUpload"
        className="border border-dashed border-[#0EFF7B] w-24 h-24 md:w-32 md:h-32
                  flex items-center justify-center text-gray-600 cursor-pointer
                  rounded-lg overflow-hidden bg-[#0EFF7B1A] hover:border-[#08994A] hover:text-[#08994A]"
      >
        {photoPreview ? (
          <img
            src={photoPreview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs md:text-sm text-center px-1">+ Add Photo</span>
        )}
      </label>
      
      {/* Help text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center md:text-right w-full max-w-[150px]">
        Supported formats: JPG, JPEG, PNG (Max 5MB)
      </p>
      
      {error && (
        <p className="text-red-500 text-xs mt-1 w-32 text-center">{error}</p>
      )}
    </div>
  );
};

/* ---------- Dropdown ---------- */
const Dropdown = ({
  label,
  value,
  onChange,
  options = [],
  idField = "id",
  nameField = "name",
  loading = false,
  placeholder = "Select",
  required = false,
  error = null,
  onFocus = () => {},
  onBlur = () => {},
}) => (
  <div className="space-y-1 w-full">
    <label
      className="text-sm text-black dark:text-white"
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button
          onFocus={onFocus}
          onBlur={onBlur}
          className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border text-left text-[14px] leading-[16px]
                    flex items-center justify-between bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B]
                    ${
                      onFocus
                        ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]"
                        : "border-[#0EFF7B] dark:border-[#3A3A3A]"
                    }`}
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          <span>
            {loading
              ? "Loading..."
              : value
              ? options.find((o) => String(o[idField]) === String(value))?.[
                  nameField
                ] || String(value)
              : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-[#0EFF7B] absolute right-2" />
        </Listbox.Button>
        <Listbox.Options
          className="absolute mt-1 w-full rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50
                    border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px] max-h-60 overflow-y-auto"
        >
          {loading ? (
            <Listbox.Option
              disabled
              value=""
              className="px-2 py-2 text-sm text-gray-500"
            >
              Loading...
            </Listbox.Option>
          ) : options.length === 0 ? (
            <Listbox.Option
              disabled
              value=""
              className="px-2 py-2 text-sm text-gray-500"
            >
              No options
            </Listbox.Option>
          ) : (
            options.map((option) => (
              <Listbox.Option
                key={option[idField]}
                value={option[idField]}
                className={({ active, selected }) =>
                  `cursor-pointer select-none py-2 px-2 text-sm rounded-md
                  ${
                    active
                      ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                      : "text-black dark:text-white"
                  }
                  ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                }
              >
                {option[nameField]}
              </Listbox.Option>
            ))
          )}
        </Listbox.Options>
      </div>
    </Listbox>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

/* ---------- Input ---------- */
const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  error = null,
  onFocus = () => {},
  onBlur = () => {},
}) => (
  <div className="space-y-1 w-full">
    <label
      className="text-sm text-black dark:text-white"
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`w-full h-[33px] px-3 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                text-black dark:text-[#0EFF7B] placeholder-gray-400 outline-none text-[14px]
                ${
                  onFocus
                    ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]"
                    : "border-[#0EFF7B] dark:border-[#3A3A3A]"
                }`}
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

/* ---------- Date Field (Native Style) ---------- */
const DateField = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error = null,
  onFocus = () => {},
  onBlur = () => {},
  restrictFuture = false,
  restrictPast = false,
}) => {
  const dateRef = React.useRef(null);
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const handleDateChange = (e) => {
    const selected = e.target.value;

    // Block future dates if restrictFuture is true
    if (restrictFuture && selected > today) {
      return; // Ignore selection
    }

    // Block past dates if restrictPast is true
    if (restrictPast && selected < today) {
      return; // Ignore selection
    }

    onChange(selected);
  };

  const minDate = restrictPast ? today : undefined;
  const maxDate = restrictFuture ? today : undefined;

  return (
    <div className="space-y-1 w-full">
      <label
        className="text-sm text-black dark:text-white"
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className="relative cursor-pointer"
        onClick={() => dateRef.current?.showPicker()}
      >
        <input
          type="date"
          ref={dateRef}
          value={value}
          onChange={handleDateChange}
          onFocus={onFocus}
          onBlur={onBlur}
          min={minDate}
          max={maxDate}
          className={`w-full h-[33px] px-3 pr-10 rounded-[8px] border bg-gray-100 dark:bg-transparent
                    text-black dark:text-[#0EFF7B] outline-none cursor-pointer text-[14px]
                    ${
                      onFocus
                        ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]"
                        : "border-[#0EFF7B] dark:border-[#3A3A3A]"
                    }`}
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        />
        <Calendar
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0EFF7B] pointer-events-none"
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {restrictFuture && value > today && (
        <p className="text-red-500 text-xs mt-1">
          Future dates are not allowed
        </p>
      )}
      {restrictPast && value && value < today && (
        <p className="text-red-500 text-xs mt-1">Past dates are not allowed</p>
      )}
    </div>
  );
};

/* ---------- Main Component ---------- */
export default function NewRegistration({ isSidebarOpen }) {
  const [formData, setFormData] = useState({
    fullname: "",
    dob: "",
    gender: "",
    age: "",
    maritalStatus: "",
    address: "",
    phone: "",
    email: "",
    nid: "",
    city: "",
    country: "",
    dor: "",
    occupation: "",
    weight: "",
    height: "",
    bloodGroup: "",
    bp: "",
    temperature: "",
    consultType: "",
    apptType: "",
    admitDate: "",
    roomNo: "",
    testReport: "",
    casualty: "",
    reason: "",
    department_id: "",
    staff_id: "",
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for TC_096

  // Validation states
  const [validationErrors, setValidationErrors] = useState({}); // Format validation
  const [fieldErrors, setFieldErrors] = useState({}); // Required validation (submit only)
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const styleRef = React.useRef(null);
  const navigate = useNavigate();

  const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const consultationTypes = ["General", "Specialist", "Emergency"];
  const appointmentTypes = ["In-person", "Online", "Follow-up"];
  const casualtyTypes = ["Normal", "Severe"];

  /* ---------- Format Validation Functions (while typing) ---------- */
  const validateFullnameFormat = (value) => {
    if (value.trim() && !/^[A-Za-z\s.'-]+$/.test(value))
      return "Name should contain only letters and spaces";
    return "";
  };

  const validateAgeFormat = (value) => {
    if (
      value.trim() &&
      (isNaN(value) || Number(value) <= 0 || Number(value) > 150)
    )
      return "Age must be a positive number (1-150)";
    return "";
  };

  const validatePhoneFormat = (value) => {
    if (value.trim() && !/^\d{10}$/.test(value))
      return "Phone number must be exactly 10 digits";
    return "";
  };

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

  // ✅ FIXED: Enhanced email validation for TC_097 - blocks araa@a.com
  // ✅ FIXED: Enhanced email validation with TLD length limits
const validateEmailFormat = (value) => {
  const email = value.trim();
  if (!email) return "Email is required";

  // Check for minimum length
  if (email.length < 5) {
    return "Email is too short";
  }

  // Check for maximum length (RFC 5321)
  if (email.length > 254) {
    return "Email is too long (maximum 254 characters)";
  }

  // Check for @ symbol
  if (!email.includes('@')) {
    return "Email must contain @ symbol";
  }

  // Split into local and domain parts
  const parts = email.split('@');
  if (parts.length !== 2) {
    return "Email must contain exactly one @ symbol";
  }

  const [localPart, domain] = parts;

  // Local part validation
  if (localPart.length < 1) {
    return "Email username cannot be empty";
  }
  
  // Local part max length (RFC 5321)
  if (localPart.length > 64) {
    return "Email username is too long (maximum 64 characters)";
  }

  // Domain validation - must contain at least one dot
  if (!domain.includes('.')) {
    return "Domain must contain a dot (e.g., domain.com)";
  }

  // Domain parts validation
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return "Invalid domain format";
  }

  // Domain name max length (RFC 1035)
  if (domain.length > 255) {
    return "Domain name is too long (maximum 255 characters)";
  }

  // TLD validation - must be between 2 and 6 characters (common TLDs)
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return "Please use a valid domain extension (e.g., .com, .org)";
  }
  
  // ✅ NEW: Maximum TLD length validation
  // Most common TLDs are 2-6 characters (.com, .org, .net, .info, .travel, etc.)
  // Very long TLDs like .something are usually invalid
  if (tld.length > 6) {
    return "Domain extension is too long (maximum 6 characters, e.g., .com, .org)";
  }

  // Check for consecutive dots in domain
  if (domain.includes('..')) {
    return "Domain cannot contain consecutive dots";
  }

  // Strict regex validation for complete email format
  // Updated regex to enforce reasonable TLD length (2-6 chars)
  const strictEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,6}$/;
  
  if (!strictEmailRegex.test(email)) {
    return "Please enter a valid email address (e.g., user@domain.com)";
  }

  // Check for common invalid patterns
  const invalidPatterns = [
    /\.\./, // No double dots anywhere
    /@\./, // No @ immediately followed by dot
    /\.@/, // No dot immediately before @
    /^\./, // Cannot start with dot
    /\.$/, // Cannot end with dot
    /@.*@/, // Multiple @ symbols
    /[<>()[\]\\,;:\s]/, // No special characters
  ];

  for (const pattern of invalidPatterns) {
    if (pattern.test(email)) {
      return "Invalid email format";
    }
  }

  // Block single-letter domains (like a.com, b.org)
  if (domainParts[0].length < 2) {
    return "Domain name must be at least 2 characters";
  }

  // Block common invalid/placeholder domains
  const blockedDomains = [
    "example.com",
    "test.com",
    "domain.com",
    "invalid.com",
    "123.com",
    "abc.com",
    "xyz.com",
    "gm.com",
    "gmail.con",
    "gmail.cm",
    "gmailcom",
    "email.com",
    "mail.com",
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

  if (blockedDomains.includes(domain.toLowerCase())) {
    return "Please use a valid email domain";
  }

  // Dynamic typo detection for major providers
  const providers = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "protonmail.com"
  ];

  for (const provider of providers) {
    const distance = levenshtein(domain.toLowerCase(), provider);
    if (distance > 0 && distance <= 2) {
      return `Did you mean ${localPart}@${provider}?`;
    }
  }

  return "";
};

  const validateWeightFormat = (value) => {
    if (
      value.trim() &&
      (isNaN(value) || Number(value) <= 0 || Number(value) > 300)
    )
      return "Weight must be a positive number (1-300 kg)";
    return "";
  };

  const validateHeightFormat = (value) => {
    if (
      value.trim() &&
      (isNaN(value) || Number(value) <= 0 || Number(value) > 250)
    )
      return "Height must be a positive number (1-250 cm)";
    return "";
  };

  const validateTemperatureFormat = (value) => {
    if (
      value.trim() &&
      (isNaN(value) || Number(value) < 86 || Number(value) > 122)
    )
      return "Temperature must be a valid number (86-122°F)";
    return "";
  };

  const validateCityFormat = (value) => {
    if (value.trim() && !/^[A-Za-z\s.'-]+$/.test(value))
      return "City should contain only letters and spaces";
    return "";
  };

  const validateCountryFormat = (value) => {
    if (value.trim() && !/^[A-Za-z\s.'-]+$/.test(value))
      return "Country should contain only letters and spaces";
    return "";
  };

  const validateOccupationFormat = (value) => {
    if (value.trim() && !/^[A-Za-z\s.'-]+$/.test(value))
      return "Occupation should contain only letters and spaces";
    return "";
  };

  const validateReasonFormat = (value) => {
    if (value.trim() && !/^[A-Za-z\s.,!?'-]+$/.test(value))
      return "Reason should contain only letters and basic punctuation";
    return "";
  };

  const validateTestReportFormat = (value) => {
    if (value.trim() && !/^[A-Za-z0-9\s.,!?'-]+$/.test(value))
      return "Test report can contain letters, numbers and basic punctuation";
    return "";
  };

  const validateBpFormat = (value) => {
    if (value.trim() && !/^\d{2,3}\/\d{2,3}$/.test(value)) {
      return "Blood pressure must be in format 120/80 (e.g., 120/80, 90/60)";
    }
    // Optional: add realistic range check
    const [systolic, diastolic] = value.split("/");
    if (systolic && diastolic) {
      const sys = parseInt(systolic);
      const dia = parseInt(diastolic);
      if (sys < 70 || sys > 250 || dia < 40 || dia > 150) {
        return "Blood pressure values out of realistic range";
      }
    }
    return "";
  };

  const validateNidFormat = (value) => {
    if (value.trim() && !/^[A-Za-z0-9\s-]+$/.test(value))
      return "NID can contain letters, numbers, spaces and hyphens";
    return "";
  };

  const validateAddressFormat = (value) => {
    if (value.trim() && !/^[A-Za-z0-9\s.,#'/-]+$/.test(value))
      return "Address can contain letters, numbers, spaces and basic punctuation";
    return "";
  };

  /* ---------- Required Field Validation (only for submission) ---------- */
  const validateRequiredFields = () => {
    const errors = {};
    let isValid = true;

    // Define required fields - REMOVED "admitDate" for TC_098
    const requiredFields = [
      "fullname",
      "dob",
      "gender",
      "age",
      "maritalStatus",
      "address",
      "phone",
      "email",
      "nid",
      "city",
      "country",
      "dor",
      "occupation",
      "weight",
      "height",
      "bloodGroup",
      "bp",
      "temperature",
      "consultType",
      "apptType",
      // "admitDate", // REMOVED - this makes it optional for TC_098
      // "roomNo",
      // "testReport",
      "casualty",
      "reason",
      "department_id",
      "staff_id",
    ];

    requiredFields.forEach((field) => {
      if (
        !formData[field] ||
        (typeof formData[field] === "string" && formData[field].trim() === "")
      ) {
        errors[field] = `${field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())} is required`;
        isValid = false;
      }
    });

    // Special case for photo
    if (!photoFile) {
      errors.photo = "Photo is required";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  /* ---------- Capitalize Functions ---------- */
  const capitalizeName = (value) => {
    return value
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const capitalizeWords = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  /* ---------- Handle Input Change ---------- */
  const handleInputChange = (field) => (e) => {
    let value = e.target.value;

    // Apply auto-capitalization
    if (field === "fullname") {
      value = capitalizeName(value);
    } else if (
      ["city", "country", "occupation", "reason", "testReport", "bp"].includes(
        field
      )
    ) {
      value = capitalizeWords(value);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation errors for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Perform real-time format validation
    let formatError = "";
    switch (field) {
      case "fullname":
        formatError = validateFullnameFormat(value);
        break;
      case "age":
        formatError = validateAgeFormat(value);
        break;
      case "phone":
        formatError = validatePhoneFormat(value);
        break;
      case "email":
        formatError = validateEmailFormat(value);
        break;
      case "weight":
        formatError = validateWeightFormat(value);
        break;
      case "height":
        formatError = validateHeightFormat(value);
        break;
      case "temperature":
        formatError = validateTemperatureFormat(value);
        break;
      case "city":
        formatError = validateCityFormat(value);
        break;
      case "country":
        formatError = validateCountryFormat(value);
        break;
      case "occupation":
        formatError = validateOccupationFormat(value);
        break;
      case "reason":
        formatError = validateReasonFormat(value);
        break;
      case "testReport":
        formatError = validateTestReportFormat(value);
        break;
      case "bp":
        formatError = validateBpFormat(value);
        break;
      case "nid":
        formatError = validateNidFormat(value);
        break;
      case "address":
        formatError = validateAddressFormat(value);
        break;
      default:
        break;
    }

    if (formatError) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: formatError,
      }));
    }
  };

  const handleDropdownChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation errors for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDateChange = (field) => (date) => {
    setFormData((prev) => ({ ...prev, [field]: date }));

    // Clear validation errors for this field
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /* ---------- Validate Form Before Submission ---------- */
  const validateForm = () => {
    // First check required fields
    const requiredValid = validateRequiredFields();

    // Then check format validation
    const formatErrors = {
      fullname: validateFullnameFormat(formData.fullname),
      age: validateAgeFormat(formData.age),
      phone: validatePhoneFormat(formData.phone),
      email: validateEmailFormat(formData.email),
      weight: validateWeightFormat(formData.weight),
      height: validateHeightFormat(formData.height),
      temperature: validateTemperatureFormat(formData.temperature),
      city: validateCityFormat(formData.city),
      country: validateCountryFormat(formData.country),
      occupation: validateOccupationFormat(formData.occupation),
      reason: validateReasonFormat(formData.reason),
      testReport: validateTestReportFormat(formData.testReport),
      bp: validateBpFormat(formData.bp),
      nid: validateNidFormat(formData.nid),
      address: validateAddressFormat(formData.address),
    };

    // Update validation errors for display
    setValidationErrors(formatErrors);

    const formatValid = !Object.values(formatErrors).some(
      (error) => error !== ""
    );

    setIsSubmitted(true);
    return requiredValid && formatValid;
  };

  /* ---------- Load Departments ---------- */
  useEffect(() => {
    let mounted = true;
    setLoadingDepts(true);
    api.get("/patients/departments")
      .then((response) => {
        if (mounted) {
          const data = response.data;
          setDepartments(data.departments || []);
          setLoadingDepts(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load departments:", err);
        if (mounted) setLoadingDepts(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  /* ---------- Load Available Beds ---------- */
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
                id: `${group.bedGroup} - ${bed.bed_number}`,
                bedGroup: group.bedGroup,
                bedNumber: bed.bed_number.toString(),
                name: `${group.bedGroup} - ${bed.bed_number}`,
              }))
          );
          setAvailableBeds(beds);
        }
      })
      .catch((e) => {
        console.error(e);
        errorToast("Failed to load beds");
      })
      .finally(() => {
        if (mounted) setLoadingBeds(false);
      });
    return () => (mounted = false);
  }, []);

  /* ---------- Load Staff ---------- */
  useEffect(() => {
    if (!formData.department_id) {
      setDoctors([]);
      setFormData((p) => ({ ...p, staff_id: "" }));
      return;
    }
    let mounted = true;
    setLoadingStaff(true);
    api.get("/patients/staff", { params: { department_id: formData.department_id } })
      .then((response) => {
        if (mounted) {
          const data = response.data;
          setDoctors(data.staff || []);
          setLoadingStaff(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load staff:", err);
        if (mounted) setLoadingStaff(false);
      });
    return () => {
      mounted = false;
    };
  }, [formData.department_id]);

  // Add CSS to hide default date picker icon
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      input[type="date"]::-webkit-calendar-picker-indicator {
        display: none;
        -webkit-appearance: none;
      }
      input[type="date"] {
        -moz-appearance: textfield;
      }
    `;
    document.head.appendChild(style);
    styleRef.current = style;
    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    setFormData({
      fullname: "",
      dob: "",
      gender: "",
      age: "",
      maritalStatus: "",
      address: "",
      phone: "",
      email: "",
      nid: "",
      city: "",
      country: "",
      dor: "",
      occupation: "",
      weight: "",
      height: "",
      bloodGroup: "",
      bp: "",
      temperature: "",
      consultType: "",
      apptType: "",
      admitDate: "",
      roomNo: "",
      testReport: "",
      casualty: "",
      reason: "",
      department_id: "",
      staff_id: "",
    });
    setPhotoPreview(null);
    setPhotoFile(null);
    setValidationErrors({});
    setFieldErrors({});
    setIsSubmitted(false);
    setIsSubmitting(false); // Reset submitting state
  };

  /* ---------- Submit with Toast ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent multiple submissions - Fix for TC_096
    if (isSubmitting) {
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      errorToast("Please fix all validation errors before saving.");
      return;
    }

    setIsSubmitting(true); // Lock the form - Fix for TC_096

    const body = new FormData();
    body.append("full_name", safeStr(formData.fullname));
    body.append("date_of_birth", formData.dob || "");
    body.append("gender", safeStr(formData.gender));
    body.append("age", safeStr(formData.age));
    body.append("marital_status", safeStr(formData.maritalStatus));
    body.append("address", safeStr(formData.address));
    body.append("phone_number", safeStr(formData.phone));
    body.append("email_address", safeStr(formData.email));
    body.append("national_id", safeStr(formData.nid));
    body.append("city", safeStr(formData.city));
    body.append("country", safeStr(formData.country));
    body.append("date_of_registration", formData.dor || "");
    body.append("occupation", safeStr(formData.occupation));
    body.append("weight_in_kg", safeStr(formData.weight));
    body.append("height_in_cm", safeStr(formData.height));
    body.append("blood_group", safeStr(formData.bloodGroup));
    body.append("blood_pressure", safeStr(formData.bp));
    body.append("body_temperature", safeStr(formData.temperature));
    body.append("consultation_type", safeStr(formData.consultType));
    body.append("appointment_type", safeStr(formData.apptType));
    body.append("admission_date", formData.admitDate || ""); // Optional - Fix for TC_098
    body.append("room_number", safeStr(formData.roomNo));
    body.append("test_report_details", safeStr(formData.testReport));
    body.append("casualty_status", safeStr(formData.casualty));
    body.append("reason_for_visit", safeStr(formData.reason));
    body.append("department_id", safeStr(formData.department_id));
    body.append("staff_id", safeStr(formData.staff_id));
    if (photoFile) body.append("photo", photoFile);

    try {
      const response = await api.post("/patients/register", body, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = response.data;
      successToast(`Patient registered: ${data.patient_id}`);
      handleClear();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || "Registration failed";
      errorToast(`Registration failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false); // Unlock the form - Fix for TC_096
    }
  };

  /* ---------- Render ---------- */
  return (
    <div className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-4 w-full max-w-[2500px] mx-auto flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative font-[Helvetica]">
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
      <div className="mt-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-2 rounded-[8px] hover:bg-[#0EFF7B1A] border-b-[2px] border-[#0EFF7B66] text-white"
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
          <div className="md:flex-1">
            <h2 className="text-2xl font-bold">New Registration</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Input new patient details carefully
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <PhotoUploadBox
              photoPreview={photoPreview}
              setPhotoPreview={setPhotoPreview}
              onFileSelect={(file) => {
                setPhotoFile(file);
                if (isSubmitted && fieldErrors.photo) {
                  setFieldErrors((prev) => ({ ...prev, photo: "" }));
                }
              }}
              error={fieldErrors.photo}
            />
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-8"
          encType="multipart/form-data"
          noValidate
        >
          {/* General Info */}
          <div>
            <h3 className="text-lg font-medium mb-2">General Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <InputField
                label="Full Name"
                value={formData.fullname}
                onChange={handleInputChange("fullname")}
                onFocus={() => setFocusedField("fullname")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter full name"
                required
                error={validationErrors.fullname || fieldErrors.fullname}
              />
              <DateField
                label="Date of Birth"
                value={formData.dob}
                onChange={handleDateChange("dob")}
                required
                restrictFuture={true}
                error={fieldErrors.dob}
              />
              <Dropdown
                label="Gender"
                value={formData.gender}
                onChange={handleDropdownChange("gender")}
                options={["Male", "Female", "Other"].map((g) => ({
                  id: g,
                  name: g,
                }))}
                onFocus={() => setFocusedField("gender")}
                onBlur={() => setFocusedField(null)}
                required
                error={fieldErrors.gender}
              />
              <InputField
                label="Age"
                type="number"
                value={formData.age}
                onChange={handleInputChange("age")}
                onFocus={() => setFocusedField("age")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter age (1-150)"
                required
                error={validationErrors.age || fieldErrors.age}
              />
              <Dropdown
                label="Marital Status"
                value={formData.maritalStatus}
                onChange={handleDropdownChange("maritalStatus")}
                options={maritalStatusOptions.map((m) => ({ id: m, name: m }))}
                onFocus={() => setFocusedField("maritalStatus")}
                onBlur={() => setFocusedField(null)}
                required
                error={fieldErrors.maritalStatus}
              />
              <InputField
                label="Address"
                value={formData.address}
                onChange={handleInputChange("address")}
                onFocus={() => setFocusedField("address")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter address"
                required
                error={validationErrors.address || fieldErrors.address}
              />
              <InputField
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter 10 digit phone no"
                required
                error={validationErrors.phone || fieldErrors.phone}
              />
              <InputField
                label="Email ID"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="example@domain.com"
                required
                error={validationErrors.email || fieldErrors.email}
              />
              <InputField
                label="National ID"
                value={formData.nid}
                onChange={handleInputChange("nid")}
                onFocus={() => setFocusedField("nid")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter NID"
                required
                error={validationErrors.nid || fieldErrors.nid}
              />
              <InputField
                label="City"
                value={formData.city}
                onChange={handleInputChange("city")}
                onFocus={() => setFocusedField("city")}
                onBlur={() => setFocusedField(null)}
                placeholder="City"
                required
                error={validationErrors.city || fieldErrors.city}
              />
              <InputField
                label="Country"
                value={formData.country}
                onChange={handleInputChange("country")}
                onFocus={() => setFocusedField("country")}
                onBlur={() => setFocusedField(null)}
                placeholder="Country"
                required
                error={validationErrors.country || fieldErrors.country}
              />
              <DateField
                label="Date of Registration"
                value={formData.dor}
                onChange={handleDateChange("dor")}
                onFocus={() => setFocusedField("dor")}
                onBlur={() => setFocusedField(null)}
                required
                restrictPast={true}
                error={fieldErrors.dor}
              />
              <InputField
                label="Occupation"
                value={formData.occupation}
                onChange={handleInputChange("occupation")}
                onFocus={() => setFocusedField("occupation")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter occupation"
                required
                error={validationErrors.occupation || fieldErrors.occupation}
              />
              <InputField
                label="Weight (kg)"
                type="number"
                value={formData.weight}
                onChange={handleInputChange("weight")}
                onFocus={() => setFocusedField("weight")}
                onBlur={() => setFocusedField(null)}
                placeholder="kg (1-300)"
                required
                error={validationErrors.weight || fieldErrors.weight}
              />
              <InputField
                label="Height (cm)"
                type="number"
                value={formData.height}
                onChange={handleInputChange("height")}
                onFocus={() => setFocusedField("height")}
                onBlur={() => setFocusedField(null)}
                placeholder="cm (1-250)"
                required
                error={validationErrors.height || fieldErrors.height}
              />
            </div>
          </div>
          {/* Medical Info */}
          <div>
            <h3 className="text-lg font-medium mb-2">Medical Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Dropdown
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={handleDropdownChange("bloodGroup")}
                options={bloodGroups.map((b) => ({ id: b, name: b }))}
                onFocus={() => setFocusedField("bloodGroup")}
                onBlur={() => setFocusedField(null)}
                required
                error={fieldErrors.bloodGroup}
              />
              <InputField
                label="Blood Pressure"
                value={formData.bp}
                onChange={handleInputChange("bp")}
                onFocus={() => setFocusedField("bp")}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. 120/80"
                required
                error={validationErrors.bp || fieldErrors.bp}
              />
              <InputField
                label="Temperature"
                type="number"
                value={formData.temperature}
                onChange={handleInputChange("temperature")}
                onFocus={() => setFocusedField("temperature")}
                onBlur={() => setFocusedField(null)}
                placeholder="°F (86-122)"
                required
                error={validationErrors.temperature || fieldErrors.temperature}
              />
              <Dropdown
                label="Consultation Type"
                value={formData.consultType}
                onChange={handleDropdownChange("consultType")}
                options={consultationTypes.map((c) => ({ id: c, name: c }))}
                onFocus={() => setFocusedField("consultType")}
                onBlur={() => setFocusedField(null)}
                required
                error={fieldErrors.consultType}
              />
              <Dropdown
                label="Department"
                value={formData.department_id}
                onChange={handleDropdownChange("department_id")}
                options={departments}
                loading={loadingDepts}
                onFocus={() => setFocusedField("department")}
                onBlur={() => setFocusedField(null)}
                required
                error={fieldErrors.department_id}
              />
              <Dropdown
                label="Consulting Doctor"
                value={formData.staff_id}
                onChange={handleDropdownChange("staff_id")}
                options={doctors.map((d) => ({
                  id: d.id,
                  display: `${d.full_name} – ${d.designation}`,
                }))}
                loading={loadingStaff}
                placeholder="Select Department First"
                idField="id"
                nameField="display"
                onFocus={() => setFocusedField("staff")}
                onBlur={() => setFocusedField(null)}
                required
                error={fieldErrors.staff_id}
              />
              <Dropdown
                label="Appointment Type"
                value={formData.apptType}
                onChange={handleDropdownChange("apptType")}
                options={appointmentTypes.map((a) => ({ id: a, name: a }))}
                onFocus={() => setFocusedField("apptType")}
                onBlur={() => setFocusedField(null)}
                required
                error={fieldErrors.apptType}
              />
              {/* <DateField
                label="Admit Date"
                value={formData.admitDate}
                onChange={handleDateChange("admitDate")}
                restrictFuture={true}
                // Removed required prop to make it optional for TC_098
              /> */}
              {/* <Dropdown
                label="Room / Bed No"
                value={formData.roomNo}
                onChange={handleDropdownChange("roomNo")}
                options={availableBeds}
                placeholder={loadingBeds ? "Loading…" : "Select Available Bed"}
                loading={loadingBeds}
                onFocus={() => setFocusedField("roomNo")}
                onBlur={() => setFocusedField(null)}
                required
                error={fieldErrors.roomNo}
              />
              <InputField
                label="Test Report"
                value={formData.testReport}
                onChange={handleInputChange("testReport")}
                onFocus={() => setFocusedField("testReport")}
                onBlur={() => setFocusedField(null)}
                placeholder="Details"
                required
                error={validationErrors.testReport || fieldErrors.testReport}
              /> */}
              <Dropdown
                label="Casualty"
                value={formData.casualty}
                onChange={handleDropdownChange("casualty")}
                options={casualtyTypes.map((c) => ({ id: c, name: c }))}
                onFocus={() => setFocusedField("casualty")}
                onBlur={() => setFocusedField(null)}
                required
                error={fieldErrors.casualty}
              />
            </div>
            <div className="mt-4">
              <label
                className="text-sm text-black dark:text-white"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Reason for Visit <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={handleInputChange("reason")}
                onFocus={() => setFocusedField("reason")}
                onBlur={() => setFocusedField(null)}
                placeholder="Describe symptoms"
                className={`w-full h-20 mt-1 px-3 py-2 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                          text-black dark:text-[#0EFF7B] outline-none text-[14px]
                          ${
                            focusedField === "reason"
                              ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]"
                              : "border-[#0EFF7B] dark:border-[#3A3A3A]"
                          }`}
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              />
              {/* Format validation error - shows while typing */}
              {validationErrors.reason && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.reason}
                </p>
              )}
              {/* Required field error - only shows after submit attempt */}
              {fieldErrors.reason && !validationErrors.reason && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.reason}
                </p>
              
              )}
            </div>
          </div>
          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-8">
            <button
              type="button"
              onClick={handleClear}
              className="w-[144px] h-[34px] rounded-[8px] border border-[#0EFF7B] bg-[#0EFF7B1A] dark:bg-transparent text-black dark:text-white"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Object.values(validationErrors).some(
                (error) => error !== ""
              )}
              className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white border-b-[2px] border-[#0EFF7B] disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Add Patient..!"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
