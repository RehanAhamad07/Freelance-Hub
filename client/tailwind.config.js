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
        primary: "#1dbf73", // Fiverr green
        dark: "#1e1e1e",
      }
    },
  },
  plugins: [],
}
