"use client";

import Image from "next/image";
import { PortableText } from "@portabletext/react";
import VideoThumbnail from "./VideoThumbnail";
import Video360Player from "./Video360Player";
import { useTheme } from "../contexts/ThemeContext";
import { useEffect, useRef } from "react";

export default function HeroBuilder({ heroContent, className = "" }) {
  const { setBackgroundColor } = useTheme();
  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Hero is in view - set dark background
            setBackgroundColor("#05261F");
          } else {
            // Hero is not in view - reset to default white background for about page
            setBackgroundColor(null);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the hero is visible
        rootMargin: "0px 0px -50px 0px", // Trigger slightly before the hero comes into view
      }
    );

    observer.observe(heroRef.current);

    return () => {
      observer.disconnect();
    };
  }, [setBackgroundColor]);

  if (!heroContent || heroContent.length === 0) {
    return null;
  }

  return (
    <div
      ref={heroRef}
      className={`col-span-12 flex gap-4 h-[65svh] bg-black p-2 mt-8 overflow-x-auto  ${className}`}
    >
      {heroContent.map((item, index) => {
        switch (item._type) {
          case "image":
            return (
              <div key={index} className="flex-shrink-0 h-full">
                <Image
                  src={item.asset.url}
                  alt=""
                  width={0}
                  height={0}
                  sizes="(min-width: 1536px) 33vw, 33vw"
                  className="object-cover h-full w-auto"
                  priority={index === 0}
                />
              </div>
            );

          case "mux.video":
            return (
              <div key={index} className="flex-shrink-0 h-full">
                <video
                  src={`https://stream.mux.com/${item.asset.playbackId}.m3u8`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-auto object-cover"
                />
              </div>
            );

          case "video":
            // Handle video object with videoType
            if (item.video?.asset?.playbackId) {
              if (item.videoType === "360") {
                return (
                  <div
                    key={index}
                    className="flex-shrink-0 h-full aspect-video"
                  >
                    <Video360Player
                      videoUrl={`https://stream.mux.com/${item.video.asset.playbackId}.m3u8`}
                      className="h-full w-auto"
                    />
                  </div>
                );
              } else {
                return (
                  <div key={index} className="flex-shrink-0 h-full">
                    <video
                      src={`https://stream.mux.com/${item.video.asset.playbackId}.m3u8`}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="h-full w-auto object-cover"
                    />
                  </div>
                );
              }
            }
            return null;

          case "object":
            // Handle text object
            if (item.content) {
              return (
                <div
                  key={index}
                  className="flex-shrink-0 h-full flex items-center"
                >
                  <div className="prose max-w-none">
                    <PortableText value={item.content} />
                  </div>
                </div>
              );
            }

            return null;

          default:
            return null;
        }
      })}
    </div>
  );
}
