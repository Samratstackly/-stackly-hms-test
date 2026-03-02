// import React, { useState, useEffect, useMemo } from "react";
// import { Listbox } from "@headlessui/react";
// import { ChevronDown, Edit, Trash2 } from "lucide-react";
// import { successToast, errorToast } from "../../components/Toast.jsx";
// import EditMedicineAllocationPopup from "./EditMedicineAllocationPopup";
// import DeleteMedicinePopup from "./DeleteMedicinePopup";
// import { useNavigate } from "react-router-dom";

// export default function ViewPatientProfile() {
//   //const API_BASE = "http://localhost:8000";
//     const API_BASE =
//   window.location.hostname === "18.119.210.2"
//     ? "http://18.119.210.2:8000"
//     : window.location.hostname === "3.133.64.23"
//     ? "http://3.133.64.23:8000"
//     : "http://localhost:8000";
//   const [searchQuery, setSearchQuery] = useState("");
//   const navigate = useNavigate();
//   const [medicineData, setMedicineData] = useState([
//     {
//       id: Date.now(),
//       medicineName: "",
//       dosage: "",
//       quantity: "",
//       frequency: "",
//       duration: "",
//       time: "",
//     },
//   ]);
//   const [labTests, setLabTests] = useState([{ id: Date.now(), labTest: "" }]);
//   const [medicineHistory, setMedicineHistory] = useState([]);
//   const [patientInfo, setPatientInfo] = useState({
//     patientName: "",
//     patientID: "",
//     department: "",
//   });
//   const [patients, setPatients] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [filteredPatients, setFilteredPatients] = useState([]);
//   const [patientDbId, setPatientDbId] = useState(null);
//   const [fullPatient, setFullPatient] = useState(null);
//   const [loading, setLoading] = useState(false);
//   // New state for stock data
//   const [stockData, setStockData] = useState([]);
  
//   // New states for edit/delete functionality
//   const [editingMedicine, setEditingMedicine] = useState(null);
//   const [deletingMedicine, setDeletingMedicine] = useState(null);
//   const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
//   const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

//   // Fetch departments, patients, and stock on component mount
//   useEffect(() => {
//     fetchDepartments();
//     fetchPatients();
//     fetchStock();
//   }, []);

//   // Dynamic options from stock
//   const medicineNames = useMemo(() => {
//     return [...new Set(stockData.map(s => s.product_name).filter(Boolean))].sort();
//   }, [stockData]);

//   const dosageMap = useMemo(() => {
//     const map = {};
//     stockData.forEach(s => {
//       if (s.product_name && s.dosage) {
//         if (!map[s.product_name]) map[s.product_name] = new Set();
//         map[s.product_name].add(s.dosage);
//       }
//     });
//     Object.keys(map).forEach(k => {
//       map[k] = [...map[k]].sort();
//     });
//     return map;
//   }, [stockData]);

//   // Filter patients based on search query
//   useEffect(() => {
//     if (searchQuery.trim() === "") {
//       setFilteredPatients(patients);
//     } else {
//       const filtered = patients.filter(
//         (patient) =>
//           patient.full_name
//             ?.toLowerCase()
//             .includes(searchQuery.toLowerCase()) ||
//           patient.patient_unique_id
//             ?.toLowerCase()
//             .includes(searchQuery.toLowerCase())
//       );
//       setFilteredPatients(filtered);
//     }
//   }, [searchQuery, patients]);

//   // Fetch departments from backend
//   const fetchDepartments = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/departments/`);
//       const text = await res.text();
//       if (!res.ok) {
//         console.error("Departments raw response (non-OK):", text);
//         throw new Error("Failed to fetch departments");
//       }
//       let data;
//       try {
//         data = JSON.parse(text);
//       } catch (parseError) {
//         console.error("Failed to parse departments JSON:", parseError);
//         console.error("Raw response:", text);
//         throw new Error("Invalid JSON response from departments API");
//       }
//       console.log("Departments API Response:", data);
//       setDepartments(data);
//     } catch (error) {
//       console.error("Error fetching departments:", error);
//     }
//   };

//   // Fetch patients from backend
//   const fetchPatients = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/medicine_allocation/edit`);
//       const text = await res.text();
//       if (!res.ok) {
//         console.error("Patients raw response (non-OK):", text);
//         throw new Error("Failed to fetch patients");
//       }
//       let data;
//       try {
//         data = JSON.parse(text);
//       } catch (parseError) {
//         console.error("Failed to parse patients JSON:", parseError);
//         console.error("Raw response:", text);
//         throw new Error("Invalid JSON response from patients API");
//       }
//       console.log("Patients API Response:", data);

//       // Handle different response structures
//       let patientsList = [];
//       if (Array.isArray(data)) {
//         patientsList = data;
//       } else if (data.patients && Array.isArray(data.patients)) {
//         patientsList = data.patients;
//       } else if (data && typeof data === "object") {
//         // If it's a single patient object, wrap it in array
//         patientsList = [data];
//       }

//       setPatients(patientsList);
//       setFilteredPatients(patientsList);
//     } catch (error) {
//       console.error("Error fetching patients:", error);
//     }
//   };

//   // Fetch stock data for dynamic dropdowns
//   const fetchStock = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/stock/list`);
//       if (!res.ok) {
//         throw new Error(`Failed to fetch stock: ${res.status}`);
//       }
//       const data = await res.json();
//       setStockData(data);
//       console.log("Stock data loaded:", data);
//     } catch (error) {
//       console.error("Error fetching stock:", error);
//       errorToast("Failed to load stock data");
//     }
//   };

//   // Fetch full patient details by patient_unique_id
//   const fetchPatientFull = async (patientUniqueId) => {
//     try {
//       const res = await fetch(`${API_BASE}/patients/${patientUniqueId}`);
//       const text = await res.text();
//       if (!res.ok) {
//         console.error("Full patient raw response (non-OK):", text);
//         throw new Error("Failed to fetch patient details");
//       }
//       let data;
//       try {
//         data = JSON.parse(text);
//       } catch (parseError) {
//         console.error("Failed to parse full patient JSON:", parseError);
//         console.error("Raw response:", text);
//         throw new Error("Invalid JSON response from patient details API");
//       }
//       console.log("Full patient data:", data);
//       setFullPatient(data);
//       return data;
//     } catch (error) {
//       console.error("Error fetching patient details:", error);
//       return null;
//     }
//   };

//   // Fetch medicine allocation history by patient ID
//   const fetchMedicineHistory = async (patientDbId) => {
//     if (!patientDbId) return;

//     try {
//       const res = await fetch(
//         `${API_BASE}/medicine_allocation/${patientDbId}/medicine-allocations/`
//       );
//       const text = await res.text();
//       if (!res.ok) {
//         if (res.status === 404) {
//           setMedicineHistory([]);
//           return;
//         }
//         console.error("Medicine history raw response (non-OK):", text);
//         throw new Error("Failed to fetch medicine history");
//       }
//       let data;
//       try {
//         data = JSON.parse(text);
//       } catch (parseError) {
//         console.error("Failed to parse medicine history JSON:", parseError);
//         console.error("Raw response:", text);
//         throw new Error("Invalid JSON response from medicine history API");
//       }
//       console.log("Medicine history:", data);
//       setMedicineHistory(data || []);
//     } catch (error) {
//       console.error("Error fetching medicine history:", error);
//       setMedicineHistory([]);
//     }
//   };

//   // Handle patient selection
//   const handlePatientSelect = async (patient) => {
//   if (!patient) return;

//   console.log("Selected patient:", patient);

//   // CRITICAL: Store the actual Django PK (patient.id)
//   setPatientDbId(patient.id); // This is the real primary key (1, 2, 3...)

//   const departmentName =
//     departments.find((d) => d.id === patient.department_id)?.name || "";

//   setPatientInfo({
//     patientName: patient.full_name,
//     patientID: patient.patient_unique_id,
//     department: departmentName,
//   });

//   // Fetch full details and history
//   const fullPatientData = await fetchPatientFull(patient.patient_unique_id);
//   await fetchMedicineHistory(patient.id);

//   setSearchQuery("");
// };

//   // Handle dropdown selection for patient fields
//   const handlePatientFieldChange = (field, value) => {
//     console.log(`Field changed: ${field} = ${value}`);

//     if (field === "patientName" && value) {
//       const selectedPatient = patients.find((p) => p.full_name === value);
//       if (selectedPatient) {
//         handlePatientSelect(selectedPatient);
//       }
//     } else if (field === "patientID" && value) {
//       const selectedPatient = patients.find(
//         (p) => p.patient_unique_id === value
//       );
//       if (selectedPatient) {
//         handlePatientSelect(selectedPatient);
//       }
//     } else if (field === "department" && value) {
//       // Update department only
//       setPatientInfo((prev) => ({
//         ...prev,
//         department: value,
//       }));
//     }
//   };

//   const handleInputChange = (e, index, type) => {
//     const { name, value } = e.target;

//     if (type === "medicine") {
//       setMedicineData((prev) => {
//         const newData = [...prev];
//         newData[index] = { ...newData[index], [name]: value };
//         // If medicineName changed, clear dosage if not matching
//         if (name === "medicineName" && newData[index].dosage && !dosageMap[value]?.includes(newData[index].dosage)) {
//           newData[index].dosage = "";
//         }
//         return newData;
//       });
//     } else if (type === "labTest") {
//       setLabTests((prev) => {
//         const newTests = [...prev];
//         newTests[index] = { ...newTests[index], [name]: value };
//         return newTests;
//       });
//     }
//   };

//   const addMedicineEntry = () => {
//     setMedicineData((prev) => [
//       ...prev,
//       {
//         id: Date.now(),
//         medicineName: "",
//         dosage: "",
//         quantity: "",
//         frequency: "",
//         duration: "",
//         time: "",
//       },
//     ]);
//   };

//   const addLabTestEntry = () => {
//     setLabTests((prev) => [...prev, { id: Date.now(), labTest: "" }]);
//   };

//   const removeMedicineEntry = (id) => {
//     setMedicineData((prev) => prev.filter((entry) => entry.id !== id));
//   };

//   const removeLabTestEntry = (id) => {
//     setLabTests((prev) => prev.filter((entry) => entry.id !== id));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!patientDbId) {
//       errorToast("Please select a patient");
//       return;
//     }

//     setLoading(true);

//     try {
//       const token = localStorage.getItem("token");

//       const res = await fetch(
//         `${API_BASE}/medicine_allocation/${patientDbId}/allocations/`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             medicines: medicineData.map((med) => ({
//               medicine_name: med.medicineName,
//               dosage: med.dosage,
//               quantity: med.quantity,
//               frequency: med.frequency,
//               duration: med.duration,
//               time: med.time,
//             })),
//             lab_test_types: labTests
//               .map((test) => test.labTest)
//               .filter((test) => test && test.trim() !== ""),
//           }),
//         }
//       );

//       const text = await res.text();
//       if (!res.ok) {
//         console.error("Submit raw response (non-OK):", text);
//         let errorData;
//         try {
//           errorData = JSON.parse(text);
//         } catch {
//           errorData = { detail: text };
//         }
//         throw new Error(errorData.detail || "Failed to allocate medicines");
//       }

//       const result = JSON.parse(text);
//       const newHistoryEntries = result.medicines.map((med) => ({
//         id: med.id,
//         patient_name: med.patient_name,
//         patient_id: med.patient_id,
//         department: med.department,
//         doctor: med.doctor,
//         allocation_date: med.allocation_date,
//         medicine_name: med.medicine_name,
//         dosage: med.dosage,
//         duration: med.duration,
//         lab_test_type: med.lab_test_type,
//       }));

//       setMedicineHistory((prev) => [...newHistoryEntries, ...prev]);
//       handleClear();
//       successToast("Medicines allocated successfully!");
//     } catch (error) {
//       console.error("Error allocating medicines:", error);
//       errorToast(`Failed to allocate medicines: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClear = () => {
//     setMedicineData([
//       {
//         id: Date.now(),
//         medicineName: "",
//         dosage: "",
//         quantity: "",
//         frequency: "",
//         duration: "",
//         time: "",
//       },
//     ]);
//     setLabTests([{ id: Date.now(), labTest: "" }]);
//   };

//   // New functions for edit/delete operations
//   const handleEditMedicine = (medicine) => {
//     setEditingMedicine(medicine);
//     setIsEditPopupOpen(true);
//   };

//   const handleDeleteMedicine = (medicine) => {
//     setDeletingMedicine(medicine);
//     setIsDeletePopupOpen(true);
//   };

//   const handleUpdateMedicine = async (updatedData) => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(
//         `${API_BASE}/medicine_allocation/${patientDbId}/medicine-allocations/${editingMedicine.id}/`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             medicine_name: updatedData.medicineName,
//             dosage: updatedData.dosage,
//             quantity: updatedData.quantity,
//             frequency: updatedData.frequency,
//             duration: updatedData.duration,
//             time: updatedData.time,
//           }),
//         }
//       );

//       if (!res.ok) {
//         throw new Error("Failed to update medicine allocation");
//       }

//       // Refresh medicine history
//       await fetchMedicineHistory(patientDbId);
//       successToast("Medicine allocation updated successfully!");
//     } catch (error) {
//       console.error("Error updating medicine:", error);
//       errorToast("Failed to update medicine allocation");
//     }
//   };

//   const handleConfirmDelete = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(
//         `${API_BASE}/medicine_allocation/${patientDbId}/medicine-allocations/${deletingMedicine.id}/`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!res.ok) {
//         throw new Error("Failed to delete medicine allocation");
//       }

//       // Refresh medicine history
//       await fetchMedicineHistory(patientDbId);
//       successToast("Medicine allocation deleted successfully!");
//     } catch (error) {
//       console.error("Error deleting medicine:", error);
//       errorToast("Failed to delete medicine allocation");
//     } finally {
//       setIsDeletePopupOpen(false);
//       setDeletingMedicine(null);
//     }
//   };

//   // Get unique values for dropdowns with proper data extraction
//   const patientNames = patients
//     .map((patient) => patient?.full_name)
//     .filter((name) => name && name.trim() !== "")
//     .filter((name, index, self) => self.indexOf(name) === index);
//   const patientIDs = patients
//     .map((patient) => patient?.patient_unique_id)
//     .filter((id) => id && id.trim() !== "")
//     .filter((id, index, self) => self.indexOf(id) === index);
//   const departmentNames = departments
//     .map((dept) => dept?.name)
//     .filter((name) => name && name.trim() !== "")
//     .filter((name, index, self) => self.indexOf(name) === index);

//   // Individual Dropdown Components for better control
//   const PatientNameDropdown = () => (
//     <div className="relative">
//       <label className="block text-sm font-medium mb-1 text-black dark:text-white">
//         Patient Name
//       </label>
//       <Listbox
//         value={patientInfo.patientName}
//         onChange={(value) => handlePatientFieldChange("patientName", value)}
//       >
//         {({ open }) => (
//           <>
//             <Listbox.Button
//               className={`
//                 relative w-full h-[33.5px] px-3 pr-8 rounded-[8.38px] border-[1.05px]
//                 border-gray-300 dark:border-[#3C3C3C] bg-gray-100 dark:bg-black
//                 text-black dark:text-white text-left text-sm leading-none
//                 shadow-[0_0_2.09px_#0EFF7B] outline-none
//                 transition-all duration-300 font-[Helvetica]
//                 ${open ? "border-[#0EFF7B] shadow-[0_0_4px_#0EFF7B]" : ""}
//                 ${!patientInfo.patientName ? "text-gray-500" : ""}
//               `}
//             >
//               <span className="block truncate">
//                 {patientInfo.patientName || "Select patient name"}
//               </span>

//               <span className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
//                 <ChevronDown
//                   className={`h-4 w-4 text-[#0EFF7B] transition-transform duration-200 ${
//                     open ? "rotate-180" : ""
//                   }`}
//                 />
//               </span>
//             </Listbox.Button>

//             <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[9999] border border-gray-300 dark:border-[#3C3C3C] scrollbar-hide focus:outline-none">
//               {patientNames.length > 0 ? (
//                 patientNames.map((name) => (
//                   <Listbox.Option
//                     key={name}
//                     value={name}
//                     className={({ active, selected }) =>
//                       `
//                         cursor-pointer select-none py-2 px-3 text-sm font-[Helvetica]
//                         ${
//                           active
//                             ? "bg-[#0EFF7B33] text-[#0EFF7B]"
//                             : "text-black dark:text-white"
//                         }
//                         ${
//                           selected
//                             ? "bg-[#0EFF7B] bg-opacity-20 text-[#0EFF7B] font-medium"
//                             : ""
//                         }
//                         hover:bg-[#0EFF7B33] hover:text-[#0EFF7B]
//                       `
//                     }
//                   >
//                     {name}
//                   </Listbox.Option>
//                 ))
//               ) : (
//                 <div className="py-2 px-3 text-sm text-gray-500 text-center">
//                   No patients found
//                 </div>
//               )}
//             </Listbox.Options>
//           </>
//         )}
//       </Listbox>
//     </div>
//   );

//   const PatientIDDropdown = () => (
//     <div className="relative">
//       <label className="block text-sm font-medium mb-1 text-black dark:text-white">
//         Patient ID
//       </label>
//       <Listbox
//         value={patientInfo.patientID}
//         onChange={(value) => handlePatientFieldChange("patientID", value)}
//       >
//         {({ open }) => (
//           <>
//             <Listbox.Button
//               className={`
//                 relative w-full h-[33.5px] px-3 pr-8 rounded-[8.38px] border-[1.05px]
//                 border-gray-300 dark:border-[#3C3C3C] bg-gray-100 dark:bg-black
//                 text-black dark:text-white text-left text-sm leading-none
//                 shadow-[0_0_2.09px_#0EFF7B] outline-none
//                 transition-all duration-300 font-[Helvetica]
//                 ${open ? "border-[#0EFF7B] shadow-[0_0_4px_#0EFF7B]" : ""}
//                 ${!patientInfo.patientID ? "text-gray-500" : ""}
//               `}
//             >
//               <span className="block truncate">
//                 {patientInfo.patientID || "Select patient ID"}
//               </span>

//               <span className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
//                 <ChevronDown
//                   className={`h-4 w-4 text-[#0EFF7B] transition-transform duration-200 ${
//                     open ? "rotate-180" : ""
//                   }`}
//                 />
//               </span>
//             </Listbox.Button>

//             <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[9999] border border-gray-300 dark:border-[#3C3C3C] scrollbar-hide focus:outline-none">
//               {patientIDs.length > 0 ? (
//                 patientIDs.map((id) => (
//                   <Listbox.Option
//                     key={id}
//                     value={id}
//                     className={({ active, selected }) =>
//                       `
//                         cursor-pointer select-none py-2 px-3 text-sm font-[Helvetica]
//                         ${
//                           active
//                             ? "bg-[#0EFF7B33] text-[#0EFF7B]"
//                             : "text-black dark:text-white"
//                         }
//                         ${
//                           selected
//                             ? "bg-[#0EFF7B] bg-opacity-20 text-[#0EFF7B] font-medium"
//                             : ""
//                         }
//                         hover:bg-[#0EFF7B33] hover:text-[#0EFF7B]
//                       `
//                     }
//                   >
//                     {id}
//                   </Listbox.Option>
//                 ))
//               ) : (
//                 <div className="py-2 px-3 text-sm text-gray-500 text-center">
//                   No patient IDs found
//                 </div>
//               )}
//             </Listbox.Options>
//           </>
//         )}
//       </Listbox>
//     </div>
//   );

//   const DepartmentDropdown = () => (
//     <div className="relative">
//       <label className="block text-sm font-medium mb-1 text-black dark:text-white">
//         Department
//       </label>
//       <Listbox
//         value={patientInfo.department}
//         onChange={(value) => handlePatientFieldChange("department", value)}
//       >
//         {({ open }) => (
//           <>
//             <Listbox.Button
//               className={`
//                 relative w-full h-[33.5px] px-3 pr-8 rounded-[8.38px] border-[1.05px]
//                 border-gray-300 dark:border-[#3C3C3C] bg-gray-100 dark:bg-black
//                 text-black dark:text-white text-left text-sm leading-none
//                 shadow-[0_0_2.09px_#0EFF7B] outline-none
//                 transition-all duration-300 font-[Helvetica]
//                 ${open ? "border-[#0EFF7B] shadow-[0_0_4px_#0EFF7B]" : ""}
//                 ${!patientInfo.department ? "text-gray-500" : ""}
//               `}
//             >
//               <span className="block truncate">
//                 {patientInfo.department || "Select department"}
//               </span>

//               <span className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
//                 <ChevronDown
//                   className={`h-4 w-4 text-[#0EFF7B] transition-transform duration-200 ${
//                     open ? "rotate-180" : ""
//                   }`}
//                 />
//               </span>
//             </Listbox.Button>

//             <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[9999] border border-gray-300 dark:border-[#3C3C3C] scrollbar-hide focus:outline-none">
//               {departmentNames.length > 0 ? (
//                 departmentNames.map((dept) => (
//                   <Listbox.Option
//                     key={dept}
//                     value={dept}
//                     className={({ active, selected }) =>
//                       `
//                         cursor-pointer select-none py-2 px-3 text-sm font-[Helvetica]
//                         ${
//                           active
//                             ? "bg-[#0EFF7B33] text-[#0EFF7B]"
//                             : "text-black dark:text-white"
//                         }
//                         ${
//                           selected
//                             ? "bg-[#0EFF7B] bg-opacity-20 text-[#0EFF7B] font-medium"
//                             : ""
//                         }
//                         hover:bg-[#0EFF7B33] hover:text-[#0EFF7B]
//                       `
//                     }
//                   >
//                     {dept}
//                   </Listbox.Option>
//                 ))
//               ) : (
//                 <div className="py-2 px-3 text-sm text-gray-500 text-center">
//                   No departments found
//                 </div>
//               )}
//             </Listbox.Options>
//           </>
//         )}
//       </Listbox>
//     </div>
//   );

//   // Medicine Dropdown Component
//   const MedicineDropdown = ({ label, name, value, options, index, medicineName }) => (
//     <div className="relative">
//       <label className="block text-sm font-medium mb-1 text-black dark:text-white capitalize">
//         {label}
//       </label>
//       <Listbox
//         value={value}
//         onChange={(selectedValue) => {
//           const fakeEvent = { target: { name, value: selectedValue } };
//           handleInputChange(fakeEvent, index, "medicine");
//         }}
//       >
//         {({ open }) => (
//           <>
//             <Listbox.Button
//               className={`
//                 relative w-full h-[33.5px] px-3 pr-8 rounded-[8.38px] border-[1.05px]
//                 border-gray-300 dark:border-[#3C3C3C] bg-gray-100 dark:bg-black
//                 text-black dark:text-white text-left text-sm leading-none
//                 shadow-[0_0_2.09px_#0EFF7B] outline-none
//                 transition-all duration-300 font-[Helvetica]
//                 ${open ? "border-[#0EFF7B] shadow-[0_0_4px_#0EFF7B]" : ""}
//                 ${!value ? "text-gray-500" : ""}
//               `}
//             >
//               <span className="block truncate">
//                 {value || `Select ${label.toLowerCase()}`}
//               </span>

//               <span className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
//                 <ChevronDown
//                   className={`h-4 w-4 text-[#0EFF7B] transition-transform duration-200 ${
//                     open ? "rotate-180" : ""
//                   }`}
//                 />
//               </span>
//             </Listbox.Button>

//             <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[9999] border border-gray-300 dark:border-[#3C3C3C] scrollbar-hide focus:outline-none">
//               {options.length > 0 ? (
//                 options.map((option) => (
//                   <Listbox.Option
//                     key={option}
//                     value={option}
//                     className={({ active, selected }) =>
//                       `
//                         cursor-pointer select-none py-2 px-3 text-sm font-[Helvetica]
//                         ${
//                           active
//                             ? "bg-[#0EFF7B33] text-[#0EFF7B]"
//                             : "text-black dark:text-white"
//                         }
//                         ${
//                           selected
//                             ? "bg-[#0EFF7B] bg-opacity-20 text-[#0EFF7B] font-medium"
//                             : ""
//                         }
//                         hover:bg-[#0EFF7B33] hover:text-[#0EFF7B]
//                       `
//                     }
//                   >
//                     {option}
//                   </Listbox.Option>
//                 ))
//               ) : (
//                 <div className="py-2 px-3 text-sm text-gray-500 text-center">
//                   No {label.toLowerCase()} available
//                 </div>
//               )}
//             </Listbox.Options>
//           </>
//         )}
//       </Listbox>
//     </div>
//   );

//   return (
//     <div className="mt-[80px] mb-4 bg-gray-100 dark:bg-black text-black dark:text-white rounded-xl p-4 w-full max-w-[2500px] mx-auto flex flex-col relative font-[Helvetica]">
//       {/* Gradient Background and Border */}
//       <div
//         className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
//         style={{
//           background:
//             "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
//           zIndex: 0,
//         }}
//       ></div>

//       <div
//         className="absolute inset-0 rounded-[10px] pointer-events-none"
//         style={{
//           padding: "2px",
//           background:
//             "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//           WebkitMask:
//             "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//           WebkitMaskComposite: "xor",
//           maskComposite: "exclude",
//           zIndex: 0,
//         }}
//       ></div>

//       {/* Search Bar with Individual Dropdowns */}
//       <div className="mb-6 mt-7 flex flex-row justify-end items-end gap-2 flex-wrap max-w-full relative">
//         <div className="flex-1 min-w-[180px] max-w-[350px] lg:max-w-[400px] relative">
//           <label className="block text-sm font-medium mb-1 text-black dark:text-white">
//             Search Patient
//           </label>
//           <input
//             type="text"
//             placeholder="Search patient name or ID"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && filteredPatients.length > 0) {
//                 handlePatientSelect(filteredPatients[0]);
//               }
//             }}
//             className="
//               w-full
//               h-[34px]
//               p-[4.19px_16.75px]
//               rounded
//               border-[1.05px]
//               border-[#0EFF7B1A]
//               bg-[#0EFF7B1A]
//               text-black dark:text-white
//               placeholder:text-gray-500 dark:placeholder:text-white/70
//               focus:outline-none
//               focus:border-[#0EFF7B]
//               transition-all
//               font-[Helvetica]
//             "
//           />
//           {searchQuery && filteredPatients.length > 0 && (
//             <div className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[9999] border border-gray-300 dark:border-[#3C3C3C] scrollbar-hide focus:outline-none">
//               {filteredPatients.map((patient) => (
//                 <div
//                   key={patient.id}
//                   onClick={() => handlePatientSelect(patient)}
//                   className="
//                     cursor-pointer select-none py-2 px-3 text-sm font-[Helvetica]
//                     text-black dark:text-white
//                     hover:bg-[#0EFF7B33] hover:text-[#0EFF7B]
//                   "
//                 >
//                   {patient.full_name} ({patient.patient_unique_id})
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         <div className="flex gap-2 items-center flex-wrap">
//           <div className="min-w-[120px] w-[160px] lg:w-[180px] relative">
//             <PatientNameDropdown />
//           </div>
//           <div className="min-w-[120px] w-[160px] lg:w-[180px] relative">
//             <PatientIDDropdown />
//           </div>
//         </div>
//       </div>

//       {/* View Patient Profile Information */}
//       <div className="mb-8 p-4 sm:p-5 bg-gray-100 dark:bg-black flex flex-col lg:flex-row items-center justify-between text-black dark:text-white font-[Helvetica] max-w-full relative">
//         {/* Your existing patient profile content */}
//         <div className="flex flex-col items-center text-center w-full lg:w-[146px] mb-4 lg:mb-0">
//           <div className="rounded-full w-[94px] h-[94px] mb-3 shadow-[#0EFF7B4D] border border-[#0EFF7B] overflow-hidden bg-gray-100">
//   {fullPatient?.photo_url ? (
//     <img
//       src={fullPatient.photo_url}
//       alt={fullPatient.full_name}
//       className="w-full h-full object-cover"
//       onError={(e) => {
//         e.currentTarget.style.display = 'none';
//         e.currentTarget.nextElementSibling.style.display = 'flex';
//       }}
//     />
//   ) : null}
  
//   {/* Fallback SVG - only shows if no photo or image fails to load */}
//   <div className={`w-full h-full flex items-center justify-center bg-gray-200 ${fullPatient?.photo_url ? 'hidden' : 'flex'}`}>
//     <svg
//       className="w-[60px] h-[60px] text-[#0EFF7B]"
//       fill="currentColor"
//       viewBox="0 0 24 24"
//     >
//       <circle cx="12" cy="8" r="4" />
//       <path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z" />
//     </svg>
//   </div>
// </div>
//           <span className="text-[#0EFF7B] text-[18px] font-semibold font-[Helvetica]">
//             {fullPatient?.gender === "Female"
//               ? "Mrs."
//               : fullPatient?.gender === "Male"
//               ? "Mr."
//               : ""}{" "}
//             {fullPatient?.full_name ||
//               patientInfo.patientName ||
//               "Select a patient"}
//           </span>
//           <span className="text-[14px] text-gray-500 dark:text-gray-400 font-[Helvetica]">
//             ID:{" "}
//             {fullPatient?.patient_unique_id || patientInfo.patientID || "N/A"}
//           </span>
//           <span className="text-[14px] text-gray-500 dark:text-gray-400 font-[Helvetica]">
//             {fullPatient?.email_address || "N/A"}
//           </span>
//         </div>

//         <div className="hidden lg:block h-[120px] w-[1.5px] bg-[#0EFF7B] mx-4"></div>

//         <div className="flex-1 flex flex-col mt-4 lg:mt-0">
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-5 text-[14px]">
//             {[
//               { label: "Gender", value: fullPatient?.gender || "N/A" },
//               {
//                 label: "Age",
//                 value: fullPatient?.age ? `${fullPatient.age}` : "N/A",
//               },
//               {
//                 label: "Blood Group",
//                 value: fullPatient?.blood_group || "N/A",
//               },
//               {
//                 label: "Department",
//                 value:
//                   departments.find((d) => d.id === fullPatient?.department_id)
//                     ?.name ||
//                   patientInfo.department ||
//                   "N/A",
//               },
//               { label: "Bed Number", value: fullPatient?.room_number || "N/A" },
//               {
//                 label: "Consultant type",
//                 value: fullPatient?.consultation_type || "N/A",
//               },
//             ].map((item, idx) => (
//               <div key={idx} className="flex flex-col items-center">
//                 <span className="w-[100px] sm:w-[110px] h-[18px] font-[Helvetica] text-[15px] leading-[100%] text-center text-[#0EFF7B]">
//                   {item.label}
//                 </span>
//                 <div className="w-[100px] sm:w-[110px] h-[16px] font-[Helvetica] text-[13px] leading-[100%] text-center bg-gray-100 dark:bg-black text-black dark:text-white mt-1 px-2 py-1 rounded">
//                   {item.value}
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="flex justify-end mt-5">
//             <button
//   onClick={() => {
//     if (!patientDbId) {
//       errorToast("Patient not selected properly");
//       return;
//     }
//     navigate(`/patients/profile/${patientDbId}`);
//   }}
//   className="relative group flex items-center justify-between w-[220px] h-[38px] bg-[#0EFF7B1A] rounded-[4px] px-3 text-sm text-black dark:text-white hover:bg-[#0EFF7B] hover:text-white transition font-[Helvetica]"
// >
//   <span className="text-[15px] w-[calc(100%-34px)]">
//     View more information
    
//   </span>
//   <div className="w-[18px] h-[18px] bg-[#0EFF7B] rounded-full flex items-center justify-center">
//     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-[10px] h-[10px]">
//       <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
//     </svg>
//     <span className="absolute top-[70px] left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     View more
//               </span>
//   </div>
// </button>
//           </div>
//         </div>

//         <div className="hidden lg:block h-[120px] w-[1.5px] bg-[#0EFF7B] mx-4"></div>

//         <div className="text-[14px] flex justify-center gap-3 sm:gap-6 mt-4 lg:mt-0">
//           <div className="flex flex-col items-center space-y-3">
//             <div className="flex flex-col items-center space-y-1">
//               <span className="text-black dark:text-white font-[Helvetica] text-[14px]">
//                 Blood Pressure
//               </span>
//               <span className="text-[#0EFF7B] font-semibold font-[Helvetica] text-[14px]">
//                 {fullPatient?.blood_pressure || "N/A"}{" "}
//                 <span className="text-black dark:text-white">mmHg</span>
//               </span>
//             </div>
//             <div className="flex flex-col items-center space-y-1">
//               <span className="text-black dark:text-white font-[Helvetica] text-[14px]">
//                 Weight
//               </span>
//               <span className="text-[#0EFF7B] font-semibold font-[Helvetica] text-[14px]">
//                 {fullPatient?.weight_in_kg || "N/A"}{" "}
//                 <span className="text-black dark:text-white">kg</span>
//               </span>
//             </div>
//           </div>
//           <div className="flex flex-col items-center space-y-1">
//             <span className="text-black dark:text-white font-[Helvetica] text-[14px]">
//               Temperature
//             </span>
//             <span className="text-[#0EFF7B] font-semibold font-[Helvetica] text-[14px]">
//               {fullPatient?.body_temperature
//                 ? `${fullPatient.body_temperature}°F`
//                 : "N/A"}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Medicine Allocation Form */}
//       <div className="mt-8 mb-4 rounded-xl p-4 w-full max-w-[100%] sm:max-w-[900px] lg:max-w-[1400px] mx-auto flex flex-col relative bg-gray-100 dark:bg-black text-black dark:text-white border border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0000001F]">
//         <h2 className="text-lg sm:text-xl font-semibold mb-4 text-black dark:text-[#FFFFFF] font-[Helvetica]">
//           Medicine Allocation
//         </h2>
//         <form onSubmit={handleSubmit}>
//           {/* Patient Info with Individual Dropdowns */}
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
//             <PatientNameDropdown />
//             <PatientIDDropdown />
//             <DepartmentDropdown />
//           </div>
//           {/* Medicines List */}
//           <div className="flex flex-col gap-5">
//             {medicineData.map((med, index) => (
//               <div
//                 key={med.id}
//                 className="border border-gray-600 rounded-lg p-4 bg-[#0EFF7B0A] relative"
//               >
//                 <div className="flex justify-between items-center mb-3">
//                   <h4 className="font-medium text-[#0EFF7B]">
//                     Medicine #{index + 1}
//                   </h4>
//                   <div className="flex gap-2">
//                     {index === medicineData.length - 1 && (
//                       <button
//                         type="button"
//                         onClick={addMedicineEntry}
//                         className="relative group text-green-500 hover:text-green-600 text-xl"
//                       >
//                         +
//                         <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Add
//               </span>
//                       </button>
//                     )}
//                     {medicineData.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => removeMedicineEntry(med.id)}
//                         className="relative group text-red-500 hover:text-red-700 text-xl"
//                       >
//                         ×
//                         <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Close
//               </span>
//                       </button>
//                     )}
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                   <MedicineDropdown
//                     label="Medicine Name"
//                     name="medicineName"
//                     value={med.medicineName}
//                     options={medicineNames}
//                     index={index}
//                   />
//                   <MedicineDropdown
//                     label="Dosage"
//                     name="dosage"
//                     value={med.dosage}
//                     options={dosageMap[med.medicineName] || []}
//                     index={index}
//                     medicineName={med.medicineName}
//                   />
//                   <MedicineDropdown
//                     label="Quantity"
//                     name="quantity"
//                     value={med.quantity}
//                     options={["10", "20", "30", "50"]}
//                     index={index}
//                   />
//                   <MedicineDropdown
//                     label="Frequency"
//                     name="frequency"
//                     value={med.frequency}
//                     options={["Morning", "Afternoon", "Evening", "Night"]}
//                     index={index}
//                   />
//                   <MedicineDropdown
//                     label="Duration"
//                     name="duration"
//                     value={med.duration}
//                     options={["5 days", "10 days", "15 days", "30 days"]}
//                     index={index}
//                   />
//                   <MedicineDropdown
//                     label="Time"
//                     name="time"
//                     value={med.time}
//                     options={["8:00 AM", "12:00 PM", "6:00 PM", "8:00 PM"]}
//                     index={index}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//           {/* Lab Tests and Form Actions */}
//           <div className="mt-6">
//             <h4 className="font-medium text-[#0EFF7B] mb-2">Lab Tests</h4>
//             {labTests.map((test, index) => (
//               <div key={test.id} className="flex items-center gap-3 mb-2">
//                 <div className="flex-1">
//                   <div className="relative">
//                     <label className="block text-sm font-medium mb-1 text-black dark:text-white">
//                       Lab Test
//                     </label>

//                     <Listbox
//                       value={test.labTest}
//                       onChange={(selectedValue) => {
//                         const fakeEvent = {
//                           target: { name: "labTest", value: selectedValue },
//                         };
//                         handleInputChange(fakeEvent, index, "labTest");
//                       }}
//                     >
//                       {({ open }) => (
//                         <>
//                           <Listbox.Button
//                             className={`
//                               relative w-full h-[33.5px] px-3 pr-8 rounded-[8.38px] border-[1.05px]
//                               border-gray-300 dark:border-[#3C3C3C] bg-gray-100 dark:bg-black
//                               text-black dark:text-white text-left text-sm leading-none
//                               shadow-[0_0_2.09px_#0EFF7B] outline-none
//                               transition-all duration-300 font-[Helvetica]
//                               ${open ? "border-[#0EFF7B] shadow-[0_0_4px_#0EFF7B]" : ""}
//                               ${!test.labTest ? "text-gray-500" : ""}
//                             `}
//                           >
//                             <span className="block truncate">
//                               {test.labTest || "Select lab test"}
//                             </span>

//                             <span className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
//                               <ChevronDown
//                                 className={`h-4 w-4 text-[#0EFF7B] transition-transform duration-200 ${
//                                   open ? "rotate-180" : ""
//                                 }`}
//                               />
//                             </span>
//                           </Listbox.Button>

//                           <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[9999] border border-gray-300 dark:border-[#3C3C3C] scrollbar-hide focus:outline-none">
//                             {["Blood Test", "Urine Test", "X-Ray", "MRI"].map(
//                               (option) => (
//                                 <Listbox.Option
//                                   key={option}
//                                   value={option}
//                                   className={({ active, selected }) =>
//                                     `
//                                       cursor-pointer select-none py-2 px-3 text-sm font-[Helvetica]
//                                       ${
//                                         active
//                                           ? "bg-[#0EFF7B33] text-[#0EFF7B]"
//                                           : "text-black dark:text-white"
//                                       }
//                                       ${
//                                         selected
//                                           ? "bg-[#0EFF7B] bg-opacity-20 text-[#0EFF7B] font-medium"
//                                           : ""
//                                       }
//                                       hover:bg-[#0EFF7B33] hover:text-[#0EFF7B]
//                                     `
//                                   }
//                                 >
//                                   {option}
//                                 </Listbox.Option>
//                               )
//                             )}
//                           </Listbox.Options>
//                         </>
//                       )}
//                     </Listbox>
//                   </div>
//                 </div>

//                 {/* + and × buttons */}
//                 {index === labTests.length - 1 && (
//                   <button
//                     type="button"
//                     onClick={addLabTestEntry}
//                     className="relative group text-green-500 mt-5 hover:text-green-600 text-xl"
//                   >
//                     +
//                     <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Add
//               </span>
//                   </button>
//                 )}
//                 {labTests.length > 1 && (
//                   <button
//                     type="button"
//                     onClick={() => removeLabTestEntry(test.id)}
//                     className="relative group text-red-500 mt-5 hover:text-red-700 text-xl"
//                   >
//                     ×
//                     <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Close
//               </span>
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>

//           <div className="mt-5 flex justify-end gap-4">
//             <button
//               type="button"
//               onClick={handleClear}
//               disabled={loading}
//               className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
//             >
//               Clear
//             </button>
//             <button
//               type="submit"
//               disabled={loading || !patientDbId}
//               className="px-4 py-2 rounded bg-[#0EFF7B] text-black font-semibold hover:bg-[#05c860] disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? "Allocating..." : "Allocate Medicine"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Medicine Allocation History with Actions */}
//       {/* Medicine Allocation History with Actions */}
// <div className="mt-8 mb-4 rounded-xl p-4 w-full max-w-[100%] sm:max-w-[900px] lg:max-w-[1400px] mx-auto flex flex-col relative bg-gray-100 dark:bg-black text-black dark:text-white border border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0000001F]">
//   <h2 className="text-lg sm:text-xl font-semibold mb-4 text-black dark:text-[#FFFFFF] font-[Helvetica]">
//     Medicine allocation history
//   </h2>
//   <div className="overflow-x-auto">
//     <table className="w-full min-w-[600px] border-collapse font-[Helvetica] text-[13px] sm:text-[14px]">
//       <thead className="text-[#0EFF7B] font-[Helvetica] dark:bg-[#091810] border-b border-gray-300 dark:border-gray-700">
//         <tr className="text-left text-[#0EFF7B] border border-gray-300 dark:border-[#3C3C3C] text-center">
//           <th className="py-1.5 px-2 sm:px-3">Patient Name</th>
//           <th className="py-1.5 px-2 sm:px-3">Patient ID</th>
//           <th className="py-1.5 px-2 sm:px-3">Doctor</th>
//           <th className="py-1.5 px-2 sm:px-3">Date</th>
//           <th className="py-1.5 px-2 sm:px-3">Medicine</th>
//           <th className="py-1.5 px-2 sm:px-3">Dosage</th>
//           <th className="py-1.5 px-2 sm:px-3">Duration</th>
//           <th className="py-1.5 px-2 sm:px-3">Lab Tests</th>
//           <th className="py-1.5 px-2 sm:px-3">Actions</th>
//         </tr>
//       </thead>
//       <tbody>
//         {medicineHistory.map((item, index) => (
//           <tr
//             key={item.id || index}
//             className="border border-gray-200 dark:border-gray-700 text-center text Black dark:text-[#FFFFFF] hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D] bg-gray-100 dark:bg-black"
//           >
//             <td className="py-1.5 px-2 sm:px-3">{item.patient_name}</td>
//             <td className="py-1.5 px-2 sm:px-3">{item.patient_id}</td>
//             <td className="py-1.5 px-2 sm:px-3">{item.doctor}</td>
//             <td className="py-1.5 px-2 sm:px-3">{item.allocation_date}</td>
//             <td className="py-1.5 px-2 sm:px-3">{item.medicine_name}</td>
//             <td className="py-1.5 px-2 sm:px-3">{item.dosage}</td>
//             <td className="py-1.5 px-2 sm:px-3">{item.duration}</td>

//             {/* LAB TESTS CELL – Shows actual test names */}
//             <td className="py-1.5 px-2 sm:px-3">
//               {item.lab_test_types ? (
//                 <span className="text-[#0EFF7B] font-medium">
//                   {item.lab_test_types}
//                 </span>
//               ) : (
//                 <span className="text-gray-500">No</span>
//               )}
//             </td>

//             <td className="py-4 px-4 sm:px-6">
//               <div className="flex justify-center space-x-4">
//                 <button
//                   onClick={() => handleEditMedicine(item)}
//                   className="relative group text-blue-500 hover:text-blue-700 transition-colors"
//                   title=""
//                 >
//                   <Edit size={16} />
//                   <span className="absolute bottom-5 left-1/4 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Edit
//               </span>
//                 </button>
//                 <button
//                   onClick={() => handleDeleteMedicine(item)}
//                   className="relative group text-red-500 hover:text-red-700 transition-colors"
//                   title=""
//                 >
//                   <Trash2 size={16} /><span className="absolute bottom-5 left-1/4 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Delete
//               </span>
//                 </button>
//               </div>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>

//     {medicineHistory.length === 0 && (
//       <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//         No medicine allocation history found for this patient.
//       </div>
//     )}
//   </div>
// </div>

//       {/* Edit Medicine Allocation Popup */}
//       {isEditPopupOpen && editingMedicine && (
//         <EditMedicineAllocationPopup
//           onClose={() => {
//             setIsEditPopupOpen(false);
//             setEditingMedicine(null);
//           }}
//           medicineData={editingMedicine}
//           onUpdate={handleUpdateMedicine}
//         />
//       )}

//       {/* Delete Medicine Popup */}
//       {isDeletePopupOpen && deletingMedicine && (
//         <DeleteMedicinePopup
//           onClose={() => {
//             setIsDeletePopupOpen(false);
//             setDeletingMedicine(null);
//           }}
//           onConfirm={handleConfirmDelete}
//           medicineName={deletingMedicine.medicine_name}
//         />
//       )}
//     </div>
//   );
// }
// src/pages/Doctor/MedicineAllocation.jsx
// src/pages/Doctor/MedicineAllocation.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Listbox } from "@headlessui/react";
import { ChevronDown, Edit, Trash2 } from "lucide-react";
import { successToast, errorToast } from "../../components/Toast.jsx";
import EditMedicineAllocationPopup from "./EditMedicineAllocationPopup";
import DeleteMedicinePopup from "./DeleteMedicinePopup";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { Loader2 } from "lucide-react";

export default function ViewPatientProfile() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [medicineData, setMedicineData] = useState([
    {
      id: Date.now(),
      medicineName: "",
      dosage: "",
      quantity: "",
      frequency: [],
      duration: "",
      time: "",
    },
  ]);
  const [labTests, setLabTests] = useState([{ id: Date.now(), labTest: "" }]);
  const [medicineHistory, setMedicineHistory] = useState([]);
  const [patientInfo, setPatientInfo] = useState({
    patientName: "",
    patientID: "",
    department: "",
  });
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [patientDbId, setPatientDbId] = useState(null);
  const [fullPatient, setFullPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [deletingMedicine, setDeletingMedicine] = useState(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [testTypes, setTestTypes] = useState([]);
  const [loadingTestTypes, setLoadingTestTypes] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);
  // ================ Validation States ================
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  // ================ MRI Validation State ================
  const [pendingMRI, setPendingMRI] = useState(null);
  // ================ Duplicate Lab Report Validation ================
  const [existingLabReports, setExistingLabReports] = useState([]);

  // ================ TC-068: Temperature Unit Consistency Fix ================
  // Format temperature consistently in Celsius
  const formatTemperature = (temp) => {
    if (!temp) return "N/A";
    
    // Convert to number if it's a string
    const temperature = typeof temp === 'string' ? parseFloat(temp) : temp;
    if (isNaN(temperature)) return "N/A";
    
    // If temperature is above 50, assume it's in Fahrenheit and convert to Celsius
    if (temperature > 50) {
      const celsius = ((temperature - 32) * 5 / 9).toFixed(1);
      return `${celsius}°C`;
    }
    
    // Already in Celsius
    return `${temperature}°C`;
  };
  // ================ End of TC-068 Fix ================

  useEffect(() => {
    fetchDepartments();
    fetchPatients();
    fetchStock();
    fetchTestTypes();
  }, []);

  // Refresh stock when patient is selected to ensure latest data
  useEffect(() => {
    if (patientDbId) {
      fetchStock();
    }
  }, [patientDbId]);

  const displayValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return "-";
    }
    return value;
  };

  const fetchTestTypes = async () => {
    try {
      setLoadingTestTypes(true);
      const response = await api.get("/labreports/test-types/");
      const data = response.data;

      const testTypesArray = data.test_types || data || [];
      setTestTypes(testTypesArray);
    } catch (error) {
      console.error("Error fetching test types:", error);
      setTestTypes([]);

      if (error.response) {
        errorToast(
          `Failed to fetch test types: ${error.response.data?.detail || error.message}`,
        );
      } else {
        errorToast("Failed to load test types. Please try again.");
      }
    } finally {
      setLoadingTestTypes(false);
    }
  };

  // ================ Fetch existing lab reports for the patient ================
  const fetchExistingLabReports = useCallback(async (patientId) => {
    if (!patientId) return;
    
    try {
      const response = await api.get(`/labreports/patient/${patientId}/`);
      const reports = response.data;
      
      // Filter for pending or in-progress reports
      const pendingReports = reports.filter(report => 
        report.status === "pending" || report.status === "in-progress"
      );
      
      setExistingLabReports(pendingReports);
      return pendingReports;
    } catch (error) {
      console.error("Error fetching existing lab reports:", error);
      setExistingLabReports([]);
      return [];
    }
  }, []);

  // ================ Check for duplicate lab reports ================
  const validateDuplicateLabReports = useCallback(() => {
    const errors = {};
    
    // Get all selected lab tests (non-empty)
    const selectedLabTests = labTests
      .map(test => test.labTest)
      .filter(test => test && test.trim() !== "");
    
    // Check each selected lab test against existing pending/in-progress reports
    selectedLabTests.forEach((testType) => {
      const existingReport = existingLabReports.find(
        report => report.test_type?.toLowerCase() === testType.toLowerCase()
      );
      
      if (existingReport) {
        errors[`lab_duplicate_${testType}`] = 
          `This patient already has a ${testType} report in ${existingReport.status} stage. Cannot add another.`;
      }
    });
    
    return errors;
  }, [labTests, existingLabReports]);

  // ================ TC-069: Medicine Count Consistency Fix ================
  // Enhanced fetchStock to get ALL active medicines
  const fetchStock = async () => {
    try {
      setStockLoading(true);
      console.log("=== FETCHING ALL STOCK FOR MEDICINE ALLOCATION ===");
      
      // Get all stock items without filtering on frontend
      const response = await api.get("/medicine_allocation/stock/list");
      
      let stockItems = response.data;
      console.log("Raw stock items from API:", stockItems?.length || 0);
      
      // Ensure we have an array
      if (!Array.isArray(stockItems)) {
        console.error("Stock data is not an array:", stockItems);
        stockItems = [];
      }
      
      // Log detailed stock information for debugging
      console.log("Total stock items:", stockItems.length);
      
      const uniqueMedicineNames = [...new Set(
        stockItems
          .map(item => item.product_name)
          .filter(name => name && name.trim() !== "")
      )];
      
      console.log("Unique medicine names in stock:", uniqueMedicineNames.length);
      console.log("Medicine names:", uniqueMedicineNames);
      
      // Check for medicines with quantity
      const medicinesWithStock = stockItems.filter(item => 
        item.quantity && parseInt(item.quantity) > 0
      );
      console.log("Medicines with positive stock:", medicinesWithStock.length);
      
      // Check for zero stock medicines
      const zeroStockMedicines = stockItems.filter(item => 
        !item.quantity || parseInt(item.quantity) === 0
      );
      console.log("Medicines with zero stock:", zeroStockMedicines.length);
      
      setStockData(stockItems);
    } catch (error) {
      console.error("Error fetching stock:", error);
      if (error.response) {
        console.error("Stock API error response:", error.response.data);
        errorToast(`Failed to load stock data: ${error.response.data?.detail || error.message}`);
      } else {
        errorToast("Failed to load stock data. Please refresh.");
      }
      setStockData([]);
    } finally {
      setStockLoading(false);
    }
  };

  // ================ Check for pending MRI ================
  const checkPendingMRI = useCallback(async (patientId) => {
    if (!patientId) return;
    
    try {
      // Check lab reports for MRI with pending or in-progress status
      const reportsResponse = await api.get(`/labreports/patient/${patientId}/`);
      const reports = reportsResponse.data;
      
      // Filter for MRI with pending or in-progress status
      const pendingMRIReport = reports.find(report => 
        report.test_type?.toLowerCase().includes('mri') && 
        (report.status === "pending" || report.status === "in-progress")
      );
      
      if (pendingMRIReport) {
        setPendingMRI(pendingMRIReport);
        return true;
      } else {
        setPendingMRI(null);
        return false;
      }
    } catch (err) {
      console.error("Error checking lab reports for MRI:", err);
      setPendingMRI(null);
      return false;
    }
  }, []);

  // ================ End of MRI Check ================

  // Get ALL unique medicine names - no filtering, show everything from stock
  const medicineNames = useMemo(() => {
    const names = stockData
      .map(item => item.product_name)
      .filter(name => name && name.trim() !== "")
      .filter((value, index, self) => self.indexOf(value) === index) // Unique only
      .sort((a, b) => a.localeCompare(b));
    
    console.log("✅ Medicine dropdown will show:", names.length, "medicines");
    return names;
  }, [stockData]);

  // Check if medicine has any stock available (for visual indication)
  const isMedicineInStock = useCallback((medicineName) => {
    return stockData.some(item => 
      item.product_name === medicineName && 
      item.quantity && 
      parseInt(item.quantity) > 0
    );
  }, [stockData]);

  // Dosage map for available dosages per medicine
  const dosageMap = useMemo(() => {
    const map = {};
    stockData.forEach((s) => {
      if (s.product_name && s.dosage) {
        if (!map[s.product_name]) map[s.product_name] = new Set();
        map[s.product_name].add(s.dosage);
      }
    });
    Object.keys(map).forEach((k) => {
      map[k] = [...map[k]].sort();
    });
    return map;
  }, [stockData]);

  // Get available stock quantity for a specific medicine and dosage
  const getAvailableQuantity = useCallback(
    (medicineName, dosage) => {
      if (!medicineName || !dosage) return 0;

      const stockItem = stockData.find(
        (s) => s.product_name === medicineName && s.dosage === dosage
      );

      return stockItem ? parseInt(stockItem.quantity) || 0 : 0;
    },
    [stockData],
  );
  // ================ End of TC-069 Fix ================

  const frequencyOptions = ["Morning", "Afternoon", "Evening", "Night"];

  const toBinary = useCallback((selected) => {
    if (!selected) return "";

    const frequencies = Array.isArray(selected)
      ? selected
      : [selected].filter(Boolean);

    if (frequencies.length === 0) return "";

    const bin = [0, 0, 0, 0];
    frequencies.forEach((s) => {
      if (s === "Morning") bin[0] = 1;
      else if (s === "Afternoon") bin[1] = 1;
      else if (s === "Evening") bin[2] = 1;
      else if (s === "Night") bin[3] = 1;
    });
    return bin.join(" ");
  }, []);

  const toNames = useCallback((binaryStr) => {
    if (Array.isArray(binaryStr)) {
      return binaryStr;
    }

    if (!binaryStr) {
      return [];
    }

    if (typeof binaryStr === "string") {
      const trimmed = binaryStr.trim();
      if (trimmed === "") return [];

      const bin = trimmed.split(" ").map(Number);
      const selected = [];
      if (bin[0]) selected.push("Morning");
      if (bin[1]) selected.push("Afternoon");
      if (bin[2]) selected.push("Evening");
      if (bin[3]) selected.push("Night");
      return selected;
    }

    return [];
  }, []);

  const calculateQuantity = useCallback((frequency, duration) => {
    if (!frequency || frequency.length === 0 || !duration) return "";

    const durationStr = duration.toString().toLowerCase();
    let days = 0;

    if (durationStr.includes("day")) {
      days = parseInt(durationStr) || 0;
    } else if (durationStr.includes("week")) {
      const weeks = parseInt(durationStr) || 0;
      days = weeks * 7;
    } else if (durationStr.includes("month")) {
      const months = parseInt(durationStr) || 0;
      days = months * 30;
    } else {
      days = parseInt(durationStr) || 0;
    }

    if (days <= 0) return "";

    const dosesPerDay = frequency.length;
    const totalDoses = days * dosesPerDay;

    return totalDoses.toString();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(
        (patient) =>
          patient.full_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          patient.patient_unique_id
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments/");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      if (error.response) {
        errorToast(
          `Failed to fetch departments: ${error.response.data?.detail || error.message}`,
        );
      }
    }
  };

  const fetchPatients = async () => {
    try {
      console.log("=== FETCHING PATIENTS FOR MEDICINE ALLOCATION ===");

      const response = await api.get("/patients/", {
        params: { limit: 100 },
      });

      let data = response.data;
      let patientsList = [];
      
      if (data.patients && Array.isArray(data.patients)) {
        patientsList = data.patients;
      } else if (Array.isArray(data)) {
        patientsList = data;
      }

      console.log("Total patients from API:", patientsList.length);

      const filteredPatientsList = patientsList.filter((patient) => {
        const status = patient.casualty_status;
        if (status === "Completed" || status === "Cancelled") {
          console.log(
            `❌ Excluding ${status.toLowerCase()} patient: ${patient.full_name}`,
          );
          return false;
        }
        return true;
      });

      console.log(
        "After filtering completed/cancelled patients:",
        filteredPatientsList.length,
      );

      const uniquePatients = [];
      const seenIds = new Set();

      filteredPatientsList.forEach((patient) => {
        const patientId = patient.patient_unique_id || patient.id;
        if (!seenIds.has(patientId)) {
          seenIds.add(patientId);
          uniquePatients.push(patient);
        }
      });

      console.log("Final patient list count:", uniquePatients.length);
      setPatients(uniquePatients);
      setFilteredPatients(uniquePatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      if (error.response) {
        errorToast(
          `Failed to fetch patients: ${error.response.data?.detail || error.message}`,
        );
      } else {
        errorToast("Failed to fetch patients. Please try again.");
      }
    }
  };

  const fetchPatientFull = async (patientUniqueId) => {
    try {
      const response = await api.get(`/patients/${patientUniqueId}`);
      setFullPatient(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching patient details:", error);
      return null;
    }
  };

  const fetchMedicineHistory = async (patientDbId) => {
    if (!patientDbId) return;
    try {
      const response = await api.get(
        `/medicine_allocation/${patientDbId}/medicine-allocations/`,
      );

      const data = response.data;
      const processedData = (data || []).map((item) => ({
        ...item,
        frequency: toNames(item.frequency || ""),
      }));

      setMedicineHistory(processedData);
    } catch (error) {
      console.error("Error fetching medicine history:", error);
      if (error.response?.status === 404) {
        setMedicineHistory([]);
      } else {
        errorToast("Failed to fetch medicine history");
      }
    }
  };

  const handlePatientSelect = async (patient) => {
    if (!patient) return;
    setPatientDbId(patient.id);
    const departmentName = patient.department || "";
    setPatientInfo({
      patientName: patient.full_name,
      patientID: patient.patient_unique_id,
      department: departmentName,
    });
    const fullPatientData = await fetchPatientFull(patient.patient_unique_id);
    await fetchMedicineHistory(patient.id);
    // Check for pending MRI when patient is selected
    await checkPendingMRI(patient.id);
    // Fetch existing lab reports for duplicate validation
    await fetchExistingLabReports(patient.id);
    setSearchQuery("");
    
    // Clear validation errors when patient changes
    setValidationErrors({});
    setTouchedFields({});
  };

  const handlePatientFieldChange = useCallback(
    (field, value) => {
      if (field === "patientName" && value) {
        const selectedPatient = patients.find((p) => p.full_name === value);
        if (selectedPatient) {
          handlePatientSelect(selectedPatient);
        }
      } else if (field === "patientID" && value) {
        const selectedPatient = patients.find(
          (p) => p.patient_unique_id === value,
        );
        if (selectedPatient) {
          handlePatientSelect(selectedPatient);
        }
      } else if (field === "department" && value) {
        setPatientInfo((prev) => ({
          ...prev,
          department: value,
        }));
      }
    },
    [patients],
  );

  // ================ Validation Functions ================
  const validateMedicineEntry = useCallback((medicine, index) => {
    const errors = {};
    
    if (!medicine.medicineName || medicine.medicineName.trim() === "") {
      errors[`medicine_${index}_medicineName`] = "Medicine name is required";
    }
    
    if (!medicine.dosage || medicine.dosage.trim() === "") {
      errors[`medicine_${index}_dosage`] = "Dosage is required";
    }
    
    if (!medicine.frequency || medicine.frequency.length === 0) {
      errors[`medicine_${index}_frequency`] = "At least one frequency must be selected";
    }
    
    if (!medicine.duration || medicine.duration.trim() === "") {
      errors[`medicine_${index}_duration`] = "Duration is required";
    } else {
      // Validate duration format (should include days/weeks/months or be a number)
      const durationStr = medicine.duration.toString().toLowerCase();
      const hasUnit = durationStr.includes('day') || durationStr.includes('week') || durationStr.includes('month');
      const isNumeric = /^\d+$/.test(durationStr.trim());
      
      if (!hasUnit && !isNumeric) {
        errors[`medicine_${index}_duration`] = "Duration should be a number or include days/weeks/months (e.g., 5 days)";
      }
      
      // Extract number for validation
      const numMatch = durationStr.match(/\d+/);
      if (numMatch && parseInt(numMatch[0]) <= 0) {
        errors[`medicine_${index}_duration`] = "Duration must be greater than 0";
      }
    }
    
    if (!medicine.time || medicine.time.trim() === "") {
      errors[`medicine_${index}_time`] = "Time is required";
    }
    
    // Quantity should be auto-calculated, but check if it's valid
    if (!medicine.quantity || medicine.quantity === "" || parseInt(medicine.quantity) <= 0) {
      errors[`medicine_${index}_quantity`] = "Quantity could not be calculated. Check frequency and duration.";
    }
    
    return errors;
  }, []);

  // ================ MRI Validation Function ================
  const validateMRIStatus = useCallback(() => {
    // Check if labTests includes MRI
    const hasMRI = labTests.some(test => 
      test.labTest?.toLowerCase().includes('mri')
    );
    
    // If MRI is selected and there's a pending MRI, show error
    if (hasMRI && pendingMRI) {
      return {
        isValid: false,
        error: `This patient already has an MRI in ${pendingMRI.status} stage. Cannot allocate another MRI.`
      };
    }
    
    return { isValid: true };
  }, [labTests, pendingMRI]);

  const validateForm = useCallback(() => {
    const errors = {};
    
    // Validate patient selection
    if (!patientDbId) {
      errors.patient = "Please select a patient";
    }
    
    // Validate each medicine entry
    medicineData.forEach((medicine, index) => {
      // Only validate if the medicine has any data (partially filled)
      // But if it's the first entry and empty, we should validate
      const hasAnyData = medicine.medicineName || medicine.dosage || 
                         medicine.frequency.length > 0 || medicine.duration || 
                         medicine.time;
      
      if (hasAnyData || index === 0) {
        const medicineErrors = validateMedicineEntry(medicine, index);
        Object.assign(errors, medicineErrors);
      }
    });
    
    // Validate MRI status
    const mriValidation = validateMRIStatus();
    if (!mriValidation.isValid) {
      errors.mri = mriValidation.error;
    }
    
    // Validate duplicate lab reports
    const duplicateErrors = validateDuplicateLabReports();
    Object.assign(errors, duplicateErrors);
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [patientDbId, medicineData, validateMedicineEntry, validateMRIStatus, validateDuplicateLabReports]);

  const handleFieldBlur = useCallback((fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  // ================ End of Validation Functions ================

  const handleInputChange = useCallback(
    (e, index, type) => {
      const { name, value } = e.target;
      const fieldKey = type === "medicine" ? `medicine_${index}_${name}` : `lab_${index}_${name}`;
      
      // Mark field as touched
      setTouchedFields(prev => ({ ...prev, [fieldKey]: true }));

      if (type === "medicine") {
        setMedicineData((prev) => {
          const newData = [...prev];
          const updatedItem = { ...newData[index], [name]: value };

          if (name === "medicineName") {
            updatedItem.dosage = "";
            updatedItem.quantity = "";
          }

          if (name === "dosage") {
            const availableQty = getAvailableQuantity(
              updatedItem.medicineName,
              value,
            );
            if (availableQty === 0) {
              errorToast(
                `No stock available for ${updatedItem.medicineName} - ${value}`,
              );
            }
          }

          if (name === "duration" || name === "frequency") {
            if (name === "duration") {
              const currentFrequency = newData[index].frequency || [];
              const calculatedQty = calculateQuantity(currentFrequency, value);
              if (calculatedQty) {
                updatedItem.quantity = calculatedQty;
              }
            }
          }

          newData[index] = updatedItem;
          return newData;
        });
      } else if (type === "labTest") {
        setLabTests((prev) => {
          const newTests = [...prev];
          newTests[index] = { ...newTests[index], [name]: value };
          return newTests;
        });
        
        // Check for duplicate when selecting a lab test
        if (value && existingLabReports.length > 0) {
          const existingReport = existingLabReports.find(
            report => report.test_type?.toLowerCase() === value.toLowerCase()
          );
          
          if (existingReport) {
            const duplicateError = {};
            duplicateError[`lab_duplicate_${value}`] = 
              `This patient already has a ${value} report in ${existingReport.status} stage. Cannot add another.`;
            setValidationErrors(prev => ({ ...prev, ...duplicateError }));
          }
        }
      }
      
      // Clear validation error for this field when user types
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    },
    [getAvailableQuantity, calculateQuantity, existingLabReports],
  );

  const handleFrequencyChange = useCallback(
    (index, selected) => {
      const fieldKey = `medicine_${index}_frequency`;
      
      // Mark field as touched
      setTouchedFields(prev => ({ ...prev, [fieldKey]: true }));
      
      setMedicineData((prev) => {
        const newData = [...prev];
        const currentItem = newData[index];

        newData[index] = { ...currentItem, frequency: selected };

        if (currentItem.duration) {
          const calculatedQty = calculateQuantity(
            selected,
            currentItem.duration,
          );
          if (calculatedQty) {
            newData[index].quantity = calculatedQty;
          }
        }

        return newData;
      });
      
      // Clear validation error for frequency
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    },
    [calculateQuantity],
  );

  const addMedicineEntry = useCallback(() => {
    setMedicineData((prev) => [
      ...prev,
      {
        id: Date.now(),
        medicineName: "",
        dosage: "",
        quantity: "",
        frequency: [],
        duration: "",
        time: "",
      },
    ]);
  }, []);

  const addLabTestEntry = useCallback(() => {
    setLabTests((prev) => [...prev, { id: Date.now(), labTest: "" }]);
  }, []);

  const removeMedicineEntry = useCallback((id) => {
    setMedicineData((prev) => prev.filter((entry) => entry.id !== id));
    
    // Clear validation errors for removed medicine
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      // Remove errors related to this medicine (we don't know the index here, but we'll clear on next validation)
      return newErrors;
    });
  }, []);

  const removeLabTestEntry = useCallback((id) => {
    // Find the test being removed to clear its duplicate error
    const testToRemove = labTests.find(test => test.id === id);
    
    setLabTests((prev) => prev.filter((entry) => entry.id !== id));
    
    // Clear validation errors
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.mri;
      
      // Clear duplicate error for this specific test
      if (testToRemove?.labTest) {
        delete newErrors[`lab_duplicate_${testToRemove.labTest}`];
      }
      
      return newErrors;
    });
  }, [labTests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      errorToast("Please fill in all required fields");
      
      // Mark all fields as touched to show errors
      const allFields = {};
      medicineData.forEach((_, index) => {
        allFields[`medicine_${index}_medicineName`] = true;
        allFields[`medicine_${index}_dosage`] = true;
        allFields[`medicine_${index}_frequency`] = true;
        allFields[`medicine_${index}_duration`] = true;
        allFields[`medicine_${index}_time`] = true;
        allFields[`medicine_${index}_quantity`] = true;
      });
      setTouchedFields(allFields);
      return;
    }

    // Check stock availability for each medicine
    for (const med of medicineData) {
      if (med.medicineName && med.dosage && med.quantity) {
        const availableQty = getAvailableQuantity(med.medicineName, med.dosage);
        const requestedQty = parseInt(med.quantity) || 0;

        if (requestedQty > availableQty) {
          errorToast(
            `Insufficient stock for ${med.medicineName} - ${med.dosage}. Available: ${availableQty}, Requested: ${requestedQty}`,
          );
          return;
        }
      }
    }

    setLoading(true);
    try {
      const response = await api.post(
        `/medicine_allocation/${patientDbId}/allocations/`,
        {
          medicines: medicineData
            .map((med) => ({
              medicine_name: med.medicineName,
              dosage: med.dosage,
              quantity: med.quantity,
              frequency: toBinary(med.frequency),
              duration: med.duration,
              time: med.time,
            }))
            .filter((med) => med.medicine_name.trim() !== ""),
          lab_test_types: labTests
            .map((test) => test.labTest)
            .filter((test) => test && test.trim() !== ""),
        },
      );

      const result = response.data;
      
      // ================ FIX: Properly handle lab tests in history ================
      // Get the lab tests that were actually submitted (non-empty)
      const submittedLabTests = labTests
        .map(test => test.labTest)
        .filter(test => test && test.trim() !== "");
      
      // Create new history entries for medicines with their associated lab tests
      const newHistoryEntries = result.medicines.map((med, idx) => ({
        id: med.id,
        patient_name: med.patient_name,
        patient_id: med.patient_id,
        department: med.department,
        doctor: med.doctor,
        allocation_date: med.allocation_date,
        medicine_name: med.medicine_name,
        dosage: med.dosage,
        duration: med.duration,
        frequency: med.frequency,
        // If the medicine has its own lab_test_type, use that, otherwise use the submitted lab tests
        lab_test_types: med.lab_test_type || (submittedLabTests.length > 0 ? submittedLabTests.join(", ") : null),
      }));
      
      setMedicineHistory((prev) => [
        ...newHistoryEntries.map((item) => ({
          ...item,
          frequency: toNames(item.frequency),
        })),
        ...prev,
      ]);
      // ================ End of Fix ================

      await fetchStock();
      handleClear();
      
      // Clear validation errors on successful submit
      setValidationErrors({});
      setTouchedFields({});
      
      successToast("Medicines allocated successfully!");
      
      // Recheck MRI status and existing lab reports after submission
      if (patientDbId) {
        await checkPendingMRI(patientDbId);
        await fetchExistingLabReports(patientDbId);
      }
    } catch (error) {
      console.error("Error allocating medicines:", error);
      if (error.response) {
        // Check if the error is about duplicate lab reports
        const errorDetail = error.response.data?.detail;
        if (errorDetail && errorDetail.includes("already has a pending")) {
          errorToast(errorDetail);
        } else {
          errorToast(
            `Failed to allocate medicines: ${error.response.data?.detail || error.message}`,
          );
        }
      } else {
        errorToast("Failed to allocate medicines. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = useCallback(() => {
    setMedicineData([
      {
        id: Date.now(),
        medicineName: "",
        dosage: "",
        quantity: "",
        frequency: [],
        duration: "",
        time: "",
      },
    ]);
    setLabTests([{ id: Date.now(), labTest: "" }]);
    
    // Clear validation errors and touched fields
    setValidationErrors({});
    setTouchedFields({});
  }, []);

  const handleEditMedicine = useCallback(
    (medicine) => {
      let freqArray = [];
      if (medicine.frequency) {
        if (Array.isArray(medicine.frequency)) {
          freqArray = medicine.frequency;
        } else if (typeof medicine.frequency === "string") {
          freqArray = toNames(medicine.frequency);
        }
      }

      setEditingMedicine({
        ...medicine,
        frequency: freqArray,
      });
      setIsEditPopupOpen(true);
    },
    [toNames],
  );

  const handleDeleteMedicine = useCallback((medicine) => {
    setDeletingMedicine(medicine);
    setIsDeletePopupOpen(true);
  }, []);

  const handleUpdateMedicine = async (updatedData) => {
    try {
      const response = await api.put(
        `/medicine_allocation/${patientDbId}/medicine-allocations/${editingMedicine.id}/`,
        {
          medicine_name: updatedData.medicineName,
          dosage: updatedData.dosage,
          quantity: updatedData.quantity,
          frequency: toBinary(updatedData.frequency),
          duration: updatedData.duration,
          time: updatedData.time,
        },
      );

      await fetchMedicineHistory(patientDbId);
      await fetchStock(); // Refresh stock after update
      successToast("Medicine allocation updated successfully!");
    } catch (error) {
      console.error("Error updating medicine:", error);
      if (error.response) {
        errorToast(
          `Failed to update medicine: ${error.response.data?.detail || error.message}`,
        );
      } else {
        errorToast("Failed to update medicine allocation");
      }
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(
        `/medicine_allocation/${patientDbId}/medicine-allocations/${deletingMedicine.id}/`,
      );

      await fetchMedicineHistory(patientDbId);
      await fetchStock(); // Refresh stock after deletion
      successToast("Medicine allocation deleted successfully!");
    } catch (error) {
      console.error("Error deleting medicine:", error);
      if (error.response) {
        errorToast(
          `Failed to delete medicine: ${error.response.data?.detail || error.message}`,
        );
      } else {
        errorToast("Failed to delete medicine allocation");
      }
    } finally {
      setIsDeletePopupOpen(false);
      setDeletingMedicine(null);
    }
  };

  const patientNames = useMemo(
    () =>
      patients
        .map((patient) => patient?.full_name)
        .filter((name) => name && name.trim() !== "")
        .filter((name, index, self) => self.indexOf(name) === index),
    [patients],
  );

  const patientIDs = useMemo(
    () =>
      patients
        .map((patient) => patient?.patient_unique_id)
        .filter((id) => id && id.trim() !== "")
        .filter((id, index, self) => self.indexOf(id) === index),
    [patients],
  );

  const departmentNames = useMemo(
    () =>
      departments
        .map((dept) => dept?.name)
        .filter((name) => name && name.trim() !== "")
        .filter((name, index, self) => self.indexOf(name) === index),
    [departments],
  );

  // ================ Updated CustomInput with Validation ================
  const CustomInput = useCallback(
    ({
      label,
      name,
      value,
      index,
      placeholder,
      type = "text",
      readOnly = false,
      required = false,
    }) => {
      const fieldKey = `medicine_${index}_${name}`;
      const isTouched = touchedFields[fieldKey];
      const error = validationErrors[fieldKey];
      const showError = isTouched && error;

      const handleChange = (e) => {
        const newValue =
          type === "number" ? parseInt(e.target.value) || "" : e.target.value;
        const fakeEvent = { target: { name, value: newValue } };
        handleInputChange(fakeEvent, index, "medicine");
      };

      const handleBlur = () => {
        handleFieldBlur(fieldKey);
      };

      return (
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-black dark:text-white capitalize">
            {label} {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`
            w-full h-[33.5px] px-3 rounded-[8.38px] border-[1.05px]
            ${showError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-[#3C3C3C]'}
            bg-gray-100 dark:bg-black
            text-black dark:text-white text-sm leading-none
            shadow-[0_0_2.09px_#0EFF7B] outline-none
            transition-all duration-300 font-[Helvetica]
            focus:border-[#0EFF7B] focus:shadow-[0_0_4px_#0EFF7B]
            ${!value ? "text-gray-500" : ""}
            ${readOnly ? "bg-gray-200 dark:bg-gray-800 cursor-not-allowed" : ""}
          `}
          />
          {showError && (
            <p className="text-red-500 text-xs mt-1">{error}</p>
          )}
        </div>
      );
    },
    [handleInputChange, handleFieldBlur, validationErrors, touchedFields],
  );

  // ================ Updated MedicineDropdown with Validation ================
  const MedicineDropdown = useCallback(
    ({ label, name, value, options, index }) => {
      const fieldKey = `medicine_${index}_${name}`;
      const isTouched = touchedFields[fieldKey];
      const error = validationErrors[fieldKey];
      const showError = isTouched && error;

      const handleChange = (selectedValue) => {
        const fakeEvent = { target: { name, value: selectedValue } };
        handleInputChange(fakeEvent, index, "medicine");
        handleFieldBlur(fieldKey);
      };

      const handleBlur = () => {
        handleFieldBlur(fieldKey);
      };

      return (
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-black dark:text-white capitalize">
            {label} <span className="text-red-500 ml-1">*</span>
          </label>
          <Listbox 
            value={value} 
            onChange={handleChange}
            disabled={stockLoading}
          >
            {({ open }) => (
              <>
                <Listbox.Button
                  onBlur={handleBlur}
                  className={`
                  relative w-full h-[33.5px] px-3 pr-8 rounded-[8.38px] border-[1.05px]
                  ${showError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-[#3C3C3C]'}
                  ${stockLoading ? 'bg-gray-200 dark:bg-gray-800 cursor-wait' : 'bg-gray-100 dark:bg-black'}
                  text-black dark:text-white text-left text-sm leading-none
                  shadow-[0_0_2.09px_#0EFF7B] outline-none
                  transition-all duration-300 font-[Helvetica]
                  ${open ? "border-[#0EFF7B] shadow-[0_0_4px_#0EFF7B]" : ""}
                  ${!value ? "text-gray-500" : ""}
                `}
                >
                  <span className="block truncate">
                    {stockLoading ? "Loading medicines..." : (value || `Select ${label.toLowerCase()}`)}
                  </span>
                  <span className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
                    {stockLoading ? (
                      <div className="h-4 w-4 border-2 border-[#0EFF7B] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ChevronDown
                        className={`h-4 w-4 text-[#0EFF7B] transition-transform duration-200 ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </span>
                </Listbox.Button>
                {showError && (
                  <p className="text-red-500 text-xs mt-1">{error}</p>
                )}
                {!stockLoading && options.length > 0 && (
                  <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[9999] border border-gray-300 dark:border-[#3C3C3C] scrollbar-hide focus:outline-none">
                    {options.map((option) => {
                      const inStock = isMedicineInStock(option);
                      return (
                        <Listbox.Option
                          key={option}
                          value={option}
                          className={({ active, selected }) => `
                            cursor-pointer select-none py-2 px-3 text-sm font-[Helvetica]
                            ${active ? "bg-[#0EFF7B33] text-[#0EFF7B]" : "text-black dark:text-white"}
                            ${selected ? "bg-[#0EFF7B] bg-opacity-20 text-[#0EFF7B] font-medium" : ""}
                            ${!inStock ? "opacity-50" : ""}
                            hover:bg-[#0EFF7B33] hover:text-[#0EFF7B]
                          `}
                        >
                          <div className="flex justify-between items-center">
                            <span>{option}</span>
                            {!inStock && (
                              <span className="text-xs text-red-500 ml-2">
                                Out of Stock
                              </span>
                            )}
                            {inStock && (
                              <span className="text-xs text-green-500 ml-2">
                                In Stock
                              </span>
                            )}
                          </div>
                        </Listbox.Option>
                      );
                    })}
                  </Listbox.Options>
                )}
                {!stockLoading && options.length === 0 && (
                  <div className="absolute mt-1 w-full rounded-[8px] bg-gray-100 dark:bg-black shadow-lg border border-gray-300 dark:border-[#3C3C3C] py-2 px-3 text-sm text-gray-500 text-center">
                    No medicines available in stock
                  </div>
                )}
              </>
            )}
          </Listbox>
          {!stockLoading && options.length > 0 && (
            <div className="mt-1 text-xs text-gray-500">
              Total medicines: {options.length}
            </div>
          )}
        </div>
      );
    },
    [handleInputChange, handleFieldBlur, isMedicineInStock, stockLoading, validationErrors, touchedFields],
  );

  // ================ Updated DosageDropdown with Validation ================
  const DosageDropdown = useCallback(
    ({ label, name, value, medicineName, index }) => {
      const fieldKey = `medicine_${index}_${name}`;
      const isTouched = touchedFields[fieldKey];
      const error = validationErrors[fieldKey];
      const showError = isTouched && error;
      const dosages = medicineName ? dosageMap[medicineName] || [] : [];

      const handleChange = (selectedValue) => {
        const fakeEvent = { target: { name, value: selectedValue } };
        handleInputChange(fakeEvent, index, "medicine");
        handleFieldBlur(fieldKey);
      };

      const handleBlur = () => {
        handleFieldBlur(fieldKey);
      };

      return (
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-black dark:text-white capitalize">
            {label} <span className="text-red-500 ml-1">*</span>
          </label>
          <Listbox
            value={value}
            onChange={handleChange}
            disabled={!medicineName || dosages.length === 0}
          >
            {({ open }) => (
              <>
                <Listbox.Button
                  onBlur={handleBlur}
                  className={`
                  relative w-full h-[33.5px] px-3 pr-8 rounded-[8.38px] border-[1.05px]
                  ${showError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-[#3C3C3C]'}
                  ${!medicineName || dosages.length === 0 ? "bg-gray-200 dark:bg-gray-800 cursor-not-allowed" : "bg-gray-100 dark:bg-black"}
                  text-black dark:text-white text-left text-sm leading-none
                  shadow-[0_0_2.09px_#0EFF7B] outline-none
                  transition-all duration-300 font-[Helvetica]
                  ${open ? "border-[#0EFF7B] shadow-[0_0_4px_#0EFF7B]" : ""}
                  ${!value ? "text-gray-500" : ""}
                `}
                >
                  <span className="block truncate">
                    {!medicineName
                      ? "Select medicine first"
                      : dosages.length === 0
                        ? "No dosages available"
                        : value || `Select ${label.toLowerCase()}`}
                  </span>
                  <span className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
                    <ChevronDown
                      className={`h-4 w-4 text-[#0EFF7B] transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </Listbox.Button>
                {showError && (
                  <p className="text-red-500 text-xs mt-1">{error}</p>
                )}
                {medicineName && dosages.length > 0 && (
                  <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[9999] border border-gray-300 dark:border-[#3C3C3C] scrollbar-hide focus:outline-none">
                    {dosages.map((dosage) => {
                      const availableQty = getAvailableQuantity(
                        medicineName,
                        dosage,
                      );
                      return (
                        <Listbox.Option
                          key={dosage}
                          value={dosage}
                          disabled={availableQty === 0}
                          className={({ active, selected, disabled }) =>
                            `
                            cursor-pointer select-none py-2 px-3 text-sm font-[Helvetica]
                            ${active && !disabled ? "bg-[#0EFF7B33] text-[#0EFF7B]" : ""}
                            ${selected ? "bg-[#0EFF7B] bg-opacity-20 text-[#0EFF7B] font-medium" : ""}
                            ${disabled ? "opacity-50 cursor-not-allowed text-gray-500" : "text-black dark:text-white"}
                            hover:bg-[#0EFF7B33] hover:text-[#0EFF7B]
                          `
                          }
                        >
                          <div className="flex justify-between items-center">
                            <span>{dosage}</span>
                            <span
                              className={`text-xs ${availableQty === 0 ? "text-red-500" : "text-green-500"}`}
                            >
                              Stock: {availableQty}
                            </span>
                          </div>
                        </Listbox.Option>
                      );
                    })}
                  </Listbox.Options>
                )}
              </>
            )}
          </Listbox>
        </div>
      );
    },
    [dosageMap, getAvailableQuantity, handleInputChange, handleFieldBlur, validationErrors, touchedFields],
  );

  // ================ Updated MultiFrequencyDropdown with Validation ================
  const MultiFrequencyDropdown = useCallback(
    ({ index, selected, onChange }) => {
      const fieldKey = `medicine_${index}_frequency`;
      const isTouched = touchedFields[fieldKey];
      const error = validationErrors[fieldKey];
      const showError = isTouched && error;

      const handleChange = (selectedOptions) => {
        onChange(selectedOptions);
        handleFieldBlur(fieldKey);
      };

      const handleBlur = () => {
        handleFieldBlur(fieldKey);
      };

      return (
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-black dark:text-white">
            Frequency <span className="text-red-500 ml-1">*</span>
          </label>
          <Listbox value={selected} onChange={handleChange} multiple>
            {({ open }) => (
              <>
                <Listbox.Button
                  onBlur={handleBlur}
                  className={`
                  relative w-full h-[33.5px] px-3 pr-8 rounded-[8.38px] border-[1.05px]
                  ${showError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-[#3C3C3C]'}
                  bg-gray-100 dark:bg-black
                  text-black dark:text-white text-left text-sm leading-none
                  shadow-[0_0_2.09px_#0EFF7B] outline-none
                  transition-all duration-300 font-[Helvetica]
                  ${open ? "border-[#0EFF7B] shadow-[0_0_4px_#0EFF7B]" : ""}
                  ${!selected || selected.length === 0 ? "text-gray-500" : ""}
                `}
                >
                  <span className="block truncate">
                    {selected && selected.length > 0
                      ? selected.join(", ")
                      : "Select frequencies"}
                  </span>
                  <span className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
                    <ChevronDown
                      className={`h-4 w-4 text-[#0EFF7B] transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </Listbox.Button>
                {showError && (
                  <p className="text-red-500 text-xs mt-1">{error}</p>
                )}
                <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[9999] border border-gray-300 dark:border-[#3C3C3C] scrollbar-hide focus:outline-none">
                  {frequencyOptions.map((option) => (
                    <Listbox.Option
                      key={option}
                      value={option}
                      className={({ active, selected: isSelected }) =>
                        `
                        cursor-pointer select-none py-2 px-3 text-sm font-[Helvetica] flex items-center
                        ${active ? "bg-[#0EFF7B33] text-[#0EFF7B]" : "text-black dark:text-white"}
                        ${isSelected ? "bg-[#0EFF7B] bg-opacity-20 text-[#0EFF7B] font-medium" : ""}
                        hover:bg-[#0EFF7B33] hover:text-[#0EFF7B]
                      `
                      }
                    >
                      {({ selected: isSelected }) => (
                        <>
                          <span
                            className={`mr-2 ${isSelected ? "text-[#0EFF7B]" : ""}`}
                          >
                            {isSelected ? "✓" : ""}
                          </span>
                          {option}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </>
            )}
          </Listbox>
        </div>
      );
    },
    [handleFieldBlur, validationErrors, touchedFields],
  );

  const PatientNameDropdown = useCallback(
    () => (
      <div className="relative">
        <label className="block text-sm font-medium mb-1 text-black dark:text-white">
          Patient Name <span className="text-red-500 ml-1">*</span>
        </label>
        <Listbox
          value={patientInfo.patientName}
          onChange={(value) => handlePatientFieldChange("patientName", value)}
        >
          {({ open }) => (
            <>
              <Listbox.Button
                className={`
                relative w-full h-[33.5px] px-3 pr-8 rounded-[8.38px] border-[1.05px]
                border-gray-300 dark:border-[#3C3C3C] bg-gray-100 dark:bg-black
                text-black dark:text-white text-left text-sm leading-none
                shadow-[0_0_2.09px_#0EFF7B] outline-none
                transition-all duration-300 font-[Helvetica]
                ${open ? "border-[#0EFF7B] shadow-[0_0_4px_#0EFF7B]" : ""}
                ${!patientInfo.patientName ? "text-gray-500" : ""}
              `}
              >
                <span className="block truncate">
                  {patientInfo.patientName || "Select patient name"}
                </span>
                <span className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
                  <ChevronDown
                    className={`h-4 w-4 text-[#0EFF7B] transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </Listbox.Button>
              <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[9999] border border-gray-300 dark:border-[#3C3C3C] scrollbar-hide focus:outline-none">
                {patientNames.length > 0 ? (
                  patientNames.map((name) => (
                    <Listbox.Option
                      key={name}
                      value={name}
                      className={({ active, selected }) =>
                        `
                        cursor-pointer select-none py-2 px-3 text-sm font-[Helvetica]
                        ${active ? "bg-[#0EFF7B33] text-[#0EFF7B]" : "text-black dark:text-white"}
                        ${selected ? "bg-[#0EFF7B] bg-opacity-20 text-[#0EFF7B] font-medium" : ""}
                        hover:bg-[#0EFF7B33] hover:text-[#0EFF7B]
                      `
                      }
                    >
                      {name}
                    </Listbox.Option>
                  ))
                ) : (
                  <div className="py-2 px-3 text-sm text-gray-500 text-center">
                    No patients found
                  </div>
                )}
              </Listbox.Options>
            </>
          )}
        </Listbox>
        {!patientInfo.patientName && touchedFields.patient && (
          <p className="text-red-500 text-xs mt-1">Patient name is required</p>
        )}
      </div>
    ),
    [patientInfo.patientName, patientNames, handlePatientFieldChange, touchedFields],
  );

  const PatientIDDropdown = useCallback(
    () => (
      <div className="relative">
        <label className="block text-sm font-medium mb-1 text-black dark:text-white">
          Patient ID <span className="text-red-500 ml-1">*</span>
        </label>
        <Listbox
          value={patientInfo.patientID}
          onChange={(value) => handlePatientFieldChange("patientID", value)}
        >
          {({ open }) => (
            <>
              <Listbox.Button
                className={`
                relative w-full h-[33.5px] px-3 pr-8 rounded-[8.38px] border-[1.05px]
                border-gray-300 dark:border-[#3C3C3C] bg-gray-100 dark:bg-black
                text-black dark:text-white text-left text-sm leading-none
                shadow-[0_0_2.09px_#0EFF7B] outline-none
                transition-all duration-300 font-[Helvetica]
                ${open ? "border-[#0EFF7B] shadow-[0_0_4px_#0EFF7B]" : ""}
                ${!patientInfo.patientID ? "text-gray-500" : ""}
              `}
              >
                <span className="block truncate">
                  {patientInfo.patientID || "Select patient ID"}
                </span>
                <span className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
                  <ChevronDown
                    className={`h-4 w-4 text-[#0EFF7B] transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </Listbox.Button>
              <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[9999] border border-gray-300 dark:border-[#3C3C3C] scrollbar-hide focus:outline-none">
                {patientIDs.length > 0 ? (
                  patientIDs.map((id) => (
                    <Listbox.Option
                      key={id}
                      value={id}
                      className={({ active, selected }) =>
                        `
                        cursor-pointer select-none py-2 px-3 text-sm font-[Helvetica]
                        ${active ? "bg-[#0EFF7B33] text-[#0EFF7B]" : "text-black dark:text-white"}
                        ${selected ? "bg-[#0EFF7B] bg-opacity-20 text-[#0EFF7B] font-medium" : ""}
                        hover:bg-[#0EFF7B33] hover:text-[#0EFF7B]
                      `
                      }
                    >
                      {id}
                    </Listbox.Option>
                  ))
                ) : (
                  <div className="py-2 px-3 text-sm text-gray-500 text-center">
                    No patient IDs found
                  </div>
                )}
              </Listbox.Options>
            </>
          )}
        </Listbox>
        {!patientInfo.patientID && touchedFields.patient && (
          <p className="text-red-500 text-xs mt-1">Patient ID is required</p>
        )}
      </div>
    ),
    [patientInfo.patientID, patientIDs, handlePatientFieldChange, touchedFields],
  );

  const DepartmentDropdown = useCallback(
    () => (
      <div className="relative">
        <label className="block text-sm font-medium mb-1 text-black dark:text-white">
          Department
        </label>
        <Listbox
          value={patientInfo.department}
          onChange={(value) => handlePatientFieldChange("department", value)}
        >
          {({ open }) => (
            <>
              <Listbox.Button
                className={`
                relative w-full h-[33.5px] px-3 pr-8 rounded-[8.38px] border-[1.05px]
                border-gray-300 dark:border-[#3C3C3C] bg-gray-100 dark:bg-black
                text-black dark:text-white text-left text-sm leading-none
                shadow-[0_0_2.09px_#0EFF7B] outline-none
                transition-all duration-300 font-[Helvetica]
                ${open ? "border-[#0EFF7B] shadow-[0_0_4px_#0EFF7B]" : ""}
                ${!patientInfo.department ? "text-gray-500" : ""}
              `}
              >
                <span className="block truncate">
                  {patientInfo.department || "Select department"}
                </span>
                <span className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
                  <ChevronDown
                    className={`h-4 w-4 text-[#0EFF7B] transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </Listbox.Button>
              <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[9999] border border-gray-300 dark:border-[#3C3C3C] scrollbar-hide focus:outline-none">
                {departmentNames.length > 0 ? (
                  departmentNames.map((dept) => (
                    <Listbox.Option
                      key={dept}
                      value={dept}
                      className={({ active, selected }) =>
                        `
                        cursor-pointer select-none py-2 px-3 text-sm font-[Helvetica]
                        ${active ? "bg-[#0EFF7B33] text-[#0EFF7B]" : "text-black dark:text-white"}
                        ${selected ? "bg-[#0EFF7B] bg-opacity-20 text-[#0EFF7B] font-medium" : ""}
                        hover:bg-[#0EFF7B33] hover:text-[#0EFF7B]
                      `
                      }
                    >
                      {dept}
                    </Listbox.Option>
                  ))
                ) : (
                  <div className="py-2 px-3 text-sm text-gray-500 text-center">
                    No departments found
                  </div>
                )}
              </Listbox.Options>
            </>
          )}
        </Listbox>
      </div>
    ),
    [patientInfo.department, departmentNames, handlePatientFieldChange],
  );

  // ================ TC-069: Debug Component (Remove in production) ================
  const StockDebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    const uniqueMedicineCount = [...new Set(stockData.map(s => s.product_name).filter(Boolean))].length;
    const totalStockItems = stockData.length;
    
    return (
      <div className="mt-4 p-3 border border-yellow-500 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-xs">
        <details>
          <summary className="font-bold text-yellow-700 dark:text-yellow-300 cursor-pointer">
            Debug: Stock Information (TC-069)
          </summary>
          <div className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
            <p>Total stock items from API: {totalStockItems}</p>
            <p>Unique medicine names: {uniqueMedicineCount}</p>
            <p>Medicines in dropdown: {medicineNames.length}</p>
            <p>Loading: {stockLoading ? 'Yes' : 'No'}</p>
            <div className="max-h-40 overflow-auto mt-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-yellow-500">
                    <th className="text-left">Medicine Name</th>
                    <th className="text-left">Dosage</th>
                    <th className="text-left">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.slice(0, 20).map((item, idx) => (
                    <tr key={idx} className="border-b border-yellow-500/30">
                      <td>{item.product_name}</td>
                      <td>{item.dosage}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                  {stockData.length > 20 && (
                    <tr>
                      <td colSpan="3" className="text-center py-1">
                        ... and {stockData.length - 20} more items
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      </div>
    );
  };
  // ================ End of Debug Component ================

  return (
    <div className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white rounded-xl p-4 w-full max-w-[2500px] mx-auto flex flex-col relative font-[Helvetica]">
      {/* Gradient Background and Border */}
      <div
        className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
          zIndex: 0,
        }}
      ></div>
      <div
        className="absolute inset-0 rounded-[10px] pointer-events-none"
        style={{
          padding: "2px",
          background:
            "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          zIndex: 0,
        }}
      ></div>

      {/* Search Bar with Individual Dropdowns */}
      <div className="mb-6 mt-7 flex flex-row justify-end items-end gap-2 flex-wrap max-w-full relative">
        <div className="flex-1 min-w-[180px] max-w-[350px] lg:max-w-[400px] relative">
          <label className="block text-sm font-medium mb-1 text-black dark:text-white">
            Search Patient
          </label>
          <input
            type="text"
            placeholder="Search patient name or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredPatients.length > 0) {
                handlePatientSelect(filteredPatients[0]);
              }
            }}
            className="
              w-full
              h-[34px]
              p-[4.19px_16.75px]
              rounded
              border-[1.05px]
              border-[#0EFF7B1A]
              bg-[#0EFF7B1A]
              text-black dark:text-white
              placeholder:text-gray-500 dark:placeholder:text-white/70
              focus:outline-none
              focus:border-[#0EFF7B]
              transition-all
              font-[Helvetica]
            "
          />
          {searchQuery && filteredPatients.length > 0 && (
            <div className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[9999] border border-gray-300 dark:border-[#3C3C3C] scrollbar-hide focus:outline-none">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="
                    cursor-pointer select-none py-2 px-3 text-sm font-[Helvetica]
                    text-black dark:text-white
                    hover:bg-[#0EFF7B33] hover:text-[#0EFF7B]
                  "
                >
                  {patient.full_name} ({patient.patient_unique_id})
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="min-w-[120px] w-[160px] lg:w-[180px] relative">
            <PatientNameDropdown />
          </div>
          <div className="min-w-[120px] w-[160px] lg:w-[180px] relative">
            <PatientIDDropdown />
          </div>
        </div>
      </div>

      {/* Patient Profile Section - TC-068: Temperature unit fixed to show °C */}

{/* Patient Profile Section - TC-068: Temperature unit fixed to show °C */}
<div className="mb-8 p-4 sm:p-5 bg-white dark:bg-black flex flex-col lg:flex-row items-center justify-between text-black dark:text-white font-[Helvetica] max-w-full relative">
  <div className="flex flex-col items-center text-center w-full lg:w-[146px] mb-4 lg:mb-0">
    <div className="rounded-full w-[94px] h-[94px] mb-3 shadow-[#0EFF7B4D] border border-[#0EFF7B] overflow-hidden bg-gray-100">
      {fullPatient?.photo_url ? (
        <img
          src={fullPatient.photo_url}
          alt={fullPatient.full_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={`w-full h-full flex items-center justify-center bg-gray-200 ${fullPatient?.photo_url ? "hidden" : "flex"}`}
      >
        <svg
          className="w-[60px] h-[60px] text-[#0EFF7B]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z" />
        </svg>
      </div>
    </div>
    <span className="text-[#0EFF7B] text-[18px] font-semibold font-[Helvetica]">
      {fullPatient?.gender === "Female"
        ? "Mrs."
        : fullPatient?.gender === "Male"
          ? "Mr."
          : ""}{" "}
      {fullPatient?.full_name ||
        patientInfo.patientName ||
        "Select a patient"}
    </span>
    <span className="text-[14px] text-gray-500 dark:text-gray-400 font-[Helvetica]">
      ID:{" "}
      {fullPatient?.patient_unique_id || patientInfo.patientID || "N/A"}
    </span>
    <span className="text-[14px] text-gray-500 dark:text-gray-400 font-[Helvetica]">
      {fullPatient?.email_address || "N/A"}
    </span>
  </div>
  <div className="hidden lg:block h-[120px] w-[1.5px] bg-[#0EFF7B] mx-4"></div>
  <div className="flex-1 flex flex-col mt-4 lg:mt-0">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-5 text-[14px]">
      {[
        { label: "Gender", value: fullPatient?.gender || "N/A" },
        {
          label: "Age",
          value: fullPatient?.age ? `${fullPatient.age}` : "N/A",
        },
        {
          label: "Blood Group",
          value: fullPatient?.blood_group || "N/A",
        },
        {
          label: "Department",
          value:
            fullPatient?.department || patientInfo.department || "N/A",
        },
        { label: "Bed Number", value: fullPatient?.room_number || "N/A" },
        {
          label: "Consultant type",
          value: fullPatient?.consultation_type || "N/A",
        },
      ].map((item, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <span className="w-[100px] sm:w-[110px] h-[18px] font-[Helvetica] text-[15px] leading-[100%] text-center text-[#0EFF7B]">
            {item.label}
          </span>
          <div className="w-[100px] sm:w-[110px] h-[16px] font-[Helvetica] text-[13px] leading-[100%] text-center bg-white dark:bg-black text-black dark:text-white mt-1 px-2 py-1 rounded">
            {item.value}
          </div>
        </div>
      ))}
    </div>
    <div className="flex justify-end mt-5">
      <button
        onClick={() => {
          if (!patientDbId) {
            errorToast("Patient not selected properly");
            return;
          }
          navigate(`/patients/profile/${patientDbId}`);
        }}
        className="relative group flex items-center justify-between w-[220px] h-[38px] bg-[#0EFF7B1A] rounded-[4px] px-3 text-sm text-black dark:text-white hover:bg-[#0EFF7B] hover:text-white transition font-[Helvetica]"
      >
        <span className="text-[15px] w-[calc(100%-34px)]">
          View more information
        </span>
        <div className="w-[18px] h-[18px] bg-[#0EFF7B] rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="white"
            className="w-[10px] h-[10px]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span
            className="absolute top-[70px] left-1/2 -translate-x-1/2 whitespace-nowrap
              px-3 py-1 text-xs rounded-md shadow-md
              bg-white dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
              transition-all duration-150"
          >
            View more
          </span>
        </div>
      </button>
    </div>
  </div>
  <div className="hidden lg:block h-[120px] w-[1.5px] bg-[#0EFF7B] mx-4"></div>
  {/* ================ TC-068 FIX: Temperature in °C with Height added ================ */}
  <div className="text-[14px] flex justify-center gap-3 sm:gap-6 mt-4 lg:mt-0">
    <div className="flex flex-col items-center space-y-3">
      <div className="flex flex-col items-center space-y-1">
        <span className="text-black dark:text-white font-[Helvetica] text-[14px]">
          Blood Pressure
        </span>
        <span className="text-[#0EFF7B] font-semibold font-[Helvetica] text-[14px]">
          {fullPatient?.blood_pressure || "N/A"}{" "}
          <span className="text-black dark:text-white">mmHg</span>
        </span>
      </div>
      <div className="flex flex-col items-center space-y-1">
        <span className="text-black dark:text-white font-[Helvetica] text-[14px]">
          Temperature
        </span>
        <span className="text-[#0EFF7B] font-semibold font-[Helvetica] text-[14px]">
          {formatTemperature(fullPatient?.body_temperature)}
        </span>
      </div>
    </div>
    <div className="flex flex-col items-center space-y-3">
      <div className="flex flex-col items-center space-y-1">
        <span className="text-black dark:text-white font-[Helvetica] text-[14px]">
          Weight
        </span>
        <span className="text-[#0EFF7B] font-semibold font-[Helvetica] text-[14px]">
          {fullPatient?.weight_in_kg || "N/A"}{" "}
          <span className="text-black dark:text-white">kg</span>
        </span>
      </div>
      {/* ================ HEIGHT ADDED HERE - RIGHT SIDE OF WEIGHT ================ */}
      <div className="flex flex-col items-center space-y-1">
        <span className="text-black dark:text-white font-[Helvetica] text-[14px]">
          Height
        </span>
        <span className="text-[#0EFF7B] font-semibold font-[Helvetica] text-[14px]">
          {fullPatient?.height_in_cm ? `${fullPatient.height_in_cm} cm` : "N/A"}
        </span>
      </div>
      {/* ================ END HEIGHT ADDITION ================ */}
    </div>
  </div>
  {/* ================ End of TC-068 FIX ================ */}
</div>

      {/* ================ MRI Warning Message ================ */}
      {pendingMRI && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-500 rounded-lg text-yellow-800 dark:text-yellow-200">
          <p className="text-sm font-medium">
            ⚠️ This patient already has an MRI in {pendingMRI.status} stage.
            {labTests.some(test => test.labTest?.toLowerCase().includes('mri')) && 
              " Cannot allocate another MRI."}
          </p>
        </div>
      )}
      {/* ================ End of MRI Warning ================ */}

      {/* Medicine Allocation Form */}
      <div className="mt-8 mb-4 rounded-xl p-4 w-full max-w-[100%] sm:max-w-[900px] lg:max-w-[1400px] mx-auto flex flex-col relative bg-gray-100 dark:bg-black text-black dark:text-white border border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0000001F]">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-black dark:text-[#FFFFFF] font-[Helvetica]">
          Medicine Allocation
        </h2>
        
        {/* ================ TC-069: Stock status indicator ================ */}
        <div className="mb-2 flex justify-between items-center">
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Available medicines: </span>
            <span className="font-bold text-[#0EFF7B]">{medicineNames.length}</span>
            {stockLoading && (
              <span className="ml-2 text-xs text-gray-500">
                <Loader2 className="inline h-3 w-3 animate-spin" /> Loading...
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={fetchStock}
            className="text-xs text-[#0EFF7B] hover:underline flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh Stock
          </button>
        </div>
        {/* ================ End of TC-069 indicator ================ */}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <PatientNameDropdown />
            <PatientIDDropdown />
            <DepartmentDropdown />
          </div>

          <div className="flex flex-col gap-5">
            {medicineData.map((med, index) => (
              <div
                key={med.id}
                className="border border-gray-600 rounded-lg p-4 bg-[#0EFF7B0A] relative"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-[#0EFF7B]">
                    Medicine #{index + 1}
                  </h4>
                  <div className="flex gap-2">
                    {index === medicineData.length - 1 && (
                      <button
                        type="button"
                        onClick={addMedicineEntry}
                        className="relative group text-green-500 hover:text-green-600 text-xl"
                      >
                        +
                        <span
                          className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                    px-3 py-1 text-xs rounded-md shadow-md
                    bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                    transition-all duration-150"
                        >
                          Add
                        </span>
                      </button>
                    )}
                    {medicineData.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicineEntry(med.id)}
                        className="relative group text-red-500 hover:text-red-700 text-xl"
                      >
                        ×
                        <span
                          className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                    px-3 py-1 text-xs rounded-md shadow-md
                    bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                    transition-all duration-150"
                        >
                          Close
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* ================ TC-069: Using updated MedicineDropdown that shows ALL medicines ================ */}
                  <MedicineDropdown
                    label="Medicine Name"
                    name="medicineName"
                    value={med.medicineName}
                    options={medicineNames}
                    index={index}
                  />
                  {/* ================ End of TC-069 ================ */}
                  
                  <DosageDropdown
                    label="Dosage"
                    name="dosage"
                    value={med.dosage}
                    medicineName={med.medicineName}
                    index={index}
                  />
                  <CustomInput
                    label="Quantity"
                    name="quantity"
                    value={med.quantity}
                    index={index}
                    placeholder="Auto-calculated"
                    type="number"
                    readOnly={true}
                    required={true}
                  />
                  <MultiFrequencyDropdown
                    index={index}
                    selected={med.frequency}
                    onChange={(selected) =>
                      handleFrequencyChange(index, selected)
                    }
                  />
                  <CustomInput
                    label="Duration"
                    name="duration"
                    value={med.duration}
                    index={index}
                    placeholder="e.g. 5 days"
                    required={true}
                  />
                  <CustomInput
                    label="Time"
                    name="time"
                    value={med.time}
                    index={index}
                    placeholder="e.g. 8:00 AM"
                    required={true}
                  />
                </div>
                {med.medicineName && med.dosage && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Available stock:{" "}
                    </span>
                    <span
                      className={`font-medium ${getAvailableQuantity(med.medicineName, med.dosage) > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {getAvailableQuantity(med.medicineName, med.dosage)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Lab Tests Section */}
          <div className="mt-6">
            <h4 className="font-medium text-[#0EFF7B] mb-2">Lab Tests</h4>
            {labTests.map((test, index) => (
              <div key={test.id} className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1 text-black dark:text-white">
                      Lab Test
                    </label>
                    <Listbox
                      value={test.labTest}
                      onChange={(selectedValue) => {
                        const fakeEvent = {
                          target: { name: "labTest", value: selectedValue },
                        };
                        handleInputChange(fakeEvent, index, "labTest");
                      }}
                      disabled={loadingTestTypes}
                    >
                      {({ open }) => (
                        <>
                          <Listbox.Button
                            className={`
                  relative w-full h-[33.5px] px-3 pr-8 rounded-[8.38px] border-[1.05px]
                  border-gray-300 dark:border-[#3C3C3C] 
                  ${loadingTestTypes ? "bg-gray-200 dark:bg-gray-800 cursor-not-allowed" : "bg-gray-100 dark:bg-black"}
                  text-black dark:text-white text-left text-sm leading-none
                  shadow-[0_0_2.09px_#0EFF7B] outline-none
                  transition-all duration-300 font-[Helvetica]
                  ${open ? "border-[#0EFF7B] shadow-[0_0_4px_#0EFF7B]" : ""}
                  ${!test.labTest ? "text-gray-500" : ""}
                  ${loadingTestTypes ? "opacity-70" : ""}
                `}
                          >
                            <span className="block truncate">
                              {loadingTestTypes
                                ? "Loading test types..."
                                : test.labTest || "Select lab test"}
                            </span>
                            <span className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
                              {loadingTestTypes ? (
                                <div className="h-4 w-4 border-2 border-[#0EFF7B] border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <ChevronDown
                                  className={`h-4 w-4 text-[#0EFF7B] transition-transform duration-200 ${
                                    open ? "rotate-180" : ""
                                  }`}
                                />
                              )}
                            </span>
                          </Listbox.Button>
                          {!loadingTestTypes && (
                            <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-[9999] border border-gray-300 dark:border-[#3C3C3C] scrollbar-hide focus:outline-none">
                              {testTypes.length > 0 ? (
                                testTypes.map((testType) => {
                                  // Check if this test type has a duplicate error
                                  const duplicateError = validationErrors[`lab_duplicate_${testType}`];
                                  
                                  return (
                                    <Listbox.Option
                                      key={testType}
                                      value={testType}
                                      disabled={!!duplicateError}
                                      className={({ active, selected, disabled }) =>
                                        `
                                        cursor-pointer select-none py-2 px-3 text-sm font-[Helvetica]
                                        ${active && !disabled ? "bg-[#0EFF7B33] text-[#0EFF7B]" : ""}
                                        ${selected ? "bg-[#0EFF7B] bg-opacity-20 text-[#0EFF7B] font-medium" : ""}
                                        ${disabled ? "opacity-50 cursor-not-allowed text-gray-500" : "text-black dark:text-white"}
                                        hover:bg-[#0EFF7B33] hover:text-[#0EFF7B]
                                      `
                                      }
                                    >
                                      <div className="flex justify-between items-center">
                                        <span>{testType}</span>
                                        {duplicateError && (
                                          <span className="text-xs text-red-500 ml-2">
                                            Already exists
                                          </span>
                                        )}
                                      </div>
                                    </Listbox.Option>
                                  );
                                })
                              ) : (
                                <div className="py-2 px-3 text-sm text-gray-500 text-center">
                                  No test types available
                                </div>
                              )}
                            </Listbox.Options>
                          )}
                        </>
                      )}
                    </Listbox>
                    {/* Show duplicate error for this specific lab test */}
                    {test.labTest && validationErrors[`lab_duplicate_${test.labTest}`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors[`lab_duplicate_${test.labTest}`]}
                      </p>
                    )}
                  </div>
                </div>
                {index === labTests.length - 1 && (
                  <button
                    type="button"
                    onClick={addLabTestEntry}
                    className="relative group text-green-500 mt-5 hover:text-green-600 text-xl"
                  >
                    +
                    <span
                      className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
          px-3 py-1 text-xs rounded-md shadow-md
          bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
          transition-all duration-150"
                    >
                      Add
                    </span>
                  </button>
                )}
                {labTests.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLabTestEntry(test.id)}
                    className="relative group text-red-500 mt-5 hover:text-red-700 text-xl"
                  >
                    ×
                    <span
                      className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
          px-3 py-1 text-xs rounded-md shadow-md
          bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
          transition-all duration-150"
                    >
                      Close
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Patient selection error */}
          {touchedFields.patient && !patientDbId && (
            <p className="text-red-500 text-sm mt-2">Please select a patient</p>
          )}

          {/* MRI Validation Error */}
          {validationErrors.mri && (
            <p className="text-red-500 text-sm mt-2">{validationErrors.mri}</p>
          )}

          <div className="mt-5 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading || !patientDbId}
              className="px-4 py-2 rounded bg-[#0EFF7B] text-black font-semibold hover:bg-[#05c860] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Allocating..." : "Allocate Medicine"}
            </button>
          </div>
        </form>
      </div>

      {/* Medicine Allocation History */}
      <div className="mt-8 mb-4 rounded-xl p-4 w-full max-w-[100%] sm:max-w-[900px] lg:max-w-[1400px] mx-auto flex flex-col relative bg-gray-100 dark:bg-black text-black dark:text-white border border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0000001F]">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-black dark:text-[#FFFFFF] font-[Helvetica]">
          Medicine allocation history
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse font-[Helvetica] text-[13px] sm:text-[14px]">
            <thead className="text-[#0EFF7B] font-[Helvetica] dark:bg-[#091810] border-b border-gray-300 dark:border-gray-700">
              <tr className="text-left text-[#0EFF7B] border border-gray-300 dark:border-[#3C3C3C] text-center">
                <th className="py-1.5 px-2 sm:px-3">Patient Name</th>
                <th className="py-1.5 px-2 sm:px-3">Patient ID</th>
                <th className="py-1.5 px-2 sm:px-3">Doctor</th>
                <th className="py-1.5 px-2 sm:px-3">Date</th>
                <th className="py-1.5 px-2 sm:px-3">Medicine</th>
                <th className="py-1.5 px-2 sm:px-3">Dosage</th>
                <th className="py-1.5 px-2 sm:px-3">Duration</th>
                <th className="py-1.5 px-2 sm:px-3">Frequency</th>
                <th className="py-1.5 px-2 sm:px-3">Lab Tests</th>
                <th className="py-1.5 px-2 sm:px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicineHistory.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="border border-gray-200 dark:border-gray-700 text-center text Black dark:text-[#FFFFFF] hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D] bg-gray-100 dark:bg-black"
                >
                  <td className="py-1.5 px-2 sm:px-3">
                    {displayValue(item.patient_name)}
                  </td>
                  <td className="py-1.5 px-2 sm:px-3">
                    {displayValue(item.patient_id)}
                  </td>
                  <td className="py-1.5 px-2 sm:px-3">
                    {displayValue(item.doctor)}
                  </td>
                  <td className="py-1.5 px-2 sm:px-3">
                    {displayValue(item.allocation_date)}
                  </td>
                  <td className="py-1.5 px-2 sm:px-3">
                    {displayValue(item.medicine_name)}
                  </td>
                  <td className="py-1.5 px-2 sm:px-3">
                    {displayValue(item.dosage)}
                  </td>
                  <td className="py-1.5 px-2 sm:px-3">
                    {displayValue(item.duration)}
                  </td>
                  <td className="py-1.5 px-2 sm:px-3">
                    {item.frequency && item.frequency.length > 0 ? (
                      <span className="text-[#0EFF7B] font-medium">
                        {item.frequency.join(", ")}
                      </span>
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 sm:px-3">
                    {item.lab_test_types ? (
                      <span className="text-[#0EFF7B] font-medium">
                        {item.lab_test_types}
                      </span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => handleEditMedicine(item)}
                        className="relative group text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <Edit size={16} />
                        <span
                          className="absolute bottom-5 left-1/4 -translate-x-1/2 whitespace-nowrap
                          px-3 py-1 text-xs rounded-md shadow-md
                          bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                          transition-all duration-150"
                        >
                          Edit
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(item)}
                        className="relative group text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                        <span
                          className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap
                          px-3 py-1 text-xs rounded-md shadow-md
                          bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                          transition-all duration-150"
                        >
                          Delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {medicineHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No medicine allocation history found for this patient.
            </div>
          )}
        </div>
      </div>

      {/* ================ TC-069: Debug Component (Remove in production) ================ */}
      <StockDebugInfo />
      {/* ================ End of Debug Component ================ */}

      {isEditPopupOpen && editingMedicine && (
        <EditMedicineAllocationPopup
          onClose={() => {
            setIsEditPopupOpen(false);
            setEditingMedicine(null);
          }}
          medicineData={editingMedicine}
          onUpdate={handleUpdateMedicine}
        />
      )}

      {isDeletePopupOpen && deletingMedicine && (
        <DeleteMedicinePopup
          onClose={() => {
            setIsDeletePopupOpen(false);
            setDeletingMedicine(null);
          }}
          onConfirm={handleConfirmDelete}
          medicineName={deletingMedicine.medicine_name}
        />
      )}
    </div>
  );
}