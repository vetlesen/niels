"use client";

import { useTheme } from "../contexts/ThemeContext";

export default function Footer() {
  const { activeFilter } = useTheme();

  return (
    <footer className="flex flex-col justify-between px-4 pt-42 pb-6">
      <p>NW</p>
      <p className="font-normal text-xs opacity-50 pt-42">
        design/dev jonas vetlesen
      </p>
    </footer>
  );
}
