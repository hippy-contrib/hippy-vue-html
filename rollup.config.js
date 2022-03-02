import commonjs from '@rollup/plugin-commonjs';
import vue from 'rollup-plugin-vue';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';

export default {
  input: './index.js',
  output: {
    name: 'HippyVueHtml',
    file: './dist/index.js',
    format: 'umd',
    globals: {
      vue: 'Vue',
    },
  },
  plugins: [nodeResolve({ extensions: ['.vue'] }), commonjs(), vue(), babel()],
  external: ['vue'],
};
