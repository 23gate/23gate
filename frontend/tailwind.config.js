/** @type {import('tailwindcss').Config} */
const tailwindForms = require('@tailwindcss/forms');

module.exports = {
  mode: '',
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,mjs}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F7FF',
          100: '#EBEEFF',
          200: '#D6DDFF',
          300: '#BDC8FF',
          400: '#A3B2FF',
          500: '#8296FF',
          600: '#6B84FF',
          700: '#526EFF',
          800: '#2E51FF',
          900: '#0026E6'
        }
      }
    }
  },
  plugins: [ tailwindForms ]
}
