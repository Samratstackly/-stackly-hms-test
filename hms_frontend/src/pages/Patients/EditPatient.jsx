import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { X, Calendar, ChevronDown, Upload, Loader2 } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { successToast, errorToast } from "../../components/Toast.jsx";
import api from "../../utils/axiosConfig";

const EditPatientPopup = ({
  patientId,
  patient: initialPatient,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("/default-avatar.png");
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/patients/departments");
        setDepartments(response.data.departments || []);
      } catch (err) {
        console.error("Failed to load departments:", err);
        errorToast("Failed to load departments");
      }
    };
    fetchDepartments();
  }, []);

  // Fetch patient and initialize
  useEffect(() => {
    if (initialPatient) {
      initializeForm(initialPatient);
      return;
    }
    if (!patientId) return;

    const fetchPatient = async () => {
      try {
        setError("");
        const response = await api.get(`/patients/${patientId}`);
        initializeForm(response.data);
      } catch (err) {
        console.error("Failed to fetch patient:", err);
        errorToast("Patient not found");
        onClose();
      }
    };
    fetchPatient();
  }, [patientId, initialPatient, onClose]);

  // Initialize form data
  const initializeForm = (p) => {
    const data = {
      id: p.id,
      patient_unique_id: p.patient_unique_id || "",
      full_name: p.full_name || "",
      phone_number: p.phone_number || "",
      department_id: p.department_id || "",
      staff_id: p.staff_id || "",
      appointment_type: p.appointment_type || "Check-up",
      status: p.casualty_status || "Active",
      date_of_registration: p.date_of_registration || "", // Expected: YYYY-MM-DD or MM/dd/yyyy
      photo_file: null,
      photo_url: p.photo_url || "/default-avatar.png",
    };

    setFormData(data);
    setPreviewUrl(p.photo_url || "/default-avatar.png");
  };

  // Load doctors when department changes
  const loadDoctors = async (deptId) => {
    if (!deptId) {
      setDoctors([]);
      return;
    }
    setDoctorsLoading(true);
    try {
      const response = await api.get("/patients/staff", { 
        params: { department_id: deptId } 
      });
      setDoctors(response.data.staff || []);
    } catch (err) {
      console.error("Failed to load doctors:", err);
      errorToast("Failed to load doctors");
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  useEffect(() => {
    if (formData?.department_id) {
      loadDoctors(formData.department_id);
    } else {
      setDoctors([]);
    }
  }, [formData?.department_id]);

  // Photo preview
  useEffect(() => {
    if (formData?.photo_file) {
      const url = URL.createObjectURL(formData.photo_file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [formData?.photo_file]);

  // Date helpers
  const parseDateForPicker = (dateStr) => {
    if (!dateStr) return null;
    // Handle both YYYY-MM-DD and MM/dd/yyyy
    const parts = dateStr.split(/[-/]/);
    if (parts.length !== 3) return null;
    const [y, m, d] =
      parts[0].length === 4
        ? [parts[0], parts[1], parts[2]]
        : [parts[2], parts[0], parts[1]];
    return new Date(y, m - 1, d);
  };

  const formatDateForDisplay = (date) => {
    if (!date) return "";
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
      date.getDate()
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const formatDateForBackend = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length !== 3) return "";
    const [m, d, y] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`; // YYYY-MM-DD
  };

  // Phone validation (exactly 10 digits)
  const isValidPhoneNumber = (phone) => {
  // Must be exactly 10 digits
  if (!/^\d{10}$/.test(phone)) return false;
  
  // Check for invalid patterns
  const invalidPatterns = [
    /^0+$/,                         // All zeros
    /^1+$/,                         // All ones
    /^2+$/,                         // All twos (and so on...)
    /^3+$/,
    /^4+$/,
    /^5+$/,
    /^6+$/,
    /^7+$/,
    /^8+$/,
    /^9+$/,
    /^(\d)\1{9}$/,                  // All same digit
    /^1234567890$/,                 // Sequential ascending
    /^0987654321$/,                 // Sequential descending
    /^(\d{2})\1{4}$/,               // Repeated pairs (e.g., 1212121212)
    /^(\d{3})\1{2}\d{1}$/,          // Repeated triplets
    /^(\d{5})\1$/,                  // Repeated 5-digit pattern
  ];
  
  // Check if phone matches any invalid pattern
  return !invalidPatterns.some(pattern => pattern.test(phone));
};

// Update the handlePhoneChange function:
const handlePhoneChange = (value) => {
  const digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly.length <= 10) {
    setFormData((prev) => ({ ...prev, phone_number: digitsOnly }));
    
    if (digitsOnly.length === 10) {
      if (isValidPhoneNumber(digitsOnly)) {
        setPhoneError("");
      } else {
        setPhoneError("Please enter a valid phone number");
      }
    } else if (digitsOnly.length > 0) {
      setPhoneError("Phone number must be exactly 10 digits");
    } else {
      setPhoneError("");
    }
  }
};
  // Department change → clear doctor
  const handleDeptChange = (deptId) => {
    setFormData((prev) => ({
      ...prev,
      department_id: deptId,
      staff_id: "",
    }));
  };

  // Submit update
  const handleUpdate = async () => {
    // Final phone validation
    if (formData.phone_number.length !== 10) {
    setPhoneError("Phone number must be exactly 10 digits");
    errorToast("Please enter a valid 10-digit phone number");
    return;
  }
  
  if (!isValidPhoneNumber(formData.phone_number)) {
    setPhoneError("Please enter a valid phone number");
    errorToast("Please enter a valid phone number (e.g., 9876543210)");
    return;
  }

    if (!formData?.patient_unique_id) {
      errorToast("Patient ID is missing!");
      return;
    }

    const payload = {
      full_name: formData.full_name.trim(),
      phone_number: formData.phone_number,
      appointment_type: formData.appointment_type,
      status: formData.status,
      date_of_registration: formatDateForBackend(formData.date_of_registration),
      department_id: formData.department_id || null,
      staff_id: formData.staff_id || null,
    };

    if (formData.photo_file) {
      payload.photo = formData.photo_file;
    }

    try {
      setError("");
      const formDataToSend = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formDataToSend.append(key, value);
        }
      });

      await api.put(`/patients/${formData.patient_unique_id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      successToast(`Patient "${formData.full_name}" updated successfully!`);
      onUpdate?.();
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || "Update failed";
      setError(errorMessage);
      errorToast(errorMessage);
    }
  };

  // Reusable Dropdown
  const Dropdown = ({
    label,
    value,
    onChange,
    options = [],
    disabled = false,
    placeholder = "Select",
    loading = false,
  }) => {
    const selectedLabel =
      options.find((o) => o.id === value)?.name ||
      options.find((o) => o.id === value)?.full_name ||
      value ||
      placeholder;

    return (
      <div>
        <label className="text-sm text-black dark:text-white block mb-1">
          {label}
        </label>
        <Listbox
          value={value}
          onChange={onChange}
          disabled={disabled || loading}
        >
          <div className="relative">
            <Listbox.Button
              className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border flex items-center justify-between text-left text-[14px] truncate ${
                disabled || loading
                  ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-70"
                  : "border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent"
              } text-black dark:text-[#0EFF7B]`}
            >
              <span>{loading ? "Loading..." : selectedLabel}</span>
              {!loading && (
                <ChevronDown className="h-4 w-4 text-[#0EFF7B] absolute right-2" />
              )}
            </Listbox.Button>
            <Listbox.Options className="absolute z-[100] mt-1 w-full rounded-[12px] bg-gray-100 dark:bg-black shadow-lg border border-[#0EFF7B] dark:border-[#3A3A3A] max-h-[150px] overflow-auto">
              {options.length === 0 && !loading ? (
                <div className="py-2 px-3 text-sm text-gray-500">
                  No options
                </div>
              ) : (
                options.map((opt) => (
                  <Listbox.Option
                    key={opt.id}
                    value={opt.id}
                    className={({ active }) =>
                      `cursor-pointer py-2 px-3 text-sm ${
                        active ? "bg-[#0EFF7B33] text-[#0EFF7B]" : ""
                      }`
                    }
                  >
                    {opt.name || opt.full_name || opt}
                  </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>
    );
  };

  const appointmentTypes = ["Check-up", "Follow-up", "Emergency"];
  const statuses = [
    "Active",
    "New",
    "Normal",
    "Severe",
    "Completed",
    "Cancelled",
  ];

  if (!formData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
        <div className="flex items-center gap-3 text-white text-lg">
          <Loader2 className="animate-spin h-6 w-6" />
          Loading patient data...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4 font-[Helvetica]">
      <div className="w-full max-w-4xl rounded-[20px] p-[1px] backdrop-blur-md shadow-xl bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70">
        <div className="rounded-[19px] bg-gray-100 dark:bg-[#000000] p-4 sm:p-6 shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center pb-3 mb-1">
            <h3 className="text-black dark:text-white font-medium text-[16px]">
              Edit Patient
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-[#0EFF7B] bg-gray-100 dark:bg-[#0EFF7B1A] flex items-center justify-center hover:scale-110 transition"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Photo */}
<div className="flex flex-col items-center mb-6">
  <div className="relative group">
    <img
      src={previewUrl}
      alt="Profile"
      className="w-24 h-24 rounded-full object-cover border-2 border-[#0EFF7B] shadow-md"
    />
    <label
      htmlFor="photo-upload"
      className="absolute bottom-0 right-0 bg-gradient-to-r from-[#025126] to-[#0D7F41] p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition"
    >
      <Upload size={16} className="text-white" />
      <input
        id="photo-upload"
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            // Clear the file input first to allow re-selection
            e.target.value = '';
            
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
              errorToast("File size exceeds 5MB limit. Please choose a smaller file.");
              return;
            }
            
            // Check file type
            const validTypes = ["image/jpeg", "image/jpg", "image/png"];
            if (!validTypes.includes(file.type)) {
              errorToast("Invalid file type. Please upload JPG, JPEG, or PNG files only.");
              return;
            }
            
            setFormData((prev) => ({ ...prev, photo_file: file }));
          }
        }}
      />
    </label>
  </div>
  {/* Help text for photo upload */}
  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
    Supported formats: JPG, JPEG, PNG (Max 5MB)
  </p>
</div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Column 1 */}
            <div className="space-y-6">
              <div>
                <label className="text-sm text-black dark:text-white block mb-1">
                  Patient Name
                </label>
                <input
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  placeholder="Enter name"
                  className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none text-sm"
                />
              </div>

              <Dropdown
                label="Department"
                value={formData.department_id}
                onChange={handleDeptChange}
                options={departments}
                placeholder="Select Department"
              />

              <div>
                <label className="text-sm text-black dark:text-white block mb-1">
                  Registration Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={parseDateForPicker(formData.date_of_registration)}
                    onChange={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        date_of_registration: formatDateForDisplay(date),
                      }))
                    }
                    maxDate={new Date()} // Prevent future dates
                    dateFormat="MM/dd/yyyy"
                    placeholderText="MM/DD/YYYY"
                    className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none text-sm"
                    wrapperClassName="w-full"
                    popperClassName="z-[100]"
                  />
                  <Calendar
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0EFF7B] pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <div>
                <label className="text-sm text-black dark:text-white block mb-1">
                  ID (Internal)
                </label>
                <input
                  value={formData.id}
                  readOnly
                  className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] bg-gray-100 dark:bg-gray-800 text-black dark:text-gray-400 cursor-not-allowed text-sm"
                />
              </div>

              <Dropdown
                label="Doctor"
                value={formData.staff_id}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, staff_id: val }))
                }
                options={doctors}
                placeholder={
                  doctorsLoading
                    ? "Loading..."
                    : !formData.department_id
                    ? "Select Dept First"
                    : "Select Doctor"
                }
                disabled={!formData.department_id}
                loading={doctorsLoading}
              />

              <Dropdown
                label="Status"
                value={formData.status}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, status: val }))
                }
                options={statuses.map((s) => ({ id: s, name: s }))}
              />
            </div>

            {/* Column 3 */}
            <div className="space-y-6">
              <div>
                <label className="text-sm text-black dark:text-white block mb-1">
                  Patient ID
                </label>
                <input
                  value={formData.patient_unique_id || ""}
                  readOnly
                  className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] bg-gray-100 dark:bg-gray-800 text-black dark:text-gray-400 cursor-not-allowed text-sm"
                />
              </div>

              <div>
                <label className="text-sm text-black dark:text-white block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="Enter 10-digit phone"
                  maxLength="10"
                  className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none text-sm"
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                )}
              </div>

              <Dropdown
                label="Appointment Type"
                value={formData.appointment_type}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, appointment_type: val }))
                }
                options={appointmentTypes.map((t) => ({ id: t, name: t }))}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
            <button
              onClick={onClose}
              className="w-full sm:w-[144px] h-[34px] rounded-[8px] border border-[#0EFF7B] bg-gray-100 dark:bg-transparent text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="w-full sm:w-[144px] h-[34px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white border-b-[2px] border-[#0EFF7B] hover:scale-105 transition flex items-center justify-center"
            >
              Update Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPatientPopup;