import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ui-factory/ui-headless": path.resolve(__dirname, "./packages/ui-headless"),
      "@ui-factory/ui-shadcn": path.resolve(__dirname, "./packages/ui-shadcn/src")
    },
  },
  publicDir: 'public',
}) 