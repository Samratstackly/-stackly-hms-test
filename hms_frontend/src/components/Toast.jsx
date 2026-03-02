// // Toast.jsx
// //src/components/Toast.jsx
// import React, { useEffect, useState, useContext } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import clsx from "clsx";
// import { ThemeContext } from "./ThemeContext.jsx";

// // ------------------------
// // Toast UI Component
// // ------------------------
// const Toast = ({ message, type = "success", isOpen, onClose, duration = 3000 }) => {
//   const { theme } = useContext(ThemeContext);

//   useEffect(() => {
//     if (isOpen) {
//       const timer = setTimeout(() => {
//         onClose();
//       }, duration);
//       return () => clearTimeout(timer);
//     }
//   }, [isOpen, duration, onClose]);

//   const bgColor =
//     theme === "dark"
//       ? type === "success"
//         ? "bg-[#0D0D0D] text-[#14DC6F] border-[#3C3C3C]"
//         : "bg-[#0D0D0D] text-[#FF4C4C] border-[#3C3C3C]"
//       : type === "success"
//       ? "bg-[#0EFF7B33] text-[#14DC6F] border-green-500"
//       : "bg-[#FFE5E5] text-[#FF4C4C] border-red-500";

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ opacity: 0, x: 50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 50 }}
//           transition={{ duration: 0.35, ease: "easeInOut" }}
//           className={clsx(
//             "fixed top-6 right-6 px-6 py-4 rounded-xl text-base font-[Helvetica] font-semibold border shadow-2xl max-w-xs z-[9999]",
//             bgColor
//           )}
//         >
//           {message}
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default Toast;

// // ------------------------
// // Toast Helper Functions
// // ------------------------
// let toastCallback = null;

// const triggerToast = (message, type = "success") => {
//   if (toastCallback) {
//     toastCallback({ message, type });
//   }
// };

// export const successToast = (message) => {
//   triggerToast(message, "success");
// };

// export const errorToast = (message) => {
//   triggerToast(message, "error");
// };

// // ------------------------
// // Toast Provider Component
// // ------------------------
// export const ToastProvider = () => {
//   const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });

//   toastCallback = ({ message, type }) => {
//     setToast({ isOpen: true, message, type });
//     setTimeout(() => {
//       setToast({ isOpen: false, message: "", type });
//     }, 3000);
//   };

//   return (
//     <Toast
//       message={toast.message}
//       type={toast.type}
//       isOpen={toast.isOpen}
//       onClose={() => setToast({ ...toast, isOpen: false })}
//     />
//   );
// };

// Toast.jsx
//src/components/Toast.jsx
import React, { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { ThemeContext } from "./ThemeContext.jsx";

// ------------------------
// Toast UI Component
// ------------------------
const Toast = ({ message, type = "success", isOpen, onClose, duration = 3000 }) => {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const bgColor =
    theme === "dark"
      ? type === "success"
        ? "bg-[#0D0D0D] text-[#14DC6F] border-[#3C3C3C]"
        : type === "error"
        ? "bg-[#0D0D0D] text-[#FF4C4C] border-[#3C3C3C]"
        : "bg-[#0D0D0D] text-[#FFA500] border-[#3C3C3C]" // Warning color for dark theme
      : type === "success"
      ? "bg-[#0EFF7B33] text-[#14DC6F] border-green-500"
      : type === "error"
      ? "bg-[#FFE5E5] text-[#FF4C4C] border-red-500"
      : "bg-[#FFF3CD] text-[#856404] border-yellow-500"; // Warning color for light theme

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={clsx(
            "fixed top-6 right-6 px-6 py-4 rounded-xl text-base font-[Helvetica] font-semibold border shadow-2xl max-w-xs z-[9999]",
            bgColor
          )}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

// ------------------------
// Toast Helper Functions
// ------------------------
let toastCallback = null;

const triggerToast = (message, type = "success") => {
  if (toastCallback) {
    toastCallback({ message, type });
  }
};

export const successToast = (message) => {
  triggerToast(message, "success");
};

export const errorToast = (message) => {
  triggerToast(message, "error");
};

export const warningToast = (message) => {
  triggerToast(message, "warning");
};

// ------------------------
// Toast Provider Component
// ------------------------
export const ToastProvider = () => {
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });

  toastCallback = ({ message, type }) => {
    setToast({ isOpen: true, message, type });
    setTimeout(() => {
      setToast({ isOpen: false, message: "", type });
    }, 3000);
  };

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      isOpen={toast.isOpen}
      onClose={() => setToast({ ...toast, isOpen: false })}
    />
  );
};