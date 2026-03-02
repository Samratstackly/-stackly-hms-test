import React, { useState, useEffect } from "react";
import DeleteLabReportPopup from "./DeleteLabReport.jsx";
import CreateTestOrderPopup from "./CreateTestOrderPopup.jsx";
import { successToast, errorToast } from "../../../components/Toast.jsx";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Link,
  CheckSquare,
  X,
  Calendar,
  Edit,
  Trash2,
  FileText,
  Eye,
} from "lucide-react";
import { Listbox } from "@headlessui/react";
import api from "../../../utils/axiosConfig"; // Import axios

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Dropdown = ({ label, value, onChange, options, error }) => (
  <div>
    <label className="text-sm text-black dark:text-white">{label}</label>
    <Listbox value={value || "Select"} onChange={onChange}>
      <div className="relative mt-1 w-[228px]">
        <Listbox.Button
          className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-gray-100 dark:bg-black text-[#08994A] dark:text-[#0EFF7B] text-left text-[14px] leading-[16px] focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]"
        >
          {value || "Select"}
          <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]" />
          </span>
        </Listbox.Button>
        <Listbox.Options
          className="absolute mt-1 w-full max-h-40 overflow-auto rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] no-scroll"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {options.map((option, idx) => (
            <Listbox.Option
              key={idx}
              value={option.value || option}
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
              {option.label || option}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
      {error && (
        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>
      )}
    </Listbox>
  </div>
);

const LabReport = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    status: "All",
    category: "All",
    date: "",
  });
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedOrderForDelete, setSelectedOrderForDelete] = useState(null);
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    department: "",
    testType: "",
    status: "pending",
    labReportFile: null,
  });
  const [errors, setErrors] = useState({});
  const [testOrders, setTestOrders] = useState([]);
  const [testTypes, setTestTypes] = useState([]); // Add testTypes state
  const [isLoading, setIsLoading] = useState(false);
  const [testTypesLoading, setTestTypesLoading] = useState(false); // Add loading state
  const itemsPerPage = 15;

  // === Status colors ===
  const statusColors = {
    pending: "text-yellow-400 dark:text-yellow-400",
    completed: "text-green-400 dark:text-green-400",
    inprogress: "text-blue-400 dark:text-blue-400",
  };

  // === Status display mapping ===
  const statusDisplayMap = {
    pending: "Pending",
    completed: "Completed",
    inprogress: "In Progress",
  };

  // === Fetch test types from backend ===
  const fetchTestTypes = async () => {
    try {
      setTestTypesLoading(true);
      const response = await api.get("/labreports/test-types");
      
      if (response.status !== 200) {
        console.error("Failed to fetch test types:", response.status);
        return;
      }
      
      const data = response.data;
      setTestTypes(data.test_types || []);
    } catch (err) {
      console.error("Error loading test types:", err);
      errorToast("Failed to load test types");
      setTestTypes([]);
    } finally {
      setTestTypesLoading(false);
    }
  };

  // === Fetch lab reports from backend ===
  const fetchLabReports = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/labreports/list");
      
      if (response.status !== 200) {
        console.error("Failed to fetch lab reports:", response.status);
        return;
      }
      
      const data = response.data;
      const mapped = data.map((item) => ({
        id: item.id,
        orderId: item.order_id,
        patientName: item.patient_name,
        patientId: item.patient_id,
        department: item.department,
        testType: item.test_type,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        filePath: item.file_path, // Add file_path from backend
        raw: item,
      }));
      setTestOrders(mapped);
    } catch (err) {
      console.error("Error loading lab reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabReports();
    fetchTestTypes(); // Fetch test types on component mount
  }, []);

  // === API handlers ===
  const handleCreateReport = async (formData) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('patient_name', formData.patientName);
      formDataToSend.append('patient_id', formData.patientId);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('test_type', formData.testType);

      const response = await api.post("/labreports/create", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status !== 200 && response.status !== 201) {
        const errorData = response.data;
        throw new Error(errorData.detail || "Failed to create lab report");
      }
      
      await fetchLabReports();
      return response.data;
    } catch (err) {
      console.error("Create lab report failed:", err);
      throw err;
    }
  };

  const handleUpdateReport = async (id, formData) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("patient_name", formData.patientName);
      formDataToSend.append("patient_id", formData.patientId);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("test_type", formData.testType);
      formDataToSend.append("status", formData.status);

      // Only append file if it exists
      if (formData.labReportFile && formData.status === "completed") {
        formDataToSend.append("lab_report_file", formData.labReportFile);
      }

      const response = await api.put(`/labreports/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status !== 200) {
        throw new Error(response.data?.detail || "Failed to update lab report");
      }

      const result = response.data;
      // Refresh list
      await fetchLabReports();
      // Success toast
      successToast(`Lab report #${id} updated successfully!`);
      return result;
    } catch (err) {
      // Only show error toast — no console.error in production
      errorToast(err.response?.data?.detail || err.message || "Failed to update lab report");
      // Re-throw so caller can handle (e.g. keep modal open)
      throw err;
    }
  };

  const handleDeleteReport = async (id, orderId) => {
    try {
      const response = await api.delete(`/labreports/${id}`);

      // Accept both 200 (OK) and 204 (No Content) as success statuses
      if (response.status !== 200 && response.status !== 204) {
        throw new Error("Failed to delete lab report");
      }

      // Refresh the list after successful deletion
      await fetchLabReports();
      
      // Show success toast
      successToast(`Lab report #${orderId} deleted successfully!`);
      return true;
    } catch (err) {
      console.error("Error deleting lab report:", err);
      
      // Show error toast
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Failed to delete lab report. Please try again.";
      
      errorToast(errorMessage);
      
      throw err;
    }
  };

  // View the lab report in a new tab
  const handleViewReport = (filePath) => {
    if (!filePath) {
      errorToast("No lab report file available yet.");
      return;
    }
    try {
      // If the filePath already starts with http or https, use it directly
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        window.open(filePath, "_blank", "noopener,noreferrer");
        return;
      }
      
      // If filePath starts with /, we need to combine it with API_BASE
      if (filePath.startsWith('/')) {
        // Remove leading slash if API_BASE already ends with /
        const apiBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
        const fullUrl = `${apiBase}${filePath}`;
        window.open(fullUrl, "_blank", "noopener,noreferrer");
      } else {
        // If filePath doesn't start with /, assume it's relative to API_BASE
        const apiBase = API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`;
        const fullUrl = `${apiBase}${filePath}`;
        window.open(fullUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Error viewing report:", error);
      errorToast("Failed to open lab report");
    }
  };

  // Download the lab report
  // Download the lab report - FIXED VERSION
const handleDownloadReport = (filePath, orderId, testType) => {
  if (!filePath) {
    errorToast("No lab report file available to download.");
    return;
  }

  try {
    // Use the download endpoint with report ID (similar to working example)
    const downloadUrl = `${API_BASE}/labreports/${orderId}/download`; // Use orderId as report ID
    
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `Lab_Report_${testType || orderId}.pdf`; // Suggested filename
    link.target = '_blank'; // Add target blank like working example
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error triggering download:", error);
    errorToast("Failed to download lab report");
  }
};

  // === Status Counts ===
  const statusCounts = {
    total: testOrders.length,
    pending: testOrders.filter((report) => report.status === "pending").length,
    inprogress: testOrders.filter((report) => report.status === "inprogress")
      .length,
    completed: testOrders.filter((report) => report.status === "completed")
      .length,
  };

  // === Filtering Logic ===
  const filteredData = testOrders.filter((order) => {
    const matchesSearch =
      order.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.testType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patientId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || order.status === filterStatus;
    const matchesCategory =
      filterCategory === "All" || order.department === filterCategory;
    const matchesDate =
      !filterDate ||
      (order.createdAt && order.createdAt.slice(0, 10) === filterDate);
    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const displayedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openFilterPopup = () => {
    setTempFilters({
      status: filterStatus,
      category: filterCategory,
      date: filterDate,
    });
    setShowFilterPopup(true);
  };

  const applyFilters = () => {
    setFilterStatus(tempFilters.status);
    setFilterCategory(tempFilters.category);
    setFilterDate(tempFilters.date);
    setCurrentPage(1);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({ status: "All", category: "All", date: "" });
    setFilterStatus("All");
    setFilterCategory("All");
    setFilterDate("");
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleSelectOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((orderId) => orderId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === displayedData.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(displayedData.map((order) => order.id));
    }
  };

  const openEditPopup = (order) => {
    setSelectedOrderForEdit(order);
    setFormData({
      patientName: order.patientName,
      patientId: order.patientId,
      department: order.department,
      testType: order.testType,
      status: order.status,
      labReportFile: null,
    });
    setShowEditPopup(true);
  };

  const openDeletePopup = (order) => {
    setSelectedOrderForDelete(order);
    setShowDeletePopup(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientName.trim()) newErrors.patientName = "Patient name is required";
    if (!formData.patientId.trim()) newErrors.patientId = "Patient ID is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.testType.trim()) newErrors.testType = "Test type is required";
    if (!formData.status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateForm()) return;
    try {
      await handleUpdateReport(selectedOrderForEdit.id, formData);
      setShowEditPopup(false);
      setErrors({});
    } catch (error) {
      console.error("Failed to update report:", error);
    }
  };

  const departments = [...new Set(testOrders.map((order) => order.department))];
  const statusOptions = ["All", "pending", "inprogress", "completed"];
  const statusDisplayOptions = ["All", "Pending", "In Progress", "Completed"];

  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("Aug");
  const years = ["2023", "2024", "2025", "2026"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-4 w-full max-w-[2500px] font-[Helvetica] mx-auto flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative">
      {/* Background gradients */}
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
      <div className="flex justify-between items-center mt-4 mb-6 relative z-10 flex-wrap gap-4 md:flex-nowrap">
        <div>
          <h1 className="text-lg font-semibold text-black dark:text-white">
            Laboratory & Radiology
          </h1>
          <p className="text-sm text-[#A0A0A0] mt-1">
            Manage lab reports, test orders, and radiology requests in one place.
          </p>
        </div>
        <button
          onClick={() => setShowCreatePopup(true)}
          className="w-[200px] h-[40px] flex items-center justify-center gap-2 bg-[linear-gradient(92.18deg,#025126_3.26%,#0D7F41_50.54%,#025126_97.83%)] border-b-[2px] border-[#0EFF7B] shadow-[0px_2px_12px_0px_#00000040] hover:opacity-90 text-white font-semibold px-4 py-2 rounded-[8px] transition duration-300 ease-in-out"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          <Plus className="w-5 h-5 text-white dark:text-white" />
          <span>Create test order</span>
        </button>
      </div>

      {/* Status Counts */}
      <div className="mb-3 relative z-10">
        <div className="flex items-center gap-4 rounded-xl flex-wrap md:flex-nowrap">
          <div className="flex items-center gap-3">
            <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
              Total Orders
            </span>
            <span className="w-6 h-6 flex items-center font-[Helvetica] text-[12px] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#0D2016] dark:bg-[#14DC6F]">
              {statusCounts.total}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 hidden md:block"></div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
              Pending
            </span>
            <span className="w-6 h-6 flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-yellow-600 dark:bg-yellow-500">
              {statusCounts.pending}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 hidden md:block"></div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
              In Progress
            </span>
            <span className="w-6 h-6 flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-blue-600 dark:bg-blue-500">
              {statusCounts.inprogress}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 hidden md:block"></div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
              Completed
            </span>
            <span className="h-6 min-w-[24px] flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-green-600 dark:bg-green-500">
              {statusCounts.completed}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Test Orders & Clear Filters */}
      <div className="flex justify-between items-center mb-6 relative z-10 flex-wrap gap-4 md:flex-nowrap">
        <h1 className="text-lg font-semibold text-black dark:text-white">
          Recent Test Orders
          <p className="text-sm text-[#A0A0A0] mt-1">List of all test orders</p>
        </h1>
        {(filterStatus !== "All" || filterCategory !== "All" || filterDate !== "") && (
          <button
            onClick={clearFilters}
            className="text-sm text-[#08994A] dark:text-[#0EFF7B] hover:underline flex items-center gap-1"
          >
            Clear all filters
            <X className="w-4 h-4 text-[#08994A] dark:text-[#0EFF7B]" />
          </button>
        )}
      </div>

      {/* Bordered Container for Categories Dropdown to Table */}
      <div className="border border-[#0EFF7B] dark:border-[#3A3A3A] rounded-[12px] p-4 relative z-10 overflow-visible">
        {/* Search and Filters */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4 md:flex-nowrap">
          <div className="relative min-w-[180px]">
            <Listbox
              value={filterCategory}
              onChange={(value) => {
                setFilterCategory(value);
                setCurrentPage(1);
              }}
            >
              <Listbox.Button className="min-w-[180px] appearance-none bg-[#0EFF7B1A] dark:bg-[#000000] px-4 py-2 rounded-[8px] flex items-center border border-[#3C3C3C] text-[#08994A] dark:text-[#5CD592] text-sm pr-8 focus:outline-none">
                {filterCategory === "All" ? "Departments" : filterCategory}
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 pointer-events-none text-[#08994A] dark:text-[#0EFF7B]" />
              </Listbox.Button>
              <Listbox.Options className="absolute mt-1 min-w-[180px] rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[50] border border-[#0EFF7B] dark:border-[#3A3A3A] max-h-60 overflow-y-auto">
                <Listbox.Option
                  value="All"
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
                  All
                </Listbox.Option>
                {departments.map((dept, index) => (
                  <Listbox.Option
                    key={index}
                    value={dept}
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
                    {dept}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
          </div>
          <div className="flex items-center gap-3 flex-grow md:flex-grow-0">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#055C33] dark:text-[#0EFF7B]" />
              <input
                type="text"
                placeholder="Search patient name, test type, or order ID.."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full 
                  bg-[#BDE5D3] dark:bg-[#0EFF7B1A]   /* darker */
                  placeholder-[#2F7A58]
                  pl-10 pr-4 py-2 rounded-[40px]
                  border-[1px] border-[#08994A]
                  dark:border-[#0EFF7B1A]
                  text-[#044D2B] dark:text-[#5CD592]
                  text-sm focus:outline-none"
              />
            </div>
          
            <button
              onClick={openFilterPopup}
              className="relative group 
                bg-[#BDE5D3] dark:bg-[#0EFF7B1A]   /* darker visible bg */
                border border-[#08994A]
                rounded-[20px] w-[32px] h-[32px]
                flex items-center justify-center
                text-[#044D2B] dark:text-white
                hover:bg-[#A7DCC6]"   /* slightly darker hover */
            >
              <Filter size={18} className="text-[#055C33] dark:text-[#0EFF7B]" />
              <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                Filter
              </span>
            </button>
          </div>
        </div>

        {/* ✅ Table */}
        <div className="overflow-x-auto bg-gray-100 dark:bg-black rounded-xl shadow-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-200 dark:bg-[#091810] h-[52px]">
              <tr className="border-b border-gray-300 dark:border-[#000000] text-[#0EFF7B] dark:text-[#0EFF7B]">
                <th className="py-3 px-4 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedOrders.length === displayedData.length &&
                      displayedData.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                  />
                </th>
                <th className="py-3 px-4 text-left">Order ID</th>
                <th className="py-3 px-4 text-left">Patient Name</th>
                <th className="py-3 px-4 text-left">Patient ID</th>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-left">Test Type</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Created Date</th>
                <th className="py-3 px-4 text-left">Report</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                displayedData.map((order, idx) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white font-mono">
                      {order.orderId}
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white">
                      {order.patientName}
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white">
                      {order.patientId}
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white">
                      {order.department}
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white">
                      {order.testType}
                    </td>
                    <td
                      className={`py-3 px-4 font-medium ${
                        statusColors[order.status]
                      }`}
                    >
                      {statusDisplayMap[order.status]}
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      {order.filePath ? (
                        <div className="flex items-center gap-2">
                          {/* View Button */}
                          <div className="relative group">
                            <button
                              onClick={() => handleViewReport(order.filePath)}
                              className="flex items-center justify-center w-8 h-8 rounded-full border border-[#0EFF7B1A] dark:border-[#0EFF7B1A] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] cursor-pointer hover:bg-[#0EFF7B33] dark:hover:bg-[#0EFF7B33]"
                            >
                              <Eye
                                size={18}
                                className="text-[#08994A] dark:text-[#0EFF7B] hover:text-[#0cd968] dark:hover:text-[#0cd968]"
                              />
                            </button>
                            <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                              View Report
                            </span>
                          </div>
                          {/* Download Button */}
                          <div className="relative group">
                            <button
  onClick={() =>
    handleDownloadReport(order.filePath, order.id, order.testType) // Pass order.id and testType
  }
  className="flex items-center justify-center w-8 h-8 rounded-full border border-[#08994A1A] dark:border-[#0EFF7B1A] bg-[#08994A1A] dark:bg-[#0EFF7B1A] cursor-pointer hover:bg-[#0cd96822] dark:hover:bg-[#0cd96822]"
>
  <Download
    size={18}
    className="text-[#08994A] dark:text-[#0EFF7B] hover:text-[#0cd968] dark:hover:text-[#0cd968]"
  />
</button>
                            <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                              Download Report
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          No report
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <div
                          className="relative group w-8 h-8 flex items-center justify-center rounded-full border border-[#08994A1A] dark:border-[#0EFF7B1A] bg-[#08994A1A] dark:bg-[#0EFF7B1A] cursor-pointer hover:bg-[#0cd96822] dark:hover:bg-[#0cd96822]"
                          onClick={() => openEditPopup(order)}
                        >
                          <Edit
                            size={18}
                            className="text-[#08994A] dark:text-[#0EFF7B] hover:text-[#0cd968] dark:hover:text-[#0cd968]"
                          />
                          <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                            Edit
                          </span>
                        </div>
                        {/* Delete Button */}
                        <div
                          className="relative group w-8 h-8 flex items-center justify-center rounded-full border border-red-500/20 dark:border-red-500/20 bg-red-500/10 dark:bg-red-500/10 cursor-pointer hover:bg-red-500/20 dark:hover:bg-red-500/20"
                          onClick={() => openDeletePopup(order)}
                        >
                          <Trash2
                            size={18}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          />
                          <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                            Delete
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center mt-4 bg-gray-100 dark:bg-transparent rounded gap-x-4 relative z-10 flex-wrap gap-4 md:flex-nowrap">
        <div className="text-sm text-gray-600 dark:text-white">
          Page{" "}
          <span className="text-[#08994A] dark:text-[#0EFF7B] font-semibold">
            {currentPage}
          </span>{" "}
          of {totalPages} ({(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredData.length)} from{" "}
          {filteredData.length} Orders)
        </div>
        <div className="flex items-center gap-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`w-5 h-5 flex items-center justify-center rounded-full border ${
              currentPage === 1
                ? "bg-gray-200 dark:bg-[#0EFF7B1A] border-gray-300 dark:border-[#0EFF7B1A] text-gray-600 dark:text-white opacity-50"
                : "bg-[#08994A] dark:bg-[#0EFF7B] border-[#08994A] dark:border-[#0EFF7B] text-white dark:text-black"
            }`}
          >
            <ChevronLeft size={12} />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`w-5 h-5 flex items-center justify-center rounded-full border ${
              currentPage === totalPages
                ? "bg-gray-200 dark:bg-[#0EFF7B1A] border-gray-300 dark:border-[#0EFF7B1A] text-gray-600 dark:text-white opacity-50"
                : "bg-[#08994A] dark:bg-[#0EFF7B] border-[#08994A] dark:border-[#0EFF7B] text-white dark:text-black"
            }`}
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Filter Popup */}
      {showFilterPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
            <div
              className="w-[505px] max-w-[90vw] rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 mb-4">
                <h2
                  className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  Filter Test Orders
                </h2>
                <button
                  onClick={() => setShowFilterPopup(false)}
                  className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
                >
                  <X size={16} className="text-black dark:text-white" />
                </button>
              </div>

              {/* Filter Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Dropdown
                  label="Department"
                  value={tempFilters.category}
                  onChange={(value) =>
                    setTempFilters({ ...tempFilters, category: value })
                  }
                  options={["All", ...departments]}
                  className="w-[228px] h-[32px] mt-1"
                />
                <div>
                  <label
                    className="text-sm text-black dark:text-white"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    Created Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={tempFilters.date}
                      onChange={(e) =>
                        setTempFilters({ ...tempFilters, date: e.target.value })
                      }
                      onClick={(e) => e.target.showPicker()}
                      className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none cursor-pointer"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                    />
                    <Calendar
                      size={18}
                      className="absolute right-3 top-3.5 text-black dark:text-[#0EFF7B] pointer-events-none"
                    />
                  </div>
                </div>
                <Dropdown
                  label="Status"
                  value={tempFilters.status}
                  onChange={(value) =>
                    setTempFilters({ ...tempFilters, status: value })
                  }
                  options={statusOptions}
                  className="w-[228px] h-[32px] mt-1"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 mt-8 flex-wrap md:flex-nowrap">
                <button
                  onClick={() => {
                    clearFilters();
                    setTempFilters({ status: "All", category: "All", date: "" });
                  }}
                  className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[14px] leading-[16px]"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  Clear
                </button>
                <button
                  onClick={applyFilters}
                  className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Test Order Popup */}
      {showCreatePopup && (
        <CreateTestOrderPopup
          onClose={() => setShowCreatePopup(false)}
          onSave={handleCreateReport}
        />
      )}

      {/* Edit Popup */}
      {showEditPopup && selectedOrderForEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
            <div
              className="w-[505px] max-w-[90vw] h-auto rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 mb-4">
                <h2
                  className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  Edit Test Order
                </h2>
                <button
                  onClick={() => setShowEditPopup(false)}
                  className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
                >
                  <X size={16} className="text-black dark:text-white" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Name */}
                <div>
                  <label
                    className="text-sm text-black dark:text-white"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    Patient Name
                  </label>
                  <input
                    name="patientName"
                    value={formData.patientName}
                    onChange={(e) =>
                      setFormData({ ...formData, patientName: e.target.value })
                    }
                    placeholder="Enter patient name"
                    className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  />
                  {errors.patientName && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      {errors.patientName}
                    </p>
                  )}
                </div>

                {/* Patient ID */}
                <div>
                  <label
                    className="text-sm text-black dark:text-white"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    Patient ID
                  </label>
                  <input
                    name="patientId"
                    value={formData.patientId}
                    onChange={(e) =>
                      setFormData({ ...formData, patientId: e.target.value })
                    }
                    placeholder="Enter patient ID"
                    className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  />
                  {errors.patientId && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      {errors.patientId}
                    </p>
                  )}
                </div>

                {/* Department Dropdown */}
                <Dropdown
                  label="Department"
                  value={formData.department}
                  onChange={(val) =>
                    setFormData({ ...formData, department: val })
                  }
                  options={departments}
                  error={errors.department}
                  className="w-[228px] h-[32px] mt-1"
                />

                {/* Test Type Dropdown */}
                <Dropdown
                  label="Test Type"
                  value={formData.testType}
                  onChange={(val) => setFormData({ ...formData, testType: val })}
                  options={testTypes}
                  error={errors.testType}
                  className="w-[228px] h-[32px] mt-1"
                />

                {/* Status Dropdown */}
                <Dropdown
                  label="Status"
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={statusOptions.slice(1)}
                  error={errors.status}
                  className="w-[228px] h-[32px] mt-1"
                />

                {/* Lab Report File Upload - Only show when status is "completed" */}
                {formData.status === "completed" && (
                  <div className="col-span-2">
                    <label
                      className="text-sm text-black dark:text-white"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                    >
                      Upload Lab Report
                    </label>
                    <div className="mt-2">
                      <input
                        type="file"
                        id="labReportFile"
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFormData({
                              ...formData,
                              labReportFile: e.target.files[0],
                            });
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="labReportFile"
                        className="flex items-center justify-center w-full h-[32px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#0EFF7B] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-[#08994A] dark:text-[#0EFF7B] text-sm cursor-pointer hover:bg-[#0EFF7B33] dark:hover:bg-[#0EFF7B33] transition-colors"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {formData.labReportFile
                          ? formData.labReportFile.name
                          : "Choose file"}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Accepted formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 mt-8 flex-wrap md:flex-nowrap">
                <button
                  onClick={() => setShowEditPopup(false)}
                  className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[14px] leading-[16px]"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Popup */}
      {showDeletePopup && selectedOrderForDelete && (
        <DeleteLabReportPopup
          order={selectedOrderForDelete}
          onClose={() => {
            setShowDeletePopup(false);
            setSelectedOrderForDelete(null);
          }}
          onConfirm={async (id) => {
            try {
              await handleDeleteReport(id, selectedOrderForDelete.orderId);
              setShowDeletePopup(false);
              setSelectedOrderForDelete(null);
            } catch (error) {
              // Error is already handled in the delete function with toast
              console.error("Delete failed:", error);
            }
          }}
        />
      )}
    </div>
  );
};

export default LabReport;
