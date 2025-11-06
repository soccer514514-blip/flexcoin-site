<<<<<<< HEAD
import { defineConfig } from 'vite'
export default defineConfig({
  server: { port: 5173 },
  preview: { port: 5173 }
})
=======
﻿import { defineConfig } from "vite";
export default defineConfig({
  base: "/",
  build: { target: "esnext" },
  esbuild: { target: "esnext" }
});
>>>>>>> c157e31 (deploy: add hero images + vite base=/ + workflow + build)
