import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["*.csb.app"],
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
  },
});
