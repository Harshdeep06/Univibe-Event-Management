/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/*.html",
    "./public/js/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3D56B2',
          secondary: '#5C7AEA',
          bgCanvas: '#F4F6F9',
          card: '#FFFFFF',
          textMain: '#1A1A1A',
          textMuted: '#757575'
        }
      }
    },
  },
  plugins: [],
}
