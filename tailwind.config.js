import colors from "tailwindcss/colors.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./error.vue",
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: '#85BA25',
        secondary: '#FF8539',
      },
    },
  },
  plugins: [],
}

