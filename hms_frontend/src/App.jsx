import React, { useRef, useState, useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, ThemeContext } from "./components/ThemeContext.jsx";
import Sidebar from "./components/LeftSideBar.jsx";
import Header from "./components/Header.jsx";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NotFound from "./pages/NotFound.jsx";

import Login from "./pages/Login.jsx";
import { ToastProvider } from "./components/Toast.jsx";

// Pages
import DashboardComponents from "./pages/Home/DashboardComponents.jsx";
import Profile from "./pages/Home/Profile.jsx";
import AppointmentList from "./pages/Appointments/appointments_list.jsx";
import AppointmentCalendar from "./pages/Appointments/Calender.jsx";

import NewRegistration from "./pages/Patients/new-registration";
import IpdOpd from "./pages/Patients/ipd-opd.jsx";
import PatientProfile from "./pages/Patients/PatientProfile.jsx";
import ViewPatientProfile from "./pages/Patients/ViewPatientProfile.jsx";
import AppointmentListOPD from "./pages/Patients/OutPatientList.jsx";
import DepartmentList from "./pages/Administration/DepartmentList.jsx";
import RoomManagement from "./pages/Administration/RoomManagement.jsx";
import BedList from "./pages/Administration/BedList.jsx";
import StaffManagement from "./pages/Administration/Staff/StafManagement.jsx";
import SurgicalDept from "./pages/Administration/Staff/SurgicalDept.jsx";
import SupportiveDept from "./pages/Administration/Staff/SupportiveDept.jsx";
import AdministrativeDept from "./pages/Administration/Staff/AdministrativeDept.jsx";
import StockInventory from "./pages/Pharmacy/Stock-Inventory.jsx";
import PharmacyBill from "./pages/Pharmacy/Bill.jsx";
import AddDoctorNurse from "./pages/Doctor/AddDoctorNurse.jsx";
import DoctorNurseProfile from "./pages/Doctor/DoctorNurseProfile.jsx";
import ViewProfile from "./pages/Doctor/ViewProfiles.jsx";
import MedicineAllocation from "./pages/Doctor/MedicineAllocation.jsx";
import LaboratoryReports from "./pages/Clinical_Resources/Laboratory/LabReport.jsx";
import Laboratory from "./pages/Clinical_Resources/Laboratory/Laboratory.jsx";
import BloodBank from "./pages/Clinical_Resources/ClinicalReport/BloodBank/BloodBank.jsx";
import Billing from "./pages/Billing/Billing.jsx";
import BillingPreview from "./pages/Billing/BillingPreview.jsx";
import Ambulance from "./pages/Clinical_Resources/EmergencyService/AmbulanceManagement.jsx";
import UserSettings from "./pages/Accounts/UserSettings.jsx";
import Security from "./pages/Accounts/SecuritySettingsPage.jsx";
import GlobalBackgroundText from "./components/GlobalBackgroundText.jsx";
import SettingsPage from "./pages/settings/SettingsPage";
import ChargesManagement from "./pages/Patients/ChargesManagement.jsx";

import { WebSocketProvider } from "./components/WebSocketContext";
import {
  PermissionProvider,
  PermissionContext,
} from "./components/PermissionContext";
import TreatmentCharges from "./pages/Patients/TreatmentCharges.jsx";
import SurgeryList from "./pages/Patients/SurgeryList.jsx";
import { UserProvider } from "./contexts/UserContext";
import { HospitalProvider } from "./components/HospitalContext.jsx";

// -------------------- Cookie Helper Functions --------------------
const getCookie = (name) => {
  try {
    const cookies = document.cookie;

    const cookieArray = cookies.split(";");

    for (let cookie of cookieArray) {
      const trimmedCookie = cookie.trim();

      if (trimmedCookie.startsWith(`${name}=`)) {
        const value = trimmedCookie.substring(name.length + 1);
        return value;
      }
    }

    return null;
  } catch (error) {
    console.error("Error reading cookie:", error);
    return null;
  }
};

// -------------------- Permission Gate for Access Denied --------------------
const PermissionGate = ({ moduleKey, children }) => {
  const { hasPermission } = useContext(PermissionContext);
  const navigate = useNavigate();

  if (!hasPermission(moduleKey)) {
    return (
      <div className="mt-[80px] mb-4 bg-gray-100 dark:bg-black text-black dark:text-white rounded-xl p-8 w-full max-w-[1400px] mx-auto flex flex-col items-center justify-center min-h-[600px]">
        {/* <div className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-red-500">
            Access Denied
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            You do not have permission to access this module.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3 bg-[#08994A] text-white rounded-full hover:bg-[#0cd968] transition text-lg font-medium"
          >
            Go to Profile
          </button>
        </div> */}
      </div>
    );
  }

  return children;
};

// -------------------- Dashboard Redirect Component --------------------
const DashboardRedirect = () => {
  const { hasPermission, currentUser, loading } = useContext(PermissionContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    console.log("📍 DashboardRedirect - Checking permissions...");
    console.log("📍 Current User:", currentUser);
    console.log("📍 Is Superuser:", currentUser?.is_superuser);
    console.log("📍 Role:", currentUser?.role);

    // If user is admin/superuser, stay on dashboard
    const isSuperuserOrAdmin =
      currentUser?.is_superuser === true ||
      currentUser?.role?.toLowerCase() === "admin";

    if (isSuperuserOrAdmin) {
      console.log(
        "✅ DashboardRedirect - Admin/Superuser detected, staying on dashboard",
      );
      return; // Stay on dashboard
    }

    // For regular users without dashboard permission, go to profile
    if (!hasPermission("dashboard")) {
      console.log(
        "⚠️ DashboardRedirect - No dashboard permission, redirecting to profile",
      );
      navigate("/dashboard", { replace: true });
      return;
    }

    // User has dashboard permission, stay on dashboard
    console.log(
      "✅ DashboardRedirect - User has dashboard permission, staying on dashboard",
    );
  }, [hasPermission, navigate, loading, currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-[#0EFF7B] rounded-full mx-auto mb-6"></div>
            <p className="text-white text-xl font-medium">
              Loading your workspace...
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Checking permissions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If we get here, show the actual dashboard
  return (
    <ProtectedRoute>
      <PermissionGate moduleKey="dashboard">
        <DashboardComponents />
      </PermissionGate>
    </ProtectedRoute>
  );
};

// -------------------- App Content --------------------
function AppContent({ contentRef }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  // Different layout for login page vs authenticated pages
  if (isLoginPage) {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${
          theme === "dark" ? "bg-black text-white" : "bg-gray-100 text-black"
        }`}
      >
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    );
  }

  // Authenticated layout
  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "bg-black text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Sidebar */}
      <GlobalBackgroundText isCollapsed={isCollapsed} />
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main content area with header and scrollable content */}
      <div className="flex flex-col flex-1">
        {/* Fixed Header */}
        <Header isCollapsed={isCollapsed} />

        {/* Scrollable main content */}
        <main
          ref={contentRef}
          className="flex-1 overflow-y-auto main-content-scrollbar"
          style={{
            marginTop: "72px", // Height of header
            marginLeft: isCollapsed ? "100px" : "240px",
            height: "calc(100vh - 72px)",
            width: `calc(100vw - ${isCollapsed ? "100px" : "240px"})`,
          }}
        >
          <div className="p-4 min-h-full">
            <Routes>
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard - with redirect logic */}
              <Route path="/dashboard" element={<DashboardRedirect />} />

              {/* Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Appointments */}
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="appointments">
                      <AppointmentList />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/calendar"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="appointments">
                      <AppointmentCalendar />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />

              {/* Patients */}
              <Route
                path="/patients/new-registration"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="patients_create">
                      <NewRegistration />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients/ipd-opd"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="patients_view">
                      <IpdOpd />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients/out-patients"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="patients_view">
                      <AppointmentListOPD />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients/profile"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="patients_profile">
                      <PatientProfile />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients/profile/:patient_id"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="patients_profile">
                      <ViewPatientProfile />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients/treatment-charges"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="treatment_charges">
                      <TreatmentCharges />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
             
              <Route
                path="/patients/surgeries"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="surgeries">
                      <SurgeryList />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />

              {/* Administration */}
              <Route
                path="/Administration/Departments"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="departments">
                      <DepartmentList />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Administration/RoomManagement"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="room_management">
                      <RoomManagement />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Administration/BedList"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="bed_management">
                      <BedList />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Administration/StaffManagement"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="staff_management">
                      <StaffManagement />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Administration/StaffManagement/surgical"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="staff_management">
                      <SurgicalDept />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Administration/StaffManagement/supportive"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="staff_management">
                      <SupportiveDept />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Administration/StaffManagement/administrative"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="staff_management">
                      <AdministrativeDept />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />

              {/* Pharmacy */}
              <Route
                path="/Pharmacy/Stock-Inventory"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="pharmacy_inventory">
                      <StockInventory />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Pharmacy/Bill"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="pharmacy_billing">
                      <PharmacyBill />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />

              {/* Doctors / Nurse */}
              <Route
                path="/Doctors-Nurse/AddDoctorNurse"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="doctors_manage">
                      <AddDoctorNurse />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Doctors-Nurse/DoctorNurseProfile"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="doctors_manage">
                      <DoctorNurseProfile />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Doctors-Nurse/ViewProfile"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="doctors_manage">
                      <ViewProfile />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Doctors-Nurse/MedicineAllocation"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="medicine_allocation">
                      <MedicineAllocation />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />

              {/* Clinical Resources */}
              <Route
                path="/ClinicalResources/Laboratory/LaboratoryReports"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="lab_reports">
                      <LaboratoryReports />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ClinicalResources/ClinicalReports/BloodBank"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="blood_bank">
                      <BloodBank />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ClinicalResources/EmergencyServices/Ambulance"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="ambulance">
                      <Ambulance />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ClinicalResources/Laboratory/Laboratory"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="laboratory_manage">
                      <Laboratory />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />

              {/* Billing */}
              <Route
                path="/billing-page"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="billing">
                      <Billing />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
               <Route
                path="/billing/charges-management"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="charges-management">
                      <ChargesManagement />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/BillingPreview"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="billing">
                      <BillingPreview />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />

              {/* Accounts */}
              <Route
                path="/UserSettings"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="user_settings">
                      <UserSettings />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />

              {/* Security Settings */}
              <Route
                path="/security"
                element={
                  <ProtectedRoute>
                    <Security />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="settings_access">
                      <SettingsPage />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/hospital"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="settings_hospital">
                      <SettingsPage />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/security"
                element={
                  <ProtectedRoute>
                    <PermissionGate moduleKey="settings_security">
                      <SettingsPage />
                    </PermissionGate>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const contentRef = useRef(null);

  return (
    <ThemeProvider>
      <PermissionProvider>
        <WebSocketProvider>
          <UserProvider>
            <HospitalProvider>
              <ToastProvider />
              <Router>
                <ScrollToTop contentRef={contentRef} />
                <AppContent contentRef={contentRef} />
              </Router>
            </HospitalProvider>
          </UserProvider>
        </WebSocketProvider>
      </PermissionProvider>
    </ThemeProvider>
  );
}
