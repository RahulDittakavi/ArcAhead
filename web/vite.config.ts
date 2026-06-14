import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Frontend talks to the API at /api; proxy to the Express server in dev.
      "/api": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
});
