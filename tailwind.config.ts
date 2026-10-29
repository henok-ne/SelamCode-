import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#10191d", surface: "#172227", elevated: "#1d2b30",
        line: "#2a393e", ink: "#edf2ef", muted: "#9caeb3",
        teal: { 300: "#b0e4d6", 400: "#91d5c5", 500: "#69bba8", 900: "#203e39" },
        honey: "#dfbd91", danger: "#f0a49c",
      },
      fontFamily: {
        sans: ["Inter Variable", "Noto Sans Ethiopic", "sans-serif"],
        display: ["Manrope Variable", "Noto Sans Ethiopic", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: { soft: "0 12px 40px -16px rgb(0 0 0 / 35%)" },
      keyframes: { enter: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } } },
      animation: { enter: "enter .35s ease-out both" },
    },
  },
  plugins: [],
} satisfies Config;
