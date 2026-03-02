// // src/components/AmbulanceUnitsModal.jsx
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { X } from "lucide-react";
// import { successToast, errorToast } from "../../../components/Toast.jsx";

// // Move ErrorMessage outside
// const ErrorMessage = ({ field, errors, submitted, isCreateMode, form }) => {
//   if (!errors[field]) return null;
  
//   // Show format errors immediately, required errors only after submission
//   const isFormatError = errors[field].includes("must be") || 
//                        errors[field].includes("cannot") || 
//                        errors[field].includes("seems") ||
//                        errors[field].includes("valid") ||
//                        errors[field].includes("at least") ||
//                        errors[field].includes("maximum");
  
//   if (isFormatError || submitted) {
//     return (
//       <div className="mt-1 text-red-500 text-xs">
//         <span>{errors[field]}</span>
//       </div>
//     );
//   }
  
//   return null;
// };

// // Move TextInput outside
// const TextInput = React.memo(({ 
//   label, 
//   name, 
//   required = false, 
//   placeholder, 
//   type = "text",
//   value,
//   onChange,
//   error,
//   submitted,
//   isCreateMode,
//   inputRef
// }) => {
//   return (
//     <div>
//       <label className="text-black dark:text-white">
//         {label} {isCreateMode && required && <span className="text-red-500 ml-1">*</span>}
//       </label>
//       <input
//         ref={inputRef}
//         type={type}
//         name={name}
//         value={value}
//         onChange={onChange}
//         required={false}
//         placeholder={placeholder}
//         className="w-full h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
//                     bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B]
//                     placeholder-gray-400 dark:placeholder-gray-500 outline-none"
//       />
//       <ErrorMessage 
//         field={name} 
//         errors={{[name]: error}} 
//         submitted={submitted} 
//         isCreateMode={isCreateMode}
//         form={{[name]: value}}
//       />
//     </div>
//   );
// });

// // Move TextArea outside
// const TextArea = React.memo(({ 
//   label, 
//   name, 
//   required = false, 
//   placeholder, 
//   value,
//   onChange,
//   error,
//   submitted,
//   isCreateMode,
//   inputRef
// }) => {
//   return (
//     <div className="col-span-2">
//       <label className="text-black dark:text-white">
//         {label} {isCreateMode && required && <span className="text-red-500 ml-1">*</span>}
//       </label>
//       <textarea
//         ref={inputRef}
//         name={name}
//         value={value}
//         onChange={onChange}
//         rows={3}
//         required={false}
//         placeholder={placeholder}
//         className="w-full mt-1 px-3 py-2 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
//                     bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B]
//                     placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none"
//       />
//       <ErrorMessage 
//         field={name} 
//         errors={{[name]: error}} 
//         submitted={submitted} 
//         isCreateMode={isCreateMode}
//         form={{[name]: value}}
//       />
//     </div>
//   );
// });

// const AmbulanceUnitsModal = ({
//   isOpen,
//   onClose,
//   unit, // null = Add, object = Edit
//   onSave,
// }) => {
//   const isEdit = !!unit?.id;
//   const isCreateMode = !isEdit;

//   const [form, setForm] = useState({
//     unit_number: "",
//     vehicle_make: "",
//     vehicle_model: "",
//     in_service: true,
//     notes: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [submitted, setSubmitted] = useState(false);
  
//   const unitNumberRef = useRef(null);
//   const vehicleMakeRef = useRef(null);
//   const vehicleModelRef = useRef(null);
//   const notesRef = useRef(null);

//   // Reset form when modal opens/closes or unit changes
//   useEffect(() => {
//     if (isOpen) {
//       setErrors({});
//       setSubmitted(false);
      
//       if (unit) {
//         setForm({
//           unit_number: unit.unit_number ?? "",
//           vehicle_make: unit.vehicle_make ?? "",
//           vehicle_model: unit.vehicle_model ?? "",
//           in_service: unit.in_service ?? true,
//           notes: unit.notes ?? "",
//         });
//       } else {
//         setForm({
//           unit_number: "",
//           vehicle_make: "",
//           vehicle_model: "",
//           in_service: true,
//           notes: "",
//         });
//       }
//     }
//   }, [isOpen, unit]);

//   // Validation rules - useCallback
//   const validateField = useCallback((name, value) => {
//     if (!isCreateMode) return "";
    
//     switch (name) {
//       case "unit_number":
//         if (!value.trim()) return "Unit number is required";
//         if (value.trim().length < 3) return "Unit number must be at least 3 characters";
//         if (!/^[A-Za-z0-9\-_]+$/.test(value.trim())) return "Unit number can only contain letters, numbers, hyphens and underscores";
//         return "";
        
//       case "vehicle_make":
//         if (!value.trim()) return "Vehicle make is required";
//         if (value.trim().length < 2) return "Vehicle make must be at least 2 characters";
//         if (value.trim().length > 50) return "Vehicle make cannot exceed 50 characters";
//         return "";
        
//       case "vehicle_model":
//         if (!value.trim()) return "Vehicle model is required";
//         if (value.trim().length < 2) return "Vehicle model must be at least 2 characters";
//         if (value.trim().length > 50) return "Vehicle model cannot exceed 50 characters";
//         return "";
        
//       case "notes":
//         // Notes is optional, but validate if provided
//         if (value && value.trim()) {
//           if (value.trim().length > 500) return "Notes cannot exceed 500 characters";
//         }
//         return "";
        
//       default:
//         return "";
//     }
//   }, [isCreateMode]);

//   // Handle change - useCallback
//   const handleChange = useCallback((e) => {
//     const { name, value, type, checked } = e.target;
//     const newValue = type === "checkbox" ? checked : value;
    
//     setForm((prev) => ({
//       ...prev,
//       [name]: newValue,
//     }));
    
//     // Always validate format errors while typing (for create mode)
//     if (isCreateMode) {
//       const error = validateField(name, newValue);
//       setErrors(prev => ({
//         ...prev,
//         [name]: error
//       }));
//     }
//   }, [isCreateMode, validateField]);

//   // Validate entire form
//   const validateForm = useCallback(() => {
//     if (!isCreateMode) return true;
    
//     const newErrors = {};
//     let isValid = true;
    
//     Object.keys(form).forEach(key => {
//       // Skip in_service checkbox from validation
//       if (key === 'in_service') return;
      
//       const error = validateField(key, form[key]);
//       if (error) {
//         newErrors[key] = error;
//         isValid = false;
//       }
//     });
    
//     setErrors(newErrors);
//     return isValid;
//   }, [isCreateMode, form, validateField]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (isCreateMode) {
//       setSubmitted(true);
//       if (!validateForm()) {
//         // Focus on first error field
//         const firstErrorField = Object.keys(errors).find(key => errors[key]);
//         if (firstErrorField === 'unit_number' && unitNumberRef.current) unitNumberRef.current.focus();
//         else if (firstErrorField === 'vehicle_make' && vehicleMakeRef.current) vehicleMakeRef.current.focus();
//         else if (firstErrorField === 'vehicle_model' && vehicleModelRef.current) vehicleModelRef.current.focus();
//         else if (firstErrorField === 'notes' && notesRef.current) notesRef.current.focus();
//         return;
//       }
//     } else {
//       // For edit mode, use original validation
//       if (!e.target.checkValidity()) {
//         e.target.reportValidity();
//         return;
//       }
//     }
    
//     try {
//       // Pass full data (add id only if editing)
//       const dataToSave = isEdit ? { ...form, id: unit.id } : form;

//       onSave(dataToSave);

//       // Success toast
//       successToast(
//         isEdit
//           ? `Ambulance "${form.unit_number}" updated successfully!`
//           : `Ambulance "${form.unit_number}" added successfully!`
//       );

//       // Close modal
//       onClose();
//     } catch (error) {
//       errorToast(
//         isEdit ? "Failed to update ambulance" : "Failed to add ambulance"
//       );
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 font-[Helvetica] z-50">
//       <div
//         className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
//                     bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70"
//       >
//         <div
//           className="w-[504px] h-[420px] rounded-[19px] bg-gray-100 dark:bg-[#000000] p-6 relative"
//           style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//         >
//           {/* Inner gradient border */}
//           <div
//             style={{
//               position: "absolute",
//               inset: 0,
//               borderRadius: "20px",
//               padding: "2px",
//               background:
//                 "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//               WebkitMask:
//                 "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//               WebkitMaskComposite: "xor",
//               maskComposite: "exclude",
//               pointerEvents: "none",
//               zIndex: 0,
//             }}
//           />

//           {/* Header */}
//           <div className="flex justify-between items-center pb-2 mb-3">
//             <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
//               {unit ? "Edit Unit" : "Add Unit"}
//             </h3>
//             <button
//               onClick={onClose}
//               className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A]
//                           bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
//             >
//               <X size={16} className="text-black dark:text-white" />
//             </button>
//           </div>

//           <form
//             onSubmit={handleSubmit}
//             noValidate
//             className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm"
//           >
//             <TextInput
//               label="Unit Number"
//               name="unit_number"
//               required={true}
//               placeholder="e.g. AMB-09"
//               value={form.unit_number}
//               onChange={handleChange}
//               error={errors.unit_number}
//               submitted={submitted}
//               isCreateMode={isCreateMode}
//               inputRef={unitNumberRef}
//             />

//             <div>
//               <label className="text-black dark:text-white">
//                 In Service {isCreateMode && <span className="text-red-500 ml-1">*</span>}
//               </label>
//               <div className="mt-1 flex items-center">
//                 <input
//                   type="checkbox"
//                   name="in_service"
//                   checked={form.in_service}
//                   onChange={handleChange}
//                   className="appearance-none w-5 h-5 ml-3 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
//                 />
//                 <span className="ml-2 text-sm">
//                   {form.in_service ? "Yes" : "No"}
//                 </span>
//               </div>
//             </div>

//             <TextInput
//               label="Make"
//               name="vehicle_make"
//               required={true}
//               placeholder="e.g. Ford"
//               value={form.vehicle_make}
//               onChange={handleChange}
//               error={errors.vehicle_make}
//               submitted={submitted}
//               isCreateMode={isCreateMode}
//               inputRef={vehicleMakeRef}
//             />

//             <TextInput
//               label="Model"
//               name="vehicle_model"
//               required={true}
//               placeholder="Transit"
//               value={form.vehicle_model}
//               onChange={handleChange}
//               error={errors.vehicle_model}
//               submitted={submitted}
//               isCreateMode={isCreateMode}
//               inputRef={vehicleModelRef}
//             />

//             <TextArea
//               label="Notes"
//               name="notes"
//               placeholder="Any special notes... (Optional)"
//               value={form.notes}
//               onChange={handleChange}
//               error={errors.notes}
//               submitted={submitted}
//               isCreateMode={isCreateMode}
//               inputRef={notesRef}
//             />

//             <div className="col-span-2 flex justify-center gap-2 mt-4">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-gray-600
//                             text-gray-600 dark:text-white font-medium text-[14px] leading-[16px]
//                             shadow-[0_2px_12px_0px_#00000040] bg-gray-100 dark:bg-transparent"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B66]
//                             bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
//                             shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px]
//                             hover:scale-105 transition"
//               >
//                 {unit ? "Save" : "Create"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AmbulanceUnitsModal;

// src/components/AmbulanceUnitsModal.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Phone } from "lucide-react";
import { successToast, errorToast } from "../../../components/Toast.jsx";

// Move ErrorMessage outside
const ErrorMessage = ({ field, errors, submitted, isCreateMode }) => {
  if (!errors[field]) return null;
  
  // Show errors in both create and edit modes when submitted or field is invalid
  if (submitted || isCreateMode) {
    return (
      <div className="mt-1 text-red-500 text-xs">
        <span>{errors[field]}</span>
      </div>
    );
  }
  
  return null;
};

// Move TextInput outside
const TextInput = React.memo(({ 
  label, 
  name, 
  required = false, 
  placeholder, 
  type = "text",
  value,
  onChange,
  error,
  submitted,
  isCreateMode,
  inputRef,
  showIcon = false,
  icon: Icon = null,
  className = "",
  maxLength
}) => {
  return (
    <div className={className}>
      <label className="text-black dark:text-white">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={false}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
                    bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B]
                    placeholder-gray-400 dark:placeholder-gray-500 outline-none"
          style={showIcon ? { paddingLeft: '2.5rem' } : {}}
        />
        {showIcon && Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0EFF7B]" />
        )}
      </div>
      <ErrorMessage 
        field={name} 
        errors={{[name]: error}} 
        submitted={submitted} 
        isCreateMode={isCreateMode}
      />
    </div>
  );
});

// Move TextArea outside
const TextArea = React.memo(({ 
  label, 
  name, 
  required = false, 
  placeholder, 
  value,
  onChange,
  error,
  submitted,
  isCreateMode,
  inputRef,
  className = ""
}) => {
  return (
    <div className={className}>
      <label className="text-black dark:text-white">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        ref={inputRef}
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        required={false}
        placeholder={placeholder}
        className="w-full mt-1 px-3 py-2 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
                    bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B]
                    placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none"
      />
      <ErrorMessage 
        field={name} 
        errors={{[name]: error}} 
        submitted={submitted} 
        isCreateMode={isCreateMode}
      />
    </div>
  );
});

const AmbulanceUnitsModal = ({
  isOpen,
  onClose,
  unit, // null = Add, object = Edit
  onSave,
}) => {
  const isEdit = !!unit?.id;
  const isCreateMode = !isEdit;

  const [form, setForm] = useState({
    unit_number: "",
    vehicle_make: "",
    vehicle_model: "",
    phone: "",
    contact_number: "", // Alternative phone field
    in_service: true,
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const unitNumberRef = useRef(null);
  const vehicleMakeRef = useRef(null);
  const vehicleModelRef = useRef(null);
  const phoneRef = useRef(null);
  const contactNumberRef = useRef(null);
  const notesRef = useRef(null);

  // Common words that should be recognized as valid makes
  const validMakeWords = [
    "ford", "toyota", "honda", "chevrolet", "mercedes", "bmw", "audi", "volkswagen",
    "nissan", "hyundai", "kia", "mazda", "subaru", "lexus", "jeep", "ram", "gmc",
    "cadillac", "buick", "chrysler", "dodge", "tesla", "volvo", "porsche", "jaguar",
    "land rover", "ferrari", "lamborghini", "maserati", "bentley", "rolls royce",
    "aston martin", "mclaren", "fiat", "alfa romeo", "mini", "renault", "peugeot",
    "citroen", "opel", "vauxhall", "seat", "skoda", "dacia", "mitsubishi", "suzuki",
    "isuzu", "mg", "rover", "saab", "pontiac", "oldsmobile", "saturn", "acura",
    "infiniti", "genesis", "lincoln", "mercury", "plymouth", "eagle", "geo",
    "daewoo", "proton", "perodua", "maruti", "tata", "mahindra", "force"
  ];

  // Common model patterns/words
  const validModelWords = [
    "civic", "accord", "camry", "corolla", "f-150", "f150", "silverado", "ram", "mustang",
    "explorer", "escape", "focus", "fusion", "taurus", "fiesta", "transit", "sprinter",
    "caravan", "pacifica", "voyager", "grand caravan", "odyssey", "pilot", "cr-v", "hr-v",
    "passport", "ridgeline", "tacoma", "tundra", "4runner", "highlander", "rav4",
    "sequoia", "sienna", "prius", "camry", "corolla", "yaris", "avalon", "mirai",
    "supra", "86", "brz", "forester", "outback", "impreza", "wrx", "legacy", "crosstrek",
    "ascent", "xv", "model s", "model 3", "model x", "model y", "cybertruck", "roadster",
    "s-class", "e-class", "c-class", "a-class", "b-class", "g-class", "gla", "glb",
    "glc", "gle", "gls", "eqs", "eqc", "eqb", "eqa", "eqe", "eqs suv", "eqe suv",
    "x5", "x3", "x1", "x7", "x6", "x4", "x2", "z4", "i4", "ix", "i3", "i8", "m3", "m4",
    "m5", "m8", "a4", "a6", "a8", "q5", "q7", "q8", "q3", "etron", "rs6", "rs7", "sq5",
    "golf", "jetta", "passat", "tiguan", "atlas", "taos", "arteon", "id.4", "id.3",
    "id.buzz", "id.5", "id.7", "kona", "elantra", "sonata", "tucson", "santa fe",
    "palisade", "ioniq", "nexo", "venue", "accent", "veloster", "soul", "sportage",
    "telluride", "forte", "k5", "stinger", "niro", "ev6", "ev9", "carnival", "seltos"
  ];

  // Check if a string looks like a real word (not just repeated letters)
  const isValidRealWord = (word, category = 'make') => {
    if (!word || word.length < 2) return false;
    
    const lowerWord = word.toLowerCase();
    
    // Check against common valid words
    const wordList = category === 'make' ? validMakeWords : validModelWords;
    if (wordList.some(validWord => lowerWord.includes(validWord))) {
      return true;
    }
    
    // Check for repeated letters pattern (like "hhhhh" or "yyyyy")
    if (/(.)\1{3,}/.test(lowerWord)) {
      return false;
    }
    
    // Check if the word has at least 2 different letters
    const uniqueLetters = new Set(lowerWord.replace(/[^a-z]/g, '').split(''));
    if (uniqueLetters.size < 2) {
      return false;
    }
    
    // Check vowel-consonant ratio - real words usually have a mix
    const vowels = (lowerWord.match(/[aeiou]/g) || []).length;
    const consonants = (lowerWord.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
    
    // If it's all consonants or all vowels, might be invalid
    if (consonants > 0 && vowels === 0 && lowerWord.length > 3) {
      return false;
    }
    
    if (vowels > 0 && consonants === 0 && lowerWord.length > 3) {
      return false;
    }
    
    // Check for keyboard smashing patterns (e.g., "asdfghjkl")
    const keyboardSmashPattern = /^(qwerty|asdfgh|zxcvbn|qwertyuiop|asdfghjkl|zxcvbnm)/i;
    if (keyboardSmashPattern.test(lowerWord)) {
      return false;
    }
    
    return true;
  };

  // Sanitize phone input - FIXED: Only allow digits, +, -, spaces, parentheses
  const sanitizePhoneInput = (value) => {
    // Allow digits, spaces, hyphens, plus, parentheses
    return value.replace(/[^\d\s\-+()]/g, '');
  };

  // FIXED: Validate phone number - must be exactly 10 digits when stripped of formatting
  const validatePhoneNumber = (value) => {
    if (!value || !value.trim()) return ""; // Optional field
    
    const digitsOnly = value.replace(/\D/g, '');
    
    // Check length - must be exactly 10 digits
    if (digitsOnly.length === 0) return "";
    if (digitsOnly.length < 10) return "Phone number must have exactly 10 digits";
    if (digitsOnly.length > 10) return "Phone number must have exactly 10 digits";
    
    // Check for valid phone format (Indian mobile numbers start with 6-9)
    if (!/^[6-9]/.test(digitsOnly)) {
      return "Phone number must start with 6, 7, 8, or 9";
    }
    
    // Check for repeated digits (like 1111111111, 2222222222)
    const isRepeated = /^(\d)\1{9}$/.test(digitsOnly);
    if (isRepeated) {
      return "Invalid phone number - cannot have all digits same";
    }
    
    // Check for sequential digits (like 1234567890)
    const isSequential = /^0123456789|1234567890|9876543210|012345678|123456789|234567890$/.test(digitsOnly);
    if (isSequential) {
      return "Invalid phone number - cannot be sequential";
    }
    
    return "";
  };

  // Validation rules - FIXED: Now validates for BOTH create and edit modes
  const validateField = useCallback((name, value) => {
    // Validate for BOTH create and edit modes - removed the !isCreateMode condition
    
    switch (name) {
      case "unit_number":
        if (!value.trim()) return "Unit number is required";
        if (value.trim().length < 3) return "Unit number must be at least 3 characters";
        if (value.trim().length > 20) return "Unit number cannot exceed 20 characters";
        if (!/^[A-Za-z0-9\-_]+$/.test(value.trim())) return "Unit number can only contain letters, numbers, hyphens and underscores";
        return "";
        
      case "vehicle_make":
        if (!value.trim()) return "Vehicle make is required";
        
        const makeValue = value.trim();
        
        if (makeValue.length < 2) return "Vehicle make must be at least 2 characters";
        if (makeValue.length > 50) return "Vehicle make cannot exceed 50 characters";
        
        // Must start with CAPITAL letter
        if (!/^[A-Z]/.test(makeValue)) {
          return "Vehicle make must start with a capital letter";
        }
        
        // Only letters, spaces, and hyphens (NO numbers for make)
        if (!/^[A-Z][A-Za-z\s-]*$/.test(makeValue)) {
          return "Vehicle make can only contain letters, spaces, and hyphens";
        }
        
        // Check if it's a real word, not just repeated letters
        if (!isValidRealWord(makeValue, 'make')) {
          return "Please enter a valid vehicle make (e.g., Ford, Toyota, Mercedes)";
        }
        
        return "";
        
      case "vehicle_model":
        if (!value.trim()) return "Vehicle model is required";
        
        const modelValue = value.trim();
        
        if (modelValue.length < 2) return "Vehicle model must be at least 2 characters";
        if (modelValue.length > 50) return "Vehicle model cannot exceed 50 characters";
        
        // Must start with CAPITAL letter
        if (!/^[A-Z]/.test(modelValue)) {
          return "Vehicle model must start with a capital letter";
        }
        
        // Can contain letters, numbers, spaces, hyphens
        if (!/^[A-Z][A-Za-z0-9\s-]*$/.test(modelValue)) {
          return "Vehicle model can only contain letters, numbers, spaces, and hyphens";
        }
        
        // Check if it's a real model, not just repeated letters
        if (!isValidRealWord(modelValue, 'model')) {
          return "Please enter a valid vehicle model (e.g., Transit, Sprinter, Civic)";
        }
        
        return "";

      case "phone":
        // Phone is optional, but validate if provided
        return validatePhoneNumber(value);
        
      case "contact_number":
        // Contact number is optional, but validate if provided
        return validatePhoneNumber(value);
        
      case "notes":
        // Notes is optional, but validate if provided
        if (value && value.trim()) {
          if (value.trim().length > 500) return "Notes cannot exceed 500 characters";
        }
        return "";
        
      default:
        return "";
    }
  }, []); // Removed isCreateMode dependency

  // Handle change - useCallback
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    
    // Sanitize phone inputs
    if (name === 'phone' || name === 'contact_number') {
      newValue = sanitizePhoneInput(newValue);
    }
    
    // Auto-capitalize first letter for make and model
    if ((name === 'vehicle_make' || name === 'vehicle_model') && newValue.length === 1) {
      newValue = newValue.toUpperCase();
    }
    
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    
    // Clear errors for this field when typing
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
    
    // Always validate format errors while typing (for BOTH modes)
    const error = validateField(name, newValue);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validateField]);

  // Validate entire form - for BOTH modes
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(form).forEach(key => {
      // Skip in_service checkbox from validation
      if (key === 'in_service') return;
      
      const error = validateField(key, form[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [form, validateField]);

  // FIXED: Update handleSubmit to properly show toast for duplicates
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitted(true);
    
    // Validate form for BOTH modes before submission
    if (!validateForm()) {
      // Focus on first error field
      const firstErrorField = Object.keys(errors).find(key => errors[key]);
      if (firstErrorField === 'unit_number' && unitNumberRef.current) unitNumberRef.current.focus();
      else if (firstErrorField === 'vehicle_make' && vehicleMakeRef.current) vehicleMakeRef.current.focus();
      else if (firstErrorField === 'vehicle_model' && vehicleModelRef.current) vehicleModelRef.current.focus();
      else if (firstErrorField === 'phone' && phoneRef.current) phoneRef.current.focus();
      else if (firstErrorField === 'contact_number' && contactNumberRef.current) contactNumberRef.current.focus();
      else if (firstErrorField === 'notes' && notesRef.current) notesRef.current.focus();
      
      // Show first error as toast
      if (firstErrorField && errors[firstErrorField]) {
        errorToast(errors[firstErrorField]);
      }
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for saving
      const dataToSave = {
        unit_number: form.unit_number.trim(),
        vehicle_make: form.vehicle_make.trim(),
        vehicle_model: form.vehicle_model.trim(),
        phone: form.phone.trim() || null,
        contact_number: form.contact_number.trim() || null,
        in_service: form.in_service,
        notes: form.notes.trim() || null,
      };

      // Add id only if editing
      if (isEdit) {
        dataToSave.id = unit.id;
      }

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      
      // Handle 409 Conflict (duplicate entry)
      if (error.response?.status === 409) {
        const responseData = error.response.data;
        
        if (responseData?.detail?.errors) {
          const duplicateErrors = responseData.detail.errors;
          
          // Set field-specific errors
          setErrors(prev => ({
            ...prev,
            ...duplicateErrors
          }));
          
          // Show toast for each duplicate error - FIXED: Now shows properly
          Object.values(duplicateErrors).forEach(msg => {
            errorToast(msg);
          });
          
          // Focus on the first field with error
          const firstErrorField = Object.keys(duplicateErrors)[0];
          if (firstErrorField === 'unit_number' && unitNumberRef.current) unitNumberRef.current.focus();
          else if (firstErrorField === 'phone' && phoneRef.current) phoneRef.current.focus();
          else if (firstErrorField === 'contact_number' && contactNumberRef.current) contactNumberRef.current.focus();
        } else if (responseData?.detail) {
          // Handle simple string error
          errorToast(responseData.detail);
        } else {
          errorToast("Duplicate entry detected");
        }
      } 
      // Handle 422 Validation Error
      else if (error.response?.status === 422) {
        const responseData = error.response.data;
        
        if (responseData.detail && Array.isArray(responseData.detail)) {
          // FastAPI validation errors array
          const validationErrors = {};
          
          responseData.detail.forEach(err => {
            // Extract field name from location array
            if (err.loc && err.loc.length > 0) {
              const fieldName = err.loc[err.loc.length - 1];
              validationErrors[fieldName] = err.msg;
            }
          });
          
          // Set field-specific validation errors
          if (Object.keys(validationErrors).length > 0) {
            setErrors(prev => ({
              ...prev,
              ...validationErrors
            }));
            
            // Show toast with validation messages
            Object.values(validationErrors).forEach(msg => {
              errorToast(msg);
            });
          } else {
            // If no field-specific errors, show the first message
            const firstError = responseData.detail[0];
            errorToast(firstError.msg || "Validation error");
          }
        } else if (responseData.detail) {
          // Handle string error
          errorToast(responseData.detail);
        } else {
          errorToast("Validation error. Please check your input.");
        }
      }
      // Handle other errors
      else {
        const errorMessage = error.response?.data?.detail || 
                            error.message || 
                            (isEdit ? "Failed to update ambulance" : "Failed to add ambulance");
        errorToast(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form and errors when modal opens
  useEffect(() => {
    if (isOpen && unit) {
      setForm({
        unit_number: unit.unit_number || "",
        vehicle_make: unit.vehicle_make || "",
        vehicle_model: unit.vehicle_model || "",
        phone: unit.phone || "",
        contact_number: unit.contact_number || "",
        in_service: unit.in_service !== undefined ? unit.in_service : true,
        notes: unit.notes || "",
      });
    } else if (isOpen && !unit) {
      setForm({
        unit_number: "",
        vehicle_make: "",
        vehicle_model: "",
        phone: "",
        contact_number: "",
        in_service: true,
        notes: "",
      });
    }
    setErrors({});
    setSubmitted(false);
    setLoading(false);
  }, [isOpen, unit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 font-[Helvetica] z-50">
      <div
        className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
                    bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70"
      >
        <div
          className="w-[790px] h-auto max-h-[90vh] overflow-y-auto rounded-[19px] bg-gray-100 dark:bg-[#000000] p-6 relative"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          {/* Inner gradient border */}
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
          <div className="flex justify-between items-center pb-2 mb-3">
            <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
              {unit ? "Edit Unit" : "Add Unit"}
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A]
                          bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4"
          >
            {/* 3x3 Grid Layout */}
            <div className="grid grid-cols-3 gap-4">
              {/* Row 1: Unit Number, In Service (checkbox), Make */}
              <TextInput
                label="Unit Number"
                name="unit_number"
                required={true}
                placeholder="e.g. AMB-09"
                value={form.unit_number}
                onChange={handleChange}
                error={errors.unit_number}
                submitted={submitted}
                isCreateMode={isCreateMode}
                inputRef={unitNumberRef}
                className="col-span-1"
                maxLength={20}
              />

              {/* In Service Checkbox - Column 2 */}
              <div className="col-span-1">
                <label className="text-black dark:text-white block">
                  In Service <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="mt-2 flex items-center h-[33px]">
                  <input
                    type="checkbox"
                    name="in_service"
                    checked={form.in_service}
                    onChange={handleChange}
                    className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm 
                              bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 
                              checked:border-[#0EFF7B] dark:checked:border-green-500 
                              flex items-center justify-center 
                              checked:before:content-['✔'] checked:before:text-white 
                              dark:checked:before:text-black checked:before:text-sm"
                  />
                  <span className="ml-2 text-sm">
                    {form.in_service ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {/* Make - Column 3 */}
              <TextInput
                label="Make"
                name="vehicle_make"
                required={true}
                placeholder="e.g. Ford"
                value={form.vehicle_make}
                onChange={handleChange}
                error={errors.vehicle_make}
                submitted={submitted}
                isCreateMode={isCreateMode}
                inputRef={vehicleMakeRef}
                className="col-span-1"
                maxLength={50}
              />

              {/* Row 2: Model, Primary Phone, Alternate Contact */}
              <TextInput
                label="Model"
                name="vehicle_model"
                required={true}
                placeholder="e.g. Transit"
                value={form.vehicle_model}
                onChange={handleChange}
                error={errors.vehicle_model}
                submitted={submitted}
                isCreateMode={isCreateMode}
                inputRef={vehicleModelRef}
                className="col-span-1"
                maxLength={50}
              />

              <TextInput
                label="Primary Phone"
                name="phone"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                submitted={submitted}
                isCreateMode={isCreateMode}
                inputRef={phoneRef}
                showIcon={true}
                icon={Phone}
                className="col-span-1"
                maxLength={15}
              />

              <TextInput
                label="Alternate Contact"
                name="contact_number"
                placeholder="e.g. 9876543210"
                value={form.contact_number}
                onChange={handleChange}
                error={errors.contact_number}
                submitted={submitted}
                isCreateMode={isCreateMode}
                inputRef={contactNumberRef}
                showIcon={true}
                icon={Phone}
                className="col-span-1"
                maxLength={15}
              />

              {/* Row 3: Notes (full width) */}
              <TextArea
                label="Notes"
                name="notes"
                placeholder="Any special notes... (Optional)"
                value={form.notes}
                onChange={handleChange}
                error={errors.notes}
                submitted={submitted}
                isCreateMode={isCreateMode}
                inputRef={notesRef}
                className="col-span-3"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-gray-600
                            text-gray-600 dark:text-white font-medium text-[14px] leading-[16px]
                            shadow-[0_2px_12px_0px_#00000040] bg-gray-100 dark:bg-transparent
                            hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B66]
                            bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
                            shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px]
                            hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isEdit ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  unit ? "Save" : "Create"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceUnitsModal;
