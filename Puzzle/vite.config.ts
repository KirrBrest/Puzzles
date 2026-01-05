import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true' 
    ? '/kirrbrest-JSFE2025Q3/Puzzle/' 
    : '/',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  css: {
    devSourcemap: true,
  },
});

