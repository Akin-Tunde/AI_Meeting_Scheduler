import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: 'buffer',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer']
  },
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'node-polyfills',
          generateBundle() {
            // Add Buffer polyfill to the bundle
          }
        }
      ]
    }
  }
})

