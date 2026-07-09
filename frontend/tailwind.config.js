
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#3D56B2",    
          secondary: "#5C7AEA",  
          bgCanvas: "#F4F6F9",   
          card: "#FFFFFF",       
          textMain: "#1A1A1A",   
          textMuted: "#757575",  
          borderLight: "#E5E7EB",
        }
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
        poppins: ["Poppins", "sans-serif"]
      },
      boxShadow: {
        cardFloating: "0px 10px 30px rgba(0, 0, 0, 0.03)"
      },
      borderRadius: {
        sidebar: "24px",
        cardBig: "20px",
        cardMedium: "16px"
      }
    },
  },
  plugins: [],
}
