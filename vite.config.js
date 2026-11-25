import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        // Preserve o Host do navegador para que o Spring reconheça a mesma origem.
        changeOrigin: false,
      },
    },
  },
})
