import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["a3e5-2409-40c2-1013-e1e-7896-f4b2-1e7b-9452.ngrok-free.app"],
  },
});
