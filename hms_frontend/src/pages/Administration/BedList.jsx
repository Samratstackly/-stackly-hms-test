import React, { useState, useMemo, useEffect, Fragment } from "react";
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  FileText,
} from "lucide-react";
import { Listbox, Menu, Transition } from "@headlessui/react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import DeleteAppointmentPopup from "./DeleteRoomListPopup";
import AddBedGroupPopup from "./AddBedGroupPopup";
import EditBedGroupPopup from "./EditBedGroupPopup";
import { successToast, errorToast } from "../../components/Toast";
import api from "../../utils/axiosConfig"; // Cookie-based axios instance

const BedList = () => {
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValue, setFilterValue] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [bedGroupFilter, setBedGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingRoomIndex, setEditingRoomIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const itemsPerPage = 9;

  const [roomsData, setRoomsData] = useState([]);

  // Fetch bed groups on mount
  useEffect(() => {
    const fetchBedGroups = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/bedgroups/all");

        const data = response.data;

        // Better transformation with error handling
        const transformedData = data.map((group) => {
          let bedRange = "1-1";

          // Check if beds array exists and has data
          if (
            group.beds &&
            Array.isArray(group.beds) &&
            group.beds.length > 0
          ) {
            const bedNumbers = group.beds
              .map((b) => parseInt(b.bed_number))
              .filter((num) => !isNaN(num))
              .sort((a, b) => a - b);

            if (bedNumbers.length > 0) {
              bedRange = `${bedNumbers[0]}-${bedNumbers[bedNumbers.length - 1]
                }`;
            }
          }

          return {
            id: group.id,
            bedGroup: group.bedGroup,
            capacity: group.capacity,
            occupied: group.occupied || 0,
            unoccupied: group.unoccupied || 0,
            status: group.status,
            bedRange,
            beds: group.beds || [], // Ensure beds is always an array
          };
        });

        setRoomsData(transformedData);
        successToast("Bed groups loaded successfully!");
      } catch (err) {
        let errorMessage = "Failed to fetch bed groups.";

        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            errorMessage = "Session expired. Please login again.";
          } else {
            errorMessage = err.response.data?.detail || errorMessage;
          }
        } else if (err.request) {
          errorMessage = "Network error. Please check your connection.";
        } else {
          errorMessage = err.message || errorMessage;
        }

        setError(errorMessage);
        errorToast(errorMessage);
        console.error("Fetch BedGroups Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBedGroups();
  }, []);

  const filteredRooms = useMemo(() => {
    return roomsData.filter((room) => {
      if (
        searchTerm &&
        !room.bedGroup.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (
        filterValue &&
        filterValue !== "All" &&
        room.bedGroup !== filterValue
      ) {
        return false;
      }
      if (
        bedGroupFilter &&
        bedGroupFilter !== "All" &&
        room.bedGroup !== bedGroupFilter
      ) {
        return false;
      }
      if (statusFilter && room.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [roomsData, searchTerm, filterValue, bedGroupFilter, statusFilter]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  const handleCheckboxChange = (index) => {
    if (selectedRooms.includes(index)) {
      setSelectedRooms(selectedRooms.filter((r) => r !== index));
    } else {
      setSelectedRooms([...selectedRooms, index]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRooms.length === currentRooms.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(currentRooms.map((_, index) => index));
    }
  };

  const handleDeleteClick = (index) => {
    setRoomToDelete(index);
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = async () => {
    if (roomToDelete !== null) {
      const roomId = roomsData[roomToDelete].id;
      try {
        await api.delete(`/bedgroups/${roomId}/`);

        // Remove from local state
        setRoomsData((prev) => prev.filter((_, i) => i !== roomToDelete));
        setSelectedRooms((prev) => prev.filter((r) => r !== roomToDelete));
        successToast("Bed group deleted successfully!");
      } catch (err) {
        let errorMessage = "Failed to delete bed group.";

        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            errorMessage = "Session expired. Please login again.";
          } else if (err.response.status === 404) {
            errorMessage = "Bed group not found.";
          } else if (err.response.status === 400) {
            errorMessage = err.response.data?.detail || errorMessage;
          } else {
            errorMessage = err.response.data?.detail || errorMessage;
          }
        } else if (err.request) {
          errorMessage = "Network error. Please check your connection.";
        } else {
          errorMessage = err.message || errorMessage;
        }

        errorToast(errorMessage);
        console.error("Delete BedGroup Error:", err);
      }
    }
    setRoomToDelete(null);
    setShowDeletePopup(false);
  };

  const handleCancelDelete = () => {
    setRoomToDelete(null);
    setShowDeletePopup(false);
  };

  const handleBedListClick = () => {
    navigate("/Administration/BedList");
  };

  const handleRoomManagementClick = () => {
    navigate("/Administration/roommanagement");
  };

  const getRoomRange = (occupied) => {
    const start = Math.floor(occupied / 20) * 20;
    const end = start + 20;
    return `${start} to ${end}`;
  };

  const handleUpdateBedGroup = async (updatedData) => {
    const { id, bedGroup, bedFrom, bedTo } = updatedData;

    try {
      // Send update request to backend
      const response = await api.put(`/bedgroups/${id}/`, {
        bedGroup: bedGroup,
        bedFrom: parseInt(bedFrom),
        bedTo: parseInt(bedTo),
      });

      // Update local state with the response data
      const updatedGroup = response.data;

      // Calculate bed range from updated beds
      const beds = updatedGroup.beds || [];
      const bedNumbers = beds.map(b => b.bed_number).sort((a, b) => a - b);
      const bedRange = bedNumbers.length > 0
        ? `${bedNumbers[0]}-${bedNumbers[bedNumbers.length - 1]}`
        : "1-1";

      setRoomsData((prev) =>
        prev.map((room) =>
          room.id === id
            ? {
              ...room,
              bedGroup: updatedGroup.bedGroup,
              capacity: updatedGroup.capacity,
              occupied: updatedGroup.occupied,
              unoccupied: updatedGroup.unoccupied,
              status: updatedGroup.status,
              bedRange: bedRange,
              beds: beds,
            }
            : room
        )
      );

      successToast("Bed group updated successfully!");
    } catch (err) {
      let errorMessage = "Failed to update bed group.";

      if (err.response) {
        if (err.response.status === 409) {
          // Handle duplicate bed number conflict
          const conflictData = err.response.data;
          errorMessage = conflictData.message || "Bed numbers already exist in the requested range.";
          
          // Show the suggested alternative range
          if (conflictData.suggested_range) {
            errorMessage += ` Suggested range: ${conflictData.suggested_range}`;
          }
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.detail || errorMessage;
        } else if (err.response.status === 404) {
          errorMessage = "Bed group not found.";
        } else {
          errorMessage = err.response.data?.detail || errorMessage;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }

      errorToast(errorMessage);
      console.error("Update BedGroup Error:", err);
    }
  };

  const FilterPopover = ({ isOpen, onClose }) => {
    const [bedGroup, setBedGroup] = useState(bedGroupFilter || "All");
    const [status, setStatus] = useState(statusFilter || "All");

    const bedGroups = ["All", ...new Set(roomsData.map((r) => r.bedGroup))];
    const statuses = ["All", "Available", "Not Available"];

    const handleApply = () => {
      setBedGroupFilter(bedGroup === "All" ? "" : bedGroup);
      setStatusFilter(status === "All" ? "" : status);
      onClose();
    };

    const handleClear = () => {
      setBedGroup("All");
      setStatus("All");
      setBedGroupFilter("");
      setStatusFilter("");
      // Do not close - stay open after clear
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-[504px] h-auto rounded-[20px]  bg-gray-100 dark:bg-[#000000E5] text-black dark:text-white p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md relative">
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
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 dark:text-gray-400 hover:text-[#08994A] dark:hover:text-white"
          >
            <X size={20} />
          </button>

          <h3 className="text-black dark:text-white text-lg font-semibold mb-4">
            Filter
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {/* --- Bed Group Dropdown --- */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Bed Group
              </label>
              <Listbox value={bedGroup} onChange={setBedGroup}>
                <div className="relative mt-1 w-[228px]">
                  <Listbox.Button className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-gray-100 dark:bg-black text-[#08994A] dark:text-[#0EFF7B] text-left text-[14px] leading-[16px] focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]">
                    {bedGroup || "Select bed group"}
                    <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]" />
                    </span>
                  </Listbox.Button>

                  <Listbox.Options
                    className="absolute mt-1 w-full max-h-40 overflow-auto rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] no-scrollbar"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    {bedGroups.map((bg, idx) => (
                      <Listbox.Option
                        key={idx}
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

            {/* --- Status Dropdown --- */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Status
              </label>
              <Listbox value={status} onChange={setStatus}>
                <div className="relative mt-1 w-[228px]">
                  <Listbox.Button className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-gray-100 dark:bg-black text-[#08994A] dark:text-[#0EFF7B] text-left text-[14px] leading-[16px] focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]">
                    {status || "Select status"}
                    <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]" />
                    </span>
                  </Listbox.Button>

                  <Listbox.Options
                    className="absolute mt-1 w-full max-h-40 overflow-auto rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] no-scrollbar"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    {statuses.map((s, idx) => (
                      <Listbox.Option
                        key={idx}
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
              className="w-[104px] h-[33px] rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
             px-3 py-2 text-black dark:text-white font-medium text-[14px] leading-[16px]
             shadow opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A]"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              className="w-[104px] h-[33px] border-b-[2px] border-[#0EFF7B] rounded-[8px] text-white dark:text-black font-medium text-[14px]
             hover:bg-[#0cd968] transition"
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

  const isBedListRoute = location.pathname.includes("BedList");

  if (loading) {
    return <div className="text-center py-8">Loading bed groups...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="h-auto max-h-auto mb-4 bg-gray-100 dark:bg-black text-black dark:text-white rounded-xl w-full max-w-[2500px] mx-auto dark:border-[#1E1E1E] font-[Helvetica]">
      <div
        className=" mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-6 w-full max-w-[2500px] mx-auto flex flex-col  
     bg-gray-100 dark:bg-transparent overflow-hidden relative"
      >
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
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            Room Management
          </h2>
          <button
            onClick={() => setShowAddPopup(true)}
            className="flex items-center gap-2 bg-[#08994A] dark:bg-green-500 border-b-[2px] border-[#0EFF7B] dark:border-[#0EFF7B] hover:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-green-600 px-4 py-2 rounded-[8px] text-white dark:text-white font-semibold"
            style={{
              background:
                "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
            }}
          >
            <Plus size={18} className="text-white dark:text-white" /> Add Bed
            Group
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-7">
          You have total {roomsData.length} types bed group.
        </p>

        {/* Filter + Search */}
        <div className="flex justify-between items-center mb-4">
          <Listbox value={filterValue} onChange={setFilterValue}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-green-400 rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-white checked:before:text-sm"
                checked={
                  selectedRooms.length === currentRooms.length &&
                  currentRooms.length > 0
                }
                onChange={handleSelectAll}
              />
              <div className="relative">
                <Listbox.Button className="flex items-center justify-between px-4 h-[40px] rounded-[8px] border border-[#0EFF7B] dark:border-[#3C3C3C] bg-gray-100 dark:bg-[#1E1E1E] text-[#08994A] dark:text-white min-w-[120px]">
                  {filterValue}
                  <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-green-400 ml-2" />
                </Listbox.Button>
                <Listbox.Options className="absolute mt-2 w-full rounded-lg bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A]">
                  {["All", ...new Set(roomsData.map((r) => r.bedGroup))].map(
                    (option, idx) => (
                      <Listbox.Option
                        key={idx}
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
                className={`flex items-center gap-2 px-4 h-[40px]  rounded-[8px] text-sm border border-[#0EFF7B] dark:border-green-400 text-[#08994A] dark:text-white transition ${
                  isBedListRoute
                    ? "text-[#08994A] dark:text-white border-[#0EFF7B66] bg-[#0EFF7B1A] dark:bg-[#025126] dark:shadow-[0px_0px_20px_0px_#0EFF7B40]"
                    : "text-white border-[#0EFF7B66] bg-[#0EFF7B1A] dark:bg-[#025126] dark:shadow-[0px_0px_20px_0px_#0EFF7B40]"
                }`}
              >
                <span className="flex items-center justify-center w-5 h-5  rounded-[4px]">
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
                placeholder="Search Bed Group Names"
                className="bg-transparent text-[#08994A] dark:text-[#0EFF7B] placeholder-[#0EFF7B] w-full outline-none text-sm"
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

        {/* Filter Popover */}
        <FilterPopover
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
        />

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <div
            style={{
              height: "auto",
            }}
          >
            <table className="w-full text-left text-sm mt-5 mb-3 border-collapse">
              <thead className="bg-gray-200 dark:bg-[#091810] border border-[#0EFF7B] dark:border-[#3C3C3C] text-[#08994A] dark:text-white text-[15px] sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 w-[50px] h-[52px]">
                    <input
                      type="checkbox"
                      className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-green-400 rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-white checked:before:text-sm"
                      checked={
                        selectedRooms.length === currentRooms.length &&
                        currentRooms.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3">Bed Group</th>
                  <th className="px-4 py-3">Bed No's</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Occupied Bed</th>
                  <th className="px-4 py-3">Unoccupied Bed</th>
                  <th className="px-4 py-3 w-[80px] text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&>tr>td]:px-4 [&>tr>td]:py-3 bg-gray-100 dark:bg-black">
                {currentRooms.length > 0 ? (
                  currentRooms.map((room, index) => {
                    const isLastFewRows =
                      index >= currentRooms.length - 2;
                    return (
                      <tr
                        key={room.id}
                        className="border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
                      >
                        <td className="px-4 py-3 h-[60px] ">
                          <input
                            type="checkbox"
                            className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-green-400 rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-white checked:before:text-sm"
                            checked={selectedRooms.includes(index)}
                            onChange={() => handleCheckboxChange(index)}
                          />
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white">
                          {room.bedGroup}
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white">
                          {room.bedRange}
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white">
                          {room.capacity}
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white">
                          {room.occupied}
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white">
                          {room.unoccupied}
                        </td>
                        <td className="px-4 py-3 text-center relative">
                          <Menu
                            as="div"
                            className="relative inline-block text-left"
                          >
                            <Menu.Button className="text-gray-600  dark:text-gray-400 hover:text-[#08994A] dark:hover:text-white">
                              <MoreHorizontal size={18} />
                            </Menu.Button>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items
                                className={`absolute ${
                                  isLastFewRows
                                    ? "bottom-full mb-2"
                                    : "mt-2"
                                } right-0 w-36 bg-gray-100 dark:bg-black border border-[#0EFF7B] dark:border-gray-700 rounded-md shadow-lg z-50`}
                              >
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => {
                                        setEditingRoomIndex(index);
                                        setShowEditPopup(true);
                                      }}
                                      className={`${
                                        active
                                          ? "bg-[#0EFF7B1A] dark:bg-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A]"
                                          : ""
                                      } flex items-center px-4 py-2 text-sm w-full text-black dark:text-white gap-2`}
                                    >
                                      <Edit className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                      Edit
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() =>
                                        handleDeleteClick(index)
                                      }
                                      className={`${
                                        active
                                          ? "bg-[#0EFF7B1A] dark:bg-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A]"
                                          : ""
                                      } flex items-center px-4 py-2 text-sm w-full text-black dark:text-white gap-2`}
                                    >
                                      <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
                                      Delete
                                    </button>
                                  )}
                                </Menu.Item>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="h-[60px] bg-gray-100 dark:bg-black">
                    <td
                      colSpan="7"
                      className="text-center py-6 text-gray-600 dark:text-gray-400 italic"
                    >
                      No rooms found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Popup */}
        {showDeletePopup && (
          <DeleteAppointmentPopup
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
          />
        )}
        {showAddPopup && (
          <AddBedGroupPopup
            onClose={() => setShowAddPopup(false)}
            // onAdd={handleAddBedGroup}
          />
        )}
        {showEditPopup && editingRoomIndex !== null && (
          <EditBedGroupPopup
            onClose={() => setShowEditPopup(false)}
            onUpdate={handleUpdateBedGroup}
            data={{
              id: roomsData[editingRoomIndex].id,
              bedGroupName: roomsData[editingRoomIndex].bedGroup,
              bedFrom: roomsData[editingRoomIndex].beds
                .map((b) => b.bed_number)
                .sort((a, b) => a - b)[0]
                .toString(),
              bedTo: roomsData[editingRoomIndex].beds
                .map((b) => b.bed_number)
                .sort((a, b) => a - b)
                .slice(-1)[0]
                .toString(),
            }}
          />
        )}
        {/* Pagination */}
        {isBedListRoute && (
          <div className="flex items-center h-full  bg-gray-100 dark:bg-black p-4 rounded gap-x-4 dark:border-[#1E1E1E]">
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

export default BedList;