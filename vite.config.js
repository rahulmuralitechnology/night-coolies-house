import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const proxy = {
  '/api/nobroker': {
    target: 'https://www.nobroker.in',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/nobroker/, '/api'),
  },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
});
