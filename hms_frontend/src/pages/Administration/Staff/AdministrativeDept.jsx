import React, { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Listbox } from "@headlessui/react";

const AdministrativeDept = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const staffData = [
    { id: 1, name: "Sanjay", designation: "HR Manager", date: "20/08/2025", shift: "09am - 05pm", status: "Present", checkIn: "8.50am", checkOut: "5.30pm" },
    { id: 2, name: "Rekha", designation: "Accounts Officer", date: "20/08/2025", shift: "09am - 05pm", status: "Absent", checkIn: "-", checkOut: "-" },
    { id: 3, name: "Mohan", designation: "Facility Manager", date: "20/08/2025", shift: "09am - 05pm", status: "Present", checkIn: "8.45am", checkOut: "5.20pm" },
    { id: 4, name: "Swetha", designation: "Receptionist", date: "20/08/2025", shift: "09am - 05pm", status: "Present", checkIn: "8.55am", checkOut: "5.25pm" },
    { id: 5, name: "Kiran", designation: "IT Support", date: "20/08/2025", shift: "09am - 05pm", status: "Absent", checkIn: "-", checkOut: "-" },
    { id: 6, name: "Divya", designation: "Billing Clerk", date: "20/08/2025", shift: "09am - 05pm", status: "Present", checkIn: "8.40am", checkOut: "5.15pm" },
    { id: 7, name: "Sanjay", designation: "HR Manager", date: "21/08/2025", shift: "09am - 05pm", status: "Present", checkIn: "8.50am", checkOut: "5.30pm" },
    { id: 8, name: "Rekha", designation: "Accounts Officer", date: "21/08/2025", shift: "09am - 05pm", status: "Absent", checkIn: "-", checkOut: "-" },
    { id: 9, name: "Mohan", designation: "Facility Manager", date: "21/08/2025", shift: "09am - 05pm", status: "Present", checkIn: "8.45am", checkOut: "5.20pm" },
    { id: 10, name: "Swetha", designation: "Receptionist", date: "21/08/2025", shift: "09am - 05pm", status: "Present", checkIn: "8.55am", checkOut: "5.25pm" },
    { id: 11, name: "Kiran", designation: "IT Support", date: "21/08/2025", shift: "09am - 05pm", status: "Absent", checkIn: "-", checkOut: "-" },
    { id: 12, name: "Divya", designation: "Billing Clerk", date: "21/08/2025", shift: "09am - 05pm", status: "Present", checkIn: "8.40am", checkOut: "5.15pm" },
    { id: 13, name: "Sanjay", designation: "HR Manager", date: "22/08/2025", shift: "09am - 05pm", status: "Present", checkIn: "8.50am", checkOut: "5.30pm" },
    { id: 14, name: "Rekha", designation: "Accounts Officer", date: "22/08/2025", shift: "09am - 05pm", status: "Absent", checkIn: "-", checkOut: "-" },
    { id: 15, name: "Mohan", designation: "Facility Manager", date: "22/08/2025", shift: "09am - 05pm", status: "Present", checkIn: "8.45am", checkOut: "5.20pm" },
    { id: 16, name: "Swetha", designation: "Receptionist", date: "22/08/2025", shift: "09am - 05pm", status: "Present", checkIn: "8.55am", checkOut: "5.25pm" },
    { id: 17, name: "Kiran", designation: "IT Support", date: "22/08/2025", shift: "09am - 05pm", status: "Absent", checkIn: "-", checkOut: "-" },
    { id: 18, name: "Divya", designation: "Billing Clerk", date: "22/08/2025", shift: "09am - 05pm", status: "Present", checkIn: "8.40am", checkOut: "5.15pm" },
    { id: 19, name: "Swetha", designation: "Receptionist", date: "22/08/2025", shift: "09am - 05pm", status: "Present", checkIn: "8.55am", checkOut: "5.25pm" },
    { id: 20, name: "Kiran", designation: "IT Support", date: "22/08/2025", shift: "09am - 05pm", status: "Absent", checkIn: "-", checkOut: "-" },
    { id: 21, name: "Divya", designation: "Billing Clerk", date: "22/08/2025", shift: "09am - 05pm", status: "Present", checkIn: "8.40am", checkOut: "5.15pm" },
  ];

  const itemsPerPage = 9;
  const filteredData = staffData.filter((row) => {
    const matchesSearch = row.name.toLowerCase().includes(searchTerm.toLowerCase()) || row.designation.toLowerCase().includes(searchTerm.toLowerCase());
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
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelectAll(false);
      setSelectedRows([]);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setSelectAll(false);
      setSelectedRows([]);
    }
  };

  const applyFilter = () => {
    setShowFilterPopup(false);
    setCurrentPage(1);
    setSelectAll(false);
    setSelectedRows([]);
  };

  const FilterPopup = () => (
    <div className="absolute right-0 top-8 bg-gray-100 dark:bg-[#1E1E1E] p-4 rounded-[8px] shadow-lg z-10 border border-[#0EFF7B] dark:border-[#3C3C3C]">
      <h3 className="text-sm mb-2 text-black dark:text-white">Filter by Status</h3>
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

  return (
    <div className="bg-gray-100 dark:bg-transparent text-black dark:text-white relative rounded-xl p-4 w-full max-w-[2500px] mx-auto dark:border-[#1E1E1E] flex flex-col font-[Helvetica]">
      
      {/* Search and Pagination Header */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-2 bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] rounded-[40px] px-3 py-2 min-w-[315px] max-w-md">
          <Search size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
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
            Page <span className="text-[#08994A] dark:text-green-500">{currentPage}</span> of {totalPages} ({indexOfFirst + 1} to {Math.min(indexOfLast, filteredData.length)} Staff)
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
            <ChevronLeft size={12} className="text-[#08994A] dark:text-white" />
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
            <ChevronRight size={12} className="text-[#08994A] dark:text-white" />
          </button>
          <button
            onClick={() => setShowFilterPopup(!showFilterPopup)}
            className="bg-[#F5F6F5] dark:bg-[#0EFF7B1A] rounded-full w-6 h-6 flex items-center justify-center text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A]"
          >
            <Filter size={14} className="text-[#08994A] dark:text-[#0EFF7B]" />
          </button>
        </div>
        {showFilterPopup && <FilterPopup />}
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 dark:bg-[#091810] h-[52px] text-left text-sm text-[#08994A] dark:text-[#0EFF7B]">
              <th className="px-4 py-3 font-medium">
                <input
                  type="checkbox"
                  className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-gray-700 rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-gray-700 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white checked:before:text-sm"
                  checked={selectAll || selectedRows.length === displayedData.length}
                  onChange={handleSelectAll}
                />
              </th>
              {["Name", "Designation", "Date", "Shift time", "Status", "Check In", "Check Out", "Details"].map((head, i) => (
                <th key={i} className="px-4 py-3 font-medium">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm bg-gray-100 dark:bg-black">
            {displayedData.length > 0 ? (
              displayedData.map((row) => (
                <tr key={`${row.id}-${row.date}`} className="border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]">
                  <td className="px-4 py-3 h-[52px]">
                    <input
                      type="checkbox"
                      className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-gray-700 rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-gray-700 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white checked:before:text-sm"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleRowSelect(row.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-black dark:text-white">{row.name}</td>
                  <td className="px-4 py-3 text-black dark:text-white">{row.designation}</td>
                  <td className="px-4 py-3 text-black dark:text-white">{row.date}</td>
                  <td className="px-4 py-3 text-black dark:text-white">{row.shift}</td>
                  <td className={`px-4 py-3 font-medium ${row.status === "Present" ? "text-green-500" : "text-red-500"}`}>
                    {row.status}
                  </td>
                  <td className="px-4 py-3 text-black dark:text-white">{row.checkIn}</td>
                  <td className="px-4 py-3 text-black dark:text-white">{row.checkOut}</td>
                  <td className="px-4 py-3 text-[#08994A] dark:text-green-400 cursor-pointer hover:underline">
                    view profile
                  </td>
                </tr>
              ))
            ) : (
              <tr className="h-[52px] bg-gray-100 dark:bg-black">
                <td colSpan="9" className="text-center py-6 text-gray-600 dark:text-gray-400 italic">
                  No staff found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="text-sm mt-4 text-gray-600 dark:text-gray-400 flex items-center gap-3">
        <span>
          Page <span className="text-[#08994A] dark:text-green-500">{currentPage}</span> of {totalPages} ({indexOfFirst + 1} to {Math.min(indexOfLast, filteredData.length)} Staff)
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
          <ChevronLeft size={12} className="text-[#08994A] dark:text-white" />
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
          <ChevronRight size={12} className="text-[#08994A] dark:text-white" />
        </button>
      </div>
    </div>
  );
};

export default AdministrativeDept;