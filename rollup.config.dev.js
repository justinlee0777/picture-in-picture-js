import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image';

export default [
  {
    input: 'e2e/index.ts',
    output: {
      sourcemap: true,
      file: 'dev/index.js',
    },
    plugins: [
      nodeResolve({
        moduleDirectories: ['node_modules'],
      }),
      commonjs(),
      typescript(),
      image(),
      html({
        fileName: `index.html`,
      }),
    ],
  },
];
