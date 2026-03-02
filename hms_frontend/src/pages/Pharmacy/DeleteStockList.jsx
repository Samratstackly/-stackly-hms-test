// import React from "react";
// import { X } from "lucide-react";

// const DeleteStockList = ({ onClose, onConfirm, data }) => {
//   const isBloodType = data && data.type !== undefined;
//   const itemName = isBloodType ? data.type : data?.name || "item";

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//       <div className="w-[504px] rounded-[20px] border border-[#0EFF7B] dark:border-[#0D0D0D] bg-gray-100 dark:bg-[#000000E5] text-black dark:text-white p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md relative">
//         {/* Header */}
//         <div className="flex justify-between items-center pb-3 mb-4">
//           <h3 className="text-lg font-semibold text-black dark:text-[#0EFF7B]">
//             Delete {isBloodType ? "Blood Type" : "Donor"}
//           </h3>
//           <button
//             onClick={onClose}
//             className="w-6 h-6 rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B1A] flex items-center justify-center"
//           >
//             <X size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
//           </button>
//         </div>

//         {/* Message */}
//         <p className="text-gray-600 dark:text-gray-300 text-center text-base mb-8">
//           Are you sure you want to delete {isBloodType ? "blood type" : "donor"} {itemName}? <br />
//           This action cannot be undone.
//         </p>

//         {/* Buttons */}
//         <div className="flex justify-center gap-6">
//           <button
//             onClick={onClose}
//             className="w-[104px] h-[33px] rounded-[20px] border border-[#0EFF7B] dark:border-[#0D0D0D] px-3 py-2 flex items-center justify-center gap-2 text-[#08994A] dark:text-white font-medium text-[14px] leading-[16px] hover:bg-[#0EFF7B1A] dark:hover:bg-[#3A3A3A] transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => onConfirm(data)}
//             className="w-[104px] h-[33px] rounded-[20px] px-3 py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF4D4D] to-[#B30000] text-white font-medium text-[14px] leading-[16px] hover:bg-[#FF4D4D] transition"
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeleteStockList;

import React from "react";
import { X } from "lucide-react";

const DeleteStockList = ({ onClose, onConfirm, data, itemsToDelete }) => {
  // Handle undefined itemsToDelete by defaulting to empty array
  const safeItemsToDelete = itemsToDelete || [];
  const isMultiple = safeItemsToDelete.length > 0;
  const itemCount = isMultiple ? safeItemsToDelete.length : 1;

  const getItemName = () => {
    if (isMultiple) {
      return `${itemCount} item${itemCount > 1 ? "s" : ""}`;
    }
    return data?.name || data?.product_name || "stock item";
  };

  const itemName = getItemName();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
      <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
        <div className="w-[400px] bg-gray-100 dark:bg-[#000000E5] rounded-[19px] p-6 relative">
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
                {isMultiple ? "Confirm Bulk Deletion" : "Confirm Deletion"}
              </h2>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-full border border-[#0EFF7B1A] dark:border-[#0EFF7B1A] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] flex items-center justify-center"
              >
                <X size={16} className="text-[#08994A] dark:text-white" />
              </button>
            </div>

            <p
              className="text-sm text-black dark:text-white mb-6 text-center"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              {isMultiple ? (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-[#08994A] dark:text-[#0EFF7B]">
                    {itemCount} selected item{itemCount > 1 ? "s" : ""}
                  </span>
                  ?<br />
                  This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-[#08994A] dark:text-[#0EFF7B]">
                    {itemName}
                  </span>
                  ?<br />
                  This action cannot be undone.
                </>
              )}
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={onClose}
                className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#3C3C3C] text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] opacity-100 bg-black dark:bg-transparent dark:text-white hover:bg-gray-800 dark:hover:bg-[#3A3A3A] transition"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(isMultiple ? safeItemsToDelete : data)}
                className="w-[144px] h-[32px] rounded-[8px] px-3 py-2 flex items-center justify-center 
                 bg-gradient-to-r from-[#FF4D4D] to-[#B30000]
                 text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition shadow-[0_2px_12px_0px_#00000040]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Delete {isMultiple ? `(${itemCount})` : ""}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add default props to prevent undefined issues
DeleteStockList.defaultProps = {
  itemsToDelete: [],
  data: null,
};

export default DeleteStockList;
