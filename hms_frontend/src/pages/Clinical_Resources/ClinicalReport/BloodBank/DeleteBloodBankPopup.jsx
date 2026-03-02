import React from "react";
import { X } from "lucide-react";
import { successToast, errorToast } from "../../../../components/Toast.jsx";

const DeleteBloodBankPopup = ({ onClose, onConfirm, data }) => {
  const isBloodType = data && data.type !== undefined;
  const itemName = isBloodType ? data.type : data?.name || "item";

  const handleDelete = () => {
    try {
      // Call the parent's onConfirm (assumed to be sync or returns nothing)
      onConfirm(data);

      // Success toast
      successToast("Blood type deleted successfully!");

      // Close popup
      onClose();
    } catch (error) {
      // If onConfirm throws (e.g. validation, API error)
      errorToast(error.message || "Failed to delete item");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
      <div className="rounded-[20px] p-[1px]">
        <div className="w-[504px] bg-gray-100 dark:bg-[#000000E5] rounded-[19px] p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md relative">
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
          <div className="flex justify-between items-center pb-3 mb-4 border-b border-[#0EFF7B33] dark:border-[#0EFF7B33]">
            <h3 className="text-lg font-semibold text-black dark:text-[#0EFF7B]">
              Delete {isBloodType ? "Blood Type" : "Donor"}
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] flex items-center justify-center"
            >
              <X size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
            </button>
          </div>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 text-center text-base mb-8">
            Are you sure you want to delete{" "}
            {isBloodType ? "blood type" : "donor"} <strong>{itemName}</strong>?{" "}
            <br />
            This action cannot be undone.
          </p>

          {/* Buttons */}
          <div className="flex justify-center gap-6">
            <button
              onClick={onClose}
              className="w-[104px] h-[33px] rounded-[20px] border border-[#0EFF7B] dark:border-[#0D0D0D] px-3 py-2 flex items-center justify-center text-[#08994A] dark:text-white font-medium text-[14px] leading-[16px] hover:bg-[#0EFF7B1A] dark:hover:bg-[#3A3A3A] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="w-[104px] h-[33px] rounded-[20px] px-3 py-2 flex items-center justify-center bg-gradient-to-r from-[#FF4D4D] to-[#B30000] text-white font-medium text-[14px] leading-[16px] hover:bg-[#FF4D4D] transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteBloodBankPopup;
