"use client";
import { useState, useEffect, use } from "react";
import { getWorkBySlug } from "../queries/getWorkBySlug";
import { getShowcasesContainingWork } from "../queries/getShowcasesContainingWork";
import Link from "next/link";

export default function WorkPasswordWrapper({
  work,
  params,
  searchParams,
  children,
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Unwrap params and searchParams
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);

  useEffect(() => {
    const checkAuthentication = async () => {
      // If work is not hidden, allow access
      if (!work.hidden) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // If work is hidden, check for showcase authentication first
      if (work.hidden) {
        try {
          // Get showcases that contain this work
          const showcases = await getShowcasesContainingWork(work._id);

          // Check if user has access to any showcase containing this work
          let hasShowcaseAccess = false;
          for (const showcase of showcases) {
            if (showcase.password) {
              const showcasePassword = localStorage.getItem(
                `showcase_${showcase.slug.current}_password`
              );
              if (showcasePassword === showcase.password) {
                hasShowcaseAccess = true;
                break;
              }
            }
          }

          if (hasShowcaseAccess) {
            setIsAuthenticated(true);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error checking showcase access:", error);
        }

        // If work has its own password, check that
        if (work.password) {
          // Check localStorage for saved password
          const savedPassword = localStorage.getItem(
            `work_${resolvedParams.slug}_password`
          );

          // Check URL parameter for password
          const urlPassword = resolvedSearchParams?.password;

          if (
            savedPassword === work.password ||
            urlPassword === work.password
          ) {
            setIsAuthenticated(true);
            // Save password to localStorage if it came from URL
            if (urlPassword === work.password) {
              localStorage.setItem(
                `work_${resolvedParams.slug}_password`,
                urlPassword
              );
            }
            setLoading(false);
            return;
          }
        }

        // If no access through showcase or work password, deny access
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkAuthentication();
  }, [work, resolvedParams.slug, resolvedSearchParams]);

  if (loading) {
    return <main className="px-4 py-8 mt-54 min-h-[60svh]"></main>;
  }

  if (!isAuthenticated) {
    // Redirect to password page for hidden works with passwords
    if (work.hidden && work.password) {
      if (typeof window !== "undefined") {
        window.location.href = `/work/${resolvedParams.slug}/password`;
      }
      return (
        <main className="px-4 py-8">
          <p>Redirecting to password page...</p>
        </main>
      );
    }

    // Return 404-like error for hidden works without passwords
    return (
      <main className="px-4 mt-52 min-h-[70svh]">
        <p className="text-red-500">Work not found</p>
        <Link href="/" className="underline">
          Back to home
        </Link>
      </main>
    );
  }

  return children;
}
