import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { X, Calendar, ChevronDown, AlertCircle } from "lucide-react";
import { successToast, errorToast, warningToast } from "../../components/Toast";
import api from "../../utils/axiosConfig"; // Cookie-based axios instance

/* -------------------------------------------------
   TypeAhead Dropdown Component
------------------------------------------------- */
const TypeAheadDropdown = ({
  label,
  value,
  onChange,
  options,
  error,
  disabled = false,
  placeholder = "Type to search...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Filter options based on input value
  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredOptions(options.slice(0, 10)); // Show first 10 when empty
    } else {
      const filtered = options.filter(
        (option) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
          option.value.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered.slice(0, 10)); // Limit to 10 results
    }
  }, [inputValue, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleOptionSelect = (optionValue, optionLabel) => {
    setInputValue(optionLabel);
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-sm text-black dark:text-white">{label}</label>
      <div className="relative mt-1 w-[228px]">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
                       bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]
                       outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]" />
          </div>
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-gray-100 dark:bg-black border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.map((option, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOptionSelect(option.value, option.label)}
                  className={`cursor-pointer select-none py-2 px-3 text-sm rounded-[4px] 
                             hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33] hover:text-[#08994A] dark:hover:text-[#0EFF7B]
                             ${
                               value === option.value
                                 ? "bg-[#08994A33] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B] font-medium"
                                 : "text-black dark:text-[#0EFF7B]"
                             }`}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

/* -------------------------------------------------
   AdmitPatientPopup – Updated with better error handling
------------------------------------------------- */
const AdmitPatientPopup = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    patientId: "",
    bedGroup: "",
    bedNumber: "",
    admitDate: "",
  });
  const [errors, setErrors] = useState({});
  const [bedGroups, setBedGroups] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fetchingPatients, setFetchingPatients] = useState(false);

  // Patient data
  const [allPatients, setAllPatients] = useState([]);
  const [patientNameOptions, setPatientNameOptions] = useState([]);
  const [patientIdOptions, setPatientIdOptions] = useState([]);
  const [patientFetchError, setPatientFetchError] = useState("");

  // Load bed groups AND patients
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bed groups
        const groupsRes = await api.get("/bedgroups/all");
        const groups = groupsRes.data;

        const bedGroupOptions = groups.map((g) => ({
          value: g.bedGroup,
          label: g.bedGroup,
        }));
        setBedGroups(bedGroupOptions);
        if (bedGroupOptions.length > 0) {
          setFormData((prev) => ({
            ...prev,
            bedGroup: bedGroupOptions[0].value,
          }));
        }

        // Fetch patients - with better error handling
        setFetchingPatients(true);
        setPatientFetchError("");
        try {
          const patientsRes = await api.get("/medicine_allocation/edit");
          console.log("Patients API response:", patientsRes);
          
          let patientsData = patientsRes.data;
          
          // Check if response structure is different
          if (!patientsData) {
            console.warn("No patient data received");
            // Try alternative endpoint
            try {
              const altRes = await api.get("/patients/list");
              patientsData = altRes.data;
            } catch (altErr) {
              console.warn("Alternative endpoint also failed");
            }
          }

          // Handle different response structures
          let patientsList = [];
          if (Array.isArray(patientsData)) {
            patientsList = patientsData;
          } else if (patientsData && patientsData.patients) {
            patientsList = patientsData.patients;
          } else if (typeof patientsData === 'object' && patientsData !== null) {
            // Try to extract array from object values
            const values = Object.values(patientsData);
            if (values.length > 0 && Array.isArray(values[0])) {
              patientsList = values[0];
            }
          }

          console.log("Processed patients list:", patientsList);

          if (patientsList.length === 0) {
            setPatientFetchError("No patient data available. Please enter manually.");
          } else {
            setAllPatients(patientsList);

            // Create name options (remove duplicates)
            const nameOptions = Array.from(
              new Map(
                patientsList
                  .filter((p) => p.full_name)
                  .map((p) => [
                    p.full_name,
                    {
                      value: p.full_name,
                      label: p.full_name,
                    },
                  ])
              ).values()
            );

            // Create ID options (remove duplicates)
            const idOptions = Array.from(
              new Map(
                patientsList
                  .filter((p) => p.patient_unique_id)
                  .map((p) => [
                    p.patient_unique_id,
                    {
                      value: p.patient_unique_id,
                      label: p.patient_unique_id,
                    },
                  ])
              ).values()
            );

            setPatientNameOptions(nameOptions);
            setPatientIdOptions(idOptions);
          }
        } catch (patientsError) {
          console.error("Failed to fetch patients data:", patientsError);
          
          let errorMessage = "Could not load patient list";
          if (patientsError.response?.status === 400) {
            errorMessage = "Server error: Database connection issue";
          } else if (patientsError.response?.status === 401 || patientsError.response?.status === 403) {
            errorMessage = "Authentication required. Please refresh the page.";
          } else if (patientsError.response?.status === 404) {
            errorMessage = "Patient endpoint not found. Using manual entry.";
          } else if (patientsError.response?.status === 500) {
            errorMessage = "Server error. Please try again later.";
          } else if (patientsError.message === "Network Error") {
            errorMessage = "Network error. Check your connection.";
          }
          
          setPatientFetchError(errorMessage);
          console.warn("Patient fetch error:", errorMessage);
          
          // Don't show error toast for patient fetch - it's not critical
          // Users can still enter patient details manually
        }
      } catch (err) {
        let errorMessage = "Failed to load bed groups";
        
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            errorMessage = "Session expired. Please login again.";
          } else if (err.response.status === 400) {
            errorMessage = "Invalid request. Please refresh the page.";
          } else {
            errorMessage = err.response.data?.detail || errorMessage;
          }
        } else if (err.request) {
          errorMessage = "Network error. Please check your connection.";
        }
        
        setServerError(errorMessage);
        errorToast(errorMessage);
      } finally {
        setFetchingPatients(false);
      }
    };

    fetchData();
  }, []);

  // Load free beds when group changes
  useEffect(() => {
    if (!formData.bedGroup) return;

    api.get("/bedgroups/all")
      .then((response) => {
        const groups = response.data;
        const group = groups.find((g) => g.bedGroup === formData.bedGroup);
        if (group) {
          const freeBeds = group.beds
            .filter((b) => !b.is_occupied)
            .map((b) => ({
              value: b.bed_number.toString(), // Changed to string value
              label: `Bed ${b.bed_number}`,
              originalNumber: b.bed_number // Keep original number for API
            }))
            .sort(
              (a, b) => a.originalNumber - b.originalNumber
            );

          setAvailableBeds(freeBeds);
          if (freeBeds.length > 0 && !formData.bedNumber) {
            setFormData((prev) => ({ ...prev, bedNumber: freeBeds[0].value }));
          } else {
            setFormData((prev) => ({ ...prev, bedNumber: "" }));
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching bed groups:", err);
        setServerError("Failed to load available beds");
      });
  }, [formData.bedGroup]);

  // Handle patient name selection
  const handlePatientNameSelect = (name) => {
    // Find the patient by name
    const selectedPatient = allPatients.find((p) => p.full_name === name);

    setFormData((prev) => {
      const newData = { ...prev, name: name };

      // If we found a matching patient, auto-fill the ID
      if (selectedPatient && selectedPatient.patient_unique_id) {
        newData.patientId = selectedPatient.patient_unique_id;
      }

      return newData;
    });
  };

  // Handle patient ID selection
  const handlePatientIdSelect = (id) => {
    // Find the patient by ID
    const selectedPatient = allPatients.find((p) => p.patient_unique_id === id);

    setFormData((prev) => {
      const newData = { ...prev, patientId: id };

      // If we found a matching patient, auto-fill the name
      if (selectedPatient && selectedPatient.full_name) {
        newData.name = selectedPatient.full_name;
      }

      return newData;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Patient name is required";
    if (!formData.patientId.trim())
      newErrors.patientId = "Patient ID is required";
    if (!formData.bedGroup) newErrors.bedGroup = "Bed group is required";
    if (!formData.bedNumber) newErrors.bedNumber = "Select a free bed";
    if (!formData.admitDate) newErrors.admitDate = "Admit date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Parse date string to MM/DD/YYYY format
  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return "";
    
    // Check if it's already in MM/DD/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return dateStr;
    }
    
    // If it's in YYYY-MM-DD format (from date picker)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split("-");
      return `${month}/${day}/${year}`;
    }
    
    // Try to parse as Date object
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      }
    } catch (e) {
      console.error("Date parsing error:", e);
    }
    
    return dateStr; // Return as-is if can't parse
  };

  const handleAdmit = async () => {
    if (!validateForm()) {
      errorToast("Please fill all required fields correctly");
      return;
    }

    setLoading(true);
    setServerError("");

    // Extract just the bed number (remove "Bed " prefix if present)
    const bedNumberNum = formData.bedNumber.replace("Bed ", "");
    
    // Format date properly for API
    const formattedAdmitDate = formatDateForAPI(formData.admitDate);

    try {
      console.log("Sending admit request with data:", {
        full_name: formData.name,
        patient_unique_id: formData.patientId,
        bed_group_name: formData.bedGroup,
        bed_number: bedNumberNum,
        admission_date: formattedAdmitDate,
      });

      const response = await api.post("/bedgroups/admit", {
        full_name: formData.name,
        patient_unique_id: formData.patientId,
        bed_group_name: formData.bedGroup,
        bed_number: parseInt(bedNumberNum), // Send as integer
        admission_date: formattedAdmitDate,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // SUCCESS TOAST
      successToast(
        `Patient "${formData.name}" admitted to ${formData.bedGroup} - Bed ${bedNumberNum}!`
      );

      // Notify parent to refresh
      if (onSuccess) onSuccess();

      // Close after delay
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      let errorMessage = "Failed to admit patient.";
      let detailedErrors = {};
      
      if (err.response) {
        console.error("Error response:", err.response.data);
        
        if (err.response.status === 422) {
          // Handle FastAPI validation errors
          if (err.response.data.detail) {
            if (Array.isArray(err.response.data.detail)) {
              // Parse FastAPI validation errors
              err.response.data.detail.forEach((error) => {
                const field = error.loc?.[1] || error.loc?.[0] || 'general';
                detailedErrors[field] = error.msg;
              });
              errorMessage = "Please fix the validation errors";
            } else if (typeof err.response.data.detail === 'object') {
              // Handle object type errors
              errorMessage = err.response.data.detail.message || errorMessage;
              detailedErrors = err.response.data.detail;
            } else {
              errorMessage = err.response.data.detail || errorMessage;
            }
          }
          setErrors(detailedErrors);
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.detail || "Invalid data.";
        } else if (err.response.status === 404) {
          errorMessage = "Patient or bed not found.";
        } else if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = "Session expired. Please login again.";
        } else if (err.response.status === 409) {
          errorMessage = err.response.data?.detail || "Bed is already occupied.";
        } else if (err.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = err.response.data?.detail || errorMessage;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setServerError(errorMessage);
      errorToast(errorMessage);
      console.error("Admit Patient Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Parse date string for DatePicker
  const parseDateForPicker = (dateStr) => {
    if (!dateStr) return null;
    
    // Try MM/DD/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [month, day, year] = dateStr.split("/").map(Number);
      return new Date(year, month - 1, day);
    }
    
    // Try YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    
    // Try parsing as Date
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  // Format date for display
  const formatDateForDisplay = (date) => {
    if (!date) return "";
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Get today's date for minDate
  const getToday = () => {
    const today = new Date();
    return today;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 font-[Helvetica] z-50">
      <div
        className="w-[504px] h-auto rounded-[20px] bg-gray-100 dark:bg-[#000000E5] text-black dark:text-white p-6 relative"
        style={{
          boxShadow: "0px 0px 4px 0px rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Gradient Border */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "20px",
            padding: "2px",
            background:
              "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            pointerEvents: "none",
            zIndex: 0,
          }}
        ></div>

        {/* Header */}
        <div className="flex justify-between items-center pb-3 mb-4">
          <h3 className="font-inter font-medium text-[16px] leading-[19px]">
            Admit Patient
          </h3>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full border border-[#08994A1A] dark:border-[#0EFF7B1A] bg-[#08994A1A] dark:bg-[#0EFF7B1A] flex items-center justify-center hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
          >
            <X size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
          </button>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300 text-sm">
                {typeof serverError === 'object' ? JSON.stringify(serverError) : serverError}
              </span>
            </div>
          </div>
        )}

        {/* Patient fetch warning (non-blocking) */}
        {patientFetchError && (
          <div className="mb-4 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-700 dark:text-yellow-300 text-sm">
                {patientFetchError}
              </span>
            </div>
          </div>
        )}

        {/* Form Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Patient Name - TypeAhead Dropdown */}
          <div>
            <label className="text-sm">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <TypeAheadDropdown
              label=""
              value={formData.name}
              onChange={handlePatientNameSelect}
              options={patientNameOptions}
              error={errors.name || errors.full_name}
              placeholder={
                fetchingPatients ? "Loading patients..." : 
                patientNameOptions.length > 0 ? "Type patient name..." :
                "Enter patient name"
              }
              disabled={fetchingPatients}
            />
            {fetchingPatients && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Loading patient list...
              </div>
            )}
          </div>

          {/* Patient ID - TypeAhead Dropdown */}
          <div>
            <label className="text-sm">
              Patient ID <span className="text-red-500">*</span>
            </label>
            <TypeAheadDropdown
              label=""
              value={formData.patientId}
              onChange={handlePatientIdSelect}
              options={patientIdOptions}
              error={errors.patientId || errors.patient_unique_id}
              placeholder={
                fetchingPatients ? "Loading patients..." : 
                patientIdOptions.length > 0 ? "Type patient ID..." :
                "Enter patient ID"
              }
              disabled={fetchingPatients}
            />
            {fetchingPatients && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Loading patient list...
              </div>
            )}
          </div>

          {/* Bed Group - TypeAhead Dropdown */}
          <div>
            <label className="text-sm text-black dark:text-white">
              Bed Group <span className="text-red-500">*</span>
            </label>
            <TypeAheadDropdown
              label=""
              value={formData.bedGroup}
              onChange={(v) =>
                setFormData({ ...formData, bedGroup: v, bedNumber: "" })
              }
              options={bedGroups}
              error={errors.bedGroup || errors.bed_group_name}
              placeholder="Type bed group..."
            />
          </div>

          {/* Bed Number - TypeAhead Dropdown */}
          <div>
            <label className="text-sm text-black dark:text-white">
              Bed Number <span className="text-red-500">*</span>
            </label>
            <TypeAheadDropdown
              label=""
              value={formData.bedNumber ? `Bed ${formData.bedNumber}` : ""}
              onChange={(v) => {
                // Extract just the bed number from "Bed X" format
                const bedNum = v.replace("Bed ", "");
                setFormData({ ...formData, bedNumber: bedNum });
              }}
              options={availableBeds}
              error={errors.bedNumber}
              disabled={!availableBeds.length}
              placeholder={
                availableBeds.length
                  ? "Type bed number..."
                  : "No beds available"
              }
            />
          </div>

          {/* Admit Date */}
          <div>
            <label className="text-sm">
              Admit Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DatePicker
                selected={parseDateForPicker(formData.admitDate)}
                onChange={(date) => {
                  const formatted = date ? formatDateForDisplay(date) : "";
                  setFormData({ ...formData, admitDate: formatted });
                }}
                dateFormat="MM/dd/yyyy"
                placeholderText="MM/DD/YYYY"
                minDate={getToday()} // Prevent past dates
                className="w-[228px] h-[33px] mt-1 px-3 pr-10 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] 
                           bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none
                           focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] text-sm"
                wrapperClassName="w-full"
                popperClassName="z-50"
                popperPlacement="bottom-start"
                showPopperArrow={false}
                customInput={
                  <input
                    style={{
                      paddingRight: "2.5rem",
                      fontSize: "14px",
                      lineHeight: "16px",
                    }}
                  />
                }
              />
              <div className="absolute right-3 top-3.5 pointer-events-none">
                <Calendar
                  size={18}
                  className="text-[#08994A] dark:text-[#0EFF7B]"
                />
              </div>
            </div>
            {errors.admitDate && (
              <p className="text-red-500 text-xs mt-1">{errors.admitDate}</p>
            )}
            {errors.admission_date && (
              <p className="text-red-500 text-xs mt-1">{errors.admission_date}</p>
            )}
          </div>
        </div>

        {/* Info message about manual entry */}
        {(patientFetchError && !fetchingPatients) && (
          <div className="mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <span className="text-blue-700 dark:text-blue-300 text-sm">
                You can still admit patients by manually typing patient name and ID.
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-[18px] mt-8">
          <button
            onClick={onClose}
            className="w-[104px] h-[33px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] 
                       bg-gray-100 dark:bg-[#1E1E1E] text-black dark:text-white font-medium text-[14px] leading-[16px] hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
          >
            Cancel
          </button>
          <button
            onClick={handleAdmit}
            disabled={loading || fetchingPatients}
            style={{
              background:
                "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
            }}
            className="w-[104px] h-[33px] rounded-[8px] border-b-[2px] border-[#0EFF7B66] text-white font-medium text-[14px] leading-[16px] hover:bg-[#0cd968] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Admitting..." : "Admit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdmitPatientPopup;