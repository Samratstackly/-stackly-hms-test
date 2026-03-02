// // import { useState } from "react";
// // import { NavLink, useLocation } from "react-router-dom";
// // import LOGO from "../assets/logo.png";
// // import {
// //   LayoutDashboard,
// //   CalendarDays,
// //   Users,
// //   Building2,
// //   Bed,
// //   UserCog,
// //   Pill,
// //   Boxes,
// //   ClipboardList,
// //   FileText,
// //   DollarSign,
// //   ReceiptText,
// //   CreditCard,
// //   Microscope,
// //   BarChart3,
// //   Activity,
// //   Droplet,
// //   HeartPulse,
// //   Ambulance,
// //   User,
// //   ShieldCheck,
// //   ChevronDown,
// // } from "lucide-react";

// // const menuItems = [
// //   { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
// //   { name: "Appointments", path: "/appointments", icon: CalendarDays },

// //   {
// //     name: "Patients",
// //     path: "/patients",
// //     icon: Users,
// //     dropdown: [
// //       { name: "New Registration", path: "/patients/new-registration", icon: User },
// //       {
// //         name: "IPD / OPD Patient",
// //         path: "/patients/ipd-opd",
// //         paths: ["/patients/ipd-opd", "/patients/out-patients"],
// //         icon: Bed
// //       },
// //       {
// //         name: "Patient Profile",
// //         path: "/patients/profile",
// //         paths: ["/patients/profile", "/patients/profile/details"],
// //         icon: ClipboardList
// //       },
// //     ],
// //   },

// //   {
// //     name: "Administration",
// //     path: "/Administration",
// //     icon: Building2,
// //     dropdown: [
// //       { name: "Departments", path: "/Administration/Departments", icon: Building2 },
// //       {
// //         name: "Room Management",
// //         path: "/Administration/RoomManagement",
// //         paths: ["/Administration/roommanagement", "/Administration/BedList", "/Administration/RoomManagement"],
// //         icon: Bed
// //       },
// //       { name: "Staff Management", path: "/Administration/StaffManagement", icon: UserCog },
// //     ],
// //   },

// //   {
// //     name: "Pharmacy",
// //     path: "/Pharmacy",
// //     icon: Pill,
// //     dropdown: [
// //       { name: "Stock & Inventory", path: "/Pharmacy/Stock-Inventory", icon: Boxes },
// //       { name: "Bill", path: "/Pharmacy/Bill", icon: DollarSign },
// //     ],
// //   },

// //   {
// //     name: "Doctors / Nurse",
// //     path: "/Doctors-Nurse",
// //     icon: ShieldCheck,
// //     dropdown: [
// //       { name: "Add Doctor / Nurse", path: "/Doctors-Nurse/AddDoctorNurse", icon: User },
// //       { name: "Doctor / Nurse", path: "/Doctors-Nurse/DoctorNurseProfile",
// //         paths: ["/Doctors-Nurse/DoctorNurseProfile", "/Doctors-Nurse/ViewProfile"],
// //          icon: Users },
// //          { name: "MedicineAllocation", path: "/Doctors-Nurse/MedicineAllocation", icon: Pill },
// //     ],
// //   },

// //   {
// //     name: "Clinical Resources",
// //     path: "/ClinicalResources",
// //     icon: Microscope,
// //     dropdown: [
// //       { name: "Laboratory Reports", path: "/ClinicalResources/Laboratory/LaboratoryReports", icon: BarChart3 },
// //       { name: "Blood Bank", path: "/ClinicalResources/ClinicalReports/BloodBank", icon: HeartPulse },
// //       { name: "Ambulance Management", path: "/ClinicalResources/EmergencyServices/Ambulance", icon: Ambulance },
// //     ],
// //   },

// //   {
// //     name: "Billing",
// //     path: "/Billing",
// //     icon: DollarSign,
// //   },

// //   { name: "Accounts", path: "/UserSettings",
// //     paths: ["/security", "/UserSettings"],
// //      icon: UserCog ,
// //     //  dropdown: [
// //     //   { name: "AccessManagement", path: "/UserSettings/AccessManagement", icon: User },

// //     // ],
// //      }
// // ];

// // const MenuItem = ({ item, level = 0, isCollapsed }) => {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const location = useLocation();
// //   const hasDropdown = item.dropdown && item.dropdown.length > 0;
// //   const paddingLeft = level === 0 ? "pl-3" : level === 1 ? "pl-6" : "pl-9";

// //   const isParentActive = item.paths
// //     ? item.paths.includes(location.pathname)
// //     : location.pathname.startsWith(item.path + "/");

// //   const isExactActive = item.paths
// //     ? item.paths.includes(location.pathname)
// //     : location.pathname === item.path;

// //   const Icon = item.icon;

// //   const iconSizeClass = level === 0 ? "w-[24px] h-[24px]" : "w-[16px] h-[16px]";
// //   const textSizeClass = level === 0 ? "text-[14px]" : "text-[12px]";

// //   return (
// //     <li className="w-full font-['Inter']">
// //       {hasDropdown ? (
// //         <>
// //           <div
// //             onClick={() => setIsOpen(!isOpen)}
// //             className={`w-full h-[40px] rounded-[8px] flex items-center justify-between pr-3 ${paddingLeft} cursor-pointer transition-all duration-200
// //               ${isExactActive || isParentActive
// //                 ? "bg-gradient-to-r from-[#0EFF7B] to-[#08994A] text-white shadow-[0px_2px_8px_0px_#0EFF7B40]"
// //                 : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-black hover:bg-gradient-to-r hover:from-[#0EFF7B] hover:to-[#08994A] hover:shadow-[0px_2px_8px_0px_#0EFF7B40]"
// //               }`}
// //           >
// //             <div className={`flex items-center gap-2 ${isCollapsed ? "justify-center w-full" : ""}`}>
// //               <Icon
// //                 className={`${iconSizeClass} ${isExactActive || isParentActive ? "text-white" : "text-[#08994A] dark:text-emerald-500"}`}
// //               />
// //               {!isCollapsed && <span className={`${textSizeClass} font-['Inter']`}>{item.name}</span>}
// //             </div>
// //             {!isCollapsed && (
// //               <ChevronDown
// //                 size={16}
// //                 className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-white" : "text-[#08994A] dark:text-emerald-500"}`}
// //               />
// //             )}
// //           </div>

// //           <div
// //             className="overflow-hidden transition-all duration-500 ease-in-out"
// //             style={{ maxHeight: isOpen ? "500px" : "0px" }}
// //           >
// //             <ul className="mt-2 gap-[10px] flex flex-col gap-0.5 font-['Inter']">
// //               {item.dropdown.map((subItem, subIdx) => (
// //                 <MenuItem key={subIdx} item={subItem} level={level + 1} isCollapsed={isCollapsed} />
// //               ))}
// //             </ul>
// //           </div>
// //         </>
// //       ) : (
// //         <NavLink
// //           to={item.path}
// //           className={() => {
// //             const active = item.paths
// //               ? item.paths.includes(location.pathname)
// //               : location.pathname === item.path;
// //             return `w-full h-[40px] flex items-center ${paddingLeft} gap-2 cursor-pointer transition-all duration-200 rounded-[8px]
// //               ${level === 0
// //                 ? active
// //                   ? "bg-gradient-to-r from-[#0EFF7B] to-[#08994A] text-white shadow-[0px_2px_8px_0px_#0EFF7B40]"
// //                   : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-black hover:bg-gradient-to-r hover:from-[#0EFF7B] hover:to-[#08994A] hover:shadow-[0px_2px_8px_0px_#0EFF7B40]"
// //                 : active
// //                   ? "bg-[#0EFF7B1A] text-[#08994A] dark:text-white"
// //                   : "text-gray-600 dark:text-gray-300 hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"}`;
// //           }}
// //         >
// //           {() => (
// //             <>
// //               <Icon className={`${iconSizeClass} ${isExactActive || isParentActive ? "text-[#08994A]" : "text-[#08994A] dark:text-emerald-500"}`} />
// //               {!isCollapsed && <span className={`${textSizeClass} font-['Inter']`}>{item.name}</span>}
// //             </>
// //           )}
// //         </NavLink>
// //       )}
// //     </li>
// //   );
// // };

// // export default function Sidebar({ isCollapsed, setIsCollapsed }) {
// //   return (
// //     <div
// //       className={`mt-[20px] ml-[15px] mb-4 rounded-[8px]  bg-gray-100 dark:bg-[#0D0D0D]  flex flex-col fixed left-0 top-0 transition-all duration-300`}
// //       style={{
// //         width: isCollapsed ? "80px" : "220px",
// //         height: "calc(100vh - 110px)",
// //         minHeight: "590px",
// //         maxHeight: "1860px",
// //       }}
// //     > {/* Border gradient layer */}
// //   <div
// //     className="absolute inset-0 rounded-[8px] p-[1.5px] pointer-events-none"
// //     style={{
// //       background:
// //         "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
// //       WebkitMask:
// //         "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
// //       WebkitMaskComposite: "xor",
// //       maskComposite: "exclude",
// //       zIndex: 1,
// //     }}
// //   ></div>

// //   {/* Dark overlay for dark mode */}
// //   <div
// //     className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
// //     style={{
// //       background:
// //         "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
// //       zIndex: 0,
// //     }}
// //   ></div>
// //       {/* Header */}
// //       <div className="w-[170px] h-[36px] mt-5 mb-2 ml-3 flex items-center gap-[7px] px-1 py-4">
// //         <button
// //           onClick={() => setIsCollapsed(!isCollapsed)}
// //           className="w-[36px] h-[36px] flex items-center justify-center rounded-[4px] border border-[#08994A] dark:border-[#1E1E1E] bg-transparent"
// //         >
// //           <svg
// //             width="24px"
// //             height="24px"
// //             viewBox="0 0 24 24"
// //             fill="none"
// //             xmlns="http://www.w3.org/2000/svg"
// //             className="text-[#08994A] dark:text-emerald-500"
// //           >
// //             <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
// //           </svg>
// //         </button>

// //         {!isCollapsed && <img src={LOGO} alt="Logo" className="w-[118px] h-[36px] object-contain" />}
// //       </div>

// //       {/* Menu Items */}
// //       <div className="flex-1 p-3 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
// //         <ul className="flex flex-col gap-1.5">
// //           {menuItems.map((item, idx) => (
// //             <MenuItem key={idx} item={item} isCollapsed={isCollapsed} />
// //           ))}
// //         </ul>
// //       </div>
// //     </div>
// //   );
// // }

// // import { useState } from "react";
// // import { NavLink, useLocation } from "react-router-dom";
// // import LOGO from "../assets/logo.png";
// // import {
// //   LayoutDashboard,
// //   CalendarDays,
// //   Users,
// //   Building2,
// //   Bed,
// //   UserCog,
// //   Pill,
// //   Boxes,
// //   ClipboardList,
// //   DollarSign,
// //   Microscope,
// //   BarChart3,
// //   HeartPulse,
// //   Calendar,
// //   Ambulance,
// //   User,
// //   ShieldCheck,
// //   ChevronDown,
// // } from "lucide-react";
// // import { usePermissions } from "./PermissionContext";

// // // === MENU ITEMS WITH EXACT PERMISSION KEYS FROM YOUR MODEL ===
// // const menuItems = [
// //   {
// //     name: "Dashboard",
// //     path: "/dashboard",
// //     icon: LayoutDashboard,
// //     permission: "dashboard",
// //   },
// //   {
// //     name: "Appointments",
// //     path: "/appointments",
// //     icon: CalendarDays,
// //     permission: "appointments",
// //   },

// //   // Patients
// //   {
// //     name: "Patients",
// //     path: "/patients",
// //     icon: Users,
// //     dropdown: [
// //       {
// //         name: "New Registration",
// //         path: "/patients/new-registration",
// //         icon: User,
// //         permission: "patients_create",
// //       },
// //       {
// //         name: "IPD / OPD Patient",
// //         path: "/patients/ipd-opd",
// //         paths: ["/patients/ipd-opd", "/patients/out-patients"],
// //         icon: Bed,
// //         permission: "patients_view",
// //       },
// //       {
// //         name: "Patient Profile",
// //         path: "/patients/profile",
// //         paths: ["/patients/profile", "/patients/profile/details"],
// //         icon: ClipboardList,
// //         permission: "patients_profile",
// //       },
// //       {
// //       name: "Treatment Charges",
// //       path: "/patients/treatment-charges",
// //       icon: DollarSign, // Using DollarSign icon for charges
// //       permission: "treatment_charges", // Add this permission key
// //     },
// //     ],
// //   },

// //   // Administration
// //   {
// //     name: "Administration",
// //     path: "/Administration",
// //     icon: Building2,
// //     dropdown: [
// //       {
// //         name: "Departments",
// //         path: "/Administration/Departments",
// //         icon: Building2,
// //         permission: "departments",
// //       },
// //       {
// //         name: "Room Management",
// //         path: "/Administration/RoomManagement",
// //         paths: [
// //           "/Administration/roommanagement",
// //           "/Administration/BedList",
// //           "/Administration/RoomManagement",
// //         ],
// //         icon: Bed,
// //         permission: "room_management",
// //       },
// //       {
// //         name: "Staff Management",
// //         path: "/Administration/StaffManagement",
// //         icon: UserCog,
// //         permission: "staff_management",
// //       },
// //     ],
// //   },

// //   // Pharmacy
// //   {
// //     name: "Pharmacy",
// //     path: "/Pharmacy",
// //     icon: Pill,
// //     dropdown: [
// //       {
// //         name: "Stock & Inventory",
// //         path: "/Pharmacy/Stock-Inventory",
// //         icon: Boxes,
// //         permission: "pharmacy_inventory",
// //       },
// //       {
// //         name: "Bill",
// //         path: "/Pharmacy/Bill",
// //         icon: DollarSign,
// //         permission: "pharmacy_billing",
// //       },
// //     ],
// //   },

// //   // Doctors / Nurse
// //   {
// //     name: "Doctors / Nurse",
// //     path: "/Doctors-Nurse",
// //     icon: ShieldCheck,
// //     dropdown: [
// //       {
// //         name: "Add Doctor / Nurse",
// //         path: "/Doctors-Nurse/AddDoctorNurse",
// //         icon: User,
// //         permission: "doctors_manage",
// //       },
// //       {
// //         name: "Doctor / Nurse",
// //         path: "/Doctors-Nurse/DoctorNurseProfile",
// //         paths: [
// //           "/Doctors-Nurse/DoctorNurseProfile",
// //           "/Doctors-Nurse/ViewProfile",
// //         ],
// //         icon: Users,
// //         permission: "doctors_manage",
// //       },
// //       {
// //         name: "Medicine Allocation",
// //         path: "/Doctors-Nurse/MedicineAllocation",
// //         icon: Pill,
// //         permission: "medicine_allocation",
// //       },
// //       {
// //         name: "Appointment Calendar",
// //         path: "/appointments/calendar",
// //         icon: Calendar,
// //         permission: "appointments", // or "doctors_manage" if you prefer
// //       },
// //     ],
// //   },

// //   // Clinical Resources
// //   {
// //     name: "Clinical Resources",
// //     path: "/ClinicalResources",
// //     icon: Microscope,
// //     dropdown: [
// //       {
// //         name: "Laboratory Reports",
// //         path: "/ClinicalResources/Laboratory/LaboratoryReports",
// //         icon: BarChart3,
// //         permission: "lab_reports",
// //       },
// //       {
// //       name: "Laboratory Management",
// //       path: "/ClinicalResources/Laboratory/Laboratory",
// //       icon: Microscope, // Using the Microscope icon for lab management
// //       permission: "laboratory_manage",
// //     },
// //       {
// //         name: "Blood Bank",
// //         path: "/ClinicalResources/ClinicalReports/BloodBank",
// //         icon: HeartPulse,
// //         permission: "blood_bank",
// //       },
// //       {
// //         name: "Ambulance Management",
// //         path: "/ClinicalResources/EmergencyServices/Ambulance",
// //         icon: Ambulance,
// //         permission: "ambulance",
// //       },
// //     ],
// //   },

// //   {
// //     name: "Billing",
// //     path: "/Billing",
// //     icon: DollarSign,
// //     permission: "billing",
// //   },

// //   {
// //     name: "Accounts",
// //     path: "/UserSettings",
// //     paths: ["/security", "/UserSettings"],
// //     icon: UserCog,
// //     permission: "user_settings",
// //   },
// // ];

// // // Recursive MenuItem - unchanged design, only logic fixed
// // const MenuItem = ({ item, level = 0, isCollapsed, hasPermission }) => {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const location = useLocation();
// //   const hasDropdown = item.dropdown && item.dropdown.length > 0;

// //   // Filter visible children
// //   const visibleChildren = hasDropdown
// //     ? item.dropdown.filter((child) =>
// //         child.permission ? hasPermission(child.permission) : true
// //       )
// //     : [];

// //   // Hide parent if no children visible
// //   if (hasDropdown && visibleChildren.length === 0) {
// //     return null;
// //   }

// //   // Hide standalone item if no permission
// //   if (!hasDropdown && item.permission && !hasPermission(item.permission)) {
// //     return null;
// //   }

// //   const isParentActive = item.paths
// //     ? item.paths.some((p) => location.pathname.startsWith(p))
// //     : location.pathname.startsWith(item.path);

// //   const isExactActive = item.paths
// //     ? item.paths.includes(location.pathname)
// //     : location.pathname === item.path;

// //   const Icon = item.icon;
// //   const paddingLeft = level === 0 ? "pl-3" : level === 1 ? "pl-6" : "pl-9";
// //   const iconSizeClass = level === 0 ? "w-[24px] h-[24px]" : "w-[16px] h-[16px]";
// //   const textSizeClass = level === 0 ? "text-[14px]" : "text-[12px]";

// //   return (
// //     <li className="w-full font-[Helvetica]">
// //       {hasDropdown ? (
// //         <>
// //           <div
// //             onClick={() => setIsOpen(!isOpen)}
// //             className={`w-full h-[40px] rounded-[8px] flex items-center justify-between pr-3 ${paddingLeft} cursor-pointer transition-all duration-200
// //               ${
// //                 isExactActive || isParentActive
// //                   ? "bg-gradient-to-r from-[#0EFF7B] to-[#08994A] text-white shadow-[0px_2px_8px_0px_#0EFF7B40]"
// //                   : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-black hover:bg-gradient-to-r hover:from-[#0EFF7B] hover:to-[#08994A] hover:shadow-[0px_2px_8px_0px_#0EFF7B40]"
// //               }`}
// //           >
// //             <div
// //               className={`flex items-center gap-2 ${
// //                 isCollapsed ? "justify-center w-full" : ""
// //               }`}
// //             >
// //               <Icon
// //                 className={`${iconSizeClass} ${
// //                   isExactActive || isParentActive
// //                     ? "text-white"
// //                     : "text-[#08994A] dark:text-emerald-500"
// //                 }`}
// //               />
// //               {!isCollapsed && (
// //                 <span className={`${textSizeClass} font-[Helvetica]`}>
// //                   {item.name}
// //                 </span>
// //               )}
// //             </div>
// //             {!isCollapsed && (
// //               <ChevronDown
// //                 size={16}
// //                 className={`transition-transform duration-200 ${
// //                   isOpen
// //                     ? "rotate-180 text-white"
// //                     : "text-[#08994A] dark:text-emerald-500"
// //                 }`}
// //               />
// //             )}
// //           </div>

// //           <div
// //             className="overflow-hidden transition-all duration-500 ease-in-out"
// //             style={{ maxHeight: isOpen ? "500px" : "0px" }}
// //           >
// //             <ul className="mt-2 flex flex-col gap-0.5 font-[Helvetica]">
// //               {visibleChildren.map((child, idx) => (
// //                 <MenuItem
// //                   key={idx}
// //                   item={child}
// //                   level={level + 1}
// //                   isCollapsed={isCollapsed}
// //                   hasPermission={hasPermission}
// //                 />
// //               ))}
// //             </ul>
// //           </div>
// //         </>
// //       ) : (
// //         <NavLink
// //           to={item.path}
// //           className={`w-full h-[40px] flex items-center ${paddingLeft} gap-2 rounded-[8px] transition-all duration-200
// //             ${
// //               isExactActive
// //                 ? "bg-gradient-to-r from-[#0EFF7B] to-[#08994A] text-white shadow-[0px_2px_8px_0px_#0EFF7B40]"
// //                 : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-black hover:bg-gradient-to-r hover:from-[#0EFF7B] hover:to-[#08994A] hover:shadow-[0px_2px_8px_0px_#0EFF7B40]"
// //             }`}
// //         >
// //           <Icon
// //             className={`${iconSizeClass} text-[#08994A] dark:text-emerald-500`}
// //           />
// //           {!isCollapsed && (
// //             <span className={`${textSizeClass} font-[Helvetica]`}>
// //               {item.name}
// //             </span>
// //           )}
// //         </NavLink>
// //       )}
// //     </li>
// //   );
// // };

// // export default function Sidebar({ isCollapsed, setIsCollapsed }) {
// //   const { hasPermission, currentUser, loading } = usePermissions();

// //   if (loading) {
// //     return (
// //       <div
// //         className="mt-[20px] ml-[15px] mb-4 rounded-[8px] bg-gray-100 dark:bg-[#0D0D0D] flex flex-col fixed left-0 top-0 transition-all duration-300"
// //         style={{
// //           width: isCollapsed ? "80px" : "220px",
// //           height: "calc(100vh - 110px)",
// //           minHeight: "590px",
// //         }}
// //       >
// //         <div className="flex-1 p-3 flex items-center justify-center">
// //           <div className="text-gray-500 dark:text-gray-400">Loading...</div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Filter top-level items: show if standalone has permission OR any child has permission
// //   const filteredMenuItems = menuItems.filter((item) => {
// //     if (!item.dropdown) {
// //       return !item.permission || hasPermission(item.permission);
// //     }
// //     return item.dropdown.some(
// //       (child) => !child.permission || hasPermission(child.permission)
// //     );
// //   });

// //   return (
// //     <div
// //       className="mt-[20px] ml-[15px] mb-4 rounded-[8px] bg-gray-100 dark:bg-[#0D0D0D] flex flex-col fixed left-0 top-0 transition-all duration-300"
// //       style={{
// //         width: isCollapsed ? "80px" : "220px",
// //         height: "calc(100vh - 110px)",
// //         minHeight: "590px",
// //       }}
// //     >
// //       <div
// //         className="absolute inset-0 rounded-[8px] p-[1.5px] pointer-events-none"
// //         style={{
// //           background:
// //             "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
// //           WebkitMask:
// //             "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
// //           WebkitMaskComposite: "xor",
// //           maskComposite: "exclude",
// //           zIndex: 1,
// //         }}
// //       ></div>

// //       <div
// //         className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
// //         style={{
// //           background:
// //             "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
// //           zIndex: 0,
// //         }}
// //       ></div>

// //       <div className="w-[170px] h-[36px] mt-5 mb-2 ml-3 flex items-center gap-[7px] px-1 py-4 relative z-10">
// //         <button
// //           onClick={() => setIsCollapsed(!isCollapsed)}
// //           className="w-[36px] h-[36px] flex items-center justify-center rounded-[4px] border border-[#08994A] dark:border-[#1E1E1E] bg-transparent"
// //         >
// //           <svg
// //             width="24px"
// //             height="24px"
// //             viewBox="0 0 24 24"
// //             fill="none"
// //             xmlns="http://www.w3.org/2000/svg"
// //             className="text-[#08994A] dark:text-emerald-500"
// //           >
// //             <path
// //               d="M4 6H20M4 12H20M4 18H20"
// //               stroke="currentColor"
// //               strokeWidth="2"
// //               strokeLinecap="round"
// //             />
// //           </svg>
// //         </button>

// //         {!isCollapsed && (
// //           <img
// //             src={LOGO}
// //             alt="Logo"
// //             className="w-[118px] h-[36px] object-contain"
// //           />
// //         )}
// //       </div>

// //       <div className="flex-1 p-3 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
// //         <ul className="flex flex-col gap-1.5">
// //           {filteredMenuItems.map((item, idx) => (
// //             <MenuItem
// //               key={idx}
// //               item={item}
// //               isCollapsed={isCollapsed}
// //               hasPermission={hasPermission}
// //             />
// //           ))}
// //         </ul>

// //         {filteredMenuItems.length === 0 && (
// //           <div className="text-center p-4 text-gray-500 dark:text-gray-400">
// //             No accessible menu items
// //             <div className="text-xs mt-2">
// //               User: {currentUser?.username} | Role: {currentUser?.role} |
// //               Superuser: {currentUser?.is_superuser ? "Yes" : "No"}
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // Sidebar.jsx
// import { useState, useEffect } from "react";
// import { NavLink, useLocation } from "react-router-dom";
// import LOGO from "../assets/logo.png";
// import {
//   LayoutDashboard,
//   CalendarDays,
//   Users,
//   Building2,
//   Bed,
//   UserCog,
//   Pill,
//   Boxes,
//   ClipboardList,
//   DollarSign,
//   Microscope,
//   BarChart3,
//   HeartPulse,
//   Calendar,
//   Ambulance,
//   User,
//   ShieldCheck,
//   ChevronDown,
//   Settings,
//   Stethoscope,
// } from "lucide-react";
// import { usePermissions } from "./PermissionContext";
// import { useHospital } from "./HospitalContext";

// // === MENU ITEMS WITH EXACT PERMISSION KEYS FROM YOUR MODEL ===
// const menuItems = [
//   {
//     name: "Dashboard",
//     path: "/dashboard",
//     icon: LayoutDashboard,
//     permission: "dashboard",
//   },
//   {
//     name: "Appointments",
//     path: "/appointments",
//     icon: CalendarDays,
//     permission: "appointments",
//   },
//   // Patients
//   {
//     name: "Patients",
//     path: "/patients",
//     icon: Users,
//     dropdown: [
//       {
//         name: "New Registration",
//         path: "/patients/new-registration",
//         icon: User,
//         permission: "patients_create",
//       },
//       {
//         name: "IPD / OPD Patient",
//         path: "/patients/ipd-opd",
//         paths: ["/patients/ipd-opd", "/patients/out-patients"],
//         icon: Bed,
//         permission: "patients_view",
//       },
//       {
//         name: "Patient Profile",
//         path: "/patients/profile",
//         paths: ["/patients/profile", "/patients/profile/details"],
//         icon: ClipboardList,
//         permission: "patients_profile",
//       },
//       {
//         name: "Treatment Charges",
//         path: "/patients/treatment-charges",
//         icon: DollarSign,
//         permission: "treatment_charges",
//       },
//       {
//       name: "Surgeries",
//       path: "/patients/surgeries",
//       icon: Stethoscope,
//       permission: "surgeries", // Add this permission key
//     },
//     ],
//   },
//   // Administration
//   {
//     name: "Administration",
//     path: "/administration",
//     icon: Building2,
//     dropdown: [
//       {
//         name: "Departments",
//         path: "/administration/departments",
//         icon: Building2,
//         permission: "departments",
//       },
//       {
//         name: "Room Management",
//         path: "/Administration/RoomManagement",
//         paths: [
//           "/Administration/roommanagement",
//           "/Administration/BedList",
//           "/Administration/RoomManagement",
//         ],
//         icon: Bed,
//         permission: "room_management",
//       },
//       {
//         name: "Staff Management",
//         path: "/Administration/StaffManagement",
//         icon: UserCog,
//         permission: "staff_management",
//       },
//     ],
//   },
//   // Pharmacy
//   {
//     name: "Pharmacy",
//     path: "/pharmacy",
//     icon: Pill,
//     dropdown: [
//       {
//         name: "Stock & Inventory",
//         path: "/pharmacy/stock-inventory",
//         icon: Boxes,
//         permission: "pharmacy_inventory",
//       },
//       {
//         name: "Bill",
//         path: "/pharmacy/bill",
//         icon: DollarSign,
//         permission: "pharmacy_billing",
//       },
//     ],
//   },
//   // Doctors / Nurse
//   {
//     name: "Doctors / Nurse",
//     path: "/doctors-nurse",
//     icon: ShieldCheck,
//     dropdown: [
//             {
//         name: "Add Doctor / Nurse",
//         path: "/Doctors-Nurse/AddDoctorNurse",
//         icon: User,
//         permission: "doctors_manage",
//       },
//       {
//         name: "Doctor / Nurse",
//         path: "/Doctors-Nurse/DoctorNurseProfile",
//         paths: [
//           "/Doctors-Nurse/DoctorNurseProfile",
//           "/Doctors-Nurse/ViewProfile",
//         ],
//         icon: Users,
//         permission: "doctors_manage",
//       },
//             {
//         name: "Medicine Allocation",
//         path: "/Doctors-Nurse/MedicineAllocation",
//         icon: Pill,
//         permission: "medicine_allocation",
//       },
//       {
//         name: "Appointment Calendar",
//         path: "/appointments/calendar",
//         icon: Calendar,
//         permission: "doctors_manage",
//       },
//     ],
//   },
//   // Clinical Resources
//   {
//     name: "Clinical Resources",
//     path: "/clinical-resources",
//     icon: Microscope,
//     dropdown: [
//             {
//         name: "Laboratory Reports",
//         path: "/ClinicalResources/Laboratory/LaboratoryReports",
//         icon: BarChart3,
//         permission: "lab_reports",
//       },
//       {
//       name: "Laboratory Management",
//       path: "/ClinicalResources/Laboratory/Laboratory",
//       icon: Microscope, // Using the Microscope icon for lab management
//       permission: "laboratory_manage",
//     },
//       {
//         name: "Blood Bank",
//         path: "/ClinicalResources/ClinicalReports/BloodBank",
//         icon: HeartPulse,
//         permission: "blood_bank",
//       },
//       {
//         name: "Ambulance Management",
//         path: "/ClinicalResources/EmergencyServices/Ambulance",
//         icon: Ambulance,
//         permission: "ambulance",
//       },
//     ],
//   },
//   {
//     name: "Billing",
//     path: "/billing",
//     icon: DollarSign,
//     permission: "billing",
//   },
//   // Settings Section with proper routing
//   {
//     name: "Settings",
//     path: "/settings",
//     icon: Settings,
//     permission: "settings_access",
//   },
//   {
//     name: "Accounts",
//     path: "/UserSettings",
//     paths: ["/security", "/UserSettings"],
//     icon: UserCog,
//     permission: "user_settings"
//   },
// ];

// // Recursive MenuItem component
// const MenuItem = ({ item, level = 0, isCollapsed, hasPermission }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const location = useLocation();
//   const hasDropdown = item.dropdown && item.dropdown.length > 0;

//   // Filter visible children
//   const visibleChildren = hasDropdown
//     ? item.dropdown.filter((child) =>
//         child.permission ? hasPermission(child.permission) : true,
//       )
//     : [];

//   // Hide parent if no children visible
//   if (hasDropdown && visibleChildren.length === 0) {
//     return null;
//   }

//   // Hide standalone item if no permission
//   if (!hasDropdown && item.permission && !hasPermission(item.permission)) {
//     return null;
//   }

//   const isParentActive = item.paths
//     ? item.paths.some((p) => location.pathname.startsWith(p))
//     : location.pathname.startsWith(item.path);

//   const isExactActive = item.paths
//     ? item.paths.includes(location.pathname)
//     : location.pathname === item.path;

//   const Icon = item.icon;
//   const paddingLeft = level === 0 ? "pl-3" : level === 1 ? "pl-6" : "pl-9";
//   const iconSizeClass = level === 0 ? "w-[24px] h-[24px]" : "w-[16px] h-[16px]";
//   const textSizeClass = level === 0 ? "text-[14px]" : "text-[12px]";

//   return (
//     <li className="w-full font-[Helvetica]">
//       {hasDropdown ? (
//         <>
//           <div
//             onClick={() => setIsOpen(!isOpen)}
//             className={`w-full h-[40px] rounded-[8px] flex items-center justify-between pr-3 ${paddingLeft} cursor-pointer transition-all duration-200
//               ${
//                 isExactActive || isParentActive
//                   ? "bg-gradient-to-r from-[#0EFF7B] to-[#08994A] text-white shadow-[0px_2px_8px_0px_#0EFF7B40]"
//                   : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-black hover:bg-gradient-to-r hover:from-[#0EFF7B] hover:to-[#08994A] hover:shadow-[0px_2px_8px_0px_#0EFF7B40]"
//               }`}
//           >
//             <div
//               className={`flex items-center gap-2 ${
//                 isCollapsed ? "justify-center w-full" : ""
//               }`}
//             >
//               <Icon
//                 className={`${iconSizeClass} ${
//                   isExactActive || isParentActive
//                     ? "text-white"
//                     : "text-[#08994A] dark:text-emerald-500"
//                 }`}
//               />
//               {!isCollapsed && (
//                 <span className={`${textSizeClass} font-[Helvetica]`}>
//                   {item.name}
//                 </span>
//               )}
//             </div>
//             {!isCollapsed && (
//               <ChevronDown
//                 size={16}
//                 className={`transition-transform duration-200 ${
//                   isOpen
//                     ? "rotate-180 text-white"
//                     : "text-[#08994A] dark:text-emerald-500"
//                 }`}
//               />
//             )}
//           </div>
//           <div
//             className="overflow-hidden transition-all duration-500 ease-in-out"
//             style={{ maxHeight: isOpen ? "500px" : "0px" }}
//           >
//             <ul className="mt-2 flex flex-col gap-0.5 font-[Helvetica]">
//               {visibleChildren.map((child, idx) => (
//                 <MenuItem
//                   key={idx}
//                   item={child}
//                   level={level + 1}
//                   isCollapsed={isCollapsed}
//                   hasPermission={hasPermission}
//                 />
//               ))}
//             </ul>
//           </div>
//         </>
//       ) : (
//         <NavLink
//           to={item.path}
//           className={({ isActive }) =>
//             `w-full h-[40px] flex items-center ${paddingLeft} gap-2 rounded-[8px] transition-all duration-200
//             ${
//               isActive
//                 ? "bg-gradient-to-r from-[#0EFF7B] to-[#08994A] text-white shadow-[0px_2px_8px_0px_#0EFF7B40]"
//                 : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-black hover:bg-gradient-to-r hover:from-[#0EFF7B] hover:to-[#08994A] hover:shadow-[0px_2px_8px_0px_#0EFF7B40]"
//             }`
//           }
//         >
//           {({ isActive }) => (
//             <>
//               <Icon
//                 className={`${iconSizeClass} ${
//                   isActive
//                     ? "text-white"
//                     : "text-[#08994A] dark:text-emerald-500"
//                 }`}
//               />
//               {!isCollapsed && (
//                 <span className={`${textSizeClass} font-[Helvetica]`}>
//                   {item.name}
//                 </span>
//               )}
//             </>
//           )}
//         </NavLink>
//       )}
//     </li>
//   );
// };

// export default function Sidebar({ isCollapsed, setIsCollapsed }) {
//   const {
//     hasPermission,
//     currentUser,
//     loading: permissionsLoading,
//   } = usePermissions();
//   const {
//     hospitalInfo,
//     loading: hospitalLoading,
//     error: hospitalError,
//   } = useHospital();

//   // Show loading state
//   if (permissionsLoading) {
//     return (
//       <div
//   className="mt-[20px] ml-[15px] mb-4 rounded-[8px] bg-gray-100 dark:bg-[#0D0D0D]
//              flex flex-col fixed left-0 top-0 transition-all duration-300 z-50
//              overflow-hidden"
//   style={{
//     width: isCollapsed ? "80px" : "220px",
//     maxHeight: "calc(100vh - 110px)",
//   }}
// >
//         <div className="flex-1 p-3 flex items-center justify-center">
//           <div className="text-gray-500 dark:text-gray-400">Loading...</div>
//         </div>
//       </div>
//     );
//   }

//   // Filter top-level items: show if standalone has permission OR any child has permission
//   const filteredMenuItems = menuItems.filter((item) => {
//     // Settings require admin/superuser access
//     if (item.name === "Settings") {
//       return currentUser?.is_superuser || currentUser?.role === "admin";
//     }

//     if (!item.dropdown) {
//       return !item.permission || hasPermission(item.permission);
//     }
//     return item.dropdown.some(
//       (child) => !child.permission || hasPermission(child.permission),
//     );
//   });

//   return (
//     <div
//       className="mt-[20px] ml-[15px] mb-4 rounded-[8px] bg-gray-100 dark:bg-[#0D0D0D] flex flex-col fixed left-0 top-0 transition-all duration-300 z-50"
//       style={{
//         width: isCollapsed ? "80px" : "220px",
//         height: "calc(100vh - 110px)",
//         minHeight: "590px",
//       }}
//     >
//       <div
//         className="absolute inset-0 rounded-[8px] p-[1.5px] pointer-events-none"
//         style={{
//           background:
//             "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//           WebkitMask:
//             "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//           WebkitMaskComposite: "xor",
//           maskComposite: "exclude",
//           zIndex: 1,
//         }}
//       ></div>
//       <div
//         className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
//         style={{
//           background:
//             "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
//           zIndex: 0,
//         }}
//       ></div>

//       {/* Logo and Collapse Button */}
//       <div className="w-[170px] h-[36px] mt-5 mb-2 ml-3 flex items-center gap-[7px] px-1 py-4 relative z-10">
//         <button
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className="w-[36px] h-[36px] flex items-center justify-center rounded-[4px] border border-[#08994A] dark:border-[#1E1E1E] bg-transparent hover:bg-[#08994A]/10 transition-colors"
//           title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
//         >
//           <svg
//             width="24px"
//             height="24px"
//             viewBox="0 0 24 24"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//             className="text-[#08994A] dark:text-emerald-500"
//           >
//             <path
//               d="M4 6H20M4 12H20M4 18H20"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//             />
//           </svg>
//         </button>
//         {!isCollapsed && (
//           <div className="flex items-center">
//             {hospitalLoading ? (
//               <div className="w-[118px] h-[36px] flex items-center justify-center bg-gray-200 dark:bg-[#1A1A1A] rounded animate-pulse">
//                 <span className="text-xs text-gray-500 dark:text-gray-400">
//                   Loading...
//                 </span>
//               </div>
//             ) : hospitalError ? (
//               <div className="w-[118px] h-[36px] flex items-center justify-center bg-red-100 dark:bg-red-900/20 rounded">
//                 <span className="text-xs text-red-500 dark:text-red-400">
//                   Error
//                 </span>
//               </div>
//             ) : hospitalInfo.logo ? (
//               <img
//                 src={hospitalInfo.logo}
//                 alt={hospitalInfo.hospital_name || "Hospital Logo"}
//                 className="w-[118px] h-[36px] object-contain"
//                 onError={(e) => {
//                   // Fallback to default logo if hospital logo fails to load
//                   console.error("Failed to load hospital logo, using default");
//                   e.target.onerror = null;
//                   e.target.src = LOGO;
//                 }}
//               />
//             ) : (
//               <img
//                 src={LOGO}
//                 alt="Default Logo"
//                 className="w-[118px] h-[36px] object-contain"
//               />
//             )}
//           </div>
//         )}
//       </div>

//       {/* Menu Items */}
//       <div className="flex-1 p-3 overflow-auto">
//         <ul className="flex flex-col gap-1.5">
//           {filteredMenuItems.map((item, idx) => (
//             <MenuItem
//               key={idx}
//               item={item}
//               isCollapsed={isCollapsed}
//               hasPermission={hasPermission}
//             />
//           ))}
//         </ul>
//         {filteredMenuItems.length === 0 && (
//           <div className="text-center p-4 text-gray-500 dark:text-gray-400">
//             No accessible menu items
//             <div className="text-xs mt-2">
//               User: {currentUser?.username} | Role: {currentUser?.role} |
//               Superuser: {currentUser?.is_superuser ? "Yes" : "No"}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* User info at bottom */}
//       {!isCollapsed && currentUser && (
//         <div className="p-3 border-t border-gray-200 dark:border-[#2A2A2A] relative z-10">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0EFF7B] to-[#08994A] flex items-center justify-center text-white text-sm font-bold">
//               {currentUser.username?.charAt(0).toUpperCase() || "U"}
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
//                 {currentUser.username || "User"}
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
//                 {currentUser.role || "Role"}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// Sidebar.jsx - Fixed Hooks order + hidden scrollbar that appears on hover/scroll
// Sidebar.jsx - Fixed logo rendering with proper fallback on load error
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import LOGO from "../assets/logo.png";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Building2,
  Bed,
  UserCog,
  Pill,
  Boxes,
  ClipboardList,
  DollarSign,
  Microscope,
  BarChart3,
  HeartPulse,
  Calendar,
  Ambulance,
  User,
  ShieldCheck,
  ChevronDown,
  Settings,
  Stethoscope,
  BadgeDollarSign,
  FileText,
} from "lucide-react";
import { usePermissions } from "./PermissionContext";
import { useHospital } from "./HospitalContext";

// === MENU ITEMS ===
const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard",
  },
  {
    name: "Appointments",
    path: "/appointments",
    icon: CalendarDays,
    permission: "appointments",
  },
  {
    name: "Patients",
    path: "/patients",
    icon: Users,
    dropdown: [
      {
        name: "New Registration",
        path: "/patients/new-registration",
        icon: User,
        permission: "patients_create",
      },
      {
        name: "IPD / OPD Patient",
        path: "/patients/ipd-opd",
        paths: ["/patients/ipd-opd", "/patients/out-patients"],
        icon: Bed,
        permission: "patients_view",
      },
      {
        name: "Patient Profile",
        path: "/patients/profile",
        paths: ["/patients/profile", "/patients/profile/details"],
        icon: ClipboardList,
        permission: "patients_profile",
      },
       {
        name: "Treatment Charges",
        path: "/patients/treatment-charges",
        icon: DollarSign,
        permission: "treatment_charges",
      },
      
      {
        name: "Surgeries",
        path: "/patients/surgeries",
        icon: Stethoscope,
        permission: "surgeries",
      },
    ],
  },
  {
    name: "Administration",
    path: "/administration",
    icon: Building2,
    dropdown: [
      {
        name: "Departments",
        path: "/administration/departments",
        icon: Building2,
        permission: "departments",
      },
      {
        name: "Room Management",
        path: "/Administration/RoomManagement",
        paths: [
          "/Administration/roommanagement",
          "/Administration/BedList",
          "/Administration/RoomManagement",
        ],
        icon: Bed,
        permission: "room_management",
      },
    ],
  },
  {
    name: "Pharmacy",
    path: "/pharmacy",
    icon: Pill,
    dropdown: [
      {
        name: "Stock & Inventory",
        path: "/pharmacy/stock-inventory",
        icon: Boxes,
        permission: "pharmacy_inventory",
      },
      {
        name: "Bill",
        path: "/pharmacy/bill",
        icon: DollarSign,
        permission: "pharmacy_billing",
      },
    ],
  },
  {
    name: "Doctors / Nurse",
    path: "/doctors-nurse",
    icon: ShieldCheck,
    dropdown: [
      {
        name: "Add Doctor / Nurse",
        path: "/Doctors-Nurse/AddDoctorNurse",
        icon: User,
        permission: "doctors_manage",
      },
      {
        name: "Doctor / Nurse",
        path: "/Doctors-Nurse/DoctorNurseProfile",
        paths: [
          "/Doctors-Nurse/DoctorNurseProfile",
          "/Doctors-Nurse/ViewProfile",
        ],
        icon: Users,
        permission: "doctors_manage",
      },
      {
        name: "Medicine Allocation",
        path: "/Doctors-Nurse/MedicineAllocation",
        icon: Pill,
        permission: "medicine_allocation",
      },
      {
        name: "Appointment Calendar",
        path: "/appointments/calendar",
        icon: Calendar,
        permission: "doctors_manage",
      },
    ],
  },
  {
    name: "Clinical Resources",
    path: "/ClinicalResources",
    icon: Microscope,
    dropdown: [
      {
        name: "Laboratory Reports",
        path: "/ClinicalResources/Laboratory/LaboratoryReports",
        icon: BarChart3,
        permission: "lab_reports",
      },
      {
        name: "Laboratory Management",
        path: "/ClinicalResources/Laboratory/Laboratory",
        icon: Microscope,
        permission: "laboratory_manage",
      },
      {
        name: "Blood Bank",
        path: "/ClinicalResources/ClinicalReports/BloodBank",
        icon: HeartPulse,
        permission: "blood_bank",
      },
      {
        name: "Ambulance Management",
        path: "/ClinicalResources/EmergencyServices/Ambulance",
        icon: Ambulance,
        permission: "ambulance",
      },
    ],
  },
  {
    name: "Billing Management",
    path: "/billing",
    icon: DollarSign,
    dropdown: [
      {
        name: "Billing",
        path: "/billing-page",
        icon: FileText,
        permission: "billing",
      },
      {
        name: "Charges Management",
        path: "/billing/charges-management",
        icon: BadgeDollarSign,
        permission: "charges_management",
      },
      ],
    
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
    permission: "settings_access",
  },
  {
    name: "Accounts",
    path: "/UserSettings",
    paths: ["/security", "/UserSettings"],
    icon: UserCog,
    permission: "user_settings",
  },
];

// Recursive MenuItem component — unchanged from your working version
const MenuItem = ({ item, level = 0, isCollapsed, hasPermission }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const hasDropdown = item.dropdown && item.dropdown.length > 0;

  const visibleChildren = hasDropdown
    ? item.dropdown.filter((child) =>
        child.permission ? hasPermission(child.permission) : true,
      )
    : [];

  if (hasDropdown && visibleChildren.length === 0) return null;
  if (!hasDropdown && item.permission && !hasPermission(item.permission))
    return null;

  const isParentActive = item.paths
    ? item.paths.some((p) => currentPath.startsWith(p.toLowerCase()))
    : currentPath.startsWith(item.path.toLowerCase());

  const isExactActive = item.paths
    ? item.paths.some((p) => currentPath === p.toLowerCase())
    : currentPath === item.path.toLowerCase();

  useEffect(() => {
    if (isParentActive) setIsOpen(true);
  }, [isParentActive]);

  const Icon = item.icon;
  const paddingLeft = level === 0 ? "pl-3" : level === 1 ? "pl-6" : "pl-9";
  const iconSizeClass =
    level === 0 ? "w-[24px] h-[24px]" : "w-[16px] h-[16px]";
  const textSizeClass = level === 0 ? "text-[14px]" : "text-[12px]";

  return (
    <li className="w-full font-[Helvetica]">
      {hasDropdown ? (
        <>
          <div
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full h-[40px] rounded-[8px] flex items-center justify-between pr-3 ${paddingLeft} cursor-pointer transition-all duration-200
              ${
                isExactActive || isParentActive
                  ? "bg-gradient-to-r from-[#0EFF7B] to-[#08994A] text-white shadow-[0px_2px_8px_0px_#0EFF7B40]"
                  : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-black hover:bg-gradient-to-r hover:from-[#0EFF7B] hover:to-[#08994A] hover:shadow-[0px_2px_8px_0px_#0EFF7B40]"
              }`}
          >
            <div
              className={`flex items-center gap-2 ${
                isCollapsed ? "justify-center w-full" : ""
              }`}
            >
              <Icon
                className={`${iconSizeClass} ${
                  isExactActive || isParentActive
                    ? "text-white"
                    : "text-[#08994A] dark:text-emerald-500"
                }`}
              />
              {!isCollapsed && (
                <span className={`${textSizeClass} font-[Helvetica]`}>
                  {item.name}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  isOpen
                    ? "rotate-180 text-white"
                    : "text-[#08994A] dark:text-emerald-500"
                }`}
              />
            )}
          </div>
          <div
            className="overflow-hidden transition-all duration-500 ease-in-out"
            style={{ maxHeight: isOpen ? "500px" : "0px" }}
          >
            <ul className="mt-2 flex flex-col gap-0.5 font-[Helvetica]">
              {visibleChildren.map((child, idx) => (
                <MenuItem
                  key={idx}
                  item={child}
                  level={level + 1}
                  isCollapsed={isCollapsed}
                  hasPermission={hasPermission}
                />
              ))}
            </ul>
          </div>
        </>
      ) : (
        <NavLink
          to={item.path}
          className={({ isActive }) => {
            const isNavLinkActive =
              isActive ||
              (item.paths
                ? item.paths.some((p) => currentPath === p.toLowerCase())
                : currentPath === item.path.toLowerCase());
            return `w-full h-[40px] flex items-center ${paddingLeft} gap-2 rounded-[8px] transition-all duration-200
            ${
              isNavLinkActive
                ? "bg-gradient-to-r from-[#0EFF7B] to-[#08994A] text-white shadow-[0px_2px_8px_0px_#0EFF7B40]"
                : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-black hover:bg-gradient-to-r hover:from-[#0EFF7B] hover:to-[#08994A] hover:shadow-[0px_2px_8px_0px_#0EFF7B40]"
            }`;
          }}
        >
          {({ isActive }) => {
            const isActiveState =
              isActive ||
              (item.paths
                ? item.paths.some((p) => currentPath === p.toLowerCase())
                : currentPath === item.path.toLowerCase());
            return (
              <>
                <Icon
                  className={`${iconSizeClass} ${
                    isActiveState
                      ? "text-white"
                      : "text-[#08994A] dark:text-emerald-500"
                  }`}
                />
                {!isCollapsed && (
                  <span className={`${textSizeClass} font-[Helvetica]`}>
                    {item.name}
                  </span>
                )}
              </>
            );
          }}
        </NavLink>
      )}
    </li>
  );
};

// ── SidebarLogo ──────────────────────────────────────────────────────────────
// Isolated component so logo error state doesn't re-render the whole sidebar.
// When hospitalInfo.logo changes (e.g. after upload or refresh), we reset the
// error flag so the new URL gets a fresh attempt.
// Add this helper function at the top of Sidebar.jsx (outside the component)
function normalizeLogo(logo) {
  if (!logo) return null;
  if (logo.startsWith("http://") || logo.startsWith("https://")) return logo;
  const origin = window.location.origin;
  if (logo.startsWith("/media/")) return `${origin}${logo}`;
  if (logo.startsWith("/")) return `${origin}${logo}`;
  return `${origin}/media/${logo}`;
}

// Update the SidebarLogo component
function SidebarLogo({ hospitalInfo, hospitalLoading, hospitalError }) {
  const [imgError, setImgError] = useState(false);
  const [normalizedLogo, setNormalizedLogo] = useState(null);

  // Reset error flag and normalize URL whenever the logo changes
  useEffect(() => {
    setImgError(false);
    if (hospitalInfo.logo) {
      setNormalizedLogo(normalizeLogo(hospitalInfo.logo));
    } else {
      setNormalizedLogo(null);
    }
  }, [hospitalInfo.logo]);

  if (hospitalLoading) {
    return (
      <div className="w-[118px] h-[36px] flex items-center justify-center bg-gray-200 dark:bg-[#1A1A1A] rounded animate-pulse">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Loading...
        </span>
      </div>
    );
  }

  if (hospitalError) {
    return (
      <div className="w-[118px] h-[36px] flex items-center justify-center bg-red-100 dark:bg-red-900/20 rounded">
        <span className="text-xs text-red-500 dark:text-red-400">Error</span>
      </div>
    );
  }

  // Show hospital logo only when we have a URL AND it hasn't errored
  if (normalizedLogo && !imgError) {
    return (
      <img
        src={normalizedLogo}
        alt={hospitalInfo.hospital_name || "Hospital Logo"}
        className="w-[118px] h-[36px] object-contain"
        onError={() => {
          console.warn(
            "[Sidebar] Hospital logo failed to load:",
            normalizedLogo,
          );
          setImgError(true);
        }}
        onLoad={() => {
          // Successfully loaded - you could log this if needed
          console.log("[Sidebar] Hospital logo loaded successfully:", normalizedLogo);
        }}
      />
    );
  }

  // Fallback: default logo
  return (
    <img
      src={LOGO}
      alt="Default Logo"
      className="w-[118px] h-[36px] object-contain"
    />
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const {
    hasPermission,
    currentUser,
     permissions,
    loading: permissionsLoading,
  } = usePermissions();
 
  const {
    hospitalInfo,
    loading: hospitalLoading,
    error: hospitalError,
  } = useHospital();
    useEffect(() => {
    if (!permissionsLoading && currentUser) {
      console.log("👤 Current User:", currentUser);
      console.log("🔑 Has 'treatment_charges' permission:", hasPermission("treatment_charges"));
      console.log("🔑 Has 'surgeries' permission:", hasPermission("surgeries"));
      console.log("📋 All permissions object:", permissions);
    }
  }, [permissionsLoading, currentUser]);


  if (permissionsLoading) {
    return (
      <div
        className="mt-[20px] ml-[15px] mb-4 rounded-[8px] bg-gray-100 dark:bg-[#0D0D0D]
                 flex flex-col fixed left-0 top-0 transition-all duration-300 z-50 overflow-hidden"
        style={{
          width: isCollapsed ? "80px" : "220px",
          height: "calc(100vh - 110px)",
        }}
      >
        <div className="flex-1 p-3 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.name === "Settings") {
      return currentUser?.is_superuser || currentUser?.role === "admin";
    }
    if (!item.dropdown) {
      return !item.permission || hasPermission(item.permission);
    }
    return item.dropdown.some(
      (child) => !child.permission || hasPermission(child.permission),
    );
  });

  return (
    <div
      className="mt-[20px] ml-[15px] mb-4 rounded-[8px] bg-gray-100 dark:bg-[#0D0D0D]
                 flex flex-col fixed left-0 top-0 transition-all duration-300 z-50"
      style={{
        width: isCollapsed ? "80px" : "220px",
        top: "20px",
        bottom: "16px",
        height: "auto",
      }}
    >
      {/* Gradient border */}
      <div
        className="absolute inset-0 rounded-[8px] p-[1.5px] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          zIndex: 1,
        }}
      />
      <div
        className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
          zIndex: 0,
        }}
      />

      {/* Logo + collapse button */}
      <div className="w-full h-[36px] mt-5 mb-2 px-3 flex items-center gap-[7px] py-4 relative z-10 flex-shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-[36px] h-[36px] flex items-center justify-center rounded-[4px] border border-[#08994A] dark:border-[#1E1E1E] bg-transparent hover:bg-[#08994A]/10 transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#08994A] dark:text-emerald-500"
          >
            <path
              d="M4 6H20M4 12H20M4 18H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {!isCollapsed && (
          <div className="flex items-center ml-2">
            <SidebarLogo
              hospitalInfo={hospitalInfo}
              hospitalLoading={hospitalLoading}
              hospitalError={hospitalError}
            />
          </div>
        )}
      </div>

      {/* Menu items */}
      <div className="flex-1 p-3 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <ul className="flex flex-col gap-1.5">
          {filteredMenuItems.map((item, idx) => (
            <MenuItem
              key={idx}
              item={item}
              isCollapsed={isCollapsed}
              hasPermission={hasPermission}
            />
          ))}
        </ul>
        {filteredMenuItems.length === 0 && (
          <div className="text-center p-4 text-gray-500 dark:text-gray-400">
            No accessible menu items
            <div className="text-xs mt-2">
              User: {currentUser?.username} | Role: {currentUser?.role} |
              Superuser: {currentUser?.is_superuser ? "Yes" : "No"}
            </div>
          </div>
        )}
      </div>

      {/* User info */}
      {!isCollapsed && currentUser && (
        <div className="p-3 border-t border-gray-200 dark:border-[#2A2A2A] relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0EFF7B] to-[#08994A] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {currentUser.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                {currentUser.username || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentUser.role || "Role"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}