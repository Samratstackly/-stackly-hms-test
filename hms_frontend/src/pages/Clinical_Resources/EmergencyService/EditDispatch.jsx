// // EditDispatchModal.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { X, ChevronDown, CalendarClock } from "lucide-react";
// import { Listbox } from "@headlessui/react";
// import { successToast, errorToast } from "../../../components/Toast.jsx";

// const EditDispatchModal = ({
//   isOpen,
//   onClose,
//   dispatch,
//   onSave,
//   units = [],
// }) => {
//   const isEdit = !!dispatch?.id;

//   const freshTimestamp = () => {
//     const d = new Date();
//     const pad = (n) => String(n).padStart(2, "0");
//     return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
//       d.getDate()
//     )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
//   };

//   const toLocalDateTimeValue = (v) => {
//     if (!v) return freshTimestamp();
//     const d = new Date(v);
//     if (isNaN(d)) return freshTimestamp();
//     const pad = (n) => String(n).padStart(2, "0");
//     return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
//       d.getDate()
//     )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
//   };

//   const [form, setForm] = useState({
//     unit_id: "",
//     dispatcher: "",
//     call_type: "Emergency",
//     status: "Standby",
//     location: "",
//     timestamp: freshTimestamp(),
//   });

//   const [errors, setErrors] = useState({});
//   const [showErrors, setShowErrors] = useState(false);

//   const timestampRef = useRef(null);

//   useEffect(() => {
//     if (isOpen) {
//       if (dispatch) {
//         setForm({
//           unit_id: dispatch.unit?.id || dispatch.unit_id || "",
//           dispatcher: dispatch.dispatcher || "",
//           call_type: dispatch.call_type || "Emergency",
//           status: dispatch.status || "Standby",
//           location: dispatch.location || "",
//           timestamp: toLocalDateTimeValue(dispatch.timestamp),
//         });
//       } else {
//         setForm({
//           unit_id: units[0]?.id || "",
//           dispatcher: "",
//           call_type: "Emergency",
//           status: "Standby",
//           location: "",
//           timestamp: freshTimestamp(),
//         });
//       }
//       setErrors({});
//       setShowErrors(false);
//     }
//   }, [isOpen, dispatch, units]);

//   const validateField = (name, value) => {
//     switch (name) {
//       case 'dispatcher':
//         if (!value.trim()) return "Dispatcher name is required";
//         if (!/^[A-Za-z\s]+$/.test(value.trim())) return "Only letters and spaces allowed";
//         if (value.trim().length < 2) return "Must be at least 2 characters";
//         return "";
      
//       case 'location':
//         if (!value.trim()) return "Location is required";
//         if (!/^[A-Za-z\s]+$/.test(value.trim())) return "Only letters and spaces allowed";
//         if (value.trim().length < 3) return "Must be at least 3 characters";
//         return "";
      
//       case 'unit_id':
//         if (!value) return "Unit selection is required";
//         return "";
      
//       default:
//         return "";
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: value }));
    
//     // Real-time validation while typing (only in create mode)
//     if (!isEdit) {
//       const error = validateField(name, value);
//       setErrors(prev => ({
//         ...prev,
//         [name]: error
//       }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     newErrors.dispatcher = validateField('dispatcher', form.dispatcher);
//     newErrors.location = validateField('location', form.location);
//     newErrors.unit_id = validateField('unit_id', form.unit_id);
    
//     if (form.timestamp) {
//       const selectedDate = new Date(form.timestamp);
//       const now = new Date();
//       if (selectedDate > now) {
//         newErrors.timestamp = "Timestamp cannot be in the future";
//       }
//     }
    
//     setErrors(newErrors);
//     return Object.values(newErrors).every(error => error === "");
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!isEdit) {
//       setShowErrors(true);
      
//       if (!validateForm()) {
//         errorToast("Please fix the validation errors before submitting");
//         return;
//       }
//     }
    
//     onSave(form);
//     onClose();
//   };

//   if (!isOpen) return null;

//   const Dropdown = ({
//     label,
//     value,
//     onChange,
//     options,
//     placeholder,
//     isObject = false,
//     error = ""
//   }) => (
//     <div>
//       <label className="text-sm text-black dark:text-white">
//         {label} 
//         {!isEdit && <span className="text-red-500 ml-1">*</span>}
//       </label>
//       <Listbox value={value} onChange={(v) => {
//         onChange(v);
//         // Real-time validation for dropdown change
//         if (!isEdit) {
//           const error = validateField('unit_id', v);
//           setErrors(prev => ({
//             ...prev,
//             unit_id: error
//           }));
//         }
//       }}>
//         <div className="relative mt-1 w-[228px]">
//           <Listbox.Button className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px]">
//             {value
//               ? isObject
//                 ? options.find((o) => String(o.id) === String(value))
//                     ?.unit_number || value
//                 : value
//               : placeholder}
//             <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0EFF7B]" />
//           </Listbox.Button>
//           <Listbox.Options className="absolute mt-1 w-full max-h-40 overflow-y-auto rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A]">
//             {options.map((opt) => {
//               const label = isObject ? opt.unit_number || opt.id : opt;
//               const val = isObject ? opt.id : opt;
//               return (
//                 <Listbox.Option
//                   key={val}
//                   value={val}
//                   className={({ active, selected }) =>
//                     `cursor-pointer select-none py-2 px-2 text-sm rounded-md ${
//                       active
//                         ? "bg-[#0EFF7B33] text-[#0EFF7B]"
//                         : "text-black dark:text-white"
//                     } ${selected ? "font-medium text-[#0EFF7B]" : ""}`
//                   }
//                 >
//                   {label}
//                 </Listbox.Option>
//               );
//             })}
//           </Listbox.Options>
//         </div>
//       </Listbox>
//       {/* Show real-time validation errors while typing */}
//       {!isEdit && error && (
//         <p className="text-red-500 text-xs mt-1">{error}</p>
//       )}
//     </div>
//   );

//   const openTimestampPicker = () => {
//     timestampRef.current?.showPicker?.() || timestampRef.current?.focus();
//   };

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 font-[Helvetica] z-50">
//       <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow bg-gradient-to-r from-green-400/70 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
//         <div className="w-[504px] h-auto rounded-[19px] bg-gray-100 dark:bg-black text-black dark:text-white p-6 relative">
//           <div className="flex justify-between items-center pb-2 mb-3">
//             <h3 className="font-medium text-[16px]">
//               {isEdit ? "Edit Dispatch" : "Add Dispatch"}
//             </h3>
//             <button
//               onClick={onClose}
//               className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
//             >
//               <X size={16} />
//             </button>
//           </div>

//           <form
//             onSubmit={handleSubmit}
//             className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm"
//           >
//             <Dropdown
//               label="Unit"
//               value={form.unit_id}
//               onChange={(v) => {
//                 setForm((p) => ({ ...p, unit_id: v }));
//               }}
//               options={units}
//               placeholder="Select Unit"
//               isObject={true}
//               error={errors.unit_id}
//             />
//             <div>
//               <label className="text-sm text-black dark:text-white">
//                 Dispatcher 
//                 {!isEdit && <span className="text-red-500 ml-1">*</span>}
//               </label>
//               <input
//                 name="dispatcher"
//                 value={form.dispatcher}
//                 onChange={handleChange}
//                 placeholder="Enter name"
//                 className="w-full h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B]"
//               />
//               {/* Show real-time validation errors while typing */}
//               {!isEdit && errors.dispatcher && (
//                 <p className="text-red-500 text-xs mt-1">{errors.dispatcher}</p>
//               )}
//             </div>
//             <div>
//               <label className="text-sm text-black dark:text-white">
//                 Call Type 
//                 {!isEdit && <span className="text-red-500 ml-1">*</span>}
//               </label>
//               <Listbox 
//                 value={form.call_type} 
//                 onChange={(v) => setForm((p) => ({ ...p, call_type: v }))}
//               >
//                 <div className="relative mt-1 w-[228px]">
//                   <Listbox.Button className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px]">
//                     {form.call_type}
//                     <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0EFF7B]" />
//                   </Listbox.Button>
//                   <Listbox.Options className="absolute mt-1 w-full max-h-40 overflow-y-auto rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A]">
//                     {["Emergency", "Non-Emergency", "Transfer"].map((opt) => (
//                       <Listbox.Option
//                         key={opt}
//                         value={opt}
//                         className={({ active, selected }) =>
//                           `cursor-pointer select-none py-2 px-2 text-sm rounded-md ${
//                             active
//                               ? "bg-[#0EFF7B33] text-[#0EFF7B]"
//                               : "text-black dark:text-white"
//                           } ${selected ? "font-medium text-[#0EFF7B]" : ""}`
//                         }
//                       >
//                         {opt}
//                       </Listbox.Option>
//                     ))}
//                   </Listbox.Options>
//                 </div>
//               </Listbox>
//             </div>
//             <div>
//               <label className="text-sm text-black dark:text-white">
//                 Status 
//                 {!isEdit && <span className="text-red-500 ml-1">*</span>}
//               </label>
//               <Listbox 
//                 value={form.status} 
//                 onChange={(v) => setForm((p) => ({ ...p, status: v }))}
//               >
//                 <div className="relative mt-1 w-[228px]">
//                   <Listbox.Button className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px]">
//                     {form.status}
//                     <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0EFF7B]" />
//                   </Listbox.Button>
//                   <Listbox.Options className="absolute mt-1 w-full max-h-40 overflow-y-auto rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A]">
//                     {["Standby", "En Route", "Completed", "Cancelled"].map((opt) => (
//                       <Listbox.Option
//                         key={opt}
//                         value={opt}
//                         className={({ active, selected }) =>
//                           `cursor-pointer select-none py-2 px-2 text-sm rounded-md ${
//                             active
//                               ? "bg-[#0EFF7B33] text-[#0EFF7B]"
//                               : "text-black dark:text-white"
//                           } ${selected ? "font-medium text-[#0EFF7B]" : ""}`
//                         }
//                       >
//                         {opt}
//                       </Listbox.Option>
//                     ))}
//                   </Listbox.Options>
//                 </div>
//               </Listbox>
//             </div>
//             <div className="col-span-2">
//               <label className="text-sm text-black dark:text-white">
//                 Location 
//                 {!isEdit && <span className="text-red-500 ml-1">*</span>}
//               </label>
//               <input
//                 name="location"
//                 value={form.location}
//                 onChange={handleChange}
//                 placeholder="Enter location"
//                 className="w-full h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B]"
//               />
//               {/* Show real-time validation errors while typing */}
//               {!isEdit && errors.location && (
//                 <p className="text-red-500 text-xs mt-1">{errors.location}</p>
//               )}
//             </div>
//             <div className="col-span-2">
//               <label
//                 htmlFor="timestamp"
//                 className="block mb-1 cursor-pointer text-sm text-black dark:text-white"
//                 onClick={openTimestampPicker}
//               >
//                 Timestamp 
//                 {!isEdit && <span className="text-red-500 ml-1">*</span>}
//               </label>
//               <div className="relative">
//                 <input
//                   ref={timestampRef}
//                   type="datetime-local"
//                   name="timestamp"
//                   value={form.timestamp}
//                   onChange={handleChange}
//                   className="w-full h-[33px] pr-7 pl-2 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] cursor-pointer"
//                 />
//                 <CalendarClock
//                   onClick={openTimestampPicker}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0EFF7B] cursor-pointer"
//                 />
//               </div>
//               {/* Show real-time validation errors while typing */}
//               {!isEdit && errors.timestamp && (
//                 <p className="text-red-500 text-xs mt-1">{errors.timestamp}</p>
//               )}
//             </div>
//             <div className="col-span-2 flex justify-center gap-2 mt-6">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="w-[144px] h-[34px] rounded-[8px] border border-[#0EFF7B] text-gray-700 dark:text-white bg-gray-100 dark:bg-transparent"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="w-[144px] h-[34px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white"
//               >
//                 {isEdit ? "Save" : "Create"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditDispatchModal;

// EditDispatchModal.jsx
// EditDispatchModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, ChevronDown, CalendarClock, MapPin, Phone } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { successToast, errorToast } from "../../../components/Toast.jsx";

const EditDispatchModal = ({
  isOpen,
  onClose,
  dispatch,
  onSave,
  units = [],
}) => {
  const isEdit = !!dispatch?.id;

  // Valid Vizag locations
  const vizagLocations = [
    "Gajuwaka",
    "NAD Kotha Road",
    "Dwaraka Nagar",
    "Seethammadhara",
    "Madhurawada",
    "Simhachalam",
    "King George Hospital (KGH)",
    "Care Hospital",
    "Apollo Hospital",
    "Seven Hills Hospital",
    "Gitam Hospital",
    "Rushikonda",
    "MVP Colony",
    "Akkayyapalem",
    "Gopalapatnam",
    "Lawson's Bay Colony",
    "Jagadamba Junction",
    "RTC Complex",
    "Railway Station",
    "Airport",
    "Pendurthi",
    "Anakapalle",
    "Bheemili",
    "Vizag Steel Plant",
    "Scindia",
    "Waltair",
    "Maharanipeta",
    "Asilmetta"
  ];

  // Get current date-time for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const freshTimestamp = () => {
    return getCurrentDateTime();
  };

  const toLocalDateTimeValue = (v) => {
    if (!v) return freshTimestamp();
    const d = new Date(v);
    if (isNaN(d)) return freshTimestamp();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [form, setForm] = useState({
    unit_id: "",
    dispatcher: "",
    call_type: "Emergency",
    status: "Standby",
    location: "",
    phone_number: "",
    timestamp: freshTimestamp(),
  });

  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [originalTimestamp, setOriginalTimestamp] = useState(null);

  const timestampRef = useRef(null);
  const locationRef = useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (dispatch) {
        const originalTs = toLocalDateTimeValue(dispatch.timestamp);
        setForm({
          unit_id: dispatch.unit?.id || dispatch.unit_id || "",
          dispatcher: dispatch.dispatcher || "",
          call_type: dispatch.call_type || "Emergency",
          status: dispatch.status || "Standby",
          location: dispatch.location || "",
          phone_number: dispatch.phone_number || "",
          timestamp: originalTs,
        });
        setOriginalTimestamp(originalTs);
      } else {
        const now = freshTimestamp();
        setForm({
          unit_id: "",
          dispatcher: "",
          call_type: "Emergency",
          status: "Standby",
          location: "",
          phone_number: "",
          timestamp: now,
        });
        setOriginalTimestamp(null);
      }
      setErrors({});
      setShowErrors(false);
      setSuggestions([]);
      setTouched({});
      setLoading(false);
    }
  }, [isOpen, dispatch]);

  // Sanitize input to remove special characters
  const sanitizeInput = (value) => {
    return value.replace(/[<>$*@#%^&!{}[\]\\]/g, '');
  };

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  // Validate phone number with stricter rules
  const validatePhoneNumber = (value) => {
    if (!value || !value.trim()) return ""; // Optional field
    
    const digitsOnly = value.replace(/\D/g, '');
    
    // Check if it's a valid Indian phone number
    if (digitsOnly.length === 0) return "";
    if (digitsOnly.length < 10) return "Phone number must have 10 digits";
    if (digitsOnly.length > 10) return "Phone number cannot exceed 10 digits";
    
    // Check for repeated digits (like 1111111111, 2222222222, 5555555555)
    const isRepeated = /^(\d)\1{9}$/.test(digitsOnly);
    if (isRepeated) {
      return "Invalid phone number - cannot have all digits same";
    }
    
    // Check for sequential digits (like 1234567890)
    const isSequential = /^0123456789|1234567890|9876543210|012345678|123456789|234567890$/.test(digitsOnly);
    if (isSequential) {
      return "Invalid phone number - cannot be sequential";
    }
    
    // Indian mobile number validation (starts with 6-9)
    if (!/^[6-9]/.test(digitsOnly)) {
      return "Indian mobile number must start with 6, 7, 8, or 9";
    }
    
    // Check for valid Indian mobile number pattern
    if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
      return "Invalid Indian mobile number format";
    }
    
    return "";
  };

  const validateField = (name, value, allFields = form) => {
    // Validate for BOTH create and edit modes
    switch (name) {
      case 'dispatcher':
        if (!value.trim()) return "Dispatcher name is required";
        if (!/^[A-Za-z\s.]+$/.test(value.trim())) return "Only letters, spaces, and dots allowed";
        if (value.trim().length < 2) return "Must be at least 2 characters";
        if (value.trim().length > 50) return "Must be less than 50 characters";
        // Check if it's a valid name (not just repeated letters)
        if (/^(.)\1{2,}$/.test(value.trim().replace(/\s/g, ''))) {
          return "Please enter a valid name";
        }
        return '';
      
      case 'location':
        if (!value.trim()) return "Location is required";
        
        // Check for invalid characters
        const invalidChars = /[$*@#%^&!{}[\]<>\\]/;
        if (invalidChars.test(value)) {
          return "Special characters $, *, @, #, %, ^, &, !, {, }, [, ], <, >, \\ are not allowed";
        }
        
        // Check if it's a valid Vizag location (case-insensitive)
        const isVizagLocation = vizagLocations.some(loc => 
          value.toLowerCase().includes(loc.toLowerCase())
        );
        
        if (!isVizagLocation) {
          // Allow custom locations but validate format
          if (value.trim().length < 5) return "Please enter a more specific location";
          if (value.trim().length > 100) return "Must be less than 100 characters";
          
          // Validate address format (should contain at least a word and number)
          const words = value.trim().split(/\s+/);
          if (words.length < 2) {
            return "Please provide more specific location (e.g., 'Main Road, Gajuwaka')";
          }
          
          // Check if it looks like a valid address (has letters and numbers)
          const hasLetters = /[A-Za-z]/.test(value);
          const hasNumbers = /\d/.test(value);
          if (!hasLetters) {
            return "Location must contain letters";
          }
        }
        return '';
      
      case 'unit_id':
        if (!value) return "Unit selection is required";
        return '';
      
      case 'phone_number':
        return validatePhoneNumber(value);
      
      case 'timestamp':
        if (!value) return "Timestamp is required";
        
        // Only validate future dates for NEW dispatches, not for edits
        if (!isEdit) {
          const selectedDate = new Date(value);
          const now = new Date();
          if (selectedDate > now) {
            return "Timestamp cannot be in the future";
          }
        }
        // For edit mode, allow any timestamp (including past)
        return '';
      
      default:
        return '';
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur for BOTH create and edit modes
    const error = validateField(name, form[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Apply different processing based on field type
    if (name === 'location' || name === 'dispatcher') {
      processedValue = sanitizeInput(value);
    } else if (name === 'phone_number') {
      // Format phone number as user types
      const digits = value.replace(/\D/g, '');
      processedValue = formatPhoneNumber(digits);
    }
    
    setForm((p) => ({ ...p, [name]: processedValue }));
    
    // Show location suggestions
    if (name === 'location' && processedValue.trim().length > 1) {
      const searchTerm = processedValue.toLowerCase();
      const filtered = vizagLocations.filter(loc => 
        loc.toLowerCase().includes(searchTerm)
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
    
    // Clear error for this field when typing (for BOTH modes)
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setForm(prev => ({ ...prev, location: suggestion }));
    setSuggestions([]);
    
    // Mark as touched and validate
    setTouched(prev => ({ ...prev, location: true }));
    const error = validateField('location', suggestion);
    setErrors(prev => ({
      ...prev,
      location: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all required fields for BOTH modes
    newErrors.dispatcher = validateField('dispatcher', form.dispatcher);
    newErrors.location = validateField('location', form.location);
    newErrors.unit_id = validateField('unit_id', form.unit_id);
    newErrors.phone_number = validateField('phone_number', form.phone_number);
    newErrors.timestamp = validateField('timestamp', form.timestamp);
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {
      dispatcher: true,
      location: true,
      unit_id: true,
      phone_number: true,
      timestamp: true
    };
    setTouched(allTouched);
    
    // Validate form for BOTH modes before submission
    setShowErrors(true);
    
    if (!validateForm()) {
      // Show specific error messages
      const errorFields = Object.keys(errors).filter(key => errors[key]);
      if (errorFields.length > 0) {
        const firstError = errors[errorFields[0]];
        errorToast(firstError);
      } else {
        errorToast("Please fix the validation errors before submitting");
      }
      return;
    }
    
    setLoading(true);
    
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      
      // Handle 422 validation errors from backend
      if (error.response?.status === 422) {
        const responseData = error.response.data;
        
        if (responseData.detail && Array.isArray(responseData.detail)) {
          // FastAPI validation errors array
          const validationErrors = {};
          
          responseData.detail.forEach(err => {
            // Extract field name from location array
            if (err.loc && err.loc.length > 0) {
              const fieldName = err.loc[err.loc.length - 1];
              
              // Map error message to user-friendly format
              let errorMsg = err.msg;
              
              // Customize error messages based on field
              if (fieldName === 'phone_number') {
                if (errorMsg.includes('value is not a valid phone number')) {
                  errorMsg = 'Please enter a valid phone number (10 digits starting with 6-9)';
                }
              } else if (fieldName === 'dispatcher') {
                if (errorMsg.includes('string does not match expected pattern')) {
                  errorMsg = 'Dispatcher name can only contain letters and spaces';
                }
              } else if (fieldName === 'location') {
                if (errorMsg.includes('string does not match expected pattern')) {
                  errorMsg = 'Location contains invalid characters';
                }
              }
              
              validationErrors[fieldName] = errorMsg;
            }
          });
          
          // Set field-specific validation errors
          if (Object.keys(validationErrors).length > 0) {
            setErrors(prev => ({
              ...prev,
              ...validationErrors
            }));
            
            // Mark all fields as touched to show errors
            setTouched(prev => ({
              ...prev,
              ...Object.keys(validationErrors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
            }));
            
            // Show toast with first validation message
            const firstError = Object.values(validationErrors)[0];
            errorToast(firstError);
          }
        } else if (responseData.detail) {
          // Handle string error
          if (typeof responseData.detail === 'string') {
            errorToast(responseData.detail);
          } else {
            errorToast("Validation error. Please check your input.");
          }
        } else {
          errorToast("Validation error. Please check your input.");
        }
      } else if (error.response?.status === 409) {
        // Handle conflict errors (duplicate)
        const responseData = error.response.data;
        if (responseData.detail?.errors) {
          const conflictErrors = responseData.detail.errors;
          setErrors(prev => ({
            ...prev,
            ...conflictErrors
          }));
          Object.values(conflictErrors).forEach(msg => errorToast(msg));
        } else if (responseData.detail) {
          errorToast(responseData.detail);
        } else {
          errorToast("Duplicate entry detected");
        }
      } else {
        // Handle other errors
        const errorMessage = error.response?.data?.detail || 
                            error.message || 
                            "Failed to save dispatch";
        errorToast(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const Dropdown = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    isObject = false,
    error = ""
  }) => (
    <div>
      <label className="text-sm text-black dark:text-white">
        {label} 
        {!isEdit && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Listbox value={value} onChange={(v) => {
        onChange(v);
        setTouched(prev => ({ ...prev, unit_id: true }));
        // Clear error when user selects a value
        setErrors(prev => ({
          ...prev,
          unit_id: ""
        }));
      }}>
        <div className="relative mt-1">
          <Listbox.Button className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border ${
            touched.unit_id && error 
              ? 'border-red-500 dark:border-red-500' 
              : 'border-[#0EFF7B] dark:border-[#3A3A3A]'
          } bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] focus:outline-none`}>
            {value
              ? isObject
                ? options.find((o) => String(o.id) === String(value))
                    ?.unit_number || value
                : value
              : placeholder}
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0EFF7B]" />
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 w-full max-h-40 overflow-y-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A]">
            {options.map((opt) => {
              const label = isObject ? opt.unit_number || opt.id : opt;
              const val = isObject ? opt.id : opt;
              return (
                <Listbox.Option
                  key={val}
                  value={val}
                  className={({ active, selected }) =>
                    `cursor-pointer select-none py-2 px-3 text-sm ${
                      active
                        ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                        : "text-black dark:text-white"
                    } ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                  }
                >
                  {label}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </div>
      </Listbox>
      {touched.unit_id && error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );

  const openTimestampPicker = () => {
    timestampRef.current?.showPicker?.() || timestampRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 font-[Helvetica] z-50">
      <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow bg-gradient-to-r from-green-400/70 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
        <div className="w-[850px] h-auto rounded-[19px] bg-gray-100 dark:bg-black text-black dark:text-white p-6 relative">
          <div className="flex justify-between items-center pb-2 mb-3">
            <h3 className="font-medium text-[16px]">
              {isEdit ? "Edit Dispatch" : "Add Dispatch"}
            </h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-3 gap-4 text-sm"
          >
            {/* Row 1 */}
            <Dropdown
              label="Unit"
              value={form.unit_id}
              onChange={(v) => {
                setForm((p) => ({ ...p, unit_id: v }));
              }}
              options={units}
              placeholder="Select Unit"
              isObject={true}
              error={errors.unit_id}
            />

            <div>
              <label className="text-sm text-black dark:text-white">
                Dispatcher 
                {!isEdit && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                name="dispatcher"
                value={form.dispatcher}
                onChange={handleChange}
                onBlur={() => handleBlur('dispatcher')}
                placeholder="Enter name"
                maxLength="50"
                className={`w-full h-[33px] mt-1 px-3 rounded-[8px] border ${
                  touched.dispatcher && errors.dispatcher
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-[#0EFF7B] dark:border-[#3A3A3A]'
                } bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] focus:outline-none focus:ring-1 focus:ring-[#08994A]`}
              />
              {touched.dispatcher && errors.dispatcher && (
                <p className="text-red-500 text-xs mt-1">{errors.dispatcher}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-black dark:text-white">
                Call Type 
                {!isEdit && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Listbox 
                value={form.call_type} 
                onChange={(v) => setForm((p) => ({ ...p, call_type: v }))}
              >
                <div className="relative mt-1">
                  <Listbox.Button className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] focus:outline-none">
                    {form.call_type}
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0EFF7B]" />
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-1 w-full max-h-40 overflow-y-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A]">
                    {["Emergency", "Non-Emergency", "Transfer"].map((opt) => (
                      <Listbox.Option
                        key={opt}
                        value={opt}
                        className={({ active, selected }) =>
                          `cursor-pointer select-none py-2 px-3 text-sm ${
                            active
                              ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                              : "text-black dark:text-white"
                          } ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                        }
                      >
                        {opt}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>

            {/* Row 2 */}
            <div>
              <label className="text-sm text-black dark:text-white">
                Status 
                {!isEdit && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Listbox 
                value={form.status} 
                onChange={(v) => setForm((p) => ({ ...p, status: v }))}
              >
                <div className="relative mt-1">
                  <Listbox.Button className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] focus:outline-none">
                    {form.status}
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0EFF7B]" />
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-1 w-full max-h-40 overflow-y-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A]">
                    {["Standby", "En Route", "Completed", "Cancelled"].map((opt) => (
                      <Listbox.Option
                        key={opt}
                        value={opt}
                        className={({ active, selected }) =>
                          `cursor-pointer select-none py-2 px-3 text-sm ${
                            active
                              ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                              : "text-black dark:text-white"
                          } ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                        }
                      >
                        {opt}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>

            <div>
              <label className="text-sm text-black dark:text-white">
                Phone Number
              </label>
              <div className="relative">
                <input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phone_number')}
                  placeholder="e.g., 987-654-3210"
                  maxLength="12"
                  className={`w-full h-[33px] mt-1 px-3 pl-9 rounded-[8px] border ${
                    touched.phone_number && errors.phone_number
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-[#0EFF7B] dark:border-[#3A3A3A]'
                  } bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] focus:outline-none focus:ring-1 focus:ring-[#08994A]`}
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0EFF7B]" />
              </div>
              {touched.phone_number && errors.phone_number && (
                <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>
              )}
            </div>

<div>
  <label className="text-sm text-black dark:text-white">
    Timestamp
    {!isEdit && <span className="text-red-500 ml-1">*</span>}
  </label>

  {/* Inline CSS to remove default calendar icon */}
  <style>
    {`
      input[type="datetime-local"]::-webkit-calendar-picker-indicator {
        display: none;
        -webkit-appearance: none;
      }
    `}
  </style>

  <div className="relative">
    <input
      ref={timestampRef}
      type="datetime-local"
      name="timestamp"
      value={form.timestamp}
      onChange={handleChange}
      onBlur={() => handleBlur('timestamp')}
      min={!isEdit ? getCurrentDateTime() : undefined}
      className={`w-full h-[33px] mt-1 px-3 pr-10 rounded-[8px] border ${
        touched.timestamp && errors.timestamp
          ? 'border-red-500 dark:border-red-500'
          : 'border-[#0EFF7B] dark:border-[#3A3A3A]'
      } bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#08994A]`}
    />

    <CalendarClock
      onClick={openTimestampPicker}
      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0EFF7B] cursor-pointer"
    />
  </div>

  {touched.timestamp && errors.timestamp && (
    <p className="text-red-500 text-xs mt-1">{errors.timestamp}</p>
  )}
</div>



            {/* Row 3 - Location (full width) */}
            <div className="col-span-3">
              <label className="text-sm text-black dark:text-white">
                Location 
                {!isEdit && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="relative">
                <input
                  ref={locationRef}
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  onBlur={() => handleBlur('location')}
                  placeholder="Enter Vizag location (e.g., Gajuwaka, KGH)"
                  maxLength="100"
                  className={`w-full h-[33px] mt-1 px-3 pl-9 rounded-[8px] border ${
                    touched.location && errors.location
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-[#0EFF7B] dark:border-[#3A3A3A]'
                  } bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] focus:outline-none focus:ring-1 focus:ring-[#08994A]`}
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0EFF7B]" />
                
                {/* Location suggestions */}
                {suggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-300 dark:border-gray-700 max-h-40 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-800 dark:text-gray-200"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {touched.location && errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Valid locations: {vizagLocations.slice(0, 5).join(", ")}...
              </p>
            </div>

            {/* Buttons */}
            <div className="col-span-3 flex justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-[144px] h-[34px] rounded-[8px] border border-[#0EFF7B] text-gray-700 dark:text-white bg-gray-100 dark:bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-[144px] h-[34px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  isEdit ? "Save" : "Create"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDispatchModal;