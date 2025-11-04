import { Suspense } from "react";
import "./globals.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { getSettings } from "../queries/getSettings";

import { ThemeProvider } from "../contexts/ThemeContext";

export async function generateMetadata() {
  const settings = await getSettings();

  if (!settings) {
    return {
      title: "Niels Windfeldt",
      description:
        "Niels Windfeldt is a Norwegian director and former professional athlete who specializes in creating cinematic films using analog video to capture nature's beauty and mystery.",
    };
  }

  const metadata = {
    title: settings.seoTitle || settings.title || "Niels Windfeldt",
    description:
      settings.seoDescription ||
      "Niels Windfeldt is a Norwegian director and former professional athlete who specializes in creating cinematic films using analog video to capture nature's beauty and mystery.",
  };

  // Add keywords if available
  if (settings.keywords && settings.keywords.length > 0) {
    metadata.keywords = settings.keywords;
  }

  // Add Open Graph image if available
  if (settings.ogImage?.asset?.url) {
    metadata.openGraph = {
      title: settings.seoTitle || settings.title || "Niels Windfeldt",
      description:
        settings.seoDescription ||
        "Niels Windfeldt is a Norwegian director and former professional athlete who specializes in creating cinematic films using analog video to capture nature's beauty and mystery.",
      images: [
        {
          url: settings.ogImage.asset.url,
          width: 1200,
          height: 630,
          alt: settings.seoTitle || settings.title || "Niels Windfeldt",
        },
      ],
    };

    // Add Twitter Card metadata
    metadata.twitter = {
      card: "summary_large_image",
      title: settings.seoTitle || settings.title || "Niels Windfeldt",
      description:
        settings.seoDescription ||
        "Niels Windfeldt is a Norwegian director and former professional athlete who specializes in creating cinematic films using analog video to capture nature's beauty and mystery.",
      images: [settings.ogImage.asset.url],
    };
  }

  return metadata;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Suspense fallback={null}>
          <ThemeProvider>
            <Navigation />
            {children}
            <Footer />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
