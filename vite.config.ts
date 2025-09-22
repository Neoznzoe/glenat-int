import fs from 'fs';
import path from 'path';
import react from '@vitejs/plugin-react';
import type { ServerOptions as HttpsServerOptions } from 'https';
import { defineConfig } from 'vite';

const resolveHttpsConfig = (): HttpsServerOptions | undefined => {
  const useHttps = process.env.VITE_DEV_HTTPS === 'true';

  if (!useHttps) {
    return undefined;
  }

  const keyPath = process.env.VITE_DEV_HTTPS_KEY;
  const certPath = process.env.VITE_DEV_HTTPS_CERT;

  if (keyPath && certPath) {
    try {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      } satisfies HttpsServerOptions;
    } catch (error) {
      console.warn(
        '[vite] Impossible de charger le certificat ou la clef privée fournis via VITE_DEV_HTTPS_KEY / VITE_DEV_HTTPS_CERT.',
        error,
      );
    }
  }

  return {} as HttpsServerOptions;
};

export default defineConfig(() => {
  const httpsConfig = resolveHttpsConfig();

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      https: httpsConfig,
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
  };
});
