/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:      "#122654",
          navyLight: "#1a3570",
          navyPale:  "#e8ecf5",
          gold:      "#F5A623",
          goldDark:  "#d4881a",
          white:     "#FFFFFF",
          light:     "#F4F6FA",
          gray:      "#6B7280",
          border:    "#D1D5DB",
          dark:      "#111827",
        },
      },
      fontFamily: {
        heading: ["'Playfair Display'", "serif"],
        urdu:    ["'Noto Nastaliq Urdu'", "serif"],
        sans:    ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
}