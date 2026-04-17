import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Championship Gold (Light Mode)
        primary: {
          light: "#f59e0b", // Orange
          DEFAULT: "#ea580c", // Amber
        },
        accent: {
          light: "#dc2626", // Red
          gold: "#fbbf24", // Gold
        },
        // Tournament Energy (Dark Mode)
        purple: {
          DEFAULT: "#a855f7",
          dark: "#7c3aed",
        },
        magenta: "#ec4899",
        cyan: "#06b6d4",
        lime: "#84cc16",
      },
      fontFamily: {
        display: ["var(--font-bebas-neue)", "sans-serif"],
        body: ["var(--font-outfit)", "sans-serif"],
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "gradient-shift": "gradient-shift 15s ease infinite",
      },
    },
  },
  plugins: [],
};
export default config;
