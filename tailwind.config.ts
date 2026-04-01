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
        display: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "'Fira Code'", "Menlo", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "neon-green": "#00FF41",
        "neon-red": "#FF003C",
        "neon-gold": "#ffb700",
        obsidian: {
          950: "#050505",
          900: "#0a0a0a",
          850: "#0e0e0e",
          800: "#121212",
          750: "#161616",
          700: "#1a1a1a",
          600: "#222222",
          500: "#2a2a2a",
        },
        gold: {
          50: "#fffdf5",
          100: "#fff9e0",
          200: "#fff0b3",
          300: "#ffe480",
          400: "#ffd74d",
          500: "#ffb700",
          600: "#e6a500",
          700: "#b38000",
          800: "#805c00",
          900: "#4d3700",
        },
      },
      borderRadius: {
        "2.5xl": "1.25rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "neon-green": "0 0 15px rgba(0, 255, 65, 0.3), 0 0 45px rgba(0, 255, 65, 0.1)",
        "neon-red": "0 0 15px rgba(255, 0, 60, 0.3), 0 0 45px rgba(255, 0, 60, 0.1)",
        "neon-gold": "0 0 15px rgba(255, 183, 0, 0.3), 0 0 45px rgba(255, 183, 0, 0.1)",
        "obsidian": "0 8px 40px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
        "obsidian-lg": "0 16px 64px rgba(0, 0, 0, 0.7), 0 4px 16px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        "inner-glow": "inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 0 rgba(0, 0, 0, 0.2)",
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
        "shimmer":    "shimmer 2.5s linear infinite",
        "breathe":    "breathe 4s ease-in-out infinite",
        "neon-flicker": "neonFlicker 3s ease-in-out infinite",
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
          "0%, 100%": { boxShadow: "0 0 8px rgba(0, 255, 65, 0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(0, 255, 65, 0.5), 0 0 40px rgba(0, 255, 65, 0.15)" },
        },
        glowBar: {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.25)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        neonFlicker: {
          "0%, 100%": { opacity: "1" },
          "41%": { opacity: "1" },
          "42%": { opacity: "0.8" },
          "43%": { opacity: "1" },
          "45%": { opacity: "0.6" },
          "46%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
