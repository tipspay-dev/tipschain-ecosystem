import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        surface: "#0B1020",
        panel: "#121A2E",
        accent: "#35D6A6",
        line: "rgba(255,255,255,0.08)"
      },
      boxShadow: {
        glow: "0 12px 40px rgba(53,214,166,0.18)"
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top right, rgba(53,214,166,0.18), transparent 35%), radial-gradient(circle at bottom left, rgba(95,109,255,0.16), transparent 30%)"
      }
    }
  },
  plugins: []
} satisfies Config;
