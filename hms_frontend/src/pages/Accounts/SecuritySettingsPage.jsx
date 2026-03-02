import React, { useState, useEffect, useContext } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/axiosConfig";
import { PermissionContext } from "../../components/PermissionContext";

const SecuritySettingsPage = () => {
  const navigate = useNavigate();
  const { currentUser, hasPermission, refreshPermissions } =
    useContext(PermissionContext);

  const [saveLogs, setSaveLogs] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [initialized, setInitialized] = useState(false);

  const modules = [
    { key: "dashboard", label: "View Dashboard" },
    { key: "appointments", label: "Manage Appointments" },
    { key: "patients_view", label: "View Patients" },
    { key: "patients_create", label: "Create Patients" },
    { key: "patients_edit", label: "Edit Patients" },
    { key: "patients_profile", label: "Patient Profile" },
    { key: "departments", label: "Manage Departments" },
    { key: "room_management", label: "Room Management" },
    { key: "bed_management", label: "Bed Management" },
    { key: "staff_management", label: "Staff Management" },
    { key: "pharmacy_inventory", label: "Pharmacy Inventory" },
    { key: "pharmacy_billing", label: "Pharmacy Billing" },
    { key: "doctors_manage", label: "Manage Doctors/Nurses" },
    { key: "medicine_allocation", label: "Medicine Allocation" },
    { key: "lab_reports", label: "Laboratory Reports" },
    { key: "blood_bank", label: "Blood Bank" },
    { key: "ambulance", label: "Ambulance Management" },
    { key: "billing", label: "Billing Management" },
    { key: "user_settings", label: "User Settings" },
    { key: "security_settings", label: "Security Settings" },
    { key: "create_user", label: "Create User Accounts" },
  ];

  const canEdit =
    hasPermission("security_settings") ||
    currentUser?.role?.toLowerCase() === "admin" ||
    currentUser?.is_superuser;

  useEffect(() => {
    if (!initialized) initializeData();
  }, [initialized]);

  const initializeData = async () => {
    try {
      await fetchRoles();
      await fetchAllPermissions();
      await fetchSecuritySettings();
      setInitialized(true);
    } catch (error) {
      toast.error("Failed to load security settings");
    }
  };

  const fetchSecuritySettings = async () => {
    try {
      const response = await api.get("/security/settings");
      setSaveLogs(response.data.save_logs || true);
      setTwoFactorAuth(response.data.two_factor_auth || false);
      setLoginAlerts(response.data.login_alerts || false);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRoles = async () => {
    // Removed "admin" from visible roles
    const availableRoles = [
      "receptionist",
      "doctor",
      "nurse",
      "billing",
      "staff",
    ];
    setRoles(availableRoles);
    return availableRoles;
  };

  const fetchAllPermissions = async () => {
    try {
      const allPermissions = {};
      const availableRoles = await fetchRoles();

      availableRoles.forEach((role) => {
        allPermissions[role] = {};
        modules.forEach((module) => (allPermissions[role][module.key] = false));
      });

      for (const role of availableRoles) {
        try {
          const response = await api.get(`/security/permissions/${role}`);
          response.data.forEach((perm) => {
            if (allPermissions[role]?.hasOwnProperty(perm.module)) {
              allPermissions[role][perm.module] = perm.enabled;
            }
          });
        } catch (error) {
          if (error.response?.status !== 404) console.error(error);
        }
      }

      setPermissions(allPermissions);
    } catch (error) {
      toast.error("Failed to load permissions");
    }
  };

  const togglePermission = async (role, moduleKey) => {
    if (!canEdit) {
      toast.info("You have read-only access to security settings.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("role", role);
      formData.append("module", moduleKey);

      const response = await api.post(
        "/security/permissions/toggle",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setPermissions((prev) => ({
        ...prev,
        [role]: { ...prev[role], [moduleKey]: response.data.enabled },
      }));

      refreshPermissions?.();
      toast.success(
        `${
          response.data.enabled ? "Enabled" : "Disabled"
        } ${moduleKey} for ${role}`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to update permission"
      );
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={onChange}
      disabled={disabled || !canEdit}
      className={`relative inline-flex border-[1px] border-gray-300 dark:border-[#0EFF7B4D] 
        w-[48px] h-[24px] items-center rounded-full transition shadow-[0px_0px_4px_0px_#0EFF7B]
        ${
          enabled
            ? "bg-[#0EFF7B] dark:bg-[#0EFF7B1A]"
            : "bg-gray-200 dark:bg-[#0D0D0D]"
        }
        ${
          disabled || !canEdit
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer"
        }`}
    >
      <span
        className={`inline-block h-[18px] w-[18px] transform rounded-full bg-gray-100 dark:bg-gray-100 transition 
          ${enabled ? "translate-x-[24px]" : "translate-x-[3px]"}`}
      />
    </button>
  );

  const formatRoleName = (role) => {
    if (role === "billing") return "Billing Staff";
    if (role === "staff") return "Staff";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (!initialized) {
    return (
      <div className="mt-[80px] mb-4 bg-gray-100 dark:bg-black text-black dark:text-white rounded-xl p-8 w-full max-w-[1400px] mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-[#0EFF7B]">
            Loading Security Settings...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" mb-4 bg-gray-100 dark:bg-black text-black dark:text-white rounded-xl p-4 w-full max-w-[1400px] mx-auto flex flex-col overflow-hidden relative">
      {/* Background gradients */}
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

      <div className="mt-4 mb-6">
        <button
          className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2 rounded-[8px] hover:bg-[#0EFF7B1A] border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66] dark:hover:bg-green-600 text-white text-sm md:text-base"
          onClick={() => navigate(-1)}
          style={{
            background:
              "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <div className="pb-4 mt-6 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-black dark:text-white">
            Access & Permissions
          </h3>
          {!canEdit && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Read-only view
            </p>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Manage role-based access with permission controls
        </p>

        <div className="min-w-[1000px] ml-2 rounded-[8px] overflow-x-auto">
          <table className="min-w-full bg-gray-100 dark:bg-[#0EFF7B1A] border-collapse text-center">
            <thead className="h-[62px]">
              <tr className="text-[18px] text-black dark:text-[#0EFF7B]">
                <th className="p-2">Modules</th>
                {roles.map((role) => (
                  <th key={role} className="p-2">
                    {formatRoleName(role)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map(({ key, label }) => (
                <tr
                  key={key}
                  className="h-[52px] border-b border-gray-300 dark:border-[#3C3C3C] bg-gray-100 dark:bg-black hover:bg-gray-100 dark:hover:bg-[#0EFF7B0D] transition"
                >
                  <td className="p-2 break-words text-black dark:text-white text-left pl-4">
                    {label}
                  </td>
                  {roles.map((role) => (
                    <td key={role} className="p-2">
                      <Toggle
                        enabled={permissions[role]?.[key] || false}
                        onChange={() => togglePermission(role, key)}
                        disabled={loading}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-[#1E1E1E] rounded-lg">
          <h4 className="font-medium text-black dark:text-white mb-2">
            Permission Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
            {roles.map((role) => {
              const enabledCount = modules.filter(
                (m) => permissions[role]?.[m.key]
              ).length;
              return (
                <div key={role} className="text-center">
                  <span className="font-medium text-[#08994A] dark:text-[#0EFF7B]">
                    {formatRoleName(role)}
                  </span>
                  <div className="text-gray-600 dark:text-gray-400">
                    {enabledCount} / {modules.length} enabled
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettingsPage;