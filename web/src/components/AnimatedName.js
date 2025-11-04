"use client";

import { useTheme } from "../contexts/ThemeContext";

export default function AnimatedName({ text = "Niels Windfeldt" }) {
  const { activeFilter } = useTheme();

  const getHoverClasses = () => {
    if (activeFilter === "narrative") {
      return "hover:bg-white hover:text-transparent";
    } else {
      return "hover:bg-black hover:text-transparent";
    }
  };

  const letterClasses = `ease-in-out ${getHoverClasses()}`;

  // Split text into words and then into letters
  const words = text.split(" ");

  return (
    <div className="flex uppercase">
      {words.map((word, wordIndex) => (
        <div key={wordIndex} className="flex">
          {word.split("").map((letter, letterIndex) => (
            <p key={`${wordIndex}-${letterIndex}`} className={letterClasses}>
              {letter}
            </p>
          ))}
          {wordIndex < words.length - 1 && <div className="w-1" />}
        </div>
      ))}
    </div>
  );
}
