import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["51a8-2409-40c2-1013-e1e-bc5a-c114-3a3a-a4bb.ngrok-free.app"],
  },
});
