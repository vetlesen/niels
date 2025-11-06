"use client";
import { useState, useEffect, use } from "react";
import { getShowcaseBySlug } from "../../../queries/getShowcaseBySlug";
import Work from "../../../components/Work";
import { PortableText } from "next-sanity";
import Link from "next/link";

export default function ShowcasePage({ params, searchParams }) {
  const [showcase, setShowcase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Unwrap params and searchParams
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);

  useEffect(() => {
    const fetchShowcase = async () => {
      try {
        const data = await getShowcaseBySlug(resolvedParams.slug);
        setShowcase(data);

        if (data?.password) {
          // Check localStorage for saved password
          const savedPassword = localStorage.getItem(
            `showcase_${resolvedParams.slug}_password`
          );

          // Check URL parameter for password
          const urlPassword = resolvedSearchParams?.password;

          if (
            savedPassword === data.password ||
            urlPassword === data.password
          ) {
            setIsAuthenticated(true);
            // Save password to localStorage if it came from URL
            if (urlPassword === data.password) {
              localStorage.setItem(
                `showcase_${resolvedParams.slug}_password`,
                urlPassword
              );
            }
          } else {
            // Redirect to password page
            window.location.href = `/showcase/${resolvedParams.slug}/password`;
            return;
          }
        } else {
          setIsAuthenticated(true);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load showcase");
        setLoading(false);
      }
    };

    fetchShowcase();
  }, [resolvedParams.slug, resolvedSearchParams]);

  if (loading) {
    return <main className="px-4 py-8 min-h-screen"></main>;
  }

  if (error) {
    return (
      <main className="px-4 py-8 min-h-screen">
        <p className="text-red-500">{error}</p>
        <Link href="/" className="underline">
          Back to home
        </Link>
      </main>
    );
  }

  if (!showcase) {
    return (
      <main className="px-4 mt-52 min-h-[60svh]">
        <p>Showcase not found</p>
        <Link href="/" className="underline font-normal">
          Back to home
        </Link>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="px-4 py-8">
        <p>Redirecting to password page...</p>
      </main>
    );
  }

  return (
    <main>
      {/* Showcase Header */}
      <article className="px-4 grid grid-cols-12 gap-x-4">
        <section className="mb-6 md:mb-12 col-span-12 md:col-span-6 mt-52">
          <h1 className="mb-4 uppercase">{showcase.title}</h1>

          {/* Description */}
          {showcase.description && showcase.description.length > 0 && (
            <div className="prose prose-sm max-w-none font-normal">
              <PortableText
                value={showcase.description}
                components={{
                  block: {
                    normal: ({ children }) => (
                      <p className="mb-2">{children}</p>
                    ),
                    h1: ({ children }) => (
                      <h2 className="text-xl font-bold mb-2">{children}</h2>
                    ),
                    h2: ({ children }) => (
                      <h3 className="text-lg font-bold mb-2">{children}</h3>
                    ),
                  },
                  marks: {
                    strong: ({ children }) => <strong>{children}</strong>,
                    em: ({ children }) => <em>{children}</em>,
                    link: ({ children, value }) => (
                      <a
                        href={value.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-70"
                      >
                        {children}
                      </a>
                    ),
                  },
                  list: {
                    bullet: ({ children }) => (
                      <ul className="list-disc list-inside mb-2">{children}</ul>
                    ),
                    number: ({ children }) => (
                      <ol className="list-decimal list-inside mb-2">
                        {children}
                      </ol>
                    ),
                  },
                  listItem: {
                    bullet: ({ children }) => (
                      <li className="mb-1">{children}</li>
                    ),
                    number: ({ children }) => (
                      <li className="mb-1">{children}</li>
                    ),
                  },
                }}
              />
            </div>
          )}
        </section>
      </article>
      {/* Works Display */}
      {showcase.works && showcase.works.length > 0 ? (
        <Work work={showcase.works} isShowcase={true} />
      ) : (
        <div className="px-4 py-8">
          <p className="text-gray-500">No works in this showcase yet.</p>
        </div>
      )}
    </main>
  );
}
