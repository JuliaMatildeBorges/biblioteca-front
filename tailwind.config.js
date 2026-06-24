/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        biblioteca: {
          bg: "#f4f7fb",
          text: "#172033",
          muted: "#657084",
          primary: "#0f4c81",
          primaryDark: "#0b365d",
          line: "#d9e1ec",
          success: "#0f7b55",
          danger: "#b42318",
        },
      },
      boxShadow: {
        biblioteca: "0 18px 45px rgba(18, 36, 64, 0.12)",
        reserva: "0 14px 34px rgba(18, 36, 64, 0.08)",
      },
    },
  },
  plugins: [],
};
