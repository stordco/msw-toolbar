const postcss = require('rollup-plugin-postcss');
const tailwind = require('tailwindcss');
const svgr = require('@svgr/rollup');

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

    config.plugins.push(
      svgr({
        svgo: false,
      })
    );

    return config;
  },
};
