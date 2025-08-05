/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: "#22c55e",
        },
      },
    },
  },
  plugins: [],
};
