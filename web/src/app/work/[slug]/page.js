"use client";
import { useState, useEffect, use } from "react";
import { getWorkBySlug } from "../../../queries/getWorkBySlug";
import MuxPlayer from "@mux/mux-player-react";

export default function WorkDetail({ params }) {
  const resolvedParams = use(params);
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWork() {
      try {
        const workData = await getWorkBySlug(resolvedParams.slug);
        setWork(workData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching work:", error);
        setLoading(false);
      }
    }

    if (resolvedParams.slug) {
      fetchWork();
    }
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <main className="px-4 py-8">
        <p>Loading...</p>
      </main>
    );
  }

  if (!work) {
    return (
      <main className="px-4 py-8">
        <p>Work not found.</p>
      </main>
    );
  }

  return (
    <main className="px-4 py-8">
      <div className="">
        {/* Video */}
        {work.video?.asset?.playbackId && (
          <div className="mb-8">
            <MuxPlayer
              playbackId={work.video.asset.playbackId}
              controls
              style={{ width: "100%", maxWidth: "800px" }}
              className="rounded"
            />
          </div>
        )}

        {/* Work Details */}
        <div className="mb-8">
          <h1 className="">{work.name}</h1>
          <h2 className="">{work.title}</h2>
          <p className="">{work.year}</p>
        </div>

        {/* Credits */}
        {work.credits && work.credits.length > 0 && (
          <div>
            <h3 className="">Credits</h3>
            <div className="space-y-4">
              {work.credits.map((credit, index) => (
                <ul key={index} className="flex gap-2 justify-between w-1/4">
                  <li className="">{credit.role}</li>
                  {credit.names && credit.names.length > 0 && (
                    <ul className=" text-black">
                      {credit.names.map((name, nameIndex) => (
                        <li key={nameIndex}>{name}</li>
                      ))}
                    </ul>
                  )}
                </ul>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
