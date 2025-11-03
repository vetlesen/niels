"use client";

import { useState, useEffect, useRef } from "react";

// Deterministic pseudo-random function based on seed
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Individual draggable image component
function DraggableImage({
  image,
  index,
  totalImages,
  onBringToFront,
  cardRefs,
}) {
  const imageRef = useRef(null);

  // Store ref in parent's array
  useEffect(() => {
    if (cardRefs && cardRefs.current) {
      cardRefs.current[index] = imageRef;
    }
  }, [index, cardRefs]);

  const [isDragging, setIsDragging] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Use deterministic positioning based on index to avoid hydration issues
  const [position, setPosition] = useState({
    x: index * 5,
    y: index * 5,
  });
  const [rotation, setRotation] = useState(index * 2 - 4);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [zIndex, setZIndex] = useState(totalImages - index);

  // Apply random positioning only after hydration
  useEffect(() => {
    setPosition({
      x: index * 5 + seededRandom(index * 123) * 20 - 10,
      y: index * 5 + seededRandom(index * 456) * 20 - 10,
    });
    setRotation(index * 2 - 4 + seededRandom(index * 789) * 8 - 4);
    setIsHydrated(true);
  }, [index]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    // Remove any transition when starting to drag
    if (imageRef.current) {
      imageRef.current.style.transition = "";

      // Sync React state with actual DOM position
      const transform = imageRef.current.style.transform;
      const match = transform.match(
        /translate\(([^,]+),\s*([^)]+)\)\s*rotate\(([^)]+)\)/
      );
      if (match) {
        const currentX = parseFloat(match[1]);
        const currentY = parseFloat(match[2]);
        const currentRotation = parseFloat(match[3]);
        setPosition({ x: currentX, y: currentY });
        setRotation(currentRotation);
        setInitialPosition({ x: currentX, y: currentY });
      } else {
        setInitialPosition(position);
      }
    } else {
      setInitialPosition(position);
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
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
      const hitBoundary =
        newX < -margin ||
        newX > rect.width - imageRect.width + margin ||
        newY < -margin ||
        newY > rect.height - imageRect.height + margin;

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
    console.log(`🖱️ Card ${index} RELEASED at position:`, {
      x: position.x.toFixed(1),
      y: position.y.toFixed(1),
      rotation: rotation.toFixed(1),
    });
    setIsDragging(false);
    // Add some settling by slightly reducing rotation
    setRotation((prev) => prev * 0.9);
  };

  // Touch events for mobile
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    // Remove any transition when starting to drag
    if (imageRef.current) {
      imageRef.current.style.transition = "";

      // Sync React state with actual DOM position
      const transform = imageRef.current.style.transform;
      const match = transform.match(
        /translate\(([^,]+),\s*([^)]+)\)\s*rotate\(([^)]+)\)/
      );
      if (match) {
        const currentX = parseFloat(match[1]);
        const currentY = parseFloat(match[2]);
        const currentRotation = parseFloat(match[3]);
        setPosition({ x: currentX, y: currentY });
        setRotation(currentRotation);
        setInitialPosition({ x: currentX, y: currentY });
      } else {
        setInitialPosition(position);
      }
    } else {
      setInitialPosition(position);
    }

    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    onBringToFront(index);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;

    // Calculate new position
    const newX = initialPosition.x + deltaX;
    const newY = initialPosition.y + deltaY;

    // Add resistance at edges (simulate paper friction) - same as mouse
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

  const handleTouchEnd = () => {
    console.log(`👆 Card ${index} RELEASED at position:`, {
      x: position.x.toFixed(1),
      y: position.y.toFixed(1),
      rotation: rotation.toFixed(1),
    });
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
      document.addEventListener("touchcancel", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isDragging, dragStart, initialPosition]);

  return (
    <div
      ref={imageRef}
      className={`absolute cursor-grab ${
        isDragging ? "cursor-grabbing" : ""
      } select-none`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transformOrigin: "center center",
        zIndex: zIndex,
        touchAction: "none", // Prevent default touch behaviors
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
  // Safety check for stackImages
  const safeStackImages = stackImages || [];
  const [maxZIndex, setMaxZIndex] = useState(safeStackImages.length);
  const cardRefs = useRef([]);

  const logAllCardPositions = (event) => {
    console.log(`📍 ALL CARD POSITIONS (${event}):`);
    cardRefs.current.forEach((ref, index) => {
      if (ref && ref.current) {
        const transform = ref.current.style.transform;
        const match = transform.match(
          /translate\(([^,]+),\s*([^)]+)\)\s*rotate\(([^)]+)\)/
        );
        if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          const rotation = parseFloat(match[3]);
          console.log(
            `  Card ${index}: x=${x.toFixed(1)}, y=${y.toFixed(
              1
            )}, rot=${rotation.toFixed(1)}°`
          );
        }
      }
    });
    console.log("---");
  };

  const handleBringToFront = (imageIndex) => {
    setMaxZIndex((prev) => prev + 1);
  };

  const handleExpand = () => {
    console.log(`🔄 EXPAND TRIGGERED - Cards will jump to grid positions`);
    logAllCardPositions("BEFORE EXPAND");

    // Directly animate all cards to grid positions
    cardRefs.current.forEach((ref, index) => {
      if (ref && ref.current) {
        const gridPosition = getExpandedPosition(index);
        ref.current.style.transition = "transform 500ms ease-out";
        ref.current.style.transform = `translate(${gridPosition.x}px, ${gridPosition.y}px) rotate(0deg)`;
      }
    });

    // Log positions after animation
    setTimeout(() => logAllCardPositions("AFTER EXPAND"), 600);
  };

  const handleCollect = () => {
    console.log(`🔄 COLLECT TRIGGERED - Cards will jump to center`);
    logAllCardPositions("BEFORE COLLECT");

    // Directly animate all cards to center positions
    cardRefs.current.forEach((ref, index) => {
      if (ref && ref.current) {
        const centerPosition = getCollectedPosition(index);
        const randomRotation =
          index * 2 - 4 + seededRandom(index * 789) * 8 - 4;
        ref.current.style.transition = "transform 500ms ease-out";
        ref.current.style.transform = `translate(${centerPosition.x}px, ${centerPosition.y}px) rotate(${randomRotation}deg)`;
      }
    });

    // Log positions after animation
    setTimeout(() => logAllCardPositions("AFTER COLLECT"), 600);
  };

  // Calculate grid positions for expanded state
  const getExpandedPosition = (index) => {
    const cols = Math.ceil(Math.sqrt(safeStackImages.length));
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      x: col * 320 - cols * 160 + 160, // Center the grid
      y: row * 420 - Math.ceil(safeStackImages.length / cols) * 210 + 210,
    };
  };

  // Calculate collected position (center)
  const getCollectedPosition = (index) => {
    return {
      x: index * 3 + seededRandom(index * 321) * 10 - 5,
      y: index * 3 + seededRandom(index * 654) * 10 - 5,
    };
  };

  // If no images provided, show placeholder
  if (!safeStackImages || safeStackImages.length === 0) {
    return null;
  }

  return (
    <section className="pt-20 min-h-screen overflow-x-hidden px-4">
      <h4 className="mb-2 opacity-50 uppercase text-sm">stack</h4>
      <div className="space-x-2">
        <button className="" onClick={handleExpand}>
          Expand
        </button>
        <button className="" onClick={handleCollect}>
          Collect
        </button>
      </div>
      <div className="relative w-full h-[89svh] flex flex-col items-center justify-center overflow-visible">
        <div className="relative w-full h-full flex items-center justify-center">
          {safeStackImages.map((image, index) => (
            <DraggableImage
              key={`${image._key || index}`}
              image={image}
              index={index}
              totalImages={safeStackImages.length}
              onBringToFront={handleBringToFront}
              cardRefs={cardRefs}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
