import React, { useState, useEffect } from "react";
import { X, ChevronDown, Loader2 } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { successToast, errorToast } from "../../../components/Toast.jsx";
import api from "../../../utils/axiosConfig"; // Import axios

const CreateTestOrderPopup = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    department_id: "",
    department: "",
    testType: "",
  });

  const [errors, setErrors] = useState({});
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [testTypesLoading, setTestTypesLoading] = useState(false);

  // Fetch test types from API
  const fetchTestTypes = async () => {
    setTestTypesLoading(true);
    try {
      const response = await api.get("/labreports/test-types");

      if (response.status !== 200) {
        throw new Error("Failed to fetch test types");
      }

      const data = response.data;
      console.log("Fetched test types:", data.test_types);
      setTestTypes(data.test_types || []);
    } catch (error) {
      console.error("Error fetching test types:", error);
      errorToast("Failed to load test types");
      setTestTypes([]);
    } finally {
      setTestTypesLoading(false);
    }
  };

  // Fetch departments from API
  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const response = await api.get("/patients/departments");

      if (response.status !== 200) {
        throw new Error("Failed to fetch departments");
      }

      const data = response.data;

      // Format departments to ensure consistent structure
      const formattedDepartments = Array.isArray(data.departments)
        ? data.departments.map((dept) => ({
            id: dept.id || dept.department_id || dept.value,
            name:
              dept.name ||
              dept.department_name ||
              dept.label ||
              "Unnamed Department",
          }))
        : [];

      console.log("Fetched departments:", formattedDepartments);
      setDepartments(formattedDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      errorToast("Failed to load departments");
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // Fetch patients from API
  useEffect(() => {
    const fetchData = async () => {
      setPatientsLoading(true);
      try {
        // Fetch patients
        const patientsResponse = await api.get("/medicine_allocation/edit");

        if (patientsResponse.status !== 200) {
          throw new Error("Failed to fetch patients");
        }

        const patientsData = patientsResponse.data;
        setPatients(patientsData.patients || []);

        // Fetch departments
        await fetchDepartments();

        // Fetch test types
        await fetchTestTypes();
      } catch (err) {
        console.error("Failed to fetch data:", err);
        errorToast("Failed to load data");
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchData();
  }, []);

  const patientNames = [
    ...new Set(patients.map((p) => p.full_name || "")),
  ].filter(Boolean);
  const patientIds = patients
    .map((p) => p.patient_unique_id || "")
    .filter(Boolean);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientName.trim())
      newErrors.patientName = "Patient name is required";
    if (!formData.patientId.trim())
      newErrors.patientId = "Patient ID is required";
    if (!formData.department_id)
      newErrors.department = "Department is required";
    if (!formData.testType.trim()) newErrors.testType = "Test type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
  if (validateForm()) {
    try {
      // Prepare data for saving
      const saveData = {
        ...formData,
        department:
          departments.find(
            (dept) => String(dept.id) === String(formData.department_id)
          )?.name || formData.department,
      };

      await onSave(saveData);
      successToast(
        `Test order for "${formData.patientName}" created successfully!`
      );
      onClose();
    } catch (error) {
      // Check for the specific conflict error (409)
      if (error.response?.status === 409) {
        // Show the detailed error message from backend
        errorToast(error.response?.data?.detail || "Cannot create duplicate test order");
      } else {
        errorToast(error.response?.data?.detail || "Failed to create test order");
      }
    }
  } else {
    errorToast("Please fix the errors below");
  }
};

  // Enhanced Dropdown Component
  const Dropdown = ({
    label,
    value,
    onChange,
    options,
    error,
    isPatientName = false,
    isPatientId = false,
    isDepartment = false,
    isTestType = false,
    required = false,
    loading = false,
  }) => {
    // Find selected option for display
    let displayValue = "";
    if (isDepartment) {
      const selectedDept = departments.find(
        (dept) => String(dept.id) === String(value)
      );
      displayValue = selectedDept?.name || value || "Select";
    } else if (isTestType) {
      displayValue = value || "Select test type";
    } else {
      displayValue = value || "Select";
    }

    return (
      <div>
        <label
          className="text-sm text-black dark:text-white"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Listbox
          value={value}
          onChange={(val) => {
            if (isPatientName) {
              const patient = patients.find((p) => p.full_name === val);
              setFormData({
                ...formData,
                patientName: val,
                patientId: patient
                  ? patient.patient_unique_id
                  : formData.patientId,
              });
            } else if (isPatientId) {
              const patient = patients.find((p) => p.patient_unique_id === val);
              setFormData({
                ...formData,
                patientId: val,
                patientName: patient ? patient.full_name : formData.patientName,
              });
            } else if (isDepartment) {
              // Store department ID
              setFormData({
                ...formData,
                department_id: val,
              });
            } else if (isTestType) {
              setFormData({
                ...formData,
                testType: val,
              });
            } else {
              onChange(val);
            }
          }}
          disabled={loading}
        >
          <div className="relative mt-1 w-[228px]">
            <Listbox.Button
              className={`w-full h-[32px] px-3 pr-8 rounded-[8px] border ${
                loading
                  ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50 dark:border-[#3A3A3A] dark:bg-gray-800"
                  : "border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent"
              } text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]
              focus:outline-none`}
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </span>
              ) : (
                displayValue
              )}
              <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-[#0EFF7B]" />
              </span>
            </Listbox.Button>
            {!loading && (
              <Listbox.Options
                className="absolute mt-1 w-full max-h-40 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black
                shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A]"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {options.length === 0 ? (
                  <div className="py-2 px-3 text-sm text-gray-500 dark:text-gray-400">
                    No options available
                  </div>
                ) : (
                  options.map((option, idx) => {
                    // For departments, show name but store id
                    if (isDepartment) {
                      const optionValue = option.id;
                      const optionLabel = option.name;
                      return (
                        <Listbox.Option
                          key={idx}
                          value={optionValue}
                          className={({ active, selected }) =>
                            `cursor-pointer select-none py-2 px-3 text-sm rounded-md ${
                              active
                                ? "bg-gray-100 dark:bg-[#0EFF7B1A] text-black dark:text-[#0EFF7B]"
                                : "text-black dark:text-white"
                            } ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                          }
                        >
                          {optionLabel}
                        </Listbox.Option>
                      );
                    } else {
                      // For test types and other simple arrays
                      const optionValue = option;
                      const optionLabel = option;
                      return (
                        <Listbox.Option
                          key={idx}
                          value={optionValue}
                          className={({ active, selected }) =>
                            `cursor-pointer select-none py-2 px-3 text-sm rounded-md ${
                              active
                                ? "bg-gray-100 dark:bg-[#0EFF7B1A] text-black dark:text-[#0EFF7B]"
                                : "text-black dark:text-white"
                            } ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                          }
                        >
                          {optionLabel}
                        </Listbox.Option>
                      );
                    }
                  })
                )}
              </Listbox.Options>
            )}
          </div>
        </Listbox>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
      <div
        className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
        bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70
        dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]"
      >
        <div
          className="w-[505px] h-auto rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-3 mb-4">
            <h2
              className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Create Test Order
            </h2>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>

          {/* Loading State */}
          {patientsLoading || testTypesLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#0EFF7B]" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Loading data...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-6">
                {/* Patient Name Dropdown */}
                <Dropdown
                  label="Patient Name"
                  value={formData.patientName}
                  options={patientNames}
                  error={errors.patientName}
                  isPatientName={true}
                  required={true}
                  loading={patientsLoading}
                />

                {/* Patient ID Dropdown */}
                <Dropdown
                  label="Patient ID"
                  value={formData.patientId}
                  options={patientIds}
                  error={errors.patientId}
                  isPatientId={true}
                  required={true}
                  loading={patientsLoading}
                />

                {/* Department - Dynamic Dropdown */}
                <Dropdown
                  label="Department"
                  value={formData.department_id}
                  options={departments}
                  error={errors.department}
                  isDepartment={true}
                  required={true}
                  loading={departmentsLoading}
                />

                {/* Test Type Dropdown */}
                <Dropdown
                  label="Test Type"
                  value={formData.testType}
                  options={testTypes}
                  error={errors.testType}
                  isTestType={true}
                  required={true}
                  loading={testTypesLoading}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={onClose}
                  disabled={patientsLoading || testTypesLoading}
                  className={`w-[144px] h-[32px] rounded-[8px] border ${
                    patientsLoading || testTypesLoading
                      ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50 dark:border-[#3A3A3A] dark:bg-gray-800 text-gray-500"
                      : "border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white"
                  } font-medium text-[14px] leading-[16px]`}
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={patientsLoading || departmentsLoading || testTypesLoading}
                  className={`w-[144px] h-[32px] border-b-[2px] border-[#0EFF7B] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
                  text-white font-medium text-[14px] leading-[16px] transition ${
                    patientsLoading || departmentsLoading || testTypesLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105"
                  }`}
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  {patientsLoading || departmentsLoading || testTypesLoading
                    ? "Loading..."
                    : "Save Order"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTestOrderPopup;