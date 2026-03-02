import React, { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { successToast, errorToast } from "../../components/Toast.jsx";

const DeleteChargePopup = ({ charge, onClose, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!charge?.id) {
      errorToast("Invalid charge ID");
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm(charge.id);
      successToast(`Charge "${charge.description}" deleted successfully!`);
      onClose();
    } catch (error) {
      console.error("Delete failed:", error);
      errorToast("Failed to delete charge");
    } finally {
      setIsDeleting(false);
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
              Delete Treatment Charge
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-[#0EFF7B] bg-white dark:bg-[#0EFF7B1A] flex items-center justify-center hover:scale-110 transition"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>

          {/* Message */}
          <div className="text-center mb-8 relative z-10">
            <p className="text-gray-700 dark:text-gray-300 text-base leading-6">
              Are you sure you want to delete this charge?
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="font-semibold text-black dark:text-white">
                {charge?.description}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Amount: ${charge?.formattedAmount || parseFloat(charge?.amount || 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Status: {charge?.status}
              </p>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-3">
              This action cannot be undone.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-3 mt-8 relative z-10">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] text-gray-800 dark:text-white font-medium text-[14px] leading-[16px] shadow bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-[144px] h-[34px] rounded-[8px] py-2 px-3 border-b-[2px] border-red-600 bg-gradient-to-r from-[#FF4D4D] via-[#D32F2F] to-[#B30000] shadow text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Trash2 size={16} />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteChargePopup;