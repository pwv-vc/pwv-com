import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  // Base public path when served in development or production
  base: "/",

  // Configure the public directory
  publicDir: "public",

  // Specify additional file types to be treated as static assets
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg"],

  // Resolve configuration
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Build configuration
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // Adjust this value as needed for your project
    assetsInlineLimit: 4096,
  },

  // Server configuration
  server: {
    // You can adjust these settings as needed
    port: 3000,
    open: true,
  },
});
