"use client";
import { useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import HeroBuilder from "./HeroBuilder";

export default function AboutPageClient({ heroContent, children }) {
  const { setBackgroundColor } = useTheme();
  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Hero is in view - set dark background
            setBackgroundColor("#202020");
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

  return (
    <>
      {/* Hero Section */}
      {heroContent && heroContent.length > 0 && (
        <div ref={heroRef}>
          <HeroBuilder heroContent={heroContent} className="text-white" />
        </div>
      )}

      {/* Rest of the page content */}
      {children}
    </>
  );
}
