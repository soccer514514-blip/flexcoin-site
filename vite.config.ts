import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',            // 커스텀 도메인(루트) 배포
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    manifest: true,     // ← 반드시 true
    emptyOutDir: true
  }
})
