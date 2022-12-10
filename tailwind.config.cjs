/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./dist/**/*.{html,js,ts,tsx,jsx,css}",
  

  ],
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

