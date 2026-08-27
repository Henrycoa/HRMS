// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/backend": {
        target: "http://localhost/Lord%20help",
        changeOrigin: true,
        secure: false,
      },
      // Proxy for API
      "/api": {
        target: "http://localhost/Lord%20help/backend",
        changeOrigin: true,
        secure: false,
      },
      "/auth-file": {
        target: "http://localhost/Lord%20help/backend",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
