import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../', import.meta.url));
export default defineConfig({
  root, base: '/menu-review/',
  publicDir: fileURLToPath(new URL('../../public', import.meta.url)),
  cacheDir: fileURLToPath(new URL('./.vite-cache', import.meta.url)),
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { host: '127.0.0.1', port: 5201, strictPort: true, hmr: false, watch: { ignored: ['**/*'] }, fs: { allow: [repo] } },
  build: { outDir: fileURLToPath(new URL('./dist', import.meta.url)), copyPublicDir: false, emptyOutDir: true },
  plugins: [{
    name: 'isolated-menu-atlas-public-only', apply: 'build',
    async generateBundle() {
      const { readdir, readFile } = await import('node:fs/promises');
      const { createHash } = await import('node:crypto');
      const directory = new URL('../../public/ui/blender/', import.meta.url);
      const inputs = {};
      const normalizedRepo = repo.replaceAll('\\', '/');
      for (const id of this.getModuleIds()) {
        const path = id.split('?')[0].replaceAll('\\', '/');
        if (!path.startsWith(normalizedRepo) || path.includes('/node_modules/')) continue;
        inputs[path.slice(normalizedRepo.length)] = createHash('sha256').update(await readFile(path)).digest('hex');
      }
      for (const name of await readdir(directory)) {
        if (!/\.(json|png)$/.test(name)) continue;
        const source = await readFile(new URL(name, directory));
        inputs['public/ui/blender/' + name] = createHash('sha256').update(source).digest('hex');
        this.emitFile({type:'asset', fileName:'ui/blender/' + name, source});
      }
      this.emitFile({type:'asset', fileName:'source-inputs.json', source:JSON.stringify(inputs,null,2)+'\n'});
    },
  }],
});
