import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/bandfit-golf/",
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"],
      manifest: {
        name: "BandFit Golf",
        short_name: "BandFit",
        description: "Three-day resistance-band and bodyweight training for golfers.",
        theme_color: "#163832",
        background_color: "#F6F2EA",
        display: "standalone",
        orientation: "portrait",
        start_url: "/bandfit-golf/",
        scope: "/bandfit-golf/",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: []
      }
    })
  ],
  test: {
    environment: "node"
  }
});
