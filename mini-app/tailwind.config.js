/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#07070E',
        surface: '#0F0F1C',
        border: '#1C1C30',
        accent: '#7C3AED',
        accent2: '#06B6D4',
        fast: '#10B981',
        slow: '#EF4444',
        orange: '#F97316',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
        btn: '14px',
      },
      maxWidth: {
        app: '420px',
      },
    },
  },
  plugins: [],
}
