// packages/msw-devtools/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    // 빌드 시 이전 빌드 결과물을 지우지 않도록 설정합니다.
    // watch 모드에서 불필요한 전체 리빌드를 방지합니다.
    emptyOutDir: true,
    rollupOptions: {
      input: {
        devtools: resolve(__dirname, "/devtools.html"),
        panel: resolve(__dirname, "/panel.html"),
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content-script.ts"),
      },
      output: {
        // [오류 수정] 'src/' 경로를 제거하여 빌드된 JS 파일이 'dist' 폴더 최상위에 위치하도록 합니다.
        entryFileNames: "[name].js",
        // 청크 파일(공통 모듈)은 assets 폴더에 위치시킵니다.
        chunkFileNames: "assets/[name].js",
        // 기타 에셋(css, 이미지 등)도 assets 폴더에 위치시킵니다.
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
