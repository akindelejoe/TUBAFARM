/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        farm: {
          50: "#f2f7f3",
          100: "#dfeee2",
          200: "#c0ddc7",
          300: "#93c39f",
          400: "#5fa172",
          500: "#3d8253",
          600: "#2c6741",
          700: "#245236",
          800: "#1f412d",
          900: "#193527",
          950: "#0d1e16",
        },
      },
    },
  },
  plugins: [],
};
