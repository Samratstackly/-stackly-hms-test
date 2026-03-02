//src/contexts/UserContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import api from "../utils/axiosConfig";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const EMPTY_USER = {
  full_name: "",
  designation: "",
  profile_picture: null,
  email: "",
  phone: "",
  department: "",
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(EMPTY_USER);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     BroadcastChannel – create ONCE (very important)
  ===================================================== */
  const broadcastChannelRef = useRef(null);

  if (!broadcastChannelRef.current) {
    broadcastChannelRef.current = new BroadcastChannel("user_data_channel");
  }

  const broadcastChannel = broadcastChannelRef.current;

  /* =====================================================
     Cookie helpers
  ===================================================== */
  const setCookie = (name, value, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; expires=${expires}; path=/; SameSite=Strict`;
  };

  const getCookie = (name) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  };

  /* =====================================================
     Fetch user data (NO broadcasting here)
  ===================================================== */
  const fetchUserData = async () => {
    try {
      console.log("🔍 Fetching user data from API...");
      const response = await api.get("/profile/me/");

      const profile = response.data?.profile || {};

      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

      let profilePic = profile.profile_picture || null;

      // Rebuild only if backend sends relative path
      if (profilePic && !profilePic.startsWith("http")) {
        const cleanedPath = profilePic.startsWith("/")
          ? profilePic
          : `/${profilePic}`;
        profilePic = `${API_BASE}${cleanedPath}`;
      }

      const user = {
        full_name: profile.full_name || "",
        designation: profile.designation || "",
        profile_picture: profilePic,
        email: profile.email || "",
        phone: profile.phone || "",
        department: profile.department || "",
      };

      console.log("✅ User data fetched:", user);

      setUserData(user);
      setCookie("userData", JSON.stringify(user));

      return user;
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     Update user data (THIS is where broadcast is allowed)
  ===================================================== */
  const updateUserData = (newData) => {
    setUserData((prev) => {
      const updated = { ...prev, ...newData };
      setCookie("userData", JSON.stringify(updated));
      return updated;
    });

    // Notify other tabs ONLY
    broadcastChannel.postMessage({ type: "userDataUpdated" });
  };

  /* =====================================================
     Initial setup
  ===================================================== */
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath === "/" || currentPath === "/login";

    if (isLoginPage) {
      setUserData(EMPTY_USER);
      setLoading(false);
      return;
    }

    // Load from cookie first (instant UI)
    const cookieData = getCookie("userData");
    if (cookieData) {
      try {
        setUserData(JSON.parse(cookieData));
        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to parse cookie userData");
      }
    }

    // Then refresh from API once
    fetchUserData();

    // Listen for updates from OTHER tabs
    const handleBroadcast = (event) => {
      if (event.data?.type === "userDataUpdated") {
        console.log("🔄 User data updated in another tab");
        fetchUserData();
      }
    };

    broadcastChannel.addEventListener("message", handleBroadcast);

    return () => {
      broadcastChannel.removeEventListener("message", handleBroadcast);
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        userData,
        loading,
        fetchUserData,
        updateUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
