import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0F172A',
          accent: '#F97316',
        },
      },
    },
  },
  plugins: [],
};

export default config;
