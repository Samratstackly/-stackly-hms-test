import { useState, useEffect, useRef } from "react";
import { Building2, Shield, Save, RefreshCw, ChevronRight } from "lucide-react";
import HospitalInfo from "./HospitalInfo";
import SecuritySettings from "./SecuritySettings";
import api from "../../utils/axiosConfig";
import { successToast, errorToast } from "../../components/Toast.jsx";

const menuItems = [
  {
    id: "hospital",
    label: "Hospital Information",
    icon: Building2,
    component: HospitalInfo,
  },
  {
    id: "security",
    label: "Security Settings",
    icon: Shield,
    component: SecuritySettings,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("hospital");
  const [settingsData, setSettingsData] = useState({
    hospital: {},
    security: {},
  });
  const [initialData, setInitialData] = useState({
    hospital: {},
    security: {},
  });
  const [loading, setLoading] = useState(true);
  const [saveAllLoading, setSaveAllLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(true);
  
  // Reference to HospitalInfo component to access validation methods
  const hospitalInfoRef = useRef();

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/all");
      console.log("Settings data received:", response.data);
      
      const hospitalData = response.data.hospital || {};
      const securityData = response.data.security || {};
      
      setSettingsData({
        hospital: hospitalData,
        security: securityData,
      });
      
      // Store initial data for comparison
      setInitialData({
        hospital: hospitalData,
        security: securityData,
      });
      
      // Reset dirty state
      setIsDirty(false);
      setIsValid(true);
      
    } catch (error) {
      console.error("Error fetching settings:", error);
      errorToast("Failed to load settings. Please try again.");

      // Set default data if API fails
      const defaultData = { hospital: {}, security: {} };
      setSettingsData(defaultData);
      setInitialData(defaultData);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    // Check if form is valid before saving
    if (!isValid) {
      errorToast("Please fix all validation errors before saving");
      return;
    }

    // Check if there are actual changes
    if (JSON.stringify(settingsData.hospital) === JSON.stringify(initialData.hospital)) {
      errorToast("No changes to save");
      return;
    }

    try {
      setSaveAllLoading(true);

      // Save hospital info
      if (settingsData.hospital && Object.keys(settingsData.hospital).length > 0) {
        const hospitalUpdate = {
          hospital_name: settingsData.hospital.hospital_name || "",
          address: settingsData.hospital.address || "",
          phone: settingsData.hospital.phone || "",
          email: settingsData.hospital.email || "",
          gstin: settingsData.hospital.gstin || "",
          emergency_contact: settingsData.hospital.emergency_contact || "",
          website: settingsData.hospital.website || "",
          tagline: settingsData.hospital.tagline || "",
          established_year: settingsData.hospital.established_year || null,
          registration_number: settingsData.hospital.registration_number || "",
          working_hours: settingsData.hospital.working_hours || {},
        };

        console.log("Saving hospital data:", hospitalUpdate);
        await api.put("/hospital", hospitalUpdate);
        
        successToast("Settings saved successfully!");
        
        // Update initial data with saved data
        setInitialData(prev => ({
          ...prev,
          hospital: settingsData.hospital
        }));
        
        // Reset dirty state
        setIsDirty(false);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      errorToast("Failed to save settings. Please try again.");
    } finally {
      setSaveAllLoading(false);
    }
  };

  const updateSettings = (type, data) => {
    setSettingsData((prev) => ({
      ...prev,
      [type]: data, // Use data directly as it's the complete updated object
    }));
  };

  const handleFormChange = (dirty, valid) => {
    setIsDirty(dirty);
    setIsValid(valid);
  };

  const ActiveComponent = menuItems.find(
    (item) => item.id === activeTab,
  )?.component;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] p-4">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-20 bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-200 dark:border-[#1E1E1E] mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-[#0EFF7B] to-[#08994A] text-white shadow-[0px_2px_8px_0px_#0EFF7B40]"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1A1A1A]"
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={fetchAllSettings}
              className="flex items-center gap-1 p-2 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] rounded-lg transition-colors"
              title="Refresh settings"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <span className="text-[#0EFF7B]">
              Version - {import.meta.env.VITE_APP_VERSION}
            </span>
            <ChevronRight size={16} />
            <span>Settings</span>
            <ChevronRight size={16} />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {menuItems.find((item) => item.id === activeTab)?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Summary - Show when form is invalid and dirty */}
      {activeTab === "hospital" && !isValid && isDirty && (
        <div className="max-w-6xl mx-auto mb-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">
              ⚠️ Please fix all validation errors before saving
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-200 dark:border-[#1E1E1E] p-6 mb-6">
          {ActiveComponent && (
            <>
              {activeTab === "hospital" ? (
                <HospitalInfo
                  ref={hospitalInfoRef}
                  data={settingsData[activeTab] || {}}
                  onUpdate={(data) => updateSettings(activeTab, data)}
                  onFormChange={handleFormChange}
                  isDirty={isDirty}
                />
              ) : (
                <ActiveComponent
                  data={settingsData[activeTab] || {}}
                  onUpdate={(data) => updateSettings(activeTab, data)}
                />
              )}
            </>
          )}
        </div>

        {/* Save Button - Only show for hospital tab */}
        {activeTab === "hospital" && (
          <div className="flex justify-end">
            <button
  onClick={handleSaveAll}
  disabled={!isDirty || !isValid || saveAllLoading || loading}
  className={`flex items-center gap-2 px-6 py-3 rounded-xl 
    font-medium
    transition-all duration-200
    ${
      !isDirty || !isValid || saveAllLoading || loading
        ? "bg-gradient-to-r from-[#0CD46B] to-[#067A46] text-white shadow-[0px_2px_8px_0px_rgba(12,212,107,0.35)] hover:shadow-[0px_4px_14px_0px_rgba(12,212,107,0.55)] opacity-80 cursor-not-allowed"
        : "bg-gradient-to-r from-[#0CD46B] to-[#067A46] text-white shadow-[0px_2px_8px_0px_rgba(12,212,107,0.35)] hover:shadow-[0px_4px_14px_0px_rgba(12,212,107,0.55)] active:scale-95"
    }`}
>
  <Save size={20} />
  <span>
    {saveAllLoading ? "Saving..." : "Save All Changes"}
  </span>
</button>
          </div>
        )}
      </div>
    </div>
  );
}