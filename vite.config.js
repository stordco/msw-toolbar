import path from 'path';
import { defineConfig } from 'vite';
import typescript from '@rollup/plugin-typescript';

const resolvePath = str => path.resolve(__dirname, str);

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'msw-toolbar',
      formats: ['es', 'cjs'],
      fileName: format => `msw-toolbar.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react', 'msw'],
      plugins: [
        typescript({
          declaration: true,
          declarationDir: resolvePath('./dist'),
        }),
      ],
    },
  },
});
