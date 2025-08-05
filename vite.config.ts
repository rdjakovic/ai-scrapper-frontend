import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      
      // Asset optimization
      assetsDir: 'assets',
      assetsInlineLimit: 4096, // 4kb
      
      rollupOptions: {
        output: {
          // Optimize chunk splitting
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
          },
          
          // Optimize file naming for caching
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`
            }
            if (/css/i.test(ext)) {
              return `assets/css/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          }
        }
      },
      
      // Production optimizations
      minify: mode === 'production' ? 'terser' : false,
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        },
        mangle: {
          safari10: true
        }
      } : undefined,
      
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Report compressed size
      reportCompressedSize: true,
      
      // Target modern browsers for smaller bundles
      target: 'es2020'
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'axios'
      ]
    },
    
    // Preview server configuration
    preview: {
      port: 4173,
      host: true
    }
  }
})