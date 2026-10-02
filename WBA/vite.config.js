import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const { NGROK_HOST } = loadEnv(mode, process.cwd(), 'NGROK_');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      allowedHosts: NGROK_HOST ? [NGROK_HOST] : [],
      proxy: { '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true } },
    },
  };
});
