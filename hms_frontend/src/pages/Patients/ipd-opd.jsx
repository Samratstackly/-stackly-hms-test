// // src/components/patients/AppointmentListIPD.jsx
// import React, { useState, useMemo, useEffect } from "react";
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
//   Loader2,
// } from "lucide-react";
// import { Listbox } from "@headlessui/react";
// import EditPatientPopup from "./EditPatient"; // <-- Updated import
// import DeletePatient from "./DeletePatient";
// import { successToast, errorToast } from "../../components/Toast.jsx";

// const API = "http://localhost:8000";

// const AppointmentListIPD = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [pages, setPages] = useState(1);
//   const [page, setPage] = useState(1);
//   const [search, setSearch] = useState("");
//   const [initialLoading, setInitialLoading] = useState(true); // Full screen loading
//   const [dataLoading, setDataLoading] = useState(false); // Data refresh loading
//   const [err, setErr] = useState("");

//   const [activeTab, setActiveTab] = useState("In-Patients");
//   const [activeFilter, setActiveFilter] = useState("All");
//   const [selected, setSelected] = useState([]);
//   const [selAppt, setSelAppt] = useState(null);
//   const [showEdit, setShowEdit] = useState(false);
//   const [showDel, setShowDel] = useState(false);
//   const [showFilter, setShowFilter] = useState(false);

//   const [filters, setFilters] = useState({
//     patientName: "",
//     patientId: "",
//     department: "",
//     doctor: "",
//     status: "",
//     date: "",
//   });

//   const navigate = useNavigate();
//   const perPage = 10;

//   const statusFilters = ["All", "New", "Normal", "Severe", "Completed", "Cancelled"];

//   // ---------- FETCH ----------
//   const fetchData = async (p = page, s = search) => {
//     // Don't show data loading on initial fetch
//     if (!initialLoading) {
//       setDataLoading(true);
//     }
//     setErr("");
//     try {
//       const url = new URL(`${API}/patients`);
//       url.searchParams.set("page", p);
//       url.searchParams.set("limit", perPage);
//       if (s) url.searchParams.set("search", s);

//       const res = await fetch(url);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();

//       const mapped = (json.patients || []).map((p) => ({
//         id: p.id, // Django PK (normal id)
//         patient: p.full_name,
//         date: p.date_of_registration
//           ? new Date(p.date_of_registration).toLocaleDateString("en-GB")
//           : "N/A",
//         patientId: p.patient_unique_id,
//         department: p.department__name || "N/A",
//         doctor: p.staff__full_name || "N/A",
//         room: p.room_number || "N/A",
//         treatment: p.appointment_type || "N/A",
//         discharge: p.discharge || "Pending",
//         status: p.casualty_status || "Active",
//         photo_url: p.photo_url || null,
//       }));

//       setAppointments(mapped);
//       setTotal(json.total || 0);
//       setPages(json.pages || 1);
//       setPage(json.page || p);
//     } catch (e) {
//       console.error(e);
//       setErr("Failed to load patients");
//     } finally {
//       setDataLoading(false);
//       setInitialLoading(false); // Turn off full screen loading
//     }
//   };

//   // Initial load
//   useEffect(() => {
//     fetchData(1, "");
//   }, []);

//   // Debounced search
//   useEffect(() => {
//     if (!initialLoading) {
//       const t = setTimeout(() => fetchData(1, search), 400);
//       return () => clearTimeout(t);
//     }
//   }, [search]);

//   // Page change
//   useEffect(() => {
//     if (!initialLoading) {
//       fetchData(page, search);
//     }
//   }, [page]);

//   // ---------- FILTER ----------
//   const filtered = useMemo(() => {
//     const filterFormattedDate = filters.date ? new Date(filters.date).toLocaleDateString("en-GB") : "";
//     return appointments.filter((a) => {
//       if (activeFilter !== "All" && a.status !== activeFilter) return false;
//       if (
//         filters.patientName &&
//         !a.patient.toLowerCase().includes(filters.patientName.toLowerCase())
//       )
//         return false;
//       if (
//         filters.patientId &&
//         !a.patientId.toLowerCase().includes(filters.patientId.toLowerCase())
//       )
//         return false;
//       if (filters.department && a.department !== filters.department)
//         return false;
//       if (filters.doctor && a.doctor !== filters.doctor) return false;
//       if (filters.status && a.status !== filters.status) return false;
//       if (filters.date && a.date !== filterFormattedDate) return false;
//       return true;
//     });
//   }, [appointments, activeFilter, filters]);

//   const current = useMemo(() => {
//     const start = (page - 1) * perPage;
//     return filtered.slice(start, start + perPage);
//   }, [page, filtered]);

//   // ---------- CHECKBOX ----------
//   const toggle = (idx) => {
//     const gIdx = (page - 1) * perPage + idx;
//     setSelected((p) =>
//       p.includes(gIdx) ? p.filter((i) => i !== gIdx) : [...p, gIdx]
//     );
//   };
//   const selectAll = () => {
//     if (selected.length === current.length) setSelected([]);
//     else setSelected(current.map((_, i) => (page - 1) * perPage + i));
//   };

//   // ---------- FILTER HANDLERS ----------
//   const onFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((p) => ({ ...p, [name]: value }));
//   };
//   const clearFilters = () => {
//     setFilters({
//       patientName: "",
//       patientId: "",
//       department: "",
//       doctor: "",
//       status: "",
//       date: "",
//     });
//     setActiveFilter("All");
//     setShowFilter(false);
//     setPage(1);
//   };

//   // ---------- REFRESH AFTER UPDATE ----------
//   const refreshData = async () => {
//     await fetchData(page, search);
//   };

//   // ---------- DELETE ----------
//   const onDelete = async () => {
//     if (!selAppt?.patientId) {
//       errorToast("No patient selected");
//       return;
//     }

//     try {
//       const pid = selAppt.patientId; // <-- correct ID
//       const r = await fetch(`${API}/patients/${pid}`, {
//         method: "DELETE",
//       });

//       if (!r.ok) {
//         const txt = await r.text();
//         throw new Error(txt || "Delete failed");
//       }

//       // ---- SUCCESS ----
//       successToast(`Patient "${selAppt.patient}" deleted successfully!`);
//       await refreshData(); // refresh current page
//       setShowDel(false);
//       setSelAppt(null);
//     } catch (e) {
//       console.error(e);
//       errorToast(e.message || "Failed to delete patient");
//     }
//   };

//   // ---------- DROPDOWN ----------
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
//             className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]"
//             style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//           >
//             {value || "Select"}
//             <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
//               <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
//             </span>
//           </Listbox.Button>
//           <Listbox.Options className="absolute mt-1 w-full rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A] left-[2px]">
//             {options.map((o) => (
//               <Listbox.Option
//                 key={o}
//                 value={o}
//                 className={({ active, selected }) => `
//                   cursor-pointer select-none py-2 px-2 text-sm rounded-md
//                   ${active
//                     ? "bg-[#0EFF7B33] text-[#0EFF7B]"
//                     : "text-black dark:text-white"
//                   }
//                   ${selected ? "font-medium text-[#0EFF7B]" : ""}`}
//                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//               >
//                 {o}
//               </Listbox.Option>
//             ))}
//           </Listbox.Options>
//         </div>
//       </Listbox>
//     </div>
//   );

//   const statusColors = {
//     All: "bg-slate-700 text-slate-300",
//     New: "bg-blue-900 text-blue-300",
//     Normal: "bg-green-900 text-green-300",
//     Severe: "bg-red-900 text-red-300",
//     Completed: "bg-emerald-900 text-emerald-300",
//     Cancelled: "bg-gray-700 text-gray-300",
//   };

//   return (
//     <div className="mt-[80px] mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-4 w-full max-w-[1400px] mx-auto flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative">
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

//       {/* Initial Component Loading Overlay */}
//       {initialLoading && (
//         <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/80 dark:bg-black/80 z-40 rounded-xl">
//           {/* Animated hospital logo */}
//           <div className="relative mb-8">
//             <div className="w-32 h-32 rounded-full border-4 border-[#0EFF7B] animate-ping opacity-20"></div>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="w-20 h-20 bg-gradient-to-r from-[#025126] to-[#0D7F41] rounded-xl flex items-center justify-center shadow-lg">
//                 <span className="text-white font-bold text-2xl">🏥</span>
//               </div>
//             </div>
//           </div>
          
//           {/* Loading text */}
//           <h2 className="text-black dark:text-white text-2xl font-bold mb-2">Hospital Management System</h2>
//           <p className="text-gray-600 dark:text-gray-400 mb-8">Loading IPD Patient Module</p>
          
//           {/* Progress indicator */}
//           <div className="w-80 bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
//             <div className="h-full bg-gradient-to-r from-[#025126] via-[#0EFF7B] to-[#025126] animate-[loadingBar_1.5s_ease-in-out_infinite]"></div>
//           </div>
//           <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">Fetching patient records...</p>
//         </div>
//       )}

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

//       {/* Today's Total */}
//       <div className="mb-3 min-w-[800px] relative z-10">
//         <div className="flex items-center gap-4 rounded-xl">
//           <div className="flex items-center gap-3">
//             <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
//               Today's Total
//             </span>
//             <span className="w-6 h-6 flex items-center font-[Helvetica] text-[12px] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#0D2016] dark:bg-[#14DC6F]">
//               {total}
//             </span>
//           </div>
//           <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
//           <div className="flex items-center gap-2">
//             <span className="font-inter font-normal text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
//               In-Patients
//             </span>
//             <span className="w-6 h-6 flex items-center text-[12px] font-[Helvetica] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#080C4C] dark:bg-[#0D7F41]">
//               {appointments.length}
//             </span>
//           </div>
//           <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
//           <div className="flex items-center gap-2">
//             <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
//               Out-Patients
//             </span>
//             <span className="w-6 h-6 flex items-center font-[Helvetica] justify-center text-[12px] text-white gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#7D3737] dark:bg-[#D97706]">
//               —
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex justify-between items-center mb-4 relative z-10">
//         <div className="flex gap-4">
//           {["In-Patients", "Out-Patients"].map((t) => (
//             <button
//               key={t}
//               className={`min-w-[104px] h-[31px] hover:bg-[#0EFF7B1A] rounded-[4px] font-[Helvetica] text-[13px] font-normal transition duration-300 ease-in-out
//                 ${activeTab === t
//                   ? "bg-[#025126] shadow-[0px_0px_20px_0px_#0EFF7B40] font-[Helvetica] text-white border-[#0EFF7B]"
//                   : "bg-gray-100 text-gray-800 border-gray-300 font-[Helvetica] dark:bg-[#1E1E1E] dark:text-gray-300 dark:border-[#3A3A3A]"
//                 }`}
//               onClick={() =>
//                 t === "Out-Patients"
//                   ? navigate("/patients/out-patients")
//                   : setActiveTab(t)
//               }
//             >
//               {t}
//             </button>
//           ))}
//         </div>

//         <div className="flex gap-4">
//           <div className="flex items-center w-[315px] h-[32px] gap-2 rounded-[8px] px-4 py-1 border border-gray-300 bg-gray-100 dark:bg-[#1E1E1E] dark:border-[#3A3A3A] shadow">
//             <Search size={18} className="text-green-600 dark:text-green-400" />
//             <input
//               type="text"
//               placeholder="Search patient name or ID"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="bg-transparent px-2 text-xs outline-none font-normal font-[Helvetica] text-black dark:text-white placeholder-gray-400 dark:placeholder-[#00A048] w-48 leading-none tracking-normal"
//             />
//           </div>
//           <button
//             onClick={() => setShowFilter(true)}
//             className="relative group flex items-center justify-center w-[32px] h-[32px] rounded-[8px] border border-gray-300 bg-gray-100 hover:bg-green-200 dark:bg-[#1E1E1E] dark:border-[#3A3A3A] dark:hover:bg-green-900 transition-colors duration-200"
//           >
//             <Filter size={18} className="text-green-600 dark:text-green-400" />
//             <span
//               className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                px-3 py-1 text-xs rounded-md shadow-md
//                bg-gray-100 dark:bg-black text-black dark:text-white
//                opacity-0 group-hover:opacity-100
//                transition-all duration-150"
//             >
//               Filter
//             </span>
//           </button>
//         </div>
//       </div>

//       {/* Status Filters */}
//       <div className="w-full overflow-x-auto h-[50px] flex items-center gap-3 mb-8 px-2 relative z-10">
//         <div className="w-full flex gap-3 justify-between">
//           {statusFilters.map((f) => (
//             <button
//               key={f}
//               className={`relative min-w-[142px] mx-auto h-[35px] flex items-center justify-center rounded-lg px-3 text-sm font-medium transition-all border-b-[1px]
//         ${activeFilter === f
//                   ? "bg-[#08994A] text-white dark:bg-green-900 dark:text-white"
//                   : "text-gray-800 hover:text-green-600 dark:text-white dark:hover:text-white"
//                 }`}
//               onClick={() => setActiveFilter(f)}
//             >
//               {f}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Table Loading State */}
//       {dataLoading ? (
//         <div className="flex items-center justify-center h-64">
//           <div className="flex flex-col items-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0EFF7B] mb-4"></div>
//             <p className="text-gray-600 dark:text-gray-400">Refreshing data...</p>
//           </div>
//         </div>
//       ) : err ? (
//         <div className="text-center py-6 text-red-500">{err}</div>
//       ) : (
//         <div className="overflow-x-hidden overflow-y-hidden">
//           <table className="w-full text-left text-sm">
//             <thead className="text-[#0EFF7B] dark:text-[#0EFF7B] font-[Helvetica] dark:bg-[#091810] border-b border-gray-300 dark:border-gray-700">
//               <tr>
//                 <th className="py-3 px-2">
//                   <input
//                     type="checkbox"
//                     checked={selected.length > 0 && selected.length === current.length}
//                     onChange={selectAll}
//                     className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
//                   />
//                 </th>
//                 <th>Patient Name</th>
//                 <th>Patient ID</th>
//                 <th>Department</th>
//                 <th>Doctor</th>
//                 <th>Room no</th>
//                 <th>Treatment Type</th>
//                 <th>Discharge Status</th>
//                 <th>Status</th>
//                 <th className="text-center">Edit</th>
//               </tr>
//             </thead>
//             <tbody>
//               {current.length > 0 ? (
//                 current.map((a, i) => {
//                   const gIdx = (page - 1) * perPage + i;
//                   return (
//                     <tr
//                       key={gIdx}
//                       className="border-b border-gray-300 dark:border-gray-800 font-[Helvetica]"
//                     >
//                       <td className="px-2">
//                         <input
//                           type="checkbox"
//                           className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
//                           checked={selected.includes(gIdx)}
//                           onChange={() => toggle(i)}
//                         />
//                       </td>
//                       <td className="py-3">
//                         <div className="font-medium text-black dark:text-white">
//                           {a.patient}
//                         </div>
//                         <div className="text-xs text-gray-600 dark:text-gray-400">
//                           {a.date}
//                         </div>
//                       </td>
//                       <td className="text-black dark:text-white">
//                         {a.patientId}
//                       </td>
//                       <td className="text-black dark:text-white">
//                         {a.department}
//                       </td>
//                       <td className="text-black dark:text-white">{a.doctor}</td>
//                       <td className="text-black dark:text-white">{a.room}</td>
//                       <td className="text-black dark:text-white">
//                         {a.treatment}
//                       </td>
//                       <td className="text-black dark:text-white">
//                         {a.discharge}
//                       </td>
//                       <td>
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs ${statusColors[a.status] ||
//                             "bg-gray-200 text-gray-700"
//                             }`}
//                         >
//                           {a.status}
//                         </span>
//                       </td>
//                       <td className="text-center">
//                         <div className="flex justify-center gap-4 relative overflow-visible">

//                           {/* EDIT ICON + TOOLTIP */}
//                           <div className="relative group">
//                             <Edit2
//                               size={16}
//                               onClick={() => {
//                                 setSelAppt(a);
//                                 setShowEdit(true);
//                               }}
//                               className="text-[#08994A] dark:text-blue-400 cursor-pointer"
//                             />
//                             <span
//                               className="absolute bottom-5 -left-1/2 -translate-x-1/2 whitespace-nowrap
//           px-3 py-1 text-xs rounded-md shadow-md
//           bg-gray-100 dark:bg-black text-black dark:text-white
//           opacity-0 group-hover:opacity-100
//           transition-all duration-150 z-50"
//                             >
//                               Edit
//                             </span>
//                           </div>

//                           {/* DELETE ICON + TOOLTIP */}
//                           <div className="relative group">
//                             <Trash2
//                               size={16}
//                               onClick={() => {
//                                 setSelAppt(a);
//                                 setShowDel(true);
//                               }}
//                               className="text-red-500 dark:text-gray-400 cursor-pointer"
//                             />
//                             <span
//                               className="absolute bottom-5 -left-1/2 -translate-x-1/2 whitespace-nowrap
//           px-3 py-1 text-xs rounded-md shadow-md
//           bg-gray-100 dark:bg-black text-black dark:text-white
//           opacity-0 group-hover:opacity-100
//           transition-all duration-150 z-50"
//                             >
//                               Delete
//                             </span>
//                           </div>

//                         </div>
//                       </td>

//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td
//                     colSpan="10"
//                     className="text-center py-6 text-gray-600 dark:text-gray-400 italic"
//                   >
//                     No patients found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Pagination */}
//       <div className="flex items-center mt-4 bg-gray-100 dark:bg-black p-4 rounded gap-x-4 dark:border-[#1E1E1E]">
//         <div className="text-sm text-black dark:text-white">
//           Page{" "}
//           <span className="text-[#08994A] dark:text-[#0EFF7B] font-semibold">
//             {page}
//           </span>{" "}
//           of {pages} ({(page - 1) * perPage + 1}-
//           {Math.min(page * perPage, total)} from {total} Patients)
//         </div>
//         <div className="flex items-center gap-x-2">
//           <button
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//             disabled={page === 1}
//             className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${page === 1 ? "opacity-50" : "hover:bg-[#0EFF7B1A]"
//               }`}
//           >
//             <ChevronLeft size={12} className="text-[#08994A] dark:text-white" />
//           </button>
//           <button
//             onClick={() => setPage((p) => Math.min(pages, p + 1))}
//             disabled={page === pages}
//             className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${page === pages ? "opacity-50" : "hover:bg-[#0EFF7B1A]"
//               }`}
//           >
//             <ChevronRight
//               size={12}
//               className="text-[#08994A] dark:text-white"
//             />
//           </button>
//         </div>
//       </div>

//       {/* FILTER POPUP */}
//       {showFilter && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//           <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
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
//                   Filter Appointment
//                 </h3>
//                 <button
//                   onClick={() => setShowFilter(false)}
//                   className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
//                 >
//                   <X size={16} className="text-black dark:text-white" />
//                 </button>
//               </div>

//               <div className="grid grid-cols-2 gap-6">
//                 <div>
//                   <label className="text-sm text-black dark:text-white">
//                     Patient Name
//                   </label>
//                   <input
//                     name="patientName"
//                     value={filters.patientName}
//                     onChange={onFilterChange}
//                     placeholder="enter patient name"
//                     className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white">
//                     Patient ID
//                   </label>
//                   <input
//                     name="patientId"
//                     value={filters.patientId}
//                     onChange={onFilterChange}
//                     placeholder="enter patient ID"
//                     className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
//                   />
//                 </div>
//                 <Dropdown
//                   label="Department"
//                   value={filters.department}
//                   onChange={(v) => setFilters((p) => ({ ...p, department: v }))}
//                   options={["Orthopedics", "Cardiology", "Neurology"]}
//                 />
//                 <Dropdown
//                   label="Status"
//                   value={filters.status}
//                   onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
//                   options={["New", "Normal", "Severe", "Completed", "Cancelled"]}
//                 />
//                 <Dropdown
//                   label="Doctor"
//                   value={filters.doctor}
//                   onChange={(v) => setFilters((p) => ({ ...p, doctor: v }))}
//                   options={[
//                     "Dr.Sravan",
//                     "Dr.Ramesh",
//                     "Dr.Naveen",
//                     "Dr.Prakash",
//                   ]}
//                 />
//                 <div>
//                   <label className="text-sm text-black dark:text-white">
//                     Date
//                   </label>
//                   <div className="relative mt-1">
//                     <input
//                       id="dateInput"
//                       type="date"
//                       name="date"
//                       value={filters.date}
//                       onChange={onFilterChange}
//                       className="w-[228px] h-[33px] px-3 pr-10 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none"
//                       onClick={(e) => e.target.showPicker()}  // 🔥 opens the date picker on any click
//                     />

//                     <Calendar
//                       className="absolute right-8 top-1/2 -translate-y-1/2 text-[#0EFF7B] dark:text-[#0EFF7B] w-4 h-4 cursor-pointer"
//                       onClick={() => document.getElementById("dateInput").showPicker()}  // 🔥 icon also opens picker
//                     />
//                   </div>
//                 </div>

//               </div>
//               <div className="flex justify-center gap-2 mt-8">
//                 <button
//                   onClick={clearFilters}
//                   className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-[#3A3A3A] text-gray-800 dark:text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] opacity-100 bg-gray-100 dark:bg-transparent"
//                 >
//                   Clear
//                 </button>
//                 <button
//                   onClick={() => setShowFilter(false)}
//                   className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition"
//                 >
//                   Filter
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* EDIT POPUP – FIXED */}
//       {showEdit && selAppt && (
//         <EditPatientPopup
//           patientId={selAppt.id} // Django normal ID
//           onClose={() => {
//             setShowEdit(false);
//             setSelAppt(null);
//           }}
//           onUpdate={refreshData} // Refresh list
//         />
//       )}

//       {/* DELETE POPUP */}
//       {showDel && selAppt && (
//         <DeletePatient
//           appointment={selAppt}
//           onClose={() => {
//             setShowDel(false);
//             setSelAppt(null);
//           }}
//           onConfirm={onDelete}
//         />
//       )}
//     </div>
//   );
// };

// export default AppointmentListIPD;

// src/components/patients/AppointmentListIPD.jsx
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
import EditPatientPopup from "./EditPatient.jsx";
import DeletePatient from "./DeletePatient";
import { successToast, errorToast } from "../../components/Toast.jsx";
import api from "../../utils/axiosConfig";

const AppointmentListIPD = () => {
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [err, setErr] = useState("");

  const [activeTab, setActiveTab] = useState("In-Patients");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selected, setSelected] = useState([]);
  const [selAppt, setSelAppt] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [filterDepartments, setFilterDepartments] = useState([]);
  const [filterDoctors, setFilterDoctors] = useState([]);
  const [loadingFilterDepts, setLoadingFilterDepts] = useState(true);
  const [loadingFilterDocs, setLoadingFilterDocs] = useState(false);
  
  // Add state for patient counts from backend
  const [patientCounts, setPatientCounts] = useState({
    total: 0,
    inPatient: 0,
    outPatient: 0
  });

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

  // Status filters - removed "Completed"
  const statusFilters = ["All", "New", "Normal", "Severe", "Cancelled"];

  // ---------- FETCH PATIENT COUNTS FROM BACKEND ----------
  const fetchPatientCounts = async () => {
    try {
      // You might need to create a new endpoint for counts, or use existing one with limit=1 to get total
      // For now, we'll fetch a small batch to get total count from response
      const response = await api.get("/patients/", {
        params: { limit: 1, page: 1 }
      });
      
      const json = response.data;
      
      // Get in-patients count (excluding completed/discharged)
      const inPatientResponse = await api.get("/patients/", {
        params: { 
          limit: 1, 
          page: 1,
          type: "in-patient" 
        }
      });
      
      // Get out-patients count
      const outPatientResponse = await api.get("/patients/", {
        params: { 
          limit: 1, 
          page: 1,
          type: "out-patient" 
        }
      });
      
      // For OPD (completed/discharged) you might want to use your /opd endpoint
      const opdResponse = await api.get("/patients/opd", {
        params: { limit: 1, page: 1 }
      });
      
      setPatientCounts({
        total: json.total || 0,
        inPatient: inPatientResponse.data.total || 0,
        outPatient: outPatientResponse.data.total || 0
        // If you want OPD count separately, you can add it here
      });
      
    } catch (e) {
      console.error("Error fetching patient counts:", e);
      // Fallback to frontend calculation if backend fails
      if (allAppointments.length > 0) {
        const inCount = allAppointments.filter(p => p.patient_type === "in-patient" && p.status !== "Completed").length;
        const outCount = allAppointments.filter(p => p.patient_type === "out-patient").length;
        setPatientCounts({
          total: inCount + outCount,
          inPatient: inCount,
          outPatient: outCount
        });
      }
    }
  };

  // ---------- FETCH ALL DATA ----------
  const fetchAllData = async () => {
    setDataLoading(true);
    setErr("");
    try {
      console.log("Fetching patients from API...");

      const response = await api.get("/patients/", {
        params: { limit: 100 }
      });
      
      const json = response.data;
      console.log("API Response:", json);

      if (!json.patients) {
        console.error("No patients array in response:", json);
        throw new Error("Invalid API response format");
      }

      const mapped = (json.patients || []).map((p) => ({
        id: p.id,
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
        patient_type: p.patient_type || "in-patient",
        photo_url: p.photo_url || null,
      }));

      console.log("Total patients fetched:", mapped.length);
      
      // Store ALL patients
      setAllAppointments(mapped);
      
      // Fetch patient counts from backend
      await fetchPatientCounts();
      
      // Apply initial filter based on activeTab
      applyClientSideFilter(mapped, activeTab);
      
    } catch (e) {
      console.error("Fetch error details:", e);
      setErr(`Failed to load patients: ${e.message}`);
    } finally {
      setDataLoading(false);
      setInitialLoading(false);
    }
  };

  // ---------- CLIENT-SIDE FILTERING FUNCTION ----------
  const applyClientSideFilter = (allPatients, patientType) => {
    if (!allPatients || allPatients.length === 0) {
      setAppointments([]);
      setTotal(0);
      setPages(1);
      return;
    }
    
    let filteredData = [...allPatients];
    
    // Apply patient type filter based on activeTab
    if (patientType === "In-Patients") {
      filteredData = filteredData.filter(patient => 
        patient.patient_type === "in-patient" && patient.status !== "Completed"
      );
    } else if (patientType === "Out-Patients") {
      filteredData = filteredData.filter(patient => 
        patient.patient_type === "out-patient"
      );
    }
    
    // Apply status filter
    if (activeFilter && activeFilter !== "All") {
      filteredData = filteredData.filter(patient => {
        return patient.status === activeFilter;
      });
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(patient => 
        patient.patient.toLowerCase().includes(searchLower) || 
        (patient.patientId && patient.patientId.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply other filters from filter popup
    if (filters.patientName) {
      const nameLower = filters.patientName.toLowerCase();
      filteredData = filteredData.filter(patient => 
        patient.patient.toLowerCase().includes(nameLower)
      );
    }
    
    if (filters.patientId) {
      filteredData = filteredData.filter(patient => 
        patient.patientId && patient.patientId.includes(filters.patientId)
      );
    }
    
    // Department filter
    if (filters.department && filters.department !== "") {
      let deptNameToMatch = filters.department;
      
      if (filterDepartments.length > 0) {
        const foundDept = filterDepartments.find(dept => 
          dept.id === filters.department || 
          dept.department_id === filters.department
        );
        
        if (foundDept) {
          deptNameToMatch = foundDept.name || foundDept.department_name || filters.department;
        }
      }
      
      filteredData = filteredData.filter(patient => 
        patient.department === deptNameToMatch
      );
    }
    
    // Doctor filter
    if (filters.doctor && filters.doctor !== "") {
      filteredData = filteredData.filter(patient => 
        patient.doctor === filters.doctor || 
        patient.doctor.includes(filters.doctor)
      );
    }
    
    if (filters.status && filters.status !== "") {
      filteredData = filteredData.filter(patient => 
        patient.status === filters.status
      );
    }
    
    if (filters.date) {
      try {
        const filterDate = new Date(filters.date).toLocaleDateString("en-GB");
        filteredData = filteredData.filter(patient => 
          patient.date === filterDate
        );
      } catch (e) {
        console.error("Date filter error:", e);
      }
    }
    
    // Calculate pagination
    const totalFiltered = filteredData.length;
    const totalPages = Math.ceil(totalFiltered / perPage);
    const currentPage = Math.min(page, totalPages || 1);
    const startIndex = (currentPage - 1) * perPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + perPage);
    
    setAppointments(paginatedData);
    setTotal(totalFiltered);
    setPages(totalPages || 1);
    if (currentPage !== page) {
      setPage(currentPage);
    }
  };

  // Initial load - fetch ALL data
  useEffect(() => {
    fetchAllData();
  }, []);

  // When activeTab changes - apply client-side filter
  useEffect(() => {
    if (!initialLoading && allAppointments.length > 0) {
      console.log("Active tab changed to:", activeTab);
      applyClientSideFilter(allAppointments, activeTab);
    }
  }, [activeTab]);

  // When activeFilter changes - apply client-side filter
  useEffect(() => {
    if (!initialLoading && allAppointments.length > 0) {
      console.log("Active filter changed to:", activeFilter);
      applyClientSideFilter(allAppointments, activeTab);
    }
  }, [activeFilter]);

  // When search changes - apply client-side filter
  useEffect(() => {
    if (!initialLoading && allAppointments.length > 0) {
      const timer = setTimeout(() => {
        applyClientSideFilter(allAppointments, activeTab);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [search]);

  // When page changes - just update pagination
  useEffect(() => {
    if (!initialLoading && allAppointments.length > 0) {
      applyClientSideFilter(allAppointments, activeTab);
    }
  }, [page]);

  // When filters change - apply client-side filter
  useEffect(() => {
    if (!initialLoading && allAppointments.length > 0) {
      applyClientSideFilter(allAppointments, activeTab);
    }
  }, [filters]);

  // Load departments for filter
  useEffect(() => {
    api.get("/patients/departments")
      .then((response) => {
        const data = response.data;
        setFilterDepartments(data.departments || []);
      })
      .catch(() => setFilterDepartments([]))
      .finally(() => setLoadingFilterDepts(false));
  }, []);

  // Load doctors when department changes
  useEffect(() => {
    if (!filters.department) {
      setFilterDoctors([]);
      setFilters((prev) => ({ ...prev, doctor: "" }));
      return;
    }
    setLoadingFilterDocs(true);
    api.get("/patients/staff", { params: { department_id: filters.department } })
      .then((response) => {
        const data = response.data;
        setFilterDoctors(data.staff || []);
      })
      .catch(() => setFilterDoctors([]))
      .finally(() => setLoadingFilterDocs(false));
  }, [filters.department]);

  // ---------- CHECKBOX ----------
  const toggle = (idx) => {
    setSelected((p) =>
      p.includes(idx) ? p.filter((i) => i !== idx) : [...p, idx]
    );
  };
  
  const selectAll = () => {
    if (selected.length === appointments.length) setSelected([]);
    else setSelected(appointments.map((_, i) => i));
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
    setPage(1);
    if (allAppointments.length > 0) {
      applyClientSideFilter(allAppointments, activeTab);
    }
  };

  // ---------- APPLY FILTER POPUP ----------
  const applyFilterPopup = () => {
    setShowFilter(false);
    setActiveFilter("All");
    setPage(1);
    if (allAppointments.length > 0) {
      applyClientSideFilter(allAppointments, activeTab);
    }
  };

  // ---------- REFRESH AFTER UPDATE ----------
  const refreshData = async () => {
    await fetchAllData();
  };

  // ---------- DELETE ----------
  const onDelete = async () => {
    if (!selAppt?.patientId) {
      errorToast("No patient selected");
      return;
    }

    try {
      const pid = selAppt.patientId;
      await api.delete(`/patients/${pid}`);

      successToast(`Patient "${selAppt.patient}" deleted successfully!`);
      await refreshData();
      setShowDel(false);
      setSelAppt(null);
    } catch (e) {
      console.error(e);
      const errorMessage = e.response?.data?.detail || e.message || "Failed to delete patient";
      errorToast(errorMessage);
    }
  };

  // ---------- DROPDOWN ----------
  const Dropdown = ({ label, value, onChange, options = [], loading = false }) => (
    <div>
      <label className="text-sm text-black dark:text-white block mb-1">
        {label}
      </label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1 w-[228px]">
          <Listbox.Button className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px] flex items-center justify-between">
            <span>
              {loading
                ? "Loading..."
                : Array.isArray(options) && options.length > 0
                ? (typeof options[0] === "object"
                    ? options.find((o) => o.id === value)?.name
                    : options.find((o) => o === value)) ||
                  value ||
                  "Select"
                : "Select"}
            </span>
            <ChevronDown className="h-4 w-4 text-[#0EFF7B] absolute right-2 pointer-events-none" />
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 w-full rounded-[12px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3A] max-h-60 overflow-auto">
            {loading ? (
              <div className="py-2 px-3 text-sm text-gray-500">Loading...</div>
            ) : options.length === 0 ? (
              <div className="py-2 px-3 text-sm text-gray-500">No options</div>
            ) : (
              options.map((opt, i) => {
                const optId = typeof opt === "object" ? opt.id : opt;
                const optName = typeof opt === "object" ? opt.name : opt;
                return (
                  <Listbox.Option
                    key={i}
                    value={optId}
                    className={({ active }) =>
                      `cursor-pointer py-2 px-3 text-sm ${
                        active
                          ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                          : "text-black dark:text-white"
                      }`
                    }
                  >
                    {optName}
                  </Listbox.Option>
                );
              })
            )}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );

  const statusColors = {
    All: "bg-slate-700 text-slate-300",
    New: "bg-blue-900 text-blue-300",
    Normal: "bg-green-900 text-green-300",
    Severe: "bg-red-900 text-red-300",
    Cancelled: "bg-gray-700 text-gray-300",
    Active: "bg-green-900 text-green-300",
  };

  // Calculate current page start and end
  const startItem = (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, total);

  return (
    <div className=" mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-4 w-full max-w-[2500px] mx-auto flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative font-[Helvetica]">
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

      {/* Initial Component Loading Overlay */}
      {initialLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/80 dark:bg-black/80 z-40 rounded-xl">
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-[#0EFF7B] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

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

      {/* Today's Total - Using backend counts */}
      <div className="mb-3 min-w-[800px] relative z-10">
        <div className="flex items-center gap-4 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
              Today's Total
            </span>
            <span className="w-6 h-6 flex items-center font-[Helvetica] text-[12px] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#0D2016] dark:bg-[#14DC6F]">
              {patientCounts.total}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <span className="font-inter font-normal text-[14px] font-[Helvetica] text-gray-600 dark:text-[#A0A0A0]">
              In-Patients
            </span>
            <span className="w-6 h-6 flex items-center text-[12px] font-[Helvetica] text-white justify-center gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#080C4C] dark:bg-[#0D7F41]">
              {patientCounts.inPatient}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <span className="font-inter font-normal font-[Helvetica] text-[14px] text-gray-600 dark:text-[#A0A0A0]">
              Out-Patients
            </span>
            <span className="w-6 h-6 flex items-center font-[Helvetica] justify-center text-[12px] text-white gap-1 opacity-100 rounded-[20px] p-1 text-xs font-normal bg-[#7D3737] dark:bg-[#D97706]">
              {patientCounts.outPatient}
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
              className={`min-w-[104px] h-[31px]  rounded-[4px] font-[Helvetica] text-[13px] font-normal transition duration-300 ease-in-out
                ${activeTab === t
                  ? "bg-[#025126] shadow-[0px_0px_20px_0px_#0EFF7B40] font-[Helvetica] text-white border-[#0EFF7B]"
                  : "bg-gray-200 text-gray-800 border-gray-300 font-[Helvetica] dark:bg-[#1E1E1E] dark:text-gray-300 dark:border-[#3A3A3A]"
                }`}
              onClick={() => {
                if (t === "Out-Patients") {
                  navigate("/patients/out-patients");
                } else {
                  setActiveTab(t);
                  setPage(1);
                }
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="flex items-center w-[315px] h-[32px] gap-2 rounded-[8px] px-4 py-1 border border-gray-300 bg-gray-200 dark:bg-[#1E1E1E] dark:border-[#3A3A3A] shadow">
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
            className="relative group flex items-center justify-center w-[32px] h-[32px] rounded-[8px] border border-gray-300 bg-gray-200 hover:bg-green-200 dark:bg-[#1E1E1E] dark:border-[#3A3A3A] dark:hover:bg-green-900 transition-colors duration-200"
          >
            <Filter size={18} className="text-green-600 dark:text-green-400" />
            <span
              className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
               px-3 py-1 text-xs rounded-md shadow-md
               bg-gray-100 dark:bg-black text-black dark:text-white
               opacity-0 group-hover:opacity-100
               transition-all duration-150"
            >
              Filter
            </span>
          </button>
        </div>
      </div>

      {/* Status Filters - Removed "Completed" */}
      <div className="w-full overflow-x-auto h-[50px] flex items-center gap-3 mb-8 px-2 relative z-10">
        <div className="w-full flex gap-3 justify-between">
          {statusFilters.map((f) => (
            <button
              key={f}
              className={`relative min-w-[142px] mx-auto h-[35px] flex items-center justify-center rounded-lg px-3 text-sm font-medium transition-all border-b-[1px]
        ${activeFilter === f
                  ? "bg-[#08994A] text-white dark:bg-green-900 dark:text-white"
                  : "text-gray-800 hover:text-green-600 dark:text-white dark:hover:text-white"
                }`}
              onClick={() => {
                console.log("Setting active filter to:", f);
                setActiveFilter(f);
                setPage(1);
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table Loading State */}
      {dataLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0EFF7B] mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading patients...</p>
          </div>
        </div>
      ) : err ? (
        <div className="text-center py-6 text-red-500">{err}</div>
      ) : (
        <div className="overflow-x-hidden overflow-y-hidden">
          <table className="w-full text-left text-sm">
            <thead className="text-[#08994A] dark:text-[#0EFF7B] bg-gray-200 font-[Helvetica] dark:bg-[#091810] border-b border-gray-300 dark:border-gray-700">
              <tr>
                <th className="py-3 px-2">
                  <input
                    type="checkbox"
                    checked={selected.length > 0 && selected.length === appointments.length}
                    onChange={selectAll}
                    className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
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
              {appointments.length > 0 ? (
                appointments.map((a, i) => (
                  <tr
                    key={a.id || i}
                    className="border-b border-gray-300 dark:border-gray-800 font-[Helvetica]"
                  >
                    <td className="px-2">
                      <input
                        type="checkbox"
                        className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                        checked={selected.includes(i)}
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
                        className={`px-2 py-1 rounded-full text-xs ${statusColors[a.status] ||
                          "bg-gray-200 text-gray-700"
                          }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-4 relative overflow-visible">

                        {/* EDIT ICON + TOOLTIP */}
                        <div className="relative group">
                          <Edit2
                            size={16}
                            onClick={() => {
                              setSelAppt(a);
                              setShowEdit(true);
                            }}
                            className="text-[#08994A] dark:text-blue-400 cursor-pointer"
                          />
                          <span
                            className="absolute bottom-5 -left-1/2 -translate-x-1/2 whitespace-nowrap
          px-3 py-1 text-xs rounded-md shadow-md
          bg-gray-100 dark:bg-black text-black dark:text-white
          opacity-0 group-hover:opacity-100
          transition-all duration-150 z-50"
                          >
                            Edit
                          </span>
                        </div>

                        {/* DELETE ICON + TOOLTIP */}
                        <div className="relative group">
                          <Trash2
                            size={16}
                            onClick={() => {
                              setSelAppt(a);
                              setShowDel(true);
                            }}
                            className="text-red-500 dark:text-gray-400 cursor-pointer"
                          />
                          <span
                            className="absolute bottom-5 -left-1/2 -translate-x-1/2 whitespace-nowrap
          px-3 py-1 text-xs rounded-md shadow-md
          bg-gray-100 dark:bg-black text-black dark:text-white
          opacity-0 group-hover:opacity-100
          transition-all duration-150 z-50"
                          >
                            Delete
                          </span>
                        </div>

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-6 text-gray-600 dark:text-gray-400 italic"
                  >
                    No {activeTab.toLowerCase()} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center mt-4 bg-gray-100 dark:bg-black p-4 rounded gap-x-4 dark:border-[#1E1E1E]">
        <div className="text-sm text-black dark:text-white">
          Page{" "}
          <span className="text-[#08994A] dark:text-[#0EFF7B] font-semibold">
            {page}
          </span>{" "}
          of {pages} ({startItem}-
          {endItem} from {total} Patients)
        </div>
        <div className="flex items-center gap-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${page === 1 ? "opacity-50" : "hover:bg-[#0EFF7B1A]"
              }`}
          >
            <ChevronLeft size={12} className="text-[#08994A] dark:text-white" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${page === pages ? "opacity-50" : "hover:bg-[#0EFF7B1A]"
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
                  Filter Patients
                </h3>
                <button
                  onClick={() => setShowFilter(false)}
                  className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
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
                    className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
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
                    className="w-[228px] h-[33px] mt-1 px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                  />
                </div>
                <Dropdown
                  label="Department"
                  value={filters.department}
                  onChange={(v) => setFilters((p) => ({ ...p, department: v }))}
                  options={
                    loadingFilterDepts
                      ? []
                      : filterDepartments.map((d) => ({
                          id: d.id || d.name || d.department_name,
                          name: d.name || d.department_name,
                        }))
                  }
                  loading={loadingFilterDepts}
                />
                
                <Dropdown
                  label="Doctor"
                  value={filters.doctor}
                  onChange={(v) => setFilters((p) => ({ ...p, doctor: v }))}
                  options={
                    loadingFilterDocs
                      ? []
                      : filterDoctors.map((doc) => ({
                          id: doc.full_name,
                          name: `${doc.full_name} – ${doc.designation || "N/A"}`,
                        }))
                  }
                  loading={loadingFilterDocs}
                />
                <Dropdown
                  label="Status"
                  value={filters.status}
                  onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
                  options={[
    "Active",
    "New",
    "Normal",
    "Severe",
    "Cancelled",
  ]}
                />
                <div>
                  <label className="text-sm text-black dark:text-white">
                    Date
                  </label>
                  <div className="relative mt-1">
                    <input
  id="dateInput"
  type="date"
  name="date"
  value={filters.date}
  onChange={onFilterChange}
  onClick={(e) => e.target.showPicker()}
  className="w-[228px] h-[33px] px-3 pr-10 rounded-[8px]
             border border-[#0EFF7B] dark:border-[#3A3A3A]
             bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B]
             outline-none cursor-pointer
             appearance-none
             [&::-webkit-calendar-picker-indicator]:opacity-0
             [&::-webkit-calendar-picker-indicator]:hidden"
/>

                    <Calendar
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-[#0EFF7B] dark:text-[#0EFF7B] w-4 h-4 cursor-pointer"
                      onClick={() =>
                        document.getElementById("dateInput").showPicker()
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={clearFilters}
                  className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-[#3A3A3A] text-gray-800 dark:text-white font-medium text-[14px] leading-[16px] shadow-[0_2px_12px_0px_#00000040] opacity-100 bg-gray-100 dark:bg-transparent"
                >
                  Clear
                </button>
                <button
                  onClick={applyFilterPopup}
                  className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT POPUP */}
      {showEdit && selAppt && (
        <EditPatientPopup
          patientId={selAppt.id}
          onClose={() => {
            setShowEdit(false);
            setSelAppt(null);
          }}
          onUpdate={refreshData}
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
