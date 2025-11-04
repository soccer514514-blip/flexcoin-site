// Vite config for GitHub Pages (custom domain at root)
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: { outDir: 'dist', sourcemap: false },
  server: { host: true }
})
