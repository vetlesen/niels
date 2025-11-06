"use client";

import React, { useState, useRef } from "react";
import VideoThumbnail from "./VideoThumbnail";

// Individual draggable image component
const DraggableImage = ({ item, index, onBringToFront, zIndex }) => {
  // Generate random position around center of screen on initial load
  const getRandomPosition = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const randomRange = 150; // pixels around center

    return {
      top: centerY - 100 + (Math.random() - 0.5) * randomRange, // -100 to account for image height
      left: centerX - 100 + (Math.random() - 0.5) * randomRange, // -100 to account for image width
    };
  };

  const [position, setPosition] = useState(getRandomPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ pos1: 0, pos2: 0, pos3: 0, pos4: 0 });

  const dragMouseDown = (e) => {
    e.preventDefault();
    // Get the mouse cursor position at startup
    dragRef.current.pos3 = e.clientX;
    dragRef.current.pos4 = e.clientY;
    setIsDragging(true);

    // Attach event listeners to document
    document.addEventListener("mouseup", closeDragElement);
    document.addEventListener("mousemove", elementDrag);
  };

  const elementDrag = (e) => {
    e.preventDefault();
    // Calculate the new cursor position
    dragRef.current.pos1 = dragRef.current.pos3 - e.clientX;
    dragRef.current.pos2 = dragRef.current.pos4 - e.clientY;
    dragRef.current.pos3 = e.clientX;
    dragRef.current.pos4 = e.clientY;

    // Set the element's new position
    setPosition((prev) => ({
      top: prev.top - dragRef.current.pos2,
      left: prev.left - dragRef.current.pos1,
    }));
  };

  const closeDragElement = () => {
    // Stop moving when mouse button is released
    setIsDragging(false);
    document.removeEventListener("mouseup", closeDragElement);
    document.removeEventListener("mousemove", elementDrag);
  };

  return (
    <div
      className={`absolute ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: isDragging ? 1000 : index,
      }}
      onMouseDown={dragMouseDown}
    >
      {item?._type === "video" && item?.asset?.playbackId ? (
        <VideoThumbnail
          playbackId={item.asset.playbackId}
          timestamp="0:00"
          isHovered={true}
          maxResolution="360p"
          loopDuration={999999}
          className="pointer-events-none select-none"
          style={{
            height: "200px",
            width: "auto",
            objectFit: "contain",
          }}
        />
      ) : item?.asset?.url ? (
        <img
          src={item.asset.url}
          alt={`Stack item ${index + 1}`}
          className="pointer-events-none select-none"
          draggable={false}
          style={{
            height: "200px",
            width: "auto",
            objectFit: "contain",
          }}
        />
      ) : (
        <div className="w-32 h-48 bg-gray-100 flex items-center justify-center text-gray-500">
          Item {index + 1}
        </div>
      )}
    </div>
  );
};

// Main DraggableStack component
export default function DraggableStack({ stackImages = [] }) {
  if (!stackImages || stackImages.length === 0) {
    return null;
  }

  return (
    <section className="pt-20 min-h-screen overflow-hidden px-4">
      <div>
        <h4 className="mb-2 opacity-50 uppercase text-xs">stack</h4>
      </div>

      <div className="relative w-full h-[89svh] flex flex-col items-center justify-center overflow-visible">
        <div className="relative w-full h-full flex items-center justify-center">
          {stackImages.map((item, index) => (
            <DraggableImage
              key={`${item._key || index}`}
              item={item}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
