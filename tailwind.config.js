module.exports = {
  content: ["./src/**/*.html"],
  theme: {
    fontFamily: {
      sans: ['Gantari', 'sans-serif'],
      serif: ["'Playfair Display'", 'serif'],
    },
    container: {
      center: true,
    },
    // extend: {
    //   colors: {},
    // },
  },
  // variants: {},
  plugins: [require("@tailwindcss/typography")],
};
