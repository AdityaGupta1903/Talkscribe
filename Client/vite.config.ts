import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["b08c-2409-40c2-100c-c7ff-e1e7-dcbc-721d-a2a7.ngrok-free.app"],
  },
});
