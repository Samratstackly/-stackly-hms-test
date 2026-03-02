import React, { useState, useCallback } from "react";
import { X, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Listbox } from "@headlessui/react";

function PasswordInput({
  label,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  error,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-black dark:text-white">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-[30px] px-3 pr-10 rounded-[8px] border ${
            error
              ? "border-red-500 dark:border-red-500"
              : "border-gray-300 dark:border-[#3A3A3A]"
          } bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none placeholder-gray-400 dark:placeholder-gray-500`}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-[#08994A] dark:hover:text-[#0EFF7B]"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

const EditUserPopup = ({ user, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState({
    username: user.username || "",
    role: user.role || "Select Role",
    newPassword: "",
    confirmPassword: "",
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // ← Added "Nurse" here
  const roleOptions = [
    "Select Role",
    "Doctor",
    "Staff",
    "Receptionist",
    "Nurse",
    "Admin",
  ];

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!editedUser.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (editedUser.role === "Select Role") {
      newErrors.role = "Role is required";
    }

    if (editedUser.newPassword && editedUser.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (editedUser.newPassword !== editedUser.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [editedUser]);

  const handleSave = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    onSave({
      ...user,
      username: editedUser.username,
      role: editedUser.role,
      newPassword: editedUser.newPassword || undefined,
      confirmPassword: editedUser.confirmPassword || undefined,
    });
  }, [validateForm, onSave, user, editedUser]);

  const handleInputChange = useCallback((field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const handleUsernameChange = useCallback((e) => {
    const value = e.target.value;
    setEditedUser((prev) => ({ ...prev, username: value }));
    setErrors((prev) => ({ ...prev, username: "" }));
  }, []);

  const handleNewPasswordChange = useCallback((e) => {
    const value = e.target.value;
    setEditedUser((prev) => ({ ...prev, newPassword: value }));
    setErrors((prev) => ({ ...prev, newPassword: "" }));
  }, []);

  const handleConfirmPasswordChange = useCallback((e) => {
    const value = e.target.value;
    setEditedUser((prev) => ({ ...prev, confirmPassword: value }));
    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
  }, []);

  const Dropdown = ({ label, value, onChange, options, error }) => (
    <div>
      <label className="block text-sm font-medium mb-2 text-black dark:text-white">
        {label} <span className="text-red-500">*</span>
      </label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1 w-full">
          <Listbox.Button
            className={`w-full h-[30px] px-3 pr-8 rounded-[8px] border ${
              error
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-[#3A3A3A]"
            } bg-gray-100 dark:bg-black text-[#08994A] dark:text-[#0EFF7B] text-left text-[14px] leading-[16px]`}
          >
            {value}
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]" />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 w-full max-h-[180px] overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-gray-300 dark:border-[#3A3A3C]">
            {options.map((option, idx) => (
              <Listbox.Option
                key={idx}
                value={option}
                className={({ active }) =>
                  `cursor-pointer select-none py-2 px-2 text-sm rounded-md ${
                    active
                      ? "bg-[#08994A33] dark:bg-[#0EFF7B33] text-[#08994A] dark:text-[#0EFF7B]"
                      : "text-[#08994A] dark:text-[#0EFF7B]"
                  }`
                }
              >
                {option}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica]">
      <div className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F] bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70 dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]">
        <div className="w-[505px] h-auto rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-5 relative">
          <div className="flex justify-between items-center pb-2 mb-3">
            <h2 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
              Edit User
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#0EFF7B33] transition"
            >
              <X size={16} className="text-black dark:text-white" />
            </button>
          </div>

          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Column 1 */}
            <div className="space-y-4">
              {/* Name (Read-only) */}
              <div>
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                  Name
                </label>
                <div className="w-full h-[30px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 text-[14px] leading-[30px]">
                  {user.name}
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editedUser.username}
                  onChange={handleUsernameChange}
                  className={`w-full h-[30px] px-3 rounded-[8px] border ${
                    errors.username
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-[#3A3A3A]"
                  } bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] outline-none`}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              {/* Staff ID (Read-only) */}
              <div>
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                  Staff ID
                </label>
                <div className="w-full h-[30px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 text-[14px] leading-[30px]">
                  {user.id}
                </div>
              </div>

              {/* Role Dropdown - Now includes Nurse */}
              <Dropdown
                label="Role"
                value={editedUser.role}
                onChange={(val) => handleInputChange("role", val)}
                options={roleOptions}
                error={errors.role}
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-3 text-black dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Change Password (Optional)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <PasswordInput
                label="New Password"
                value={editedUser.newPassword}
                onChange={handleNewPasswordChange}
                showPassword={showNewPassword}
                onToggleVisibility={() => setShowNewPassword((prev) => !prev)}
                error={errors.newPassword}
                placeholder="Enter new password"
              />
              <PasswordInput
                label="Confirm Password"
                value={editedUser.confirmPassword}
                onChange={handleConfirmPasswordChange}
                showPassword={showConfirmPassword}
                onToggleVisibility={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                error={errors.confirmPassword}
                placeholder="Confirm new password"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Leave password fields empty if you don't want to change the
              password
            </p>
          </div>

          {/* Department (Read-only) */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-black dark:text-white">
              Department
            </label>
            <div className="w-full h-[30px] px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 text-[14px] leading-[30px]">
              {user.department}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[14px] leading-[16px] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserPopup;