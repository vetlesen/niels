"use client";
import { useState, useRef } from "react";
import MuxPlayer from "@mux/mux-player-react";

export default function ClientMuxPlayer({
  playbackId,
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
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const playerRef = useRef(null);

  const handleError = (event) => {
    console.error("Mux Player Error:", event);
    setError({
      message: event.message || "Video playback error",
      playbackId,
    });
    setIsLoaded(false);
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setIsRetrying(true);
      setError(null);
      setRetryCount((prev) => prev + 1);

      setTimeout(() => {
        setIsRetrying(false);
        setIsLoaded(false);
      }, 1000);
    }
  };

  const handleCanPlay = () => {
    setIsLoaded(true);
    setError(null);
  };

  // Validate playbackId
  if (!playbackId) {
    return (
      <div
        className={`client-mux-player ${className}`}
        style={{
          width: "100%",
          aspectRatio: "16/9",
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
      >
        <div style={{ color: "#ff6b6b", textAlign: "center" }}>
          <div>⚠️ No video available</div>
          <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "8px" }}>
            Missing playback ID
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`client-mux-player relative ${className}`}
      style={{ width: "100%", ...style }}
    >
      {/* Loading placeholder */}
      {!error && !isLoaded && (
        <div className="inset-0" style={{ aspectRatio: "16/9" }}></div>
      )}

      {/* MuxPlayer */}
      {!error && (
        <MuxPlayer
          key={`${playbackId}-${retryCount}`}
          ref={playerRef}
          playbackId={playbackId}
          controls={controls}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline={playsInline}
          preload={preload}
          onCanPlay={handleCanPlay}
          onError={handleError}
          style={{
            width: "100%",
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
          {...props}
        />
      )}
    </div>
  );
}
