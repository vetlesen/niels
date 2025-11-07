"use client";

import { useEffect } from "react";

export default function PlausibleAnalytics() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Dynamically import Plausible to avoid SSR issues
    import("@plausible-analytics/tracker").then(({ init }) => {
      // Initialize Plausible Analytics
      init({
        domain: "nielswindfeldt.com", // Replace with your actual domain
        autoCapturePageviews: true,
        hashBasedRouting: false,
        outboundLinks: true,
        fileDownloads: true,
        captureOnLocalhost: false, // Set to true if you want to track on localhost
        logging: false, // Set to true for debugging
        bindToWindow: true,
      });
    });
  }, []);

  return null;
}
