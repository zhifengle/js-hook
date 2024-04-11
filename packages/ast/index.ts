import { transformSync } from '@swc/core';
import { join } from 'path'

export function inject(code: string, genOpt?: any): string {
  const output = transformSync(code, {
    minify: true,
    jsc: {
      experimental: {
        plugins: [
          [
            join(__dirname, './my-first-plugin/my_first_plugin.wasm'),
            {
              hookCallName: 'e_user_hook',
            },
          ],
        ],
      },
    },
  });
  return output.code;
}
