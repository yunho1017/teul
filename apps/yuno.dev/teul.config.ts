import { defineConfig } from "teul/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  pagesDir: "pages",
  vite: {
    plugins: [tailwindcss()],
    // .md를 asset으로 취급해 HMR 시 JS로 파싱하려다 깨지는 문제 방지
    // (import.meta.glob의 ?raw 쿼리는 그대로 동작)
    assetsInclude: ["**/*.md"],
  },
});
