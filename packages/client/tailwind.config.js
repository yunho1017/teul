/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./framework/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        cursor: {
          "50%": { opacity: "0" },
        },
      },
      animation: {
        cursor: "cursor 1.1s infinite step-start",
      },
    },
  },
  plugins: [],
};
