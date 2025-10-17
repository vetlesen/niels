"use client";
import { useState, useEffect, use } from "react";
import { getWorkBySlug } from "../../../queries/getWorkBySlug";
import MuxPlayer from "@mux/mux-player-react";
import { PortableText } from "next-sanity";
import Link from "next/link";

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
          <p className="">{work.type}</p>
          <p className="">{work.year}</p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2">
          {/* Credits */}
          {work.credits && work.credits.length > 0 && (
            <div className="grid-span-1">
              <h3 className="mb-2 opacity-50 uppercase text-sm">Credits</h3>
              <div className="space-y-2">
                {work.credits.map((credit, index) => (
                  <ul key={index} className="grid grid-cols-2">
                    <li className="">{credit.role}</li>
                    {credit.names && credit.names.length > 0 && (
                      <ul className=" ">
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
          <div className="grid-span-1">
            {work.awards && work.awards.length > 0 ? (
              <div className="space-y-2 mb-6">
                <h3 className="mb-2 opacity-50 uppercase text-sm">Awards</h3>
                {work.awards.map((award, index) => (
                  <div key={index} className=" ">
                    {award.name} ({award.year})
                  </div>
                ))}
              </div>
            ) : null}
            {work.info && work.info.length > 0 && (
              <div className=" ">
                <h3 className="mb-2 opacity-50 uppercase text-sm">Info</h3>

                <PortableText
                  value={work.info}
                  components={{
                    marks: {
                      link: ({ children, value }) => (
                        <a
                          href={value.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {children}
                        </a>
                      ),
                      internalLink: ({ children, value }) => {
                        if (!value.reference?.slug?.current) {
                          return (
                            <span className="text-gray-500">{children}</span>
                          );
                        }
                        return (
                          <Link
                            href={`/work/${value.reference.slug.current}`}
                            className="underline"
                          >
                            {children}
                          </Link>
                        );
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
