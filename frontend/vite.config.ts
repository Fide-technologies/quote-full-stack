import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: Number(process.env.PORT || 5173),
    strictPort: true,
    host: true,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
    proxy: {
      '^/api': {
        target: `http://localhost:${process.env.BACKEND_PORT || 3000}`,
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: true,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@shopify/polaris')) {
              return 'shopify-polaris';
            }
            if (id.includes('@shopify/app-bridge')) {
              return 'shopify-app-bridge';
            }
            // Group all other vendors together to avoid circular dependencies
            return 'vendor';
          }
        },
      },
    },
  },
});
