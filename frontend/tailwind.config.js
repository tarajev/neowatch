/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    animation: true,
  },
  variants: {
    extend: {
      animation: ['group-hover'],
    },
  },
  plugins: [],
}

