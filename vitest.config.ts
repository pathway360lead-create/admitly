import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types.ts',
        '**/*.d.ts',
        '**/dist/',
        '**/.next/',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
      '@admitly/ui': path.resolve(__dirname, './packages/ui/src'),
      '@admitly/types': path.resolve(__dirname, './packages/types/src'),
      '@admitly/api-client': path.resolve(__dirname, './packages/api-client/src'),
      'react': path.resolve(__dirname, './apps/web/node_modules/react'),
      'react-dom': path.resolve(__dirname, './apps/web/node_modules/react-dom'),
    },
  },
});
