import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../', import.meta.url));
export default defineConfig({
  root,
  base: './',
  publicDir: fileURLToPath(new URL('../../public', import.meta.url)),
  cacheDir: fileURLToPath(new URL('./.vite-cache', import.meta.url)),
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { host: '127.0.0.1', port: 5196, strictPort: true, hmr: false, watch: { ignored: ['**/*'] }, fs: { allow: [repo] } },
  build: { outDir: fileURLToPath(new URL('./dist', import.meta.url)), copyPublicDir: false, emptyOutDir: true },
  plugins: [{
    name: 'isolated-ui-atlas-public-only',
    apply: 'build',
    async generateBundle() {
      const { readdir, readFile } = await import('node:fs/promises');
      const atlasDir = new URL('../../public/ui/blender/', import.meta.url);
      for (const name of await readdir(atlasDir)) {
        if (!/\.(json|png)$/.test(name)) continue;
        this.emitFile({ type: 'asset', fileName: `ui/blender/${name}`, source: await readFile(new URL(name, atlasDir)) });
      }
    },
  }],
});
