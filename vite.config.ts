// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',                 // 커스텀 도메인(root)이므로 '/'
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    manifest: true,          // ★ manifest 생성 (핵심)
    emptyOutDir: true
  }
})
