import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  server: {
    port: 3000,

    proxy: {
      '/api': 'http://localhost:3090',
      '/login': 'http://localhost:3090'
    }
  },

  plugins: [vue()],

  build: {
    sourcemap: true,
    emptyOutDir: true,
    outDir: '../frontend-dist',
    target: ['es2020', 'chrome106', 'edge106', 'firefox104', 'safari15'],
    chunkSizeWarningLimit: '2000k'
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@common': path.resolve(__dirname, '../common')
    }
  },

  publicDir: path.resolve(__dirname, 'public')
});
