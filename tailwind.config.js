/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-worksans)', 'sans-serif'],
      }, colors: {
        primary: '#3B82F6', // blue-500
        secondary: '#8B5CF6', // purple-500
        dark: '#111827',
        grayDark: '#1F2937',
        background: '#1E293B',
      }
    },
  },
  plugins: [],
}
