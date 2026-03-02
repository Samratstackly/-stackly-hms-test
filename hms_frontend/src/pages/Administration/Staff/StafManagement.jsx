import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Filter,
  Stethoscope,
  Microscope,
  ClipboardList,
  Building,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Listbox } from "@headlessui/react";
import SurgicalDept from "./SurgicalDept";
import SupportiveDept from "./SupportiveDept";
import AdministrativeDept from "./AdministrativeDept";
import AttendanceTracking from "./AttendanceTracking";
import PayrollManagement from "./PayrollManagement";

const StaffManagement = () => {
  const [activeTab, setActiveTab] = useState("Staff Profiles");
  const [activeDept, setActiveDept] = useState("Medical");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const staffData = [
    {
      id: 1,
      name: "Preethi",
      designation: "Anesthesiology",
      date: "20/08/2025",
      shift: "09am - 05pm",
      status: "Present",
      checkIn: "8.50am",
      checkOut: "5.30pm",
    },
    {
      id: 2,
      name: "Rajesh",
      designation: "Cardiology",
      date: "20/08/2025",
      shift: "09am - 05pm",
      status: "Present",
      checkIn: "8.50am",
      checkOut: "5.30pm",
    },
    {
      id: 3,
      name: "Krishna",
      designation: "Oncology",
      date: "20/08/2025",
      shift: "09am - 05pm",
      status: "Absent",
      checkIn: "8.50am",
      checkOut: "5.30pm",
    },
    {
      id: 4,
      name: "Raghul",
      designation: "Dermatology",
      date: "20/08/2025",
      shift: "09am - 05pm",
      status: "Present",
      checkIn: "8.50am",
      checkOut: "5.30pm",
    },
    {
      id: 5,
      name: "Ragu",
      designation: "Dermatology",
      date: "20/08/2025",
      shift: "09am - 05pm",
      status: "Absent",
      checkIn: "8.50am",
      checkOut: "5.30pm",
    },
    {
      id: 6,
      name: "Prashanth",
      designation: "Gastroenterology",
      date: "20/08/2025",
      shift: "09am - 05pm",
      status: "Present",
      checkIn: "8.50am",
      checkOut: "5.30pm",
    },
    {
      id: 7,
      name: "Sharmi",
      designation: "Pharmacy",
      date: "20/08/2025",
      shift: "09am - 05pm",
      status: "Absent",
      checkIn: "8.50am",
      checkOut: "5.30pm",
    },
    {
      id: 8,
      name: "Ankita",
      designation: "Orthopedic",
      date: "20/08/2025",
      shift: "09am - 05pm",
      status: "Present",
      checkIn: "8.50am",
      checkOut: "5.30pm",
    },{
      id: 9,
      name: "Sharmi",
      designation: "Pharmacy",
      date: "20/08/2025",
      shift: "09am - 05pm",
      status: "Absent",
      checkIn: "8.50am",
      checkOut: "5.30pm",
    },
    {
      id: 10,
      name: "Ankita",
      designation: "Orthopedic",
      date: "20/08/2025",
      shift: "09am - 05pm",
      status: "Present",
      checkIn: "8.50am",
      checkOut: "5.30pm",
    },{
      id: 11,
      name: "Sharmi",
      designation: "Pharmacy",
      date: "20/08/2025",
      shift: "09am - 05pm",
      status: "Absent",
      checkIn: "8.50am",
      checkOut: "5.30pm",
    },
    {
      id: 12,
      name: "Ankita",
      designation: "Orthopedic",
      date: "20/08/2025",
      shift: "09am - 05pm",
      status: "Present",
      checkIn: "8.50am",
      checkOut: "5.30pm",
    },{
      id: 13,
      name: "Sharmi",
      designation: "Pharmacy",
      date: "20/08/2025",
      shift: "09am - 05pm",
      status: "Absent",
      checkIn: "8.50am",
      checkOut: "5.30pm",
    },
    {
      id: 14,
      name: "Ankita",
      designation: "Orthopedic",
      date: "20/08/2025",
      shift: "09am - 05pm",
      status: "Present",
      checkIn: "8.50am",
      checkOut: "5.30pm",
    },
  ];

  const itemsPerPage = 9;
  const filteredData = staffData.filter((row) => {
    const matchesSearch =
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || row.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfFirst = (currentPage - 1) * itemsPerPage;
  const indexOfLast = currentPage * itemsPerPage;
  const displayedData = filteredData.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    setSelectedRows(checked ? displayedData.map((row) => row.id) : []);
  };

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
    setSelectAll(false);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const applyFilter = () => {
    setShowFilterPopup(false);
    setCurrentPage(1);
  };

  const FilterPopup = () => (
    <div className="absolute right-0 top-8 bg-gray-100 dark:bg-[#1E1E1E] p-4 rounded-[8px] shadow-lg z-10 border border-[#0EFF7B] dark:border-[#3C3C3C]">
      <h3 className="text-sm mb-2 text-black dark:text-white">
        Filter by Status
      </h3>
      <Listbox value={filterStatus} onChange={setFilterStatus}>
        <div className="relative">
          <Listbox.Button className="w-full bg-[#F5F6F5] dark:bg-black text-[#08994A] dark:text-white border border-[#0EFF7B] dark:border-[#3C3C3C] rounded px-2 py-1 mb-2 text-sm text-left">
            {filterStatus}
          </Listbox.Button>
          <Listbox.Options className="absolute w-full bg-gray-100 dark:bg-black border border-[#0EFF7B] dark:border-[#3C3C3C] rounded shadow-lg z-50 text-sm">
            {["All", "Present", "Absent"].map((status, idx) => (
              <Listbox.Option
                key={idx}
                value={status}
                className="px-2 py-1 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33] cursor-pointer text-[#08994A] dark:text-white"
              >
                {status}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
      <button
        onClick={applyFilter}
        className="bg-[#08994A] dark:bg-green-500 text-white dark:text-black px-4 py-1 rounded w-full hover:bg-[#0EFF7B1A] dark:hover:bg-green-600"
      >
        Apply
      </button>
    </div>
  );

  const renderDepartment = () => {
    switch (activeDept) {
      case "Surgical":
        return <SurgicalDept />;
      case "Supportive":
        return <SupportiveDept />;
      case "Administrative":
        return <AdministrativeDept />;
      default:
        return (
          <div>
            {/* Search and Pagination Header */}
            <div className="flex justify-between items-center mb-4 relative">
              <div className="flex items-center gap-2 bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] rounded-[40px] px-3 py-2 min-w-[315px] max-w-md">
                <Search
                  size={16}
                  className="text-[#08994A] dark:text-[#0EFF7B]"
                />
                <input
                  type="text"
                  placeholder="Search staff name or designation"
                  className="bg-transparent outline-none text-sm placeholder-[#5CD592] text-[#08994A] dark:text-white w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-3">
                <span>
                  Page{" "}
                  <span className="text-[#08994A] dark:text-green-500">
                    {currentPage}
                  </span>{" "}
                  of {totalPages} ({indexOfFirst + 1} to{" "}
                  {Math.min(indexOfLast, filteredData.length)}{" "}
                  Staff)
                </span>
                <button
                  onClick={handlePrevPage}
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
                  onClick={handleNextPage}
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
                <button
                  onClick={() => setShowFilterPopup(!showFilterPopup)}
                  className="relative group bg-[#F5F6F5] dark:bg-[#0EFF7B1A] rounded-full w-6 h-6 flex items-center justify-center text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A]"
                >
                  <Filter
                    size={14}
                    className="text-[#08994A] dark:text-[#0EFF7B]"
                  />
                  <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                    px-3 py-1 text-xs rounded-md shadow-md
                    bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
                    transition-all duration-150">
                    Filter
              </span>
                </button>
              </div>
              {showFilterPopup && <FilterPopup />}
            </div>

            {/* Table */}
            <div className="overflow-hidden">
              <table className="w-full h-auto border-collapse">
                <thead>
                  <tr className="bg-gray-200 dark:bg-[#091810] h-[52px] text-left text-sm text-[#08994A] dark:text-[#0EFF7B] ">
                    <th className="px-4 py-3 font-medium">
                      <input
                        type="checkbox"
                        className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-gray-700 rounded-sm bg-gray-100  dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-gray-700 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white checked:before:text-sm"
                        checked={
                          selectAll ||
                          selectedRows.length === displayedData.length
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    {[
                      "Name",
                      "Designation",
                      "Date",
                      "Shift time",
                      "Status",
                      "Check In",
                      "Check Out",
                      "Details",
                    ].map((head, i) => (
                      <th key={i} className="px-4 py-3 font-medium">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm bg-gray-100 dark:bg-black">
                  {displayedData.length > 0 ? (
                    displayedData.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
                      >
                        <td className="px-4 py-3 h-[52px]">
                          <input
                            type="checkbox"
                            className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-gray-700 rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-gray-700 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white checked:before:text-sm"
                            checked={selectedRows.includes(row.id)}
                            onChange={() => handleRowSelect(row.id)}
                          />
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white">
                          {row.name}
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white">
                          {row.designation}
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white">
                          {row.date}
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white">
                          {row.shift}
                        </td>
                        <td
                          className={`px-4 py-3 font-medium ${
                            row.status === "Present"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {row.status}
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white">
                          {row.checkIn}
                        </td>
                        <td className="px-4 py-3 text-black dark:text-white">
                          {row.checkOut}
                        </td>
                        <td className="px-4 py-3 text-[#08994A] dark:text-green-400 cursor-pointer hover:underline">
                          view profile
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="h-[52px] bg-gray-100 dark:bg-black">
                      <td
                        colSpan="9"
                        className="text-center py-6 text-gray-600 dark:text-gray-400 italic"
                      >
                        No staff found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="text-sm mt-4 text-gray-600 dark:text-gray-400 flex items-center gap-3">
              <span>
                Page{" "}
                <span className="text-[#08994A] dark:text-green-500">
                  {currentPage}
                </span>{" "}
                of {totalPages} ({indexOfFirst + 1} to{" "}
                {Math.min(indexOfLast, filteredData.length)}{" "}
                Staff)
              </span>
              <button
                onClick={handlePrevPage}
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
                onClick={handleNextPage}
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
        );
    }
  };
  return (
    <div
      className=" mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-[8px] p-4 w-full max-w-[2500px] mx-auto flex flex-col  
     bg-gray-100 dark:bg-transparent overflow-hidden relative font-[Helvetica]"
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
      <div className="mt-4 mb-6">
        <h1 className="text-[20px] font-medium text-black dark:text-white">
          Staff Management
        </h1>
        <p className="text-[14px] mt-2 text-gray-600 dark:text-white">
          Manage staff profiles, departments, roles, attendance, and payroll in
          one place
        </p>
      </div>

      {/* Tabs and Year/Month Selection */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex text-[18px] gap-[40px]">
          {["Staff Profiles", "Attendance Tracking", "Payroll Management"].map(
            (tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center justify-center px-6 h-[42px] rounded-[8px] text-sm font-medium transition-all duration-300  
          ${
            activeTab === tab
              ? "bg-[#025126] dark:bg-[#025126] text-white shadow-[0px_0px_20px_0px_#0EFF7B40]"
              : "bg-[#0EFF7B1A] dark:bg-[#2A2A2A] text-black dark:text-white shadow-[0px_0px_20px_0px_#00000066] relative"
          }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        <div className="flex gap-6 items-center text-black dark:text-white text-sm">
          <div className="flex text-[16px] items-center gap-2">
            <span>Year</span>
            <div className="relative w-[90px] h-[32px]">
              <select className="appearance-none w-full h-full bg-gray-100 dark:bg-black text-[#08994A] dark:text-white border border-[#0EFF7B] dark:border-[#0EFF7B] rounded-[8px] px-3 pr-8 text-sm outline-none">
                <option>2025</option>
                <option>2026</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="6"
                  viewBox="0 0 12 6"
                  fill="none"
                >
                  <path
                    d="M1 1L6 5L11 1"
                    stroke="#08994A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="dark:stroke-[#0EFF7B]"
                  />
                </svg>
              </span>
            </div>
          </div>
          <div className="flex text-[16px] items-center gap-2">
            <span>Month</span>
            <div className="relative w-[90px] h-[32px]">
              <select className="appearance-none w-full h-full bg-gray-100 dark:bg-black text-[#08994A] dark:text-white border border-[#0EFF7B] dark:border-[#0EFF7B] rounded-[8px] px-3 pr-8 text-sm outline-none">
                <option>Aug</option>
                <option>Sep</option>
                <option>Oct</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="6"
                  viewBox="0 0 12 6"
                  fill="none"
                >
                  <path
                    d="M1 1L6 5L11 1"
                    stroke="#08994A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="dark:stroke-[#0EFF7B]"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Department Cards - Only shown when Staff Profiles is active */}
      {activeTab === "Staff Profiles" && (
        <div className="flex gap-4 mb-6">
          {[
            {
              title: "Medical Departments",
              subtitle: "Doctors & Specialists",
              count: "15 medical division",
              icon: (
                <Stethoscope
                  size={24}
                  className="mx-auto text-white dark:text-white"
                />
              ),
              dept: "Medical",
            },
            {
              title: "Surgical Departments",
              count: "6 medical division",
              icon: (
                <Microscope
                  size={24}
                  className="mx-auto text-white dark:text-white"
                />
              ),
              dept: "Surgical",
            },
            {
              title: "Supportive & Diagnostic Department",
              count: "6 medical division",
              icon: (
                <ClipboardList
                  size={24}
                  className="mx-auto text-white dark:text-white"
                />
              ),
              dept: "Supportive",
            },
            {
              title: "Administrative & Non-Medical Departments",
              count: "6 medical division",
              icon: (
                <Building
                  size={24}
                  className="mx-auto text-white dark:text-white"
                />
              ),
              dept: "Administrative",
            },
          ].map((card, i) => {
            const isActive = activeDept === card.dept;
            return (
              <div
                key={i}
                onClick={() => setActiveDept(card.dept)}
                className={`p-4 rounded-[8px] mt-8 text-center transition min-w-[181px] h-[149px] cursor-pointer ${
                  isActive
                    ? "bg-gray-100  dark:bg-[#025126] border border-[#0EFF7B] dark:border-[#0EFF7B]"
                    : "bg-[#F5F6F5] dark:bg-[#0EFF7B0D] border border-[#0EFF7B] dark:border-[#0EFF7B] hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                <div className="w-[46px] h-[46px] bg-[#08994A] dark:bg-green-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                  {card.icon}
                </div>
                <h3
                  className={`text-[14px] font-semibold line-clamp-2 leading-snug ${
                    isActive
                      ? "text-[#08994A] dark:text-white"
                      : "text-black dark:text-white"
                  }`}
                >
                  {card.title}
                </h3>
                {card.subtitle && (
                  <p
                    className={`text-[12px] ${
                      isActive
                        ? "text-[#08994A] dark:text-white"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {card.subtitle}
                  </p>
                )}
                <p
                  className={`text-xs mt-1 ${
                    isActive
                      ? "text-[#08994A] dark:text-white"
                      : "text-black dark:text-white"
                  }`}
                >
                  {card.count}
                </p>
              </div>
            );
          })}
          <div className="bg-[#F5F6F5] dark:bg-transparent border border-[#0EFF7B]  p-4 rounded-[8px] w-[250px] h-[219px] flex flex-col items-center">
            <h2 className="text-[14px] w-[226px] h-[32px] flex items-center justify-center rounded-[4px] bg-[#E0E0E0] dark:bg-[#0EFF7B1F] text-black dark:text-white mb-2">
              Who's on leave
            </h2>
            <div className="flex items-center gap-2 mb-4 w-full justify-between">
              <p className="text-xs text-gray-600 dark:text-white flex items-center gap-1">
                On leave <span className="text-[#0EFF7B]">:</span>
                <span className="text-red-500 font-medium">2</span>
              </p>
              <div className="relative inline-block">
                <select className="appearance-none bg-gray-100 dark:bg-black text-[12px] text-[#08994A] dark:text-gray-300 w-[106px] h-[32px] pl-2 pr-6 rounded-[8px] border border-[#0EFF7B] dark:border-[#0EFF7B] outline-none cursor-pointer">
                  <option>Today</option>
                  <option>Tomorrow</option>
                </select>
                <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown
                    size={8}
                    className="text-[#08994A] dark:text-[#0EFF7B]"
                  />
                </span>
              </div>
            </div>
            <div className="w-[160px] h-[80px] mr-8 flex flex-col gap-[12px]">
              <div className="flex items-center gap-2">
                <div className="w-[24px] h-[24px] rounded-full bg-[#4D58FF] flex items-center justify-center text-white text-[10px] font-bold">
                  TK
                </div>
                <div>
                  <p className="text-sm text-black dark:text-white">
                    Teja Khamas
                  </p>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Aug 18 - Casual leave
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[24px] h-[24px] rounded-full bg-[#4D58FF] flex items-center justify-center text-white text-[10px] font-bold">
                  GK
                </div>
                <div>
                  <p className="text-sm text-black dark:text-white">
                    Geeth Kannan
                  </p>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Aug 16 - Half leave
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Content Based on Active Tab */}
      {activeTab === "Staff Profiles" && renderDepartment()}
      {activeTab === "Attendance Tracking" && <AttendanceTracking />}
      {activeTab === "Payroll Management" && <PayrollManagement />}
    </div>
  );
};

export default StaffManagement;