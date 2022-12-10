/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,tsx,jsx}"],
  theme: {
    extend: {
      colors: {
        "darkest-blue": "#011624",
        "darker-blue": "#021D2F",
        "dark-blue": "#032C48",
      }
    },
  },
  plugins: [],
}
