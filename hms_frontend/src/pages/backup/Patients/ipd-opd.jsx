// import React, { useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Search,
//   Filter,
//   Plus,
//   Edit2,
//   Trash2,
//   X,
//   ChevronDown,
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { Listbox } from "@headlessui/react";
// import EditPatient from "./EditPatient";
// import DeletePatient from "./DeletePatient";

// const AppointmentListIPD = () => {
//   const [activeMainTab, setActiveMainTab] = useState("In-Patients");
//   const [activeFilter, setActiveFilter] = useState("All");
//   const [selectedAppointments, setSelectedAppointments] = useState([]);
//   const [selectedAppointment, setSelectedAppointment] = useState(null);
//   const [showEditPopup, setShowEditPopup] = useState(false);
//   const [showDeletePopup, setShowDeletePopup] = useState(false);
//   const [showFilterPopup, setShowFilterPopup] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();
//   const itemsPerPage = 10;
//   const [currentPage, setCurrentPage] = useState(1);

//   const [filtersData, setFiltersData] = useState({
//     patientName: "",
//     patientId: "",
//     department: "",
//     doctor: "",
//     status: "",
//     date: "",
//   });

//   const tabs = ["In-Patients", "Out-Patients"];
//   const filters = ["All", "New", "Severe", "Normal", "Completed", "Cancelled"];

//   const appointments = [
//     {
//       patient: "Prakash",
//       date: "2025-07-12",
//       patientId: "SAH257384",
//       department: "Orthopedics",
//       doctor: "Dr.Sravan",
//       room: "RM 305",
//       treatment: "Physiotherapy",
//       discharge: "Pending",
//       status: "Completed",
//     },
//     {
//       patient: "Sravan",
//       date: "2025-07-12",
//       patientId: "SAH257385",
//       department: "Neurology",
//       doctor: "Dr.Naveen",
//       room: "RM 405",
//       treatment: "Medication",
//       discharge: "In-progress",
//       status: "Severe",
//     },
//     {
//       patient: "Prakash",
//       date: "2025-07-12",
//       patientId: "SAH257386",
//       department: "Cardiology",
//       doctor: "Dr.Prakash",
//       room: "N/A",
//       treatment: "Surgery",
//       discharge: "Done",
//       status: "Cancelled",
//     },
//   ];

//   const statusColors = {
//     Completed: "bg-green-900 text-green-300",
//     Cancelled: "bg-gray-700 text-gray-300",
//     Normal: "bg-blue-900 text-blue-300",
//     Severe: "bg-red-900 text-red-300",
//     New: "bg-purple-900 text-purple-300",
//   };

//   const filteredAppointments = useMemo(() => {
//     return appointments.filter((appt) => {
//       if (
//         searchTerm &&
//         !(
//           appt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           appt.patientId.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       ) {
//         return false;
//       }
//       if (activeFilter !== "All" && appt.status !== activeFilter) {
//         return false;
//       }
//       if (
//         filtersData.patientName &&
//         !appt.patient
//           .toLowerCase()
//           .includes(filtersData.patientName.toLowerCase())
//       ) {
//         return false;
//       }
//       if (
//         filtersData.patientId &&
//         !appt.patientId
//           .toLowerCase()
//           .includes(filtersData.patientId.toLowerCase())
//       ) {
//         return false;
//       }
//       if (
//         filtersData.department &&
//         appt.department !== filtersData.department
//       ) {
//         return false;
//       }
//       if (filtersData.doctor && appt.doctor !== filtersData.doctor) {
//         return false;
//       }
//       if (filtersData.status && appt.status !== filtersData.status) {
//         return false;
//       }
//       if (filtersData.date && appt.date !== filtersData.date) {
//         return false;
//       }
//       return true;
//     });
//   }, [appointments, searchTerm, activeFilter, filtersData]);

//   const handleCheckboxChange = (index) => {
//     const globalIndex = (currentPage - 1) * itemsPerPage + index;
//     if (selectedAppointments.includes(globalIndex)) {
//       setSelectedAppointments(
//         selectedAppointments.filter((idx) => idx !== globalIndex)
//       );
//     } else {
//       setSelectedAppointments([...selectedAppointments, globalIndex]);
//     }
//   };

//   const handleSelectAll = () => {
//     if (selectedAppointments.length === filteredAppointments.length) {
//       setSelectedAppointments([]);
//     } else {
//       setSelectedAppointments(filteredAppointments.map((_, idx) => idx));
//     }
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFiltersData({ ...filtersData, [name]: value });
//   };

//   const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
//   const currentAppointments = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
//   }, [currentPage, filteredAppointments, itemsPerPage]);

//   const handleClearFilters = () => {
//     setFiltersData({
//       patientName: "",
//       patientId: "",
//       department: "",
//       doctor: "",
//       status: "",
//       date: "",
//     });
//     setActiveFilter("All");
//     setShowFilterPopup(false); // Close popup after clearing filters
//   };

//   const Dropdown = ({ label, value, onChange, options }) => (
//     <div>
//       <label
//         className="text-sm text-black dark:text-white"
//         style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//       >
//         {label}
//       </label>
//       <Listbox value={value} onChange={onChange}>
//         <div className="relative mt-1 w-[228px]">
//           <Listbox.Button
//             className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]"
//             style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//           >
//             {value || "Select"}
//             <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
//               <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
//             </span>
//           </Listbox.Button>
//           <Listbox.Options className="absolute mt-1 w-full rounded-[12px] bg-white dark:bg-black shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A] left-[2px]">
//             {options.map((option, idx) => (
//               <Listbox.Option
//                 key={idx}
//                 value={option}
//                 className={({ active, selected }) =>
//                   `cursor-pointer select-none py-2 px-2 text-sm rounded-md
//               ${
//                 active
//                   ? "bg-[#0EFF7B33] text-[#0EFF7B]"
//                   : "text-black dark:text-white"
//               }
//               ${selected ? "font-medium text-[#0EFF7B]" : ""}`
//                 }
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 {option}
//               </Listbox.Option>
//             ))}
//           </Listbox.Options>
//         </div>
//       </Listbox>
//     </div>
//   );

//   return (
//     <div className="mt-[80px] mb-4 bg-white dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-4 w-full max-w-[1400px] mx-auto flex flex-col bg-white dark:bg-transparent overflow-hidden relative">
//       <div
//         className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
//         style={{
//           background:
//             "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
//           zIndex: 0,
//         }}
//       ></div>
//       {/* Gradient Border */}
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           borderRadius: "10px",
//           padding: "2px",
//           background:
//             "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//           WebkitMask:
//             "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//           WebkitMaskComposite: "xor",
//           maskComposite: "exclude",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       ></div>

//       {/* Header */}
//       <div className="flex justify-between mt-4 items-center mb-2 relative z-10">
//         <h2 className="text-black dark:text-white font-[Helvetica] text-xl font-semibold">
//           IPD - Patient Lists
//         </h2>
//         <button
//           onClick={() => navigate("/patients/new-registration")}
//           className="flex items-center gap-2 bg-[linear-gradient(92.18deg,#025126_3.26%,#0D7F41_50.54%,#025126_97.83%)] border-b-[2px] border-[#0EFF7B] shadow-[0px_2px_12px_0px_#00000040] hover:opacity-90 text-white font-semibold px-4 py-2 rounded-[8px] transition duration-300 ease-in-out"
//         >
//           <Plus size={18} className="text-white font-[Helvetica]" /> Add
//           Patients
//         </button>
//       </div>

//       {/* Today's Total Section */}
//       <div className="mb-3 min-w-[800px] relative z-10">
//         <div className="flex items-center gap-4 rounded-xl">
//           <div className="flex items-center gap-3">
//             <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
//               Today's Total
//             </span>
//             <span className="w-6 h-6 flex items-center font-[Helvetica] text-[12px] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#0D2016] dark:bg-[#14DC6F]">
//               150
//             </span>
//           </div>
//           <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
//           <div className="flex items-center gap-2">
//             <span className="font-inter font-normal text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
//               In-Patients
//             </span>
//             <span className="w-6 h-6 flex items-center text-[12px] font-[Helvetica] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#080C4C] dark:bg-[#0D7F41]">
//               47
//             </span>
//           </div>
//           <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
//           <div className="flex items-center gap-2">
//             <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
//               Out-Patients
//             </span>
//             <span className="w-6 h-6 flex items-center font-[Helvetica] justify-center text-[12px] text-white gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#7D3737] dark:bg-[#D97706]">
//               12
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex justify-between items-center mb-4 relative z-10">
//         <div className="flex gap-4">
//           {tabs.map((tab) => (
//             <button
//               key={tab}
//               className={`min-w-[104px] h-[31px] hover:bg-[#0EFF7B1A] rounded-[4px] font-[Helvetica] text-[13px] font-normal transition duration-300 ease-in-out
//                 ${
//                   activeMainTab === tab
//                     ? "bg-[#025126] shadow-[0px_0px_20px_0px_#0EFF7B40] font-[Helvetica] text-white border-[#0EFF7B]"
//                     : "bg-gray-100 text-gray-800 border-gray-300 font-[Helvetica] dark:bg-[#1E1E1E] dark:text-gray-300 dark:border-[#3A3A3A]"
//                 }`}
//               onClick={() =>
//                 tab === "Out-Patients"
//                   ? navigate("/patients/out-patients")
//                   : setActiveMainTab(tab)
//               }
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {/* Search and Filter */}
//         <div className="flex gap-4">
//           <div className="flex items-center w-[315px] h-[32px] gap-2 rounded-[8px] px-4 py-1 border border-gray-300 bg-gray-100 dark:bg-[#1E1E1E] dark:border-[#3A3A3A] shadow">
//             <Search size={18} className="text-green-600 dark:text-green-400" />
//             <input
//               type="text"
//               placeholder="Search patient name or ID"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="bg-transparent px-2 text-xs outline-none font-normal font-[Helvetica] text-black dark:text-white placeholder-gray-400 dark:placeholder-[#00A048] w-48 leading-none tracking-normal"
//             />
//           </div>
//           <button
//             onClick={() => setShowFilterPopup(true)}
//             className="flex items-center justify-center w-[32px] h-[32px] rounded-[8px] border border-gray-300 bg-gray-100 hover:bg-green-200 dark:bg-[#1E1E1E] dark:border-[#3A3A3A] dark:hover:bg-green-900 transition-colors duration-200"
//           >
//             <Filter size={18} className="text-green-600 dark:text-green-400" />
//           </button>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="w-full overflow-x-auto h-[50px] flex items-center gap-3 mb-8 px-2 relative z-10">
//         <div className="flex gap-3 min-w-full">
//           {filters.map((f) => (
//             <button
//               key={f}
//               className={`relative min-w-[162px] h-[35px] flex items-center justify-center rounded-lg px-3 text-sm font-medium transition-all border-b-[1px]
//                 ${
//                   activeFilter === f
//                     ? "bg-[#08994A] text-white font-[Helvetica] dark:bg-green-900 dark:text-white"
//                     : "text-gray-800 hover:text-green-600 font-[Helvetica] dark:text-white dark:hover:text-white"
//                 }`}
//               onClick={() => setActiveFilter(f)}
//             >
//               {f}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* === TABLE === */}
//       <div className="overflow-x-auto">
//         <table className="w-full text-left text-sm">
//           <thead className="text-[#0EFF7B] dark:text-[#0EFF7B] font-[Helvetica] dark:bg-[#091810] border-b border-gray-300 dark:border-gray-700">
//             <tr>
//               <th className="py-3 px-2">
//                 <input
//                   type="checkbox"
//                   className="w-5 h-5 rounded-md border border-[#0EFF7B] dark:border-gray-600 accent-[#08994A] dark:accent-green-500 bg-white dark:bg-transparent focus:outline-none cursor-pointer transition-colors"
//                   checked={
//                     filteredAppointments.length > 0 &&
//                     selectedAppointments.length === filteredAppointments.length
//                   }
//                   onChange={handleSelectAll}
//                 />
//               </th>
//               <th>Patient Name</th>
//               <th>Patient ID</th>
//               <th>Department</th>
//               <th>Doctor</th>
//               <th>Room no</th>
//               <th>Treatment Type</th>
//               <th>Discharge Status</th>
//               <th>Status</th>
//               <th className="text-center">Edit</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentAppointments.length > 0 ? (
//               currentAppointments.map((appt, idx) => {
//                 const globalIndex = (currentPage - 1) * itemsPerPage + idx;
//                 return (
//                   <tr
//                     key={globalIndex}
//                     className="border-b border-gray-300 dark:border-gray-800 font-[Helvetica]"
//                   >
//                     <td className="px-2">
//                       <input
//                         type="checkbox"
//                         className="w-5 h-5 rounded-md border border-[#0EFF7B] dark:border-gray-600 accent-[#08994A] dark:accent-green-500 bg-white dark:bg-transparent focus:outline-none cursor-pointer transition-colors"
//                         checked={selectedAppointments.includes(globalIndex)}
//                         onChange={() => handleCheckboxChange(idx)}
//                       />
//                     </td>
//                     <td className="py-3">
//                       <div className="font-medium text-black dark:text-white">
//                         {appt.patient}
//                       </div>
//                       <div className="text-xs text-gray-600 dark:text-gray-400">
//                         {appt.date}
//                       </div>
//                     </td>
//                     <td className="text-black dark:text-white">
//                       {appt.patientId}
//                     </td>
//                     <td className="text-black dark:text-white">
//                       {appt.department}
//                     </td>
//                     <td className="text-black dark:text-white">
//                       {appt.doctor}
//                     </td>
//                     <td className="text-black dark:text-white">{appt.room}</td>
//                     <td className="text-black dark:text-white">
//                       {appt.treatment}
//                     </td>
//                     <td className="text-black dark:text-white">
//                       {appt.discharge}
//                     </td>
//                     <td>
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           statusColors[appt.status]
//                         }`}
//                       >
//                         {appt.status}
//                       </span>
//                     </td>
//                     <td className="text-center">
//                       <div className="flex justify-center gap-2">
//                         <Edit2
//                           size={16}
//                           onClick={() => {
//                             setSelectedAppointment(appt);
//                             setShowEditPopup(true);
//                           }}
//                           className="text-[#08994A] dark:text-blue-400 cursor-pointer"
//                         />
//                         <Trash2
//                           size={16}
//                           onClick={() => {
//                             setSelectedAppointment(appt);
//                             setShowDeletePopup(true);
//                           }}
//                           className="text-[#08994A] dark:text-gray-400 cursor-pointer"
//                         />
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })
//             ) : (
//               <tr>
//                 <td
//                   colSpan="10"
//                   className="text-center py-6 text-gray-600 dark:text-gray-400 italic"
//                 >
//                   No appointments found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center mt-4 bg-white dark:bg-black p-4 rounded gap-x-4 dark:border-[#1E1E1E]">
//         <div className="text-sm text-black dark:text-white">
//           Page{" "}
//           <span className="text-[#08994A] dark:text-[#0EFF7B] font-semibold">
//             {currentPage}
//           </span>{" "}
//           of {totalPages} ({(currentPage - 1) * itemsPerPage + 1} to{" "}
//           {Math.min(currentPage * itemsPerPage, filteredAppointments.length)}{" "}
//           from {filteredAppointments.length} Patients)
//         </div>
//         <div className="flex items-center gap-x-2">
//           <button
//             onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//             disabled={currentPage === 1}
//             className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
//               currentPage === 1
//                 ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
//                 : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
//             }`}
//           >
//             <ChevronLeft size={12} className="text-[#08994A] dark:text-white" />
//           </button>
//           <button
//             onClick={() =>
//               setCurrentPage(Math.min(totalPages, currentPage + 1))
//             }
//             disabled={currentPage === totalPages}
//             className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
//               currentPage === totalPages
//                 ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
//                 : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
//             }`}
//           >
//             <ChevronRight
//               size={12}
//               className="text-[#08994A] dark:text-white"
//             />
//           </button>
//         </div>
//       </div>

//       {/* === FILTER POPUP === */}
//       {showFilterPopup && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//           <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
//             <div
//               className="w-[505px] rounded-[19px] bg-white dark:bg-[#000000] text-black dark:text-white p-6 shadow-lg relative"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               {" "}
//               {/* Gradient Border */}
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
//                 <h3
//                   className="text-black dark:text-white font-medium text-[16px] leading-[19px]"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   Filter Appointment
//                 </h3>
//                 <button
//                   onClick={() => setShowFilterPopup(false)}
//                   className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-white dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
//                 >
//                   <X size={16} className="text-black dark:text-white" />
//                 </button>
//               </div>
//               {/* Filter Form */}
//               <div className="grid grid-cols-2 gap-6">
//                 <div>
//                   <label
//                     className="text-sm text-black dark:text-white"
//                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                   >
//                     Patient Name
//                   </label>
//                   <input
//                     name="patientName"
//                     value={filtersData.patientName}
//                     onChange={handleFilterChange}
//                     placeholder="enter patient name"
//                     className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
//                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                   />
//                 </div>
//                 <div>
//                   <label
//                     className="text-sm text-black dark:text-white"
//                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                   >
//                     Patient ID
//                   </label>
//                   <input
//                     name="patientId"
//                     value={filtersData.patientId}
//                     onChange={handleFilterChange}
//                     placeholder="enter patient ID"
//                     className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
//                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                   />
//                 </div>
//                 <Dropdown
//                   label="Department"
//                   value={filtersData.department}
//                   onChange={(val) =>
//                     setFiltersData({ ...filtersData, department: val })
//                   }
//                   options={["Orthopedics", "Cardiology", "Neurology"]}
//                 />
//                 <Dropdown
//                   label="Status"
//                   value={filtersData.status}
//                   onChange={(val) =>
//                     setFiltersData({ ...filtersData, status: val })
//                   }
//                   options={["Completed", "Severe", "Normal", "Cancelled"]}
//                 />
//                 <Dropdown
//                   label="Doctor"
//                   value={filtersData.doctor}
//                   onChange={(val) =>
//                     setFiltersData({ ...filtersData, doctor: val })
//                   }
//                   options={[
//                     "Dr.Sravan",
//                     "Dr.Ramesh",
//                     "Dr.Naveen",
//                     "Dr.Prakash",
//                   ]}
//                 />
//                 <div>
//                   <label
//                     className="text-sm text-black dark:text-white"
//                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                   >
//                     Date
//                   </label>
//                   <div className="relative mt-1">
//                     <input
//                       type="date"
//                       name="date"
//                       value={filtersData.date}
//                       onChange={handleFilterChange}
//                       className="w-[228px] h-[33px] px-3 pr-10 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none"
//                       style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                     />
//                     <Calendar className="absolute right-8 top-1/2 -translate-y-1/2 text-[#0EFF7B] dark:text-[#0EFF7B] pointer-events-none w-4 h-4" />
//                   </div>
//                 </div>
//               </div>
//               {/* Buttons */}
//               <div className="flex justify-center gap-2 mt-8">
//                 <button
//                   onClick={handleClearFilters}
//                   className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-[#3A3A3A] text-gray-800 drak:text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] opacity-100 bg-white dark:bg-transparent dark:text-white"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   Clear
//                 </button>
//                 <button
//                   onClick={() => setShowFilterPopup(false)}
//                   className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition"
//                   style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//                 >
//                   Filter
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showEditPopup && (
//         <EditPatient
//           onClose={() => setShowEditPopup(false)}
//           appointment={selectedAppointment}
//         />
//       )}
//       {showDeletePopup && (
//         <DeletePatient
//           onClose={() => setShowDeletePopup(false)}
//           onConfirm={() => {
//             console.log("Deleting", selectedAppointment);
//             setShowDeletePopup(false);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default AppointmentListIPD;

// src/components/AppointmentListIPD.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Listbox } from "@headlessui/react";
import EditPatientPopup from "./EditPatient"; // <-- Updated import
import DeletePatient from "./DeletePatient";
import { successToast, errorToast } from "../../components/Toast.jsx";

const API = "http://localhost:8000";

const AppointmentListIPD = () => {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [activeTab, setActiveTab] = useState("In-Patients");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selected, setSelected] = useState([]);
  const [selAppt, setSelAppt] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    patientName: "",
    patientId: "",
    department: "",
    doctor: "",
    status: "",
    date: "",
  });

  const navigate = useNavigate();
  const perPage = 10;

  const statusFilters = ["All", "Active", "Completed", "Cancelled"];

  // ---------- FETCH ----------
  const fetchData = async (p = page, s = search) => {
    setLoading(true);
    setErr("");
    try {
      const url = new URL(`${API}/patients`);
      url.searchParams.set("page", p);
      url.searchParams.set("limit", perPage);
      if (s) url.searchParams.set("search", s);

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const mapped = (json.patients || []).map((p) => ({
        id: p.id, // Django PK (normal id)
        patient: p.full_name,
        date: p.date_of_registration
          ? new Date(p.date_of_registration).toLocaleDateString("en-GB")
          : "N/A",
        patientId: p.patient_unique_id,
        department: p.department__name || "N/A",
        doctor: p.staff__full_name || "N/A",
        room: p.room_number || "N/A",
        treatment: p.appointment_type || "N/A",
        discharge: p.discharge || "Pending",
        status: p.casualty_status || "Active",
        photo_url: p.photo_url || null,
      }));

      setAppointments(mapped);
      setTotal(json.total || 0);
      setPages(json.pages || 1);
      setPage(json.page || p);
    } catch (e) {
      console.error(e);
      setErr("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchData(1, search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Page change
  useEffect(() => {
    fetchData(page, search);
  }, [page]);

  // ---------- FILTER ----------
  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (activeFilter !== "All" && a.status !== activeFilter) return false;
      if (
        filters.patientName &&
        !a.patient.toLowerCase().includes(filters.patientName.toLowerCase())
      )
        return false;
      if (
        filters.patientId &&
        !a.patientId.toLowerCase().includes(filters.patientId.toLowerCase())
      )
        return false;
      if (filters.department && a.department !== filters.department)
        return false;
      if (filters.doctor && a.doctor !== filters.doctor) return false;
      if (filters.status && a.status !== filters.status) return false;
      if (filters.date && a.date !== filters.date) return false;
      return true;
    });
  }, [appointments, activeFilter, filters]);

  const current = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [page, filtered]);

  // ---------- CHECKBOX ----------
  const toggle = (idx) => {
    const gIdx = (page - 1) * perPage + idx;
    setSelected((p) =>
      p.includes(gIdx) ? p.filter((i) => i !== gIdx) : [...p, gIdx]
    );
  };
  const selectAll = () => {
    if (selected.length === current.length) setSelected([]);
    else setSelected(current.map((_, i) => (page - 1) * perPage + i));
  };

  // ---------- FILTER HANDLERS ----------
  const onFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };
  const clearFilters = () => {
    setFilters({
      patientName: "",
      patientId: "",
      department: "",
      doctor: "",
      status: "",
      date: "",
    });
    setActiveFilter("All");
    setShowFilter(false);
    setPage(1);
  };

  // ---------- REFRESH AFTER UPDATE ----------
  const refreshData = async () => {
    await fetchData(page, search);
  };

  // ---------- DELETE ----------
  const onDelete = async () => {
    if (!selAppt?.patientId) {
      errorToast("No patient selected");
      return;
    }

    try {
      const pid = selAppt.patientId; // <-- correct ID
      const r = await fetch(`${API}/patients/${pid}`, {
        method: "DELETE",
      });

      if (!r.ok) {
        const txt = await r.text();
        throw new Error(txt || "Delete failed");
      }

      // ---- SUCCESS ----
      successToast(`Patient "${selAppt.patient}" deleted successfully!`);
      await refreshData(); // refresh current page
      setShowDel(false);
      setSelAppt(null);
    } catch (e) {
      console.error(e);
      errorToast(e.message || "Failed to delete patient");
    }
  };

  // ---------- DROPDOWN ----------
  const Dropdown = ({ label, value, onChange, options }) => (
    <div>
      <label
        className="text-sm text-black dark:text-white"
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        {label}
      </label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1 w-[228px]">
          <Listbox.Button
            className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            {value || "Select"}
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 w-full rounded-[12px] bg-white dark:bg-black shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A] left-[2px]">
            {options.map((o) => (
              <Listbox.Option
                key={o}
                value={o}
                className={({ active, selected }) => `
                  cursor-pointer select-none py-2 px-2 text-sm rounded-md
                  ${
                    active
                      ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                      : "text-black dark:text-white"
                  }
                  ${selected ? "font-medium text-[#0EFF7B]" : ""}`}
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                {o}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );

  const statusColors = {
    Active: "bg-indigo-900 text-indigo-300",
    Completed: "bg-green-900 text-green-300",
    Cancelled: "bg-gray-700 text-gray-300",
  };

  return (
    <div className="mt-[80px] mb-4 bg-white dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-4 w-full max-w-[1400px] mx-auto flex flex-col bg-white dark:bg-transparent overflow-hidden relative">
      {/* Gradient Border */}
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

      {/* Header */}
      <div className="flex justify-between mt-4 items-center mb-2 relative z-10">
        <h2 className="text-black dark:text-white font-[Helvetica] text-xl font-semibold">
          IPD - Patient Lists
        </h2>
        <button
          onClick={() => navigate("/patients/new-registration")}
          className="flex items-center gap-2 bg-[linear-gradient(92.18deg,#025126_3.26%,#0D7F41_50.54%,#025126_97.83%)] border-b-[2px] border-[#0EFF7B] shadow-[0px_2px_12px_0px_#00000040] hover:opacity-90 text-white font-semibold px-4 py-2 rounded-[8px] transition duration-300 ease-in-out"
        >
          <Plus size={18} className="text-white font-[Helvetica]" /> Add
          Patients
        </button>
      </div>

      {/* Today's Total */}
      <div className="mb-3 min-w-[800px] relative z-10">
        <div className="flex items-center gap-4 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
              Today's Total
            </span>
            <span className="w-6 h-6 flex items-center font-[Helvetica] text-[12px] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#0D2016] dark:bg-[#14DC6F]">
              {total}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <span className="font-inter font-normal text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
              In-Patients
            </span>
            <span className="w-6 h-6 flex items-center text-[12px] font-[Helvetica] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#080C4C] dark:bg-[#0D7F41]">
              {appointments.length}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
              Out-Patients
            </span>
            <span className="w-6 h-6 flex items-center font-[Helvetica] justify-center text-[12px] text-white gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#7D3737] dark:bg-[#D97706]">
              —
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex gap-4">
          {["In-Patients", "Out-Patients"].map((t) => (
            <button
              key={t}
              className={`min-w-[104px] h-[31px] hover:bg-[#0EFF7B1A] rounded-[4px] font-[Helvetica] text-[13px] font-normal transition duration-300 ease-in-out
                ${
                  activeTab === t
                    ? "bg-[#025126] shadow-[0px_0px_20px_0px_#0EFF7B40] font-[Helvetica] text-white border-[#0EFF7B]"
                    : "bg-gray-100 text-gray-800 border-gray-300 font-[Helvetica] dark:bg-[#1E1E1E] dark:text-gray-300 dark:border-[#3A3A3A]"
                }`}
              onClick={() =>
                t === "Out-Patients"
                  ? navigate("/patients/out-patients")
                  : setActiveTab(t)
              }
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="flex items-center w-[315px] h-[32px] gap-2 rounded-[8px] px-4 py-1 border border-gray-300 bg-gray-100 dark:bg-[#1E1E1E] dark:border-[#3A3A3A] shadow">
            <Search size={18} className="text-green-600 dark:text-green-400" />
            <input
              type="text"
              placeholder="Search patient name or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent px-2 text-xs outline-none font-normal font-[Helvetica] text-black dark:text-white placeholder-gray-400 dark:placeholder-[#00A048] w-48 leading-none tracking-normal"
            />
          </div>
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center justify-center w-[32px] h-[32px] rounded-[8px] border border-gray-300 bg-gray-100 hover:bg-green-200 dark:bg-[#1E1E1E] dark:border-[#3A3A3A] dark:hover:bg-green-900 transition-colors duration-200"
          >
            <Filter size={18} className="text-green-600 dark:text-green-400" />
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="w-full overflow-x-auto h-[50px] flex items-center gap-3 mb-8 px-2 relative z-10">
        <div className="flex gap-3 min-w-full">
          {statusFilters.map((f) => (
            <button
              key={f}
              className={`relative min-w-[162px] h-[35px] flex items-center justify-center rounded-lg px-3 text-sm font-medium transition-all border-b-[1px]
                ${
                  activeFilter === f
                    ? "bg-[#08994A] text-white font-[Helvetica] dark:bg-green-900 dark:text-white"
                    : "text-gray-800 hover:text-green-600 font-[Helvetica] dark:text-white dark:hover:text-white"
                }`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[#0EFF7B]" size={32} />
          </div>
        ) : err ? (
          <div className="text-center py-6 text-red-500">{err}</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-[#0EFF7B] dark:text-[#0EFF7B] font-[Helvetica] dark:bg-[#091810] border-b border-gray-300 dark:border-gray-700">
              <tr>
                <th className="py-3 px-2">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-md border border-[#0EFF7B] dark:border-gray-600 accent-[#08994A] dark:accent-green-500 bg-white dark:bg-transparent focus:outline-none cursor-pointer transition-colors"
                    checked={
                      current.length > 0 && selected.length === current.length
                    }
                    onChange={selectAll}
                  />
                </th>
                <th>Patient Name</th>
                <th>Patient ID</th>
                <th>Department</th>
                <th>Doctor</th>
                <th>Room no</th>
                <th>Treatment Type</th>
                <th>Discharge Status</th>
                <th>Status</th>
                <th className="text-center">Edit</th>
              </tr>
            </thead>
            <tbody>
              {current.length > 0 ? (
                current.map((a, i) => {
                  const gIdx = (page - 1) * perPage + i;
                  return (
                    <tr
                      key={gIdx}
                      className="border-b border-gray-300 dark:border-gray-800 font-[Helvetica]"
                    >
                      <td className="px-2">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded-md border border-[#0EFF7B] dark:border-gray-600 accent-[#08994A] dark:accent-green-500 bg-white dark:bg-transparent focus:outline-none cursor-pointer transition-colors"
                          checked={selected.includes(gIdx)}
                          onChange={() => toggle(i)}
                        />
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-black dark:text-white">
                          {a.patient}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {a.date}
                        </div>
                      </td>
                      <td className="text-black dark:text-white">
                        {a.patientId}
                      </td>
                      <td className="text-black dark:text-white">
                        {a.department}
                      </td>
                      <td className="text-black dark:text-white">{a.doctor}</td>
                      <td className="text-black dark:text-white">{a.room}</td>
                      <td className="text-black dark:text-white">
                        {a.treatment}
                      </td>
                      <td className="text-black dark:text-white">
                        {a.discharge}
                      </td>
                      <td>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            statusColors[a.status] ||
                            "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-2">
                          <Edit2
                            size={16}
                            onClick={() => {
                              setSelAppt(a);
                              setShowEdit(true);
                            }}
                            className="text-[#08994A] dark:text-blue-400 cursor-pointer"
                          />
                          <Trash2
                            size={16}
                            onClick={() => {
                              setSelAppt(a);
                              setShowDel(true);
                            }}
                            className="text-[#08994A] dark:text-gray-400 cursor-pointer"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-6 text-gray-600 dark:text-gray-400 italic"
                  >
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center mt-4 bg-white dark:bg-black p-4 rounded gap-x-4 dark:border-[#1E1E1E]">
        <div className="text-sm text-black dark:text-white">
          Page{" "}
          <span className="text-[#08994A] dark:text-[#0EFF7B] font-semibold">
            {page}
          </span>{" "}
          of {pages} ({(page - 1) * perPage + 1}-
          {Math.min(page * perPage, total)} from {total} Patients)
        </div>
        <div className="flex items-center gap-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
              page === 1 ? "opacity-50" : "hover:bg-[#0EFF7B1A]"
            }`}
          >
            <ChevronLeft size={12} className="text-[#08994A] dark:text-white" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
              page === pages ? "opacity-50" : "hover:bg-[#0EFF7B1A]"
            }`}
          >
            <ChevronRight
              size={12}
              className="text-[#08994A] dark:text-white"
            />
          </button>
        </div>
      </div>

      {/* FILTER POPUP */}
      {showFilter && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
            <div
              className="w-[505px] rounded-[19px] bg-white dark:bg-[#000000] text-black dark:text-white p-6 shadow-lg relative"
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
                  Filter Appointment
                </h3>
                <button
                  onClick={() => setShowFilter(false)}
                  className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-white dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
                >
                  <X size={16} className="text-black dark:text-white" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-black dark:text-white">
                    Patient Name
                  </label>
                  <input
                    name="patientName"
                    value={filters.patientName}
                    onChange={onFilterChange}
                    placeholder="enter patient name"
                    className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-black dark:text-white">
                    Patient ID
                  </label>
                  <input
                    name="patientId"
                    value={filters.patientId}
                    onChange={onFilterChange}
                    placeholder="enter patient ID"
                    className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                  />
                </div>
                <Dropdown
                  label="Department"
                  value={filters.department}
                  onChange={(v) => setFilters((p) => ({ ...p, department: v }))}
                  options={["Orthopedics", "Cardiology", "Neurology"]}
                />
                <Dropdown
                  label="Status"
                  value={filters.status}
                  onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
                  options={["Active", "Completed", "Cancelled"]}
                />
                <Dropdown
                  label="Doctor"
                  value={filters.doctor}
                  onChange={(v) => setFilters((p) => ({ ...p, doctor: v }))}
                  options={[
                    "Dr.Sravan",
                    "Dr.Ramesh",
                    "Dr.Naveen",
                    "Dr.Prakash",
                  ]}
                />
                <div>
                  <label className="text-sm text-black dark:text-white">
                    Date
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="date"
                      name="date"
                      value={filters.date}
                      onChange={onFilterChange}
                      className="w-[228px] h-[33px] px-3 pr-10 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-white dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none"
                    />
                    <Calendar className="absolute right-8 top-1/2 -translate-y-1/2 text-[#0EFF7B] dark:text-[#0EFF7B] pointer-events-none w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={clearFilters}
                  className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-[#3A3A3A] text-gray-800 dark:text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] opacity-100 bg-white dark:bg-transparent"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowFilter(false)}
                  className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT POPUP – FIXED */}
      {showEdit && selAppt && (
        <EditPatientPopup
          patientId={selAppt.id} // Django normal ID
          onClose={() => {
            setShowEdit(false);
            setSelAppt(null);
          }}
          onUpdate={refreshData} // Refresh list
        />
      )}

      {/* DELETE POPUP */}
      {showDel && selAppt && (
        <DeletePatient
          appointment={selAppt}
          onClose={() => {
            setShowDel(false);
            setSelAppt(null);
          }}
          onConfirm={onDelete}
        />
      )}
    </div>
  );
};

export default AppointmentListIPD;
