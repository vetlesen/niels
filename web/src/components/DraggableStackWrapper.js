"use client";

import { useState, useCallback } from "react";
import DraggableStack from "./DraggableStack";
import { getWorkBySlug } from "../queries/getWorkBySlug";

export default function DraggableStackWrapper({
  initialStackImages,
  initialImagePalettes,
  slug,
  stackCount,
}) {
  const [stackImages, setStackImages] = useState(initialStackImages);
  const [imagePalettes, setImagePalettes] = useState(initialImagePalettes);
  const [isLoading, setIsLoading] = useState(false);

  const handleRandomize = useCallback(async () => {
    if (isLoading || !stackCount) return;

    setIsLoading(true);

    try {
      // Generate a random starting point, ensuring we don't go beyond available images
      const maxStart = Math.max(0, stackCount - 20);
      const randomStart = Math.floor(Math.random() * (maxStart + 1));

      // Fetch new data with random seed
      const work = await getWorkBySlug(slug, randomStart);
      console.log("work stack ->", work.stack);

      if (work && work.stack) {
        setStackImages(work.stack);
        setImagePalettes([
          work.colorOverwrite,
          work.imagePalette0,
          work.imagePalette1,
          work.imagePalette2,
        ]);
      }
    } catch (error) {
      console.error("Error fetching random images:", error);
    } finally {
      setIsLoading(false);
    }
  }, [slug, stackCount, isLoading]);

  return (
    <DraggableStack
      stackImages={stackImages}
      imagePalettes={imagePalettes}
      onRandomize={handleRandomize}
      isRandomizing={isLoading}
    />
  );
}
