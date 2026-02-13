import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#d4a017",
          600: "#b8860b",
          700: "#8b6914",
          800: "#6b4f10",
          900: "#4a370b",
        },
        navy: {
          50: "#e8eaf6",
          100: "#c5cae9",
          200: "#9fa8da",
          300: "#7986cb",
          400: "#5c6bc0",
          500: "#1a237e",
          600: "#151c6a",
          700: "#101556",
          800: "#0b0e42",
          900: "#06072e",
        },
        cream: {
          50: "#fffef7",
          100: "#fefceb",
          200: "#fdf8d7",
          300: "#fbf0b3",
          400: "#f9e88f",
        },
      },
      fontFamily: {
        hebrew: ['"Frank Ruhl Libre"', '"David Libre"', '"Noto Serif Hebrew"', 'serif'],
        hebrewSans: ['"Heebo"', '"Assistant"', '"Noto Sans Hebrew"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
