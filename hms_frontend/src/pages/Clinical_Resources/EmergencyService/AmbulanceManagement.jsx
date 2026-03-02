
// // src/components/AmbulanceManagement.jsx
// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { Listbox } from "@headlessui/react";
// import MapView from "./MapView";
// import {
//   Search,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   Bell,
//   MapPin,
//   Phone,
//   Edit,
//   Clock,
//   Filter,
//   Trash2,
//   X,
//   Plus,
//   AlertTriangle,
//   CheckCircle,
//   Siren,
//   Navigation,
//   Ambulance as AmbulanceIcon,
//   Wifi,
//   WifiOff,
// } from "lucide-react";
// import EditDispatchModal from "./EditDispatch";
// import EditTripModal from "./EditTrip";
// import AmbulanceUnitsModal from "./AmbulanceUnits";
// import { successToast, errorToast } from "../../../components/Toast.jsx";
// import api from "../../../utils/axiosConfig";

// const WS_URL = import.meta.env.VITE_API_BASE_URL;

// const AmbulanceManagement = () => {
//   // ── STATE ─────────────────────────────────────
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortColumn, setSortColumn] = useState(null);
//   const [sortOrder, setSortOrder] = useState("asc");
//   const [activeTab, setActiveTab] = useState("Dispatch Log");
//   const [isFilterOpen, setIsFilterOpen] = useState(false);
//   const [isDeleteOpen, setIsDeleteOpen] = useState(false);
//   const [filterStatus, setFilterStatus] = useState("");
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [selectedRows, setSelectedRows] = useState(new Set());
//   const [selectAll, setSelectAll] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [connectionStatus, setConnectionStatus] = useState("disconnected");
//   const [livePositions, setLivePositions] = useState({});
//   const ws = useRef(null);
//   const reconnectTimeoutRef = useRef(null);
//   const isMountedRef = useRef(true);

//   // Data
//   const [dispatchData, setDispatchData] = useState([]);
//   const [tripData, setTripData] = useState([]);
//   const [unitData, setUnitData] = useState([]);
//   const [units, setUnits] = useState([]);
//   const [stats, setStats] = useState({
//     total: 0,
//     ready: 0,
//     onRoad: 0,
//     outOfService: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Modals
//   const [editDispatchOpen, setEditDispatchOpen] = useState(false);
//   const [editTripOpen, setEditTripOpen] = useState(false);
//   const [editUnitOpen, setEditUnitOpen] = useState(false);
//   const [editingDispatch, setEditingDispatch] = useState(null);
//   const [editingTrip, setEditingTrip] = useState(null);
//   const [editingUnit, setEditingUnit] = useState(null);
//   const [patientList, setPatientList] = useState([]);

//   const itemsPerPage = 10;

//   // ── WEBSOCKET MANAGEMENT ──────────────────────
//   const connectWebSocket = useCallback(() => {
//     if (!isMountedRef.current) return;

//     // Clear any existing reconnection timeout
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }

//     // Close existing connection
//     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//       ws.current.close(1000, "Reconnecting");
//     }

//     console.log("🔄 Attempting WebSocket connection...");
//     setConnectionStatus("connecting");

//     try {
//       ws.current = new WebSocket(WS_URL + "/ws");
//       ws.current.onopen = () => {
//         if (!isMountedRef.current) {
//           ws.current?.close();
//           return;
//         }
//         console.log("✅ WebSocket connected successfully");
//         setConnectionStatus("connected");
        
//         // Send client info
//         const clientInfo = {
//           type: "client_info",
//           client: "ambulance_management",
//           timestamp: new Date().toISOString()
//         };
//         ws.current.send(JSON.stringify(clientInfo));
//       };

//       ws.current.onmessage = (event) => {
//         if (!isMountedRef.current) return;

//         try {
//           const data = JSON.parse(event.data);
//           console.log("📨 WebSocket message received:", data.type);
//           handleWebSocketMessage(data);
//         } catch (parseError) {
//           console.error("❌ Error parsing WebSocket message:", parseError);
//         }
//       };

//       ws.current.onclose = (event) => {
//         if (!isMountedRef.current) return;

//         console.log("🔌 WebSocket disconnected:", event.code, event.reason);
//         setConnectionStatus("disconnected");

//         // Don't attempt to reconnect if component is unmounting or connection was intentional
//         if (event.code === 1000 || !isMountedRef.current) return;

//         // Attempt reconnection with exponential backoff
//         const delay = Math.min(1000 * Math.pow(1.5, 3), 10000); // Max 10 seconds
//         console.log(`🔄 Reconnecting in ${delay}ms...`);
        
//         reconnectTimeoutRef.current = setTimeout(() => {
//           if (isMountedRef.current) {
//             connectWebSocket();
//           }
//         }, delay);
//       };

//       ws.current.onerror = (error) => {
//         if (!isMountedRef.current) return;
//         console.error("❌ WebSocket error:", error);
//         setConnectionStatus("error");
//       };

//     } catch (error) {
//       console.error("❌ Failed to create WebSocket connection:", error);
//       setConnectionStatus("error");
      
//       // Retry connection after delay
//       reconnectTimeoutRef.current = setTimeout(() => {
//         if (isMountedRef.current) {
//           connectWebSocket();
//         }
//       }, 3000);
//     }
//   }, []);

// const handleWebSocketMessage = (data) => {
//   // Skip connection established messages
//   if (data.type === "connection_established") {
//     console.log("✅ WebSocket connection confirmed");
//     return;
//   }

//   // Handle different message types - match exactly what backend sends
//   switch (data.type) {
//     case "unit_created":
//     case "unit_updated":
//     case "unit_deleted":
//     case "dispatch_created":
//     case "dispatch_updated":
//     case "dispatch_deleted":
//     case "trip_created":
//     case "trip_updated":
//     case "trip_deleted":
//     case "trip_status_changed":
//       // Refresh data when CRUD operations happen
//       fetchData();
      
//       // Show toast notification
//       showNotificationToast(data);
//       break;

//     case "location_update":
//       setLivePositions((prev) => ({
//         ...prev,
//         [data.unit_number]: { lat: data.lat, lng: data.lng },
//       }));
//       break;

//     case "status_update":
//       showNotificationToast(data);
//       break;

//     // Add these new message types that backend actually sends
//     case "new_dispatch":
//     case "new_trip":
//     case "trip_completed":
//     case "dispatch_status_updated":
//     case "dispatch_unit_changed":
//       fetchData(); // Refresh data
//       showNotificationToast(data);
//       break;

//     default:
//       console.log("📨 Unknown message type:", data.type, data);
//       break;
//   }

//   // Add to notification panel (except for location updates)
//   if (data.type !== "location_update" && data.type !== "connection_established") {
//     addToNotificationPanel(data);
//   }
// };

// const showNotificationToast = (data) => {
//   const toastConfigs = {
//     // Unit operations
//     unit_created: {
//       icon: AmbulanceIcon,
//       color: "text-green-500",
//       bgColor: "bg-green-900/30 border-green-500/50",
//       autoClose: 4000,
//     },
//     unit_updated: {
//       icon: AmbulanceIcon,
//       color: "text-yellow-500",
//       bgColor: "bg-yellow-900/30 border-yellow-500/50",
//       autoClose: 4000,
//     },
//     unit_deleted: {
//       icon: AmbulanceIcon,
//       color: "text-red-500",
//       bgColor: "bg-red-900/30 border-red-500/50",
//       autoClose: 4000,
//     },

//     // Dispatch operations
//     dispatch_created: {
//       icon: Siren,
//       color: "text-red-500",
//       bgColor: "bg-red-900/30 border-red-500/50",
//       autoClose: 8000,
//       playSound: true,
//     },
//     new_dispatch: { // This is what backend actually sends for new dispatches
//       icon: Siren,
//       color: "text-red-500",
//       bgColor: "bg-red-900/30 border-red-500/50",
//       autoClose: 8000,
//       playSound: true,
//     },
//     dispatch_updated: {
//       icon: Edit,
//       color: "text-yellow-500",
//       bgColor: "bg-yellow-900/30 border-yellow-500/50",
//       autoClose: 4000,
//     },
//     dispatch_deleted: {
//       icon: Trash2,
//       color: "text-red-500",
//       bgColor: "bg-red-900/30 border-red-500/50",
//       autoClose: 4000,
//     },
//     dispatch_status_updated: {
//       icon: Clock,
//       color: "text-purple-500",
//       bgColor: "bg-purple-900/30 border-purple-500/50",
//       autoClose: 5000,
//     },
//     dispatch_unit_changed: {
//       icon: AmbulanceIcon,
//       color: "text-orange-500",
//       bgColor: "bg-orange-900/30 border-orange-500/50",
//       autoClose: 5000,
//     },

//     // Trip operations
//     trip_created: {
//       icon: AmbulanceIcon,
//       color: "text-blue-500",
//       bgColor: "bg-blue-900/30 border-blue-500/50",
//       autoClose: 5000,
//     },
//     new_trip: { // This is what backend actually sends for new trips
//       icon: AmbulanceIcon,
//       color: "text-blue-500",
//       bgColor: "bg-blue-900/30 border-blue-500/50",
//       autoClose: 5000,
//     },
//     trip_updated: {
//       icon: Edit,
//       color: "text-yellow-500",
//       bgColor: "bg-yellow-900/30 border-yellow-500/50",
//       autoClose: 4000,
//     },
//     trip_deleted: {
//       icon: Trash2,
//       color: "text-red-500",
//       bgColor: "bg-red-900/30 border-red-500/50",
//       autoClose: 4000,
//     },
//     trip_status_changed: {
//       icon: Clock,
//       color: "text-purple-500",
//       bgColor: "bg-purple-900/30 border-purple-500/50",
//       autoClose: 5000,
//     },
//     trip_completed: {
//       icon: CheckCircle,
//       color: "text-green-500",
//       bgColor: "bg-green-900/30 border-green-500/50",
//       autoClose: 5000,
//     },

//     // Status updates
//     status_update: {
//       icon: CheckCircle,
//       color: "text-green-500",
//       bgColor: "bg-green-900/30 border-green-500/50",
//       autoClose: 5000,
//     },
//   };

//   const config = toastConfigs[data.type] || {
//     icon: Bell,
//     color: "text-gray-500",
//     bgColor: "bg-gray-900/30 border-gray-500/50",
//     autoClose: 4000,
//   };

//   successToast(
//     <div className="flex items-center gap-3">
//       <config.icon className={`w-6 h-6 ${config.color}`} />
//       <div>
//         <strong className={config.color}>{data.title || formatMessageType(data.type)}</strong>
//         <p className="text-sm text-gray-700">{data.message}</p>
//       </div>
//     </div>,
//     { autoClose: config.autoClose }
//   );

//   // Play emergency sound for new dispatches
//   if (config.playSound) {
//     try {
//       const audio = new Audio(
//         "https://assets.mixkit.co/sfx/preview/mixkit-emergency-alert-2951.mp3"
//       );
//       audio.volume = 0.3;
//       audio.play().catch((e) => console.log("Audio play failed:", e));
//     } catch (audioError) {
//       console.log("Audio initialization failed:", audioError);
//     }
//   }
// };

// // Helper function to format message types for display
// const formatMessageType = (type) => {
//   const typeMap = {
//     unit_created: "Ambulance Unit Created",
//     unit_updated: "Ambulance Unit Updated", 
//     unit_deleted: "Ambulance Unit Deleted",
//     dispatch_created: "New Dispatch Created",
//     new_dispatch: "New Dispatch Created",
//     dispatch_updated: "Dispatch Updated",
//     dispatch_deleted: "Dispatch Cancelled",
//     dispatch_status_updated: "Dispatch Status Updated",
//     dispatch_unit_changed: "Dispatch Unit Changed",
//     trip_created: "New Trip Started",
//     new_trip: "New Trip Started",
//     trip_updated: "Trip Updated",
//     trip_deleted: "Trip Cancelled",
//     trip_status_changed: "Trip Status Updated",
//     trip_completed: "Trip Completed",
//     status_update: "Status Update",
//     location_update: "Location Update"
//   };
  
//   return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
// };

//   const addToNotificationPanel = (data) => {
//     const now = Date.now();
//     const notificationId = now + Math.random();

//     setNotifications((prev) => {
//       // Prevent duplicates
//       const isDuplicate = prev.some(
//         (n) =>
//           n.type === data.type &&
//           n.message === data.message &&
//           n.title === data.title &&
//           now - n.id < 2000 // 2 second duplicate window
//       );

//       if (isDuplicate) return prev;

//       return [
//         {
//           id: notificationId,
//           ...data,
//           time: new Date().toLocaleTimeString(),
//         },
//         ...prev.slice(0, 49), // Keep only last 50 notifications
//       ];
//     });

//     setUnreadCount((c) => c + 1);
//   };

//   // ── DATA FETCHING ─────────────────────────────
//   // In AmbulanceManagement.jsx fetchData function:
// const fetchData = useCallback(async () => {
//   if (!isMountedRef.current) return;
  
//   setLoading(true);
//   setError(null);
//   try {
//     const dispatchRes = await api.get("/ambulance/dispatch");
//     const tripRes = await api.get("/ambulance/trips");
//     const unitRes = await api.get("/ambulance/units");
//     const patientRes = await api.get("/ambulance/patients");

//     const dispatches = dispatchRes.data;
//     const trips = tripRes.data;
//     const allUnits = unitRes.data;
//     const patients = patientRes.data;

//     // Map patient phone correctly
//     const patientsWithPhone = patients.map(patient => ({
//       ...patient,
//       phone: patient.phone || patient.phone_number || '+91-XXXXXXXXXX'
//     }));

//     setPatientList(patientsWithPhone);
    
//     // Add phone numbers to dispatches
//     const dispatchesWithPhone = dispatches.map(dispatch => ({
//       ...dispatch,
//       phone_number: dispatch.phone_number || dispatch.contact_number || '+91-XXXXXXXXXX'
//     }));
    
//     // Add phone numbers to trips
//     const tripsWithPhone = trips.map(trip => ({
//       ...trip,
//       phone_number: trip.phone_number || trip.patient?.phone || '+91-XXXXXXXXXX'
//     }));

//     // Add phone numbers to ambulance units
//     const unitsWithPhone = allUnits.map(unit => ({
//       ...unit,
//       phone: unit.phone || unit.contact_number || '+91-XXXXXXXXXX'
//     }));

//     setDispatchData(dispatchesWithPhone);
//     setTripData(tripsWithPhone);
//     setUnitData(unitsWithPhone);
//     setUnits(unitsWithPhone);

//     // Stats
//     const total = unitsWithPhone.length;
//     const ready = unitsWithPhone.filter((u) => u.in_service).length;
//     const onRoad = trips.filter((t) => t.status === "En Route").length;
//     const outOfService = total - ready;

//     setStats({ total, ready, onRoad, outOfService });
//   } catch (err) {
//     let errorMessage = "Failed to fetch data.";
//     if (err.response) {
//       errorMessage = err.response.data?.detail || err.response.data?.message || errorMessage;
//     } else if (err.request) {
//       errorMessage = "Network error. Please check your connection.";
//     } else {
//       errorMessage = err.message || errorMessage;
//     }
//     console.error("❌ Error fetching data:", err);
//     setError(errorMessage);
//     errorToast(errorMessage);
//   } finally {
//     if (isMountedRef.current) {
//       setLoading(false);
//     }
//   }
// }, []);

//   // ── LIFECYCLE ─────────────────────────────────
//   useEffect(() => {
//     isMountedRef.current = true;
    
//     // Initial data fetch
//     fetchData();
    
//     // Connect WebSocket after a brief delay to ensure component is mounted
//     const wsTimeout = setTimeout(() => {
//       connectWebSocket();
//     }, 500);

//     return () => {
//       isMountedRef.current = false;
      
//       // Clear timeouts
//       clearTimeout(wsTimeout);
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
      
//       // Close WebSocket
//       if (ws.current) {
//         ws.current.close(1000, "Component unmounting");
//       }
//     };
//   }, [fetchData, connectWebSocket]);

//   // ── FILTER / PAGINATION / SORT ─────────────────
//   const currentData =
//     activeTab === "Dispatch Log"
//       ? dispatchData
//       : activeTab === "Trip Log"
//       ? tripData
//       : unitData;

//   const filteredData = currentData
//     .filter((item) =>
//       Object.values(item)
//         .join(" ")
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase())
//     )
//     .filter((item) => (filterStatus ? item.status === filterStatus : true));

//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const displayedData = filteredData.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const sortedData = [...displayedData].sort((a, b) => {
//     if (!sortColumn) return 0;
//     const valA = a[sortColumn];
//     const valB = b[sortColumn];
//     if (typeof valA === "string")
//       return sortOrder === "asc"
//         ? valA.localeCompare(valB)
//         : valB.localeCompare(valA);
//     return sortOrder === "asc" ? valA - valB : valB - valA;
//   });

//   // ── HANDLERS ───────────────────────────────────
//   const handleSort = (col) => {
//     if (sortColumn === col) {
//       setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
//     } else {
//       setSortColumn(col);
//       setSortOrder("asc");
//     }
//   };

//   const handlePrevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);
//   const handleNextPage = () =>
//     currentPage < totalPages && setCurrentPage((p) => p + 1);

//   const applyFilter = (status) => {
//     setFilterStatus(status);
//     setIsFilterOpen(false);
//     setCurrentPage(1);
//   };

//   const clearFilter = () => {
//     setFilterStatus("");
//     setIsFilterOpen(false);
//     setCurrentPage(1);
//   };

//   const handleDelete = (item) => {
//     setSelectedItem(item);
//     setIsDeleteOpen(true);
//   };

//   const confirmDelete = async () => {
//     const ids = selectedItem ? [selectedItem.id] : Array.from(selectedRows);
//     const count = ids.length;
//     const endpointMap = {
//       "Dispatch Log": "dispatch",
//       "Trip Log": "trips",
//       "Ambulance Units": "units",
//     };
//     const endpoint = endpointMap[activeTab] || "units";
//     const itemType =
//       activeTab === "Dispatch Log"
//         ? "dispatch"
//         : activeTab === "Trip Log"
//         ? "trip"
//         : "unit";

//     try {
//       await Promise.all(
//         ids.map((id) =>
//           api.delete(`/ambulance/${endpoint}/${id}`)
//         )
//       );

//       await fetchData();
//       setSelectedRows(new Set());
//       setSelectAll(false);

//       successToast(
//         count === 1
//           ? `${
//               itemType.charAt(0).toUpperCase() + itemType.slice(1)
//             } deleted successfully!`
//           : `${count} ${itemType}s deleted successfully!`
//       );
//     } catch (err) {
//       let errorMessage = "Failed to delete item(s).";
//       if (err.response) {
//         errorMessage = err.response.data?.detail || err.response.data?.message || errorMessage;
//       } else if (err.request) {
//         errorMessage = "Network error. Please check your connection.";
//       } else {
//         errorMessage = err.message || errorMessage;
//       }
//       errorToast(errorMessage);
//     } finally {
//       setIsDeleteOpen(false);
//       setSelectedItem(null);
//     }
//   };

//   const getStatusColor = (status) => {
//     if (status === "Completed") return "text-green-600 dark:text-green-500";
//     if (status === "En Route") return "text-blue-600 dark:text-blue-500";
//     if (status === "Standby") return "text-yellow-600 dark:text-yellow-500";
//     return "text-gray-600 dark:text-gray-400";
//   };

//   // Phone call functionality
//   const handlePhoneCall = (phoneNumber, item) => {
//     if (!phoneNumber || phoneNumber === '+91-XXXXXXXXXX') {
//       errorToast("No valid phone number available for this record");
//       return;
//     }

//     // Format phone number for tel: protocol
//     const formattedNumber = phoneNumber.replace(/[\s\-]/g, '');
    
//     // Show confirmation dialog
//     if (window.confirm(`Call ${phoneNumber}?`)) {
//       window.open(`tel:${formattedNumber}`, '_self');
      
//       // Log the call attempt
//       console.log(`Calling ${phoneNumber} for ${item.dispatch_id || item.trip_id || item.unit_number}`);
//     }
//   };

//   // Selection
//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedRows(new Set());
//     } else {
//       const allIds = new Set(sortedData.map((i) => i.id));
//       setSelectedRows(allIds);
//     }
//     setSelectAll(!selectAll);
//   };

//   const handleRowSelect = (id) => {
//     const copy = new Set(selectedRows);
//     copy.has(id) ? copy.delete(id) : copy.add(id);
//     setSelectedRows(copy);
//     setSelectAll(copy.size === sortedData.length);
//   };

//   const isRowSelected = (id) => selectedRows.has(id);

//   // ── CREATE / EDIT HANDLERS ─────────────────────
//   const handleOpenEditDispatch = (dispatch = null) => {
//     setEditingDispatch(dispatch);
//     setEditDispatchOpen(true);
//   };

//   const handleOpenEditTrip = (trip = null) => {
//     setEditingTrip(trip);
//     setEditTripOpen(true);
//   };

//   const handleOpenEditUnit = (unit = null) => {
//     setEditingUnit(unit);
//     setEditUnitOpen(true);
//   };

//   const saveDispatch = async (payload) => {
//     const url = editingDispatch
//       ? `/ambulance/dispatch/${editingDispatch.id}`
//       : `/ambulance/dispatch`;
//     try {
//       const res = await (editingDispatch ? api.put(url, payload) : api.post(url, payload));
//       await fetchData();
//       setEditDispatchOpen(false);
//       setEditingDispatch(null);
//       successToast(editingDispatch ? "Dispatch updated!" : "Dispatch created!");
//     } catch (err) {
//       let errorMessage = editingDispatch ? "Failed to update dispatch!" : "Failed to create dispatch!";
//       if (err.response) {
//         errorMessage = err.response.data?.detail || err.response.data?.message || errorMessage;
//       } else if (err.request) {
//         errorMessage = "Network error. Please check your connection.";
//       } else {
//         errorMessage = err.message || errorMessage;
//       }
//       errorToast(errorMessage);
//     }
//   };

//   const saveTrip = async (payload) => {
//     const url = editingTrip
//       ? `/ambulance/trips/${editingTrip.id}`
//       : `/ambulance/trips`;
//     try {
//       const res = await (editingTrip ? api.put(url, payload) : api.post(url, payload));
//       await fetchData();
//       setEditTripOpen(false);
//       setEditingTrip(null);
//       successToast(
//         editingTrip
//           ? "Trip updated successfully!"
//           : "Trip created successfully!"
//       );
//     } catch (err) {
//       let errorMessage = editingTrip ? "Failed to update trip!" : "Failed to create trip!";
//       if (err.response) {
//         errorMessage = err.response.data?.detail || err.response.data?.message || errorMessage;
//       } else if (err.request) {
//         errorMessage = "Network error. Please check your connection.";
//       } else {
//         errorMessage = err.message || errorMessage;
//       }
//       errorToast(errorMessage);
//     }
//   };

//   const saveUnit = async (payload) => {
//     const url = editingUnit
//       ? `/ambulance/units/${editingUnit.id}`
//       : `/ambulance/units`;
//     try {
//       const res = await (editingUnit ? api.put(url, payload) : api.post(url, payload));
//       await fetchData();
//       setEditUnitOpen(false);
//       setEditingUnit(null);
//       successToast(
//         editingUnit
//           ? "Unit updated successfully!"
//           : "Unit created successfully!"
//       );
//     } catch (err) {
//       let errorMessage = editingUnit ? "Failed to update unit!" : "Failed to create unit!";
//       if (err.response) {
//         errorMessage = err.response.data?.detail || err.response.data?.message || errorMessage;
//       } else if (err.request) {
//         errorMessage = "Network error. Please check your connection.";
//       } else {
//         errorMessage = err.message || errorMessage;
//       }
//       errorToast(errorMessage);
//     }
//   };

//   // ── RENDER ─────────────────────────────────────
//   if (loading) return <div className="p-10 text-center">Loading...</div>;
//   if (error)
//     return <div className="p-10 text-center text-red-500">Error: {error}</div>;

//   return (
//     <div className=" mb-4 bg-gray-100 dark:bg-black text-black dark:text-white rounded-xl p-4 w-full max-w-[2500px] font-[Helvetica] mx-auto flex flex-col overflow-hidden relative">
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
//       />

//       {/* Header */}
//       <div className="flex justify-between items-center mb-6 mt-4 relative z-10">
//         <div>
//           <h1 className="text-[20px] font-medium flex items-center gap-2">
//             Ambulance Management
//             <div className="flex items-center gap-2 text-sm">
//               {connectionStatus === "connected" ? (
//                 <Wifi size={16} className="text-green-500" />
//               ) : connectionStatus === "connecting" ? (
//                 <Wifi size={16} className="text-yellow-500 animate-pulse" />
//               ) : (
//                 <WifiOff size={16} className="text-red-500" />
//               )}
//               <span className={`text-xs ${
//                 connectionStatus === "connected" ? "text-green-500" :
//                 connectionStatus === "connecting" ? "text-yellow-500" :
//                 "text-red-500"
//               }`}>
//                 {connectionStatus}
//               </span>
//             </div>
//           </h1>
//           <p className="text-[14px] mt-2 text-gray-600 dark:text-gray-400">
//             Manage ambulance dispatches, trips, and vehicle status in one place.
//           </p>
//         </div>
//       </div>

//       {/* Map + Stats + Notifications */}
//       <div className="w-full flex flex-col lg:flex-row gap-6 mb-6 relative z-10">
//         {/* Map + Stats */}
//         <div className="w-full lg:flex-1 space-y-6">
//           {/* Live Map */}
//           <div className="w-full h-[340px] rounded-2xl overflow-hidden shadow-2xl border border-[#0EFF7B]/20 bg-gradient-to-br from-black via-[#0a0a0a] to-black">
//             <MapView
//               units={unitData}
//               trips={tripData}
//               livePositions={livePositions}
//             />
//           </div>

//           {/* Stats Bar */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             {[
//               {
//                 label: "Total Vehicles",
//                 value: stats.total,
//                 icon: "Ambulance",
//               },
//               {
//                 label: "Ready",
//                 value: stats.ready,
//                 color: "text-green-400",
//                 bg: "bg-green-500/10",
//                 icon: "CheckCircle",
//               },
//               {
//                 label: "On Road",
//                 value: stats.onRoad,
//                 color: "text-orange-400",
//                 bg: "bg-orange-500/10",
//                 icon: "Navigation",
//               },
//               {
//                 label: "Out of Service",
//                 value: stats.outOfService,
//                 color: "text-red-400",
//                 bg: "bg-red-500/10",
//                 icon: "AlertTriangle",
//               },
//             ].map((s, i) => (
//               <div
//                 key={i}
//                 className={`relative p-5 rounded-xl border backdrop-blur-sm transition-all hover:scale-105 ${
//                   s.bg || "bg-gray-100/5 border-[#0EFF7B]/30"
//                 }`}
//               >
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-xs text-gray-400">{s.label}</span>
//                   {s.icon === "CheckCircle" && (
//                     <CheckCircle size={16} className="text-green-400" />
//                   )}
//                   {s.icon === "Navigation" && (
//                     <Navigation size={16} className="text-orange-400" />
//                   )}
//                   {s.icon === "AlertTriangle" && (
//                     <AlertTriangle size={16} className="text-red-400" />
//                   )}
//                   {s.icon === "Ambulance" && (
//                     <AmbulanceIcon size={16} className="text-[#0EFF7B]" />
//                   )}
//                 </div>
//                 <span
//                   className={`text-3xl font-bold ${s.color || "text-white"}`}
//                 >
//                   {s.value}
//                 </span>
//                 {s.label === "On Road" && stats.onRoad > 0 && (
//                   <div className="absolute top-2 right-2 w-3 h-3 bg-orange-400 rounded-full animate-pulse" />
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* REAL-TIME NOTIFICATIONS PANEL */}
//         <div className="w-full lg:w-96 bg-gray-300 dark:bg-black/40 backdrop-blur-xl border border-[#0EFF7B]/30 rounded-2xl p-4 shadow-2xl">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-bold flex items-center gap-3">
//               <Bell size={20} className="text-[#0EFF7B]" />
//               Live Alerts
//               {unreadCount > 0 && (
//                 <span className="ml-2 px-3 py-1 text-xs font-bold bg-red-600 text-white rounded-full animate-pulse">
//                   {unreadCount} new
//                 </span>
//               )}
//             </h3>
//             <button
//               onClick={() => {
//                 setNotifications([]);
//                 setUnreadCount(0);
//               }}
//               className="text-xs text-gray-400 hover:text-[#0EFF7B] transition"
//             >
//               Clear all
//             </button>
//           </div>

//           <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
//             {notifications.length === 0 ? (
//               <div className="text-center py-12 text-gray-500">
//                 <Bell size={48} className="mx-auto mb-3 opacity-20" />
//                 <p>No active alerts</p>
//               </div>
//             ) : (
//               notifications.slice(0, 15).map((n) => (
//                 <div
//                   key={n.id}
//                   className={`p-4 rounded-lg border transition-all ${
//                     n.type === "dispatch_created"
//                       ? "bg-red-900/30 border-red-500/50 shadow-lg shadow-red-500/20"
//                       : n.type === "trip_created"
//                       ? "bg-blue-900/20 border-blue-500/40"
//                       : n.type === "status_update"
//                       ? "bg-green-900/20 border-green-500/40"
//                       : "bg-purple-900/20 border-purple-500/40"
//                   }`}
//                 >
//                   <div className="flex items-start gap-3">
//                     {n.type === "dispatch_created" && (
//                       <Siren
//                         size={20}
//                         className="text-red-400 mt-0.5 animate-pulse"
//                       />
//                     )}
//                     {n.type === "trip_created" && (
//                       <AmbulanceIcon
//                         size={20}
//                         className="text-blue-400 mt-0.5"
//                       />
//                     )}
//                     {n.type === "status_update" && (
//                       <CheckCircle
//                         size={20}
//                         className="text-green-400 mt-0.5"
//                       />
//                     )}
//                     {n.type === "location_update" && (
//                       <MapPin size={20} className="text-purple-400 mt-0.5" />
//                     )}

//                     <div className="flex-1">
//                       <p className="font-semibold text-white">
//                         {n.title || n.type}
//                       </p>
//                       <p className="text-sm text-gray-300 mt-1">{n.message}</p>
//                       <p className="text-xs text-gray-500 mt-2">{n.time}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//       {/* Tabs */}
//       <div className="mb-6 relative z-10">
//         <h1 className="text-[20px] font-medium">Transport Management</h1>
//         <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-3">
//           List of all {activeTab.toLowerCase()}
//         </p>
//         <div className="flex gap-3">
//           {["Dispatch Log", "Trip Log", "Ambulance Units"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => {
//                 setActiveTab(tab);
//                 setSelectedRows(new Set());
//                 setSelectAll(false);
//                 setCurrentPage(1);
//               }}
//               className={`w-[160px] h-[34px] rounded-[4px] px-3 py-2 text-sm font-medium transition-all ${
//                 activeTab === tab
//                   ? "bg-[#025126] border-t border-r border-b-2 border-l border-[#025126] shadow-[0_0_20px_0_#0EFF7B40] text-white"
//                   : "bg-[#0EFF7B1A] dark:bg-[#1E1E1E] border border-[#0EFF7B] dark:border-[#1E1E1E] text-black dark:text-gray-400"
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Table Header + Controls */}
//       <div className="relative z-10 border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[12px] p-4 bg-gray-100 dark:bg-transparent">
//         <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-3">
//           <h2 className="text-lg font-semibold">{activeTab}</h2>
//           <div className="flex items-center gap-3 w-full sm:w-auto">
//             <div className="flex items-center gap-2 bg-[#08994A1A] dark:bg-[#0EFF7B1A] rounded-[40px] px-3 py-2 flex-1 sm:flex-initial">
//               <Search
//                 size={16}
//                 className="text-[#08994A] dark:text-[#0EFF7B]"
//               />
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="bg-transparent outline-none text-sm w-full"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             <button
//               onClick={() => selectedRows.size > 0 && setIsDeleteOpen(true)}
//               disabled={selectedRows.size === 0}
//               className={`relative group w-8 h-8 rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] flex items-center justify-center transition ${
//                 selectedRows.size > 0
//                   ? "text-red-600 hover:bg-red-100"
//                   : "text-[#0EFF7B]"
//               }`}
//             >
//               <Trash2 size={18} />
//               <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Delete
//                   </span>
//             </button>

//             {activeTab === "Ambulance Units" ? (
//               <button
//                 onClick={() => handleOpenEditUnit()}
//                 className="flex items-center gap-1 px-3 py-1 rounded bg-[#025126] text-white hover:scale-105 transition"
//               >
//                 Add Unit
                
//               </button>
//             ) : activeTab === "Dispatch Log" ? (
//               <button
//                 onClick={() => handleOpenEditDispatch()}
//                 className="relative group flex items-center gap-1 px-3 py-1 rounded bg-[#025126] text-white hover:scale-105 transition"
//               >
//                 Add Dispatch
//               </button>
//             ) : (
//               <button
//                 onClick={() => handleOpenEditTrip()}
//                 className="flex items-center gap-1 px-3 py-1 rounded bg-[#025126] text-white hover:scale-105 transition"
//               >
//                 Add Trip
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[800px]">
//             <thead className="bg-gray-200 dark:bg-[#091810] h-[52px] text-sm text-center border-b border-gray-300 dark:border-[#3C3C3C] text-[#0EFF7B]">
//               <tr>
//                 <th className="px-3 py-3 w-12">
//                   <input
//                     type="checkbox"
//                     checked={selectAll}
//                     onChange={handleSelectAll}
//                     className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
//                   />
//                 </th>
//                 {activeTab === "Ambulance Units" ? (
//                   <>
//                     {[
//                       { key: "unit_number", label: "Unit" },
//                       { key: "vehicle_make", label: "Make" },
//                       { key: "vehicle_model", label: "Model" },
//                       { key: "in_service", label: "Status" },
//                       { key: "phone", label: "Contact" }, // Added phone column
//                       { key: "notes", label: "Notes" },
//                     ].map((c) => (
//                       <th
//                         key={c.key}
//                         onClick={() => handleSort(c.key)}
//                         className="cursor-pointer"
//                       >
//                         {c.label}{" "}
//                         {sortColumn === c.key &&
//                           (sortOrder === "asc" ? "Up" : "Down")}
//                       </th>
//                     ))}
//                     <th>Action</th>
//                   </>
//                 ) : activeTab === "Dispatch Log" ? (
//                   <>
//                     {[
//                       { key: "dispatch_id", label: "Dispatch ID" },
//                       { key: "timestamp", label: "Time" },
//                       { key: "unit.unit_number", label: "Unit" },
//                       { key: "dispatcher", label: "Dispatcher" },
//                       { key: "call_type", label: "Type" },
//                       { key: "location", label: "Location" },
//                       { key: "phone_number", label: "Phone" }, // Added phone column
//                       { key: "status", label: "Status" },
//                     ].map((c) => (
//                       <th
//                         key={c.key}
//                         onClick={() => handleSort(c.key)}
//                         className="cursor-pointer"
//                       >
//                         {c.label}{" "}
//                         {sortColumn === c.key &&
//                           (sortOrder === "asc" ? "Up" : "Down")}
//                       </th>
//                     ))}
//                     <th>Action</th>
//                   </>
//                 ) : (
//                   // Trip Log
//                   <>
//                     {[
//                       { key: "trip_id", label: "Trip ID" },
//                       { key: "dispatch.dispatch_id", label: "Dispatch" },
//                       { key: "unit.unit_number", label: "Unit" },
//                       { key: "crew", label: "Crew" },
//                       { key: "patient_id", label: "Patient" },
//                       { key: "pickup_location", label: "Pickup" },
//                       { key: "destination", label: "Dest" },
//                       { key: "phone_number", label: "Phone" }, // Added phone column
//                       { key: "start_time", label: "Start" },
//                       { key: "end_time", label: "End" },
//                       { key: "mileage", label: "Mileage" },
//                       { key: "status", label: "Status" },
//                     ].map((c) => (
//                       <th
//                         key={c.key}
//                         onClick={() => handleSort(c.key)}
//                         className="cursor-pointer"
//                       >
//                         {c.label}{" "}
//                         {sortColumn === c.key &&
//                           (sortOrder === "asc" ? "Up" : "Down")}
//                       </th>
//                     ))}
//                     <th>Action</th>
//                   </>
//                 )}
//               </tr>
//             </thead>
//             <tbody>
//               {activeTab === "Ambulance Units"
//                 ? sortedData.map((row) => {
//                     const id = row.id;
//                     return (
//                       <tr
//                         key={id}
//                         className="text-center border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] h-[50px]"
//                       >
//                         <td>
//                           <input
//                             type="checkbox"
//                             checked={isRowSelected(id)}
//                             onChange={() => handleRowSelect(id)}
//                             className="appearance-none w-5 h-5 ml-3 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
//                           />
//                         </td>
//                         <td>{row.unit_number}</td>
//                         <td>{row.vehicle_make || "-"}</td>
//                         <td>{row.vehicle_model || "-"}</td>
//                         <td>
//                           <span
//                             className={`px-2 py-1 rounded text-xs font-medium ${
//                               row.in_service
//                                 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
//                                 : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
//                             }`}
//                           >
//                             {row.in_service ? "Ready" : "Out"}
//                           </span>
//                         </td>
//                         <td className="text-center">
//                           {row.phone || row.contact_number || "-"}
//                         </td>
//                         <td className="text-center">{row.notes || "-"}</td>
//                         <td className="px-3 py-3 flex justify-center gap-2">
                         
//                           <button
//                             onClick={() => handleOpenEditUnit(row)}
//                             className="relative group w-7 h-7 flex items-center justify-center rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
//                           >
//                             <Edit
//                               size={14}
//                               className="text-[#08994A] dark:text-[#0EFF7B]"
//                             />
//                             <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Edit
//               </span>
//                           </button>
//                           <button
//                             onClick={() => handleDelete(row)}
//                             className="relative group w-7 h-7 flex items-center justify-center rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
//                           >
//                             <Trash2
//                               size={14}
//                               className="text-red-600 dark:text-red-500"
//                             />
//                             <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Delete
//               </span>
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 : activeTab === "Dispatch Log"
//                 ? sortedData.map((row) => {
//                     const id = row.id;
//                     const unitNumber = row.unit?.unit_number || "-";
//                     return (
//                       <tr
//                         key={id}
//                         className="text-center border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] h-[50px]"
//                       >
//                         <td>
//                           <input
//                             type="checkbox"
//                             checked={isRowSelected(id)}
//                             onChange={() => handleRowSelect(id)}
//                             className="appearance-none w-5 h-5 ml-3 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
//                           />
//                         </td>
//                         <td>{row.dispatch_id}</td>
//                         <td>{new Date(row.timestamp).toLocaleString()}</td>
//                         <td>{unitNumber}</td>
//                         <td>{row.dispatcher}</td>
//                         <td>{row.call_type}</td>
//                         <td>{row.location}</td>
//                         <td>{row.phone_number || "-"}</td>
//                         <td className={getStatusColor(row.status)}>
//                           {row.status}
//                         </td>
//                         <td className="px-3 py-3 flex justify-end gap-2">
                          
//                           <button
//                             onClick={() => handleOpenEditDispatch(row)}
//                             className="relative group w-7 h-7 flex items-center justify-center rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
//                           >
//                             <Edit
//                               size={14}
//                               className="text-[#08994A] dark:text-[#0EFF7B]"
//                             />
//                             <span className="absolute bottom-10 left-1/4 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Edit
//               </span>
//                           </button>
//                           <button
//                             onClick={() => handleDelete(row)}
//                             className="relative group w-7 h-7 flex items-center justify-center rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
//                           >
//                             <Trash2
//                               size={14}
//                               className="text-red-600 dark:text-red-500"
//                             />
//                             <span className="absolute bottom-10 left-1/4 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Delete
//               </span>
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 : // Trip Log - Now with Action Column
//                   sortedData.map((row) => {
//                     const id = row.id;
//                     const unitNumber = row.unit?.unit_number || "-";
//                     return (
//                       <tr
//                         key={id}
//                         className="text-center border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] h-[50px]"
//                       >
//                         <td>
//                           <input
//                             type="checkbox"
//                             checked={isRowSelected(id)}
//                             onChange={() => handleRowSelect(id)}
//                             className="appearance-none w-5 h-5 ml-3 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
//                           />
//                         </td>
//                         <td>{row.trip_id}</td>
//                         <td>{row.dispatch?.dispatch_id || "-"}</td>
//                         <td>{unitNumber}</td>
//                         <td>{row.crew || "-"}</td>
//                         <td>
//                           {row.patient ? (
//                             <div className="text-center text-xs">
//                               <div className="font-medium">
//                                 {row.patient.patient_unique_id}
//                               </div>
//                               <div className="text-gray-500">
//                                 {row.patient.full_name}
//                               </div>
//                             </div>
//                           ) : (
//                             "-"
//                           )}
//                         </td>
//                         <td>{row.pickup_location || "-"}</td>
//                         <td>{row.destination || "-"}</td>
//                         <td>{row.phone_number || "-"}</td>
//                         <td>
//                           {row.start_time
//                             ? new Date(row.start_time).toLocaleTimeString()
//                             : "-"}
//                         </td>
//                         <td>
//                           {row.end_time
//                             ? new Date(row.end_time).toLocaleTimeString()
//                             : "-"}
//                         </td>
//                         <td>{row.mileage || "-"}</td>
//                         <td className={getStatusColor(row.status)}>
//                           {row.status}
//                         </td>
//                         <td className="px-3 py-3 flex justify-center gap-2">
//                           {row.phone_number && row.phone_number !== '+91-XXXXXXXXXX' && (
//                             <button
//                               onClick={() => handlePhoneCall(row.phone_number, row)}
//                               className="relative group w-7 h-7 flex items-center justify-center rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
//                             >
//                               <Phone
//                                 size={14}
//                                 className="text-[#08994A] dark:text-[#0EFF7B]"
//                               />
//                               <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
//                     transition-all duration-150">
//                     Call
//                   </span>
//                             </button>
//                           )}
//                           <button
//                             onClick={() => handleOpenEditTrip(row)}
//                             className="relative group w-7 h-7 flex items-center justify-center rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
//                           >
//                             <Edit
//                               size={14}
//                               className="text-[#08994A] dark:text-[#0EFF7B]"
//                             />
//                             <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Edit
//               </span>
//                           </button>
//                           <button
//                             onClick={() => handleDelete(row)}
//                             className="relative group w-7 h-7 flex items-center justify-center rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
//                           >
//                             <Trash2
//                               size={14}
//                               className="text-red-600 dark:text-red-500"
//                             />
//                             <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
//                     px-3 py-1 text-xs rounded-md shadow-md
//                     bg-gray-100 dark:bg-black text-black dark:text-white opacity-0   group-hover:opacity-100
//                     transition-all duration-150">
//                     Delete
//               </span>
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="flex items-center h-full mt-4 bg-gray-100 dark:bg-transparent p-4 rounded gap-x-4">
//           <div className="text-sm text-black dark:text-white">
//             Page{" "}
//             <span className="text-[#08994A] dark:text-[#0EFF7B]">
//               {currentPage}
//             </span>{" "}
//             of {totalPages} ({(currentPage - 1) * itemsPerPage + 1} to{" "}
//             {Math.min(currentPage * itemsPerPage, filteredData.length)} from{" "}
//             {filteredData.length}{" "}
//             {activeTab === "Dispatch Log"
//               ? "Dispatches"
//               : activeTab === "Trip Log"
//               ? "Trips"
//               : "Units"}
//             )
//           </div>
//           <div className="flex items-center gap-x-2">
//             <button
//               onClick={handlePrevPage}
//               disabled={currentPage === 1}
//               className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
//                 currentPage === 1
//                   ? "bg-[#0EFF7B1A] opacity-50"
//                   : "bg-[#0EFF7B] hover:bg-[#0EFF7B1A]"
//               }`}
//             >
//               <ChevronLeft
//                 size={12}
//                 className="text-[#08994A] dark:text-white"
//               />
//             </button>
//             <button
//               onClick={handleNextPage}
//               disabled={currentPage === totalPages}
//               className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
//                 currentPage === totalPages
//                   ? "bg-[#0EFF7B1A] opacity-50"
//                   : "bg-[#0EFF7B] hover:bg-[#0EFF7B1A]"
//               }`}
//             >
//               <ChevronRight
//                 size={12}
//                 className="text-[#08994A] dark:text-white"
//               />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* MODALS */}
//       <EditDispatchModal
//         isOpen={editDispatchOpen}
//         onClose={() => {
//           setEditDispatchOpen(false);
//           setEditingDispatch(null);
//         }}
//         dispatch={editingDispatch}
//         onSave={saveDispatch}
//         units={units}
//       />

//       <EditTripModal
//         isOpen={editTripOpen}
//         onClose={() => {
//           setEditTripOpen(false);
//           setEditingTrip(null);
//         }}
//         trip={editingTrip}
//         onSave={saveTrip}
//         units={units}
//         dispatches={dispatchData}
//         patients={patientList}
//         existingTrips={tripData}
//       />

//       <AmbulanceUnitsModal
//         isOpen={editUnitOpen}
//         onClose={() => {
//           setEditUnitOpen(false);
//           setEditingUnit(null);
//         }}
//         unit={editingUnit}
//         onSave={saveUnit}
//       />

//       {/* Delete Confirmation */}
//     {isDeleteOpen && (
//   <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//     <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] 
//       ">

//       <div className="w-[400px] bg-gray-100 dark:bg-[#000000E5] rounded-[19px] p-6 relative">

//         {/* Border Glow */}
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             borderRadius: "20px",
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

//         <div className="relative z-10">

//           {/* TITLE + CLOSE BUTTON */}
//           <div className="flex justify-between items-center mb-4">
//             <h2
//               className="text-black dark:text-white font-medium text-[16px]"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               {selectedItem
//                 ? "Confirm Deletion"
//                 : "Confirm Bulk Deletion"}
//             </h2>

//             <button
//               onClick={() => setIsDeleteOpen(false)}
//               className="w-6 h-6 rounded-full border border-[#0EFF7B1A] dark:border-[#0EFF7B1A] 
//                 bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] flex items-center justify-center"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="text-[#08994A] dark:text-white"
//                 width="16"
//                 height="16"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   d="M18 6L6 18M6 6l12 12"
//                 />
//               </svg>
//             </button>
//           </div>

//           {/* MESSAGE */}
//           <p
//             className="text-sm text-black dark:text-white mb-6 text-center"
//             style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//           >
//             {selectedItem ? (
//               <>
//                 Are you sure you want to delete{" "}
//                 <span className="font-semibold text-[#08994A] dark:text-[#0EFF7B]">
//                   {selectedItem.trip_id ||
//                     selectedItem.dispatch_id ||
//                     selectedItem.unit_number}
//                 </span>
//                 ?<br />
//                 This action cannot be undone.
//               </>
//             ) : (
//               <>
//                 Are you sure you want to delete{" "}
//                 <span className="font-semibold text-[#08994A] dark:text-[#0EFF7B]">
//                   {selectedRows.size} selected items
//                 </span>
//                 ?<br />
//                 This action cannot be undone.
//               </>
//             )}
//           </p>

//           {/* BUTTONS */}
//           <div className="flex justify-center gap-4">
//             {/* Cancel */}
//             <button
//               onClick={() => setIsDeleteOpen(false)}
//               className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#3C3C3C] 
//                 text-white font-medium text-[14px] shadow-[0_2px_12px_0px_#00000040] 
//                 bg-black dark:bg-transparent hover:bg-gray-800 dark:hover:bg-[#3A3A3A] transition"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Cancel
//             </button>

//             {/* Delete */}
//             <button
//               onClick={confirmDelete}
//               className="w-[144px] h-[32px] rounded-[8px] px-3 py-2 flex items-center justify-center 
//                 bg-gradient-to-r from-[#FF4D4D] to-[#B30000] 
//                 text-white font-medium text-[14px] hover:scale-105 transition 
//                 shadow-[0_2px_12px_0px_#00000040]"
//               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
//             >
//               Delete {selectedItem ? "" : `(${selectedRows.size})`}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// )}

//     </div>
//   );
// };

// src/components/AmbulanceManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Listbox } from "@headlessui/react";
import MapView from "./MapView";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bell,
  MapPin,
  Phone,
  Edit,
  Clock,
  Filter,
  Trash2,
  X,
  Plus,
  AlertTriangle,
  CheckCircle,
  Siren,
  Navigation,
  Ambulance as AmbulanceIcon,
  Wifi,
  WifiOff,
} from "lucide-react";
import EditDispatchModal from "./EditDispatch";
import EditTripModal from "./EditTrip";
import AmbulanceUnitsModal from "./AmbulanceUnits";
import { successToast, errorToast } from "../../../components/Toast.jsx";
import api from "../../../utils/axiosConfig";

const WS_URL = import.meta.env.VITE_API_BASE_URL;

const AmbulanceManagement = () => {
  // ── STATE ─────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [activeTab, setActiveTab] = useState("Dispatch Log");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [livePositions, setLivePositions] = useState({});
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Data
  const [dispatchData, setDispatchData] = useState([]);
  const [tripData, setTripData] = useState([]);
  const [unitData, setUnitData] = useState([]);
  const [units, setUnits] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    ready: 0,
    onRoad: 0,
    outOfService: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [editDispatchOpen, setEditDispatchOpen] = useState(false);
  const [editTripOpen, setEditTripOpen] = useState(false);
  const [editUnitOpen, setEditUnitOpen] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [patientList, setPatientList] = useState([]);

  const itemsPerPage = 10;

  // ── WEBSOCKET MANAGEMENT ──────────────────────
  const connectWebSocket = useCallback(() => {
    if (!isMountedRef.current) return;

    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.close(1000, "Reconnecting");
    }

    console.log("🔄 Attempting WebSocket connection...");
    setConnectionStatus("connecting");

    try {
      ws.current = new WebSocket(WS_URL + "/ws");
      ws.current.onopen = () => {
        if (!isMountedRef.current) {
          ws.current?.close();
          return;
        }
        console.log("✅ WebSocket connected successfully");
        setConnectionStatus("connected");
        
        // Send client info
        const clientInfo = {
          type: "client_info",
          client: "ambulance_management",
          timestamp: new Date().toISOString()
        };
        ws.current.send(JSON.stringify(clientInfo));
      };

      ws.current.onmessage = (event) => {
        if (!isMountedRef.current) return;

        try {
          const data = JSON.parse(event.data);
          console.log("📨 WebSocket message received:", data.type);
          handleWebSocketMessage(data);
        } catch (parseError) {
          console.error("❌ Error parsing WebSocket message:", parseError);
        }
      };

      ws.current.onclose = (event) => {
        if (!isMountedRef.current) return;

        console.log("🔌 WebSocket disconnected:", event.code, event.reason);
        setConnectionStatus("disconnected");

        // Don't attempt to reconnect if component is unmounting or connection was intentional
        if (event.code === 1000 || !isMountedRef.current) return;

        // Attempt reconnection with exponential backoff
        const delay = Math.min(1000 * Math.pow(1.5, 3), 10000); // Max 10 seconds
        console.log(`🔄 Reconnecting in ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            connectWebSocket();
          }
        }, delay);
      };

      ws.current.onerror = (error) => {
        if (!isMountedRef.current) return;
        console.error("❌ WebSocket error:", error);
        setConnectionStatus("error");
        
        // Retry connection after delay
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            connectWebSocket();
          }
        }, 3000);
      };

    } catch (error) {
      console.error("❌ Failed to create WebSocket connection:", error);
      setConnectionStatus("error");
      
      // Retry connection after delay
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          connectWebSocket();
        }
      }, 3000);
    }
  }, []);

  const handleWebSocketMessage = (data) => {
  // Skip connection established messages
  if (data.type === "connection_established") {
    console.log("✅ WebSocket connection confirmed");
    return;
  }

  // Handle different message types - match exactly what backend sends
  switch (data.type) {
    case "unit_created":
    case "unit_updated":
    case "unit_deleted":
    case "dispatch_created":
    case "dispatch_updated":
    case "dispatch_deleted":
    case "trip_created":
    case "trip_updated":
    case "trip_deleted":
    case "trip_status_changed":
      // Refresh data when CRUD operations happen
      fetchData();

      // ❌ Toast notification disabled
      // showNotificationToast(data);
      break;

    case "location_update":
      setLivePositions((prev) => ({
        ...prev,
        [data.unit_number]: { lat: data.lat, lng: data.lng },
      }));
      break;

    case "status_update":
      // ❌ Toast notification disabled
      // showNotificationToast(data);
      break;

    // Backend message types
    case "new_dispatch":
    case "new_trip":
    case "trip_completed":
    case "dispatch_status_updated":
    case "dispatch_unit_changed":
      fetchData(); // Refresh data

      // ❌ Toast notification disabled
      // showNotificationToast(data);
      break;

    default:
      console.log("📨 Unknown message type:", data.type, data);
      break;
  }

  // ✅ Notification panel still works
  if (data.type !== "location_update" && data.type !== "connection_established") {
    addToNotificationPanel(data);
  }
};


  const showNotificationToast = (data) => {
    const toastConfigs = {
      // Unit operations
      unit_created: {
        icon: AmbulanceIcon,
        color: "text-green-500",
        bgColor: "bg-green-900/30 border-green-500/50",
        autoClose: 4000,
      },
      unit_updated: {
        icon: AmbulanceIcon,
        color: "text-yellow-500",
        bgColor: "bg-yellow-900/30 border-yellow-500/50",
        autoClose: 4000,
      },
      unit_deleted: {
        icon: AmbulanceIcon,
        color: "text-red-500",
        bgColor: "bg-red-900/30 border-red-500/50",
        autoClose: 4000,
      },

      // Dispatch operations
      dispatch_created: {
        icon: Siren,
        color: "text-red-500",
        bgColor: "bg-red-900/30 border-red-500/50",
        autoClose: 8000,
        playSound: true,
      },
      new_dispatch: { // This is what backend actually sends for new dispatches
        icon: Siren,
        color: "text-red-500",
        bgColor: "bg-red-900/30 border-red-500/50",
        autoClose: 8000,
        playSound: true,
      },
      dispatch_updated: {
        icon: Edit,
        color: "text-yellow-500",
        bgColor: "bg-yellow-900/30 border-yellow-500/50",
        autoClose: 4000,
      },
      dispatch_deleted: {
        icon: Trash2,
        color: "text-red-500",
        bgColor: "bg-red-900/30 border-red-500/50",
        autoClose: 4000,
      },
      dispatch_status_updated: {
        icon: Clock,
        color: "text-purple-500",
        bgColor: "bg-purple-900/30 border-purple-500/50",
        autoClose: 5000,
      },
      dispatch_unit_changed: {
        icon: AmbulanceIcon,
        color: "text-orange-500",
        bgColor: "bg-orange-900/30 border-orange-500/50",
        autoClose: 5000,
      },

      // Trip operations
      trip_created: {
        icon: AmbulanceIcon,
        color: "text-blue-500",
        bgColor: "bg-blue-900/30 border-blue-500/50",
        autoClose: 5000,
      },
      new_trip: { // This is what backend actually sends for new trips
        icon: AmbulanceIcon,
        color: "text-blue-500",
        bgColor: "bg-blue-900/30 border-blue-500/50",
        autoClose: 5000,
      },
      trip_updated: {
        icon: Edit,
        color: "text-yellow-500",
        bgColor: "bg-yellow-900/30 border-yellow-500/50",
        autoClose: 4000,
      },
      trip_deleted: {
        icon: Trash2,
        color: "text-red-500",
        bgColor: "bg-red-900/30 border-red-500/50",
        autoClose: 4000,
      },
      trip_status_changed: {
        icon: Clock,
        color: "text-purple-500",
        bgColor: "bg-purple-900/30 border-purple-500/50",
        autoClose: 5000,
      },
      trip_completed: {
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-900/30 border-green-500/50",
        autoClose: 5000,
      },

      // Status updates
      status_update: {
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-900/30 border-green-500/50",
        autoClose: 5000,
      },
    };

    const config = toastConfigs[data.type] || {
      icon: Bell,
      color: "text-gray-500",
      bgColor: "bg-gray-900/30 border-gray-500/50",
      autoClose: 4000,
    };

    successToast(
      <div className="flex items-center gap-3">
        <config.icon className={`w-6 h-6 ${config.color}`} />
        <div>
          <strong className={config.color}>{data.title || formatMessageType(data.type)}</strong>
          <p className="text-sm text-gray-700">{data.message}</p>
        </div>
      </div>,
      { autoClose: config.autoClose }
    );

    // Play emergency sound for new dispatches
    if (config.playSound) {
      try {
        const audio = new Audio(
          "https://assets.mixkit.co/sfx/preview/mixkit-emergency-alert-2951.mp3"
        );
        audio.volume = 0.3;
        audio.play().catch((e) => console.log("Audio play failed:", e));
      } catch (audioError) {
        console.log("Audio initialization failed:", audioError);
      }
    }
  };

  // Helper function to format message types for display
  const formatMessageType = (type) => {
    const typeMap = {
      unit_created: "Ambulance Unit Created",
      unit_updated: "Ambulance Unit Updated", 
      unit_deleted: "Ambulance Unit Deleted",
      dispatch_created: "New Dispatch Created",
      new_dispatch: "New Dispatch Created",
      dispatch_updated: "Dispatch Updated",
      dispatch_deleted: "Dispatch Cancelled",
      dispatch_status_updated: "Dispatch Status Updated",
      dispatch_unit_changed: "Dispatch Unit Changed",
      trip_created: "New Trip Started",
      new_trip: "New Trip Started",
      trip_updated: "Trip Updated",
      trip_deleted: "Trip Cancelled",
      trip_status_changed: "Trip Status Updated",
      trip_completed: "Trip Completed",
      status_update: "Status Update",
      location_update: "Location Update"
    };
    
    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const addToNotificationPanel = (data) => {
    const now = Date.now();
    const notificationId = now + Math.random();

    setNotifications((prev) => {
      // Prevent duplicates
      const isDuplicate = prev.some(
        (n) =>
          n.type === data.type &&
          n.message === data.message &&
          n.title === data.title &&
          now - n.id < 2000 // 2 second duplicate window
      );

      if (isDuplicate) return prev;

      return [
        {
          id: notificationId,
          ...data,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 49), // Keep only last 50 notifications
      ];
    });

    setUnreadCount((c) => c + 1);
  };

  // ── DATA FETCHING ─────────────────────────────
  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);
    try {
      const dispatchRes = await api.get("/ambulance/dispatch");
      const tripRes = await api.get("/ambulance/trips");
      const unitRes = await api.get("/ambulance/units");
      const patientRes = await api.get("/ambulance/patients");

      const dispatches = dispatchRes.data;
      const trips = tripRes.data;
      const allUnits = unitRes.data;
      const patients = patientRes.data;

      // Map patient phone correctly
      const patientsWithPhone = patients.map(patient => ({
        ...patient,
        phone: patient.phone || patient.phone_number || '+91-XXXXXXXXXX'
      }));

      setPatientList(patientsWithPhone);
      
      // Add phone numbers to dispatches
      const dispatchesWithPhone = dispatches.map(dispatch => ({
        ...dispatch,
        phone_number: dispatch.phone_number || dispatch.contact_number || '+91-XXXXXXXXXX'
      }));
      
      // Add phone numbers to trips
      const tripsWithPhone = trips.map(trip => ({
        ...trip,
        phone_number: trip.phone_number || trip.patient?.phone || '+91-XXXXXXXXXX'
      }));

      // Add phone numbers to ambulance units
      const unitsWithPhone = allUnits.map(unit => ({
        ...unit,
        phone: unit.phone || unit.contact_number || '+91-XXXXXXXXXX'
      }));

      setDispatchData(dispatchesWithPhone);
      setTripData(tripsWithPhone);
      setUnitData(unitsWithPhone);
      setUnits(unitsWithPhone);

      // Stats
      const total = unitsWithPhone.length;
      const ready = unitsWithPhone.filter((u) => u.in_service).length;
      const onRoad = trips.filter((t) => t.status === "En Route").length;
      const outOfService = total - ready;

      setStats({ total, ready, onRoad, outOfService });
    } catch (err) {
      let errorMessage = "Failed to fetch data.";
      if (err.response) {
        errorMessage = err.response.data?.detail || err.response.data?.message || errorMessage;
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      console.error("❌ Error fetching data:", err);
      setError(errorMessage);
      errorToast(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // ── LIFECYCLE ─────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial data fetch
    fetchData();
    
    // Connect WebSocket after a brief delay to ensure component is mounted
    const wsTimeout = setTimeout(() => {
      connectWebSocket();
    }, 500);

    return () => {
      isMountedRef.current = false;
      
      // Clear timeouts
      clearTimeout(wsTimeout);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Close WebSocket
      if (ws.current) {
        ws.current.close(1000, "Component unmounting");
      }
    };
  }, [fetchData, connectWebSocket]);

  // ── FILTER / PAGINATION / SORT ─────────────────
  const currentData =
    activeTab === "Dispatch Log"
      ? dispatchData
      : activeTab === "Trip Log"
      ? tripData
      : unitData;

  const filteredData = currentData
    .filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((item) => (filterStatus ? item.status === filterStatus : true));

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const displayedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const sortedData = [...displayedData].sort((a, b) => {
    if (!sortColumn) return 0;
    const valA = a[sortColumn];
    const valB = b[sortColumn];
    if (typeof valA === "string")
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  // ── HANDLERS ───────────────────────────────────
  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortOrder("asc");
    }
  };

  const handlePrevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);

  const applyFilter = (status) => {
    setFilterStatus(status);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const clearFilter = () => {
    setFilterStatus("");
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteClick = () => {
    if (selectedRows.size === 0) {
      errorToast("Kindly select at least one record to delete.");
      return;
    }
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    const ids = selectedItem ? [selectedItem.id] : Array.from(selectedRows);
    const count = ids.length;
    const endpointMap = {
      "Dispatch Log": "dispatch",
      "Trip Log": "trips",
      "Ambulance Units": "units",
    };
    const endpoint = endpointMap[activeTab] || "units";
    const itemType =
      activeTab === "Dispatch Log"
        ? "dispatch"
        : activeTab === "Trip Log"
        ? "trip"
        : "unit";

    try {
      await Promise.all(
        ids.map((id) =>
          api.delete(`/ambulance/${endpoint}/${id}`)
        )
      );

      await fetchData();
      setSelectedRows(new Set());
      setSelectAll(false);

      successToast(
        count === 1
          ? `${
              itemType.charAt(0).toUpperCase() + itemType.slice(1)
            } deleted successfully!`
          : `${count} ${itemType}s deleted successfully!`
      );
    } catch (err) {
      let errorMessage = "Failed to delete item(s).";
      if (err.response) {
        errorMessage = err.response.data?.detail || err.response.data?.message || errorMessage;
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      errorToast(errorMessage);
    } finally {
      setIsDeleteOpen(false);
      setSelectedItem(null);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Completed") return "text-green-600 dark:text-green-500";
    if (status === "En Route") return "text-blue-600 dark:text-blue-500";
    if (status === "Standby") return "text-yellow-600 dark:text-yellow-500";
    return "text-gray-600 dark:text-gray-400";
  };

  // Phone call functionality
  const handlePhoneCall = (phoneNumber, item) => {
    if (!phoneNumber || phoneNumber === '+91-XXXXXXXXXX') {
      errorToast("No valid phone number available for this record");
      return;
    }

    // Format phone number for tel: protocol
    const formattedNumber = phoneNumber.replace(/[\s\-]/g, '');
    
    // Show confirmation dialog
    if (window.confirm(`Call ${phoneNumber}?`)) {
      window.open(`tel:${formattedNumber}`, '_self');
      
      // Log the call attempt
      console.log(`Calling ${phoneNumber} for ${item.dispatch_id || item.trip_id || item.unit_number}`);
    }
  };

  // Selection
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      const allIds = new Set(sortedData.map((i) => i.id));
      setSelectedRows(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (id) => {
    const copy = new Set(selectedRows);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setSelectedRows(copy);
    setSelectAll(copy.size === sortedData.length);
  };

  const isRowSelected = (id) => selectedRows.has(id);

  // ── CREATE / EDIT HANDLERS ─────────────────────
  const handleOpenEditDispatch = (dispatch = null) => {
    setEditingDispatch(dispatch);
    setEditDispatchOpen(true);
  };

  const handleOpenEditTrip = (trip = null) => {
    setEditingTrip(trip);
    setEditTripOpen(true);
  };

  const handleOpenEditUnit = (unit = null) => {
    setEditingUnit(unit);
    setEditUnitOpen(true);
  };

  // In AmbulanceManagement.jsx - update the saveDispatch function
const saveDispatch = async (payload) => {
  const url = editingDispatch
    ? `/ambulance/dispatch/${editingDispatch.id}`
    : `/ambulance/dispatch`;
  try {
    const res = await (editingDispatch ? api.put(url, payload) : api.post(url, payload));
    await fetchData();
    setEditDispatchOpen(false);
    setEditingDispatch(null);
    successToast(editingDispatch ? "Dispatch updated!" : "Dispatch created!");
    return res.data;
  } catch (err) {
    // Check if it's a 422 validation error
    if (err.response?.status === 422) {
      // Pass the validation errors to the modal
      throw err;
    } else {
      // For other errors, show toast here
      let errorMessage = editingDispatch ? "Failed to update dispatch!" : "Failed to create dispatch!";
      if (err.response) {
        const responseData = err.response.data;
        if (responseData.detail) {
          if (Array.isArray(responseData.detail)) {
            errorMessage = responseData.detail.map(e => e.msg || e).join(', ');
          } else if (typeof responseData.detail === 'string') {
            errorMessage = responseData.detail;
          } else if (responseData.detail?.message) {
            errorMessage = responseData.detail.message;
          }
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      errorToast(errorMessage);
      // Re-throw so the modal knows an error occurred
      throw err;
    }
  }
};

  const saveTrip = async (payload) => {
    const url = editingTrip
      ? `/ambulance/trips/${editingTrip.id}`
      : `/ambulance/trips`;
    try {
      const res = await (editingTrip ? api.put(url, payload) : api.post(url, payload));
      await fetchData();
      setEditTripOpen(false);
      setEditingTrip(null);
      successToast(
        editingTrip
          ? "Trip updated successfully!"
          : "Trip created successfully!"
      );
    } catch (err) {
      let errorMessage = editingTrip ? "Failed to update trip!" : "Failed to create trip!";
      if (err.response) {
        errorMessage = err.response.data?.detail || err.response.data?.message || errorMessage;
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      errorToast(errorMessage);
    }
  };

  // In AmbulanceManagement.jsx - update the saveUnit function
// In AmbulanceManagement.jsx - update the saveUnit function
const saveUnit = async (payload) => {
  const url = editingUnit
    ? `/ambulance/units/${editingUnit.id}`
    : `/ambulance/units`;
  try {
    const res = await (editingUnit ? api.put(url, payload) : api.post(url, payload));
    await fetchData();
    setEditUnitOpen(false);
    setEditingUnit(null);
    successToast(
      editingUnit
        ? "Unit updated successfully!"
        : "Unit created successfully!"
    );
    return res.data;
  } catch (err) {
    // Check if it's a 409 conflict (duplicate entry)
    if (err.response?.status === 409) {
      // Re-throw for modal to handle
      throw err;
    } 
    // Check if it's a 422 validation error
    else if (err.response?.status === 422) {
      // Pass the validation errors to the modal
      throw err;
    } else {
      // For other errors, show toast here
      let errorMessage = editingUnit ? "Failed to update unit!" : "Failed to create unit!";
      if (err.response) {
        // Handle different error formats
        const responseData = err.response.data;
        if (responseData.detail) {
          if (Array.isArray(responseData.detail)) {
            // FastAPI validation errors come as an array
            errorMessage = responseData.detail.map(e => e.msg || e).join(', ');
          } else if (typeof responseData.detail === 'string') {
            errorMessage = responseData.detail;
          } else if (responseData.detail?.message) {
            errorMessage = responseData.detail.message;
          }
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      errorToast(errorMessage);
      // Re-throw so the modal knows an error occurred
      throw err;
    }
  }
};

  // ── RENDER ─────────────────────────────────────
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white rounded-xl p-4 w-full max-w-[2500px] font-[Helvetica] mx-auto flex flex-col overflow-hidden relative">
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
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-4 relative z-10">
        <div>
          <h1 className="text-[20px] font-medium flex items-center gap-2">
            Ambulance Management
            <div className="flex items-center gap-2 text-sm">
              {connectionStatus === "connected" ? (
                <Wifi size={16} className="text-green-500" />
              ) : connectionStatus === "connecting" ? (
                <Wifi size={16} className="text-yellow-500 animate-pulse" />
              ) : (
                <WifiOff size={16} className="text-red-500" />
              )}
              <span className={`text-xs ${
                connectionStatus === "connected" ? "text-green-500" :
                connectionStatus === "connecting" ? "text-yellow-500" :
                "text-red-500"
              }`}>
                {connectionStatus}
              </span>
            </div>
          </h1>
          <p className="text-[14px] mt-2 text-gray-600 dark:text-gray-400">
            Manage ambulance dispatches, trips, and vehicle status in one place.
          </p>
        </div>
      </div>

      {/* Map + Stats + Notifications */}
      <div className="w-full flex flex-col lg:flex-row gap-6 mb-6 relative z-10">
        {/* Map + Stats */}
        <div className="w-full lg:flex-1 space-y-6">
          {/* Live Map */}
          <div className="w-full h-[340px] rounded-2xl overflow-hidden shadow-2xl border border-[#0EFF7B]/20 bg-gradient-to-br from-black via-[#0a0a0a] to-black">
            <MapView
              units={unitData}
              trips={tripData}
              livePositions={livePositions}
            />
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Vehicles",
                value: stats.total,
                icon: "Ambulance",
              },
              {
                label: "Ready",
                value: stats.ready,
                color: "text-green-400",
                bg: "bg-green-500/10",
                icon: "CheckCircle",
              },
              {
                label: "On Road",
                value: stats.onRoad,
                color: "text-orange-400",
                bg: "bg-orange-500/10",
                icon: "Navigation",
              },
              {
                label: "Out of Service",
                value: stats.outOfService,
                color: "text-red-400",
                bg: "bg-red-500/10",
                icon: "AlertTriangle",
              },
            ].map((s, i) => (
              <div
                key={i}
                className={`relative p-5 rounded-xl border backdrop-blur-sm transition-all hover:scale-105 ${
                  s.bg || "bg-gray-100/5 border-[#0EFF7B]/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{s.label}</span>
                  {s.icon === "CheckCircle" && (
                    <CheckCircle size={16} className="text-green-400" />
                  )}
                  {s.icon === "Navigation" && (
                    <Navigation size={16} className="text-orange-400" />
                  )}
                  {s.icon === "AlertTriangle" && (
                    <AlertTriangle size={16} className="text-red-400" />
                  )}
                  {s.icon === "Ambulance" && (
                    <AmbulanceIcon size={16} className="text-[#0EFF7B]" />
                  )}
                </div>
                <span
                  className={`text-3xl font-bold ${s.color || "text-white"}`}
                >
                  {s.value}
                </span>
                {s.label === "On Road" && stats.onRoad > 0 && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-orange-400 rounded-full animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* REAL-TIME NOTIFICATIONS PANEL */}
        <div className="w-full lg:w-96 bg-gray-300 dark:bg-black/40 backdrop-blur-xl border border-[#0EFF7B]/30 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-3">
              <Bell size={20} className="text-[#0EFF7B]" />
              Live Alerts
              {unreadCount > 0 && (
                <span className="ml-2 px-3 py-1 text-xs font-bold bg-red-600 text-white rounded-full animate-pulse">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <button
              onClick={() => {
                setNotifications([]);
                setUnreadCount(0);
              }}
              className="text-xs text-gray-400 hover:text-[#0EFF7B] transition"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bell size={48} className="mx-auto mb-3 opacity-20" />
                <p>No active alerts</p>
              </div>
            ) : (
              notifications.slice(0, 15).map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-lg border transition-all ${
                    n.type === "dispatch_created"
                      ? "bg-red-900/30 border-red-500/50 shadow-lg shadow-red-500/20"
                      : n.type === "trip_created"
                      ? "bg-blue-900/20 border-blue-500/40"
                      : n.type === "status_update"
                      ? "bg-green-900/20 border-green-500/40"
                      : "bg-purple-900/20 border-purple-500/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {n.type === "dispatch_created" && (
                      <Siren
                        size={20}
                        className="text-red-400 mt-0.5 animate-pulse"
                      />
                    )}
                    {n.type === "trip_created" && (
                      <AmbulanceIcon
                        size={20}
                        className="text-blue-400 mt-0.5"
                      />
                    )}
                    {n.type === "status_update" && (
                      <CheckCircle
                        size={20}
                        className="text-green-400 mt-0.5"
                      />
                    )}
                    {n.type === "location_update" && (
                      <MapPin size={20} className="text-purple-400 mt-0.5" />
                    )}

                    <div className="flex-1">
                      <p className="font-semibold text-white">
                        {n.title || n.type}
                      </p>
                      <p className="text-sm text-gray-300 mt-1">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 relative z-10">
        <h1 className="text-[20px] font-medium">Transport Management</h1>
        <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-3">
          List of all {activeTab.toLowerCase()}
        </p>
        <div className="flex gap-3">
          {["Dispatch Log", "Trip Log", "Ambulance Units"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedRows(new Set());
                setSelectAll(false);
                setCurrentPage(1);
              }}
              className={`w-[160px] h-[34px] rounded-[4px] px-3 py-2 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-[#025126] border-t border-r border-b-2 border-l border-[#025126] shadow-[0_0_20px_0_#0EFF7B40] text-white"
                  : "bg-[#0EFF7B1A] dark:bg-[#1E1E1E] border border-[#0EFF7B] dark:border-[#1E1E1E] text-black dark:text-gray-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table Header + Controls */}
      <div className="relative z-10 border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[12px] p-4 bg-gray-100 dark:bg-transparent">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h2 className="text-lg font-semibold">{activeTab}</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search input with darker background in light mode */}
            <div className="relative w-48 sm:w-72">
  <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#066A3A] dark:text-[#0EFF7B]" />
  
  <input
    type="text"
    placeholder="Search..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full bg-[#CFF7E4] dark:bg-[#0EFF7B1A] pl-10 pr-4 py-2 placeholder-[#047857] rounded-[40px] border border-[#066A3A] text-[#064E3B] dark:text-[#08994A] text-sm focus:outline-none"
  />
</div>



            {/* Delete button - now green */}
            <button
              onClick={handleDeleteClick}
              className="relative group w-8 h-8 rounded-full border border-[#0EFF7B1A] bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition"
            >
              <Trash2 size={18} />
              <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                    px-3 py-1 text-xs rounded-md shadow-md
                    bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                    transition-all duration-150">
                Delete
              </span>
            </button>

            {activeTab === "Ambulance Units" ? (
              <button
                onClick={() => handleOpenEditUnit()}
                className="flex items-center gap-1 px-3 py-1 rounded bg-[#025126] text-white hover:scale-105 transition"
              >
                Add Unit
              </button>
            ) : activeTab === "Dispatch Log" ? (
              <button
                onClick={() => handleOpenEditDispatch()}
                className="relative group flex items-center gap-1 px-3 py-1 rounded bg-[#025126] text-white hover:scale-105 transition"
              >
                Add Dispatch
              </button>
            ) : (
              <button
                onClick={() => handleOpenEditTrip()}
                className="flex items-center gap-1 px-3 py-1 rounded bg-[#025126] text-white hover:scale-105 transition"
              >
                Add Trip
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-200 dark:bg-[#091810] h-[52px] text-sm text-center border-b border-gray-300 dark:border-[#3C3C3C] text-[#0EFF7B]">
              <tr>
                <th className="px-3 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                  />
                </th>
                {activeTab === "Ambulance Units" ? (
                  <>
                    {[
                      { key: "unit_number", label: "Unit" },
                      { key: "vehicle_make", label: "Make" },
                      { key: "vehicle_model", label: "Model" },
                      { key: "in_service", label: "Status" },
                      { key: "phone", label: "Contact" },
                      { key: "notes", label: "Notes" },
                    ].map((c) => (
                      <th
                        key={c.key}
                        onClick={() => handleSort(c.key)}
                        className="cursor-pointer"
                      >
                        {c.label}{" "}
                        {sortColumn === c.key &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                    ))}
                    <th>Action</th>
                  </>
                ) : activeTab === "Dispatch Log" ? (
                  <>
                    {[
                      { key: "dispatch_id", label: "Dispatch ID" },
                      { key: "timestamp", label: "Time" },
                      { key: "unit.unit_number", label: "Unit" },
                      { key: "dispatcher", label: "Dispatcher" },
                      { key: "call_type", label: "Type" },
                      { key: "location", label: "Location" },
                      { key: "phone_number", label: "Phone" },
                      { key: "status", label: "Status" },
                    ].map((c) => (
                      <th
                        key={c.key}
                        onClick={() => handleSort(c.key)}
                        className="cursor-pointer"
                      >
                        {c.label}{" "}
                        {sortColumn === c.key &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                    ))}
                    <th>Action</th>
                  </>
                ) : (
                  // Trip Log
                  <>
                    {[
                      { key: "trip_id", label: "Trip ID" },
                      { key: "dispatch.dispatch_id", label: "Dispatch" },
                      { key: "unit.unit_number", label: "Unit" },
                      { key: "crew", label: "Crew" },
                      { key: "patient_id", label: "Patient" },
                      { key: "pickup_location", label: "Pickup" },
                      { key: "destination", label: "Dest" },
                      { key: "phone_number", label: "Phone" },
                      { key: "start_time", label: "Start" },
                      { key: "end_time", label: "End" },
                      { key: "mileage", label: "Mileage" },
                      { key: "status", label: "Status" },
                    ].map((c) => (
                      <th
                        key={c.key}
                        onClick={() => handleSort(c.key)}
                        className="cursor-pointer"
                      >
                        {c.label}{" "}
                        {sortColumn === c.key &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                    ))}
                    <th>Action</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="20" className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No match found.
                  </td>
                </tr>
              ) : (
                activeTab === "Ambulance Units"
                  ? sortedData.map((row) => {
                      const id = row.id;
                      return (
                        <tr
                          key={id}
                          className="text-center border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] h-[50px]"
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={isRowSelected(id)}
                              onChange={() => handleRowSelect(id)}
                              className="appearance-none w-5 h-5 ml-3 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                            />
                          </td>
                          <td>{row.unit_number}</td>
                          <td>{row.vehicle_make || "-"}</td>
                          <td>{row.vehicle_model || "-"}</td>
                          <td>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                row.in_service
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {row.in_service ? "Ready" : "Out"}
                            </span>
                          </td>
                          <td className="text-center">
                            {row.phone || row.contact_number || "-"}
                          </td>
                          <td className="text-center">{row.notes || "-"}</td>
                          <td className="px-3 py-3 flex justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditUnit(row)}
                              className="relative group w-7 h-7 flex items-center justify-center rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
                            >
                              <Edit
                                size={14}
                                className="text-[#08994A] dark:text-[#0EFF7B]"
                              />
                              <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                      px-3 py-1 text-xs rounded-md shadow-md
                      bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                      transition-all duration-150">
                      Edit
                    </span>
                            </button>
                            <button
                              onClick={() => handleDelete(row)}
                              className="relative group w-7 h-7 flex items-center justify-center rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
                            >
                              <Trash2
                                size={14}
                                className="text-red-600 dark:text-red-500"
                              />
                              <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                      px-3 py-1 text-xs rounded-md shadow-md
                      bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                      transition-all duration-150">
                      Delete
                    </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  : activeTab === "Dispatch Log"
                  ? sortedData.map((row) => {
                      const id = row.id;
                      const unitNumber = row.unit?.unit_number || "-";
                      return (
                        <tr
                          key={id}
                          className="text-center border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] h-[50px]"
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={isRowSelected(id)}
                              onChange={() => handleRowSelect(id)}
                              className="appearance-none w-5 h-5 ml-3 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                            />
                          </td>
                          <td>{row.dispatch_id}</td>
                          <td>{new Date(row.timestamp).toLocaleString()}</td>
                          <td>{unitNumber}</td>
                          <td>{row.dispatcher}</td>
                          <td>{row.call_type}</td>
                          <td>{row.location}</td>
                          <td>{row.phone_number || "-"}</td>
                          <td className={getStatusColor(row.status)}>
                            {row.status}
                          </td>
                          <td className="px-3 py-3 flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditDispatch(row)}
                              className="relative group w-7 h-7 flex items-center justify-center rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
                            >
                              <Edit
                                size={14}
                                className="text-[#08994A] dark:text-[#0EFF7B]"
                              />
                              <span className="absolute bottom-10 left-1/4 -translate-x-1/2 whitespace-nowrap
                      px-3 py-1 text-xs rounded-md shadow-md
                      bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                      transition-all duration-150">
                      Edit
                    </span>
                            </button>
                            <button
                              onClick={() => handleDelete(row)}
                              className="relative group w-7 h-7 flex items-center justify-center rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
                            >
                              <Trash2
                                size={14}
                                className="text-red-600 dark:text-red-500"
                              />
                              <span className="absolute bottom-10 left-1/4 -translate-x-1/2 whitespace-nowrap
                      px-3 py-1 text-xs rounded-md shadow-md
                      bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                      transition-all duration-150">
                      Delete
                    </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  : // Trip Log
                    sortedData.map((row) => {
                      const id = row.id;
                      const unitNumber = row.unit?.unit_number || "-";
                      return (
                        <tr
                          key={id}
                          className="text-center border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] h-[50px]"
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={isRowSelected(id)}
                              onChange={() => handleRowSelect(id)}
                              className="appearance-none w-5 h-5 ml-3 border border-[#0EFF7B] dark:border-white rounded-sm bg-gray-100 dark:bg-black checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-green-500 flex items-center justify-center checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black checked:before:text-sm"
                            />
                          </td>
                          <td>{row.trip_id}</td>
                          <td>{row.dispatch?.dispatch_id || "-"}</td>
                          <td>{unitNumber}</td>
                          <td>{row.crew || "-"}</td>
                          <td>
                            {row.patient ? (
                              <div className="text-center text-xs">
                                <div className="font-medium">
                                  {row.patient.patient_unique_id}
                                </div>
                                <div className="text-gray-500">
                                  {row.patient.full_name}
                                </div>
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>{row.pickup_location || "-"}</td>
                          <td>{row.destination || "-"}</td>
                          <td>{row.phone_number || "-"}</td>
                          <td>
                            {row.start_time
                              ? new Date(row.start_time).toLocaleTimeString()
                              : "-"}
                          </td>
                          <td>
                            {row.end_time
                              ? new Date(row.end_time).toLocaleTimeString()
                              : "-"}
                          </td>
                          <td>{row.mileage || "-"}</td>
                          <td className={getStatusColor(row.status)}>
                            {row.status}
                          </td>
                          <td className="px-3 py-3 flex justify-center gap-2">
                            {row.phone_number && row.phone_number !== '+91-XXXXXXXXXX' && (
                              <button
                                onClick={() => handlePhoneCall(row.phone_number, row)}
                                className="relative group w-7 h-7 flex items-center justify-center rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
                              >
                                <Phone
                                  size={14}
                                  className="text-[#08994A] dark:text-[#0EFF7B]"
                                />
                                <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                      px-3 py-1 text-xs rounded-md shadow-md
                      bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                      transition-all duration-150">
                      Call
                    </span>
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditTrip(row)}
                              className="relative group w-7 h-7 flex items-center justify-center rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
                            >
                              <Edit
                                size={14}
                                className="text-[#08994A] dark:text-[#0EFF7B]"
                              />
                              <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                      px-3 py-1 text-xs rounded-md shadow-md
                      bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                      transition-all duration-150">
                      Edit
                    </span>
                            </button>
                            <button
                              onClick={() => handleDelete(row)}
                              className="relative group w-7 h-7 flex items-center justify-center rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
                            >
                              <Trash2
                                size={14}
                                className="text-red-600 dark:text-red-500"
                              />
                              <span className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                      px-3 py-1 text-xs rounded-md shadow-md
                      bg-gray-100 dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                      transition-all duration-150">
                      Delete
                    </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center h-full mt-4 bg-gray-100 dark:bg-transparent p-4 rounded gap-x-4">
          <div className="text-sm text-black dark:text-white">
            Page{" "}
            <span className="text-[#08994A] dark:text-[#0EFF7B]">
              {currentPage}
            </span>{" "}
            of {totalPages} ({(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} from{" "}
            {filteredData.length}{" "}
            {activeTab === "Dispatch Log"
              ? "Dispatches"
              : activeTab === "Trip Log"
              ? "Trips"
              : "Units"}
            )
          </div>
          <div className="flex items-center gap-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
                currentPage === 1
                  ? "bg-[#0EFF7B1A] opacity-50"
                  : "bg-[#0EFF7B] hover:bg-[#0EFF7B1A]"
              }`}
            >
              <ChevronLeft
                size={12}
                className="text-[#08994A] dark:text-white"
              />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`w-5 h-5 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] ${
                currentPage === totalPages
                  ? "bg-[#0EFF7B1A] opacity-50"
                  : "bg-[#0EFF7B] hover:bg-[#0EFF7B1A]"
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

      {/* MODALS */}
      <EditDispatchModal
        isOpen={editDispatchOpen}
        onClose={() => {
          setEditDispatchOpen(false);
          setEditingDispatch(null);
        }}
        dispatch={editingDispatch}
        onSave={saveDispatch}
        units={units}
      />

      <EditTripModal
        isOpen={editTripOpen}
        onClose={() => {
          setEditTripOpen(false);
          setEditingTrip(null);
        }}
        trip={editingTrip}
        onSave={saveTrip}
        units={units}
        dispatches={dispatchData}
        patients={patientList}
        existingTrips={tripData}
      />

      <AmbulanceUnitsModal
        isOpen={editUnitOpen}
        onClose={() => {
          setEditUnitOpen(false);
          setEditingUnit(null);
        }}
        unit={editingUnit}
        onSave={saveUnit}
      />

      {/* Delete Confirmation */}
      {isDeleteOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]">
            <div className="w-[400px] bg-gray-100 dark:bg-[#000000E5] rounded-[19px] p-6 relative">
              {/* Border Glow */}
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

              <div className="relative z-10">
                {/* TITLE + CLOSE BUTTON */}
                <div className="flex justify-between items-center mb-4">
                  <h2
                    className="text-black dark:text-white font-medium text-[16px]"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    {selectedItem
                      ? "Confirm Deletion"
                      : "Confirm Bulk Deletion"}
                  </h2>

                  <button
                    onClick={() => setIsDeleteOpen(false)}
                    className="w-6 h-6 rounded-full border border-[#0EFF7B1A] dark:border-[#0EFF7B1A] 
                      bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-[#08994A] dark:text-white"
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        d="M18 6L6 18M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* MESSAGE */}
                <p
                  className="text-sm text-black dark:text-white mb-6 text-center"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  {selectedItem ? (
                    <>
                      Are you sure you want to delete{" "}
                      <span className="font-semibold text-[#08994A] dark:text-[#0EFF7B]">
                        {selectedItem.trip_id ||
                          selectedItem.dispatch_id ||
                          selectedItem.unit_number}
                      </span>
                      ?<br />
                      This action cannot be undone.
                    </>
                  ) : (
                    <>
                      Are you sure you want to delete{" "}
                      <span className="font-semibold text-[#08994A] dark:text-[#0EFF7B]">
                        {selectedRows.size} selected items
                      </span>
                      ?<br />
                      This action cannot be undone.
                    </>
                  )}
                </p>

                {/* BUTTONS */}
                <div className="flex justify-center gap-4">
                  {/* Cancel */}
                  <button
                    onClick={() => setIsDeleteOpen(false)}
                    className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#3C3C3C] 
                      text-white font-medium text-[14px] shadow-[0_2px_12px_0px_#00000040] 
                      bg-black dark:bg-transparent hover:bg-gray-800 dark:hover:bg-[#3A3A3A] transition"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    Cancel
                  </button>

                  {/* Delete */}
                  <button
                    onClick={confirmDelete}
                    className="w-[144px] h-[32px] rounded-[8px] px-3 py-2 flex items-center justify-center 
                      bg-gradient-to-r from-[#FF4D4D] to-[#B30000] 
                      text-white font-medium text-[14px] hover:scale-105 transition 
                      shadow-[0_2px_12px_0px_#00000040]"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  >
                    Delete {selectedItem ? "" : `(${selectedRows.size})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbulanceManagement;