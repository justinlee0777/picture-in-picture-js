import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image';
import postcss from 'rollup-plugin-postcss';

export default [
  {
    input: 'index.ts',
    output: {
      sourcemap: true,
      file: 'dist/index.js',
    },
    plugins: [
      nodeResolve({
        moduleDirectories: ['node_modules'],
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.prod.json',
      }),
      image(),
      postcss(),
    ],
  },
];
