"use client";
import { useState, useEffect, useRef } from "react";
import MuxPlayer from "@mux/mux-player-react";

export default function ClientMuxPlayer({
  playbackId,
  aspectRatio = "16:9", // Default aspect ratio
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  playsInline = true,
  preload = "metadata",
  className = "",
  style = {},
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  // Calculate aspect ratio
  const calculateAspectRatio = (ratio) => {
    const [width, height] = ratio.split(":").map(Number);
    return height / width;
  };

  const aspectRatioValue = calculateAspectRatio(aspectRatio);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const calculatedHeight = containerWidth * aspectRatioValue;
        setDimensions({
          width: containerWidth,
          height: calculatedHeight,
        });
      }
    };

    // Initial calculation
    updateDimensions();

    // Update on window resize
    window.addEventListener("resize", updateDimensions);

    // Set loaded after a brief delay to ensure smooth transition
    const timer = setTimeout(() => setIsLoaded(true), 100);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(timer);
    };
  }, [aspectRatioValue]);

  const containerStyle = {
    width: "100%",
    height: dimensions.height || `${100 * aspectRatioValue}vw`,
    maxWidth: style.maxWidth || "800px",
    maxHeight: style.maxHeight || `${800 * aspectRatioValue}px`,
    backgroundColor: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...style,
  };

  const playerStyle = {
    width: "100%",
    height: "100%",
    opacity: isLoaded ? 1 : 0,
    transition: "opacity 0.3s ease-in-out",
  };

  const placeholderStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#666",
    fontSize: "14px",
    opacity: isLoaded ? 0 : 1,
    transition: "opacity 0.3s ease-in-out",
    pointerEvents: "none",
  };

  return (
    <div
      ref={containerRef}
      className={`client-mux-player ${className}`}
      style={containerStyle}
    >
      {/* Placeholder while loading */}
      <div style={placeholderStyle}>
        <div className="animate-pulse bg-gray-800 w-16 h-16 rounded"></div>
      </div>

      {/* MuxPlayer */}
      <MuxPlayer
        playbackId={playbackId}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        preload={preload}
        style={playerStyle}
        onLoadStart={() => setIsLoaded(true)}
        onCanPlay={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
}
