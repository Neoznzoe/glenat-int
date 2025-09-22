import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    https: {},
    proxy: {
      // Proxy de dev pour contourner CORS sur l'API Extranet
      '/extranet': {
        target: 'https://api-recette.groupe-glenat.com',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/extranet/, '/Api/v1.0/Extranet'),
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  css: {
    transformer: 'postcss',
  },
});
