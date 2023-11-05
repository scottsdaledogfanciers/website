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
    extend: {
      // colors: {},
      typography: {
        DEFAULT: {
          css: {
            // don't put open/close quotes around blockquotes
            'blockquote p:first-of-type::before': {
              content: '',
            },
            'blockquote p:last-of-type::after': {
              content: '',
            },
          },
        },
      },
    },
  },
  // variants: {},
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
