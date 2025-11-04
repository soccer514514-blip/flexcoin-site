import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',            // GitHub Pages w/ custom domain -> '/'
  build: { outDir: 'dist' }
})