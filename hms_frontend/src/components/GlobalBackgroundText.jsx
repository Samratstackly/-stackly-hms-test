import React from "react";
import { useLocation } from "react-router-dom";

const GlobalBackgroundText = ({ isCollapsed }) => {
  const location = useLocation();

  // Routes that HAVE sidebar
  const sidebarRoutes = ["/dashboard", "/profile", "/patients/profile"];
  const hasSidebar = sidebarRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  // Don't render if page has sidebar
  if (hasSidebar) return null;

  return (
    <div
      className="fixed top-1/2 text-center pointer-events-none select-none overflow-hidden"
      style={{
        width: "100vw",
        left: isCollapsed ? "70px" : "110px",
        transform: "translateY(-50%)",
        zIndex: 40,
        transitionProperty: "left",
        transitionDuration: "300ms",
        transitionTimingFunction: "ease-in-out",
      }}
    >
      <h1
        className="
          leading-none font-bold
          text-[60px] sm:text-[100px] md:text-[140px] lg:text-[180px]
          text-black/10 dark:text-white/5
        "
        style={{
          fontFamily: "Poppins, sans-serif",
          userSelect: "none",
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        Stackly Care
      </h1>
    </div>
  );
};
export default GlobalBackgroundText;
