// import React, { useState, useEffect, useRef, useMemo } from "react";
// import { Listbox } from "@headlessui/react";
// import { successToast, errorToast } from "../../components/Toast";
// import {
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   ChevronDown,
//   MoreVertical,
//   Trash2,
//   DollarSign,
//   Filter,
//   Package,
//   AlertTriangle,
//   XCircle,
//   X,
//   Edit2,
// } from "lucide-react";
// import api from "../../utils/axiosConfig";

// const DeleteStockList = ({ onConfirm, onCancel, itemsToDelete }) => {
//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//       <div className="rounded-[20px] p-[1px] backdrop-blur-md ">
//         <div className="w-[400px] bg-gray-100 dark:bg-[#000000E5] rounded-[19px] p-5 relative">
//           <div
//             style={{
//               position: "absolute",
//               inset: 0,
//               borderRadius: "20px",
//               padding: "2px",
//               background:
//                 "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//               WebkitMask:
//                 "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//               WebkitMaskComposite: "xor",
//               maskComposite: "exclude",
//               pointerEvents: "none",
//               zIndex: 0,
//             }}
//           ></div>
//           <div className="relative z-10">
//             <div className="flex justify-between items-center mb-4">
//               <h2
//                 className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 Confirm Deletion
//               </h2>
//               <button
//                 onClick={onCancel}
//                 className="w-6 h-6 rounded-full border border-[#0EFF7B1A] dark:border-[#0EFF7B1A] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] flex items-center justify-center"
//               >
//                 <X size={16} className="text-[#08994A] dark:text-white" />
//               </button>
//             </div>
//             <p
//               className="text-sm text-black dark:text-white mb-6"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Are you sure you want to delete {itemsToDelete.length} item(s)?
//             </p>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={onCancel}
//                 className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#3C3C3C] text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] opacity-100 bg-black dark:bg-transparent dark:text-white"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={onConfirm}
//                 className="w-[144px] h-[32px] rounded-[8px] px-3 py-2 flex items-center justify-center
//      bg-gradient-to-r from-[#FF4D4D] to-[#B30000]
//      text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition shadow-[0_2px_12px_0px_#00000040]"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CloseConfirmPopup = ({ onConfirm, onCancel }) => (
//   <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//     <div className="rounded-[20px] p-[1px] backdrop-blur-md">
//       <div className="w-[400px] bg-gray-100 dark:bg-[#000000E5] rounded-[19px] p-5 relative">
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             borderRadius: "20px",
//             padding: "2px",
//             background:
//               "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//             WebkitMask:
//               "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//             WebkitMaskComposite: "xor",
//             maskComposite: "exclude",
//             pointerEvents: "none",
//             zIndex: 0,
//           }}
//         ></div>
//         <div className="relative z-10">
//           <div className="flex justify-between items-center mb-4">
//             <h2
//               className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Unsaved Changes
//             </h2>
//             <button
//               onClick={onCancel}
//               className="w-6 h-6 rounded-full border border-[#0EFF7B1A] dark:border-[#0EFF7B1A] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] flex items-center justify-center"
//             >
//               <X size={16} className="text-[#08994A] dark:text-white" />
//             </button>
//           </div>
//           <p
//             className="text-sm text-black dark:text-white mb-6"
//             style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//           >
//             You have unsaved changes. Are you sure you want to close?
//           </p>
//           <div className="flex justify-center gap-4">
//             <button
//               onClick={onCancel}
//               className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#3C3C3C] text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] opacity-100 bg-black dark:bg-transparent dark:text-white"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Continue Editing
//             </button>
//             <button
//               onClick={onConfirm}
//               className="w-[144px] h-[32px] rounded-[8px] px-3 py-2 flex items-center justify-center
//    bg-gradient-to-r from-[#FF4D4D] to-[#B30000]
//    text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition shadow-[0_2px_12px_0px_#00000040]"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Discard Changes
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// const StockInventory = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectAll, setSelectAll] = useState(false);
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [activeFilter, setActiveFilter] = useState("Today");
//   const [filterStatus, setFilterStatus] = useState("All");
//   const [showFilterPopup, setShowFilterPopup] = useState(false);
//   const [year, setYear] = useState("2025");
//   const [month, setMonth] = useState("Aug");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
//   const [sortColumn, setSortColumn] = useState(null);
//   const [sortOrder, setSortOrder] = useState("asc");
//   const [showAddStockPopup, setShowAddStockPopup] = useState(false);
//   const [showEditStockPopup, setShowEditStockPopup] = useState(false);
//   const [editStockId, setEditStockId] = useState(null);
//   const [showDeletePopup, setShowDeletePopup] = useState(false);
//   const [showSingleDeletePopup, setShowSingleDeletePopup] = useState(false);
//   const [singleDeleteId, setSingleDeleteId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [newStock, setNewStock] = useState({
//     product_name: "",
//     dosage: "",
//     category: "",
//     batch_number: "",
//     vendor: "",
//     vendor_id: "",
//     quantity: "",
//     item_code: "",
//     rack_no: "",
//     shelf_no: "",
//     unit_price: "",
//     status: "IN STOCK",
//   });
//   const [editStock, setEditStock] = useState({
//     product_name: "",
//     dosage: "",
//     category: "",
//     batch_number: "",
//     vendor: "",
//     vendor_id: "",
//     add_quantity: "",
//     item_code: "",
//     rack_no: "",
//     shelf_no: "",
//     unit_price: "",
//     status: "IN STOCK",
//   });
  
//   // NEW: Validation states following patient registration pattern
//   const [validationErrors, setValidationErrors] = useState({}); // Format errors (show while typing)
//   const [fieldErrors, setFieldErrors] = useState({}); // Required errors (show only after submission)
//   const [isSubmitted, setIsSubmitted] = useState(false);
  
//   const [inventoryData, setInventoryData] = useState([]);
//   const [openDropdownId, setOpenDropdownId] = useState(null);
//   const [isEditFormChanged, setIsEditFormChanged] = useState(false);
//   const [initialEditForm, setInitialEditForm] = useState(null);
//   const [showCloseConfirm, setShowCloseConfirm] = useState(false);
//   const [popupToClose, setPopupToClose] = useState(null);
//   const dropdownRefs = useRef({});
  
//   const categories = [
//     "Local Anesthesia",
//     "Antiseptics",
//     "Antibiotics",
//     "Anti-inflammatory",
//     "Analgesics",
//     "Steroid",
//     "Antifungal",
//   ];
  
//   const itemsPerPage = 9;

//   // Field length constraints
//   const FIELD_LIMITS = {
//     product_name: 100,
//     dosage: 50,
//     batch_number: 50,
//     vendor: 100,
//     vendor_id: 50,
//     item_code: 50,
//     rack_no: 20,
//     shelf_no: 20,
//   };

//   // Format validation functions (show while typing)
//   const validateDosageFormat = (dosage) => {
//     if (!dosage || dosage.trim() === "") return "";
//     const dosageRegex = /^(\d+(\.\d+)?\s*(mg|g|ml|L|IU|µg|mcg|%)?(\/\d+(\.\d+)?\s*(mg|g|ml|L)?)?)$/i;
//     if (!dosageRegex.test(dosage.trim())) {
//       return "Please enter a valid dosage format (e.g., 500mg, 10ml, 5mg/5ml)";
//     }
//     return "";
//   };

//   const validateProductNameFormat = (value) => {
//     if (!value || value.trim() === "") return "";
//     if (value.trim().length < 2) {
//       return "Product name must be at least 2 characters";
//     }
//     return "";
//   };

//   const validateBatchNumberFormat = (value, currentId = null) => {
//     if (!value || value.trim() === "") return "";
//     // Check for duplicate batch number (TC_018)
//     const isDuplicate = inventoryData.some(item => 
//       item.batch === value.trim() && item.id !== currentId
//     );
//     if (isDuplicate) {
//       return "Batch number already exists";
//     }
//     return "";
//   };

//   const validateQuantityFormat = (value) => {
//     if (!value || value.trim() === "") return "";
//     const qty = parseInt(value);
//     if (isNaN(qty)) {
//       return "Quantity must be a valid number";
//     }
//     if (qty < 0) {
//       return "Quantity cannot be negative";
//     }
//     if (qty === 0) {
//       return "Quantity must be greater than 0";
//     }
//     return "";
//   };

//   const validateAddQuantityFormat = (value) => {
//     if (!value || value.trim() === "") return "";
//     const qty = parseInt(value);
//     if (isNaN(qty)) {
//       return "Quantity must be a valid number";
//     }
//     if (qty < 0) {
//       return "Quantity cannot be negative";
//     }
//     return "";
//   };

//   const validateUnitPriceFormat = (value) => {
//     if (!value || value.trim() === "") return "";
//     const price = parseFloat(value);
//     if (isNaN(price)) {
//       return "Unit price must be a valid number";
//     }
//     if (price < 0) {
//       return "Unit price cannot be negative";
//     }
//     if (price === 0) {
//       return "Unit price must be greater than 0";
//     }
//     return "";
//   };

//   // Status-quantity validation
//   const validateStatusFormat = (status, quantity, isEditForm = false, currentQty = 0, addQty = 0) => {
//     if (!status) return "";
//     let totalQty = parseInt(quantity) || 0;
//     if (isEditForm) {
//       totalQty = currentQty + addQty;
//     }
    
//     if (totalQty > 0 && status === "OUT OF STOCK") {
//       return "Cannot set OUT OF STOCK status when quantity is greater than 0";
//     }
//     if (totalQty === 0 && status !== "OUT OF STOCK") {
//       return "Status must be OUT OF STOCK when quantity is 0";
//     }
//     return "";
//   };

//   // === API Functions (Updated to use axios) ===
//   const fetchStocks = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await api.get("/stock/list");
//       const data = response.data;
//       const transformedData = data.map((item) => ({
//         id: item.id,
//         name: item.product_name,
//         dosage: item.dosage || "",
//         category: item.category,
//         batch: item.batch_number,
//         vendor: item.vendor,
//         vendorCode: item.vendor_id,
//         stock: item.quantity,
//         status: mapStatusToFrontend(item.status),
//         item_code: item.item_code,
//         rack_no: item.rack_no,
//         shelf_no: item.shelf_no,
//         unit_price: item.unit_price,
//         raw: item,
//       }));
//       setInventoryData(transformedData);
//     } catch (err) {
//       console.error("Error fetching stocks:", err);
//       const errorMessage = err.response?.data?.detail || err.message || "Failed to fetch stocks";
//       setError(errorMessage);
//       errorToast(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addStock = async (stockData) => {
//     try {
//       const response = await api.post("/stock/add", stockData);
//       successToast("Stock added successfully!");
//       return response.data;
//     } catch (err) {
//       console.error("Error adding stock:", err);
//       const errorMessage = err.response?.data?.detail || err.message || "Failed to add stock";
//       errorToast(errorMessage);
//       throw new Error(errorMessage);
//     }
//   };

//   const updateStock = async (stockId, stockData) => {
//     try {
//       const response = await api.put(`/stock/edit/${stockId}`, stockData);
//       successToast("Stock updated successfully!");
//       return response.data;
//     } catch (err) {
//       console.error("Error updating stock:", err);
//       const errorMessage = err.response?.data?.detail || err.message || "Failed to update stock";
//       errorToast(errorMessage);
//       throw new Error(errorMessage);
//     }
//   };

//   const deleteStock = async (stockId) => {
//     try {
//       await api.delete(`/stock/delete/${stockId}`);
//       successToast("Stock deleted successfully!");
//       return true;
//     } catch (err) {
//       console.error("Error deleting stock:", err);
//       const errorMessage = err.response?.data?.detail || err.message || "Failed to delete stock";
//       errorToast(errorMessage);
//       throw new Error(errorMessage);
//     }
//   };

//   // Helper function to map backend status to frontend status
//   const mapStatusToFrontend = (backendStatus) => {
//     const statusMap = {
//       available: "IN STOCK",
//       low_stock: "LOW STOCK",
//       out_of_stock: "OUT OF STOCK",
//       "IN STOCK": "IN STOCK",
//       "LOW STOCK": "LOW STOCK",
//       "OUT OF STOCK": "OUT OF STOCK",
//     };
//     return statusMap[backendStatus] || "IN STOCK";
//   };

//   // Helper function to map frontend status to backend status
//   const mapStatusToBackend = (frontendStatus) => {
//     const statusMap = {
//       "IN STOCK": "available",
//       "LOW STOCK": "low_stock",
//       "OUT OF STOCK": "out_of_stock",
//     };
//     return statusMap[frontendStatus] || "available";
//   };

//   // Fetch stocks on component mount
//   useEffect(() => {
//     fetchStocks();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         openDropdownId &&
//         !dropdownRefs.current[openDropdownId]?.contains(event.target)
//       ) {
//         setOpenDropdownId(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [openDropdownId]);

//   // Required field validation (only for submission)
//   const validateRequiredFields = (formData, isEditForm = false) => {
//     const errors = {};
//     const requiredFields = [
//       "product_name",
//       "dosage",
//       "category",
//       "batch_number",
//       "vendor",
//       "vendor_id",
//       "item_code",
//       "rack_no",
//       "shelf_no",
//       "unit_price",
//       "status",
//     ];

//     // For add form, include quantity
//     if (!isEditForm) {
//       requiredFields.push("quantity");
//     }

//     requiredFields.forEach((field) => {
//       if (
//         !formData[field] ||
//         (typeof formData[field] === "string" && formData[field].trim() === "")
//       ) {
//         const fieldLabel = field
//           .replace(/_/g, " ")
//           .replace(/([A-Z])/g, " $1")
//           .replace(/^./, (str) => str.toUpperCase());
//         errors[field] = `${fieldLabel} is required`;
//       }
//     });

//     return errors;
//   };

//   // Format validation for all fields (called on submit)
//   const validateAllFormats = (formData, isEditForm = false) => {
//     const formatErrors = {
//       product_name: validateProductNameFormat(formData.product_name),
//       dosage: validateDosageFormat(formData.dosage),
//       batch_number: validateBatchNumberFormat(formData.batch_number, isEditForm ? editStockId : null),
//       quantity: isEditForm ? "" : validateQuantityFormat(formData.quantity),
//       add_quantity: isEditForm ? validateAddQuantityFormat(formData.add_quantity) : "",
//       unit_price: validateUnitPriceFormat(formData.unit_price),
//     };

//     // Status validation based on quantity
//     if (isEditForm) {
//       const currentQty = inventoryData.find(item => item.id === editStockId)?.stock || 0;
//       const addQty = parseInt(formData.add_quantity) || 0;
//       formatErrors.status = validateStatusFormat(formData.status, "", true, currentQty, addQty);
//     } else {
//       formatErrors.status = validateStatusFormat(formData.status, formData.quantity);
//     }

//     return formatErrors;
//   };

//   // Handle input change for Add form
//   const handleAddInputChange = (field, value) => {
//     setNewStock(prev => ({
//       ...prev,
//       [field]: value
//     }));

//     // Clear any existing required field error for this field
//     if (fieldErrors[field]) {
//       setFieldErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[field];
//         return newErrors;
//       });
//     }

//     // Perform real-time format validation
//     let formatError = "";
//     switch (field) {
//       case "product_name":
//         formatError = validateProductNameFormat(value);
//         break;
//       case "dosage":
//         formatError = validateDosageFormat(value);
//         break;
//       case "batch_number":
//         formatError = validateBatchNumberFormat(value);
//         break;
//       case "quantity":
//         formatError = validateQuantityFormat(value);
//         break;
//       case "unit_price":
//         formatError = validateUnitPriceFormat(value);
//         break;
//       case "status":
//         formatError = validateStatusFormat(value, newStock.quantity);
//         break;
//       default:
//         break;
//     }

//     if (formatError) {
//       setValidationErrors(prev => ({
//         ...prev,
//         [field]: formatError
//       }));
//     } else if (validationErrors[field]) {
//       // Clear format error if validation passes
//       setValidationErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[field];
//         return newErrors;
//       });
//     }
//   };

//   // Handle input change for Edit form
//   const handleEditInputChange = (field, value) => {
//     setEditStock(prev => {
//       const newData = { ...prev, [field]: value };
      
//       // Check if form has changed (TC_094)
//       if (initialEditForm) {
//         const hasChanged = Object.keys(newData).some(key => {
//           if (key === 'add_quantity') return false;
//           return newData[key] !== initialEditForm[key];
//         });
//         setIsEditFormChanged(hasChanged);
//       }
      
//       return newData;
//     });
    
//     // Clear any existing required field error for this field
//     if (fieldErrors[field]) {
//       setFieldErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[field];
//         return newErrors;
//       });
//     }

//     // Perform real-time format validation
//     let formatError = "";
//     switch (field) {
//       case "product_name":
//         formatError = validateProductNameFormat(value);
//         break;
//       case "dosage":
//         formatError = validateDosageFormat(value);
//         break;
//       case "batch_number":
//         formatError = validateBatchNumberFormat(value, editStockId);
//         break;
//       case "add_quantity":
//         formatError = validateAddQuantityFormat(value);
//         break;
//       case "unit_price":
//         formatError = validateUnitPriceFormat(value);
//         break;
//       case "status":
//         const currentQty = inventoryData.find(item => item.id === editStockId)?.stock || 0;
//         const addQty = parseInt(editStock.add_quantity) || 0;
//         formatError = validateStatusFormat(value, "", true, currentQty, addQty);
//         break;
//       default:
//         break;
//     }

//     if (formatError) {
//       setValidationErrors(prev => ({
//         ...prev,
//         [field]: formatError
//       }));
//     } else if (validationErrors[field]) {
//       // Clear format error if validation passes
//       setValidationErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[field];
//         return newErrors;
//       });
//     }
//   };

//   // Popup handling functions
//   const handleClosePopup = (popupType) => {
//     if ((popupType === 'add' && Object.keys(newStock).some(key => 
//         newStock[key] !== "" && key !== 'status' && newStock[key] !== "IN STOCK")) ||
//         (popupType === 'edit' && isEditFormChanged)) {
//       setPopupToClose(popupType);
//       setShowCloseConfirm(true);
//     } else {
//       closePopup(popupType);
//     }
//   };

//   const closePopup = (popupType) => {
//     if (popupType === 'add') {
//       setShowAddStockPopup(false);
//       setNewStock({
//         product_name: "",
//         dosage: "",
//         category: "",
//         batch_number: "",
//         vendor: "",
//         vendor_id: "",
//         quantity: "",
//         item_code: "",
//         rack_no: "",
//         shelf_no: "",
//         unit_price: "",
//         status: "IN STOCK",
//       });
//       setValidationErrors({});
//       setFieldErrors({});
//       setIsSubmitted(false);
//     } else if (popupType === 'edit') {
//       setShowEditStockPopup(false);
//       setEditStock({
//         product_name: "",
//         dosage: "",
//         category: "",
//         batch_number: "",
//         vendor: "",
//         vendor_id: "",
//         add_quantity: "",
//         item_code: "",
//         rack_no: "",
//         shelf_no: "",
//         unit_price: "",
//         status: "IN STOCK",
//       });
//       setEditStockId(null);
//       setInitialEditForm(null);
//       setIsEditFormChanged(false);
//       setValidationErrors({});
//       setFieldErrors({});
//       setIsSubmitted(false);
//     }
//     setShowCloseConfirm(false);
//     setPopupToClose(null);
//   };

//   const filteredData = inventoryData.filter((item) => {
//     const matchesSearch = Object.values(item)
//       .join(" ")
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase());
//     const matchesStatus =
//       filterStatus === "All" || item.status === filterStatus;
//     const matchesCategory =
//       selectedCategory === "All" || item.category === selectedCategory;
//     return matchesSearch && matchesStatus && matchesCategory;
//   });

//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const displayedData = filteredData.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const sortedData = [...displayedData].sort((a, b) => {
//     if (!sortColumn) return 0;
//     const valA = a[sortColumn];
//     const valB = b[sortColumn];
//     if (typeof valA === "string") {
//       return sortOrder === "asc"
//         ? valA.localeCompare(valB)
//         : valB.localeCompare(valA);
//     } else {
//       return sortOrder === "asc" ? valA - valB : valB - valA;
//     }
//   });

//   const handleRowSelect = (id) => {
//     setSelectedRows((prev) =>
//       prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
//     );
//     setSelectAll(false);
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage((prev) => prev - 1);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
//   };

//   const handleSelectAll = () => {
//     if (selectedRows.length === displayedData.length) {
//       setSelectedRows([]);
//       setSelectAll(false);
//     } else {
//       setSelectedRows(displayedData.map((row) => row.id));
//       setSelectAll(true);
//     }
//   };

//   const handleDeleteSingle = async (id) => {
//     try {
//       await deleteStock(id);
//       await fetchStocks();
//       setShowSingleDeletePopup(false);
//       setSingleDeleteId(null);
//     } catch (err) {
//       console.error("Error deleting stock:", err);
//       setError(err.message || "Failed to delete stock");
//     }
//   };

//   const handleDeleteSelected = async () => {
//     try {
//       const deletePromises = selectedRows.map((id) => deleteStock(id));
//       await Promise.all(deletePromises);
//       await fetchStocks();
//       setSelectedRows([]);
//       setSelectAll(false);
//       setShowDeletePopup(false);
//     } catch (err) {
//       console.error("Error deleting selected stocks:", err);
//       setError("Failed to delete some stocks");
//     }
//   };

//   const handleAddStock = async (e) => {
//     e.preventDefault();
//     setIsSubmitted(true);

//     // Check required fields
//     const requiredErrors = validateRequiredFields(newStock, false);
//     setFieldErrors(requiredErrors);

//     // Check format validation
//     const formatErrors = validateAllFormats(newStock, false);
//     setValidationErrors(formatErrors);

//     // Only submit if no errors
//     if (Object.keys(requiredErrors).length === 0 && 
//         !Object.values(formatErrors).some(error => error !== '')) {
//       try {
//         const stockData = {
//           product_name: newStock.product_name.trim(),
//           dosage: newStock.dosage.trim(),
//           category: newStock.category,
//           batch_number: newStock.batch_number.trim(),
//           vendor: newStock.vendor.trim(),
//           quantity: parseInt(newStock.quantity) || 0,
//           vendor_id: newStock.vendor_id.trim(),
//           item_code: newStock.item_code.trim(),
//           rack_no: newStock.rack_no.trim(),
//           shelf_no: newStock.shelf_no.trim(),
//           unit_price: parseFloat(newStock.unit_price) || 0,
//           status: mapStatusToBackend(newStock.status),
//         };
//         await addStock(stockData);
//         await fetchStocks();
//         setShowAddStockPopup(false);
//         setNewStock({
//           product_name: "",
//           dosage: "",
//           category: "",
//           batch_number: "",
//           vendor: "",
//           vendor_id: "",
//           quantity: "",
//           item_code: "",
//           rack_no: "",
//           shelf_no: "",
//           unit_price: "",
//           status: "IN STOCK",
//         });
//         setValidationErrors({});
//         setFieldErrors({});
//         setIsSubmitted(false);
//       } catch (err) {
//         console.error("Error adding stock:", err);
//         setError(err.message || "Failed to add stock");
//       }
//     } else {
//       errorToast("Please fix all validation errors before saving.");
//     }
//   };

//   const handleEditStock = async (e) => {
//     e.preventDefault();
//     setIsSubmitted(true);

//     // Check required fields
//     const requiredErrors = validateRequiredFields(editStock, true);
//     setFieldErrors(requiredErrors);

//     // Check format validation
//     const formatErrors = validateAllFormats(editStock, true);
//     setValidationErrors(formatErrors);

//     // Only submit if no errors
//     if (Object.keys(requiredErrors).length === 0 && 
//         !Object.values(formatErrors).some(error => error !== '')) {
//       try {
//         const stockData = {
//           product_name: editStock.product_name.trim(),
//           dosage: editStock.dosage.trim(),
//           category: editStock.category,
//           batch_number: editStock.batch_number.trim(),
//           vendor: editStock.vendor.trim(),
//           add_quantity: parseInt(editStock.add_quantity) || 0,
//           vendor_id: editStock.vendor_id.trim(),
//           item_code: editStock.item_code.trim(),
//           rack_no: editStock.rack_no.trim(),
//           shelf_no: editStock.shelf_no.trim(),
//           unit_price: parseFloat(editStock.unit_price) || 0,
//           status: mapStatusToBackend(editStock.status),
//         };

//         await updateStock(editStockId, stockData);
//         await fetchStocks();
//         setShowEditStockPopup(false);
//         setEditStock({
//           product_name: "",
//           dosage: "",
//           category: "",
//           batch_number: "",
//           vendor: "",
//           vendor_id: "",
//           add_quantity: "",
//           item_code: "",
//           rack_no: "",
//           shelf_no: "",
//           unit_price: "",
//           status: "IN STOCK",
//         });
//         setEditStockId(null);
//         setInitialEditForm(null);
//         setIsEditFormChanged(false);
//         setValidationErrors({});
//         setFieldErrors({});
//         setIsSubmitted(false);
//       } catch (err) {
//         console.error("Error updating stock:", err);
//         setError(err.message || "Failed to update stock");
//       }
//     } else {
//       errorToast("Please fix all validation errors before saving.");
//     }
//   };

//   const openEditPopup = (item) => {
//     const currentStockItem = inventoryData.find(
//       (stock) => stock.id === item.id
//     );
//     const initialData = {
//       product_name: item.name,
//       dosage: item.dosage || "",
//       category: item.category,
//       batch_number: item.batch,
//       vendor: item.vendor,
//       vendor_id: item.vendorCode,
//       add_quantity: "",
//       status: item.status,
//       item_code: item.item_code || "",
//       rack_no: item.rack_no || "",
//       shelf_no: item.shelf_no || "",
//       unit_price: item.unit_price?.toString() || "0",
//     };
    
//     setEditStock(initialData);
//     setInitialEditForm(initialData);
//     setIsEditFormChanged(false);
//     setEditStockId(item.id);
//     setShowEditStockPopup(true);
//     setValidationErrors({});
//     setFieldErrors({});
//     setIsSubmitted(false);
//   };

//   const handleSort = (column) => {
//     if (sortColumn === column) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortColumn(column);
//       setSortOrder("asc");
//     }
//   };

//   // Calculate statistics from actual data
//   const statistics = useMemo(() => {
//     const totalStocks = inventoryData.length;
//     const outOfStock = inventoryData.filter(
//       (item) => item.status === "OUT OF STOCK"
//     ).length;
//     const lowStock = inventoryData.filter(
//       (item) => item.status === "LOW STOCK"
//     ).length;
//     const totalValue = inventoryData.reduce((sum, item) => {
//       return sum + item.stock * (item.unit_price || 0);
//     }, 0);
//     return {
//       totalValue: `$${totalValue.toLocaleString()}`,
//       inventoryStock: totalStocks,
//       outOfStock: outOfStock,
//       lowStock: lowStock,
//     };
//   }, [inventoryData]);

//   const years = ["2023", "2024", "2025", "2026"];
//   const months = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];

//   // Get unique categories from data for filtering (TC_089)
//   const uniqueCategories = [...new Set(inventoryData.map(item => item.category))];
//   const allCategories = ["All", ...uniqueCategories];

//   const Dropdown = ({
//     label,
//     value,
//     onChange,
//     options,
//     error,
//     required = true,
//   }) => (
//     <div>
//       <label
//         className="text-sm text-black dark:text-white mb-1 flex items-center gap-1"
//         style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//       >
//         {label}
//         {required && <span className="text-[#FF2424]">*</span>}
//       </label>
//       <Listbox value={value} onChange={onChange}>
//         <div className="relative mt-1 w-full">
//           <Listbox.Button
//             className={`w-full h-[36px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]`}
//             style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//           >
//             {value || "Select Option"}
//             <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
//               <ChevronDown className="h-4 w-4 text-black dark:text-[#0EFF7B]" />
//             </span>
//           </Listbox.Button>
//           {error && isSubmitted && (
//             <p className="mt-1 text-[12px] text-[#FF2424]">{error}</p>
//           )}
//           <Listbox.Options className="absolute mt-1 w-full rounded-[8px] bg-gray-100 dark:bg-[#000000] shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A]">
//             {options.map((option, idx) => (
//               <Listbox.Option
//                 key={idx}
//                 value={option}
//                 className={({ active, selected }) =>
//                   `cursor-pointer select-none py-2 px-3 text-sm rounded-[4px] ${
//                     active
//                       ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
//                       : "text-black dark:text-white"
//                   } ${
//                     selected
//                       ? "font-medium text-[#08994A] dark:text-[#0EFF7B]"
//                       : ""
//                   }`
//                 }
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 {option}
//               </Listbox.Option>
//             ))}
//           </Listbox.Options>
//         </div>
//       </Listbox>
//     </div>
//   );

//   if (loading && inventoryData.length === 0) {
//     return (
//       <div className="mt-[80px] mb-4 flex items-center justify-center h-64">
//         <div className="text-black dark:text-white text-lg">
//           Loading stock data...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-[8px] p-4 w-full max-w-[2500px] mx-auto font-[Helvetica] flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative">
//       {/* Error Display */}
//       {error && (
//         <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
//           {error}
//           <button
//             onClick={() => setError(null)}
//             className="float-right font-bold"
//           >
//             ×
//           </button>
//         </div>
//       )}
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

//       <div className="flex justify-between items-center mb-6 mt-4 w-full">
//         <div>
//           <h1
//             className="text-[20px] font-medium text-black dark:text-white"
//             style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//           >
//             Stock & Inventory
//           </h1>
//           <p
//             className="text-[14px] mt-2 text-gray-600 dark:text-gray-400"
//             style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//           >
//             Manage stock items, track inventory levels, and monitor stock status
//             in real-time.
//           </p>
//         </div>
//         <button
//           onClick={() => {
//             setShowAddStockPopup(true);
//             setValidationErrors({});
//             setFieldErrors({});
//             setIsSubmitted(false);
//           }}
//           className="w-[200px] h-[40px] flex items-center justify-center bg-[linear-gradient(92.18deg,#025126_3.26%,#0D7F41_50.54%,#025126_97.83%)] border-b-[2px] border-[#0EFF7B] shadow-[0px_2px_12px_0px_#00000040] hover:opacity-90 text-white font-semibold px-4 py-2 rounded-[8px] transition duration-300 ease-in-out"
//           style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//         >
//           + Add Stock
//         </button>
//       </div>

//       <div className="flex items-center justify-between w-full mb-6 text-sm">
//         <div className="flex gap-4">
//           {["Today", "Week", "Month", "Year"].map((filter) => (
//             <button
//               key={filter}
//               onClick={() => setActiveFilter(filter)}
//               className={`px-6 py-2 rounded-md transition-all duration-300 ${
//                 activeFilter === filter
//                   ? "bg-[#025126] text-white shadow-[0px_2px_12px_0px_#0EFF7B40]"
//                   : "bg-gray-300 dark:bg-[#1E1E1E] text-black dark:text-gray-300 hover:bg-[#08994A]/30"
//               }`}
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               {filter}
//             </button>
//           ))}
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <span
//               className="text-gray-400"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Year
//             </span>
//             <div className="relative">
//               <select
//                 value={year}
//                 onChange={(e) => setYear(e.target.value)}
//                 className="appearance-none bg-gray-100 dark:bg-[#0D0D0D] shadow-[0_0_4px_0_#0EFF7B] text-black dark:text-white border border-[#08994A] rounded-md px-4 py-1 pr-8 focus:outline-none"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 {years.map((y) => (
//                   <option key={y} value={y}>
//                     {y}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown
//                 size={16}
//                 className="absolute right-2 top-2 text-[#08994A] pointer-events-none"
//               />
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <span
//               className="text-gray-400"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Month
//             </span>
//             <div className="relative">
//               <select
//                 value={month}
//                 onChange={(e) => setMonth(e.target.value)}
//                 className="appearance-none bg-gray-100 dark:bg-[#0D0D0D] shadow-[0_0_4px_0_#0EFF7B] text-black dark:text-white border border-[#08994A] rounded-md px-4 py-1 pr-8 focus:outline-none"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 {months.map((m) => (
//                   <option key={m} value={m}>
//                     {m}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown
//                 size={16}
//                 className="absolute right-2 top-2 text-[#08994A] pointer-events-none"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Statistics Cards */}
//       <div className="bg-gray-200 dark:bg-[#0D0D0D] px-6 py-6 w-full h-[102px] rounded-2xl mb-6">
//         <div className="grid grid-cols-4 gap-6 text-sm">
//           {[
//             {
//               label: "Total Value",
//               value: statistics.totalValue,
//               icon: <DollarSign className="w-6 h-6 text-green-400" />,
//               ring: "ring-green-600/60 bg-green-200/10 dark:bg-green-900/10",
//             },
//             {
//               label: "Inventory Items",
//               value: statistics.inventoryStock.toLocaleString(),
//               icon: <Package className="w-6 h-6 text-amber-500" />,
//               ring: "ring-amber-600/60 bg-amber-200/10 dark:bg-amber-900/10",
//             },
//             {
//               label: "Out of Stock",
//               value: statistics.outOfStock.toLocaleString(),
//               icon: <AlertTriangle className="w-6 h-6 text-gray-400" />,
//               ring: "ring-gray-600/60 bg-gray-200/10 dark:bg-gray-900/10",
//             },
//             {
//               label: "Low Stock",
//               value: statistics.lowStock.toLocaleString(),
//               icon: <XCircle className="w-6 h-6 text-indigo-400" />,
//               ring: "ring-indigo-600/60 bg-indigo-200/10 dark:bg-indigo-900/10",
//             },
//           ].map((stat, i) => (
//             <div key={i} className="flex items-center gap-[27px]">
//               <div
//                 className={`flex items-center justify-center w-12 h-12 ml-6 rounded-full ring-2 ${stat.ring}`}
//               >
//                 {stat.icon}
//               </div>
//               <div>
//                 <p
//                   className="font-normal text-[12px] leading-[100%] tracking-normal text-black dark:text-white mb-3"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   {stat.label}
//                 </p>
//                 <p
//                   className="font-bold text-[16px] leading-[100%] tracking-normal text-black dark:text-white"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   {stat.value}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="flex flex-wrap w-full gap-4 mb-6">
//         {/* Department Stocks Card */}
//         <div className="flex-1 min-w-[280px] lg:min-w-[350px] h-[200px] rounded-lg border border-[#0EFF7B1A] dark:border-[#0EFF7B1A] p-3 bg-gray-100 dark:bg-black shadow-[0px_0px_2px_0px_#A0A0A040]">
//           <h3
//             className="text-[#08994A] dark:text-[#0EFF7B] text-[14px] font-semibold mb-1"
//             style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//           >
//             DEPARTMENT STOCKS
//           </h3>
//           <hr className="border-gray-300 dark:border-[#333] mb-6" />
//           <div className="flex items-center justify-between">
//             <div className="flex flex-col gap-5 mr-6">
//               <div className="flex items-center gap-3">
//                 <span className="min-w-[14px] h-[14px] rounded-full bg-[#0EFF7B] inline-block"></span>
//                 <span
//                   className="text-sm text-black dark:text-white"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   Medical Dept
//                 </span>
//                 <span
//                   className="text-gray-600 dark:text-[#A0A0A0] text-sm"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   60%
//                 </span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <span className="min-w-[14px] h-[14px] rounded-full bg-[#0A7239] inline-block"></span>
//                 <span
//                   className="text-sm text-black dark:text-white"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   Surgical Dept
//                 </span>
//                 <span
//                   className="text-gray-600 dark:text-[#A0A0A0] text-sm"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   30%
//                 </span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <span className="min-w-[14px] h-[14px] rounded-full bg-[#D7FDE8] inline-block"></span>
//                 <span
//                   className="text-sm text-black dark:text-white"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   Supportive &<br /> Diagnostic Dept
//                 </span>
//                 <span
//                   className="text-gray-600 dark:text-[#A0A0A0] text-sm"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   10%
//                 </span>
//               </div>
//             </div>
//             <svg viewBox="0 0 36 36" width="100" height="100">
//               <circle
//                 cx="18"
//                 cy="18"
//                 r="16"
//                 fill="none"
//                 stroke="gray-200 dark:stroke-[#242424]"
//                 strokeWidth="4"
//               />
//               <circle
//                 cx="18"
//                 cy="18"
//                 r="16"
//                 fill="none"
//                 stroke="#18FF96"
//                 strokeWidth="4"
//                 strokeDasharray="60 100"
//                 strokeDashoffset="0"
//                 strokeLinecap="round"
//               />
//               <circle
//                 cx="18"
//                 cy="18"
//                 r="16"
//                 fill="none"
//                 stroke="#1AB873"
//                 strokeWidth="4"
//                 strokeDasharray="30 100"
//                 strokeDashoffset="60"
//                 strokeLinecap="round"
//               />
//               <circle
//                 cx="18"
//                 cy="18"
//                 r="16"
//                 fill="none"
//                 stroke="#C9FFE1"
//                 strokeWidth="4"
//                 strokeDasharray="10 100"
//                 strokeDashoffset="90"
//                 strokeLinecap="round"
//               />
//             </svg>
//           </div>
//         </div>

//         {/* Upcoming Stocks Card */}
//         <div className="flex-1 min-w-[250px] h-[200px] rounded-lg border border-[#0EFF7B1A] dark:border-[#0EFF7B1A] p-3 bg-gray-100 dark:bg-black shadow-[0px_0px_2px_0px_#A0A0A040]">
//           <h3 className="flex justify-between text-[15px] font-semibold mb-1">
//             <span
//               className="text-[#6E92FF] dark:text-[#6E92FF] text-[14px] uppercase flex items-center gap-1"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               <span>○</span> UPCOMING STOCKS
//             </span>
//             <span
//               className="text-[#08994A] dark:text-[#0EFF7B] text-[12px] cursor-pointer"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               View all (80)
//             </span>
//           </h3>
//           <hr className="border-gray-300 dark:border-[#222] mb-6" />
//           <ul className="space-y-3 text-sm">
//             <li className="flex justify-between">
//               <span
//                 className="text-black dark:text-white"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 Ibuprofen
//               </span>
//               <div className="flex gap-x-2">
//                 <span
//                   className="text-[#08994A] dark:text-[#0EFF7B]"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   +145
//                 </span>
//                 <span
//                   className="text-gray-600 dark:text-gray-400 text-xs"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   29 Aug 25
//                 </span>
//               </div>
//             </li>
//             <li className="flex justify-between">
//               <span
//                 className="text-black dark:text-white"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 Amoxicillin
//               </span>
//               <div className="flex gap-x-2">
//                 <span
//                   className="text-[#08994A] dark:text-[#0EFF7B]"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   +120
//                 </span>
//                 <span
//                   className="text-gray-600 dark:text-gray-400 text-xs"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   29 Aug 25
//                 </span>
//               </div>
//             </li>
//             <li className="flex justify-between">
//               <span
//                 className="text-black dark:text-white"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 Disinfectant skin antiseptic
//               </span>
//               <div className="flex gap-x-2">
//                 <span
//                   className="text-[#08994A] dark:text-[#0EFF7B]"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   +200
//                 </span>
//                 <span
//                   className="text-gray-600 dark:text-gray-400 text-xs"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   29 Aug 25
//                 </span>
//               </div>
//             </li>
//           </ul>
//         </div>

//         {/* Expiring Stocks Card */}
//         <div className="flex-1 min-w-[280px] lg:min-w-[350px] h-[200px] rounded-lg border border-[#0EFF7B1A] dark:border-[#0EFF7B1A] p-3 bg-gray-100 dark:bg-black shadow-[0px_0px_2px_0px_#A0A0A040]">
//           <h3 className="flex justify-between text-[15px] font-semibold mb-1">
//             <span
//               className="text-[#FF2424] dark:text-[#FF2424] text-[14px] uppercase flex items-center gap-1"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               <span>○</span> EXPIRING STOCKS
//             </span>
//             <span
//               className="text-[#08994A] dark:text-[#0EFF7B] text-[12px] cursor-pointer"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               View all (150)
//             </span>
//           </h3>
//           <hr className="border-gray-300 dark:border-[#222] mb-4" />
//           <ul className="space-y-3 text-sm">
//             <li className="flex justify-between">
//               <span
//                 className="text-black dark:text-white"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 Mask 4-layered
//               </span>
//               <span
//                 className="text-gray-600 dark:text-gray-400 text-xs"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 30 available
//               </span>
//             </li>
//             <li className="flex justify-between">
//               <span
//                 className="text-black dark:text-white"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 Disinfectant chlorhexidine bigluconate 0.05%
//               </span>
//               <span
//                 className="text-gray-600 dark:text-gray-400 text-xs"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 100 available
//               </span>
//             </li>
//             <li className="flex justify-between">
//               <span
//                 className="text-black dark:text-white"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 Disinfectant skin antiseptic
//               </span>
//               <span
//                 className="text-gray-600 dark:text-gray-400 text-xs"
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 150 available
//               </span>
//             </li>
//           </ul>
//         </div>
//       </div>

//       <h3
//         className="w-full h-[22px] font-medium text-[18px] leading-[22px] tracking-normal text-black dark:text-white mb-1"
//         style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//       >
//         Stock list
//       </h3>
//       <p
//         className="text-[14px] leading-[18px] text-[#A0A0A0] mt-3 mb-4"
//         style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//       >
//         List of all stock items ({inventoryData.length} total)
//       </p>

//       <div className="w-full bg-gray-100 dark:bg-[#0D0D0D] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[12px] p-4 space-y-4">
//         <div className="flex justify-between items-center w-full">
//           <div className="relative">
//             <button
//               onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
//               className="w-[180px] h-[32px] flex justify-between items-center px-3 py-1.5 rounded-[20px] bg-gray-100 dark:bg-black shadow-[0_0_4px_0_#0EFF7B] border border-[#08994A] text-black dark:text-white text-[12px] font-medium"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               {selectedCategory || "All"}{" "}
//               <ChevronDown
//                 size={16}
//                 className="text-[#08994A] dark:text-[#0EFF7B]"
//               />
//             </button>
//             {showCategoryDropdown && (
//               <div className="absolute top-full mt-2 left-0 w-[180px] bg-gray-100 dark:bg-[#000000] p-2 rounded-[20px] border border-[#0EFF7B] dark:border-[#1E1E1E] shadow-[0_0_4px_0_#FFFFFF1F] z-10">
//                 <div className="max-h-36 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//                   <ul className="text-black dark:text-white text-sm">
//                     {allCategories.map((cat) => (
//                       <li
//                         key={cat}
//                         onClick={() => {
//                           setSelectedCategory(cat);
//                           setShowCategoryDropdown(false);
//                         }}
//                         className="px-4 py-2 hover:bg-[#0EFF7B1A] dark:hover:bg-[#1E1E1E] rounded-[4px] cursor-pointer"
//                         style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                       >
//                         {cat}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             )}
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="relative group flex items-center gap-2 bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] rounded-[40px] px-3 py-2 min-w-[229px] max-w-md">
//               <Search
//                 size={16}
//                 className="text-[#08994A] dark:text-[#0EFF7B]"
//               />
//               <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
//                 Search
//               </span>
//               <input
//                 type="text"
//                 placeholder="Search Product Name.."
//                 className="bg-transparent outline-none text-sm text-[#08994A] placeholder-[#5CD592] dark:text-white w-full"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               />
//             </div>
//             <div className="relative">
//               <button
//                 onClick={() => setShowFilterPopup(!showFilterPopup)}
//                 className="relative group bg-gray-100 dark:bg-[#0EFF7B1A] rounded-[20px] w-[32px] h-[32px] flex items-center justify-center text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A]"
//               >
//                 <Filter size={16} className="text-[#0EFF7B]" />
//                 <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
//                   Filter
//                 </span>
//               </button>
//               {showFilterPopup && (
//                 <div className="absolute top-full mt-4 left-[-110px] w-[188px] gap-[12px] rounded-[20px] border border-[#0EFF7B] dark:border-[#1E1E1E] p-[18px_12px] bg-gray-100 dark:bg-[#000000E5] shadow-[0_0_4px_0_#FFFFFF1F] flex flex-col z-50">
//                   <button
//                     onClick={() => setFilterStatus("IN STOCK")}
//                     className={`w-full h-[25px] flex items-center justify-start px-3 rounded text-[14px] text-left font-normal ${
//                       filterStatus === "IN STOCK"
//                         ? "bg-[#0EFF7B1A] dark:bg-[#1E1E1E] text-[#08994A] dark:text-[#0EFF7B]"
//                         : "bg-transparent text-[#08994A] dark:text-[#0EFF7B] hover:bg-[#0EFF7B1A] dark:hover:bg-[#1E1E1E]"
//                     }`}
//                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                   >
//                     <span className="w-[8px] h-[8px] rounded-full bg-[#08994A] dark:bg-[#0EFF7B] inline-block mr-2"></span>
//                     IN STOCK
//                   </button>
//                   <button
//                     onClick={() => setFilterStatus("LOW STOCK")}
//                     className={`w-full h-[25px] flex items-center justify-start px-3 rounded text-[14px] text-left font-normal ${
//                       filterStatus === "LOW STOCK"
//                         ? "bg-[#0EFF7B1A] dark:bg-[#1E1E1E] text-[#FF930E] dark:text-[#FF930E]"
//                         : "bg-transparent text-[#FF930E] dark:text-[#FF930E] hover:bg-[#0EFF7B1A] dark:hover:bg-[#1E1E1E]"
//                     }`}
//                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                   >
//                     <span className="w-[8px] h-[8px] rounded-full bg-[#FF930E] inline-block mr-2"></span>
//                     LOW STOCK
//                   </button>
//                   <button
//                     onClick={() => setFilterStatus("OUT OF STOCK")}
//                     className={`w-full h-[25px] flex items-center justify-start px-3 rounded text-[14px] text-left font-normal ${
//                       filterStatus === "OUT OF STOCK"
//                         ? "bg-[#0EFF7B1A] dark:bg-[#1E1E1E] text-[#FF2424] dark:text-[#FF2424]"
//                         : "bg-transparent text-[#FF2424] dark:text-[#FF2424] hover:bg-[#0EFF7B1A] dark:hover:bg-[#1E1E1E]"
//                     }`}
//                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                   >
//                     <span className="w-[8px] h-[8px] rounded-full bg-[#FF2424] inline-block mr-2"></span>
//                     OUT OF STOCK
//                   </button>
//                   <div className="h-px bg-gray-300 dark:bg-[#3A3A3A] my-1"></div>
//                   <button
//                     onClick={() => {
//                       setFilterStatus("All");
//                       setShowFilterPopup(false);
//                     }}
//                     className="w-full h-[25px] flex items-center justify-start px-3 rounded text-[14px] text-left font-normal bg-transparent text-gray-600 dark:text-gray-400 hover:bg-[#0EFF7B1A] dark:hover:bg-[#1E1E1E] hover:text-[#08994A] dark:hover:text-[#0EFF7B]"
//                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                   >
//                     <span className="w-[8px] h-[8px] rounded-full bg-gray-400 dark:bg-gray-600 inline-block mr-2"></span>
//                     RESET
//                   </button>
//                 </div>
//               )}
//             </div>
//             <button
//               onClick={() =>
//                 selectedRows.length > 0 && setShowDeletePopup(true)
//               }
//               disabled={selectedRows.length === 0}
//               className={`relative group flex items-center justify-center w-[32px] h-[32px] rounded-[20px] bg-gray-100 dark:bg-[#0EFF7B1A] text-[#08994A] dark:text-white ${
//                 selectedRows.length === 0 ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//             >
//               <Trash2 size={16} className="text-[#0EFF7B]" />
//               <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
//                 Delete
//               </span>
//             </button>
//           </div>
//         </div>

//         <div className="overflow-x-hidden">
//           <table className="w-full border-collapse rounded-[8px] min-w-[800px]">
//             <thead className="border border-[#0EFF7B] dark:border-[#3C3C3C] bg-gray-200 dark:bg-[#091810] h-[52px] text-left text-sm text-[#08994A] dark:text-white">
//               <tr className="h-[52px] bg-gray-200 dark:bg-[#091810] text-left text-[16px] text-[#0EFF7B] dark:text-[#0EFF7B] rounded-[8px] ">
//                 <th className="px-3 py-3">
//                   <input
//                     type="checkbox"
//                     className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
//                     checked={
//                       displayedData.length > 0 &&
//                       selectedRows.length === displayedData.length
//                     }
//                     onChange={handleSelectAll}
//                   />
//                 </th>
//                 {[
//                   { label: "Name", key: "name" },
//                   { label: "Dosage", key: "dosage" },
//                   { label: "Categories", key: "category" },
//                   { label: "Batch number", key: "batch" },
//                   { label: "Vendor", key: "vendor" },
//                   { label: "Available stocks", key: "stock" },
//                   { label: "Status", key: "status" },
//                   { label: "Action", key: "action" },
//                 ].map((col) => (
//                   <th
//                     key={col.key}
//                     className={`px-3 py-3 font-medium ${
//                       col.key !== "action" ? "cursor-pointer select-none" : ""
//                     }`}
//                     onClick={
//                       col.key !== "action"
//                         ? () => handleSort(col.key)
//                         : undefined
//                     }
//                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                   >
//                     {col.key !== "action" ? (
//                       <div className="flex items-center gap-1">
//                         {col.label}
//                         <div className="flex flex-col ml-1">
//                           <svg
//                             className={`w-3 h-3 ${
//                               sortColumn === col.key && sortOrder === "asc"
//                                 ? "stroke-[#08994A] dark:stroke-[#0EFF7B]"
//                                 : "stroke-gray-500"
//                             }`}
//                             viewBox="0 0 20 20"
//                             fill="none"
//                             strokeWidth="2"
//                           >
//                             <path
//                               d="M10 4 L16 10 L4 10 Z"
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                             />
//                           </svg>
//                           <svg
//                             className={`w-3 h-3 ${
//                               sortColumn === col.key && sortOrder === "desc"
//                                 ? "stroke-[#0EFF7B] dark:stroke-[#0EFF7B]"
//                                 : "stroke-gray-500"
//                             }`}
//                             viewBox="0 0 20 20"
//                             fill="none"
//                             strokeWidth="2"
//                           >
//                             <path
//                               d="M10 16 L16 10 L4 10 Z"
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                             />
//                           </svg>
//                         </div>
//                       </div>
//                     ) : (
//                       col.label
//                     )}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="text-sm bg-gray-100 dark:bg-transparent">
//               {sortedData.length > 0 ? (
//                 sortedData.map((row, index) => (
//                   <tr
//                     key={row.id}
//                     className="w-full h-[62px] bg-gray-100 dark:bg-transparent px-[12px] py-[12px] border-b border-gray-300 dark:border-[#1E1E1E] relative hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
//                   >
//                     <td className="px-3 py-3">
//                       <input
//                         type="checkbox"
//                         className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
//                         checked={selectedRows.includes(row.id)}
//                         onChange={() => handleRowSelect(row.id)}
//                       />
//                     </td>
//                     <td
//                       className="px-3 py-3 text-black dark:text-white"
//                       style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                     >
//                       {row.name}
//                     </td>
//                     <td
//                       className="px-3 py-3 text-black dark:text-white"
//                       style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                     >
//                       {row.dosage}
//                     </td>
//                     <td
//                       className="px-3 py-3 text-black dark:text-white"
//                       style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                     >
//                       {row.category}
//                     </td>
//                     <td
//                       className="px-3 py-3 text-black dark:text-white"
//                       style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                     >
//                       {row.batch}
//                     </td>
//                     <td
//                       className="px-3 py-3 text-black dark:text-white"
//                       style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                     >
//                       {row.vendor}{" "}
//                       <span className="text-gray-500 ml-1">
//                         ({row.vendorCode})
//                       </span>
//                     </td>
//                     <td
//                       className="px-3 py-3 text-black dark:text-white"
//                       style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                     >
//                       {row.stock}
//                     </td>
//                     <td className="px-3 py-3 font-medium">
//                       <span
//                         className={`${
//                           row.status === "IN STOCK"
//                             ? "text-green-500"
//                             : row.status === "LOW STOCK"
//                             ? "text-yellow-500"
//                             : "text-red-500"
//                         }`}
//                         style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                       >
//                         • {row.status}
//                       </span>
//                     </td>
//                     <td className="px-3 py-3 relative">
//                       <button
//                         className="text-gray-600 dark:text-gray-400 hover:text-[#08994A] dark:hover:text-[#0EFF7B]"
//                         onClick={() =>
//                           setOpenDropdownId(
//                             openDropdownId === row.id ? null : row.id
//                           )
//                         }
//                       >
//                         <MoreVertical size={16} />
//                       </button>
//                       <div
//                         ref={(el) => (dropdownRefs.current[row.id] = el)}
//                         className={`absolute right-0 bg-gray-100 dark:bg-[#000000E5] border border-[#0EFF7B] dark:border-[#1E1E1E] rounded-[8px] shadow-[0_0_4px_0_#FFFFFF1F] w-[120px] py-1 z-50 ${
//                           openDropdownId === row.id ? "block" : "hidden"
//                         } ${
//                           index >= sortedData.length - 3
//                             ? "bottom-0 mb-8"
//                             : "top-0 mt-8"
//                         }`}
//                       >
//                         <button
//                           onClick={() => {
//                             openEditPopup(row);
//                             setOpenDropdownId(null);
//                           }}
//                           className="w-full flex items-center gap-2 px-4 py-2 text-sm text-black dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A]"
//                           style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                         >
//                           <Edit2
//                             size={14}
//                             className="text-[#08994A] dark:text-[#0EFF7B]"
//                           />
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => {
//                             setSingleDeleteId(row.id);
//                             setShowSingleDeletePopup(true);
//                             setOpenDropdownId(null);
//                           }}
//                           className="w-full flex items-center gap-2 px-4 py-2 text-sm text-black dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A]"
//                           style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                         >
//                           <Trash2 size={14} className="text-red-500" />
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr className="h-[62px] bg-gray-100 dark:bg-black">
//                   <td
//                     colSpan="9"
//                     className="text-center py-6 text-gray-600 dark:text-gray-400 italic"
//                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                   >
//                     {loading ? "Loading..." : "No inventory found"}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
//           <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
//             Page{" "}
//             <span className="text-[#08994A] dark:text-[#0EFF7B]">
//               {currentPage}
//             </span>{" "}
//             of {totalPages} ({(currentPage - 1) * itemsPerPage + 1} to{" "}
//             {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
//             {filteredData.length})
//           </span>
//           <button
//             onClick={handlePrevPage}
//             className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
//               currentPage === 1
//                 ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
//                 : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
//             }`}
//             disabled={currentPage === 1}
//           >
//             <ChevronLeft size={12} className="text-[#08994A] dark:text-white" />
//           </button>
//           <button
//             onClick={handleNextPage}
//             className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
//               currentPage === totalPages
//                 ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
//                 : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
//             }`}
//             disabled={currentPage === totalPages}
//           >
//             <ChevronRight
//               size={12}
//               className="text-[#08994A] dark:text-white"
//             />
//           </button>
//         </div>
//       </div>

//       {/* Add Stock Popup */}
//       {showAddStockPopup && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//           <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
//             <div
//               className="w-[780px] rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200 dark:border-gray-700">
//                 <h2 className="text-black dark:text-white font-medium text-[18px] leading-[21px]">
//                   Add New Stock
//                 </h2>
//                 <button
//                   onClick={() => handleClosePopup('add')}
//                   className="w-8 h-8 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#0EFF7B33] transition"
//                 >
//                   <X size={18} className="text-black dark:text-white" />
//                 </button>
//               </div>

//               <form onSubmit={handleAddStock} noValidate>
//                 <div className="grid grid-cols-3 gap-x-6 gap-y-5">
//                   {/* Product Name */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Product Name<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter product name"
//                       value={newStock.product_name}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.product_name) {
//                           handleAddInputChange('product_name', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.product_name}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {/* Format validation error - shows while typing */}
//                     {validationErrors.product_name && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {validationErrors.product_name}
//                       </p>
//                     )}
//                     {/* Required field error - only shows after submit attempt */}
//                     {isSubmitted && fieldErrors.product_name && !validationErrors.product_name && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.product_name}
//                       </p>
//                     )}
//                     {newStock.product_name.length === FIELD_LIMITS.product_name && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.product_name} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Dosage */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Dosage<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="e.g. 500mg, 10ml"
//                       value={newStock.dosage}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.dosage) {
//                           handleAddInputChange('dosage', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.dosage}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {validationErrors.dosage && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {validationErrors.dosage}
//                       </p>
//                     )}
//                     {isSubmitted && fieldErrors.dosage && !validationErrors.dosage && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.dosage}
//                       </p>
//                     )}
//                     {newStock.dosage.length === FIELD_LIMITS.dosage && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.dosage} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Category */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Category<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <Listbox value={newStock.category} onChange={(val) => handleAddInputChange('category', val)}>
//                       <div className="relative mt-1 w-full">
//                         <Listbox.Button
//                           className="w-full h-[36px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]"
//                           style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                         >
//                           {newStock.category || "Select Option"}
//                           <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
//                             <ChevronDown className="h-4 w-4 text-black dark:text-[#0EFF7B]" />
//                           </span>
//                         </Listbox.Button>
//                         {isSubmitted && fieldErrors.category && (
//                           <p className="mt-1 text-[12px] text-[#FF2424]">{fieldErrors.category}</p>
//                         )}
//                         <Listbox.Options className="absolute mt-1 w-full rounded-[8px] bg-gray-100 dark:bg-[#000000] shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A]">
//                           {categories.map((option, idx) => (
//                             <Listbox.Option
//                               key={idx}
//                               value={option}
//                               className={({ active, selected }) =>
//                                 `cursor-pointer select-none py-2 px-3 text-sm rounded-[4px] ${
//                                   active
//                                     ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
//                                     : "text-black dark:text-white"
//                                 } ${
//                                   selected
//                                     ? "font-medium text-[#08994A] dark:text-[#0EFF7B]"
//                                     : ""
//                                 }`
//                               }
//                               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                             >
//                               {option}
//                             </Listbox.Option>
//                           ))}
//                         </Listbox.Options>
//                       </div>
//                     </Listbox>
//                   </div>

//                   {/* Batch Number */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Batch Number<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter Batch Number"
//                       value={newStock.batch_number}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.batch_number) {
//                           handleAddInputChange('batch_number', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.batch_number}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {validationErrors.batch_number && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {validationErrors.batch_number}
//                       </p>
//                     )}
//                     {isSubmitted && fieldErrors.batch_number && !validationErrors.batch_number && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.batch_number}
//                       </p>
//                     )}
//                     {newStock.batch_number.length === FIELD_LIMITS.batch_number && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.batch_number} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Vendor */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Vendor<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter Vendor"
//                       value={newStock.vendor}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.vendor) {
//                           handleAddInputChange('vendor', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.vendor}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {isSubmitted && fieldErrors.vendor && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.vendor}
//                       </p>
//                     )}
//                     {newStock.vendor.length === FIELD_LIMITS.vendor && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.vendor} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Vendor ID */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Vendor ID<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter Vendor ID"
//                       value={newStock.vendor_id}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.vendor_id) {
//                           handleAddInputChange('vendor_id', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.vendor_id}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {isSubmitted && fieldErrors.vendor_id && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.vendor_id}
//                       </p>
//                     )}
//                     {newStock.vendor_id.length === FIELD_LIMITS.vendor_id && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.vendor_id} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Quantity */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Quantity<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       placeholder="Stock Quantity"
//                       value={newStock.quantity}
//                       onChange={(e) => {
//                         handleAddInputChange('quantity', e.target.value);
//                       }}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                       min="0"
//                     />
//                     {validationErrors.quantity && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {validationErrors.quantity}
//                       </p>
//                     )}
//                     {isSubmitted && fieldErrors.quantity && !validationErrors.quantity && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.quantity}
//                       </p>
//                     )}
//                   </div>

//                   {/* Item Code */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Item Code<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter Item Code"
//                       value={newStock.item_code}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.item_code) {
//                           handleAddInputChange('item_code', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.item_code}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {isSubmitted && fieldErrors.item_code && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.item_code}
//                       </p>
//                     )}
//                     {newStock.item_code.length === FIELD_LIMITS.item_code && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.item_code} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Rack No */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Rack No<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter Rack No"
//                       value={newStock.rack_no}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.rack_no) {
//                           handleAddInputChange('rack_no', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.rack_no}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {isSubmitted && fieldErrors.rack_no && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.rack_no}
//                       </p>
//                     )}
//                     {newStock.rack_no.length === FIELD_LIMITS.rack_no && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.rack_no} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Shelf No */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Shelf No<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter Shelf Number"
//                       value={newStock.shelf_no}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.shelf_no) {
//                           handleAddInputChange('shelf_no', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.shelf_no}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {isSubmitted && fieldErrors.shelf_no && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.shelf_no}
//                       </p>
//                     )}
//                     {newStock.shelf_no.length === FIELD_LIMITS.shelf_no && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.shelf_no} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Unit Price */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Unit Price<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       placeholder="Enter Unit Price"
//                       value={newStock.unit_price}
//                       onChange={(e) => {
//                         handleAddInputChange('unit_price', e.target.value);
//                       }}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                       step="0.01"
//                       min="0"
//                     />
//                     {validationErrors.unit_price && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {validationErrors.unit_price}
//                       </p>
//                     )}
//                     {isSubmitted && fieldErrors.unit_price && !validationErrors.unit_price && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.unit_price}
//                       </p>
//                     )}
//                   </div>

//                   {/* Status */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Status<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <Listbox value={newStock.status} onChange={(val) => handleAddInputChange('status', val)}>
//                       <div className="relative mt-1 w-full">
//                         <Listbox.Button
//                           className="w-full h-[36px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]"
//                           style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                         >
//                           {newStock.status || "Select Option"}
//                           <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
//                             <ChevronDown className="h-4 w-4 text-black dark:text-[#0EFF7B]" />
//                           </span>
//                         </Listbox.Button>
//                         {validationErrors.status && (
//                           <p className="mt-1 text-[12px] text-[#FF2424]">{validationErrors.status}</p>
//                         )}
//                         {isSubmitted && fieldErrors.status && !validationErrors.status && (
//                           <p className="mt-1 text-[12px] text-[#FF2424]">{fieldErrors.status}</p>
//                         )}
//                         <Listbox.Options className="absolute mt-1 w-full rounded-[8px] bg-gray-100 dark:bg-[#000000] shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A]">
//                           {["IN STOCK"].map((option, idx) => (
//                             <Listbox.Option
//                               key={idx}
//                               value={option}
//                               className={({ active, selected }) =>
//                                 `cursor-pointer select-none py-2 px-3 text-sm rounded-[4px] ${
//                                   active
//                                     ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
//                                     : "text-black dark:text-white"
//                                 } ${
//                                   selected
//                                     ? "font-medium text-[#08994A] dark:text-[#0EFF7B]"
//                                     : ""
//                                 }`
//                               }
//                               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                             >
//                               {option}
//                             </Listbox.Option>
//                           ))}
//                         </Listbox.Options>
//                       </div>
//                     </Listbox>
//                   </div>
//                 </div>

//                 <div className="flex justify-center gap-6 mt-8">
//                   <button
//                     type="button"
//                     onClick={() => handleClosePopup('add')}
//                     className="w-[160px] h-[40px] rounded-[10px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[15px] hover:bg-gray-50 dark:hover:bg-[#0EFF7B22] transition"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="w-[160px] h-[40px] rounded-[10px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium text-[15px] hover:scale-105 transition shadow-lg"
//                   >
//                     Add Stock
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Stock Popup */}
//       {showEditStockPopup && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//           <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
//             <div
//               className="w-[780px] rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200 dark:border-gray-700">
//                 <h2 className="text-black dark:text-white font-medium text-[18px] leading-[21px]">
//                   Edit Stock
//                 </h2>
//                 <button
//                   onClick={() => handleClosePopup('edit')}
//                   className="w-8 h-8 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#0EFF7B33] transition"
//                 >
//                   <X size={18} className="text-black dark:text-white" />
//                 </button>
//               </div>

//               <form onSubmit={handleEditStock} noValidate>
//                 <div className="grid grid-cols-3 gap-x-6 gap-y-5">
//                   {/* Product Name */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Product Name<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter product name"
//                       value={editStock.product_name}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.product_name) {
//                           handleEditInputChange('product_name', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.product_name}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {validationErrors.product_name && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {validationErrors.product_name}
//                       </p>
//                     )}
//                     {isSubmitted && fieldErrors.product_name && !validationErrors.product_name && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.product_name}
//                       </p>
//                     )}
//                     {editStock.product_name.length === FIELD_LIMITS.product_name && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.product_name} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Dosage */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Dosage<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="e.g. 500mg, 10ml"
//                       value={editStock.dosage}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.dosage) {
//                           handleEditInputChange('dosage', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.dosage}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {validationErrors.dosage && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {validationErrors.dosage}
//                       </p>
//                     )}
//                     {isSubmitted && fieldErrors.dosage && !validationErrors.dosage && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.dosage}
//                       </p>
//                     )}
//                     {editStock.dosage.length === FIELD_LIMITS.dosage && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.dosage} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Category */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Category<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <Listbox value={editStock.category} onChange={(val) => handleEditInputChange('category', val)}>
//                       <div className="relative mt-1 w-full">
//                         <Listbox.Button
//                           className="w-full h-[36px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]"
//                           style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                         >
//                           {editStock.category || "Select Option"}
//                           <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
//                             <ChevronDown className="h-4 w-4 text-black dark:text-[#0EFF7B]" />
//                           </span>
//                         </Listbox.Button>
//                         {isSubmitted && fieldErrors.category && (
//                           <p className="mt-1 text-[12px] text-[#FF2424]">{fieldErrors.category}</p>
//                         )}
//                         <Listbox.Options className="absolute mt-1 w-full rounded-[8px] bg-gray-100 dark:bg-[#000000] shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A]">
//                           {categories.map((option, idx) => (
//                             <Listbox.Option
//                               key={idx}
//                               value={option}
//                               className={({ active, selected }) =>
//                                 `cursor-pointer select-none py-2 px-3 text-sm rounded-[4px] ${
//                                   active
//                                     ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
//                                     : "text-black dark:text-white"
//                                 } ${
//                                   selected
//                                     ? "font-medium text-[#08994A] dark:text-[#0EFF7B]"
//                                     : ""
//                                 }`
//                               }
//                               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                             >
//                               {option}
//                             </Listbox.Option>
//                           ))}
//                         </Listbox.Options>
//                       </div>
//                     </Listbox>
//                   </div>

//                   {/* Batch Number */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Batch Number<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter Batch Number"
//                       value={editStock.batch_number}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.batch_number) {
//                           handleEditInputChange('batch_number', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.batch_number}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {validationErrors.batch_number && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {validationErrors.batch_number}
//                       </p>
//                     )}
//                     {isSubmitted && fieldErrors.batch_number && !validationErrors.batch_number && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.batch_number}
//                       </p>
//                     )}
//                     {editStock.batch_number.length === FIELD_LIMITS.batch_number && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.batch_number} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Vendor */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Vendor<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter Vendor"
//                       value={editStock.vendor}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.vendor) {
//                           handleEditInputChange('vendor', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.vendor}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {isSubmitted && fieldErrors.vendor && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.vendor}
//                       </p>
//                     )}
//                     {editStock.vendor.length === FIELD_LIMITS.vendor && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.vendor} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Vendor ID */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Vendor ID<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter Vendor ID"
//                       value={editStock.vendor_id}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.vendor_id) {
//                           handleEditInputChange('vendor_id', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.vendor_id}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {isSubmitted && fieldErrors.vendor_id && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.vendor_id}
//                       </p>
//                     )}
//                     {editStock.vendor_id.length === FIELD_LIMITS.vendor_id && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.vendor_id} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Add Quantity */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Add Quantity
//                       <span className="text-xs text-gray-500 dark:text-gray-400">
//                         (Optional)
//                       </span>
//                     </label>
//                     <input
//                       type="number"
//                       placeholder="Enter quantity to add"
//                       value={editStock.add_quantity}
//                       onChange={(e) => {
//                         handleEditInputChange('add_quantity', e.target.value);
//                       }}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                       min="0"
//                     />
//                     {validationErrors.add_quantity && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {validationErrors.add_quantity}
//                       </p>
//                     )}
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                       Current stock will be increased by this amount
//                     </p>
//                   </div>

//                   {/* Current Quantity (Read-only) */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1">
//                       Current Quantity
//                     </label>
//                     <div className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] text-black dark:text-white flex items-center">
//                       {inventoryData.find((item) => item.id === editStockId)
//                         ?.stock || 0}
//                     </div>
//                   </div>

//                   {/* Item Code */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Item Code<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter Item Code"
//                       value={editStock.item_code}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.item_code) {
//                           handleEditInputChange('item_code', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.item_code}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {isSubmitted && fieldErrors.item_code && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.item_code}
//                       </p>
//                     )}
//                     {editStock.item_code.length === FIELD_LIMITS.item_code && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.item_code} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Rack No */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Rack No<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter Rack No"
//                       value={editStock.rack_no}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.rack_no) {
//                           handleEditInputChange('rack_no', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.rack_no}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {isSubmitted && fieldErrors.rack_no && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.rack_no}
//                       </p>
//                     )}
//                     {editStock.rack_no.length === FIELD_LIMITS.rack_no && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.rack_no} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Shelf No */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Shelf No<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter Shelf Number"
//                       value={editStock.shelf_no}
//                       onChange={(e) => {
//                         if (e.target.value.length <= FIELD_LIMITS.shelf_no) {
//                           handleEditInputChange('shelf_no', e.target.value);
//                         }
//                       }}
//                       maxLength={FIELD_LIMITS.shelf_no}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                     />
//                     {isSubmitted && fieldErrors.shelf_no && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.shelf_no}
//                       </p>
//                     )}
//                     {editStock.shelf_no.length === FIELD_LIMITS.shelf_no && (
//                       <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
//                         Maximum {FIELD_LIMITS.shelf_no} characters reached
//                       </p>
//                     )}
//                   </div>

//                   {/* Unit Price */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Unit Price<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       placeholder="Enter Unit Price"
//                       value={editStock.unit_price}
//                       onChange={(e) => {
//                         handleEditInputChange('unit_price', e.target.value);
//                       }}
//                       className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
//                       step="0.01"
//                       min="0"
//                     />
//                     {validationErrors.unit_price && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {validationErrors.unit_price}
//                       </p>
//                     )}
//                     {isSubmitted && fieldErrors.unit_price && !validationErrors.unit_price && (
//                       <p className="mt-1 text-[12px] text-[#FF2424]">
//                         {fieldErrors.unit_price}
//                       </p>
//                     )}
//                   </div>

//                   {/* Status */}
//                   <div>
//                     <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
//                       Status<span className="text-[#FF2424]">*</span>
//                     </label>
//                     <Listbox value={editStock.status} onChange={(val) => handleEditInputChange('status', val)}>
//                       <div className="relative mt-1 w-full">
//                         <Listbox.Button
//                           className="w-full h-[36px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]"
//                           style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                         >
//                           {editStock.status || "Select Option"}
//                           <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
//                             <ChevronDown className="h-4 w-4 text-black dark:text-[#0EFF7B]" />
//                           </span>
//                         </Listbox.Button>
//                         {validationErrors.status && (
//                           <p className="mt-1 text-[12px] text-[#FF2424]">{validationErrors.status}</p>
//                         )}
//                         {isSubmitted && fieldErrors.status && !validationErrors.status && (
//                           <p className="mt-1 text-[12px] text-[#FF2424]">{fieldErrors.status}</p>
//                         )}
//                         <Listbox.Options className="absolute mt-1 w-full rounded-[8px] bg-gray-100 dark:bg-[#000000] shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A]">
//                           {["IN STOCK", "LOW STOCK", "OUT OF STOCK"].map((option, idx) => (
//                             <Listbox.Option
//                               key={idx}
//                               value={option}
//                               className={({ active, selected }) =>
//                                 `cursor-pointer select-none py-2 px-3 text-sm rounded-[4px] ${
//                                   active
//                                     ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
//                                     : "text-black dark:text-white"
//                                 } ${
//                                   selected
//                                     ? "font-medium text-[#08994A] dark:text-[#0EFF7B]"
//                                     : ""
//                                 }`
//                               }
//                               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                             >
//                               {option}
//                             </Listbox.Option>
//                           ))}
//                         </Listbox.Options>
//                       </div>
//                     </Listbox>
//                   </div>
//                 </div>

//                 <div className="flex justify-center gap-6 mt-8">
//                   <button
//                     type="button"
//                     onClick={() => handleClosePopup('edit')}
//                     className="w-[160px] h-[40px] rounded-[10px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[15px] hover:bg-gray-50 dark:hover:bg-[#0EFF7B22] transition"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="w-[160px] h-[40px] rounded-[10px] bg-gradient-to-r from-[#14DC6F] to-[#09753A] text-white font-medium text-[15px] transition shadow-lg hover:scale-105"
//                   >
//                     Update Stock
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Popups */}
//       {showSingleDeletePopup && (
//         <DeleteStockList
//           onConfirm={() => handleDeleteSingle(singleDeleteId)}
//           onCancel={() => {
//             setShowSingleDeletePopup(false);
//             setSingleDeleteId(null);
//           }}
//           itemsToDelete={[singleDeleteId]}
//         />
//       )}
//       {showDeletePopup && (
//         <DeleteStockList
//           onConfirm={handleDeleteSelected}
//           onCancel={() => setShowDeletePopup(false)}
//           itemsToDelete={selectedRows}
//         />
//       )}

//       {/* Close Confirmation Popup (TC_095) */}
//       {showCloseConfirm && (
//         <CloseConfirmPopup
//           onConfirm={() => closePopup(popupToClose)}
//           onCancel={() => {
//             setShowCloseConfirm(false);
//             setPopupToClose(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default StockInventory;


import React, { useState, useEffect, useRef, useMemo } from "react";
import { Listbox } from "@headlessui/react";
import { successToast, errorToast } from "../../components/Toast";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Trash2,
  DollarSign,
  Filter,
  Package,
  AlertTriangle,
  XCircle,
  X,
  Edit2,
} from "lucide-react";
import api from "../../utils/axiosConfig";

const DeleteStockList = ({ onConfirm, onCancel, itemsToDelete }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="rounded-[20px] p-[1px] backdrop-blur-md ">
        <div className="w-[400px] bg-gray-100 dark:bg-[#000000E5] rounded-[19px] p-5 relative">
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
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Confirm Deletion
              </h2>
              <button
                onClick={onCancel}
                className="w-6 h-6 rounded-full border border-[#0EFF7B1A] dark:border-[#0EFF7B1A] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] flex items-center justify-center"
              >
                <X size={16} className="text-[#08994A] dark:text-white" />
              </button>
            </div>
            <p
              className="text-sm text-black dark:text-white mb-6"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Are you sure you want to delete {itemsToDelete.length} item(s)?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={onCancel}
                className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#3C3C3C] text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] opacity-100 bg-black dark:bg-transparent dark:text-white"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="w-[144px] h-[32px] rounded-[8px] px-3 py-2 flex items-center justify-center
     bg-gradient-to-r from-[#FF4D4D] to-[#B30000]
     text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition shadow-[0_2px_12px_0px_#00000040]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CloseConfirmPopup = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
    <div className="rounded-[20px] p-[1px] backdrop-blur-md">
      <div className="w-[400px] bg-gray-100 dark:bg-[#000000E5] rounded-[19px] p-5 relative">
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
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h2
              className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Unsaved Changes
            </h2>
            <button
              onClick={onCancel}
              className="w-6 h-6 rounded-full border border-[#0EFF7B1A] dark:border-[#0EFF7B1A] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] flex items-center justify-center"
            >
              <X size={16} className="text-[#08994A] dark:text-white" />
            </button>
          </div>
          <p
            className="text-sm text-black dark:text-white mb-6"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            You have unsaved changes. Are you sure you want to close?
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onCancel}
              className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#3C3C3C] text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] opacity-100 bg-black dark:bg-transparent dark:text-white"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Continue Editing
            </button>
            <button
              onClick={onConfirm}
              className="w-[144px] h-[32px] rounded-[8px] px-3 py-2 flex items-center justify-center
   bg-gradient-to-r from-[#FF4D4D] to-[#B30000]
   text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition shadow-[0_2px_12px_0px_#00000040]"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Discard Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StockInventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Today");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("Aug");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [showAddStockPopup, setShowAddStockPopup] = useState(false);
  const [showEditStockPopup, setShowEditStockPopup] = useState(false);
  const [editStockId, setEditStockId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showSingleDeletePopup, setShowSingleDeletePopup] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newStock, setNewStock] = useState({
    product_name: "",
    dosage: "",
    category: "",
    batch_number: "",
    vendor: "",
    vendor_id: "",
    quantity: "",
    item_code: "",
    rack_no: "",
    shelf_no: "",
    unit_price: "",
    status: "IN STOCK",
  });
  const [editStock, setEditStock] = useState({
    product_name: "",
    dosage: "",
    category: "",
    batch_number: "",
    vendor: "",
    vendor_id: "",
    add_quantity: "",
    item_code: "",
    rack_no: "",
    shelf_no: "",
    unit_price: "",
    status: "IN STOCK",
  });
  
  // NEW: Validation states following patient registration pattern
  const [validationErrors, setValidationErrors] = useState({}); // Format errors (show while typing)
  const [fieldErrors, setFieldErrors] = useState({}); // Required errors (show only after submission)
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [inventoryData, setInventoryData] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isEditFormChanged, setIsEditFormChanged] = useState(false);
  const [initialEditForm, setInitialEditForm] = useState(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [popupToClose, setPopupToClose] = useState(null);
  const dropdownRefs = useRef({});
  
  const categories = [
    "Local Anesthesia",
    "Antiseptics",
    "Antibiotics",
    "Anti-inflammatory",
    "Analgesics",
    "Steroid",
    "Antifungal",
  ];
  
  const itemsPerPage = 9;

  // Field length constraints
  const FIELD_LIMITS = {
    product_name: 100,
    dosage: 50,
    batch_number: 50,
    vendor: 100,
    vendor_id: 50,
    item_code: 50,
    rack_no: 20,
    shelf_no: 20,
  };

  // Helper function to calculate status based on quantity
  const calculateStatus = (quantity) => {
    const qty = parseInt(quantity) || 0;
    if (qty === 0) {
      return "OUT OF STOCK";
    } else if (qty < 10) {
      return "LOW STOCK";
    } else {
      return "IN STOCK";
    }
  };

  // Format validation functions (show while typing)
  const validateDosageFormat = (dosage) => {
  if (!dosage || dosage.trim() === "") return "";
  
  const trimmedDosage = dosage.trim();
  
  // ✅ Units are now REQUIRED (no ? after unit group)
  const dosageRegex = /^(\d+(\.\d+)?)\s*(mg|g|ml|L|IU|µg|mcg|%)(\s*\/\s*\d+(\.\d+)?\s*(mg|g|ml|L)?)?$/i;
  
  if (!dosageRegex.test(trimmedDosage)) {
    if (/^\d+(\.\d+)?$/.test(trimmedDosage)) {
      return "Please include dosage unit (e.g., mg, ml, g, %, IU)";
    }
    return "Please enter a valid dosage format (e.g., 500mg, 10ml, 5mg/5ml)";
  }
  
  return "";
};

  const validateProductNameFormat = (value) => {
    if (!value || value.trim() === "") return "";
    if (value.trim().length < 2) {
      return "Product name must be at least 2 characters";
    }
    return "";
  };

  const validateBatchNumberFormat = (value, currentId = null) => {
    if (!value || value.trim() === "") return "";
    // Check for duplicate batch number (TC_018)
    const isDuplicate = inventoryData.some(item => 
      item.batch === value.trim() && item.id !== currentId
    );
    if (isDuplicate) {
      return "Batch number already exists";
    }
    return "";
  };

  // NEW: Duplicate Vendor ID validation (TC_130)
  const validateVendorIdFormat = (value, currentVendorName = "", currentId = null) => {
    if (!value || value.trim() === "") return "";

    const trimmedId = value.trim();
    const trimmedVendorName = currentVendorName.trim().toLowerCase();

    // Check 1: Is this vendor NAME already registered with a DIFFERENT vendor ID?
    // e.g. "Paracetmol" already has ID "1" — trying to use ID "3" should be blocked
    const vendorNameConflict = inventoryData.some(item => {
      if (currentId && item.id === currentId) return false; // skip current record
      return (
        item.vendor.trim().toLowerCase() === trimmedVendorName &&
        item.vendorCode !== trimmedId
      );
    });

    if (vendorNameConflict) {
      // Find what ID this vendor already uses
      const existingEntry = inventoryData.find(item =>
        item.vendor.trim().toLowerCase() === trimmedVendorName &&
        (currentId ? item.id !== currentId : true)
      );
      return `Vendor "${currentVendorName.trim()}" is already registered with ID "${existingEntry?.vendorCode}". Use the same ID.`;
    }

    // Check 2: Is this vendor ID already taken by a DIFFERENT vendor NAME?
    // e.g. ID "1" is used by "Paracetmol" — "Apollo" cannot also use ID "1"
    const vendorIdConflict = inventoryData.some(item => {
      if (currentId && item.id === currentId) return false; // skip current record
      return (
        item.vendorCode === trimmedId &&
        item.vendor.trim().toLowerCase() !== trimmedVendorName
      );
    });

    if (vendorIdConflict) {
      const existingEntry = inventoryData.find(item =>
        item.vendorCode === trimmedId &&
        item.vendor.trim().toLowerCase() !== trimmedVendorName &&
        (currentId ? item.id !== currentId : true)
      );
      return `Vendor ID "${trimmedId}" is already used by "${existingEntry?.vendor}".`;
    }

    return "";
  };

  const validateQuantityFormat = (value) => {
    if (!value || value.trim() === "") return "";
    const qty = parseInt(value);
    if (isNaN(qty)) {
      return "Quantity must be a valid number";
    }
    if (qty < 0) {
      return "Quantity cannot be negative";
    }
    if (qty === 0) {
      return "Quantity must be greater than 0";
    }
    return "";
  };

  // UPDATED: Add Quantity validation - should not accept 0 (TC_134)
  const validateAddQuantityFormat = (value) => {
    if (!value || value.trim() === "") return "";
    const qty = parseInt(value);
    if (isNaN(qty)) {
      return "Quantity must be a valid number";
    }
    if (qty <= 0) {
      return "Quantity must be greater than 0";
    }
    return "";
  };

  const validateUnitPriceFormat = (value) => {
    if (!value || value.trim() === "") return "";
    const price = parseFloat(value);
    if (isNaN(price)) {
      return "Unit price must be a valid number";
    }
    if (price < 0) {
      return "Unit price cannot be negative";
    }
    if (price === 0) {
      return "Unit price must be greater than 0";
    }
    return "";
  };

  // UPDATED: Status-quantity validation to match new calculation logic
  const validateStatusFormat = (status, quantity, isEditForm = false, currentQty = 0, addQty = 0) => {
    if (!status) return "";
    let totalQty = parseInt(quantity) || 0;
    if (isEditForm) {
      totalQty = currentQty + addQty;
    }
    
    const calculatedStatus = totalQty === 0 ? "OUT OF STOCK" : 
                            totalQty < 10 ? "LOW STOCK" : "IN STOCK";
    
    if (status !== calculatedStatus) {
      return `Status should be ${calculatedStatus} based on quantity ${totalQty}`;
    }
    return "";
  };

  // Auto-update status when quantity changes in Add form
  useEffect(() => {
    if (showAddStockPopup) {
      const qty = parseInt(newStock.quantity) || 0;
      const calculatedStatus = calculateStatus(qty);
      if (newStock.status !== calculatedStatus) {
        setNewStock(prev => ({
          ...prev,
          status: calculatedStatus
        }));
      }
    }
  }, [newStock.quantity, showAddStockPopup]);

  // Auto-update status when add_quantity changes in Edit form
  useEffect(() => {
    if (showEditStockPopup && editStockId) {
      const currentQty = inventoryData.find(item => item.id === editStockId)?.stock || 0;
      const addQty = parseInt(editStock.add_quantity) || 0;
      const totalQty = currentQty + addQty;
      
      const calculatedStatus = calculateStatus(totalQty);
      
      if (editStock.status !== calculatedStatus) {
        setEditStock(prev => ({
          ...prev,
          status: calculatedStatus
        }));
      }
    }
  }, [editStock.add_quantity, showEditStockPopup, editStockId]);

  // === API Functions (Updated to use axios) ===
  const fetchStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/stock/list");
      const data = response.data;
      const transformedData = data.map((item) => ({
        id: item.id,
        name: item.product_name,
        itemCode: item.item_code, 
        dosage: item.dosage || "",
        category: item.category,
        batch: item.batch_number,
        vendor: item.vendor,
        vendorCode: item.vendor_id,
        stock: item.quantity,
        status: calculateStatus(item.quantity), // Use calculated status
        item_code: item.item_code,
        rack_no: item.rack_no,
        shelf_no: item.shelf_no,
        unit_price: item.unit_price,
        raw: item,
      }));
      setInventoryData(transformedData);
    } catch (err) {
      console.error("Error fetching stocks:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Failed to fetch stocks";
      setError(errorMessage);
      errorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addStock = async (stockData) => {
    try {
      const response = await api.post("/stock/add", stockData);
      successToast("Stock added successfully!");
      return response.data;
    } catch (err) {
      console.error("Error adding stock:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Failed to add stock";
      errorToast(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateStock = async (stockId, stockData) => {
    try {
      const response = await api.put(`/stock/edit/${stockId}`, stockData);
      successToast("Stock updated successfully!");
      return response.data;
    } catch (err) {
      console.error("Error updating stock:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Failed to update stock";
      errorToast(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteStock = async (stockId) => {
    try {
      await api.delete(`/stock/delete/${stockId}`);
      successToast("Stock deleted successfully!");
      return true;
    } catch (err) {
      console.error("Error deleting stock:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Failed to delete stock";
      errorToast(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Helper function to map backend status to frontend status
  const mapStatusToFrontend = (backendStatus) => {
    const statusMap = {
      available: "IN STOCK",
      low_stock: "LOW STOCK",
      out_of_stock: "OUT OF STOCK",
      "IN STOCK": "IN STOCK",
      "LOW STOCK": "LOW STOCK",
      "OUT OF STOCK": "OUT OF STOCK",
    };
    return statusMap[backendStatus] || "IN STOCK";
  };

  // Helper function to map frontend status to backend status
  const mapStatusToBackend = (frontendStatus) => {
    const statusMap = {
      "IN STOCK": "available",
      "LOW STOCK": "low_stock",
      "OUT OF STOCK": "out_of_stock",
    };
    return statusMap[frontendStatus] || "available";
  };

  // Fetch stocks on component mount
  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openDropdownId &&
        !dropdownRefs.current[openDropdownId]?.contains(event.target)
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  // Required field validation (only for submission)
  const validateRequiredFields = (formData, isEditForm = false) => {
    const errors = {};
    const requiredFields = [
      "product_name",
      "dosage",
      "category",
      "batch_number",
      "vendor",
      "vendor_id",
      "item_code",
      "rack_no",
      "shelf_no",
      "unit_price",
      "status",
    ];

    // For add form, include quantity
    if (!isEditForm) {
      requiredFields.push("quantity");
    }

    requiredFields.forEach((field) => {
      if (
        !formData[field] ||
        (typeof formData[field] === "string" && formData[field].trim() === "")
      ) {
        const fieldLabel = field
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        errors[field] = `${fieldLabel} is required`;
      }
    });

    return errors;
  };

  // Format validation for all fields (called on submit)
  const validateAllFormats = (formData, isEditForm = false) => {
    const formatErrors = {
      product_name: validateProductNameFormat(formData.product_name),
      dosage: validateDosageFormat(formData.dosage),
      batch_number: validateBatchNumberFormat(formData.batch_number, isEditForm ? editStockId : null),
       vendor_id: validateVendorIdFormat(
        formData.vendor_id,
        formData.vendor || "",
        isEditForm ? editStockId : null
      ),
      quantity: isEditForm ? "" : validateQuantityFormat(formData.quantity),
      add_quantity: isEditForm ? validateAddQuantityFormat(formData.add_quantity) : "",
      unit_price: validateUnitPriceFormat(formData.unit_price),
    };

    // Status validation based on quantity
    if (isEditForm) {
      const currentQty = inventoryData.find(item => item.id === editStockId)?.stock || 0;
      const addQty = parseInt(formData.add_quantity) || 0;
      formatErrors.status = validateStatusFormat(formData.status, "", true, currentQty, addQty);
    } else {
      formatErrors.status = validateStatusFormat(formData.status, formData.quantity);
    }

    return formatErrors;
  };

  // Handle input change for Add form
  const handleAddInputChange = (field, value) => {
    setNewStock(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear any existing required field error for this field
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Perform real-time format validation
    let formatError = "";
    switch (field) {
      case "product_name":
        formatError = validateProductNameFormat(value);
        break;
      case "dosage":
        formatError = validateDosageFormat(value);
        break;
      case "batch_number":
        formatError = validateBatchNumberFormat(value);
        break;
 
      case "vendor_id":
        formatError = validateVendorIdFormat(value, newStock.vendor, null);
        break;
           case "vendor":
        // Re-validate vendor_id when vendor name changes
        if (newStock.vendor_id) {
          const vendorIdError = validateVendorIdFormat(newStock.vendor_id, value, null);
          if (vendorIdError) {
            setValidationErrors(prev => ({ ...prev, vendor_id: vendorIdError }));
          } else {
            setValidationErrors(prev => {
              const next = { ...prev };
              delete next.vendor_id;
              return next;
            });
          }
        }
        break;
      case "quantity":
        formatError = validateQuantityFormat(value);
        break;
      case "unit_price":
        formatError = validateUnitPriceFormat(value);
        break;
      case "status":
        const qty = parseInt(newStock.quantity) || 0;
        formatError = validateStatusFormat(value, qty);
        break;
      default:
        break;
    }

    if (formatError) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: formatError
      }));
    } else if (validationErrors[field]) {
      // Clear format error if validation passes
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle input change for Edit form
  const handleEditInputChange = (field, value) => {
    setEditStock(prev => {
      const newData = { ...prev, [field]: value };
      
      // Check if form has changed (TC_094)
      if (initialEditForm) {
        const hasChanged = Object.keys(newData).some(key => {
          if (key === 'add_quantity') return false;
          return newData[key] !== initialEditForm[key];
        });
        setIsEditFormChanged(hasChanged);
      }
      
      return newData;
    });
    
    // Clear any existing required field error for this field
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Perform real-time format validation
    let formatError = "";
    switch (field) {
      case "product_name":
        formatError = validateProductNameFormat(value);
        break;
      case "dosage":
        formatError = validateDosageFormat(value);
        break;
      case "batch_number":
        formatError = validateBatchNumberFormat(value, editStockId);
        break;
       case "vendor_id":
        formatError = validateVendorIdFormat(value, editStock.vendor, editStockId);
        break;
      case "add_quantity":
        formatError = validateAddQuantityFormat(value);
        break;
      case "unit_price":
        formatError = validateUnitPriceFormat(value);
        break;
      case "status":
        const currentQty = inventoryData.find(item => item.id === editStockId)?.stock || 0;
        const addQty = parseInt(editStock.add_quantity) || 0;
        formatError = validateStatusFormat(value, "", true, currentQty, addQty);
        break;
      default:
        break;
    }

    if (formatError) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: formatError
      }));
    } else if (validationErrors[field]) {
      // Clear format error if validation passes
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Popup handling functions
  const handleClosePopup = (popupType) => {
    if ((popupType === 'add' && Object.keys(newStock).some(key => 
        newStock[key] !== "" && key !== 'status' && newStock[key] !== "IN STOCK")) ||
        (popupType === 'edit' && isEditFormChanged)) {
      setPopupToClose(popupType);
      setShowCloseConfirm(true);
    } else {
      closePopup(popupType);
    }
  };

  const closePopup = (popupType) => {
    if (popupType === 'add') {
      setShowAddStockPopup(false);
      setNewStock({
        product_name: "",
        dosage: "",
        category: "",
        batch_number: "",
        vendor: "",
        vendor_id: "",
        quantity: "",
        item_code: "",
        rack_no: "",
        shelf_no: "",
        unit_price: "",
        status: "IN STOCK",
      });
      setValidationErrors({});
      setFieldErrors({});
      setIsSubmitted(false);
    } else if (popupType === 'edit') {
      setShowEditStockPopup(false);
      setEditStock({
        product_name: "",
        dosage: "",
        category: "",
        batch_number: "",
        vendor: "",
        vendor_id: "",
        add_quantity: "",
        item_code: "",
        rack_no: "",
        shelf_no: "",
        unit_price: "",
        status: "IN STOCK",
      });
      setEditStockId(null);
      setInitialEditForm(null);
      setIsEditFormChanged(false);
      setValidationErrors({});
      setFieldErrors({});
      setIsSubmitted(false);
    }
    setShowCloseConfirm(false);
    setPopupToClose(null);
  };

  const filteredData = inventoryData.filter((item) => {
    const matchesSearch = Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || calculateStatus(item.stock) === filterStatus;
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const sortedData = [...displayedData].sort((a, b) => {
    if (!sortColumn) return 0;
    const valA = a[sortColumn];
    const valB = b[sortColumn];
    if (typeof valA === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
  });

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
    setSelectAll(false);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handleSelectAll = () => {
    if (selectedRows.length === displayedData.length) {
      setSelectedRows([]);
      setSelectAll(false);
    } else {
      setSelectedRows(displayedData.map((row) => row.id));
      setSelectAll(true);
    }
  };

  const handleDeleteSingle = async (id) => {
    try {
      await deleteStock(id);
      await fetchStocks();
      setShowSingleDeletePopup(false);
      setSingleDeleteId(null);
    } catch (err) {
      console.error("Error deleting stock:", err);
      setError(err.message || "Failed to delete stock");
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const deletePromises = selectedRows.map((id) => deleteStock(id));
      await Promise.all(deletePromises);
      await fetchStocks();
      setSelectedRows([]);
      setSelectAll(false);
      setShowDeletePopup(false);
    } catch (err) {
      console.error("Error deleting selected stocks:", err);
      setError("Failed to delete some stocks");
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    // Check required fields
    const requiredErrors = validateRequiredFields(newStock, false);
    setFieldErrors(requiredErrors);

    // Check format validation
    const formatErrors = validateAllFormats(newStock, false);
    setValidationErrors(formatErrors);

    // Only submit if no errors
    if (Object.keys(requiredErrors).length === 0 && 
        !Object.values(formatErrors).some(error => error !== '')) {
      try {
        const stockData = {
          product_name: newStock.product_name.trim(),
          dosage: newStock.dosage.trim(),
          category: newStock.category,
          batch_number: newStock.batch_number.trim(),
          vendor: newStock.vendor.trim(),
          quantity: parseInt(newStock.quantity) || 0,
          vendor_id: newStock.vendor_id.trim(),
          item_code: newStock.item_code.trim(),
          rack_no: newStock.rack_no.trim(),
          shelf_no: newStock.shelf_no.trim(),
          unit_price: parseFloat(newStock.unit_price) || 0,
          status: mapStatusToBackend(newStock.status),
        };
        await addStock(stockData);
        await fetchStocks();
        setShowAddStockPopup(false);
        setNewStock({
          product_name: "",
          dosage: "",
          category: "",
          batch_number: "",
          vendor: "",
          vendor_id: "",
          quantity: "",
          item_code: "",
          rack_no: "",
          shelf_no: "",
          unit_price: "",
          status: "IN STOCK",
        });
        setValidationErrors({});
        setFieldErrors({});
        setIsSubmitted(false);
      } catch (err) {
        console.error("Error adding stock:", err);
        setError(err.message || "Failed to add stock");
      }
    } else {
      errorToast("Please fix all validation errors before saving.");
    }
  };

  const handleEditStock = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    // Check required fields
    const requiredErrors = validateRequiredFields(editStock, true);
    setFieldErrors(requiredErrors);

    // Check format validation
    const formatErrors = validateAllFormats(editStock, true);
    setValidationErrors(formatErrors);

    // Only submit if no errors
    if (Object.keys(requiredErrors).length === 0 && 
        !Object.values(formatErrors).some(error => error !== '')) {
      try {
        const stockData = {
          product_name: editStock.product_name.trim(),
          dosage: editStock.dosage.trim(),
          category: editStock.category,
          batch_number: editStock.batch_number.trim(),
          vendor: editStock.vendor.trim(),
          add_quantity: parseInt(editStock.add_quantity) || 0,
          vendor_id: editStock.vendor_id.trim(),
          item_code: editStock.item_code.trim(),
          rack_no: editStock.rack_no.trim(),
          shelf_no: editStock.shelf_no.trim(),
          unit_price: parseFloat(editStock.unit_price) || 0,
          status: mapStatusToBackend(editStock.status),
        };

        await updateStock(editStockId, stockData);
        await fetchStocks();
        setShowEditStockPopup(false);
        setEditStock({
          product_name: "",
          dosage: "",
          category: "",
          batch_number: "",
          vendor: "",
          vendor_id: "",
          add_quantity: "",
          item_code: "",
          rack_no: "",
          shelf_no: "",
          unit_price: "",
          status: "IN STOCK",
        });
        setEditStockId(null);
        setInitialEditForm(null);
        setIsEditFormChanged(false);
        setValidationErrors({});
        setFieldErrors({});
        setIsSubmitted(false);
      } catch (err) {
        console.error("Error updating stock:", err);
        setError(err.message || "Failed to update stock");
      }
    } else {
      errorToast("Please fix all validation errors before saving.");
    }
  };

  const openEditPopup = (item) => {
    const currentStockItem = inventoryData.find(
      (stock) => stock.id === item.id
    );
    const initialData = {
      product_name: item.name,
      dosage: item.dosage || "",
      category: item.category,
      batch_number: item.batch,
      vendor: item.vendor,
      vendor_id: item.vendorCode,
      add_quantity: "",
      status: calculateStatus(item.stock),
      item_code: item.item_code || "",
      rack_no: item.rack_no || "",
      shelf_no: item.shelf_no || "",
      unit_price: item.unit_price?.toString() || "0",
    };
    
    setEditStock(initialData);
    setInitialEditForm(initialData);
    setIsEditFormChanged(false);
    setEditStockId(item.id);
    setShowEditStockPopup(true);
    setValidationErrors({});
    setFieldErrors({});
    setIsSubmitted(false);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Calculate statistics from actual data
  const statistics = useMemo(() => {
    const totalStocks = inventoryData.length;
    const outOfStock = inventoryData.filter(
      (item) => calculateStatus(item.stock) === "OUT OF STOCK"
    ).length;
    const lowStock = inventoryData.filter(
      (item) => calculateStatus(item.stock) === "LOW STOCK"
    ).length;
    const totalValue = inventoryData.reduce((sum, item) => {
      return sum + item.stock * (item.unit_price || 0);
    }, 0);
    return {
      totalValue: `$${totalValue.toLocaleString()}`,
      inventoryStock: totalStocks,
      outOfStock: outOfStock,
      lowStock: lowStock,
    };
  }, [inventoryData]);

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

  // Get unique categories from data for filtering (TC_089)
  const uniqueCategories = [...new Set(inventoryData.map(item => item.category))];
  const allCategories = ["All", ...uniqueCategories];

  const Dropdown = ({
    label,
    value,
    onChange,
    options,
    error,
    required = true,
  }) => (
    <div>
      <label
        className="text-sm text-black dark:text-white mb-1 flex items-center gap-1"
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        {label}
        {required && <span className="text-[#FF2424]">*</span>}
      </label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1 w-full">
          <Listbox.Button
            className={`w-full h-[36px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]`}
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            {value || "Select Option"}
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-black dark:text-[#0EFF7B]" />
            </span>
          </Listbox.Button>
          {error && isSubmitted && (
            <p className="mt-1 text-[12px] text-[#FF2424]">{error}</p>
          )}
          <Listbox.Options className="absolute mt-1 w-full rounded-[8px] bg-gray-100 dark:bg-[#000000] shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A]">
            {options.map((option, idx) => (
              <Listbox.Option
                key={idx}
                value={option}
                className={({ active, selected }) =>
                  `cursor-pointer select-none py-2 px-3 text-sm rounded-[4px] ${
                    active
                      ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
                      : "text-black dark:text-white"
                  } ${
                    selected
                      ? "font-medium text-[#08994A] dark:text-[#0EFF7B]"
                      : ""
                  }`
                }
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                {option}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );

  if (loading && inventoryData.length === 0) {
    return (
      <div className="mt-[80px] mb-4 flex items-center justify-center h-64">
        <div className="text-black dark:text-white text-lg">
          Loading stock data...
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-[8px] p-4 w-full max-w-[2500px] mx-auto font-[Helvetica] flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}
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

      <div className="flex justify-between items-center mb-6 mt-4 w-full">
        <div>
          <h1
            className="text-[20px] font-medium text-black dark:text-white"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            Stock & Inventory
          </h1>
          <p
            className="text-[14px] mt-2 text-gray-600 dark:text-gray-400"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            Manage stock items, track inventory levels, and monitor stock status
            in real-time.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddStockPopup(true);
            setValidationErrors({});
            setFieldErrors({});
            setIsSubmitted(false);
          }}
          className="w-[200px] h-[40px] flex items-center justify-center bg-[linear-gradient(92.18deg,#025126_3.26%,#0D7F41_50.54%,#025126_97.83%)] border-b-[2px] border-[#0EFF7B] shadow-[0px_2px_12px_0px_#00000040] hover:opacity-90 text-white font-semibold px-4 py-2 rounded-[8px] transition duration-300 ease-in-out"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          + Add Stock
        </button>
      </div>

      <div className="flex items-center justify-between w-full mb-6 text-sm">
        <div className="flex gap-4">
          {["Today", "Week", "Month", "Year"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-md transition-all duration-300 ${
                activeFilter === filter
                  ? "bg-[#025126] text-white shadow-[0px_2px_12px_0px_#0EFF7B40]"
                  : "bg-gray-300 dark:bg-[#1E1E1E] text-black dark:text-gray-300 hover:bg-[#08994A]/30"
              }`}
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="text-gray-400"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Year
            </span>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="appearance-none bg-gray-100 dark:bg-[#0D0D0D] shadow-[0_0_4px_0_#0EFF7B] text-black dark:text-white border border-[#08994A] rounded-md px-4 py-1 pr-8 focus:outline-none"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-2 top-2 text-[#08994A] pointer-events-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-gray-400"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Month
            </span>
            <div className="relative">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="appearance-none bg-gray-100 dark:bg-[#0D0D0D] shadow-[0_0_4px_0_#0EFF7B] text-black dark:text-white border border-[#08994A] rounded-md px-4 py-1 pr-8 focus:outline-none"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-2 top-2 text-[#08994A] pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="bg-gray-200 dark:bg-[#0D0D0D] px-6 py-6 w-full h-[102px] rounded-2xl mb-6">
        <div className="grid grid-cols-4 gap-6 text-sm">
          {[
            {
              label: "Total Value",
              value: statistics.totalValue,
              icon: <DollarSign className="w-6 h-6 text-green-400" />,
              ring: "ring-green-600/60 bg-green-200/10 dark:bg-green-900/10",
            },
            {
              label: "Inventory Items",
              value: statistics.inventoryStock.toLocaleString(),
              icon: <Package className="w-6 h-6 text-amber-500" />,
              ring: "ring-amber-600/60 bg-amber-200/10 dark:bg-amber-900/10",
            },
            {
              label: "Out of Stock",
              value: statistics.outOfStock.toLocaleString(),
              icon: <AlertTriangle className="w-6 h-6 text-gray-400" />,
              ring: "ring-gray-600/60 bg-gray-200/10 dark:bg-gray-900/10",
            },
            {
              label: "Low Stock",
              value: statistics.lowStock.toLocaleString(),
              icon: <XCircle className="w-6 h-6 text-indigo-400" />,
              ring: "ring-indigo-600/60 bg-indigo-200/10 dark:bg-indigo-900/10",
            },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-[27px]">
              <div
                className={`flex items-center justify-center w-12 h-12 ml-6 rounded-full ring-2 ${stat.ring}`}
              >
                {stat.icon}
              </div>
              <div>
                <p
                  className="font-normal text-[12px] leading-[100%] tracking-normal text-black dark:text-white mb-3"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  {stat.label}
                </p>
                <p
                  className="font-bold text-[16px] leading-[100%] tracking-normal text-black dark:text-white"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap w-full gap-4 mb-6">
        {/* Department Stocks Card */}
        <div className="flex-1 min-w-[280px] lg:min-w-[350px] h-[200px] rounded-lg border border-[#0EFF7B1A] dark:border-[#0EFF7B1A] p-3 bg-gray-100 dark:bg-black shadow-[0px_0px_2px_0px_#A0A0A040]">
          <h3
            className="text-[#08994A] dark:text-[#0EFF7B] text-[14px] font-semibold mb-1"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            DEPARTMENT STOCKS
          </h3>
          <hr className="border-gray-300 dark:border-[#333] mb-6" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-5 mr-6">
              <div className="flex items-center gap-3">
                <span className="min-w-[14px] h-[14px] rounded-full bg-[#0EFF7B] inline-block"></span>
                <span
                  className="text-sm text-black dark:text-white"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  Medical Dept
                </span>
                <span
                  className="text-gray-600 dark:text-[#A0A0A0] text-sm"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  60%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="min-w-[14px] h-[14px] rounded-full bg-[#0A7239] inline-block"></span>
                <span
                  className="text-sm text-black dark:text-white"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  Surgical Dept
                </span>
                <span
                  className="text-gray-600 dark:text-[#A0A0A0] text-sm"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  30%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="min-w-[14px] h-[14px] rounded-full bg-[#D7FDE8] inline-block"></span>
                <span
                  className="text-sm text-black dark:text-white"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  Supportive &<br /> Diagnostic Dept
                </span>
                <span
                  className="text-gray-600 dark:text-[#A0A0A0] text-sm"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  10%
                </span>
              </div>
            </div>
            <svg viewBox="0 0 36 36" width="100" height="100">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="gray-200 dark:stroke-[#242424]"
                strokeWidth="4"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#18FF96"
                strokeWidth="4"
                strokeDasharray="60 100"
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#1AB873"
                strokeWidth="4"
                strokeDasharray="30 100"
                strokeDashoffset="60"
                strokeLinecap="round"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#C9FFE1"
                strokeWidth="4"
                strokeDasharray="10 100"
                strokeDashoffset="90"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Upcoming Stocks Card */}
        <div className="flex-1 min-w-[250px] h-[200px] rounded-lg border border-[#0EFF7B1A] dark:border-[#0EFF7B1A] p-3 bg-gray-100 dark:bg-black shadow-[0px_0px_2px_0px_#A0A0A040]">
          <h3 className="flex justify-between text-[15px] font-semibold mb-1">
            <span
              className="text-[#6E92FF] dark:text-[#6E92FF] text-[14px] uppercase flex items-center gap-1"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              <span>○</span> UPCOMING STOCKS
            </span>
            <span
              className="text-[#08994A] dark:text-[#0EFF7B] text-[12px] cursor-pointer"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              View all (80)
            </span>
          </h3>
          <hr className="border-gray-300 dark:border-[#222] mb-6" />
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span
                className="text-black dark:text-white"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Ibuprofen
              </span>
              <div className="flex gap-x-2">
                <span
                  className="text-[#08994A] dark:text-[#0EFF7B]"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  +145
                </span>
                <span
                  className="text-gray-600 dark:text-gray-400 text-xs"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  29 Aug 25
                </span>
              </div>
            </li>
            <li className="flex justify-between">
              <span
                className="text-black dark:text-white"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Amoxicillin
              </span>
              <div className="flex gap-x-2">
                <span
                  className="text-[#08994A] dark:text-[#0EFF7B]"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  +120
                </span>
                <span
                  className="text-gray-600 dark:text-gray-400 text-xs"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  29 Aug 25
                </span>
              </div>
            </li>
            <li className="flex justify-between">
              <span
                className="text-black dark:text-white"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Disinfectant skin antiseptic
              </span>
              <div className="flex gap-x-2">
                <span
                  className="text-[#08994A] dark:text-[#0EFF7B]"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  +200
                </span>
                <span
                  className="text-gray-600 dark:text-gray-400 text-xs"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  29 Aug 25
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* Expiring Stocks Card */}
        <div className="flex-1 min-w-[280px] lg:min-w-[350px] h-[200px] rounded-lg border border-[#0EFF7B1A] dark:border-[#0EFF7B1A] p-3 bg-gray-100 dark:bg-black shadow-[0px_0px_2px_0px_#A0A0A040]">
          <h3 className="flex justify-between text-[15px] font-semibold mb-1">
            <span
              className="text-[#FF2424] dark:text-[#FF2424] text-[14px] uppercase flex items-center gap-1"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              <span>○</span> EXPIRING STOCKS
            </span>
            <span
              className="text-[#08994A] dark:text-[#0EFF7B] text-[12px] cursor-pointer"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              View all (150)
            </span>
          </h3>
          <hr className="border-gray-300 dark:border-[#222] mb-4" />
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span
                className="text-black dark:text-white"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Mask 4-layered
              </span>
              <span
                className="text-gray-600 dark:text-gray-400 text-xs"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                30 available
              </span>
            </li>
            <li className="flex justify-between">
              <span
                className="text-black dark:text-white"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Disinfectant chlorhexidine bigluconate 0.05%
              </span>
              <span
                className="text-gray-600 dark:text-gray-400 text-xs"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                100 available
              </span>
            </li>
            <li className="flex justify-between">
              <span
                className="text-black dark:text-white"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Disinfectant skin antiseptic
              </span>
              <span
                className="text-gray-600 dark:text-gray-400 text-xs"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                150 available
              </span>
            </li>
          </ul>
        </div>
      </div>

      <h3
        className="w-full h-[22px] font-medium text-[18px] leading-[22px] tracking-normal text-black dark:text-white mb-1"
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        Stock list
      </h3>
      <p
        className="text-[14px] leading-[18px] text-[#A0A0A0] mt-3 mb-4"
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        List of all stock items ({inventoryData.length} total)
      </p>

      <div className="w-full bg-gray-100 dark:bg-[#0D0D0D] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[12px] p-4 space-y-4">
        <div className="flex justify-between items-center w-full">
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-[180px] h-[32px] flex justify-between items-center px-3 py-1.5 rounded-[20px] bg-gray-100 dark:bg-black shadow-[0_0_4px_0_#0EFF7B] border border-[#08994A] text-black dark:text-white text-[12px] font-medium"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              {selectedCategory || "All"}{" "}
              <ChevronDown
                size={16}
                className="text-[#08994A] dark:text-[#0EFF7B]"
              />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full mt-2 left-0 w-[180px] bg-gray-100 dark:bg-[#000000] p-2 rounded-[20px] border border-[#0EFF7B] dark:border-[#1E1E1E] shadow-[0_0_4px_0_#FFFFFF1F] z-10">
                <div className="max-h-36 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <ul className="text-black dark:text-white text-sm">
                    {allCategories.map((cat) => (
                      <li
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setShowCategoryDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-[#0EFF7B1A] dark:hover:bg-[#1E1E1E] rounded-[4px] cursor-pointer"
                        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                      >
                        {cat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group flex items-center gap-2 bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] rounded-[40px] px-3 py-2 min-w-[229px] max-w-md">
              <Search
                size={16}
                className="text-[#08994A] dark:text-[#0EFF7B]"
              />
              <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                Search
              </span>
              <input
                type="text"
                placeholder="Search Product Name.."
                className="bg-transparent outline-none text-sm text-[#08994A] placeholder-[#5CD592] dark:text-white w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterPopup(!showFilterPopup)}
                className="relative group bg-gray-100 dark:bg-[#0EFF7B1A] rounded-[20px] w-[32px] h-[32px] flex items-center justify-center text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A]"
              >
                <Filter size={16} className="text-[#0EFF7B]" />
                <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                  Filter
                </span>
              </button>
              {showFilterPopup && (
                <div className="absolute top-full mt-4 left-[-110px] w-[188px] gap-[12px] rounded-[20px] border border-[#0EFF7B] dark:border-[#1E1E1E] p-[18px_12px] bg-gray-100 dark:bg-[#000000E5] shadow-[0_0_4px_0_#FFFFFF1F] flex flex-col z-50">
                  <button
                    onClick={() => setFilterStatus("IN STOCK")}
                    className={`w-full h-[25px] flex items-center justify-start px-3 rounded text-[14px] text-left font-normal ${
                      filterStatus === "IN STOCK"
                        ? "bg-[#0EFF7B1A] dark:bg-[#1E1E1E] text-[#08994A] dark:text-[#0EFF7B]"
                        : "bg-transparent text-[#08994A] dark:text-[#0EFF7B] hover:bg-[#0EFF7B1A] dark:hover:bg-[#1E1E1E]"
                    }`}
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    <span className="w-[8px] h-[8px] rounded-full bg-[#08994A] dark:bg-[#0EFF7B] inline-block mr-2"></span>
                    IN STOCK
                  </button>
                  <button
                    onClick={() => setFilterStatus("LOW STOCK")}
                    className={`w-full h-[25px] flex items-center justify-start px-3 rounded text-[14px] text-left font-normal ${
                      filterStatus === "LOW STOCK"
                        ? "bg-[#0EFF7B1A] dark:bg-[#1E1E1E] text-[#FF930E] dark:text-[#FF930E]"
                        : "bg-transparent text-[#FF930E] dark:text-[#FF930E] hover:bg-[#0EFF7B1A] dark:hover:bg-[#1E1E1E]"
                    }`}
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    <span className="w-[8px] h-[8px] rounded-full bg-[#FF930E] inline-block mr-2"></span>
                    LOW STOCK
                  </button>
                  <button
                    onClick={() => setFilterStatus("OUT OF STOCK")}
                    className={`w-full h-[25px] flex items-center justify-start px-3 rounded text-[14px] text-left font-normal ${
                      filterStatus === "OUT OF STOCK"
                        ? "bg-[#0EFF7B1A] dark:bg-[#1E1E1E] text-[#FF2424] dark:text-[#FF2424]"
                        : "bg-transparent text-[#FF2424] dark:text-[#FF2424] hover:bg-[#0EFF7B1A] dark:hover:bg-[#1E1E1E]"
                    }`}
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    <span className="w-[8px] h-[8px] rounded-full bg-[#FF2424] inline-block mr-2"></span>
                    OUT OF STOCK
                  </button>
                  <div className="h-px bg-gray-300 dark:bg-[#3A3A3A] my-1"></div>
                  <button
                    onClick={() => {
                      setFilterStatus("All");
                      setShowFilterPopup(false);
                    }}
                    className="w-full h-[25px] flex items-center justify-start px-3 rounded text-[14px] text-left font-normal bg-transparent text-gray-600 dark:text-gray-400 hover:bg-[#0EFF7B1A] dark:hover:bg-[#1E1E1E] hover:text-[#08994A] dark:hover:text-[#0EFF7B]"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    <span className="w-[8px] h-[8px] rounded-full bg-gray-400 dark:bg-gray-600 inline-block mr-2"></span>
                    RESET
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() =>
                selectedRows.length > 0 && setShowDeletePopup(true)
              }
              disabled={selectedRows.length === 0}
              className={`relative group flex items-center justify-center w-[32px] h-[32px] rounded-[20px] bg-gray-100 dark:bg-[#0EFF7B1A] text-[#08994A] dark:text-white ${
                selectedRows.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Trash2 size={16} className="text-[#0EFF7B]" />
              <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
                Delete
              </span>
            </button>
          </div>
        </div>

        <div className="overflow-x-hidden">
          <table className="w-full border-collapse rounded-[8px] min-w-[800px]">
            <thead className="border border-[#0EFF7B] dark:border-[#3C3C3C] bg-gray-200 dark:bg-[#091810] h-[52px] text-left text-sm text-[#08994A] dark:text-white">
              <tr className="h-[52px] bg-gray-200 dark:bg-[#091810] text-left text-[16px] text-[#0EFF7B] dark:text-[#0EFF7B] rounded-[8px] ">
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                    checked={
                      displayedData.length > 0 &&
                      selectedRows.length === displayedData.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                {[
                  { label: "Name", key: "name" },
                  { label: "Item Code", key: "itemCode" },
                  { label: "Dosage", key: "dosage" },
                  { label: "Categories", key: "category" },
                  { label: "Batch number", key: "batch" },
                  { label: "Vendor", key: "vendor" },
                  { label: "Available stocks", key: "stock" },
                  { label: "Status", key: "status" },
                  { label: "Action", key: "action" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-3 font-medium ${
                      col.key !== "action" ? "cursor-pointer select-none" : ""
                    }`}
                    onClick={
                      col.key !== "action"
                        ? () => handleSort(col.key)
                        : undefined
                    }
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    {col.key !== "action" ? (
                      <div className="flex items-center gap-1">
                        {col.label}
                        <div className="flex flex-col ml-1">
                          <svg
                            className={`w-3 h-3 ${
                              sortColumn === col.key && sortOrder === "asc"
                                ? "stroke-[#08994A] dark:stroke-[#0EFF7B]"
                                : "stroke-gray-500"
                            }`}
                            viewBox="0 0 20 20"
                            fill="none"
                            strokeWidth="2"
                          >
                            <path
                              d="M10 4 L16 10 L4 10 Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <svg
                            className={`w-3 h-3 ${
                              sortColumn === col.key && sortOrder === "desc"
                                ? "stroke-[#0EFF7B] dark:stroke-[#0EFF7B]"
                                : "stroke-gray-500"
                            }`}
                            viewBox="0 0 20 20"
                            fill="none"
                            strokeWidth="2"
                          >
                            <path
                              d="M10 16 L16 10 L4 10 Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm bg-gray-100 dark:bg-transparent">
              {sortedData.length > 0 ? (
                sortedData.map((row, index) => (
                  <tr
                    key={row.id}
                    className="w-full h-[62px] bg-gray-100 dark:bg-transparent px-[12px] py-[12px] border-b border-gray-300 dark:border-[#1E1E1E] relative hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleRowSelect(row.id)}
                      />
                    </td>
                    <td
                      className="px-3 py-3 text-black dark:text-white"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                    >
                      {row.name}
                    </td>
                    <td
                      className="px-3 py-3 text-black dark:text-white"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                    >
                      {row.itemCode}
                    </td>
                    <td
                      className="px-3 py-3 text-black dark:text-white"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                    >
                      {row.dosage}
                    </td>
                    <td
                      className="px-3 py-3 text-black dark:text-white"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                    >
                      {row.category}
                    </td>
                    <td
                      className="px-3 py-3 text-black dark:text-white"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                    >
                      {row.batch}
                    </td>
                    <td
                      className="px-3 py-3 text-black dark:text-white"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                    >
                      {row.vendor}{" "}
                      <span className="text-gray-500 ml-1">
                        ({row.vendorCode})
                      </span>
                    </td>
                    <td
                      className="px-3 py-3 text-black dark:text-white"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                    >
                      {row.stock}
                    </td>
                    <td className="px-3 py-3 font-medium">
                      <span
                        className={`${
                          calculateStatus(row.stock) === "IN STOCK"
                            ? "text-green-500"
                            : calculateStatus(row.stock) === "LOW STOCK"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                      >
                        • {calculateStatus(row.stock)}
                      </span>
                    </td>
                    <td className="px-3 py-3 relative">
                      <button
                        className="text-gray-600 dark:text-gray-400 hover:text-[#08994A] dark:hover:text-[#0EFF7B]"
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === row.id ? null : row.id
                          )
                        }
                      >
                        <MoreVertical size={16} />
                      </button>
                      <div
                        ref={(el) => (dropdownRefs.current[row.id] = el)}
                        className={`absolute right-0 bg-gray-100 dark:bg-[#000000E5] border border-[#0EFF7B] dark:border-[#1E1E1E] rounded-[8px] shadow-[0_0_4px_0_#FFFFFF1F] w-[120px] py-1 z-50 ${
                          openDropdownId === row.id ? "block" : "hidden"
                        } ${
                          index >= sortedData.length - 3
                            ? "bottom-0 mb-8"
                            : "top-0 mt-8"
                        }`}
                      >
                        <button
                          onClick={() => {
                            openEditPopup(row);
                            setOpenDropdownId(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-black dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A]"
                          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                        >
                          <Edit2
                            size={14}
                            className="text-[#08994A] dark:text-[#0EFF7B]"
                          />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSingleDeleteId(row.id);
                            setShowSingleDeletePopup(true);
                            setOpenDropdownId(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-black dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A]"
                          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                        >
                          <Trash2 size={14} className="text-red-500" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="h-[62px] bg-gray-100 dark:bg-black">
                  <td
                    colSpan="9"
                    className="text-center py-6 text-gray-600 dark:text-gray-400 italic"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    {loading ? "Loading..." : "No inventory found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            Page{" "}
            <span className="text-[#08994A] dark:text-[#0EFF7B]">
              {currentPage}
            </span>{" "}
            of {totalPages} ({(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length})
          </span>
          <button
            onClick={handlePrevPage}
            className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
              currentPage === 1
                ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
                : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
            }`}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={12} className="text-[#08994A] dark:text-white" />
          </button>
          <button
            onClick={handleNextPage}
            className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
              currentPage === totalPages
                ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
                : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
            }`}
            disabled={currentPage === totalPages}
          >
            <ChevronRight
              size={12}
              className="text-[#08994A] dark:text-white"
            />
          </button>
        </div>
      </div>

      {/* Add Stock Popup */}
      {showAddStockPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
            <div
              className="w-[780px] rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-black dark:text-white font-medium text-[18px] leading-[21px]">
                  Add New Stock
                </h2>
                <button
                  onClick={() => handleClosePopup('add')}
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#0EFF7B33] transition"
                >
                  <X size={18} className="text-black dark:text-white" />
                </button>
              </div>

              <form onSubmit={handleAddStock} noValidate>
                <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Product Name<span className="text-[#FF2424]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter product name"
                      value={newStock.product_name}
                      onChange={(e) => {
                        if (e.target.value.length <= FIELD_LIMITS.product_name) {
                          handleAddInputChange('product_name', e.target.value);
                        }
                      }}
                      maxLength={FIELD_LIMITS.product_name}
                      className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#0EFF7B] transition"
                    />
                    {/* Format validation error - shows while typing */}
                    {validationErrors.product_name && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {validationErrors.product_name}
                      </p>
                    )}
                    {/* Required field error - only shows after submit attempt */}
                    {isSubmitted && fieldErrors.product_name && !validationErrors.product_name && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {fieldErrors.product_name}
                      </p>
                    )}
                    {newStock.product_name.length === FIELD_LIMITS.product_name && (
                      <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
                        Maximum {FIELD_LIMITS.product_name} characters reached
                      </p>
                    )}
                  </div>

                  {/* Dosage */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Dosage<span className="text-[#FF2424]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 500mg, 10ml"
                      value={newStock.dosage}
                      onChange={(e) => {
                        if (e.target.value.length <= FIELD_LIMITS.dosage) {
                          handleAddInputChange('dosage', e.target.value);
                        }
                      }}
                      maxLength={FIELD_LIMITS.dosage}
                      className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#0EFF7B] transition"
                    />
                    {validationErrors.dosage && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {validationErrors.dosage}
                      </p>
                    )}
                    {isSubmitted && fieldErrors.dosage && !validationErrors.dosage && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {fieldErrors.dosage}
                      </p>
                    )}
                    {newStock.dosage.length === FIELD_LIMITS.dosage && (
                      <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
                        Maximum {FIELD_LIMITS.dosage} characters reached
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Category<span className="text-[#FF2424]">*</span>
                    </label>
                    <Listbox value={newStock.category} onChange={(val) => handleAddInputChange('category', val)}>
                      <div className="relative mt-1 w-full">
                        <Listbox.Button
                          className="w-full h-[36px] px-3 pr-8 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]"
                          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                        >
                          {newStock.category || "Select Option"}
                          <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-black dark:text-[#0EFF7B]" />
                          </span>
                        </Listbox.Button>
                        {isSubmitted && fieldErrors.category && (
                          <p className="mt-1 text-[12px] text-[#FF2424]">{fieldErrors.category}</p>
                        )}
                        <Listbox.Options className="absolute mt-1 w-full rounded-[8px] bg-gray-100 dark:bg-[#000000] shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A]">
                          {categories.map((option, idx) => (
                            <Listbox.Option
                              key={idx}
                              value={option}
                              className={({ active, selected }) =>
                                `cursor-pointer select-none py-2 px-3 text-sm rounded-[4px] ${
                                  active
                                    ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
                                    : "text-black dark:text-white"
                                } ${
                                  selected
                                    ? "font-medium text-[#08994A] dark:text-[#0EFF7B]"
                                    : ""
                                }`
                              }
                              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                            >
                              {option}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </div>
                    </Listbox>
                  </div>

                  {/* Batch Number */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Batch Number<span className="text-[#FF2424]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Batch Number"
                      value={newStock.batch_number}
                      onChange={(e) => {
                        if (e.target.value.length <= FIELD_LIMITS.batch_number) {
                          handleAddInputChange('batch_number', e.target.value);
                        }
                      }}
                      maxLength={FIELD_LIMITS.batch_number}
                      className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
                    />
                    {validationErrors.batch_number && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {validationErrors.batch_number}
                      </p>
                    )}
                    {isSubmitted && fieldErrors.batch_number && !validationErrors.batch_number && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {fieldErrors.batch_number}
                      </p>
                    )}
                    {newStock.batch_number.length === FIELD_LIMITS.batch_number && (
                      <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
                        Maximum {FIELD_LIMITS.batch_number} characters reached
                      </p>
                    )}
                  </div>

                  {/* Vendor */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Vendor<span className="text-[#FF2424]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Vendor"
                      value={newStock.vendor}
                      onChange={(e) => {
                        if (e.target.value.length <= FIELD_LIMITS.vendor) {
                          handleAddInputChange('vendor', e.target.value);
                        }
                      }}
                      maxLength={FIELD_LIMITS.vendor}
                      className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
                    />
                    {isSubmitted && fieldErrors.vendor && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {fieldErrors.vendor}
                      </p>
                    )}
                    {newStock.vendor.length === FIELD_LIMITS.vendor && (
                      <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
                        Maximum {FIELD_LIMITS.vendor} characters reached
                      </p>
                    )}
                  </div>

                  {/* Vendor ID */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Vendor ID<span className="text-[#FF2424]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Vendor ID"
                      value={newStock.vendor_id}
                      onChange={(e) => {
                        if (e.target.value.length <= FIELD_LIMITS.vendor_id) {
                          handleAddInputChange('vendor_id', e.target.value);
                        }
                      }}
                      maxLength={FIELD_LIMITS.vendor_id}
                      className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
                    />
                    {validationErrors.vendor_id && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {validationErrors.vendor_id}
                      </p>
                    )}
                    {isSubmitted && fieldErrors.vendor_id && !validationErrors.vendor_id && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {fieldErrors.vendor_id}
                      </p>
                    )}
                    {newStock.vendor_id.length === FIELD_LIMITS.vendor_id && (
                      <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
                        Maximum {FIELD_LIMITS.vendor_id} characters reached
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Quantity<span className="text-[#FF2424]">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Stock Quantity"
                      value={newStock.quantity}
                      onChange={(e) => {
                        handleAddInputChange('quantity', e.target.value);
                      }}
                      className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
                      min="1"
                    />
                    {validationErrors.quantity && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {validationErrors.quantity}
                      </p>
                    )}
                    {isSubmitted && fieldErrors.quantity && !validationErrors.quantity && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {fieldErrors.quantity}
                      </p>
                    )}
                  </div>

                  {/* Item Code */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Item Code<span className="text-[#FF2424]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Item Code"
                      value={newStock.item_code}
                      onChange={(e) => {
                        if (e.target.value.length <= FIELD_LIMITS.item_code) {
                          handleAddInputChange('item_code', e.target.value);
                        }
                      }}
                      maxLength={FIELD_LIMITS.item_code}
                      className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
                    />
                    {isSubmitted && fieldErrors.item_code && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {fieldErrors.item_code}
                      </p>
                    )}
                    {newStock.item_code.length === FIELD_LIMITS.item_code && (
                      <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
                        Maximum {FIELD_LIMITS.item_code} characters reached
                      </p>
                    )}
                  </div>

                  {/* Rack No */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Rack No<span className="text-[#FF2424]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Rack No"
                      value={newStock.rack_no}
                      onChange={(e) => {
                        if (e.target.value.length <= FIELD_LIMITS.rack_no) {
                          handleAddInputChange('rack_no', e.target.value);
                        }
                      }}
                      maxLength={FIELD_LIMITS.rack_no}
                      className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
                    />
                    {isSubmitted && fieldErrors.rack_no && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {fieldErrors.rack_no}
                      </p>
                    )}
                    {newStock.rack_no.length === FIELD_LIMITS.rack_no && (
                      <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
                        Maximum {FIELD_LIMITS.rack_no} characters reached
                      </p>
                    )}
                  </div>

                  {/* Shelf No */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Shelf No<span className="text-[#FF2424]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Shelf Number"
                      value={newStock.shelf_no}
                      onChange={(e) => {
                        if (e.target.value.length <= FIELD_LIMITS.shelf_no) {
                          handleAddInputChange('shelf_no', e.target.value);
                        }
                      }}
                      maxLength={FIELD_LIMITS.shelf_no}
                      className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
                    />
                    {isSubmitted && fieldErrors.shelf_no && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {fieldErrors.shelf_no}
                      </p>
                    )}
                    {newStock.shelf_no.length === FIELD_LIMITS.shelf_no && (
                      <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
                        Maximum {FIELD_LIMITS.shelf_no} characters reached
                      </p>
                    )}
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Unit Price<span className="text-[#FF2424]">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter Unit Price"
                      value={newStock.unit_price}
                      onChange={(e) => {
                        handleAddInputChange('unit_price', e.target.value);
                      }}
                      className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
                      step="0.01"
                      min="0.01"
                    />
                    {validationErrors.unit_price && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {validationErrors.unit_price}
                      </p>
                    )}
                    {isSubmitted && fieldErrors.unit_price && !validationErrors.unit_price && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {fieldErrors.unit_price}
                      </p>
                    )}
                  </div>

                  {/* Status - Auto-calculated, read-only */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Status<span className="text-[#FF2424]">*</span>
                    </label>
                    <div className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] text-black dark:text-white flex items-center">
                      {newStock.status}
                    </div>
                    {validationErrors.status && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">{validationErrors.status}</p>
                    )}
                    {isSubmitted && fieldErrors.status && !validationErrors.status && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">{fieldErrors.status}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-center gap-6 mt-8">
                  <button
                    type="button"
                    onClick={() => handleClosePopup('add')}
                    className="w-[160px] h-[40px] rounded-[10px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[15px] hover:bg-gray-50 dark:hover:bg-[#0EFF7B22] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-[160px] h-[40px] rounded-[10px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium text-[15px] hover:scale-105 transition shadow-lg"
                  >
                    Add Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Stock Popup */}
      {showEditStockPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
            <div
              className="w-[780px] rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-black dark:text-white font-medium text-[18px] leading-[21px]">
                  Edit Stock
                </h2>
                <button
                  onClick={() => handleClosePopup('edit')}
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#0EFF7B33] transition"
                >
                  <X size={18} className="text-black dark:text-white" />
                </button>
              </div>

              <form onSubmit={handleEditStock} noValidate>
                <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                  {/* Product Name - Read-only (TC_135) */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      Product Name
                    </label>
                    <div className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] text-black dark:text-white flex items-center">
                      {editStock.product_name}
                    </div>
                  </div>

                  {/* Dosage - Read-only (TC_135) */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      Dosage
                    </label>
                    <div className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] text-black dark:text-white flex items-center">
                      {editStock.dosage}
                    </div>
                  </div>

                  {/* Category - Read-only (TC_135) */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      Category
                    </label>
                    <div className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] text-black dark:text-white flex items-center">
                      {editStock.category}
                    </div>
                  </div>

                  {/* Batch Number - Read-only (TC_135) */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      Batch Number
                    </label>
                    <div className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] text-black dark:text-white flex items-center">
                      {editStock.batch_number}
                    </div>
                  </div>

                  {/* Vendor - Read-only (TC_135) */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      Vendor
                    </label>
                    <div className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] text-black dark:text-white flex items-center">
                      {editStock.vendor}
                    </div>
                  </div>

                  {/* Vendor ID - Read-only (TC_135) */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      Vendor ID
                    </label>
                    <div className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] text-black dark:text-white flex items-center">
                      {editStock.vendor_id}
                    </div>
                  </div>

                  {/* Add Quantity - Editable (TC_134 & TC_135) */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Add Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="Enter quantity to add"
                      value={editStock.add_quantity}
                      onChange={(e) => {
                        handleEditInputChange('add_quantity', e.target.value);
                      }}
                      className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
                      min="1"
                    />
                    {validationErrors.add_quantity && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {validationErrors.add_quantity}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Current stock will be increased by this amount
                    </p>
                  </div>

                  {/* Current Quantity (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      Current Quantity
                    </label>
                    <div className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] text-black dark:text-white flex items-center">
                      {inventoryData.find((item) => item.id === editStockId)
                        ?.stock || 0}
                    </div>
                  </div>

                  {/* Item Code - Read-only (TC_135) */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      Item Code
                    </label>
                    <div className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] text-black dark:text-white flex items-center">
                      {editStock.item_code}
                    </div>
                  </div>

                  {/* Rack No - Editable (TC_135) */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Rack No<span className="text-[#FF2424]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Rack No"
                      value={editStock.rack_no}
                      onChange={(e) => {
                        if (e.target.value.length <= FIELD_LIMITS.rack_no) {
                          handleEditInputChange('rack_no', e.target.value);
                        }
                      }}
                      maxLength={FIELD_LIMITS.rack_no}
                      className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
                    />
                    {isSubmitted && fieldErrors.rack_no && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {fieldErrors.rack_no}
                      </p>
                    )}
                    {editStock.rack_no.length === FIELD_LIMITS.rack_no && (
                      <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
                        Maximum {FIELD_LIMITS.rack_no} characters reached
                      </p>
                    )}
                  </div>

                  {/* Shelf No - Editable (TC_135) */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Shelf No<span className="text-[#FF2424]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Shelf Number"
                      value={editStock.shelf_no}
                      onChange={(e) => {
                        if (e.target.value.length <= FIELD_LIMITS.shelf_no) {
                          handleEditInputChange('shelf_no', e.target.value);
                        }
                      }}
                      maxLength={FIELD_LIMITS.shelf_no}
                      className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
                    />
                    {isSubmitted && fieldErrors.shelf_no && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {fieldErrors.shelf_no}
                      </p>
                    )}
                    {editStock.shelf_no.length === FIELD_LIMITS.shelf_no && (
                      <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">
                        Maximum {FIELD_LIMITS.shelf_no} characters reached
                      </p>
                    )}
                  </div>

                  {/* Unit Price - Editable (TC_135) */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Unit Price<span className="text-[#FF2424]">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter Unit Price"
                      value={editStock.unit_price}
                      onChange={(e) => {
                        handleEditInputChange('unit_price', e.target.value);
                      }}
                      className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none focus:border-[#0EFF7B] transition"
                      step="0.01"
                      min="0.01"
                    />
                    {validationErrors.unit_price && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {validationErrors.unit_price}
                      </p>
                    )}
                    {isSubmitted && fieldErrors.unit_price && !validationErrors.unit_price && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">
                        {fieldErrors.unit_price}
                      </p>
                    )}
                  </div>

                  {/* Status - Auto-calculated, read-only */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1">
                      Status
                    </label>
                    <div className="w-full h-[36px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] text-black dark:text-white flex items-center">
                      {editStock.status}
                    </div>
                    {validationErrors.status && (
                      <p className="mt-1 text-[12px] text-[#FF2424]">{validationErrors.status}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-center gap-6 mt-8">
                  <button
                    type="button"
                    onClick={() => handleClosePopup('edit')}
                    className="w-[160px] h-[40px] rounded-[10px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[15px] hover:bg-gray-50 dark:hover:bg-[#0EFF7B22] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-[160px] h-[40px] rounded-[10px] bg-gradient-to-r from-[#14DC6F] to-[#09753A] text-white font-medium text-[15px] transition shadow-lg hover:scale-105"
                  >
                    Update Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Popups */}
      {showSingleDeletePopup && (
        <DeleteStockList
          onConfirm={() => handleDeleteSingle(singleDeleteId)}
          onCancel={() => {
            setShowSingleDeletePopup(false);
            setSingleDeleteId(null);
          }}
          itemsToDelete={[singleDeleteId]}
        />
      )}
      {showDeletePopup && (
        <DeleteStockList
          onConfirm={handleDeleteSelected}
          onCancel={() => setShowDeletePopup(false)}
          itemsToDelete={selectedRows}
        />
      )}

      {/* Close Confirmation Popup (TC_095) */}
      {showCloseConfirm && (
        <CloseConfirmPopup
          onConfirm={() => closePopup(popupToClose)}
          onCancel={() => {
            setShowCloseConfirm(false);
            setPopupToClose(null);
          }}
        />
      )}
    </div>
  );
};

export default StockInventory;