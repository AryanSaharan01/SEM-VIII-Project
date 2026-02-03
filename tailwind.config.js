/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9fa',
          100: '#d9eff2',
          200: '#b7e0e6',
          300: '#86cad5',
          400: '#4eacbc',
          500: '#208091',
          600: '#1a7084',
          700: '#19586c',
          800: '#1a4859',
          900: '#1a3d4c',
        },
        neutral: {
          50: '#faf9f6',
          100: '#f5f3ed',
          200: '#e8e3d8',
          300: '#d4cbb8',
          400: '#b8a888',
          500: '#9d8762',
          600: '#826d4f',
          700: '#6b5a42',
          800: '#594c39',
          900: '#4b4032',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
