import React, { useState, useEffect } from "react";
import { X, Pencil } from "lucide-react";
import { successToast, errorToast } from "../../components/Toast.jsx";

const EditChargePopup = ({ charge, onClose, onUpdate, patientId }) => {
  const [formData, setFormData] = useState({
    description: "",
    quantity: "",
    unit_price: "",
    amount: "",
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Initialize form with charge data
  useEffect(() => {
    if (charge) {
      setFormData({
        description: charge?.description || "",
        quantity: charge?.quantity?.toString() || "1",
        unit_price: charge?.unit_price?.toString() || "",
        amount: charge?.amount?.toString() || (charge?.quantity && charge?.unit_price ? 
          (parseFloat(charge.quantity) * parseFloat(charge.unit_price)).toFixed(2) : ""),
      });
    }
  }, [charge]);

  const handleFormChange = (field, value) => {
    // Validate negative values during typing
    const errors = { ...validationErrors };
    
    if (field === "quantity" && value !== "") {
      const numValue = parseInt(value);
      if (numValue <= 0) {
        errors.quantity = "Quantity must be greater than 0";
      } else {
        delete errors.quantity;
      }
    }
    
    if (field === "unit_price" && value !== "") {
      const numValue = parseFloat(value);
      if (numValue < 0) {
        errors.unit_price = "Unit price cannot be negative";
      } else if (numValue === 0) {
        errors.unit_price = "Unit price must be greater than 0";
      } else {
        delete errors.unit_price;
      }
    }
    
    if (field === "description" && validationErrors.description) {
      delete errors.description;
    }
    
    setValidationErrors(errors);
    
    // Calculate amount automatically
    let updatedAmount = formData.amount;
    if (field === "quantity" && formData.unit_price) {
      updatedAmount = (value * parseFloat(formData.unit_price)).toFixed(2);
    } else if (field === "unit_price" && formData.quantity) {
      updatedAmount = (parseFloat(formData.quantity) * value).toFixed(2);
    }
    
    setFormData({
      ...formData,
      [field]: value,
      amount: updatedAmount
    });
  };

  const validateForm = () => {
    const errors = {};
    
    // Required field validation (only triggers after submission)
    if (submitted && !formData.description.trim()) {
      errors.description = "Description is required";
    }
    
    // Required field validation (only triggers after submission)
    if (submitted && !formData.quantity) {
      errors.quantity = "Quantity is required";
    }
    
    // Required field validation (only triggers after submission)
    if (submitted && !formData.unit_price) {
      errors.unit_price = "Unit price is required";
    }
    
    // Quantity validation (shows during typing too)
    if (formData.quantity !== "") {
      const quantityNum = parseInt(formData.quantity);
      if (quantityNum <= 0) {
        errors.quantity = "Quantity must be greater than 0";
      }
    }
    
    // Unit price validation (shows during typing too)
    if (formData.unit_price !== "") {
      const priceNum = parseFloat(formData.unit_price);
      if (priceNum < 0) {
        errors.unit_price = "Unit price cannot be negative";
      } else if (priceNum === 0) {
        errors.unit_price = "Unit price must be greater than 0";
      }
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    
    const errors = validateForm();
    
    // Check for required fields
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    
    if (!formData.quantity) {
      errors.quantity = "Quantity is required";
    }
    
    if (!formData.unit_price) {
      errors.unit_price = "Unit price is required";
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {
        description: formData.description.trim(),
        quantity: parseInt(formData.quantity),
        unit_price: parseFloat(formData.unit_price),
        ...(formData.amount && formData.amount !== "" && { amount: parseFloat(formData.amount) })
      };
      
      await onUpdate(charge.id, updateData);
      successToast("Treatment charge updated successfully");
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      errorToast("Failed to update treatment charge");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 font-[Helvetica] z-50">
      {/* Gradient Border Container */}
      <div className="w-[505px] rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70">
        <div
          className="rounded-[19px] bg-white dark:bg-[#000000] text-black dark:text-white p-6 shadow-lg relative"
          style={{ fontFamily: "Helvetica" }}
        >
          {/* Inner Gradient Border */}
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
          <div className="flex justify-between items-center pb-3 mb-4 relative z-10">
            <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
              Edit Treatment Charge
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-[#0EFF7B] bg-white dark:bg-[#0EFF7B1A] flex items-center justify-center hover:scale-110 transition"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4 relative z-10">
            <div>
              <label className="text-sm text-black dark:text-white block mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUpdating}
              />
              {validationErrors.description && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-black dark:text-white block mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleFormChange("quantity", e.target.value)}
                  className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdating}
                />
                {validationErrors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.quantity}</p>
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
                  className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdating}
                />
                {validationErrors.unit_price && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.unit_price}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm text-black dark:text-white block mb-1">
                Amount ($) (Auto-calculated)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                readOnly
                className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUpdating}
              />
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-center gap-3 mt-8 relative z-10">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] text-gray-800 dark:text-white font-medium text-[14px] leading-[16px] shadow bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="w-[144px] h-[34px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B]
                bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
                text-white font-medium hover:scale-105 transition flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Pencil size={16} className="text-white dark:text-white" />
              {isUpdating ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditChargePopup;