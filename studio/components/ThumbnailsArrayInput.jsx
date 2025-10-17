import React from "react";
import { set } from "sanity";
import { Button, Stack } from "@sanity/ui";
import { AddIcon } from "@sanity/icons";

export default function ThumbnailsArrayInput(props) {
  const { value = [], onChange, renderDefault } = props;

  const generateThumbnails = () => {
    const timestamps = [
      "0:10",
      "0:12",
      "0:15",
      "0:16",
      "0:20",
      "0:25",
      "0:30",
      "0:35",
      "0:40",
      "0:45",
      "0:50",
      "0:55",
    ];
    const types = ["image", "video"];

    const newThumbnails = timestamps.map((timestamp, index) => ({
      _key: `thumbnail-${Date.now()}-${index}`,
      timestamp,
      type: types[index % 2], // Alternates between image and video
    }));

    onChange(set(newThumbnails));
  };

  return (
    <Stack space={3}>
      <Button
        icon={AddIcon}
        text="Generate 12 Thumbnails"
        tone="primary"
        onClick={generateThumbnails}
      />
      {renderDefault(props)}
    </Stack>
  );
}
