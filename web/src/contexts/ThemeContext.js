"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize from URL or default to "commercial"
  const [activeFilter, setActiveFilter] = useState(() => {
    if (typeof window !== "undefined") {
      const urlFilter = searchParams.get("filter");
      return urlFilter === "narrative" ? "narrative" : "commercial";
    }
    return "commercial";
  });
  const [customColor, setCustomColor] = useState(null);

  // Sync with URL on mount and when searchParams change
  useEffect(() => {
    const urlFilter = searchParams.get("filter");
    const isHomepage = pathname === "/";

    if (urlFilter === "narrative" || urlFilter === "commercial") {
      setActiveFilter(urlFilter);
    } else if (!urlFilter && isHomepage) {
      // If no filter in URL and on homepage, set default to commercial
      const params = new URLSearchParams(searchParams.toString());
      params.set("filter", "commercial");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  useEffect(() => {
    // Apply theme classes to body using Tailwind
    document.body.className = "";

    if (customColor) {
      // Use custom color from image palette
      document.body.style.backgroundColor = customColor;
      document.body.className = "transition-all duration-500 ease-in-out";

      // Determine text color based on background brightness
      const textColor = isColorDark(customColor) ? "white" : "black";
      document.body.style.color = textColor;
    } else if (activeFilter === "narrative") {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      document.body.className =
        "bg-[#383838] text-white transition-all duration-500 ease-in-out";
    } else if (activeFilter === "commercial") {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      document.body.className =
        "bg-white transition-all duration-500 ease-in-out";
    }

    document.body.offsetHeight;
  }, [activeFilter, customColor]);

  // Helper function to determine if a color is dark
  const isColorDark = (hexColor) => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  const setFilter = (category) => {
    setActiveFilter(category);
    setCustomColor(null); // Reset custom color when changing filter

    // Only update URL with filter on homepage
    const isHomepage = pathname === "/";
    if (isHomepage) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("filter", category);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const setBackgroundColor = (color) => {
    setCustomColor(color);
  };

  return (
    <ThemeContext.Provider
      value={{ activeFilter, setFilter, setBackgroundColor, customColor }}
    >
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
