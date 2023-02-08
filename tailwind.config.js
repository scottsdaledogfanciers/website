module.exports = {
  content: ['./src/**/*.{html,njk,js}'],
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
  plugins: [require("@tailwindcss/typography"), require('@tailwindcss/forms')],
};
