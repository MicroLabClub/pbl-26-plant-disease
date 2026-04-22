import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Required by @react-pdf/renderer in browser builds
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  server: {
    port: 5173,
    // Uncomment below to proxy API calls to your backend during development
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //   },
    // },
  },
})
