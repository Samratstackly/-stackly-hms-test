import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import api from "../../utils/axiosConfig";
import { PermissionContext } from "../../components/PermissionContext";

const SecuritySettings = ({ data, onUpdate }) => {
  const { currentUser, hasPermission, refreshPermissions } =
    useContext(PermissionContext);

  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [initialized, setInitialized] = useState(false);


  // In SecuritySettings.jsx, update the modules array:

const modules = [
  { key: "dashboard", label: "View Dashboard" },
  { key: "appointments", label: "Manage Appointments" },
  { key: "patients_view", label: "View Patients" },
  { key: "patients_create", label: "Create Patients" },
  { key: "patients_edit", label: "Edit Patients" },
  { key: "patients_profile", label: "Patient Profile" },
  { key: "treatment_charges", label: "Treatment Charges" },  // ADD THIS
  { key: "charges_management", label: "Charges Management" },  // ADD THIS
  { key: "surgeries", label: "Surgeries" },  // ADD THIS
  { key: "departments", label: "Manage Departments" },
  { key: "room_management", label: "Room Management" },
  { key: "bed_management", label: "Bed Management" },
  //{ key: "staff_management", label: "Staff Management" },
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
      setInitialized(true);
    } catch (error) {
      toast.error("Failed to load security settings");
    }
  };

  const fetchRoles = async () => {
    const availableRoles = [
      "receptionist",
      "doctor",
      "nurse",
      "Billing Staff",
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
        },
      );

      setPermissions((prev) => ({
        ...prev,
        [role]: { ...prev[role], [moduleKey]: response.data.enabled },
      }));

      refreshPermissions?.();
      toast.success(
        `${
          response.data.enabled ? "Enabled" : "Disabled"
        } ${moduleKey} for ${role}`,
      );
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to update permission",
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
    if (role === "Billing Staff") return "Billing Staff";
    if (role === "staff") return "Staff";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
    <div className="flex flex-col">
      {/* Access & Permissions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
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

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-[#1E1E1E]">
          <table className="min-w-full bg-white dark:bg-[#111111]">
            <thead className="bg-gray-50 dark:bg-[#1A1A1A]">
              <tr className="text-black dark:text-[#0EFF7B]">
                <th className="p-4 text-left font-medium">Modules</th>
                {roles.map((role) => (
                  <th key={role} className="p-4 text-center font-medium">
                    {formatRoleName(role)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map(({ key, label }) => (
                <tr
                  key={key}
                  className="border-t border-gray-200 dark:border-[#1E1E1E] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors"
                >
                  <td className="p-4 text-gray-800 dark:text-gray-200">
                    {label}
                  </td>
                  {roles.map((role) => (
                    <td key={role} className="p-4 text-center">
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

        {/* Permission Summary */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg">
          <h4 className="font-medium text-gray-800 dark:text-white mb-3">
            Permission Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {roles.map((role) => {
              const enabledCount = modules.filter(
                (m) => permissions[role]?.[m.key],
              ).length;
              return (
                <div key={role} className="text-center">
                  <div className="font-medium text-[#08994A] dark:text-[#0EFF7B]">
                    {formatRoleName(role)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
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

export default SecuritySettings;
