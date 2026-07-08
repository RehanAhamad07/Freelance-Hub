/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        primary: "#1dbf73", // Fiverr green
        dark: {
          DEFAULT: "#090d16", // Deep space navy dark background
          card: "#111625", // Glassy background card
          border: "#1d2433", // Sleek dark border color
          muted: "#64748b",
        },
        brand: {
          green: "#1dbf73",
          blue: "#3b82f6",
          purple: "#8b5cf6",
          indigo: "#6366f1",
          pink: "#ec4899",
        }
      },
      boxShadow: {
        '3d-sm': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        '3d-md': '0 8px 24px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        '3d-lg': '0 16px 40px rgba(0, 0, 0, 0.07), 0 4px 12px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        '3d-dark-md': '0 8px 30px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        '3d-dark-lg': '0 20px 50px rgba(0, 0, 0, 0.45), 0 4px 15px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glow-primary': '0 0 20px rgba(29, 191, 115, 0.18)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.18)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.18)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.18)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
