// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
//   useRef,
// } from "react";
// import api from "../utils/axiosConfig";

// /* =====================================================
//    CONTEXT
// ===================================================== */
// const WebSocketContext = createContext(null);

// export const useWebSocket = () => {
//   const ctx = useContext(WebSocketContext);
//   if (!ctx) {
//     throw new Error("useWebSocket must be used within WebSocketProvider");
//   }
//   return ctx;
// };

// /* =====================================================
//    PROVIDER
// ===================================================== */
// export const WebSocketProvider = ({ children }) => {
//   const socketRef = useRef(null);
//   const isConnectingRef = useRef(false);
//   const reconnectTimerRef = useRef(null);
//   const heartbeatRef = useRef(null);
//   const lastMessageRef = useRef(null);

//   const [isConnected, setIsConnected] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);

//   const MAX_RETRIES = 5;
//   const HEARTBEAT_INTERVAL = 30000;
//   const PATH_POLL_INTERVAL = 100; // Poll every 100ms for path changes

//   /* =====================================================
//      AUTH CHECK (COOKIE BASED)
//   ===================================================== */
//   const isAuthenticated = async () => {
//     try {
//       await api.get("/profile/me");
//       return true;
//     } catch {
//       return false;
//     }
//   };

//   /* =====================================================
//      BUILD WS URL
//   ===================================================== */
//   const getWebSocketUrl = () => {
//     const API_BASE = import.meta.env.VITE_API_BASE_URL;
//     if (!API_BASE) throw new Error("VITE_API_BASE_URL missing");

//     const url = new URL(API_BASE);
//     const scheme = url.protocol === "https:" ? "wss" : "ws";

//     return `${scheme}://${url.host}/ws`;
//   };

//   /* =====================================================
//      HEARTBEAT
//   ===================================================== */
//   const stopHeartbeat = () => {
//     if (heartbeatRef.current) {
//       clearInterval(heartbeatRef.current);
//       heartbeatRef.current = null;
//     }
//   };

//   const startHeartbeat = useCallback((ws) => {
//     stopHeartbeat();
//     heartbeatRef.current = setInterval(() => {
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.send(JSON.stringify({ type: "heartbeat" }));
//       }
//     }, HEARTBEAT_INTERVAL);
//   }, []);

//   /* =====================================================
//      MESSAGE HANDLER (DEDUPED)
//   ===================================================== */
//   const handleMessage = useCallback((event) => {
//     if (event.data === lastMessageRef.current) return;
//     lastMessageRef.current = event.data;

//     try {
//       const data = JSON.parse(event.data);

//       if (data.type === "connection_established") return;

//       if (data.message) {
//         const notification = {
//           id: crypto.randomUUID(),
//           message: data.message,
//           type: data.notification_type || "info",
//           timestamp: data.timestamp || new Date().toISOString(),
//           read: false,
//           data: data.data || {},
//         };

//         setNotifications((prev) => [notification, ...prev].slice(0, 50));
//         setUnreadCount((c) => c + 1);
//       }
//     } catch (err) {
//       console.error("WebSocket message error:", err);
//     }
//   }, []);

//   /* =====================================================
//      DISCONNECT
//   ===================================================== */
//   const disconnectWebSocket = useCallback(() => {
//     stopHeartbeat();
//     if (reconnectTimerRef.current) {
//       clearTimeout(reconnectTimerRef.current);
//       reconnectTimerRef.current = null;
//     }
//     if (socketRef.current) {
//       socketRef.current.close(1000, "Disconnected");
//       socketRef.current = null;
//     }
//     setIsConnected(false);
//     isConnectingRef.current = false;
//   }, []);

//   /* =====================================================
//      CONNECT (SINGLE SOURCE OF TRUTH)
//   ===================================================== */
//   const connectWebSocket = useCallback(async () => {
//     if (socketRef.current || isConnectingRef.current) return;

//     const authed = await isAuthenticated();
//     if (!authed) {
//       disconnectWebSocket();
//       return;
//     }

//     let wsUrl;
//     try {
//       wsUrl = getWebSocketUrl();
//     } catch (err) {
//       console.error(err.message);
//       return;
//     }

//     isConnectingRef.current = true;
//     const ws = new WebSocket(wsUrl);
//     socketRef.current = ws;

//     ws.onopen = () => {
//       isConnectingRef.current = false;
//       setIsConnected(true);
//       startHeartbeat(ws);
//     };

//     ws.onmessage = handleMessage;

//     ws.onerror = (err) => {
//       console.error("WebSocket error:", err);
//     };

//     ws.onclose = (e) => {
//       stopHeartbeat();
//       socketRef.current = null;
//       setIsConnected(false);
//       isConnectingRef.current = false;

//       if (e.code !== 1000) {
//         reconnectTimerRef.current = setTimeout(connectWebSocket, 3000);
//       }
//     };
//   }, [handleMessage, startHeartbeat, disconnectWebSocket]);

//   /* =====================================================
//      PATH MONITORING (POLLING FOR NAVIGATION CHANGES)
//   ===================================================== */
//   useEffect(() => {
//     const interval = setInterval(async () => {
//       const currentPath = window.location.pathname;
//       const isLoginPage = currentPath === '/' || currentPath === '/login';

//       if (isLoginPage) {
//         if (isConnected) {
//           disconnectWebSocket();
//         }
//       } else {
//         if (!isConnected && !isConnectingRef.current) {
//           connectWebSocket();
//         }
//       }
//     }, PATH_POLL_INTERVAL);

//     return () => clearInterval(interval);
//   }, [connectWebSocket, disconnectWebSocket]);

//   /* =====================================================
//      CLEANUP ON TAB CLOSE
//   ===================================================== */
//   useEffect(() => {
//     const closeSocket = () => {
//       disconnectWebSocket();
//     };

//     window.addEventListener("beforeunload", closeSocket);
//     return () => window.removeEventListener("beforeunload", closeSocket);
//   }, [disconnectWebSocket]);

//   /* =====================================================
//      ACTIONS
//   ===================================================== */
//   const markAsRead = (id) => {
//     setNotifications((prev) =>
//       prev.map((n) => (n.id === id ? { ...n, read: true } : n))
//     );
//     setUnreadCount((c) => Math.max(0, c - 1));
//   };

//   const markAllAsRead = () => {
//     setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
//     setUnreadCount(0);
//   };

//   const clearAll = () => {
//     setNotifications([]);
//     setUnreadCount(0);
//   };

//   const sendMessage = (payload) => {
//     if (socketRef.current?.readyState === WebSocket.OPEN) {
//       socketRef.current.send(JSON.stringify(payload));
//       return true;
//     }
//     return false;
//   };

//   /* =====================================================
//      CONTEXT VALUE
//   ===================================================== */
//   return (
//     <WebSocketContext.Provider
//       value={{
//         isConnected,
//         notifications,
//         unreadCount,
//         markAsRead,
//         markAllAsRead,
//         clearAll,
//         sendMessage,
//         reconnect: connectWebSocket,
//       }}
//     >
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import api from "../utils/axiosConfig";

/* =====================================================
   CONTEXT
===================================================== */
const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return ctx;
};

/* =====================================================
   SAFE UUID (crypto.randomUUID fallback)
===================================================== */
const generateUUID = () => {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback (RFC4122-ish)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/* =====================================================
   PROVIDER
===================================================== */
export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const isConnectingRef = useRef(false);
  const reconnectTimerRef = useRef(null);
  const heartbeatRef = useRef(null);
  const lastMessageRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const HEARTBEAT_INTERVAL = 30000;
  const PATH_POLL_INTERVAL = 100;

  /* =====================================================
     AUTH CHECK
  ===================================================== */
  const isAuthenticated = async () => {
    try {
      await api.get("/profile/me");
      return true;
    } catch {
      return false;
    }
  };

  /* =====================================================
     BUILD WS URL
  ===================================================== */
  const getWebSocketUrl = () => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    if (!API_BASE) throw new Error("VITE_API_BASE_URL missing");

    const url = new URL(API_BASE);
    const scheme = url.protocol === "https:" ? "wss" : "ws";

    return `${scheme}://${url.host}/ws`;
  };

  /* =====================================================
     HEARTBEAT
  ===================================================== */
  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const startHeartbeat = useCallback((ws) => {
    stopHeartbeat();
    heartbeatRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "heartbeat" }));
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  /* =====================================================
     MESSAGE HANDLER (FIXED UUID)
  ===================================================== */
  const handleMessage = useCallback((event) => {
    if (event.data === lastMessageRef.current) return;
    lastMessageRef.current = event.data;

    try {
      const data = JSON.parse(event.data);

      if (data.type === "connection_established") return;

      if (data.message) {
        const notification = {
          id: generateUUID(),
          message: data.message,
          type: data.notification_type || "info",
          timestamp: data.timestamp || new Date().toISOString(),
          read: false,
          data: data.data || {},
        };

        setNotifications((prev) => [notification, ...prev].slice(0, 50));
        setUnreadCount((c) => c + 1);
      }
    } catch (err) {
      console.error("WebSocket message error:", err);
    }
  }, []);

  /* =====================================================
     DISCONNECT
  ===================================================== */
  const disconnectWebSocket = useCallback(() => {
    stopHeartbeat();
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close(1000, "Disconnected");
      socketRef.current = null;
    }
    setIsConnected(false);
    isConnectingRef.current = false;
  }, []);

  /* =====================================================
     CONNECT
  ===================================================== */
  const connectWebSocket = useCallback(async () => {
    if (socketRef.current || isConnectingRef.current) return;

    const authed = await isAuthenticated();
    if (!authed) {
      disconnectWebSocket();
      return;
    }

    let wsUrl;
    try {
      wsUrl = getWebSocketUrl();
    } catch (err) {
      console.error(err.message);
      return;
    }

    isConnectingRef.current = true;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      isConnectingRef.current = false;
      setIsConnected(true);
      startHeartbeat(ws);
    };

    ws.onmessage = handleMessage;

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = (e) => {
      stopHeartbeat();
      socketRef.current = null;
      setIsConnected(false);
      isConnectingRef.current = false;

      if (e.code !== 1000) {
        reconnectTimerRef.current = setTimeout(connectWebSocket, 3000);
      }
    };
  }, [handleMessage, startHeartbeat, disconnectWebSocket]);

  /* =====================================================
     PATH MONITORING
  ===================================================== */
  useEffect(() => {
    const interval = setInterval(() => {
      const path = window.location.pathname;
      const isLoginPage = path === "/" || path === "/login";

      if (isLoginPage) {
        if (isConnected) disconnectWebSocket();
      } else {
        if (!isConnected && !isConnectingRef.current) {
          connectWebSocket();
        }
      }
    }, PATH_POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [connectWebSocket, disconnectWebSocket, isConnected]);

  /* =====================================================
     CLEANUP
  ===================================================== */
  useEffect(() => {
    window.addEventListener("beforeunload", disconnectWebSocket);
    return () =>
      window.removeEventListener("beforeunload", disconnectWebSocket);
  }, [disconnectWebSocket]);

  /* =====================================================
     ACTIONS
  ===================================================== */
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const sendMessage = (payload) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
      return true;
    }
    return false;
  };

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */
  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        sendMessage,
        reconnect: connectWebSocket,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
