import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Telegram dark theme colors
        telegram: {
          bg: "#212121",
          "bg-secondary": "#181818",
          "bg-tertiary": "#0f0f0f",
          text: "#ffffff",
          "text-secondary": "#aaaaaa",
          "text-hint": "#707579",
          accent: "#64b5f6",
          "accent-dark": "#5aa3e8",
          border: "#2f2f2f",
          "border-light": "#3f3f3f",
          success: "#4caf50",
          error: "#f44336",
          warning: "#ff9800",
        },
      },
      fontFamily: {
        sans: ["SF Pro Display", "system-ui", "sans-serif"],
      },
      borderRadius: {
        telegram: "12px",
      },
      boxShadow: {
        telegram: "0 2px 8px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;