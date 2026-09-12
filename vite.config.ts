import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React — cached longest, changes never
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // Supabase client — separate so auth updates don't bust UI cache
          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase';
          }
          // All Radix UI / shadcn components
          if (id.includes('node_modules/@radix-ui/') || id.includes('node_modules/class-variance-authority') || id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) {
            return 'vendor-ui';
          }
          // React Router
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run/')) {
            return 'vendor-router';
          }
          // Charts — heavy, load separately
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
          // Tanstack Query
          if (id.includes('node_modules/@tanstack/')) {
            return 'vendor-query';
          }
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-date';
          }
        },
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logos/logo-default.png"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/, /^\/sw-reset/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: "LunchLIT - Your Daily School Companion",
        short_name: "LunchLIT",
        description: "All-in-one student planner for schedules, meals, tasks, and more",
        theme_color: "#6366f1",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/logos/logo-default.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logos/logo-default.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/logos/logo-default.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

