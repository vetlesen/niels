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

  // Reset custom color when navigating away from work pages or to specific page types
  useEffect(() => {
    const isWorkPage = pathname.startsWith("/work/");
    const isAboutPage = pathname === "/about";
    const isHomepage = pathname === "/";

    console.log("🔄 ThemeContext pathname effect:", {
      pathname,
      isWorkPage,
      isAboutPage,
      isHomepage,
      currentCustomColor: customColor,
    });

    // Reset custom color when navigating to pages that should have specific themes
    if (isAboutPage || isHomepage || !isWorkPage) {
      console.log("⚠️ ThemeContext RESETTING customColor due to pathname");
      setCustomColor(null);
    }
  }, [pathname]);

  useEffect(() => {
    console.log("🖌️ ThemeContext applying theme:", {
      pathname,
      customColor,
      activeFilter,
      isWorkPage: pathname.startsWith("/work/"),
      isAboutPage: pathname === "/about",
      willApplyCustomColor: !!customColor,
    });

    // Apply theme classes to body using Tailwind
    document.body.className = "";

    const isWorkPage = pathname.startsWith("/work/");
    const isAboutPage = pathname === "/about";

    if (customColor) {
      console.log("✅ Applying customColor to body:", customColor);
      // Use custom color from image palette
      document.body.style.backgroundColor = customColor;
      document.body.className = "transition-colors duration-300 ease-in-out";

      // Determine text color based on background brightness
      const textColor = isColorDark(customColor) ? "white" : "black";
      document.body.style.color = textColor;
      console.log("✅ Text color set to:", textColor);
    } else if (isAboutPage) {
      console.log("📄 Applying about page white background");
      // About page always has white background
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      document.body.className =
        "bg-white transition-colors duration-300 ease-in-out";
    } else if (isWorkPage) {
      console.log("🎬 Applying work page #202020 background");
      // Work pages always have #202020 background
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      document.body.className =
        "bg-[#202020] text-white transition-colors duration-300 ease-in-out";
    } else if (activeFilter === "narrative") {
      console.log("🎭 Applying narrative filter background");
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      document.body.className =
        "bg-[#202020] text-white transition-colors duration-300 ease-in-out";
    } else if (activeFilter === "commercial") {
      console.log("🏢 Applying commercial filter background");
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      document.body.className =
        "bg-white transition-colors duration-300 ease-in-out";
    }

    // Force reflow to ensure transition is applied
    document.body.offsetHeight;
  }, [activeFilter, customColor, pathname]);

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
    console.log("🎨 ThemeContext setFilter called:", category);
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
    console.log("🎨 ThemeContext setBackgroundColor called with:", color);
    setCustomColor(color);
    console.log("🎨 ThemeContext customColor state updated to:", color);
  };

  // Determine if current background is dark
  const getIsDarkBackground = () => {
    const isWorkPage = pathname.startsWith("/work/");
    const isAboutPage = pathname === "/about";

    if (customColor) {
      return isColorDark(customColor);
    } else if (isAboutPage) {
      return false; // white background
    } else if (isWorkPage) {
      return true; // #202020 background
    } else if (activeFilter === "narrative") {
      return true; // #202020 background
    } else if (activeFilter === "commercial") {
      return false; // white background
    }
    return false;
  };

  return (
    <ThemeContext.Provider
      value={{
        activeFilter,
        setFilter,
        setBackgroundColor,
        customColor,
        isDarkBackground: getIsDarkBackground(),
      }}
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
