import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: { chunkSizeWarningLimit: 600 },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["**/*.{png,jpg,svg}"],
      manifest: {
        name: "سينمورا - منصتك السينمائية",
        short_name: "سينمورا",
        description: "منصتك السينمائية المتكاملة لمشاهدة الأفلام والمسلسلات من جميع أنحاء العالم",
        theme_color: "#0f0f0f",
        background_color: "#0f0f0f",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone"],
        dir: "rtl",
        lang: "ar",
        scope: "/",
        start_url: "/",
        id: "/",
        orientation: "portrait-primary",
        categories: ["entertainment", "movies", "streaming"],
        edge_side_panel: { preferred_width: 400 },
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5555",
        changeOrigin: true,
      },
    },
  },
});
