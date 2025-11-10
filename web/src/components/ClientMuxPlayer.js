"use client";
import { useState, useRef, useEffect } from "react";
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
  const [showControls, setShowControls] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

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
    // Show controls briefly when playing
    setShowControls(true);
    // Start fade-out timer after 2 seconds
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }
    fadeTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  const handlePause = () => {
    setIsPlaying(false);
    // Show controls when paused
    setShowControls(true);
    // On touch devices, fade out controls even when paused
    if (isTouchDevice) {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      fadeTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    } else {
      // On desktop, clear any existing fade-out timer and keep controls visible
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    }
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
        // Show controls and start fade-out timer
        setShowControls(true);
        if (fadeTimeoutRef.current) {
          clearTimeout(fadeTimeoutRef.current);
        }
        fadeTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 2000);
      } else {
        // Normal play/pause toggle after first interaction
        if (isPlaying) {
          playerRef.current.pause();
        } else {
          playerRef.current.play();
        }

        // On touch devices, always fade out controls after interaction
        if (isTouchDevice) {
          setShowControls(true);
          if (fadeTimeoutRef.current) {
            clearTimeout(fadeTimeoutRef.current);
          }
          fadeTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
          }, 2000);
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

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          navigator.msMaxTouchPoints > 0
      );
    };
    checkTouchDevice();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

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
              !hasUserInteracted ||
              !isPlaying ||
              (hasUserInteracted && (isHovering || showControls))
                ? 1
                : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <button
            className="pointer-events-auto bg-opacity-50 hover:bg-opacity-70 cursor-pointer transition-all duration-300 h-[100px] md:h-[70%] w-full items-center flex justify-center"
            style={{
              opacity: hasUserInteracted && isPlaying ? 0 : 1,
              transition: "opacity 0.3s ease-in-out",
            }}
          >
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
