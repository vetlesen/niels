"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function VideoSphere({ videoUrl, videoRef, isHLS }) {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let hls = null;
    let videoTexture = null;
    let textureCreationTimeout = null;

    const initVideo = async () => {
      try {
        // Create video element
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.preload = "auto";

        // Mobile-specific attributes
        video.setAttribute("webkit-playsinline", "true");
        video.setAttribute("playsinline", "true");

        // Store reference so parent can access it
        videoRef.current = video;

        // Create texture immediately - VideoTexture will handle updates
        videoTexture = new THREE.VideoTexture(video);
        videoTexture.colorSpace = THREE.SRGBColorSpace;
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.generateMipmaps = false;
        videoTexture.format = THREE.RGBAFormat;

        setTexture(videoTexture);
        console.log("✓ Video texture created");

        // Check if it's an HLS stream
        if (videoUrl.includes(".m3u8") || isHLS) {
          console.log("Loading HLS stream from Mux...");

          // IMPORTANT: Check for native HLS support FIRST (Safari/iOS)
          // Native HLS is more reliable on mobile Safari than HLS.js
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            console.log("Using native HLS support (Safari/iOS)");
            video.src = videoUrl;
            video.load(); // Explicitly load the video
          } else {
            // Fallback to HLS.js for browsers without native HLS support
            const Hls = (await import("hls.js")).default;

            if (Hls.isSupported()) {
              console.log("Using HLS.js");
              hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90,
                // Mobile-specific optimizations
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                maxBufferSize: 60 * 1000 * 1000,
                maxBufferHole: 0.5,
                // Additional mobile optimizations
                startLevel: -1, // Auto quality selection
                capLevelToPlayerSize: true,
                maxLoadingDelay: 4,
                minAutoBitrate: 0,
                // Prevent stalling
                liveSyncDurationCount: 3,
                liveMaxLatencyDurationCount: 10,
              });

              hls.loadSource(videoUrl);
              hls.attachMedia(video);

              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log("✓ HLS manifest loaded");
              });

              hls.on(Hls.Events.ERROR, (event, data) => {
                console.error("HLS error:", data);
                if (data.fatal) {
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      console.error(
                        "Fatal network error, trying to recover..."
                      );
                      hls.startLoad();
                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      console.error("Fatal media error, trying to recover...");
                      hls.recoverMediaError();
                      break;
                    default:
                      console.error("Fatal error, cannot recover");
                      setError("Failed to load video stream");
                      break;
                  }
                }
              });
            } else {
              console.error("HLS is not supported in this browser");
              setError("HLS not supported");
              return;
            }
          }
        } else {
          // Regular video file (MP4, WebM, etc.)
          console.log("Loading regular video file...");
          video.src = videoUrl;
          video.load(); // Explicitly load the video
        }
      } catch (err) {
        console.error("Error initializing video:", err);
        setError(err.message);
      }
    };

    initVideo();

    // Cleanup
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load(); // Reset video element
      }
      if (hls) {
        hls.destroy();
      }
      if (videoTexture) {
        videoTexture.dispose();
      }
      videoRef.current = null;
    };
  }, [videoUrl, videoRef, isHLS]);

  if (error) {
    return (
      <mesh>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial color="#ff0000" side={THREE.BackSide} />
      </mesh>
    );
  }

  if (!texture) return null;

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        toneMapped={false}
        transparent={false}
      />
    </mesh>
  );
}

export default function Video360Player({ videoUrl, isHLS = false }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for video to be ready and autoplay
    const checkVideo = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        setIsLoading(false);
        clearInterval(checkVideo);

        // Autoplay the video
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Autoplay failed:", error);
          });
      }
    }, 100);

    return () => clearInterval(checkVideo);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Error playing video:", error);
          });
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  return (
    <div
      className="relative bg-black/5"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute h-full w-full flex justify-center items-center">
          <span className="animate-spin">Loading</span>
        </div>
      )}

      <Canvas
        camera={{
          fov: 75,
          position: [0, 0, 0.1],
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.NoToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <VideoSphere videoUrl={videoUrl} videoRef={videoRef} isHLS={isHLS} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={-0.5}
          minDistance={0.1}
          maxDistance={10}
        />
      </Canvas>

      {/* Controls */}
      <div className="absolute top-2 left-2 flex gap-2 z-[1000]">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="font-normal text-sm px-2 py-1 bg-black/80 text-white hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={toggleMute}
          disabled={isLoading}
          className="font-normal text-sm px-2 py-1 bg-black/80 text-white hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
      </div>
    </div>
  );
}
