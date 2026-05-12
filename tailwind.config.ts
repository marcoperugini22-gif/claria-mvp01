import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors estratti dal logo Claria
        claria: {
          // Indigo profondo del wordmark "elaria"
          ink: "#1E15C2",
          "ink-soft": "#2D26D9",
          "ink-deep": "#15108F",
          // Crema/giallo tenue dello sfondo del logo
          cream: "#FFF7CE",
          "cream-soft": "#FFFBE6",
          "cream-deep": "#F5EBB0",
          // Neutri caldi per UI
          warm: "#FAF7EE",
          smoke: "#E8E2D4",
        },
        // Colori semantici per i 4 profili psicofinanziari (usabili nei badge/widget adattivi)
        profile: {
          rimandatore: "#7C6FF0",   // viola morbido - guida step-by-step
          evitante: "#F4B860",      // pesca caldo - rassicurante
          controllore: "#3D5AFE",   // blu deciso - affidabilità
          impulsivo: "#FF7A6B",     // corallo - attenzione gentile
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "soft-pulse": "softPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        softPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
