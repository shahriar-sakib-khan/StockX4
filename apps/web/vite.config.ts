import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'print-url',
      configureServer(server) {
        const _print = server.printUrls;
        server.printUrls = () => {
          _print();
          console.log(`\n  🚀 Frontend running on http://localhost:${server.config.server.port}\n`);
        };
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
