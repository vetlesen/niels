"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";
import { useTheme } from "../contexts/ThemeContext";

function formatDuration(seconds) {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function VideoThumbnail({ playbackId, timestamp, isHovered, className }) {
  const playerRef = useRef(null);
  const playPromiseRef = useRef(null);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handlePlayback = async () => {
      try {
        // Cancel any existing play promise
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current;
          } catch (error) {
            // Ignore errors from cancelled promises
          }
          playPromiseRef.current = null;
        }

        if (isHovered) {
          // Start playing
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
          // Pause and reset
          try {
            player.pause();
            player.currentTime = timestamp
              .split(":")
              .reduce((acc, time) => 60 * acc + +time);
          } catch (error) {
            console.warn("Video pause error:", error);
          }
        }
      } catch (error) {
        console.warn("Video playback error:", error);
      }
    };

    // Small delay to ensure player is ready
    const timeoutId = setTimeout(handlePlayback, 50);
    return () => clearTimeout(timeoutId);
  }, [isHovered, timestamp]);

  return (
    <MuxPlayer
      ref={playerRef}
      src={`https://stream.mux.com/${playbackId}.m3u8?max_resolution=270p`}
      poster={`https://image.mux.com/${playbackId}/thumbnail.jpg?time=${timestamp
        .split(":")
        .reduce((acc, time) => 60 * acc + +time)}`}
      muted
      loop
      playsInline
      preload="metadata"
      startTime={timestamp.split(":").reduce((acc, time) => 60 * acc + +time)}
      endTime={timestamp.split(":").reduce((acc, time) => 60 * acc + +time) + 5}
      style={{ width: "120px", height: "68px" }}
      className={`thumbnail ${className || ""}`}
    />
  );
}

function WorkItem({
  item,
  onMouseEnter,
  onMouseLeave,
  hoveredWork,
  setHoveredThumbnail,
}) {
  const { activeFilter } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const workRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: "0px", // Load when item is 100px away from viewport
        threshold: 0.2,
      }
    );

    if (workRef.current) {
      observer.observe(workRef.current);
    }

    return () => {
      if (workRef.current) {
        observer.unobserve(workRef.current);
      }
    };
  }, []);

  const isHighlighted = item.category === activeFilter;

  return (
    <Link
      ref={workRef}
      key={item._id}
      href={`/work/${item.slug?.current}`}
      className={`group flex flex-col rounded duration-500 ease-in-out ${
        isHighlighted
          ? "cursor-pointer opacity-100"
          : "cursor-default opacity-100"
      }`}
      onMouseEnter={() => onMouseEnter(item._id)}
      onMouseLeave={() => onMouseLeave(null)}
    >
      <div className={`flex flex-row space-x-2 pt-2 px-2 `}>
        <h3
          className={`transition-colors duration-500 ease-in-out ${
            activeFilter === "narrative"
              ? "text-white"
              : activeFilter === "commercial"
              ? ""
              : "text-gray-900"
          }`}
        >
          {item.name}
        </h3>
        {item.title && (
          <h4
            className={`transition-colors duration-500 ease-in-out ${
              activeFilter === "narrative"
                ? "text-white"
                : activeFilter === "commercial"
                ? " "
                : "text-gray-900"
            }`}
          >
            {item.title}
          </h4>
        )}
        {item.type && (
          <p
            className={`opacity-60 transition-colors duration-500 ease-in-out ${
              activeFilter === "narrative"
                ? "text-white"
                : activeFilter === "commercial"
                ? " "
                : "text-gray-900"
            }`}
          >
            {item.type}
          </p>
        )}
        {item.year && (
          <p
            className={`opacity-60 transition-colors duration-500 ease-in-out ${
              activeFilter === "narrative"
                ? "text-white"
                : activeFilter === "commercial"
                ? ""
                : "text-gray-900"
            }`}
          >
            {item.year}
          </p>
        )}
        <p
          className={`opacity-60 transition-colors duration-500 ease-in-out ${
            activeFilter === "narrative"
              ? "text-white"
              : activeFilter === "commercial"
              ? ""
              : "text-gray-900"
          }`}
        >
          {formatDuration(item.video?.asset?.data?.duration)}
        </p>
      </div>
      {item.video?.asset?.playbackId && item.thumbnails && (
        <div
          className={`flex gap-2 bg-black p-2 ${
            item.category !== activeFilter ? "bg-yellow" : ""
          }`}
        >
          {item.thumbnails.map((thumbnail, index) => {
            const thumbnailId = `${item._id}-${index}`;
            return (
              <div
                key={index}
                className="relative mix-blend-difference "
                onMouseEnter={() => setHoveredThumbnail(thumbnailId)}
                onMouseLeave={() => setHoveredThumbnail(null)}
              >
                {thumbnail.type === "image" ? (
                  <img
                    src={`https://image.mux.com/${
                      item.video.asset.playbackId
                    }/thumbnail.jpg?time=${thumbnail.timestamp
                      .split(":")
                      .reduce((acc, time) => 60 * acc + +time)}`}
                    alt={`Thumbnail at ${thumbnail.timestamp}`}
                    style={{ width: "120px", height: "68px" }}
                    className="object-cover"
                  />
                ) : (
                  <VideoThumbnail
                    playbackId={item.video.asset.playbackId}
                    timestamp={thumbnail.timestamp}
                    isHovered={
                      hoveredWork === item._id && item.category === activeFilter
                    }
                    className=""
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </Link>
  );
}

export default function Work({ work }) {
  const [hoveredWork, setHoveredWork] = useState(null);
  const [hoveredThumbnail, setHoveredThumbnail] = useState(null);
  const { activeFilter } = useTheme();

  // Show all work items, but we'll highlight the ones matching the active filter
  const filteredWork = work;

  return (
    <section className="px-2 pb-8">
      {filteredWork.length > 0 ? (
        <>
          {filteredWork.map((item) => (
            <WorkItem
              key={item._id}
              item={item}
              onMouseEnter={setHoveredWork}
              onMouseLeave={setHoveredWork}
              hoveredWork={hoveredWork}
              setHoveredThumbnail={setHoveredThumbnail}
            />
          ))}
        </>
      ) : (
        <p className="text-gray-500 text-center">
          No work found for the selected filter.
        </p>
      )}
    </section>
  );
}
