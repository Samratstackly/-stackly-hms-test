// import React, { useState } from "react";
// import { X, Calendar, ChevronDown } from "lucide-react";
// import { Listbox } from "@headlessui/react";

// const EditAppointmentPopup = ({ onClose, appointment, onUpdate }) => {
//   const [formData, setFormData] = useState({ ...appointment });

//   const handleUpdate = () => {
//     if (onUpdate) onUpdate(formData);
//     onClose();
//   };

//   const departments = ["Orthopedics", "Cardiology", "Neurology", "Dermatology"];
//   const doctors = ["Dr. Sravan", "Dr. Ramesh", "Dr. Kavya"];
//   const appointmentTypes = ["Check-up", "Follow-up", "Emergency"];
//   const statuses = ["New", "Normal", "Severe", "Completed", "Cancelled"];

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
//             className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
//             bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]"
//             style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//           >
//             {value || "Select"}
//             <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
//               <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
//             </span>
//           </Listbox.Button>

//           <Listbox.Options className="absolute mt-1 w-full rounded-[12px] bg-white dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px]">
//             {options.map((option, idx) => (
//               <Listbox.Option
//                 key={idx}
//                 value={option}
//                 className={({ active, selected }) =>
//                   `cursor-pointer select-none py-2 px-2 text-sm rounded-md
//                   ${
//                     active
//                       ? "bg-[#0EFF7B33] text-[#0EFF7B]"
//                       : "text-black dark:text-white"
//                   }
//                   ${selected ? "font-medium text-[#0EFF7B]" : ""}`
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

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//       {/* Outer wrapper with 1px gradient border */}
//       <div
//         className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
//           bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70
//           dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]"
//       >
//         <div
//           className="w-[504px] h-[485px] rounded-[19px] bg-white dark:bg-[#000000] text-black dark:text-white p-6 relative"
//           style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//         >{/* Gradient Border */}
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           borderRadius: "20px",
//           padding: "2px",
//           background:
//             "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//           WebkitMask:
//             "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//           WebkitMaskComposite: "xor",
//           maskComposite: "exclude",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       ></div>
//           {/* Header */}
//           <div className="flex justify-between items-center pb-3 mb-4">
//             <h3
//               className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Edit Appointment
//             </h3>
//             <button
//               onClick={onClose}
//               className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A]
//                 bg-white dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
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
//                 className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
//                   bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
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
//                 className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
//                   bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
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

//             {/* Appointment Date */}
//             <div>
//               <label
//                 className="text-sm text-black dark:text-white"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 Appointment Date
//               </label>
//               <div className="relative">
//                 <input
//                   type="date"
//                   name="appointmentDate"
//                   value={formData.appointmentDate || ""}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       appointmentDate: e.target.value,
//                     })
//                   }
//                   className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
//                     bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 />
//                 <Calendar
//                   size={18}
//                   className="absolute right-0 top-3 text-black dark:text-white pointer-events-none"
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
//                 className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
//                   bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
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
//               className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-gray-600 text-gray-600 dark:text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] opacity-100 bg-white dark:bg-transparent"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleUpdate}
//               className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition"
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

// src/components/EditAppointmentPopup.jsx
import React, { useState, useEffect } from "react";
import { X, Calendar, ChevronDown } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { successToast, errorToast } from "../../components/Toast.jsx";

const API = "http://127.0.0.1:8000/appointments";

export default function EditAppointmentPopup({
  onClose,
  appointment,
  onUpdate,
}) {
  // Normalize incoming appointment to match backend keys
  const initialData = {
    id: appointment.id,
    patient_name: appointment.patient_name || "",
    patient_id: appointment.patient_id || "",
    department_id: appointment.department_id || "", // backend uses ID
    staff_id: appointment.staff_id || "",
    room_no: appointment.room_no || "",
    phone_no: appointment.phone_no || "",
    appointment_type: appointment.appointment_type || "checkup",
    status: appointment.status || "new",
    appointment_date: appointment.appointment_date || "", // optional
  };

  const [formData, setFormData] = useState(initialData);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingDept, setLoadingDept] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load departments
  useEffect(() => {
    let mounted = true;
    setLoadingDept(true);
    fetch(`${API}/departments`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load departments");
        return r.json();
      })
      .then((data) => {
        if (mounted) setDepartments(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoadingDept(false);
      });
    return () => (mounted = false);
  }, []);

  // Load doctors when department changes
  useEffect(() => {
    if (!formData.department_id) {
      setDoctors([]);
      return;
    }

    let mounted = true;
    setLoadingDoc(true);
    fetch(`${API}/staff?department_id=${formData.department_id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load doctors");
        return r.json();
      })
      .then((data) => {
        if (mounted) setDoctors(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoadingDoc(false);
      });

    return () => (mounted = false);
  }, [formData.department_id]);
  useEffect(() => {
    if (
      ["completed", "cancelled"].includes(formData.status) &&
      !formData.appointment_date
    ) {
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, appointment_date: today }));
    }
  }, [formData.status]);
  // Reusable Dropdown
  const Dropdown = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    loading,
    isObject = false,
  }) => (
    <div>
      <label
        className="text-sm text-black dark:text-white"
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        {label}
      </label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1 w-[228px]">
          <Listbox.Button
            className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
                        bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            {loading ? (
              <span className="text-gray-500">Loading…</span>
            ) : value ? (
              isObject ? (
                options.find((o) => String(o.id) === String(value))?.name ||
                options.find((o) => String(o.id) === String(value))
                  ?.full_name ||
                value
              ) : (
                value
              )
            ) : (
              placeholder
            )}
            <ChevronDown className="absolute inset-y-0 right-2 h-4 w-4 text-[#0EFF7B] pointer-events-none" />
          </Listbox.Button>

          <Listbox.Options
            className="absolute mt-1 w-full max-h-40 overflow-y-auto rounded-[12px] bg-white dark:bg-black
                        shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px]"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {options.map((opt) => {
              const label = isObject
                ? opt.name || opt.full_name || String(opt.id)
                : opt;
              const val = isObject ? opt.id : opt;
              return (
                <Listbox.Option
                  key={val}
                  value={val}
                  className={({ active, selected }) =>
                    `cursor-pointer select-none py-2 px-2 text-sm rounded-md
                      ${
                        active
                          ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                          : "text-black dark:text-white"
                      }
                      ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                  }
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  {label}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );

  // Handle Update
  const handleUpdate = async () => {
    setError(null);
    if (
      !formData.patient_name ||
      !formData.department_id ||
      !formData.staff_id
    ) {
      setError("Patient name, department, and doctor are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        patient_name: formData.patient_name,
        department_id: Number(formData.department_id),
        staff_id: Number(formData.staff_id),
        room_no: formData.room_no || "",
        phone_no: formData.phone_no || "",
        appointment_type: formData.appointment_type,
        status: formData.status,
      };
      if (formData.appointment_date) {
        payload.appointment_date = formData.appointment_date;
      }

      const res = await fetch(`${API}/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Failed to update";
        try {
          const err = await res.json();
          msg = err.detail || JSON.stringify(err);
        } catch {}
        throw new Error(msg);
      }

      const updated = await res.json();
      successToast("Appointment updated successfully!");
      onUpdate?.(updated);
      onClose?.();
    } catch (e) {
      errorToast(e.message || "Something went wrong");
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div
        className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
                    bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70
                    dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]"
      >
        <div
          className="w-[504px] h-[485px] rounded-[19px] bg-white dark:bg-[#000000] text-black dark:text-white p-6 relative"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          {/* Inner gradient border */}
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
          />

          {/* Header */}
          <div className="flex justify-between items-center pb-3 mb-4">
            <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
              Edit Appointment
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A]
                          bg-white dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>

          {/* Error */}
          {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

          {/* Form Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Patient Name */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Patient Name
              </label>
              <input
                value={formData.patient_name}
                onChange={(e) =>
                  setFormData({ ...formData, patient_name: e.target.value })
                }
                placeholder="Enter name"
                className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
                            bg-white dark:bg-transparent text-black dark:text-[#0EFF7B]
                            placeholder-gray-400 dark:placeholder-gray-500 outline-none"
              />
            </div>

            {/* Patient ID */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Patient ID
              </label>
              <input
                value={formData.patient_id}
                readOnly
                className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
                            bg-white dark:bg-transparent text-gray-500 dark:text-gray-400 outline-none"
              />
            </div>

            {/* Department */}
            <Dropdown
              label="Department"
              value={formData.department_id}
              onChange={(v) =>
                setFormData({ ...formData, department_id: v, staff_id: "" })
              }
              options={departments}
              placeholder={loadingDept ? "Loading…" : "Select Department"}
              loading={loadingDept}
              isObject={true}
            />

            {/* Appointment Date */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Appointment Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointment_date: e.target.value,
                    })
                  }
                  className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
                              bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none"
                />
                <Calendar
                  size={18}
                  className="absolute right-3 top-3 text-[#0EFF7B] pointer-events-none"
                />
              </div>
            </div>

            {/* Doctor */}
            <Dropdown
              label="Doctor"
              value={formData.staff_id}
              onChange={(v) => setFormData({ ...formData, staff_id: v })}
              options={doctors}
              placeholder={loadingDoc ? "Loading…" : "Select Doctor"}
              loading={loadingDoc}
              isObject={true}
            />

            {/* Status */}
            <Dropdown
              label="Status"
              value={formData.status}
              onChange={(v) => setFormData({ ...formData, status: v })}
              options={["new", "normal", "severe", "completed", "cancelled"]}
              placeholder="Select Status"
            />

            {/* Phone */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_no}
                onChange={(e) =>
                  setFormData({ ...formData, phone_no: e.target.value })
                }
                placeholder="Enter phone"
                maxLength="10"
                className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
                            bg-white dark:bg-transparent text-black dark:text-[#0EFF7B]
                            placeholder-gray-400 dark:placeholder-gray-500 outline-none"
              />
            </div>

            {/* Appointment Type */}
            <Dropdown
              label="Appointment Type"
              value={formData.appointment_type}
              onChange={(v) =>
                setFormData({ ...formData, appointment_type: v })
              }
              options={["checkup", "followup", "emergency"]}
              placeholder="Select Type"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={onClose}
              className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-gray-600
                          text-gray-600 dark:text-white font-medium text-[14px] leading-[16px]
                          shadow-[0_2px_12px_0px_#00000040] bg-white dark:bg-transparent"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B66]
                          bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
                          shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px]
                          hover:scale-105 transition"
            >
              {saving ? "Updating…" : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
