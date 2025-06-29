import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["77dc-2409-40c2-100c-c7ff-9992-68d7-6775-6922.ngrok-free.app"],
  },
});
