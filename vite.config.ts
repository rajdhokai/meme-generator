import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
