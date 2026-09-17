import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#07080C",
        night: "#12141C",
        stage: "#191620",
        paper: "#F6F1E8",
        ink: "#16141A",
        mute: "#8B8794",
        hot: "#FF4B6B",
        mint: "#5EE0C0",
        gold: "#E8C56A",
        rose: "#EAA2AE",
        mia: "#FF8A6B",
        jade: "#8FB4FF",
        vanessa: "#E8C56A",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        ui: [
          "var(--font-ui)",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      maxWidth: {
        dialog: "720px",
      },
      borderRadius: {
        dialog: "20px",
        chip: "14px",
      },
      keyframes: {
        "gold-sweep": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        "caret-pulse": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "gold-sweep": "gold-sweep 600ms ease-out",
        "caret-pulse": "caret-pulse 1.4s ease-in-out infinite",
        "fade-up": "fade-up 180ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
