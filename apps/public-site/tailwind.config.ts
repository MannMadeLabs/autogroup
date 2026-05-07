import type { Config } from 'tailwindcss';

/**
 * Project Apex - Tailwind config.
 *
 * Per the Plug-and-Play protocol, white-label re-skinning happens here:
 * swap brand tokens + the `Inter` font and you have a new client deploy.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0F172A',
          accent: '#F97316',
          surface: '#F8FAFC',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '70ch',
      },
    },
  },
  plugins: [],
};

export default config;
