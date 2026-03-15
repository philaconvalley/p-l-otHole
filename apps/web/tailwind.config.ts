import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#e5521e",
          "orange-hover": "#cc4418",
        },
        surface: {
          base: "#171717",
          card: "#222222",
          elevated: "#2a2a2a",
          border: "#333333",
          "border-subtle": "#2a2a2a",
        },
        hazard: {
          low: "#10b981",
          moderate: "#d97706",
          high: "#f97316",
          critical: "#ef4444",
          "low-bg": "rgba(16,185,129,0.15)",
          "moderate-bg": "rgba(217,119,6,0.15)",
          "high-bg": "rgba(249,115,22,0.15)",
          "critical-bg": "rgba(239,68,68,0.15)",
        },
        ink: {
          DEFAULT: "#f5f5f5",
          muted: "#9ca3af",
          faint: "#6b7280",
          dimmed: "#4b5563",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-dark": `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
      },
      backgroundSize: {
        grid: "48px 48px",
      },
    },
  },
  plugins: [],
};

export default config;
