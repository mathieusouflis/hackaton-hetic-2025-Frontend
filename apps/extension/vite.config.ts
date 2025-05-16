import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: new URL("index.html", import.meta.url).pathname,
        background: new URL("src/background.ts", import.meta.url).pathname,
      },
      output: {
        // Pour que les fichiers JS aient des noms clairs
        entryFileNames: "[name].js",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
  publicDir: "public",
});
