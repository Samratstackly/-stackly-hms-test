import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { successToast, errorToast } from "../../components/Toast"; // adjust path if needed
import api from "../../utils/axiosConfig"; // Cookie-based axios instance

const EditBedGroupPopup = ({ onClose, onUpdate, data }) => {
  const [formData, setFormData] = useState({
    bedGroupName: "",
    bedFrom: "",
    bedTo: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Prefill form when `data` changes
  useEffect(() => {
    if (data) {
      setFormData({
        bedGroupName: data.bedGroupName || data.bedGroup || "",
        bedFrom: data.bedFrom?.toString() || "1",
        bedTo: data.bedTo?.toString() || data.capacity?.toString() || "",
      });
    }
  }, [data]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bedGroupName.trim()) newErrors.bedGroupName = "Bed group name is required";
    if (!formData.bedFrom) newErrors.bedFrom = "Starting bed number is required";
    if (!formData.bedTo) newErrors.bedTo = "Ending bed number is required";
    else if (parseInt(formData.bedFrom) >= parseInt(formData.bedTo)) {
      newErrors.bedTo = "Ending number must be greater than starting number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    const payload = {
      bedGroup: formData.bedGroupName.trim(),
      bedFrom: parseInt(formData.bedFrom),
      bedTo: parseInt(formData.bedTo),
    };

    try {
      const response = await api.put(`/bedgroups/${data.id}/`, payload);

      // SUCCESS TOAST
      successToast(`"${response.data.bedGroup}" updated successfully!`);

      // Notify parent to refresh the list
      if (onUpdate) onUpdate(response.data);

      // Close popup after short delay
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      let errorMessage = "Failed to update bed group.";
      
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 409) {
          // Handle duplicate bed number conflict
          const conflictData = err.response.data;
          errorMessage = conflictData.message || "Bed numbers already exist in the requested range.";
          
          // Show the suggested alternative range
          if (conflictData.suggested_range) {
            errorMessage += ` Suggested range: ${conflictData.suggested_range}`;
          }
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.detail || "Invalid data.";
        } else if (err.response.status === 404) {
          errorMessage = "Bed group not found.";
        } else if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = "Session expired. Please login again.";
          // Optionally redirect to login page here
        } else {
          errorMessage = err.response.data?.detail || errorMessage;
        }
      } else if (err.request) {
        // Request was made but no response
        errorMessage = "Network error. Please check your connection.";
      } else {
        // Something else happened
        errorMessage = err.message || errorMessage;
      }
      
      setServerError(errorMessage);
      errorToast(errorMessage);
      console.error("Update BedGroup Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 bg-opacity-50 z-50 font-[Helvetica]">
      <div className="w-[420px] h-auto rounded-[20px] border border-[#0EFF7B] dark:border-[#0D0D0D] 
      bg-gray-100 dark:bg-[#000000E5] text-black dark:text-white p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md relative">
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

        {/* Header */}
        <div className="flex justify-between items-center pb-3 mb-4">
          <h3 className="font-inter font-medium text-[16px] leading-[19px] text-black dark:text-white">
            Edit Bed Group
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-6 h-6 rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] 
            flex items-center justify-center"
          >
            <X size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Bed Group Name */}
          <div>
            <label className="text-sm text-black dark:text-white">Bed Group Name</label>
            <input
              name="bedGroupName"
              value={formData.bedGroupName}
              onChange={(e) => setFormData({ ...formData, bedGroupName: e.target.value })}
              placeholder="e.g., ICU, Ward, General"
              className="w-full h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] 
              bg-gray-100 dark:bg-black text-[#08994A] dark:text-[#0EFF7B] placeholder-gray-500 
              outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]"
            />
            {errors.bedGroupName && <p className="text-red-500 text-xs mt-1">{errors.bedGroupName}</p>}
          </div>

          {/* Bed Numbers (From - To) */}
          <div>
            <label className="text-sm text-black dark:text-white">Bed No's</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                name="bedFrom"
                value={formData.bedFrom}
                onChange={(e) => setFormData({ ...formData, bedFrom: e.target.value })}
                placeholder="From"
                className="w-1/2 h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] 
                bg-gray-100 dark:bg-black text-[#08994A] dark:text-[#0EFF7B] placeholder-gray-500 
                outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]"
              />
              <span className="text-gray-600 dark:text-gray-300">to</span>
              <input
                type="number"
                name="bedTo"
                value={formData.bedTo}
                onChange={(e) => setFormData({ ...formData, bedTo: e.target.value })}
                placeholder="To"
                className="w-1/2 h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] 
                bg-gray-100 dark:bg-black text-[#08994A] dark:text-[#0EFF7B] placeholder-gray-500 
                outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B]"
              />
            </div>
            {errors.bedFrom && <p className="text-red-500 text-xs mt-1">{errors.bedFrom}</p>}
            {errors.bedTo && <p className="text-red-500 text-xs mt-1">{errors.bedTo}</p>}
          </div>

          {/* Server Error */}
          {serverError && <p className="text-red-500 text-xs">{serverError}</p>}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-[104px] h-[33px] rounded-[8px] border border-[#0EFF7B] dark:border-[#0D0D0D] 
            px-3 py-2 text-[#08994A] dark:text-white font-medium text-[14px] 
            hover:bg-[#0EFF7B1A] dark:hover:bg-[#3A3A3A] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-[104px] h-[33px] rounded-[8px] 
            bg-gradient-to-r from-[#14DC6F] to-[#09753A] dark:from-[#14DC6F] dark:to-[#09753A] 
            text-white dark:text-black font-medium text-[14px] hover:bg-[#0cd968] transition border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66]"
            style={{
              background: "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
            }}
          >
            {loading ? "Updating…" : "Update!"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBedGroupPopup;