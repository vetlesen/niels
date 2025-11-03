"use client";
import { useState, useEffect } from "react";
import { getAwards } from "../../queries/getAwards";
import Link from "next/link";

export default function About() {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAwards() {
      try {
        const awardsData = await getAwards();
        setAwards(awardsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching awards:", error);
        setLoading(false);
      }
    }

    fetchAwards();
  }, []);

  if (loading) {
    return (
      <main className="px-4 py-8">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="px-4 py-8">
      <div className="">
        <h1 className="mb-2 text-sm opacity-50 uppercase">award</h1>

        {awards.length > 0 && (
          <section className="mb-12">
            <div className="grid gap-6 md:grid-cols-2">
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
                      className="mb-4 block hover:opacity-70"
                    >
                      <div className="mb-2">
                        <span className="text-">{workNames}</span>
                        <span className="font-medium ml-2">
                          {award.name} ({award.year})
                        </span>
                      </div>
                    </Link>
                  );
                } else {
                  return (
                    <div key={award._id} className="mb-4">
                      <div className="mb-2">
                        <span className="font-medium">
                          {award.name} ({award.year})
                        </span>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </section>
        )}

        {awards.length === 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6">
              Awards & Recognition
            </h2>
            <p className="text-gray-600">No awards to display yet.</p>
          </section>
        )}
      </div>
    </main>
  );
}
