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
        // Follow 307 redirects server-side so ngrok clients never see localhost URLs
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, _req, _res) => {
            if (proxyRes.statusCode === 307 && proxyRes.headers.location) {
              const loc = proxyRes.headers.location;
              // Rewrite location to be relative (strip http://localhost:8000)
              const relative = loc.replace(/^https?:\/\/[^/]+/, '');
              proxyRes.headers.location = relative;
            }
          });
        },
      },
    },
  },
});
