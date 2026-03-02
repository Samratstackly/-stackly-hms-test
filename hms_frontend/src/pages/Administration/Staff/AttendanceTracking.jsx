import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Listbox } from "@headlessui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Hook to detect dark mode from Tailwind's `dark` class
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
};

// Sample data for the chart
const data = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  present: Math.floor(15 + Math.random() * 15),
  absent: Math.floor(5 + Math.random() * 5),
  leave: Math.floor(5 + Math.random() * 10),
}));

const departments = [
  "All Departments",
  "Cardiology",
  "Orthopedics",
  "Neurology",
  "Pediatrics",
  "Emergency",
  "Radiology",
  "Housekeeping",
];

const roles = [
  "All Roles",
  "Doctor",
  "Nurse",
  "Lab Technician",
  "Pharmacist",
  "Receptionist",
  "HR",
  "IT Support",
  "Housekeeping",
];

const dateRanges = {
  "Aug 1 - Aug 30": { start: "2025-08-01", end: "2025-08-30" },
  "Sep 1 - Sep 30": { start: "2025-09-01", end: "2025-09-30" },
  "Oct 1 - Oct 31": { start: "2025-10-01", end: "2025-10-31" },
};

// 🔹 Reusable Themed Dropdown Component
const ThemeDropdown = ({ label, options, value, onChange }) => (
  <div className="flex flex-col relative w-full sm:w-auto">
    {label && (
      <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-1">
        {label}
      </label>
    )}
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        {/* Dropdown Button */}
        <Listbox.Button
          className="w-full min-w-[245px] max-w-auto h-[40px] bg-[#F5F6F5] dark:bg-black 
                     text-[#08994A] dark:text-white 
                     rounded-[8px] px-[12px] py-[8px] pr-10 
                     border border-[#0EFF7B] dark:border-[#3C3C3C] 
                     shadow-[0px_0px_4px_0px_rgba(160,160,160,0.12)]
                     text-left text-xs sm:text-sm flex items-center justify-between"
        >
          <span className="truncate">{value}</span>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#08994A] dark:text-white w-5 h-5" />
        </Listbox.Button>

        {/* Dropdown Options */}
        <Listbox.Options
          className="absolute z-10 mt-1 w-full min-w-[245px] max-w-auto bg-gray-100 dark:bg-black 
                     border border-[#0EFF7B] dark:border-[#3C3C3C] 
                     rounded-[8px] shadow-lg max-h-60 overflow-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <style jsx>{`
            .scroll-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {options.map((opt, i) => (
            <Listbox.Option
              key={i}
              value={opt}
              className={({ active }) =>
                `px-3 py-2 text-[#08994A] dark:text-white text-xs sm:text-sm cursor-pointer 
                 ${active ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33]" : ""}`
              }
            >
              {opt}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  </div>
);

const initialRows = [
  {
    name: "Preethi",
    designation: "HR",
    department: "Human Resources",
    role: "HR",
    date: "2025-08-20",
    shift: "09am - 05pm",
    status: "Present",
    checkin: "8.50am",
    checkout: "5.30pm",
    details: "Approved",
  },
  {
    name: "Rajesh",
    designation: "Accounts Manager",
    department: "Finance",
    role: "Doctor",
    date: "2025-08-20",
    shift: "09am - 05pm",
    status: "Present",
    checkin: "8.50am",
    checkout: "5.30pm",
    details: "Pending",
  },
  {
    name: "Krishna",
    designation: "System Admin",
    department: "IT & Systems",
    role: "IT Support",
    date: "2025-08-19",
    shift: "09am - 05pm",
    status: "Absent",
    checkin: "-",
    checkout: "-",
    details: "Approved",
  },
  {
    name: "Raghul",
    designation: "Housekeeping",
    department: "Housekeeping & Maintenance",
    role: "Housekeeping",
    date: "2025-08-18",
    shift: "09am - 05pm",
    status: "Present",
    checkin: "8.50am",
    checkout: "5.30pm",
    details: "Approved",
  },{
    name: "Rajesh",
    designation: "Accounts Manager",
    department: "Finance",
    role: "Doctor",
    date: "2025-08-20",
    shift: "09am - 05pm",
    status: "Present",
    checkin: "8.50am",
    checkout: "5.30pm",
    details: "Pending",
  },
  {
    name: "Krishna",
    designation: "System Admin",
    department: "IT & Systems",
    role: "IT Support",
    date: "2025-08-19",
    shift: "09am - 05pm",
    status: "Absent",
    checkin: "-",
    checkout: "-",
    details: "Approved",
  },
  {
    name: "Raghul",
    designation: "Housekeeping",
    department: "Housekeeping & Maintenance",
    role: "Housekeeping",
    date: "2025-08-18",
    shift: "09am - 05pm",
    status: "Present",
    checkin: "8.50am",
    checkout: "5.30pm",
    details: "Approved",
  },{
    name: "Rajesh",
    designation: "Accounts Manager",
    department: "Finance",
    role: "Doctor",
    date: "2025-08-20",
    shift: "09am - 05pm",
    status: "Present",
    checkin: "8.50am",
    checkout: "5.30pm",
    details: "Pending",
  },
  {
    name: "Krishna",
    designation: "System Admin",
    department: "IT & Systems",
    role: "IT Support",
    date: "2025-08-19",
    shift: "09am - 05pm",
    status: "Absent",
    checkin: "-",
    checkout: "-",
    details: "Approved",
  },
  {
    name: "Raghul",
    designation: "Housekeeping",
    department: "Housekeeping & Maintenance",
    role: "Housekeeping",
    date: "2025-08-18",
    shift: "09am - 05pm",
    status: "Present",
    checkin: "8.50am",
    checkout: "5.30pm",
    details: "Approved",
  },{
    name: "Rajesh",
    designation: "Accounts Manager",
    department: "Finance",
    role: "Doctor",
    date: "2025-08-20",
    shift: "09am - 05pm",
    status: "Present",
    checkin: "8.50am",
    checkout: "5.30pm",
    details: "Pending",
  },
  {
    name: "Krishna",
    designation: "System Admin",
    department: "IT & Systems",
    role: "IT Support",
    date: "2025-08-19",
    shift: "09am - 05pm",
    status: "Absent",
    checkin: "-",
    checkout: "-",
    details: "Approved",
  },
  {
    name: "Raghul",
    designation: "Housekeeping",
    department: "Housekeeping & Maintenance",
    role: "Housekeeping",
    date: "2025-08-18",
    shift: "09am - 05pm",
    status: "Present",
    checkin: "8.50am",
    checkout: "5.30pm",
    details: "Approved",
  },
];

const AttendanceTracking = () => {
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [dateRange, setDateRange] = useState("Aug 1 - Aug 30");
  const [rows] = useState(initialRows);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const isDark = useDarkMode();

  const filteredRows = rows.filter((row) => {
    const rowDate = new Date(row.date);
    const { start, end } = dateRanges[dateRange];
    const startD = new Date(start);
    const endD = new Date(end);

    const inDateRange = rowDate >= startD && rowDate <= endD;
    const inDept =
      selectedDept === "All Departments" || row.department === selectedDept;
    const inRole = selectedRole === "All Roles" || row.role === selectedRole;

    return inDateRange && inDept && inRole;
  });

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedRows.map((_, i) => i));
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((i) => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "attendance.xlsx");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectAll(false);
    setSelectedRows([]);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen text-black dark:text-white p-6 bg-gray-100 dark:bg-black flex-1 w-full overflow-x-hidden font-[Helvetica]">
      <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium mb-4 sm:mb-6 font-inter">
        Attendance Tracking
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
  {[
    { title: "Total Present", value: 152 },
    { title: "Total Absent", value: 10 },
    { title: "On Leave", value: 18 },
    { title: "Pending Review", value: 20 },
  ].map((card, i) => (
    <div
      key={i}
      className="relative bg-gray-100 dark:bg-[#0EFF7B0D] border border-gray-300 dark:border-[#0EFF7BB2] rounded-xl p-4 flex flex-col justify-between w-full h-[130px]"
    >
      <div>
        <p className="font-inter font-medium text-[24px] text-black dark:text-white">
          {card.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-[#A0A0A0]">
          +12 this week ↗
        </p>
      </div>

      {/* Value moved to bottom-right */}
      <p className="absolute bottom-4 right-4 text-[42px] font-bold bg-gradient-to-r from-[#14DC6F] to-[#09753A] text-transparent bg-clip-text">
        {card.value}
      </p>
    </div>
  ))}
</div>


     {/* Filters and Export */}
<div className="flex flex-col xl:flex-row xl:items-end justify-between mb-4 sm:mb-6 gap-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-row gap-4 w-full xl:w-auto">
    <ThemeDropdown
      label="Department"
      options={departments}
      value={selectedDept}
      onChange={setSelectedDept}
      className="w-full min-w-[160px]"
    />
    <ThemeDropdown
      label="Roles"
      options={roles}
      value={selectedRole}
      onChange={setSelectedRole}
      className="w-full min-w-[160px]"
    />
    <ThemeDropdown
      label="Date Range"
      options={Object.keys(dateRanges)}
      value={dateRange}
      onChange={setDateRange}
      className="w-full min-w-[160px]"
    />
  </div>

  {/* Export Button */}
  <button
    onClick={handleExport}
    className="min-w-[210px] max-w-full h-[48px] bg-[#F5F6F5] dark:bg-[#0EFF7B1A] text-[#08994A] dark:text-white border border-[#0EFF7B] dark:border-[#0EFF7B4D] rounded-xl px-3 py-1 text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] transition-colors duration-200 shrink-0"
  >
    <span>Export</span>
  </button>
</div>

      {/* Chart */}
      <div className="bg-gray-100 dark:bg-black rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 w-full border border-gray-300 dark:border-[#2B2B2B]">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#333" : "#E5E7EB"}
            />
            <XAxis
              dataKey="day"
              stroke={isDark ? "#ffffff" : "#000000"}
              tick={{ fontSize: 12, fill: isDark ? "#ffffff" : "#000000" }}
              label={{
                value: "Date",
                position: "insideBottom",
                offset: -2,
                fill: isDark ? "#0EFF7B" : "#000000",
                fontSize: 14,
              }}
            />
            <YAxis
              stroke={isDark ? "#ffffff" : "#000000"}
              tick={{ fontSize: 12, fill: isDark ? "#ffffff" : "#000000" }}
              label={{
                value: "Percentage",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                fill: isDark ? "#0EFF7B" : "#000000",
                fontSize: 14,
              }}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                backgroundColor: isDark ? "#1E1E1E" : "#ffffff",
                border: `1px solid ${isDark ? "#3C3C3C" : "#0EFF7B"}`,
                color: isDark ? "#ffffff" : "#000000",
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconSize={12}
              wrapperStyle={{ color: isDark ? "#ffffff" : "#000000" }}
            />
            <Line
              type="monotone"
              dataKey="present"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Present"
            />
            <Line
              type="monotone"
              dataKey="absent"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Absent"
            />
            <Line
              type="monotone"
              dataKey="leave"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name="On Leave"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-gray-100 dark:bg-black rounded-xl overflow-x-auto w-full border border-gray-300 dark:border-gray-800">
        <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-[800px] md:min-w-[1000px]">
          <thead>
            <tr className="bg-[#F5F6F5] dark:bg-[#1E1E1E] text-[#08994A] dark:text-[#0EFF7B] text-xs">
              <th className="p-2 sm:p-3 sticky top-0 dark:bg-[#091810] z-10">
                <input
                  type="checkbox"
                  className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-2 sm:p-3 sticky top-0 bg-[#F5F6F5] dark:bg-[#091810] z-10">
                Name
              </th>
              <th className="p-2 sm:p-3 sticky top-0 bg-[#F5F6F5] dark:bg-[#091810] z-10">
                Designation
              </th>
              {/* <th className="p-2 sm:p-3 sticky top-0 bg-[#F5F6F5] dark:bg-[#091810] z-10">
                Department
              </th>
              <th className="p-2 sm:p-3 sticky top-0 bg-[#F5F6F5] dark:bg-[#091810] z-10">
                Role
              </th> */}
              <th className="p-2 sm:p-3 sticky top-0 bg-[#F5F6F5] dark:bg-[#091810] z-10">
                Date
              </th>
              <th className="p-2 sm:p-3 sticky top-0 bg-[#F5F6F5] dark:bg-[#091810] z-10">
                Shift time
              </th>
              <th className="p-2 sm:p-3 sticky top-0 bg-[#F5F6F5] dark:bg-[#091810] z-10">
                Status
              </th>
              <th className="p-2 sm:p-3 sticky top-0 bg-[#F5F6F5] dark:bg-[#091810] z-10">
                Check In
              </th>
              <th className="p-2 sm:p-3 sticky top-0 bg-[#F5F6F5] dark:bg-[#091810] z-10">
                Check Out
              </th>
              <th className="p-2 sm:p-3 sticky top-0 bg-[#F5F6F5] dark:bg-[#091810] z-10">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700 dark:text-gray-200 text-xs">
            {paginatedRows.length === 0 ? (
              <tr className="bg-gray-100 dark:bg-black">
                <td
                  colSpan="11"
                  className="text-center p-4 text-gray-500 dark:text-gray-400"
                >
                  No records found
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, i) => (
                <tr
                  key={i}
                  className="bg-gray-100 dark:bg-black border-t border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
                >
                  <td className="p-2 sm:p-3">
                    <input
                      type="checkbox"
                      className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                      checked={selectedRows.includes(i)}
                      onChange={() => handleRowSelect(i)}
                    />
                  </td>
                  <td className="p-2 sm:p-3">{row.name}</td>
                  {/* <td className="p-2 sm:p-3">{row.designation}</td> */}
                  <td className="p-2 sm:p-3">{row.department}</td>
                  {/* <td className="p-2 sm:p-3">{row.role}</td> */}
                  <td className="p-2 sm:p-3">{row.date}</td>
                  <td className="p-2 sm:p-3">{row.shift}</td>
                  <td
                    className={`p-2 sm:p-3 ${
                      row.status === "Present"
                        ? "text-[#6771FF]"
                        : "text-[#FF2424]"
                    }`}
                  >
                    {row.status}
                  </td>
                  <td className="p-2 sm:p-3">{row.checkin}</td>
                  <td className="p-2 sm:p-3">{row.checkout}</td>
                  <td className="p-2 sm:p-3">
                    <span className="text-[#08994A] dark:text-green-400 hover:underline cursor-pointer">
                      {row.details}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center mt-4 bg-gray-100 dark:bg-black p-4 rounded gap-x-4 ">
        <div className="text-sm text-black dark:text-white">
          Page {currentPage} of {totalPages} (
          {(currentPage - 1) * rowsPerPage + 1} to{" "}
          {Math.min(currentPage * rowsPerPage, filteredRows.length)}{" "}
          from {filteredRows.length} Records)
        </div>

        <div className="flex items-center gap-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`w-5 h-5 flex items-center justify-center rounded-full border ${
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
            disabled={currentPage === totalPages || totalPages === 0}
            className={`w-5 h-5 flex items-center justify-center rounded-full border ${
              currentPage === totalPages || totalPages === 0
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
    </div>
  );
};

export default AttendanceTracking;