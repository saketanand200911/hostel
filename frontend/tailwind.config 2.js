/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: 'var(--primary)',
          secondary: 'var(--secondary)',
          accent: 'var(--accent)',
          primaryHover: 'var(--primary-hover)',
          accentHover: 'var(--accent-hover)',
          surface: 'var(--surface)',
          surfaceCard: 'var(--surface-card)',
          border: 'var(--border-color)',
        }
      }
    },
  },
  plugins: [],
}

