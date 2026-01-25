import { defineConfig } from "teul/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  pagesDir: "pages",
  vite: {
    plugins: [tailwindcss()],
  },
});
