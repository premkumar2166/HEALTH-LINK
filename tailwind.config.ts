import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        health: {
          red: {
            50: '#FFEBEE',
            100: '#FFCDD2',
            200: '#EF9A9A',
            300: '#E57373',
            400: '#EF5350',
            500: '#D32F2F', // Primary Red
            600: '#C62828',
            700: '#B71C1C', // Deep Red
            800: '#9A1B1B',
            900: '#7F1D1D',
          },
          primary: '#D32F2F',
          deep: '#9A1B1B',
          light: '#FFEBEE',
          surface: '#FFFFFF',
          bg: '#FAFAFA',
          card: '#FFFFFF',
          dark: '#1A1A1A',
          muted: '#6B7280',
          border: '#E5E7EB',
        },
      },
      boxShadow: {
        'health-sm': '0 1px 3px 0 rgba(211, 47, 47, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'health-md': '0 4px 12px -1px rgba(211, 47, 47, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'health-lg': '0 10px 25px -3px rgba(211, 47, 47, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow-red': '0 0 15px rgba(211, 47, 47, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
