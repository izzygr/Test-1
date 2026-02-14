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
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        navy: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#1e293b",
          600: "#1a2332",
          700: "#0f172a",
          800: "#0c1322",
          900: "#09101a",
        },
        cream: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#f0f0f0",
          300: "#e5e5e5",
          400: "#d4d4d4",
        },
      },
      fontFamily: {
        hebrew: ['"Rubik"', '"Noto Sans Hebrew"', 'sans-serif'],
        hebrewSans: ['"Rubik"', '"Noto Sans Hebrew"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
