// import React from "react";
// import { X } from "lucide-react";

// const DeleteLabReportPopup = ({ order, onClose, onConfirm }) => {
//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">

//         {/* Inner Container */}
//         <div
//           className="w-[505px] h-auto rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
//           style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//         >{/* Gradient Border */}
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
//           {/* Header */}
//           <div className="flex justify-between items-center pb-3 mb-4">
//             <h2
//               className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Delete Test Order
//             </h2>
//             <button
//               onClick={onClose}
//               className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
//             >
//               <X size={16} className="text-black dark:text-white" />
//             </button>
//           </div>

//           {/* Message */}
//           <p
//             className="text-gray-600 dark:text-gray-300 text-center text-[15px] mb-8"
//             style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//           >
//             Are you sure you want to delete test order{" "}
//             <span className="font-semibold text-black dark:text-[#0EFF7B]">
//               {order?.id}
//             </span>
//             ? <br />
//             This action cannot be undone.
//           </p>

//           {/* Buttons */}
//           <div className="flex justify-center gap-4 mt-8">
//             <button
//               onClick={onClose}
//               className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
//               bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[14px] leading-[16px]"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Cancel
//             </button>

//             <button
//               onClick={() => onConfirm(order.id)}
//               className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#FF4D4D] to-[#B30000]
//               text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Delete
//             </button>
//           </div>
//         </div>
//       </div>

//   );
// };

// export default DeleteLabReportPopup;

import React, { useState } from "react";
import { X } from "lucide-react";
import { successToast, errorToast } from "../../../components/Toast.jsx";

const DeleteLabReportPopup = ({ order, onClose, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!order?.id) {
      errorToast("Invalid report ID");
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm(order.id);

      // Success toast
      successToast(`Lab report #${order.orderId} deleted successfully!`);

      // Close popup
      onClose();
    } catch (error) {
      console.error("Delete failed:", error);
      errorToast("Failed to delete lab report");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
      {/* Main Container */}
      <div className="relative w-[505px] h-auto rounded-[20px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6">
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

        {/* Content */}
        <div className="relative z-10" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          {/* Header */}
          <div className="flex justify-between items-center pb-3 mb-4">
            <h2
              className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Delete Test Order
            </h2>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#FF4D4D1A] bg-gray-100 dark:bg-[#FF4D4D1A] shadow flex items-center justify-center disabled:opacity-50"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>

          {/* Message */}
          <div className="text-center mb-8">
            <p
              className="text-gray-600 dark:text-gray-300 text-[15px] mb-4"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Are you sure you want to delete test order{" "}
              <span className="font-semibold text-black dark:text-red-400">
                {order?.orderId || order?.id}
              </span>
              ?
            </p>
            <p
              className="text-red-500 dark:text-red-400 text-sm"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              This action cannot be undone and all data will be permanently
              lost.
            </p>

            {/* Order Details */}
            {order && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-[#1A1A1A] rounded-lg text-left">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Patient:</strong> {order.patientName || order.patient}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Test Type:</strong> {order.testType || order.type}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Department:</strong> {order.department}
                </p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
              bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[14px] leading-[16px]
              disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#FF4D4D] via-[#D93636] to-[#B30000]
              text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              flex items-center justify-center gap-2"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteLabReportPopup;
