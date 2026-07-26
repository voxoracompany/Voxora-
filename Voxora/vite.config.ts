import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5000,
    allowedHosts: true,
  },

  preview: {
    host: true,
    port: 5000,
  },

  build: {
    // Target modern browsers for smaller, faster output
    target: 'es2020',

    // Warn when a chunk exceeds 800 kB
    chunkSizeWarningLimit: 800,

    // No source maps in production builds
    sourcemap: false,

    rollupOptions: {
      output: {
        // Split vendor bundles for better long-term caching
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) {
            return 'router';
          }
          if (id.includes('node_modules/firebase')) {
            return 'firebase';
          }
        },
      },
    },
  },

  // Optimise dependencies for faster cold starts
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
