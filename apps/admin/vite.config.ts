import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@admitly/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@admitly/types': path.resolve(__dirname, '../../packages/types/src'),
      '@admitly/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
    },
  },
  server: {
    port: 5174,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
