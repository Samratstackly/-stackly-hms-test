import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Listbox } from "@headlessui/react";
import AddAppointmentPopup from "./AddAppointmentPopup";
import EditAppointmentPopup from "./EditAppointmentPopup";
import DeleteAppointmentPopup from "./DeleteAppointmentPopup";
import api from "../../utils/axiosConfig"; // Add this import at the top


const AppointmentList = () => {
  // === State ===
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [activeMainTab, setActiveMainTab] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filtersData, setFiltersData] = useState({
    patientName: "",
    patientId: "",
    department: "",
    doctor: "",
    status: "",
    date: "",
  });

  const tabs = ["All", "Today", "Upcoming", "Past"];

  // Fixed filters to match backend status values
  const filters = [
    { label: "All", value: "All" },
    { label: "New", value: "new" },
    { label: "Normal", value: "normal" },
    { label: "Severe", value: "severe" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  // === Status mapping for display ===
  const statusDisplayMap = {
    new: "New",
    normal: "Normal",
    severe: "Severe",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  // === Date utilities ===
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const isToday = (dateString) => {
    return dateString === getTodayDate();
  };

  const isUpcoming = (dateString) => {
    const today = new Date();
    const appointmentDate = new Date(dateString);
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate > today;
  };

  const isPast = (dateString) => {
    const today = new Date();
    const appointmentDate = new Date(dateString);
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate < today;
  };

 

// === Fetch data ===
const fetchAppointments = async () => {
  try {
    const res = await api.get("/appointments/list_appointments");
    const data = res.data;
    
    const mapped = data.map((item) => {
      const appointmentDate = item.appointment_date || "";
      let appointmentTime = "";
      
      if (item.appointment_time) {
        try {
          const timeStr = item.appointment_time;
          const timeParts = timeStr.split(':');
          if (timeParts.length >= 2) {
            const hours = parseInt(timeParts[0]);
            const minutes = parseInt(timeParts[1]);
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            appointmentTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
          }
        } catch (err) {
          appointmentTime = "N/A";
        }
      }
      
      return {
        id: item.id,
        patient: item.patient_name,
        date: appointmentDate,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        patientId: item.patient_id,
        department: item.department,
        doctor: item.doctor,
        room: item.room_no,
        type: item.appointment_type,
        status: item.status,
        raw: item,
      };
    });
    
    setAppointments(mapped);
  } catch (err) {
    console.error("Error fetching appointments:", err);
  }
};

const fetchDepartments = async () => {
  try {
    const res = await api.get("/appointments/departments");
    setDepartments(res.data);
  } catch (err) {
    console.error("Error fetching departments:", err);
  }
};

const fetchDoctors = async (deptId) => {
  if (!deptId) {
    setDoctors([]);
    return;
  }
  try {
    const res = await api.get(`/appointments/staff?department_id=${deptId}`);
    setDoctors(res.data);
  } catch (err) {
    console.error("Error fetching doctors:", err);
  }
};

// === API handlers ===
const handleAddAppointment = async (form) => {
  try {
    await api.post("/appointments/create_appointment", form);
  } catch (err) {
    console.error("Error adding appointment:", err);
    throw err;
  }
};

const handleEditAppointment = async (id, form) => {
  try {
    await api.put(`/appointments/${id}`, form);
  } catch (err) {
    console.error("Error editing appointment:", err);
    throw err;
  }
};

const handleDelete = async (id) => {
  try {
    await api.delete(`/appointments/${id}`);
    await fetchAppointments(); // Refresh the list after delete
  } catch (err) {
    console.error("Error deleting appointment:", err);
    throw err;
  }
};
  useEffect(() => {
    fetchAppointments();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (filtersData.department) {
      const dept = departments.find((d) => d.name === filtersData.department);
      if (dept) {
        fetchDoctors(dept.id);
      }
    } else {
      setDoctors([]);
    }
  }, [filtersData.department, departments]);

  useEffect(() => {
    if (!showAddPopup && !showEditPopup && !showDeletePopup) {
      fetchAppointments();
    }
  }, [showAddPopup, showEditPopup, showDeletePopup]);



  // === Status colors ===
  const statusColors = {
    completed: "bg-green-900 text-green-300",
    cancelled: "bg-gray-700 text-gray-300",
    normal: "bg-blue-900 text-blue-300",
    severe: "bg-red-900 text-red-300",
    new: "bg-purple-900 text-purple-300",
  };

  // === Status Counts ===
  const statusCounts = useMemo(() => {
    const counts = { Visited: 0, Waiting: 0, Cancelled: 0 };
    appointments.forEach((appt) => {
      if (appt.status === "completed") counts.Visited++;
      else if (appt.status === "cancelled") counts.Cancelled++;
      else counts.Waiting++;
    });
    return counts;
  }, [appointments]);

  // === Filtering Logic ===
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      if (activeMainTab === "Today" && !isToday(appt.appointmentDate)) {
        return false;
      }
      if (activeMainTab === "Upcoming" && !isUpcoming(appt.appointmentDate)) {
        return false;
      }
      if (activeMainTab === "Past" && !isPast(appt.appointmentDate)) {
        return false;
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !appt.patient?.toLowerCase().includes(searchLower) &&
          !appt.patientId?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      if (activeFilter !== "All" && appt.status !== activeFilter) {
        return false;
      }

      if (
        filtersData.patientName &&
        !appt.patient
          ?.toLowerCase()
          .includes(filtersData.patientName.toLowerCase())
      ) {
        return false;
      }

      if (
        filtersData.patientId &&
        !appt.patientId
          ?.toLowerCase()
          .includes(filtersData.patientId.toLowerCase())
      ) {
        return false;
      }

      if (
        filtersData.department &&
        appt.department !== filtersData.department
      ) {
        return false;
      }

      if (filtersData.doctor && appt.doctor !== filtersData.doctor) {
        return false;
      }

      if (filtersData.status && appt.status !== filtersData.status) {
        return false;
      }

      if (filtersData.date && appt.appointmentDate !== filtersData.date) {
        return false;
      }

      return true;
    });
  }, [appointments, searchTerm, activeFilter, filtersData, activeMainTab]);

  // === Pagination ===
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const currentAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredAppointments, itemsPerPage]);

  // === Selection handlers ===
  const handleSelectAll = () => {
    if (
      selectedAppointments.length === currentAppointments.length &&
      currentAppointments.every((appt) =>
        selectedAppointments.includes(appt.id)
      )
    ) {
      setSelectedAppointments([]);
    } else {
      setSelectedAppointments(currentAppointments.map((appt) => appt.id));
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedAppointments(
      (prev) =>
        prev.includes(id)
          ? prev.filter((sid) => sid !== id)
          : [...prev, id]
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltersData({ ...filtersData, [name]: value });
  };

  // === Apply filters from popup ===
  const handleApplyFilters = () => {
    setShowFilterPopup(false);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFiltersData({
      patientName: "",
      patientId: "",
      department: "",
      doctor: "",
      status: "",
      date: "",
    });
    setCurrentPage(1);
  };

  // === Dropdown component ===
  const Dropdown = ({
    label,
    value,
    onChange,
    options,
    placeholder = "Select",
  }) => (
    <div>
      <label
        className="text-sm text-black dark:text-white"
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        {label}
      </label>
      <Listbox value={value || ""} onChange={onChange}>
        <div className="relative mt-1 w-[228px]">
          <Listbox.Button className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]">
            {value || placeholder}
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 w-full rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A] max-h-60 overflow-auto">
            {options.map((option, idx) => {
              let displayValue, optionValue;

              if (typeof option === "string") {
                displayValue = option === "" ? placeholder : option;
                optionValue = option;
              } else if (option && typeof option === "object") {
                displayValue = option.name || option.full_name || placeholder;
                optionValue = option.name || option.full_name || "";
              } else {
                displayValue = String(option);
                optionValue = String(option);
              }

              return (
                <Listbox.Option
                  key={idx}
                  value={optionValue}
                  className={({ active }) =>
                    `cursor-pointer select-none py-2 px-2 text-sm rounded-md ${active
                      ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                      : "text-black dark:text-white"
                    }`
                  }
                >
                  {displayValue}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );

  return (
    <div className=" mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-4 w-full max-w-[2500px] mx-auto flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative font-[Helvetica]">
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

      {/* Header */}
      <div className="flex justify-between items-center mt-4 mb-2 relative z-10">
        <h2 className="text-black dark:text-white font-[Helvetica] text-xl font-semibold">
          Appointment List
        </h2>
        <button
          onClick={() => setShowAddPopup(true)}
          className="flex items-center gap-2 bg-[linear-gradient(92.18deg,#025126_3.26%,#0D7F41_50.54%,#025126_97.83%)] border-b-[2px] border-[#0EFF7B] shadow-[0px_2px_12px_0px_#00000040] hover:opacity-90 text-white font-semibold px-4 py-2 rounded-[8px] transition duration-300 ease-in-out"
        >
          <Plus size={18} className="text-white font-[Helvetica]" /> Add
          Appointments
        </button>
      </div>

      {/* Today's Total */}
      <div className="mb-3 min-w-[800px] relative z-10">
        <div className="flex items-center gap-4 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
              {activeMainTab === "All"
                ? "All"
                : activeMainTab === "Upcoming"
                  ? "Upcoming"
                  : activeMainTab === "Past"
                    ? "Past"
                    : "All"}{" "}
              Total
            </span>
            <span className="w-6 h-6 flex items-center font-[Helvetica] text-[12px] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#0D2016] dark:bg-[#14DC6F]">
              {filteredAppointments.length}
            </span>
          </div>

          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

          <div className="flex items-center gap-2">
            <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
              Visited
            </span>
            <span className="w-6 h-6 flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-[#080C4C] dark:bg-[#0D7F41]">
              {statusCounts.Visited}
            </span>
          </div>

          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

          <div className="flex items-center gap-2">
            <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
              Waiting
            </span>
            <span className="w-6 h-6 flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-[#7D3737] dark:bg-[#D97706]">
              {statusCounts.Waiting}
            </span>
          </div>

          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

          <div className="flex items-center gap-2">
            <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
              Cancelled
            </span>
            <span className="h-6 min-w-[24px] flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-[#3C3C3C] dark:bg-[#9CA3AF]">
              {statusCounts.Cancelled}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`min-w-[104px] h-[31px] rounded-[4px] text-[13px] font-normal transition 
                ${activeMainTab === tab
                  ? "bg-[#025126] shadow-[0px_0px_20px_0px_#0EFF7B40] text-white border-[#0EFF7B]"
                  : "bg-gray-200 text-gray-800 border-gray-300 dark:bg-[#1E1E1E] dark:text-gray-300 dark:border-[#3A3A3A]"
                }`}
              onClick={() => {
                setActiveMainTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="flex items-center w-[315px] h-[32px] gap-2 rounded-[8px] px-4 py-1 border border-gray-300 bg-gray-200 shadow dark:bg-[#1E1E1E] dark:border-[#3A3A3A]">
            <Search size={18} className="text-green-600 dark:text-green-400" />
            <input
              type="text"
              placeholder="Search patient name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent px-2 text-xs outline-none font-[Helvetica] text-black dark:text-white placeholder-gray-400 dark:placeholder-[#00A048] w-48"
            />
          </div>

          <button
            onClick={() => setShowFilterPopup(true)}
            className="relative group flex items-center justify-center w-[32px] h-[32px] rounded-[8px] border border-gray-300 bg-gray-200 hover:bg-green-200 dark:bg-[#1E1E1E] dark:border-[#3A3A3A] dark:hover:bg-green-900"
          >
            <Filter size={18} className="text-green-600 dark:text-green-400" />
            <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                    px-3 py-1 text-xs rounded-md shadow-md
                    bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
                    transition-all duration-150">
              Filter
            </span>
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="w-full overflow-x-auto h-[50px] flex items-center gap-3 mb-8 px-2 relative z-10">
        <div className="flex gap-3 min-w-full">
          {filters.map((filter) => (
            <button
              key={filter.value}
              className={`relative min-w-[142px] mx-auto h-[35px] flex items-center justify-center rounded-lg px-3 text-sm font-medium transition-all border-b-[1px]
               ${activeFilter === filter.value
                  ? "bg-[#08994A] text-white dark:bg-green-900"
                  : "text-gray-800 hover:text-green-600 dark:text-white"
                }`}
              onClick={() => {
                setActiveFilter(filter.value);
                setCurrentPage(1);
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative z-10">
        <table className="w-full text-left text-sm">
          <thead className="text-[#0EFF7B] bg-gray-200 dark:text-[#0EFF7B] h-12 font-[Helvetica] dark:bg-[#091810] border-b border-gray-300 dark:border-gray-700">
            <tr>
              <th className="py-3 px-2">
                <input
                  type="checkbox"
                  checked={
                    currentAppointments.length > 0 &&
                    currentAppointments.every((appt) =>
                      selectedAppointments.includes(appt.id)
                    )
                  }
                  onChange={handleSelectAll}
                  className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                />
              </th>
              <th>Patient Name</th>
              <th>Patient ID</th>
              <th>Department</th>
              <th>Doctor</th>
              <th>Room no</th>
              <th>Appointment type</th>
              <th>Status</th>
              <th className="text-center">Edit</th>
            </tr>
          </thead>

          <tbody>
            {currentAppointments.length > 0 ? (
              currentAppointments.map((appt, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-300 dark:border-gray-800 font-[Helvetica]"
                >
                  <td className="px-2">
                    <input
                      type="checkbox"
                      className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                      checked={selectedAppointments.includes(appt.id)}
                      onChange={() => handleCheckboxChange(appt.id)}
                    />
                  </td>

                  <td className="py-3">
                    <div className="font-medium text-black dark:text-white">
                      {appt.patient}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {appt.date}
                      <br />
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {appt.appointmentTime}
                      </span>
                    </div>
                  </td>

                  <td className="text-black dark:text-white">
                    {appt.patientId}
                  </td>
                  <td className="text-black dark:text-white">
                    {appt.department}
                  </td>
                  <td className="text-black dark:text-white">{appt.doctor}</td>
                  <td className="text-black dark:text-white">{appt.room}</td>
                  <td>
  <span
    className={`px-2 py-1 rounded-full text-xs ${
      appt.type === "Checkup" || appt.type === "checkup"
        ? "bg-purple-800 text-purple-200 dark:bg-purple-900 dark:text-purple-200"
        : appt.type === "Follow-up" || appt.type === "followup"
        ? "bg-green-800 text-green-200 dark:bg-green-900 dark:text-green-200"
        : appt.type === "Emergency" || appt.type === "emergency"
        ? "bg-red-800 text-red-200 dark:bg-red-900 dark:text-red-200"
        : "bg-gray-800 text-gray-200 dark:bg-gray-800 dark:text-gray-300"
    }`}
  >
    {appt.type}
  </span>
</td>

                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${statusColors[appt.status] || "bg-gray-700 text-gray-300"
                        }`}
                    >
                      {statusDisplayMap[appt.status] || appt.status}
                    </span>
                  </td>

                  <td className="text-center">
                    <div className="flex justify-center gap-4 relative overflow-visible">
                      <div className="relative group">
                        <Edit2
                          size={16}
                          onClick={() => {
                            const backend = appt.raw;
                            const backendReady = {
                              id: backend.id,
                              patient_name: backend.patient_name,
                              patient_id: backend.patient_id,
                              department_id: backend.department_id || "",
                              staff_id: backend.staff_id || "",
                              room_no: backend.room_no,
                              phone_no: backend.phone_no,
                              appointment_type: backend.appointment_type,
                              status: backend.status,
                              appointment_date: backend.appointment_date || "",
                              appointment_time: backend.appointment_time || "",
                              department_name: backend.department || "",
                              staff_name: backend.doctor || "",
                            };
                            setSelectedAppointment(backendReady);
                            setShowEditPopup(true);
                          }}
                          className="text-[#08994A] dark:text-blue-400 cursor-pointer hover:scale-110 transition"
                        />
                        <span className="absolute bottom-5 -left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150 z-50">
                          Edit
                        </span>
                      </div>

                      <div className="relative group">
                        <Trash2
                          size={16}
                          onClick={() => {
                            setSelectedAppointment({ id: appt.id });
                            setShowDeletePopup(true);
                          }}
                          className="cursor-pointer text-red-500 hover:scale-110"
                        />
                        <span className="absolute bottom-5 -left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150 z-50">
                          Delete
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-6 text-gray-600 dark:text-gray-400 italic"
                >
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center mt-4 bg-gray-100 dark:bg-black p-4 rounded gap-x-4 dark:border-[#1E1E1E]">
        <div className="text-sm text-black dark:text-white">
          Page{" "}
          <span className="text-[#08994A] dark:text-[#0EFF7B] font-semibold">
            {currentPage}
          </span>{" "}
          of {totalPages} ({(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, filteredAppointments.length)}{" "}
          from {filteredAppointments.length} Appointments)
        </div>
        <div className="flex items-center gap-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${currentPage === 1 ? "opacity-50" : "hover:bg-[#0EFF7B1A]"
              }`}
          >
            <ChevronLeft size={12} className="text-[#08994A] dark:text-white" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${currentPage === totalPages ? "opacity-50" : "hover:bg-[#0EFF7B1A]"
              }`}
          >
            <ChevronRight
              size={12}
              className="text-[#08994A] dark:text-white"
            />
          </button>
        </div>
      </div>

      {/* Filter Popup */}
      {showFilterPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
            <div
              className="w-[505px] h-auto rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              {/* Gradient Inner Border */}
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
                  Filter Appointment
                </h3>
                <button
                  onClick={() => setShowFilterPopup(false)}
                  className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
                >
                  <X size={16} className="text-black dark:text-white" />
                </button>
              </div>

              {/* Filter Form Grid */}
              <div className="grid grid-cols-2 gap-6">
                <Dropdown
                  label="Department"
                  value={filtersData.department}
                  onChange={(v) =>
                    setFiltersData({
                      ...filtersData,
                      department: v,
                      doctor: "",
                    })
                  }
                  options={["", ...departments.map((dept) => dept.name)]}
                  placeholder="Select Department"
                />

                <Dropdown
                  label="Status"
                  value={filtersData.status}
                  onChange={(v) =>
                    setFiltersData({ ...filtersData, status: v })
                  }
                  options={[
                    "",
                    "new",
                    "normal",
                    "severe",
                    "completed",
                    "cancelled",
                  ]}
                  placeholder="Select Status"
                />

                <Dropdown
                  label="Doctor"
                  value={filtersData.doctor}
                  onChange={(v) =>
                    setFiltersData({ ...filtersData, doctor: v })
                  }
                  options={["", ...doctors.map((doc) => doc.full_name)]}
                  placeholder="Select Doctor"
                />

                <div>
                  <label className="text-sm text-black dark:text-white">
                    Date
                  </label>
                  <div
                    className="relative mt-1 cursor-pointer"
                    onClick={() =>
                      document.getElementById("filterDateInput").showPicker()
                    }
                  >
                    <input
  type="date"
  id="filterDateInput"
  name="date"
  value={filtersData.date}
  onChange={handleFilterChange}
  className="w-[228px] h-[32px] px-3 pr-10 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none cursor-pointer
             [appearance:textfield]
             [&::-webkit-calendar-picker-indicator]:opacity-0
             [&::-webkit-calendar-picker-indicator]:hidden"
/>
 
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0EFF7B] w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={handleClearFilters}
                  className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-gray-600 text-gray-600 dark:text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] bg-gray-100 dark:bg-transparent"
                >
                  Clear
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B66] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popups */}
      {showAddPopup && (
        <AddAppointmentPopup
          onClose={() => setShowAddPopup(false)}
          onSuccess={fetchAppointments}
        />
      )}

      {showEditPopup && (
        <EditAppointmentPopup
          onClose={() => setShowEditPopup(false)}
          appointment={selectedAppointment}
          onUpdate={fetchAppointments}
        />
      )}

      {showDeletePopup && (
        <DeleteAppointmentPopup
          onClose={() => setShowDeletePopup(false)}
          onConfirm={async () => {
            await handleDelete(selectedAppointment.id);
            setShowDeletePopup(false);
          }}
        />
      )}
    </div>
  );
};

export default AppointmentList;