import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { X, Calendar, ChevronDown } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { successToast, errorToast } from "../../components/Toast";
import api from "../../utils/axiosConfig"; // Cookie-based axios instance

/* -------------------------------------------------
   Dropdown Component
------------------------------------------------- */
const Dropdown = ({ label, value, onChange, options, error }) => (
  <div>
    <label className="text-sm text-black dark:text-white">{label}</label>
    <Listbox value={value} onChange={onChange}>
      <div className="relative mt-1 w-[228px]">
        <Listbox.Button
          className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
                     bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]
                     outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]"
        >
          {value || "Select"}
          <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]" />
          </span>
        </Listbox.Button>

        <Listbox.Options
          className="absolute mt-1 w-full max-h-40 overflow-auto scrollbar-hide rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-50 
                     border border-gray-300 dark:border-[#3A3A3A] left-[2px]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {options.map((opt, idx) => (
            <Listbox.Option
              key={idx}
              value={opt}
              className={({ active, selected }) =>
                `cursor-pointer select-none py-2 px-2 text-sm rounded-[12px] 
                 ${active ? "bg-[#08994A33] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]" : "text-black dark:text-[#0EFF7B]"}
                 ${selected ? "font-medium text-[#08994A] dark:text-[#0EFF7B]" : ""}`
              }
            >
              {opt}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
      {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>}
    </Listbox>
  </div>
);

/* -------------------------------------------------
   EditAdmitPatientPopup – Updated with axios
------------------------------------------------- */
const EditAdmitPatientPopup = ({ onClose, room, onSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    patient_unique_id: "",
    bed_group_name: "",
    bed_number: "",
    admission_date: "",
  });

  const [selectedAdmitDate, setSelectedAdmitDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [bedGroups, setBedGroups] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [selectedBedGroupId, setSelectedBedGroupId] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch available beds for a specific bed group
  const fetchAvailableBeds = async (groupId) => {
    if (!groupId) {
      setAvailableBeds([]);
      return;
    }

    try {
      const response = await api.get(`/bedgroups/${groupId}/beds`);
      const groupData = response.data;
      const beds = groupData.beds
        .filter(bed => !bed.is_occupied)
        .map(bed => bed.bed_number.toString());
      setAvailableBeds(beds);

      // Set default bed number if available and none selected
      if (beds.length > 0 && !formData.bed_number) {
        setFormData(prev => ({ ...prev, bed_number: beds[0] }));
      }
    } catch (err) {
      console.error("Error fetching available beds:", err);
      setAvailableBeds([]);
    }
  };

  // Handle bed group change
  const handleBedGroupChange = (groupName) => {
    setFormData(prev => ({ ...prev, bed_group_name: groupName }));
    const selectedGroup = bedGroups.find(g => g.name === groupName);
    if (selectedGroup) {
      setSelectedBedGroupId(selectedGroup.id);
      fetchAvailableBeds(selectedGroup.id);
    } else {
      setSelectedBedGroupId(null);
      setAvailableBeds([]);
      setFormData(prev => ({ ...prev, bed_number: "" }));
    }
  };

  // Fetch available bed groups and patient data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch bed groups with IDs
        const bedGroupsResponse = await api.get("/bedgroups/all");
        const groups = bedGroupsResponse.data;
        const groupOptions = groups.map(group => ({ 
          id: group.id, 
          name: group.bedGroup 
        }));
        setBedGroups(groupOptions);

        // If editing a room, preselect bed group and fetch its beds
        if (room && room.bedGroup) {
          const selectedGroup = groupOptions.find(g => g.name === room.bedGroup);
          if (selectedGroup) {
            setFormData(prev => ({ ...prev, bed_group_name: selectedGroup.name }));
            setSelectedBedGroupId(selectedGroup.id);
            await fetchAvailableBeds(selectedGroup.id);
          }
        }

        // If room has patient data, fetch patient details
        if (room && room.patientId && room.patientId !== "—") {
          try {
            const patientResponse = await api.get(`/patients/${room.patientId}`);
            const patient = patientResponse.data;
            
            // Parse admission date properly
            let admissionDate = "";
            let dateObj = null;
            
            if (patient.admission_date) {
              if (patient.admission_date.includes('-')) {
                // ISO format from API - convert to MM/DD/YYYY
                const date = new Date(patient.admission_date);
                admissionDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
                dateObj = date;
              } else {
                // Already in MM/DD/YYYY format
                admissionDate = patient.admission_date;
                const [m, d, y] = admissionDate.split("/").map(Number);
                dateObj = new Date(y, m - 1, d);
              }
            }

            setFormData(prev => ({
              ...prev,
              full_name: patient.full_name || room.patient,
              patient_unique_id: patient.patient_unique_id || room.patientId,
              admission_date: admissionDate,
            }));
            
            setSelectedAdmitDate(dateObj);
          } catch (patientError) {
            console.warn("Failed to fetch patient details:", patientError);
            // Fallback to room data if patient API fails
            setFormData(prev => ({
              ...prev,
              full_name: room.patient,
              patient_unique_id: room.patientId,
            }));
          }
        } else {
          // No patient data, just prefill bed info
          setFormData(prev => ({
            ...prev,
            full_name: "",
            patient_unique_id: "",
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        let errorMessage = "Failed to load data";
        
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = "Session expired. Please login again.";
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

    fetchData();
  }, [room]);

  /* ---------- Validation ---------- */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Patient name is required";
    if (!formData.patient_unique_id.trim()) newErrors.patient_unique_id = "Patient ID is required";
    if (!formData.bed_group_name) newErrors.bed_group_name = "Bed group is required";
    if (!formData.bed_number) newErrors.bed_number = "Bed number is required";
    if (!formData.admission_date) newErrors.admission_date = "Admit date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- Handle Date Change ---------- */
  const handleDateChange = (date) => {
    setSelectedAdmitDate(date);
    
    if (date) {
      const formatted = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
        date.getDate()
      ).padStart(2, "0")}/${date.getFullYear()}`;
      
      setFormData(prev => ({
        ...prev,
        admission_date: formatted
      }));
      
      // Clear any previous date errors
      if (errors.admission_date) {
        setErrors(prev => ({ ...prev, admission_date: "" }));
      }
    } else {
      // If date is cleared, also clear the form data
      setFormData(prev => ({
        ...prev,
        admission_date: ""
      }));
    }
  };

  /* ---------- Handle Update ---------- */
  const handleUpdate = async () => {
    if (!validateForm()) {
      errorToast("Please fill all required fields");
      return;
    }

    setUpdating(true);
    
    try {
      // First discharge from current bed (if occupied)
      if (room && room.status === "Not Available") {
        try {
          // Find the group ID for current bed
          const currentGroup = bedGroups.find(g => g.name === room.bedGroup);
          if (currentGroup) {
            await api.post(`/bedgroups/${currentGroup.id}/beds/${room.roomNo}/vacate`);
          }
        } catch (dischargeError) {
          console.warn("Error discharging from current bed:", dischargeError);
          // Continue with admission anyway
        }
      }

      // Then admit to new bed with updated data
      await api.post("/bedgroups/admit", {
        full_name: formData.full_name,
        patient_unique_id: formData.patient_unique_id,
        bed_group_name: formData.bed_group_name,
        bed_number: formData.bed_number,
        admission_date: formData.admission_date,
      });

      successToast("Patient admission updated successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      let errorMessage = "Failed to update admission";
      
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = "Session expired. Please login again.";
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.detail || "Invalid data";
        } else if (err.response.status === 404) {
          errorMessage = "Bed or patient not found";
        } else if (err.response.status === 409) {
          errorMessage = err.response.data?.detail || "Bed is already occupied";
        } else {
          errorMessage = err.response.data?.detail || errorMessage;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      errorToast(errorMessage);
      console.error("Update error:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
        <div className="text-white">Loading patient data...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
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
            Edit Patient Admission
          </h3>
          <button
            onClick={onClose}
            disabled={updating}
            className="w-6 h-6 rounded-full border border-[#08994A1A] dark:border-[#0EFF7B1A] bg-[#08994A1A] dark:bg-[#0EFF7B1A] flex items-center justify-center hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33] disabled:opacity-50"
          >
            <X size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
          </button>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Patient Name */}
          <div>
            <label className="text-sm">Patient Name</label>
            <input
              value={formData.full_name}
              readOnly
              className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px]
                         border border-gray-300 dark:border-[#3A3A3A]
                         bg-gray-100 dark:bg-[#1E1E1E]
                         text-black dark:text-[#0EFF7B]
                         cursor-not-allowed outline-none"
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
          </div>

          {/* Patient ID */}
          <div>
            <label className="text-sm">Patient ID</label>
            <input
              value={formData.patient_unique_id}
              readOnly
              className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px]
                         border border-gray-300 dark:border-[#3A3A3A]
                         bg-gray-100 dark:bg-[#1E1E1E]
                         text-black dark:text-[#0EFF7B]
                         cursor-not-allowed outline-none"
            />
            {errors.patient_unique_id && <p className="text-red-500 text-xs mt-1">{errors.patient_unique_id}</p>}
          </div>

          {/* Bed Group */}
          <Dropdown
            label="Bed Group"
            value={formData.bed_group_name}
            onChange={handleBedGroupChange}
            options={bedGroups.map(g => g.name)}
            error={errors.bed_group_name}
          />

          {/* Bed Number - Now Dynamic Dropdown */}
          <div>
            <label className="text-sm">Bed Number</label>
            <Dropdown
              label=""
              value={formData.bed_number}
              onChange={(v) => setFormData({ ...formData, bed_number: v })}
              options={availableBeds}
              error={errors.bed_number}
            />
            {availableBeds.length === 0 && formData.bed_group_name && (
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">No available beds</p>
            )}
          </div>

          {/* Admit Date */}
          <div>
            <label className="text-sm">Admit Date</label>
            <div className="relative">
              <DatePicker
                selected={selectedAdmitDate}
                onChange={handleDateChange}
                dateFormat="MM/dd/yyyy"
                placeholderText="MM/DD/YYYY"
                className="w-[228px] h-[33px] mt-1 px-3 pr-10 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] 
                           bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none
                           focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] text-sm"
                wrapperClassName="w-full"
                popperClassName="z-50"
                popperPlacement="bottom-start"
                showPopperArrow={false}
                customInput={
                  <input
                    readOnly
                    value={formData.admission_date}
                    style={{
                      paddingRight: "2.5rem",
                      fontSize: "14px",
                      lineHeight: "16px",
                    }}
                  />
                }
              />
              <div className="absolute right-3 top-3.5 pointer-events-none">
                <Calendar size={18} className="text-[#08994A] dark:text-[#0EFF7B]" />
              </div>
            </div>
            {errors.admission_date && <p className="text-red-500 text-xs mt-1">{errors.admission_date}</p>}
          </div>
        </div>

        {/* Current Bed Info */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Current Bed:</strong> {room.bedGroup} - Bed {room.roomNo}
            {room.patient !== "—" && (
              <>
                <br />
                <strong>Current Patient:</strong> {room.patient} ({room.patientId})
              </>
            )}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-[18px] mt-6">
          <button
            onClick={onClose}
            disabled={updating}
            className="w-[104px] h-[33px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] 
                       bg-gray-100 dark:bg-[#1E1E1E] text-black dark:text-white font-medium text-[14px] leading-[16px] 
                       hover:bg-gray-100 dark:hover:bg-[#2A2A2A] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating}
            style={{
              background:
                "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
            }}
            className="w-[104px] h-[33px] rounded-[8px] border-b-[2px] border-[#0EFF7B66] text-white font-medium text-[14px] leading-[16px] 
                       hover:bg-[#0cd968] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              "Update"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAdmitPatientPopup;