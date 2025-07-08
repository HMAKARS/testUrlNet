/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 다크모드 비활성화
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        danger: '#ef4444',
        warning: '#f59e0b',
        safe: '#10b981',
      }
    },
  },
  plugins: [],
}