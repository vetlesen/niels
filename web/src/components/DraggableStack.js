"use client";
import { useState, useEffect, useRef } from "react";

// Individual draggable image component
function DraggableImage({
  image,
  index,
  totalImages,
  onBringToFront,
  isExpanded,
  isCollected,
  expandedPosition,
  collectedPosition,
  forceUpdate,
}) {
  const imageRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    x: index * 5 + Math.random() * 20 - 10,
    y: index * 5 + Math.random() * 20 - 10,
  });
  const [rotation, setRotation] = useState(
    index * 2 - 4 + Math.random() * 8 - 4
  );
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [zIndex, setZIndex] = useState(totalImages - index);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);

  // Update position when expand/collect state changes
  useEffect(() => {
    if (isExpanded && expandedPosition) {
      setPosition(expandedPosition);
      setRotation(0);
      setHasBeenDragged(false); // Reset drag state when expanding
    } else if (isCollected && collectedPosition) {
      setPosition(collectedPosition);
      setRotation(index * 2 - 4 + Math.random() * 8 - 4);
      setHasBeenDragged(false); // Reset drag state when collecting
    }
  }, [
    isExpanded,
    isCollected,
    expandedPosition,
    collectedPosition,
    index,
    forceUpdate,
  ]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPosition(position);
    setHasBeenDragged(true);
    onBringToFront(index);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // Calculate new position
    const newX = initialPosition.x + deltaX;
    const newY = initialPosition.y + deltaY;

    // Add resistance at edges (simulate paper friction)
    const boundaryResistance = 0.6;
    const container = imageRef.current?.parentElement?.parentElement;

    if (container) {
      const rect = container.getBoundingClientRect();
      const imageRect = imageRef.current.getBoundingClientRect();

      let finalX = newX;
      let finalY = newY;

      // Apply boundary resistance with more generous margins
      const margin = 200;
      if (newX < -margin)
        finalX = -margin + (newX + margin) * boundaryResistance;
      if (newX > rect.width - imageRect.width + margin) {
        finalX =
          rect.width -
          imageRect.width +
          margin +
          (newX - (rect.width - imageRect.width + margin)) * boundaryResistance;
      }
      if (newY < -margin)
        finalY = -margin + (newY + margin) * boundaryResistance;
      if (newY > rect.height - imageRect.height + margin) {
        finalY =
          rect.height -
          imageRect.height +
          margin +
          (newY - (rect.height - imageRect.height + margin)) *
            boundaryResistance;
      }

      setPosition({ x: finalX, y: finalY });
    } else {
      setPosition({ x: newX, y: newY });
    }

    // Calculate rotation based on movement (simulate paper physics) - reduced sensitivity
    const rotationChange = deltaX * 0.02 + deltaY * 0.01;
    setRotation((prev) => prev + rotationChange * 0.05);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Add some settling by slightly reducing rotation
    setRotation((prev) => prev * 0.9);
  };

  // Touch events for mobile
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setInitialPosition(position);
    setHasBeenDragged(true);
    onBringToFront(index);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;

    const newX = initialPosition.x + deltaX;
    const newY = initialPosition.y + deltaY;

    setPosition({ x: newX, y: newY });

    const rotationChange = deltaX * 0.02 + deltaY * 0.01;
    setRotation((prev) => prev + rotationChange * 0.05);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setRotation((prev) => prev * 0.9);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragStart, initialPosition]);

  return (
    <div
      ref={imageRef}
      className={`absolute cursor-grab ${
        isDragging ? "cursor-grabbing" : ""
      } transition-all duration-500 ease-out select-none`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transformOrigin: "center center",
        zIndex: zIndex,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="drop-shadow-xl">
        {image?.asset?.url ? (
          <img
            src={image.asset.url}
            alt={`Stack image ${index + 1}`}
            className="pointer-events-none block"
            draggable={false}
            style={{
              maxWidth: "300px",
              maxHeight: "400px",
              width: "auto",
              height: "auto",
            }}
          />
        ) : (
          <div className="w-48 h-64 bg-gray-100 flex items-center justify-center text-gray-500">
            Image {index + 1}
          </div>
        )}
      </div>
    </div>
  );
}

// Main DraggableStack component
export default function DraggableStack({ stackImages = [] }) {
  const [maxZIndex, setMaxZIndex] = useState(stackImages.length);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const handleBringToFront = (imageIndex) => {
    setMaxZIndex((prev) => prev + 1);
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setIsCollected(false);
    setForceUpdate((prev) => prev + 1);
  };

  const handleCollect = () => {
    setIsCollected(true);
    setIsExpanded(false);
    setForceUpdate((prev) => prev + 1);
  };

  // Calculate grid positions for expanded state
  const getExpandedPosition = (index) => {
    const cols = Math.ceil(Math.sqrt(stackImages.length));
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      x: col * 320 - cols * 160 + 160, // Center the grid
      y: row * 420 - Math.ceil(stackImages.length / cols) * 210 + 210,
    };
  };

  // Calculate collected position (center)
  const getCollectedPosition = (index) => {
    return {
      x: index * 3 + Math.random() * 10 - 5,
      y: index * 3 + Math.random() * 10 - 5,
    };
  };

  // If no images provided, show placeholder
  if (!stackImages || stackImages.length === 0) {
    return null;
  }

  return (
    <section className="pt-20 min-h-screen">
      <div className="mb-8 space-x-2">
        <button className="" onClick={handleExpand}>
          Expand
        </button>
        <button className="" onClick={handleCollect}>
          Collect
        </button>
      </div>
      <div className="relative w-full h-[89svh] flex flex-col items-center justify-center overflow-visible">
        <div className="relative w-full h-full flex items-center justify-center">
          {stackImages.map((image, index) => (
            <DraggableImage
              key={`${image._key || index}-${forceUpdate}`}
              image={image}
              index={index}
              totalImages={stackImages.length}
              onBringToFront={handleBringToFront}
              isExpanded={isExpanded}
              isCollected={isCollected}
              expandedPosition={getExpandedPosition(index)}
              collectedPosition={getCollectedPosition(index)}
              forceUpdate={forceUpdate}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
