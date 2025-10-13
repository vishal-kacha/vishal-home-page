import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",

      // Include Firebase messaging service worker
      injectRegister: "auto",

      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",

      manifest: {
        name: "Productivity Hub",
        short_name: "ProdHub",
        description: "All-in-one productivity app",
        theme_color: "#9333ea",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
});
