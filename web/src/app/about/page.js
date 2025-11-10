import { getAwards } from "../../queries/getAwards";
import { getSettings } from "../../queries/getSettings";
import Link from "next/link";
import { PortableText } from "@portabletext/react";

// comps
import HeroBuilder from "@/components/HeroBuilder";

// Revalidate this page every 60 seconds
export const revalidate = 60;

export async function generateMetadata() {
  const settings = await getSettings();

  const title = "About – Niels Windfeldt";
  const description = settings?.bio;

  const metadata = {
    title,
    description,
  };

  // Add Open Graph image if available
  if (settings?.ogImage?.asset?.url) {
    metadata.openGraph = {
      title,
      description,
      images: [
        {
          url: settings.ogImage.asset.url,
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
      images: [settings.ogImage.asset.url],
    };
  }

  return metadata;
}

export default async function About() {
  const settings = await getSettings();
  const awards = await getAwards();

  return (
    <main className="px-2 grid grid-cols-12 gap-x-4">
      {/* Hero Section */}
      {settings?.image && settings.image.length > 0 && (
        <HeroBuilder
          heroContent={settings.image}
          className="text-white mb-36"
        />
      )}

      {/* Bio Section */}
      {settings?.bio && (
        <section className="md:mb-12 col-span-12 md:col-span-6 px-2">
          <h1 className="mb-4 uppercase">About</h1>
          <div className="prose max-w-none font-normal">
            <PortableText value={settings.bio} />
          </div>
        </section>
      )}

      {/* Contact Section */}
      {settings?.contact && settings.contact.length > 0 && (
        <section className="mb-6 md:mb-20 col-start-1 md:col-start-1 col-span-12 md:col-span-6 px-2">
          <h2 className="mb-4 uppercase">Contact</h2>
          <div className="space-y-2">
            {settings.contact.map((item, index) => (
              <div key={index} className="gap-4 grid grid-cols-6 w-full">
                <p className="col-span-3 font-normal">{item.label}</p>
                {item.url ? (
                  <Link
                    className="col-span-3 font-normal hover:opacity-70 inline-flex items-center gap-1 group"
                    href={item.url}
                  >
                    {item.value}
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 9 9"
                      fill="none"
                      className="md:opacity-0 group-hover:opacity-100 md:rotate-45 group-hover:rotate-0 transition-all duration-300"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.18496 5.86322e-07L0.989949 1.19501L6.04576 1.20208L0 7.24785L0.848528 8.09637L6.89429 2.05061L6.90136 7.10642L8.09637 5.91141V0L2.18496 5.86322e-07Z"
                        fill="black"
                      />
                    </svg>
                  </Link>
                ) : (
                  <p className="col-span-3 font-normal">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      {/* Representation Section */}
      {settings?.representation && settings.representation.length > 0 && (
        <section className="mb-6 md:mb-20 col-start-1 md:col-start-1 col-span-12 md:col-span-6 px-2">
          <h2 className="mb-4 uppercase">Representation</h2>
          <div className="space-y-2">
            {settings.representation.map((item, index) => (
              <div key={index} className="gap-4 grid grid-cols-6 w-full">
                <p className="col-span-3 font-normal">{item.label}</p>
                {item.url ? (
                  <Link
                    className="col-span-3 font-normal hover:opacity-70 inline-flex items-center gap-1 group"
                    href={item.url}
                  >
                    {item.value}
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 9 9"
                      fill="none"
                      className="md:opacity-0 group-hover:opacity-100 md:rotate-45 group-hover:rotate-0 transition-all duration-300"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.18496 5.86322e-07L0.989949 1.19501L6.04576 1.20208L0 7.24785L0.848528 8.09637L6.89429 2.05061L6.90136 7.10642L8.09637 5.91141V0L2.18496 5.86322e-07Z"
                        fill="black"
                      />
                    </svg>
                  </Link>
                ) : (
                  <p className="col-span-3 font-normal">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      {awards.length > 0 && (
        <section className="mb-6 md:mb-12 col-start-1 col-span-12 px-2">
          {/* Awards Section */}
          <h1 className="mb-2 col-span-6 uppercase">Awards</h1>

          {awards.map((award) => {
            const firstWork =
              award.linkedWorks && award.linkedWorks.length > 0
                ? award.linkedWorks[0]
                : null;
            const workNames = award.linkedWorks
              ? award.linkedWorks.map((work) => work.name).join(", ")
              : "";

            if (firstWork) {
              return (
                <Link
                  key={award._id}
                  href={`/work/${firstWork.slug.current}`}
                  className="mb-4 hover:opacity-70 col-span-full gap-4 grid grid-cols-12 group"
                >
                  <p className="col-span-6 md:col-span-3 font-normal">
                    {workNames}
                  </p>
                  <p className="col-span-6 font-normal inline-flex items-center gap-1">
                    {award.name} ({award.year})
                    <svg
                      width="11"
                      height="9"
                      viewBox="0 0 11 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="md:opacity-0 group-hover:opacity-100 group-hover:rotate-0 transition-all duration-300"
                    >
                      <path
                        d="M6.67 0L4.98 6.87623e-09L8.55 3.58L0 3.58V4.78H8.55L4.98 8.36H6.67L10.85 4.18L6.67 0Z"
                        fill="black"
                      />
                    </svg>
                  </p>
                </Link>
              );
            } else {
              return (
                <div key={award._id} className="mb-4 uppercase">
                  <div className="mb-2">
                    <span className="font-normal">
                      {award.name}({award.year})
                    </span>
                  </div>
                </div>
              );
            }
          })}
        </section>
      )}
      {awards.length === 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Awards & Recognition</h2>
          <p className="text-gray-600">No awards to display yet.</p>
        </section>
      )}
    </main>
  );
}
