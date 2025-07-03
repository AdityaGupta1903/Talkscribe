import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["944f-2409-40c2-116d-5da2-1d81-c772-9a8e-c0e4.ngrok-free.app"],
  },
});
