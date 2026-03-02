
// import React, { useState, useEffect } from "react";
// import {
//   Search,
//   Filter,
//   Settings,
//   Printer,
//   Download,
//   CheckCircle,
//   Trash2,
//   ChevronLeft,
//   ChevronRight,
//   Eye,
//   X,
//   ChevronDown,
//   Calendar,
//   FileDown,
// } from "lucide-react";
// import { Listbox } from "@headlessui/react";
// import { useNavigate } from "react-router-dom";
// import { successToast, errorToast } from "../../components/Toast.jsx";
// import api from "../../utils/axiosConfig";

// const Dropdown = ({ label, value, onChange, options, error }) => (
//   <div>
//     <label className="text-sm text-black dark:text-white">{label}</label>
//     <Listbox value={value || "Select"} onChange={onChange}>
//       <div className="relative mt-1 w-[228px]">
//         <Listbox.Button
//           className="w-full h-[33px] px-3 pr-8 rounded-full border border-[#0EFF7B] dark:border-[#0D0D0D]
//           bg-gray-100 dark:bg-black text-[#08994A] dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]
//           focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]"
//         >
//           {value || "Select"}
//           <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
//             <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]" />
//           </span>
//         </Listbox.Button>
//         <Listbox.Options
//           className="absolute mt-1 w-full max-h-40 overflow-auto rounded-[12px] bg-gray-100 dark:bg-black
//           shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] no-scroll"
//           style={{
//             scrollbarWidth: "none",
//             msOverflowStyle: "none",
//           }}
//         >
//           {options.map((option, idx) => (
//             <Listbox.Option
//               key={idx}
//               value={option.value || option}
//               className={({ active, selected }) =>
//                 `cursor-pointer select-none py-2 px-2 text-sm rounded-md
//                 ${
//                   active
//                     ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
//                     : "text-black dark:text-white"
//                 }
//                 ${
//                   selected
//                     ? "font-medium text-[#08994A] dark:text-[#0EFF7B]"
//                     : ""
//                 }`
//               }
//             >
//               {option.label || option}
//             </Listbox.Option>
//           ))}
//         </Listbox.Options>
//       </div>
//       {error && (
//         <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>
//       )}
//     </Listbox>
//   </div>
// );

// const BillingManagement = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectAll, setSelectAll] = useState(false);
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortColumn, setSortColumn] = useState(null);
//   const [sortOrder, setSortOrder] = useState("asc");
//   const [showDeletePopup, setShowDeletePopup] = useState(false);
//   const [showFilterPopup, setShowFilterPopup] = useState(false);
//   const [filterStatus, setFilterStatus] = useState("");
//   const [filterDepartment, setFilterDepartment] = useState("");
//   const [filterPaymentMethod, setFilterPaymentMethod] = useState("");
//   const [filterDate, setFilterDate] = useState("");
//   const [invoiceData, setInvoiceData] = useState([]);
//   const [totalBillsToday, setTotalBillsToday] = useState(0);
//   const [insuranceClaims, setInsuranceClaims] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
//   const [showExportPopup, setShowExportPopup] = useState(false);

//   // Hospital states
//   const [hospitalInvoiceData, setHospitalInvoiceData] = useState([]);
//   const [hospitalSearchTerm, setHospitalSearchTerm] = useState("");
//   const [hospitalSelectAll, setHospitalSelectAll] = useState(false);
//   const [selectedHospitalRows, setSelectedHospitalRows] = useState([]);
//   const [hospitalCurrentPage, setHospitalCurrentPage] = useState(1);
//   const [hospitalSortColumn, setHospitalSortColumn] = useState(null);
//   const [hospitalSortOrder, setHospitalSortOrder] = useState("asc");
//   const [showHospitalDeletePopup, setShowHospitalDeletePopup] = useState(false);
//   const [showHospitalFilterPopup, setShowHospitalFilterPopup] = useState(false);
//   const [hospitalFilterStatus, setHospitalFilterStatus] = useState("");
//   const [hospitalFilterDepartment, setHospitalFilterDepartment] = useState("");
//   const [hospitalFilterPaymentMethod, setHospitalFilterPaymentMethod] = useState("");
//   const [hospitalFilterDate, setHospitalFilterDate] = useState("");
//   const [showHospitalExportPopup, setShowHospitalExportPopup] = useState(false);
//   const [hospitalLoading, setHospitalLoading] = useState(true);
//   const [hospitalError, setHospitalError] = useState(null);

//   const statusOptions = ["All", "Paid", "Unpaid"];
//   const departmentOptions = [
//     "All",
//     "Cardiology",
//     "Radiology",
//     "Oncology",
//     "Emergency",
//     "Neurology",
//     "Orthopedics",
//     "Dermatology",
//   ];
//   const paymentMethodOptions = ["All", "Insurance", "Cash", "Credit Card", "None"];

//   const handleExport = () => {
//     setShowExportPopup(true);
//   };

//   const downloadExcel = async () => {
//     try {
//       const response = await api.get("/billing/export/excel", {
//         responseType: "blob"
//       });
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "invoices.xlsx");
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
      
//       successToast("Excel file downloaded successfully");
//       setShowExportPopup(false);
//     } catch (err) {
//       errorToast(err.response?.data?.detail || "Failed to download Excel file");
//     }
//   };

//   const downloadCSV = async () => {
//     try {
//       const response = await api.get("/billing/export/csv", {
//         responseType: "blob"
//       });
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "invoices.csv");
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
      
//       successToast("CSV file downloaded successfully");
//       setShowExportPopup(false);
//     } catch (err) {
//       errorToast(err.response?.data?.detail || "Failed to download CSV file");
//     }
//   };

//   // Hospital export functions
//   const handleHospitalExport = () => {
//     setShowHospitalExportPopup(true);
//   };

//   const downloadHospitalExcel = async () => {
//     try {
//       const response = await api.get("/hospital-billing/export/excel", {
//         responseType: "blob"
//       });
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "hospital_invoices.xlsx");
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
      
//       successToast("Excel file downloaded successfully");
//       setShowHospitalExportPopup(false);
//     } catch (err) {
//       errorToast(err.response?.data?.detail || "Failed to download Excel file");
//     }
//   };

//   const downloadHospitalCSV = async () => {
//     try {
//       const response = await api.get("/hospital-billing/export/csv", {
//         responseType: "blob"
//       });
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "hospital_invoices.csv");
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
      
//       successToast("CSV file downloaded successfully");
//       setShowHospitalExportPopup(false);
//     } catch (err) {
//       errorToast(err.response?.data?.detail || "Failed to download CSV file");
//     }
//   };

//   const fetchInvoices = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await api.get("/billing/");
      
//       console.log("Full Response Object:", response);
//       console.log("Content-Type:", response.headers['content-type']);
//       console.log("Raw response.data:", response.data);
//       console.log("Type of response.data:", typeof response.data);

//       let data = [];
//       if (typeof response.data === 'string') {
//         console.warn("response.data is a string, attempting to parse as JSON");
//         try {
//           const parsed = JSON.parse(response.data);
//           if (Array.isArray(parsed)) {
//             data = parsed;
//           } else {
//             console.error("Parsed data is not an array:", parsed);
//             throw new Error("Invalid response format");
//           }
//         } catch (parseErr) {
//           console.error("Failed to parse string as JSON:", parseErr);
//           throw new Error("Response is not valid JSON");
//         }
//       } else if (Array.isArray(response.data)) {
//         data = response.data;
//       } else {
//         console.error("Expected array, got:", typeof response.data, response.data);
//         throw new Error("Invalid response format");
//       }

//       const mappedData = data.map((inv) => ({
//         id: inv.invoice_id,
//         date: inv.date,
//         patientName: inv.patient_name,
//         patientId: inv.patient_id,
//         department: inv.department,
//         amount: `$${inv.amount.toFixed(2)}`,
//         paymentMethod: inv.payment_method || "-",
//         status: inv.status,
//       }));
//       setInvoiceData(mappedData);

//       const today = new Date().toISOString().split("T")[0];
//       setTotalBillsToday(mappedData.filter((d) => d.date === today).length);
//       setInsuranceClaims(mappedData.filter((d) => d.paymentMethod === "Insurance").length);
//     } catch (err) {
//       console.error("Error fetching invoices:", err.response?.data || err.message);
//       setError(`Failed to fetch invoices: ${err.response?.data?.detail || err.message}. Check console for details.`);
//       setInvoiceData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchHospitalInvoices = async () => {
//     try {
//       setHospitalLoading(true);
//       setHospitalError(null);
//       const response = await api.get("/hospital-billing/");

//       let data = [];
//       if (typeof response.data === 'string') {
//         console.warn("response.data is a string, attempting to parse as JSON");
//         try {
//           const parsed = JSON.parse(response.data);
//           if (Array.isArray(parsed)) {
//             data = parsed;
//           } else {
//             console.error("Parsed data is not an array:", parsed);
//             throw new Error("Invalid response format");
//           }
//         } catch (parseErr) {
//           console.error("Failed to parse string as JSON:", parseErr);
//           throw new Error("Response is not valid JSON");
//         }
//       } else if (Array.isArray(response.data)) {
//         data = response.data;
//       } else {
//         console.error("Expected array, got:", typeof response.data, response.data);
//         throw new Error("Invalid response format");
//       }

//       const mappedData = data.map((inv) => ({
//         id: inv.invoice_id,
//         date: inv.date,
//         patientName: inv.patient_name,
//         patientId: inv.patient_id,
//         department: inv.department,
//         amount: `$${inv.amount.toFixed(2)}`,
//         paymentMethod: inv.payment_method || "-",
//         status: inv.status,
//       }));
//       setHospitalInvoiceData(mappedData);
//     } catch (err) {
//       console.error("Error fetching hospital invoices:", err.response?.data || err.message);
//       setHospitalError(`Failed to fetch hospital invoices: ${err.response?.data?.detail || err.message}.`);
//       setHospitalInvoiceData([]);
//     } finally {
//       setHospitalLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchInvoices();
//     fetchHospitalInvoices();
//   }, []);

//   const filteredData = invoiceData.filter((item) => {
//     const matchesSearch = Object.values(item)
//       .join(" ")
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase());
//     const matchesStatus = filterStatus && filterStatus !== "All" ? item.status === filterStatus : true;
//     const matchesDepartment = filterDepartment && filterDepartment !== "All"
//       ? item.department === filterDepartment
//       : true;
//     const matchesPaymentMethod = filterPaymentMethod && filterPaymentMethod !== "All"
//       ? item.paymentMethod === (filterPaymentMethod === "None" ? "-" : filterPaymentMethod)
//       : true;
//     const matchesDate = filterDate ? item.date === filterDate : true;
//     return matchesSearch && matchesStatus && matchesDepartment && matchesPaymentMethod && matchesDate;
//   });

//   const sortedData = [...filteredData].sort((a, b) => {
//     if (!sortColumn) return 0;
//     const valA = a[sortColumn];
//     const valB = b[sortColumn];
//     if (sortColumn === "amount") {
//       const numA = parseFloat(valA.replace("$", ""));
//       const numB = parseFloat(valB.replace("$", ""));
//       return sortOrder === "asc" ? numA - numB : numB - numA;
//     }
//     return sortOrder === "asc"
//       ? valA.localeCompare(valB)
//       : valB.localeCompare(valA);
//   });

//   const itemsPerPage = 10;
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const indexOfFirst = (currentPage - 1) * itemsPerPage;
//   const indexOfLast = currentPage * itemsPerPage;
//   const displayedData = sortedData.slice(indexOfFirst, indexOfLast);

//   // Hospital filtered, sorted, paginated
//   const filteredHospitalData = hospitalInvoiceData.filter((item) => {
//     const matchesSearch = Object.values(item)
//       .join(" ")
//       .toLowerCase()
//       .includes(hospitalSearchTerm.toLowerCase());
//     const matchesStatus = hospitalFilterStatus && hospitalFilterStatus !== "All" ? item.status === hospitalFilterStatus : true;
//     const matchesDepartment = hospitalFilterDepartment && hospitalFilterDepartment !== "All"
//       ? item.department === hospitalFilterDepartment
//       : true;
//     const matchesPaymentMethod = hospitalFilterPaymentMethod && hospitalFilterPaymentMethod !== "All"
//       ? item.paymentMethod === (hospitalFilterPaymentMethod === "None" ? "-" : hospitalFilterPaymentMethod)
//       : true;
//     const matchesDate = hospitalFilterDate ? item.date === hospitalFilterDate : true;
//     return matchesSearch && matchesStatus && matchesDepartment && matchesPaymentMethod && matchesDate;
//   });

//   const sortedHospitalData = [...filteredHospitalData].sort((a, b) => {
//     if (!hospitalSortColumn) return 0;
//     const valA = a[hospitalSortColumn];
//     const valB = b[hospitalSortColumn];
//     if (hospitalSortColumn === "amount") {
//       const numA = parseFloat(valA.replace("$", ""));
//       const numB = parseFloat(valB.replace("$", ""));
//       return hospitalSortOrder === "asc" ? numA - numB : numB - numA;
//     }
//     return hospitalSortOrder === "asc"
//       ? valA.localeCompare(valB)
//       : valB.localeCompare(valA);
//   });

//   const hospitalItemsPerPage = 10;
//   const hospitalTotalPages = Math.ceil(filteredHospitalData.length / hospitalItemsPerPage);
//   const hospitalIndexOfFirst = (hospitalCurrentPage - 1) * hospitalItemsPerPage;
//   const hospitalIndexOfLast = hospitalCurrentPage * hospitalItemsPerPage;
//   const displayedHospitalData = sortedHospitalData.slice(hospitalIndexOfFirst, hospitalIndexOfLast);

//   const handleSort = (column) => {
//     if (sortColumn === column) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortColumn(column);
//       setSortOrder("asc");
//     }
//   };

//   const handleHospitalSort = (column) => {
//     if (hospitalSortColumn === column) {
//       setHospitalSortOrder(hospitalSortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setHospitalSortColumn(column);
//       setHospitalSortOrder("asc");
//     }
//   };

//   const handleSelectAll = () => {
//     setSelectAll(!selectAll);
//     setSelectedRows(selectAll ? [] : displayedData.map((row) => row.id));
//   };

//   const handleHospitalSelectAll = () => {
//     setHospitalSelectAll(!hospitalSelectAll);
//     setSelectedHospitalRows(hospitalSelectAll ? [] : displayedHospitalData.map((row) => row.id));
//   };

//   const handleRowSelect = (id) => {
//     setSelectedRows((prev) =>
//       prev.includes(id)
//         ? prev.filter((rowId) => rowId !== id)
//         : [...prev, id]
//     );
//   };

//   const handleHospitalRowSelect = (id) => {
//     setSelectedHospitalRows((prev) =>
//       prev.includes(id)
//         ? prev.filter((rowId) => rowId !== id)
//         : [...prev, id]
//     );
//   };

//   const handlePrevPage = () => {
//     setCurrentPage((prev) => Math.max(1, prev - 1));
//   };

//   const handleHospitalPrevPage = () => {
//     setHospitalCurrentPage((prev) => Math.max(1, prev - 1));
//   };

//   const handleNextPage = () => {
//     setCurrentPage((prev) => Math.min(totalPages, prev + 1));
//   };

//   const handleHospitalNextPage = () => {
//     setHospitalCurrentPage((prev) => Math.min(hospitalTotalPages, prev + 1));
//   };

//   const handleGenerateBill = () => {
//     console.log("Generate Bill button clicked");
//     navigate("/BillingPreview");
//   };

//   const handleViewInvoice = (invoiceId) => {
//     window.open(`${api.defaults.baseURL}/invoices/${invoiceId}.pdf`, "_blank");
//   };

//   const handleHospitalViewInvoice = (invoiceId) => {
//     window.open(`${api.defaults.baseURL}/invoices_generator/${invoiceId}.pdf`, "_blank");
//   };

//   const handlePDFDownload = async () => {
//     if (selectedRows.length === 0) {
//       errorToast("Please select at least one invoice to download.");
//       return;
//     }
//     try {
//       console.log("Downloading PDFs for IDs:", selectedRows);
//       const response = await api.post("/billing/download-selected", 
//         { ids: selectedRows }, 
//         { 
//           responseType: "blob"
//         }
//       );
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "selected_invoices.zip");
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//       successToast(`Successfully downloaded ${selectedRows.length} invoice(s)`);
//     } catch (err) {
//       console.error("Error downloading PDFs:", err.response?.data || err.message);
//       errorToast(err.response?.data?.detail || "Failed to download PDFs. Please check if the files exist on the server.");
//     }
//   };

//   const handleHospitalPDFDownload = async () => {
//     if (selectedHospitalRows.length === 0) {
//       errorToast("Please select at least one invoice to download.");
//       return;
//     }
//     try {
//       console.log("Downloading hospital PDFs for IDs:", selectedHospitalRows);
//       const response = await api.post("/hospital-billing/download-selected", 
//         { ids: selectedHospitalRows }, 
//         { 
//           responseType: "blob"
//         }
//       );
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "selected_hospital_invoices.zip");
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//       successToast(`Successfully downloaded ${selectedHospitalRows.length} invoice(s)`);
//     } catch (err) {
//       console.error("Error downloading hospital PDFs:", err.response?.data || err.message);
//       errorToast(err.response?.data?.detail || "Failed to download PDFs. Please check if the files exist on the server.");
//     }
//   };

//   const handlePDFPrint = async () => {
//     if (selectedRows.length === 0) {
//       errorToast("Please select an invoice to print.");
//       return;
//     }
//     if (selectedRows.length > 1) {
//       errorToast("Please select only one invoice to print.");
//       return;
//     }

//     const invoiceId = selectedRows[0];
//     try {
//       const response = await api.get(`/invoices/${invoiceId}.pdf`, {
//         responseType: "blob"
//       });
      
//       const blob = response.data;
//       const pdfUrl = URL.createObjectURL(blob);
      
//       const printWindow = window.open(pdfUrl, '_blank');
      
//       printWindow.onload = function() {
//         setTimeout(() => {
//           printWindow.print();
//         }, 500);
//       };
      
//     } catch (err) {
//       console.error("Error loading PDF for printing:", err);
//       errorToast("Failed to load PDF for printing. The file might not exist.");
//     }
//   };

// const handleHospitalPDFPrint = async () => {
//   if (selectedHospitalRows.length === 0) {
//     errorToast("Please select an invoice to print.");
//     return;
//   }
//   if (selectedHospitalRows.length > 1) {
//     errorToast("Please select only one invoice to print.");
//     return;
//   }

//   const invoiceId = selectedHospitalRows[0];

//   try {
//     // Use the same URL that works for view
//     const pdfUrl = `${api.defaults.baseURL}/invoices_generator/${invoiceId}.pdf`;

//     // Optional: You can fetch it first to check if it exists
//     const response = await api.get(`/invoices_generator/${invoiceId}.pdf`, {
//       responseType: "blob",
//     });

//     const blob = response.data;
//     const url = URL.createObjectURL(blob);

//     const printWindow = window.open(url, "_blank");

//     if (printWindow) {
//       printWindow.onload = () => {
//         setTimeout(() => {
//           try {
//             printWindow.print();
//           } catch (e) {
//             console.error("Print failed:", e);
//           }
//         }, 800); // slightly longer delay is often more reliable
//       };
//     } else {
//       // Fallback - direct open
//       window.open(pdfUrl, "_blank");
//       setTimeout(() => {
//         alert("Please use browser print (Ctrl+P) if print dialog didn't open.");
//       }, 1500);
//     }

//     successToast("Opening invoice for printing...");
//   } catch (err) {
//     console.error("Error preparing hospital invoice for print:", err);
//     errorToast(
//       err.response?.status === 404
//         ? "PDF file not found on server"
//         : "Failed to load invoice for printing"
//     );
//   }
// };

//   const handleFilter = () => {
//     setShowFilterPopup(true);
//   };

//   const handleHospitalFilter = () => {
//     setShowHospitalFilterPopup(true);
//   };

//   const handleDelete = () => {
//     if (selectedRows.length > 0) {
//       setShowDeletePopup(true);
//     } else {
//       errorToast("Please select at least one invoice to delete.");
//     }
//   };

//   const handleHospitalDelete = () => {
//     if (selectedHospitalRows.length > 0) {
//       setShowHospitalDeletePopup(true);
//     } else {
//       errorToast("Please select at least one invoice to delete.");
//     }
//   };

//   const confirmDelete = async () => {
//     try {
//       for (const id of selectedRows) {
//         await api.delete(`/billing/${id}`);
//       }
//       setSelectedRows([]);
//       setSelectAll(false);
//       setShowDeletePopup(false);
//       fetchInvoices();
//       successToast(`Successfully deleted ${selectedRows.length} invoice(s)`);
//     } catch (err) {
//       console.error("Error deleting invoices:", err);
//       errorToast(err.response?.data?.detail || "Failed to delete some invoices.");
//     }
//   };

//   const confirmHospitalDelete = async () => {
//     try {
//       for (const id of selectedHospitalRows) {
//         await api.delete(`/hospital-billing/${id}`);
//       }
//       setSelectedHospitalRows([]);
//       setHospitalSelectAll(false);
//       setShowHospitalDeletePopup(false);
//       fetchHospitalInvoices();
//       successToast(`Successfully deleted ${selectedHospitalRows.length} invoice(s)`);
//     } catch (err) {
//       console.error("Error deleting hospital invoices:", err);
//       errorToast(err.response?.data?.detail || "Failed to delete some invoices.");
//     }
//   };

//   const handleApplyFilter = () => {
//     setShowFilterPopup(false);
//     setCurrentPage(1);
//     successToast("Filters applied successfully");
//   };

//   const handleHospitalApplyFilter = () => {
//     setShowHospitalFilterPopup(false);
//     setHospitalCurrentPage(1);
//     successToast("Filters applied successfully");
//   };

//   const handleClearFilter = () => {
//     setFilterStatus("All");
//     setFilterDepartment("All");
//     setFilterPaymentMethod("All");
//     setFilterDate("");
//     setShowFilterPopup(false);
//     setCurrentPage(1);
//     successToast("Filters cleared");
//   };

//   const handleHospitalClearFilter = () => {
//     setHospitalFilterStatus("All");
//     setHospitalFilterDepartment("All");
//     setHospitalFilterPaymentMethod("All");
//     setHospitalFilterDate("");
//     setShowHospitalFilterPopup(false);
//     setHospitalCurrentPage(1);
//     successToast("Filters cleared");
//   };

//   const handleShare = (id) => {
//     console.log(`Share button clicked for invoice ${id}`);
//   };

//   const getStatusColor = (status) => {
//     if (status === "Paid") return "text-green-600 dark:text-green-500";
//     if (status === "Unpaid") return "text-orange-600 dark:text-orange-500";
//     return "text-gray-600 dark:text-gray-400";
//   };

//   return (
//     <div
//       className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-4 w-full max-w-[2500px] mx-auto flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative font-[Helvetica]"
//     >
//       <div
//         className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
//         style={{
//           background:
//             "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
//           zIndex: 0,
//         }}
//       ></div>
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           borderRadius: "10px",
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
//       <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mt-4 mb-6">
//         <h1 className="text-[20px] font-medium text-black dark:text-white">
//           Billing Management
//         </h1>
//         <button
        
//           onClick={handleGenerateBill}
//           className="w-[200px] h-[40px] flex items-center justify-center bg-[linear-gradient(92.18deg,#025126_3.26%,#0D7F41_50.54%,#025126_97.83%)] border-b-[2px] border-[#0EFF7B] shadow-[0px_2px_12px_0px_#00000040] hover:opacity-90 text-white font-semibold px-4 py-2 rounded-[8px] transition duration-300 ease-in-out"
//           style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//         >
//           + Generate Bill
//         </button>
//       </div>
//       <div className="flex flex-col lg:flex-row gap-6 mb-6">
//         <div className="flex flex-col gap-8 flex-1">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             <div className="flex flex-col rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] p-6 shadow-sm">
//               <div className="flex flex-col gap-2">
//                 <span className="font-medium text-[18px]  text-black dark:text-white">
//                   Total Bills Generated Today
//                 </span>
//                 <span className="text-[#08994A] dark:text-[#0EFF7B] text-[28px] font-bold">
//                   {totalBillsToday}
//                 </span>
//               </div>
//             </div>
//             <div className="flex flex-col rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] p-6 shadow-sm">
//               <div className="flex flex-col gap-2">
//                 <span className="font-medium text-[18px] text-black dark:text-white">
//                   Insurance Claims
//                 </span>
//                 <span className="text-[#08994A] dark:text-[#0EFF7B] text-[28px] font-bold">
//                   {insuranceClaims}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         <div className="w-full lg:w-[280px] flex flex-col gap-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] p-4 shadow-sm">
//           <div className="flex justify-between items-center pb-2 border-b border-gray-300 dark:border-[#3C3C3C]">
//             <span className="text-[#6E92FF] dark:text-[#0EFF7B] text-sm font-semibold">
//               VALIDATION & CONTROLS
//             </span>
//             <Settings size={16} className="text-gray-600 dark:text-gray-400" />
//           </div>
//           <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-3 mt-2">
//             <li className="flex items-center gap-2">
//               <CheckCircle size={14} className="text-green-600 dark:text-green-500" /> Payment method validation
//             </li>
//             <li className="flex items-center gap-2">
//               <CheckCircle size={14} className="text-red-600 dark:text-red-500" /> No negative billing amounts
//             </li>
//             <li className="flex items-center gap-2">
//               <CheckCircle size={14} className="text-gray-600 dark:text-gray-400" /> Duplicate bill prevention
//             </li>
//             <li className="flex items-center gap-2">
//               <CheckCircle size={14} className="text-green-600 dark:text-green-500" /> Refund handling
//             </li>
//           </ul>
//         </div>
//       </div>
//     <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-3">
//             <h2 className="text-black dark:text-white text-lg font-semibold">All Invoices</h2>
//           </div>
//       <div className="w-full bg-gray-100 dark:bg-transparent rounded-xl p-4 md:p-6 overflow-x-auto border border-[#0EFF7B] dark:border-[#3C3C3C]">
//         {error && (
//           <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 p-4 rounded mb-4">
//             <p>{error}</p>
//             <button onClick={fetchInvoices} className="mt-2 text-sm underline">Retry</button>
//           </div>
//         )}
//         {loading ? (
//           <div className="text-center p-4">Loading pharmacy invoices...</div>
//         ) : (
//           <>
//             <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
//               <span className="text-black dark:text-white text-base font-medium">Pharmacy Invoices</span>
//               <div className="flex items-center gap-2">
//                 <div className="relative group flex items-center gap-2 bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full w-full sm:w-auto">
//                   <Search size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
//                   <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Search
//                   </span>
//                   <input
//                     type="text"
//                     placeholder="Search..."
//                     className="bg-transparent outline-none text-sm text-black dark:text-white flex-1 min-w-[120px] placeholder-[#5CD592] dark:placeholder-[#5CD592] focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//                 <div
//                   className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
//                   onClick={handleFilter}
//                 >
//                   <Filter size={16} className="text-[#0EFF7B] dark:text-[#0EFF7B] hover:text-[#08994A] dark:hover:text-[#0EFF7B]" />
//                   <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Filter
//                   </span>
//                 </div>
//                 <div
//                   className="relative group flex items-center justify-center bg-[#FF00001A] dark:bg-[#FF00001A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#FF000033] dark:hover:bg-[#FF000033]"
//                   onClick={handleDelete}
//                 >
//                   <Trash2 size={16} className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400" />
//                   <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Delete
//                   </span>
//                 </div>
//                 <div
//                   className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
//                   onClick={handlePDFPrint}
//                 >
//                   <Printer size={16} className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400" />
//                   <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Print
//                   </span>
//                 </div>
//                 <div
//                   title=""
//                   className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
//                   onClick={handlePDFDownload}
//                 >
//                   <Download size={16} className="text-green-600 dark:text-green-500 cursor-pointer hover:text-[#0cd968] dark:hover:text-[#0cd968] hover:text-green-700 dark:hover:text-green-400" />
//                   <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Download
//                   </span>
//                 </div>
//                 <div
//                   title=""
//                   className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
//                   onClick={handleExport}
//                 >
//                   <FileDown size={16} className="text-purple-600 dark:text-purple-500 hover:text-purple-700 dark:hover:text-purple-400 cursor-pointer hover:text-[#0cd968] dark:hover:text-[#0cd968]" />
//                   <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Export
//                   </span>
//                 </div>
//               </div>
//             </div>
//             {invoiceData.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">
//                 No invoices found. Generate a new bill to get started.
//               </div>
//             ) : (
//               <>
//                 <div className="overflow-hidden rounded-lg">
//                   <table className="w-full border-collapse min-w-[800px]">
//                     <thead className="bg-gray-200 dark:bg-[#091810] h-[52px] text-left text-sm text-[#0EFF7B] dark:text-[#0EFF7B]">
//                       <tr>
//                         <th className="px-3 py-3 w-10">
//                           <input
//                             type="checkbox"
//                             checked={selectAll}
//                             onChange={handleSelectAll}
//                             className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
//                           />
//                         </th>
//                         <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort("id")}>
//                           Invoice ID {sortColumn === "id" && (sortOrder === "asc" ? "↑" : "↓")}
//                         </th>
//                         <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort("patientName")}>
//                           Patient Name {sortColumn === "patientName" && (sortOrder === "asc" ? "↑" : "↓")}
//                         </th>
//                         <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort("department")}>
//                           Department {sortColumn === "department" && (sortOrder === "asc" ? "↑" : "↓")}
//                         </th>
//                         <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort("amount")}>
//                           Amount {sortColumn === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
//                         </th>
//                         <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort("paymentMethod")}>
//                           Payment Method {sortColumn === "paymentMethod" && (sortOrder === "asc" ? "↑" : "↓")}
//                         </th>
//                         <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort("status")}>
//                           Status {sortColumn === "status" && (sortOrder === "asc" ? "↑" : "↓")}
//                         </th>
//                         <th className="px-3 py-3">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="text-sm">
//                       {displayedData.map((row) => (
//                         <tr
//                           key={row.id}
//                           className="h-[62px] bg-gray-100 dark:bg-black border-b border-gray-300 dark:border-[#1E1E1E] hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
//                         >
//                           <td className="px-3 py-3">
//                             <input
//                               type="checkbox"
//                               checked={selectAll || selectedRows.includes(row.id)}
//                               onChange={() => handleRowSelect(row.id)}
//                               className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
//                             />
//                           </td>
//                           <td className="px-3 py-3 text-black dark:text-white">
//                             {row.id}
//                             <br />
//                             <span className="text-gray-600 dark:text-gray-400 text-xs">{row.date}</span>
//                           </td>
//                           <td className="px-3 py-3 text-black dark:text-white">
//                             {row.patientName}
//                             <br />
//                             <span className="text-gray-600 dark:text-gray-400 text-xs">{row.patientId}</span>
//                           </td>
//                           <td className="px-3 py-3 text-black dark:text-white">{row.department}</td>
//                           <td className="px-3 py-3 text-black dark:text-white">{row.amount}</td>
//                           <td className="px-3 py-3 text-black dark:text-white">{row.paymentMethod}</td>
//                           <td className={`px-3 py-3 font-medium ${getStatusColor(row.status)}`}>
//                             {row.status}
//                           </td>
//                           <td className="px-3 py-3">
//                             <div
//   className="relative group w-8 h-8 flex items-center justify-center rounded-full
//              border border-[#08994A1A] dark:border-[#0EFF7B1A]
//              bg-[#08994A1A] dark:bg-[#0EFF7B1A] cursor-pointer"
//   onClick={() => handleViewInvoice(row.id)}
// >
//   <Eye
//     size={16}
//     className="text-[#08994A] dark:text-[#0EFF7B]
//                hover:text-[#0cd968] dark:hover:text-[#0cd968]"
//   />

//   <span
//     className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                px-3 py-1 text-xs rounded-md shadow-md
//                bg-gray-100 dark:bg-black text-black dark:text-white
//                opacity-0 group-hover:opacity-100
//                transition-all duration-150"
//   >
//     View
//   </span>
// </div>


//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//                 <div className="flex items-center h-full mt-4 bg-gray-100 dark:bg-black p-4 rounded gap-x-4 dark:border-[#1E1E1E]">
//                   <div className="text-sm text-black dark:text-white">
//                     Page{" "}
//                     <span className="text-[#08994A] dark:text-[#0EFF7B]">{currentPage}</span>{" "}
//                     of {totalPages} ({indexOfFirst + 1} to{" "}
//                     {Math.min(indexOfLast, filteredData.length)} from{" "}
//                     {filteredData.length} Invoices)
//                   </div>
//                   <div className="flex items-center gap-x-2">
//                     <button
//                       onClick={handlePrevPage}
//                       disabled={currentPage === 1}
//                       className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
//                         currentPage === 1
//                           ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
//                           : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
//                       }`}
//                     >
//                       <ChevronLeft size={12} className="text-[#08994A] dark:text-white" />
//                     </button>
//                     <button
//                       onClick={handleNextPage}
//                       disabled={currentPage === totalPages}
//                       className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
//                         currentPage === totalPages
//                           ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
//                           : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
//                       }`}
//                     >
//                       <ChevronRight size={12} className="text-[#08994A] dark:text-white" />
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </>
//         )}
//       </div>
      
//     <div className="w-full bg-gray-100 dark:bg-transparent mt-7 rounded-xl p-4 md:p-6 overflow-x-auto border border-[#0EFF7B] dark:border-[#3C3C3C]">
//         {hospitalError && (
//           <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 p-4 rounded mb-4">
//             <p>{hospitalError}</p>
//             <button onClick={fetchHospitalInvoices} className="mt-2 text-sm underline">Retry</button>
//           </div>
//         )}
//         {hospitalLoading ? (
//           <div className="text-center p-4">Loading hospital invoices...</div>
//         ) : (
//           <>
//             <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
//               <span className="text-black dark:text-white text-base font-medium">Hospital Invoices</span>

//               <div className="flex items-center gap-2">
//                 {/* Search */}
//                 <div className="relative group flex items-center gap-2 bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full w-full sm:w-auto">
//                   <Search size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
//                   <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Search
//                   </span>
//                   <input
//                     type="text"
//                     placeholder="Search..."
//                     className="bg-transparent outline-none text-sm text-black dark:text-white flex-1 min-w-[120px] placeholder-[#5CD592] dark:placeholder-[#5CD592] focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]"
//                     value={hospitalSearchTerm}
//                     onChange={(e) => setHospitalSearchTerm(e.target.value)}
//                   />
//                 </div>

//                 {/* Filter */}
//                 <div
//                   className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
//                   onClick={handleHospitalFilter}
//                 >
//                   <Filter size={16} className="text-[#0EFF7B] dark:text-[#0EFF7B] hover:text-[#08994A] dark:hover:text-[#0EFF7B]" />
//                   <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Filter
//                   </span>
//                 </div>

//                 {/* Delete */}
//                 <div
//                   className="relative group flex items-center justify-center bg-[#FF00001A] dark:bg-[#FF00001A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#FF000033] dark:hover:bg-[#FF000033]"
//                   onClick={handleHospitalDelete}
//                 >
//                   <Trash2 size={16} className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400" />
//                   <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Delete
//                   </span>
//                 </div>

//                 {/* Print */}
//                 <div
//                   className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
//                   onClick={handleHospitalPDFPrint}
//                 >
//                   <Printer size={16} className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400" /><span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Print
//                   </span>
//                 </div>

//                 {/* Download PDF */}
//                 <div
//                   className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
//                   onClick={handleHospitalPDFDownload}
//                 >
//                   <Download size={16} className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400" />
//                   <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Download
//                   </span>
//                 </div>

//                 {/* Export CSV/Excel */}
//                 <div
//                   className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
//                   onClick={handleHospitalExport}
//                 >
//                   <FileDown size={16} className="text-purple-600 dark:text-purple-500 hover:text-purple-700 dark:hover:text-purple-400" />
//                   <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Export
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {hospitalInvoiceData.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">
//                 No invoices found. Generate a new bill to get started.
//               </div>
//             ) : (
//               <>
//                 <div className="overflow-hidden rounded-lg">
//                   <table className="w-full border-collapse min-w-[800px]">
//                     <thead className="bg-gray-200 dark:bg-[#091810] h-[52px] text-left text-sm text-[#0EFF7B] dark:text-[#0EFF7B]">
//                       <tr>
//                         <th className="px-3 py-3 w-10">
//                           <input
//                             type="checkbox"
//                             checked={hospitalSelectAll}
//                             onChange={handleHospitalSelectAll}
//                             className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
//                           />
//                         </th>
//                         <th className="px-3 py-3 cursor-pointer" onClick={() => handleHospitalSort("id")}>
//                           Invoice ID {hospitalSortColumn === "id" && (hospitalSortOrder === "asc" ? "↑" : "↓")}
//                         </th>
//                         <th className="px-3 py-3 cursor-pointer" onClick={() => handleHospitalSort("patientName")}>
//                           Patient Name {hospitalSortColumn === "patientName" && (hospitalSortOrder === "asc" ? "↑" : "↓")}
//                         </th>
//                         <th className="px-3 py-3 cursor-pointer" onClick={() => handleHospitalSort("department")}>
//                           Department {hospitalSortColumn === "department" && (hospitalSortOrder === "asc" ? "↑" : "↓")}
//                         </th>
//                         <th className="px-3 py-3 cursor-pointer" onClick={() => handleHospitalSort("amount")}>
//                           Amount {hospitalSortColumn === "amount" && (hospitalSortOrder === "asc" ? "↑" : "↓")}
//                         </th>
//                         <th className="px-3 py-3 cursor-pointer" onClick={() => handleHospitalSort("paymentMethod")}>
//                           Payment Method {hospitalSortColumn === "paymentMethod" && (hospitalSortOrder === "asc" ? "↑" : "↓")}
//                         </th>
//                         <th className="px-3 py-3 cursor-pointer" onClick={() => handleHospitalSort("status")}>
//                           Status {hospitalSortColumn === "status" && (hospitalSortOrder === "asc" ? "↑" : "↓")}
//                         </th>
//                         <th className="px-3 py-3">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="text-sm">
//                       {displayedHospitalData.map((row) => (
//                         <tr
//                           key={row.id}
//                           className="h-[62px] bg-gray-100 dark:bg-black border-b border-gray-300 dark:border-[#1E1E1E] hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
//                         >
//                           <td className="px-3 py-3">
//                             <input
//                               type="checkbox"
//                               checked={hospitalSelectAll || selectedHospitalRows.includes(row.id)}
//                               onChange={() => handleHospitalRowSelect(row.id)}
//                               className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
//                             />
//                           </td>
//                           <td className="px-3 py-3 text-black dark:text-white">
//                             {row.id}
//                             <br />
//                             <span className="text-gray-600 dark:text-gray-400 text-xs">{row.date}</span>
//                           </td>
//                           <td className="px-3 py-3 text-black dark:text-white">
//                             {row.patientName}
//                             <br />
//                             <span className="text-gray-600 dark:text-gray-400 text-xs">{row.patientId}</span>
//                           </td>
//                           <td className="px-3 py-3 text-black dark:text-white">{row.department}</td>
//                           <td className="px-3 py-3 text-black dark:text-white">{row.amount}</td>
//                           <td className="px-3 py-3 text-black dark:text-white">{row.paymentMethod}</td>
//                           <td className={`px-3 py-3 font-medium ${getStatusColor(row.status)}`}>
//                             {row.status}
//                           </td>
//                           <td className="px-3 py-3">
//                             <div
//   className="relative group w-8 h-8 flex items-center justify-center rounded-full
//              border border-[#08994A1A] dark:border-[#0EFF7B1A]
//              bg-[#08994A1A] dark:bg-[#0EFF7B1A] cursor-pointer"
//   onClick={() => handleHospitalViewInvoice(row.id)}
// >
//   <Eye
//     size={16}
//     className="text-[#08994A] dark:text-[#0EFF7B]
//                hover:text-[#0cd968] dark:hover:text-[#0cd968]"
//   />

//   <span
//     className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                px-3 py-1 text-xs rounded-md shadow-md
//                bg-gray-100 dark:bg-black text-black dark:text-white
//                opacity-0 group-hover:opacity-100
//                transition-all duration-150"
//   >
//     View
//   </span>
// </div>

//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 <div className="flex items-center h-full mt-4 bg-gray-100 dark:bg-black p-4 rounded gap-x-4 dark:border-[#1E1E1E]">
//                   <div className="text-sm text-black dark:text-white">
//                     Page{" "}
//                     <span className="text-[#08994A] dark:text-[#0EFF7B]">{hospitalCurrentPage}</span>{" "}
//                     of {hospitalTotalPages} ({hospitalIndexOfFirst + 1} to{" "}
//                     {Math.min(hospitalIndexOfLast, filteredHospitalData.length)} from{" "}
//                     {filteredHospitalData.length} Invoices)
//                   </div>
//                   <div className="flex items-center gap-x-2">
//                     <button
//                       onClick={handleHospitalPrevPage}
//                       disabled={hospitalCurrentPage === 1}
//                       className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
//                         hospitalCurrentPage === 1
//                           ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
//                           : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
//                       }`}
//                     >
//                       <ChevronLeft size={12} className="text-[#08994A] dark:text-white" />
//                     </button>
//                     <button
//                       onClick={handleHospitalNextPage}
//                       disabled={hospitalCurrentPage === hospitalTotalPages}
//                       className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
//                         hospitalCurrentPage === hospitalTotalPages
//                           ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
//                           : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
//                       }`}
//                     >
//                       <ChevronRight size={12} className="text-[#08994A] dark:text-white" />
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </>
//         )}
//       </div>

//       {showDeletePopup && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//           <div className="rounded-[20px] p-[1px]">
//             <div className="w-[400px] bg-gray-100 dark:bg-[#000000] rounded-[19px] p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md font-sans">
//               <div
//                 style={{
//                   position: "absolute",
//                   inset: 0,
//                   borderRadius: "20px",
//                   padding: "2px",
//                   background:
//                     "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//                   WebkitMask:
//                     "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//                   WebkitMaskComposite: "xor",
//                   maskComposite: "exclude",
//                   pointerEvents: "none",
//                   zIndex: 0,
//                 }}
//               ></div>
//               <div className="flex justify-between items-center pb-3 mb-4">
//                 <h3 className="text-lg font-semibold text-black dark:text-[#0EFF7B]">
//                   {selectedRows.length === 1 ? "Delete Invoice" : "Delete Invoices"}
//                 </h3>
//                 <button
//                   onClick={() => setShowDeletePopup(false)}
//                   className="text-[#08994A] dark:text-[#0EFF7B] hover:bg-[#0EFF7B33] dark:hover:bg-[#0EFF7B33] p-1 rounded-full"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//               <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
//                 {selectedRows.length === 1
//                   ? `Are you sure you want to delete invoice ${
//                       invoiceData.find((item) => item.id === selectedRows[0])?.id
//                     }?`
//                   : `Are you sure you want to delete ${selectedRows.length} invoice(s)?`}
//                 <br />
//                 This action cannot be undone.
//               </p>
//               <div className="flex justify-end gap-4">
//                 <button
//                   onClick={() => setShowDeletePopup(false)}
//                   className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] text-black dark:text-white font-medium hover:bg-[#0EFF7B1A] dark:hover:bg-[#3A3A3A]"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={confirmDelete}
//                   className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#FF4D4D] to-[#B30000] text-white font-medium hover:scale-105 transition"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showHospitalDeletePopup && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//           <div className="rounded-[20px] p-[1px]">
//             <div className="w-[400px] bg-gray-100 dark:bg-[#000000] rounded-[19px] p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md font-sans">
//               <div
//                 style={{
//                   position: "absolute",
//                   inset: 0,
//                   borderRadius: "20px",
//                   padding: "2px",
//                   background:
//                     "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//                   WebkitMask:
//                     "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//                   WebkitMaskComposite: "xor",
//                   maskComposite: "exclude",
//                   pointerEvents: "none",
//                   zIndex: 0,
//                 }}
//               ></div>
//               <div className="flex justify-between items-center pb-3 mb-4">
//                 <h3 className="text-lg font-semibold text-black dark:text-[#0EFF7B]">
//                   {selectedHospitalRows.length === 1 ? "Delete Invoice" : "Delete Invoices"}
//                 </h3>
//                 <button
//                   onClick={() => setShowHospitalDeletePopup(false)}
//                   className="text-[#08994A] dark:text-[#0EFF7B] hover:bg-[#0EFF7B33] dark:hover:bg-[#0EFF7B33] p-1 rounded-full"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//               <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
//                 {selectedHospitalRows.length === 1
//                   ? `Are you sure you want to delete invoice ${
//                       hospitalInvoiceData.find((item) => item.id === selectedHospitalRows[0])?.id
//                     }?`
//                   : `Are you sure you want to delete ${selectedHospitalRows.length} invoice(s)?`}
//                 <br />
//                 This action cannot be undone.
//               </p>
//               <div className="flex justify-end gap-4">
//                 <button
//                   onClick={() => setShowHospitalDeletePopup(false)}
//                   className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] text-black dark:text-white font-medium hover:bg-[#0EFF7B1A] dark:hover:bg-[#3A3A3A]"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={confirmHospitalDelete}
//                   className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#FF4D4D] to-[#B30000] text-white font-medium hover:scale-105 transition"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showFilterPopup && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//           <div
//             className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
//             bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70
//             dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]"
//           >
//             <div
//               className="w-[505px] rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               <div className="flex justify-between items-center pb-3 mb-4">
//                 <h2
//                   className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   Filter Invoices
//                 </h2>
//                 <button
//                   onClick={() => setShowFilterPopup(false)}
//                   className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
//                 >
//                   <X size={16} className="text-black dark:text-white" />
//                 </button>
//               </div>
//               <div className="grid grid-cols-2 gap-6">
//                 <Dropdown
//                   label="Status"
//                   value={filterStatus}
//                   onChange={setFilterStatus}
//                   options={statusOptions}
//                 />
//                 <div>
//                   <label
//                     className="text-sm text-black dark:text-white"
//                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                   >
//                     Invoice Date
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="date"
//                       value={filterDate}
//                       onChange={(e) => setFilterDate(e.target.value)}
//                       className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none"
//                     />
//                     <Calendar
//                       size={18}
//                       className="absolute right-3 top-3.5 text-black dark:text-[#0EFF7B] pointer-events-none"
//                     />
//                   </div>
//                 </div>
//                 <Dropdown
//                   label="Department"
//                   value={filterDepartment}
//                   onChange={setFilterDepartment}
//                   options={departmentOptions}
//                 />
//                 <Dropdown
//                   label="Payment Method"
//                   value={filterPaymentMethod}
//                   onChange={setFilterPaymentMethod}
//                   options={paymentMethodOptions}
//                 />
//               </div>
//               <div className="flex justify-center gap-4 mt-8">
//                 <button
//                   onClick={handleClearFilter}
//                   className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[14px] leading-[16px]"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleApplyFilter}
//                   className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   Update
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showHospitalFilterPopup && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//           <div
//             className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
//             bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70
//             dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]"
//           >
//             <div
//               className="w-[505px] rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               <div className="flex justify-between items-center pb-3 mb-4">
//                 <h2
//                   className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   Filter Hospital Invoices
//                 </h2>
//                 <button
//                   onClick={() => setShowHospitalFilterPopup(false)}
//                   className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
//                 >
//                   <X size={16} className="text-black dark:text-white" />
//                 </button>
//               </div>
//               <div className="grid grid-cols-2 gap-6">
//                 <Dropdown
//                   label="Status"
//                   value={hospitalFilterStatus}
//                   onChange={setHospitalFilterStatus}
//                   options={statusOptions}
//                 />
//                 <div>
//                   <label
//                     className="text-sm text-black dark:text-white"
//                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                   >
//                     Invoice Date
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="date"
//                       value={hospitalFilterDate}
//                       onChange={(e) => setHospitalFilterDate(e.target.value)}
//                       className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none"
//                     />
//                     <Calendar
//                       size={18}
//                       className="absolute right-3 top-3.5 text-black dark:text-[#0EFF7B] pointer-events-none"
//                     />
//                   </div>
//                 </div>
//                 <Dropdown
//                   label="Department"
//                   value={hospitalFilterDepartment}
//                   onChange={setHospitalFilterDepartment}
//                   options={departmentOptions}
//                 />
//                 <Dropdown
//                   label="Payment Method"
//                   value={hospitalFilterPaymentMethod}
//                   onChange={setHospitalFilterPaymentMethod}
//                   options={paymentMethodOptions}
//                 />
//               </div>
//               <div className="flex justify-center gap-4 mt-8">
//                 <button
//                   onClick={handleHospitalClearFilter}
//                   className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[14px] leading-[16px]"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleHospitalApplyFilter}
//                   className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   Update
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showExportPopup && (
//   <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//     <div className="rounded-[20px] p-[1px]">
//       <div className="w-[420px] bg-gray-100 dark:bg-[#000000] rounded-[19px] p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md font-sans relative">
//         {/* Gradient Border */}
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             borderRadius: "20px",
//             padding: "2px",
//             background: "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//             WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//             WebkitMaskComposite: "xor",
//             maskComposite: "exclude",
//             pointerEvents: "none",
//             zIndex: 0,
//           }}
//         ></div>

//         <div className="flex justify-between items-center pb-3 mb-4">
//           <h3 className="text-lg font-semibold text-black dark:text-[#0EFF7B]">
//             Export Invoices
//           </h3>
//           <button
//             onClick={() => setShowExportPopup(false)}
//             className="text-[#08994A] dark:text-[#0EFF7B] hover:bg-[#0EFF7B33] p-1 rounded-full transition"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <p className="text-gray-600 dark:text-gray-300 mb-8 text-sm">
//           Choose your preferred format to export all invoices.
//         </p>

//         <div className="grid grid-cols-2 gap-4">
//           <button
//             onClick={downloadExcel}
//             className="h-[100px] rounded-[12px] border-2 border-[#0EFF7B] dark:border-[#0EFF7B80] bg-gradient-to-br from-[#08994A10] to-transparent hover:from-[#08994A20] transition-all flex flex-col items-center justify-center gap-2 group"
//           >
//             <div className="w-12 h-12 bg-[#0EFF7B20] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
//               <Download size={24} className="text-[#08994A] dark:text-[#0EFF7B]" />
//             </div>
//             <span className="font-medium text-black dark:text-white">Excel (.xlsx)</span>
//           </button>

//           <button
//             onClick={downloadCSV}
//             className="h-[100px] rounded-[12px] border-2 border-[#0EFF7B] dark:border-[#0EFF7B80] bg-gradient-to-br from-[#08994A10] to-transparent hover:from-[#08994A20] transition-all flex flex-col items-center justify-center gap-2 group"
//           >
//             <div className="w-12 h-12 bg-[#0EFF7B20] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
//               <Download size={24} className="text-[#08994A] dark:text-[#0EFF7B]" />
//             </div>
//             <span className="font-medium text-black dark:text-white">CSV (.csv)</span>
//           </button>
//         </div>

//         <div className="mt-6 flex justify-center">
//           <button
//             onClick={() => setShowExportPopup(false)}
//             className="px-6 py-2 text-sm border border-gray-300 dark:border-[#3A3A3A] rounded-[8px] hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33] transition"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// )}

// {showHospitalExportPopup && (
//   <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//     <div className="rounded-[20px] p-[1px]">
//       <div className="w-[420px] bg-gray-100 dark:bg-[#000000] rounded-[19px] p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md font-sans relative">
//         {/* Gradient Border */}
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             borderRadius: "20px",
//             padding: "2px",
//             background: "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//             WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//             WebkitMaskComposite: "xor",
//             maskComposite: "exclude",
//             pointerEvents: "none",
//             zIndex: 0,
//           }}
//         ></div>

//         <div className="flex justify-between items-center pb-3 mb-4">
//           <h3 className="text-lg font-semibold text-black dark:text-[#0EFF7B]">
//             Export Hospital Invoices
//           </h3>
//           <button
//             onClick={() => setShowHospitalExportPopup(false)}
//             className="text-[#08994A] dark:text-[#0EFF7B] hover:bg-[#0EFF7B33] p-1 rounded-full transition"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <p className="text-gray-600 dark:text-gray-300 mb-8 text-sm">
//           Choose your preferred format to export all hospital invoices.
//         </p>

//         <div className="grid grid-cols-2 gap-4">
//           <button
//             onClick={downloadHospitalExcel}
//             className="h-[100px] rounded-[12px] border-2 border-[#0EFF7B] dark:border-[#0EFF7B80] bg-gradient-to-br from-[#08994A10] to-transparent hover:from-[#08994A20] transition-all flex flex-col items-center justify-center gap-2 group"
//           >
//             <div className="w-12 h-12 bg-[#0EFF7B20] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
//               <Download size={24} className="text-[#08994A] dark:text-[#0EFF7B]" />
//             </div>
//             <span className="font-medium text-black dark:text-white">Excel (.xlsx)</span>
//           </button>

//           <button
//             onClick={downloadHospitalCSV}
//             className="h-[100px] rounded-[12px] border-2 border-[#0EFF7B] dark:border-[#0EFF7B80] bg-gradient-to-br from-[#08994A10] to-transparent hover:from-[#08994A20] transition-all flex flex-col items-center justify-center gap-2 group"
//           >
//             <div className="w-12 h-12 bg-[#0EFF7B20] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
//               <Download size={24} className="text-[#08994A] dark:text-[#0EFF7B]" />
//             </div>
//             <span className="font-medium text-black dark:text-white">CSV (.csv)</span>
//           </button>
//         </div>

//         <div className="mt-6 flex justify-center">
//           <button
//             onClick={() => setShowHospitalExportPopup(false)}
//             className="px-6 py-2 text-sm border border-gray-300 dark:border-[#3A3A3A] rounded-[8px] hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33] transition"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// )}
//     </div>
//   );
// };
// export default BillingManagement;


import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  Settings,
  Printer,
  Download,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  ChevronDown,
  Calendar,
  FileDown,
  BarChart3,
  Activity,
} from "lucide-react";
import { Listbox } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { successToast, errorToast } from "../../components/Toast.jsx";
import api from "../../utils/axiosConfig";

// ==================== COMPONENTS ====================

const Dropdown = ({ label, value, onChange, options, error }) => (
  <div>
    <label className="text-sm text-black dark:text-white">{label}</label>
    <Listbox value={value || "Select"} onChange={onChange}>
      <div className="relative mt-1 w-[228px]">
        <Listbox.Button
          className="w-full h-[33px] px-3 pr-8 rounded-full border border-[#0EFF7B] dark:border-[#0D0D0D]
          bg-gray-100 dark:bg-black text-[#08994A] dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]
          focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]"
        >
          {value || "Select"}
          <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]" />
          </span>
        </Listbox.Button>
        <Listbox.Options
          className="absolute mt-1 w-full max-h-40 overflow-auto rounded-[12px] bg-gray-100 dark:bg-black
          shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] no-scroll"
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
                `cursor-pointer select-none py-2 px-2 text-sm rounded-md
                ${
                  active
                    ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
                    : "text-black dark:text-white"
                }
                ${
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

// ==================== HELPER FUNCTIONS ====================

// Helper function to check if a date is today
const isToday = (dateString) => {
  if (!dateString) return false;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Handle different date formats
    let invoiceDate;
    if (typeof dateString === 'string') {
      // Try to parse the date string
      invoiceDate = new Date(dateString);
      if (isNaN(invoiceDate.getTime())) {
        // If parsing fails, try different formats
        const parts = dateString.split('-');
        if (parts.length === 3) {
          invoiceDate = new Date(parts[0], parts[1] - 1, parts[2]);
        }
      }
    } else if (dateString instanceof Date) {
      invoiceDate = dateString;
    }
    
    if (!invoiceDate || isNaN(invoiceDate.getTime())) {
      console.warn(`Invalid date format: ${dateString}`);
      return false;
    }
    
    invoiceDate.setHours(0, 0, 0, 0);
    return invoiceDate.getTime() === today.getTime();
  } catch (error) {
    console.error("Error in isToday function:", error, "Date string:", dateString);
    return false;
  }
};

// Helper function to format date for comparison
const formatDateForComparison = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// ==================== MAIN COMPONENT ====================

const BillingManagement = () => {
  // ========== STATE VARIABLES ==========
  
  // Pharmacy States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [invoiceData, setInvoiceData] = useState([]);
  const [totalBillsToday, setTotalBillsToday] = useState(0);
  const [insuranceClaims, setInsuranceClaims] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExportPopup, setShowExportPopup] = useState(false);
  
  // Hospital States
  const [hospitalInvoiceData, setHospitalInvoiceData] = useState([]);
  const [hospitalSearchTerm, setHospitalSearchTerm] = useState("");
  const [hospitalSelectAll, setHospitalSelectAll] = useState(false);
  const [selectedHospitalRows, setSelectedHospitalRows] = useState([]);
  const [hospitalCurrentPage, setHospitalCurrentPage] = useState(1);
  const [hospitalSortColumn, setHospitalSortColumn] = useState(null);
  const [hospitalSortOrder, setHospitalSortOrder] = useState("asc");
  const [showHospitalDeletePopup, setShowHospitalDeletePopup] = useState(false);
  const [showHospitalFilterPopup, setShowHospitalFilterPopup] = useState(false);
  const [hospitalFilterStatus, setHospitalFilterStatus] = useState("");
  const [hospitalFilterDepartment, setHospitalFilterDepartment] = useState("");
  const [hospitalFilterPaymentMethod, setHospitalFilterPaymentMethod] = useState("");
  const [hospitalFilterDate, setHospitalFilterDate] = useState("");
  const [showHospitalExportPopup, setShowHospitalExportPopup] = useState(false);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  const [hospitalError, setHospitalError] = useState(null);
  const [hospitalTotalBillsToday, setHospitalTotalBillsToday] = useState(0);
  const [hospitalInsuranceClaims, setHospitalInsuranceClaims] = useState(0);
  
  const navigate = useNavigate();
  
  // ========== CONSTANTS ==========
  
  const statusOptions = ["All", "Paid", "Unpaid"];
  const departmentOptions = [
    "All",
    "Cardiology",
    "Radiology",
    "Oncology",
    "Emergency",
    "Neurology",
    "Orthopedics",
    "Dermatology",
  ];
  const paymentMethodOptions = ["All", "Insurance", "Cash", "Credit Card", "None"];
  
  // ========== STATISTICS CALCULATION ==========
  
  const calculateStatistics = useCallback((data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { todayCount: 0, insuranceCount: 0 };
    }

    // Calculate bills generated today
    const todayCount = data.filter(item => {
      if (!item.date) return false;
      return isToday(item.date);
    }).length;

    // Calculate insurance claims - FIXED VERSION
    const insuranceCount = data.filter(item => {
      const paymentMethod = item.paymentMethod?.toString().toLowerCase() || '';
      const status = item.status?.toString().toLowerCase() || '';
      
      // Count as insurance claim if:
      // 1. Payment method contains "insurance" 
      // 2. Status contains "insurance"
      // 3. Payment method is exactly "insurance"
      // 4. Case-insensitive check
      return paymentMethod.includes('insurance') || 
             status.includes('insurance') || 
             paymentMethod === 'insurance' ||
             item.paymentMethod === "Insurance" ||
             item.paymentMethod === "INSURANCE";
    }).length;

    return { todayCount, insuranceCount };
  }, []);

  // ========== API FUNCTIONS ==========

  const handleExport = () => {
    setShowExportPopup(true);
  };

  const downloadExcel = async () => {
    try {
      const response = await api.get("/billing/export/excel", {
        responseType: "blob"
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "pharmacy_invoices.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      successToast("Excel file downloaded successfully");
      setShowExportPopup(false);
    } catch (err) {
      errorToast(err.response?.data?.detail || "Failed to download Excel file");
    }
  };

  const downloadCSV = async () => {
    try {
      const response = await api.get("/billing/export/csv", {
        responseType: "blob"
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "pharmacy_invoices.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      successToast("CSV file downloaded successfully");
      setShowExportPopup(false);
    } catch (err) {
      errorToast(err.response?.data?.detail || "Failed to download CSV file");
    }
  };

  // Hospital export functions
  const handleHospitalExport = () => {
    setShowHospitalExportPopup(true);
  };

  const downloadHospitalExcel = async () => {
    try {
      const response = await api.get("/hospital-billing/export/excel", {
        responseType: "blob"
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "hospital_invoices.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      successToast("Excel file downloaded successfully");
      setShowHospitalExportPopup(false);
    } catch (err) {
      errorToast(err.response?.data?.detail || "Failed to download Excel file");
    }
  };

  const downloadHospitalCSV = async () => {
    try {
      const response = await api.get("/hospital-billing/export/csv", {
        responseType: "blob"
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "hospital_invoices.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      successToast("CSV file downloaded successfully");
      setShowHospitalExportPopup(false);
    } catch (err) {
      errorToast(err.response?.data?.detail || "Failed to download CSV file");
    }
  };

  // ========== DATA FETCHING ==========

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/billing/");
      
      console.log("=== PHARMACY INVOICE DATA ===");
      console.log("API Response:", response.status);
      console.log("Data type:", typeof response.data);
      
      let data = [];
      if (typeof response.data === 'string') {
        console.warn("response.data is a string, attempting to parse as JSON");
        try {
          const parsed = JSON.parse(response.data);
          if (Array.isArray(parsed)) {
            data = parsed;
          } else {
            console.error("Parsed data is not an array:", parsed);
            throw new Error("Invalid response format");
          }
        } catch (parseErr) {
          console.error("Failed to parse string as JSON:", parseErr);
          throw new Error("Response is not valid JSON");
        }
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else {
        console.error("Expected array, got:", typeof response.data, response.data);
        throw new Error("Invalid response format");
      }

      // DEBUG: Log sample data to check payment_method field
      console.log("Pharmacy invoices count:", data.length);
      if (data.length > 0) {
        console.log("Sample pharmacy invoice (first 3):", data.slice(0, 3));
      }
      
      const mappedData = data.map((inv, index) => {
        // Debug payment method
        console.log(`Pharmacy Invoice ${index}: payment_method = "${inv.payment_method}"`);
        
        return {
          id: inv.invoice_id,
          date: inv.date,
          patientName: inv.patient_name,
          patientId: inv.patient_id,
          department: inv.department,
          amount: `$${inv.amount?.toFixed(2) || "0.00"}`,
          paymentMethod: inv.payment_method || "-",
          status: inv.status,
          rawAmount: inv.amount,
          rawPaymentMethod: inv.payment_method
        };
      });
      
      setInvoiceData(mappedData);

      // Calculate statistics
      const stats = calculateStatistics(mappedData);
      setTotalBillsToday(stats.todayCount);
      setInsuranceClaims(stats.insuranceCount);

      console.log(`Pharmacy Statistics: Today's Bills: ${stats.todayCount}, Insurance Claims: ${stats.insuranceCount}`);
      
      // Debug: List all insurance invoices
      const insuranceInvoices = mappedData.filter(item => {
        const pm = item.paymentMethod?.toString().toLowerCase() || '';
        return pm.includes('insurance') || pm === 'insurance';
      });
      console.log(`Found ${insuranceInvoices.length} pharmacy insurance invoices:`, insuranceInvoices);
      
    } catch (err) {
      console.error("Error fetching pharmacy invoices:", err.response?.data || err.message);
      setError(`Failed to fetch invoices: ${err.response?.data?.detail || err.message}. Check console for details.`);
      setInvoiceData([]);
      setTotalBillsToday(0);
      setInsuranceClaims(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitalInvoices = async () => {
    try {
      setHospitalLoading(true);
      setHospitalError(null);
      const response = await api.get("/hospital-billing/");

      console.log("=== HOSPITAL INVOICE DATA ===");
      console.log("API Response:", response.status);
      console.log("Data type:", typeof response.data);

      let data = [];
      if (typeof response.data === 'string') {
        console.warn("Hospital response.data is a string, attempting to parse as JSON");
        try {
          const parsed = JSON.parse(response.data);
          if (Array.isArray(parsed)) {
            data = parsed;
          } else {
            console.error("Parsed hospital data is not an array:", parsed);
            throw new Error("Invalid response format");
          }
        } catch (parseErr) {
          console.error("Failed to parse hospital string as JSON:", parseErr);
          throw new Error("Response is not valid JSON");
        }
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else {
        console.error("Expected array for hospital, got:", typeof response.data, response.data);
        throw new Error("Invalid response format");
      }

      // DEBUG: Log hospital invoice data
      console.log("Hospital invoices count:", data.length);
      if (data.length > 0) {
        console.log("Sample hospital invoice (first 3):", data.slice(0, 3));
      }

      const mappedData = data.map((inv, index) => {
        // Debug payment method
        console.log(`Hospital Invoice ${index}: payment_method = "${inv.payment_method}"`);
        
        return {
          id: inv.invoice_id,
          date: inv.date,
          patientName: inv.patient_name,
          patientId: inv.patient_id,
          department: inv.department,
          amount: `$${inv.amount?.toFixed(2) || "0.00"}`,
          paymentMethod: inv.payment_method || "-",
          status: inv.status,
          rawAmount: inv.amount,
          rawPaymentMethod: inv.payment_method
        };
      });
      
      setHospitalInvoiceData(mappedData);

      // Calculate hospital-specific statistics
      const stats = calculateStatistics(mappedData);
      setHospitalTotalBillsToday(stats.todayCount);
      setHospitalInsuranceClaims(stats.insuranceCount);

      console.log(`Hospital Statistics: Today's Bills: ${stats.todayCount}, Insurance Claims: ${stats.insuranceCount}`);
      
      // Debug: List all hospital insurance invoices
      const hospitalInsuranceInvoices = mappedData.filter(item => {
        const pm = item.paymentMethod?.toString().toLowerCase() || '';
        return pm.includes('insurance') || pm === 'insurance';
      });
      console.log(`Found ${hospitalInsuranceInvoices.length} hospital insurance invoices:`, hospitalInsuranceInvoices);
      
    } catch (err) {
      console.error("Error fetching hospital invoices:", err.response?.data || err.message);
      setHospitalError(`Failed to fetch hospital invoices: ${err.response?.data?.detail || err.message}.`);
      setHospitalInvoiceData([]);
      setHospitalTotalBillsToday(0);
      setHospitalInsuranceClaims(0);
    } finally {
      setHospitalLoading(false);
    }
  };

  // ========== USE EFFECTS ==========

  useEffect(() => {
    fetchInvoices();
    fetchHospitalInvoices();
  }, []);

  // Recalculate statistics when invoice data changes
  useEffect(() => {
    if (invoiceData.length > 0) {
      const stats = calculateStatistics(invoiceData);
      setTotalBillsToday(stats.todayCount);
      setInsuranceClaims(stats.insuranceCount);
    }
  }, [invoiceData, calculateStatistics]);

  useEffect(() => {
    if (hospitalInvoiceData.length > 0) {
      const stats = calculateStatistics(hospitalInvoiceData);
      setHospitalTotalBillsToday(stats.todayCount);
      setHospitalInsuranceClaims(stats.insuranceCount);
    }
  }, [hospitalInvoiceData, calculateStatistics]);

  // ========== DATA PROCESSING ==========

  // Pharmacy Data Processing
  const filteredData = invoiceData.filter((item) => {
    const matchesSearch = Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus && filterStatus !== "All" ? item.status === filterStatus : true;
    const matchesDepartment = filterDepartment && filterDepartment !== "All"
      ? item.department === filterDepartment
      : true;
    const matchesPaymentMethod = filterPaymentMethod && filterPaymentMethod !== "All"
      ? item.paymentMethod === (filterPaymentMethod === "None" ? "-" : filterPaymentMethod)
      : true;
    const matchesDate = filterDate ? formatDateForComparison(item.date) === filterDate : true;
    return matchesSearch && matchesStatus && matchesDepartment && matchesPaymentMethod && matchesDate;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const valA = a[sortColumn];
    const valB = b[sortColumn];
    if (sortColumn === "amount") {
      const numA = parseFloat(valA.replace("$", "")) || 0;
      const numB = parseFloat(valB.replace("$", "")) || 0;
      return sortOrder === "asc" ? numA - numB : numB - numA;
    }
    return sortOrder === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const indexOfFirst = (currentPage - 1) * itemsPerPage;
  const indexOfLast = currentPage * itemsPerPage;
  const displayedData = sortedData.slice(indexOfFirst, indexOfLast);

  // Hospital Data Processing
  const filteredHospitalData = hospitalInvoiceData.filter((item) => {
    const matchesSearch = Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(hospitalSearchTerm.toLowerCase());
    const matchesStatus = hospitalFilterStatus && hospitalFilterStatus !== "All" ? item.status === hospitalFilterStatus : true;
    const matchesDepartment = hospitalFilterDepartment && hospitalFilterDepartment !== "All"
      ? item.department === hospitalFilterDepartment
      : true;
    const matchesPaymentMethod = hospitalFilterPaymentMethod && hospitalFilterPaymentMethod !== "All"
      ? item.paymentMethod === (hospitalFilterPaymentMethod === "None" ? "-" : hospitalFilterPaymentMethod)
      : true;
    const matchesDate = hospitalFilterDate ? formatDateForComparison(item.date) === hospitalFilterDate : true;
    return matchesSearch && matchesStatus && matchesDepartment && matchesPaymentMethod && matchesDate;
  });

  const sortedHospitalData = [...filteredHospitalData].sort((a, b) => {
    if (!hospitalSortColumn) return 0;
    const valA = a[hospitalSortColumn];
    const valB = b[hospitalSortColumn];
    if (hospitalSortColumn === "amount") {
      const numA = parseFloat(valA.replace("$", "")) || 0;
      const numB = parseFloat(valB.replace("$", "")) || 0;
      return hospitalSortOrder === "asc" ? numA - numB : numB - numA;
    }
    return hospitalSortOrder === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const hospitalItemsPerPage = 10;
  const hospitalTotalPages = Math.ceil(filteredHospitalData.length / hospitalItemsPerPage) || 1;
  const hospitalIndexOfFirst = (hospitalCurrentPage - 1) * hospitalItemsPerPage;
  const hospitalIndexOfLast = hospitalCurrentPage * hospitalItemsPerPage;
  const displayedHospitalData = sortedHospitalData.slice(hospitalIndexOfFirst, hospitalIndexOfLast);

  // ========== EVENT HANDLERS ==========

  // Sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const handleHospitalSort = (column) => {
    if (hospitalSortColumn === column) {
      setHospitalSortOrder(hospitalSortOrder === "asc" ? "desc" : "asc");
    } else {
      setHospitalSortColumn(column);
      setHospitalSortOrder("asc");
    }
  };

  // Selection
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedRows(selectAll ? [] : displayedData.map((row) => row.id));
  };

  const handleHospitalSelectAll = () => {
    setHospitalSelectAll(!hospitalSelectAll);
    setSelectedHospitalRows(hospitalSelectAll ? [] : displayedHospitalData.map((row) => row.id));
  };

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    );
  };

  const handleHospitalRowSelect = (id) => {
    setSelectedHospitalRows((prev) =>
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    );
  };

  // Pagination
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleHospitalPrevPage = () => {
    setHospitalCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleHospitalNextPage = () => {
    setHospitalCurrentPage((prev) => Math.min(hospitalTotalPages, prev + 1));
  };

  // Navigation
  const handleGenerateBill = () => {
    console.log("Generate Bill button clicked");
    navigate("/BillingPreview");
  };

  // View Invoices
  const handleViewInvoice = (invoiceId) => {
    window.open(`${api.defaults.baseURL}/invoices/${invoiceId}.pdf`, "_blank");
  };

  const handleHospitalViewInvoice = (invoiceId) => {
    window.open(`${api.defaults.baseURL}/invoices_generator/${invoiceId}.pdf`, "_blank");
  };

  // PDF Download
  const handlePDFDownload = async () => {
    if (selectedRows.length === 0) {
      errorToast("Please select at least one invoice to download.");
      return;
    }
    try {
      console.log("Downloading PDFs for IDs:", selectedRows);
      const response = await api.post("/billing/download-selected", 
        { ids: selectedRows }, 
        { 
          responseType: "blob"
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "selected_pharmacy_invoices.zip");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      successToast(`Successfully downloaded ${selectedRows.length} invoice(s)`);
    } catch (err) {
      console.error("Error downloading PDFs:", err.response?.data || err.message);
      errorToast(err.response?.data?.detail || "Failed to download PDFs. Please check if the files exist on the server.");
    }
  };

  const handleHospitalPDFDownload = async () => {
    if (selectedHospitalRows.length === 0) {
      errorToast("Please select at least one invoice to download.");
      return;
    }
    try {
      console.log("Downloading hospital PDFs for IDs:", selectedHospitalRows);
      const response = await api.post("/hospital-billing/download-selected", 
        { ids: selectedHospitalRows }, 
        { 
          responseType: "blob"
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "selected_hospital_invoices.zip");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      successToast(`Successfully downloaded ${selectedHospitalRows.length} invoice(s)`);
    } catch (err) {
      console.error("Error downloading hospital PDFs:", err.response?.data || err.message);
      errorToast(err.response?.data?.detail || "Failed to download PDFs. Please check if the files exist on the server.");
    }
  };

  // PDF Print
  const handlePDFPrint = async () => {
    if (selectedRows.length === 0) {
      errorToast("Please select an invoice to print.");
      return;
    }
    if (selectedRows.length > 1) {
      errorToast("Please select only one invoice to print.");
      return;
    }

    const invoiceId = selectedRows[0];
    try {
      const response = await api.get(`/invoices/${invoiceId}.pdf`, {
        responseType: "blob"
      });
      
      const blob = response.data;
      const pdfUrl = URL.createObjectURL(blob);
      
      const printWindow = window.open(pdfUrl, '_blank');
      
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
      
    } catch (err) {
      console.error("Error loading PDF for printing:", err);
      errorToast("Failed to load PDF for printing. The file might not exist.");
    }
  };

  const handleHospitalPDFPrint = async () => {
    if (selectedHospitalRows.length === 0) {
      errorToast("Please select an invoice to print.");
      return;
    }
    if (selectedHospitalRows.length > 1) {
      errorToast("Please select only one invoice to print.");
      return;
    }

    const invoiceId = selectedHospitalRows[0];

    try {
      const pdfUrl = `${api.defaults.baseURL}/invoices_generator/${invoiceId}.pdf`;

      const response = await api.get(`/invoices_generator/${invoiceId}.pdf`, {
        responseType: "blob",
      });

      const blob = response.data;
      const url = URL.createObjectURL(blob);

      const printWindow = window.open(url, "_blank");

      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            try {
              printWindow.print();
            } catch (e) {
              console.error("Print failed:", e);
            }
          }, 800);
        };
      } else {
        window.open(pdfUrl, "_blank");
        setTimeout(() => {
          alert("Please use browser print (Ctrl+P) if print dialog didn't open.");
        }, 1500);
      }

      successToast("Opening invoice for printing...");
    } catch (err) {
      console.error("Error preparing hospital invoice for print:", err);
      errorToast(
        err.response?.status === 404
          ? "PDF file not found on server"
          : "Failed to load invoice for printing"
      );
    }
  };

  // Filter
  const handleFilter = () => {
    setShowFilterPopup(true);
  };

  const handleHospitalFilter = () => {
    setShowHospitalFilterPopup(true);
  };

  // Delete
  const handleDelete = () => {
    if (selectedRows.length > 0) {
      setShowDeletePopup(true);
    } else {
      errorToast("Please select at least one invoice to delete.");
    }
  };

  const handleHospitalDelete = () => {
    if (selectedHospitalRows.length > 0) {
      setShowHospitalDeletePopup(true);
    } else {
      errorToast("Please select at least one invoice to delete.");
    }
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedRows) {
        await api.delete(`/billing/${id}`);
      }
      setSelectedRows([]);
      setSelectAll(false);
      setShowDeletePopup(false);
      await fetchInvoices(); // Refresh data
      successToast(`Successfully deleted ${selectedRows.length} invoice(s)`);
    } catch (err) {
      console.error("Error deleting invoices:", err);
      errorToast(err.response?.data?.detail || "Failed to delete some invoices.");
    }
  };

  const confirmHospitalDelete = async () => {
    try {
      for (const id of selectedHospitalRows) {
        await api.delete(`/hospital-billing/${id}`);
      }
      setSelectedHospitalRows([]);
      setHospitalSelectAll(false);
      setShowHospitalDeletePopup(false);
      await fetchHospitalInvoices(); // Refresh data
      successToast(`Successfully deleted ${selectedHospitalRows.length} invoice(s)`);
    } catch (err) {
      console.error("Error deleting hospital invoices:", err);
      errorToast(err.response?.data?.detail || "Failed to delete some invoices.");
    }
  };

  // Apply/Clear Filters
  const handleApplyFilter = () => {
    setShowFilterPopup(false);
    setCurrentPage(1);
    successToast("Filters applied successfully");
  };

  const handleHospitalApplyFilter = () => {
    setShowHospitalFilterPopup(false);
    setHospitalCurrentPage(1);
    successToast("Filters applied successfully");
  };

  const handleClearFilter = () => {
    setFilterStatus("");
    setFilterDepartment("");
    setFilterPaymentMethod("");
    setFilterDate("");
    setShowFilterPopup(false);
    setCurrentPage(1);
    successToast("Filters cleared");
  };

  const handleHospitalClearFilter = () => {
    setHospitalFilterStatus("");
    setHospitalFilterDepartment("");
    setHospitalFilterPaymentMethod("");
    setHospitalFilterDate("");
    setShowHospitalFilterPopup(false);
    setHospitalCurrentPage(1);
    successToast("Filters cleared");
  };

  // Share
  const handleShare = (id) => {
    console.log(`Share button clicked for invoice ${id}`);
  };

  // Status Color
  const getStatusColor = (status) => {
    if (status === "Paid") return "text-green-600 dark:text-green-500";
    if (status === "Unpaid") return "text-orange-600 dark:text-orange-500";
    return "text-gray-600 dark:text-gray-400";
  };

  // // Debug Function
  // const runDebugChecks = () => {
  //   console.log("=== DEBUG BILLING DATA ===");
  //   console.log("Pharmacy invoices:", invoiceData.length);
  //   console.log("Hospital invoices:", hospitalInvoiceData.length);
    
  //   const pharmacyInsurance = invoiceData.filter(item => {
  //     const pm = item.paymentMethod?.toString().toLowerCase() || '';
  //     return pm.includes('insurance') || pm === 'insurance';
  //   });
    
  //   const hospitalInsurance = hospitalInvoiceData.filter(item => {
  //     const pm = item.paymentMethod?.toString().toLowerCase() || '';
  //     return pm.includes('insurance') || pm === 'insurance';
  //   });
    
  //   console.log("Pharmacy insurance invoices:", pharmacyInsurance.length);
  //   console.log("Hospital insurance invoices:", hospitalInsurance.length);
    
  //   const pharmacyToday = invoiceData.filter(item => isToday(item.date));
  //   const hospitalToday = hospitalInvoiceData.filter(item => isToday(item.date));
    
  //   console.log("Pharmacy today's bills:", pharmacyToday.length);
  //   console.log("Hospital today's bills:", hospitalToday.length);
    
  //   // Show sample of insurance invoices
  //   if (pharmacyInsurance.length > 0) {
  //     console.log("Sample pharmacy insurance invoice:", pharmacyInsurance[0]);
  //   }
  //   if (hospitalInsurance.length > 0) {
  //     console.log("Sample hospital insurance invoice:", hospitalInsurance[0]);
  //   }
    
  //   successToast("Debug data logged to console");
  // };

  // ========== RENDER ==========

  return (
    <div className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-4 w-full max-w-[2500px] mx-auto flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative font-[Helvetica]">
      
      {/* Gradient Backgrounds */}
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
      
      {/* Debug Button */}
      {/* <button 
        onClick={runDebugChecks}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded z-50 opacity-50 hover:opacity-100 text-xs"
        style={{zIndex: 1000}}
      >
        Debug Data
      </button> */}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mt-4 mb-6 relative z-10">
        <h1 className="text-[20px] font-medium text-black dark:text-white">
          Billing Management
        </h1>
        <button
          onClick={handleGenerateBill}
          className="w-[200px] h-[40px] flex items-center justify-center bg-[linear-gradient(92.18deg,#025126_3.26%,#0D7F41_50.54%,#025126_97.83%)] border-b-[2px] border-[#0EFF7B] shadow-[0px_2px_12px_0px_#00000040] hover:opacity-90 text-white font-semibold px-4 py-2 rounded-[8px] transition duration-300 ease-in-out"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          + Generate Bill
        </button>
      </div>

      {/* Statistics Dashboard */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6 relative z-10">
        <div className="flex flex-col gap-8 flex-1">
          {/* Combined Totals Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-gradient-to-r from-[#02512610] to-[#0D7F4110] dark:from-[#0EFF7B1A] dark:to-[#0D0D0D] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Activity size={20} className="text-[#08994A] dark:text-[#0EFF7B]" />
                <span className="font-medium text-[18px] text-black dark:text-white">
                  Total Bills Today
                </span>
              </div>
              <span className="text-[#08994A] dark:text-[#0EFF7B] text-[32px] font-bold">
                {totalBillsToday + hospitalTotalBillsToday}
              </span>
              <div className="flex justify-between text-sm mt-3">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#08994A] dark:bg-[#0EFF7B]"></div>
                  <span className="text-gray-600 dark:text-gray-400">Pharmacy: {totalBillsToday}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#0D7F41]"></div>
                  <span className="text-gray-600 dark:text-gray-400">Hospital: {hospitalTotalBillsToday}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-gradient-to-r from-[#02512610] to-[#0D7F4110] dark:from-[#0EFF7B1A] dark:to-[#0D0D0D] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 size={20} className="text-[#08994A] dark:text-[#0EFF7B]" />
                <span className="font-medium text-[18px] text-black dark:text-white">
                  Total Insurance Claims
                </span>
              </div>
              <span className="text-[#08994A] dark:text-[#0EFF7B] text-[32px] font-bold">
                {insuranceClaims + hospitalInsuranceClaims}
              </span>
              <div className="flex justify-between text-sm mt-3">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#08994A] dark:bg-[#0EFF7B]"></div>
                  <span className="text-gray-600 dark:text-gray-400">Pharmacy: {insuranceClaims}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#0D7F41]"></div>
                  <span className="text-gray-600 dark:text-gray-400">Hospital: {hospitalInsuranceClaims}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pharmacy Today */}
            <div className="flex flex-col rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-black dark:text-white opacity-80">
                  Pharmacy Bills Today
                </span>
                <span className="text-[#08994A] dark:text-[#0EFF7B] text-[24px] font-bold">
                  {totalBillsToday}
                </span>
              </div>
            </div>
            
            {/* Hospital Today */}
            <div className="flex flex-col rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-black dark:text-white opacity-80">
                  Hospital Bills Today
                </span>
                <span className="text-[#08994A] dark:text-[#0EFF7B] text-[24px] font-bold">
                  {hospitalTotalBillsToday}
                </span>
              </div>
            </div>
            
            {/* Pharmacy Insurance */}
            <div className="flex flex-col rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-black dark:text-white opacity-80">
                  Pharmacy Insurance
                </span>
                <span className="text-[#08994A] dark:text-[#0EFF7B] text-[24px] font-bold">
                  {insuranceClaims}
                </span>
              </div>
            </div>
            
            {/* Hospital Insurance */}
            <div className="flex flex-col rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-black dark:text-white opacity-80">
                  Hospital Insurance
                </span>
                <span className="text-[#08994A] dark:text-[#0EFF7B] text-[24px] font-bold">
                  {hospitalInsuranceClaims}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Validation & Controls Panel */}
        <div className="w-full lg:w-[280px] flex flex-col gap-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] p-4 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-gray-300 dark:border-[#3C3C3C]">
            <span className="text-[#6E92FF] dark:text-[#0EFF7B] text-sm font-semibold">
              VALIDATION & CONTROLS
            </span>
            <Settings size={16} className="text-gray-600 dark:text-gray-400" />
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-3 mt-2">
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-600 dark:text-green-500" /> 
              Payment method validation
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-red-600 dark:text-red-500" /> 
              No negative billing amounts
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-gray-600 dark:text-gray-400" /> 
              Duplicate bill prevention
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-600 dark:text-green-500" /> 
              Refund handling
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-blue-600 dark:text-blue-500" /> 
              Insurance claim tracking
            </li>
          </ul>
        </div>
      </div>

      {/* Pharmacy Invoices Section */}
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-3">
          <h2 className="text-black dark:text-white text-lg font-semibold">Pharmacy Invoices</h2>
        </div>
        
        <div className="w-full bg-gray-100 dark:bg-transparent rounded-xl p-4 md:p-6 overflow-x-auto border border-[#0EFF7B] dark:border-[#3C3C3C] mb-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 p-4 rounded mb-4">
              <p>{error}</p>
              <button onClick={fetchInvoices} className="mt-2 text-sm underline">Retry</button>
            </div>
          )}
          
          {loading ? (
            <div className="text-center p-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0EFF7B]"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading pharmacy invoices...</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-black dark:text-white text-base font-medium">
                    {filteredData.length} Invoice{filteredData.length !== 1 ? 's' : ''} Found
                  </span>
                  {insuranceClaims > 0 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {insuranceClaims} Insurance Claim{insuranceClaims !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative group flex items-center gap-2 bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full w-full sm:w-auto">
                    <Search size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
                    <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                      Search
                    </span>
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      className="bg-transparent outline-none text-sm text-black dark:text-white flex-1 min-w-[120px] placeholder-[#5CD592] dark:placeholder-[#5CD592] focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Filter */}
                  <div
                    className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
                    onClick={handleFilter}
                  >
                    <Filter size={16} className="text-[#0EFF7B] dark:text-[#0EFF7B]" />
                    <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                      Filter
                    </span>
                  </div>

                  {/* Delete */}
                  <div
                    className="relative group flex items-center justify-center bg-[#FF00001A] dark:bg-[#FF00001A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#FF000033] dark:hover:bg-[#FF000033]"
                    onClick={handleDelete}
                  >
                    <Trash2 size={16} className="text-red-600 dark:text-red-500" />
                    <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                      Delete
                    </span>
                  </div>

                  {/* Print */}
                  <div
                    className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
                    onClick={handlePDFPrint}
                  >
                    <Printer size={16} className="text-blue-600 dark:text-blue-500" />
                    <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                      Print
                    </span>
                  </div>

                  {/* Download PDF */}
                  <div
                    className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
                    onClick={handlePDFDownload}
                  >
                    <Download size={16} className="text-green-600 dark:text-green-500" />
                    <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                      Download
                    </span>
                  </div>

                  {/* Export */}
                  <div
                    className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
                    onClick={handleExport}
                  >
                    <FileDown size={16} className="text-purple-600 dark:text-purple-500" />
                    <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                      Export
                    </span>
                  </div>
                </div>
              </div>

              {/* Table */}
              {invoiceData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] flex items-center justify-center">
                    <FileDown size={24} className="text-[#08994A] dark:text-[#0EFF7B]" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No invoices found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Generate a new bill to get started</p>
                  <button
                    onClick={handleGenerateBill}
                    className="mt-4 px-4 py-2 bg-[#08994A] dark:bg-[#0EFF7B] text-white rounded-lg hover:opacity-90 transition"
                  >
                    + Generate First Bill
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden rounded-lg">
                    <table className="w-full border-collapse min-w-[800px]">
                      <thead className="bg-gray-200 dark:bg-[#091810] h-[52px] text-left text-sm text-[#0EFF7B] dark:text-[#0EFF7B]">
                        <tr>
                          <th className="px-3 py-3 w-10">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                            />
                          </th>
                          <th className="px-3 py-3 cursor-pointer hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33] rounded-l" onClick={() => handleSort("id")}>
                            Invoice ID {sortColumn === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-3 py-3 cursor-pointer hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]" onClick={() => handleSort("patientName")}>
                            Patient Name {sortColumn === "patientName" && (sortOrder === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-3 py-3 cursor-pointer hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]" onClick={() => handleSort("department")}>
                            Department {sortColumn === "department" && (sortOrder === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-3 py-3 cursor-pointer hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]" onClick={() => handleSort("amount")}>
                            Amount {sortColumn === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-3 py-3 cursor-pointer hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]" onClick={() => handleSort("paymentMethod")}>
                            Payment Method {sortColumn === "paymentMethod" && (sortOrder === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-3 py-3 cursor-pointer hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]" onClick={() => handleSort("status")}>
                            Status {sortColumn === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-3 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {displayedData.map((row) => (
                          <tr
                            key={row.id}
                            className="h-[62px] bg-gray-100 dark:bg-black border-b border-gray-300 dark:border-[#1E1E1E] hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D] transition-colors"
                          >
                            <td className="px-3 py-3">
                              <input
                                type="checkbox"
                                checked={selectAll || selectedRows.includes(row.id)}
                                onChange={() => handleRowSelect(row.id)}
                                className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                              />
                            </td>
                            <td className="px-3 py-3 text-black dark:text-white">
                              <div className="font-medium">{row.id}</div>
                              <div className="text-gray-600 dark:text-gray-400 text-xs">{row.date}</div>
                            </td>
                            <td className="px-3 py-3 text-black dark:text-white">
                              <div className="font-medium">{row.patientName}</div>
                              <div className="text-gray-600 dark:text-gray-400 text-xs">{row.patientId}</div>
                            </td>
                            <td className="px-3 py-3 text-black dark:text-white">{row.department}</td>
                            <td className="px-3 py-3 text-black dark:text-white font-medium">{row.amount}</td>
                            <td className="px-3 py-3 text-black dark:text-white">
                              <div className="flex items-center gap-2">
                                {row.paymentMethod}
                                {row.paymentMethod?.toLowerCase().includes('insurance') && (
                                  <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                    Insurance
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className={`px-3 py-3 font-medium ${getStatusColor(row.status)}`}>
                              {row.status}
                            </td>
                            <td className="px-3 py-3">
                              <div
                                className="relative group w-8 h-8 flex items-center justify-center rounded-full
                                           border border-[#08994A1A] dark:border-[#0EFF7B1A]
                                           bg-[#08994A1A] dark:bg-[#0EFF7B1A] cursor-pointer
                                           hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33] transition"
                                onClick={() => handleViewInvoice(row.id)}
                              >
                                <Eye size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
                                <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                                               px-3 py-1 text-xs rounded-md shadow-md
                                               bg-gray-100 dark:bg-black text-black dark:text-white
                                               opacity-0 group-hover:opacity-100
                                               transition-all duration-150">
                                  View
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between h-full mt-4 bg-gray-100 dark:bg-transparent p-4 rounded gap-x-4 dark:border-[#1E1E1E]">
                    <div className="text-sm text-black dark:text-white">
                      Page{" "}
                      <span className="text-[#08994A] dark:text-[#0EFF7B] font-medium">{currentPage}</span>{" "}
                      of {totalPages} ({indexOfFirst + 1} to{" "}
                      {Math.min(indexOfLast, filteredData.length)} from{" "}
                      {filteredData.length} Invoices)
                    </div>
                    <div className="flex items-center gap-x-2">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`w-8 h-8 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
                          currentPage === 1
                            ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50 cursor-not-allowed"
                            : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
                        } transition`}
                      >
                        <ChevronLeft size={14} className="text-[#08994A] dark:text-black" />
                      </button>
                      <div className="flex items-center gap-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                                currentPage === pageNum
                                  ? "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black font-medium"
                                  : "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white hover:bg-[#0EFF7B33] dark:hover:bg-[#0EFF7B33]"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`w-8 h-8 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
                          currentPage === totalPages
                            ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50 cursor-not-allowed"
                            : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
                        } transition`}
                      >
                        <ChevronRight size={14} className="text-[#08994A] dark:text-black" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hospital Invoices Section */}
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-3">
          <h2 className="text-black dark:text-white text-lg font-semibold">Hospital Invoices</h2>
        </div>
        
        <div className="w-full bg-gray-100 dark:bg-transparent rounded-xl p-4 md:p-6 overflow-x-auto border border-[#0EFF7B] dark:border-[#3C3C3C]">
          {hospitalError && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 p-4 rounded mb-4">
              <p>{hospitalError}</p>
              <button onClick={fetchHospitalInvoices} className="mt-2 text-sm underline">Retry</button>
            </div>
          )}
          
          {hospitalLoading ? (
            <div className="text-center p-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0EFF7B]"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading hospital invoices...</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-black dark:text-white text-base font-medium">
                    {filteredHospitalData.length} Invoice{filteredHospitalData.length !== 1 ? 's' : ''} Found
                  </span>
                  {hospitalInsuranceClaims > 0 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {hospitalInsuranceClaims} Insurance Claim{hospitalInsuranceClaims !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative group flex items-center gap-2 bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full w-full sm:w-auto">
                    <Search size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
                    <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                      Search
                    </span>
                    <input
                      type="text"
                      placeholder="Search hospital invoices..."
                      className="bg-transparent outline-none text-sm text-black dark:text-white flex-1 min-w-[120px] placeholder-[#5CD592] dark:placeholder-[#5CD592] focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]"
                      value={hospitalSearchTerm}
                      onChange={(e) => setHospitalSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Filter */}
                  <div
                    className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
                    onClick={handleHospitalFilter}
                  >
                    <Filter size={16} className="text-[#0EFF7B] dark:text-[#0EFF7B]" />
                    <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                      Filter
                    </span>
                  </div>

                  {/* Delete */}
                  <div
                    className="relative group flex items-center justify-center bg-[#FF00001A] dark:bg-[#FF00001A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#FF000033] dark:hover:bg-[#FF000033]"
                    onClick={handleHospitalDelete}
                  >
                    <Trash2 size={16} className="text-red-600 dark:text-red-500" />
                    <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                      Delete
                    </span>
                  </div>

                  {/* Print */}
                  <div
                    className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
                    onClick={handleHospitalPDFPrint}
                  >
                    <Printer size={16} className="text-blue-600 dark:text-blue-500" />
                    <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                      Print
                    </span>
                  </div>

                  {/* Download PDF */}
                  <div
                    className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
                    onClick={handleHospitalPDFDownload}
                  >
                    <Download size={16} className="text-green-600 dark:text-green-500" />
                    <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                      Download
                    </span>
                  </div>

                  {/* Export */}
                  <div
                    className="relative group flex items-center justify-center bg-[#08994A1A] dark:bg-[#0EFF7B1A] px-3 py-2 rounded-full cursor-pointer hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33]"
                    onClick={handleHospitalExport}
                  >
                    <FileDown size={16} className="text-purple-600 dark:text-purple-500" />
                    <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                      Export
                    </span>
                  </div>
                </div>
              </div>

              {/* Table */}
              {hospitalInvoiceData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] flex items-center justify-center">
                    <FileDown size={24} className="text-[#08994A] dark:text-[#0EFF7B]" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No hospital invoices found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Generate a hospital bill to get started</p>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden rounded-lg">
                    <table className="w-full border-collapse min-w-[800px]">
                      <thead className="bg-gray-200 dark:bg-[#091810] h-[52px] text-left text-sm text-[#0EFF7B] dark:text-[#0EFF7B]">
                        <tr>
                          <th className="px-3 py-3 w-10">
                            <input
                              type="checkbox"
                              checked={hospitalSelectAll}
                              onChange={handleHospitalSelectAll}
                              className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                            />
                          </th>
                          <th className="px-3 py-3 cursor-pointer hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33] rounded-l" onClick={() => handleHospitalSort("id")}>
                            Invoice ID {hospitalSortColumn === "id" && (hospitalSortOrder === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-3 py-3 cursor-pointer hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]" onClick={() => handleHospitalSort("patientName")}>
                            Patient Name {hospitalSortColumn === "patientName" && (hospitalSortOrder === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-3 py-3 cursor-pointer hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]" onClick={() => handleHospitalSort("department")}>
                            Department {hospitalSortColumn === "department" && (hospitalSortOrder === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-3 py-3 cursor-pointer hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]" onClick={() => handleHospitalSort("amount")}>
                            Amount {hospitalSortColumn === "amount" && (hospitalSortOrder === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-3 py-3 cursor-pointer hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]" onClick={() => handleHospitalSort("paymentMethod")}>
                            Payment Method {hospitalSortColumn === "paymentMethod" && (hospitalSortOrder === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-3 py-3 cursor-pointer hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]" onClick={() => handleHospitalSort("status")}>
                            Status {hospitalSortColumn === "status" && (hospitalSortOrder === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-3 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {displayedHospitalData.map((row) => (
                          <tr
                            key={row.id}
                            className="h-[62px] bg-gray-100 dark:bg-black border-b border-gray-300 dark:border-[#1E1E1E] hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D] transition-colors"
                          >
                            <td className="px-3 py-3">
                              <input
                                type="checkbox"
                                checked={hospitalSelectAll || selectedHospitalRows.includes(row.id)}
                                onChange={() => handleHospitalRowSelect(row.id)}
                                className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                              />
                            </td>
                            <td className="px-3 py-3 text-black dark:text-white">
                              <div className="font-medium">{row.id}</div>
                              <div className="text-gray-600 dark:text-gray-400 text-xs">{row.date}</div>
                            </td>
                            <td className="px-3 py-3 text-black dark:text-white">
                              <div className="font-medium">{row.patientName}</div>
                              <div className="text-gray-600 dark:text-gray-400 text-xs">{row.patientId}</div>
                            </td>
                            <td className="px-3 py-3 text-black dark:text-white">{row.department}</td>
                            <td className="px-3 py-3 text-black dark:text-white font-medium">{row.amount}</td>
                            <td className="px-3 py-3 text-black dark:text-white">
                              <div className="flex items-center gap-2">
                                {row.paymentMethod}
                                {row.paymentMethod?.toLowerCase().includes('insurance') && (
                                  <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                    Insurance
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className={`px-3 py-3 font-medium ${getStatusColor(row.status)}`}>
                              {row.status}
                            </td>
                            <td className="px-3 py-3">
                              <div
                                className="relative group w-8 h-8 flex items-center justify-center rounded-full
                                           border border-[#08994A1A] dark:border-[#0EFF7B1A]
                                           bg-[#08994A1A] dark:bg-[#0EFF7B1A] cursor-pointer
                                           hover:bg-[#08994A33] dark:hover:bg-[#0EFF7B33] transition"
                                onClick={() => handleHospitalViewInvoice(row.id)}
                              >
                                <Eye size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
                                <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                                               px-3 py-1 text-xs rounded-md shadow-md
                                               bg-gray-100 dark:bg-black text-black dark:text-white
                                               opacity-0 group-hover:opacity-100
                                               transition-all duration-150">
                                  View
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between h-full mt-4 bg-gray-100 dark:bg-transparent p-4 rounded gap-x-4 dark:border-[#1E1E1E]">
                    <div className="text-sm text-black dark:text-white">
                      Page{" "}
                      <span className="text-[#08994A] dark:text-[#0EFF7B] font-medium">{hospitalCurrentPage}</span>{" "}
                      of {hospitalTotalPages} ({hospitalIndexOfFirst + 1} to{" "}
                      {Math.min(hospitalIndexOfLast, filteredHospitalData.length)} from{" "}
                      {filteredHospitalData.length} Invoices)
                    </div>
                    <div className="flex items-center gap-x-2">
                      <button
                        onClick={handleHospitalPrevPage}
                        disabled={hospitalCurrentPage === 1}
                        className={`w-8 h-8 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
                          hospitalCurrentPage === 1
                            ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50 cursor-not-allowed"
                            : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
                        } transition`}
                      >
                        <ChevronLeft size={14} className="text-[#08994A] dark:text-black" />
                      </button>
                      <div className="flex items-center gap-x-1">
                        {Array.from({ length: Math.min(5, hospitalTotalPages) }, (_, i) => {
                          let pageNum;
                          if (hospitalTotalPages <= 5) {
                            pageNum = i + 1;
                          } else if (hospitalCurrentPage <= 3) {
                            pageNum = i + 1;
                          } else if (hospitalCurrentPage >= hospitalTotalPages - 2) {
                            pageNum = hospitalTotalPages - 4 + i;
                          } else {
                            pageNum = hospitalCurrentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setHospitalCurrentPage(pageNum)}
                              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                                hospitalCurrentPage === pageNum
                                  ? "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black font-medium"
                                  : "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white hover:bg-[#0EFF7B33] dark:hover:bg-[#0EFF7B33]"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={handleHospitalNextPage}
                        disabled={hospitalCurrentPage === hospitalTotalPages}
                        className={`w-8 h-8 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
                          hospitalCurrentPage === hospitalTotalPages
                            ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50 cursor-not-allowed"
                            : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
                        } transition`}
                      >
                        <ChevronRight size={14} className="text-[#08994A] dark:text-black" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL POPUPS */}

      {/* Pharmacy Delete Popup */}
      {showDeletePopup && (
        <DeletePopup
          type="pharmacy"
          selectedIds={selectedRows}
          invoiceData={invoiceData}
          onClose={() => setShowDeletePopup(false)}
          onConfirm={confirmDelete}
        />
      )}

      {/* Hospital Delete Popup */}
      {showHospitalDeletePopup && (
        <DeletePopup
          type="hospital"
          selectedIds={selectedHospitalRows}
          invoiceData={hospitalInvoiceData}
          onClose={() => setShowHospitalDeletePopup(false)}
          onConfirm={confirmHospitalDelete}
        />
      )}

      {/* Pharmacy Filter Popup */}
      {showFilterPopup && (
        <FilterPopup
          type="pharmacy"
          status={filterStatus}
          setStatus={setFilterStatus}
          department={filterDepartment}
          setDepartment={setFilterDepartment}
          paymentMethod={filterPaymentMethod}
          setPaymentMethod={setFilterPaymentMethod}
          date={filterDate}
          setDate={setFilterDate}
          onClose={() => setShowFilterPopup(false)}
          onApply={handleApplyFilter}
          onClear={handleClearFilter}
          statusOptions={statusOptions}
          departmentOptions={departmentOptions}
          paymentMethodOptions={paymentMethodOptions}
        />
      )}

      {/* Hospital Filter Popup */}
      {showHospitalFilterPopup && (
        <FilterPopup
          type="hospital"
          status={hospitalFilterStatus}
          setStatus={setHospitalFilterStatus}
          department={hospitalFilterDepartment}
          setDepartment={setHospitalFilterDepartment}
          paymentMethod={hospitalFilterPaymentMethod}
          setPaymentMethod={setHospitalFilterPaymentMethod}
          date={hospitalFilterDate}
          setDate={setHospitalFilterDate}
          onClose={() => setShowHospitalFilterPopup(false)}
          onApply={handleHospitalApplyFilter}
          onClear={handleHospitalClearFilter}
          statusOptions={statusOptions}
          departmentOptions={departmentOptions}
          paymentMethodOptions={paymentMethodOptions}
        />
      )}

      {/* Pharmacy Export Popup */}
      {showExportPopup && (
        <ExportPopup
          type="pharmacy"
          onClose={() => setShowExportPopup(false)}
          onExcel={downloadExcel}
          onCSV={downloadCSV}
        />
      )}

      {/* Hospital Export Popup */}
      {showHospitalExportPopup && (
        <ExportPopup
          type="hospital"
          onClose={() => setShowHospitalExportPopup(false)}
          onExcel={downloadHospitalExcel}
          onCSV={downloadHospitalCSV}
        />
      )}
    </div>
  );
};

// ==================== REUSABLE MODAL COMPONENTS ====================

const DeletePopup = ({ type, selectedIds, invoiceData, onClose, onConfirm }) => {
  const invoiceType = type === "pharmacy" ? "Pharmacy" : "Hospital";
  const invoice = selectedIds.length === 1 ? invoiceData.find(item => item.id === selectedIds[0]) : null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
      <div className="rounded-[20px] p-[1px] w-full max-w-md">
        <div className="w-full bg-gray-100 dark:bg-[#000000] rounded-[19px] p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md font-sans relative">
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
            <h3 className="text-lg font-semibold text-black dark:text-[#0EFF7B]">
              {selectedIds.length === 1 ? `Delete ${invoiceType} Invoice` : `Delete ${selectedIds.length} ${invoiceType} Invoices`}
            </h3>
            <button
              onClick={onClose}
              className="text-[#08994A] dark:text-[#0EFF7B] hover:bg-[#0EFF7B33] dark:hover:bg-[#0EFF7B33] p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
            {selectedIds.length === 1
              ? `Are you sure you want to delete ${invoiceType} invoice ${invoice?.id}?`
              : `Are you sure you want to delete ${selectedIds.length} ${invoiceType.toLowerCase()} invoices?`}
            <br />
            <span className="text-red-500 dark:text-red-400 font-medium mt-2 block">This action cannot be undone.</span>
          </p>
          
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] text-black dark:text-white font-medium hover:bg-[#0EFF7B1A] dark:hover:bg-[#3A3A3A]"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#FF4D4D] to-[#B30000] text-white font-medium hover:scale-105 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterPopup = ({
  type,
  status,
  setStatus,
  department,
  setDepartment,
  paymentMethod,
  setPaymentMethod,
  date,
  setDate,
  onClose,
  onApply,
  onClear,
  statusOptions,
  departmentOptions,
  paymentMethodOptions
}) => {
  const invoiceType = type === "pharmacy" ? "Pharmacy" : "Hospital";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
      <div className="rounded-[20px] p-[1px] w-full max-w-lg">
        <div
          className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
            bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70
            dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)] w-full"
        >
          <div
            className="w-full rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            <div className="flex justify-between items-center pb-3 mb-4">
              <h2
                className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Filter {invoiceType} Invoices
              </h2>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
              >
                <X size={16} className="text-black dark:text-white" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Dropdown
                label="Status"
                value={status}
                onChange={setStatus}
                options={statusOptions}
              />
              <div>
                <label
                  className="text-sm text-black dark:text-white"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  Invoice Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none"
                  />
                  <Calendar
                    size={18}
                    className="absolute right-3 top-3.5 text-black dark:text-[#0EFF7B] pointer-events-none"
                  />
                </div>
              </div>
              <Dropdown
                label="Department"
                value={department}
                onChange={setDepartment}
                options={departmentOptions}
              />
              <Dropdown
                label="Payment Method"
                value={paymentMethod}
                onChange={setPaymentMethod}
                options={paymentMethodOptions}
              />
            </div>
            
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={onClear}
                className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[14px] leading-[16px]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Clear All
              </button>
              <button
                onClick={onApply}
                className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExportPopup = ({ type, onClose, onExcel, onCSV }) => {
  const invoiceType = type === "pharmacy" ? "Pharmacy" : "Hospital";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
      <div className="rounded-[20px] p-[1px] w-full max-w-md">
        <div className="w-full bg-gray-100 dark:bg-[#000000] rounded-[19px] p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md font-sans relative">
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "20px",
              padding: "2px",
              background: "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              pointerEvents: "none",
              zIndex: 0,
            }}
          ></div>

          <div className="flex justify-between items-center pb-3 mb-4">
            <h3 className="text-lg font-semibold text-black dark:text-[#0EFF7B]">
              Export {invoiceType} Invoices
            </h3>
            <button
              onClick={onClose}
              className="text-[#08994A] dark:text-[#0EFF7B] hover:bg-[#0EFF7B33] p-1 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-8 text-sm">
            Choose your preferred format to export all {invoiceType.toLowerCase()} invoices.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onExcel}
              className="h-[100px] rounded-[12px] border-2 border-[#0EFF7B] dark:border-[#0EFF7B80] bg-gradient-to-br from-[#08994A10] to-transparent hover:from-[#08994A20] transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 bg-[#0EFF7B20] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Download size={24} className="text-[#08994A] dark:text-[#0EFF7B]" />
              </div>
              <span className="font-medium text-black dark:text-white">Excel (.xlsx)</span>
            </button>

            <button
              onClick={onCSV}
              className="h-[100px] rounded-[12px] border-2 border-[#0EFF7B] dark:border-[#0EFF7B80] bg-gradient-to-br from-[#08994A10] to-transparent hover:from-[#08994A20] transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 bg-[#0EFF7B20] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Download size={24} className="text-[#08994A] dark:text-[#0EFF7B]" />
              </div>
              <span className="font-medium text-black dark:text-white">CSV (.csv)</span>
            </button>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm border border-gray-300 dark:border-[#3A3A3A] rounded-[8px] hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33] transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingManagement;