import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["790e-2409-40c2-100c-c7ff-207c-3b82-e957-b6a.ngrok-free.app"],
  },
});
