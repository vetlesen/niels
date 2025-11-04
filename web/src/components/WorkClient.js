"use client";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import Work from "./Work";

export default function WorkClient({ work }) {
  const [hoveredWork, setHoveredWork] = useState(null);
  const [hoveredThumbnail, setHoveredThumbnail] = useState(null);
  const { activeFilter, setFilter } = useTheme();

  // Filter work based on active filter
  const filteredWork = work.filter((item) => {
    if (activeFilter === "both") return true;
    return item.category === activeFilter;
  });

  return (
    <>
      {/* DISPLAY THE WORK HERE */}
      <section className="px-2 pb-8">
        {filteredWork.length > 0 ? (
          <>
            {filteredWork.map((item) => (
              <Work
                key={item._id}
                item={item}
                onMouseEnter={setHoveredWork}
                onMouseLeave={setHoveredWork}
                hoveredWork={hoveredWork}
                setHoveredThumbnail={setHoveredThumbnail}
              />
            ))}
          </>
        ) : (
          <p className="text-gray-500 text-center">
            No work found for the selected filter.
          </p>
        )}
      </section>
    </>
  );
}
