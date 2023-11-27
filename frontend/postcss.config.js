export default {
  plugins: {
    'tailwindcss': {},
    'postcss-preset-env': {
      autoprefixer: {}
    },
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  }
};
