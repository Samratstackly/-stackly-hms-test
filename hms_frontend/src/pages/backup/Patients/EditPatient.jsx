// import React, { useState } from "react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { X, Calendar, ChevronDown } from "lucide-react";
// import { Listbox } from "@headlessui/react";

// const EditAppointmentPopup = ({ onClose, appointment, onUpdate }) => {
//   const [formData, setFormData] = useState({ ...appointment });

//   const handleUpdate = () => {
//     if (onUpdate) onUpdate(formData);
//     onClose();
//   };

//   // Options
//   const departments = ["Orthopedics", "Cardiology", "Neurology", "Dermatology"];
//   const doctors = ["Dr. Sravan", "Dr. Ramesh", "Dr. Kavya"];
//   const appointmentTypes = ["Check-up", "Follow-up", "Emergency"];
//   const statuses = ["New", "Normal", "Severe", "Completed", "Cancelled"];

//   // Reusable Dropdown
//   const Dropdown = ({ label, value, onChange, options }) => (
//     <div>
//       <label
//         className="text-sm text-black dark:text-white"
//         style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//       >
//         {label}
//       </label>
//       <Listbox value={value} onChange={onChange}>
//         <div className="relative mt-1 w-[228px]">
//           <Listbox.Button
//             className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]"
//             style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//           >
//             {value || "Select"}
//             <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
//               <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
//             </span>
//           </Listbox.Button>
//           <Listbox.Options
//             className="absolute mt-1 w-full rounded-[12px] bg-white dark:bg-black shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A] left-[2px]"
//           >
//             {options.map((option, idx) => (
//               <Listbox.Option
//                 key={idx}
//                 value={option}
//                 className={({ active, selected }) =>
//                   `cursor-pointer select-none py-2 px-2 text-sm rounded-md
//                    ${active ? "bg-[#0EFF7B33] text-[#0EFF7B]" : "text-black dark:text-white"}
//                    ${selected ? "font-medium text-[#0EFF7B]" : ""}`
//                 }
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 {option}
//               </Listbox.Option>
//             ))}
//           </Listbox.Options>
//         </div>
//       </Listbox>
//     </div>
//   );

//   // Parse MM/DD/YYYY → Date
//   const parseDate = (dateStr) => {
//     if (!dateStr) return null;
//     const [m, d, y] = dateStr.split("/").map(Number);
//     if (!m || !d || !y) return null;
//     const date = new Date(y, m - 1, d);
//     return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
//   };

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//       <div
//         className="w-[505px] rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
//                    bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70
//                    dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]"
//       >
//         <div
//           className="rounded-[19px] bg-white dark:bg-[#000000] text-black dark:text-white p-6 shadow-lg relative"
//           style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//         >
//           {/* Header */}
//           <div className="flex justify-between items-center pb-3 mb-4">
//             <h3
//               className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Edit Patient
//             </h3>
//             <button
//               onClick={onClose}
//               className="w-6 h-6 rounded-full
//                          border border-[#0EFF7B] dark:border-[#0EFF7B1A]
//                          bg-white dark:bg-[#0EFF7B1A]
//                          shadow flex items-center justify-center"
//             >
//               <X size={16} className="text-black dark:text-white" />
//             </button>
//           </div>

//           {/* Form */}
//           <div className="grid grid-cols-2 gap-6">
//             {/* Patient Name */}
//             <div>
//               <label
//                 className="text-sm text-black dark:text-white"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 Patient Name
//               </label>
//               <input
//                 name="patient"
//                 value={formData.patient}
//                 onChange={(e) =>
//                   setFormData({ ...formData, patient: e.target.value })
//                 }
//                 placeholder="Enter name"
//                 className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               />
//             </div>

//             {/* Patient ID */}
//             <div>
//               <label
//                 className="text-sm text-black dark:text-white"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 Patient ID
//               </label>
//               <input
//                 name="patientId"
//                 value={formData.patientId}
//                 onChange={(e) =>
//                   setFormData({ ...formData, patientId: e.target.value })
//                 }
//                 placeholder="Enter patient ID"
//                 className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               />
//             </div>

//             {/* Department Dropdown */}
//             <Dropdown
//               label="Department"
//               value={formData.department}
//               onChange={(val) => setFormData({ ...formData, department: val })}
//               options={departments}
//             />

//             {/* Appointment Date – compact dropdown style */}
//             <div>
//               <label
//                 className="text-sm text-black dark:text-white"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 Appointment Date
//               </label>
//               <div className="relative mt-1">
//                 <DatePicker
//                   selected={parseDate(formData.appointmentDate)}
//                   onChange={(date) => {
//                     const formatted = date
//                       ? `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
//                           date.getDate()
//                         ).padStart(2, "0")}/${date.getFullYear()}`
//                       : "";
//                     setFormData({ ...formData, appointmentDate: formatted });
//                   }}
//                   dateFormat="MM/dd/yyyy"
//                   placeholderText="MM/DD/YYYY"
//                   className="w-[228px] h-[33px] px-3 pr-10 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none text-sm"
//                   wrapperClassName="w-full"
//                   popperClassName="z-50"
//                   popperPlacement="bottom-start"
//                   showPopperArrow={false}
//                   customInput={
//                     <input
//                       style={{
//                         paddingRight: "2.5rem",
//                         fontSize: "14px",
//                         lineHeight: "16px",
//                         fontFamily: "Helvetica, Arial, sans-serif",
//                       }}
//                     />
//                   }
//                 />
//                 <Calendar
//                   size={18}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0EFF7B] pointer-events-none"
//                 />
//               </div>
//             </div>

//             {/* Doctor Dropdown */}
//             <Dropdown
//               label="Doctor"
//               value={formData.doctor}
//               onChange={(val) => setFormData({ ...formData, doctor: val })}
//               options={doctors}
//             />

//             {/* Status Dropdown */}
//             <Dropdown
//               label="Status"
//               value={formData.status}
//               onChange={(val) => setFormData({ ...formData, status: val })}
//               options={statuses}
//             />

//             {/* Phone */}
//             <div>
//               <label
//                 className="text-sm text-black dark:text-white"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 Phone Number
//               </label>
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.phone || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, phone: e.target.value })
//                 }
//                 placeholder="Enter phone number"
//                 maxLength="10"
//                 className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               />
//             </div>

//             {/* Appointment Type Dropdown */}
//             <Dropdown
//               label="Appointment Type"
//               value={formData.type}
//               onChange={(val) => setFormData({ ...formData, type: val })}
//               options={appointmentTypes}
//             />
//           </div>

//           {/* Buttons */}
//           <div className="flex justify-center gap-2 mt-8">
//             <button
//               onClick={onClose}
//               className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-[#3A3A3A] text-gray-800 dark:text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] bg-white dark:bg-transparent"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleUpdate}
//               className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Update
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditAppointmentPopup;

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { X, Calendar, ChevronDown, Upload } from "lucide-react";
import { Listbox } from "@headlessui/react";
import axios from "axios";
import { successToast, errorToast } from "../../components/Toast.jsx";

const API_BASE = "http://localhost:8000";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // API Helpers
  const api = {
    getPatient: (id) => axios.get(`${API_BASE}/patients/${id}`),
    getDepartments: () => axios.get(`${API_BASE}/patients/departments`),
    getDoctors: (deptId) =>
      axios.get(`${API_BASE}/patients/staff?department_id=${deptId}`),
    updatePatient: (uniqueId, payload) => {
      const form = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") {
          form.append(k, v);
        }
      });
      return axios.put(`${API_BASE}/patients/${uniqueId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  };

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const res = await api.getDepartments();
        setDepartments(res.data.departments || []);
      } catch (err) {
        errorToast("Failed to load departments");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch patient
  useEffect(() => {
    if (initialPatient) {
      initializeForm(initialPatient);
      return;
    }

    if (!patientId) return;

    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.getPatient(patientId);
        initializeForm(res.data);
      } catch (err) {
        errorToast("Patient not found");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId, initialPatient]);

  // Initialize form
  const initializeForm = (p) => {
    const data = {
      id: p.id,
      patient_unique_id: p.patient_unique_id || "",
      full_name: p.full_name || "",
      phone_number: p.phone_number || "",
      department_id: p.department_id || "",
      staff_id: p.staff_id || "",
      appointment_type: p.appointment_type || "",
      status: p.casualty_status || "",
      date_of_registration: p.date_of_registration || "",
      photo_file: null,
      photo_url: p.photo_url || "/default-avatar.png",
    };
    setFormData(data);
    setPreviewUrl(p.photo_url || "/default-avatar.png");

    if (p.department_id) {
      loadDoctors(p.department_id);
    }
  };

  // Load doctors
  const loadDoctors = async (deptId) => {
    if (!deptId) {
      setDoctors([]);
      return;
    }
    try {
      const res = await api.getDoctors(deptId);
      setDoctors(res.data.staff || []);
    } catch (err) {
      errorToast("Failed to load doctors");
    }
  };

  // Department change
  const handleDeptChange = (deptId) => {
    setFormData((prev) => ({
      ...prev,
      department_id: deptId,
      staff_id: "",
    }));
    loadDoctors(deptId);
  };

  // Photo preview
  useEffect(() => {
    if (formData?.photo_file) {
      const url = URL.createObjectURL(formData.photo_file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [formData?.photo_file]);

  // Date helpers
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [m, d, y] = dateStr.split("/").map(Number);
    return new Date(y, m - 1, d);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
      date.getDate()
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Submit update
  const handleUpdate = async () => {
    if (!formData?.patient_unique_id) {
      errorToast("Patient ID is missing!");
      return;
    }

    const payload = {
      full_name: formData.full_name.trim(),
      phone_number: formData.phone_number.trim(),
      appointment_type: formData.appointment_type,
      status: formData.status,
      date_of_registration: formData.date_of_registration,
      department_id: formData.department_id || null,
      staff_id: formData.staff_id || null,
    };

    if (formData.photo_file) {
      payload.photo = formData.photo_file;
    }

    try {
      setLoading(true);
      setError("");

      await api.updatePatient(formData.patient_unique_id, payload);

      // Success toast
      successToast(`Patient "${formData.full_name}" updated successfully!`);

      onUpdate?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Update failed";
      errorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null;
  // Dropdown
  const Dropdown = ({
    label,
    value,
    onChange,
    options,
    disabled = false,
    placeholder = "Select",
  }) => (
    <div>
      <label className="text-sm text-black dark:text-white">{label}</label>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative mt-1 w-[228px]">
          <Listbox.Button
            className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border ${
              disabled
                ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                : "border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent"
            } text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]`}
          >
            {options.find((o) => o.id === value)?.name || placeholder}
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 w-full rounded-[12px] bg-white dark:bg-black shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A] max-h-60 overflow-auto">
            {options.map((option) => (
              <Listbox.Option
                key={option.id}
                value={option.id}
                className={({ active }) =>
                  `cursor-pointer select-none py-2 px-3 text-sm ${
                    active
                      ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                      : "text-black dark:text-white"
                  }`
                }
              >
                {option.name || option.full_name}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );

  const appointmentTypes = ["Check-up", "Follow-up", "Emergency"];
  const statuses = ["Normal", "Severe", "Critical", "Completed", "Cancelled"];

  if (!formData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl">
          <p className="text-gray-600 dark:text-gray-300">
            {loading ? "Loading..." : "No patient data"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 overflow-y-auto">
      <div className="w-[520px] max-h-[90vh] rounded-[20px] p-[1px] backdrop-blur-md shadow-xl bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 my-8">
        <div className="rounded-[19px] bg-white dark:bg-[#000000] p-6 shadow-lg max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center pb-3 mb-4 sticky top-0 bg-white dark:bg-black z-10">
            <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
              Edit Patient
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-[#0EFF7B] bg-white dark:bg-[#0EFF7B1A] flex items-center justify-center hover:scale-110 transition"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center rounded-[19px] z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0EFF7B] mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Loading...
                </p>
              </div>
            </div>
          )}

          {/* Photo */}
          <div className="flex justify-center mb-6">
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
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData((prev) => ({ ...prev, photo_file: file }));
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-2 gap-6">
            {/* Patient Name */}
            <div>
              <label className="text-sm text-black dark:text-white">
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
                className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none text-sm"
              />
            </div>

            {/* Normal ID (Django PK) - Read-only */}
            <div>
              <label className="text-sm text-black dark:text-white">ID</label>
              <input
                value={formData.id}
                readOnly
                className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm"
              />
            </div>

            {/* Department */}
            <Dropdown
              label="Department"
              value={formData.department_id}
              onChange={handleDeptChange}
              options={departments}
              placeholder={loading ? "Loading..." : "Select Department"}
              disabled={loading}
            />

            {/* Doctor */}
            <Dropdown
              label="Doctor"
              value={formData.staff_id}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, staff_id: val }))
              }
              options={doctors}
              placeholder={
                doctors.length === 0 ? "Select Dept First" : "Select Doctor"
              }
              disabled={!formData.department_id}
            />

            {/* Registration Date */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Registration Date
              </label>
              <div className="relative mt-1">
                <DatePicker
                  selected={parseDate(formData.date_of_registration)}
                  onChange={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      date_of_registration: formatDate(date),
                    }))
                  }
                  dateFormat="MM/dd/yyyy"
                  placeholderText="MM/DD/YYYY"
                  className="w-[228px] h-[33px] px-3 pr-10 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none text-sm"
                  showPopperArrow={false}
                />
                <Calendar
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0EFF7B] pointer-events-none"
                />
              </div>
            </div>

            {/* Status */}
            <Dropdown
              label="Status"
              value={formData.status}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, status: val }))
              }
              options={statuses.map((s) => ({ id: s, name: s }))}
            />

            {/* Phone */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                  }))
                }
                placeholder="Enter phone"
                maxLength="15"
                className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none text-sm"
              />
            </div>

            {/* Appointment Type */}
            <Dropdown
              label="Appointment Type"
              value={formData.appointment_type}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, appointment_type: val }))
              }
              options={appointmentTypes.map((t) => ({ id: t, name: t }))}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={onClose}
              className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] text-gray-800 dark:text-white font-medium text-[14px] leading-[16px] shadow bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-[144px] h-[34px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] shadow text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                "Update"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPatientPopup;
