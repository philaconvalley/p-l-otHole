import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette
        hazard: {
          low: "#22c55e",       // green-500
          moderate: "#f59e0b",  // amber-500
          high: "#f97316",      // orange-500
          critical: "#ef4444",  // red-500
        },
      },
    },
  },
  plugins: [],
};

export default config;
