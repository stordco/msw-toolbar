const postcss = require('rollup-plugin-postcss');
const tailwind = require('tailwindcss');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      postcss({
        modules: true,

        plugins: [
          tailwind({
            plugins: [
              require('@tailwindcss/forms')({
                strategy: 'class',
              }),
            ],
          }),
        ],
      })
    );

    return config;
  },
};
