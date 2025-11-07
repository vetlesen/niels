"use client";

import { useEffect } from "react";
import { init } from "@plausible-analytics/tracker";

export default function PlausibleAnalytics() {
  useEffect(() => {
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
  }, []);

  return null;
}
