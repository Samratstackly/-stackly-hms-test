// // src/components/SearchMenu.ts
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
//   ReceiptText,
//   CreditCard,
//   Microscope,
//   BarChart3,
//   Activity,
//   Droplet,
//   HeartPulse,
//   Ambulance,
//   User,
//   ShieldCheck,
// } from "lucide-react";

// // Replicate the exact menu structure from Sidebar
// export const menuItems = [
//   { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
//   { name: "Appointments", path: "/appointments", icon: CalendarDays },

//   {
//     name: "Patients",
//     path: "/patients",
//     icon: Users,
//     dropdown: [
//       { name: "New Registration", path: "/patients/new-registration", icon: User },
//       {
//         name: "IPD / OPD Patient",
//         path: "/patients/ipd-opd",
//         paths: ["/patients/ipd-opd", "/patients/out-patients"],
//         icon: Bed,
//       },
//       {
//         name: "OPD Patient",
//         path: "/patients/out-patients",
//         paths: ["/patients/ipd-opd", "/patients/out-patients"],
//         icon: Bed,
//       },
//       {
//         name: "Patient Profile",
//         path: "/patients/profile",
//         paths: ["/patients/profile", "/patients/profile/details"],
//         icon: ClipboardList,
//       },
//     ],
//   },

//   {
//     name: "Administration",
//     path: "/Administration",
//     icon: Building2,
//     dropdown: [
//       { name: "Departments", path: "/Administration/Departments", icon: Building2 },
//       {
//         name: "Room Management",
//         path: "/Administration/RoomManagement",
//         paths: ["/Administration/roommanagement", "/Administration/BedList", "/Administration/RoomManagement"],
//         icon: Bed,
//       },
//       {
//         name: "BedList",
//         path: "/Administration/BedList",
//         icon: Bed,
//       },
//       { name: "Staff Management", path: "/Administration/StaffManagement", icon: UserCog },
//     ],
//   },

//   {
//     name: "Pharmacy",
//     path: "/Pharmacy",
//     icon: Pill,
//     dropdown: [
//       { name: "Stock & Inventory", path: "/Pharmacy/Stock-Inventory", icon: Boxes },
//       { name: "Bill", path: "/Pharmacy/Bill", icon: DollarSign },
//     ],
//   },

//   {
//     name: "Doctors / Nurse",
//     path: "/Doctors-Nurse",
//     icon: ShieldCheck,
//     dropdown: [
//       { name: "Add Doctor / Nurse", path: "/Doctors-Nurse/AddDoctorNurse", icon: User },
//       {
//         name: "Doctor / Nurse",
//         path: "/Doctors-Nurse/DoctorNurseProfile",
//         paths: ["/Doctors-Nurse/DoctorNurseProfile", "/Doctors-Nurse/ViewProfile"],
//         icon: Users,
//       },
//       { name: "MedicineAllocation", path: "/Doctors-Nurse/MedicineAllocation", icon: Pill },
//     ],
//   },

//   {
//     name: "Clinical Resources",
//     path: "/ClinicalResources",
//     icon: Microscope,
//     dropdown: [
//       { name: "Laboratory Reports", path: "/ClinicalResources/Laboratory/LaboratoryReports", icon: BarChart3 },
//       { name: "Blood Bank", path: "/ClinicalResources/ClinicalReports/BloodBank", icon: HeartPulse },
//       { name: "Donor", path: "/ClinicalResources/ClinicalReports/BloodBank", icon: HeartPulse },
//       { name: "Ambulance Management", path: "/ClinicalResources/EmergencyServices/Ambulance", icon: Ambulance },
//     ],
//   },

//   { name: "Billing", path: "/Billing", icon: DollarSign,
//     dropdown: [
//       { name: "Billing Preview", path: "/BillingPreview", icon: DollarSign},
      
//     ],
//    },

//   {
//     name: "Accounts",
//     path: "/UserSettings",
//     paths: ["/security", "/UserSettings"],
//     icon: UserCog,
//   },
//   {
//     name: "Settings",
//     path: "/security",
//     icon: UserCog,
//   },
// ];

// export type SearchResult = {
//   label: string;
//   path: string;
//   icon: React.ComponentType<any>;
//   depth: number;
// };

// export const searchMenu = (query: string): SearchResult[] => {
//   if (!query.trim()) return [];

//   const results: SearchResult[] = [];
//   const q = query.toLowerCase();

//   const walk = (items: typeof menuItems, depth: number, parentPath = "") => {
//     items.forEach((item) => {
//       const label = item.name.toLowerCase();

//       if (label.includes(q)) {
//         if (item.dropdown) {
//           // If top-level matches and has dropdown, add all sub-items
//           item.dropdown.forEach((sub) => {
//             results.push({
//               label: sub.name,
//               path: sub.path,
//               icon: sub.icon,
//               depth: depth + 1,
//             });
//           });
//         } else {
//           // Add top-level if no dropdown
//           results.push({
//             label: item.name,
//             path: item.path,
//             icon: item.icon,
//             depth,
//           });
//         }
//       } else {
//         // If top-level doesn't match, check sub-items for matches
//         if (item.dropdown) {
//           item.dropdown.forEach((sub) => {
//             const subLabel = sub.name.toLowerCase();
//             if (subLabel.includes(q)) {
//               results.push({
//                 label: sub.name,
//                 path: sub.path,
//                 icon: sub.icon,
//                 depth: depth + 1,
//               });
//             }
//           });
//         }
//       }
//     });
//   };

//   walk(menuItems, 0);
//   return results.slice(0, 10); // limit results
// };

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
  ReceiptText,
  CreditCard,
  Microscope,
  BarChart3,
  Activity,
  Droplet,
  HeartPulse,
  Ambulance,
  User,
  ShieldCheck,
  Calendar,
  Stethoscope,
  BadgeDollarSign,
} from "lucide-react";

// This is now just the raw menu structure – search logic moved to Header
export const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Appointments", path: "/appointments", icon: CalendarDays },
  {
    name: "Patients",
    path: "/patients/ipd-opd",
    icon: Users,
    dropdown: [
      { name: "New Registration", path: "/patients/new-registration", icon: User },
      {
        name: "IPD / OPD Patient",
        path: "/patients/ipd-opd",
        paths: ["/patients/ipd-opd", "/patients/out-patients"],
        icon: Bed,
      },
      {
        name: "OPD Patient",
        path: "/patients/out-patients",
        paths: ["/patients/ipd-opd", "/patients/out-patients"],
        icon: Bed,
      },
      {
        name: "Patient Profile",
        path: "/patients/profile",
        paths: ["/patients/profile", "/patients/profile/details"],
        icon: ClipboardList,
      },
       {
        name: "Charges Management",
        path: "/billing/charges-management",
        icon: BadgeDollarSign,
        permission: "charges_management",
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
    path: "/Administration/Departments",
    icon: Building2,
    dropdown: [
      { name: "Departments", path: "/Administration/Departments", icon: Building2 },
      {
        name: "Room Management",
        path: "/Administration/RoomManagement",
        paths: ["/Administration/roommanagement", "/Administration/BedList", "/Administration/RoomManagement"],
        icon: Bed,
      },
      {
        name: "BedList",
        path: "/Administration/BedList",
        icon: Bed,
      },
      { name: "Staff Management", path: "/Administration/StaffManagement", icon: UserCog },
    ],
  },
  {
    name: "Pharmacy",
    path: "/Pharmacy/Stock-Inventory",
    icon: Pill,
    dropdown: [
      { name: "Stock & Inventory", path: "/Pharmacy/Stock-Inventory", icon: Boxes },
      { name: "Bill", path: "/Pharmacy/Bill", icon: DollarSign },
    ],
  },
  {
    name: "Doctors / Nurse",
    path: "/Doctors-Nurse/AddDoctorNurse",
    icon: ShieldCheck,
    dropdown: [
      { name: "Add Doctor / Nurse", path: "/Doctors-Nurse/AddDoctorNurse", icon: User },
      {
        name: "Doctor / Nurse",
        path: "/Doctors-Nurse/DoctorNurseProfile",
        paths: ["/Doctors-Nurse/DoctorNurseProfile", "/Doctors-Nurse/ViewProfile"],
        icon: Users,
      },
      { name: "MedicineAllocation", path: "/Doctors-Nurse/MedicineAllocation", icon: Pill },
      {
        name:"Appointment Calendar", path:"appointments/calendar",icon:Calendar,
      }
    ],
  },
  {
    name: "Clinical Resources",
    path: "/ClinicalResources/Laboratory/LaboratoryReports",
    icon: Microscope,
    dropdown: [
      { name: "Laboratory Reports", path: "/ClinicalResources/Laboratory/LaboratoryReports", icon: BarChart3 },
      { name: "Blood Bank", path: "/ClinicalResources/ClinicalReports/BloodBank", icon: HeartPulse },
      { name: "Donor", path: "/ClinicalResources/ClinicalReports/BloodBank", icon: HeartPulse },
      { name: "Ambulance Management", path: "/ClinicalResources/EmergencyServices/Ambulance", icon: Ambulance },
    ],
  },
  {
    name: "Billing",
    path: "/Billing",
    icon: DollarSign,
    dropdown: [
      { name: "Billing Preview", path: "/BillingPreview", icon: DollarSign },
    ],
  },
  {
    name: "Accounts",
    path: "/UserSettings",
    paths: ["/security", "/UserSettings"],
    icon: UserCog,
  },
  {
    name: "Settings",
    path: "/security",
    icon: UserCog,
  },
];