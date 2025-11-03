"use client";
import { useTheme } from "../contexts/ThemeContext";

export default function Filter() {
  const { activeFilter, setFilter } = useTheme();

  return (
    <section className="h-[50svh] flex justify-start items-center px-4">
      <div className="space-x-2 flex sticky top-2">
        <button
          onClick={() => setFilter("commercial")}
          className="flex flex-row gap-2 items-baseline uppercase"
        >
          <div
            className={`w-3 h-3 flex ${
              activeFilter === "commercial"
                ? activeFilter === "narrative"
                  ? "bg-white border border-white  "
                  : "bg-black border border-black text-white"
                : " border"
            }`}
          />
          Commercial
        </button>
        <button
          onClick={() => setFilter("narrative")}
          className="flex flex-row gap-2 items-baseline uppercase"
        >
          <div
            className={`w-3 h-3 flex ${
              activeFilter === "narrative"
                ? "bg-white border border-white  "
                : " border"
            }`}
          />
          Narrative
        </button>
      </div>
    </section>
  );
}
