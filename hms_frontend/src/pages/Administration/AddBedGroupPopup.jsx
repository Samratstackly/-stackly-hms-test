import React, { useState } from "react";
import { X, AlertTriangle, Check } from "lucide-react";
import { successToast, errorToast } from "../../components/Toast";
import api from "../../utils/axiosConfig"; // Cookie-based axios instance

const AddBedGroupPopup = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    bedGroupName: "",
    bedFrom: "",
    bedTo: "",
  });

  // Validation states
  const [validationErrors, setValidationErrors] = useState({}); // Format validation
  const [fieldErrors, setFieldErrors] = useState({}); // Required validation (submit only)
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Duplicate checking states
  const [duplicateBeds, setDuplicateBeds] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [suggestedRange, setSuggestedRange] = useState("");
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [rangeAvailable, setRangeAvailable] = useState(true);

  /* ---------- Format Validation Functions (while typing) ---------- */
  const validateBedGroupNameFormat = (value) => {
    if (value.trim() && !/^[A-Za-z0-9\s&.,'-]+$/.test(value))
      return "Bed group name can contain letters, numbers, spaces, &, ., ,, ' and -";
    if (value.trim().length < 2)
      return "Bed group name must be at least 2 characters";
    if (value.trim().length > 50)
      return "Bed group name cannot exceed 50 characters";
    return "";
  };

  const validateBedFromFormat = (value) => {
    if (value.trim() && (isNaN(value) || parseInt(value) <= 0))
      return "Starting bed number must be a positive number";
    if (value.trim() && parseInt(value) > 999)
      return "Starting bed number cannot exceed 999";
    return "";
  };

  const validateBedToFormat = (value) => {
    if (value.trim() && (isNaN(value) || parseInt(value) <= 0))
      return "Ending bed number must be a positive number";
    if (value.trim() && parseInt(value) > 999)
      return "Ending bed number cannot exceed 999";
    if (
      value.trim() &&
      formData.bedFrom.trim() &&
      parseInt(value) <= parseInt(formData.bedFrom)
    ) {
      return "Ending number must be greater than starting number";
    }
    return "";
  };

  /* ---------- Required Field Validation (only for submission) ---------- */
  const validateRequiredFields = () => {
    const errors = {};
    let isValid = true;

    if (!formData.bedGroupName.trim()) {
      errors.bedGroupName = "Bed group name is required";
      isValid = false;
    }

    if (!formData.bedFrom) {
      errors.bedFrom = "Starting bed number is required";
      isValid = false;
    }

    if (!formData.bedTo) {
      errors.bedTo = "Ending bed number is required";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  /* ---------- Capitalize Functions ---------- */
  const capitalizeWords = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  /* ---------- Check for Duplicate Bed Numbers ---------- */
  const checkForDuplicates = async () => {
  const fromNum = parseInt(formData.bedFrom);
  const toNum = parseInt(formData.bedTo);

  if (isNaN(fromNum) || isNaN(toNum) || fromNum > toNum) {
    return { available: false };
  }

  setCheckingDuplicates(true);
  try {
    const response = await api.post("/bedgroups/check-range", {
      bedFrom: fromNum,
      bedTo: toNum,
    });

    setRangeAvailable(response.data.available);
    return response.data;
  } catch (error) {
    console.error("Error checking duplicates:", error);
    
    // If we get a 409 conflict, parse the response properly
    if (error.response?.status === 409) {
      const errorData = error.response.data;
      // Check different possible structures
      if (errorData.detail && typeof errorData.detail === 'object') {
        return {
          available: false,
          duplicates: errorData.detail.duplicates || [],
          suggested_range: errorData.detail.suggested_range || "",
          message: errorData.detail.message || "Duplicate bed numbers found"
        };
      } else if (errorData.duplicates) {
        // Direct structure
        return {
          available: false,
          duplicates: errorData.duplicates || [],
          suggested_range: errorData.suggested_range || "",
          message: errorData.message || "Duplicate bed numbers found"
        };
      }
    }
    
    return { available: false };
  } finally {
    setCheckingDuplicates(false);
  }
};

  /* ---------- Handle Input Change ---------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Apply auto-capitalization for bed group name
    if (name === "bedGroupName") {
      processedValue = capitalizeWords(value);
    }

    // Allow only numbers for bed numbers
    if (name === "bedFrom" || name === "bedTo") {
      processedValue = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Clear validation errors for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Reset range availability when user changes range
    if ((name === "bedFrom" || name === "bedTo") && value) {
      setRangeAvailable(true);
    }

    // Perform real-time format validation
    let formatError = "";
    switch (name) {
      case "bedGroupName":
        formatError = validateBedGroupNameFormat(processedValue);
        break;
      case "bedFrom":
        formatError = validateBedFromFormat(processedValue);
        // Also trigger re-validation of bedTo when bedFrom changes
        if (formData.bedTo) {
          const bedToError = validateBedToFormat(formData.bedTo);
          if (bedToError) {
            setValidationErrors((prev) => ({
              ...prev,
              bedTo: bedToError,
            }));
          } else if (validationErrors.bedTo) {
            setValidationErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.bedTo;
              return newErrors;
            });
          }
        }
        break;
      case "bedTo":
        formatError = validateBedToFormat(processedValue);
        break;
      default:
        break;
    }

    if (formatError) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: formatError,
      }));
    }
  };

  /* ---------- Validate Form Before Submission ---------- */
  const validateForm = () => {
    // First check required fields
    const requiredValid = validateRequiredFields();

    // Then check format validation
    const formatErrors = {
      bedGroupName: validateBedGroupNameFormat(formData.bedGroupName),
      bedFrom: validateBedFromFormat(formData.bedFrom),
      bedTo: validateBedToFormat(formData.bedTo),
    };

    // Update validation errors for display
    setValidationErrors(formatErrors);

    const formatValid = !Object.values(formatErrors).some(
      (error) => error !== ""
    );

    setIsSubmitted(true);
    return requiredValid && formatValid;
  };

  const handleAdd = async () => {
    // Validate all fields
    if (!validateForm()) {
      errorToast("Please fix all validation errors before saving.");
      return;
    }

    // Check for duplicates first
    const checkResult = await checkForDuplicates();

    if (!checkResult.available) {
      setDuplicateBeds(checkResult.duplicates || []);
      setSuggestedRange(checkResult.suggested_range || "");
      setShowDuplicateWarning(true);
      return;
    }

    // No duplicates, proceed with creation
    proceedWithCreation();
  };

  const proceedWithCreation = async () => {
  setLoading(true);
  setServerError("");

  const fromNum = parseInt(formData.bedFrom);
  const toNum = parseInt(formData.bedTo);

  const payload = {
    bedGroup: formData.bedGroupName.trim(),
    bedFrom: fromNum,
    bedTo: toNum,
  };

  try {
    const response = await api.post("/bedgroups/add-with-range", payload);

    // IMPORTANT: The backend returns BedGroupResponse structure
    const newGroup = response.data;
    
    // Calculate bed range from the beds array
    const beds = newGroup.beds || [];
    const bedNumbers = beds.map(b => b.bed_number).sort((a, b) => a - b);
    const bedRange = bedNumbers.length > 0
      ? `${bedNumbers[0]}-${bedNumbers[bedNumbers.length - 1]}`
      : "1-1";

    // Create the structure that your parent component expects
    const transformedGroup = {
      id: newGroup.id,
      bedGroup: newGroup.bedGroup,
      capacity: newGroup.capacity,
      occupied: newGroup.occupied,
      unoccupied: newGroup.unoccupied,
      status: newGroup.status,
      bedRange: bedRange,
      beds: beds,
    };

    successToast(`"${newGroup.bedGroup}" created successfully!`);

    // Pass the transformed data to parent
    if (onAdd) onAdd(transformedGroup);

    setTimeout(() => {
      onClose();
    }, 600);
  } catch (error) {
  console.error("Create BedGroup Error:", error);

  /* =========================
     FASTAPI 422 HANDLING
     ========================= */
  if (error.response?.status === 422) {
    const details = error.response.data?.detail;

    let message = "Validation error";

    if (Array.isArray(details)) {
      message = details
        .map(d => `${d.loc?.join(".")}: ${d.msg}`)
        .join(", ");
    } else if (typeof details === "string") {
      message = details;
    }

    errorToast(message);
    setServerError(message);
    setLoading(false);
    return;
  }

  /* =========================
     DUPLICATE RANGE (409)
     ========================= */
  if (error.response?.status === 409) {
    const data = error.response.data?.detail || error.response.data;

    setDuplicateBeds(data?.duplicates || []);
    setSuggestedRange(data?.suggested_range || "");
    setShowDuplicateWarning(true);
    setLoading(false);
    return;
  }

  /* =========================
     OTHER ERRORS
     ========================= */
  let errorMessage = "Failed to create bed group.";

  if (error.response?.data?.detail) {
    errorMessage =
      typeof error.response.data.detail === "string"
        ? error.response.data.detail
        : JSON.stringify(error.response.data.detail);
  } else if (error.message) {
    errorMessage = error.message;
  }

  errorToast(errorMessage);
  setServerError(errorMessage);
  setLoading(false);
}

};

  const handleAutoAdjust = () => {
    if (suggestedRange) {
      const [suggestedFrom, suggestedTo] = suggestedRange
        .split("-")
        .map((num) => parseInt(num));
      setFormData((prev) => ({
        ...prev,
        bedFrom: suggestedFrom.toString(),
        bedTo: suggestedTo.toString(),
      }));
      setShowDuplicateWarning(false);
      successToast(`Bed numbers auto-adjusted to ${suggestedRange}`);
    }
  };

  const handleUseDifferentRange = () => {
    setShowDuplicateWarning(false);
    // Focus on the bedFrom input so user can change it
    document.getElementById("bedFromInput")?.focus();
  };

  const calculateCapacity = () => {
    const fromNum = parseInt(formData.bedFrom);
    const toNum = parseInt(formData.bedTo);

    if (!isNaN(fromNum) && !isNaN(toNum) && fromNum <= toNum) {
      return toNum - fromNum + 1;
    }
    return 0;
  };

  return (
    <>
      {/* Main Add Popup */}
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 font-[Helvetica]">
        <div
          className="w-[420px] h-auto rounded-[20px]  
        bg-gray-100 dark:bg-[#000000E5] text-black dark:text-white p-6 shadow-md backdrop-blur-md relative"
        >
          {/* Gradient Border */}
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
          ></div>

          {/* Header */}
          <div className="flex justify-between items-center pb-3 mb-4">
            <h3 className="font-inter font-medium text-[16px] leading-[19px] text-black dark:text-white">
              Add Bed Group
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] 
              flex items-center justify-center"
            >
              <X size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Bed Group Name */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Bed Group Name <span className="text-red-500">*</span>
              </label>
              <input
                name="bedGroupName"
                value={formData.bedGroupName}
                onChange={handleInputChange}
                onFocus={() => setFocusedField("bedGroupName")}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g., ICU, Ward, General"
                className={`w-full h-[33px] mt-1 px-3 rounded-[8px] border 
                  ${
                    focusedField === "bedGroupName"
                      ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]"
                      : "border-[#0EFF7B] dark:border-[#0D0D0D]"
                  }
                  bg-gray-100 dark:bg-black text-[#08994A] dark:text-[#0EFF7B] placeholder-gray-500 
                  outline-none`}
              />
              {/* Format validation error - shows while typing */}
              {validationErrors.bedGroupName && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.bedGroupName}
                </p>
              )}
              {/* Required field error - only shows after submit attempt */}
              {fieldErrors.bedGroupName && !validationErrors.bedGroupName && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.bedGroupName}
                </p>
              )}
            </div>

            {/* Bed Numbers (From - To) */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Bed No's <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1/2">
                  <input
                    id="bedFromInput"
                    type="number"
                    name="bedFrom"
                    value={formData.bedFrom}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("bedFrom")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="From"
                    className={`w-full h-[33px] px-3 rounded-[8px] border 
                      ${
                        focusedField === "bedFrom"
                          ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]"
                          : "border-[#0EFF7B] dark:border-[#0D0D0D]"
                      }
                      bg-gray-100 dark:bg-black text-[#08994A] dark:text-[#0EFF7B] placeholder-gray-500 
                      outline-none`}
                  />
                  {/* Format validation error - shows while typing */}
                  {validationErrors.bedFrom && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.bedFrom}
                    </p>
                  )}
                  {/* Required field error - only shows after submit attempt */}
                  {fieldErrors.bedFrom && !validationErrors.bedFrom && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.bedFrom}
                    </p>
                  )}
                </div>
                <span className="text-gray-600 dark:text-gray-300">to</span>
                <div className="w-1/2">
                  <input
                    type="number"
                    name="bedTo"
                    value={formData.bedTo}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("bedTo")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="To"
                    className={`w-full h-[33px] px-3 rounded-[8px] border 
                      ${
                        focusedField === "bedTo"
                          ? "border-[#0EFF7B] ring-1 ring-[#0EFF7B]"
                          : "border-[#0EFF7B] dark:border-[#0D0D0D]"
                      }
                      bg-gray-100 dark:bg-black text-[#08994A] dark:text-[#0EFF7B] placeholder-gray-500 
                      outline-none`}
                  />
                  {/* Format validation error - shows while typing */}
                  {validationErrors.bedTo && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.bedTo}
                    </p>
                  )}
                  {/* Required field error - only shows after submit attempt */}
                  {fieldErrors.bedTo && !validationErrors.bedTo && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.bedTo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Range Availability Indicator */}
            {formData.bedFrom &&
              formData.bedTo &&
              !validationErrors.bedFrom &&
              !validationErrors.bedTo && (
                <div
                  className={`p-3 rounded-lg ${
                    rangeAvailable
                      ? "bg-green-50 dark:bg-green-900/30"
                      : "bg-yellow-50 dark:bg-yellow-900/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {checkingDuplicates ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#0EFF7B] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Checking availability...
                        </span>
                      </>
                    ) : rangeAvailable ? (
                      <>
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-700 dark:text-green-400">
                          Bed range {formData.bedFrom}-{formData.bedTo} is
                          available
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm text-yellow-700 dark:text-yellow-400">
                          Bed range {formData.bedFrom}-{formData.bedTo} may have
                          duplicates
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

            {/* Calculated Capacity */}
            <div className="bg-[#0EFF7B1A] dark:bg-[#0EFF7B0D] p-3 rounded-lg">
              <p className="text-sm text-black dark:text-white">
                Calculated Capacity:{" "}
                <span className="text-[#08994A] dark:text-[#0EFF7B] font-medium">
                  {calculateCapacity()} beds
                </span>
              </p>
            </div>

            {/* Server error display */}
            {serverError && (
              <p className="text-red-500 text-xs mt-2">{serverError}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-[104px] h-[33px] rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] 
              px-3 py-2 text-[#08994A] dark:text-white font-medium text-[14px] 
              hover:bg-[#0EFF7B1A] dark:hover:bg-[#3A3A3A] transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={
                loading ||
                checkingDuplicates ||
                Object.values(validationErrors).some((error) => error !== "")
              }
              className="w-[104px] h-[33px] rounded-[8px] text-white font-medium text-[14px] 
              transition border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66]
              disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
              }}
            >
              {loading ? "Adding…" : "Add"}
            </button>
          </div>
        </div>
      </div>

      {/* Duplicate Bed Warning Popup */}
      {showDuplicateWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[60]">
          <div className="w-[500px] rounded-[19px] bg-gray-100 dark:bg-[#000000] p-6 relative">
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
              }}
            />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Duplicate Bed Numbers
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The requested bed range is not available
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                The bed numbers{" "}
                <span className="font-semibold">
                  {formData.bedFrom}-{formData.bedTo}
                </span>{" "}
                already exist:
              </p>

              {duplicateBeds.length > 0 ? (
                <div className="max-h-40 overflow-y-auto mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {duplicateBeds.map((bed, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-700 dark:text-gray-300 py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      • Bed {bed.bed_number} in {bed.bed_group}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Some bed numbers in this range are already assigned to other
                    bed groups.
                  </p>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-semibold">Suggested alternative:</span>{" "}
                  {suggestedRange}
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Please choose one of the following options:
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAutoAdjust}
                className="w-full h-[40px] rounded-[8px] border-b-[2px] border-blue-400
                         bg-gradient-to-r from-blue-600 to-blue-700
                         text-white font-medium text-[14px]
                         hover:scale-[1.02] transition flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Auto-Adjust to {suggestedRange}
              </button>

              <button
                onClick={handleUseDifferentRange}
                className="w-full h-[40px] rounded-[8px] border border-[#0EFF7B] dark:border-gray-600
                         text-[#08994A] dark:text-white font-medium text-[14px]
                         bg-gray-100 dark:bg-transparent
                         hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                Choose Different Range
              </button>

              <button
                onClick={() => setShowDuplicateWarning(false)}
                className="w-full h-[40px] rounded-[8px] border border-gray-400 dark:border-gray-600
                         text-gray-700 dark:text-gray-300 font-medium text-[14px]
                         bg-gray-100 dark:bg-transparent
                         hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddBedGroupPopup;