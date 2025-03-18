import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

// Явно перечислим внешние зависимости
const external = [
  'react', 
  'react-dom', 
  'jsdom', 
  'commander', 
  'tailwind-merge',
  'path',
  'fs',
  'url',
  'process',
  'node:path',
  'node:fs',
  'node:url',
  'node:process'
];

// Проверяем, является ли импорт внешним
function isExternal(id) {
  // Проверка на встроенные Node.js модули или модули из node_modules
  return external.includes(id) || 
         id.startsWith('node:') || 
         !id.includes('src/') && /^[@a-z]/.test(id);
}

export default {
  input: {
    'index': 'src/index.ts',
    'cli/index': 'src/cli/index.ts',
    'cli/bin': 'src/cli/bin.ts'
  },
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src'
  },
  external: isExternal,
  plugins: [
    resolve({
      preferBuiltins: true,
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json'
    }),
  ]
}; 