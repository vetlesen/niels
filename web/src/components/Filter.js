"use client";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect } from "react";

export default function Filter() {
  const { activeFilter, setFilter } = useTheme();
  const [isFixed, setIsFixed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Scrolling down and past a threshold
      if (currentScrollY > lastScrollY && currentScrollY > 400) {
        setIsFixed(true);
      }
      // Scrolling up and back above threshold
      else if (currentScrollY < 400) {
        setIsFixed(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <section className="h-[50svh] flex justify-start items-start px-4">
      <div
        className={`space-x-2 flex top-2 z-9999 ${
          isFixed ? "fixed" : "sticky mt-52"
        }`}
      >
        <button
          onClick={() => setFilter("commercial")}
          className="flex flex-row gap-2 items-baseline uppercase cursor-pointer group transition-all"
        >
          <div
            className={`w-3 h-3 flex ${
              activeFilter === "commercial"
                ? activeFilter === "narrative"
                  ? "border border-white "
                  : "bg-black border border-black text-white "
                : " border group-hover:bg-white/50"
            }`}
          />
          Commercial
        </button>
        <button
          onClick={() => setFilter("narrative")}
          className="flex flex-row gap-2 items-baseline uppercase cursor-pointer group transition-all"
        >
          <div
            className={`w-3 h-3 flex ${
              activeFilter === "narrative"
                ? "bg-white border border-white "
                : " border group-hover:bg-black/20"
            }`}
          />
          Narrative
        </button>
      </div>
    </section>
  );
}
