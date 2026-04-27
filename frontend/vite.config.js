import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:5010',
      '/products': 'http://localhost:5010',
      '/logs': 'http://localhost:5010',
    }
  }
})
