import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image';
import postcss from 'rollup-plugin-postcss';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

const distFolder = 'dist';

mkdirSync(distFolder);
copyFileSync('./index.css', `./${distFolder}/index.css`);
copyFileSync('./LICENSE', `./${distFolder}/LICENSE`);

const packageJsonString = readFileSync('./package.json', { encoding: 'utf-8' });
const packageJson = JSON.parse(packageJsonString);

writeFileSync(
  `./${distFolder}/package.json`,
  JSON.stringify({ ...packageJson, sideEffects: false }, null, 2),
);

export default [
  {
    input: 'index.ts',
    output: {
      sourcemap: true,
      file: `${distFolder}/index.js`,
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
