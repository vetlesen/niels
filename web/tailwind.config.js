/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        monument: ["monument", "Arial", "Helvetica", "sans-serif"],
        sans: ["monument", "Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
