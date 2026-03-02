import React, { useState, useMemo, Fragment, useEffect } from "react";
import {
  Search,
  Plus,
  FileText,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  LogOut,
  X,
  UserMinus,
} from "lucide-react";
import { Listbox } from "@headlessui/react";
import { useNavigate, useLocation } from "react-router-dom";
import AdmitPatientPopup from "./AdmitPatientPopup";
import EditAdmitPatientPopup from "./EditAdmitPatientPopup";
import DischargePopup from "./Dischargepatient";
import { successToast, errorToast } from "../../components/Toast";
import api from "../../utils/axiosConfig";

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValue, setFilterValue] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [bedGroupFilter, setBedGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdmitPopup, setShowAdmitPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDischargePopup, setShowDischargePopup] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState(null);
  const [dischargeRoom, setDischargeRoom] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const itemsPerPage = 9;

  // Fetch rooms with correct patient data
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await api.get("/bedgroups/all");
        const groups = response.data;

        const roomList = [];

        for (const group of groups) {
          for (const bed of group.beds) {
            let patientName = "—";
            let patientId = "—";
            let admitDate = "—";

            if (bed.patient) {
              patientName = bed.patient.name || "—";
              patientId = bed.patient.id || "—";

              try {
                const patientResponse = await api.get(`/patients/${bed.patient.id}`);
                const patient = patientResponse.data;
                admitDate = patient.admission_date
                  ? new Date(patient.admission_date).toLocaleDateString("en-GB")
                  : "—";
              } catch (err) {
                console.warn("Failed to fetch patient:", err);
              }
            }

            roomList.push({
              roomNo: bed.bed_number.toString(),
              bedGroup: group.bedGroup,
              patient: patientName,
              patientId,
              admit: admitDate,
              status: bed.is_occupied ? "Not Available" : "Available",
              bedId: bed.id,
              groupId: group.id,
            });
          }
        }

        setRooms(roomList);
      } catch (err) {
        console.error("Fetch error:", err);
        errorToast(err.response?.data?.detail || "Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [refreshKey]);

  const statusColors = {
    Available: "text-[#08994A] dark:text-[#0EFF7B]",
    "Not Available": "text-[#FF2424] dark:text-[#FF2424]",
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch =
        !searchTerm ||
        room.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.patientId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGroupFilter =
        !filterValue || filterValue === "All" || room.bedGroup === filterValue;

      const matchesBedGroup =
        !bedGroupFilter ||
        bedGroupFilter === "All" ||
        room.bedGroup === bedGroupFilter;

      const matchesStatus = !statusFilter || room.status === statusFilter;

      return (
        matchesSearch && matchesGroupFilter && matchesBedGroup && matchesStatus
      );
    });
  }, [rooms, searchTerm, filterValue, bedGroupFilter, statusFilter]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  const handleCheckboxChange = (roomNo) => {
    setSelectedRooms((prev) =>
      prev.includes(roomNo)
        ? prev.filter((r) => r !== roomNo)
        : [...prev, roomNo]
    );
  };

  const handleSelectAll = () => {
    if (selectedRooms.length === currentRooms.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(currentRooms.map((r) => r.roomNo));
    }
  };

  const handleAdmitClick = () => setShowAdmitPopup(true);
  const handleAdmitSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    successToast("Patient admitted successfully!");
  };

  const handleEditClick = (room) => {
  // ❌ Do not allow edit if bed is Available
  if (room.status === "Available") {
    errorToast("Editing is not allowed for available bed groups");
    return;
  }

  // ✅ Allow edit only when Not Available
  setRoomToEdit(room);
  setShowEditPopup(true);
};

  const handleDischargeClick = (room) => {
    setDischargeRoom(room);
    setShowDischargePopup(true);
  };

  const handleConfirmDischarge = async () => {
    if (!dischargeRoom) return;

    try {
      await api.post(
        `/bedgroups/${dischargeRoom.groupId}/beds/${dischargeRoom.roomNo}/vacate`
      );

      successToast("Patient discharged successfully!");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      errorToast(err.response?.data?.detail || "Discharge failed");
    } finally {
      setShowDischargePopup(false);
      setDischargeRoom(null);
    }
  };

  const handleCloseAdmitPopup = () => setShowAdmitPopup(false);
  const handleCloseEditPopup = () => {
    setShowEditPopup(false);
    setRoomToEdit(null);
  };
  const handleCloseDischargePopup = () => {
    setShowDischargePopup(false);
    setDischargeRoom(null);
  };

  const handleBedListClick = () => navigate("/Administration/BedList");
  const handleRoomManagementClick = () =>
    navigate("/Administration/RoomManagement");

  const FilterPopover = ({ isOpen, onClose }) => {
    const [bedGroup, setBedGroup] = useState(bedGroupFilter);
    const [status, setStatus] = useState(statusFilter);
    const [validationError, setValidationError] = useState("");

    // Get unique bed groups from the actual rooms data
    const bedGroups = ["All", ...new Set(rooms.map((room) => room.bedGroup))];
    const statuses = ["Available", "Not Available"];

    const handleApply = () => {
      // Reset validation error
      setValidationError("");
      
      // Check if at least one filter is selected
      if (!bedGroup && !status) {
        setValidationError("Please select at least one option");
        return;
      }
      
      setBedGroupFilter(bedGroup);
      setStatusFilter(status);
      onClose();
    };

    const handleClear = () => {
      // Clear the local state but DON'T close the popup
      setBedGroup("");
      setStatus("");
      setValidationError("");
    };

    const handleCloseWithClear = () => {
      // Clear filters and close
      setBedGroup("");
      setStatus("");
      setBedGroupFilter("");
      setStatusFilter("");
      setValidationError("");
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
        <div className="w-[504px] h-auto rounded-[20px] bg-gray-100 dark:bg-[#000000E5] text-black dark:text-white p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md">
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
          <div className="flex justify-between items-center pb-3 mb-4">
            <h3 className="font-inter font-medium text-[16px] leading-[19px]">
              Filter
            </h3>
            <button
              onClick={handleCloseWithClear}
              className="w-6 h-6 rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B1A] flex items-center justify-center"
            >
              <X size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
            </button>
          </div>
          
          {/* Validation Error Message */}
          {validationError && (
            <div className="mb-4 p-2 rounded-[8px] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">
                {validationError}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm">Bed Group</label>
              <Listbox value={bedGroup} onChange={setBedGroup}>
                <div className="relative mt-1 w-[228px]">
                  <Listbox.Button className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-gray-100 dark:bg-black text-[#08994A] dark:text-[#0EFF7B] text-left text-[14px] leading-[16px] focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]">
                    {bedGroup || "Select bedgroup"}
                    <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-1 w-full max-h-40 overflow-auto rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] no-scrollbar">
                    {bedGroups.map((bg) => (
                      <Listbox.Option
                        key={bg}
                        value={bg}
                        className={({ active, selected }) =>
                          `cursor-pointer select-none py-2 px-2 text-sm rounded-md ${
                            active
                              ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
                              : "text-black dark:text-white"
                          } ${
                            selected
                              ? "font-medium text-[#08994A] dark:text-[#0EFF7B]"
                              : ""
                          }`
                        }
                      >
                        {bg}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
            <div>
              <label className="text-sm">Status</label>
              <Listbox value={status} onChange={setStatus}>
                <div className="relative mt-1 w-[228px]">
                  <Listbox.Button className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-gray-100 dark:bg-black text-[#08994A] dark:text-[#0EFF7B] text-left text-[14px] leading-[16px] focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]">
                    {status || "Select status"}
                    <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-1 w-full max-h-40 overflow-auto rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A]">
                    {statuses.map((s) => (
                      <Listbox.Option
                        key={s}
                        value={s}
                        className={({ active, selected }) =>
                          `cursor-pointer select-none py-2 px-2 text-sm rounded-md ${
                            active
                              ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
                              : "text-black dark:text-white"
                          } ${
                            selected
                              ? "font-medium text-[#08994A] dark:text-[#0EFF7B]"
                              : ""
                          }`
                        }
                      >
                        {s}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
          </div>
          <div className="flex justify-center gap-[18px] mt-8">
            <button
              onClick={handleClear}
              className="w-[104px] h-[33px] rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] px-3 py-2 text-black dark:text-white font-medium text-[14px] leading-[16px] shadow opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A]"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              className="w-[104px] h-[33px] border-b-[2px] border-[#0EFF7B] rounded-[8px] bg-gradient-to-r from-[#14DC6F] to-[#09753A] text-white dark:text-black font-medium text-[14px] hover:bg-[#0cd968] transition"
              style={{
                background:
                  "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
              }}
            >
              Filter
            </button>
          </div>
        </div>
      </div>
    );
  };

  // const isBedListRoute = location.pathname === "/Administration/RoomManagement/BedList";
  const isBedListRoute = location.pathname.includes("BedList");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-[#08994A] dark:text-[#0EFF7B]">
          Loading rooms...
        </div>
      </div>
    );
  }

  const RoomManagementContent = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-center text-sm min-w-[1000px]">
        <thead className="px-[20px] rounded-[60px] border border-[#0EFF7B] dark:border-[#3C3C3C] bg-gray-200 dark:bg-[#091810] opacity-100 font-inter font-normal text-[16px] leading-[100%] tracking-[0%] text-[#08994A] dark:text-[#0EFF7B]">
          <tr>
            <th className="py-3 px-2">
              <input
                type="checkbox"
                className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                checked={
                  currentRooms.length > 0 &&
                  selectedRooms.length === currentRooms.length
                }
                onChange={handleSelectAll}
              />
            </th>
            <th>Bed no</th>
            <th>Bed Group</th>
            <th>Patients</th>
            <th>Admit</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="[&>tr>td]:px-4 [&>tr>td]:py-3 bg-gray-100 dark:bg-black">
          {currentRooms.length > 0 ? (
            currentRooms.map((room, index) => (
              <tr
                key={room.roomNo}
                className="border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
              >
                <td className="px-2 py-3">
                  <input
                    type="checkbox"
                    className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                    checked={selectedRooms.includes(room.roomNo)}
                    onChange={() => handleCheckboxChange(room.roomNo)}
                  />
                </td>
                <td className="text-black dark:text-white">
                  {room.roomNo}
                </td>
                <td className="text-black dark:text-white">
                  {room.bedGroup}
                </td>
                <td className="flex items-center justify-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#08994A] dark:bg-green-600 flex items-center justify-center text-sm font-bold text-white dark:text-black">
                    {room.patient === "—"
                      ? "?"
                      : room.patient.charAt(0)}
                  </div>
                  <div className="text-center">
                    <p className="text-black dark:text-white text-sm font-medium">
                      {room.patient}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      {room.patientId}
                    </p>
                  </div>
                </td>
                <td className="text-black dark:text-white">
                  {room.admit}
                </td>
                <td className={statusColors[room.status]}>
                  {room.status}
                </td>
                <td className="text-center">
                  <div className="flex justify-center gap-2">
                    {/* Edit Button */}
                    <div
                      className="relative group w-8 h-8 flex items-center justify-center rounded-full 
           border border-[#08994A1A] dark:border-[#0EFF7B1A] 
           bg-[#08994A1A] dark:bg-[#0EFF7B1A] cursor-pointer"
                      onClick={() => handleEditClick(room)}
                    >
                      <Edit
                        size={16}
                        className="text-[#08994A] dark:text-[#0EFF7B] 
             hover:text-[#0cd968] dark:hover:text-[#0cd968]"
                      />
                      <span
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
             px-3 py-1 text-xs rounded-md shadow-md
             bg-gray-100 dark:bg-black text-black dark:text-white
             opacity-0 group-hover:opacity-100
             transition-all duration-150"
                      >
                        Edit
                      </span>
                    </div>

                    {/* Delete / Discharge Button */}
                    <div
                      className="relative group w-8 h-8 flex items-center justify-center rounded-full 
             border border-red-200 dark:border-red-900/50 
             bg-red-50 dark:bg-red-900/20 cursor-pointer"
                      onClick={() => handleDischargeClick(room)}
                    >
                      <UserMinus
                        size={16}
                        className="text-red-600 dark:text-red-400 
             hover:text-red-700 dark:hover:text-red-300"
                      />
                      <span
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
               px-3 py-1 text-xs rounded-md shadow-md
               bg-gray-100 dark:bg-black text-black dark:text-white
               opacity-0 group-hover:opacity-100
               transition-all duration-150 pointer-events-none"
                      >
                        Discharge Patient
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                className="h-64 text-center text-gray-500 dark:text-gray-400 text-lg font-medium"
              >
                No rooms found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const BedListContent = () => (
    <div className="text-center py-10 text-black dark:text-white">
      <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">
        Bed List View
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        This is the Bed List page content.
      </p>
      <button
        onClick={handleRoomManagementClick}
        className="mt-4 px-4 py-2 bg-[#08994A] dark:bg-green-500 text-white dark:text-black rounded-full hover:bg-[#0EFF7B1A] dark:hover:bg-green-600 border border-[#0EFF7B] dark:border-[#1E1E1E]"
      >
        Back to Room Management
      </button>
    </div>
  );

  return (
    <div className=" h-100% mb-4 bg-gray-100 dark:bg-black text-black dark:text-white rounded-xl w-full max-w-[2500px] mx-auto dark:border-[#1E1E1E] font-[Helvetica]">
      <div className=" mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-6 w-full max-w-[2500px] mx-auto flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative">
        <div
          className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
            zIndex: 0,
          }}
        ></div>
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            Room Management
          </h2>
          <button
            onClick={handleAdmitClick}
            className="flex items-center gap-2 px-4 py-2 rounded-[8px] border-b border-[#0EFF7B] text-white font-semibold transition-all duration-300"
            style={{
              background:
                "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
            }}
          >
            <Plus size={18} className="text-white" /> Add Admission
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          You have total {new Set(rooms.map((r) => r.bedGroup)).size} types bed
          group.
        </p>

        {/* Search + Filter */}
        <div className="flex justify-between items-center mb-4">
          <Listbox value={filterValue} onChange={setFilterValue}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                checked={
                  currentRooms.length > 0 &&
                  selectedRooms.length === currentRooms.length
                }
                onChange={handleSelectAll}
              />
              <div className="relative">
                <Listbox.Button className="flex items-center justify-between px-4 h-[40px] rounded-[8px] border border-[#0EFF7B] dark:border-[#3C3C3C] bg-gray-100 dark:bg-[#1E1E1E] text-[#08994A] dark:text-white min-w-[120px]">
                  {filterValue}
                  <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-green-400 ml-2" />
                </Listbox.Button>
                <Listbox.Options className="absolute mt-2 w-full rounded-lg bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A]">
                  {["All", ...new Set(rooms.map((r) => r.bedGroup))].map(
                    (option) => (
                      <Listbox.Option
                        key={option}
                        value={option}
                        className={({ active, selected }) =>
                          `cursor-pointer select-none py-2 px-4 text-sm rounded-lg ${
                            selected
                              ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B22] text-[#08994A] dark:text-[#0EFF7B]"
                              : active
                              ? "bg-[#0EFF7B1A] dark:bg-[#1A1A1A] text-[#08994A] dark:text-white"
                              : "text-black dark:text-gray-300"
                          }`
                        }
                      >
                        {option}
                      </Listbox.Option>
                    )
                  )}
                </Listbox.Options>
              </div>
              <button
                onClick={
                  isBedListRoute
                    ? handleRoomManagementClick
                    : handleBedListClick
                }
                className={`flex items-center gap-2 px-4 h-[40px] rounded-[8px] text-sm border border-[#0EFF7B] dark:border-green-400 text-[#08994A] dark:text-white transition ${
                  isBedListRoute
                    ? "text-white border-[#0EFF7B66] bg-gradient-to-r from-[#0EFF7B] to-[#08994A] dark:from-[#14DC6F] dark:to-[#09753A]"
                    : "bg-[#0EFF7B1A] dark:bg-[#025126] dark:shadow-[0px_0px_20px_0px_#0EFF7B40]"
                }`}
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-[4px]">
                  <FileText size={18} className="text-[#0EFF7B]" />
                </span>
                Bed group lists
              </button>
            </div>
          </Listbox>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-[#0EFF7B] bg-[#0EFF7B1A] dark:bg-[#1E1E1E] rounded-[8px] px-3 py-1 w-[315px] h-[42px] relative">
              <Search
                size={18}
                className="text-[#08994A] dark:text-[#0EFF7B]"
              />
              <input
                type="text"
                placeholder="Search room no or patient name or ID"
                className="bg-transparent text-[#08994A] dark:text-[#0EFF7B] placeholder-[#0EFF7B] w-full outline-none text-sm "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 bg-gray-100 dark:bg-[#1E1E1E] text-[#08994A] dark:text-[#0EFF7B] px-4 py-2 rounded-[8px] border border-[#0EFF7B] dark:border-[#0EFF7B] hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] relative"
            >
              <Filter
                size={18}
                className="text-[#08994A] dark:text-[#0EFF7B]"
              />{" "}
              Filter
            </button>
          </div>
        </div>

        <FilterPopover
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
        />

        {/* Conditional Content */}
        {isBedListRoute ? <BedListContent /> : <RoomManagementContent />}

        {/* Popups */}
        {showAdmitPopup && (
          <AdmitPatientPopup
            onClose={handleCloseAdmitPopup}
            onSuccess={handleAdmitSuccess}
          />
        )}
        {showEditPopup && (
          <EditAdmitPatientPopup
            onClose={handleCloseEditPopup}
            room={roomToEdit}
            onSuccess={handleAdmitSuccess}
          />
        )}
        {showDischargePopup && (
          <DischargePopup
            onClose={handleCloseDischargePopup}
            onConfirm={handleConfirmDischarge}
          />
        )}

        {/* Pagination */}
        {!isBedListRoute && (
          <div className="flex items-center h-full mt-4 bg-gray-100 dark:bg-black p-4 rounded gap-x-4 dark:border-[#1E1E1E]">
            <div className="text-sm text-black dark:text-white">
              Page{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {currentPage}
              </span>{" "}
              of {totalPages} ({indexOfFirst + 1} to{" "}
              {Math.min(indexOfLast, filteredRooms.length)} from{" "}
              {filteredRooms.length} Rooms)
            </div>
            <div className="flex items-center gap-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
                  currentPage === 1
                    ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
                    : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
                }`}
              >
                <ChevronLeft
                  size={12}
                  className="text-[#08994A] dark:text-white"
                />
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
                  currentPage === totalPages
                    ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
                    : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
                }`}
              >
                <ChevronRight
                  size={12}
                  className="text-[#08994A] dark:text-white"
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagement;
