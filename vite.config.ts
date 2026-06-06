import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      disable: mode === "development", // Disable in dev to dramatically improve performance
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: [], // Disable precaching to fix caching issues
        runtimeCaching: [
          {
            urlPattern: /.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'cic-runtime-cache',
              networkTimeoutSeconds: 2,
            }
          }
        ]
      },
      manifest: {
        name: "CIC — CA Interactive Cloud",
        short_name: "CIC",
        description: "CIC - CA Interactive Cloud - منصة التعلم التفاعلية",
        theme_color: "#0e9aa7",
        background_color: "#0d1117",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/logo.png", sizes: "192x192", type: "image/png" },
          { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ].filter(Boolean),
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          framer: ['framer-motion'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-popover', 'lucide-react']
        }
      }
    }
  }
}));
