import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        muted: "var(--muted)",
        border: "var(--border)",
        primary: "#f7b500",
        secondary: "var(--secondary)",
        accent: "#ffcf4d"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      },
      boxShadow: {
        soft: "var(--shadow-soft)"
      }
    }
  },
  plugins: []
};

export default config;
