"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import VideoThumbnail from "./VideoThumbnail";

// Deterministic pseudo-random function
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Individual draggable image component
function DraggableImage({
  image,
  index,
  totalImages,
  position,
  rotation,
  scale,
  onUpdateTransform,
  onBringToFront,
  zIndex,
}) {
  const imageRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [dragState, setDragState] = useState(null);
  const [pinchState, setPinchState] = useState(null);

  // Physics state
  const velocityRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  const lastPositionRef = useRef({ x: position.x, y: position.y });
  const lastTimeRef = useRef(Date.now());

  // Double-tap detection
  const lastTapTimeRef = useRef(0);

  // Handle double tap/click for zoom
  const handleDoubleTap = useCallback(() => {
    const newScale = scale > 1 ? 1 : 2;
    onUpdateTransform(index, { scale: newScale });
    onBringToFront(index);
  }, [scale, index, onUpdateTransform, onBringToFront]);

  // Start drag
  const startDrag = useCallback(
    (clientX, clientY) => {
      // Stop any ongoing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      velocityRef.current = { x: 0, y: 0 };
      lastPositionRef.current = { x: position.x, y: position.y };
      lastTimeRef.current = Date.now();

      setDragState({
        startX: clientX,
        startY: clientY,
        initialX: position.x,
        initialY: position.y,
        initialRotation: rotation,
      });
      setIsDragging(true);
      onBringToFront(index);
    },
    [position, rotation, index, onBringToFront]
  );

  // Update drag position
  const updateDrag = useCallback(
    (clientX, clientY) => {
      if (!dragState) return;

      const now = Date.now();
      const deltaTime = Math.max(1, now - lastTimeRef.current);
      lastTimeRef.current = now;

      const deltaX = clientX - dragState.startX;
      const deltaY = clientY - dragState.startY;

      const newX = dragState.initialX + deltaX;
      const newY = dragState.initialY + deltaY;

      // Calculate velocity for momentum
      velocityRef.current = {
        x: ((newX - lastPositionRef.current.x) / deltaTime) * 16,
        y: ((newY - lastPositionRef.current.y) / deltaTime) * 16,
      };

      lastPositionRef.current = { x: newX, y: newY };

      // Add subtle rotation based on horizontal movement
      const rotationDelta = deltaX * 0.05;
      const newRotation = dragState.initialRotation + rotationDelta;

      onUpdateTransform(index, {
        x: newX,
        y: newY,
        rotation: newRotation,
      });
    },
    [dragState, index, onUpdateTransform]
  );

  // End drag and apply momentum
  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDragState(null);

    // Apply momentum if velocity is significant
    const velocity = velocityRef.current;
    if (Math.abs(velocity.x) > 1 || Math.abs(velocity.y) > 1) {
      const applyMomentum = () => {
        const friction = 0.92;
        const minVelocity = 0.5;

        velocity.x *= friction;
        velocity.y *= friction;

        if (
          Math.abs(velocity.x) < minVelocity &&
          Math.abs(velocity.y) < minVelocity
        ) {
          velocity.x = 0;
          velocity.y = 0;
          return;
        }

        onUpdateTransform(index, {
          x: position.x + velocity.x,
          y: position.y + velocity.y,
          rotation: rotation + velocity.x * 0.05,
        });

        animationFrameRef.current = requestAnimationFrame(applyMomentum);
      };

      animationFrameRef.current = requestAnimationFrame(applyMomentum);
    }
  }, [index, position, rotation, onUpdateTransform]);

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();

      // Check for double-click
      const now = Date.now();
      if (now - lastTapTimeRef.current < 300) {
        handleDoubleTap();
        return;
      }
      lastTapTimeRef.current = now;

      startDrag(e.clientX, e.clientY);
    },
    [startDrag, handleDoubleTap]
  );

  // Touch handlers
  const handleTouchStart = useCallback(
    (e) => {
      e.preventDefault();

      if (e.touches.length === 2) {
        // Start pinch gesture
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        setPinchState({
          initialDistance: distance,
          initialAngle: angle,
          initialScale: scale,
          initialRotation: rotation,
        });
        setIsPinching(true);
        setIsDragging(false);
        setDragState(null);
        onBringToFront(index);
        return;
      }

      // Check for double-tap
      const now = Date.now();
      if (now - lastTapTimeRef.current < 300) {
        handleDoubleTap();
        return;
      }
      lastTapTimeRef.current = now;

      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    },
    [scale, rotation, index, startDrag, handleDoubleTap, onBringToFront]
  );

  const handleTouchMove = useCallback(
    (e) => {
      e.preventDefault();

      if (e.touches.length === 2 && (isPinching || !isDragging)) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        if (!pinchState) {
          // Initialize pinch if not already
          setPinchState({
            initialDistance: distance,
            initialAngle: angle,
            initialScale: scale,
            initialRotation: rotation,
          });
          setIsPinching(true);
          setIsDragging(false);
          setDragState(null);
          return;
        }

        // Calculate scale
        const scaleRatio = distance / pinchState.initialDistance;
        const newScale = Math.max(
          0.5,
          Math.min(3, pinchState.initialScale * scaleRatio)
        );

        // Calculate rotation
        const angleDelta = angle - pinchState.initialAngle;
        const newRotation = pinchState.initialRotation + angleDelta * 0.5;

        onUpdateTransform(index, {
          scale: newScale,
          rotation: newRotation,
        });
        return;
      }

      if (isDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        updateDrag(touch.clientX, touch.clientY);
      }
    },
    [
      isDragging,
      isPinching,
      pinchState,
      scale,
      rotation,
      index,
      updateDrag,
      onUpdateTransform,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    if (isPinching) {
      setIsPinching(false);
      setPinchState(null);
    } else {
      endDrag();
    }
  }, [isPinching, endDrag]);

  // Global event listeners for drag/pinch
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e) => updateDrag(e.clientX, e.clientY);
      const handleMouseUp = endDrag;

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, updateDrag, endDrag]);

  useEffect(() => {
    if (isDragging || isPinching) {
      const handleTouchMoveGlobal = (e) => handleTouchMove(e);
      const handleTouchEndGlobal = handleTouchEnd;

      document.addEventListener("touchmove", handleTouchMoveGlobal, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEndGlobal);
      document.addEventListener("touchcancel", handleTouchEndGlobal);

      return () => {
        document.removeEventListener("touchmove", handleTouchMoveGlobal);
        document.removeEventListener("touchend", handleTouchEndGlobal);
        document.removeEventListener("touchcancel", handleTouchEndGlobal);
      };
    }
  }, [isDragging, isPinching, handleTouchMove, handleTouchEnd]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={imageRef}
      className={`absolute select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: "center center",
        zIndex: zIndex,
        touchAction: "none",
        transition:
          isDragging || isPinching
            ? "none"
            : "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: isDragging || isPinching ? "transform" : "auto",
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
  const { setBackgroundColor } = useTheme();
  const sectionRef = useRef(null);
  const [maxZIndex, setMaxZIndex] = useState(stackImages.length);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Generate target positions for spread (calculated once)
  const spreadTargets = useRef(
    stackImages.map((_, index) => {
      // Create an organic spread pattern using multiple random factors
      const randomAngle = seededRandom(index * 1337) * Math.PI * 2;
      const randomRadius = seededRandom(index * 2674) * 200 + 50;
      const randomOffsetX = seededRandom(index * 4011) * 80 - 40;
      const randomOffsetY = seededRandom(index * 5348) * 80 - 40;

      return {
        x: Math.cos(randomAngle) * randomRadius + randomOffsetX,
        y: Math.sin(randomAngle) * randomRadius + randomOffsetY,
        rotation: seededRandom(index * 789) * 20 - 10,
      };
    })
  );

  // Initialize transforms for all images - start stacked at center
  const [transforms, setTransforms] = useState(() =>
    stackImages.map((_, index) => ({
      x: 0, // Start at center
      y: 0, // Start at center
      rotation: index * 2 - 4 + seededRandom(index * 789) * 8 - 4,
      scale: 1,
      zIndex: stackImages.length - index,
    }))
  );

  // Update transform for a specific image
  const updateTransform = useCallback((index, updates) => {
    setTransforms((prev) => {
      const newTransforms = [...prev];
      newTransforms[index] = {
        ...newTransforms[index],
        ...updates,
      };
      return newTransforms;
    });
    setHasInteracted(true); // Mark as user-interacted
  }, []);

  // Bring image to front
  const handleBringToFront = useCallback(
    (index) => {
      setMaxZIndex((prev) => {
        const newZ = prev + 1;
        updateTransform(index, { zIndex: newZ });
        return newZ;
      });
    },
    [updateTransform]
  );

  // Expand images into grid
  const handleExpand = useCallback(() => {
    const cols = Math.ceil(Math.sqrt(stackImages.length));
    const cellSize = 220;
    const startX = -(cols * cellSize) / 2 + cellSize / 2;
    const startY =
      -(Math.ceil(stackImages.length / cols) * cellSize) / 2 + cellSize / 2;

    const newTransforms = stackImages.map((_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return {
        ...transforms[index],
        x: startX + col * cellSize,
        y: startY + row * cellSize,
        rotation: 0,
        scale: 1,
      };
    });

    setTransforms(newTransforms);
    setHasInteracted(true);
  }, [stackImages, transforms]);

  // Collect images to center
  const handleCollect = useCallback(() => {
    const newTransforms = stackImages.map((_, index) => ({
      ...transforms[index],
      x: seededRandom(index * 321) * 10 - 5,
      y: seededRandom(index * 654) * 10 - 5,
      rotation: seededRandom(index * 987) * 15 - 7.5,
      scale: 1,
    }));

    setTransforms(newTransforms);
    setHasInteracted(true);
  }, [stackImages, transforms]);

  // Handle color palettes
  const paletteColors = (() => {
    const allColors = [];

    if (imagePalettes && imagePalettes.length > 0) {
      imagePalettes.forEach((palette, paletteIndex) => {
        // Check if this is a plain hex string (colorOverwrite)
        if (typeof palette === "string" && palette.startsWith("#")) {
          allColors.push({
            name: "Custom Color",
            color: palette,
          });
        } else if (palette) {
          // Process palette object
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
                name: `Image ${paletteIndex + 1} - ${name}`,
                color: palette[key].background,
              });
            }
          });
        }
      });
    } else if (imagePalette) {
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
          allColors.push({ name, color: imagePalette[key].background });
        }
      });
    }

    return allColors.filter(
      (item, index, self) =>
        index === self.findIndex((c) => c.color === item.color)
    );
  })();

  const [selectedColor, setSelectedColor] = useState(
    paletteColors[0]?.color || null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handle scroll for animation and color change
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const visibleHeight =
        Math.min(windowHeight, rect.bottom) - Math.max(0, rect.top);
      const visibilityPercentage = Math.max(
        0,
        Math.min(1, visibleHeight / rect.height)
      );

      // Calculate scroll progress for spread animation
      const spreadStart = 0.3;
      const spreadEnd = 0.8;
      const delayThreshold = 0.25;

      if (visibilityPercentage >= delayThreshold) {
        const adjustedProgress = Math.max(
          0,
          Math.min(
            1,
            (visibilityPercentage - spreadStart) / (spreadEnd - spreadStart)
          )
        );

        const easedProgress = 1 - Math.pow(1 - adjustedProgress, 3);
        setScrollProgress(easedProgress);
      } else {
        setScrollProgress(0);
      }

      // Color change at 60% visibility - using ref to avoid closure issues
      const shouldActivateColor =
        visibilityPercentage >= 0.6 && rect.top < windowHeight;

      // Initialize colorChangeState on ref if not present
      if (!sectionRef.current.colorChangeState) {
        sectionRef.current.colorChangeState = false;
      }

      // 🔍 DEBUG LOGS
      console.log("🎨 DraggableStack Scroll Debug:", {
        visibilityPercentage: visibilityPercentage.toFixed(2),
        shouldActivateColor,
        currentColorChangeState: sectionRef.current.colorChangeState,
        storedColorOnRef: sectionRef.current.selectedColor,
        selectedColorState: selectedColor,
        willTriggerChange:
          shouldActivateColor !== sectionRef.current.colorChangeState,
      });

      // Only trigger if state actually changed
      if (shouldActivateColor !== sectionRef.current.colorChangeState) {
        sectionRef.current.colorChangeState = shouldActivateColor;
        // Use the stored selectedColor from ref
        const currentColor = sectionRef.current.selectedColor;

        // 🔍 DEBUG LOG WHEN CHANGING
        console.log("🚀 DraggableStack calling setBackgroundColor:", {
          shouldActivateColor,
          currentColor,
          callingWith:
            shouldActivateColor && currentColor ? currentColor : null,
        });

        if (shouldActivateColor && currentColor) {
          setBackgroundColor(currentColor);
        } else {
          setBackgroundColor(null);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [setBackgroundColor, selectedColor]);

  // Store selected color on ref for scroll handler to use
  useEffect(() => {
    if (!selectedColor || !sectionRef.current) return;
    sectionRef.current.selectedColor = selectedColor;
    console.log("💾 Stored color on ref:", selectedColor);
  }, [selectedColor]);

  // Apply scroll-based spreading to transforms (only if user hasn't interacted)
  useEffect(() => {
    if (hasInteracted) return; // Don't override user interactions

    const newTransforms = stackImages.map((_, index) => {
      const target = spreadTargets.current[index];

      // Stagger the animation for each card
      const staggerDelay = index * 0.05;
      const staggeredProgress = Math.max(
        0,
        Math.min(1, scrollProgress - staggerDelay)
      );

      return {
        x: target.x * staggeredProgress,
        y: target.y * staggeredProgress,
        rotation: target.rotation * staggeredProgress,
        scale: 1,
        zIndex: stackImages.length - index,
      };
    });

    setTransforms(newTransforms);
  }, [scrollProgress, stackImages, hasInteracted]);

  const handleColorChange = useCallback(
    (color) => {
      console.log("🎨 User clicked color button:", color);
      setSelectedColor(color);
      // Manually apply color if section is in view
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const visibleHeight =
          Math.min(windowHeight, rect.bottom) - Math.max(0, rect.top);
        const visibilityPercentage = Math.max(
          0,
          Math.min(1, visibleHeight / rect.height)
        );
        const isScrolledIntoSection = rect.top < windowHeight;

        console.log("🎨 Manual color change check:", {
          visibilityPercentage: visibilityPercentage.toFixed(2),
          isScrolledIntoSection,
          willApply: visibilityPercentage >= 0.6 && isScrolledIntoSection,
        });

        if (visibilityPercentage >= 0.6 && isScrolledIntoSection) {
          console.log("🚀 Manual setBackgroundColor:", color);
          setBackgroundColor(color);
        }
      }
    },
    [setBackgroundColor]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      console.log("🧹 DraggableStack cleanup - resetting background");
      setBackgroundColor(null);
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, []);

  if (!stackImages || stackImages.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className="w-full sticky top-0 pt-4 z-[9999] mt-20 transition-colors duration-300"
        style={{
          backgroundColor:
            sectionRef.current?.colorChangeState && selectedColor
              ? selectedColor
              : "#202020",
        }}
      >
        <div className="grid grid-cols-12 mx-4 border-b pb-4">
          <h4 className="uppercase text-sm col-span-3">stack</h4>
          <div className="col-span-4 md:col-span-3 space-x-4 flex justify-start">
            <button
              className="text-sm opacity-90 hover:opacity-100 transition-opacity"
              onClick={handleExpand}
            >
              Expand
            </button>
            <button
              className="text-sm opacity-90 hover:opacity-100 transition-opacity"
              onClick={handleCollect}
            >
              Collect
            </button>
          </div>
          {paletteColors.length > 0 && (
            <div className="col-span-2 flex justify-end md:justify-start md:col-span-3">
              {/* Desktop: Color buttons */}
              <div className="hidden xl:flex gap-1.5">
                {paletteColors.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorChange(item.color)}
                    className={`h-4 transition-all duration-300 cursor-pointer ${
                      selectedColor === item.color
                        ? "w-16 ring-1 ring-current"
                        : "w-4"
                    }`}
                    style={{ backgroundColor: item.color }}
                    title={item.name}
                    aria-label={`Set background to ${item.name}`}
                  />
                ))}
              </div>

              {/* Mobile: Dropdown */}
              <div className="xl:hidden relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100 transition-opacity"
                >
                  <div
                    className="h-4 w-4 ring-1 ring-current"
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
                  <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg p-2 z-50">
                    <div className="flex flex-col gap-1">
                      {paletteColors.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleColorChange(item.color);
                            setIsDropdownOpen(false);
                          }}
                          className={`h-8 w-24 rounded transition-all ${
                            selectedColor === item.color
                              ? "ring-2 ring-offset-2 ring-black"
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
          <button className="col-start-11 text-sm">Random</button>
        </div>
      </div>

      <section ref={sectionRef} className="min-h-screen px-4 overflow-hidden">
        <div className="relative w-full min-h-[120vh] flex items-center justify-center">
          <div className="relative w-0 h-0 flex items-center justify-center">
            {stackImages.map((image, index) => (
              <DraggableImage
                key={image._key || `img-${index}`}
                image={image}
                index={index}
                totalImages={stackImages.length}
                position={{ x: transforms[index].x, y: transforms[index].y }}
                rotation={transforms[index].rotation}
                scale={transforms[index].scale}
                zIndex={transforms[index].zIndex}
                onUpdateTransform={updateTransform}
                onBringToFront={handleBringToFront}
              />
            ))}
          </div>
        </div>
      </section>
      <div className="mx-4 border-b" />
    </>
  );
}
