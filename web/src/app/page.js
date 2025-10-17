"use client";
import { useState, useEffect, useRef } from "react";
import { getWork } from "../queries/getWork";
import MuxPlayer from "@mux/mux-player-react";
import Link from "next/link";

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
  const [activeFilter, setActiveFilter] = useState("both");
  const [loading, setLoading] = useState(true);
  const [hoveredWork, setHoveredWork] = useState(null);

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

  const setFilter = (category) => {
    setActiveFilter(category);
  };

  return (
    <main>
      <section className="h-[50svh] flex justify-start items-center px-4">
        <div className="space-x-2 flex">
          <button
            onClick={() => setFilter("both")}
            className="flex flex-row gap-2 items-baseline"
          >
            <div
              className={`w-3 h-3 flex ${
                activeFilter === "both"
                  ? "bg-black border border-black text-white"
                  : " border"
              }`}
            />
            Both
          </button>
          <button
            onClick={() => setFilter("narrative")}
            className="flex flex-row gap-2 items-baseline"
          >
            <div
              className={`w-3 h-3 flex ${
                activeFilter === "narrative"
                  ? "bg-black border border-black text-white"
                  : " border"
              }`}
            />
            Narrative
          </button>
          <button
            onClick={() => setFilter("commercial")}
            className="flex flex-row gap-2 items-baseline"
          >
            <div
              className={`w-3 h-3 flex ${
                activeFilter === "commercial"
                  ? "bg-black border border-black text-white"
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
          <div className="">
            {work.map((item) => (
              <Link
                key={item._id}
                href={`/work/${item.slug?.current}`}
                className={`flex flex-col gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors ${
                  activeFilter !== "both" && item.category !== activeFilter
                    ? "opacity-20 cursor-none pointer-events-none"
                    : ""
                }`}
                onMouseEnter={() => setHoveredWork(item._id)}
                onMouseLeave={() => setHoveredWork(null)}
              >
                <div className="flex flex-row space-x-4">
                  <h3 className="">{item.name}</h3>
                  {item.title && <h4 className="">{item.title}</h4>}
                  {item.type && <p className="text-gray-600">{item.type}</p>}
                  {item.year && <p className="text-gray-600">{item.year}</p>}
                  {item.category && (
                    <p className="text-gray-600">{item.category}</p>
                  )}
                  <p className="text-gray-600">
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
          </div>
        )}

        {!loading && work.length === 0 && (
          <p className="text-gray-500 text-center">No work found.</p>
        )}
      </section>
    </main>
  );
}
