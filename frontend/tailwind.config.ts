import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          "on-accent": "rgb(var(--color-text-on-accent) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--color-danger) / <alpha-value>)",
          fg: "rgb(var(--color-danger-fg) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          fg: "rgb(var(--color-success-fg) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          fg: "rgb(var(--color-warning-fg) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--color-info) / <alpha-value>)",
          fg: "rgb(var(--color-info-fg) / <alpha-value>)",
        },
      },
      fontFamily: {
        heading: ["var(--font-montserrat)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      fontSize: {
        h1: ["48px", { lineHeight: "1.1" }],
        h2: ["32px", { lineHeight: "1.15" }],
        h3: ["24px", { lineHeight: "1.2" }],
        body: ["16px", { lineHeight: "1.5" }],
        "body-sm": ["14px", { lineHeight: "1.5" }],
        caption: ["12px", { lineHeight: "1.4" }],
      },
      borderRadius: {
        sm: "8px",
        md: "10px",
        lg: "12px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "step-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(6,117,119,0)", transform: "scale(1)" },
          "5%": { boxShadow: "0 0 0 8px rgba(6,117,119,0.35)", transform: "scale(1.08)" },
          "9%": { boxShadow: "0 0 0 8px rgba(6,117,119,0.35)", transform: "scale(1.08)" },
          "14%": { boxShadow: "0 0 0 0 rgba(6,117,119,0)", transform: "scale(1)" },
        },
        "line-glow": {
          "0%": { clipPath: "inset(0 100% 0 0)", opacity: "0.6" },
          "11%": { clipPath: "inset(0 0% 0 0)", opacity: "1" },
          "13%": { clipPath: "inset(0 0% 0 0)", opacity: "0" },
          "13.5%, 100%": { clipPath: "inset(0 100% 0 0)", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-slide-in": {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-pop-in": {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-pop-out": {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(10px) scale(0.96)" },
        },
      },
      animation: {
        marquee: "marquee 100s linear infinite",
        "step-glow": "step-glow 10.5s ease-in-out infinite backwards",
        "line-glow": "line-glow 10.5s ease-out infinite backwards",
        "fade-in": "fade-in 150ms ease-out",
        "fade-slide-in": "fade-slide-in 300ms ease-out",
        "fade-pop-in": "fade-pop-in 220ms ease-out",
        "fade-pop-out": "fade-pop-out 160ms ease-in forwards",
      },
    },
  },
  plugins: [],
};
export default config;
