import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://pulseboard.duckdns.org',
        changeOrigin: true,
        secure: true,
      },
      '/p': {
        target: 'https://pulseboard.duckdns.org',
        changeOrigin: true,
        secure: true,
      },
      '/auth': {
        target: 'https://pulseboard.duckdns.org',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
