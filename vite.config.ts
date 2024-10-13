import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vercel from 'vite-plugin-vercel';

export default defineConfig({
  plugins: [react(), vercel()],
  server: {
    proxy: {
      '/pinata': {
        target: 'https://gateway.pinata.cloud', // Pinata Gateway URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pinata/, ''),
      },
    },
  },
});
