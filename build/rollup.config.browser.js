import replace from '@rollup/plugin-replace';
import 'dotenv/config';

export default {
  input: 'packages/core/dist/esm/browser/index.js',
  output: {
    file: 'packages/core/dist/browser.js',
    format: 'iife',
    strict: false,
  },
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        'http://127.0.0.1:10010/hook-js-code': `http://127.0.0.1:${process.env.SERVER_PORT}/hook-js-code`,
      },
    }),
  ],
};
