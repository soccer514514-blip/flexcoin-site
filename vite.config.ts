import { defineConfig, loadEnv } from "vite";
import path from "path";

/**
 * ✅ Flexcoin 최신 Vite 설정 (2025-11 기준)
 * - GitHub Pages 자동 배포 최적화
 * - manifest.json 자동 생성 (index.html 포함)
 * - 로컬/배포환경 base 자동 인식
 * - public/ 및 src/ 절대경로 alias 지원
 * - 멀티언어(i18n), NFT, Countdown 대응 구조
 */

export default defineConfig(({ mode }) => {
  // .env 파일 로드 (예: VITE_API_URL 등)
  const env = loadEnv(mode, process.cwd(), "");

  // 🔹 Pages나 커스텀 도메인에 맞게 base 자동 세팅
  //    GitHub Pages면 "./", 독립 도메인이면 "/"
  const isPages = process.env.GITHUB_ACTIONS === "true" || !!process.env.PAGES;
  const base = isPages ? "./" : "/";

  return {
    base,
    define: {
      __APP_ENV__: env.APP_ENV,
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      manifest: true,
      sourcemap: false,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
        output: {
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
      emptyOutDir: true,
      reportCompressedSize: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "~": path.resolve(__dirname, "./"),
      },
    },
    server: {
      host: true,
      port: 5173,
      open: true,
    },
    preview: {
      port: 4173,
      open: true,
    },
    esbuild: {
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
    optimizeDeps: {
      include: ["ethers", "axios"],
    },
  };
});
