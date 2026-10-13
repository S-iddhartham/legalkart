import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" }, screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0e1a36",
          900: "#0e1a36",
          800: "#1b2a4d",
          700: "#33426a",
          600: "#4f5d82",
          500: "#6b7798",
          400: "#959fba",
          300: "#c3c9d9",
          200: "#e1e5ee",
          100: "#eef1f6",
          50: "#f6f8fb",
        },
        brand: {
          50: "#fdf1f5",
          100: "#fbe2eb",
          200: "#f6c3d5",
          300: "#ee95b4",
          400: "#e2618e",
          500: "#d23d6f",
          600: "#bb2a5b",
          700: "#9c214b",
          800: "#7f1d3f",
          900: "#6a1b37",
        },
        success: { 50: "#ecfdf5", 600: "#059669", 700: "#047857" },
        warn: { 50: "#fffbeb", 600: "#d97706", 700: "#b45309" },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: { xl: "0.875rem", "2xl": "1.125rem" },
      boxShadow: {
        card: "0 1px 2px rgba(14,26,54,0.04), 0 4px 16px -6px rgba(14,26,54,0.08)",
        lift: "0 2px 4px rgba(14,26,54,0.05), 0 16px 32px -12px rgba(14,26,54,0.18)",
        menu: "0 12px 40px -12px rgba(14,26,54,0.25)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: { "fade-in": "fade-in 160ms ease-out" },
    },
  },
  plugins: [],
};

export default config;
