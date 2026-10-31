import react from "@vitejs/plugin-react"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import { defineConfig } from "vite"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
  plugins: [react()],

  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 2000,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "/src/assets/scss/responsive/responsive.scss" as *;\n`,
      },
    },
  },

  server: {
    port: 3001,
    strictPort: true,
    open: true,
  },
})
