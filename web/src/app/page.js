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

function VideoThumbnail({ playbackId, timestamp, isHovered }) {
  const playerRef = useRef(null);
  const playPromiseRef = useRef(null);

  useEffect(() => {
    if (playerRef.current) {
      if (isHovered) {
        // If there's a pending play promise, wait for it to resolve before playing
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              if (playerRef.current && isHovered) {
                playPromiseRef.current = playerRef.current.play();
              }
            })
            .catch(() => {
              // Ignore errors from interrupted play promises
            });
        } else {
          playPromiseRef.current = playerRef.current.play();
        }
      } else {
        // If there's a pending play promise, wait for it to resolve before pausing
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              if (playerRef.current) {
                playerRef.current.pause();
                playerRef.current.currentTime = timestamp
                  .split(":")
                  .reduce((acc, time) => 60 * acc + +time);
              }
            })
            .catch(() => {
              // Ignore errors from interrupted play promises
            });
        } else {
          playerRef.current.pause();
          playerRef.current.currentTime = timestamp
            .split(":")
            .reduce((acc, time) => 60 * acc + +time);
        }
        playPromiseRef.current = null;
      }
    }
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
      startTime={timestamp.split(":").reduce((acc, time) => 60 * acc + +time)}
      endTime={timestamp.split(":").reduce((acc, time) => 60 * acc + +time) + 5}
      style={{ width: "120px", height: "68px" }}
      className="thumbnail"
    />
  );
}

export default function Home() {
  const [work, setWork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredWork, setHoveredWork] = useState(null);
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
        <div className="space-x-2 flex">
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
      <section className="px-4 pb-8">
        {loading ? (
          <p>Loading work...</p>
        ) : (
          <>
            {work.map((item) => (
              <Link
                key={item._id}
                href={`/work/${item.slug?.current}`}
                className={`flex flex-col gap-2 cursor-pointer p-2 rounded transition-all duration-500 ease-in-out hover:opacity-80 ${
                  activeFilter !== "both" && item.category !== activeFilter
                    ? "opacity-10 cursor-none pointer-events-none"
                    : ""
                }`}
                onMouseEnter={() => setHoveredWork(item._id)}
                onMouseLeave={() => setHoveredWork(null)}
              >
                <div className="flex flex-row space-x-2">
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
                  {item.category && (
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
                  )}
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
                  <div className="flex gap-2 over">
                    {item.thumbnails.map((thumbnail, index) => (
                      <div key={index} className="relative">
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
                            isHovered={hoveredWork === item._id}
                          />
                        )}
                      </div>
                    ))}
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
