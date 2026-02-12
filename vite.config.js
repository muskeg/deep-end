import { defineConfig } from 'vite';

export default defineConfig({
  base: '/deep-end/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    // Inline small sprite images (< 8KB) as data URLs to reduce HTTP requests
    assetsInlineLimit: 8192,
    rollupOptions: {
      output: {
        // Group sprite assets together for better caching
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && /\.(png|jpe?g|gif|svg|webp)$/i.test(assetInfo.name)) {
            return 'assets/sprites/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
});
