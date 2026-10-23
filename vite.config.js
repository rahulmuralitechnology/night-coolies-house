import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Keep in sync with public/_redirects, which does the same on Netlify
const siteProxy = (prefix, target) => ({
  target,
  changeOrigin: true,
  rewrite: (path) => path.replace(prefix, ''),
});

const proxy = {
  '/api/nobroker': {
    target: 'https://www.nobroker.in',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/nobroker/, '/api'),
  },
  '/api/magicbricks': siteProxy(/^\/api\/magicbricks/, 'https://www.magicbricks.com'),
  '/api/squareyards': siteProxy(/^\/api\/squareyards/, 'https://www.squareyards.com'),
  '/api/stanza': siteProxy(/^\/api\/stanza/, 'https://www.stanzaliving.com'),
};

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
});
