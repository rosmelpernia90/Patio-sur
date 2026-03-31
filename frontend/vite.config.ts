import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['.ngrok-free.dev', '.ngrok.io'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // When accessed via ngrok domain, rewrite target to match
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // If request came through ngrok, try to use the ngrok-exposed backend
            if (req.headers.host?.includes('ngrok')) {
              // This is a workaround: modify the header to tell the proxy to use the ngrok backend URL
              // However, the best solution is to set up a separate ngrok tunnel for the backend
              // For now, we rely on the proxy accepting requests from localhost
            }
          });
        },
      },
    },
  },
});
