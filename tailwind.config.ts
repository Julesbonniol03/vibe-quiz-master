import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "neon-cyan": "#00f0ff",
        "neon-rose": "#ff2d7b",
        cyber: {
          950: "#050508",
          900: "#0a0a12",
          800: "#0f0f1c",
          700: "#161628",
          600: "#1e1e3a",
        },
      },
      borderRadius: {
        "2.5xl": "1.25rem",
      },
      animation: {
        "bounce-in":  "bounceIn 0.5s ease-out",
        "fade-in":    "fadeIn 0.35s ease-out",
        "slide-up":   "slideUp 0.35s ease-out",
        "slide-down": "slideDown 0.35s ease-out",
        "pop":        "pop 0.25s ease-out",
        "shake":      "shake 0.5s ease-in-out",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "glow-bar":   "glowBar 2s ease-in-out infinite",
        "float":      "float 3s ease-in-out infinite",
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
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 50%, 90%": { transform: "translateX(-4px)" },
          "30%, 70%": { transform: "translateX(4px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0, 240, 255, 0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.15)" },
        },
        glowBar: {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.25)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
