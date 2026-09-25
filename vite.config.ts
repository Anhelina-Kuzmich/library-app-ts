import { defineConfig } from 'vite';

export default defineConfig({
  base: '/library-app-ts/',
  server: {
    host: 'localhost',
    port: 2222,
    open: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
//ghghgh
