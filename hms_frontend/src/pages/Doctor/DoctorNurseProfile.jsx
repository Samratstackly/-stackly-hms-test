// import React, { useState, useMemo, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Search,
//   Filter,
//   Plus,
//   Edit,
//   X,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import image from "../../assets/image.png";
// import { Listbox } from "@headlessui/react";
// import EditDoctorNursePopup from "./EditDoctorNursePopup.jsx";
// import { successToast, errorToast } from "../../components/Toast";

// const API_BASE = "http://127.0.0.1:8000";

// const ProfileSection = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedProfile, setSelectedProfile] = useState(null);
//   const [showEditPopup, setShowEditPopup] = useState(false);
//   const [showFilterPopup, setShowFilterPopup] = useState(false);
//   const [filtersData, setFiltersData] = useState({
//     department: "",
//     specialist: "",
//   });
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 9;

//   const navigate = useNavigate();

//   const [profiles, setProfiles] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [specialists, setSpecialists] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch all staff from backend
//   useEffect(() => {
//     const fetchProfiles = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch(`${API_BASE}/staff/all/`);
//         if (!response.ok) throw new Error("Failed to fetch profiles");
//         const data = await response.json();

//         // Transform to match frontend format
//         const transformed = data.map((staff) => ({
//           id: staff.id,
//           name: staff.full_name || "Unknown",
//           qualification: staff.specialization || "N/A",
//           department: staff.department || "N/A",
//           joinDate: staff.date_of_joining
//             ? new Date(staff.date_of_joining).toLocaleDateString("en-GB")
//             : "N/A",
//           contact: staff.phone || "N/A",
//           email: staff.email || "N/A",
//           type: staff.designation
//             ? staff.designation.toLowerCase() === "doctor"
//               ? "Doctors"
//               : staff.designation.toLowerCase() === "nurse"
//               ? "Nurses"
//               : "Other Staff"
//             : "Other Staff",
//           // Include all original data for editing
//           originalData: staff,
//         }));

//         setProfiles(transformed);

//         // Extract unique departments and specialists (exclude N/A)
//         const uniqueDepartments = [
//           ...new Set(
//             transformed.map((p) => p.department).filter((d) => d && d !== "N/A")
//           ),
//         ].sort();
//         const uniqueSpecialists = [
//           ...new Set(
//             transformed
//               .map((p) => p.qualification)
//               .filter((s) => s && s !== "N/A")
//           ),
//         ].sort();
//         setDepartments(uniqueDepartments);
//         setSpecialists(uniqueSpecialists);
//       } catch (err) {
//         errorToast("Failed to load profiles.");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProfiles();
//   }, []);

//   const filteredProfiles = useMemo(() => {
//     return profiles.filter((profile) => {
//       if (
//         searchTerm &&
//         !(
//           profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           profile.department.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       ) {
//         return false;
//       }
//       if (
//         filtersData.department &&
//         profile.department !== filtersData.department
//       ) {
//         return false;
//       }
//       if (
//         filtersData.specialist &&
//         profile.qualification !== filtersData.specialist
//       ) {
//         return false;
//       }
//       return true;
//     });
//   }, [profiles, searchTerm, filtersData]);

//   const totalPages = Math.ceil(filteredProfiles.length / rowsPerPage);
//   const paginatedProfiles = filteredProfiles.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );

//   const handlePreviousPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const handleFilterChange = (field, value) => {
//     setFiltersData((prev) => ({ ...prev, [field]: value }));
//     setCurrentPage(1);
//   };

//   const handleClearFilters = () => {
//     setFiltersData({
//       department: "",
//       specialist: "",
//     });
//     setCurrentPage(1);
//   };

//   const handleEditProfile = (profile) => {
//     setSelectedProfile(profile.originalData);
//     setShowEditPopup(true);
//   };

//   const handleUpdateProfile = async (updatedData) => {
//     try {
//       // Update the profile in the backend
//       const response = await fetch(
//         `${API_BASE}/staff/update/${updatedData.id}/`,
//         {
//           method: "PUT",
//           body: updatedData, // This should be FormData in your actual implementation
//         }
//       );

//       if (response.ok) {
//         successToast("Profile updated successfully");
//         // Refresh the profiles
//         const fetchResponse = await fetch(`${API_BASE}/staff/all/`);
//         const data = await fetchResponse.json();
//         const transformed = data.map((staff) => ({
//           id: staff.id,
//           name: staff.full_name || "Unknown",
//           qualification: staff.specialization || "N/A",
//           department: staff.department || "N/A",
//           joinDate: staff.date_of_joining
//             ? new Date(staff.date_of_joining).toLocaleDateString("en-GB")
//             : "N/A",
//           contact: staff.phone || "N/A",
//           email: staff.email || "N/A",
//           type: staff.designation
//             ? staff.designation.toLowerCase() === "doctor"
//               ? "Doctors"
//               : staff.designation.toLowerCase() === "nurse"
//               ? "Nurses"
//               : "Other Staff"
//             : "Other Staff",
//           originalData: staff,
//         }));
//         setProfiles(transformed);
//       } else {
//         errorToast("Failed to update profile");
//       }
//     } catch (error) {
//       errorToast("Error updating profile");
//       console.error(error);
//     }
//   };

//   const Dropdown = ({ placeholder, value, onChange, options }) => (
//     <div className="relative">
//       <Listbox
//         value={value || ""}
//         onChange={(val) => onChange(val === placeholder ? "" : val)}
//       >
//         <div className="relative mt-1 w-[228px]">
//           <Listbox.Button
//             className="w-full h-[33px] px-3 pr-8 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
//                        bg-gray-100 dark:bg-[#000000] text-[#08994A] dark:text-[#0EFF7B] text-left text-[14px] leading-[16px] z-[100]"
//             style={{
//               borderColor: "#3C3C3C",
//               boxShadow: "0px 0px 4px 0px #0EFF7B",
//             }}
//           >
//             <span className="block truncate">{value || placeholder}</span>
//             <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
//               <svg
//                 className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M19 9l-7 7-7-7"
//                 />
//               </svg>
//             </span>
//           </Listbox.Button>

//           <Listbox.Options
//             className="absolute mt-1 w-full max-h-60 rounded-[12px] bg-gray-100 dark:bg-black shadow-lg border border-[#0EFF7B] dark:border-[#3A3A3A] overflow-auto z-[100]"
//             style={{
//               scrollbarWidth: "none",
//               msOverflowStyle: "none",
//             }}
//           >
//             <Listbox.Option
//               key="default"
//               value={placeholder}
//               className="cursor-pointer select-none py-2 px-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]"
//             >
//               {placeholder}
//             </Listbox.Option>
//             {options.map((option, idx) => (
//               <Listbox.Option
//                 key={idx}
//                 value={option}
//                 className={({ active, selected }) =>
//                   `cursor-pointer select-none py-2 px-2 text-sm rounded-md ${
//                     active
//                       ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
//                       : "text-black dark:text-white"
//                   } ${
//                     selected
//                       ? "font-medium text-[#08994A] dark:text-[#0EFF7B]"
//                       : ""
//                   }`
//                 }
//               >
//                 {option}
//               </Listbox.Option>
//             ))}
//           </Listbox.Options>
//         </div>
//       </Listbox>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="w-8 h-8 border-2 border-[#0EFF7B] border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   const totalDoctors = filteredProfiles.filter(
//     (p) => p.type === "Doctors"
//   ).length;
//   const totalNurses = filteredProfiles.filter(
//     (p) => p.type === "Nurses"
//   ).length;
//   const totalOtherStaff = filteredProfiles.filter(
//     (p) => p.type === "Other Staff"
//   ).length;

//   return (
//     <div className="mt-[80px] mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-6 w-full max-w-[1400px] mx-auto flex flex-col overflow-hidden relative">
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
//       <div className="flex justify-between items-center mt-4 mb-6 relative z-10">
//         <h2 className="text-xl font-semibold text-black dark:text-white">
//           Doctor/Nurse Profiles
//         </h2>
//         <button
//           onClick={() => navigate("/Doctors-Nurse/AddDoctorNurse")}
//           className="w-[200px] h-[40px] flex items-center justify-center gap-2 border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66] rounded-[8px] text-white font-semibold hover:scale-105 transition"
//           style={{
//             background:
//               "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
//           }}
//         >
//           <Plus size={18} className="text-white" />
//           Add Doctor/Nurse
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="mb-6 w-[800px] relative z-10">
//         <div className="flex items-center gap-4 rounded-xl">
//           <div className="flex items-center gap-3">
//             <span className="font-inter font-normal text-[14px] text-gray-600 dark:text-[#A0A0A0]">
//               Total Doctors
//             </span>
//             <span className="w-6 h-6 flex items-center justify-center gap-1 rounded-[20px] border border-[#0EFF7B66] dark:border-[#0EFF7B66] p-1 text-xs font-normal text-white dark:text-white bg-gradient-to-r from-[#14DC6F] to-[#09753A] dark:from-[#14DC6F] dark:to-[#09753A]">
//               {totalDoctors}
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="font-inter font-normal text-[14px] text-gray-600 dark:text-[#A0A0A0]">
//               Total Nurse
//             </span>
//             <span className="w-6 h-6 flex items-center justify-center gap-1 rounded-[20px] border border-[#2231FF] dark:border-[#2231FF] p-1 text-xs font-normal text-white dark:text-white bg-gradient-to-b from-[#6E92FF] to-[#425899] dark:from-[#6E92FF] dark:to-[#425899]">
//               {totalNurses}
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="font-inter font-normal text-[14px] text-gray-600 dark:text-[#A0A0A0]">
//               Other staff
//             </span>
//             <span className="w-6 h-6 flex items-center justify-center gap-1 rounded-[20px] border border-[#FF930E] dark:border-[#FF930E] p-1 text-xs font-normal text-white dark:text-white bg-gradient-to-b from-[#FF930E] to-[#995808] dark:from-[#FF930E] dark:to-[#995808]">
//               {totalOtherStaff}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Search and Filter */}
//       <div className="flex justify-between items-center mb-6 relative z-30">
//         <div className="flex gap-4">
//           <Dropdown
//             placeholder="Select Department"
//             value={filtersData.department}
//             onChange={(val) => handleFilterChange("department", val)}
//             options={departments}
//           />
//           <Dropdown
//             placeholder="Select Specialist"
//             value={filtersData.specialist}
//             onChange={(val) => handleFilterChange("specialist", val)}
//             options={specialists}
//           />
//         </div>
//         <div className="flex gap-4">
//           <div className="min-w-[315px] flex items-center bg-[#0EFF7B1A] dark:bg-[#1E1E1E] rounded-full px-3 py-1 border-[1px] border-[#0EFF7B1A] dark:border-[#0EFF7B1A] relative">
//             <Search size={18} className="text-[#08994A] dark:text-[#0EFF7B]" />
//             <input
//               type="text"
//               placeholder="Search by name or department"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="bg-transparent px-2 text-[12px] placeholder-[#5CD592] outline-none text-[#08994A] dark:text-[#5CD592] w-48"
//             />
//           </div>
//           <button
//             onClick={() => setShowFilterPopup(true)}
//             className="flex items-center gap-2 bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-[#08994A] dark:text-white px-4 py-2 rounded-full border-[1px] border-[#0EFF7B1A] dark:border-[#0EFF7B1A] hover:bg-[#0EFF7B33] dark:hover:bg-[#0EFF7B33]"
//           >
//             <Filter size={18} className="text-[#08994A] dark:text-[#0EFF7B]" />
//           </button>
//         </div>
//       </div>

//       {/* Filter Popup */}
//       {showFilterPopup && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//           <div className="w-[600px] rounded-[20px] border border-[#0EFF7B] dark:border-[#1E1E1E] bg-gray-100 dark:bg-[#000000E5] text-black dark:text-white p-6 shadow-lg backdrop-blur-md relative z-50">
//             {/* Gradient Border */}
//             <div
//               style={{
//                 position: "absolute",
//                 inset: 0,
//                 borderRadius: "20px",
//                 padding: "2px",
//                 background:
//                   "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//                 WebkitMask:
//                   "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//                 WebkitMaskComposite: "xor",
//                 maskComposite: "exclude",
//                 pointerEvents: "none",
//                 zIndex: 0,
//               }}
//             ></div>
//             <div className="flex justify-between items-center pb-3 mb-4 relative z-10">
//               <h3 className="text-black dark:text-white font-medium text-[16px]">
//                 Filter Profiles
//               </h3>
//               <button
//                 onClick={() => setShowFilterPopup(false)}
//                 className="w-6 h-6 rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B1A] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] flex items-center justify-center text-gray-600 dark:text-white hover:text-[#08994A] dark:hover:text-[#0EFF7B]"
//               >
//                 <X size={16} />
//               </button>
//             </div>

//             <div className="grid grid-cols-2 gap-6 relative z-30">
//               <Dropdown
//                 placeholder="Select Department"
//                 value={filtersData.department}
//                 onChange={(val) =>
//                   setFiltersData((prev) => ({ ...prev, department: val }))
//                 }
//                 options={departments}
//               />
//               <Dropdown
//                 placeholder="Select Specialist"
//                 value={filtersData.specialist}
//                 onChange={(val) =>
//                   setFiltersData((prev) => ({ ...prev, specialist: val }))
//                 }
//                 options={specialists}
//               />
//             </div>

//             <div className="flex justify-center gap-6 mt-8 relative z-10">
//               <button
//                 onClick={handleClearFilters}
//                 className="w-[104px] h-[33px] rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent px-3 py-2 text-black dark:text-white font-medium text-[14px] leading-[16px] shadow hover:bg-[#0EFF7B1A] dark:hover:bg-gray-900"
//               >
//                 Clear
//               </button>
//               <button
//                 onClick={() => setShowFilterPopup(false)}
//                 className="w-[144px] h-[33px] rounded-[8px] border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66] px-3 py-2 bg-gradient-to-r from-[#0EFF7B] to-[#08994A] dark:from-[#14DC6F] dark:to-[#09753A] shadow text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition"
//                 style={{
//                   background:
//                     "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
//                 }}
//               >
//                 Filter
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Doctor/Nurse Popup */}
//       {showEditPopup && selectedProfile && (
//         <EditDoctorNursePopup
//           onClose={() => {
//             setShowEditPopup(false);
//             setSelectedProfile(null);
//           }}
//           profile={selectedProfile}
//           onUpdate={handleUpdateProfile}
//         />
//       )}

//       {/* Profiles Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-20">
//         {paginatedProfiles.length > 0 ? (
//           paginatedProfiles.map((profile, index) => (
//             <div
//               key={profile.id || index}
//               className="w-full h-full bg-gray-100 dark:bg-[#0EFF7B08] rounded-lg p-5 border border-[#0EFF7B80] dark:border-[#0EFF7B80] shadow-[0px_0px_4px_0px_#A0A0A040] dark:shadow-[0px_0px_4px_0px_#0EFF7B] relative text-center flex flex-col items-center"
//               style={{ zIndex: 20 }}
//             >
//               <div className="absolute top-4 left-4 text-[#08994A] dark:text-[#0EFF7B] text-[14px]">
//                 {profile.type}
//               </div>
//               <div className="w-16 h-16 mx-auto mb-4 mt-10 rounded-full overflow-hidden">
//                 <img
//                   src={image}
//                   alt="Staff Avatar"
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <p className="text-[18px] font-medium text-[#08994A] dark:text-[#0EFF7B] mb-1">
//                 {profile.name}
//               </p>
//               <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-4">
//                 {profile.qualification}
//               </p>
//               <div className="w-full text-left space-y-2 mb-4">
//                 <div className="flex justify-between">
//                   <span className="text-[14px] text-gray-600 dark:text-gray-400">
//                     Department
//                   </span>
//                   <span className="text-[14px] text-gray-600 dark:text-gray-400">
//                     {profile.department}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-[14px] text-gray-600 dark:text-gray-400">
//                     Join Date
//                   </span>
//                   <span className="text-[14px] text-gray-600 dark:text-gray-400">
//                     {profile.joinDate}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-[14px] text-gray-600 dark:text-gray-400">
//                     Contact
//                   </span>
//                   <span className="text-[14px] text-gray-600 dark:text-gray-400">
//                     {profile.contact}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-[14px] text-gray-600 dark:text-gray-400">
//                     Email ID
//                   </span>
//                   <span className="text-[14px] text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
//                     {profile.email}
//                   </span>
//                 </div>
//               </div>
//               <button
//                 onClick={() => handleEditProfile(profile)}
//                 className="absolute top-4 right-4 flex items-center gap-1 text-[#4D58FF] dark:text-[#6E92FF] text-[12px]"
//               >
//                 <Edit size={16} />
//                 <span>Edit</span>
//               </button>
//               <button
//                 className="w-[112px] h-[33px] rounded-[8px] border-[2px] border-[#0EFF7B66] dark:border-[#025126] bg-[#08994A] dark:bg-[#0EFF7B1A] text-white text-[14px] font-medium hover:scale-105 transition"
//                 onClick={() =>
//                   navigate("/Doctors-Nurse/ViewProfile", {
//                     state: { profile: profile.originalData },
//                   })
//                 }
//               >
//                 View profile
//               </button>
//             </div>
//           ))
//         ) : (
//           <div className="col-span-3 text-center py-6 text-gray-600 dark:text-gray-400 italic">
//             No profiles found
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center mt-4 bg-gray-100 dark:bg-black p-4 rounded gap-x-4 dark:border-[#1E1E1E] relative z-10">
//         <div className="text-sm text-black dark:text-white">
//           Page {currentPage} of {totalPages} (
//           {(currentPage - 1) * rowsPerPage + 1} to{" "}
//           {Math.min(currentPage * rowsPerPage, filteredProfiles.length)} from{" "}
//           {filteredProfiles.length} Records)
//         </div>
//         <div className="flex items-center gap-x-2">
//           <button
//             onClick={handlePreviousPage}
//             disabled={currentPage === 1}
//             className={`w-5 h-5 flex items-center justify-center rounded-full border ${
//               currentPage === 1
//                 ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
//                 : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
//             }`}
//           >
//             <ChevronLeft size={12} className="text-[#08994A] dark:text-white" />
//           </button>
//           <button
//             onClick={handleNextPage}
//             disabled={currentPage === totalPages || totalPages === 0}
//             className={`w-5 h-5 flex items-center justify-center rounded-full border ${
//               currentPage === totalPages || totalPages === 0
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
//     </div>
//   );
// };

// export default ProfileSection;

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { Listbox } from "@headlessui/react";
import EditDoctorNursePopup from "./EditDoctorNursePopup.jsx";
import { successToast, errorToast } from "../../components/Toast";
import api from "../../utils/axiosConfig";

const ProfileSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filtersData, setFiltersData] = useState({
    department: "",
    specialist: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 9;

  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [specialists, setSpecialists] = useState([]);
  const [specialistsLoading, setSpecialistsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get API base URL from environment variable
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Helper function to get profile picture URL
  const getProfilePictureUrl = (profilePicturePath) => {
    if (!profilePicturePath) return null;

    if (profilePicturePath.startsWith("http")) {
      return profilePicturePath;
    }

    if (profilePicturePath.startsWith("/static/")) {
      return `${API_BASE}${profilePicturePath}`;
    }

    const filename = profilePicturePath.split("/").pop();
    if (filename) {
      return `${API_BASE}/static/staffs_pictures/${filename}`;
    }

    return null;
  };

  // Fetch only active departments
  const fetchActiveDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const response = await api.get("/patients/departments?status=active");
      const data = response.data;
      
      let departmentsList = [];
      if (Array.isArray(data.departments)) {
        departmentsList = data.departments;
      } else if (Array.isArray(data)) {
        departmentsList = data;
      } else if (Array.isArray(data.results)) {
        departmentsList = data.results;
      }

      const formattedDepartments = departmentsList
        .filter(dept => {
          const status = (dept.status || dept.is_active || dept.active || '').toString().toLowerCase();
          return status === 'active' || status === '1' || status === 'true' || status === '';
        })
        .map((dept) => dept.name || dept.department_name || dept.label || 'Unnamed Department')
        .filter(name => name && name !== 'Unnamed Department')
        .sort();

      setDepartments(formattedDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      // Fallback: Extract from profiles
      const uniqueDepts = [...new Set(profiles.map(p => p.department).filter(d => d && d !== "N/A"))].sort();
      setDepartments(uniqueDepts);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // Fetch specializations by department
  const fetchSpecializationsByDepartment = async (departmentName) => {
    if (!departmentName) {
      setSpecialists([]);
      return;
    }
    
    setSpecialistsLoading(true);
    try {
      // First try to get department ID from name
      let departmentId = null;
      try {
        const deptResponse = await api.get(`/patients/departments/?name=${encodeURIComponent(departmentName)}`);
        const deptData = deptResponse.data;
        if (Array.isArray(deptData) && deptData.length > 0) {
          departmentId = deptData[0].id;
        } else if (deptData.departments && deptData.departments.length > 0) {
          departmentId = deptData.departments[0].id;
        }
      } catch (e) {
        console.log("Could not fetch department ID:", e);
      }

      // Fetch specializations for the department
      let specializationsList = [];
      
      if (departmentId) {
        try {
          const response = await api.get(`/staff/specializations/?department_id=${departmentId}`);
          const data = response.data;
          
          if (Array.isArray(data)) {
            specializationsList = data;
          } else if (Array.isArray(data.specializations)) {
            specializationsList = data.specializations;
          } else if (Array.isArray(data.results)) {
            specializationsList = data.results;
          }
        } catch (e) {
          console.log("Specializations endpoint not available, falling back to profile data");
        }
      }

      // Fallback: Filter from profiles
      if (specializationsList.length === 0) {
        const filteredProfiles = profiles.filter(p => p.department === departmentName);
        specializationsList = [...new Set(
          filteredProfiles
            .map(p => p.qualification)
            .filter(s => s && s !== "N/A")
        )].map(spec => ({ name: spec }));
      }

      const formattedSpecializations = specializationsList
        .filter(spec => spec && (spec.name || spec))
        .map((spec) => ({
          id: spec.id || spec.name || spec,
          name: spec.name || spec,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setSpecialists(formattedSpecializations);
    } catch (error) {
      console.error("Error fetching specializations:", error);
      setSpecialists([]);
    } finally {
      setSpecialistsLoading(false);
    }
  };

  // Fetch all staff from backend
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const response = await api.get("/staff/all/");
        
        if (response.status !== 200) {
          throw new Error("Failed to fetch profiles");
        }
        
        const data = response.data;

        // Transform to match frontend format
        const transformed = data.map((staff) => ({
          id: staff.id,
          name: staff.full_name || "Unknown",
          qualification: staff.specialization || "N/A",
          department: staff.department || "N/A",
          department_id: staff.department_id || null,
          joinDate: staff.date_of_joining
            ? new Date(staff.date_of_joining).toLocaleDateString("en-GB")
            : "N/A",
          contact: staff.phone || "N/A",
          email: staff.email || "N/A",
          type: staff.designation
            ? staff.designation.toLowerCase() === "doctor"
              ? "Doctors"
              : staff.designation.toLowerCase() === "nurse"
              ? "Nurses"
              : "Other Staff"
            : "Other Staff",
          profilePicture: staff.profile_picture,
          originalData: staff,
        }));

        setProfiles(transformed);
        
        // Fetch active departments after profiles are loaded
        await fetchActiveDepartments();
        
      } catch (err) {
        errorToast("Failed to load profiles.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  // Handle department change
  const handleDepartmentChange = async (value) => {
    setFiltersData((prev) => ({ 
      ...prev, 
      department: value,
      specialist: "" // Reset specialist when department changes
    }));
    setCurrentPage(1);
    
    // Fetch specializations for the selected department
    if (value) {
      await fetchSpecializationsByDepartment(value);
    } else {
      setSpecialists([]);
    }
  };

  const handleSpecialistChange = (value) => {
    setFiltersData((prev) => ({ ...prev, specialist: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFiltersData({
      department: "",
      specialist: "",
    });
    setSpecialists([]);
    setCurrentPage(1);
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      // Search filter
      if (
        searchTerm &&
        !(
          profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.department.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) {
        return false;
      }
      
      // Department filter
      if (
        filtersData.department &&
        profile.department !== filtersData.department
      ) {
        return false;
      }
      
      // Specialist filter
      if (
        filtersData.specialist &&
        profile.qualification !== filtersData.specialist
      ) {
        return false;
      }
      
      return true;
    });
  }, [profiles, searchTerm, filtersData]);

  const totalPages = Math.ceil(filteredProfiles.length / rowsPerPage);
  const paginatedProfiles = filteredProfiles.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleEditProfile = (profile) => {
    setSelectedProfile(profile.originalData);
    setShowEditPopup(true);
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      const response = await api.put(
        `/staff/update/${updatedData.id}/`,
        updatedData
      );

      if (response.status === 200) {
        successToast("Profile updated successfully");
        const fetchResponse = await api.get("/staff/all/");
        const data = fetchResponse.data;
        const transformed = data.map((staff) => ({
          id: staff.id,
          name: staff.full_name || "Unknown",
          qualification: staff.specialization || "N/A",
          department: staff.department || "N/A",
          department_id: staff.department_id || null,
          joinDate: staff.date_of_joining
            ? new Date(staff.date_of_joining).toLocaleDateString("en-GB")
            : "N/A",
          contact: staff.phone || "N/A",
          email: staff.email || "N/A",
          type: staff.designation
            ? staff.designation.toLowerCase() === "doctor"
              ? "Doctors"
              : staff.designation.toLowerCase() === "nurse"
              ? "Nurses"
              : "Other Staff"
            : "Other Staff",
          profilePicture: staff.profile_picture,
          originalData: staff,
        }));
        setProfiles(transformed);
      } else {
        errorToast("Failed to update profile");
      }
    } catch (error) {
      errorToast("Error updating profile");
      console.error(error);
    }
  };

  // Enhanced Dropdown component with loading and disabled states
  const Dropdown = ({ 
    placeholder, 
    value, 
    onChange, 
    options, 
    loading = false,
    disabled = false 
  }) => {
    // Handle both array of strings and array of objects
    const displayOptions = options.map(opt => 
      typeof opt === 'object' ? opt.name : opt
    ).filter(opt => opt && opt !== '');

    const displayValue = value || placeholder;

    return (
      <div className="relative">
        <Listbox
          value={value || ""}
          onChange={(val) => onChange(val === placeholder ? "" : val)}
          disabled={disabled || loading}
        >
          <div className="relative mt-1 w-[228px]">
            <Listbox.Button
              className={`w-full h-[33px] px-3 pr-8 rounded-[8px] border 
                ${disabled || loading 
                  ? 'border-gray-300 bg-gray-100 dark:bg-gray-900 opacity-50 cursor-not-allowed' 
                  : 'border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#000000]'
                } 
                text-[#08994A] dark:text-[#0EFF7B] text-left text-[14px] leading-[16px] z-[100]`}
              style={{
                borderColor: disabled ? '#9CA3AF' : '#3C3C3C',
                boxShadow: disabled ? 'none' : '0px 0px 4px 0px #0EFF7B',
              }}
            >
              <span className="block truncate">
                {loading ? 'Loading...' : displayValue}
              </span>
              <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg
                  className={`h-4 w-4 ${disabled ? 'text-gray-400' : 'text-[#08994A] dark:text-[#0EFF7B]'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </Listbox.Button>

            {!loading && !disabled && (
              <Listbox.Options
                className="absolute mt-1 w-full max-h-60 rounded-[12px] bg-gray-100 dark:bg-black shadow-lg border border-[#0EFF7B] dark:border-[#3A3A3A] overflow-auto z-[100]"
                style={{
                  scrollbarWidth: "thin",
                  msOverflowStyle: "auto",
                  scrollbarColor: "#0EFF7B #1E1E1E",
                }}
              >
                <Listbox.Option
                  key="default"
                  value={placeholder}
                  className={({ active }) =>
                    `cursor-pointer select-none py-2 px-2 text-sm rounded-md ${
                      active
                        ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
                        : "text-gray-600 dark:text-gray-400"
                    }`
                  }
                >
                  {placeholder}
                </Listbox.Option>
                {displayOptions.length === 0 ? (
                  <div className="py-2 px-2 text-sm text-gray-500 text-center">
                    No options available
                  </div>
                ) : (
                  displayOptions.map((option, idx) => (
                    <Listbox.Option
                      key={idx}
                      value={option}
                      className={({ active, selected }) =>
                        `cursor-pointer select-none py-2 px-2 text-sm rounded-md ${
                          active
                            ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
                            : "text-black dark:text-white"
                        } ${
                          selected
                            ? "font-medium text-[#08994A] dark:text-[#0EFF7B]"
                            : ""
                        }`
                      }
                    >
                      {option}
                    </Listbox.Option>
                  ))
                )}
              </Listbox.Options>
            )}
          </div>
        </Listbox>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-[#0EFF7B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalDoctors = filteredProfiles.filter(
    (p) => p.type === "Doctors"
  ).length;
  const totalNurses = filteredProfiles.filter(
    (p) => p.type === "Nurses"
  ).length;
  const totalOtherStaff = filteredProfiles.filter(
    (p) => p.type === "Other Staff"
  ).length;

  return (
    <div className=" mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-6 w-full max-w-[2500px] mx-auto flex flex-col overflow-hidden font-[Helvetica] relative">
      <div
        className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
          zIndex: 0,
        }}
      ></div>
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
      <div className="flex justify-between items-center mt-4 mb-6 relative z-10">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          Doctor/Nurse Profiles
        </h2>
        <button
          onClick={() => navigate("/Doctors-Nurse/AddDoctorNurse")}
          className="w-[200px] h-[40px] flex items-center justify-center gap-2 border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66] rounded-[8px] text-white font-semibold hover:scale-105 transition"
          style={{
            background:
              "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
          }}
        >
          <Plus size={18} className="text-white" />
          Add Doctor/Nurse
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 w-[800px] relative z-10">
        <div className="flex items-center gap-4 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="font-[Helvetica] font-normal text-[14px] text-gray-600 dark:text-[#A0A0A0]">
              Total Doctors
            </span>
            <span className="w-6 h-6 flex items-center justify-center gap-1 rounded-[20px] border border-[#0EFF7B66] dark:border-[#0EFF7B66] p-1 text-xs font-normal text-white dark:text-white bg-gradient-to-r from-[#14DC6F] to-[#09753A] dark:from-[#14DC6F] dark:to-[#09753A]">
              {totalDoctors}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-[Helvetica] font-normal text-[14px] text-gray-600 dark:text-[#A0A0A0]">
              Total Nurse
            </span>
            <span className="w-6 h-6 flex items-center justify-center gap-1 rounded-[20px] border border-[#2231FF] dark:border-[#2231FF] p-1 text-xs font-normal text-white dark:text-white bg-gradient-to-b from-[#6E92FF] to-[#425899] dark:from-[#6E92FF] dark:to-[#425899]">
              {totalNurses}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-[Helvetica] font-normal text-[14px] text-gray-600 dark:text-[#A0A0A0]">
              Other staff
            </span>
            <span className="w-6 h-6 flex items-center justify-center gap-1 rounded-[20px] border border-[#FF930E] dark:border-[#FF930E] p-1 text-xs font-normal text-white dark:text-white bg-gradient-to-b from-[#FF930E] to-[#995808] dark:from-[#FF930E] dark:to-[#995808]">
              {totalOtherStaff}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex justify-between items-center mb-6 relative z-30">
        <div className="flex gap-4">
          {/* FIXED: Department dropdown - Only active departments */}
          <Dropdown
            placeholder="Select Department"
            value={filtersData.department}
            onChange={handleDepartmentChange}
            options={departments}
            loading={departmentsLoading}
            disabled={departmentsLoading}
          />
          
          {/* FIXED: Specialist dropdown - Dependent on department selection */}
          <Dropdown
            placeholder={!filtersData.department ? "Select department first" : "Select Specialist"}
            value={filtersData.specialist}
            onChange={handleSpecialistChange}
            options={specialists}
            loading={specialistsLoading}
            disabled={!filtersData.department || specialistsLoading}
          />
        </div>
        <div className="flex gap-4">
          <div className="relative group min-w-[315px] flex items-center bg-[#0EFF7B1A] dark:bg-[#1E1E1E] rounded-full px-3 py-1 border-[1px] border-[#0EFF7B1A] dark:border-[#0EFF7B1A] relative">
            <Search size={18} className="text-[#08994A] dark:text-[#0EFF7B]" />
            <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                    px-3 py-1 text-xs rounded-md shadow-md
                    bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                    transition-all duration-150">
                    Search
              </span>
            <input
              type="text"
              placeholder="Search by name or department"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent px-2 text-[12px] placeholder-[#5CD592] outline-none text-[#08994A] dark:text-[#5CD592] w-48"
            />
          </div>
          <button
            onClick={() => setShowFilterPopup(true)}
            className="relative group flex items-center gap-2 bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-[#08994A] dark:text-white px-4 py-2 rounded-full border-[1px] border-[#0EFF7B1A] dark:border-[#0EFF7B1A] hover:bg-[#0EFF7B33] dark:hover:bg-[#0EFF7B33]"
          >
            <Filter size={18} className="text-[#08994A] dark:text-[#0EFF7B]" />
            <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                    px-3 py-1 text-xs rounded-md shadow-md
                    bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                    transition-all duration-150">
                    Filter
              </span>
          </button>
        </div>
      </div>

      {/* Filter Popup */}
      {showFilterPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="w-[600px] rounded-[20px] border border-[#0EFF7B] dark:border-[#1E1E1E] bg-gray-100 dark:bg-[#000000E5] text-black dark:text-white p-6 shadow-lg backdrop-blur-md relative z-50">
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
            <div className="flex justify-between items-center pb-3 mb-4 relative z-10">
              <h3 className="text-black dark:text-white font-medium text-[16px]">
                Filter Profiles
              </h3>
              <button
                onClick={() => setShowFilterPopup(false)}
                className="w-6 h-6 rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B1A] bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] flex items-center justify-center text-gray-600 dark:text-white hover:text-[#08994A] dark:hover:text-[#0EFF7B]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-30">
              <Dropdown
                placeholder="Select Department"
                value={filtersData.department}
                onChange={handleDepartmentChange}
                options={departments}
                loading={departmentsLoading}
                disabled={departmentsLoading}
              />
              <Dropdown
                placeholder={!filtersData.department ? "Select department first" : "Select Specialist"}
                value={filtersData.specialist}
                onChange={handleSpecialistChange}
                options={specialists}
                loading={specialistsLoading}
                disabled={!filtersData.department || specialistsLoading}
              />
            </div>

            <div className="flex justify-center gap-6 mt-8 relative z-10">
              <button
                onClick={handleClearFilters}
                className="w-[104px] h-[33px] rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent px-3 py-2 text-black dark:text-white font-medium text-[14px] leading-[16px] shadow hover:bg-[#0EFF7B1A] dark:hover:bg-gray-900"
              >
                Clear
              </button>
              <button
                onClick={() => setShowFilterPopup(false)}
                className="w-[144px] h-[33px] rounded-[8px] border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66] px-3 py-2 bg-gradient-to-r from-[#0EFF7B] to-[#08994A] dark:from-[#14DC6F] dark:to-[#09753A] shadow text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition"
                style={{
                  background:
                    "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
                }}
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor/Nurse Popup */}
      {showEditPopup && selectedProfile && (
        <EditDoctorNursePopup
          onClose={() => {
            setShowEditPopup(false);
            setSelectedProfile(null);
          }}
          profile={selectedProfile}
          onUpdate={handleUpdateProfile}
        />
      )}

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-20">
        {paginatedProfiles.length > 0 ? (
          paginatedProfiles.map((profile, index) => (
            <div
              key={profile.id || index}
              className="w-full h-full bg-gray-200 dark:bg-[#0EFF7B08] rounded-lg p-5 border border-[#0EFF7B80] dark:border-[#0EFF7B80] shadow-[0px_0px_4px_0px_#A0A0A040] dark:shadow-[0px_0px_4px_0px_#0EFF7B] relative text-center flex flex-col items-center"
              style={{ zIndex: 20 }}
            >
              <div className="absolute top-4 left-4 text-[#08994A] dark:text-[#0EFF7B] text-[14px]">
                {profile.type}
              </div>

              {/* Profile Picture */}
              <div className="w-16 h-16 mx-auto mb-4 mt-10 rounded-full overflow-hidden border-2 border-[#0EFF7B] bg-gray-200 dark:bg-neutral-800 flex items-center justify-center">
                {profile.profilePicture ? (
                  <img
                    src={getProfilePictureUrl(profile.profilePicture)}
                    alt={`${profile.name}'s profile`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      const parent = e.target.parentElement;
                      const fallback = document.createElement("div");
                      fallback.className =
                        "w-full h-full flex items-center justify-center";
                      fallback.innerHTML =
                        '<User size={24} className="text-gray-400" />';
                      parent.appendChild(fallback);
                    }}
                  />
                ) : (
                  <User size={24} className="text-gray-400" />
                )}
              </div>

              <p className="text-[18px] font-medium text-[#08994A] dark:text-[#0EFF7B] mb-1">
                {profile.name}
              </p>
              <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-4">
                {profile.qualification}
              </p>
              <div className="w-full text-left space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-[14px] text-gray-600 dark:text-gray-400">
                    Department
                  </span>
                  <span className="text-[14px] text-gray-600 dark:text-gray-400">
                    {profile.department}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-gray-600 dark:text-gray-400">
                    Join Date
                  </span>
                  <span className="text-[14px] text-gray-600 dark:text-gray-400">
                    {profile.joinDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-gray-600 dark:text-gray-400">
                    Contact
                  </span>
                  <span className="text-[14px] text-gray-600 dark:text-gray-400">
                    {profile.contact}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-gray-600 dark:text-gray-400">
                    Email ID
                  </span>
                  <span className="text-[14px] text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                    {profile.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleEditProfile(profile)}
                className="absolute group top-4 right-4 flex items-center gap-1 text-[#4D58FF] dark:text-[#6E92FF] text-[12px]"
              >
                <Edit size={16} />
                <span>Edit</span>
                <span className="absolute right-5 right-1/2 -translate-x-1/2 whitespace-nowrap
                    px-3 py-1 text-xs rounded-md shadow-md
                    bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                    transition-all duration-150">Edit</span>
              </button>
              <button
                className="relative group w-[112px] h-[33px] rounded-[8px] border-[2px] border-[#0EFF7B66] dark:border-[#025126] bg-[#08994A] dark:bg-[#0EFF7B1A] text-white text-[14px] font-medium hover:scale-105 transition"
                onClick={() =>
                  navigate("/Doctors-Nurse/ViewProfile", {
                    state: { profile: profile.originalData },
                  })
                }
              >
                View profile
                <span className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                    px-3 py-1 text-xs rounded-md shadow-md
                    bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                    transition-all duration-150">View Profile</span>
              </button>
              
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-6 text-gray-600 dark:text-gray-400 italic">
            No profiles found
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center mt-4 bg-gray-100 dark:bg-transparent p-4 rounded gap-x-4 dark:border-[#1E1E1E] relative z-10">
        <div className="text-sm text-black dark:text-white">
          Page {currentPage} of {totalPages} (
          {(currentPage - 1) * rowsPerPage + 1} to{" "}
          {Math.min(currentPage * rowsPerPage, filteredProfiles.length)} from{" "}
          {filteredProfiles.length} Records)
        </div>
        <div className="flex items-center gap-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`w-5 h-5 flex items-center justify-center rounded-full border ${
              currentPage === 1
                ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
                : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
            }`}
          >
            <ChevronLeft size={12} className="text-[#08994A] dark:text-white" />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`w-5 h-5 flex items-center justify-center rounded-full border ${
              currentPage === totalPages || totalPages === 0
                ? "bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] text-black dark:text-white opacity-50"
                : "bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
            }`}
          >
            <ChevronRight
              size={12}
              className="text-[#08994A] dark:text-white"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
