import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Upload,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Shield,
  AlertCircle,
  Calendar,
  Tag,
  FileDigit,
} from "lucide-react";
import api, { uploadFile } from "../../utils/axiosConfig.js";
import { useHospital } from "../../components/HospitalContext.jsx";
import { useUser } from "../../contexts/UserContext";
import { successToast, errorToast } from "../../components/Toast.jsx";
import { getMediaUrl } from "../../utils/axiosConfig";

// Use forwardRef to expose methods to parent
const HospitalInfo = forwardRef(({ data, onUpdate, onFormChange, isDirty }, ref) => {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [touchedFields, setTouchedFields] = useState({});
  const { updateLogo } = useHospital();
  const { userData, fetchUserData } = useUser();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    isFormValid: () => {
      return checkFormValidity();
    },
    getErrors: () => {
      return errors;
    }
  }));

  // Fetch user role from API to ensure we have the latest
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const response = await api.get("/profile/me/");
        console.log("User data from API:", response.data);
        setUserRole({
          role: response.data.role,
          is_superuser: response.data.is_superuser
        });
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    
    getUserRole();
  }, []);

  // Check if user is admin based on your backend response
  const isAdmin = userRole?.role === "admin" || userRole?.is_superuser === true;

  // Phone number validation - checks for valid Indian mobile numbers
  const isValidPhoneNumber = (phone) => {
    if (!phone) return false;
    
    // Check if it's exactly 10 digits
    if (!/^\d{10}$/.test(phone)) return false;
    
    // Check for all same digits (1111111111, 2222222222, etc.)
    if (/^(\d)\1{9}$/.test(phone)) return false;
    
    // Check for sequential numbers (1234567890, 9876543210)
    const sequential = [
      "1234567890", "0123456789", "9876543210", "0987654321",
      "1111111111", "2222222222", "3333333333", "4444444444",
      "5555555555", "6666666666", "7777777777", "8888888888",
      "9999999999", "0000000000"
    ];
    if (sequential.includes(phone)) return false;
    
    // Indian mobile numbers start with 6,7,8,9
    if (![6, 7, 8, 9].includes(parseInt(phone[0]))) return false;
    
    return true;
  };

  // GSTIN validation - comprehensive validation with checksum
  const gstinChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const getCodeValue = (char) => gstinChars.indexOf(char);

  const calculateGSTINChecksum = (gstin) => {
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      const code = getCodeValue(gstin[i]);
      if (code === -1) return null;
      const multiplier = (i % 2 === 0) ? 1 : 2;
      const product = code * multiplier;
      sum += Math.floor(product / 36) + (product % 36);
    }
    const checksum = (36 - (sum % 36)) % 36;
    return gstinChars[checksum];
  };

  // GSTIN validation - practical validation (without checksum)
const isValidGSTIN = (gstin) => {
  if (!gstin) return true; // Optional field

  gstin = gstin.toUpperCase();

  if (gstin.length !== 15) return false;

  // Basic GSTIN format
  const gstRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  if (!gstRegex.test(gstin)) return false;

  // Validate state code (01–38)
  const stateCode = parseInt(gstin.substring(0, 2));
  if (stateCode < 1 || stateCode > 38) return false;

  // Validate PAN part (positions 3–12)
  const pan = gstin.substring(2, 12);
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan)) return false;

  return true;
};

  // Strict email validation
  const isValidEmail = (email) => {
    if (!email) return false;
    
    // More strict email regex that catches common invalid patterns
    const emailRegex = /^[a-zA-Z0-9](?!.*\.\.)[a-zA-Z0-9._%+-]*[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    
    // Check for common invalid domains
    const invalidDomains = ['gail.com', 'gnail.com', 'yaho.com', 'hotmial.com', 'outllok.com', 'gail.om'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!emailRegex.test(email)) return false;
    if (invalidDomains.includes(domain)) return false;
    
    // Check for valid TLD (should be at least 2 characters and only letters)
    const tld = domain?.split('.').pop();
    if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;
    
    // No spaces allowed
    if (/\s/.test(email)) return false;
    
    return true;
  };

  const validateField = (field, value) => {
    let error = "";
    
    switch (field) {
      case "gstin":
        if (value && !isValidGSTIN(value)) {
          error = "Invalid GSTIN format. Should be 15 characters (e.g., 27AAPFU0939F1Z5)";
        }
        break;
        
      case "phone":
        if (!value || !value.trim()) {
          error = "Phone number is required";
        } else if (!isValidPhoneNumber(value)) {
          error = "Please enter a valid 10-digit mobile number starting with 6,7,8, or 9";
        }
        break;
        
      case "emergency_contact":
        // Emergency contact is optional - only validate if value exists
        if (value && !isValidPhoneNumber(value)) {
          error = "Please enter a valid 10-digit emergency contact number";
        }
        break;
        
      case "hospital_name":
        if (!value || !value.trim()) {
          error = "Hospital name is required";
        } else if (value.trim().length < 3) {
          error = "Hospital name must be at least 3 characters";
        }
        break;
        
      case "email":
        if (!value || !value.trim()) {
          error = "Email is required";
        } else if (!isValidEmail(value)) {
          error = "Please enter a valid email address (e.g., name@example.com)";
        }
        break;
        
      case "address":
        if (!value || !value.trim()) {
          error = "Address is required";
        } else if (value.trim().length < 10) {
          error = "Please enter a complete address";
        }
        break;
        
      case "established_year":
        if (value) {
          const year = parseInt(value);
          const currentYear = new Date().getFullYear();
          if (year < 1900 || year > currentYear) {
            error = `Year must be between 1900 and ${currentYear}`;
          }
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  // Check if form is valid (no errors)
  const checkFormValidity = () => {
    // Check required fields
    if (!data.hospital_name?.trim() || data.hospital_name.trim().length < 3) return false;
    if (!data.phone || !isValidPhoneNumber(data.phone)) return false;
    if (!data.email?.trim() || !isValidEmail(data.email)) return false;
    if (!data.address?.trim() || data.address.trim().length < 10) return false;
    
    // Check optional fields if they have values
    if (data.emergency_contact && !isValidPhoneNumber(data.emergency_contact)) return false;
    if (data.gstin && !isValidGSTIN(data.gstin)) return false;
    if (data.established_year) {
      const year = parseInt(data.established_year);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) return false;
    }
    
    return true;
  };

  const handleChange = (field, value) => {
    // Only admin can edit
    if (!isAdmin) {
      errorToast("Only admin can edit hospital information");
      return;
    }

    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));

    // Special handling for phone and emergency_contact
    if (field === "phone" || field === "emergency_contact") {
      // Remove all non-digits and limit to 10 digits
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    // Special handling for GSTIN
    if (field === "gstin") {
      // Convert to uppercase and remove non-alphanumeric
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    }

    // Special handling for email - convert to lowercase
    if (field === "email") {
      value = value.toLowerCase();
    }

    // Create updated data
    const updatedData = { ...data, [field]: value };
    
    // Validate field
    const error = validateField(field, value);
    
    // Update errors state
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    // Update data
    onUpdate(updatedData);
    
    // Check if form is valid and notify parent
    const isValid = checkFormValidity();
    
    // Notify parent that form has changes and validity status
    if (onFormChange) {
      onFormChange(true, isValid);
    }
  };

  const handleLogoUpload = async (e) => {
    if (!isAdmin) {
      errorToast("Only admin can upload logo");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      errorToast("Please select an image file (PNG, JPG, JPEG, GIF, SVG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      errorToast("File size should be less than 5MB");
      return;
    }

    try {
      setUploadingLogo(true);

      const response = await uploadFile(
        "/hospital/upload-logo",
        file,
        (progress) => console.log(`Upload progress: ${progress}%`),
      );

      const rawLogoPath = response.data.logo_url;
      const updatedData = { ...data, logo: rawLogoPath };
      onUpdate(updatedData);
      updateLogo(rawLogoPath);
      
      // Check if form is valid
      const isValid = checkFormValidity();
      
      // Notify parent that form has changes
      if (onFormChange) {
        onFormChange(true, isValid);
      }
      
      successToast("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      errorToast(error.response?.data?.detail || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Validate all fields and update errors
  useEffect(() => {
    const newErrors = {};
    
    // Always validate all fields for error display
    // Required fields
    if (!data.hospital_name?.trim()) {
      newErrors.hospital_name = "Hospital name is required";
    } else if (data.hospital_name.trim().length < 3) {
      newErrors.hospital_name = "Hospital name must be at least 3 characters";
    }
    
    if (!data.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!isValidPhoneNumber(data.phone)) {
      newErrors.phone = "Please enter a valid 10-digit mobile number starting with 6,7,8, or 9";
    }
    
    // Emergency contact is optional - only show error if value exists and is invalid
    if (data.emergency_contact && !isValidPhoneNumber(data.emergency_contact)) {
      newErrors.emergency_contact = "Please enter a valid 10-digit emergency contact number";
    }
    
    if (!data.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(data.email)) {
      newErrors.email = "Please enter a valid email address (e.g., name@example.com)";
    }
    
    if (!data.address?.trim()) {
      newErrors.address = "Address is required";
    } else if (data.address.trim().length < 10) {
      newErrors.address = "Please enter a complete address";
    }
    
    // GSTIN is optional - only show error if value exists and is invalid
    if (data.gstin && !isValidGSTIN(data.gstin)) {
      newErrors.gstin = "Invalid GSTIN format. Should be 15 characters (e.g., 27AAPFU0939F1Z5)";
    }
    
    if (data.established_year) {
      const year = parseInt(data.established_year);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        newErrors.established_year = `Year must be between 1900 and ${currentYear}`;
      }
    }

    setErrors(newErrors);
    
    // Notify parent about form validity whenever data changes
    const isValid = checkFormValidity();
    if (onFormChange && isDirty) {
      onFormChange(true, isValid);
    }
  }, [data]);

  // Show loading state while fetching user role
  if (userRole === null) {
    return <div className="p-4">Loading user information...</div>;
  }

  return (
    <div className="space-y-6">
      {!isAdmin && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <p className="text-yellow-700 dark:text-yellow-400 text-sm">
            ⚠️ You are in view-only mode. Only admin can edit hospital information.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Building className="text-[#08994A]" size={24} />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Hospital Information
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Logo & Emergency Contact */}
        <div className="lg:col-span-1 space-y-6">
          {/* Logo Upload */}
          <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-200 dark:border-[#2A2A2A]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Hospital Logo
            </label>
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 rounded-xl border-2 border-dashed border-gray-300 dark:border-[#3A3A3A] flex items-center justify-center overflow-hidden bg-white dark:bg-[#0D0D0D] mb-4">
                {data.logo ? (
                  <img
                    src={getMediaUrl(data.logo)}
                    alt="Hospital Logo"
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      console.error("Failed to load logo in settings:", data.logo);
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4">
                    <Upload className="text-gray-400 mb-2" size={48} />
                    <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      No logo uploaded
                    </span>
                  </div>
                )}
              </div>
              
              {isAdmin && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                  <div
                    className={`px-4 py-2 rounded-lg transition-opacity flex items-center justify-center gap-2 ${
                      uploadingLogo
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#0EFF7B] to-[#08994A] hover:opacity-90 cursor-pointer"
                    } text-white`}
                  >
                    {uploadingLogo ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Upload Logo
                      </>
                    )}
                  </div>
                </label>
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Recommended: 400x400px
                <br />
                PNG or JPG (max 5MB)
              </p>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800/30">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-red-500" size={20} />
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Emergency Contact
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Emergency Phone (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Phone className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={data.emergency_contact || ""}
                    onChange={(e) => handleChange("emergency_contact", e.target.value)}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, emergency_contact: true }))}
                    className={`w-full px-4 py-2 rounded-lg border pl-10 ${
                      errors.emergency_contact
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-[#3A3A3A] focus:ring-[#0EFF7B]"
                    } bg-white dark:bg-[#0D0D0D] focus:ring-2 focus:border-transparent transition-all duration-200`}
                    placeholder="9876543210"
                    maxLength={10}
                    disabled={!isAdmin}
                    readOnly={!isAdmin}
                  />
                </div>
                <p className={`text-red-500 text-xs mt-1 ${errors.emergency_contact ? '' : 'invisible'}`}>{errors.emergency_contact || '\u00A0'}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                24/7 emergency contact number displayed in critical areas
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hospital Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Building className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  value={data.hospital_name || ""}
                  onChange={(e) => handleChange("hospital_name", e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, hospital_name: true }))}
                  className={`w-full px-4 py-2 rounded-lg border pl-10 ${
                    errors.hospital_name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-[#3A3A3A] focus:ring-[#0EFF7B]"
                  } bg-white dark:bg-[#0D0D0D] focus:ring-2 focus:border-transparent transition-all duration-200`}
                  required
                  placeholder="Multispeciality Hospital"
                  disabled={!isAdmin}
                  readOnly={!isAdmin}
                />
              </div>
              <p className={`text-red-500 text-xs mt-1 ${errors.hospital_name ? '' : 'invisible'}`}>{errors.hospital_name || '\u00A0'}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                GSTIN Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Shield className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  value={data.gstin || ""}
                  onChange={(e) => handleChange("gstin", e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, gstin: true }))}
                  className={`w-full px-4 py-2 rounded-lg border pl-10 ${
                    errors.gstin
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-[#3A3A3A] focus:ring-[#0EFF7B]"
                  } bg-white dark:bg-[#0D0D0D] focus:ring-2 focus:border-transparent transition-all duration-200`}
                  placeholder="27AAPFU0939F1Z5"
                  maxLength={15}
                  disabled={!isAdmin}
                  readOnly={!isAdmin}
                />
              </div>
              <p className={`${errors.gstin ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'} text-xs mt-1`}>{errors.gstin || 'Format: 27AAPFU0939F1Z5 (15 characters)'}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Phone className="text-gray-400" size={18} />
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={data.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, phone: true }))}
                  className={`w-full px-4 py-2 rounded-lg border pl-10 ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-[#3A3A3A] focus:ring-[#0EFF7B]"
                  } bg-white dark:bg-[#0D0D0D] focus:ring-2 focus:border-transparent transition-all duration-200`}
                  required
                  placeholder="9876543210"
                  maxLength={10}
                  disabled={!isAdmin}
                  readOnly={!isAdmin}
                />
              </div>
              <p className={`text-red-500 text-xs mt-1 ${errors.phone ? '' : 'invisible'}`}>{errors.phone || '\u00A0'}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="text-gray-400" size={18} />
                </div>
                <input
                  type="email"
                  value={data.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, email: true }))}
                  className={`w-full px-4 py-2 rounded-lg border pl-10 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-[#3A3A3A] focus:ring-[#0EFF7B]"
                  } bg-white dark:bg-[#0D0D0D] focus:ring-2 focus:border-transparent transition-all duration-200`}
                  required
                  placeholder="hospital@example.com"
                  disabled={!isAdmin}
                  readOnly={!isAdmin}
                />
              </div>
              <p className={`text-red-500 text-xs mt-1 ${errors.email ? '' : 'invisible'}`}>{errors.email || '\u00A0'}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Website
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Globe className="text-gray-400" size={18} />
                </div>
                <input
                  type="url"
                  value={data.website || ""}
                  onChange={(e) => handleChange("website", e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, website: true }))}
                  className="w-full px-4 py-2 rounded-lg border pl-10 border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#0D0D0D] focus:ring-2 focus:ring-[#0EFF7B] focus:border-transparent transition-all duration-200"
                  placeholder="https://www.hospital.com"
                  disabled={!isAdmin}
                  readOnly={!isAdmin}
                />
              </div>
              <p className={`text-red-500 text-xs mt-1 invisible`}>{'\u00A0'}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tagline
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Tag className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  value={data.tagline || ""}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, tagline: true }))}
                  className="w-full px-4 py-2 rounded-lg border pl-10 border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#0D0D0D] focus:ring-2 focus:ring-[#0EFF7B] focus:border-transparent transition-all duration-200"
                  placeholder="Your care, our commitment"
                  disabled={!isAdmin}
                  readOnly={!isAdmin}
                />
              </div>
              <p className={`text-red-500 text-xs mt-1 invisible`}>{'\u00A0'}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Established Year
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="text-gray-400" size={18} />
                </div>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={data.established_year || ""}
                  onChange={(e) => handleChange("established_year", e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, established_year: true }))}
                  className={`w-full px-4 py-2 rounded-lg border pl-10 ${
                    errors.established_year
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-[#3A3A3A] focus:ring-[#0EFF7B]"
                  } bg-white dark:bg-[#0D0D0D] focus:ring-2 focus:border-transparent transition-all duration-200`}
                  placeholder="2026"
                  disabled={!isAdmin}
                  readOnly={!isAdmin}
                />
              </div>
              <p className={`text-red-500 text-xs mt-1 ${errors.established_year ? '' : 'invisible'}`}>{errors.established_year || '\u00A0'}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Registration Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FileDigit className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  value={data.registration_number || ""}
                  onChange={(e) =>
                    handleChange("registration_number", e.target.value)
                  }
                  onBlur={() => setTouchedFields(prev => ({ ...prev, registration_number: true }))}
                  className="w-full px-4 py-2 rounded-lg border pl-10 border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#0D0D0D] focus:ring-2 focus:ring-[#0EFF7B] focus:border-transparent transition-all duration-200"
                  placeholder="AP/S3/S/S/"
                  disabled={!isAdmin}
                  readOnly={!isAdmin}
                />
              </div>
              <p className={`text-red-500 text-xs mt-1 invisible`}>{'\u00A0'}</p>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Address *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 pointer-events-none">
                <MapPin className="text-gray-400" size={18} />
              </div>
              <textarea
                value={data.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                onBlur={() => setTouchedFields(prev => ({ ...prev, address: true }))}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg border pl-10 ${
                  errors.address
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-[#3A3A3A] focus:ring-[#0EFF7B]"
                } bg-white dark:bg-[#0D0D0D] focus:ring-2 focus:border-transparent resize-none transition-all duration-200`}
                required
                placeholder="Street, City, State, PIN Code"
                disabled={!isAdmin}
                readOnly={!isAdmin}
              />
            </div>
            <p className={`text-red-500 text-xs mt-1 ${errors.address ? '' : 'invisible'}`}>{errors.address || '\u00A0'}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default HospitalInfo;