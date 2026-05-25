import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#fffefb",
        foreground: "#141414",
        card: "#ffffff",
        muted: "#f7f7f5",
        border: "#ece8dd",
        primary: "#f7b500",
        secondary: "#141414",
        accent: "#ffcf4d"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      },
      boxShadow: {
        soft: "0 6px 24px rgba(20, 20, 20, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
