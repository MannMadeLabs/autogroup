import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F4C81",
          accent: "#1C86EE"
        }
      }
    }
  },
  plugins: []
};

export default config;
