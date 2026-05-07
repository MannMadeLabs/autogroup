import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#0F62FE",
          700: "#0043CE"
        }
      }
    }
  },
  plugins: []
};

export default config;
