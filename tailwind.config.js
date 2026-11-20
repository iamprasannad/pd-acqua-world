/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aqua: {
          950: '#020b14',
          900: '#041424',
          850: '#071e34',
          800: '#0b2944',
          700: '#0f3d64',
          600: '#0284c7',
          500: '#0ea5e9',
          400: '#38bdf8',
          300: '#7dd3fc',
          200: '#bae6fd',
          100: '#e0f2fe',
          50: '#f0f9ff',
        },
        panel: {
          dark: 'rgba(4, 18, 34, 0.82)',
          darker: 'rgba(2, 10, 19, 0.92)',
          glass: 'rgba(11, 41, 68, 0.5)',
          border: 'rgba(56, 189, 248, 0.2)',
          glow: 'rgba(56, 189, 248, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'aqua-glow': '0 0 20px -3px rgba(56, 189, 248, 0.25)',
        'aqua-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
