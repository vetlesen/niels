"use client";
import { useState, useRef } from "react";
import MuxPlayer from "@mux/mux-player-react";

export default function ClientMuxPlayer({
  playbackId,
  controls = true,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  preload = "metadata",
  className = "",
  style = {},
  aspectRatio = null,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoAspectRatio, setVideoAspectRatio] = useState(
    aspectRatio || "16/9"
  );
  const playerRef = useRef(null);
  const containerRef = useRef(null);

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
    // Get video dimensions from the player element
    if (playerRef.current) {
      const videoElement = playerRef.current.querySelector("video");
      if (videoElement && videoElement.videoWidth && videoElement.videoHeight) {
        const ratio = videoElement.videoWidth / videoElement.videoHeight;
        setVideoAspectRatio(ratio.toString());
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (!hasUserInteracted) {
        // First user interaction: restart from beginning with sound
        playerRef.current.currentTime = 0;
        playerRef.current.muted = false;
        setIsMuted(false);
        setHasUserInteracted(true);
        playerRef.current.play();
      } else {
        // Normal play/pause toggle after first interaction
        if (isPlaying) {
          playerRef.current.pause();
        } else {
          playerRef.current.play();
        }
      }
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
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
      ref={containerRef}
      className={`client-mux-player relative ${className}`}
      style={{ width: "100%", aspectRatio: videoAspectRatio, ...style }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Custom Play/Pause Button */}
      {isLoaded && (
        <div
          className="absolute inset-0 z-50 flex justify-center items-center group hover:mix-blend-normal mix-blend-difference pointer-events-none"
          onClick={togglePlayPause}
          style={{
            opacity:
              !hasUserInteracted || (hasUserInteracted && isHovering) ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <button className="pointer-events-auto bg-opacity-50 hover:bg-opacity-70 cursor-pointer transition-all duration-300 h-[70%] w-full items-center flex justify-center">
            <div className="p-1 w-fit group-hover:text-black group-hover:bg-white">
              {!hasUserInteracted ? "Play" : isPlaying ? "Pause" : "Play"}
            </div>
          </button>
        </div>
      )}

      {/* Loading placeholder */}
      {!error && !isLoaded && <div className="absolute inset-0"></div>}

      {/* MuxPlayer */}
      {!error && (
        <MuxPlayer
          key={`${playbackId}-${retryCount}`}
          ref={playerRef}
          playbackId={playbackId}
          autoPlay={autoPlay}
          muted={isMuted}
          loop={loop}
          playsInline={playsInline}
          preload={preload}
          onCanPlay={handleCanPlay}
          onError={handleError}
          onPlay={handlePlay}
          onPause={handlePause}
          accentColor="#202020"
          className={`custom-player ${!hasUserInteracted ? "no-controls" : ""}`}
          style={{
            width: "100%",
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
          {...props}
        />
      )}
    </div>
  );
}
