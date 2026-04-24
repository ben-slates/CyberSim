/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0e0f",
        primary: "#00ff88",
        danger: "#ff3366",
        warning: "#ffaa00",
        info: "#00aaff",
        surface: "#111518",
        border: "#1e2a2a"
      },
      fontFamily: {
        heading: ["ShareTechMono", "monospace"],
        body: ["JetBrainsMono", "monospace"]
      },
      boxShadow: {
        neon: "0 0 20px rgba(0,255,136,0.25)",
        danger: "0 0 24px rgba(255,51,102,0.25)"
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0, 255, 136, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 136, 0.07) 1px, transparent 1px)"
      },
      animation: {
        flicker: "flicker 1s ease-in-out 1",
        pulseGrid: "pulseGrid 6s ease-in-out infinite",
        threat: "threat 1.8s ease-in-out infinite"
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: 1 },
          "10%": { opacity: 0.88 },
          "20%": { opacity: 0.96 },
          "35%": { opacity: 0.82 },
          "60%": { opacity: 0.98 },
          "80%": { opacity: 0.9 }
        },
        pulseGrid: {
          "0%, 100%": { opacity: 0.7 },
          "50%": { opacity: 1 }
        },
        threat: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(255,51,102,0.2)" },
          "50%": { boxShadow: "0 0 24px rgba(255,51,102,0.35)" }
        }
      }
    }
  },
  plugins: []
};
