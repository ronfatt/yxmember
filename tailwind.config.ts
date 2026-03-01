import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0e0f12",
        sand: "#f6f3ee",
        jade: "#0b6b5a",
        gold: "#c9a227"
      },
      fontFamily: {
        display: ["'Noto Serif SC'", "'Source Han Serif SC'", "serif"],
        accent: ["'Cormorant Garamond'", "serif"],
        body: ["'Work Sans'", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
