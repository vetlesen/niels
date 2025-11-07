import { getWorkBySlug } from "../../../queries/getWorkBySlug";
import ClientMuxPlayer from "../../../components/ClientMuxPlayer";
import { PortableText } from "next-sanity";
import Link from "next/link";
import DraggableStack from "../../../components/DraggableStack";
import WorkPasswordWrapper from "../../../components/WorkPasswordWrapper";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);

  if (!work) {
    return {
      title: "Work Not Found",
    };
  }

  const title = work.title;
  const description = work.type;

  const metadata = {
    title,
    description,
  };

  // Add Open Graph image if video thumbnail is available
  if (work.video?.asset?.playbackId) {
    const thumbnailUrl = `https://image.mux.com/${work.video.asset.playbackId}/thumbnail.jpg?width=1200&height=630&fit_mode=smartcrop`;

    metadata.openGraph = {
      title,
      description,
      images: [
        {
          url: thumbnailUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    };

    metadata.twitter = {
      card: "summary_large_image",
      title,
      description,
      images: [thumbnailUrl],
    };
  }

  return metadata;
}

export default async function WorkDetail({ params, searchParams }) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);

  if (!work) {
    notFound();
  }

  return (
    <WorkPasswordWrapper
      work={work}
      params={params}
      searchParams={searchParams}
    >
      <main className="">
        <div className="pt-4">
          {" "}
          <div
            className="mb-2 px-4 max-h-[90svh]"
            style={{
              aspectRatio: work.video.asset.data?.aspect_ratio?.replace(
                ":",
                "/"
              ),
            }}
          >
            {/* Video */}
            {work.video?.asset?.playbackId && (
              <ClientMuxPlayer
                playbackId={work.video.asset.playbackId}
                controls
                className="w-full"
                aspectRatio={work.video.asset.data?.aspect_ratio}
              />
            )}
          </div>
          {/* Work Details */}
          <div className="mb-12 px-4">
            <h1 className="">{work.name}</h1>
            <h2 className="font-normal">{work.title}</h2>
            <p className="font-normal">{work.type}</p>
            <p className="font-normal">{work.year}</p>
          </div>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 px-4 gap-12 md:gap-0">
            {/* Credits */}
            {work.credits && work.credits.length > 0 && (
              <div className="grid-span-1">
                <h3 className="mb-2 opacity-50 uppercase text-xs">Credits</h3>
                <div className="space-y-2 font-normal">
                  {work.credits.map((credit, index) => (
                    <ul key={index} className="grid grid-cols-2 font-normal">
                      <li className="font-normal">{credit.role}</li>
                      {credit.names && credit.names.length > 0 && (
                        <ul className="font-normal">
                          {credit.names.map((name, nameIndex) => (
                            <li className="font-normal" key={nameIndex}>
                              {name}
                            </li>
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
                  <h3 className="mb-2 opacity-50 uppercase text-xs">Awards</h3>
                  {work.awards.map((award, index) => (
                    <div key={index} className="font-normal">
                      {award.name} ({award.year})
                    </div>
                  ))}
                </div>
              ) : null}
              {work.info && work.info.length > 0 && (
                <>
                  <h3 className="mb-2 opacity-50 uppercase text-xs">Info</h3>

                  <PortableText
                    value={work.info}
                    components={{
                      block: {
                        normal: ({ children }) => (
                          <p className="font-normal">{children}</p>
                        ),
                      },
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
                </>
              )}
            </div>
          </div>
        </div>
        <DraggableStack
          stackImages={work.stack}
          imagePalettes={[
            work.imagePalette0,
            work.imagePalette1,
            work.imagePalette2,
          ]}
        />
      </main>
    </WorkPasswordWrapper>
  );
}
