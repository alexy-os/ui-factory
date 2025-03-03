import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin(),
  ],
  resolve: {
    alias: {
      '@test-button/atom': path.resolve(__dirname, 'atom/src'),
      '@test-button/molecule': path.resolve(__dirname, 'molecule/src'),
      '@test-button/organism': path.resolve(__dirname, 'organism/src'),
    }
  },
  optimizeDeps: {
    include: ['tailwind-variants']
  },
  build: {
    outDir: './dist',
  },
  server: {
    port: 3000,
    open: true,
  }
}); 