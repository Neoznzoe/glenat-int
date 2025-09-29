// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    proxy: {
      // proxy DEV pour l’API Intranet
      '/intranet': {
        target: 'https://api-recette.groupe-glenat.com',
        changeOrigin: true,
        secure: false,
        rewrite: p => p.replace(/^\/intranet/, '/Api/v1.0/Intranet'),
      },
      // proxy DEV pour l’API Extranet (couvertures)
      '/extranet': {
        target: 'https://api-recette.groupe-glenat.com',
        changeOrigin: true,
        secure: false,
        rewrite: p => p.replace(/^\/extranet/, '/Api/v1.0/Extranet'),
      },
    },
  },
  optimizeDeps: { exclude: ['lucide-react'] },
  css: { transformer: 'postcss' },
  build: {
    outDir: '.',
    assetsDir: 'public/assets',
    emptyOutDir: false,
    rollupOptions: { output: {} },
  },
})
