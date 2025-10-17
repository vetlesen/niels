"use client";
import { useState, useEffect, useRef } from "react";
import { getWork } from "../queries/getWork";
import MuxPlayer from "@mux/mux-player-react";
import Link from "next/link";
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
      playbackId={playbackId}
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

export default function Home() {
  const [work, setWork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredWork, setHoveredWork] = useState(null);
  const [hoveredThumbnail, setHoveredThumbnail] = useState(null);
  const { activeFilter, setFilter } = useTheme();

  useEffect(() => {
    async function fetchWork() {
      try {
        const workData = await getWork();
        setWork(workData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching work:", error);
        setLoading(false);
      }
    }

    fetchWork();
  }, []);

  return (
    <main>
      <section className="h-[50svh] flex justify-start items-center px-4">
        <div className="space-x-2 flex sticky top-2">
          <button
            onClick={() => setFilter("both")}
            className="flex flex-row gap-2 items-baseline uppercase"
          >
            <div
              className={`w-3 h-3 flex ${
                activeFilter === "both"
                  ? activeFilter === "narrative"
                    ? "bg-white border border-white  "
                    : "bg-black border border-black text-white"
                  : " border"
              }`}
            />
            Both
          </button>
          <button
            onClick={() => setFilter("narrative")}
            className="flex flex-row gap-2 items-baseline uppercase"
          >
            <div
              className={`w-3 h-3 flex ${
                activeFilter === "narrative"
                  ? "bg-white border border-white  "
                  : " border"
              }`}
            />
            Narrative
          </button>
          <button
            onClick={() => setFilter("commercial")}
            className="flex flex-row gap-2 items-baseline uppercase"
          >
            <div
              className={`w-3 h-3 flex ${
                activeFilter === "commercial"
                  ? activeFilter === "narrative"
                    ? "bg-white border border-white  "
                    : "bg-black border border-black text-white"
                  : " border"
              }`}
            />
            Commercial
          </button>
        </div>
      </section>

      {/* DISPLAY THE WORK HERE */}
      <section className="px-2 pb-8">
        {loading ? (
          <p>Loading work...</p>
        ) : (
          <>
            {work.map((item) => (
              <Link
                key={item._id}
                href={`/work/${item.slug?.current}`}
                className={`group flex flex-col cursor-pointer rounded  duration-500 ease-in-out hover:opacity-80 ${
                  activeFilter !== "both" && item.category !== activeFilter
                    ? "opacity-10 cursor-none pointer-events-none"
                    : ""
                }`}
                onMouseEnter={() => setHoveredWork(item._id)}
                onMouseLeave={() => setHoveredWork(null)}
              >
                <div className="flex flex-row space-x-2 pt-2 px-2">
                  <h3
                    className={`transition-colors duration-500 ease-in-out ${
                      activeFilter === "narrative"
                        ? "text-white"
                        : activeFilter === "commercial"
                        ? " "
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
                          ? " "
                          : "text-gray-900"
                      }`}
                    >
                      {item.year}
                    </p>
                  )}
                  {/* {item.category && (
                    <p
                      className={`opacity-60 transition-colors duration-500 ease-in-out ${
                        activeFilter === "narrative"
                          ? "text-white"
                          : activeFilter === "commercial"
                          ? " "
                          : "text-gray-900"
                      }`}
                    >
                      {item.category}
                    </p>
                  )} */}
                  <p
                    className={`opacity-60 transition-colors duration-500 ease-in-out ${
                      activeFilter === "narrative"
                        ? "text-white"
                        : activeFilter === "commercial"
                        ? " "
                        : "text-gray-900"
                    }`}
                  >
                    {formatDuration(item.video?.asset?.data?.duration)}
                  </p>
                </div>
                {item.video?.asset?.playbackId && item.thumbnails && (
                  <div className="flex gap-2 group-hover:bg-yellow p-2">
                    {item.thumbnails.map((thumbnail, index) => {
                      const thumbnailId = `${item._id}-${index}`;
                      return (
                        <div
                          key={index}
                          className="relative group-hover:bg-yellow "
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
                              className="object-cover group-hover:mix-blend-difference "
                            />
                          ) : (
                            <VideoThumbnail
                              playbackId={item.video.asset.playbackId}
                              timestamp={thumbnail.timestamp}
                              isHovered={hoveredWork === item._id}
                              className="group-hover:mix-blend-difference "
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Link>
            ))}
          </>
        )}

        {!loading && work.length === 0 && (
          <p className="text-gray-500 text-center">No work found.</p>
        )}
      </section>
    </main>
  );
}
