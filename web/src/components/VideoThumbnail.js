"use client";
import { useRef, useEffect } from "react";
import MuxPlayer from "@mux/mux-player-react";

export default function VideoThumbnail({
  playbackId,
  timestamp = "0:00",
  isHovered = false,
  className = "",
  style = {},
  maxResolution = "270p",
  loopDuration = 5,
}) {
  const playerRef = useRef(null);
  const playPromiseRef = useRef(null);

  // Convert timestamp string (MM:SS) to seconds
  const timestampToSeconds = (ts) => {
    return ts.split(":").reduce((acc, time) => 60 * acc + +time);
  };

  const startTimeSeconds = timestampToSeconds(timestamp);
  const endTimeSeconds = startTimeSeconds + loopDuration;

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handlePlayback = async () => {
      try {
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current;
          } catch (error) {
            // Ignore errors from cancelled promises
          }
          playPromiseRef.current = null;
        }

        if (isHovered) {
          try {
            playPromiseRef.current = player.play();
            if (playPromiseRef.current) {
              await playPromiseRef.current;
            }
          } catch (error) {
            if (
              error.name !== "AbortError" &&
              error.name !== "NotAllowedError"
            ) {
              console.warn("Video play error:", error);
            }
          }
        } else {
          try {
            player.pause();
            player.currentTime = startTimeSeconds;
          } catch (error) {
            console.warn("Video pause error:", error);
          }
        }
      } catch (error) {
        console.warn("Video playback error:", error);
      }
    };

    const timeoutId = setTimeout(handlePlayback, 50);
    return () => clearTimeout(timeoutId);
  }, [isHovered, startTimeSeconds]);

  return (
    <MuxPlayer
      ref={playerRef}
      src={`https://stream.mux.com/${playbackId}.m3u8?max_resolution=${maxResolution}`}
      poster={`https://image.mux.com/${playbackId}/thumbnail.jpg?time=${startTimeSeconds}`}
      muted
      loop
      playsInline
      preload="none"
      startTime={startTimeSeconds}
      endTime={endTimeSeconds}
      className={`thumbnail ${className}`}
      style={style}
    />
  );
}
