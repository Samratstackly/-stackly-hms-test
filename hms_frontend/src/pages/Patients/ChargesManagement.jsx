// ChargesManagement.jsx (COMPLETE UPDATED CODE)
import React, { useState, useEffect } from "react";
import {
  Search,
  Pencil,
  Plus,
  Trash,
  X,
  Loader2,
  DollarSign,
  Package,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Dialog } from "@headlessui/react";
import api from "../../utils/axiosConfig.js";
import { successToast, errorToast } from "../../components/Toast.jsx";

const ChargesManagement = () => {
  // State for charges
  const [charges, setCharges] = useState([]);
  const [filteredCharges, setFilteredCharges] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalCharges, setTotalCharges] = useState(0);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Selected charge
  const [selectedCharge, setSelectedCharge] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    charge: "",
    unit_price: "",
    description: "",
  });
  
  const [editFormData, setEditFormData] = useState({
    charge: "",
    unit_price: "",
    description: "",
  });
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});
  const [editValidationErrors, setEditValidationErrors] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initialize - fetch charges on component mount
  useEffect(() => {
    fetchCharges();
  }, []);

  // Filter charges based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCharges(charges);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredCharges(
        charges.filter(
          (c) =>
            c.charge.toLowerCase().includes(lowerQuery) ||
            (c.description && c.description.toLowerCase().includes(lowerQuery))
        )
      );
    }
  }, [searchQuery, charges]);

  // Fetch all charges
  const fetchCharges = async () => {
    try {
      setLoading(true);
      const res = await api.get("/charges/", {
        params: searchQuery ? { search: searchQuery } : {}
      });
      
      console.log("Charges response:", res.data);
      
      // Handle response - it should be a direct array
      let chargesData = [];
      let totalCount = 0;
      
      if (Array.isArray(res.data)) {
        chargesData = res.data;
        totalCount = res.data.length;
      } else if (res.data && Array.isArray(res.data.data)) {
        chargesData = res.data.data;
        totalCount = res.data.total || res.data.data.length;
      } else if (res.data && res.data.success === true && Array.isArray(res.data.data)) {
        chargesData = res.data.data;
        totalCount = res.data.total || res.data.data.length;
      }
      
      setCharges(chargesData);
      setFilteredCharges(chargesData);
      setTotalCharges(totalCount);
    } catch (err) {
      console.error("Failed to load charges:", err);
      errorToast("Failed to load charges");
      setCharges([]);
      setFilteredCharges([]);
      setTotalCharges(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    fetchCharges();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      charge: "",
      unit_price: "",
      description: "",
    });
    setValidationErrors({});
  };

  // Reset edit form
  const resetEditForm = () => {
    setEditFormData({
      charge: "",
      unit_price: "",
      description: "",
    });
    setEditValidationErrors({});
  };

  // Handle form change
  const handleFormChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({
        ...validationErrors,
        [field]: null,
      });
    }
  };

  // Handle edit form change
  const handleEditFormChange = (field, value) => {
    setEditFormData({
      ...editFormData,
      [field]: value,
    });
    
    // Clear validation error for this field
    if (editValidationErrors[field]) {
      setEditValidationErrors({
        ...editValidationErrors,
        [field]: null,
      });
    }
  };

  // Validate form
  const validateForm = (data) => {
    const errors = {};
    
    if (!data.charge.trim()) {
      errors.charge = "Charge name is required";
    }
    
    if (!data.unit_price) {
      errors.unit_price = "Unit price is required";
    } else if (parseFloat(data.unit_price) <= 0) {
      errors.unit_price = "Unit price must be greater than 0";
    }
    
    return errors;
  };

  // Handle add charge
  const handleAddCharge = async () => {
    const errors = validateForm(formData);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const chargeData = {
        charge: formData.charge.trim(),
        unit_price: parseFloat(formData.unit_price),
        description: formData.description.trim() || null,
      };
      
      console.log("Creating charge:", chargeData);
      
      const res = await api.post("/charges/", chargeData);
      
      successToast("Charge added successfully");
      setShowAddModal(false);
      resetForm();
      
      // Refresh charges list
      await fetchCharges();
      
    } catch (err) {
      console.error("Failed to add charge:", err);
      
      if (err.response?.data?.detail) {
        errorToast(err.response.data.detail);
      } else {
        errorToast("Failed to add charge");
      }
    }
  };

  // Handle edit charge
  const handleEditCharge = async () => {
    if (!selectedCharge) return;
    
    const errors = validateForm(editFormData);
    
    if (Object.keys(errors).length > 0) {
      setEditValidationErrors(errors);
      return;
    }

    try {
      const chargeData = {
        charge: editFormData.charge.trim(),
        unit_price: parseFloat(editFormData.unit_price),
        description: editFormData.description.trim() || null,
      };
      
      console.log("Updating charge:", selectedCharge.id, chargeData);
      
      const res = await api.put(`/charges/${selectedCharge.id}/`, chargeData);
      
      successToast("Charge updated successfully");
      setShowEditModal(false);
      setSelectedCharge(null);
      resetEditForm();
      
      // Refresh charges list
      await fetchCharges();
      
    } catch (err) {
      console.error("Failed to update charge:", err);
      
      if (err.response?.data?.detail) {
        errorToast(err.response.data.detail);
      } else {
        errorToast("Failed to update charge");
      }
    }
  };

  // Handle delete charge
  const handleDeleteCharge = async () => {
    if (!selectedCharge) return;

    try {
      await api.delete(`/charges/${selectedCharge.id}/`);
      
      successToast("Charge deleted successfully");
      setShowDeleteModal(false);
      setSelectedCharge(null);
      
      // Refresh charges list
      await fetchCharges();
      
    } catch (err) {
      console.error("Failed to delete charge:", err);
      
      if (err.response?.data?.detail) {
        errorToast(err.response.data.detail);
      } else {
        errorToast("Failed to delete charge");
      }
    }
  };

  // Open edit modal
  const openEditModal = (charge) => {
    setSelectedCharge(charge);
    setEditFormData({
      charge: charge.charge,
      unit_price: charge.unit_price.toString(),
      description: charge.description || "",
    });
    setEditValidationErrors({});
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (charge) => {
    setSelectedCharge(charge);
    setShowDeleteModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Calculate displayed charges
  const displayedCharges = filteredCharges.length;

  // Pagination
  const totalPages = Math.ceil(filteredCharges.length / itemsPerPage);
  const currentCharges = filteredCharges.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full max-w-screen-2xl mb-4 mx-auto">
      <div className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-6 w-full max-w-[2500px] mx-auto flex flex-col overflow-hidden relative font-[Helvetica]">
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
        <div className="flex justify-between items-center mb-2 relative z-10">
          <h2 className="text-black dark:text-white font-[Helvetica] text-xl font-semibold">
            Charges Management
          </h2>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-[linear-gradient(92.18deg,#025126_3.26%,#0D7F41_50.54%,#025126_97.83%)] border-b-[2px] border-[#0EFF7B] shadow-[0px_2px_12px_0px_#00000040] hover:opacity-90 text-white font-semibold px-4 py-2 rounded-[8px] transition duration-300 ease-in-out"
          >
            <Plus size={18} className="text-white font-[Helvetica]" /> Add New Charge
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
          Manage pre-filled charges like Bed, Parking, Mess, etc.
        </p>

        {/* Search and Add Button */}
        <div className="mb-6 flex flex-row justify-between items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px] max-w-[500px] relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search charges by name or description"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="
                    w-full
                    h-[34px]
                    pl-10 pr-4
                    rounded
                    border-[1.05px]
                    border-[#0EFF7B] dark:border-[#0EFF7B1A]
                    bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A]
                    text-[#08994A] dark:text-white
                    placeholder-[#5CD592] dark:placeholder-[#5CD592]
                    focus:outline-none
                    focus:border-[#0EFF7B]
                    transition-all
                    font-helvetica
                  "
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0EFF7B] pointer-events-none" />
              </div>
              <button
                onClick={handleSearch}
                className="h-[34px] px-4 rounded bg-[#08994A] text-white hover:bg-[#0D7F41] transition"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Charges Counter - Matching AppointmentList style */}
        <div className="mb-3 min-w-[800px] relative z-10">
          <div className="flex items-center gap-4 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
                Total Charges
              </span>
              <span className="w-6 h-6 flex items-center font-[Helvetica] text-[12px] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#0D2016] dark:bg-[#14DC6F]">
                {totalCharges}
              </span>
            </div>
            
            {searchQuery && (
              <>
                <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
                <div className="flex items-center gap-2">
                  <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
                    Displaying
                  </span>
                  <span className="w-6 h-6 flex items-center font-[Helvetica] text-[12px] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#7D3737] dark:bg-[#D97706]">
                    {displayedCharges}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Charges Table - Matching AppointmentList style */}
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left text-sm">
            <thead className="text-[#0EFF7B] bg-gray-200 dark:text-[#0EFF7B] h-12 font-[Helvetica] dark:bg-[#091810] border-b border-gray-300 dark:border-gray-700">
              <tr>
                <th className="py-3 px-2">S No</th>
                <th>Charge Name</th>
                <th>Unit Price ($)</th>
                <th>Description</th>
                <th>Created At</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex justify-center items-center">
                      <Loader2 className="w-8 h-8 text-[#0EFF7B] animate-spin" />
                      <span className="ml-3 text-[#0EFF7B]">Loading charges...</span>
                    </div>
                  </td>
                </tr>
              ) : currentCharges.length > 0 ? (
                currentCharges.map((charge, idx) => (
                  <tr
                    key={charge.id}
                    className="border-b border-gray-300 dark:border-gray-800 font-[Helvetica]"
                  >
                    <td className="py-3 px-2">
                      <div className="font-medium text-black dark:text-white">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </div>
                    </td>

                    <td className="py-3">
                      <div className="font-medium text-black dark:text-white">
                        {charge.charge}
                      </div>
                    </td>

                    <td className="text-black dark:text-white">
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} />
                        {parseFloat(charge.unit_price).toFixed(2)}
                      </div>
                    </td>

                    <td className="text-black dark:text-white">
                      {charge.description || "No description"}
                    </td>

                    <td className="text-black dark:text-white">
                      {formatDate(charge.created_at)}
                    </td>

                    <td className="text-center">
                      <div className="flex justify-center gap-4 relative overflow-visible">
                        <div className="relative group">
                          <Pencil
                            size={16}
                            onClick={() => openEditModal(charge)}
                            className="text-[#08994A] dark:text-blue-400 cursor-pointer hover:scale-110 transition"
                          />
                          <span className="absolute bottom-5 -left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150 z-50">
                            Edit
                          </span>
                        </div>

                        <div className="relative group">
                          <Trash
                            size={16}
                            onClick={() => openDeleteModal(charge)}
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
                  <td colSpan="6" className="text-center py-12 text-gray-500 dark:text-gray-400">
                    {searchQuery ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                        <p className="text-lg">No charges found matching "{searchQuery}"</p>
                        <p className="text-sm mt-2">Try a different search term or add a new charge</p>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                        <p className="text-lg">No charges found</p>
                        <p className="text-sm mt-2">Add your first charge to get started</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Matching AppointmentList style */}
        <div className="flex items-center mt-4 bg-gray-100 dark:bg-black p-4 rounded gap-x-4 dark:border-[#1E1E1E]">
          <div className="text-sm text-black dark:text-white">
            Page{" "}
            <span className="text-[#08994A] dark:text-[#0EFF7B] font-semibold">
              {currentPage}
            </span>{" "}
            of {totalPages} ({(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredCharges.length)}{" "}
            from {filteredCharges.length} Charges)
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
      </div>

      {/* Add Charge Modal */}
      <Dialog open={showAddModal} onClose={() => {
        setShowAddModal(false);
        resetForm();
      }} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <Dialog.Panel className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
            <div
              className="w-[505px] rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 shadow-lg relative"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
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
                <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
                  Add New Charge
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
                >
                  <X size={16} className="text-black dark:text-white" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-black dark:text-white block mb-1">
                    Charge Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.charge}
                    onChange={(e) => handleFormChange("charge", e.target.value)}
                    placeholder="Enter charge name (e.g., Bed, Parking, Mess)"
                    className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none"
                  />
                  {validationErrors.charge && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.charge}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm text-black dark:text-white block mb-1">
                    Unit Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => handleFormChange("unit_price", e.target.value)}
                    placeholder="Enter unit price"
                    className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none"
                  />
                  {validationErrors.unit_price && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.unit_price}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm text-black dark:text-white block mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    placeholder="Enter charge description"
                    rows="3"
                    className="w-full px-3 py-2 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="w-[144px] h-[34px] rounded-[8px] border border-[#0EFF7B] text-gray-800 dark:text-white bg-gray-100 dark:bg-transparent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCharge}
                  className="w-[144px] h-[34px] rounded-[8px] border-b-[2px] border-[#0EFF7B]
                    bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
                    text-white font-medium hover:scale-105 transition flex items-center justify-center gap-2"
                >
                  <Plus size={16} className="text-white dark:text-white" />
                  Add Charge
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Edit Charge Modal */}
      <Dialog open={showEditModal} onClose={() => {
        setShowEditModal(false);
        setSelectedCharge(null);
        resetEditForm();
      }} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <Dialog.Panel className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
            <div
              className="w-[505px] rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 shadow-lg relative"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
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
                <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
                  Edit Charge
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCharge(null);
                    resetEditForm();
                  }}
                  className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
                >
                  <X size={16} className="text-black dark:text-white" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-black dark:text-white block mb-1">
                    Charge Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.charge}
                    onChange={(e) => handleEditFormChange("charge", e.target.value)}
                    className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none"
                  />
                  {editValidationErrors.charge && (
                    <p className="text-red-500 text-xs mt-1">{editValidationErrors.charge}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm text-black dark:text-white block mb-1">
                    Unit Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.unit_price}
                    onChange={(e) => handleEditFormChange("unit_price", e.target.value)}
                    className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none"
                  />
                  {editValidationErrors.unit_price && (
                    <p className="text-red-500 text-xs mt-1">{editValidationErrors.unit_price}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm text-black dark:text-white block mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => handleEditFormChange("description", e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCharge(null);
                    resetEditForm();
                  }}
                  className="w-[144px] h-[34px] rounded-[8px] border border-[#0EFF7B] text-gray-800 dark:text-white bg-gray-100 dark:bg-transparent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditCharge}
                  className="w-[144px] h-[34px] rounded-[8px] border-b-[2px] border-[#0EFF7B]
                    bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
                    text-white font-medium hover:scale-105 transition flex items-center justify-center gap-2"
                >
                  <Pencil size={16} className="text-white dark:text-white" />
                  Update Charge
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Charge Confirmation Modal - CHANGED TO GREEN BORDER */}
      <Dialog open={showDeleteModal} onClose={() => {
        setShowDeleteModal(false);
        setSelectedCharge(null);
      }} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <Dialog.Panel className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
            <div
              className="w-[400px] rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 shadow-lg relative"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
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
                <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
                  Delete Charge
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCharge(null);
                  }}
                  className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
                >
                  <X size={16} className="text-black dark:text-white" />
                </button>
              </div>
              
              <div className="text-center mb-6">
                <Trash className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  Are you sure you want to delete this charge?
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Charge: <span className="font-semibold text-[#08994A] dark:text-[#0EFF7B]">
                    {selectedCharge?.charge}
                  </span>
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Price: <span className="font-semibold">
                    ${selectedCharge ? parseFloat(selectedCharge.unit_price).toFixed(2) : '0.00'}
                  </span>
                </p>
                <p className="text-sm text-red-500 dark:text-red-400 mt-4">
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCharge(null);
                  }}
                  className="w-[144px] h-[34px] rounded-[8px] border border-[#0EFF7B] text-gray-800 dark:text-white bg-gray-100 dark:bg-transparent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCharge}
                  className="w-[144px] h-[34px] rounded-[8px] border-b-[2px] border-red-500
                    bg-gradient-to-r from-[#7D3737] via-[#D97706] to-[#7D3737]
                    text-white font-medium hover:scale-105 transition flex items-center justify-center gap-2"
                >
                  <Trash size={16} className="text-white dark:text-white" />
                  Delete Charge
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default ChargesManagement;