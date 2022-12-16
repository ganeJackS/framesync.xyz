/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "darkest-blue": "#011624",
        "darker-blue": "#021D2F",
        "dark-blue": "#032C48",
      },
    },
  },
  plugins: [],
}
