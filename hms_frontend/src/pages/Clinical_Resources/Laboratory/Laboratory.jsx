import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AddTestPopup from "./AddTestPopup";
import EditTestPopup from "./EditTestPopup";
import api from "../../../utils/axiosConfig";
import { successToast, errorToast } from "../../../components/Toast.jsx";

const Laboratory = () => {
  // === State ===
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Status options
  const statusOptions = ["available", "unavailable", "maintenance"];

  // Filters for table
  const filters = [
    { label: "All", value: "All" },
    { label: "Available", value: "available" },
    { label: "Unavailable", value: "unavailable" },
    { label: "Maintenance", value: "maintenance" },
  ];

  const [activeFilter, setActiveFilter] = useState("All");

  // === Status mapping for display ===
  const statusDisplayMap = {
    available: "Available",
    unavailable: "Unavailable",
    maintenance: "Maintenance",
  };

  // === Status colors ===
  const statusColors = {
    available: "bg-green-900 text-green-300",
    unavailable: "bg-red-900 text-red-300",
    maintenance: "bg-yellow-900 text-yellow-300",
  };

  // === Fetch data ===
  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/laboratory/tests");
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setTests(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch tests. Please try again.");
      console.error("Error fetching tests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (!showAddPopup && !showEditPopup && !showDeletePopup) {
      fetchTests();
    }
  }, [showAddPopup, showEditPopup, showDeletePopup]);

  // === API handlers ===
  const handleDeleteTest = async () => {
    try {
      const response = await api.delete(`/laboratory/tests/${selectedTest.id}`);

      // Accept both 200 (OK) and 204 (No Content) as success statuses
      if (response.status !== 200 && response.status !== 204) {
        throw new Error("Failed to delete test");
      }

      // Show success toast
      successToast(`Test "${selectedTest.test_type}" deleted successfully!`);
      
      // Refresh the tests list
      await fetchTests();
      
      // Close popup and clear selection
      setShowDeletePopup(false);
      setSelectedTest(null);
    } catch (err) {
      // Show error toast
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Failed to delete test. Please try again.";
      
      errorToast(errorMessage);
      
      // Set local error state
      setError("Failed to delete test. Please try again.");
      console.error("Error deleting test:", err);
    }
  };

  // === Filtering Logic ===
  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!test.test_type?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (activeFilter !== "All" && test.status !== activeFilter) {
        return false;
      }

      return true;
    });
  }, [tests, searchTerm, activeFilter]);

  // === Pagination ===
  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const currentTests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTests.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredTests, itemsPerPage]);

  // Get status counts from current tests
  const statusCounts = useMemo(() => {
    const counts = {
      available: 0,
      unavailable: 0,
      maintenance: 0,
      total: tests.length
    };
    
    tests.forEach(test => {
      if (counts.hasOwnProperty(test.status)) {
        counts[test.status]++;
      }
    });
    
    return counts;
  }, [tests]);

  return (
    <div className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-4 w-full max-w-[2500px] mx-auto flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative font-[Helvetica]">
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
          Laboratory Tests
        </h2>
        <button
          onClick={() => setShowAddPopup(true)}
          className="flex items-center gap-2 bg-[linear-gradient(92.18deg,#025126_3.26%,#0D7F41_50.54%,#025126_97.83%)] border-b-[2px] border-[#0EFF7B] shadow-[0px_2px_12px_0px_#00000040] hover:opacity-90 text-white font-semibold px-4 py-2 rounded-[8px] transition duration-300 ease-in-out"
        >
          <Plus size={18} className="text-white font-[Helvetica]" /> Add Test
        </button>
      </div>

      {/* Stats */}
      <div className="mb-3 min-w-[800px] relative z-10">
        <div className="flex items-center gap-4 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
              Total Tests
            </span>
            <span className="w-6 h-6 flex items-center font-[Helvetica] text-[12px] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#0D2016] dark:bg-[#14DC6F]">
              {statusCounts.total}
            </span>
          </div>

          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

          <div className="flex items-center gap-2">
            <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
              Available
            </span>
            <span className="w-6 h-6 flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-[#080C4C] dark:bg-[#0D7F41]">
              {statusCounts.available}
            </span>
          </div>

          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

          <div className="flex items-center gap-2">
            <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
              Unavailable
            </span>
            <span className="w-6 h-6 flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-[#7D3737] dark:bg-[#D97706]">
              {statusCounts.unavailable}
            </span>
          </div>

          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

          <div className="flex items-center gap-2">
            <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
              Maintenance
            </span>
            <span className="h-6 min-w-[24px] flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-[#3C3C3C] dark:bg-[#9CA3AF]">
              {statusCounts.maintenance}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter Buttons */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex gap-4">
          {/* Filter Buttons */}
          <div className="flex gap-3">
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

        <div className="flex gap-4">
          <div className="flex items-center w-[315px] h-[32px] gap-2 rounded-[8px] px-4 py-1 border border-gray-300 bg-gray-200 shadow dark:bg-[#1E1E1E] dark:border-[#3A3A3A]">
            <Search size={18} className="text-green-600 dark:text-green-400" />
            <input
              type="text"
              placeholder="Search test type"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent px-2 text-xs outline-none font-[Helvetica] text-black dark:text-white placeholder-gray-400 dark:placeholder-[#00A048] w-48"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 relative z-10">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-10 relative z-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0EFF7B]"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading tests...</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left text-sm">
              <thead className="text-[#0EFF7B] bg-gray-200 dark:text-[#0EFF7B] h-12 font-[Helvetica] dark:bg-[#091810] border-b border-gray-300 dark:border-gray-700">
                <tr>
                  <th className="py-3 pl-4 pr-2">Test Type</th>
                  <th className="py-3 px-2">Description</th>
                  <th className="py-3 px-2">Price</th>
                  <th className="py-3 px-2">Duration</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentTests.length > 0 ? (
                  currentTests.map((test) => (
                    <tr
                      key={test.id}
                      className="border-b border-gray-300 dark:border-gray-800 font-[Helvetica]"
                    >
                      <td className="py-3 pl-4 pr-2 text-black dark:text-white">
                        <div className="font-medium">{test.test_type}</div>
                      </td>

                      <td className="py-3 px-2 text-black dark:text-white max-w-xs truncate" title={test.description}>
                        {test.description || "N/A"}
                      </td>

                      <td className="py-3 px-2 text-black dark:text-white">
                        ${test.price ? parseFloat(test.price).toFixed(2) : "N/A"}
                      </td>

                      <td className="py-3 px-2 text-black dark:text-white">
                        {test.duration_minutes ? `${test.duration_minutes} mins` : "N/A"}
                      </td>

                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${statusColors[test.status] || "bg-gray-700 text-gray-300"
                            }`}
                        >
                          {statusDisplayMap[test.status] || test.status}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <div className="flex justify-center gap-4 relative overflow-visible">
                          <div className="relative group">
                            <Edit2
                              size={16}
                              onClick={() => {
                                setSelectedTest(test);
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
                                setSelectedTest(test);
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
                      colSpan="6"
                      className="text-center py-6 text-gray-600 dark:text-gray-400 italic"
                    >
                      {searchTerm || activeFilter !== "All" 
                        ? "No tests match your search/filter" 
                        : "No tests found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex items-center mt-4 bg-gray-100 dark:bg-black p-4 rounded gap-x-4 dark:border-[#1E1E1E] relative z-10">
              <div className="text-sm text-black dark:text-white">
                Page{" "}
                <span className="text-[#08994A] dark:text-[#0EFF7B] font-semibold">
                  {currentPage}
                </span>{" "}
                of {totalPages} ({(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredTests.length)}{" "}
                from {filteredTests.length} Tests)
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
          )}
        </>
      )}

      {/* Delete Confirmation Popup */}
      {showDeletePopup && selectedTest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
            <div
              className="w-[400px] h-auto rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
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
              <div className="flex justify-between items-center pb-3 mb-6">
                <h3 className="text-black dark:text-white font-medium text-[18px] leading-[21px]">
                  Delete Test
                </h3>
                <button
                  onClick={() => {
                    setShowDeletePopup(false);
                    setSelectedTest(null);
                  }}
                  className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
                >
                  <X size={16} className="text-black dark:text-white" />
                </button>
              </div>

              {/* Confirmation Message */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <p className="text-lg font-medium mb-2">Are you sure?</p>
                <p className="text-gray-600 dark:text-gray-400">
                  You are about to delete the test:<br />
                  <span className="font-bold text-black dark:text-white">{selectedTest.test_type}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  This action cannot be undone.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeletePopup(false);
                    setSelectedTest(null);
                  }}
                  className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-gray-600 text-gray-600 dark:text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] bg-gray-100 dark:bg-transparent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTest}
                  className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-red-500 bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup Components */}
      {showAddPopup && (
        <AddTestPopup
          onClose={() => setShowAddPopup(false)}
          onSuccess={fetchTests}
          statusOptions={statusOptions}
        />
      )}

      {showEditPopup && selectedTest && (
        <EditTestPopup
          onClose={() => {
            setShowEditPopup(false);
            setSelectedTest(null);
          }}
          test={selectedTest}
          onSuccess={fetchTests}
          statusOptions={statusOptions}
        />
      )}
    </div>
  );
};

export default Laboratory;