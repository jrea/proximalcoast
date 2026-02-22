import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Shim 'server-only' so route files don't throw outside Next.js
      'server-only': path.resolve(__dirname, './src/test/mocks/server-only.ts'),
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    clearMocks: true,       // auto-clear mock.calls/instances between tests
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@overmake': path.resolve(__dirname, './src/app/sites/overmake'),
      // In tests, @/lib/db resolves to the central mock — never the real db.ts
      '@/lib/db': path.resolve(__dirname, './src/lib/__mocks__/db.ts'),
      // Shim server-only in test scope too
      'server-only': path.resolve(__dirname, './src/test/mocks/server-only.ts'),
    }
  },
})
