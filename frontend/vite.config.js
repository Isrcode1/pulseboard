import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
