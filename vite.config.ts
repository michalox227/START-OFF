import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' pozwala serwować build z dowolnej podścieżki (GitHub Pages, Netlify, itp.).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
