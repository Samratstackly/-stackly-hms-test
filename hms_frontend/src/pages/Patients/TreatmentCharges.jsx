// import React, { useState, useEffect } from "react";
// import {
//   Search,
//   Pencil,
//   Plus,
//   Trash,
//   X,
//   Loader2,
// } from "lucide-react";
// import { Listbox, Dialog } from "@headlessui/react";
// import api from "../../utils/axiosConfig";
// import { successToast, errorToast } from "../../components/Toast.jsx";
// import DeleteChargePopup from "./DeleteChargePopup";
// import EditChargePopup from "./EditChargePopup";

// const TreatmentCharges = () => {
//   // State for patients
//   const [searchQuery, setSearchQuery] = useState("");
//   const originalPatients = [
//     { id: "SAH027/384", name: "Joe Darrington", numericId: 1 },
//     { id: "SA123456", name: "John Doe", numericId: 2 },
//     { id: "SA789012", name: "Jane Smith", numericId: 3 },
//   ];
//   const [patients, setPatients] = useState(originalPatients);
//   const [filteredPatients, setFilteredPatients] = useState(patients);
  
//   // State for selected patient
//   const [selectedPatient, setSelectedPatient] = useState(null);
//   const [patientInfo, setPatientInfo] = useState({
//     patientName: "",
//     patientID: "",
//     ageGender: "",
//     admissionStart: "",
//     admissionEnd: "",
//     dateOfBirth: "",
//     address: "",
//   });
  
//   // State for treatment charges
//   const [treatmentCharges, setTreatmentCharges] = useState([]);
//   const [filteredCharges, setFilteredCharges] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
  
//   // State for popups
//   const [showDeletePopup, setShowDeletePopup] = useState(false);
//   const [showEditPopup, setShowEditPopup] = useState(false);
//   const [selectedCharge, setSelectedCharge] = useState(null);
  
//   // Form states
//   const [newCharge, setNewCharge] = useState({
//     description: "",
//     quantity: 1,
//     unit_price: "",
//     amount: "",
//   });
  
//   // Validation errors for add form
//   const [validationErrors, setValidationErrors] = useState({});
//   const [submitted, setSubmitted] = useState(false);
  
//   // Status filter state
//   const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, BILLED, CANCELLED
//   // Helper: starts with uppercase letter A-Z
// const startsWithCapital = (str) => {
//   return /^[A-Z]/.test(str);
// };

// // Helper: contains at least one letter (a-z or A-Z) anywhere
// const hasAtLeastOneLetter = (str) => {
//   return /[a-zA-Z]/.test(str);
// };
  
//   // Filter treatment charges based on status filter
//   useEffect(() => {
//     if (statusFilter === "ALL") {
//       setFilteredCharges(treatmentCharges);
//     } else {
//       setFilteredCharges(treatmentCharges.filter(charge => charge.status === statusFilter));
//     }
//   }, [treatmentCharges, statusFilter]);

//   // Fetch patients on component mount
//   useEffect(() => {
//     fetchPatients();
//   }, []);

//   // Filter patients based on search query
//   useEffect(() => {
//     const lowerQuery = searchQuery.toLowerCase();
//     setFilteredPatients(
//       patients.filter(
//         (p) =>
//           p.name.toLowerCase().includes(lowerQuery) ||
//           p.id.toLowerCase().includes(lowerQuery)
//       )
//     );
//   }, [searchQuery, patients]);

//   // Fetch patients list
//   const fetchPatients = async () => {
//     try {
//       let patientsData = [];

//       try {
//         const res = await api.get("/patients/");

//         console.log("Patients list API Response:", res.data);

//         // Handle different response structures
//         if (Array.isArray(res.data)) {
//           patientsData = res.data;
//         } else if (res.data && Array.isArray(res.data.results)) {
//           patientsData = res.data.results;
//         } else if (res.data && Array.isArray(res.data.data)) {
//           patientsData = res.data.data;
//         } else if (res.data && Array.isArray(res.data.patients)) {
//           patientsData = res.data.patients;
//         } else if (res.data && typeof res.data === "object") {
//           patientsData = [res.data];
//         }
//       } catch (listError) {
//         console.log("List endpoint failed, using fallback...");
//       }
      
//       if (patientsData.length === 0) {
//         console.log("No patients found, using fallback data");
//         setPatients(originalPatients);
//         setFilteredPatients(originalPatients);
//         return;
//       }
      
//       const mappedPatients = patientsData.map((p) => ({
//         id: p.patient_unique_id || p.unique_id || p.id || "N/A",
//         name: p.full_name || p.name || p.patient_name || "Unknown Patient",
//         numericId: p.id, // Store the numeric ID for backend API
//         patient_id: p.id, // Also store as patient_id
//       }));
      
//       setPatients(mappedPatients);
//       setFilteredPatients(mappedPatients);
      
//     } catch (err) {
//       console.error("Failed to load patients:", err);
//       setPatients(originalPatients);
//       setFilteredPatients(originalPatients);
//     }
//   };

//   // Fetch patient details and treatment charges
//   const fetchPatientDetails = async (patientId) => {
//     try {
//       setLoading(true);
      
//       // First try the treatment charges API endpoint for patient details
//       try {
//         const res = await api.get(`/treatment-charges/patients/${patientId}/details`);

//         console.log("Patient Details from treatment-charges API:", res.data);
//         const patientData = res.data;
        
//         // Update patient info state with all details
//         setPatientInfo({
//           patientName: patientData.full_name || "",
//           patientID: patientData.patient_unique_id || patientId,
//           ageGender: `${patientData.age || ""}/${patientData.gender || ""}`,
//           admissionStart: patientData.admission_date || "",
//           admissionEnd: patientData.discharge_date || "",
//           dateOfBirth: patientData.date_of_birth || "",
//           address: patientData.address || "",
//         });
        
//         // Fetch treatment charges for this patient
//         await fetchTreatmentCharges(patientId);
        
//         successToast(`Patient ${patientData.full_name} details loaded`);
        
//       } catch (chargesApiError) {
//         console.log("Treatment charges API failed, trying patients API:", chargesApiError);
        
//         // Fallback to patients API
//         const patientRes = await api.get(`/patients/${patientId}`);

//         const patientData = patientRes.data.data || patientRes.data.patient || patientRes.data;
        
//         // Update patient info state
//         setPatientInfo({
//           patientName: patientData.full_name || patientData.name || "",
//           patientID: patientData.patient_unique_id || patientData.unique_id || patientData.id || "",
//           ageGender: `${patientData.age || ""}/${patientData.gender || ""}`,
//           admissionStart: patientData.admission_date || "",
//           admissionEnd: patientData.discharge_date || "",
//           dateOfBirth: patientData.date_of_birth || "",
//           address: patientData.address || "",
//         });
        
//         // Fetch treatment charges for this patient
//         await fetchTreatmentCharges(patientData.id || patientId);
        
//         successToast(`Patient ${patientData.full_name || patientData.name} details loaded`);
//       }
      
//     } catch (err) {
//       console.error("Failed to load patient details:", err);
//       errorToast("Failed to load patient details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch treatment charges for a patient - CORRECTED ENDPOINT
//   const fetchTreatmentCharges = async (patientId) => {
//     try {
//       // CORRECTED: Use the right endpoint from your backend
//       const res = await api.get(`/treatment-charges/patient/${patientId}`);

//       console.log("Treatment charges API response:", res.data);

//       let chargesData = [];

//       // Handle different response structures
//       if (Array.isArray(res.data)) {
//         chargesData = res.data;
//       } else if (res.data && Array.isArray(res.data.results)) {
//         chargesData = res.data.results;
//       } else if (res.data && Array.isArray(res.data.data)) {
//         chargesData = res.data.data;
//       } else if (res.data && Array.isArray(res.data.charges)) {
//         chargesData = res.data.charges;
//       } else {
//         console.log("Unexpected response structure:", res.data);
//         chargesData = [];
//       }

//       // Sort by created_at in DESC order (newest first) to show newest at top
//       const sortedCharges = [...chargesData].sort((a, b) => {
//         return new Date(b.created_at) - new Date(a.created_at);
//       });

//       // Format the charges with serial numbers
//       const formattedCharges = sortedCharges.map((charge, index) => ({
//         ...charge,
//         sNo: (index + 1).toString().padStart(2, "0"),
//         formattedAmount: parseFloat(charge.amount || (charge.quantity * charge.unit_price)).toFixed(2),
//       }));

//       console.log("Formatted charges for patient:", patientId, formattedCharges);
//       setTreatmentCharges(formattedCharges);
//       setFilteredCharges(formattedCharges); // Initialize filtered charges
      
//     } catch (err) {
//       console.error("Failed to load treatment charges:", err);
//       // If endpoint doesn't exist or no charges found, show empty state
//       if (err.response?.status === 404 || err.response?.status === 400) {
//         console.log("No treatment charges found for this patient");
//         setTreatmentCharges([]);
//         setFilteredCharges([]);
//       } else {
//         errorToast("Failed to load treatment charges");
//         setTreatmentCharges([]);
//         setFilteredCharges([]);
//       }
//     }
//   };

//   // Handle patient selection from dropdown
//   const handlePatientSelect = (patient) => {
//     console.log("Patient selected:", patient);
//     setSelectedPatient({
//       ...patient,
//       numericId: patient.numericId || patient.patient_id || patient.id
//     });
//     setStatusFilter("ALL"); // Reset filter when selecting new patient
//     fetchPatientDetails(patient.numericId || patient.patient_id || patient.id);
//     setSearchQuery(""); // Clear search after selection
//   };

//   // Handle patient selection by ID
//   const handlePatientIDChange = (value) => {
//     const patient = filteredPatients.find((p) => p.id === value);
//     if (patient) {
//       console.log("Patient selected by ID:", patient);
//       setSelectedPatient({
//         ...patient,
//         numericId: patient.numericId || patient.patient_id
//       });
//       setStatusFilter("ALL"); // Reset filter when selecting new patient
//       fetchPatientDetails(patient.numericId || patient.patient_id || patient.id);
//     }
//   };

//   // Handle patient name change
//   const handlePatientNameChange = (value) => {
//     const patient = filteredPatients.find((p) => p.name === value);
//     if (patient) {
//       console.log("Patient selected by name:", patient);
//       setSelectedPatient({
//         ...patient,
//         numericId: patient.numericId || patient.patient_id
//       });
//       setStatusFilter("ALL"); // Reset filter when selecting new patient
//       fetchPatientDetails(patient.numericId || patient.patient_id || patient.id);
//     }
//   };

//   // Reset form
//   const resetNewChargeForm = () => {
//     setNewCharge({
//       description: "",
//       quantity: 1,
//       unit_price: "",
//       amount: "",
//     });
//     setValidationErrors({});
//     setSubmitted(false);
//   };

//   // Handle form change with validation
//   const handleFormChange = (field, value) => {
//   const errors = { ...validationErrors };

//   if (field === "description") {
//     const trimmed = value.trim();

//     if (trimmed) {
//       if (!startsWithCapital(trimmed)) {
//         errors.description = "Must start with a capital letter (A-Z)";
//       } else if (!hasAtLeastOneLetter(trimmed)) {
//         errors.description = "Must contain at least one letter";
//       } else {
//         delete errors.description;
//       }
//     } else {
//       delete errors.description; // clear error when empty (required error shows only on submit)
//     }
//   }

//   // Quantity live validation
//   if (field === "quantity" && value !== "") {
//     const num = parseInt(value);
//     if (isNaN(num) || num <= 0) {
//       errors.quantity = "Must be greater than 0";
//     } else {
//       delete errors.quantity;
//     }
//   }

//   // Unit price live validation
//   if (field === "unit_price" && value !== "") {
//     const num = parseFloat(value);
//     if (isNaN(num) || num <= 0) {
//       errors.unit_price = "Must be greater than 0";
//     } else {
//       delete errors.unit_price;
//     }
//   }

//   setValidationErrors(errors);

//   // Auto-calculate amount
//   let updatedAmount = newCharge.amount;
//   if (field === "quantity" && newCharge.unit_price) {
//     const qty = parseFloat(value) || 0;
//     updatedAmount = (qty * parseFloat(newCharge.unit_price)).toFixed(2);
//   } else if (field === "unit_price" && newCharge.quantity) {
//     const price = parseFloat(value) || 0;
//     updatedAmount = (parseFloat(newCharge.quantity) * price).toFixed(2);
//   }

//   setNewCharge({
//     ...newCharge,
//     [field]: value,
//     amount: updatedAmount || "",
//   });
// };
 
//   // Validate form
//   const validateForm = () => {
//     const errors = {};
//     const desc = newCharge.description.trim();
    
//     // Required field validation (only triggers after submission)
//     if (submitted) {
//     if (!desc) {
//       errors.description = "Description is required";
//     } else if (!startsWithCapital(desc)) {
//       errors.description = "Description must start with a capital letter (A-Z)";
//     } else if (!hasAtLeastOneLetter(desc)) {
//       errors.description = "Description must contain at least one letter";
//     }
//   }
    
//     // Required field validation (only triggers after submission)
//     if (submitted && !newCharge.quantity) {
//       errors.quantity = "Quantity is required";
//     }
    
//     // Required field validation (only triggers after submission)
//     if (submitted && !newCharge.unit_price) {
//       errors.unit_price = "Unit price is required";
//     }
    
//     // Quantity validation (shows during typing too)
//     if (newCharge.quantity !== "") {
//     const qty = parseInt(newCharge.quantity);
//     if (isNaN(qty) || qty <= 0) {
//       errors.quantity = "Quantity must be a number greater than 0";
//     }
//   }
    
//     // Unit price validation (shows during typing too)
//    if (newCharge.unit_price !== "") {
//     const price = parseFloat(newCharge.unit_price);
//     if (isNaN(price) || price <= 0) {
//       errors.unit_price = "Unit price must be a number greater than 0";
//     }
//   }
    
//     return errors;
//   };

//   // Handle add new charge
//   const handleAddCharge = async () => {
//     setSubmitted(true);
    
//     const errors = validateForm();
    
//     // Check for required fields
//     if (!newCharge.description.trim()) {
//       errors.description = "Description is required";
//     }
    
//     if (!newCharge.quantity) {
//       errors.quantity = "Quantity is required";
//     }
    
//     if (!newCharge.unit_price) {
//       errors.unit_price = "Unit price is required";
//     }
    
//     if (Object.keys(errors).length > 0) {
//       setValidationErrors(errors);
//       return;
//     }

//     try {
//       if (!selectedPatient || !selectedPatient.numericId) {
//         errorToast("Could not determine patient ID. Please select the patient again.");
//         return;
//       }

//       const chargeData = {
//         patient_id: parseInt(selectedPatient.numericId), // Must be integer
//         description: newCharge.description.trim(),
//         quantity: parseInt(newCharge.quantity),
//         unit_price: parseFloat(newCharge.unit_price),
//         // Only include amount if it has a value
//         ...(newCharge.amount && newCharge.amount !== "" && { amount: parseFloat(newCharge.amount) })
//       };

//       console.log("Sending charge data:", JSON.stringify(chargeData, null, 2));

//       const res = await api.post("/treatment-charges/", chargeData);

//       console.log("Response:", res.data);
      
//       successToast("Treatment charge added successfully");
//       setShowAddModal(false);
//       resetNewChargeForm();
      
//       // Refresh the charges list - fetch again to get updated list with correct order
//       await fetchTreatmentCharges(selectedPatient.numericId || selectedPatient.id);
      
//     } catch (err) {
//       console.error("Failed to add treatment charge:", err);
//       console.error("Error response:", err.response?.data);
      
//       if (err.response?.data?.detail) {
//         const errorDetail = err.response.data.detail;
//         if (Array.isArray(errorDetail)) {
//           errorToast(errorDetail.map(e => e.msg || e).join(", "));
//         } else {
//           errorToast(errorDetail);
//         }
//       } else {
//         errorToast("Failed to add treatment charge. Please check the data.");
//       }
//     }
//   };

//   // Handle delete charge
//   const handleDeleteCharge = (charge) => {
//     setSelectedCharge(charge);
//     setShowDeletePopup(true);
//   };

//   const handleConfirmDelete = async (chargeId) => {
//     try {
//       await api.delete(`/treatment-charges/${chargeId}/`);

//       successToast("Treatment charge deleted successfully");
//       setShowDeletePopup(false);
//       setSelectedCharge(null);
      
//       // Refresh the charges list
//       await fetchTreatmentCharges(selectedPatient.numericId || selectedPatient.id);
//     } catch (err) {
//       console.error("Failed to delete treatment charge:", err);
//       errorToast("Failed to delete treatment charge");
//       throw err;
//     }
//   };

//   // Handle edit charge
//   const handleEditCharge = (charge) => {
//     setSelectedCharge(charge);
//     setShowEditPopup(true);
//   };

//   const handleUpdateCharge = async (chargeId, chargeData) => {
//     try {
//       const res = await api.put(`/treatment-charges/${chargeId}/`, chargeData);

//       successToast("Treatment charge updated successfully");
//       setShowEditPopup(false);
//       setSelectedCharge(null);
      
//       // Refresh the charges list
//       await fetchTreatmentCharges(selectedPatient.numericId || selectedPatient.id);
//     } catch (err) {
//       console.error("Failed to update treatment charge:", err);
//       console.error("Error response:", err.response?.data);
      
//       if (err.response?.data?.detail) {
//         const errorDetail = err.response.data.detail;
//         if (Array.isArray(errorDetail)) {
//           errorToast(errorDetail.map(e => e.msg || e).join(", "));
//         } else {
//           errorToast(errorDetail);
//         }
//       } else {
//         errorToast("Failed to update treatment charge");
//       }
//       throw err;
//     }
//   };

//   // Calculate total amount for filtered charges
//   const calculateTotal = () => {
//     return filteredCharges.reduce((total, charge) => {
//       return total + parseFloat(charge.amount || charge.quantity * charge.unit_price);
//     }, 0).toFixed(2);
//   };

//   // Calculate counts for each status
//   const calculateStatusCounts = () => {
//     return {
//       ALL: treatmentCharges.length,
//       PENDING: treatmentCharges.filter(c => c.status === "PENDING").length,
//       BILLED: treatmentCharges.filter(c => c.status === "BILLED").length,
//       CANCELLED: treatmentCharges.filter(c => c.status === "CANCELLED").length,
//     };
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: '2-digit',
//         day: '2-digit'
//       });
//     } catch (e) {
//       return dateString;
//     }
//   };

//   // Get status counts
//   const statusCounts = calculateStatusCounts();

//   // Filter buttons configuration - Based on AppointmentList style
//   const filterButtons = [
//     { value: "ALL", label: "All" },
//     { value: "PENDING", label: "Pending" },
//     { value: "BILLED", label: "Billed" },
//     { value: "CANCELLED", label: "Cancelled" },
//   ];

//   return (
//     <div className="w-full max-w-screen-2xl mb-4 mx-auto">
//       <div className=" mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-6 w-full max-w-[2500px] mx-auto flex flex-col overflow-hidden relative font-[Helvetica]">
//         <div
//           className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
//           style={{
//             background:
//               "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
//             zIndex: 0,
//           }}
//         ></div>
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             borderRadius: "10px",
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
        
//         <h2 className="text-xl font-semibold mb-4 text-[#08994A] dark:text-[#0EFF7B]">
//           Treatment and Charges Management
//         </h2>
//         <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
//           Manage treatment charges for patients
//         </p>

//         {/* Patient Search and Selection */}
//         <div className="mb-6 flex flex-row justify-end items-center gap-2 flex-wrap max-w-full">
//           <div className="flex-1 min-w-[180px] max-w-[350px] lg:max-w-[400px] relative">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search patient name or ID"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="
//                   w-full
//                   h-[34px]
//                   pl-10 pr-4
//                   rounded
//                   border-[1.05px]
//                   border-[#0EFF7B] dark:border-[#0EFF7B1A]
//                   bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A]
//                   text-[#08994A] dark:text-white
//                   placeholder-[#5CD592] dark:placeholder-[#5CD592]
//                   focus:outline-none
//                   focus:border-[#0EFF7B]
//                   transition-all
//                   font-helvetica
//                 "
//               />
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0EFF7B] pointer-events-none" />
//             </div>
            
//             {/* Dropdown Results */}
//             {searchQuery.trim() && (
//     <div className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3C3C3C]">
//       {filteredPatients.length > 0 ? (
//         filteredPatients.map((patient) => (
//           <div
//             key={patient.id}
//             onClick={() => handlePatientSelect(patient)}
//             className="cursor-pointer px-3 py-1.5 text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126] border-b border-gray-200 dark:border-gray-800 last:border-b-0"
//           >
//             <div className="font-medium">{patient.name}</div>
//             <div className="text-xs text-gray-500 dark:text-gray-400">{patient.id}</div>
//           </div>
//         ))
//       ) : (
//         <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
//           No patient found matching "{searchQuery}"
//         </div>
//       )}
//     </div>
//   )}
//           </div>
          
//           {/* Patient Name and ID Dropdowns */}
//           <div className="flex gap-2 items-center flex-wrap">
//             <div className="relative min-w-[120px] w-[160px] lg:w-[180px]">
//               <Listbox
//                 value={patientInfo.patientName}
//                 onChange={handlePatientNameChange}
//               >
//                 <Listbox.Button
//                   className="
//                     w-full
//                     h-[33.5px]
//                     rounded-[8.38px]
//                     border-[1.05px]
//                     border-[#0EFF7B] dark:border-[#3C3C3C]
//                     bg-[#F5F6F5] dark:bg-black
//                     text-[#08994A] dark:text-white
//                     shadow-[0_0_2.09px_#0EFF7B]
//                     outline-none
//                     focus:border-[#0EFF7B]
//                     focus:shadow-[0_0_4px_#0EFF7B]
//                     transition-all
//                     duration-300
//                     px-3
//                     pr-8
//                     font-helvetica
//                     text-sm
//                     text-left
//                     relative
//                   "
//                 >
//                   {patientInfo.patientName || "Select Patient"}
//                   <svg
//                     className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                     strokeWidth={2}
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M6 9l6 6 6-6"
//                     />
//                   </svg>
//                 </Listbox.Button>
//                 <Listbox.Options
//                   className="
//                     absolute
//                     z-10
//                     mt-1
//                     w-full
//                     bg-gray-100 dark:bg-black
//                     border border-[#0EFF7B] dark:border-[#3C3C3C]
//                     rounded-md
//                     shadow-lg
//                     max-h-60
//                     overflow-auto
//                     text-sm
//                     font-helvetica
//                     top-[100%]
//                     left-0
//                   "
//                 >
//                   {filteredPatients.map((patient) => (
//                     <Listbox.Option
//                       key={patient.id}
//                       value={patient.name}
//                       className="
//                         cursor-pointer
//                         select-none
//                         p-2
//                         text-[#08994A] dark:text-white
//                         hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]
//                       "
//                     >
//                       {patient.name}
//                     </Listbox.Option>
//                   ))}
//                 </Listbox.Options>
//               </Listbox>
//             </div>
            
//             <div className="relative min-w-[120px] w-[160px] lg:w-[180px]">
//               <Listbox
//                 value={patientInfo.patientID}
//                 onChange={handlePatientIDChange}
//               >
//                 <Listbox.Button
//                   className="
//                     w-full
//                     h-[33.5px]
//                     rounded-[8.38px]
//                     border-[1.05px]
//                     border-[#0EFF7B] dark:border-[#3C3C3C]
//                     bg-[#F5F6F5] dark:bg-black
//                     text-[#08994A] dark:text-white
//                     shadow-[0_0_2.09px_#0EFF7B]
//                     outline-none
//                     focus:border-[#0EFF7B]
//                     focus:shadow-[0_0_4px_#0EFF7B]
//                     transition-all
//                     duration-300
//                     px-3
//                     pr-8
//                     font-helvetica
//                     text-sm
//                     text-left
//                     relative
//                   "
//                 >
//                   {patientInfo.patientID || "Patient ID"}
//                   <svg
//                     className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                     strokeWidth={2}
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M6 9l6 6 6-6"
//                     />
//                   </svg>
//                 </Listbox.Button>
//                 <Listbox.Options
//                   className="
//                     absolute
//                     z-10
//                     mt-1
//                     w-full
//                     bg-gray-100 dark:bg-black
//                     border border-[#0EFF7B] dark:border-[#3C3C3C]
//                     rounded-md
//                     shadow-lg
//                     max-h-60
//                     overflow-auto
//                     text-sm
//                     font-helvetica
//                     top-[100%]
//                     left-0
//                   "
//                 >
//                   {filteredPatients.map((patient) => (
//                     <Listbox.Option
//                       key={patient.id}
//                       value={patient.id}
//                       className="
//                         cursor-pointer
//                         select-none
//                         p-2
//                         text-[#08994A] dark:text-white
//                         hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]
//                       "
//                     >
//                       {patient.id}
//                     </Listbox.Option>
//                   ))}
//                 </Listbox.Options>
//               </Listbox>
//             </div>
//           </div>
//         </div>

//         {/* Patient Information Grid - Show only when patient is selected */}
//         {selectedPatient && (
//           <div className="grid grid-cols-1 gap-4 mb-8">
//             <div className="bg-[#F5F6F5] dark:bg-transparent border-[1.05px] border-[#0EFF7B] dark:border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B40] dark:shadow-[0px_0px_4px_0px_#FFFFFF1F] rounded-xl p-4">
//               <div className="grid grid-cols-2 gap-3">
//                 <label className="text-sm text-gray-600 dark:text-gray-300">
//                   Patient ID
//                 </label>
//                 <input
//                   type="text"
//                   className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//                   value={patientInfo.patientID}
//                   readOnly
//                 />
//                 <label className="text-sm text-gray-600 dark:text-gray-300">
//                   Patient Name
//                 </label>
//                 <input
//                   type="text"
//                   className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//                   value={patientInfo.patientName}
//                   readOnly
//                 />
//                 <label className="text-sm text-gray-600 dark:text-gray-300">
//                   Age/Gender
//                 </label>
//                 <input
//                   type="text"
//                   className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//                   value={patientInfo.ageGender}
//                   readOnly
//                 />
//                 <label className="text-sm text-gray-600 dark:text-gray-300">
//                   Admission Start
//                 </label>
//                 <input
//                   type="text"
//                   className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//                   value={formatDate(patientInfo.admissionStart)}
//                   readOnly
//                 />
//                 <label className="text-sm text-gray-600 dark:text-gray-300">
//                   Admission End
//                 </label>
//                 <input
//                   type="text"
//                   className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//                   value={formatDate(patientInfo.admissionEnd)}
//                   readOnly
//                 />
//                 <label className="text-sm text-gray-600 dark:text-gray-300">
//                   Date of Birth
//                 </label>
//                 <input
//                   type="text"
//                   className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//                   value={formatDate(patientInfo.dateOfBirth)}
//                   readOnly
//                 />
//                 <label className="text-sm text-gray-600 dark:text-gray-300">
//                   Address
//                 </label>
//                 <input
//                   type="text"
//                   className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//                   value={patientInfo.address}
//                   readOnly
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Treatment Charges Table - Always shown */}
//         <div className="bg-[#F5F6F5] dark:bg-transparent border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-xl p-4">
//           {/* Header with Treatment Charges title and Counters */}
//           <div className="flex justify-between items-center mb-3">
//             <h3 className="text-[#08994A] dark:text-[#0EFF7B]">
//               Treatment Charges
//             </h3>
            
//             {/* Status Counters - Displayed under Treatment Charges title */}
//             {selectedPatient && treatmentCharges.length > 0 && (
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-3">
//                   <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
//                     {statusFilter === "ALL" ? "All" : statusFilter} Total
//                   </span>
//                   <span className="w-6 h-6 flex items-center font-[Helvetica] text-[12px] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#0D2016] dark:bg-[#14DC6F]">
//                     {filteredCharges.length}
//                   </span>
//                 </div>

//                 <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

//                 <div className="flex items-center gap-2">
//                   <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
//                     Pending
//                   </span>
//                   <span className="w-6 h-6 flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-[#7D3737] dark:bg-[#D97706]">
//                     {statusCounts.PENDING}
//                   </span>
//                 </div>

//                 <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

//                 <div className="flex items-center gap-2">
//                   <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
//                     Billed
//                   </span>
//                   <span className="w-6 h-6 flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-[#080C4C] dark:bg-[#0D7F41]">
//                     {statusCounts.BILLED}
//                   </span>
//                 </div>

//                 <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

//                 <div className="flex items-center gap-2">
//                   <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
//                     Cancelled
//                   </span>
//                   <span className="h-6 min-w-[24px] flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-[#3C3C3C] dark:bg-[#9CA3AF]">
//                     {statusCounts.CANCELLED}
//                   </span>
//                 </div>
//               </div>
//             )}
//           </div>
          
//           {/* Filter Buttons - Below the counters */}
//           {selectedPatient && treatmentCharges.length > 0 && (
//             <div className="w-full overflow-x-auto h-[40px] flex items-center gap-3 mb-6 px-2">
//               <div className="flex gap-3 min-w-full">
//                 {filterButtons.map((filter) => {
//                   const isActive = statusFilter === filter.value;
//                   return (
//                     <button
//                       key={filter.value}
//                       onClick={() => setStatusFilter(filter.value)}
//                       className={`
//                         relative min-w-[142px] mx-auto h-[35px] flex items-center justify-center rounded-lg px-3 text-sm font-medium transition-all border-b-[1px]
//                         ${isActive 
//                           ? "bg-[#08994A] text-white dark:bg-green-900 shadow-[0px_0px_20px_0px_#0EFF7B40]" 
//                           : "text-gray-800 hover:text-green-600 dark:text-white border border-gray-300 dark:border-[#3C3C3C] hover:border-[#0EFF7B]"
//                         }
//                       `}
//                     >
//                       {filter.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
          
//           {!selectedPatient ? (
//             <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//               Please select a patient to view their treatment charges.
//             </div>
//           ) : filteredCharges.length === 0 ? (
//             <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//               {statusFilter === "ALL"
//                 ? "No treatment charges found for this patient."
//                 : `No ${statusFilter.toLowerCase()} charges found for this patient.`}
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm text-left min-w-[800px]">
//                 <thead className="text-[#08994A] dark:text-[#0EFF7B] bg-gray-200 dark:bg-[#091810]">
//                   <tr>
//                     <th className="p-3">S No</th>
//                     <th className="p-3">Description</th>
//                     <th className="p-3">Quantity</th>
//                     <th className="p-3">Unit Price ($)</th>
//                     <th className="p-3">Amount ($)</th>
//                     <th className="p-3">Status</th>
//                     <th className="p-3">Created At</th>
//                     <th className="p-3">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-[#08994A] dark:text-gray-300 bg-gray-100 dark:bg-black">
//                   {filteredCharges.map((charge, index) => {
//                     // Status display configuration
//                     let statusColor = "";
//                     let statusLabel = "";
                    
//                     switch(charge.status) {
//                       case "PENDING":
//                         statusColor = "text-yellow-500";
//                         statusLabel = "Pending";
//                         break;
//                       case "BILLED":
//                         statusColor = "text-green-500";
//                         statusLabel = "Billed";
//                         break;
//                       case "CANCELLED":
//                         statusColor = "text-red-500";
//                         statusLabel = "Cancelled";
//                         break;
//                       default:
//                         statusColor = "text-gray-500";
//                         statusLabel = charge.status;
//                     }
                    
//                     return (
//                       <tr
//                         key={charge.id}
//                         className="border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
//                       >
//                         <td className="p-3">
//                           <div className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-2 rounded-md w-full text-[#08994A] dark:text-white">
//                             {(index + 1).toString().padStart(2, "0")}
//                           </div>
//                         </td>
//                         <td className="p-3">
//                           <div className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-2 rounded-md w-full text-[#08994A] dark:text-white">
//                             {charge.description}
//                           </div>
//                         </td>
//                         <td className="p-3">
//                           <div className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-2 rounded-md w-full text-[#08994A] dark:text-white">
//                             {charge.quantity}
//                           </div>
//                         </td>
//                         <td className="p-3">
//                           <div className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-2 rounded-md w-full text-[#08994A] dark:text-white">
//                             ${parseFloat(charge.unit_price).toFixed(2)}
//                           </div>
//                         </td>
//                         <td className="p-3">
//                           <div className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-2 rounded-md w-full text-[#08994A] dark:text-white">
//                             ${charge.formattedAmount}
//                           </div>
//                         </td>
//                         <td className="p-3">
//                           <div className={`${statusColor} bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md text-sm`}>
//                             {statusLabel}
//                           </div>
//                         </td>
//                         <td className="p-3">
//                           <div className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-2 rounded-md w-full text-[#08994A] dark:text-white">
//                             {new Date(charge.created_at).toLocaleDateString()}
//                           </div>
//                         </td>
//                         <td className="p-3">
//                           <div className="flex gap-2">
//                             <Pencil
//                               className="w-5 h-5 text-[#0EFF7B] cursor-pointer hover:text-green-700"
//                               onClick={() => handleEditCharge(charge)}
//                             />
//                             <Trash
//                               className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
//                               onClick={() => handleDeleteCharge(charge)}
//                             />
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
          
//           {/* Add Treatment & Charges Button - Below the table */}
//           <div className="flex justify-end mt-4">
//             <button
//               onClick={() => {
//                 if (!selectedPatient) {
//                   errorToast("Please select a patient first");
//                   return;
//                 }
//                 resetNewChargeForm();
//                 setShowAddModal(true);
//               }}
//               className="flex items-center justify-center border-b-[2px] border-[#0EFF7B] gap-2 w-[200px] h-[40px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium text-[14px] hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
//               disabled={!selectedPatient}
//             >
//               <Plus size={18} className="text-white" />
//               Add Treatment & Charges
//             </button>
//           </div>
          
//           {/* Total Summary - Only shown when patient is selected */}
//           {selectedPatient && filteredCharges.length > 0 && (
//             <div className="mt-4">
//               <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] rounded-lg">
//                 <span className="text-white font-semibold">
//                   {statusFilter === "ALL" 
//                     ? "Total Charges:" 
//                     : `Total ${statusFilter} Charges:`}
//                 </span>
//                 <span className="text-[#0EFF7B] text-xl font-bold">
//                   ${calculateTotal()}
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="flex justify-center items-center py-8">
//             <Loader2 className="w-8 h-8 text-[#0EFF7B] animate-spin" />
//             <span className="ml-2 text-[#0EFF7B]">Loading patient details...</span>
//           </div>
//         )}
//       </div>

//       {/* Add Treatment Charge Modal */}
//       <Dialog open={showAddModal} onClose={() => {
//         setShowAddModal(false);
//         resetNewChargeForm();
//       }} className="relative z-50">
//         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
//           <Dialog.Panel className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
//             <div
//               className="w-[505px] rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 shadow-lg relative"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               <div
//                 style={{
//                   position: "absolute",
//                   inset: 0,
//                   borderRadius: "20px",
//                   padding: "2px",
//                   background:
//                     "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//                   WebkitMask:
//                     "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//                   WebkitMaskComposite: "xor",
//                   maskComposite: "exclude",
//                   pointerEvents: "none",
//                   zIndex: 0,
//                 }}
//               ></div>
              
//               <div className="flex justify-between items-center pb-3 mb-4">
//                 <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
//                   Add Treatment Charge
//                 </h3>
//                 <button
//                   onClick={() => {
//                     setShowAddModal(false);
//                     resetNewChargeForm();
//                   }}
//                   className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
//                 >
//                   <X size={16} className="text-black dark:text-white" />
//                 </button>
//               </div>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="text-sm text-black dark:text-white block mb-1">
//                     Description <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={newCharge.description}
//                     onChange={(e) => handleFormChange("description", e.target.value)}
//                     placeholder="Enter description (e.g., Bed charges, Doctor consultation)"
//                     className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none"
//                   />
//                   {validationErrors.description && (
//                     <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
//                   )}
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-sm text-black dark:text-white block mb-1">
//                       Quantity <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       min="1"
//                       value={newCharge.quantity}
//                       onChange={(e) => handleFormChange("quantity", e.target.value)}
//                       className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none"
//                     />
//                     {validationErrors.quantity && (
//                       <p className="text-red-500 text-xs mt-1">{validationErrors.quantity}</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label className="text-sm text-black dark:text-white block mb-1">
//                       Unit Price ($) <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       step="0.01"
//                       value={newCharge.unit_price}
//                       onChange={(e) => handleFormChange("unit_price", e.target.value)}
//                       className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none"
//                     />
//                     {validationErrors.unit_price && (
//                       <p className="text-red-500 text-xs mt-1">{validationErrors.unit_price}</p>
//                     )}
//                   </div>
//                 </div>
                
//                 <div>
//                   <label className="text-sm text-black dark:text-white block mb-1">
//                     Amount ($) (Auto-calculated)
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={newCharge.amount}
//                     onChange={(e) => setNewCharge({ ...newCharge, amount: e.target.value })}
//                     className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none"
//                     readOnly
//                   />
//                 </div>
//               </div>
              
//               <div className="flex justify-center gap-2 mt-8">
//                 <button
//                   onClick={() => {
//                     setShowAddModal(false);
//                     resetNewChargeForm();
//                   }}
//                   className="w-[144px] h-[34px] rounded-[8px] border border-[#0EFF7B] text-gray-800 dark:text-white bg-gray-100 dark:bg-transparent"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAddCharge}
//                   className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B]
//                     bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
//                     text-white font-medium hover:scale-105 transition flex items-center justify-center gap-2"
//                 >
//                   <Plus size={16} className="text-white dark:text-white" />
//                   Add Charge
//                 </button>
//               </div>
//             </div>
//           </Dialog.Panel>
//         </div>
//       </Dialog>

//       {/* Delete Charge Popup */}
//       {showDeletePopup && (
//         <DeleteChargePopup
//           charge={selectedCharge}
//           onClose={() => {
//             setShowDeletePopup(false);
//             setSelectedCharge(null);
//           }}
//           onConfirm={handleConfirmDelete}
//         />
//       )}

//       {/* Edit Charge Popup */}
//       {showEditPopup && (
//         <EditChargePopup
//           charge={selectedCharge}
//           onClose={() => {
//             setShowEditPopup(false);
//             setSelectedCharge(null);
//           }}
//           onUpdate={handleUpdateCharge}
//           patientId={selectedPatient?.numericId || selectedPatient?.id}
//         />
//       )}
//     </div>
//   );
// };

// export default TreatmentCharges;

import React, { useState, useEffect } from "react";
import { Search, Pencil, Plus, Trash, X, Loader2 } from "lucide-react";
import { Listbox, Dialog } from "@headlessui/react";
import api from "../../utils/axiosConfig";
import { successToast, errorToast } from "../../components/Toast.jsx";
import DeleteChargePopup from "./DeleteChargePopup";
import EditChargePopup from "./EditChargePopup";

const TreatmentCharges = () => {
  // State for patients
  const [searchQuery, setSearchQuery] = useState("");
  const originalPatients = [
    { id: "SAH027/384", name: "Joe Darrington", numericId: 1 },
    { id: "SA123456", name: "John Doe", numericId: 2 },
    { id: "SA789012", name: "Jane Smith", numericId: 3 },
  ];
  const [patients, setPatients] = useState(originalPatients);
  const [filteredPatients, setFilteredPatients] = useState(patients);

  // State for selected patient
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientInfo, setPatientInfo] = useState({
    patientName: "",
    patientID: "",
    ageGender: "",
    admissionStart: "",
    admissionEnd: "",
    dateOfBirth: "",
    address: "",
  });

  // State for treatment charges
  const [treatmentCharges, setTreatmentCharges] = useState([]);
  const [filteredCharges, setFilteredCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // State for popups
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [newCharge, setNewCharge] = useState({
    description: "",
    quantity: 1,
    unit_price: "",
    amount: "",
  });

  // Validation errors for add form
  const [validationErrors, setValidationErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Status filter state
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, BILLED, CANCELLED
  // Helper: starts with uppercase letter A-Z
  const startsWithCapital = (str) => {
    return /^[A-Z]/.test(str);
  };

  // Helper: contains at least one letter (a-z or A-Z) anywhere
  const hasAtLeastOneLetter = (str) => {
    return /[a-zA-Z]/.test(str);
  };

  // Filter treatment charges based on status filter
  useEffect(() => {
    if (statusFilter === "ALL") {
      setFilteredCharges(treatmentCharges);
    } else {
      setFilteredCharges(
        treatmentCharges.filter((charge) => charge.status === statusFilter),
      );
    }
  }, [treatmentCharges, statusFilter]);

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients based on search query
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    setFilteredPatients(
      patients.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.id.toLowerCase().includes(lowerQuery),
      ),
    );
  }, [searchQuery, patients]);

  // Fetch patients list
  const fetchPatients = async () => {
    try {
      let patientsData = [];

      try {
        const res = await api.get("/patients/");

        console.log("Patients list API Response:", res.data);

        // Handle different response structures
        if (Array.isArray(res.data)) {
          patientsData = res.data;
        } else if (res.data && Array.isArray(res.data.results)) {
          patientsData = res.data.results;
        } else if (res.data && Array.isArray(res.data.data)) {
          patientsData = res.data.data;
        } else if (res.data && Array.isArray(res.data.patients)) {
          patientsData = res.data.patients;
        } else if (res.data && typeof res.data === "object") {
          patientsData = [res.data];
        }
      } catch (listError) {
        console.log("List endpoint failed, using fallback...");
      }

      if (patientsData.length === 0) {
        console.log("No patients found, using fallback data");
        setPatients(originalPatients);
        setFilteredPatients(originalPatients);
        return;
      }

      const mappedPatients = patientsData.map((p) => ({
        id: p.patient_unique_id || p.unique_id || p.id || "N/A",
        name: p.full_name || p.name || p.patient_name || "Unknown Patient",
        numericId: p.id, // Store the numeric ID for backend API
        patient_id: p.id, // Also store as patient_id
      }));

      setPatients(mappedPatients);
      setFilteredPatients(mappedPatients);
    } catch (err) {
      console.error("Failed to load patients:", err);
      setPatients(originalPatients);
      setFilteredPatients(originalPatients);
    }
  };

  // Fetch patient details and treatment charges
  const fetchPatientDetails = async (patientId) => {
    try {
      setLoading(true);

      // First try the treatment charges API endpoint for patient details
      try {
        const res = await api.get(
          `/treatment-charges/patients/${patientId}/details`,
        );

        console.log("Patient Details from treatment-charges API:", res.data);
        const patientData = res.data;

        // Update patient info state with all details
        setPatientInfo({
          patientName: patientData.full_name || "",
          patientID: patientData.patient_unique_id || patientId,
          ageGender: `${patientData.age || ""}/${patientData.gender || ""}`,
          admissionStart: patientData.admission_date || "",
          admissionEnd: patientData.discharge_date || "",
          dateOfBirth: patientData.date_of_birth || "",
          address: patientData.address || "",
        });

        // Fetch treatment charges for this patient
        await fetchTreatmentCharges(patientId);

        successToast(`Patient ${patientData.full_name} details loaded`);
      } catch (chargesApiError) {
        console.log(
          "Treatment charges API failed, trying patients API:",
          chargesApiError,
        );

        // Fallback to patients API
        const patientRes = await api.get(`/patients/${patientId}`);

        const patientData =
          patientRes.data.data || patientRes.data.patient || patientRes.data;

        // Update patient info state
        setPatientInfo({
          patientName: patientData.full_name || patientData.name || "",
          patientID:
            patientData.patient_unique_id ||
            patientData.unique_id ||
            patientData.id ||
            "",
          ageGender: `${patientData.age || ""}/${patientData.gender || ""}`,
          admissionStart: patientData.admission_date || "",
          admissionEnd: patientData.discharge_date || "",
          dateOfBirth: patientData.date_of_birth || "",
          address: patientData.address || "",
        });

        // Fetch treatment charges for this patient
        await fetchTreatmentCharges(patientData.id || patientId);

        successToast(
          `Patient ${patientData.full_name || patientData.name} details loaded`,
        );
      }
    } catch (err) {
      console.error("Failed to load patient details:", err);
      errorToast("Failed to load patient details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch treatment charges for a patient - CORRECTED ENDPOINT
  const fetchTreatmentCharges = async (patientId) => {
    try {
      // CORRECTED: Use the right endpoint from your backend
      const res = await api.get(`/treatment-charges/patient/${patientId}`);

      console.log("Treatment charges API response:", res.data);

      let chargesData = [];

      // Handle different response structures
      if (Array.isArray(res.data)) {
        chargesData = res.data;
      } else if (res.data && Array.isArray(res.data.results)) {
        chargesData = res.data.results;
      } else if (res.data && Array.isArray(res.data.data)) {
        chargesData = res.data.data;
      } else if (res.data && Array.isArray(res.data.charges)) {
        chargesData = res.data.charges;
      } else {
        console.log("Unexpected response structure:", res.data);
        chargesData = [];
      }

      // Sort by created_at in DESC order (newest first) to show newest at top
      const sortedCharges = [...chargesData].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });

      // Format the charges with serial numbers
      const formattedCharges = sortedCharges.map((charge, index) => ({
        ...charge,
        sNo: (index + 1).toString().padStart(2, "0"),
        formattedAmount: parseFloat(
          charge.amount || charge.quantity * charge.unit_price,
        ).toFixed(2),
      }));

      console.log(
        "Formatted charges for patient:",
        patientId,
        formattedCharges,
      );
      setTreatmentCharges(formattedCharges);
      setFilteredCharges(formattedCharges); // Initialize filtered charges
    } catch (err) {
      console.error("Failed to load treatment charges:", err);
      // If endpoint doesn't exist or no charges found, show empty state
      if (err.response?.status === 404 || err.response?.status === 400) {
        console.log("No treatment charges found for this patient");
        setTreatmentCharges([]);
        setFilteredCharges([]);
      } else {
        errorToast("Failed to load treatment charges");
        setTreatmentCharges([]);
        setFilteredCharges([]);
      }
    }
  };

  // Handle patient selection from dropdown
  const handlePatientSelect = (patient) => {
    console.log("Patient selected:", patient);
    setSelectedPatient({
      ...patient,
      numericId: patient.numericId || patient.patient_id || patient.id,
    });
    setStatusFilter("ALL"); // Reset filter when selecting new patient
    fetchPatientDetails(patient.numericId || patient.patient_id || patient.id);
    setSearchQuery(""); // Clear search after selection
  };

  // Handle patient selection by ID
  const handlePatientIDChange = (value) => {
    const patient = filteredPatients.find((p) => p.id === value);
    if (patient) {
      console.log("Patient selected by ID:", patient);
      setSelectedPatient({
        ...patient,
        numericId: patient.numericId || patient.patient_id,
      });
      setStatusFilter("ALL"); // Reset filter when selecting new patient
      fetchPatientDetails(
        patient.numericId || patient.patient_id || patient.id,
      );
    }
  };

  // Handle patient name change
  const handlePatientNameChange = (value) => {
    const patient = filteredPatients.find((p) => p.name === value);
    if (patient) {
      console.log("Patient selected by name:", patient);
      setSelectedPatient({
        ...patient,
        numericId: patient.numericId || patient.patient_id,
      });
      setStatusFilter("ALL"); // Reset filter when selecting new patient
      fetchPatientDetails(
        patient.numericId || patient.patient_id || patient.id,
      );
    }
  };

  // Reset form
  const resetNewChargeForm = () => {
    setNewCharge({
      description: "",
      quantity: 1,
      unit_price: "",
      amount: "",
    });
    setValidationErrors({});
    setSubmitted(false);
  };

  // Handle form change with validation
  const handleFormChange = (field, value) => {
    const errors = { ...validationErrors };

    if (field === "description") {
      const trimmed = value.trim();

      if (trimmed) {
        if (!startsWithCapital(trimmed)) {
          errors.description = "Must start with a capital letter (A-Z)";
        } else if (!hasAtLeastOneLetter(trimmed)) {
          errors.description = "Must contain at least one letter";
        } else {
          delete errors.description;
        }
      } else {
        delete errors.description; // clear error when empty (required error shows only on submit)
      }
    }

    // Quantity live validation
    if (field === "quantity" && value !== "") {
      const num = parseInt(value);
      if (isNaN(num) || num <= 0) {
        errors.quantity = "Must be greater than 0";
      } else {
        delete errors.quantity;
      }
    }

    // Unit price live validation
    if (field === "unit_price" && value !== "") {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        errors.unit_price = "Must be greater than 0";
      } else {
        delete errors.unit_price;
      }
    }

    setValidationErrors(errors);

    // Auto-calculate amount
    let updatedAmount = newCharge.amount;
    if (field === "quantity" && newCharge.unit_price) {
      const qty = parseFloat(value) || 0;
      updatedAmount = (qty * parseFloat(newCharge.unit_price)).toFixed(2);
    } else if (field === "unit_price" && newCharge.quantity) {
      const price = parseFloat(value) || 0;
      updatedAmount = (parseFloat(newCharge.quantity) * price).toFixed(2);
    }

    setNewCharge({
      ...newCharge,
      [field]: value,
      amount: updatedAmount || "",
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const desc = newCharge.description.trim();

    // Required field validation (only triggers after submission)
    if (submitted) {
      if (!desc) {
        errors.description = "Description is required";
      } else if (!startsWithCapital(desc)) {
        errors.description =
          "Description must start with a capital letter (A-Z)";
      } else if (!hasAtLeastOneLetter(desc)) {
        errors.description = "Description must contain at least one letter";
      }
    }

    // Required field validation (only triggers after submission)
    if (submitted && !newCharge.quantity) {
      errors.quantity = "Quantity is required";
    }

    // Required field validation (only triggers after submission)
    if (submitted && !newCharge.unit_price) {
      errors.unit_price = "Unit price is required";
    }

    // Quantity validation (shows during typing too)
    if (newCharge.quantity !== "") {
      const qty = parseInt(newCharge.quantity);
      if (isNaN(qty) || qty <= 0) {
        errors.quantity = "Quantity must be a number greater than 0";
      }
    }

    // Unit price validation (shows during typing too)
    if (newCharge.unit_price !== "") {
      const price = parseFloat(newCharge.unit_price);
      if (isNaN(price) || price <= 0) {
        errors.unit_price = "Unit price must be a number greater than 0";
      }
    }

    return errors;
  };

  // Handle add new charge
  // Handle add new charge
  const handleAddCharge = async () => {
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring duplicate click");
      return;
    }

    setSubmitted(true);

    const errors = validateForm();

    // Check for required fields
    if (!newCharge.description.trim()) {
      errors.description = "Description is required";
    }

    if (!newCharge.quantity) {
      errors.quantity = "Quantity is required";
    }

    if (!newCharge.unit_price) {
      errors.unit_price = "Unit price is required";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // Set submitting state to true
      setIsSubmitting(true);

      if (!selectedPatient || !selectedPatient.numericId) {
        errorToast(
          "Could not determine patient ID. Please select the patient again.",
        );
        setIsSubmitting(false);
        return;
      }

      const chargeData = {
        patient_id: parseInt(selectedPatient.numericId),
        description: newCharge.description.trim(),
        quantity: parseInt(newCharge.quantity),
        unit_price: parseFloat(newCharge.unit_price),
        ...(newCharge.amount &&
          newCharge.amount !== "" && { amount: parseFloat(newCharge.amount) }),
      };

      console.log("Sending charge data:", JSON.stringify(chargeData, null, 2));

      const res = await api.post("/treatment-charges/", chargeData);

      console.log("Response:", res.data);

      successToast("Treatment charge added successfully");
      setShowAddModal(false);
      resetNewChargeForm();

      // Refresh the charges list
      await fetchTreatmentCharges(
        selectedPatient.numericId || selectedPatient.id,
      );
    } catch (err) {
      console.error("Failed to add treatment charge:", err);
      console.error("Error response:", err.response?.data);

      if (err.response?.data?.detail) {
        const errorDetail = err.response.data.detail;
        if (Array.isArray(errorDetail)) {
          errorToast(errorDetail.map((e) => e.msg || e).join(", "));
        } else {
          errorToast(errorDetail);
        }
      } else {
        errorToast("Failed to add treatment charge. Please check the data.");
      }
    } finally {
      // Always reset submitting state when done
      setIsSubmitting(false);
    }
  };

  // Handle delete charge
  const handleDeleteCharge = (charge) => {
    setSelectedCharge(charge);
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = async (chargeId) => {
    try {
      await api.delete(`/treatment-charges/${chargeId}/`);

      successToast("Treatment charge deleted successfully");
      setShowDeletePopup(false);
      setSelectedCharge(null);

      // Refresh the charges list
      await fetchTreatmentCharges(
        selectedPatient.numericId || selectedPatient.id,
      );
    } catch (err) {
      console.error("Failed to delete treatment charge:", err);
      errorToast("Failed to delete treatment charge");
      throw err;
    }
  };

  // Handle edit charge
  const handleEditCharge = (charge) => {
    setSelectedCharge(charge);
    setShowEditPopup(true);
  };

  const handleUpdateCharge = async (chargeId, chargeData) => {
    try {
      const res = await api.put(`/treatment-charges/${chargeId}/`, chargeData);

      successToast("Treatment charge updated successfully");
      setShowEditPopup(false);
      setSelectedCharge(null);

      // Refresh the charges list
      await fetchTreatmentCharges(
        selectedPatient.numericId || selectedPatient.id,
      );
    } catch (err) {
      console.error("Failed to update treatment charge:", err);
      console.error("Error response:", err.response?.data);

      if (err.response?.data?.detail) {
        const errorDetail = err.response.data.detail;
        if (Array.isArray(errorDetail)) {
          errorToast(errorDetail.map((e) => e.msg || e).join(", "));
        } else {
          errorToast(errorDetail);
        }
      } else {
        errorToast("Failed to update treatment charge");
      }
      throw err;
    }
  };

  // Calculate total amount for filtered charges
  const calculateTotal = () => {
    return filteredCharges
      .reduce((total, charge) => {
        return (
          total +
          parseFloat(charge.amount || charge.quantity * charge.unit_price)
        );
      }, 0)
      .toFixed(2);
  };

  // Calculate counts for each status
  const calculateStatusCounts = () => {
    return {
      ALL: treatmentCharges.length,
      PENDING: treatmentCharges.filter((c) => c.status === "PENDING").length,
      BILLED: treatmentCharges.filter((c) => c.status === "BILLED").length,
      CANCELLED: treatmentCharges.filter((c) => c.status === "CANCELLED")
        .length,
    };
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get status counts
  const statusCounts = calculateStatusCounts();

  // Filter buttons configuration - Based on AppointmentList style
  const filterButtons = [
    { value: "ALL", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "BILLED", label: "Billed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="w-full max-w-screen-2xl mb-4 mx-auto">
      <div className=" mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-6 w-full max-w-[2500px] mx-auto flex flex-col overflow-hidden relative font-[Helvetica]">
        <div
          className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
            zIndex: 0,
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "10px",
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

        <h2 className="text-xl font-semibold mb-4 text-[#08994A] dark:text-[#0EFF7B]">
          Treatment and Charges Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
          Manage treatment charges for patients
        </p>

        {/* Patient Search and Selection */}
        <div className="mb-6 flex flex-row justify-end items-center gap-2 flex-wrap max-w-full">
          <div className="flex-1 min-w-[180px] max-w-[350px] lg:max-w-[400px] relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full
                  h-[34px]
                  pl-10 pr-4
                  rounded
                  border-[1.05px]
                  border-[#0EFF7B] dark:border-[#0EFF7B1A]
                  bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A]
                  text-[#08994A] dark:text-white
                  placeholder-[#5CD592] dark:placeholder-[#5CD592]
                  focus:outline-none
                  focus:border-[#0EFF7B]
                  transition-all
                  font-helvetica
                "
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0EFF7B] pointer-events-none" />
            </div>

            {/* Dropdown Results */}
            {searchQuery.trim() && (
              <div className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3C3C3C]">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className="cursor-pointer px-3 py-1.5 text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126] border-b border-gray-200 dark:border-gray-800 last:border-b-0"
                    >
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {patient.id}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No patient found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Patient Name and ID Dropdowns */}
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative min-w-[120px] w-[160px] lg:w-[180px]">
              <Listbox
                value={patientInfo.patientName}
                onChange={handlePatientNameChange}
              >
                <Listbox.Button
                  className="
                    w-full
                    h-[33.5px]
                    rounded-[8.38px]
                    border-[1.05px]
                    border-[#0EFF7B] dark:border-[#3C3C3C]
                    bg-[#F5F6F5] dark:bg-black
                    text-[#08994A] dark:text-white
                    shadow-[0_0_2.09px_#0EFF7B]
                    outline-none
                    focus:border-[#0EFF7B]
                    focus:shadow-[0_0_4px_#0EFF7B]
                    transition-all
                    duration-300
                    px-3
                    pr-8
                    font-helvetica
                    text-sm
                    text-left
                    relative
                  "
                >
                  {patientInfo.patientName || "Select Patient"}
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 9l6 6 6-6"
                    />
                  </svg>
                </Listbox.Button>
                <Listbox.Options
                  className="
                    absolute
                    z-10
                    mt-1
                    w-full
                    bg-gray-100 dark:bg-black
                    border border-[#0EFF7B] dark:border-[#3C3C3C]
                    rounded-md
                    shadow-lg
                    max-h-60
                    overflow-auto
                    text-sm
                    font-helvetica
                    top-[100%]
                    left-0
                  "
                >
                  {filteredPatients.map((patient) => (
                    <Listbox.Option
                      key={patient.id}
                      value={patient.name}
                      className="
                        cursor-pointer
                        select-none
                        p-2
                        text-[#08994A] dark:text-white
                        hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]
                      "
                    >
                      {patient.name}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Listbox>
            </div>

            <div className="relative min-w-[120px] w-[160px] lg:w-[180px]">
              <Listbox
                value={patientInfo.patientID}
                onChange={handlePatientIDChange}
              >
                <Listbox.Button
                  className="
                    w-full
                    h-[33.5px]
                    rounded-[8.38px]
                    border-[1.05px]
                    border-[#0EFF7B] dark:border-[#3C3C3C]
                    bg-[#F5F6F5] dark:bg-black
                    text-[#08994A] dark:text-white
                    shadow-[0_0_2.09px_#0EFF7B]
                    outline-none
                    focus:border-[#0EFF7B]
                    focus:shadow-[0_0_4px_#0EFF7B]
                    transition-all
                    duration-300
                    px-3
                    pr-8
                    font-helvetica
                    text-sm
                    text-left
                    relative
                  "
                >
                  {patientInfo.patientID || "Patient ID"}
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 9l6 6 6-6"
                    />
                  </svg>
                </Listbox.Button>
                <Listbox.Options
                  className="
                    absolute
                    z-10
                    mt-1
                    w-full
                    bg-gray-100 dark:bg-black
                    border border-[#0EFF7B] dark:border-[#3C3C3C]
                    rounded-md
                    shadow-lg
                    max-h-60
                    overflow-auto
                    text-sm
                    font-helvetica
                    top-[100%]
                    left-0
                  "
                >
                  {filteredPatients.map((patient) => (
                    <Listbox.Option
                      key={patient.id}
                      value={patient.id}
                      className="
                        cursor-pointer
                        select-none
                        p-2
                        text-[#08994A] dark:text-white
                        hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]
                      "
                    >
                      {patient.id}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Listbox>
            </div>
          </div>
        </div>

        {/* Patient Information Grid - Show only when patient is selected */}
        {selectedPatient && (
          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="bg-[#F5F6F5] dark:bg-transparent border-[1.05px] border-[#0EFF7B] dark:border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B40] dark:shadow-[0px_0px_4px_0px_#FFFFFF1F] rounded-xl p-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Patient ID
                </label>
                <input
                  type="text"
                  className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                  value={patientInfo.patientID}
                  readOnly
                />
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Patient Name
                </label>
                <input
                  type="text"
                  className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                  value={patientInfo.patientName}
                  readOnly
                />
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Age/Gender
                </label>
                <input
                  type="text"
                  className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                  value={patientInfo.ageGender}
                  readOnly
                />
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Admission Start
                </label>
                <input
                  type="text"
                  className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                  value={formatDate(patientInfo.admissionStart)}
                  readOnly
                />
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Admission End
                </label>
                <input
                  type="text"
                  className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                  value={formatDate(patientInfo.admissionEnd)}
                  readOnly
                />
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Date of Birth
                </label>
                <input
                  type="text"
                  className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                  value={formatDate(patientInfo.dateOfBirth)}
                  readOnly
                />
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                  value={patientInfo.address}
                  readOnly
                />
              </div>
            </div>
          </div>
        )}

        {/* Treatment Charges Table - Always shown */}
        <div className="bg-[#F5F6F5] dark:bg-transparent border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-xl p-4">
          {/* Header with Treatment Charges title and Counters */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[#08994A] dark:text-[#0EFF7B]">
              Treatment Charges
            </h3>

            {/* Status Counters - Displayed under Treatment Charges title */}
            {selectedPatient && treatmentCharges.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
                    {statusFilter === "ALL" ? "All" : statusFilter} Total
                  </span>
                  <span className="w-6 h-6 flex items-center font-[Helvetica] text-[12px] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#0D2016] dark:bg-[#14DC6F]">
                    {filteredCharges.length}
                  </span>
                </div>

                <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
                    Pending
                  </span>
                  <span className="w-6 h-6 flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-[#7D3737] dark:bg-[#D97706]">
                    {statusCounts.PENDING}
                  </span>
                </div>

                <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
                    Billed
                  </span>
                  <span className="w-6 h-6 flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-[#080C4C] dark:bg-[#0D7F41]">
                    {statusCounts.BILLED}
                  </span>
                </div>

                <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
                    Cancelled
                  </span>
                  <span className="h-6 min-w-[24px] flex items-center text-[12px] font-[Helvetica] text-white justify-center rounded-[20px] bg-[#3C3C3C] dark:bg-[#9CA3AF]">
                    {statusCounts.CANCELLED}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Filter Buttons - Below the counters */}
          {selectedPatient && treatmentCharges.length > 0 && (
            <div className="w-full overflow-x-auto h-[40px] flex items-center gap-3 mb-6 px-2">
              <div className="flex gap-3 min-w-full">
                {filterButtons.map((filter) => {
                  const isActive = statusFilter === filter.value;
                  return (
                    <button
                      key={filter.value}
                      onClick={() => setStatusFilter(filter.value)}
                      className={`
                        relative min-w-[142px] mx-auto h-[35px] flex items-center justify-center rounded-lg px-3 text-sm font-medium transition-all border-b-[1px]
                        ${
                          isActive
                            ? "bg-[#08994A] text-white dark:bg-green-900 shadow-[0px_0px_20px_0px_#0EFF7B40]"
                            : "text-gray-800 hover:text-green-600 dark:text-white border border-gray-300 dark:border-[#3C3C3C] hover:border-[#0EFF7B]"
                        }
                      `}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!selectedPatient ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Please select a patient to view their treatment charges.
            </div>
          ) : filteredCharges.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {statusFilter === "ALL"
                ? "No treatment charges found for this patient."
                : `No ${statusFilter.toLowerCase()} charges found for this patient.`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[800px]">
                <thead className="text-[#08994A] dark:text-[#0EFF7B] bg-gray-200 dark:bg-[#091810]">
                  <tr>
                    <th className="p-3">S No</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Unit Price ($)</th>
                    <th className="p-3">Amount ($)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created At</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[#08994A] dark:text-gray-300 bg-gray-100 dark:bg-black">
                  {filteredCharges.map((charge, index) => {
                    // Status display configuration
                    let statusColor = "";
                    let statusLabel = "";

                    switch (charge.status) {
                      case "PENDING":
                        statusColor = "text-yellow-500";
                        statusLabel = "Pending";
                        break;
                      case "BILLED":
                        statusColor = "text-green-500";
                        statusLabel = "Billed";
                        break;
                      case "CANCELLED":
                        statusColor = "text-red-500";
                        statusLabel = "Cancelled";
                        break;
                      default:
                        statusColor = "text-gray-500";
                        statusLabel = charge.status;
                    }

                    return (
                      <tr
                        key={charge.id}
                        className="border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
                      >
                        <td className="p-3">
                          <div className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-2 rounded-md w-full text-[#08994A] dark:text-white">
                            {(index + 1).toString().padStart(2, "0")}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-2 rounded-md w-full text-[#08994A] dark:text-white">
                            {charge.description}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-2 rounded-md w-full text-[#08994A] dark:text-white">
                            {charge.quantity}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-2 rounded-md w-full text-[#08994A] dark:text-white">
                            ${parseFloat(charge.unit_price).toFixed(2)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-2 rounded-md w-full text-[#08994A] dark:text-white">
                            ${charge.formattedAmount}
                          </div>
                        </td>
                        <td className="p-3">
                          <div
                            className={`${statusColor} bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md text-sm`}
                          >
                            {statusLabel}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-2 rounded-md w-full text-[#08994A] dark:text-white">
                            {new Date(charge.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Pencil
                              className="w-5 h-5 text-[#0EFF7B] cursor-pointer hover:text-green-700"
                              onClick={() => handleEditCharge(charge)}
                            />
                            <Trash
                              className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
                              onClick={() => handleDeleteCharge(charge)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Treatment & Charges Button - Below the table */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                if (!selectedPatient) {
                  errorToast("Please select a patient first");
                  return;
                }
                resetNewChargeForm();
                setShowAddModal(true);
              }}
              className="flex items-center justify-center border-b-[2px] border-[#0EFF7B] gap-2 w-[200px] h-[40px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium text-[14px] hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedPatient}
            >
              <Plus size={18} className="text-white" />
              Add Treatment & Charges
            </button>
          </div>

          {/* Total Summary - Only shown when patient is selected */}
          {selectedPatient && filteredCharges.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] rounded-lg">
                <span className="text-white font-semibold">
                  {statusFilter === "ALL"
                    ? "Total Charges:"
                    : `Total ${statusFilter} Charges:`}
                </span>
                <span className="text-[#0EFF7B] text-xl font-bold">
                  ${calculateTotal()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 text-[#0EFF7B] animate-spin" />
            <span className="ml-2 text-[#0EFF7B]">
              Loading patient details...
            </span>
          </div>
        )}
      </div>

      {/* Add Treatment Charge Modal */}
      <Dialog
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetNewChargeForm();
          setIsSubmitting(false);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <Dialog.Panel className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
            <div
              className="w-[505px] rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 shadow-lg relative"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
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

              <div className="flex justify-between items-center pb-3 mb-4">
                <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
                  Add Treatment Charge
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetNewChargeForm();
                  }}
                  className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
                >
                  <X size={16} className="text-black dark:text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-black dark:text-white block mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCharge.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    placeholder="Enter description (e.g., Bed charges, Doctor consultation)"
                    className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none"
                  />
                  {validationErrors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.description}
                    </p>
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
                      value={newCharge.quantity}
                      onChange={(e) =>
                        handleFormChange("quantity", e.target.value)
                      }
                      className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none"
                    />
                    {validationErrors.quantity && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.quantity}
                      </p>
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
                      value={newCharge.unit_price}
                      onChange={(e) =>
                        handleFormChange("unit_price", e.target.value)
                      }
                      className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none"
                    />
                    {validationErrors.unit_price && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.unit_price}
                      </p>
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
                    value={newCharge.amount}
                    onChange={(e) =>
                      setNewCharge({ ...newCharge, amount: e.target.value })
                    }
                    className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white outline-none"
                    readOnly
                  />
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetNewChargeForm();
                    setIsSubmitting(false); 
                  }}
                  className="w-[144px] h-[34px] rounded-[8px] border border-[#0EFF7B] text-gray-800 dark:text-white bg-gray-100 dark:bg-transparent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCharge}
                  disabled={isSubmitting}
                  className={`
    w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B]
    ${
      isSubmitting
        ? "bg-gray-400 cursor-not-allowed opacity-50"
        : "bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] hover:scale-105"
    }
    text-white font-medium transition flex items-center justify-center gap-2
  `}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="text-white dark:text-white" />
                      Add Charge
                    </>
                  )}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Charge Popup */}
      {showDeletePopup && (
        <DeleteChargePopup
          charge={selectedCharge}
          onClose={() => {
            setShowDeletePopup(false);
            setSelectedCharge(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Edit Charge Popup */}
      {showEditPopup && (
        <EditChargePopup
          charge={selectedCharge}
          onClose={() => {
            setShowEditPopup(false);
            setSelectedCharge(null);
          }}
          onUpdate={handleUpdateCharge}
          patientId={selectedPatient?.numericId || selectedPatient?.id}
        />
      )}
    </div>
  );
};

export default TreatmentCharges;
