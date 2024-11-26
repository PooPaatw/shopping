import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";
import vue2 from "@vitejs/plugin-vue2";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue2(),
    legacy({
      targets: ["ie >= 11"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 8001,
  },
  build: {
    sourcemap: true,
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        // 如果你需要全局引入一些 SCSS 變數或 mixin，可以在這裡添加
        // additionalData: `@import "@/styles/variables.scss";`
      },
    },
  },
  // 如果您使用 TypeScript
  typescript: {
    tsconfig: "./tsconfig.json",
  },
});
