"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";
import { useTheme } from "../contexts/ThemeContext";
import Image from "next/image";

function formatDuration(seconds) {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function VideoThumbnail({
  playbackId,
  timestamp,
  isHovered,
  className,
  style,
}) {
  const playerRef = useRef(null);
  const playPromiseRef = useRef(null);

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
      preload="none"
      startTime={timestamp.split(":").reduce((acc, time) => 60 * acc + +time)}
      endTime={timestamp.split(":").reduce((acc, time) => 60 * acc + +time) + 5}
      className={`thumbnail ${className || ""}`}
      style={style}
    />
  );
}

function ThumbnailWrapper({
  thumbnail,
  playbackId,
  thumbnailId,
  hoveredWork,
  itemId,
  activeFilter,
  itemCategory,
  setHoveredThumbnail,
  index,
  aspectRatio,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const thumbnailRef = useRef(null);

  // Convert aspect ratio from "16:9" format to "16/9" CSS format
  const cssAspectRatio = aspectRatio ? aspectRatio.replace(":", "/") : "16/9";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: "150px",
        threshold: 0.05,
      }
    );

    if (thumbnailRef.current) {
      observer.observe(thumbnailRef.current);
    }

    return () => {
      if (thumbnailRef.current) {
        observer.unobserve(thumbnailRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const staggerDelay = index * 40;
    const timeout = setTimeout(() => {
      setShouldLoad(true);
    }, staggerDelay);

    return () => clearTimeout(timeout);
  }, [isVisible, index]);

  return (
    <div
      ref={thumbnailRef}
      className={`mix-blend-difference transition-all duration-300 ease-out flex-shrink-0 ${
        shouldLoad ? "opacity-100" : "opacity-0"
      }`}
      onMouseEnter={() => setHoveredThumbnail(thumbnailId)}
      onMouseLeave={() => setHoveredThumbnail(null)}
    >
      {shouldLoad ? (
        thumbnail.type === "image" ? (
          <Image
            src={`https://image.mux.com/${playbackId}/thumbnail.webp?width=480&time=${thumbnail.timestamp
              .split(":")
              .reduce((acc, time) => 60 * acc + +time)}`}
            alt={`Thumbnail at ${thumbnail.timestamp}`}
            width={0}
            height={0}
            sizes="(min-width: 1536px) 8vw, 120px"
            loading="lazy"
            decoding="async"
            className="object-cover w-[120px] h-auto 2xl:w-[8vw]"
            style={{ aspectRatio: cssAspectRatio }}
          />
        ) : (
          <VideoThumbnail
            playbackId={playbackId}
            timestamp={thumbnail.timestamp}
            isHovered={hoveredWork === itemId && itemCategory === activeFilter}
            className="w-[120px] h-auto 2xl:w-[8vw]"
            style={{ aspectRatio: cssAspectRatio }}
          />
        )
      ) : (
        <div
          className="bg-gray-800 w-[120px] h-auto 2xl:w-[8vw]"
          style={{ aspectRatio: cssAspectRatio }}
        />
      )}
    </div>
  );
}

function WorkItem({
  item,
  onMouseEnter,
  onMouseLeave,
  hoveredWork,
  setHoveredThumbnail,
  itemIndex,
}) {
  const { activeFilter } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
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
        rootMargin: "150px",
        threshold: 0.05,
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

  // Stagger WorkItem rendering based on index
  useEffect(() => {
    if (!isVisible) return;

    const staggerDelay = itemIndex * 100; // 80ms delay per work item
    const timeout = setTimeout(() => {
      setShouldRender(true);
    }, staggerDelay);

    return () => clearTimeout(timeout);
  }, [isVisible, itemIndex]);

  const isHighlighted = item.category === activeFilter;

  return (
    <div
      ref={workRef}
      className={`transition-all duration-500 ease-out  mt-12 ${
        shouldRender ? "opacity-100" : "opacity-0"
      }`}
    >
      {shouldRender ? (
        <Link
          href={`/work/${item.slug?.current}`}
          className={`group flex flex-col rounded duration-100 ease-in-out ${
            isHighlighted
              ? "cursor-pointer opacity-100"
              : "cursor-default opacity-100"
          }`}
          onMouseEnter={() => onMouseEnter(item._id)}
          onMouseLeave={() => onMouseLeave(null)}
        >
          <div className={`flex flex-row space-x-2 px-2 pb-2`}>
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
                className={`transition-colors duration-500 ease-in-out font-normal ${
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
                className={`opacity-60 transition-colors duration-500 ease-in-out font-normal ${
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
                className={`opacity-60 transition-colors duration-500 ease-in-out font-normal ${
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
              className={`opacity-60 transition-colors duration-500 ease-in-out font-normal ${
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
              className={`flex gap-2 bg-black p-2 overflow-x-auto ${
                item.category !== activeFilter ? "bg-yellow" : ""
              }`}
            >
              {item.thumbnails.map((thumbnail, index) => {
                const thumbnailId = `${item._id}-${index}`;

                return (
                  <ThumbnailWrapper
                    key={index}
                    thumbnail={thumbnail}
                    playbackId={item.video.asset.playbackId}
                    thumbnailId={thumbnailId}
                    hoveredWork={hoveredWork}
                    itemId={item._id}
                    activeFilter={activeFilter}
                    itemCategory={item.category}
                    setHoveredThumbnail={setHoveredThumbnail}
                    index={index}
                    aspectRatio={item.video.asset.data?.aspect_ratio}
                  />
                );
              })}
            </div>
          )}
        </Link>
      ) : (
        // Placeholder skeleton for WorkItem
        <div className="flex flex-col">
          <div className="flex flex-row space-x-2 pt-2 px-2">
            <div className="h-6 w-32 bg-gray-800 rounded animate-pulse" />
            <div className="h-6 w-24 bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="flex gap-2 bg-black p-2 overflow-x-auto">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-800 animate-pulse flex-shrink-0"
                style={{ width: "120px", height: "68px" }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Work({ work }) {
  const [hoveredWork, setHoveredWork] = useState(null);
  const [hoveredThumbnail, setHoveredThumbnail] = useState(null);
  const { activeFilter } = useTheme();

  const filteredWork = work;

  return (
    <section className="px-2 pb-8">
      {filteredWork.length > 0 ? (
        <>
          {filteredWork.map((item, index) => (
            <WorkItem
              key={item._id}
              item={item}
              itemIndex={index}
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
