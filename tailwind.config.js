/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#0a0a0a',
          panel: '#141414',
          border: '#1f1f1f',
          hover: '#1a1a1a',
          active: '#222222',
          text: '#e5e5e5',
          muted: '#737373',
          accent: '#22c55e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
