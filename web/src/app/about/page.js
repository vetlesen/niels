import { getAwards } from "../../queries/getAwards";
import { getSettings } from "../../queries/getSettings";
import Link from "next/link";
import Image from "next/image";
import { PortableText } from "@portabletext/react";

// comps
import Video360Player from "@/components/Video360Player";

export default async function About() {
  const settings = await getSettings();
  const awards = await getAwards();

  return (
    <main className="px-4 grid grid-cols-12 gap-x-4">
      {/* Bio Section */}
      {settings?.bio && (
        <section className="mb-6 md:mb-12 col-span-12 md:col-span-6 mt-52">
          <h1 className="mb-4 uppercase">About</h1>
          <div className="prose max-w-none font-normal">
            <PortableText value={settings.bio} />
          </div>
        </section>
      )}

      {/* Image Section
      {settings?.image && (
        <section className="mb-6 md:mb-12 col-span-2 col-start-11 mt-12 md:mt-52">
          <Image
            src={settings.image.asset.url}
            alt="About"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </section>
      )} */}

      <section className="mb-24 col-span-12 md:col-span-5 md:col-start-8 mt-12 md:mt-52 h-96">
        <Video360Player videoUrl="https://stream.mux.com/p003wY5GkeoYnrkElL3J00qIA02ytwwPRl0201kcWpg8T8k8.m3u8" />
        <p className="pt-2 font-normal text-sm opacity-50">
          Drag and rotate on the video
        </p>
      </section>

      {/* Contact Section */}
      {settings?.contact && settings.contact.length > 0 && (
        <section className="mb-6 md:mb-12 col-start-1 col-span-12 md:col-span-6">
          <h2 className="mb-4 uppercase">Contact</h2>
          <div className="space-y-2">
            {settings.contact.map((item, index) => (
              <div key={index} className="gap-4 grid grid-cols-6 w-full">
                <p className="col-span-3 font-normal">{item.label}</p>
                <p className="col-span-3 font-normal">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Representation Section */}
      {settings?.representation && settings.representation.length > 0 && (
        <section className="mb-6 md:mb-12 col-start-1 col-span-12 md:col-span-6">
          <h2 className="mb-4 uppercase">Representation</h2>
          <div className="space-y-2">
            {settings.representation.map((item, index) => (
              <div key={index} className="gap-4 grid grid-cols-6 w-full">
                <p className="col-span-3 font-normal">{item.label}</p>
                <p className="col-span-3 font-normal">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {awards.length > 0 && (
        <section className="mb-6 md:mb-12 col-start-1 col-span-12">
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
                  className="mb-4 hover:opacity-70 col-span-full gap-4 grid grid-cols-12"
                >
                  <p className="col-span-6 md:col-span-3 font-normal">
                    {workNames}
                  </p>
                  <p className="col-span-6 font-normal">
                    {award.name} ({award.year})
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
