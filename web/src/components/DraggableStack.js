"use client";

import React, { useState, useRef, useEffect } from "react";
import VideoThumbnail from "./VideoThumbnail";

// Individual draggable image component
const DraggableImage = ({ item, index, onBringToFront, zIndex }) => {
  // Generate random position around center of screen on initial load
  const getRandomPosition = () => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") {
      return { top: 0, left: 0 };
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const randomRange = 800; // pixels around center

    return {
      top: centerY - 100 + (Math.random() - 0.5) * randomRange, // -100 to account for image height
      left: centerX - 100 + (Math.random() - 0.5) * randomRange, // -100 to account for image width
    };
  };

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [rotation, setRotation] = useState(0);
  const [rotateX, setRotateX] = useState(5); // Default slight 3D tilt like sticky notes
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [angularVelocity, setAngularVelocity] = useState(0);

  // Set random position after component mounts (client-side)
  useEffect(() => {
    setPosition(getRandomPosition());
  }, []);

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    pos1: 0,
    pos2: 0,
    pos3: 0,
    pos4: 0,
    lastTime: 0,
    velocityHistory: [],
  });

  const dragMouseDown = (e) => {
    e.preventDefault();
    // Bring this item to the front when clicked
    onBringToFront(index);

    // Get the mouse cursor position at startup
    dragRef.current.pos3 = e.clientX;
    dragRef.current.pos4 = e.clientY;
    dragRef.current.lastTime = Date.now();
    dragRef.current.velocityHistory = [];
    setIsDragging(true);

    // Reset velocities when starting drag
    setVelocity({ x: 0, y: 0 });
    setAngularVelocity(0);

    // Animate to "lifted" state when grabbed
    setRotateX(30);

    // Attach event listeners to document
    document.addEventListener("mouseup", closeDragElement);
    document.addEventListener("mousemove", elementDrag);
  };

  const elementDrag = (e) => {
    e.preventDefault();
    const currentTime = Date.now();
    const deltaTime = currentTime - dragRef.current.lastTime;

    // Calculate the new cursor position
    dragRef.current.pos1 = dragRef.current.pos3 - e.clientX;
    dragRef.current.pos2 = dragRef.current.pos4 - e.clientY;

    // Calculate velocity
    const velX = -dragRef.current.pos1 / (deltaTime || 1);
    const velY = -dragRef.current.pos2 / (deltaTime || 1);

    // Store velocity history for momentum calculation
    dragRef.current.velocityHistory.push({
      x: velX,
      y: velY,
      time: currentTime,
    });
    if (dragRef.current.velocityHistory.length > 5) {
      dragRef.current.velocityHistory.shift();
    }

    // Calculate rotation based on perpendicular velocity
    const speed = Math.sqrt(velX * velX + velY * velY);
    const crossProduct =
      velX * dragRef.current.pos2 - velY * dragRef.current.pos1;
    const rotationForce = crossProduct * 0.001; // Scale factor for rotation sensitivity

    // Apply resistance to movement (like paper drag)
    const resistance = 0.7;
    const dampedPosX = dragRef.current.pos1 * resistance;
    const dampedPosY = dragRef.current.pos2 * resistance;

    dragRef.current.pos3 = e.clientX;
    dragRef.current.pos4 = e.clientY;
    dragRef.current.lastTime = currentTime;

    // Set the element's new position with resistance
    setPosition((prev) => ({
      top: prev.top - dampedPosY,
      left: prev.left - dampedPosX,
    }));

    // Update rotation with some damping
    setRotation((prev) => prev + rotationForce);
    setVelocity({ x: velX, y: velY });
  };

  const closeDragElement = () => {
    // Calculate final momentum from velocity history
    if (dragRef.current.velocityHistory.length > 0) {
      const recentVelocities = dragRef.current.velocityHistory.slice(-3);
      const avgVelX =
        recentVelocities.reduce((sum, v) => sum + v.x, 0) /
        recentVelocities.length;
      const avgVelY =
        recentVelocities.reduce((sum, v) => sum + v.y, 0) /
        recentVelocities.length;

      setVelocity({ x: avgVelX, y: avgVelY });

      // Set angular velocity based on final movement
      const finalSpeed = Math.sqrt(avgVelX * avgVelX + avgVelY * avgVelY);
      setAngularVelocity(finalSpeed * 0.01 * (Math.random() - 0.5));
    }

    // Animate back to "settled" state when released
    setRotateX(5);

    // Stop moving when mouse button is released
    setIsDragging(false);
    document.removeEventListener("mouseup", closeDragElement);
    document.removeEventListener("mousemove", elementDrag);
  };

  // Physics animation loop for momentum and decay
  useEffect(() => {
    if (
      !isDragging &&
      (Math.abs(velocity.x) > 0.1 ||
        Math.abs(velocity.y) > 0.1 ||
        Math.abs(angularVelocity) > 0.01)
    ) {
      const animationFrame = requestAnimationFrame(() => {
        // Apply momentum with decay
        const decay = 0.95;
        const newVelX = velocity.x * decay;
        const newVelY = velocity.y * decay;
        const newAngularVel = angularVelocity * decay;

        setPosition((prev) => ({
          top: prev.top + newVelY,
          left: prev.left + newVelX,
        }));

        setRotation((prev) => prev + newAngularVel);
        setVelocity({ x: newVelX, y: newVelY });
        setAngularVelocity(newAngularVel);
      });

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [velocity, angularVelocity, isDragging]);

  return (
    <div
      className={`absolute ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: isDragging ? 1000 : zIndex,
        transform: `rotate(${rotation}deg) rotateX(${rotateX}deg)`,
        transition: isDragging ? "none" : "transform 0.3s ease-out",
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
  // State to manage z-index order for bringing items to front
  const [zIndexOrder, setZIndexOrder] = useState(() =>
    stackImages.map((_, index) => index + 1)
  );

  if (!stackImages || stackImages.length === 0) {
    return null;
  }

  // Function to bring an item to the front
  const bringToFront = (clickedIndex) => {
    setZIndexOrder((prevOrder) => {
      const maxZ = Math.max(...prevOrder);
      const newOrder = [...prevOrder];
      newOrder[clickedIndex] = maxZ + 1;
      return newOrder;
    });
  };

  return (
    <section className="pt-20 min-h-screen overflow-hidden px-4">
      <div>
        <h4 className="mb-2 opacity-50 uppercase text-xs">stack</h4>
      </div>

      <div
        className="relative w-full h-[120svh] flex flex-col items-center justify-center overflow-visible"
        style={{ perspective: "1600px" }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {stackImages.map((item, index) => (
            <DraggableImage
              key={`${item._key || index}`}
              item={item}
              index={index}
              onBringToFront={bringToFront}
              zIndex={zIndexOrder[index]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
