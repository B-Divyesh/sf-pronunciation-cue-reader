import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: 'site',
  publicDir: '../public',
  build: {
    outDir: '../dist/site',
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: {
      input: {
        index: resolve('site/index.html'),
        demo: resolve('site/demo/index.html'),
        privacy: resolve('site/privacy/index.html'),
        terms: resolve('site/terms/index.html'),
        notFound: resolve('site/404.html')
      }
    }
  }
});
