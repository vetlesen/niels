"use client";
import { useState, useEffect, useRef } from "react";
import { getWork } from "../queries/getWork";
import MuxPlayer from "@mux/mux-player-react";

function VideoThumbnail({ playbackId, timestamp, isHovered }) {
  const playerRef = useRef(null);

  useEffect(() => {
    if (playerRef.current) {
      if (isHovered) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
        playerRef.current.currentTime = timestamp
          .split(":")
          .reduce((acc, time) => 60 * acc + +time);
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
  const [filteredWork, setFilteredWork] = useState([]);
  const [activeFilter, setActiveFilter] = useState("both");
  const [loading, setLoading] = useState(true);
  const [hoveredWork, setHoveredWork] = useState(null);

  useEffect(() => {
    async function fetchWork() {
      try {
        const workData = await getWork();
        setWork(workData);
        setFilteredWork(workData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching work:", error);
        setLoading(false);
      }
    }

    fetchWork();
  }, []);

  const filterWork = (category) => {
    setActiveFilter(category);
    if (category === "both") {
      setFilteredWork(work);
    } else {
      setFilteredWork(work.filter((item) => item.category === category));
    }
  };

  return (
    <main>
      <section className="h-[50svh] flex justify-start items-center px-4">
        <div className="space-x-5">
          <button
            onClick={() => filterWork("both")}
            className={`px-4 py-2 rounded ${
              activeFilter === "both" ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            Both
          </button>
          <button
            onClick={() => filterWork("narrative")}
            className={`px-4 py-2 rounded ${
              activeFilter === "narrative"
                ? "bg-black text-white"
                : "bg-gray-200"
            }`}
          >
            Narrative
          </button>
          <button
            onClick={() => filterWork("commercial")}
            className={`px-4 py-2 rounded ${
              activeFilter === "commercial"
                ? "bg-black text-white"
                : "bg-gray-200"
            }`}
          >
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
            {filteredWork.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-2"
                onMouseEnter={() => setHoveredWork(item._id)}
                onMouseLeave={() => setHoveredWork(null)}
              >
                <div className="flex flex-row space-x-4">
                  <h3 className="">{item.name}</h3>
                  <h4 className="">{item.title}</h4>
                  <p className="text-gray-600">{item.type}</p>
                  <p className="text-gray-600">{item.year}</p>
                  <p className="text-gray-600">{item.category}</p>
                  <p className="text-gray-600">1:39</p>
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
              </div>
            ))}
          </div>
        )}

        {!loading && filteredWork.length === 0 && (
          <p className="text-gray-500 text-center">
            No work found for the selected category.
          </p>
        )}
      </section>
    </main>
  );
}
