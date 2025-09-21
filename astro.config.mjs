// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [tailwind()],
  
  vite: {
    optimizeDeps: {
      include: ["lit", "lit-element", "lit-html"],
      exclude: [],
    },
    ssr: {
      noExternal: ["lit", "lit-element", "lit-html"],
    },
    resolve: {
      alias: {
        'lit-element/lit-element.js': 'lit-element',
        'lit-html/is-server.js': 'lit-html/is-server',
      },
    },
    build: {
      // CSS optimization
      cssCodeSplit: true,
      cssMinify: true,
      
      // JavaScript optimization
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console logs in production
          drop_debugger: true,
        },
        mangle: true,
      },
      
      // Chunk size optimization
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks for better caching
            'vendor-lit': ['lit'],
            'vendor-htmx': ['htmx.org'],
          },
        },
      },
    },
  },

  build: {
    // Inline small stylesheets for better performance
    inlineStylesheets: 'auto',
    
    // Compress HTML
    compress: true,
  },
});
