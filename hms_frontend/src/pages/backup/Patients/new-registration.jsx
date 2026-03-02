// src/components/patients/NewRegistration.jsx
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Listbox } from "@headlessui/react";
import { ChevronDown, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// DIRECT TOAST FUNCTIONS
import { successToast, errorToast } from "../../components/Toast.jsx";

const API_BASE = "http://localhost:8000";

const formatToYMD = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  const [m, d, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

const safeStr = (v) => (v === undefined || v === null ? "" : String(v).trim());

/* ---------- Photo Upload ---------- */
const PhotoUploadBox = ({ photoPreview, setPhotoPreview, setPhotoFile }) => {
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoFile(file);
    }
  };

  return (
    <div className="flex justify-center md:justify-end">
      <input
        type="file"
        id="photoUpload"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />
      <label
        htmlFor="photoUpload"
        className="border border-dashed border-[#0EFF7B] mr-12 w-24 h-24 md:w-32 md:h-32
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
          <span className="text-xs md:text-sm">+ Add Photo</span>
        )}
      </label>
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
}) => (
  <div className="space-y-1 w-full">
    <label
      className="text-sm text-black dark:text-white"
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
    >
      {label}
    </label>
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button
          className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
                     bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]
                     flex items-center justify-between"
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
          className="absolute mt-1 w-full rounded-[12px] bg-white dark:bg-black shadow-lg z-50
                     border border-gray-300 dark:border-[#3A3A3A] left-[2px] max-h-60 overflow-y-auto"
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
  </div>
);

/* ---------- Input & Date ---------- */
const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) => (
  <div className="space-y-1 w-full">
    <label
      className="text-sm text-black dark:text-white"
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
    >
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-[33px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
                 bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 outline-none text-[14px]"
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
    />
  </div>
);

const DateField = ({ label, value, onChange, placeholder }) => {
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [m, d, y] = dateStr.split("/").map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y &&
      date.getMonth() === m - 1 &&
      date.getDate() === d
      ? date
      : null;
  };

  return (
    <div className="space-y-1 w-full">
      <label
        className="text-sm text-black dark:text-white"
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        {label}
      </label>
      <div className="relative">
        <DatePicker
          selected={parseDate(value)}
          onChange={(date) => {
            const formatted = date
              ? `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
                  date.getDate()
                ).padStart(2, "0")}/${date.getFullYear()}`
              : "";
            onChange(formatted);
          }}
          dateFormat="MM/dd/yyyy"
          placeholderText={placeholder}
          className="w-full h-[33px] px-3 pr-10 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
                     bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none text-[14px]"
          wrapperClassName="w-full"
          popperClassName="z-50"
          customInput={
            <input
              style={{
                paddingRight: "2.5rem",
                fontSize: "14px",
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            />
          }
        />
        <Calendar
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0EFF7B] pointer-events-none"
        />
      </div>
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
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const navigate = useNavigate();

  const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const consultationTypes = ["General", "Specialist", "Emergency"];
  const appointmentTypes = ["In-person", "Online", "Follow-up"];
  const casualtyTypes = ["Yes", "No"];

  /* ---------- Load Departments ---------- */
  useEffect(() => {
    let mounted = true;
    setLoadingDepts(true);
    fetch(`${API_BASE}/patients/departments`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (mounted) {
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

  /* ---------- Load Staff ---------- */
  useEffect(() => {
    if (!formData.department_id) {
      setDoctors([]);
      setFormData((p) => ({ ...p, staff_id: "" }));
      return;
    }
    let mounted = true;
    setLoadingStaff(true);
    fetch(`${API_BASE}/patients/staff?department_id=${formData.department_id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (mounted) {
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

  const handleChange = (field) => (e) => {
    const val = e?.target?.value ?? e;
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleDropdownChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
  };

  /* ---------- Submit with Toast ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = new FormData();
    body.append("full_name", safeStr(formData.fullname));
    body.append("date_of_birth", formatToYMD(formData.dob));
    body.append("gender", safeStr(formData.gender));
    body.append("age", safeStr(formData.age));
    body.append("marital_status", safeStr(formData.maritalStatus));
    body.append("address", safeStr(formData.address));
    body.append("phone_number", safeStr(formData.phone));
    body.append("email_address", safeStr(formData.email));
    body.append("national_id", safeStr(formData.nid));
    body.append("city", safeStr(formData.city));
    body.append("country", safeStr(formData.country));
    body.append("date_of_registration", formatToYMD(formData.dor));
    body.append("occupation", safeStr(formData.occupation));
    body.append("weight_in_kg", safeStr(formData.weight));
    body.append("height_in_cm", safeStr(formData.height));
    body.append("blood_group", safeStr(formData.bloodGroup));
    body.append("blood_pressure", safeStr(formData.bp));
    body.append("body_temperature", safeStr(formData.temperature));
    body.append("consultation_type", safeStr(formData.consultType));
    body.append("appointment_type", safeStr(formData.apptType));
    body.append("admission_date", formatToYMD(formData.admitDate));
    body.append("room_number", safeStr(formData.roomNo));
    body.append("test_report_details", safeStr(formData.testReport));
    body.append("casualty_status", safeStr(formData.casualty));
    body.append("reason_for_visit", safeStr(formData.reason));
    body.append("department_id", safeStr(formData.department_id));
    body.append("staff_id", safeStr(formData.staff_id));
    if (photoFile) body.append("photo", photoFile);

    try {
      const res = await fetch(`${API_BASE}/patients/register`, {
        method: "POST",
        body,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Registration failed");

      // SUCCESS TOAST
      successToast(`Patient registered: ${data.patient_id}`);

      handleClear();
    } catch (err) {
      // ERROR TOAST
      errorToast(`Registration failed: ${err.message}`);
    }
  };

  /* ---------- Render ---------- */
  return (
     <div className="mt-[80px] mb-4 bg-white dark:bg-black text-black dark:text-white rounded-xl p-4 w-full max-w-[1400px] mx-auto flex flex-col relative">
      {/* Gradient Background and Border */}
      <div
        className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
          zIndex: 0,
        }}
      ></div>

      <div
        className="absolute inset-0 rounded-[10px] pointer-events-none"
        style={{
          padding: "2px",
          background:
            "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
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
          <div>
            <h2 className="text-2xl font-bold">New Registration</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Input new patient details carefully
            </p>
          </div>
          <PhotoUploadBox
            photoPreview={photoPreview}
            setPhotoPreview={setPhotoPreview}
            setPhotoFile={setPhotoFile}
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
          encType="multipart/form-data"
        >
          {/* General Info */}
          <div>
            <h3 className="text-lg font-medium mb-2">General Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <InputField
                label="Full Name"
                value={formData.fullname}
                onChange={handleChange("fullname")}
                placeholder="Enter full name"
              />
              <DateField
                label="Date of Birth"
                value={formData.dob}
                onChange={(v) => setFormData((p) => ({ ...p, dob: v }))}
                placeholder="MM/DD/YYYY"
              />
              <Dropdown
                label="Gender"
                value={formData.gender}
                onChange={(v) => handleDropdownChange("gender", v)}
                options={["Male", "Female", "Other"].map((g) => ({
                  id: g,
                  name: g,
                }))}
              />
              <InputField
                label="Age"
                type="number"
                value={formData.age}
                onChange={handleChange("age")}
                placeholder="Enter age"
              />
              <Dropdown
                label="Marital Status"
                value={formData.maritalStatus}
                onChange={(v) => handleDropdownChange("maritalStatus", v)}
                options={maritalStatusOptions.map((m) => ({ id: m, name: m }))}
              />
              <InputField
                label="Address"
                value={formData.address}
                onChange={handleChange("address")}
                placeholder="Enter address"
              />
              <InputField
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange("phone")}
                placeholder="Enter phone"
              />
              <InputField
                label="Email ID"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                placeholder="Enter email"
              />
              <InputField
                label="National ID"
                value={formData.nid}
                onChange={handleChange("nid")}
                placeholder="Enter NID"
              />
              <InputField
                label="City"
                value={formData.city}
                onChange={handleChange("city")}
                placeholder="City"
              />
              <InputField
                label="Country"
                value={formData.country}
                onChange={handleChange("country")}
                placeholder="Country"
              />
              <DateField
                label="Date of Registration"
                value={formData.dor}
                onChange={(v) => setFormData((p) => ({ ...p, dor: v }))}
                placeholder="MM/DD/YYYY"
              />
              <InputField
                label="Occupation"
                value={formData.occupation}
                onChange={handleChange("occupation")}
                placeholder="Enter occupation"
              />
              <InputField
                label="Weight (kg)"
                type="number"
                value={formData.weight}
                onChange={handleChange("weight")}
                placeholder="kg"
              />
              <InputField
                label="Height (cm)"
                type="number"
                value={formData.height}
                onChange={handleChange("height")}
                placeholder="cm"
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
                onChange={(v) => handleDropdownChange("bloodGroup", v)}
                options={bloodGroups.map((b) => ({ id: b, name: b }))}
              />
              <InputField
                label="Blood Pressure"
                value={formData.bp}
                onChange={handleChange("bp")}
                placeholder="e.g. 120/80"
              />
              <InputField
                label="Temperature"
                type="number"
                value={formData.temperature}
                onChange={handleChange("temperature")}
                placeholder="°C"
              />
              <Dropdown
                label="Consultation Type"
                value={formData.consultType}
                onChange={(v) => handleDropdownChange("consultType", v)}
                options={consultationTypes.map((c) => ({ id: c, name: c }))}
              />
              <Dropdown
                label="Department"
                value={formData.department_id}
                onChange={(v) => handleDropdownChange("department_id", v)}
                options={departments}
                loading={loadingDepts}
              />
              <Dropdown
                label="Consulting Doctor"
                value={formData.staff_id}
                onChange={(v) => handleDropdownChange("staff_id", v)}
                options={doctors.map((d) => ({
                  id: d.id,
                  display: `${d.full_name} – ${d.designation}`,
                }))}
                loading={loadingStaff}
                placeholder="Select Department First"
                idField="id"
                nameField="display"
              />
              <Dropdown
                label="Appointment Type"
                value={formData.apptType}
                onChange={(v) => handleDropdownChange("apptType", v)}
                options={appointmentTypes.map((a) => ({ id: a, name: a }))}
              />
              <DateField
                label="Admit Date"
                value={formData.admitDate}
                onChange={(v) => setFormData((p) => ({ ...p, admitDate: v }))}
                placeholder="MM/DD/YYYY"
              />
              <InputField
                label="Room No"
                value={formData.roomNo}
                onChange={handleChange("roomNo")}
                placeholder="Room"
              />
              <InputField
                label="Test Report"
                value={formData.testReport}
                onChange={handleChange("testReport")}
                placeholder="Details"
              />
              <Dropdown
                label="Casualty"
                value={formData.casualty}
                onChange={(v) => handleDropdownChange("casualty", v)}
                options={casualtyTypes.map((c) => ({ id: c, name: c }))}
              />
            </div>
            <div className="mt-4">
              <label className="text-sm">Reason for Visit</label>
              <textarea
                value={formData.reason}
                onChange={handleChange("reason")}
                placeholder="Describe symptoms"
                className="w-full h-20 mt-1 px-3 py-2 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none text-[14px]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              />
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
              className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white border-b-[2px] border-[#0EFF7B]"
            >
              Add Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
