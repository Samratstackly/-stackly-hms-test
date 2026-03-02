// components/ThemeContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = document.documentElement;

    // Step 1: Add fade-out
    root.classList.add("fading");

    const timeout1 = setTimeout(() => {
      // Step 2: Switch theme after fade-out
      if (theme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }

      // Step 3: Trigger fade-in
      root.classList.remove("fading");
      root.classList.add("theme-transition");

      // Step 4: Remove transition class after animation
      const timeout2 = setTimeout(() => {
        root.classList.remove("theme-transition");
      }, 400);

      return () => clearTimeout(timeout2);
    }, 150); // fade-out duration

    return () => clearTimeout(timeout1);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
