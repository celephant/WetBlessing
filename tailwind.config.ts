import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#070814",
        blush: "#ff7ad9",
        mint: "#5dffc8",
        lilac: "#b9a6ff",
        gold: "#ffd18a",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-ui)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 20px 60px rgba(8, 6, 20, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
