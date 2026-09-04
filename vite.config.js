import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    target: 'es2020',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000,
    cssCodeSplit: false,
    reportCompressedSize: false,
    // Everything must end up in ONE chunk so vite-plugin-singlefile can inline
    // it. Without this, each dynamically-imported system becomes its own chunk
    // and the "single file" ships without them.
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
  server: { host: true, port: 5178 },
});
