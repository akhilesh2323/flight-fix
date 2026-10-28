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
        aviation: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#95bedc',
          400: '#5f9ec8',
          500: '#3981b2',
          600: '#286694',
          700: '#215278',
          800: '#1e4664',
          900: '#1c3b53',
          950: '#0d1b2a',
        },
        slateDark: {
          850: '#141c2b',
          900: '#0f172a',
          950: '#090d16',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
