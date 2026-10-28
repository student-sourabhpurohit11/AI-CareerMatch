import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the site at /<repo-name>/ — set base accordingly.
  // In local dev (npm run dev) the base stays '/' via the env flag.
  base: process.env.GITHUB_ACTIONS ? '/AI-carrermatch/' : '/',
})
