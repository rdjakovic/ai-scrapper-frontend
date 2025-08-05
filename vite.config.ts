import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],
          
          // Routing
          router: ['react-router-dom'],
          
          // State management and data fetching
          query: ['@tanstack/react-query'],
          
          // Form handling
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // UI components and icons
          ui: ['@heroicons/react'],
          
          // Utilities
          utils: ['axios', 'date-fns'],
          
          // Large components
          visualization: ['@uiw/react-json-view', '@tanstack/react-virtual']
        }
      }
    },
    
    // Additional optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  }
})