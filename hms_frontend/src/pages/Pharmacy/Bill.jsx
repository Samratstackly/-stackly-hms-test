// import React, { useState, useEffect } from "react";
// import { Search, Trash2, Plus, Calendar } from "lucide-react";
// import { Listbox } from "@headlessui/react";
// import api from "../../utils/axiosConfig";
// import { successToast, errorToast } from "../../components/Toast";

// const Bill = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [patients, setPatients] = useState([]);
//   const [filteredPatients, setFilteredPatients] = useState([]);
//   const [selectedPatientId, setSelectedPatientId] = useState(null);
//   const [patientInfo, setPatientInfo] = useState({
//     patientName: "",
//     patientID: "",
//     doctorName: "",
//     paymentType: "Full Payment",
//     paymentStatus: "Paid",
//     paymentMode: "Cash",
//   });
//   const [staffInfo, setStaffInfo] = useState({ staffName: "", staffID: "" });
//   const [fullPatient, setFullPatient] = useState(null);
//   const [billingItems, setBillingItems] = useState([]);
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [generatingBill, setGeneratingBill] = useState(false);
//   const [doctors, setDoctors] = useState([]);
//   const [duplicateError, setDuplicateError] = useState("");
//   const [medicineLookup, setMedicineLookup] = useState({});
//   const [itemCodeInputs, setItemCodeInputs] = useState({});

//   const paymentTypes = [
//     "Full Payment",
//     "Partial Payment",
//     "Insurance",
//     "Credit",
//   ];
//   const paymentStatuses = ["Paid", "Pending", "Overdue", "Refunded"];
//   const paymentModes = [
//     "Cash",
//     "Credit Card",
//     "Debit Card",
//     "UPI",
//     "Bank Transfer",
//     "Insurance Claim",
//   ];

//   useEffect(() => {
//     fetchPatients();
//     fetchStaffInfo();
//   }, []);

//   useEffect(() => {
//     if (!searchQuery.trim()) {
//       setFilteredPatients(patients);
//     } else {
//       setFilteredPatients(
//         patients.filter(
//           (p) =>
//             p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             p.patient_unique_id
//               ?.toLowerCase()
//               .includes(searchQuery.toLowerCase())
//         )
//       );
//     }
//   }, [searchQuery, patients]);

//   const fetchPatients = async () => {
//     try {
//       const res = await api.get("/medicine_allocation/edit");
//       let list = [];
//       if (Array.isArray(res.data)) list = res.data;
//       else if (res.data.patients) list = res.data.patients;
//       setPatients(list);
//     } catch (err) {
//       console.error("Failed to load patients:", err);
//       if (err.response?.status === 401) {
//         errorToast("Unauthorized access. Please log in again.");
//       } else if (err.response?.status === 404) {
//         errorToast("Patients data not found.");
//       } else if (err.response?.status === 500) {
//         errorToast("Server error. Please try again later.");
//       } else {
//         errorToast("Failed to load patients");
//       }
//     }
//   };

//   const fetchStaffInfo = async () => {
//     try {
//       const res = await api.get("/profile/me/");
//       setStaffInfo({
//         staffName: res.data.profile.full_name || "Unknown Staff",
//         staffID: res.data.profile.employee_id || "N/A",
//       });
//     } catch (err) {
//       console.error("Failed to load staff info:", err);
//       if (err.response?.status === 401) {
//         errorToast("Unauthorized access. Please log in again.");
//       } else if (err.response?.status === 404) {
//         errorToast("Profile not found.");
//       } else if (err.response?.status === 500) {
//         errorToast("Server error. Please try again later.");
//       } else {
//         setStaffInfo({ staffName: "Unknown Staff", staffID: "N/A" });
//       }
//     }
//   };

//   const fetchPatientDetails = async (uniqueId) => {
//     try {
//       const res = await api.get(`/patients/${uniqueId}`);
//       setFullPatient(res.data);
//     } catch (err) {
//       console.error("Failed to load patient details:", err);
//       if (err.response?.status === 401) {
//         errorToast("Unauthorized access. Please log in again.");
//       } else if (err.response?.status === 404) {
//         errorToast("Patient not found.");
//       } else if (err.response?.status === 500) {
//         errorToast("Server error. Please try again later.");
//       }
//     }
//   };

//   const formatDateToDisplay = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     const day = date.getDate().toString().padStart(2, "0");
//     const month = (date.getMonth() + 1).toString().padStart(2, "0");
//     const year = date.getFullYear();
//     return `${day}.${month}.${year}`;
//   };

//   const getTodayDate = () => {
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = (today.getMonth() + 1).toString().padStart(2, "0");
//     const day = today.getDate().toString().padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   const fetchBillingItems = async (patientId, fromDate = "", toDate = "") => {
//     if (!patientId) return;
//     setLoading(true);
//     try {
//       let url = `/pharmacy-billing/${patientId}/`;
//       const params = new URLSearchParams();

//       if (fromDate) params.append("date_from", fromDate);
//       if (toDate) params.append("date_to", toDate);

//       if (params.toString()) {
//         url += `?${params.toString()}`;
//       }

//       const res = await api.get(url);

//       const medicineItems = (res.data.items || [])
//         .filter(
//           (item) => item.medicine_name || item.name_of_drug
//         )
//         .map((item, i) => ({
//           id: item.allocation_id || Date.now() + i,
//           allocation_id: item.allocation_id,
//           sNo: (i + 1).toString(),
//           itemCode: item.item_code || "N/A",
//           name: item.medicine_name || item.name_of_drug || "",
//           rackNo: item.rack_no || "",
//           shelfNo: item.shelf_no || "",
//           quantity: item.quantity ? String(item.quantity) : "0",
//           unitPrice: item.unit_price ? String(item.unit_price) : "0.00",
//           discount: "0%",
//           tax: "10%",
//           total:
//             item.unit_price && item.quantity
//               ? (item.unit_price * item.quantity).toFixed(2)
//               : "0.00",
//           doctorName: item.doctor_name || "N/A",
//           allocationDate: item.allocation_date || "",
//           frequency: item.frequency || "",
//         }));

//       setBillingItems(medicineItems);

//       if (medicineItems.length === 0) {
//         if (fromDate || toDate) {
//           errorToast(
//             "No medicine allocations found for the selected date range"
//           );
//         } else {
//           errorToast("No medicine allocations found for this patient");
//         }
//       }
//     } catch (err) {
//       console.error("Error loading medicines:", err);
//       setBillingItems([]);

//       if (err.response?.status === 401) {
//         errorToast("Unauthorized access. Please log in again.");
//       } else if (err.response?.status === 404) {
//         if (fromDate || toDate) {
//           errorToast(
//             "No medicine allocations found for the selected date range"
//           );
//         } else {
//           errorToast("No medicine allocations found for this patient");
//         }
//       } else if (err.response?.status === 500) {
//         errorToast("Server error. Please try again later.");
//       } else {
//         errorToast("Failed to load medicine allocations");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePatientSelect = async (patient) => {
//     setPatientInfo({
//       patientName: patient.full_name || "",
//       patientID: patient.patient_unique_id || "",
//       doctorName: "",
//       paymentType: "Full Payment",
//       paymentStatus: "Paid",
//       paymentMode: "Cash",
//     });
//     setSelectedPatientId(patient.id);
//     setSearchQuery("");
//     setDateFrom("");
//     setDateTo("");
//     await fetchPatientDetails(patient.patient_unique_id);
//     await fetchBillingItems(patient.id);
//   };

//   const handleInputChange = (value, field) => {
//     setPatientInfo((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleDateChange = (type, value) => {
//     const today = getTodayDate();

//     if (type === "from") {
//       if (value > today) {
//         errorToast("'From' date cannot be in the future");
//         return;
//       }

//       if (dateTo && value > dateTo) {
//         errorToast("'From' date cannot be after 'To' date");
//         return;
//       }

//       setDateFrom(value);
//     } else if (type === "to") {
//       if (value > today) {
//         errorToast("'To' date cannot be in the future");
//         return;
//       }

//       if (dateFrom && value < dateFrom) {
//         errorToast("'To' date cannot be before 'From' date");
//         return;
//       }

//       setDateTo(value);
//     }

//     if (selectedPatientId) {
//       const newFromDate = type === "from" ? value : dateFrom;
//       const newToDate = type === "to" ? value : dateTo;
//       fetchBillingItems(selectedPatientId, newFromDate, newToDate);
//     }
//   };

//   const handleClearDates = () => {
//     setDateFrom("");
//     setDateTo("");
//     if (selectedPatientId) {
//       fetchBillingItems(selectedPatientId);
//     }
//   };

//   const handleAddMedicine = () => {
//     if (!selectedPatientId) {
//       errorToast("Please select a patient first");
//       return;
//     }

//     const newItem = {
//       id: Date.now(),
//       allocation_id: null,
//       sNo: (billingItems.length + 1).toString(),
//       itemCode: "",
//       name: "",
//       rackNo: "",
//       shelfNo: "",
//       quantity: "",
//       unitPrice: "",
//       discount: "0%",
//       tax: "10%",
//       total: "0.00",
//       doctorName: "",
//       allocationDate: new Date().toISOString().split("T")[0],
//       frequency: "",
//     };

//     setBillingItems((prev) => [...prev, newItem]);
//   };

//   const fetchMedicineDetails = async (itemCode) => {
//     if (!itemCode.trim() || itemCode.trim().length < 1) {
//       return null;
//     }

//     if (medicineLookup[itemCode]) return medicineLookup[itemCode];

//     try {
//       const res = await api.get(
//         `/medicine_allocation/medicine-by-code/${itemCode.trim()}`
//       );
//       const data = res.data;
//       setMedicineLookup((prev) => ({ ...prev, [itemCode]: data }));
//       return data;
//     } catch (err) {
//       if (err.response?.status === 401) {
//         errorToast("Unauthorized access. Please log in again.");
//       } else if (err.response?.status === 404) {
//         if (itemCode.trim().length > 0) {
//           errorToast(`No medicine found with item code: ${itemCode}`);
//         }
//       } else if (err.response?.status === 500) {
//         errorToast("Server error. Please try again later.");
//       } else {
//         if (itemCode.trim().length > 0) {
//           errorToast(`No medicine found with item code: ${itemCode}`);
//         }
//       }
//       return null;
//     }
//   };

//   useEffect(() => {
//     const fetchDebouncedCodes = async () => {
//       for (const [index, code] of Object.entries(itemCodeInputs)) {
//         if (code.trim() && code.trim().length >= 1) {
//           const idx = parseInt(index);
//           const details = await fetchMedicineDetails(code.trim());
//           if (details) {
//             setBillingItems((prev) => {
//               const updated = [...prev];
//               const item = updated[idx];

//               if (item.itemCode === code.trim()) {
//                 item.name = details.drug_name || "";
//                 item.rackNo = details.rack_no || "";
//                 item.shelfNo = details.shelf_no || "";
//                 item.unitPrice = details.unit_price
//                   ? String(details.unit_price)
//                   : "0.00";

//                 const qty = parseFloat(item.quantity) || 1;
//                 const price = parseFloat(item.unitPrice) || 0;
//                 const disc = parseFloat(item.discount.replace("%", "")) || 0;
//                 const tax = parseFloat(item.tax.replace("%", "")) || 10;

//                 const base = qty * price;
//                 const afterDisc = base - (base * disc) / 100;
//                 item.total = (afterDisc + (afterDisc * tax) / 100).toFixed(2);
//               }

//               return updated;
//             });
//           }
//         }
//       }
//     };

//     const timer = setTimeout(() => {
//       fetchDebouncedCodes();
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [itemCodeInputs]);

//   const handleBillingChange = async (index, field, value) => {
//     setDuplicateError("");

//     if (field === "itemCode") {
//       setItemCodeInputs(prev => ({
//         ...prev,
//         [index]: value
//       }));
//     }

//     setBillingItems((prev) => {
//       const updated = [...prev];
//       let item = { ...updated[index] };

//       if (field === "itemCode" && value.trim() !== item.itemCode) {
//         const duplicateIndex = updated.findIndex(
//           (it, i) => i !== index && it.itemCode === value.trim() && it.allocation_id !== item.allocation_id
//         );
//         if (duplicateIndex !== -1) {
//           setDuplicateError(`Duplicate item code "${value}" already exists.`);
//           return prev;
//         }

//         item.itemCode = value.trim();
//         if (value.trim() !== prev[index].itemCode) {
//           item.name = "";
//           item.rackNo = "";
//           item.shelfNo = "";
//           item.unitPrice = "0.00";
//           item.total = "0.00";
//         }
//       }

//       item[field] = value;

//       if ((field === "discount" || field === "tax") && value) {
//         const regex = /^(\d+(\.\d+)?%?|%?)$/;
//         if (!regex.test(value)) {
//           errorToast(
//             `${
//               field.charAt(0).toUpperCase() + field.slice(1)
//             } must be a number with optional %`
//           );
//           return prev;
//         }
//         if (!value.includes("%") && value !== "") item[field] = value + "%";
//       }

//       const qty = parseFloat(item.quantity) || 0;
//       const price = parseFloat(item.unitPrice) || 0;
//       const disc = parseFloat(item.discount.replace("%", "")) || 0;
//       const tax = parseFloat(item.tax.replace("%", "")) || 10;

//       const base = qty * price;
//       const afterDisc = base - (base * disc) / 100;
//       item.total = (afterDisc + (afterDisc * tax) / 100).toFixed(2);

//       updated[index] = item;
//       return updated;
//     });
//   };

//   const handleItemCodeBlur = async (index, value) => {
//     if (value.trim() && value.trim().length >= 1) {
//       const details = await fetchMedicineDetails(value.trim());
//       if (details) {
//         setBillingItems((prev) => {
//           const updated = [...prev];
//           const item = updated[index];

//           if (item.itemCode === value.trim()) {
//             item.name = details.drug_name || "";
//             item.rackNo = details.rack_no || "";
//             item.shelfNo = details.shelf_no || "";
//             item.unitPrice = details.unit_price
//               ? String(details.unit_price)
//               : "0.00";

//             const qty = parseFloat(item.quantity) || 1;
//             const price = parseFloat(item.unitPrice) || 0;
//             const disc = parseFloat(item.discount.replace("%", "")) || 0;
//             const tax = parseFloat(item.tax.replace("%", "")) || 10;

//             const base = qty * price;
//             const afterDisc = base - (base * disc) / 100;
//             item.total = (afterDisc + (afterDisc * tax) / 100).toFixed(2);
//           }

//           return updated;
//         });
//       }
//     }
//   };

//   const handleRemoveItem = (index) => {
//     setDuplicateError("");
//     setBillingItems((prev) =>
//       prev
//         .filter((_, i) => i !== index)
//         .map((item, i) => ({ ...item, sNo: (i + 1).toString() }))
//     );
//   };

//   const calculateTotals = () => {
//     const subTotal = billingItems.reduce(
//       (sum, item) => sum + parseFloat(item.total || 0),
//       0
//     );
//     const cgst = subTotal * 0.05;
//     const sgst = subTotal * 0.05;
//     const discountAmt = billingItems.reduce((sum, item) => {
//       const disc = parseFloat(item.discount.replace("%", "")) || 0;
//       const base =
//         (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
//       return sum + (base * disc) / 100;
//     }, 0);
//     const net = subTotal + cgst + sgst - discountAmt;
//     return {
//       subTotal: subTotal.toFixed(2),
//       cgst: cgst.toFixed(2),
//       sgst: sgst.toFixed(2),
//       discountAmt: discountAmt.toFixed(2),
//       net: net.toFixed(2),
//     };
//   };

//   const generateBill = async () => {
//     if (!selectedPatientId || !fullPatient) {
//       errorToast("Please select a patient first.");
//       return;
//     }

//     const itemCodes = billingItems
//       .map((item) => item.itemCode)
//       .filter((code) => code.trim() !== "");
//     const uniqueCodes = new Set(itemCodes);
//     if (itemCodes.length !== uniqueCodes.size) {
//       errorToast(
//         "Duplicate item codes found. Please remove duplicates before generating bill."
//       );
//       return;
//     }

//     const allocationIds = billingItems
//       .map((item) => item.allocation_id)
//       .filter((id) => id !== null && id !== undefined);

//     const itemsToSend = billingItems.map((item, index) => ({
//       sl_no: index + 1,
//       item_code: item.itemCode || "N/A",
//       drug_name: item.name || "",
//       rack_no: item.rackNo || "",
//       shelf_no: item.shelfNo || "",
//       quantity: parseInt(item.quantity) || 0,
//       unit_price: parseFloat(item.unitPrice) || 0,
//       discount_pct: parseFloat(item.discount.replace("%", "")) || 0,
//       tax_pct: parseFloat(item.tax.replace("%", "")) || 10,
//       allocation_id: item.allocation_id || null,
//     }));

//     if (itemsToSend.length === 0) {
//       errorToast("No items to generate bill.");
//       return;
//     }

//     const totals = calculateTotals();

//     const invoiceData = {
//       patient_name: patientInfo.patientName,
//       patient_id: patientInfo.patientID,
//       age: parseInt(fullPatient?.age) || 0,
//       doctor_name: patientInfo.doctorName || billingItems[0]?.doctorName || "N/A",
//       billing_staff: staffInfo.staffName,
//       staff_id: staffInfo.staffID,
//       patient_type: "Outpatient",
//       address_text: fullPatient?.address || "",
//       payment_type: patientInfo.paymentType,
//       payment_status: patientInfo.paymentStatus,
//       payment_mode: patientInfo.paymentMode,
//       bill_date: new Date().toISOString().split("T")[0],
//       discount_amount: parseFloat(totals.discountAmt) || 0,
//       cgst_percent: 5,
//       sgst_percent: 5,
//       items: itemsToSend,
//       allocation_ids: allocationIds,
//     };

//     setGeneratingBill(true);
//     try {
//       const stockCheckResponse = await api.get(
//         `/pharmacy-billing/check-stock-availability/${selectedPatientId}/`,
//         {
//           params: {
//             date_from: dateFrom || undefined,
//             date_to: dateTo || undefined,
//           },
//         }
//       );

//       if (!stockCheckResponse.data.all_medicines_available) {
//         const unavailableItems = stockCheckResponse.data.stock_check.filter(
//           (item) => !item.sufficient_stock
//         );

//         const errorMessage = unavailableItems
//           .map(
//             (item) =>
//               `${item.medicine_name}: Need ${item.quantity_needed}, Available ${item.quantity_available}`
//           )
//           .join("\n");

//         errorToast(`Insufficient stock:\n${errorMessage}`);
//         setGeneratingBill(false);
//         return;
//       }

//       const response = await api.post(
//         `/pharmacy/create-invoice`,
//         invoiceData,
//         {
//           responseType: "blob",
//         }
//       );

//       const blob = new Blob([response.data], { type: "application/pdf" });
//       const url = window.URL.createObjectURL(blob);
//       window.open(url, "_blank");

//       successToast(`Bill generated successfully! Stock quantities updated.`);

//       setBillingItems([]);
//       setPatientInfo({
//         patientName: "",
//         patientID: "",
//         doctorName: "",
//         paymentType: "Full Payment",
//         paymentStatus: "Paid",
//         paymentMode: "Cash",
//       });
//       setSelectedPatientId(null);
//       setFullPatient(null);
//       setDateFrom("");
//       setDateTo("");
//       setDuplicateError("");

//     } catch (err) {
//       console.error("Error generating bill:", err);

//       if (err.response?.status === 401) {
//         errorToast("Unauthorized access. Please log in again.");
//       } else if (err.response?.status === 422) {
//         if (err.response.data instanceof Blob) {
//           const errorText = await err.response.data.text();
//           try {
//             const errorData = JSON.parse(errorText);
//             errorToast(
//               `Validation error: ${JSON.stringify(
//                 errorData.detail || errorData
//               )}`
//             );
//           } catch {
//             errorToast("Validation error: Unprocessable content");
//           }
//         } else {
//           errorToast(
//             `Validation error: ${
//               err.response.data.detail || "Invalid data format"
//             }`
//           );
//         }
//       } else if (err.response?.status === 400) {
//         errorToast(`Stock issue: ${err.response.data.detail}`);
//       } else if (err.response?.status === 500) {
//         errorToast("Server error. Please try again later.");
//       } else {
//         errorToast("Failed to generate bill. Please try again.");
//       }
//     } finally {
//       setGeneratingBill(false);
//     }
//   };

//   const handleCancel = () => {
//     setPatientInfo({
//       patientName: "",
//       patientID: "",
//       doctorName: "",
//       paymentType: "Full Payment",
//       paymentStatus: "Paid",
//       paymentMode: "Cash",
//     });
//     setSelectedPatientId(null);
//     setFullPatient(null);
//     setBillingItems([]);
//     setDateFrom("");
//     setDateTo("");
//     setDuplicateError("");
//     successToast("Bill generation cancelled");
//   };

//   const totals = calculateTotals();
//   const mainDoctor = billingItems.length > 0 ? billingItems[0].doctorName : "";

//   return (
//     <div className="w-full max-w-screen-2xl mb-4 mx-auto">
//       <div className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-6 w-full max-w-[2500px] mx-auto flex flex-col overflow-hidden relative font-[Helvetica]">
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
//           Pharmacy Bill Generation
//         </h2>
//         <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
//           This is the information only related to pharmacy department
//         </p>

//         <div className="mb-6 flex flex-col gap-3 w-full">
//           <div className="flex flex-row flex-wrap items-center gap-2 w-full justify-end">
//             <div className="flex-1 min-w-[200px] max-w-[350px] lg:max-w-[400px] relative">
//               <input
//                 type="text"
//                 placeholder="Search patient name or ID"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full h-[34px] p-[4.19px_16.75px] rounded border-[1.05px] border-[#0EFF7B] dark:border-[#0EFF7B1A] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-[#08994A] dark:text-white placeholder-[#5CD592] dark:placeholder-[#5CD592] focus:outline-none transition-all font-[Helvetica]"
//               />

//               {searchQuery && filteredPatients.length > 0 && (
//                 <div className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-10 border border-[#0EFF7B] dark:border-[#3C3C3C]">
//                   {filteredPatients.map((patient) => (
//                     <div
//                       key={patient.id}
//                       onClick={() => handlePatientSelect(patient)}
//                       className="cursor-pointer p-2 text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]"
//                     >
//                       {patient.full_name} ({patient.patient_unique_id})
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="relative min-w-[140px] w-[160px] lg:w-[180px]">
//               <Listbox
//                 value={patientInfo.patientName}
//                 onChange={(v) =>
//                   patients.find((p) => p.full_name === v) &&
//                   handlePatientSelect(patients.find((p) => p.full_name === v))
//                 }
//               >
//                 <Listbox.Button className="w-full h-[33.5px] rounded-[8.38px] border-[1.05px] border-[#0EFF7B] dark:border-[#3C3C3C] bg-[#F5F6F5] dark:bg-black text-[#08994A] dark:text-white px-3 pr-8 text-sm font-[Helvetica] text-left relative">
//                   {patientInfo.patientName || "Select Name"}
//                 </Listbox.Button>

//                 <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-100 dark:bg-black border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-md shadow-lg max-h-60 overflow-auto text-sm font-[Helvetica]">
//                   {patients.map((p) => (
//                     <Listbox.Option
//                       key={p.id}
//                       value={p.full_name}
//                       className="cursor-pointer p-2 hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]"
//                     >
//                       {p.full_name}
//                     </Listbox.Option>
//                   ))}
//                 </Listbox.Options>
//               </Listbox>
//             </div>

//             <div className="relative min-w-[140px] w-[160px] lg:w-[180px]">
//               <Listbox
//                 value={patientInfo.patientID}
//                 onChange={(v) =>
//                   patients.find((p) => p.patient_unique_id === v) &&
//                   handlePatientSelect(
//                     patients.find((p) => p.patient_unique_id === v)
//                   )
//                 }
//               >
//                 <Listbox.Button className="w-full h-[33.5px] rounded-[8.38px] border-[1.05px] border-[#0EFF7B] dark:border-[#3C3C3C] bg-[#F5F6F5] dark:bg-black text-[#08994A] dark:text-white px-3 pr-8 text-sm font-[Helvetica] text-left relative">
//                   {patientInfo.patientID || "Select ID"}
//                 </Listbox.Button>

//                 <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-100 dark:bg-black border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-md shadow-lg max-h-60 overflow-auto text-sm font-[Helvetica]">
//                   {patients.map((p) => (
//                     <Listbox.Option
//                       key={p.id}
//                       value={p.patient_unique_id}
//                       className="cursor-pointer p-2 hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]"
//                     >
//                       {p.patient_unique_id}
//                     </Listbox.Option>
//                   ))}
//                 </Listbox.Options>
//               </Listbox>
//             </div>
//           </div>

//           <div className="flex flex-row flex-wrap items-center gap-3 w-full justify-end">
//             <div className="relative">
//               <input
//                 id="dateFrom"
//                 type="date"
//                 value={dateFrom}
//                 onChange={(e) => handleDateChange("from", e.target.value)}
//                 max={getTodayDate()}
//                 className="h-[33.5px] w-full bg-transparent rounded-[8.38px] border-[1.05px] border-[#0EFF7B] px-2 text-sm text-[#08994A] dark:text-white cursor-pointer"
//               />
//             </div>

//             <div className="relative">
//               <input
//                 id="dateTo"
//                 type="date"
//                 value={dateTo}
//                 onChange={(e) => handleDateChange("to", e.target.value)}
//                 max={getTodayDate()}
//                 min={dateFrom}
//                 className="h-[33.5px] w-full bg-transparent rounded-[8.38px] border-[1.05px] border-[#0EFF7B] px-2 text-sm text-[#08994A] dark:text-white cursor-pointer"
//               />
//             </div>

//             <button
//               onClick={handleClearDates}
//               disabled={!dateFrom && !dateTo}
//               className={`h-[33.5px] px-3 rounded-[8.38px] ${
//                 dateFrom || dateTo
//                   ? "bg-[#F5F6F5] dark:bg-[#0EFF7B] text-[#08994A] dark:text-black shadow-[0_0_4px_#0EFF7B]"
//                   : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
//               } transition-all min-w-[100px]`}
//             >
//               Clear Dates
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
//           <div className="bg-[#F5F6F5] dark:bg-transparent border-[1.05px] border-[#0EFF7B] dark:border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B40] dark:shadow-[0px_0px_4px_0px_#FFFFFF1F] rounded-xl p-4">
//             <div className="grid grid-cols-2 gap-3">
//               <label className="text-sm text-gray-600 dark:text-gray-300">
//                 Name
//               </label>
//               <input
//                 type="text"
//                 value={patientInfo.patientName}
//                 readOnly
//                 className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//               />
//               <label className="text-sm text-gray-600 dark:text-gray-300">
//                 Patient ID
//               </label>
//               <input
//                 type="text"
//                 value={patientInfo.patientID}
//                 readOnly
//                 className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//               />
//               <label className="text-sm text-gray-600 dark:text-gray-300">
//                 Age
//               </label>
//               <input
//                 type="text"
//                 value={fullPatient?.age || ""}
//                 readOnly
//                 className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//               />
//               <label className="text-sm text-gray-600 dark:text-gray-300">
//                 Date
//               </label>
//               <input
//                 type="text"
//                 value={formatDateToDisplay(
//                   new Date().toISOString().split("T")[0]
//                 )}
//                 readOnly
//                 className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//               />
//             </div>
//           </div>
//           <div className="bg-[#F5F6F5] dark:bg-transparent border-[1.05px] border-[#0EFF7B] dark:border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B40] dark:shadow-[0px_0px_4px_0px_#FFFFFF1F] rounded-xl p-4">
//             <div className="grid grid-cols-2 gap-3">
//               <label className="text-sm text-gray-600 dark:text-gray-300">
//                 Billing Staff
//               </label>
//               <input
//                 type="text"
//                 value={staffInfo.staffName}
//                 readOnly
//                 className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//               />
//               <label className="text-sm text-gray-600 dark:text-gray-300">
//                 Staff ID
//               </label>
//               <input
//                 type="text"
//                 value={staffInfo.staffID}
//                 readOnly
//                 className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//               />
//               <label className="text-sm text-gray-600 dark:text-gray-300">
//                 Patient Type
//               </label>
//               <input
//                 type="text"
//                 value="Outpatient"
//                 readOnly
//                 className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//               />
//               <label className="text-sm text-gray-600 dark:text-gray-300">
//                 Address
//               </label>
//               <input
//                 type="text"
//                 value={fullPatient?.address || ""}
//                 readOnly
//                 className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
//               />
//             </div>
//           </div>
//           <div className="bg-[#F5F6F5] dark:bg-transparent border-[1.05px] border-[#0EFF7B] dark:border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B40] dark:shadow-[0px_0px_4px_0px_#FFFFFF1F] rounded-xl p-4">
//             <div className="grid grid-cols-2 gap-3">
//               <label className="text-sm text-gray-600 dark:text-gray-300">
//                 Doctor Name
//               </label>
//               <div className="relative">
//                 <Listbox
//                   value={patientInfo.doctorName || mainDoctor}
//                   onChange={(value) => handleInputChange(value, "doctorName")}
//                 >
//                   <Listbox.Button
//                     className="
//                       w-full
//                       h-[33.5px]
//                       rounded-[8.38px]
//                       border-[1.05px]
//                       border-[#0EFF7B] dark:border-[#3C3C3C]
//                       bg-[#F5F6F5] dark:bg-black
//                       text-[#08994A] dark:text-white
//                       shadow-[0_0_2.09px_#0EFF7B]
//                       outline-none
//                       focus:border-[#0EFF7B]
//                       focus:shadow-[0_0_4px_#0EFF7B]
//                       transition-all
//                       duration-300
//                       px-3
//                       pr-8
//                       font-[Helvetica]
//                       text-sm
//                       text-left
//                       relative
//                     "
//                   >
//                     {patientInfo.doctorName || mainDoctor || "Select Doctor"}
//                     <svg
//                       className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                       strokeWidth={2}
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M6 9l6 6 6-6"
//                       />
//                     </svg>
//                   </Listbox.Button>
//                   <Listbox.Options
//                     className="
//                       absolute
//                       z-10
//                       mt-1
//                       w-full
//                       bg-gray-100 dark:bg-black
//                       border border-[#0EFF7B] dark:border-[#3C3C3C]
//                       rounded-md
//                       shadow-lg
//                       max-h-60
//                       overflow-auto
//                       text-sm
//                       font-[Helvetica]
//                       top-[100%]
//                       left-0
//                     "
//                   >
//                     <Listbox.Option
//                       value=""
//                       className="
//                         cursor-pointer
//                         select-none
//                         p-2
//                         text-[#08994A] dark:text-white
//                         hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]
//                       "
//                     >
//                       Select Doctor
//                     </Listbox.Option>
//                     {doctors.map((doctor) => (
//                       <Listbox.Option
//                         key={doctor.id}
//                         value={doctor.full_name}
//                         className="
//                           cursor-pointer
//                           select-none
//                           p-2
//                           text-[#08994A] dark:text-white
//                           hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]
//                         "
//                       >
//                         {doctor.full_name}
//                       </Listbox.Option>
//                     ))}
//                   </Listbox.Options>
//                 </Listbox>
//               </div>
//               <label className="text-sm text-gray-600 dark:text-gray-300">
//                 Payment mode
//               </label>
//               <div className="relative">
//                 <Listbox
//                   value={patientInfo.paymentMode}
//                   onChange={(value) => handleInputChange(value, "paymentMode")}
//                 >
//                   <Listbox.Button
//                     className="
//                       w-full
//                       h-[33.5px]
//                       rounded-[8.38px]
//                       border-[1.05px]
//                       border-[#0EFF7B] dark:border-[#3C3C3C]
//                       bg-[#F5F6F5] dark:bg-black
//                       text-[#08994A] dark:text-white
//                       shadow-[0_0_2.09px_#0EFF7B]
//                       outline-none
//                       focus:border-[#0EFF7B]
//                       focus:shadow-[0_0_4px_#0EFF7B]
//                       transition-all
//                       duration-300
//                       px-3
//                       pr-8
//                       font-[Helvetica]
//                       text-sm
//                       text-left
//                       relative
//                     "
//                   >
//                     {patientInfo.paymentMode}
//                     <svg
//                       className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                       strokeWidth={2}
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M6 9l6 6 6-6"
//                       />
//                     </svg>
//                   </Listbox.Button>
//                   <Listbox.Options
//                     className="
//                       absolute
//                       z-10
//                       mt-1
//                       w-full
//                       bg-gray-100 dark:bg-black
//                       border border-[#0EFF7B] dark:border-[#3C3C3C]
//                       rounded-md
//                       shadow-lg
//                       max-h-60
//                       overflow-auto
//                       text-sm
//                       font-[Helvetica]
//                       top-[100%]
//                       left-0
//                     "
//                   >
//                     {paymentModes.map((mode) => (
//                       <Listbox.Option
//                         key={mode}
//                         value={mode}
//                         className="
//                           cursor-pointer
//                           select-none
//                           p-2
//                           text-[#08994A] dark:text-white
//                           hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]
//                         "
//                       >
//                         {mode}
//                       </Listbox.Option>
//                     ))}
//                   </Listbox.Options>
//                 </Listbox>
//               </div>
//               <label className="text-sm text-gray-600 dark:text-gray-300">
//                 Payment Type
//               </label>
//               <div className="relative">
//                 <Listbox
//                   value={patientInfo.paymentType}
//                   onChange={(value) => handleInputChange(value, "paymentType")}
//                 >
//                   <Listbox.Button
//                     className="
//                       w-full h-[33.5px] rounded-[8.38px]
//                       border-[1.05px] border-[#0EFF7B] dark:border-[#3C3C3C]
//                       bg-[#F5F6F5] dark:bg-black
//                       text-[#08994A] dark:text-white
//                       shadow-[0_0_2.09px_#0EFF7B]
//                       outline-none
//                       focus:border-[#0EFF7B] focus:shadow-[0_0_4px_#0EFF7B]
//                       transition-all duration-300
//                       px-3 pr-8 font-[Helvetica] text-sm text-left relative
//                     "
//                   >
//                     {patientInfo.paymentType || "Full Payment"}
//                     <svg
//                       className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                       strokeWidth={2}
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M6 9l6 6 6-6"
//                       />
//                     </svg>
//                   </Listbox.Button>
//                   <Listbox.Options
//                     className="
//                       absolute z-10 mt-1 w-full bg-gray-100 dark:bg-black
//                       border border-[#0EFF7B] dark:border-[#3C3C3C]
//                       rounded-md shadow-lg max-h-60 overflow-auto
//                       text-sm font-[Helvetica] top-[100%] left-0
//                     "
//                   >
//                     {paymentTypes.map((type) => (
//                       <Listbox.Option
//                         key={type}
//                         value={type}
//                         className="
//                           cursor-pointer select-none p-2
//                           text-[#08994A] dark:text-white
//                           hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]
//                         "
//                       >
//                         {type}
//                       </Listbox.Option>
//                     ))}
//                   </Listbox.Options>
//                 </Listbox>
//               </div>
//               <label className="text-sm text-gray-600 dark:text-gray-300">
//                 Payment Status
//               </label>
//               <div className="relative">
//                 <Listbox
//                   value={patientInfo.paymentStatus}
//                   onChange={(value) =>
//                     handleInputChange(value, "paymentStatus")
//                   }
//                 >
//                   <Listbox.Button
//                     className="
//                       w-full h-[33.5px] rounded-[8.38px]
//                       border-[1.05px] border-[#0EFF7B] dark:border-[#3C3C3C]
//                       bg-[#F5F6F5] dark:bg-black
//                       text-[#08994A] dark:text-white
//                       shadow-[0_0_2.09px_#0EFF7B]
//                       outline-none
//                       focus:border-[#0EFF7B] focus:shadow-[0_0_4px_#0EFF7B]
//                       transition-all duration-300
//                       px-3 pr-8 font-[Helvetica] text-sm text-left relative
//                     "
//                   >
//                     {patientInfo.paymentStatus || "Paid"}
//                     <svg
//                       className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                       strokeWidth={2}
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M6 9l6 6 6-6"
//                       />
//                     </svg>
//                   </Listbox.Button>
//                   <Listbox.Options
//                     className="
//                       absolute z-10 mt-1 w-full bg-gray-100 dark:bg-black
//                       border border-[#0EFF7B] dark:border-[#3C3C3C]
//                       rounded-md shadow-lg max-h-60 overflow-auto
//                       text-sm font-[Helvetica] top-[100%] left-0
//                     "
//                   >
//                     {paymentStatuses.map((status) => (
//                       <Listbox.Option
//                         key={status}
//                         value={status}
//                         className="
//                           cursor-pointer select-none p-2
//                           text-[#08994A] dark:text-white
//                           hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]
//                         "
//                       >
//                         {status}
//                       </Listbox.Option>
//                     ))}
//                   </Listbox.Options>
//                 </Listbox>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="bg-[#F5F6F5] dark:bg-transparent border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-xl p-4">
//           <h3 className="text-[#08994A] dark:text-[#0EFF7B] mb-3">
//             Billing Information
//           </h3>

//           {duplicateError && (
//             <div className="mb-3 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
//               ⚠️ {duplicateError}
//             </div>
//           )}

//           {loading ? (
//             <p>Loading medicines...</p>
//           ) : billingItems.length === 0 ? (
//             dateFrom || dateTo ? (
//               <p>No medicines allocated for the selected date range.</p>
//             ) : (
//               <p>No medicines allocated to this patient.</p>
//             )
//           ) : (
//             <table className="w-full text-sm text-left">
//               <thead className="text-[#08994A] dark:text-[#0EFF7B] bg-gray-200 dark:bg-[#091810]">
//                 <tr>
//                   <th className="p-2">S.No</th>
//                   <th className="p-2">Item code</th>
//                   <th className="p-2 px-9">Name </th>
//                   <th className="p-1">Frequency</th>
//                   <th className="p-2">Allocation Date</th>
//                   <th className="p-2">Rack no</th>
//                   <th className="p-2">Shelf no</th>
//                   <th className="p-2">Quantity</th>
//                   <th className="p-2">Unit price</th>
//                   <th className="p-2">Discount</th>
//                   <th className="p-2">Tax</th>
//                   <th className="p-2">Total</th>
//                   <th className="p-2">Remove</th>
//                 </tr>
//               </thead>
//               <tbody className="text-[#08994A] dark:text-gray-300 bg-gray-100 dark:bg-black">
//                 {billingItems.map((item, i) => (
//                   <tr
//                     key={item.id}
//                     className="border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
//                   >
//                     <td className="p-2">
//                       <input
//                         type="text"
//                         value={item.sNo}
//                         readOnly
//                         className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
//                         style={{
//                           border: "2px solid #0EFF7B1A",
//                           boxShadow: "0px 0px 2px 0px #0EFF7B",
//                         }}
//                       />
//                     </td>
//                     <td className="p-2">
//                       <input
//                         type="text"
//                         value={item.itemCode}
//                         onChange={(e) =>
//                           handleBillingChange(i, "itemCode", e.target.value)
//                         }
//                         onBlur={(e) => handleItemCodeBlur(i, e.target.value)}
//                         onKeyDown={(e) => {
//                           if (e.key === 'Enter') {
//                             handleItemCodeBlur(i, e.target.value);
//                           }
//                         }}
//                         className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
//                         style={{
//                           border: "2px solid #0EFF7B1A",
//                           boxShadow: "0px 0px 2px 0px #0EFF7B",
//                         }}
//                         placeholder="Enter item code"
//                       />
//                     </td>
//                     <td className="p-2">
//                       <input
//                         type="text"
//                         value={item.name}
//                         onChange={(e) =>
//                           handleBillingChange(i, "name", e.target.value)
//                         }
//                         className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
//                         style={{
//                           border: "2px solid #0EFF7B1A",
//                           boxShadow: "0px 0px 2px 0px #0EFF7B",
//                         }}
//                       />
//                     </td>
//                     <td className="p-2">
//                       <input
//                         type="text"
//                         value={item.frequency}
//                         readOnly
//                         className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
//                         style={{
//                           border: "2px solid #0EFF7B1A",
//                           boxShadow: "0px 0px 2px 0px #0EFF7B",
//                         }}
//                       />
//                     </td>
//                     <td className="p-2">
//                       <input
//                         type="text"
//                         value={formatDateToDisplay(item.allocationDate)}
//                         readOnly
//                         className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
//                         style={{
//                           border: "2px solid #0EFF7B1A",
//                           boxShadow: "0px 0px 2px 0px #0EFF7B",
//                         }}
//                       />
//                     </td>
//                     <td className="p-2">
//                       <input
//                         type="text"
//                         value={item.rackNo}
//                         onChange={(e) =>
//                           handleBillingChange(i, "rackNo", e.target.value)
//                         }
//                         className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
//                         style={{
//                           border: "2px solid #0EFF7B1A",
//                           boxShadow: "0px 0px 2px 0px #0EFF7B",
//                         }}
//                       />
//                     </td>
//                     <td className="p-2">
//                       <input
//                         type="text"
//                         value={item.shelfNo}
//                         onChange={(e) =>
//                           handleBillingChange(i, "shelfNo", e.target.value)
//                         }
//                         className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
//                         style={{
//                           border: "2px solid #0EFF7B1A",
//                           boxShadow: "0px 0px 2px 0px #0EFF7B",
//                         }}
//                       />
//                     </td>
//                     <td className="p-2">
//                       <input
//                         type="number"
//                         value={item.quantity}
//                         onChange={(e) =>
//                           handleBillingChange(i, "quantity", e.target.value)
//                         }
//                         className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
//                         style={{
//                           border: "2px solid #0EFF7B1A",
//                           boxShadow: "0px 0px 2px 0px #0EFF7B",
//                         }}
//                       />
//                     </td>
//                     <td className="p-2">
//                       <input
//                         type="number"
//                         value={item.unitPrice}
//                         onChange={(e) =>
//                           handleBillingChange(i, "unitPrice", e.target.value)
//                         }
//                         className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
//                         style={{
//                           border: "2px solid #0EFF7B1A",
//                           boxShadow: "0px 0px 2px 0px #0EFF7B",
//                         }}
//                       />
//                     </td>
//                     <td className="p-2">
//                       <input
//                         type="text"
//                         value={item.discount}
//                         onChange={(e) =>
//                           handleBillingChange(i, "discount", e.target.value)
//                         }
//                         className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
//                         style={{
//                           border: "2px solid #0EFF7B1A",
//                           boxShadow: "0px 0px 2px 0px #0EFF7B",
//                         }}
//                       />
//                     </td>
//                     <td className="p-2">
//                       <input
//                         type="text"
//                         value={item.tax}
//                         onChange={(e) =>
//                           handleBillingChange(i, "tax", e.target.value)
//                         }
//                         className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
//                         style={{
//                           border: "2px solid #0EFF7B1A",
//                           boxShadow: "0px 0px 2px 0px #0EFF7B",
//                         }}
//                       />
//                     </td>
//                     <td className="p-2">
//                       <input
//                         type="text"
//                         value={item.total}
//                         readOnly
//                         className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
//                         style={{
//                           border: "2px solid #0EFF7B1A",
//                           boxShadow: "0px 0px 2px 0px #0EFF7B",
//                         }}
//                       />
//                     </td>
//                     <td className="p-2">
//                       <Trash2
//                         className="w-5 h-5 text-red-500 dark:text-[#0EFF7B] cursor-pointer hover:text-red-600 dark:hover:text-red-600"
//                         onClick={() => handleRemoveItem(i)}
//                       />
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//           <div className="flex justify-end mt-4">
//             <button
//               onClick={handleAddMedicine}
//               disabled={!selectedPatientId}
//               className={`flex items-center justify-center border-b-[2px] border-[#0EFF7B] gap-2 w-[200px] h-[40px] rounded-[8px] ${
//                 selectedPatientId
//                   ? "bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white hover:scale-105"
//                   : "bg-gray-300 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
//               } font-medium text-[14px] transition`}
//             >
//               <Plus
//                 size={18}
//                 className={selectedPatientId ? "text-white" : "text-gray-400"}
//               />{" "}
//               Add
//             </button>
//           </div>
//           <div className="mt-6 grid grid-cols-5 gap-3 text-sm text-gray-600 dark:text-gray-200">
//             <div className="col-span-1"></div>
//             <div className="col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3">
//               <div className="flex justify-between bg-[#F5F6F5] dark:bg-[#0EFF7B1A] border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-2 text-[#08994A] dark:text-white">
//                 <span>Sub total</span> <span>{totals.subTotal}</span>
//               </div>
//               <div className="flex justify-between bg-[#F5F6F5] dark:bg-[#0EFF7B1A] border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-2 text-[#08994A] dark:text-white">
//                 <span>CGST (5%)</span> <span>{totals.cgst}</span>
//               </div>
//               <div className="flex justify-between bg-[#F5F6F5] dark:bg-[#0EFF7B1A] border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-2 text-[#08994A] dark:text-white">
//                 <span>SGST (5%)</span> <span>{totals.sgst}</span>
//               </div>
//               <div className="flex justify-between bg-[#F5F6F5] dark:bg-[#0EFF7B1A] border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-2 text-[#08994A] dark:text-white">
//                 <span>Discount amount</span> <span>{totals.discountAmt}</span>
//               </div>
//             </div>
//           </div>
//           <div className="mt-4 flex justify-end">
//             <div className="flex justify-between w-64 bg-[#F5F6F5] dark:bg-[#0EFF7B1A] border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-3 text-lg font-semibold text-[#08994A] dark:text-[#0EFF7B]">
//               <span>Net Amount</span>
//               <span>{totals.net}</span>
//             </div>
//           </div>
//           <div className="mt-6 flex justify-end gap-3">
//             <button
//               onClick={handleCancel}
//               className="px-6 py-2 border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md text-gray-600 dark:text-gray-300 hover:text-[#08994A] dark:hover:text-white"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={generateBill}
//               disabled={
//                 generatingBill || billingItems.length === 0 || duplicateError
//               }
//               className="flex items-center justify-center w-[200px] h-[40px] gap-2 rounded-[8px] border-b-[2px] border-[#0EFF7B] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium text-[14px] hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {generatingBill ? "Generating..." : "Generate Bill"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Bill;

import React, { useState, useEffect, useCallback } from "react";
import { Search, Trash2, Plus, Calendar } from "lucide-react";
import { Listbox } from "@headlessui/react";
import api from "../../utils/axiosConfig";
import { successToast, errorToast } from "../../components/Toast";

const Bill = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientInfo, setPatientInfo] = useState({
    patientName: "",
    patientID: "",
    doctorName: "",
    paymentType: "Full Payment",
    paymentStatus: "Paid",
    paymentMode: "Cash",
  });
  const [staffInfo, setStaffInfo] = useState({ staffName: "", staffID: "" });
  const [fullPatient, setFullPatient] = useState(null);
  const [billingItems, setBillingItems] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingBill, setGeneratingBill] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [duplicateError, setDuplicateError] = useState("");
  const [medicineLookup, setMedicineLookup] = useState({});
  const [itemCodeInputs, setItemCodeInputs] = useState({});
  const [stockData, setStockData] = useState({});

  const paymentTypes = [
    "Full Payment",
    // "Partial Payment",
    // "Insurance",
    // "Credit",
  ];
  const paymentStatuses = ["Paid", "Pending", "Overdue", "Refunded"];
  const paymentModes = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "UPI",
    "Bank Transfer",
    "Insurance Claim",
  ];

  // ============== VALIDATION FUNCTIONS ==============
  const validateTaxPercentage = useCallback((value) => {
    if (!value || value === "") return ""; // Allow empty values for editing

    const cleanValue = value.toString().replace("%", "");
    const taxNum = parseFloat(cleanValue);

    if (isNaN(taxNum)) {
      return "Tax must be a valid number";
    }

    if (taxNum < 1) {
      return "Tax percentage cannot be less than 1%";
    }

    if (taxNum > 100) {
      return "Tax percentage cannot exceed 100%";
    }

    return "";
  }, []);

  const validateQuantity = useCallback((value) => {
    const qty = parseFloat(value);
    if (value !== "" && (isNaN(qty) || qty <= 0)) {
      return "Quantity must be greater than 0";
    }
    return "";
  }, []);

  const validateDiscount = useCallback((value) => {
    if (!value) return ""; // Allow empty values for editing
    const cleanValue = value.toString().replace("%", "");
    const discNum = parseFloat(cleanValue);
    if (isNaN(discNum)) {
      return "Discount must be a valid number";
    }
    if (discNum < 0) {
      return "Discount cannot be negative";
    }
    if (discNum > 100) {
      return "Discount cannot exceed 100%";
    }
    return "";
  }, []);

  // ============== HELPER FUNCTIONS ==============
  const formatDateToDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const calculateItemTotal = useCallback((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    const disc = parseFloat(item.discount?.replace("%", "")) || 0;
    const tax = parseFloat(item.tax?.replace("%", "")) || 10;

    const base = qty * price;
    const afterDiscount = base - (base * disc) / 100;
    const finalTotal = afterDiscount + (afterDiscount * tax) / 100;

    return { ...item, total: finalTotal.toFixed(2) };
  }, []);

  // ============== API CALLS ==============
  useEffect(() => {
    fetchPatients();
    fetchStaffInfo();
    fetchStockData();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/medicine_allocation/edit");
      let list = [];
      if (Array.isArray(res.data)) list = res.data;
      else if (res.data.patients) list = res.data.patients;
      setPatients(list);
    } catch (err) {
      console.error("Failed to load patients:", err);
      errorToast("Failed to load patients");
    }
  };

  const fetchStaffInfo = async () => {
    try {
      const res = await api.get("/profile/me/");
      setStaffInfo({
        staffName: res.data.profile.full_name || "Unknown Staff",
        staffID: res.data.profile.employee_id || "N/A",
      });
    } catch (err) {
      console.error("Failed to load staff info:", err);
      setStaffInfo({ staffName: "Unknown Staff", staffID: "N/A" });
    }
  };

  const fetchStockData = async () => {
    try {
      const res = await api.get("/stock/list");
      const stockMap = {};
      (res.data || []).forEach((item) => {
        if (item.item_code) {
          stockMap[item.item_code] = {
            quantity: item.quantity || 0,
            product_name: item.product_name,
            status: item.status,
          };
        }
      });
      setStockData(stockMap);
    } catch (err) {
      console.error("Failed to load stock data:", err);
    }
  };

  const fetchPatientDetails = async (uniqueId) => {
    try {
      const res = await api.get(`/patients/${uniqueId}`);
      setFullPatient(res.data);
    } catch (err) {
      console.error("Failed to load patient details:", err);
    }
  };

  const fetchBillingItems = useCallback(
    async (patientId, fromDate = "", toDate = "") => {
      if (!patientId) return;
      setLoading(true);
      try {
        let url = `/pharmacy-billing/${patientId}/`;
        const params = new URLSearchParams();
        if (fromDate) params.append("date_from", fromDate);
        if (toDate) params.append("date_to", toDate);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await api.get(url);

        const medicineItems = (res.data.items || [])
          .filter((item) => item.medicine_name || item.name_of_drug)
          .map((item, i) => ({
            id: item.allocation_id || Date.now() + i,
            allocation_id: item.allocation_id,
            sNo: (i + 1).toString(),
            itemCode: item.item_code || "N/A",
            name: item.medicine_name || item.name_of_drug || "",
            rackNo: item.rack_no || "",
            shelfNo: item.shelf_no || "",
            quantity: item.quantity ? String(item.quantity) : "1",
            unitPrice: item.unit_price ? String(item.unit_price) : "0.00",
            discount: "0%",
            tax: "10%",
            total: "0.00",
            doctorName: item.doctor_name || "N/A",
            allocationDate: item.allocation_date || "",
            frequency: item.frequency || "",
            isFromAPI: true,
          }));

        setBillingItems(medicineItems.map((item) => calculateItemTotal(item)));

        if (medicineItems.length === 0) {
          errorToast("No medicine allocations found for this patient");
        }
      } catch (err) {
        console.error("Error loading medicines:", err);
        setBillingItems([]);
        errorToast("Failed to load medicine allocations");
      } finally {
        setLoading(false);
      }
    },
    [calculateItemTotal],
  );

  const fetchMedicineDetails = useCallback(
    async (itemCode) => {
      if (!itemCode.trim()) return null;
      if (medicineLookup[itemCode]) return medicineLookup[itemCode];

      try {
        const res = await api.get(
          `/medicine_allocation/medicine-by-code/${itemCode.trim()}`,
        );
        const data = res.data;
        setMedicineLookup((prev) => ({ ...prev, [itemCode]: data }));

        const stock = stockData[itemCode.trim()];
        if (stock) {
          if (stock.quantity === 0 || stock.status === "outofstock") {
            errorToast(`⚠️ ${data.drug_name || "Medicine"} is OUT OF STOCK!`);
          } else if (stock.quantity < 10) {
            errorToast(
              `⚠️ LOW STOCK: Only ${stock.quantity} units of ${data.drug_name || "medicine"} available`,
            );
          }
        }

        return data;
      } catch (err) {
        if (err.response?.status === 404) {
          errorToast(`No medicine found with item code: ${itemCode}`);
        }
        return null;
      }
    },
    [medicineLookup, stockData],
  );

  // ============== SEARCH FILTER ==============
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
    } else {
      setFilteredPatients(
        patients.filter(
          (p) =>
            p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.patient_unique_id
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()),
        ),
      );
    }
  }, [searchQuery, patients]);

  // ============== DOCTORS FETCH ==============
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/staff/all/");
        setDoctors(res.data || []);
      } catch (err) {
        console.error("Failed to load doctors:", err);
        errorToast("Failed to load doctor list");
      }
    };
    fetchDoctors();
  }, []);

  // ============== ITEM CODE LOOKUP ==============
  useEffect(() => {
    const timer = setTimeout(async () => {
      for (const [index, code] of Object.entries(itemCodeInputs)) {
        if (code.trim()) {
          const details = await fetchMedicineDetails(code.trim());
          if (details) {
            setBillingItems((prev) => {
              const updated = [...prev];
              const item = updated[parseInt(index)];
              if (item && item.itemCode === code.trim()) {
                item.name = details.drug_name || "";
                item.rackNo = details.rack_no || "";
                item.shelfNo = details.shelf_no || "";
                item.unitPrice = details.unit_price
                  ? String(details.unit_price)
                  : "0.00";
                item.isFromAPI = true;
                return updated.map((i) =>
                  i.id === item.id ? calculateItemTotal(i) : i,
                );
              }
              return updated;
            });
          }
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [itemCodeInputs, fetchMedicineDetails, calculateItemTotal]);

  // ============== EVENT HANDLERS ==============
  const handlePatientSelect = useCallback(
    async (patient) => {
      setPatientInfo({
        patientName: patient.full_name || "",
        patientID: patient.patient_unique_id || "",
        doctorName: "",
        paymentType: "Full Payment",
        paymentStatus: "Paid",
        paymentMode: "Cash",
      });
      setSelectedPatientId(patient.id);
      setSearchQuery("");
      setDateFrom("");
      setDateTo("");
      setDuplicateError("");
      await fetchPatientDetails(patient.patient_unique_id);
      await fetchBillingItems(patient.id);
    },
    [fetchBillingItems],
  );

  const handleInputChange = useCallback((value, field) => {
    setPatientInfo((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleDoctorChange = useCallback(
    (value) => {
      handleInputChange(value, "doctorName");
      if (value) {
        successToast(`Doctor ${value} selected successfully`);
      }
    },
    [handleInputChange],
  );

  const handleClearDoctor = useCallback(() => {
    handleInputChange("", "doctorName");
  }, [handleInputChange]);

  const handleDateChange = useCallback(
    (type, value) => {
      const today = getTodayDate();

      if (type === "from") {
        if (value > today) {
          errorToast("'From' date cannot be in the future");
          return;
        }
        if (dateTo && value > dateTo) {
          errorToast("'From' date cannot be after 'To' date");
          return;
        }
        setDateFrom(value);
      } else if (type === "to") {
        if (value > today) {
          errorToast("'To' date cannot be in the future");
          return;
        }
        if (dateFrom && value < dateFrom) {
          errorToast("'To' date cannot be before 'From' date");
          return;
        }
        setDateTo(value);
      }

      if (selectedPatientId) {
        fetchBillingItems(
          selectedPatientId,
          type === "from" ? value : dateFrom,
          type === "to" ? value : dateTo,
        );
      }
    },
    [selectedPatientId, dateFrom, dateTo, fetchBillingItems],
  );

  const handleClearDates = useCallback(() => {
    setDateFrom("");
    setDateTo("");
    if (selectedPatientId) fetchBillingItems(selectedPatientId);
  }, [selectedPatientId, fetchBillingItems]);

  const handleAddMedicine = useCallback(() => {
    if (!selectedPatientId) {
      errorToast("Please select a patient first");
      return;
    }

    const newItem = {
      id: Date.now(),
      allocation_id: null,
      sNo: (billingItems.length + 1).toString(),
      itemCode: "",
      name: "",
      rackNo: "",
      shelfNo: "",
      quantity: "",
      unitPrice: "",
      discount: "",
      tax: "10%",
      total: "0.00",
      doctorName: "",
      allocationDate: new Date().toISOString().split("T")[0],
      frequency: "",
      isFromAPI: false,
    };

    setBillingItems((prev) => [...prev, newItem]);
  }, [selectedPatientId, billingItems.length]);

  const handleBillingChange = useCallback(
    (index, field, value) => {
      setDuplicateError("");

      // Validation based on field
      if (field === "quantity") {
        if (value === "") {
          // Allow empty
        } else {
          const error = validateQuantity(value);
          if (error) {
            errorToast(error);
            return;
          }

          // Check stock
          const qty = parseFloat(value);
          const currentItem = billingItems[index];
          const stock = stockData[currentItem?.itemCode];

          if (stock && qty > stock.quantity) {
            errorToast(
              `⚠️ Insufficient stock! Requested: ${qty}, Available: ${stock.quantity}`,
            );
            return;
          }
        }
      }

      // For discount and tax - allow empty values and don't auto-add % symbol
      if (field === "discount") {
        if (value && value !== "") {
          const error = validateDiscount(value);
          if (error) {
            errorToast(error);
            return;
          }
        }
      }

      if (field === "tax") {
        if (value && value !== "") {
          const error = validateTaxPercentage(value);
          if (error) {
            errorToast(error);
            return;
          }
        }
      }

      if (field === "itemCode") {
        setItemCodeInputs((prev) => ({ ...prev, [index]: value }));
      }

      setBillingItems((prev) => {
        const updated = [...prev];
        const item = { ...updated[index] };

        if (field === "itemCode" && value.trim() !== item.itemCode) {
          const duplicateIndex = updated.findIndex(
            (it, i) =>
              i !== index &&
              it.itemCode === value.trim() &&
              it.allocation_id !== item.allocation_id,
          );
          if (duplicateIndex !== -1) {
            setDuplicateError(`Duplicate item code "${value}" already exists.`);
            return prev;
          }

          item.itemCode = value.trim();
          if (value.trim() !== prev[index].itemCode) {
            item.name = "";
            item.rackNo = "";
            item.shelfNo = "";
            item.unitPrice = "0.00";
            item.isFromAPI = false;
          }
        } else {
          item[field] = value;
        }

        // Don't auto-add % symbol - let users type what they want
        updated[index] = calculateItemTotal(item);
        return updated;
      });
    },
    [
      billingItems,
      stockData,
      validateQuantity,
      validateDiscount,
      validateTaxPercentage,
      calculateItemTotal,
    ],
  );

  const handleRemoveItem = useCallback((index) => {
    setDuplicateError("");
    setBillingItems((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, sNo: (i + 1).toString() })),
    );
  }, []);

  const handleCancel = useCallback(() => {
    setPatientInfo({
      patientName: "",
      patientID: "",
      doctorName: "",
      paymentType: "Full Payment",
      paymentStatus: "Paid",
      paymentMode: "Cash",
    });
    setSelectedPatientId(null);
    setFullPatient(null);
    setBillingItems([]);
    setDateFrom("");
    setDateTo("");
    setDuplicateError("");
    successToast("Bill generation cancelled");
  }, []);

  // ============== CALCULATIONS ==============
  const calculateTotals = useCallback(() => {
    if (
      !billingItems ||
      !Array.isArray(billingItems) ||
      billingItems.length === 0
    ) {
      return {
        subTotal: "0.00",
        cgst: "0.00",
        sgst: "0.00",
        discountAmt: "0.00",
        net: "0.00",
        avgTaxPercent: 10, // Default
      };
    }

    // Calculate subtotal (sum of all item totals)
    const subTotal = billingItems.reduce(
      (sum, item) => sum + (parseFloat(item.total) || 0),
      0,
    );

    // Calculate total discount amount
    const discountAmt = billingItems.reduce((sum, item) => {
      const disc = parseFloat(item.discount?.replace("%", "")) || 0;
      const base =
        (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
      return sum + (base * disc) / 100;
    }, 0);

    // Calculate weighted average tax percentage
    let totalTaxableAmount = 0;
    let weightedTaxSum = 0;

    billingItems.forEach((item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      const disc = parseFloat(item.discount?.replace("%", "")) || 0;
      const itemTax = parseFloat(item.tax?.replace("%", "")) || 10;

      const base = qty * price;
      const afterDiscount = base - (base * disc) / 100;

      totalTaxableAmount += afterDiscount;
      weightedTaxSum += afterDiscount * itemTax;
    });

    const avgTaxPercent =
      totalTaxableAmount > 0 ? weightedTaxSum / totalTaxableAmount : 10;

    // Split the average tax equally between CGST and SGST
    const halfTax = avgTaxPercent / 2;

    // Calculate base before tax (subtract existing tax from subtotal)
    const baseBeforeTax = subTotal / (1 + avgTaxPercent / 100);

    const cgst = baseBeforeTax * (halfTax / 100);
    const sgst = baseBeforeTax * (halfTax / 100);

    const net = subTotal; // Subtotal already includes tax

    return {
      subTotal: subTotal.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      discountAmt: discountAmt.toFixed(2),
      net: net.toFixed(2),
      avgTaxPercent: avgTaxPercent.toFixed(2),
    };
  }, [billingItems]);

  // ============== BILL GENERATION ==============
 const generateBill = useCallback(async () => {
  if (!selectedPatientId || !fullPatient) {
    errorToast("Please select a patient first.");
    return;
  }

  // Check for duplicate item codes
  const itemCodes = billingItems
    .map((item) => item.itemCode)
    .filter((code) => code.trim() !== "");
  const uniqueCodes = new Set(itemCodes);
  if (itemCodes.length !== uniqueCodes.size) {
    errorToast(
      "Duplicate item codes found. Please remove duplicates before generating bill.",
    );
    return;
  }

  // Check for invalid tax percentages (only if value exists)
  const invalidTaxItems = billingItems.filter((item) => {
    if (!item.tax || item.tax === "") return false;
    const taxVal = parseFloat(item.tax);
    return isNaN(taxVal) || taxVal < 1 || taxVal > 100;
  });

  if (invalidTaxItems.length > 0) {
    errorToast(
      `⚠️ Invalid tax percentage found. Tax must be between 1% and 100%`,
    );
    return;
  }

  // Check for zero quantity
  if (billingItems.some((item) => (parseInt(item.quantity) || 0) <= 0)) {
    errorToast("All items must have quantity greater than 0");
    return;
  }

  // Check if all items have valid item codes
  const itemsWithoutCode = billingItems.filter(
    (item) => !item.itemCode || item.itemCode.trim() === ""
  );
  
  if (itemsWithoutCode.length > 0) {
    errorToast("All items must have a valid item code");
    return;
  }

  // ============== FIXED STOCK CHECK SECTION ==============
  const stockIssues = [];
  const itemsNeedingStockCheck = [];

  billingItems.forEach((item) => {
    const itemCode = item.itemCode?.trim();
    if (!itemCode) {
      stockIssues.push(`${item.name || 'Item'}: No item code provided`);
      return;
    }

    const stock = stockData[itemCode];
    const requestedQty = parseInt(item.quantity) || 0;

    if (!stock) {
      // Stock data not available in local cache
      itemsNeedingStockCheck.push({
        itemCode,
        name: item.name || itemCode,
        requestedQty
      });
    } else if (stock.quantity === 0 || stock.status === "outofstock") {
      stockIssues.push(`${item.name || itemCode}: OUT OF STOCK`);
    } else if (requestedQty > stock.quantity) {
      stockIssues.push(
        `${item.name || itemCode}: Need ${requestedQty}, Available ${stock.quantity}`
      );
    }
  });

  // If there are items without stock data, try to fetch them one by one
  if (itemsNeedingStockCheck.length > 0) {
    setGeneratingBill(true);
    
    for (const item of itemsNeedingStockCheck) {
      try {
        const details = await fetchMedicineDetails(item.itemCode);
        if (!details) {
          stockIssues.push(`${item.name}: Could not fetch stock data`);
          continue;
        }
        
        // Check stock from the fetched details
        const stock = stockData[item.itemCode];
        if (stock) {
          if (stock.quantity === 0 || stock.status === "outofstock") {
            stockIssues.push(`${item.name}: OUT OF STOCK`);
          } else if (item.requestedQty > stock.quantity) {
            stockIssues.push(
              `${item.name}: Need ${item.requestedQty}, Available ${stock.quantity}`
            );
          }
        } else {
          stockIssues.push(`${item.name}: Stock data not available`);
        }
      } catch (error) {
        stockIssues.push(`${item.name}: Error checking stock`);
      }
    }
  }

  if (stockIssues.length > 0) {
    errorToast(`⚠️ Stock Issues:\n${stockIssues.join("\n")}`);
    setGeneratingBill(false);
    return;
  }

  const allocationIds = billingItems
    .map((item) => item.allocation_id)
    .filter((id) => id !== null);

  const itemsToSend = billingItems.map((item, index) => {
    const itemTaxPct = parseFloat(item.tax?.replace("%", "")) || 10;
    
    return {
      sl_no: index + 1,
      item_code: item.itemCode || "N/A",
      drug_name: item.name || "",
      rack_no: item.rackNo || "",
      shelf_no: item.shelfNo || "",
      quantity: parseInt(item.quantity) || 0,
      unit_price: parseFloat(item.unitPrice) || 0,
      discount_pct: parseFloat(item.discount?.replace("%", "")) || 0,
      tax_pct: itemTaxPct,
      allocation_id: item.allocation_id || null,
    };
  });

  const totals = calculateTotals();
  const halfTax = parseFloat(totals.avgTaxPercent) / 2;

  const invoiceData = {
    patient_name: patientInfo.patientName,
    patient_id: patientInfo.patientID,
    age: parseInt(fullPatient?.age) || 0,
    doctor_name:
      patientInfo.doctorName || billingItems[0]?.doctorName || "N/A",
    billing_staff: staffInfo.staffName,
    staff_id: staffInfo.staffID,
    patient_type: "Outpatient",
    address_text: fullPatient?.address || "",
    payment_type: patientInfo.paymentType,
    payment_status: patientInfo.paymentStatus,
    payment_mode: patientInfo.paymentMode,
    bill_date: new Date().toISOString().split("T")[0],
    discount_amount: parseFloat(totals.discountAmt) || 0,
    cgst_percent: halfTax,
    sgst_percent: halfTax,
    items: itemsToSend,
    allocation_ids: allocationIds,
  };

  try {
    // First check stock availability via API
    const stockCheckResponse = await api.get(
      `/pharmacy-billing/check-stock-availability/${selectedPatientId}/`,
      {
        params: {
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        },
      },
    );

    if (!stockCheckResponse.data.all_medicines_available) {
      const unavailable = stockCheckResponse.data.stock_check.filter(
        (i) => !i.sufficient_stock,
      );
      const msg = unavailable
        .map(
          (i) =>
            `${i.medicine_name}: Need ${i.quantity_needed}, Available ${i.quantity_available}`,
        )
        .join("\n");
      errorToast(`⚠️ Insufficient stock:\n${msg}`);
      setGeneratingBill(false);
      return;
    }

    // Generate the bill
    const response = await api.post("/pharmacy/create-invoice", invoiceData, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");

    successToast("Bill generated successfully! Stock quantities updated.");
    handleCancel();
  } catch (err) {
    console.error("Error generating bill:", err);
    errorToast("Failed to generate bill. Please try again.");
  } finally {
    setGeneratingBill(false);
  }
}, [
  selectedPatientId,
  fullPatient,
  billingItems,
  patientInfo,
  staffInfo,
  dateFrom,
  dateTo,
  stockData,
  fetchMedicineDetails,
  calculateTotals,
  handleCancel,
]);

  const totals = calculateTotals();
  const mainDoctor = billingItems.length > 0 ? billingItems[0]?.doctorName : "";

  return (
    <div className="w-full max-w-screen-2xl mb-4 mx-auto">
      <div className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-6 w-full max-w-[2500px] mx-auto flex flex-col overflow-hidden relative font-[Helvetica]">
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
          Pharmacy Bill Generation
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
          This is the information only related to pharmacy department
        </p>

        <div className="mb-6 flex flex-col gap-3 w-full">
          <div className="flex flex-row flex-wrap items-center gap-2 w-full justify-end">
            <div className="flex-1 min-w-[200px] max-w-[350px] lg:max-w-[400px] relative">
              <input
                type="text"
                placeholder="Search patient name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[34px] p-[4.19px_16.75px] rounded border-[1.05px] border-[#0EFF7B] dark:border-[#0EFF7B1A] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-[#08994A] dark:text-white placeholder-[#5CD592] dark:placeholder-[#5CD592] focus:outline-none transition-all font-[Helvetica]"
              />

              {searchQuery && filteredPatients.length > 0 && (
                <div className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-10 border border-[#0EFF7B] dark:border-[#3C3C3C]">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className="cursor-pointer p-2 text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]"
                    >
                      {patient.full_name} ({patient.patient_unique_id})
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative min-w-[140px] w-[160px] lg:w-[180px]">
              <Listbox
                value={patientInfo.patientName}
                onChange={(v) => {
                  const patient = patients.find((p) => p.full_name === v);
                  if (patient) handlePatientSelect(patient);
                }}
              >
                <Listbox.Button className="w-full h-[33.5px] rounded-[8.38px] border-[1.05px] border-[#0EFF7B] dark:border-[#3C3C3C] bg-[#F5F6F5] dark:bg-black text-[#08994A] dark:text-white px-3 pr-8 text-sm font-[Helvetica] text-left relative truncate">
                  {patientInfo.patientName || "Select Name"}
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

                <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-100 dark:bg-black border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-md shadow-lg max-h-60 overflow-auto text-sm font-[Helvetica]">
                  {patients.map((p) => (
                    <Listbox.Option
                      key={p.id}
                      value={p.full_name}
                      className="cursor-pointer p-2 hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]"
                    >
                      {p.full_name}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Listbox>
            </div>

            <div className="relative min-w-[140px] w-[160px] lg:w-[180px]">
              <Listbox
                value={patientInfo.patientID}
                onChange={(v) => {
                  const patient = patients.find(
                    (p) => p.patient_unique_id === v,
                  );
                  if (patient) handlePatientSelect(patient);
                }}
              >
                <Listbox.Button className="w-full h-[33.5px] rounded-[8.38px] border-[1.05px] border-[#0EFF7B] dark:border-[#3C3C3C] bg-[#F5F6F5] dark:bg-black text-[#08994A] dark:text-white px-3 pr-8 text-sm font-[Helvetica] text-left relative truncate">
                  {patientInfo.patientID || "Select ID"}
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

                <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-100 dark:bg-black border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-md shadow-lg max-h-60 overflow-auto text-sm font-[Helvetica]">
                  {patients.map((p) => (
                    <Listbox.Option
                      key={p.id}
                      value={p.patient_unique_id}
                      className="cursor-pointer p-2 hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]"
                    >
                      {p.patient_unique_id}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Listbox>
            </div>
          </div>

          {/* Date inputs with dd.mm.yyyy format */}
          <div className="flex flex-row flex-wrap items-center gap-4 w-full justify-end">
            {/* From Date */}
            <div className="relative min-w-[180px]">
              <label
                htmlFor="dateFrom"
                className="block text-sm text-gray-600 dark:text-gray-400 mb-1"
              >
                From Date
              </label>
              <div className="relative">
                <input
                  id="dateFrom"
                  type="text"
                  value={dateFrom ? formatDateToDisplay(dateFrom) : ""}
                  placeholder="dd.mm.yyyy"
                  readOnly
                  onClick={() =>
                    document.getElementById("dateFromPicker")?.showPicker()
                  }
                  className="h-[33.5px] w-full bg-transparent rounded-[8.38px] border-[1.05px] border-[#0EFF7B] px-3 pr-10 text-sm text-[#08994A] dark:text-white cursor-pointer"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none" />
                <input
                  id="dateFromPicker"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => handleDateChange("from", e.target.value)}
                  max={getTodayDate()}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* To Date */}
            <div className="relative min-w-[180px]">
              <label
                htmlFor="dateTo"
                className="block text-sm text-gray-600 dark:text-gray-400 mb-1"
              >
                To Date
              </label>
              <div className="relative">
                <input
                  id="dateTo"
                  type="text"
                  value={dateTo ? formatDateToDisplay(dateTo) : ""}
                  placeholder="dd.mm.yyyy"
                  readOnly
                  onClick={() =>
                    document.getElementById("dateToPicker")?.showPicker()
                  }
                  className="h-[33.5px] w-full bg-transparent rounded-[8.38px] border-[1.05px] border-[#0EFF7B] px-3 pr-10 text-sm text-[#08994A] dark:text-white cursor-pointer"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none" />
                <input
                  id="dateToPicker"
                  type="date"
                  value={dateTo}
                  onChange={(e) => handleDateChange("to", e.target.value)}
                  max={getTodayDate()}
                  min={dateFrom}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleClearDates}
              disabled={!dateFrom && !dateTo}
              className={`mt-6 h-[33.5px] px-4 rounded-[8.38px] text-sm font-medium transition-all min-w-[100px] ${
                dateFrom || dateTo
                  ? "bg-gradient-to-r from-[#025126] to-[#0D7F41] text-white shadow-[0_0_8px_#0EFF7B66]"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              Clear Dates
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#F5F6F5] dark:bg-transparent border-[1.05px] border-[#0EFF7B] dark:border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B40] dark:shadow-[0px_0px_4px_0px_#FFFFFF1F] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                value={patientInfo.patientName}
                readOnly
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Patient ID
              </label>
              <input
                type="text"
                value={patientInfo.patientID}
                readOnly
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Age
              </label>
              <input
                type="text"
                value={fullPatient?.age || ""}
                readOnly
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Date
              </label>
              <input
                type="text"
                value={formatDateToDisplay(
                  new Date().toISOString().split("T")[0],
                )}
                readOnly
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
              />
            </div>
          </div>
          <div className="bg-[#F5F6F5] dark:bg-transparent border-[1.05px] border-[#0EFF7B] dark:border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B40] dark:shadow-[0px_0px_4px_0px_#FFFFFF1F] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Billing Staff
              </label>
              <input
                type="text"
                value={staffInfo.staffName}
                readOnly
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Staff ID
              </label>
              <input
                type="text"
                value={staffInfo.staffID}
                readOnly
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Patient Type
              </label>
              <input
                type="text"
                value="Outpatient"
                readOnly
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Address
              </label>
              <input
                type="text"
                value={fullPatient?.address || ""}
                readOnly
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
              />
            </div>
          </div>
          <div className="bg-[#F5F6F5] dark:bg-transparent border-[1.05px] border-[#0EFF7B] dark:border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B40] dark:shadow-[0px_0px_4px_0px_#FFFFFF1F] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Doctor Name
              </label>
              <div className="relative">
                <Listbox
                  value={patientInfo.doctorName}
                  onChange={handleDoctorChange}
                >
                  <Listbox.Button className="w-full h-[33.5px] rounded-[8.38px] border-[1.05px] border-[#0EFF7B] dark:border-[#3C3C3C] bg-[#F5F6F5] dark:bg-black text-[#08994A] dark:text-white shadow-[0_0_2.09px_#0EFF7B] outline-none focus:border-[#0EFF7B] focus:shadow-[0_0_4px_#0EFF7B] transition-all duration-300 px-3 pr-8 font-[Helvetica] text-sm text-left relative">
                    <span className="block truncate">
                      {patientInfo.doctorName || mainDoctor || "Select Doctor"}
                    </span>
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

                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-100 dark:bg-black border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-md shadow-lg max-h-60 overflow-auto text-sm font-[Helvetica] top-[100%] left-0">
                    <Listbox.Option
                      value=""
                      onClick={handleClearDoctor}
                      className="cursor-pointer select-none p-2 text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]"
                    >
                      Clear / No Doctor
                    </Listbox.Option>

                    {doctors.map((doctor) => (
                      <Listbox.Option
                        key={doctor.id || doctor.full_name}
                        value={
                          doctor.full_name || doctor.name || "Unknown Doctor"
                        }
                        className="cursor-pointer select-none p-2 text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]"
                      >
                        {doctor.full_name || doctor.name || "Unknown Doctor"}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Listbox>
              </div>
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Payment mode
              </label>
              <div className="relative">
                <Listbox
                  value={patientInfo.paymentMode}
                  onChange={(value) => handleInputChange(value, "paymentMode")}
                >
                  <Listbox.Button className="w-full h-[33.5px] rounded-[8.38px] border-[1.05px] border-[#0EFF7B] dark:border-[#3C3C3C] bg-[#F5F6F5] dark:bg-black text-[#08994A] dark:text-white shadow-[0_0_2.09px_#0EFF7B] outline-none focus:border-[#0EFF7B] focus:shadow-[0_0_4px_#0EFF7B] transition-all duration-300 px-3 pr-8 font-[Helvetica] text-sm text-left relative">
                    <span className="block truncate">{patientInfo.paymentMode}</span>
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
                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-100 dark:bg-black border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-md shadow-lg max-h-60 overflow-auto text-sm font-[Helvetica] top-[100%] left-0">
                    {paymentModes.map((mode) => (
                      <Listbox.Option
                        key={mode}
                        value={mode}
                        className="cursor-pointer select-none p-2 text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]"
                      >
                        {mode}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Listbox>
              </div>
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Payment Type
              </label>
              <div className="relative">
                <Listbox
                  value={patientInfo.paymentType}
                  onChange={(value) => handleInputChange(value, "paymentType")}
                >
                  <Listbox.Button className="w-full h-[33.5px] rounded-[8.38px] border-[1.05px] border-[#0EFF7B] dark:border-[#3C3C3C] bg-[#F5F6F5] dark:bg-black text-[#08994A] dark:text-white shadow-[0_0_2.09px_#0EFF7B] outline-none focus:border-[#0EFF7B] focus:shadow-[0_0_4px_#0EFF7B] transition-all duration-300 px-3 pr-8 font-[Helvetica] text-sm text-left relative">
                    <span className="block truncate">{patientInfo.paymentType || "Full Payment"}</span>
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
                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-100 dark:bg-black border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-md shadow-lg max-h-60 overflow-auto text-sm font-[Helvetica] top-[100%] left-0">
                    {paymentTypes.map((type) => (
                      <Listbox.Option
                        key={type}
                        value={type}
                        className="cursor-pointer select-none p-2 text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]"
                      >
                        {type}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Listbox>
              </div>
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Payment Status
              </label>
              <div className="relative">
                <Listbox
                  value={patientInfo.paymentStatus}
                  onChange={(value) =>
                    handleInputChange(value, "paymentStatus")
                  }
                >
                  <Listbox.Button className="w-full h-[33.5px] rounded-[8.38px] border-[1.05px] border-[#0EFF7B] dark:border-[#3C3C3C] bg-[#F5F6F5] dark:bg-black text-[#08994A] dark:text-white shadow-[0_0_2.09px_#0EFF7B] outline-none focus:border-[#0EFF7B] focus:shadow-[0_0_4px_#0EFF7B] transition-all duration-300 px-3 pr-8 font-[Helvetica] text-sm text-left relative">
                    <span className="block truncate">{patientInfo.paymentStatus || "Paid"}</span>
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
                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-100 dark:bg-black border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-md shadow-lg max-h-60 overflow-auto text-sm font-[Helvetica] top-[100%] left-0">
                    {paymentStatuses.map((status) => (
                      <Listbox.Option
                        key={status}
                        value={status}
                        className="cursor-pointer select-none p-2 text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]"
                      >
                        {status}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Listbox>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#F5F6F5] dark:bg-transparent border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-xl p-4">
          <h3 className="text-[#08994A] dark:text-[#0EFF7B] mb-3">
            Billing Information
          </h3>

          {duplicateError && (
            <div className="mb-3 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
              ⚠️ {duplicateError}
            </div>
          )}

          {loading ? (
            <p>Loading medicines...</p>
          ) : billingItems.length === 0 ? (
            <p>No medicines allocated to this patient.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-[#08994A] dark:text-[#0EFF7B] bg-gray-200 dark:bg-[#091810]">
                <tr>
                  <th className="p-2">S.No</th>
                  <th className="p-2">Item code</th>
                  <th className="p-2 px-9">Name</th>
                  <th className="p-1">Frequency</th>
                  <th className="p-2">Allocation Date</th>
                  <th className="p-2">Rack no</th>
                  <th className="p-2">Shelf no</th>
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Unit price</th>
                  <th className="p-2">Discount</th>
                  <th className="p-2">Tax</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Remove</th>
                </tr>
              </thead>
              <tbody className="text-[#08994A] dark:text-gray-300 bg-gray-100 dark:bg-black">
                {billingItems.map((item, i) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
                  >
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.sNo}
                        readOnly
                        className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
                        style={{
                          border: "2px solid #0EFF7B1A",
                          boxShadow: "0px 0px 2px 0px #0EFF7B",
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.itemCode}
                          onChange={(e) =>
                            handleBillingChange(i, "itemCode", e.target.value)
                          }
                          className={`bg-transparent border p-1 rounded-md w-full text-[#08994A] dark:text-white ${
                            item.itemCode &&
                            stockData[item.itemCode]?.quantity === 0
                              ? "border-red-500 dark:border-red-500"
                              : item.itemCode &&
                                  stockData[item.itemCode]?.quantity < 10
                                ? "border-yellow-500 dark:border-yellow-500"
                                : "border-[#0EFF7B] dark:border-[#0EFF7B1A]"
                          }`}
                          style={{
                            border: "2px solid",
                            boxShadow: "0px 0px 2px 0px #0EFF7B",
                          }}
                          placeholder="Enter item code"
                        />
                        {item.itemCode && stockData[item.itemCode] && (
                          <div className="absolute -bottom-4 right-0 text-[10px] font-bold px-1 rounded">
                            {stockData[item.itemCode].quantity === 0 ? (
                              <span className="text-red-600 dark:text-red-400">
                                OUT
                              </span>
                            ) : stockData[item.itemCode].quantity < 10 ? (
                              <span className="text-yellow-600 dark:text-yellow-400">
                                Stock: {stockData[item.itemCode].quantity}
                              </span>
                            ) : (
                              <span className="text-green-600 dark:text-green-400">
                                ✓
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          !item.isFromAPI &&
                          handleBillingChange(i, "name", e.target.value)
                        }
                        readOnly={item.isFromAPI}
                        className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
                        style={{
                          border: "2px solid #0EFF7B1A",
                          boxShadow: "0px 0px 2px 0px #0EFF7B",
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.frequency}
                        // readOnly={item.isFromAPI}
                        className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
                        style={{
                          border: "2px solid #0EFF7B1A",
                          boxShadow: "0px 0px 2px 0px #0EFF7B",
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={formatDateToDisplay(item.allocationDate)}
                        readOnly
                        className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
                        style={{
                          border: "2px solid #0EFF7B1A",
                          boxShadow: "0px 0px 2px 0px #0EFF7B",
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.rackNo}
                        onChange={(e) =>
                          !item.isFromAPI &&
                          handleBillingChange(i, "rackNo", e.target.value)
                        }
                        readOnly={item.isFromAPI}
                        className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
                        style={{
                          border: "2px solid #0EFF7B1A",
                          boxShadow: "0px 0px 2px 0px #0EFF7B",
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.shelfNo}
                        onChange={(e) =>
                          !item.isFromAPI &&
                          handleBillingChange(i, "shelfNo", e.target.value)
                        }
                        readOnly={item.isFromAPI}
                        className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
                        style={{
                          border: "2px solid #0EFF7B1A",
                          boxShadow: "0px 0px 2px 0px #0EFF7B",
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleBillingChange(i, "quantity", e.target.value)
                        }
                        className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
                        style={{
                          border: "2px solid #0EFF7B1A",
                          boxShadow: "0px 0px 2px 0px #0EFF7B",
                        }}
                        min="1"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          !item.isFromAPI &&
                          handleBillingChange(i, "unitPrice", e.target.value)
                        }
                        readOnly={item.isFromAPI}
                        className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
                        style={{
                          border: "2px solid #0EFF7B1A",
                          boxShadow: "0px 0px 2px 0px #0EFF7B",
                        }}
                        step="0.01"
                        min="0"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.discount}
                        onChange={(e) =>
                          handleBillingChange(i, "discount", e.target.value)
                        }
                        className={`bg-transparent border p-1 rounded-md w-full text-[#08994A] dark:text-white ${
                          item.discount && (parseFloat(item.discount) > 100 ||
                          parseFloat(item.discount) < 0)
                            ? "border-red-500 dark:border-red-500"
                            : "border-[#0EFF7B] dark:border-[#0EFF7B1A]"
                        }`}
                        style={{
                          border: "2px solid",
                          boxShadow: "0px 0px 2px 0px #0EFF7B",
                        }}
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.tax}
                          onChange={(e) =>
                            handleBillingChange(i, "tax", e.target.value)
                          }
                          className={`bg-transparent border p-1 rounded-md w-full text-[#08994A] dark:text-white ${
                            item.tax && (parseFloat(item.tax) > 100 ||
                            parseFloat(item.tax) < 1)
                              ? "border-red-500 dark:border-red-500"
                              : "border-[#0EFF7B] dark:border-[#0EFF7B1A]"
                          }`}
                          style={{
                            border: "2px solid",
                            boxShadow: "0px 0px 2px 0px #0EFF7B",
                          }}
                          placeholder="10"
                        />
                        {item.tax && (parseFloat(item.tax) > 100 ||
                          parseFloat(item.tax) < 1) && (
                          <span className="absolute -bottom-4 left-0 text-[10px] text-red-500 whitespace-nowrap">
                            Must be 1-100%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.total}
                        readOnly
                        className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
                        style={{
                          border: "2px solid #0EFF7B1A",
                          boxShadow: "0px 0px 2px 0px #0EFF7B",
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <Trash2
                        className="w-5 h-5 text-red-500 dark:text-[#0EFF7B] cursor-pointer hover:text-red-600 dark:hover:text-red-600"
                        onClick={() => handleRemoveItem(i)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex justify-end mt-4">
            <button
              onClick={handleAddMedicine}
              disabled={!selectedPatientId}
              className={`flex items-center justify-center border-b-[2px] border-[#0EFF7B] gap-2 w-[200px] h-[40px] rounded-[8px] ${
                selectedPatientId
                  ? "bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white hover:scale-105"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              } font-medium text-[14px] transition`}
            >
              <Plus
                size={18}
                className={selectedPatientId ? "text-white" : "text-gray-400"}
              />{" "}
              Add
            </button>
          </div>

          <div className="mt-6 grid grid-cols-5 gap-3 text-sm text-gray-600 dark:text-gray-200">
            <div className="col-span-1"></div>
            <div className="col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex justify-between bg-[#F5F6F5] dark:bg-[#0EFF7B1A] border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-2 text-[#08994A] dark:text-white">
                <span>Sub total</span> <span>{totals.subTotal}</span>
              </div>
              <div className="flex justify-between bg-[#F5F6F5] dark:bg-[#0EFF7B1A] border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-2 text-[#08994A] dark:text-white">
                <span>
                  CGST ({(parseFloat(totals.avgTaxPercent) / 2).toFixed(2)}%)
                </span>
                <span>{totals.cgst}</span>
              </div>
              <div className="flex justify-between bg-[#F5F6F5] dark:bg-[#0EFF7B1A] border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-2 text-[#08994A] dark:text-white">
                <span>
                  SGST ({(parseFloat(totals.avgTaxPercent) / 2).toFixed(2)}%)
                </span>
                <span>{totals.sgst}</span>
              </div>
              <div className="flex justify-between bg-[#F5F6F5] dark:bg-[#0EFF7B1A] border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-2 text-[#08994A] dark:text-white">
                <span>Discount amount</span> <span>{totals.discountAmt}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="flex justify-between w-64 bg-[#F5F6F5] dark:bg-[#0EFF7B1A] border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-3 text-lg font-semibold text-[#08994A] dark:text-[#0EFF7B]">
              <span>Net Amount</span>
              <span>{totals.net}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md text-gray-600 dark:text-gray-300 hover:text-[#08994A] dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={generateBill}
              className="flex items-center justify-center w-[200px] h-[40px] gap-2 rounded-[8px] border-b-[2px] border-[#0EFF7B] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium text-[14px] hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingBill ? "Generating..." : "Generate Bill"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bill;
