"use client";

import Link from "next/link";
import AnimatedName from "./AnimatedName";

export default function Nav() {
  return (
    <nav className="flex justify-between px-4 pt-4 uppercase">
      <Link href={"/"}>
        <AnimatedName />
      </Link>
      <Link href={"/about"}>About</Link>
    </nav>
  );
}
