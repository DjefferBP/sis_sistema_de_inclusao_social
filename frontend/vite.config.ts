import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "autotrophically-huffish-arely.ngrok-free.dev",
    ],
    port: 5173,
    proxy: {
      '/posts': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/usuarios': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/xp': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/comentarios': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/chat': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/cursos': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/vagas': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})