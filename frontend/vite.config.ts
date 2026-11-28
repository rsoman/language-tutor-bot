/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development the frontend calls /api/... and Vite forwards it to the FastAPI app,
    // so the backend needs no CORS setup. /api/languages becomes http://127.0.0.1:8000/languages.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // `pnpm test:coverage` (testing.md, coverage gate). The gate is on changed lines, so the
    // report is lcov for line-by-line checks; there is no total threshold on purpose.
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/api/generated/**', 'src/main.tsx'],
      reporter: ['text-summary', 'lcov'],
    },
  },
})
