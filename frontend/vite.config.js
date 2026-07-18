import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Point API calls at the local docker-compose stack by default;
// set VITE_API_PROXY=https://pulseboard.duckdns.org to dev against prod.
const apiTarget = process.env.VITE_API_PROXY || 'http://localhost:80'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
