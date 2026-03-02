// hms_frontend/src/components/PermissionGate.jsx
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PermissionContext } from "./PermissionContext";

const PermissionGate = ({ moduleKey, children, fallbackPath = "/dashboard" }) => {
  const { hasPermission } = useContext(PermissionContext);
  const navigate = useNavigate();

  if (!hasPermission(moduleKey)) {
    return (
      <div className="mt-[80px] mb-4 bg-white dark:bg-black text-black dark:text-white rounded-xl p-8 w-full max-w-[1400px] mx-auto flex flex-col items-center justify-center min-h-[600px]">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-red-500">
            Access Denied
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            You do not have permission to access this module.
          </p>
          <button
            onClick={() => navigate(fallbackPath)}
            className="px-8 py-3 bg-[#08994A] text-white rounded-full hover:bg-[#0cd968] transition text-lg font-medium"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default PermissionGate;