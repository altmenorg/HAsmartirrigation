import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';

const plugins = [
  nodeResolve(),
  commonjs({
    include: 'node_modules/**'
  }),
  // include explicite : le filtre par défaut de typescript2 est en extglob
  // (`**/*.ts+(|x)`), que picomatch >=4 ne matche plus -> les .ts seraient
  // skippes (non transpiles) et rollup planterait sur la syntaxe TS brute.
  typescript({ include: ['**/*.ts', '**/*.tsx'] }),
  json(),
  terser()
];

export default [
  {
    input: 'src/smart-irrigation.ts',
    output: {
      dir: 'dist',
      format: 'iife',
      inlineDynamicImports: true,
      sourcemap: true,
    },
    plugins: [...plugins],
    context: 'window'
  },
  // The dashboard card, built on its own: it loads on every dashboard, so it
  // must not carry the panel (or its nineteen language files) with it.
  {
    input: 'src/card/smart-irrigation-card.ts',
    output: {
      file: 'dist/smart-irrigation-card.js',
      format: 'iife',
      inlineDynamicImports: true,
      sourcemap: true,
    },
    plugins: [...plugins],
    context: 'window'
  },
];