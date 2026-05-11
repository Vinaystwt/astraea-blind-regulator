/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-void": "#0A0A0B",
        "bg-surface": "#141416",
        "bg-surface-elevated": "#1C1C1F",
        "border-obsidian": "#27272A",
        "border-brass": "#8C7D64",
        "accent-gold": "#D4AF37",
        "accent-starlight": "#F3F4F6",
        "text-primary": "#EDEDED",
        "text-secondary": "#A1A1AA",
        "text-tertiary": "#52525B",
        "approved-bg": "#1A2E22",
        "approved-text": "#6EE7B7",
        "rejected-bg": "#3B1C1C",
        "rejected-text": "#FDA4AF",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      fontSize: {
        hero: ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "page-title": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "section-title": ["1.75rem", { lineHeight: "1.2" }],
      },
      borderRadius: {
        DEFAULT: "0px",
        sm: "2px",
        md: "2px",
        lg: "2px",
        xl: "2px",
        "2xl": "2px",
        "3xl": "2px",
        full: "9999px",
      },
      keyframes: {
        "cipher-scramble": {
          "0%": { opacity: "0.5" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.8" },
        },
        "wipe-reveal": {
          "0%": { clipPath: "inset(0 100% 0 0)" },
          "100%": { clipPath: "inset(0 0% 0 0)" },
        },
        "fade-slide-in": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-border": {
          "0%, 100%": { borderColor: "#27272A" },
          "50%": { borderColor: "#8C7D64" },
        },
      },
      animation: {
        "cipher-scramble": "cipher-scramble 0.05s ease-in-out",
        "wipe-reveal": "wipe-reveal 0.6s ease-out forwards",
        "fade-slide-in": "fade-slide-in 0.3s ease-out",
        "pulse-border": "pulse-border 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
