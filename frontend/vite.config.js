import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose dev server on all network interfaces so phones on same WiFi can access it
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  // GitHub Pages base path — only applied during CI/CD build
  base: process.env.GITHUB_ACTIONS ? '/AI-CareerMatch/' : '/',
})
