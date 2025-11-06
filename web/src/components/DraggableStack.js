"use client";

import { useState, useEffect, useRef } from "react";
import VideoThumbnail from "./VideoThumbnail";

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
  scrollProgress,
  basePositions,
  onPositionUpdate,
}) {
  const imageRef = useRef(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(Date.now());
  const animationFrameRef = useRef(null);

  // Store ref in parent's array
  useEffect(() => {
    if (cardRefs && cardRefs.current) {
      cardRefs.current[index] = imageRef;
    }
  }, [index, cardRefs]);

  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  const [position, setPosition] = useState({
    x: index * 5,
    y: index * 5,
  });
  const [rotation, setRotation] = useState(index * 2 - 4);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [zIndex, setZIndex] = useState(totalImages - index);

  // Use base positions from parent array
  useEffect(() => {
    if (basePositions && basePositions[index]) {
      const basePos = basePositions[index];
      setPosition({ x: basePos.x, y: basePos.y });
      setRotation(basePos.rotation);
      lastPositionRef.current = { x: basePos.x, y: basePos.y };
    }
  }, [basePositions, index]);

  // Enhanced physics simulation for momentum
  const applyMomentum = () => {
    if (!isSettling) return;

    const friction = 0.9; // Slightly more slide
    const rotationFriction = 0.9;
    const minVelocity = 0.15;
    const minRotationVelocity = 0.1;

    velocityRef.current.x *= friction;
    velocityRef.current.y *= friction;

    // Apply rotation momentum based on horizontal velocity
    const rotationMomentum = velocityRef.current.x * 0.1;
    setRotation((prev) => prev + rotationMomentum);

    if (
      Math.abs(velocityRef.current.x) < minVelocity &&
      Math.abs(velocityRef.current.y) < minVelocity
    ) {
      setIsSettling(false);
      velocityRef.current = { x: 0, y: 0 };
      return;
    }

    setPosition((prev) => ({
      x: prev.x + velocityRef.current.x,
      y: prev.y + velocityRef.current.y,
    }));

    animationFrameRef.current = requestAnimationFrame(applyMomentum);
  };

  useEffect(() => {
    if (isSettling) {
      animationFrameRef.current = requestAnimationFrame(applyMomentum);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSettling]);

  const handleMouseDown = (e) => {
    e.preventDefault();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsSettling(false);
    velocityRef.current = { x: 0, y: 0 };
    lastTimeRef.current = Date.now();

    // Calculate spread position based on scroll with random distribution
    const spreadAmount = scrollProgress * 300; // Increased spread distance

    // Use seeded random for consistent but random spread positions
    const randomAngle = seededRandom(index * 1337) * Math.PI * 2;
    const randomDistance = seededRandom(index * 2674) * spreadAmount;
    const randomOffsetX = seededRandom(index * 4011) * 100 - 50; // Additional random offset
    const randomOffsetY = seededRandom(index * 5348) * 100 - 50;

    const spreadX = Math.cos(randomAngle) * randomDistance + randomOffsetX;
    const spreadY = Math.sin(randomAngle) * randomDistance + randomOffsetY;

    // Get the current visual position from the transform
    if (imageRef.current) {
      const transform = imageRef.current.style.transform;
      const match = transform.match(
        /translate\(([^,]+),\s*([^)]+)\)\s*rotate\(([^)]+)\)/
      );
      if (match) {
        const currentX = parseFloat(match[1]) - spreadX;
        const currentY = parseFloat(match[2]) - spreadY;
        const currentRotation = parseFloat(match[3]);
        setPosition({ x: currentX, y: currentY });
        setRotation(currentRotation);
        setInitialPosition({ x: currentX, y: currentY });
        lastPositionRef.current = { x: currentX, y: currentY };
      } else {
        setInitialPosition(position);
        lastPositionRef.current = position;
      }
    } else {
      setInitialPosition(position);
      lastPositionRef.current = position;
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    onBringToFront(index);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const now = Date.now();
    const deltaTime = now - lastTimeRef.current;
    lastTimeRef.current = now;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const newX = initialPosition.x + deltaX;
    const newY = initialPosition.y + deltaY;

    // Calculate velocity with time-based smoothing
    const velocityX = (newX - lastPositionRef.current.x) / (deltaTime || 1);
    const velocityY = (newY - lastPositionRef.current.y) / (deltaTime || 1);

    velocityRef.current = {
      x: velocityX * 16, // Normalize to ~60fps
      y: velocityY * 16,
    };

    lastPositionRef.current = { x: newX, y: newY };
    setPosition({ x: newX, y: newY });

    // Natural rotation based on horizontal movement
    const rotationInfluence = velocityX * 0.5;
    setRotation((prev) => prev + rotationInfluence);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Only apply momentum if velocity is significant
    if (
      Math.abs(velocityRef.current.x) > 0.5 ||
      Math.abs(velocityRef.current.y) > 0.5
    ) {
      setIsSettling(true);
    }
  };

  // Touch events
  const handleTouchStart = (e) => {
    const touch = e.touches[0];

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsSettling(false);
    velocityRef.current = { x: 0, y: 0 };
    lastTimeRef.current = Date.now();

    // Calculate spread position based on scroll
    const spreadAmount = scrollProgress * 180;
    const angle = (index / totalImages) * Math.PI * 2;
    const spreadX = Math.cos(angle) * spreadAmount;
    const spreadY = Math.sin(angle) * spreadAmount;

    // Get the current visual position from the transform
    if (imageRef.current) {
      const transform = imageRef.current.style.transform;
      const match = transform.match(
        /translate\(([^,]+),\s*([^)]+)\)\s*rotate\(([^)]+)\)/
      );
      if (match) {
        const currentX = parseFloat(match[1]) - spreadX;
        const currentY = parseFloat(match[2]) - spreadY;
        const currentRotation = parseFloat(match[3]);
        setPosition({ x: currentX, y: currentY });
        setRotation(currentRotation);
        setInitialPosition({ x: currentX, y: currentY });
        lastPositionRef.current = { x: currentX, y: currentY };
      } else {
        setInitialPosition(position);
        lastPositionRef.current = position;
      }
    } else {
      setInitialPosition(position);
      lastPositionRef.current = position;
    }

    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    onBringToFront(index);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const now = Date.now();
    const deltaTime = now - lastTimeRef.current;
    lastTimeRef.current = now;

    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;

    const newX = initialPosition.x + deltaX;
    const newY = initialPosition.y + deltaY;

    const velocityX = (newX - lastPositionRef.current.x) / (deltaTime || 1);
    const velocityY = (newY - lastPositionRef.current.y) / (deltaTime || 1);

    velocityRef.current = {
      x: velocityX * 16,
      y: velocityY * 16,
    };

    lastPositionRef.current = { x: newX, y: newY };
    setPosition({ x: newX, y: newY });

    const rotationInfluence = velocityX * 0.5;
    setRotation((prev) => prev + rotationInfluence);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (
      Math.abs(velocityRef.current.x) > 0.5 ||
      Math.abs(velocityRef.current.y) > 0.5
    ) {
      setIsSettling(true);
    }
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

  // Calculate spread position based on scroll with random distribution
  const spreadAmount = scrollProgress * 300; // Increased spread distance

  // Use seeded random for consistent but random spread positions
  const randomAngle = seededRandom(index * 1337) * Math.PI * 2;
  const randomDistance = seededRandom(index * 2674) * spreadAmount;
  const randomOffsetX = seededRandom(index * 4011) * 100 - 50; // Additional random offset
  const randomOffsetY = seededRandom(index * 5348) * 100 - 50;

  const spreadX = Math.cos(randomAngle) * randomDistance + randomOffsetX;
  const spreadY = Math.sin(randomAngle) * randomDistance + randomOffsetY;

  const finalX = position.x + spreadX;
  const finalY = position.y + spreadY;

  return (
    <div
      ref={imageRef}
      className={`absolute select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        transform: `translate(${finalX}px, ${finalY}px) rotate(${rotation}deg)`,
        transformOrigin: "center center",
        zIndex: zIndex,
        touchAction: "none",
        transition:
          isDragging || isSettling
            ? "none"
            : "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {image?.asset?.url ? (
        <img
          src={image.asset.url}
          alt={`Stack image ${index + 1}`}
          className="pointer-events-none block"
          draggable={false}
          style={{
            maxWidth: "200px",
            maxHeight: "300px",
            width: "auto",
            height: "auto",
          }}
        />
      ) : image?.asset?.playbackId ? (
        <VideoThumbnail
          playbackId={image.asset.playbackId}
          timestamp={image.timestamp || "0:00"}
          isHovered={true}
          className="pointer-events-none block"
          style={{
            maxWidth: "200px",
            maxHeight: "300px",
            width: "auto",
            height: "auto",
          }}
          maxResolution="270p"
          loopDuration={60}
        />
      ) : (
        <div className="w-48 h-64 bg-gray-100 flex items-center justify-center text-gray-500">
          Item {index + 1}
        </div>
      )}
    </div>
  );
}

// Main DraggableStack component
export default function DraggableStack({
  stackImages = [],
  imagePalettes = [],
  imagePalette,
}) {
  const safeStackImages = stackImages || [];
  const [maxZIndex, setMaxZIndex] = useState(safeStackImages.length);
  const cardRefs = useRef([]);
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Array to store base positions for all images
  const [basePositions, setBasePositions] = useState(() =>
    safeStackImages.map((_, index) => ({
      x: index * 5 + seededRandom(index * 123) * 30 - 15,
      y: index * 5 + seededRandom(index * 456) * 30 - 15,
      rotation: index * 2 - 4 + seededRandom(index * 789) * 10 - 5,
    }))
  );

  // Combine colors from multiple palettes or use single palette for backward compatibility
  const paletteColors = (() => {
    const allColors = [];

    // If imagePalettes array is provided, use it
    if (imagePalettes && imagePalettes.length > 0) {
      imagePalettes.forEach((palette, paletteIndex) => {
        if (palette) {
          const colorTypes = [
            { name: "Dominant", key: "dominant" },
            { name: "Vibrant", key: "vibrant" },
            { name: "Light Vibrant", key: "lightVibrant" },
            { name: "Dark Vibrant", key: "darkVibrant" },
            { name: "Muted", key: "muted" },
            { name: "Light Muted", key: "lightMuted" },
            { name: "Dark Muted", key: "darkMuted" },
          ];

          colorTypes.forEach(({ name, key }) => {
            if (palette[key]?.background) {
              allColors.push({
                name: `Image ${
                  paletteIndex === 0 ? 1 : paletteIndex === 1 ? 5 : 9
                } - ${name}`,
                color: palette[key].background,
              });
            }
          });
        }
      });
    }
    // Fall back to single imagePalette for backward compatibility
    else if (imagePalette) {
      const colorTypes = [
        { name: "Dominant", key: "dominant" },
        { name: "Vibrant", key: "vibrant" },
        { name: "Light Vibrant", key: "lightVibrant" },
        { name: "Dark Vibrant", key: "darkVibrant" },
        { name: "Muted", key: "muted" },
        { name: "Light Muted", key: "lightMuted" },
        { name: "Dark Muted", key: "darkMuted" },
      ];

      colorTypes.forEach(({ name, key }) => {
        if (imagePalette[key]?.background) {
          allColors.push({
            name: name,
            color: imagePalette[key].background,
          });
        }
      });
    }

    // Remove duplicates based on color value
    return allColors.filter(
      (item, index, self) =>
        index === self.findIndex((c) => c.color === item.color)
    );
  })();

  // Set initial selected color from first available color
  const [selectedColor, setSelectedColor] = useState(
    paletteColors[0]?.color || null
  );

  // State for mobile dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handle scroll for fade-in effect and image spreading
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate visibility percentage
      const visibleHeight =
        Math.min(windowHeight, rect.bottom) - Math.max(0, rect.top);
      const sectionHeight = rect.height;
      const visibilityPercentage = Math.max(
        0,
        Math.min(1, visibleHeight / sectionHeight)
      );

      // Only change color when 60% of the stack is visible
      const colorChangeThreshold = 0.6;
      const shouldChangeColor = visibilityPercentage >= colorChangeThreshold;

      // For spreading effect, use the original progress calculation
      const scrollStart = windowHeight;
      const scrollEnd = windowHeight * 0.2;
      const spreadProgress = Math.max(
        0,
        Math.min(1, (scrollStart - rect.top) / (scrollStart - scrollEnd))
      );

      setScrollProgress(spreadProgress);

      // Store color change state separately
      if (!sectionRef.current.colorChangeState) {
        sectionRef.current.colorChangeState = false;
      }

      if (shouldChangeColor !== sectionRef.current.colorChangeState) {
        sectionRef.current.colorChangeState = shouldChangeColor;
        // Trigger color change using the stored selected color
        const currentColor = sectionRef.current.selectedColor;
        if (shouldChangeColor && currentColor) {
          const hex = currentColor.replace("#", "");
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);

          document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          document.body.style.color = brightness < 128 ? "white" : "black";
        } else {
          document.body.style.backgroundColor = "";
          document.body.style.color = "";
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedColor]);

  // Store selected color for manual color changes
  useEffect(() => {
    if (!selectedColor || !sectionRef.current) return;

    // Store the selected color on the ref for the scroll handler to use
    sectionRef.current.selectedColor = selectedColor;
  }, [selectedColor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, []);

  const handleColorChange = (color) => {
    setSelectedColor(color);

    // Immediately apply color if we're past the 60% threshold
    if (sectionRef.current && sectionRef.current.colorChangeState) {
      const hex = color.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      document.body.style.color = brightness < 128 ? "white" : "black";
    }
  };

  const handleBringToFront = (imageIndex) => {
    setMaxZIndex((prev) => prev + 1);
    if (cardRefs.current[imageIndex]?.current) {
      cardRefs.current[imageIndex].current.style.zIndex = maxZIndex + 1;
    }
  };

  const updatePositions = (newPositions) => {
    setBasePositions(newPositions);
  };

  const handleExpand = () => {
    const newPositions = safeStackImages.map((_, index) => {
      const gridPosition = getExpandedPosition(index);
      return {
        x: gridPosition.x,
        y: gridPosition.y,
        rotation: 0,
      };
    });

    // Update the base positions array
    setBasePositions(newPositions);

    // Apply visual transform
    safeStackImages.forEach((_, index) => {
      const gridPosition = getExpandedPosition(index);

      if (cardRefs.current[index]?.current) {
        const imageComponent = cardRefs.current[index].current;

        // Apply transform immediately
        imageComponent.style.transition =
          "transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1)";
        imageComponent.style.transform = `translate(${gridPosition.x}px, ${gridPosition.y}px) rotate(0deg)`;

        setTimeout(() => {
          if (imageComponent) {
            imageComponent.style.transition = "";
          }
        }, 700);
      }
    });
  };

  const handleCollect = () => {
    const newPositions = safeStackImages.map((_, index) => {
      const centerPosition = getCollectedPosition(index);
      const randomRotation = index * 2 - 4 + seededRandom(index * 789) * 10 - 5;
      return {
        x: centerPosition.x,
        y: centerPosition.y,
        rotation: randomRotation,
      };
    });

    // Update the base positions array
    setBasePositions(newPositions);

    // Apply visual transform
    safeStackImages.forEach((_, index) => {
      const centerPosition = getCollectedPosition(index);
      const randomRotation = index * 2 - 4 + seededRandom(index * 789) * 10 - 5;

      if (cardRefs.current[index]?.current) {
        const imageComponent = cardRefs.current[index].current;

        // Apply transform immediately
        imageComponent.style.transition =
          "transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1)";
        imageComponent.style.transform = `translate(${centerPosition.x}px, ${centerPosition.y}px) rotate(${randomRotation}deg)`;

        setTimeout(() => {
          if (imageComponent) {
            imageComponent.style.transition = "";
          }
        }, 700);
      }
    });
  };

  const getExpandedPosition = (index) => {
    const cols = Math.ceil(Math.sqrt(safeStackImages.length));
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      x: col * 200 - cols * 100 + 100,
      y: row * 200 - Math.ceil(safeStackImages.length / cols) * 100 + 100,
    };
  };

  const getCollectedPosition = (index) => {
    return {
      x: index * 3 + seededRandom(index * 321) * 12 - 6,
      y: index * 3 + seededRandom(index * 654) * 12 - 6,
    };
  };

  if (!safeStackImages || safeStackImages.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className="w-full sticky top-0 pt-4 z-50 mt-20"
        style={{
          backgroundColor:
            sectionRef.current?.colorChangeState && selectedColor
              ? selectedColor
              : "transparent",
          transition: "background-color 1s ease-out",
        }}
      >
        <div
          className="grid grid-cols-12 mx-4 border-b pb-4"
          style={{
            transition: "opacity 0.3s ease-out",
          }}
        >
          <h4 className="uppercase text-sm col-span-3 md:col-span-3">stack</h4>
          <div className="col-span-4 md:col-span-3 space-x-4 flex justify-start">
            <button
              className="text-sm opacity-90 hover:opacity-100 transition-opacity inline"
              onClick={handleExpand}
            >
              Expand
            </button>
            <button
              className="text-sm opacity-90 hover:opacity-100 transition-opacity inline"
              onClick={handleCollect}
            >
              Collect
            </button>
          </div>
          {paletteColors.length > 0 && (
            <div className="col-span-5 flex justify-end md:justify-start md:col-span-3">
              {/* Desktop: Inline color buttons */}
              <div className="hidden md:flex gap-1.5">
                {paletteColors.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorChange(item.color)}
                    className={`h-4 w-4 transition-transform cursor-pointer ${
                      selectedColor === item.color
                        ? "scale-125 ring-1 ring-current"
                        : ""
                    }`}
                    style={{ backgroundColor: item.color }}
                    title={item.name}
                    aria-label={`Set background to ${item.name}`}
                  />
                ))}
              </div>

              {/* Mobile: Dropdown */}
              <div className="md:hidden relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100 transition-opacity"
                >
                  <div
                    className="h-4 w-4 rounded ring"
                    style={{ backgroundColor: selectedColor || "#ccc" }}
                  />
                  Colors
                  <svg
                    className={`w-3 h-3 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <div className="flex flex-col gap-1 w-[80px]">
                      {paletteColors.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleColorChange(item.color);
                            setIsDropdownOpen(false);
                          }}
                          className={`h-6 w-full transition-transform cursor-pointer rounded ${
                            selectedColor === item.color
                              ? "ring-1 ring-black"
                              : ""
                          }`}
                          style={{ backgroundColor: item.color }}
                          title={item.name}
                          aria-label={`Set background to ${item.name}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <section ref={sectionRef} className="min-h-screen overflow-hidden px-4">
        <div className="relative w-full min-h-[120svh] flex flex-col items-center justify-center overflow-visible border-b">
          <div className="relative w-full h-full flex items-center justify-center ">
            {safeStackImages.map((image, index) => (
              <DraggableImage
                key={`${image._key || index}`}
                image={image}
                index={index}
                totalImages={safeStackImages.length}
                onBringToFront={handleBringToFront}
                cardRefs={cardRefs}
                scrollProgress={scrollProgress}
                basePositions={basePositions}
                onPositionUpdate={updatePositions}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
