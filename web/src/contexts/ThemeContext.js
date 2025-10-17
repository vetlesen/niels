"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [activeFilter, setActiveFilter] = useState("both");

  useEffect(() => {
    // Apply theme classes to body using Tailwind
    // Clear existing classes first
    document.body.className = "";

    // Add font family back since we removed it from CSS
    document.body.style.fontFamily = "Arial, Helvetica, sans-serif";

    if (activeFilter === "narrative") {
      document.body.className =
        "bg-[#1D1D1D] text-white transition-all duration-500 ease-in-out";
    } else if (activeFilter === "commercial") {
      document.body.className =
        "bg-white   transition-all duration-500 ease-in-out";
    } else {
      // Use a subtle gray for "both" to differentiate from commercial
      document.body.className =
        "bg-gray-50 text-gray-900 transition-all duration-500 ease-in-out";
    }

    // Force a reflow to ensure styles are applied
    document.body.offsetHeight;
  }, [activeFilter]);

  const setFilter = (category) => {
    setActiveFilter(category);
  };

  return (
    <ThemeContext.Provider value={{ activeFilter, setFilter }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
