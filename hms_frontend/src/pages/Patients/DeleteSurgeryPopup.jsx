// DeleteSurgeryPopup.jsx
import React from "react";
import { X, AlertTriangle } from "lucide-react";

export default function DeleteSurgeryPopup({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
      <div
        className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
                   bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70
dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]
"
      >
        <div
          className="w-[505px] rounded-[19px] bg-gray-100 dark:bg-[#000000]
                     text-black dark:text-white p-6 relative"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          {/* Gradient inner border */}
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
          <div className="flex justify-between items-center pb-3 mb-4">
            <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
              Delete Surgery
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#FF32321A]
                         bg-gray-100 dark:bg-[#FF32321A] shadow flex items-center justify-center"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>
          
          {/* Warning Icon and Message */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
            </div>
            
            <h4 className="text-lg font-medium text-black dark:text-white mb-2">
              Are you sure?
            </h4>
            
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              This action cannot be undone. This will permanently delete the surgery record from the system.
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-gray-600
                         text-gray-600 dark:text-white font-medium text-[14px] leading-[16px]
                         shadow-[0_2px_12px_0px_#00000040] bg-gray-100 dark:bg-transparent
                         hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#FF323266]
                         bg-gradient-to-r from-[#7C2D2D] via-[#CC3A3A] to-[#7C2D2D]
                         shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px]
                         hover:scale-105 transition"
            >
              Delete Surgery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}