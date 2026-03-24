import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        "bounce-in":  "bounceIn 0.5s ease-out",
        "fade-in":    "fadeIn 0.35s ease-out",
        "slide-up":   "slideUp 0.35s ease-out",
        "slide-down": "slideDown 0.35s ease-out",
        "pop":        "pop 0.25s ease-out",
      },
      keyframes: {
        bounceIn: {
          "0%":   { transform: "scale(0.8)", opacity: "0" },
          "60%":  { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        slideDown: {
          "0%":   { transform: "translateY(-16px)", opacity: "0" },
          "100%": { transform: "translateY(0)",     opacity: "1" },
        },
        pop: {
          "0%":   { transform: "scale(0.92)" },
          "60%":  { transform: "scale(1.04)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
