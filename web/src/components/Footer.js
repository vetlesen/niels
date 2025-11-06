"use client";

import Link from "next/link";
import AnimatedName from "./AnimatedName";

export default function Footer() {
  return (
    <footer className="flex flex-col justify-between px-4 pt-42 pb-6">
      <AnimatedName />
      <Link
        href={"https://vetlesen.no"}
        target={"_blank"}
        className="font-normal text-[10px] opacity-50 mt-42"
      >
        Design + Dev<br></br>Jonas Vetlesen
      </Link>
    </footer>
  );
}
