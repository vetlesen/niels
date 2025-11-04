"use client";

import Link from "next/link";
import { useTheme } from "../contexts/ThemeContext";

export default function Nav() {
  const { activeFilter } = useTheme();

  const getHoverClasses = () => {
    if (activeFilter === "narrative") {
      return "hover:bg-white hover:text-transparent";
    } else {
      return "hover:bg-black hover:text-transparent";
    }
  };

  const letterClasses = `ease-in-out ${getHoverClasses()}`;

  return (
    <nav className="flex justify-between px-4 pt-2 uppercase">
      <Link href={"/"} className="flex">
        <p className={letterClasses}>N</p>
        <p className={letterClasses}>i</p>
        <p className={letterClasses}>e</p>
        <p className={letterClasses}>l</p>
        <p className={letterClasses}>s</p>
        <div className="w-1" />
        <p className={letterClasses}>W </p>
        <p className={letterClasses}>i</p>
        <p className={letterClasses}>n</p>
        <p className={letterClasses}>d</p>
        <p className={letterClasses}>f</p>
        <p className={letterClasses}>e</p>
        <p className={letterClasses}>l</p>
        <p className={letterClasses}>d</p>
        <p className={letterClasses}>t</p>
      </Link>
      <Link href={"/about"}>About</Link>
    </nav>
  );
}
