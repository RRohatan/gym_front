/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens semánticos del proyecto CosmoGYM.
        // Mapean a los mismos hex que ya se usan en main.css.
        // Las paletas originales de Tailwind (blue-*, red-*, etc.) siguen disponibles.
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          DEFAULT: '#2563eb',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          DEFAULT: '#059669',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          DEFAULT: '#dc2626',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          DEFAULT: '#f59e0b',
        },
        brand: {
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
          light: '#fca5a5',
        },
        surface: {
          light: '#f8fafc',
          DEFAULT: '#f1f5f9',
          muted: '#eef2f7',
          dark: '#0f172a',
          darker: '#080d1a',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04), 0 24px 64px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}

