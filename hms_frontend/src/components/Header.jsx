// import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
// import { Moon, Sun, Bell, Settings, LogOut } from "lucide-react";
// import { ThemeContext } from "./ThemeContext.jsx";
// import { useNavigate } from "react-router-dom";
// import { successToast, errorToast } from "./Toast.jsx";
// import { menuItems } from "./SearchMenu";
// import { useWebSocket } from "./WebSocketContext";
// import { usePermissions } from "./PermissionContext";
// import api from "../utils/axiosConfig";

// // Helper to clear all cookies (used for client-side cleanup during logout)
// const clearAllCookies = () => {
//   document.cookie.split(";").forEach(cookie => {
//     const eqPos = cookie.indexOf("=");
//     const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
//     document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
//   });
// };

// const Header = ({ isCollapsed }) => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isNotificationOpen, setIsNotificationOpen] = useState(false);
//   const [isMailOpen, setIsMailOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showSearchResults, setShowSearchResults] = useState(false);

//   const dropdownRef = useRef(null);
//   const notificationRef = useRef(null);
//   const mailRef = useRef(null);
//   const searchInputRef = useRef(null);
//   const searchDropdownRef = useRef(null);

//   const { theme, toggleTheme } = useContext(ThemeContext);
//   const { notifications, unreadCount, markAsRead, markAllAsRead, isConnected } =
//     useWebSocket();
//   const { hasPermission, getUserName, getUserRole, currentUser } = usePermissions();
//   const navigate = useNavigate();

//   // Local state for user data (replacing UserContext)
//   const [userData, setUserData] = useState({
//     full_name: '',
//     designation: '',
//     profile_picture: null,
//     email: '',
//     phone: '',
//     department: '',
//   });

//   const [userLoading, setUserLoading] = useState(true);

//   // Fetch user data directly
//   const fetchUserData = async () => {
//     try {
//       console.log("🔍 Fetching user data from API...");
//       const response = await api.get("/profile/me/");
      
//       const data = response.data;
//       const profile = data.profile || {};   // Nested profile

//       const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

//       // Use the full URL already provided by backend
//       let profilePic = profile.profile_picture || null;

//       // Only rebuild if it's a relative path
//       if (profilePic && !profilePic.startsWith('http')) {
//         const cleanedPath = profilePic.startsWith('/') ? profilePic : `/${profilePic}`;
//         profilePic = `${API_BASE}${cleanedPath}`;
//       }

//       const user = {
//         full_name:    profile.full_name    || '',
//         designation:  profile.designation  || '',
//         profile_picture: profilePic,
//         email:        profile.email        || '',
//         phone:        profile.phone        || '',
//         department:   profile.department   || '',
//       };

//       console.log("✅ User data fetched:", user);
//       setUserData(user);
//       return user;
//     } catch (error) {
//       console.error("❌ Error fetching user data:", error);
//       return null;
//     } finally {
//       setUserLoading(false);
//     }
//   };

//   // Use userData as the source of truth
//   const userProfile = useMemo(() => ({
//     full_name: userData.full_name || getUserName() || "Loading...",
//     role: userData.designation || getUserRole() || "User",
//     profile_picture: userData.profile_picture || null,
//   }), [userData, getUserName, getUserRole]);

//   const initials = userProfile.full_name
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .toUpperCase()
//     .slice(0, 2);

//   // === SEARCH LOGIC ===
//   const getModulePermissionKey = (item) => {
//     const mapping = {
//       Dashboard: "dashboard",
//       Appointments: "appointments",
//       Patients: "patients_view",
//       "New Registration": "patients_create",
//       "Patient Profile": "patients_profile",
//       Administration: "room_management",
//       Departments: "departments",
//       "Room Management": "room_management",
//       "Bed Management": "bed_management",
//       "Staff Management": "staff_management",
//       Pharmacy: "pharmacy_inventory",
//       "Stock & Inventory": "pharmacy_inventory",
//       Bill: "pharmacy_billing",
//       "Doctors / Nurse": "doctors_manage",
//       "Add Doctor / Nurse": "doctors_manage",
//       "Doctor / Nurse": "doctors_manage",
//       MedicineAllocation: "medicine_allocation",
//       "Clinical Resources": "lab_reports",
//       "Laboratory Reports": "lab_reports",
//       "Blood Bank": "blood_bank",
//       "Ambulance Management": "ambulance",
//       Billing: "billing",
//       Accounts: "user_settings",
//       Settings: "security_settings",
//     };

//     return (
//       mapping[item.name] ||
//       item.path.replace(/^\//, "").replace(/[-/]/g, "_").toLowerCase()
//     );
//   };

//   const searchResults = useMemo(() => {
//     if (!searchQuery.trim()) return [];

//     const q = searchQuery.toLowerCase();
//     const results = [];

//     const walk = (items, depth = 0) => {
//       items.forEach((item) => {
//         const label = item.name.toLowerCase();
//         const matchesQuery = label.includes(q);
//         const moduleKey = getModulePermissionKey(item);
//         const userHasAccess = hasPermission(moduleKey);

//         let hasAccessibleChild = false;

//         if (item.dropdown) {
//           item.dropdown.forEach((sub) => {
//             const subKey = getModulePermissionKey(sub);
//             if (hasPermission(subKey)) {
//               hasAccessibleChild = true;
//             }
//           });
//         }

//         if (matchesQuery && (userHasAccess || hasAccessibleChild)) {
//           results.push({
//             label: item.name,
//             path: item.path,
//             icon: item.icon,
//             depth,
//           });
//         }

//         if (item.dropdown) {
//           item.dropdown.forEach((sub) => {
//             const subLabel = sub.name.toLowerCase();
//             const subKey = getModulePermissionKey(sub);
//             const subHasAccess = hasPermission(subKey);

//             if (subLabel.includes(q) && subHasAccess) {
//               results.push({
//                 label: sub.name,
//                 path: sub.path,
//                 icon: sub.icon,
//                 depth: depth + 1,
//               });
//             }
//           });
//         } else {
//           if (matchesQuery && userHasAccess) {
//             results.push({
//               label: item.name,
//               path: item.path,
//               icon: item.icon,
//               depth,
//             });
//           }
//         }
//       });
//     };

//     walk(menuItems);
//     return results.slice(0, 10);
//   }, [searchQuery, hasPermission]);

//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//     setIsNotificationOpen(false);
//     setIsMailOpen(false);
//     setShowSearchResults(false);
//   };

//   const toggleNotification = () => {
//     setIsNotificationOpen(!isNotificationOpen);
//     setIsDropdownOpen(false);
//     setIsMailOpen(false);
//     setShowSearchResults(false);
//   };

//   const handleNotificationClick = (notification) => {
//     markAsRead(notification.id);
//     if (notification.data?.redirect_to) {
//       navigate(notification.data.redirect_to);
//     }
//     setIsNotificationOpen(false);
//   };

//   const handleLogout = async () => {
//     setIsDropdownOpen(false);
//     try {
//       // Call logout endpoint to clear cookies server-side
//       await api.post("/auth/logout", {}, { withCredentials: true });
      
//       // Clear all cookies client-side
//       clearAllCookies();
      
//       // Trigger storage event for multi-tab sync
//       window.dispatchEvent(new Event("storage"));
//       window.dispatchEvent(new Event("userDataUpdated")); // Also trigger user data update
      
//       successToast("Logged out successfully!");
      
//       // Redirect to login
//       setTimeout(() => {
//         window.location.href = "/";
//       }, 500);
      
//     } catch (err) {
//       console.error("Logout error:", err);
      
//       // Even if API call fails, clear local data
//       clearAllCookies();
      
//       if (window.location.pathname !== '/') {
//         window.location.href = '/';
//       }
      
//       errorToast("Logout failed. Please try again.");
//     }
//   };

//   const handleSettingsClick = () => {
//     navigate("/settings");
//   };

//   // Listen for profile updates and fetch directly
//   useEffect(() => {
//     const handleUserDataUpdate = () => {
//       console.log("📢 Header: User data update event received");
//       // Fetch fresh user data when updated from Profile page
//       fetchUserData();
//     };
    
//     window.addEventListener("userDataUpdated", handleUserDataUpdate);
    
//     return () => {
//       window.removeEventListener("userDataUpdated", handleUserDataUpdate);
//     };
//   }, []);

//   // Initial fetch on mount
//   useEffect(() => {
//     fetchUserData();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target))
//         setIsDropdownOpen(false);
//       if (
//         notificationRef.current &&
//         !notificationRef.current.contains(event.target)
//       )
//         setIsNotificationOpen(false);
//       if (mailRef.current && !mailRef.current.contains(event.target))
//         setIsMailOpen(false);
//       if (
//         searchDropdownRef.current &&
//         !searchDropdownRef.current.contains(event.target) &&
//         searchInputRef.current &&
//         !searchInputRef.current.contains(event.target)
//       ) {
//         setShowSearchResults(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if ((e.metaKey || e.ctrlKey) && e.key === "k") {
//         e.preventDefault();
//         searchInputRef.current?.focus();
//       }
//     };
//     document.addEventListener("keydown", handleKeyDown);
//     return () => document.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   const handleSearchKeyDown = (e) => {
//     if (e.key === "Enter" && searchResults.length > 0) {
//       navigate(searchResults[0].path);
//       setSearchQuery("");
//       setShowSearchResults(false);
//     }
//   };

//   const getNotificationColor = (type) => {
//     switch (type) {
//       case "info":
//         return "bg-blue-500";
//       case "warning":
//         return "bg-yellow-500";
//       case "success":
//         return "bg-green-500";
//       case "error":
//         return "bg-red-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   const formatTime = (timestamp) => {
//     const now = new Date();
//     const time = new Date(timestamp);
//     const diffInMinutes = Math.floor((now - time) / (1000 * 60));
//     if (diffInMinutes < 1) return "Just now";
//     if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
//     if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
//     return `${Math.floor(diffInMinutes / 1440)}d ago`;
//   };

//   return (
//     <div className="w-full font-[Helvetica]">
//       <header
//         className="flex items-center justify-between p-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] gap-[20px] transition-all duration-300 ease-in-out"
//         style={{
//     position: "fixed",
//     top: 0,
//     left: isCollapsed ? "70px" : "220px",
//     right: "0",
//     maxWidth: "100vw",
//     zIndex: 40,
//     transition: "left 300ms ease-in-out",
//   }}
//       >
//         <div className="w-[394px]"></div>

//         {/* GLOBAL SEARCH BAR */}
//         <div className="relative w-[394px] h-[42px] mr-2">
//           <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
//             <svg
//               width="18"
//               height="18"
//               viewBox="0 0 20 20"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
//                 stroke="#08994A"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//               <path
//                 d="M17.5 17.5L13.875 13.875"
//                 stroke="#08994A"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           </div>
//           <input
//             ref={searchInputRef}
//             type="text"
//             placeholder="Search menu..."
//             value={searchQuery}
//             onChange={(e) => {
//               setSearchQuery(e.target.value);
//               setShowSearchResults(true);
//             }}
//             onFocus={() => searchQuery && setShowSearchResults(true)}
//             onKeyDown={handleSearchKeyDown}
//             className="min-w-[393px] h-full rounded-[8px] bg-[#0EFF7B1A] dark:bg-[#1E1E1E] border-[1px] border-[#0EFF7B] dark:border-[#0EFF7B] pl-12 pr-4 py-1 text-black dark:text-white placeholder-[#00A048] dark:placeholder-[#00A048] focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-emerald-500 transition-all"
//           />

//           {/* SEARCH RESULTS */}
//           {showSearchResults && (
//             <div
//               ref={searchDropdownRef}
//               className="absolute left-0 right-0 top-full mt-2 w-full bg-gray-100 dark:bg-[#1E1E1E] border border-[#0EFF7B] rounded-lg shadow-xl z-50 overflow-hidden"
//             >
//               {searchResults.length > 0 ? (
//                 <>
//                   <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400">
//                     {searchResults.length} result
//                     {searchResults.length > 1 ? "s" : ""}
//                   </div>
//                   <ul className="max-h-64 overflow-y-auto">
//                     {searchResults.map((res, idx) => {
//                       const Icon = res.icon;
//                       const indent = res.depth * 16;
//                       return (
//                         <li
//                           key={idx}
//                           onClick={() => {
//                             navigate(res.path);
//                             setSearchQuery("");
//                             setShowSearchResults(false);
//                           }}
//                           className="flex items-center gap-2 px-3 py-2 hover:bg-[#0EFF7B1A] dark:hover:bg-gray-700 cursor-pointer transition-colors"
//                           style={{ paddingLeft: `${indent + 12}px` }}
//                         >
//                           <Icon className="w-4 h-4 text-[#08994A] dark:text-emerald-500 flex-shrink-0" />
//                           <span className="text-sm truncate">{res.label}</span>
//                           <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
//                             {res.path.replace(/^\/+/, "")}
//                           </span>
//                         </li>
//                       );
//                     })}
//                   </ul>
//                 </>
//               ) : searchQuery ? (
//                 <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
//                   No accessible menu items found
//                 </div>
//               ) : null}
//             </div>
//           )}
//         </div>

//         {/* RIGHT SIDE ICONS */}
//         <div className="flex items-center gap-[20px]">
//           <button
//             onClick={toggleTheme}
//             className="relative group p-2 rounded-[8px] bg-[#0EFF7B1A] dark:bg-[#1E1E1E] border border-[#0EFF7B] hover:bg-[#0EFF7B1A] dark:hover:bg-gray-800 transition-colors"
//           >
//             {theme === "dark" ? (
//               <Sun size={20} className="text-[#08994A] dark:text-[#0EFF7B]" />
//             ) : (
//               <Moon size={20} className="text-[#08994A] dark:text-[#E4E4E7]" />
//             )}
//             <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
//               Dark/Light
//             </span>
//           </button>

//           <button
//             onClick={handleSettingsClick}
//             className="relative group p-2 rounded-[8px] bg-[#0EFF7B1A] dark:bg-[#1E1E1E] border border-[#0EFF7B] hover:bg-[#0EFF7B1A] dark:hover:bg-gray-800 transition-colors"
//           >
//             <Settings
//               size={20}
//               className="text-[#08994A] dark:text-[#0EFF7B]"
//             />
//             <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
//               Settings
//             </span>
//           </button>

//           <div className="relative" ref={notificationRef}>
//             <button
//               onClick={toggleNotification}
//               className="relative group p-2 rounded-[8px] bg-[#0EFF7B1A] dark:bg-[#1E1E1E] border border-[#0EFF7B] hover:bg-[#0EFF7B1A] dark:hover:bg-gray-800 transition-colors"
//             >
//               <Bell size={20} className="text-[#08994A] dark:text-[#0EFF7B]" />
//               {unreadCount > 0 && (
//                 <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
//                   {unreadCount > 9 ? "9+" : unreadCount}
//                 </span>
//               )}
//             </button>
//             {/* Notification dropdown */}
//             {isNotificationOpen && (
//               <div className="absolute right-0 top-full mt-3 w-96 bg-gray-100 dark:bg-[#1E1E1E] border-[1px] border-[#0EFF7B] dark:border-[#0EFF7B] rounded-lg shadow-xl z-50 font-[Helvetica]">
//                 <div className="absolute -top-2 right-4 w-4 h-4 transform rotate-45 bg-gray-100 dark:bg-[#1E1E1E] border-l border-t border-[#0EFF7B] dark:border-[#0EFF7B]"></div>
//                 <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
//                   <h3 className="font-semibold text-gray-800 dark:text-white">
//                     Notifications
//                   </h3>
//                   <div className="flex gap-2">
//                     {unreadCount > 0 && (
//                       <button
//                         onClick={markAllAsRead}
//                         className="text-xs text-[#08994A] dark:text-emerald-400 hover:underline"
//                       >
//                         Mark all read
//                       </button>
//                     )}
//                     <span
//                       className={`text-xs px-2 py-1 rounded-full ${
//                         isConnected
//                           ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
//                           : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
//                       }`}
//                     >
//                       {isConnected ? "Live" : "Offline"}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="max-h-80 overflow-auto">
//                   {notifications.length > 0 ? (
//                     <div className="p-2">
//                       {notifications.map((notification) => (
//                         <div
//                           key={notification.id}
//                           onClick={() => handleNotificationClick(notification)}
//                           className={`p-3 rounded-lg mb-2 cursor-pointer transition-all ${
//                             !notification.read
//                               ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
//                               : "hover:bg-gray-50 dark:hover:bg-gray-700"
//                           }`}
//                         >
//                           <div className="flex items-start gap-3">
//                             <div
//                               className={`w-3 h-3 rounded-full mt-1.5 ${getNotificationColor(
//                                 notification.type
//                               )}`}
//                             ></div>
//                             <div className="flex-1">
//                               <p
//                                 className={`text-sm ${
//                                   !notification.read
//                                     ? "font-medium text-gray-900 dark:text-white"
//                                     : "text-gray-700 dark:text-gray-300"
//                                 }`}
//                               >
//                                 {notification.message}
//                               </p>
//                               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                                 {formatTime(notification.timestamp)}
//                               </p>
//                             </div>
//                             {!notification.read && (
//                               <div className="w-2 h-2 bg-[#08994A] rounded-full mt-1.5"></div>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="p-4 text-center text-gray-500 dark:text-gray-400">
//                       No notifications
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>

//           {/* Profile Dropdown */}
//           <div className="relative font-[Helvetica]" ref={dropdownRef}>
//             <div
//               className="relative group flex items-center gap-3 cursor-pointer min-w-[163px] h-[32px]"
//               onClick={toggleDropdown}
//             >
//               <div className="relative w-8 h-8 min-w-8 min-h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#0EFF7B] to-[#08994A] dark:from-emerald-500 dark:to-emerald-700 flex items-center justify-center text-white font-medium shrink-0 border-2 border-white dark:border-gray-800">
//                 {userProfile.profile_picture ? (
//                   <img
//                     src={userProfile.profile_picture}
//                     alt={userProfile.full_name}
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       console.error("Error loading profile image:", e);
//                       e.target.style.display = "none";
//                     }}
//                   />
//                 ) : null}
//                 <span
//                   className={`flex items-center justify-center w-full h-full ${
//                     userProfile.profile_picture ? "hidden" : ""
//                   }`}
//                 >
//                   {initials}
//                 </span>
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium whitespace-nowrap text-ellipsis group-hover:text-[#08994A] dark:group-hover:text-emerald-400 text-black dark:text-white transition-colors">
//                   {userProfile.full_name}
//                 </span>
//                 <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                   {userProfile.role}
//                 </span>
//               </div>
//               <svg
//                 width="16"
//                 height="16"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//                 className={`text-gray-600 dark:text-gray-400 group-hover:text-[#08994A] dark:group-hover:text-emerald-400 transition-colors shrink-0 ${
//                   isDropdownOpen ? "rotate-180" : ""
//                 }`}
//               >
//                 <path
//                   d="M6 9L12 15L18 9"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </div>

//             {isDropdownOpen && (
//               <div className="absolute right-[60px] top-full mt-5 w-48 bg-gray-100 dark:bg-gray-800 border border-[#0EFF7B] dark:border-[#1E1E1E] rounded-lg shadow-xl z-50">
//                 <div className="absolute -top-2 right-4 w-4 h-4 transform rotate-45 bg-gray-100 dark:bg-gray-800 border-l border-t border-[#0EFF7B] dark:border-[#1E1E1E]"></div>
//                 <div className="py-3">
//                   <ul>
//                     <li
//                       onClick={() => {
//                         setIsDropdownOpen(false);
//                         navigate("/profile");
//                       }}
//                       className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-[#08994A] dark:hover:bg-gray-700 hover:text-white cursor-pointer transition-colors rounded mx-2"
//                     >
//                       Profile
//                     </li>
//                     <li
//                       onClick={() => {
//                         setIsDropdownOpen(false);
//                         navigate("/UserSettings");
//                       }}
//                       className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-[#08994A] dark:hover:bg-gray-700 hover:text-white cursor-pointer transition-colors rounded mx-2"
//                     >
//                       Settings
//                     </li>
//                     <li
//                       onClick={() => {
//                         setIsDropdownOpen(false);
//                         handleLogout();
//                       }}
//                       className="px-4 py-2 text-red-500 hover:bg-red-600 hover:text-white cursor-pointer transition-colors rounded mx-2"
//                     >
//                       Logout
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </header>
//     </div>
//   );
// };

// export default Header;


import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { Moon, Sun, Bell, Settings, LogOut } from "lucide-react";
import { ThemeContext } from "./ThemeContext.jsx";
import { useNavigate } from "react-router-dom";
import { successToast, errorToast } from "./Toast.jsx";
import { menuItems } from "./SearchMenu";
import { useWebSocket } from "./WebSocketContext";
import { usePermissions } from "./PermissionContext";
import api from "../utils/axiosConfig";

// Helper to clear all cookies (used for client-side cleanup during logout)
const clearAllCookies = () => {
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });
};

const Header = ({ isCollapsed }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const mailRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchDropdownRef = useRef(null);

  const { theme, toggleTheme } = useContext(ThemeContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead, isConnected } =
    useWebSocket();
  const { hasPermission, getUserName, getUserRole, currentUser } = usePermissions();
  const navigate = useNavigate();

  // Local state for user data (replacing UserContext)
  const [userData, setUserData] = useState({
    full_name: '',
    designation: '',
    profile_picture: null,
    email: '',
    phone: '',
    department: '',
  });

  const [userLoading, setUserLoading] = useState(true);

  // Fetch user data directly
  const fetchUserData = async () => {
    try {
      console.log("🔍 Fetching user data from API...");
      const response = await api.get("/profile/me/");
      
      const data = response.data;
      const profile = data.profile || {};   // Nested profile

      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

      // Use the full URL already provided by backend
      let profilePic = profile.profile_picture || null;

      // Only rebuild if it's a relative path
      if (profilePic && !profilePic.startsWith('http')) {
        const cleanedPath = profilePic.startsWith('/') ? profilePic : `/${profilePic}`;
        profilePic = `${API_BASE}${cleanedPath}`;
      }

      const user = {
        full_name:    profile.full_name    || '',
        designation:  profile.designation  || '',
        profile_picture: profilePic,
        email:        profile.email        || '',
        phone:        profile.phone        || '',
        department:   profile.department   || '',
      };

      console.log("✅ User data fetched:", user);
      setUserData(user);
      return user;
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      return null;
    } finally {
      setUserLoading(false);
    }
  };

  // Use userData as the source of truth
  const userProfile = useMemo(() => ({
    full_name: userData.full_name || getUserName() || "Loading...",
    role: userData.designation || getUserRole() || "User",
    profile_picture: userData.profile_picture || null,
  }), [userData, getUserName, getUserRole]);

  const initials = userProfile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // === SEARCH LOGIC ===
  const getModulePermissionKey = (item) => {
    const mapping = {
      Dashboard: "dashboard",
      Appointments: "appointments",
      Patients: "patients_view",
      "New Registration": "patients_create",
      "Patient Profile": "patients_profile",
      Administration: "room_management",
      Departments: "departments",
      "Room Management": "room_management",
      "Bed Management": "bed_management",
      "Staff Management": "staff_management",
      Pharmacy: "pharmacy_inventory",
      "Stock & Inventory": "pharmacy_inventory",
      Bill: "pharmacy_billing",
      "Doctors / Nurse": "doctors_manage",
      "Add Doctor / Nurse": "doctors_manage",
      "Doctor / Nurse": "doctors_manage",
      MedicineAllocation: "medicine_allocation",
      "Clinical Resources": "lab_reports",
      "Laboratory Reports": "lab_reports",
      "Blood Bank": "blood_bank",
      "Ambulance Management": "ambulance",
      Billing: "billing",
      Accounts: "user_settings",
      Settings: "security_settings",
    };

    return (
      mapping[item.name] ||
      item.path.replace(/^\//, "").replace(/[-/]/g, "_").toLowerCase()
    );
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const q = searchQuery.toLowerCase();
    const results = [];

    const walk = (items, depth = 0) => {
      items.forEach((item) => {
        const label = item.name.toLowerCase();
        const matchesQuery = label.includes(q);
        const moduleKey = getModulePermissionKey(item);
        const userHasAccess = hasPermission(moduleKey);

        let hasAccessibleChild = false;

        if (item.dropdown) {
          item.dropdown.forEach((sub) => {
            const subKey = getModulePermissionKey(sub);
            if (hasPermission(subKey)) {
              hasAccessibleChild = true;
            }
          });
        }

        if (matchesQuery && (userHasAccess || hasAccessibleChild)) {
          results.push({
            label: item.name,
            path: item.path,
            icon: item.icon,
            depth,
          });
        }

        if (item.dropdown) {
          item.dropdown.forEach((sub) => {
            const subLabel = sub.name.toLowerCase();
            const subKey = getModulePermissionKey(sub);
            const subHasAccess = hasPermission(subKey);

            if (subLabel.includes(q) && subHasAccess) {
              results.push({
                label: sub.name,
                path: sub.path,
                icon: sub.icon,
                depth: depth + 1,
              });
            }
          });
        } else {
          if (matchesQuery && userHasAccess) {
            results.push({
              label: item.name,
              path: item.path,
              icon: item.icon,
              depth,
            });
          }
        }
      });
    };

    walk(menuItems);
    return results.slice(0, 10);
  }, [searchQuery, hasPermission]);

  // Function to clear search properly
  const handleClearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false); // This ensures dropdown is completely hidden
    searchInputRef.current?.focus();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationOpen(false);
    setIsMailOpen(false);
    setShowSearchResults(false);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsDropdownOpen(false);
    setIsMailOpen(false);
    setShowSearchResults(false);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.data?.redirect_to) {
      navigate(notification.data.redirect_to);
    }
    setIsNotificationOpen(false);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      // Call logout endpoint to clear cookies server-side
      await api.post("/auth/logout", {}, { withCredentials: true });
      
      // Clear all cookies client-side
      clearAllCookies();
      
      // Trigger storage event for multi-tab sync
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("userDataUpdated")); // Also trigger user data update
      
      successToast("Logged out successfully!");
      
      // Redirect to login
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      
    } catch (err) {
      console.error("Logout error:", err);
      
      // Even if API call fails, clear local data
      clearAllCookies();
      
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
      
      errorToast("Logout failed. Please try again.");
    }
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  // Listen for profile updates and fetch directly
  useEffect(() => {
    const handleUserDataUpdate = () => {
      console.log("📢 Header: User data update event received");
      // Fetch fresh user data when updated from Profile page
      fetchUserData();
    };
    
    window.addEventListener("userDataUpdated", handleUserDataUpdate);
    
    return () => {
      window.removeEventListener("userDataUpdated", handleUserDataUpdate);
    };
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsDropdownOpen(false);
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      )
        setIsNotificationOpen(false);
      if (mailRef.current && !mailRef.current.contains(event.target))
        setIsMailOpen(false);
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && (searchQuery || showSearchResults)) {
        e.preventDefault();
        handleClearSearch();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery, showSearchResults]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      navigate(searchResults[0].path);
      handleClearSearch();
    }
    if (e.key === "Escape") {
      handleClearSearch();
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "info":
        return "bg-blue-500";
      case "warning":
        return "bg-yellow-500";
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="w-full font-[Helvetica]">
      <header
        className="flex items-center justify-between p-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] gap-[20px] transition-all duration-300 ease-in-out"
        style={{
          position: "fixed",
          top: 0,
          left: isCollapsed ? "70px" : "220px",
          right: "0",
          maxWidth: "100vw",
          zIndex: 40,
          transition: "left 300ms ease-in-out",
        }}
      >
        <div className="w-[394px]"></div>

        {/* GLOBAL SEARCH BAR */}
        <div className="relative w-[394px] h-[42px] mr-2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
                stroke="#08994A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.5 17.5L13.875 13.875"
                stroke="#08994A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
      
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                // Only show results if there's actually text
                setShowSearchResults(value.trim().length > 0);
              }}
              onFocus={() => {
                // Only show results on focus if there's already text
                if (searchQuery.trim().length > 0) {
                  setShowSearchResults(true);
                }
              }}
              onKeyDown={handleSearchKeyDown}
              className="min-w-[393px] h-full rounded-[8px] bg-[#0EFF7B1A] dark:bg-[#1E1E1E] border-[1px] border-[#0EFF7B] dark:border-[#0EFF7B] pl-12 pr-10 py-1 text-black dark:text-white placeholder-[#00A048] dark:placeholder-[#00A048] focus:outline-none focus:ring-1 focus:ring-[#08994A] dark:focus:ring-emerald-500 transition-all"
            />
            
            {/* Clear button (X) - only show when there's text */}
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                aria-label="Clear search"
                type="button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#08994A] dark:text-emerald-400"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

          {/* SEARCH RESULTS - Only show when there's a query AND we should show results */}
          {showSearchResults && searchQuery.trim() && (
            <div
              ref={searchDropdownRef}
              className="absolute left-0 right-0 top-full mt-2 w-full bg-gray-100 dark:bg-[#1E1E1E] border border-[#0EFF7B] rounded-lg shadow-xl z-50 overflow-hidden"
            >
              {searchResults.length > 0 ? (
                <>
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400">
                    {searchResults.length} result{searchResults.length > 1 ? "s" : ""}
                  </div>
                  <ul className="max-h-64 overflow-y-auto">
                    {searchResults.map((res, idx) => {
                      const Icon = res.icon;
                      const indent = res.depth * 16;
                      return (
                        <li
                          key={idx}
                          onClick={() => {
                            navigate(res.path);
                            handleClearSearch();
                          }}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-[#0EFF7B1A] dark:hover:bg-gray-700 cursor-pointer transition-colors"
                          style={{ paddingLeft: `${indent + 12}px` }}
                        >
                          <Icon className="w-4 h-4 text-[#08994A] dark:text-emerald-500 flex-shrink-0" />
                          <span className="text-sm truncate">{res.label}</span>
                          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                            {res.path.replace(/^\/+/, "")}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No accessible menu items found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDE ICONS */}
        <div className="flex items-center gap-[20px]">
          <button
            onClick={toggleTheme}
            className="relative group p-2 rounded-[8px] bg-[#0EFF7B1A] dark:bg-[#1E1E1E] border border-[#0EFF7B] hover:bg-[#0EFF7B1A] dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "dark" ? (
              <Sun size={20} className="text-[#08994A] dark:text-[#0EFF7B]" />
            ) : (
              <Moon size={20} className="text-[#08994A] dark:text-[#E4E4E7]" />
            )}
            <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
              Dark/Light
            </span>
          </button>

          <button
            onClick={handleSettingsClick}
            className="relative group p-2 rounded-[8px] bg-[#0EFF7B1A] dark:bg-[#1E1E1E] border border-[#0EFF7B] hover:bg-[#0EFF7B1A] dark:hover:bg-gray-800 transition-colors"
          >
            <Settings
              size={20}
              className="text-[#08994A] dark:text-[#0EFF7B]"
            />
            <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded-md shadow-md bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150">
              Settings
            </span>
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={toggleNotification}
              className="relative group p-2 rounded-[8px] bg-[#0EFF7B1A] dark:bg-[#1E1E1E] border border-[#0EFF7B] hover:bg-[#0EFF7B1A] dark:hover:bg-gray-800 transition-colors"
            >
              <Bell size={20} className="text-[#08994A] dark:text-[#0EFF7B]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {/* Notification dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-3 w-96 bg-gray-100 dark:bg-[#1E1E1E] border-[1px] border-[#0EFF7B] dark:border-[#0EFF7B] rounded-lg shadow-xl z-50 font-[Helvetica]">
                <div className="absolute -top-2 right-4 w-4 h-4 transform rotate-45 bg-gray-100 dark:bg-[#1E1E1E] border-l border-t border-[#0EFF7B] dark:border-[#0EFF7B]"></div>
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Notifications
                  </h3>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[#08994A] dark:text-emerald-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        isConnected
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {isConnected ? "Live" : "Offline"}
                    </span>
                  </div>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length > 0 ? (
                    <div className="p-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-3 rounded-lg mb-2 cursor-pointer transition-all ${
                            !notification.read
                              ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-3 h-3 rounded-full mt-1.5 ${getNotificationColor(
                                notification.type
                              )}`}
                            ></div>
                            <div className="flex-1">
                              <p
                                className={`text-sm ${
                                  !notification.read
                                    ? "font-medium text-gray-900 dark:text-white"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatTime(notification.timestamp)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-[#08994A] rounded-full mt-1.5"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>

          {/* Profile Dropdown */}
          <div className="relative font-[Helvetica]" ref={dropdownRef}>
            <div
              className="relative group flex items-center gap-3 cursor-pointer min-w-[163px] h-[32px]"
              onClick={toggleDropdown}
            >
              <div className="relative w-8 h-8 min-w-8 min-h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#0EFF7B] to-[#08994A] dark:from-emerald-500 dark:to-emerald-700 flex items-center justify-center text-white font-medium shrink-0 border-2 border-white dark:border-gray-800">
                {userProfile.profile_picture ? (
                  <img
                    src={userProfile.profile_picture}
                    alt={userProfile.full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Error loading profile image:", e);
                      e.target.style.display = "none";
                    }}
                  />
                ) : null}
                <span
                  className={`flex items-center justify-center w-full h-full ${
                    userProfile.profile_picture ? "hidden" : ""
                  }`}
                >
                  {initials}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium whitespace-nowrap text-ellipsis group-hover:text-[#08994A] dark:group-hover:text-emerald-400 text-black dark:text-white transition-colors">
                  {userProfile.full_name}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {userProfile.role}
                </span>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`text-gray-600 dark:text-gray-400 group-hover:text-[#08994A] dark:group-hover:text-emerald-400 transition-colors shrink-0 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-[60px] top-full mt-5 w-48 bg-gray-100 dark:bg-gray-800 border border-[#0EFF7B] dark:border-[#1E1E1E] rounded-lg shadow-xl z-50">
                <div className="absolute -top-2 right-4 w-4 h-4 transform rotate-45 bg-gray-100 dark:bg-gray-800 border-l border-t border-[#0EFF7B] dark:border-[#1E1E1E]"></div>
                <div className="py-3">
                  <ul>
                    <li
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/profile");
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-[#08994A] dark:hover:bg-gray-700 hover:text-white cursor-pointer transition-colors rounded mx-2"
                    >
                      Profile
                    </li>
                    <li
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/UserSettings");
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-[#08994A] dark:hover:bg-gray-700 hover:text-white cursor-pointer transition-colors rounded mx-2"
                    >
                      Settings
                    </li>
                    <li
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="px-4 py-2 text-red-500 hover:bg-red-600 hover:text-white cursor-pointer transition-colors rounded mx-2"
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;