// hms_frontend/src/pages/Administration/Dischargepatient.jsx
import React from "react";
import { X } from "lucide-react";

const DischargePopup = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
      <div className="w-[504px] rounded-[20px] dark:border-[#1E1E1E] bg-gray-100 dark:bg-[#000000E5] text-black dark:text-white p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md relative">
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
  ></div>{/* Header */}
        <div className="flex justify-between items-center pb-3 mb-4">
          <h3 className="text-lg font-semibold text-black dark:text-white">Delete Room List</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B1A] flex items-center justify-center hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
          >
            <X size={16} className="text-[#08994A] dark:text-white" />
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-300 text-center text-base mb-8">
          Are you sure you want to Discharge this Patient? <br />
          This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-6">
          <button
            onClick={onClose}
            className="w-[104px] h-[33px] rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent px-3 py-2 flex items-center justify-center gap-2 text-black dark:text-white font-medium text-[14px] leading-[16px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.25)] opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-[104px] h-[33px] rounded-[8px] px-3 py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF4D4D] to-[#B30000] text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition"
          >
            Discharge
          </button>
        </div>
      </div>
    </div>
  );
};

export default DischargePopup;
