import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  return {
    base: "./",
    build: {
      outDir: "dist",
      assetsDir: "assets",
      manifest: true,
      sourcemap: false,
      emptyOutDir: true
    },
    server: { host: true, port: 5173 },
    preview: { port: 4173 }
  };
});
