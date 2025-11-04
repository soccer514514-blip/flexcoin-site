import { defineConfig } from "vite";

export default defineConfig({
  base: "/",               // 커스텀 도메인(CNAME)이라 루트(/)가 맞습니다
  build: {
    outDir: "dist",
    manifest: true,        // dist/manifest.json 생성 (index 로더가 읽어옴)
    emptyOutDir: true
  }
});
