import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        obsidian: {
          950: "#070A10",
          900: "#0B0F19",
          850: "#101726",
          800: "#162033",
          700: "#1E2C45",
          600: "#2B3C5B",
        },
        gold: {
          50: "#FAF8F0",
          100: "#F6F1DC",
          200: "#ECE0B8",
          300: "#DFC98C",
          400: "#D4AF37",
          500: "#C5A059",
          600: "#A88337",
          700: "#856525",
          800: "#5F471B",
          900: "#3E2E10",
        },
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.25)',
        'gold-sm': '0 2px 10px -2px rgba(212, 175, 55, 0.2)',
        'obsidian-lg': '0 20px 40px -15px rgba(3, 6, 12, 0.8)',
      },
    },
  },
  plugins: [],
};
export default config;
