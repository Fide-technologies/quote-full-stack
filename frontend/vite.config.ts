import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  server: {
    port: Number(process.env.PORT || 5173),
    strictPort: true,
    host: true,
    hmr: {
      host: "localhost",
      protocol: "ws",
    },
    proxy: {
      "^/api": {
        target: `http://localhost:${process.env.BACKEND_PORT || 3000}`,
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: true,
  },
  plugins: [
    react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'shopify-polaris': ['@shopify/polaris', '@shopify/polaris-icons'],
          'shopify-utils': ['@shopify/app-bridge-react', '@shopify/app-bridge-utils', '@tanstack/react-query'],
        },
      },
    },
  },
})
