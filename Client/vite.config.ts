import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["8cc3-2409-40c2-100c-c7ff-5036-81a8-6e3c-98e4.ngrok-free.app"],
  },
});
